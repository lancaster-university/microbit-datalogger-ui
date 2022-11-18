import { Data } from 'plotly.js';
import { timestampRegex, visualisationConfig, VisualisationProps, VisualisationType } from "./App";
import "./LineGraphVisualisation.css";
import { RiLineChartLine } from "react-icons/ri";
import Warning from "./Warning";
import React, { Suspense } from 'react';
import { TIME } from './FieldTypes';

const Plot = React.lazy(() => import("react-plotly.js"));

const MAX_GRAPHS = 5; // performance! todo: make the user aware if unable to visualise all the data?

/**
 * Line graph visualisation. Available for data logs which have a timestamp heading,
 * and at least 1 other column.
 */
function LineGraph({ log }: VisualisationProps) {
    const timestampFieldIndex = log.findFieldIndex(TIME);

    let splitLogs = log.split((row, prevRow) => !row.isHeading && !!prevRow && Number(row.data[timestampFieldIndex]) < Number(prevRow.data[timestampFieldIndex]));

    const truncated = splitLogs.length > MAX_GRAPHS;

    if (truncated) {
        splitLogs = splitLogs.slice(0, MAX_GRAPHS);
    }

    const colors = [
        // micro:bit brand colors
        "rgb(0, 200, 0)",
        "rgb(62, 182, 253)",
        "rgb(205, 3, 101)",
        "rgb(231, 100, 92)",
        "rgb(108, 75, 193)",
        "rgb(123, 205, 194)",
    ];

    let currentRow = 0;

    return (<div className="line-graph-vis-container">
        {splitLogs.length > 0 &&

            <Warning title="Split graphs">
                <div>Your data has been split into multiple graphs as multiple time ranges have been found in the logged data. This may happen if you unplug or reset your micro:bit in between logging data.</div>
            </Warning>

        }
        {splitLogs.map(log => { // map each time range to a plotly graph
            const graphX = log.dataForHeader(timestampFieldIndex, true);

            const data: Data[] = log.headers.filter((_, ix) => ix !== timestampFieldIndex).map((header, index): Data => {
                return {
                    name: header,
                    type: "scatter",
                    mode: "lines+markers",
                    x: graphX,
                    y: log.dataForHeader(header, true),
                    line: {
                        color: colors[(index - 1) % colors.length],
                    },
                    marker: {
                        // There are more than this but they look increasingly odd.
                        symbol: (index - 1) % 24,
                    },
                };
            }
            );

            let rowFrom = currentRow + 1;
            let rowTo = (currentRow += log.data.length);

            return (
                <div key={rowFrom}>
                    <div className="graph-span">Rows {rowFrom} - {rowTo}</div>
                    <Suspense fallback={<div className="loading">Loading...</div>}>
                        <Plot
                            data={data}

                            className="graph"

                            layout={{ height: 500, margin: { l: 60, r: 60, t: 30, b: 70 }, xaxis: { title: log.headers[timestampFieldIndex] } }}
                            config={visualisationConfig}
                        />
                    </Suspense>
                </div>);
        })}
    </div>);
};

const LineGraphVisualisation: VisualisationType = {
    name: "Line Graph",
    icon: <RiLineChartLine />,
    availablityError: log => {
        if (log.headers.length < 2) {
            return "Requires two or more columns. Timestamps must be enabled.";
        }

        const timestampColumn = log.findFieldIndex(TIME);

        if (timestampColumn === -1) {
            return "Timestamps must be enabled when logging data.";
        }

        return null;
    },
    generate: (props) => <LineGraph {...props} />
};

export default LineGraphVisualisation;