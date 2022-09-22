import React from "react";
import { timestampRegex } from "./App";
import DataLog from "./DataLog";
import "./DataLogTable.css";

type DataLogProps = {
    log: DataLog,
    highlightDiscontinuousTimes?: boolean
}

let redrawCount = 0;

function DataLogTable(props: DataLogProps) {
    // get the column with the highest row count
    //const headers = Object.keys(props.log);
    //const logLength = headers.map(header => props.log[header].length).reduce((p, c) => p > c ? p : c); // p = our highest row count

    const headers = props.log.headers;
    const logLength = props.log.data.length;

    const now = Date.now();

    const rows = [];

    const highlightDiscontinuous = props.highlightDiscontinuousTimes && timestampRegex.test(headers[0]);

    let prevRowTimestamp = 0;

    for (let i = 0; i < logLength; i++) {
        const row: JSX.Element[] = [];

        const rowData = props.log.data[i];

        row.push(<td key={-1}>{rowData.isHeading ? "" : i}</td>);

        let discontinuous = false;

        if (highlightDiscontinuous) {
            const firstRowValue = Number(rowData.data[0]);

            discontinuous = highlightDiscontinuous && firstRowValue < prevRowTimestamp;
            prevRowTimestamp = firstRowValue;
        }

        rowData.data.forEach((data, index) => row.push(
            <td key={index}>
                {data ?? 'None'}
            </td>
        ));

        rows.push(<tr key={i} className={`${discontinuous ? 'discontinuous' : ''} ${rowData.isHeading ? 'header-row' : ''}`}>{row}</tr>);
    }

    console.log("RENDER " + (Date.now() - now));

    return (
        <table>
            <div>Redraw count {++redrawCount}</div>
            <tbody>
                {rows}
                <tr>
                    <td colSpan={headers.length + 1} id="datalog-end">End of data log</td>
                </tr>
            </tbody>
        </table>
    );
}

export default React.memo(DataLogTable);