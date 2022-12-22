import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import React, { Suspense } from "react";
import { RiWifiOffLine } from "react-icons/ri";
import { PlotParams } from "react-plotly.js";

const Plot = React.lazy(() => import("react-plotly.js"));

const StyledPlot = styled(Plot)<{height?: number}>`
    width: 100%;
    //height: 100%;
    overflow: hidden;
    height: ${props => props.height && `${props.height}px`};
    max-height: ${props => props.height && `${props.height}px`};

    @media all and (display-mode: fullscreen) {
        height: 100%;
        max-height: 100%;
    }
`;

const LoadFailure = styled.div`
    text-align: center;
    color: #444;
    padding: 0.5em;
`;

const loadingKeyframes = keyframes`
    0%, 100% {
        opacity: 0.4;
    }

    50% {
        opacity: 1;
    }
`;

const Loading = styled.div`
    text-align: center;
    color: #444;
    animation: ${loadingKeyframes} 3s infinite;
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
                        <StyledPlot height={this.props.layout.height} {...this.props} />
                    </Suspense>
                }
            </>

        );
    }
}