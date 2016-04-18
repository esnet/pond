/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

// Import the require hook for babel runtime
import "babel/register";

/* eslint max-len:0 */

import React from "react";
import { render } from "react-dom";
import { Router, IndexRoute, Route, browserHistory } from "react-router";

import App from "./app.jsx";
import Intro from "./intro.jsx";
import Start from "./start.jsx";
import Time from "./time.jsx";
import TimeRange from "./timerange.jsx";
import Index from "./index.jsx";
import Events from "./events.jsx";
import TimeSeries from "./timeseries.jsx";
import Rollup from "./rollup.jsx";
import Pipeline from "./pipeline.jsx";

render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Intro}/>
            <Route path="start" component={Start} />
            <Route path="rollups" component={Rollup} />
            <Route path="time" component={Time} />
            <Route path="timerange" component={TimeRange} />
            <Route path="index" component={Index} />
            <Route path="events" component={Events} />
            <Route path="timeseries" component={TimeSeries} />
            <Route path="pipeline" component={Pipeline} />
        </Route>
    </Router>
), document.getElementById("content"));
