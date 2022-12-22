import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { RiArrowDownSLine, RiFullscreenLine } from "react-icons/ri";
import Card from "./Card";
import Tooltip from "./Tooltip";

export interface ExpandingCardProps {
    title?: React.ReactNode;
    displayFullscreenButton?: boolean;
    displayExpandButton?: boolean;
    children?: React.ReactNode;
    maxHeight?: number;
}

const ExpandingCardContainer = styled(Card)`
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ExpandingCardHeader = styled.div`
    color: #444;
    font-size: 1em;
    display: flex;
    z-index: 2;
`;

const ExpandingCardTitle = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
`;

const ExpandingCardContent = styled.div<{ fullscreen: boolean, height?: number }>`
    overflow: hidden;
    height: ${props => props.fullscreen ? "100%" : props.height && `${props.height}px`};
`;

const ExpandingCardOptions = styled.div`
    display: flex;
    gap: 0.5em;

    button {
        border: 0;
        padding: 0.1em;
        min-height: unset;
        border-radius: 8px;
    }

    svg {
        margin: 0;
    }
`;

const Expander = styled.button<{ expanded: boolean }>`
    svg {
        transition: all 0.1s ease-in-out;
        transform-origin: 50% 45%;

        transform: ${props => props.expanded && "rotate(180deg)"};
    }
`;

export default function ExpandingCard(props: ExpandingCardProps) {
    const isFullscreen = () => !!document.fullscreenElement;

    const [expanded, setExpanded] = useState(true);
    const [renderFullscreen, setRenderFullscreen] = useState(isFullscreen);

    const firstRender = useRef(true);
    const selfRef = useRef<HTMLDivElement>(null);
    const expandedContentRef = useRef<HTMLDivElement>(null);
    const canExpand = useRef(true);

    useEffect(() => {
        const callback = () => {
            setRenderFullscreen(isFullscreen());
        }

        document.addEventListener("fullscreenchange", callback);

        return () => {
            document.removeEventListener("fullscreenchange", callback);
        }
    });

    useEffect(() => {
        if (firstRender.current || isFullscreen()) {
            firstRender.current = false;
            return;
        }

        const contentElement = expandedContentRef.current;

        if (!contentElement) {
            return;
        }

        canExpand.current = false;

        if (expanded) {
            // Animate expansion
            contentElement.style.height = "auto";
            contentElement.style.transition = "height 0.3s ease-in";

            requestAnimationFrame(() => {
                const targetHeight = contentElement.offsetHeight;
                contentElement.style.height = "0";

                requestAnimationFrame(() => {
                    contentElement.style.height = `${targetHeight}px`;

                    setTimeout(() => {
                        contentElement.style.height = renderFullscreen ? "100%" : `${props.maxHeight}px`;
                        canExpand.current = true;
                    }, 300);
                });
            });
        } else {
            // Animate contraction
            const height = contentElement.offsetHeight;
            contentElement.style.height = `${height}px`;
            contentElement.style.transition = "height 0.3s ease-out";

            requestAnimationFrame(() => {
                contentElement.style.height = "0";
                canExpand.current = true;
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expanded]);

    const expand = () => {
        if (canExpand.current && !isFullscreen()) {
            setExpanded(!expanded);
        }
    };

    const fullscreen = () => {
        if (isFullscreen()) {
            document.exitFullscreen();
        } else {
            setExpanded(true);
            selfRef.current?.requestFullscreen();
        }
    };

    return (
        <ExpandingCardContainer ref={selfRef}>
            <ExpandingCardHeader>
                <ExpandingCardTitle>{props.title}</ExpandingCardTitle>
                <ExpandingCardOptions>
                    {document.fullscreenEnabled && props.displayFullscreenButton &&
                        <Tooltip content={"Toggle fullscreen"}>
                            <button onClick={fullscreen}><RiFullscreenLine /></button>
                        </Tooltip>
                    }
                    {props.displayExpandButton && !renderFullscreen && <Expander expanded={expanded} onClick={expand}><RiArrowDownSLine /></Expander>}
                </ExpandingCardOptions>
            </ExpandingCardHeader>
            <ExpandingCardContent ref={expandedContentRef} height={props.maxHeight} fullscreen={renderFullscreen}>
                {props.children}
            </ExpandingCardContent>
        </ExpandingCardContainer>
    );
}