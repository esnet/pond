//Import the require hook for babel runtime
import "babel/register";

import React from "react/addons";
import Router from "react-router";

import App from "./app.jsx";
import Intro from "./intro.jsx";
import Start from "./start.jsx";

import Time from "./time.jsx";
import TimeRange from "./timerange.jsx";
import Index from "./index.jsx";

import Events from "./events.jsx";

import Series from "./series.jsx";
import TimeSeries from "./timeseries.jsx";

import Aggregators from "./aggregators.jsx";
import Collectors from "./collectors.jsx";
import Binners from "./binners.jsx";

const {Route, DefaultRoute, RouteHandler, Link} = Router;

const routes = (
    <Route path="/" handler={App}>
        <DefaultRoute name="intro" handler={Intro} />
        <Route name="start" handler={Start} />
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

Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.getElementById("content"));
});
