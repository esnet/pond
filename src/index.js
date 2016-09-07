import React from "react";
import ReactDOM from "react-dom";
import { Router, IndexRoute, Route, hashHistory } from "react-router";

import "./website/index.css";

import App from "./website/App";

import Intro from "./website/guides/Intro";
import Start from "./website/guides/Start";
import Rollup from "./website/guides/Rollup";
import Missing from "./website/guides/Missing";
import Change from "./website/guides/Change";

import TimeRange from "./website/modules/TimeRange";
import Index from "./website/modules/Index";
import Event from "./website/modules/Event";
import TimeRangeEvent from "./website/modules/TimeRangeEvent";
import IndexedEvent from "./website/modules/IndexedEvent";
import Collection from "./website/modules/Collection";
import TimeSeries from "./website/modules/TimeSeries";
import Pipeline from "./website/modules/Pipeline";

ReactDOM.render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Intro} />
            <Route path="start" component={Start} />
            <Route path="rollup" component={Rollup} />
            <Route path="missing" component={Missing} />
            <Route path="changelog" component={Change} />

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
), document.getElementById("root"));
