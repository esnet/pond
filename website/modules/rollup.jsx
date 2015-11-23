/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Highlighter from "./highlighter";
import Markdown from "react-markdown";
import Ring from "ringjs";

import {TimeSeries} from "../../src/series";
import TimeRange from "../../src/range";
import {Event} from "../../src/event";
import {avg} from "../../src/functions";
import Aggregator from "../../src/Aggregator";
import {
    ChartContainer,
    ChartRow,
    Charts,
    YAxis,
    ScatterChart,
    BarChart,
    Resizable } from "react-timeseries-charts";

const text = require("raw!../../docs/rollup.md");

const sec = 1000;
const minute = 60 * sec;
const hours = 60 * minute;
const INTERVAL_RATE = 200;

export default React.createClass({

    displayName: "AggregatorDemo",

    mixins: [Highlighter],

    getInitialState() {
        return {
            markdown: text,
            time: new Date(2015, 0, 1),
            events: new Ring(200),
            fiveMinuteAvg: new Ring(100),
            hourlyAvg: new Ring(100)
        };
    },

    getNewEvent(t) {
        const base = Math.sin(t.getTime() / 10000000) * 350 + 500;
        return new Event(t, parseInt(base + Math.random() * 1000, 10));
    },

    componentDidMount() {

        //
        // Setup our aggregators
        //

        this.fiveMinuteAggregator =
            new Aggregator("5m", avg, (index, event) => {
                const events = this.state.fiveMinuteAvg;
                events.push(event);
                this.setState({fiveMinuteAvg: events});
            });

        this.hourlyAggregator = new Aggregator("1h", avg, (index, event) => {
            const events = this.state.hourlyAvg;
            events.push(event);
            this.setState({hourlyAvg: events});
        });

        //
        // Setup our interval to advance the time and generate raw events
        //

        const increment = minute;
        this.interval = setInterval(() => {
            const t = new Date(this.state.time.getTime() + increment);
            const event = this.getNewEvent(t);

            // Raw events
            const newEvents = this.state.events;
            newEvents.push(event);
            this.setState({time: t, events: newEvents});

            // Let our aggregators process the event
            this.fiveMinuteAggregator.addEvent(event);
            this.hourlyAggregator.addEvent(event);

        }, INTERVAL_RATE);
    },

    componentWillUnmount() {
        clearInterval(this.interval);
    },

    render() {
        const latestTime = `${this.state.time}`;

        const fiveMinuteStyle = {
            value: {
                normal: {fill: "#619F3A", opacity: 0.2},
                highlight: {fill: "619F3A", opacity: 0.5},
                selected: {fill: "619F3A", opacity: 0.5}
            }
        };

        const hourlyStyle = {
            value: {
                normal: {fill: "#80AD62", opacity: 0.2},
                highlight: {fill: "#80AD62", opacity: 0.5},
                selected: {fill: "#80AD62", opacity: 0.5}
            }
        };

        const scatterStyle = {
            color: "steelblue",
            opacity: 0.5
        };

        // Create a TimeSeries for our raw, 5min and hourly events
        const eventSeries =
            new TimeSeries({name: "raw", events: this.state.events.toArray()});
        const fiveMinuteSeries =
            new TimeSeries({
                name: "five minute avg",
                events: this.state.fiveMinuteAvg.toArray()
            });
        const hourlySeries =
            new TimeSeries({
                name: "hourly",
                events: this.state.hourlyAvg.toArray()
            });

        // Timerange for the chart axis
        const initialBeginTime = new Date(2015, 0, 1);
        const timeWindow = 3 * hours;

        let beginTime;
        const endTime = new Date(this.state.time.getTime() + minute);
        if (endTime.getTime() - timeWindow < initialBeginTime.getTime()) {
            beginTime = initialBeginTime;
        } else {
            beginTime = new Date(endTime.getTime() - timeWindow);
        }
        const timeRange = new TimeRange(beginTime, endTime);

        // Charts (after a certain amount of time, just show hourly rollup)
        const charts = (
            <Charts>
                <BarChart
                    axis="y"
                    series={fiveMinuteSeries}
                    style={fiveMinuteStyle}
                    columns={["value"]} />
                <BarChart
                    axis="y"
                    series={hourlySeries}
                    style={hourlyStyle}
                    columns={["value"]} />
                <ScatterChart
                    axis="y"
                    series={eventSeries}
                    style={scatterStyle} />
            </Charts>
        );

        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        Latest: {latestTime}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <Resizable>
                            <ChartContainer timeRange={timeRange}>
                                <ChartRow height="150">
                                    <YAxis
                                        id="y"
                                        label="Value"
                                        min={0} max={1500}
                                        width="70" type="linear"/>
                                    {charts}
                                </ChartRow>
                            </ChartContainer>
                        </Resizable>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <Markdown source={this.state.markdown}/>
                    </div>
                </div>
            </div>
        );
    }
});
