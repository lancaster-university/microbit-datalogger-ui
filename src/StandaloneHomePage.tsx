import React, { useEffect, useRef, useState } from "react";
import { RiClipboardLine, RiFileWarningLine, RiFolderOpenLine } from "react-icons/ri";
import { LogData } from ".";
import DataLog from "./DataLog";
import DataLogSource, { StandaloneDataLogSource } from "./DataLogSource";
import IconButton from "./IconButton";
import { gpsData, petTallyData } from "./sample-data";
import "./StandaloneHomePage.css";

export interface StandaloneHomePageProps {
    logLoaded(log: LogData): void;
}

export default function StandaloneHomePage({ logLoaded }: StandaloneHomePageProps) {
    const [recents, setRecents] = useState<StandaloneDataLogSource[]>([]);

    const filePicker = useRef<HTMLInputElement | null>(null);
    const dropAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const recents: StandaloneDataLogSource[] = JSON.parse(window.localStorage.getItem("recent-files") ?? '[]');

        recents && setRecents(recents);
    }, []);

    const loadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const data = await file.text();

            loadStandalone({
                title: file.name,
                log: data
            });
        }
    };

    const loadStandalone = (data: StandaloneDataLogSource) => {
        let newRecents = [data, ...recents];
        newRecents.length = Math.min(newRecents.length, 5); // cap at 5

        window.localStorage.setItem("recent-files", JSON.stringify(newRecents));
        logLoaded(DataLog.fromCSV(data.log).asStandaloneLog());
    };

    const samples: StandaloneDataLogSource[] = [
        {
            title: "GPS and temperature series",
            log: gpsData.toCSV()
        },
        {
            title: "Pet tally",
            log: petTallyData
        }
    ];

    const loadFromClipboard = () => {
        navigator.clipboard.readText().then(text => {
            loadStandalone({ title: "Data from clipboard", log: text });
        });
    };

    const handleDrag = (event: React.DragEvent) => {
        event.preventDefault();
        dropAreaRef.current?.classList.add("highlight");
    };

    const handleDragLeave = () => {
        dropAreaRef.current?.classList.remove("highlight");
    };

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault();

        const files = event.dataTransfer.files;

        if (files.length > 0) {
            const file = files[0];
            const data = await file.text();

            loadStandalone({
                title: file.name,
                log: data
            });
        }

        event.dataTransfer.clearData();
    };

    return (
        <div ref={dropAreaRef}
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragLeave={handleDragLeave}
            className="standalone-root">
            You're using the datalogger in standalone mode. This allows you to load data directly from a CSV file.
            <div id="file-picker-wrapper">
                <IconButton icon={<RiFolderOpenLine />} caption="Choose file" onClick={() => filePicker.current?.click()} />
                <IconButton icon={<RiClipboardLine />} caption="Load from clipboard" onClick={loadFromClipboard} />
                <input type="file" ref={filePicker} onChange={loadFile} accept=".csv" />
            </div>
            <div id="data-samples-wrapper">
                <div className="data-samples">
                    <div className="sample-title">Sample Data</div>
                    {samples.map((sample, ix) =>
                        <DataLogSource key={ix} source={sample} onClick={loadStandalone} />
                    )}
                </div>
                <div className="data-samples">
                    <div className="sample-title">Recent Files</div>
                    {recents.map((sample, ix) =>
                        <DataLogSource key={ix} source={sample} onClick={loadStandalone} />
                    )}
                </div>
            </div>
        </div>
    );
}