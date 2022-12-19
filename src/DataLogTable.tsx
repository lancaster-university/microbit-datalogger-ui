import styled from "@emotion/styled";
import React from "react";
import DataLog from "./DataLog";
import { detect, FieldType, TIME } from "./FieldTypes";
import Tooltip from "./Tooltip";

export interface DataLogProps {
    log: DataLog;
    /**
     * Whether or not discontinuous times should be highlighted. This is when time runs backwards
     * when a timestamp header is present, likely to indicate the micro:bit has been reset in between
     * capturing sets of data
     */
    highlightDiscontinuousTimes?: boolean;
}

const Table = styled.table`
    text-align: right;
    border-collapse: collapse;
    background: #ddd;
    overflow: hidden;
    border-radius: 8px;
    margin-top: 0;
    border: none;
    box-shadow: rgba(0, 0, 0, 0.18) 0px 3px 12px;

    td {
        padding: 0.6em;
        min-width: 12ch;
    }

    tr {
        background: #fdfdfd;
        transition: all 0.2s;
    }

    tr:not(:last-of-type) {
        border-bottom: thin solid #ddd;
    }

    td:not(:last-of-type) {
        border-right: thin solid #ddd;
    }

    tr > :first-of-type {
        min-width: 4ch;
        width: 4ch;
        background: #f0f0f0;
        text-align: center;
        cursor: pointer;
        user-select: none; /* avoid selecting the row number when manually selecting and copying data from the table */
        border-right: thin solid #ddd;
    }

    tr:nth-of-type(odd) {
        background: #f1f1f1;
    }

    tr:hover {
        background-color: #ddd;
    }

    tr svg {
        transform: translateY(0.1em);
        margin-right: 0.3em;
    }
`;

const TableRow = styled.tr<{discontinuous: boolean, header: boolean}>`
    border-top: ${props => props.discontinuous && "4px dashed #777"};

    font-weight: ${props => props.header && "bold"};
    background: ${props => props.header && "#f0f0f0"};
`;

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
    const logLength = props.log.data.length;

    const rows = [];

    const highlightDiscontinuousIndex = props.highlightDiscontinuousTimes ? props.log.findFieldIndex(TIME) : -1;

    let prevRowTimestamp = 0;

    for (let i = 0; i < logLength; i++) {
        const row: React.ReactNode[] = [];

        const rowData = props.log.data[i];

        // push a column containing the row number. clicking on it will highlight
        // the entire row, akin to spreadsheet software
        row.push(<td key={-1} onClick={highlightRow}>{rowData.isHeading ? "" : i}</td>);

        let discontinuous = false;

        if (highlightDiscontinuousIndex !== -1) {
            const firstRowValue = Number(rowData.data[highlightDiscontinuousIndex]);

            // has time gone backwards??
            discontinuous = firstRowValue < prevRowTimestamp && i !== 0;
            prevRowTimestamp = firstRowValue;
        }

        rowData.data.forEach((data, index) => {
            const formattedType: FieldType | null = rowData.isHeading && data ? detect(data) : null;
            const icon = formattedType && formattedType.icon;

            return row.push(
                <td key={index}>
                    {!!icon ? <Tooltip content={`Column detected as ${formattedType.name}`} direction="bottom">{icon}</Tooltip> : ""}{data ?? ""}
                </td>
            );
        });

        rows.push(<TableRow key={i} discontinuous={discontinuous} header={!!rowData.isHeading}>{row}</TableRow>);
    }

    if (rows.length === 0) {
        return null;
    }

    return (
        <Table>
            <tbody>
                {rows}
            </tbody>
        </Table>
    );
}

// memo it as we don't want to constantly re-render, performance can be hit
// for large data sets
export default React.memo(DataLogTable);