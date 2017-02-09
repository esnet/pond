import React from "react";
import ReactDOM from "react-dom";
import { Router, IndexRoute, Route, useRouterHistory } from "react-router";
import { createHashHistory } from "history";

import "./website/index.css";

import App from "./website/App";

import Intro from "./website/guides/Intro";
import Start from "./website/guides/Start";
import Rollup from "./website/guides/Rollup";
import Missing from "./website/guides/Missing";
import Change from "./website/guides/Change";
import Counters from "./website/guides/Counters";
import Glossary from "./website/guides/Glossary";
import Processing from "./website/guides/Processing";

import TimeRange from "./website/api/TimeRange";
import Index from "./website/api/Index";
import Event from "./website/api/Event";
import TimeEvent from "./website/api/TimeEvent";
import TimeRangeEvent from "./website/api/TimeRangeEvent";
import IndexedEvent from "./website/api/IndexedEvent";
import Collection from "./website/api/Collection";
import TimeSeries from "./website/api/TimeSeries";
import Pipeline from "./website/api/Pipeline";

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

ReactDOM.render(
    <Router history={appHistory} onUpdate={() => window.scrollTo(0, 0)}>
        <Route path="/" component={App}>
            <IndexRoute component={Intro} />
            <Route path="start" component={Start} />
            <Route path="rollup" component={Rollup} />
            <Route path="missing" component={Missing} />
            <Route path="changelog" component={Change} />
            <Route path="glossary" component={Glossary} />
            <Route path="processing" component={Processing} />
            <Route path="counter" component={Counters} />
            <Route path="timerange" component={TimeRange} />
            <Route path="index" component={Index} />
            <Route path="event" component={Event} />
            <Route path="timeevent" component={TimeEvent} />
            <Route path="timerangeevent" component={TimeRangeEvent} />
            <Route path="indexedevent" component={IndexedEvent} />
            <Route path="collection" component={Collection} />
            <Route path="timeseries" component={TimeSeries} />
            <Route path="pipeline" component={Pipeline} />
        </Route>
    </Router>,
    document.getElementById("root")
);
