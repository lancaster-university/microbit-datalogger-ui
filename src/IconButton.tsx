import { useState } from "react";
import "./IconButton.css";

export interface IconButtonProps {
    icon?: JSX.Element;
    caption: string;
    onClick?: () => JSX.Element | void;
}

export default function IconButton({ icon, caption, onClick }: IconButtonProps) {
    const [overrideIcon, setOverrideIcon] = useState<JSX.Element | null>(null);
    const [className, setClassName] = useState("");

    const switchIcon = (icon: JSX.Element | null) => {
        if (overrideIcon && icon) {
            return;
        }

        setClassName("icon-leaving");
        setTimeout(() => {
            setClassName("icon-entering");
            setOverrideIcon(icon);

            setTimeout(() => {
                setClassName("");
            }, 200);

            if (icon !== null) {
                setTimeout(() => {
                    switchIcon(null);
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