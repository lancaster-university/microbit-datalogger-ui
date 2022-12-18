import { useRef, useState } from "react";
import "./Tooltip.css";

export interface TooltipProps {
    content?: React.ReactNode;
    children?: React.ReactNode;
    direction?: "up" | "down";
}

export default function Tooltip(props: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        props.content && setVisible(true);
    };

    const hideTooltip = () => {
        setVisible(false);
    };

    return (
        <div className="tooltip-wrapper" onMouseEnter={showTooltip} onMouseDown={hideTooltip} onMouseLeave={hideTooltip}>
            {props.children}
            <div ref={tooltipRef} className={`tooltip-tip ${props.direction || "down"} ${visible ? "tooltip-appear" : "tooltip-disappear"}`}>{props.content}</div>
        </div>
    )
}