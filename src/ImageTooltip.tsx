import styled from "@emotion/styled";

export interface ImageTooltipProps {
    title?: string;
    image?: React.ReactNode;
    description?: string;
}

const ImageTooltipImage = styled.div`
    text-align: center;
    padding: 0.5em 0;
`;

export default function ImageTooltip(props: ImageTooltipProps) {
    return (
        <div>
            {props.title &&
                <div>
                    {props.title}
                </div>
            }
            {props.image &&
                <ImageTooltipImage>
                    {props.image}
                </ImageTooltipImage>
            }
            {props.description &&
                <div>
                    {props.description}
                </div>
            }
        </div>
    );
}