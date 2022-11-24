import { RiDatabaseLine } from "react-icons/ri";
import "./DataLogSource.css";

export interface StandaloneDataLogSource {
    title: string;
    log: string;
}

export interface DataLogSourceProps {
    source: StandaloneDataLogSource;
    onClick(log: StandaloneDataLogSource): void;
}

export default function DataLogSource(props: DataLogSourceProps) {
    return (
        <div className="data-sample" onClick={() => props.onClick(props.source)}>
            <RiDatabaseLine />
            <div>{props.source.title}</div>
        </div>
    );
}