import { useEffect, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";
import "./DataUpdateNotification.css";

export interface DataUpdateNotificationProps {
    visible: boolean;
    onClose(): any;
}

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
        }, 1000);
    };

    return (
        <>
            {visible &&
                <div onClick={close} className={"update-notifier " + (closing ? "notif-closing" : "")}>
                    <div><RiRefreshLine /><h3>Data update found</h3></div>
                    The log data on disk has been updated. Click on 'Update data' to update the page.
                </div>
            }
        </>
    );
}