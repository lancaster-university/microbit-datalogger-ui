import styled from "@emotion/styled";
import React, { useState } from "react";
import { RiMore2Fill } from "react-icons/ri";
import DropDownMenu, { DropDownEntry } from "./DropDownMenu";
import Tooltip from "./Tooltip";

export interface DropDownButtonProps {
    /**
     * The contents of each secondary element of the button, and their
     * corresponding tooltip data
     */
    entries?: DropDownEntry[];
    /**
     * Event handler for selecting any of the actions for this button.
     * Provides the index of the selected item. 0 indicates the main
     * button was pressed, >= 1 indicates an item from the dropdown menu.
     */
    onSelect?: (index: number) => any;
    /**
     * Whether this is a primary button. Will apply the 'primary' css style
     * to both button sections if so
     */
    primary?: boolean;
    style?: React.CSSProperties;
}

const ButtonWrapper = styled.div`
    display: flex;
    position: relative;
`;

const MainButton = styled.button<{hasDropdown: boolean}>`
    border-top-right-radius: ${props => props.hasDropdown && 0};
    border-bottom-right-radius: ${props => props.hasDropdown && 0};
`;

const MenuButton = styled.button<{primary: boolean}>`
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    padding: 0 0.8em 0 0.6em;

    margin-left: ${props => props.primary && "1px"};

    svg {
        margin: 0;
    }
`;

/**
 * A combination of a button and drop-down menu. A drop-down button has
 * a primary action, and a list of secondary actions which can be accessed
 * by clicking on the ... icon
 */
export default function DropDownButton(props: DropDownButtonProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // close the menu if it loses focus
    // todo: this doesn't work in all cases
    const handleBlur = (event: any) => {
        if (event.relatedTarget !== null && !event.currentTarget.contains(event.relatedTarget)) {
            setDropdownOpen(false);
        }
    };

    const handleClick = (index: number) => {
        setDropdownOpen(false);
        props.onSelect && props.onSelect(index + 1);
    };

    if (!props.entries) {
        return <></>;
    }

    const firstEntry = props.entries.length > 0 ? props.entries[0] : null;

    // if we don't have any dropdown entries, just render as a normal button
    const validDropdown = props.entries.length > 1;

    return (
        <ButtonWrapper onBlur={handleBlur} style={props.style}>
            {firstEntry &&
                <Tooltip content={firstEntry.tooltip}>
                    <MainButton hasDropdown={validDropdown} className={props.primary ? "primary" : ""} onClick={() => handleClick(-1)}>
                        {firstEntry.element}
                    </MainButton>
                </Tooltip>

                // todo: currently a weird mix of styled components and vanilla css classes is used here - this is because a primary
                // button style is defined within index.css - which contain styles which also work with the offline data logger such as if
                // the user has javascript disabled or this app fails to load on top for whatever reason. the button styles could be reimplemented
                // as styled component styles but that's probably wasteful... so the "primary" class for buttons is just used for now
            }

            {validDropdown &&
                <MenuButton primary={!!props.primary} className={props.primary ? "primary" : ""} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <RiMore2Fill />
                </MenuButton>
            }

            {validDropdown && dropdownOpen &&
                <DropDownMenu items={props.entries.slice(1)} onSelected={handleClick} />
            }
        </ButtonWrapper>
    );
}