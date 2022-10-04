import { visualisationConfig, VisualisationProps, VisualisationType } from "./App";
import { Suspense, useState } from "react";
import React from "react";
import "./MapVisualisation.css";
import { Data, Layout } from "plotly.js";
import { RiMap2Line } from "react-icons/ri";
import Warning from "./Warning";

const Plot = React.lazy(() => import("react-plotly.js"));

const latitudeColumn = "Latitude";
const longitudeColumn = "Longitude";

function Map({ log }: VisualisationProps) {

    const [mapConsent, setMapConsent] = useState(() => window.localStorage.getItem("open-street-map-consent") === "true");
    const [invalidCoords, setInvalidCoords] = useState(false);

    const [lats] = useState(() => log.dataForHeader(latitudeColumn, true).map(elem => Number(elem)).map(elem => {
        if (elem < -90 || elem > 90) {
            setInvalidCoords(true);
            return Math.min(90, Math.max(-90, elem));
        }

        return elem;
    }));

    const [lons] = useState(() => log.dataForHeader(longitudeColumn, true).map(elem => Number(elem)).map(elem => {
        if (elem < -180 || elem > 180) {
            setInvalidCoords(true);
            return Math.min(180, Math.max(-180, elem));
        }

        return elem;
    }));

    const [layout] = useState<Partial<Layout>>(() => ({
        dragmode: "zoom",
        mapbox: {
            style: "open-street-map",
            center: { lat: lats.length === 0 ? 0 : lats[0], lon: lons.length === 0 ? 0 : lons[0] },
            zoom: 16
        },
        height: 600,
        margin: { r: 0, t: 0, b: 0, l: 0 },
        uirevision: "true"
    }));

    if (!mapConsent) {
        return (
            <div id="map-privacy-notice">
                <div>
                    <h3>Using the map view requires accessing data from OpenStreetMap</h3>
                    You can view their privacy policy <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy">here</a>.
                </div>

                <div className="modal-buttons">
                    <button onClick={() => {
                        window.localStorage.setItem("open-street-map-consent", "true");
                        setMapConsent(true);
                    }}>I'm OK with this</button>
                </div>
            </div>
        );
    }

    const data: Data = {
        type: "scattermapbox",
        lat: lats,
        lon: lons,
        text: lats.map((_, index) => log.headers.filter(header => header !== latitudeColumn && header !== longitudeColumn).map(heading => heading + ": " + log.dataForHeader(heading, true)[index]).join(", ")),
        marker: { color: "rgb(205, 3, 101)", size: 9 },
        mode: "lines+markers",
        line: {
            width: 3,
            color: [...Array(Math.max(lats.length - 1, 0)).fill("red"), "green"]
        }
    };

    return (
        <Suspense fallback={<div className="loading">Loading...</div>}>
            <div className="map-vis-container">
                {invalidCoords &&
                    <Warning title="Invalid co-ordinate data">
                        <div>Some of the fields within the graph have been rounded as they contained invalid latitude or longitude values</div>
                    </Warning>
                }

                <Plot className="graph map" data={[data]} layout={layout} config={visualisationConfig} />
            </div>
        </Suspense>
    );
}

const MapVisualisation: VisualisationType = {
    name: "Map",
    icon: <RiMap2Line />,
    availablityError: log => {
        const lats = log.dataForHeader(latitudeColumn, true);
        const lngs = log.dataForHeader(longitudeColumn, true);

        if (lats.length === 0 || lngs.length === 0) {
            return "Latitude and Longitude columns are required.";
        }

        if (lats.length !== lngs.length) {
            return "Latitude and Longitude columns need to be the same length.";
        }

        // check all latitude and longitude values at once
        if ([...lats, ...lngs].every(elem => isNaN(Number(elem)))) {
            return "Latitude and Longitude fields need to be numeric.";
        }

        return null;
    },
    generate: (props) => <Map {...props} />
};

export default MapVisualisation;