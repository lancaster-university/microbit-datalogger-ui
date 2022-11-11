import React, { ReactNode } from "react";
import "./ErrorHandler.css";

interface ErrorHandlerProps {
    children?: ReactNode;
}

interface ErrorHandlerState {
    errorMessage?: string;
}

// error boundaries don't yet support functional components
export default class ErrorHandler extends React.Component<ErrorHandlerProps, ErrorHandlerState> {

    constructor(props: ErrorHandlerProps) {
        super(props);
        this.state = {};
    }

    static getDerivedStateFromError(error: Error): ErrorHandlerState {
        return { errorMessage: error.message };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log("CATCH");
        //this.setState({errorMessage: error.message});
    }

    render() {
        if (this.state.errorMessage) {
            return (
                <div className="react-error">
                    <h3>An error occurred displaying the data log</h3>
                    <p>Please try refreshing the page and trying again</p>
                    <p>Error message: {this.state.errorMessage}</p>
                </div>
            );
        }

        return (<>{this.props.children}</>);
    }
}