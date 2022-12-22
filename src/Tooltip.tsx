import styled from "@emotion/styled";
import { useId } from "react";
import { PlacesType, Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export interface TooltipProps {
    content?: string;
    children?: React.ReactNode;
    direction?: PlacesType;
}

const TooltipElement = styled(ReactTooltip)`
    transition: opacity 0.25s;
    background: #333;
    font-weight: normal;
    z-index: 2; // in front of plots
    font-size: 1rem;
`;

export default function Tooltip(props: TooltipProps) {
    const id = useId();

    return (
        <>
            <span id={id}>
                {props.children}
            </span>
            <TooltipElement anchorId={id} content={props.content} place={props.direction || "bottom"} positionStrategy={"fixed"} events={["hover", "click"]}/>
        </>

    )
}