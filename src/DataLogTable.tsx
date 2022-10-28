import React from "react";
import { timestampRegex } from "./App";
import DataLog from "./DataLog";
import "./DataLogTable.css";

export interface DataLogProps {
    log: DataLog;
    /**
     * Whether or not discontinuous times should be highlighted. This is when time runs backwards
     * when a timestamp header is present, likely to indicate the micro:bit has been reset in between
     * capturing sets of data
     */
    highlightDiscontinuousTimes?: boolean;
}

// when we click on the row number, highlight the cell contents as if a user manually dragged over and selected it
const highlightRow = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const target = e.target as HTMLTableCellElement;

    const range = document.createRange();
    range.selectNodeContents(target.parentElement as Node);

    const selection = window.getSelection();

    selection?.removeAllRanges();
    selection?.addRange(range);
};

function DataLogTable(props: DataLogProps) {
    const headers = props.log.headers;
    const logLength = props.log.data.length;

    const rows = [];

    const highlightDiscontinuous = props.highlightDiscontinuousTimes && timestampRegex.test(headers[0]);

    let prevRowTimestamp = 0;

    for (let i = 0; i < logLength; i++) {
        const row: JSX.Element[] = [];

        const rowData = props.log.data[i];

        // push a column containing the row number. clicking on it will highlight
        // the entire row, akin to spreadsheet software
        row.push(<td key={-1} onClick={highlightRow}>{rowData.isHeading ? "" : i}</td>);

        let discontinuous = false;

        if (highlightDiscontinuous) {
            const firstRowValue = Number(rowData.data[0]);

            // has time gone backwards??
            discontinuous = firstRowValue < prevRowTimestamp;
            prevRowTimestamp = firstRowValue;
        }

        rowData.data.forEach((data, index) => row.push(
            <td key={index}>
                {data ?? 'None'}
            </td>
        ));

        rows.push(<tr key={i} className={`${discontinuous ? 'discontinuous' : ''} ${rowData.isHeading ? 'header-row' : ''}`}>{row}</tr>);
    }

    return (
        <div className="datalog-table">
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
}

// memo it as we don't want to constantly re-render, performance can be hit
// for large data sets
export default React.memo(DataLogTable);