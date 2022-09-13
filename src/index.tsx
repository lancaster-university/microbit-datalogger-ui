import "core-js/es/array";
import "react-app-polyfill/ie11";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DataLog from "./DataLog";
import { gpsData } from "./sample-data";

interface OfflineDataLog {
  download(): void;
  copy(): void;
  update(): void;
  clear(): void;
  load(): any;

  csv: string; // todo
}

//@ts-ignore
const offlineDataLog: OfflineDataLog = window.dl;

///// Bootstrap

function load() {

  let log: DataLog = gpsData; // todo

  // Check if we're loading in-place. This is done when being inserted on top of
  // the offline datalogger
  if (offlineDataLog) {
    let offlineRoot = document.querySelector("#w");

    if (offlineRoot instanceof HTMLElement) {
      offlineRoot.style.display = "none";
    }

    let baseLoad = offlineDataLog.load; // todo Object.getOwnPropertyDescriptor(offlineDataLog, "load").get;

    baseLoad();

    const reactRoot = document.createElement("div");
    reactRoot.id = "root";

    document.body.appendChild(reactRoot);

    //@ts-ignore
    log = DataLog.fromCSV(window.csv);
  }

  //window.csv = window.x; //x = csv data
  //window.dataLog = readData(window.csv); 

  // Load react in place!

  const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

  root.render(
    <React.StrictMode>
      <App log={log} />
    </React.StrictMode>
  );
}

if (offlineDataLog) {
  //@ts-ignore
  window.dl.load = load();
} else {
  load();
}

/* Object.defineProperty(dl, "load", {
  get: load
}); */ // todo

/// End bootstrap