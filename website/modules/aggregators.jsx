import React from "react/addons";
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
    Resizable } from "@esnet/react-timeseries-charts";
import Markdown from "react-markdown-el";

const text = require("raw!../../docs/aggregators.md");
const sec = 1000;
const minute = 60 * sec;
const hours = 60 * minute;

export default React.createClass({

    displayName: "AggregatorDemo",

    getInitialState() {
        return {
            time: new Date(2015, 0, 1),
            events: [],
            fiveMinuteAvg: [],
            hourlyAvg: []
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

        this.fiveMinuteAggregator = new Aggregator("5m", avg, (index, event) => {
            let events = this.state.fiveMinuteAvg;
            events.push(event);
            this.setState({fiveMinuteAvg: events});
        });

        this.hourlyAggregator = new Aggregator("1h", avg, (index, event) => {
            let events = this.state.hourlyAvg;
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

        }, 200);
    },

    componentWillUnmount() {
        clearInterval(this.interval);
    },

    render() {
        const latestTime = `${this.state.time}`;

        const barStyle = {
            value: {
                normal: {fill: "#619F3A", opacity: 0.2},
                highlight: {fill: "rgb(113, 187, 67)"},
                selected: {fill: "#436D28"}
            }
        };

        const scatterStyle = {
            color: "#CC862A",
            opacity: 0.5
        };

        // Create a TimeSeries for our raw, 5min and hourly events
        const eventSeries = new TimeSeries({name: "raw", events: this.state.events});
        const fiveMinuteSeries = new TimeSeries({name: "five minute avg", events: this.state.fiveMinuteAvg});
        const hourlySeries = new TimeSeries({name: "hourly", events: this.state.hourlyAvg});

        // Timerange for the chart axis
        const beginTime = new Date(2015, 0, 1);
        const endTime = new Date(this.state.time.getTime() + minute);
        const timeRange = new TimeRange(beginTime, endTime);

        // Charts (after a certain amount of time, just show hourly rollup)
        let charts;
        if (timeRange.duration() > 24 * hours) {
            charts = (
                <Charts>
                    <ScatterChart axis="y" series={eventSeries} style={scatterStyle} />
                    <BarChart axis="y" series={hourlySeries} style={barStyle} columns={["value"]} />
                </Charts>
            );
        } else {
            charts = (
                <Charts>
                    <ScatterChart axis="y" series={eventSeries} style={scatterStyle} />
                    <BarChart axis="y" series={fiveMinuteSeries} style={barStyle} columns={["value"]} />
                    <BarChart axis="y" series={hourlySeries} style={barStyle} columns={["value"]} />
                </Charts>
            );
        }

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
                                    <YAxis id="y" label="Value" min={0} max={1500} width="70" type="linear"/>
                                    {charts}
                                </ChartRow>
                            </ChartContainer>
                        </Resizable>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <Markdown text={text}/>
                    </div>
                </div>
            </div>
        );
    }
});
