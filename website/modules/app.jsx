/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import React from "react";
import Router from "react-router";

const {RouteHandler, Link} = Router;
const logo = document.createElement("img");
logo.src = require("../img/logo.png");

export default React.createClass({

    render() {
        return (
            <div className="row">

                <div className="col-sm-3 col-md-2 sidebar">
                    <p />
                    <ul className="nav nav-sidebar">
                        <li><Link to="intro">Introduction</Link></li>
                        <li><Link to="start">Getting started</Link></li>
                    </ul>

                    <div className="sidebar-heading">Examples</div>

                    <ul className="nav nav-sidebar">
                        <li><Link to="rollups">Rollups</Link></li>
                    </ul>

                    <div className="sidebar-heading">Structures</div>

                    <ul className="nav nav-sidebar">
                        <li><Link to="time">Time</Link></li>
                        <li><Link to="timerange">TimeRange</Link></li>
                        <li><Link to="index">Index</Link></li>
                        <li><Link to="events">Events</Link></li>
                        <li><Link to="timeseries">TimeSeries</Link></li>
                    </ul>

                    <div className="sidebar-heading">Processing</div>

                    <ul className="nav nav-sidebar">
                        <li><Link to="aggregators">Aggregators</Link></li>
                        <li><Link to="collectors">Collectors</Link></li>
                        <li><Link to="binners">Binners</Link></li>
                        <li><Link to="processor">Processor</Link></li>
                    </ul>

                    <div className="sidebar-heading">Links</div>

                    <ul className="nav nav-sidebar">
                        <li><a href="https://github.com/esnet/pond/">GitHub</a></li>
                        <li><a href="https://www.es.net/">ESnet</a></li>
                        <li><a href="http://software.es.net/">Open Source</a></li>
                    </ul>

                    <div className="sidebar-heading">Related Projects</div>

                    <ul className="nav nav-sidebar">
                        <li><a href="http://software.es.net/react-timeseries-charts/">Timeseries Charts</a></li>
                        <li><a href="http://software.es.net/react-network-diagrams/">Network Diagrams</a></li>
                    </ul>
                </div>

                <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
                    <RouteHandler />
                </div>

            </div>
        );
    }
});
