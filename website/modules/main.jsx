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

import React from "react";
import Router from "react-router";

import App from "./app.jsx";
import Intro from "./intro.jsx";
import Start from "./start.jsx";
import Time from "./time.jsx";
import TimeRange from "./timerange.jsx";
import Index from "./index.jsx";
import Events from "./events.jsx";
import TimeSeries from "./timeseries.jsx";
import Aggregators from "./aggregators.jsx";
import Collectors from "./collectors.jsx";
import Binners from "./binners.jsx";
import Rollup from "./rollup.jsx";

const { Route, DefaultRoute } = Router;

const routes = (
    <Route path="/" handler={App}>
        <DefaultRoute name="intro" handler={Intro} />
        <Route name="start" handler={Start} />
        <Route name="rollups" handler={Rollup} />
        <Route name="time" handler={Time} />
        <Route name="timerange" handler={TimeRange} />
        <Route name="index" handler={Index} />
        <Route name="events" handler={Events} />
        <Route name="timeseries" handler={TimeSeries} />
        <Route name="aggregators" handler={Aggregators} />
        <Route name="collectors" handler={Collectors} />
        <Route name="binners" handler={Binners} />
    </Route>
);

Router.run(routes, Handler => {
    React.render(<Handler/>, document.getElementById("content"));
});
