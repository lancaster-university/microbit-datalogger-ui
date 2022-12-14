import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useState } from "react";

export interface IconButtonProps {
    icon?: React.ReactNode;
    caption: string;
    /**
     * Returning an icon element will swap out the current icon for 2 seconds with this icon
     */
    onClick?: () => React.ReactNode | void;
}

const switchIconKeyframes = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.7);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

type IconSwitchProgress = "enter" | "leave" | null;

const Button = styled.button<{ iconSwitch: IconSwitchProgress }>`
    svg {
        animation: ${props => props.iconSwitch && css`${switchIconKeyframes} 0.12s ease-in ${props.iconSwitch === "enter" ? "normal" : "reverse"} forwards`};
    }
`;

/**
 * Small button wrapper with support for swapping out icons without having to re-render the parent state.
 * This is used only currently on the 'Copy' button, to provide visual feedback, replacing the clipboard
 * with a tick icon.
 * 
 * This isn't the most configurable currently, but it doesn't really need to be at the moment.
 */
export default function IconButton({ icon, caption, onClick }: IconButtonProps) {
    const [overrideIcon, setOverrideIcon] = useState<React.ReactNode | null>(null);
    const [overrideIconProgress, setOverrideIconProgress] = useState<IconSwitchProgress>(null);

    const switchIcon = (icon: React.ReactNode | null) => {
        if (overrideIcon && icon) {
            return;
        }

        setOverrideIconProgress("leave"); // old icon exit animation
        setTimeout(() => {
            setOverrideIconProgress("enter"); // new icon enter animation
            setOverrideIcon(icon);

            setTimeout(() => {
                setOverrideIconProgress(null); // clear all animation classes
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

    return <Button onClick={handleClick} iconSwitch={overrideIconProgress}>{overrideIcon || icon}{caption}</Button>
}