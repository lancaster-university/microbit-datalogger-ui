import styled from "@emotion/styled";
import { RiDatabaseLine } from "react-icons/ri";

export interface StandaloneDataLogSource {
    title: string;
    log: string;
}

export interface DataLogSourceProps {
    source: StandaloneDataLogSource;
    onClick(log: StandaloneDataLogSource): void;
}

const Source = styled.div`
    padding: 0.2em;
    flex: 1;
    display: flex;
    padding: 0.65em 0.3em;
    gap: 0.3em;
    cursor: pointer;
    transition: all 0.2s;

    :not(:last-of-type) {
        border-bottom: thin #ddd solid;
    }

    :hover {
        background: #e0e0e0;
    }
`;

export default function DataLogSource(props: DataLogSourceProps) {
    return (
        <Source onClick={() => props.onClick(props.source)}>
            <RiDatabaseLine />
            <div>{props.source.title}</div>
        </Source>
    );
}