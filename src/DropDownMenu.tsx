import React, { useEffect, useRef, useState } from "react";
import "./DropDownMenu.css";
import ImageTooltip, { ImageTooltipData } from "./ImageTooltip";

export interface DropDownEntry {
    element: JSX.Element;
    tooltip?: ImageTooltipData;
}

export interface DropDownMenuProps {
    items: DropDownEntry[];
    onSelected?: (index: number) => any;
}

/**
 * Drop down menu for use with DropDownButtons. Supports keyboard input.
 * Does not automatically close if losing focus, but will attempt to focus itself
 * when being displayed initially.
 */
export default function DropDownMenu(props: DropDownMenuProps) {
    const [tooltipX, setTooltipX] = useState(0);
    const [tooltipY, setTooltipY] = useState(0);
    const [tooltipData, setTooltipData] = useState<ImageTooltipData | undefined>();
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // try and make sure we're focused!
    useEffect(() => {
        const children = dropdownRef.current?.children;

        if (children && children.length > 0) {
            (children[0] as HTMLElement).focus();
        }
    });

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        if (event.key === "Enter") {
            props.onSelected && props.onSelected(index);
        }
    };

    const handleHover = (event: React.MouseEvent, index: number, mouseOver: boolean) => {
        const data = props.items[index].tooltip;
        mouseOver && setTooltipData(data); // over = mouse is over element
        setTooltipVisible(mouseOver && !!data);
        const pos = event.currentTarget.getBoundingClientRect();
        setTooltipX(pos.right);
        setTooltipY(pos.y - 10);
    };

    return (
        <>
            <div className="dropdown-menu" ref={dropdownRef}>
                {props.items.map((item, index) => <div tabIndex={0} onKeyDown={e => handleKeyDown(e, index)} onMouseOver={e => handleHover(e, index, true)} onMouseLeave={e => handleHover(e, index, false)} onClick={() => props.onSelected && props.onSelected(index)} key={index}>{item.element}</div>)}
            </div>
            <ImageTooltip visible={tooltipVisible} x={tooltipX} y={tooltipY} data={tooltipData} />
        </>
    )
}