import React, { useState } from "react";
import { RiMore2Fill } from "react-icons/ri";
import "./Button.css";
import DropDownMenu from "./DropDownMenu";

export interface ButtonProps {
    dropdown?: JSX.Element[];
    children: React.ReactNode;
    onClick?: () => any;
    onDropdownSelected?: (index: number) => any;
    primary?: boolean;
}

function DropDownButton(props: ButtonProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleBlur = (event: any) => {
        if (event.relatedTarget !== null && !event.currentTarget.contains(event.relatedTarget)) {
            setDropdownOpen(false);
        }
    }

    const handleDropdownSelect = (index: number) => {
        setDropdownOpen(false);
        props.onDropdownSelected && props.onDropdownSelected(index);
    };

    const handleMainButtonClick = () => {
        setDropdownOpen(false);
        props.onClick && props.onClick();
    }

    const validDropdown = props.dropdown && props.dropdown.length > 0;

    return (
        <div className="button-wrapper" onBlur={handleBlur}>
            <button className={"button-main " + (validDropdown ? "dropdown " : " ") + (props.primary ? "primary" : "")} onClick={handleMainButtonClick}>
                {props.children}
            </button>
            {validDropdown && 
            <button className={"button-dropdown " + (dropdownOpen ? "open " : " ") + (props.primary ? "primary" : "")} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <RiMore2Fill/>
            </button>
            }
            {validDropdown && dropdownOpen && <DropDownMenu items={props.dropdown || []} onSelected={handleDropdownSelect}/>}
        </div>
    );
}

export default DropDownButton;