import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import { RiClipboardLine, RiFolderOpenLine } from "react-icons/ri";
import { LogData } from ".";
import DataLog from "./DataLog";
import DataLogSource, { StandaloneDataLogSource } from "./DataLogSource";
import IconButton from "./IconButton";
import Modal from "./Modal";
import { gpsData, petTallyData } from "./sample-data";

export interface StandaloneHomePageProps {
    logLoaded(log: LogData): void;
}

const Root = styled.div<{ highlightDrop: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 1.8em;
`;

const FilePickerWrapper = styled.div`
    display: flex;
    justify-content: center;
    gap: 1em;

    button {
        font-size: 1em;
        min-height: 40px;
    }

    input {
        display: none;
    }
`;

const DataSamplesWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 1em;

    > div {
        flex: 1;
        overflow: hidden;
    }
`;

const DataSampleTitle = styled.div`
    font-weight: 600;
    padding-bottom: 0.25em;
`;

const LoadError = styled.div`
    padding-bottom: 0.5em;
`;

export default function StandaloneHomePage({ logLoaded }: StandaloneHomePageProps) {
    const [recents, setRecents] = useState<StandaloneDataLogSource[]>([]);
    const [draggedOver, setDraggedOver] = useState(false);
    const [loadErrorVisible, setLoadErrorVisible] = useState(false);

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

        const parsedData = DataLog.parse(data.log);

        if (!parsedData) {
            setLoadErrorVisible(true);
            return;
        }

        logLoaded(parsedData);
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
        setDraggedOver(true);
    };

    const handleDragLeave = () => {
        setDraggedOver(false);
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
        <Root ref={dropAreaRef}
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragLeave={handleDragLeave}
            highlightDrop={draggedOver}
        >
            You're using the datalogger in standalone mode. This allows you to load data directly from a CSV or micro:bit data file.
            <FilePickerWrapper>
                <IconButton icon={<RiFolderOpenLine />} caption="Choose file" onClick={() => filePicker.current?.click()} />
                <IconButton icon={<RiClipboardLine />} caption="Load from clipboard" onClick={loadFromClipboard} />
                <input type="file" ref={filePicker} onChange={loadFile} accept=".csv" />
            </FilePickerWrapper>
            {
                loadErrorVisible &&
                <Modal title="Failed to load" onClose={() => setLoadErrorVisible(false)}>
                    <LoadError>Failed to load file. Make sure it is a valid .csv or MY_DATA.HTM file.</LoadError>
                </Modal>
            }
            <DataSamplesWrapper>
                <div>
                    <DataSampleTitle>Sample Data</DataSampleTitle>
                    {samples.map((sample, ix) =>
                        <DataLogSource key={ix} source={sample} onClick={loadStandalone} />
                    )}
                </div>
                <div>
                    <DataSampleTitle>Recent Files</DataSampleTitle>
                    {recents.map((sample, ix) =>
                        <DataLogSource key={ix} source={sample} onClick={loadStandalone} />
                    )}
                </div>
            </DataSamplesWrapper>
        </Root>
    );
}