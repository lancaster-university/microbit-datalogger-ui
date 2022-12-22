import { useEffect, useRef, useState } from "react";
import DataLogTable from "./DataLogTable";
import { Config, Layout } from "plotly.js";
import LineGraphVisualisation from "./LineGraphVisualisation";
import MapVisualisation from "./MapVisualisation";
import DropDownButton from "./DropDownButton";
import Modal, { ModalContents, ModalProps } from "./Modal";
import DataLog from "./DataLog";
import { RiCheckLine, RiClipboardLine, RiDeleteBin2Line, RiDownload2Line, RiQuestionLine, RiRefreshLine, RiShareLine } from "react-icons/ri";
import Warning from "./Warning";
import { LogData } from ".";
import DataUpdateNotification from "./DataUpdateNotification";
import IconButton from "./IconButton";
import TallyVisualisation from "./TallyVisualisation";
import MultiToggleButton from "./MultiToggleButton";
import Tooltip from "./Tooltip";
import { ReactComponent as MicrobitLogo } from "./resources/microbit-logo.svg";
import BrowserWarning from "./BrowserWarning";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import CardStack from "./CardStack";

/**
 * Visualisations are the context-specific ways of presenting data in the data log.
 * For example, a map view for displaying geographic content or a line graph for most
 * general purpose use cases
 */
export interface VisualisationType {
  name: string;
  description: string;
  tooltipImage?: React.ReactNode;
  icon: React.ReactNode;
  availablityError: (log: DataLog) => string | null;
  generate: (props: VisualisationProps) => React.ReactNode;
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
 * Share targets are ways of exporting the data from the data log, aside from the manual "copy" option
 */
interface ShareTarget {
  name: string;
  tooltip: string;
  icon: React.ReactNode;
  onShare: (log: DataLog) => any;
}

const shareTargets: ShareTarget[] = [ // add new share targets here
  {
    name: "Download",
    tooltip: "Saves the log to your device as a .csv file",
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
    tooltip: "Opens a share prompt allowing you to export the log as a .csv file",
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

const AppWrapper = styled.div`
  margin: 0;
  display: grid;
`;

const Header = styled.header`
  background-color: #222;
  padding: 1em;
  background-image: linear-gradient(99deg, #6c4bc1, #7bcdc2 98%);

  h1, h3 {
    color: white;
    margin: 0;
  }

  h3 {
    font-weight: 400;
    padding: 0.5em 0 0.8em 0;
    max-width: 1000px;
  }
`;

const MicrobitLogoWrapper = styled.a`
  float: right;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  position: sticky;
  top: 0.5em;
  z-index: 1; /*to stick above plotly graphs*/
  gap: 0.6em;

  button {
    border: 0;
  }
`;

const DataWrapper = styled.main`
  display: flex;
  flex-flow: row wrap-reverse;
  gap: 0.8em;
  margin: 1em;

  > table {
    align-self: flex-end;
  }

  > :last-child {
    flex: 1;
  }

  > :empty {
    display: none; /* fixes empty gap on small screens */
  }
`;

const visualisationAppearKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const VisualisationWrapper = styled.div`
  min-width: 400px;
  animation: ${visualisationAppearKeyframes} 0.3s;
`;

const LogSpaceIndicator = styled.span`
  background: rgba(0, 0, 0, 0.12);
  color: rgba(250, 250, 250, 0.9);
  padding: 0.1em 0.6em;
  font-size: 0.7em;
  border-radius: 30px;
  margin-left: 0.5em;
`;

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
        const data = DataLog.parse(e.detail);

        // if we choose to update our data to the latest from disk, since the offline js
        // isn"t aware of this it"ll continuously inform us of updates to the original
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
  // todo: visually present the reasons why certain visualisations aren"t available
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

    showModal({ title: "No changes detected", children: <div>To see the latest data that changed after you opened this file, you must unplug your micro:bit and plug it back in.</div> });
  };

  const clearLog = () => {
    showModal({ title: "Clearing the data log", children: <div>The log is cleared when you reflash your micro:bit. Your program can include code or blocks to clear the log when you choose. <a href="https://microbit.org/get-started/user-guide/data-logging/" target="_blank" rel="noreferrer">Learn more about data logging</a>.</div> });
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
  
  const logFullness = props.standalone || props.log.isFull ? "100.0" : (props.dataSize / (props.dataSize + props.bytesRemaining)).toFixed(1);

  return (
    <AppWrapper>
      <BrowserWarning />
      {modal && <Modal {...modal} />}

      <DataUpdateNotification visible={updateNotificationVisible} onClose={() => setUpdateNotificationVisible(false)} />

      <Header>
        <MicrobitLogoWrapper href="https://microbit.org" target="_blank" rel="noreferrer">
          <MicrobitLogo />
        </MicrobitLogoWrapper>

        <h1>micro:bit data log
          {
            !props.standalone &&
            <Tooltip direction="right" content={`Data log storage is ${logFullness}% full. Using ${props.dataSize} bytes out of ${(props.dataSize + props.bytesRemaining)}`}>
              <LogSpaceIndicator>{logFullness}% full</LogSpaceIndicator>
            </Tooltip>
          }
        </h1>
        <h3>
          This is the data on your micro:bit. To analyse it and create your own graphs, transfer it to your computer.
          You can copy and paste your data, or download it as a CSV file which you can import into a spreadsheet or graphing tool.
        </h3>

        <ButtonsWrapper>
          {
            /* Share targets */
            shareTargets.length > 0 &&
            <DropDownButton primary={true} entries={shareTargets.map(target => ({ element: <>{target.icon}{target.name}</>, tooltip: target.tooltip }))} onSelect={handleShare} />
          }

          <Tooltip content="Copies the contents of the log to your clipboard">
            <IconButton onClick={copy} icon={<RiClipboardLine />} caption="Copy" />
          </Tooltip>

          {!props.standalone &&
            <Tooltip content="Updates the page with new data from disk">
              <IconButton onClick={updateData} icon={<RiRefreshLine />} caption="Update data" />
            </Tooltip>
          }

          {!props.standalone &&
            <Tooltip content="Displays information about how to clear all the data from the log">
              <IconButton onClick={clearLog} icon={<RiDeleteBin2Line />} caption="Clear log" />
            </Tooltip>
          }

          {window.localStorage.getItem("debug") &&
            <Tooltip content="Experimental: live updating the log with data sent through serial">
              <IconButton onClick={serialTest} caption="Serial test" />
            </Tooltip>
          }

          <Tooltip content="Opens the micro:bit help page for the data logger">
            <IconButton onClick={help} icon={<RiQuestionLine />} caption="Help"></IconButton>
          </Tooltip>

          {/* Available visualisations */}
          {visualPreviews.length > 0 &&
            <MultiToggleButton style={{ flex: "1", justifyContent: "end" }}
              entries={visualPreviews.map(vis => (
                {
                  element: <>{vis.icon}{vis.name}</>,
                  tooltip: vis.description //<ImageTooltip description={vis.description} image={vis.tooltipImage} />
                }
              ))}
              onSelect={(_, index) => visualise(index)} />
          }
        </ButtonsWrapper>
      </Header>

      <DataWrapper>
        <DataLogTable log={log} highlightDiscontinuousTimes={visualisation === LineGraphVisualisation} />
        <CardStack>
          {log.isFull &&
            <Warning title="Log is full">
              You won't be able to log any more data until the log is cleared. <a href="https://support.microbit.org/support/solutions/articles/19000127516-what-to-do-when-the-data-log-is-full" target="_blank" rel="noreferrer">Learn more</a>.
            </Warning>
          }
          {log.isEmpty &&
            <Warning title="Log is empty">
              You haven't logged any data yet. Click the help button above to learn more about how to log data on the micro:bit.
            </Warning>
          }
          {visualisation && <VisualisationWrapper>{visualisation.generate({ log })}</VisualisationWrapper>}
        </CardStack>
      </DataWrapper>
    </AppWrapper>
  );
}