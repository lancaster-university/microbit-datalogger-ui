import { Data } from 'plotly.js';
import { timestampRegex, visualisationConfig, VisualisationProps, VisualisationType } from "./App";
import "./LineGraphVisualisation.css";
import { RiLineChartLine } from "react-icons/ri";
import Warning from "./Warning";
import React, { Suspense } from 'react';

const Plot = React.lazy(() => import("react-plotly.js"));

function LineGraph({ log }: VisualisationProps) {
    const splitLogs = log.split((row, prevRow) => !row.isHeading && !!prevRow && Number(row.data[0]) < Number(prevRow.data[0]));

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
        {splitLogs.map(log => {
            const graphX = log.dataForHeader(0, true);

            const data: Data[] = log.headers.slice(1).map((header, index): Data => {
                return {
                    name: header,
                    type: "scattergl",
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

                            layout={{ height: 500, margin: { l: 60, r: 60, t: 30, b: 70 }, xaxis: { title: log.headers[0] } }}
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

        if (!timestampRegex.test(log.headers[0])) {
            return "Timestamps must be enabled when logging data.";
        }

        return null;
    },
    generate: (props) => <LineGraph {...props} />
};

export default LineGraphVisualisation;