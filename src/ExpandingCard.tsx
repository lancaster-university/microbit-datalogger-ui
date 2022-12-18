import { useEffect, useRef, useState } from "react";
import { RiArrowDownSLine, RiFullscreenLine } from "react-icons/ri";
import "./ExpandingCard.css";
import Tooltip from "./Tooltip";

export interface ExpandingCardProps {
    title?: React.ReactNode;
    displayFullscreenButton?: boolean;
    displayExpandButton?: boolean;
    children?: React.ReactNode;
}

export default function ExpandingCard(props: ExpandingCardProps) {
    const [expanded, setExpanded] = useState(true);

    const firstRender = useRef(true);
    const selfRef = useRef<HTMLDivElement>(null);
    const expandedContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (firstRender.current || isFullscreen()) {
            firstRender.current = false;
            return;
        }

        const contentElement = expandedContentRef.current;

        if (!contentElement) {
            return;
        }

        if (expanded) {
            // Animate expansion
            contentElement.style.height = "auto";
            contentElement.style.overflow = "hidden";
            debugger;
            //contentElement.style.height = "0";
            contentElement.style.transition = "height 0.3s ease-in";

            requestAnimationFrame(() => {
                const targetHeight = contentElement.offsetHeight;
                contentElement.style.height = "0";

                requestAnimationFrame(() => {
                    contentElement.style.height = `${targetHeight}px`;

                    setTimeout(() => {
                        contentElement.style.height = "auto";
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
            });
        }
    }, [expanded]);

    const isFullscreen = () => !!document.fullscreenElement;

    const expand = () => {
        if (!(isFullscreen())) {
            setExpanded(!expanded);
        }
    };

    const fullscreen = () => {
        if (isFullscreen()) {
            document.exitFullscreen();
        } else {
            selfRef.current?.requestFullscreen();
            setExpanded(true);
        }
    };

    return (
        <div ref={selfRef} className="expanding-card-container card">
            <div className="card-header">
                <div className="card-title">{props.title}</div>
                <div className="card-options">
                    {document.fullscreenEnabled && props.displayFullscreenButton &&
                        <Tooltip content={"Toggle fullscreen"}>
                            <button onClick={fullscreen}><RiFullscreenLine /></button>
                        </Tooltip>
                    }
                    {props.displayExpandButton && <button className={`card-expander ${expanded ? "expanded" : ""}`} onClick={expand}><RiArrowDownSLine /></button>}
                </div>
            </div>
            <div className="card-expanded-contents" ref={expandedContentRef} style={{ height: isFullscreen() ? "100%" : undefined }}>
                {props.children}
            </div>
        </div>
    );
}