import React, { Component } from "react";
import { withRouter } from "react-router-dom";

class ScrollToTop extends Component {
    componentDidMount() {
        console.log(" ^^^^^");
        window.scrollTo(0, 0);
    }
    componentWillReceiveProps(prevProps) {
        console.log(" ^^");
        if (this.props.location !== prevProps.location) {
            console.log(" ^^^^^");
            window.scrollTo(0, 0);
        }
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}

export default withRouter(ScrollToTop);
