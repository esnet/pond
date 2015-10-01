"use strict";

var React = require("react/addons");
var Router = require("react-router");
var {RouteHandler,
     Link} = Router;

require("../styles/app.css");
var logo = document.createElement("img");
logo.src = require("../img/logo.png");

export default React.createClass({

    render: function() {

    var sidebarStyle = {
        borderRightStyle: "solid",
        borderRightColor: "#F2F1F1",
        borderRightWidth: 1
    };

    return (
        <div>
            <div className="row">
                <div className="col-md-2">
                    <img style={{float: "right"}} className="main-image" src={logo.src} width={80}/>
                </div>
                <div className="col-md-10">
                    <h2>Pond: Timeseries Library</h2>
                </div>
            </div>

          <hr />

          <div className="row">

            <div className="col-md-2" style={sidebarStyle}>
                <div className="docs-sidebar">
                    <ul className="docs-sidenav nav">
                        <li><Link to="intro">Introduction</Link></li>
                        <li><Link to="start">Getting started</Link></li>

                        <hr />

                        Examples:
                        <li><Link to="rollups">Rollups</Link></li>

                        <hr />

                        API:
                        <li><Link to="time">Time</Link></li>
                        <li><Link to="timerange">TimeRange</Link></li>
                        <li><Link to="index">Index</Link></li>
                        <li><Link to="events">Events</Link></li>
                        <li><Link to="timeseries">TimeSeries</Link></li>
                        <li><Link to="aggregators">Aggregators</Link></li>
                        <li><Link to="collectors">Collectors</Link></li>
                        <li><Link to="binners">Binners</Link></li>

                        <hr />

                        Links:
                        <li><a href="https://github.com/esnet/pond/">GitHub</a></li>
                        <li><a href="https://www.es.net/">ESnet</a></li>
                        <li><a href="http://software.es.net/">Open Source</a></li>

                        <hr />

                        Related Projects:
                        <li><a href="http://software.es.net/react-timeseries-charts/">Timeseries Charts</a></li>
                        <li><a href="http://software.es.net/react-network-diagrams/">Network Diagrams</a></li>

                    </ul>
                </div>
            </div>

            <div className="col-md-10">
              <RouteHandler />
            </div>

          </div>
      </div>
    );
  }
});
