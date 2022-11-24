import React, { Suspense } from "react";
import { useState } from "react";
import { LogData } from ".";
import App from "./App";
import Modal from "./Modal";

// lazy load as this is only needed for standalone mode
const StandaloneHomePage = React.lazy(() => import("./StandaloneHomePage"));

/**
 * Wrapper around the main App component to supply the log data.
 * If we're passed in non-null log data, this will be forwarded straight to
 * App and we won't do anything else. Otherwise, we'll show a modal to allow
 * users to select a CSV file.
 * 
 * There is no error handling in place currently, but the CSV parser is
 * lenient regardless
 */
export default function LogDataProvider({ log }: { log: LogData | null }) {

    const [logData, setLogData] = useState<LogData | null>(log);

    return (
        <>
            {!logData &&
                <Modal title="Standalone Mode" content={
                    <Suspense>
                        <StandaloneHomePage logLoaded={setLogData} />
                    </Suspense>
                } onClose={() => { }} hideCloseButton={true} />
            }
            {logData && <App {...logData} />}
        </>
    );
}