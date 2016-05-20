/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
/* eslint max-len:0 */

import React from "react";
import { render } from "react-dom";
import { Router, IndexRoute, Route, useRouterHistory } from "react-router";
import createBrowserHistory from "history/lib/createBrowserHistory";
import useScroll from "scroll-behavior/lib/useStandardScroll";

const browserHistory = useScroll(useRouterHistory(createBrowserHistory))();

import App from "./app.jsx";
import Intro from "./intro.jsx";
import Start from "./start.jsx";
import TimeRange from "./timerange.jsx";
import Index from "./index.jsx";
import Event from "./event.jsx";
import TimeRangeEvent from "./timerangeevent.jsx";
import IndexedEvent from "./indexedevent.jsx";
import Collection from "./collection.jsx";
import TimeSeries from "./timeseries.jsx";
import Pipeline from "./pipeline.jsx";

render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Intro}/>
            <Route path="start" component={Start} />
            <Route path="timerange" component={TimeRange} />
            <Route path="index" component={Index} />
            <Route path="event" component={Event} />
            <Route path="timerangeevent" component={TimeRangeEvent} />
            <Route path="indexedevent" component={IndexedEvent} />
            <Route path="collection" component={Collection} />
            <Route path="timeseries" component={TimeSeries} />
            <Route path="pipeline" component={Pipeline} />
        </Route>
    </Router>
), document.getElementById("content"));
