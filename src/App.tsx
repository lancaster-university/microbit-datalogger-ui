import { useEffect, useRef, useState } from 'react';
import './App.css';
import DataLogTable from './DataLogTable';
import { Config, Layout } from 'plotly.js';
import LineGraphVisualisation from './LineGraphVisualisation';
import MapVisualisation from './MapVisualisation';
import DropDownButton from './DropDownButton';
import Modal, { ModalContents, ModalProps } from './Modal';
import DataLog from './DataLog';
import { RiCheckLine, RiClipboardLine, RiDeleteBin2Line, RiDownload2Line, RiQuestionLine, RiRefreshLine, RiShareLine } from "react-icons/ri";
import Warning from './Warning';
import { LogData, parseRawData } from '.';
import DataUpdateNotification from './DataUpdateNotification';
import IconButton from './IconButton';
import TallyVisualisation from './TallyVisualisation';
import MultiToggleButton from './MultiToggleButton';

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
export const visualisationConfig: Partial<Config> = {
  displaylogo: false,
  responsive: true,
  toImageButtonOptions: {
    filename: "MY_DATA"
  },
  modeBarButtonsToRemove: ["select2d", "lasso2d", "autoScale2d"],
  setBackground: () => "transparent"
};

export const layoutConfig: Partial<Layout> = {
  font: {
    family: "Helvetica Now, Helvetica, Arial, sans-serif",
    size: 14,
    color: "#333"
  },
  margin: { l: 0, r: 0, t: 0, b: 0 }
};

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
  const [updateAvailable, setUpdateAvailable] = useState<LogData | null>(null);
  const [logData, setLogData] = useState<LogData>(props);
  const [updateNotificationVisible, setUpdateNotificationVisible] = useState(false);

  const logStateRef = useRef<LogData>();

  logStateRef.current = logData;

  const log = logData.log;

  useEffect(() => {
    const updateListener = (e: Event) => {
      if (e instanceof CustomEvent) {
        const data = parseRawData(e.detail);

        // if we choose to update our data to the latest from disk, since the offline js
        // isn't aware of this it'll continuously inform us of updates to the original
        // data. so we just manually filter that out here.
        if (!!data && data.hash !== logData.hash && (!updateAvailable || data.hash !== updateAvailable.hash)) {
          setUpdateAvailable(data);
        }
      }
    }

    window.addEventListener("dl-update", updateListener);

    return () => {
      window.removeEventListener("dl-update", updateListener);
    }
  });

  useEffect(() => {
    setUpdateNotificationVisible(!!updateAvailable);
  }, [updateAvailable]);

  const showModal = (content: ModalContents) => {
    setModal({ ...content, onClose: () => setModal(null) });
  };

  // the available visual previews for our data log. e.g. map view is not applicable when there
  // is no latitude or longitude fields detected.
  // todo: visually present the reasons why certain visualisations aren't available
  const visualPreviews = visualisations.filter(vis => !vis.availablityError(log));

  const copy = () => {
    navigator.clipboard.writeText(log.toCSV());

    return <RiCheckLine />;
  };

  const updateData = () => {
    if (updateAvailable) {
      setLogData(updateAvailable);
      setUpdateAvailable(null);

      return <RiCheckLine />;
    }

    showModal({ title: "No changes detected", content: <div>To see the latest data that changed after you opened this file, you must unplug your micro:bit and plug it back in.</div> });
  };

  const clearLog = () => {
    showModal({ title: "Clearing the data log", content: <div>The log is cleared when you reflash your micro:bit. Your program can include code or blocks to clear the log when you choose. <a href="https://microbit.org/get-started/user-guide/data-logging/" target="_blank" rel="noreferrer">Learn more about data logging</a>.</div> });
  };

  const visualise = (visIndex: number) => {
    if (visIndex === -1) { // clicked the main section of the button
      if (visualisation) {
        setVisualisation(null);
        return;
      }

      visIndex = 0; // load the first visualisation
    }


    setVisualisation(visualPreviews[visIndex]);
  };

  const handleShare = (index: number = 0) => {
    shareTargets[index].onShare(log);
  };

  // todo experimental
  const appendLogLine = (line: string) => {
    console.log(line);
    // temporary hack
    setLogData({ ...logStateRef.current!, log: DataLog.fromCSV(logStateRef.current!.log.toCSV() + "\n" + line) });
  };

  const serialTest = () => {
    window.navigator.serial.requestPort().then(async (port) => {
      await port.open({ baudRate: 115200 });
      const reader = port.readable?.getReader();

      if (!reader) {
        console.error("Null reader");
        return;
      }

      let lastLine: string | null = null;

      let intervalId = setInterval(async () => {
        const { value, done } = await reader.read();

        if (done) {
          cancel();
          return;
        }

        const str = new TextDecoder().decode(value);

        for (const char of str) {
          if (lastLine == null) {
            if (char === "\n") {
              lastLine = "";
            }

            break;
          }

          if (char === "\n") {
            appendLogLine(lastLine);
            lastLine = "";
          } else {
            lastLine += char;
          }
        }
      }, 50);

      const cancel = () => clearInterval(intervalId);
    });
  };

  const help = () => {
    window.open("https://microbit.org/get-started/user-guide/data-logging/", "_blank");
  };

  return (
    <div className="app">
      {modal && <Modal {...modal} />}

      <DataUpdateNotification visible={updateNotificationVisible} onClose={() => setUpdateNotificationVisible(false)} />
      <header>
        <a className="ubit-logo" href="https://microbit.org" target="_blank" rel="noreferrer">
          <svg role="img" aria-labelledby="microbit-logo" viewBox="0 0 166.8 28.7" width="167" height="40"><title id="microbit-logo">micro:bit logo</title><path fill="#fff" d="M71.7 23.1h-3.3V14c0-2-1.2-3.5-2.8-3.5-1.6 0-2.8 1.4-2.8 3.5v9.1h-3.3V14c0-2.3-1.4-3.5-2.8-3.5-1.6 0-2.8 1.4-2.8 3.5v9.1h-3.3v-9c0-4.1 2.5-6.9 6.1-6.9 1.7 0 3.1.7 4.4 2.1 1.2-1.4 2.7-2.1 4.5-2.1 3.6 0 6 2.9 6 6.9v9zM77.7 23.1h-3.3V7.6h3.3v15.5zM76 5.3c-1.2 0-2.1-.9-2.1-2.1 0-1.2.9-2.1 2.1-2.1 1.2 0 2.1.9 2.1 2.1.1 1.2-.9 2.1-2.1 2.1zM88.1 23.5c-2.1 0-4.2-.9-5.7-2.4s-2.3-3.5-2.3-5.8c0-2.2.8-4.3 2.3-5.8C84 8.1 86 7.2 88.1 7.2c2.3 0 4.3.8 5.8 2.3l.4.4-2.3 2.4-.4-.4c-1.1-1-2.2-1.5-3.4-1.5-2.6 0-4.8 2.2-4.8 4.9s2.1 4.9 4.8 4.9c1.2 0 2.3-.5 3.4-1.4l.4-.4 2.4 2.3-.5.4c-1.8 1.6-3.7 2.4-5.8 2.4zM100.1 23.1h-3.5v-7.8c0-5 2.2-7.4 7-7.8l.7-.1v3.3l-.5.1c-2.6.3-3.6 1.5-3.6 4.3v8zM113.4 23.5c-2.1 0-4.2-.9-5.7-2.4s-2.3-3.6-2.3-5.8c0-2.2.8-4.2 2.3-5.8 1.5-1.6 3.5-2.4 5.7-2.4 2.1 0 4.1.9 5.6 2.4s2.3 3.6 2.3 5.8c0 2.2-.8 4.3-2.3 5.8-1.5 1.6-3.5 2.4-5.6 2.4zm-.1-13c-2.5 0-4.6 2.2-4.6 4.9s2.1 4.9 4.6 4.9c2.6 0 4.6-2.1 4.6-4.9.1-2.8-2-4.9-4.6-4.9zM126.8 23.1c-1.2 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.3 0 2.3 1 2.3 2.3-.1 1.3-1.1 2.3-2.3 2.3zM126.8 11.7c-1.2 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.3 0 2.3 1 2.3 2.3-.1 1.3-1.1 2.3-2.3 2.3zM140.2 23.5c-4.7 0-8-3.7-8-8.9V.2h3.3v8.5c1.4-1 3-1.5 4.7-1.5 2.1 0 4.1.8 5.6 2.4 1.5 1.5 2.3 3.6 2.3 5.8 0 2.2-.8 4.3-2.3 5.8-1.5 1.5-3.5 2.3-5.6 2.3zm0-13c-2.6 0-4.8 2.2-4.8 4.9s2.1 4.9 4.8 4.9c2.6 0 4.8-2.2 4.8-4.9-.1-2.7-2.2-4.9-4.8-4.9zM154.3 23.1H151V7.6h3.3v15.5zm-1.7-17.8c-1.2 0-2.1-.9-2.1-2.1 0-1.2.9-2.1 2.1-2.1 1.2 0 2.1.9 2.1 2.1.1 1.2-.9 2.1-2.1 2.1zM166.6 23.6l-.7-.1c-4.9-.9-6.7-3.3-6.7-8.6V11h-1.4V7.8h1.4V4.3h3.3v3.4h4.1v3.2h-4.1v4.4c0 2.9 1.1 4.4 3.6 4.7l.5.1v3.5z"></path><g fill="#fff"><path d="M32.5 18c1.5 0 2.6-1.2 2.6-2.6s-1.2-2.6-2.6-2.6c-1.5 0-2.6 1.2-2.6 2.6s1.2 2.6 2.6 2.6M13.3 12.8c-1.5 0-2.6 1.2-2.6 2.6s1.2 2.6 2.6 2.6c1.4 0 2.6-1.2 2.6-2.6s-1.2-2.6-2.6-2.6"></path><path d="M13.3 7.6c-4.3 0-7.8 3.5-7.8 7.8s3.5 7.8 7.8 7.8h19.5c4.3 0 7.8-3.5 7.8-7.8s-3.5-7.8-7.8-7.8H13.3m19.5 20.8H13.3c-7.2 0-13-5.8-13-13s5.8-13 13-13h19.5c7.2 0 13 5.8 13 13s-5.9 13-13 13"></path></g></svg>
        </a>
        <h1>micro:bit data log</h1>
        <h3>This is the data on your micro:bit. To analyse it and create your own graphs, transfer it to your computer. You can copy and paste your data, or download it as a CSV file which you can import into a spreadsheet or graphing tool.</h3>
        <section className="buttons">
          {/* Share targets */}
          <DropDownButton primary={true} dropdown={shareTargets.map(target => ({ element: <>{target.icon}{target.name}</> }))} onClick={handleShare} onDropdownSelected={handleShare}><>{shareTargets[0].icon}{shareTargets[0].name}</></DropDownButton>
          <IconButton onClick={copy} icon={<RiClipboardLine />} caption="Copy" />
          {!props.standalone && <IconButton onClick={updateData} icon={<RiRefreshLine />} caption="Update data" />}
          {!props.standalone && <IconButton onClick={clearLog} icon={<RiDeleteBin2Line />} caption="Clear log" />}
          {window.localStorage.getItem("debug") && <IconButton onClick={serialTest} icon={<RiDeleteBin2Line />} caption="Serial test" />}
          <IconButton onClick={help} icon={<RiQuestionLine />} caption="Help"></IconButton>

          {/* Available visualisations */}
          {visualPreviews.length > 0 &&
            <MultiToggleButton style={{ flex: "1", justifyContent: "end" }} entries={visualPreviews.map(vis => ({ element: <>{vis.icon}{vis.name}</>, tooltip: { title: vis.name, description: vis.description, image: vis.tooltipImage } }))} onSelect={(_, index) => visualise(index)} />
          }
        </section>
      </header>
      <main>
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