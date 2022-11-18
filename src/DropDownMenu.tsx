import { useEffect, useRef } from "react";
import "./DropDownMenu.css";

export interface DropDownMenuProps {
    items: JSX.Element[];
    onSelected?: (index: number) => any;
}

/**
 * Drop down menu for use with DropDownButtons. Supports keyboard input.
 * Does not automatically close if losing focus, but will attempt to focus itself
 * when being displayed initially.
 */
export default function DropDownMenu(props: DropDownMenuProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        {props.items.map((item, index) => <div tabIndex={0} onKeyDown={e => handleKeyDown(e, index)} onClick={() => props.onSelected && props.onSelected(index)} key={index}>{item}</div>)}
        </div>
    )
}