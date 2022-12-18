import { Data } from "plotly.js";
import React from "react";
import { Suspense } from "react";
import { RiBarChartLine } from "react-icons/ri";
import { layoutConfig, visualisationConfig, VisualisationProps, VisualisationType } from "./App";
import ExpandingCard from "./ExpandingCard";
import { ReactComponent as TooltipImage } from "./resources/tally.svg";

const Plot = React.lazy(() => import("react-plotly.js"));

function Tally({ log }: VisualisationProps) {
    const values: { [header: string]: number } = {};

    log.headers.forEach(header => {
        const total = log.dataForHeader(header, true).reduce((total, val) => total + (!val || Number.isNaN(val) ? 0 : Number.parseFloat(val)), 0);
        values[header] = total;
    })

    const valueArray = Object.keys(values).map(key => values[key]);

    const data: Data = {
        type: "bar",
        x: Object.keys(values),
        y: valueArray,
        text: valueArray.map(String),
        hoverinfo: "none",
        marker: {
            color: "#3EB6FD"
        }
    };

    return (
        <ExpandingCard title={<><RiBarChartLine/>Totals of each column</>} displayFullscreenButton={true}>
            <Suspense fallback={<div className="loading">Loading...</div>}>
                <Plot
                    data={[data]}

                    className="graph"

                    layout={{ ...layoutConfig, height: 500, xaxis: { automargin: true }, yaxis: { automargin: true } }}
                    config={visualisationConfig}
                />
            </Suspense>
        </ExpandingCard>
    );
}

const MapVisualisation: VisualisationType = {
    name: "Tally",
    description: "Counts up the total of each column and displays it in a bar graph",
    tooltipImage: <TooltipImage />,
    icon: <RiBarChartLine />,
    availablityError: log => {
        return null;
    },
    generate: (props) => <Tally {...props} />
};

export default MapVisualisation;