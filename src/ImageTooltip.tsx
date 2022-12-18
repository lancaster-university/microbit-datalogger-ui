import "./ImageTooltip.css";

export interface ImageTooltipProps {
    title?: string;
    image?: React.ReactNode;
    description?: string;
}

export default function ImageTooltip(props: ImageTooltipProps) {
    return (
        <div>
            {props.title &&
                <div>
                    {props.title}
                </div>
            }
            {props.image &&
                <div className="image-tooltip-image">
                    {props.image}
                </div>
            }
            {props.description &&
                <div>
                    {props.description}
                </div>
            }
        </div>
    );
}