import React from "react/addons";
import Markdown from "react-markdown";
import Highlighter from "./highlighter";

var text = require("raw!../../docs/aggregators.md");

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
                <span className="label label-warning">Experimental</span>
                <hr />
                <div className="row">
                    <div className="col-md-12">
                        <Markdown source={this.state.markdown}/>
                    </div>
                </div>
            </div>
        );
    }
});
