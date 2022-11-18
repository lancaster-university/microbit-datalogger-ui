import { useRef, useState } from "react";
import { LogData } from ".";
import App from "./App";
import DataLog from "./DataLog";
import Modal from "./Modal";

/**
 * Wrapper around the main App component to supply the log data.
 * If we're passed in non-null log data, this will be forwarded straight to
 * App and we won't do anything else. Otherwise, we'll show a modal to allow
 * users to select a CSV file.
 * 
 * There is no error handling in place currently, but the CSV parser is
 * lenient regardless
 */
export default function LogDataProvider({log}: {log: LogData | null}) {

    const [logData, setLogData] = useState<LogData | null>(log);

    const filePicker = useRef<HTMLInputElement | null>(null);

    const loadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const data = await e.target.files[0].text();

            setLogData({
                bytesRemaining: 0,
                daplinkVersion: -1,
                dataSize: 0,
                hash: 0,
                log: DataLog.fromCSV(data, false),
                standalone: true
            });
        }
    };

    return (
        <>
            {!logData &&
                <Modal title="Standalone Mode" content={
                    <div>
                        You're using the datalogger in standalone mode. This allows you to load data directly from a CSV file. Use the selector below to pick a file.
                        <div>
                            <input type="file" ref={filePicker} onChange={loadFile} accept=".csv"/>
                        </div>
                    </div>
                } onClose={() => { }} hideCloseButton={true} />
            }
            {logData && <App {...logData}/>}
        </>
    );
}