import React, { useState } from "react";
import { RiMore2Fill } from "react-icons/ri";
import "./Button.css";
import DropDownMenu, { DropDownEntry } from "./DropDownMenu";

export interface ButtonProps {
    /**
     * The contents of each secondary element of the button, and their
     * corresponding tooltip data
     */
    dropdown?: DropDownEntry[];
    /**
     * The contents of the main section of the button
     */
    children: React.ReactNode;
    /**
     * Event handler for clicking on the main action for this button
     */
    onClick?: () => any;
    /**
     * Event handler for clicking on any of the secondary actions for this
     * button. Contains the index of the selected item
     */
    onDropdownSelected?: (index: number) => any;
    /**
     * Whether this is a primary button. Will apply the 'primary' css style
     * to both button sections if so
     */
    primary?: boolean;
}

/**
 * A combination of a button and drop-down menu. A drop-down button has
 * a primary action, and a list of secondary actions which can be accessed
 * by clicking on the ... icon
 */
export default function DropDownButton(props: ButtonProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // close the menu if it loses focus
    // todo: this doesn't work in all cases
    const handleBlur = (event: any) => {
        if (event.relatedTarget !== null && !event.currentTarget.contains(event.relatedTarget)) {
            setDropdownOpen(false);
        }
    };

    const handleDropdownSelect = (index: number) => {
        setDropdownOpen(false);
        props.onDropdownSelected && props.onDropdownSelected(index);
    };

    const handleMainButtonClick = () => {
        setDropdownOpen(false);
        props.onClick && props.onClick();
    };

    // if we don't have any dropdown entries, just render as a normal button
    const validDropdown = props.dropdown && props.dropdown.length > 0;

    return (
        <div className="button-wrapper" onBlur={handleBlur}>
            <button className={"button-main " + (validDropdown ? "dropdown " : " ") + (props.primary ? "primary" : "")} onClick={handleMainButtonClick}>
                {props.children}
            </button>
            {validDropdown &&
                <button className={"button-dropdown " + (dropdownOpen ? "open " : " ") + (props.primary ? "primary" : "")} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <RiMore2Fill />
                </button>
            }
            {validDropdown && dropdownOpen && <>
                <DropDownMenu items={props.dropdown || []} onSelected={handleDropdownSelect}/>
            </>}
        </div>
    );
}