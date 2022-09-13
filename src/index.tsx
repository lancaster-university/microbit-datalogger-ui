import "core-js/es/array";
import "react-app-polyfill/ie11";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DataLog from "./DataLog";

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
let baseLoad = offlineDataLog.load; // todo Object.getOwnPropertyDescriptor(offlineDataLog, "load").get;

function load() {
  let offlineRoot = document.querySelector("#w");

  if (offlineRoot instanceof HTMLElement) {
    offlineRoot.style.display = "none";
  }

  baseLoad();

  const reactRoot = document.createElement("div");
  reactRoot.id = "root";

  document.body.appendChild(reactRoot);

  //@ts-ignore
  const log = DataLog.fromCSV(window.csv);

  //window.csv = window.x; //x = csv data
  //window.dataLog = readData(window.csv); 

  // Load react in place!

  const root = ReactDOM.createRoot(reactRoot);

  root.render(
    <React.StrictMode>
      <App log={log} />
    </React.StrictMode>
  );
}

//@ts-ignore
window.dl.load = load();

/* Object.defineProperty(dl, "load", {
  get: load
}); */ // todo

/// End bootstrap