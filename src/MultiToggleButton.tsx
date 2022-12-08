import { useState } from "react";
import { DropDownEntry } from "./DropDownMenu";
import ImageTooltip, { ImageTooltipData } from "./ImageTooltip";
import "./MultiToggleButton.css";

export interface MultiToggleButtonProps {
    entries: DropDownEntry[];
    onSelect?: (entry: DropDownEntry | null, index: number) => any;
    style?: React.CSSProperties;
}

export default function MultiToggleButton(props: MultiToggleButtonProps) {
    const [tooltipX, setTooltipX] = useState(0);
    const [tooltipY, setTooltipY] = useState(0);
    const [tooltipData, setTooltipData] = useState<ImageTooltipData | undefined>();
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const [selected, setSelected] = useState(-1);

    const selectButton = (index: number) => {
        if (selected == index) {
            // de-select
            props.onSelect && props.onSelect(null, -1);
            setSelected(-1);
        } else {
            props.onSelect && props.onSelect(props.entries[index], index);
            setSelected(index);
        }
        
        setTooltipVisible(false);
    };

    const handleHover = (event: React.MouseEvent, index: number, mouseOver: boolean) => {
        if (selected == index) {
            setTooltipVisible(false);
            return;
        }

        const data = props.entries[index].tooltip;
        mouseOver && setTooltipData(data); // over = mouse is over element
        setTooltipVisible(mouseOver && !!data);
        const pos = event.currentTarget.getBoundingClientRect();
        setTooltipX(pos.left + (pos.width / 2));
        setTooltipY(pos.bottom + 25);
    };

    return (
        <>
            <div className="multi-toggle-button" style={props.style}>
                {props.entries.map((entry, index) =>
                    <button className={index == selected ? "multi-toggle-button-active" : ""} onClick={() => selectButton(index)} onMouseOver={e => handleHover(e, index, true)} onMouseLeave={e => handleHover(e, index, false)}>
                        {entry.element}
                    </button>
                )}
            </div>
            <ImageTooltip calloutDirection="up" visible={tooltipVisible} x={tooltipX} y={tooltipY} data={tooltipData} />
        </>
    );
}