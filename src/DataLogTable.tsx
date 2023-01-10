import styled from "@emotion/styled";
import React, { useState } from "react";
import DataLog from "./DataLog";
import { detect, FieldType, TIME } from "./FieldTypes";
import Modal from "./Modal";
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
    box-shadow: 0 0 12px 2px rgb(0 0 0 / 10%), rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.05) 0px 0px 0px 1px;
    //box-shadow: 0 0 12px 2px rgb(0 0 0 / 10%);

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

const TableRow = styled.tr<{ discontinuous: boolean, header: boolean }>`
    border-top: ${props => props.discontinuous && "4px dashed #777"};

    font-weight: ${props => props.header && "bold"};
    background: ${props => props.header && "#f0f0f0"};
`;

const EmptyData = styled.span`
    color: #333;
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

const TimePicker = styled.div`
    display: flex;
    gap: 0.5em;
    margin-top: 0.8em;

    border-top: thin solid rgba(0, 0, 0, 0.3);
    padding-top: 0.8em;
`;

const TimestampModal = ({ onClose }: { onClose?: (date?: Date) => any }) => {

    const [dateTime, setDateTime] = useState<Date | null>();

    return (
        <Modal title="Add realtime column" onClose={() => onClose && onClose(dateTime || undefined)} buttons={<button className="primary">Save</button>}>
            <>
                The micro:bit does not have a built-in real-time clock. This means that it does not have the ability to track and
                store the exact time at which data is logged. However, by providing a time input, the timestamps can be approximated
                and displayed in a new data column.

                <TimePicker>
                    <label htmlFor={"realtimeTimePicker"}>Timestamp</label>
                    <input type="datetime-local" id={"realtimeTimePicker"} onChange={e => setDateTime(e.target.valueAsDate)} />
                </TimePicker>
            </>
        </Modal>
    );
}

function DataLogTable(props: DataLogProps) {

    const [timestampModalVisible, setTimestampModalVisible] = useState(false);

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
                <td key={index} onClick={formattedType === TIME ? () => setTimestampModalVisible(true) : undefined}>
                    {!!icon ? <Tooltip content={`Column detected as ${formattedType.name}`} direction="bottom">{icon}</Tooltip> : ""}{!data ? <EmptyData>-</EmptyData> : data}
                </td>
            );
        });

        rows.push(<TableRow key={i} discontinuous={discontinuous} header={!!rowData.isHeading}>{row}</TableRow>);
    }

    if (rows.length === 0) {
        return null;
    }

    return (
        <>
            {timestampModalVisible &&
                <TimestampModal />
            }
            <Table>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </>
    );
}

// memo it as we don't want to constantly re-render, performance can be hit
// for large data sets
export default React.memo(DataLogTable);