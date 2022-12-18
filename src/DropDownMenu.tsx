import React, { useEffect, useRef, useState } from "react";
import "./DropDownMenu.css";
import Tooltip from "./Tooltip";

export interface DropDownEntry {
    element: React.ReactNode;
    tooltip?: React.ReactNode;
}

export interface DropDownMenuProps {
    items: DropDownEntry[];
    onSelected?: (index: number) => any;
    onClose?: () => any;
}

/**
 * Drop down menu for use with DropDownButtons. Supports keyboard input.
 * Does not automatically close if losing focus, but will attempt to focus itself
 * when being displayed initially.
 */
export default function DropDownMenu(props: DropDownMenuProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // todo
            }
        };
        document.addEventListener("click", handleDocumentClick);
        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    });

    // try and make sure we're focused!
    useEffect(() => {
        const children = dropdownRef.current?.children;

        if (children && children.length > 0) {
            (children[0] as HTMLElement).focus();
        }
    });

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        if (event.key === "Enter") {
            props.onSelected && props.onSelected(index);
        }
    };

    return (
        <div className="dropdown-menu" ref={dropdownRef}>
            {
                props.items.map((item, index) =>
                    <Tooltip content={item.tooltip}>
                        <div tabIndex={0} onKeyDown={e => handleKeyDown(e, index)} onClick={() => props.onSelected && props.onSelected(index)} key={index}>{item.element}</div>
                    </Tooltip>
                )
            }
        </div>
    );
}