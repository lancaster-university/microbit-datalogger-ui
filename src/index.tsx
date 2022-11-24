import "core-js/es/array";
import "react-app-polyfill/ie11";
import ReactDOM from 'react-dom/client';
import DataLog from "./DataLog";
import LogDataProvider from "./LogDataProvider";

import "./index.css";
import ErrorHandler from "./ErrorHandler";
import { IconContext } from "react-icons";

interface OfflineDataLog {
  download(): void;
  copy(): void;
  update(): void;
  clear(): void;
  load(): any;

  raw: string; // the raw log data
  upd: number; // interval ID for iframe update checker approach
}

export interface LogData {
  log: DataLog;
  hash: number;
  dataSize: number;
  bytesRemaining: number;
  daplinkVersion: number;
  standalone: boolean;
}

export function parseRawData(raw: string): LogData | null {
  if (!/^UBIT_LOG_FS_V_002/.test(raw)) {
    return null;
  }

  const daplinkVersion = parseInt(raw.substring(40, 44));
  const dataStart = parseInt(raw.substring(29, 39)) - 2048; // hex encoded
  const logEnd = parseInt(raw.substring(18, 28)) - 2048; // hex encoded

  let dataSize = 0;
  while (raw.charCodeAt(dataStart + dataSize) !== 0xfffd) {
    dataSize++;
  }

  const bytesRemaining = logEnd - dataStart - dataSize;

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = 31 * hash + raw.charCodeAt(i);
    hash |= 0;
  }

  const full = raw.substring(logEnd + 1, logEnd + 4) === "FUL";
  const log = DataLog.fromCSV(raw.substring(dataStart, dataStart + dataSize), full);

  return { log, hash, dataSize, bytesRemaining, daplinkVersion, standalone: false };
}

/**
 * This is where the app begins! We're either:
 * 
 * a) standalone - acts more like a traditional React app, loaded from the generated
 * index.html. We need to prompt the user to select a .csv data as there is no data
 * embedded within the page.
 * 
 * b) inside MY_FILES.HTM - we need to do some logic to remove some of the unneeded
 * offline HTML data, and then load React on top. We need to load the CSV data from
 * the offline data using dl.load(). This will also provide us with some metadata,
 * such as DAPLink version and the amount of space available in the log.
 */
(function () {

  // Check if we're just an iframe, used to check for updates to the file on the disk.
  // Update checker iframes have the hash of the main page appended to it
  if (window.location.href.split("?")[1] !== undefined) {
    return; // we don't want to bother loading up react or anything!
  }

  //@ts-ignore
  const offlineDataLog: OfflineDataLog = window.dl;

  // Are we embedded inside MY_FILES.HTM? If so, there should be a dl.load method.
  let baseLoad = offlineDataLog && offlineDataLog.load;

  function load() {
    let data: LogData | null = null;

    // Check if we're loading in-place. This is done when being inserted on top of
    // the offline datalogger
    if (offlineDataLog) {
      let offlineRoot = document.querySelector("#w");

      if (offlineRoot instanceof HTMLElement) {
        // don't immediately remove it, as we will fall back to it if we fail to load
        // for some reason. But we also don't want it visible as it'll cause visual
        // flicker when swapping between elements
        offlineRoot.style.visibility = "collapse";
      }

      // The base load method (embedded within CODAL) will store the raw log data in dl.raw.
      // We don't make direct assumptions about where this data is stored initially hence
      // why we still call the base load method and don't just do it ourselves
      baseLoad();

      const logData = parseRawData(offlineDataLog.raw);

      if (!logData) { // failed to parse log data
        // TODO: error handle
        if (offlineRoot instanceof HTMLElement) {
          console.log("Failed to parse log data and load online log, falling back to offline view...");
          offlineRoot.style.visibility = "visible";
        }
        return;
      }

      data = logData;

      // override this from the offline view so we give a user a prompt if they want to
      // reload rather than immediately reloading
      onmessage = e => {
        window.dispatchEvent(new CustomEvent("dl-update", { detail: e.data }));
      };

      const reactRoot = document.createElement("div");
      reactRoot.id = "root";

      document.body.appendChild(reactRoot);

      // keep it around to allow the iframe update checker to still work (since it embeds itself in #w)
      if (offlineRoot instanceof HTMLElement) {
        offlineRoot.innerHTML = "";
      }
    }
    // ..else, we're standalone and so we don't have any embedded data. Since we pass 'null' data
    // through to LogDataProvider, it'll show a modal asking for user supplied data instead.

    // Load react in place!

    const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

    root.render(
      //<React.StrictMode>
      <IconContext.Provider value={{ className: "icon" }}>
        <ErrorHandler>
          <LogDataProvider log={data} />
        </ErrorHandler>
      </IconContext.Provider>
      //</React.StrictMode>
    );
  }

  if (offlineDataLog) {
    //Swap out window.dl.load() with our own load method, as it hasn't been called yet.

    //@ts-ignore
    window.dl.load = load;
  } else {
    // We're standalone, so we can just load immediately.
    load();
  }
})();