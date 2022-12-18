import { useState } from "react";
import "./IconButton.css";

export interface IconButtonProps {
    icon?: React.ReactNode;
    caption: string;
    /**
     * Returning an icon element will swap out the current icon for 2 seconds with this icon
     */
    onClick?: () => React.ReactNode | void;
}

/**
 * Small button wrapper with support for swapping out icons without having to re-render the parent state.
 * This is used only currently on the 'Copy' button, to provide visual feedback, replacing the clipboard
 * with a tick icon.
 * 
 * This isn't the most configurable currently, but it doesn't really need to be at the moment.
 */
export default function IconButton({ icon, caption, onClick }: IconButtonProps) {
    const [overrideIcon, setOverrideIcon] = useState<React.ReactNode | null>(null);
    const [className, setClassName] = useState("");

    const switchIcon = (icon: React.ReactNode | null) => {
        if (overrideIcon && icon) {
            return;
        }

        setClassName("icon-leaving"); // old icon exit animation
        setTimeout(() => {
            setClassName("icon-entering"); // new icon enter animation
            setOverrideIcon(icon);

            setTimeout(() => {
                setClassName(""); // clear all animation classes
            }, 200);

            if (icon !== null) {
                setTimeout(() => {
                    switchIcon(null); // do the same procedures, but replacing with the old icon again
                }, 2000);
            }
        }, 200);
    }

    const handleClick = () => {
        if (onClick) {
            const res = onClick();

            if (res && !overrideIcon) {
                switchIcon(res);
            }
        }
    }

    return <button className={className} onClick={handleClick}>{overrideIcon || icon}{caption}</button>
}