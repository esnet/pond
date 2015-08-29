import React from "react/addons";
import _ from "underscore";

import Markdown from "react-markdown-el";

var text = require("raw!../../docs/series.md");

export default React.createClass({

    render: function() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <Markdown text={text}/>
                    </div>
                </div>
            </div>
        );
    }
});
