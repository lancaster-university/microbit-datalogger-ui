import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './Header';
import DataLogTable from './DataLogTable';
import { Config } from 'plotly.js';
import LineGraphVisualisation from './LineGraphVisualisation';
import MapVisualisation from './MapVisualisation';
import DropDownButton from './DropDownButton';
import Modal, { ModalContents, ModalProps } from './Modal';
import DataLog from './DataLog';
import { RiCheckLine, RiClipboardLine, RiCloseLine, RiDeleteBin2Line, RiDownload2Line, RiRefreshLine, RiShareLine } from "react-icons/ri";
import Warning from './Warning';
import { LogData, parseRawData } from '.';
import DataUpdateNotification from './DataUpdateNotification';
import IconButton from './IconButton';
import TallyVisualisation from './TallyVisualisation';

/**
 * Visualisations are the context-specific ways of presenting data in the data log.
 * For example, a map view for displaying geographic content or a line graph for most
 * general purpose use cases
 */
export interface VisualisationType {
  name: string;
  description: string;
  tooltipImage?: JSX.Element;
  icon: JSX.Element;
  availablityError: (log: DataLog) => string | null;
  generate: (props: VisualisationProps) => JSX.Element;
}

export interface VisualisationProps {
  log: DataLog;
}

// standard plotly config
export const visualisationConfig: Partial<Config> = { displaylogo: false, responsive: true, toImageButtonOptions: { filename: "MY_DATA" }, modeBarButtonsToRemove: ["select2d", "lasso2d", "autoScale2d"] };

const visualisations: VisualisationType[] = [
  LineGraphVisualisation, MapVisualisation, TallyVisualisation // add new visualisation configs here
];

/**
 * Share targets are ways of exporting the data from the data log, aside from the manual 'copy' option
 */
interface ShareTarget {
  name: string;
  icon: JSX.Element;
  onShare: (log: DataLog) => any;
}

const shareTargets: ShareTarget[] = [ // add new share targets here
  {
    name: "Download",
    icon: <RiDownload2Line />,
    onShare(log) { // downloads directly from the browser
      const anchor = document.createElement("a");

      anchor.download = "microbit.csv";
      anchor.href = URL.createObjectURL(log.toBlob());
      anchor.click();
      anchor.remove();
    }
  },
  {
    name: "Share",
    icon: <RiShareLine />,
    onShare(log) { // opens an OS/browser-level share dialog, allowing direct export to supported applications
      const file = new File([log.toBlob()], "microbit.csv", { type: "text/csv" });

      navigator.share({
        title: "My micro:bit data",
        files: [file]
      });
    }
  }
];

/**
 * Root component for the data log
 */
export default function App(props: LogData) {

  // the active visualisation, e.g. line graph or map view
  const [visualisation, setVisualisation] = useState<VisualisationType | null>(null);
  const [modal, setModal] = useState<ModalProps | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<{ data: LogData | null, updateId: number }>({ data: null, updateId: 0 });
  const [logData, setLogData] = useState<LogData>(props);

  const log = logData.log;

  useEffect(() => {
    const updateListener = (e: Event) => {
      if (e instanceof CustomEvent) {
        const data = parseRawData(e.detail);

        // if we choose to update our data to the latest from disk, since the offline js
        // isn't aware of this it'll continuously inform us of updates to the original
        // data. so we just manually filter that out here.
        if (!!data && data.hash !== logData.hash && (!updateAvailable.data || data.hash !== updateAvailable.data.hash)) {
          setUpdateAvailable({ data, updateId: updateAvailable.updateId + 1 });
        }
      }
    }

    window.addEventListener("dl-update", updateListener);

    return () => {
      window.removeEventListener("dl-update", updateListener);
    }
  });

  const showModal = (content: ModalContents) => {
    setModal({ ...content, onClose: () => setModal(null) });
  }

  // the available visual previews for our data log. e.g. map view is not applicable when there
  // is no latitude or longitude fields detected.
  // todo: visually present the reasons why certain visualisations aren't available
  const visualPreviews = visualisations.filter(vis => !vis.availablityError(log));

  const copy = () => {
    navigator.clipboard.writeText(log.toCSV());

    return <RiCheckLine />;
  }

  const updateData = () => {
    if (updateAvailable.data) {
      setLogData(updateAvailable.data);
      setUpdateAvailable({ ...updateAvailable, data: null });

      return <RiCheckLine />;
    }

    showModal({ title: "No changes detected", content: <div>To see the latest data that changed after you opened this file, you must unplug your micro:bit and plug it back in.</div> });
  }

  const clearLog = () => {
    showModal({ title: "Clearing the data log", content: <div>The log is cleared when you reflash your micro:bit. Your program can include code or blocks to clear the log when you choose. <a href="https://microbit.org/get-started/user-guide/data-logging/" target="_blank" rel="noreferrer">Learn more about data logging</a>.</div> });
  }

  const visualise = (visIndex: number) => {
    if (visIndex === -1) { // clicked the main section of the button
      if (visualisation) {
        setVisualisation(null);
        return;
      }

      visIndex = 0; // load the first visualisation
    }


    setVisualisation(visualPreviews[visIndex]);
  }

  const handleShare = (index: number = 0) => {
    shareTargets[index].onShare(log);
  };

  return (
    <div className="app">
      {modal && <Modal {...modal} />}
      <Header />
      <DataUpdateNotification updateNum={updateAvailable.updateId} />
      <main>
        <h1>micro:bit data log</h1>
        <section className="buttons">
          {/* Share targets */}
          <DropDownButton primary={true} dropdown={shareTargets.map(target => ({ element: <>{target.icon}{target.name}</> }))} onClick={handleShare} onDropdownSelected={handleShare}><>{shareTargets[0].icon}{shareTargets[0].name}</></DropDownButton>
          <IconButton onClick={copy} icon={<RiClipboardLine />} caption="Copy" />
          {!props.standalone && <IconButton onClick={updateData} icon={<RiRefreshLine />} caption="Update data" />}
          {!props.standalone && <IconButton onClick={clearLog} icon={<RiDeleteBin2Line />} caption="Clear log" />}

          {/* Available visualisations */}
          {visualPreviews.length > 0 &&
            <DropDownButton dropdown={visualPreviews.map(vis => ({ element: <>{vis.icon}{vis.name}</>, tooltip: { title: vis.name, description: vis.description, image: vis.tooltipImage } }))}
              onClick={() => visualise(-1)}
              onDropdownSelected={index => visualise(index)}>{visualisation ? <><RiCloseLine /> Close {visualisation.name}</> : <>{visualPreviews[0].icon}{visualPreviews[0].name}</>}
            </DropDownButton>
          }
        </section>
        
        <p id="info">
          This is the data on your micro:bit. To analyse it and create your own graphs, transfer it to your computer. You can copy and paste your data, or download it as a CSV file which you can import into a spreadsheet or graphing tool. <a href="https://microbit.org/get-started/user-guide/data-logging/" target="_blank" rel="noreferrer">Learn more about micro:bit data logging</a>.
        </p>

        <section id="data">
          <DataLogTable log={log} highlightDiscontinuousTimes={visualisation === LineGraphVisualisation} />
          <aside>
            {log.isFull &&
              <Warning title="Log is full">
                You won't be able to log any more data until the log is cleared. <a href="https://support.microbit.org/support/solutions/articles/19000127516-what-to-do-when-the-data-log-is-full" target="_blank" rel="noreferrer">Learn more</a>.
              </Warning>
            }
            {log.isEmpty &&
              <Warning title="Log is empty">
                You haven't logged any data yet. Click the link above to learn more about how to log data on the micro:bit.
              </Warning>
            }
            {visualisation && <section id="visualisation">{visualisation.generate({ log })}</section>}
          </aside>
        </section>
      </main>
    </div>
  );
}