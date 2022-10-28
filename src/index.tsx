import "core-js/es/array";
import "react-app-polyfill/ie11";
import ReactDOM from 'react-dom/client';
import DataLog from "./DataLog";
import { gpsData } from "./sample-data";
import LogDataProvider from "./LogDataProvider";

import "./index.css";

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

  return { log, hash, dataSize, bytesRemaining, daplinkVersion };
}

(function () {

  // Check if we're just an iframe, used to check for updates to the file on the disk.
  // Update checker iframes have the hash of the main page appended to it
  if (window.location.href.split("?")[1] !== undefined) {
    return; // we don't want to bother loading up react or anything!
  }

  //@ts-ignore
  const offlineDataLog: OfflineDataLog = window.dl;

  ///// Bootstrap

  let baseLoad = offlineDataLog && offlineDataLog.load; // todo Object.getOwnPropertyDescriptor(offlineDataLog, "load").get;

  function load() {

    // dummy default data for testing
    let data: LogData | null = {
      log: gpsData,
      hash: 0,
      dataSize: 100,
      bytesRemaining: 100,
      daplinkVersion: 0
    };
    data = null;

    // Check if we're loading in-place. This is done when being inserted on top of
    // the offline datalogger
    if (offlineDataLog) {
      let offlineRoot = document.querySelector("#w");

      if (offlineRoot instanceof HTMLElement) {
        offlineRoot.style.visibility = "collapse";
      }

      baseLoad();

      const logData = parseRawData(offlineDataLog.raw);

      if (!logData) {
        // TODO: error handle
        if (offlineRoot instanceof HTMLElement) {
          console.log("Failed to parse log data and load online log, falling back to offline view...");
          offlineRoot.style.visibility = "visible";
        }
        return;
      }

      data = logData;

      // override this so we give a user a prompt if they want to reload rather than
      // immediately reloading
      onmessage = e => {
        window.dispatchEvent(new CustomEvent("dl-update", {detail: e.data}));
      };

      const reactRoot = document.createElement("div");
      reactRoot.id = "root";

      document.body.appendChild(reactRoot);

      // keep it around to allow the iframe update checker to still work
      if (offlineRoot instanceof HTMLElement) {
        offlineRoot.innerHTML = "";
      }
    }

    // Load react in place!

    const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

    root.render(
      //<React.StrictMode>
      <LogDataProvider log={data} />
      //</React.StrictMode>
    );
  }

  if (offlineDataLog) {
    //@ts-ignore
    window.dl.load = load;
  } else {
    load();
  }

  /* Object.defineProperty(dl, "load", {
    get: load
  }); */ // todo

  /// End bootstrap
})();