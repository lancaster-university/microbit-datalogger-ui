import styled from "@emotion/styled";
import { useState } from "react";
import { DropDownEntry } from "./DropDownMenu";
import Tooltip from "./Tooltip";

export interface MultiToggleButtonProps {
    entries: DropDownEntry[];
    onSelect?: (entry: DropDownEntry | null, index: number) => any;
    style?: React.CSSProperties;
}

const ButtonWrapper = styled.div`
    display: flex;

    button {
        margin-right: 1px;
    }

    button:active, button:focus {
        z-index: 1; /* keep the outline in front */
    }

    & :first-of-type:not(:last-of-type) button {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    & :not(:first-of-type):not(:last-of-type) button {
        border-radius: 0;
    }

    & :last-of-type:not(:first-of-type) button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
`;

const Button = styled.button<{ active: boolean }>`
    background: ${props => props.active && "rgb(221, 221, 250)"};
    box-shadow: ${props => props.active && "inset 0 2px 8px 2px rgba(0, 0, 0, 0.1)"};
`;

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
        <ButtonWrapper style={props.style}>
            {props.entries.map((entry, index) =>
                <Tooltip key={index} content={index === selected ? undefined : entry.tooltip}>
                    <Button active={index === selected} onClick={() => selectButton(index)}>
                        {entry.element}
                    </Button>
                </Tooltip>
            )}
        </ButtonWrapper>
    );
}