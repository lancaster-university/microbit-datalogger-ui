import { Config, Data, Layout } from "plotly.js";
import { layoutConfig, visualisationConfig, VisualisationProps, VisualisationType } from "./App";
import { RiLineChartLine } from "react-icons/ri";
import Warning from "./Warning";
import { TIME } from "./FieldTypes";
import { ReactComponent as TooltipImage } from "./resources/line.svg";
import ExpandingCard from "./ExpandingCard";
import PlotWrapper from "./PlotWrapper";
import CardStack from "./CardStack";

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

    const layout = { ...layoutConfig, height: 500, xaxis: { title: { text: log.headers[timestampFieldIndex], standoff: 15 }, automargin: true }, yaxis: { automargin: true } };

    return (
        <CardStack>
            {splitLogs.length > 1 &&

                <Warning title="Split graphs">
                    <div>Your data has been split into {splitLogs.length} graphs as multiple time ranges have been found in the logged data. This may happen if you unplug or reset your micro:bit in between logging data.</div>
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
                            color: colors[(index) % colors.length],
                        },
                        marker: {
                            symbol: (index) % 24,
                        },
                    };
                }
                );

                let rowFrom = currentRow + 1;
                let rowTo = (currentRow += log.data.length);

                return <LineGraphElement key={rowFrom} rowFrom={rowFrom} rowTo={rowTo} data={data} layout={layout} config={visualisationConfig} />
            })}
        </CardStack>);
};

interface LineGraphElementProps {
    data: Data[];
    layout: Partial<Layout>;
    config: Partial<Config>;
    rowFrom: number;
    rowTo: number;
}

function LineGraphElement(props: LineGraphElementProps) {
    return (
        <ExpandingCard title={<><RiLineChartLine />Rows {props.rowFrom} - {props.rowTo}</>} displayFullscreenButton={true} displayExpandButton={true}>
            <PlotWrapper
                data={props.data}
                layout={props.layout}
                config={props.config}
            />
        </ExpandingCard>
    );
}

const LineGraphVisualisation: VisualisationType = {
    name: "Line Graph",
    description: "Creates a graph mapping a time series against other columns in your data log",
    tooltipImage: <TooltipImage />,
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