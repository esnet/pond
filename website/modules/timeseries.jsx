import React from "react/addons";
import Markdown from "react-markdown";
import Highlighter from "./highlighter";

var text = require("raw!../../docs/timeseries.md");

export default React.createClass({

    mixins: [Highlighter],

    getInitialState() {
        return {
            markdown: text
        };
    },

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <Markdown source={this.state.markdown}/>
                    </div>
                </div>
            </div>
        );
    }
});
