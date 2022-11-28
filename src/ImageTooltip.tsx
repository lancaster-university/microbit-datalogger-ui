import "./ImageTooltip.css";

export interface ImageTooltipData {
    title?: string;
    image?: JSX.Element;
    description?: string;
}

export interface ImageTooltipProps {
    x: number;
    y: number;
    visible?: boolean;
    data?: ImageTooltipData;
}

export default function ImageTooltip(props: ImageTooltipProps) {
    const translateStyle: React.CSSProperties = {transform: `translate(${props.x}px, ${props.y}px)`, opacity: props.visible ? 1 : 0, transition: `opacity 0.2s 0.1s, transform 0.1s`};

    return (
        <div className="vs-tooltip" style={translateStyle}>
            <span className="vs-tooltip-callout"></span>
            <div className="vs-tooltip-text">
                {props.data?.title}
            </div>
            <div className="vs-image">
                {props.data?.image}
            </div>
            <div className="vs-tooltip-desc">
                {props.data?.description}
            </div>
        </div>
    );
}