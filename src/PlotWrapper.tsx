import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import React, { Suspense } from "react";
import { RiWifiOffLine } from "react-icons/ri";
import { PlotParams } from "react-plotly.js";

const Plot = React.lazy(() => import("react-plotly.js"));

const StyledPlot = styled(Plot)`
width: 100%;
height: 100%;
overflow: hidden;
`;

const LoadFailure = styled.div`
    text-align: center;
    color: #444;
    padding: 0.5em;
`;

const loadingKeyframes = keyframes`
    0% {
        opacity: 0.8;
    }

    50% {
        opacity: 1;
    }
`;

const Loading = styled.div`
    text-align: center;
    color: #444;
    animation: ${loadingKeyframes} 5s infinite;
`;

export default class PlotWrapper extends React.Component<PlotParams, { failedToLoad: boolean }> {

    constructor(props: PlotParams) {
        super(props);

        this.state = { failedToLoad: false };
    }

    componentDidCatch(): void {
        this.setState({ failedToLoad: true });
    }

    render(): React.ReactNode {
        return (
            <>
                {this.state.failedToLoad &&
                    <LoadFailure><RiWifiOffLine /> Failed to load the graph. Make sure you're connected to the internet and then refresh the page to retry.</LoadFailure>
                }

                {!this.state.failedToLoad &&
                    <Suspense fallback={<Loading>Loading...</Loading>}>
                        <StyledPlot {...this.props} />
                    </Suspense>
                }
            </>

        );
    }
}

/*export default */