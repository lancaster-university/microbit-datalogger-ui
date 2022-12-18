import { useState } from "react";
import { DropDownEntry } from "./DropDownMenu";
import "./MultiToggleButton.css";
import Tooltip from "./Tooltip";

export interface MultiToggleButtonProps {
    entries: DropDownEntry[];
    onSelect?: (entry: DropDownEntry | null, index: number) => any;
    style?: React.CSSProperties;
}

export default function MultiToggleButton(props: MultiToggleButtonProps) {
    const [selected, setSelected] = useState(-1);

    const selectButton = (index: number) => {
        if (selected === index) {
            // de-select
            props.onSelect && props.onSelect(null, -1);
            setSelected(-1);
        } else {
            props.onSelect && props.onSelect(props.entries[index], index);
            setSelected(index);
        }
    };


    return (
        <div className="multi-toggle-button" style={props.style}>
            {props.entries.map((entry, index) =>
                <Tooltip content={index === selected ? undefined : entry.tooltip}>
                    <button className={index === selected ? "multi-toggle-button-active" : ""} onClick={() => selectButton(index)}>
                        {entry.element}
                    </button>
                </Tooltip>
            )}
        </div>
    );
}