import { visualisationConfig, VisualisationProps, VisualisationType } from "./App";
import { Suspense, useState } from "react";
import React from "react";
import "./MapVisualisation.css";
import { Data, Layout, PlotMarker } from "plotly.js";
import { RiMap2Line } from "react-icons/ri";
import Warning from "./Warning";
import { LATITUDE, LONGITUDE } from "./FieldTypes";
import { ReactComponent as TooltipImage } from "./resources/map.svg";

const Plot = React.lazy(() => import("react-plotly.js"));

/**
 * Map visualisation. Available for logs with a Latitude and Longitude column. The
 * map view can also colour-code any column of the data log. e.g. temperature could
 * be highlighted, where users could see at a glance which places are hotter or colder
 * by the colour of their markers on the map.
 * 
 * Uses OpenStreetMap, so confirms with users whether they consent to loading any map
 * tiles before any requests are sent to their servers.
 */
function Map({ log }: VisualisationProps) {

    const [mapConsent, setMapConsent] = useState(() => window.localStorage.getItem("open-street-map-consent") === "true");
    const [invalidCoords, setInvalidCoords] = useState(false);

    const [visualiseColumn, setVisualiseColumn] = useState<string | null>(() => {
        const firstNonLatLongHeader = log.headers.findIndex(header => !LATITUDE.validator.test(header) && !LONGITUDE.validator.test(header));
        return firstNonLatLongHeader === -1 ? log.headers[0] : log.headers[firstNonLatLongHeader];
    });

    const [lats] = useState(() => log.dataForHeader(log.findFieldIndex(LATITUDE), true).map(elem => Number(elem)).map(elem => {
        if (elem < -90 || elem > 90) {
            setInvalidCoords(true);
            return Math.min(90, Math.max(-90, elem));
        }

        return elem;
    }));

    const [lons] = useState(() => log.dataForHeader(log.findFieldIndex(LONGITUDE), true).map(elem => Number(elem)).map(elem => {
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
        margin: { r: 0, t: 0, b: 0, l: 0 }
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

    let marker: Partial<PlotMarker>;

    if (visualiseColumn === null) {
        marker = { color: "rgb(205, 3, 101)", size: 9 };
    } else {
        const scl: Array<[number, string]> = [[0, 'rgb(150,0,90)'], [0.125, 'rgb(0, 0, 200)'], [0.25, 'rgb(0, 25, 255)'], [0.375, 'rgb(0, 152, 255)'], [0.5, 'rgb(44, 255, 150)'], [0.625, 'rgb(151, 255, 0)'], [0.75, 'rgb(255, 234, 0)'], [0.875, 'rgb(255, 111, 0)'], [1, 'rgb(255, 0, 0)']];

        const row = log.dataForHeader(visualiseColumn, true).map(row => row === null ? 0 : Number(row));

        const max = row.reduce((max, curr) => curr > max ? curr : max);
        const min = row.reduce((min, curr) => curr < min ? curr : min, max);

        marker = {
            color: row,
            colorscale: scl,
            cmin: min,
            cmax: max,
            reversescale: true,
            size: 9,
            colorbar: {
                thickness: 10,
                titleside: 'right',
                outlinecolor: 'transparent',
                title: visualiseColumn,
                xpad: 0,
                ypad: 10
            }
        };
    }

    const data: Data = {
        type: "scattermapbox",
        lat: lats,
        lon: lons,
        text: lats.map((_, index) => log.headers.filter(header => !LATITUDE.validator.test(header) && !LONGITUDE.validator.test(header)).map(heading => heading + ": " + log.dataForHeader(heading, true)[index]).join(", ")),
        marker,
        mode: "markers"
        /*mode: "lines+markers",
        line: {
            width: 3,
            color: "red"
        }*/
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

                <div className="graph-config">
                    <label htmlFor="map-column-selector">Column to highlight</label>
                    <select id="map-column-selector" placeholder="Set column to visualise" onChange={e => setVisualiseColumn(e.target.value)}>
                        {log.headers.map(h =>
                            <option key={h} value={h} selected={visualiseColumn === h}>{h}</option>
                        )}
                    </select>
                </div>
            </div>
        </Suspense>
    );
}

const MapVisualisation: VisualisationType = {
    name: "Map",
    description: "Visualises geographic data using markers on a map",
    tooltipImage: <TooltipImage/>,
    icon: <RiMap2Line />,
    availablityError: log => {
        const lats = log.dataForHeader(log.findFieldIndex(LATITUDE), true);
        const lngs = log.dataForHeader(log.findFieldIndex(LONGITUDE), true);

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