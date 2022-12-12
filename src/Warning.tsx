import { RiInformationLine } from "react-icons/ri";
import "./Warning.css";

export interface WarningProps {
    title: string;
    children: React.ReactNode;
}

export default function Warning(props: WarningProps) {
    return (
        <div className="warning card">
            <RiInformationLine />
            <div>
                <h3>{props.title}</h3>
                {props.children}
            </div>
        </div>
    );
}