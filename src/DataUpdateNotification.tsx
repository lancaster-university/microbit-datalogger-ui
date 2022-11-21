import { useState } from "react";
import { RiRefreshLine } from "react-icons/ri";
import "./DataUpdateNotification.css";

/**
 * Displays as floating notification whenever changes are detected on disk to the log data.
 * Users can click the notification to dismiss it, and use the 'Update data' button to update the table and
 * graphs to the latest data.
 */
export default function DataUpdateNotification({ updateNum }: { updateNum: number }) {

    const [closing, setClosing] = useState<boolean>(false);
    const [closeNum, setCloseNum] = useState<number>(0);

    const close = () => {
        setClosing(true);
        
        setTimeout(() => {
            setCloseNum(updateNum);
            setClosing(false);
        }, 1000);
    }

    return (
        <>
            {updateNum > closeNum &&
                <div onClick={() => close()} className={"update-notifier " + (closing ? "notif-closing" : "")}>
                    <div><RiRefreshLine /><h3>Data update found</h3></div>
                    The log data on disk has been updated. Click on 'Update data' to update the page.
                    {/*<button onClick={() => setIgnored(true)}>Ignore and don't show again</button>*/}
                </div>
            }
        </>
    );
}