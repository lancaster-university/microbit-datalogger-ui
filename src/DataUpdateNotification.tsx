import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";

export interface DataUpdateNotificationProps {
    visible: boolean;
    onClose(): any;
}

const notificationAppearKeyframes = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.95) translateX(5em);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateX(0);
    }
`;

const notificationDisappearKeyframes = keyframes`
    0% {
        opacity: 1;
        transform: scale(1) translateX(0);
    }

    100% {
        opacity: 0;
        transform: scale(0.95) translateX(5em);
    }
`; // todo hack-ish

const notificationIconSpinKeyframes = keyframes`
    0% {
        opacity: 0;
        transform: rotate(0deg) scale(0.6);
    }

    100% {
        opacity: 1;
        transform: rotate(360deg) scale(1);
    }
`;

const Notification = styled.div<{ closing: boolean }>`
    position: fixed;
    top: 0.5em;
    right: 0.5em;
    width: 35em;
    background: #333;
    border-radius: 8px;
    z-index: 2;
    color: white;
    padding: 0.8em;

    animation: ${props => css`${props.closing ? notificationDisappearKeyframes : notificationAppearKeyframes} 0.15s ease-out forwards`};

    h3 {
        margin: 0;
    }

    button {
        margin-top: 0.6em;
    }

    div {
        display: flex;
        align-items: center;
        margin-bottom: 0.3em;
    }

    svg {
        animation: ${notificationIconSpinKeyframes} 0.6s ease-out;
    }
`;

/**
 * Displays as floating notification whenever changes are detected on disk to the log data.
 * Users can click the notification to dismiss it, and use the 'Update data' button to update the table and
 * graphs to the latest data.
 */
export default function DataUpdateNotification(props: DataUpdateNotificationProps) {

    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        setVisible(props.visible);
    }, [props.visible]);

    const close = () => {
        setClosing(true);

        setTimeout(() => {
            setClosing(false);
            setVisible(false);
            props.onClose();
        }, 150);
    };

    return (
        <>
            {visible &&
                <Notification onClick={close} closing={closing}>
                    <div><RiRefreshLine /><h3>Data update found</h3></div>
                    The log data on disk has been updated. Click on 'Update data' to update the page.
                </Notification>
            }
        </>
    );
}