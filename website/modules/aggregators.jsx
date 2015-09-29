import React from "react/addons";
import Markdown from "react-markdown-el";

var text = require("raw!../../docs/aggregators.md");

export default React.createClass({

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <Markdown text={text}/>
                </div>
            </div>
        );
    }
});
