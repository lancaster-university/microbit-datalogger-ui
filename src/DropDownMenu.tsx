import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";

export interface DropDownEntry {
    element: React.ReactNode;
    tooltip?: string;
}

export interface DropDownMenuProps {
    items: DropDownEntry[];
    onSelected?: (index: number) => any;
    onClose?: () => any;
}

const dropdownAppearKeyframes = keyframes`
    0% {
        transform: scale(0.9) translateY(-10px);
        opacity: 0;
    }

    100% {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
`;

const Menu = styled.div`
    position: absolute;
    top: 100%;
    width: 100%;
    margin-top: 3px;
    background: white;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 3px 12px;
    overflow: hidden;
    padding: 0.3em 0;
    animation: ${dropdownAppearKeyframes} 0.18s ease-out;

    & div {
        padding: 0.5em 0.5em;
        display: flex;
        transition: background-color linear 0.2s;
    }

    & div:focus {
        background: #eee;
        cursor: pointer;
        outline: none;
    }

    & div:hover {
        background: #ddd;
        cursor: pointer;
        outline: none;
    }
`;

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
        <Menu ref={dropdownRef}>
            {
                props.items.map((item, index) =>
                    <div key={index} title={item.tooltip} tabIndex={0} onKeyDown={e => handleKeyDown(e, index)} onClick={() => props.onSelected && props.onSelected(index)}>{item.element}</div>
                )
            }
        </Menu>
    );
}