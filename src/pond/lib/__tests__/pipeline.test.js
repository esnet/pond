/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import Collection from "../collection";
import CollectionOut from "../io/collectionout";
import EventOut from "../io/eventout";
import IndexedEvent from "../indexedevent";
import Stream from "../io/stream";
import TimeEvent from "../timeevent";
import TimeRange from "../timerange";
import TimeRangeEvent from "../timerangeevent";
import TimeSeries from "../timeseries";
import { Pipeline } from "../pipeline";
import {
    keep,
    avg,
    sum,
    median,
    min,
    max,
    percentile
} from "../base/functions";

const EVENT_LIST = [
    new TimeEvent(new Date("2015-04-22T03:30:00Z"), { in: 1, out: 2 }),
    new TimeEvent(new Date("2015-04-22T03:31:00Z"), { in: 3, out: 4 }),
    new TimeEvent(new Date("2015-04-22T03:32:00Z"), { in: 5, out: 6 })
];

const TRAFFIC_DATA = {
    name: "traffic",
    columns: ["time", "value"],
    points: [
        [1409529600000, 80],
        [1409533200000, 88],
        [1409536800000, 52],
        [1409540400000, 80],
        // < 50
        [1409544000000, 26],
        //1
        [1409547600000, 37],
        //2
        [1409551200000, 6],
        //3
        [1409554800000, 32],
        //4
        [1409558400000, 69],
        [1409562000000, 21],
        //5
        [1409565600000, 6],
        //6
        [1409569200000, 54],
        [1409572800000, 88],
        [1409576400000, 41],
        //7
        [1409580000000, 35],
        //8
        [1409583600000, 43],
        //9
        [1409587200000, 84],
        [1409590800000, 32],
        //10  avg= (26 + 37 + 6 + 32 + 21 + 6 + 41 + 35 + 43 + 32)/10 = 27.9
        [1409594400000, 41],
        [1409598000000, 57],
        [1409601600000, 27],
        [1409605200000, 50],
        [1409608800000, 13],
        [1409612400000, 63],
        [1409616000000, 58],
        [1409619600000, 80],
        [1409623200000, 59],
        [1409626800000, 96],
        [1409630400000, 2],
        [1409634000000, 20],
        [1409637600000, 64],
        [1409641200000, 7],
        [1409644800000, 50],
        [1409648400000, 88],
        [1409652000000, 34],
        [1409655600000, 31],
        [1409659200000, 16],
        [1409662800000, 38],
        [1409666400000, 94],
        [1409670000000, 78],
        [1409673600000, 86],
        [1409677200000, 13],
        [1409680800000, 34],
        [1409684400000, 29],
        [1409688000000, 48],
        [1409691600000, 80],
        [1409695200000, 30],
        [1409698800000, 15],
        [1409702400000, 62],
        [1409706000000, 66],
        [1409709600000, 44],
        [1409713200000, 94],
        [1409716800000, 78],
        [1409720400000, 29],
        [1409724000000, 21],
        [1409727600000, 4],
        [1409731200000, 83],
        [1409734800000, 15],
        [1409738400000, 89],
        [1409742000000, 53],
        [1409745600000, 70],
        [1409749200000, 41],
        [1409752800000, 47],
        [1409756400000, 30],
        [1409760000000, 68],
        [1409763600000, 89],
        [1409767200000, 29],
        [1409770800000, 17],
        [1409774400000, 38],
        [1409778000000, 67],
        [1409781600000, 75],
        [1409785200000, 89],
        [1409788800000, 47],
        [1409792400000, 82],
        [1409796000000, 33],
        [1409799600000, 67],
        [1409803200000, 93],
        [1409806800000, 86],
        [1409810400000, 97],
        [1409814000000, 19],
        [1409817600000, 19],
        [1409821200000, 31],
        [1409824800000, 56],
        [1409828400000, 19],
        [1409832000000, 43],
        [1409835600000, 29],
        [1409839200000, 72],
        [1409842800000, 27],
        [1409846400000, 21],
        [1409850000000, 88],
        [1409853600000, 18],
        [1409857200000, 30],
        [1409860800000, 46],
        [1409864400000, 34],
        [1409868000000, 31],
        [1409871600000, 20],
        [1409875200000, 45],
        [1409878800000, 17],
        [1409882400000, 24],
        [1409886000000, 84],
        [1409889600000, 6],
        [1409893200000, 91],
        [1409896800000, 82],
        [1409900400000, 71],
        [1409904000000, 97],
        [1409907600000, 43],
        [1409911200000, 38],
        [1409914800000, 1],
        [1409918400000, 71],
        [1409922000000, 50],
        [1409925600000, 19],
        [1409929200000, 19],
        [1409932800000, 86],
        [1409936400000, 65],
        [1409940000000, 93],
        [1409943600000, 35]
    ]
};

const inOutData = {
    name: "traffic",
    columns: ["time", "in", "out", "perpendicular"],
    points: [
        [1409529600000, 80, 37, 1000],
        [1409533200000, 88, 22, 1001],
        [1409536800000, 52, 56, 1002]
    ]
};

describe("Pipeline", () => {
    describe("test processor using offsetBy", () => {
        it("can transform process events with an offsetBy chain", () => {
            const events = EVENT_LIST;
            const collection = new Collection(events);

            let c1;
            let c2;

            const p1 = Pipeline()
                .from(collection)
                .offsetBy(1, "in")
                .offsetBy(2)
                .to(CollectionOut, c => c1 = c);
            // --> Specified output, evokes batch op
            const p2 = p1.offsetBy(3, "in").to(CollectionOut, c => { //            ||
                c2 = c;
            });

            // --> Specified output, evokes batch op
            expect(c1.size()).toBe(3);
            expect(c1.at(0).get("in")).toBe(4);
            expect(c1.at(1).get("in")).toBe(6);
            expect(c1.at(2).get("in")).toBe(8);

            expect(c2.size()).toBe(3);
            expect(c2.at(0).get("in")).toBe(7);
            expect(c2.at(1).get("in")).toBe(9);
            expect(c2.at(2).get("in")).toBe(11);
        });

        it("can stream from an unbounded source directly to output", () => {
            let out;
            const events = EVENT_LIST;
            const stream = new Stream();

            const p = Pipeline().from(stream).to(CollectionOut, c => out = c);

            stream.addEvent(events[0]);
            stream.addEvent(events[1]);

            expect(out.size()).toBe(2);
        });

        it("can stream events with an offsetBy pipeline", () => {
            let out;
            const events = EVENT_LIST;
            const stream = new Stream();

            const p = Pipeline()
                .from(stream)
                .offsetBy(3, "in")
                .to(CollectionOut, c => out = c);

            stream.addEvent(events[0]);
            stream.addEvent(events[1]);

            expect(out.size()).toBe(2);
            expect(out.at(0).get("in")).toBe(4);
            expect(out.at(1).get("in")).toBe(6);
        });

        it("can stream events with two offsetBy pipelines...", () => {
            let out1, out2;
            const events = EVENT_LIST;
            const stream = new Stream();

            const p1 = Pipeline()
                .from(stream)
                .offsetBy(1, "in")
                .offsetBy(2)
                .to(CollectionOut, c => out1 = c);

            const p2 = p1.offsetBy(3, "in").to(CollectionOut, c => out2 = c);

            stream.addEvent(events[0]);

            expect(out1.size()).toBe(1);
            expect(out2.size()).toBe(1);

            expect(out1.at(0).get("in")).toBe(4);
            expect(out2.at(0).get("in")).toBe(7);
        });
    });

    describe("TimeSeries pipeline", () => {
        const data = {
            name: "traffic",
            columns: ["time", "value", "status"],
            points: [
                [1400425947000, 52, "ok"],
                [1400425948000, 18, "ok"],
                [1400425949000, 26, "fail"],
                [1400425950000, 93, "offline"]
            ]
        };

        it("can transform process events with an offsetBy chain", () => {
            let out;
            const timeseries = new TimeSeries(data);

            const p1 = Pipeline()
                .from(timeseries.collection())
                .offsetBy(1, "value")
                .offsetBy(2)
                .to(CollectionOut, c => out = c);

            expect(out.at(0).get()).toBe(55);
            expect(out.at(1).get()).toBe(21);
            expect(out.at(2).get()).toBe(29);
            expect(out.at(3).get()).toBe(96);
        });

        it(
            "can transform events with an offsetBy chain straight from a TimeSeries",
            () => {
                let out;
                const timeseries = new TimeSeries(data);

                timeseries
                    .pipeline()
                    .offsetBy(1, "value")
                    .offsetBy(2)
                    .to(CollectionOut, c => out = c);

                expect(out.at(0).get()).toBe(55);
                expect(out.at(1).get()).toBe(21);
                expect(out.at(2).get()).toBe(29);
                expect(out.at(3).get()).toBe(96);
            }
        );

        it("should be able to batch a TimeSeries with an offset", () => {
            const timeseries = new TimeSeries(TRAFFIC_DATA);
            const outputEvents = [];

            Pipeline()
                .from(timeseries)
                .offsetBy(1, "value")
                .offsetBy(2)
                .to(EventOut, c => outputEvents.push(c));

            expect(outputEvents.length).toBe(timeseries.size());
        });

        it(
            "should be able to batch a TimeSeries with no processing nodes",
            () => {
                const stream = new TimeSeries(TRAFFIC_DATA);
                const outputEvents = [];

                Pipeline().from(stream).to(EventOut, c => outputEvents.push(c));

                expect(outputEvents.length).toBe(stream.size());
            }
        );
    });

    describe("aggregation", () => {
        it("can aggregate events into by windowed avg", () => {
            const eventsIn = [];
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 7, 57, 0), {
                in: 3,
                out: 1
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 7, 58, 0), {
                in: 9,
                out: 2
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 7, 59, 0), {
                in: 6,
                out: 6
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 8, 0, 0), {
                in: 4,
                out: 7
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 8, 1, 0), {
                in: 5,
                out: 9
            }));

            const stream = new Stream();
            const result = {};

            const p = Pipeline()
                .from(stream)
                .windowBy("1h")
                .emitOn("eachEvent")
                .aggregate({ in_avg: { in: avg() }, out_avg: { out: avg() } })
                .to(EventOut, event => {
                    result[`${event.index()}`] = event;
                });

            eventsIn.forEach(event => stream.addEvent(event));

            expect(result["1h-396199"].get("in_avg")).toBe(6);
            expect(result["1h-396199"].get("out_avg")).toBe(3);
            expect(result["1h-396200"].get("in_avg")).toBe(4.5);
            expect(result["1h-396200"].get("out_avg")).toBe(8);
        });

        it("an collect together events and aggregate", () => {
            const eventsIn = [];
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 7, 57, 0), {
                type: "a",
                in: 3,
                out: 1
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 7, 58, 0), {
                type: "a",
                in: 9,
                out: 2
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 7, 59, 0), {
                type: "b",
                in: 6,
                out: 6
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 8, 0, 0), {
                type: "a",
                in: 4,
                out: 7
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 8, 1, 0), {
                type: "b",
                in: 5,
                out: 9
            }));

            const stream = new Stream();
            const result = {};

            const p = Pipeline()
                .from(stream)
                .groupBy("type")
                .windowBy("1h")
                .emitOn("eachEvent")
                .aggregate({
                    type: { type: keep() },
                    // keep the type
                    in_avg: { in: avg() },
                    // avg in  -> in_avg
                    // avg out -> out_avg
                    out_avg: { out: avg() }
                })
                .to(
                    EventOut,
                    event =>
                        result[`${event.index()}:${event.get("type")}`] = event
                );

            eventsIn.forEach(event => stream.addEvent(event));

            expect(result["1h-396199:a"].get("in_avg")).toBe(6);
            expect(result["1h-396199:a"].get("out_avg")).toBe(1.5);
            expect(result["1h-396199:b"].get("in_avg")).toBe(6);
            expect(result["1h-396199:b"].get("out_avg")).toBe(6);
            expect(result["1h-396200:a"].get("in_avg")).toBe(4);
            expect(result["1h-396200:a"].get("out_avg")).toBe(7);
            expect(result["1h-396200:b"].get("in_avg")).toBe(5);
            expect(result["1h-396200:b"].get("out_avg")).toBe(9);
        });

        it(
            "can aggregate events by windowed avg and convert them to TimeEvents",
            () => {
                const eventsIn = [];
                eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 1, 57, 0), {
                    in: 3,
                    out: 1
                }));
                eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 1, 58, 0), {
                    in: 9,
                    out: 2
                }));
                eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 1, 59, 0), {
                    in: 6,
                    out: 6
                }));
                eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 2, 0, 0), {
                    in: 4,
                    out: 7
                }));
                eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 2, 1, 0), {
                    in: 5,
                    out: 9
                }));

                const stream = new Stream();
                const result = {};

                Pipeline()
                    .from(stream)
                    .windowBy("1h")
                    .emitOn("eachEvent")
                    .aggregate({
                        in_avg: { in: avg() },
                        out_avg: { out: avg() }
                    })
                    .asTimeRangeEvents({ alignment: "lag" })
                    .to(EventOut, event => {
                        result[`${+event.timestamp()}`] = event;
                    });

                eventsIn.forEach(event => stream.addEvent(event));

                expect(result["1426294800000"].get("in_avg")).toBe(6);
                expect(result["1426294800000"].get("out_avg")).toBe(3);
                expect(result["1426298400000"].get("in_avg")).toBe(4.5);
                expect(result["1426298400000"].get("out_avg")).toBe(8);
            }
        );

        it("can aggregate events to get percentiles", () => {
            const eventsIn = [];
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 1, 57, 0), {
                in: 3,
                out: 1
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 1, 58, 0), {
                in: 9,
                out: 2
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 1, 59, 0), {
                in: 6,
                out: 6
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 2, 0, 0), {
                in: 4,
                out: 7
            }));
            eventsIn.push(new TimeEvent(Date.UTC(2015, 2, 14, 2, 1, 0), {
                in: 5,
                out: 9
            }));

            const stream = new Stream();
            const result = {};

            Pipeline()
                .from(stream)
                .windowBy("1h")
                .emitOn("eachEvent")
                .aggregate({
                    in_low: { in: min() },
                    in_25th: { in: percentile(25) },
                    in_median: { in: median() },
                    in_75th: { in: percentile(75) },
                    in_high: { in: max() }
                })
                .asTimeEvents()
                .to(EventOut, event => {
                    result[`${+event.timestamp()}`] = event;
                });

            eventsIn.forEach(event => stream.addEvent(event));

            expect(result["1426296600000"].get("in_low")).toBe(3);
            expect(result["1426296600000"].get("in_25th")).toBe(4.5);
            expect(result["1426296600000"].get("in_median")).toBe(6);
            expect(result["1426296600000"].get("in_75th")).toBe(7.5);
            expect(result["1426296600000"].get("in_high")).toBe(9);
        });
    });

    describe("Pipeline event conversion", () => {
        const timestamp = new Date(1426316400000);
        const e = new TimeEvent(timestamp, 3);

        it(
            "should be able to convert from an TimeEvent to an TimeRangeEvent, using a duration, in front of the event",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeRangeEvents({ alignment: "front", duration: "1h" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"timerange":[1426316400000,1426320000000],"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(e);
            }
        );

        it(
            "should be able to convert from an TimeEvent to an TimeRangeEvent, using a duration, surrounding the event",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeRangeEvents({ alignment: "center", duration: "1h" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"timerange":[1426314600000,1426318200000],"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(e);
            }
        );

        it(
            "should be able to convert from an TimeEvent to an TimeRangeEvent, using a duration, in behind of the event",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeRangeEvents({ alignment: "behind", duration: "1h" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"timerange":[1426312800000,1426316400000],"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(e);
            }
        );

        it(
            "should be able to convert from an TimeEvent to an IndexedEvent",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asIndexedEvents({ duration: "1h" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"index":"1h-396199","data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(e);
            }
        );

        it(
            "should be able to convert from an TimeEvent to an TimeEvent as a noop",
            done => {
                const stream = new Stream();
                Pipeline().from(stream).asTimeEvents().to(EventOut, event => {
                    expect(event).toBe(e);
                    done();
                });
                stream.addEvent(e);
            }
        );
    });

    describe("TimeRangeEvent conversion", () => {
        const timeRange = new TimeRange([1426316400000, 1426320000000]);
        const timeRangeEvent = new TimeRangeEvent(timeRange, 3);

        it(
            "should be able to convert from an TimeRangeEvent to an TimeEvent, using the center of the range",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeEvents({ alignment: "center" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"time":1426318200000,"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(timeRangeEvent);
            }
        );

        it(
            "should be able to convert from an TimeRangeEvent to an TimeEvent, using beginning of the range",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeEvents({ alignment: "lag" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"time":1426316400000,"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(timeRangeEvent);
            }
        );

        it(
            "should be able to convert from an TimeRangeEvent to an TimeEvent, using the end of the range",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeEvents({ alignment: "lead" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"time":1426320000000,"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(timeRangeEvent);
            }
        );

        it(
            "should be able to convert from an TimeRangeEvent to an TimeRangeEvent as a noop",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeRangeEvents()
                    .to(EventOut, event => {
                        expect(event).toBe(timeRangeEvent);
                        done();
                    });
                stream.addEvent(timeRangeEvent);
            }
        );
    });

    describe("IndexedEvent conversion", () => {
        const indexedEvent = new IndexedEvent("1h-396199", 3);

        it(
            "should be able to convert from an IndexedEvent to an TimeEvent, using the center of the range",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeEvents({ alignment: "center" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"time":1426318200000,"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(indexedEvent);
            }
        );

        it(
            "should be able to convert from an IndexedEvent to an TimeEvent, using beginning of the range",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeEvents({ alignment: "lag" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"time":1426316400000,"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(indexedEvent);
            }
        );

        it(
            "should be able to convert from an IndexedEvent to an TimeEvent, using the end of the range",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeEvents({ alignment: "lead" })
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"time":1426320000000,"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(indexedEvent);
            }
        );

        it(
            "should be able to convert from an IndexedEvent to an TimeRangeEvent",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asTimeRangeEvents()
                    .to(EventOut, event => {
                        expect(`${event}`).toBe(
                            `{"timerange":[1426316400000,1426320000000],"data":{"value":3}}`
                        );
                        done();
                    });
                stream.addEvent(indexedEvent);
            }
        );

        it(
            "should be able to convert from an IndexedEvent to an IndexedEvent as a noop",
            done => {
                const stream = new Stream();
                Pipeline()
                    .from(stream)
                    .asIndexedEvents()
                    .to(EventOut, event => {
                        expect(event).toBe(indexedEvent);
                        done();
                    });
                stream.addEvent(indexedEvent);
            }
        );
    });

    describe("Filtering events in batch", () => {
        it("should be able to filter a TimeSeries", () => {
            const outputEvents = [];
            const timeseries = new TimeSeries(TRAFFIC_DATA);
            Pipeline()
                .from(timeseries)
                .filter(e => e.value() > 65)
                .to(EventOut, c => outputEvents.push(c));
            expect(outputEvents.length).toBe(39);
        });
    });

    describe("Selecting subset of columns from a TimeSeries in batch", () => {
        it("should be able select a single column", () => {
            let result;
            const timeseries = new TimeSeries(inOutData);
            Pipeline().from(timeseries).select("in").to(
                CollectionOut,
                c => result = new TimeSeries({
                    name: "newTimeseries",
                    collection: c
                })
            );
            expect(result.columns()).toEqual(["in"]);
        });

        it("should be able select a subset of columns", () => {
            let result;
            const timeseries = new TimeSeries(inOutData);
            Pipeline().from(timeseries).select(["out", "perpendicular"]).to(
                CollectionOut,
                c => result = new TimeSeries({
                    name: "subset",
                    collection: c
                })
            );
            expect(result.columns()).toEqual(["out", "perpendicular"]);
        });
    });

    describe("Collapsing in batch", () => {
        it("should be able collapse a subset of columns", done => {
            const timeseries = new TimeSeries(inOutData);
            Pipeline()
                .from(timeseries)
                .collapse(["in", "out"], "in_out_sum", sum())
                .emitOn("flush")
                .to(
                    CollectionOut,
                    c => {
                        const ts = new TimeSeries({
                            name: "subset",
                            collection: c
                        });
                        expect(ts.at(0).get("in_out_sum")).toBe(117);
                        expect(ts.at(1).get("in_out_sum")).toBe(110);
                        expect(ts.at(2).get("in_out_sum")).toBe(108);
                        done();
                    },
                    /*flush=*/
                    true
                );
        });

        it("should be able chain collapse operations together", done => {
            const timeseries = new TimeSeries(inOutData);
            Pipeline()
                .from(timeseries)
                .collapse(["in", "out"], "in_out_sum", sum(), true)
                .collapse(["in", "out"], "in_out_max", max(), true)
                .emitOn("flush")
                .to(
                    CollectionOut,
                    c => {
                        const ts = new TimeSeries({
                            name: "subset",
                            collection: c
                        });

                        expect(ts.at(0).get("in_out_sum")).toBe(117);
                        expect(ts.at(1).get("in_out_sum")).toBe(110);
                        expect(ts.at(2).get("in_out_sum")).toBe(108);

                        expect(ts.at(0).get("in_out_max")).toBe(80);
                        expect(ts.at(1).get("in_out_max")).toBe(88);
                        expect(ts.at(2).get("in_out_max")).toBe(56);

                        done();
                    },
                    /*flush=*/
                    true
                );
        });

        it("should be able sum element-wise and then find the max", done => {
            const timeseries = new TimeSeries(inOutData);
            Pipeline()
                .from(timeseries)
                .collapse(["in", "out"], "total", sum())
                .emitOn("flush")
                .aggregate({ max_total: { total: max() } })
                .to(
                    EventOut,
                    e => {
                        expect(e.get("max_total")).toBe(117);
                        done();
                    },
                    /*flush=*/
                    true
                );
        });
    });

    describe("Batch pipeline with return value", () => {
        it(
            "should be able to collect first 10 events over 65 and under 65",
            () => {
                let result = {};
                const timeseries = new TimeSeries(TRAFFIC_DATA);

                const collections = Pipeline()
                    .from(timeseries)
                    .emitOn("flush")
                    .groupBy(e => e.value() > 65 ? "high" : "low")
                    .take(10)
                    .toKeyedCollections();
                //expect(result["low"].size()).toBe(10);
                //expect(result["high"].size()).toBe(10);
            }
        );
    });

    describe("Mapping in batch", () => {
        it("should be able map one event to a modified event", done => {
            const timeseries = new TimeSeries(inOutData);
            Pipeline()
                .from(timeseries)
                .map(e => e.setData({ in: e.get("out"), out: e.get("in") }))
                .emitOn("flush")
                .to(
                    CollectionOut,
                    c => {
                        const ts = new TimeSeries({
                            name: "subset",
                            collection: c
                        });
                        expect(ts.at(0).get("in")).toBe(37);
                        expect(ts.at(0).get("out")).toBe(80);
                        expect(ts.size()).toBe(3);
                        done();
                    },
                    /*flush=*/
                    true
                );
        });
    });

    describe("Take n events in batch", () => {
        it("should be able to take 10 events from a TimeSeries", () => {
            let result;
            const timeseries = new TimeSeries(TRAFFIC_DATA);
            Pipeline().from(timeseries).take(10).to(
                CollectionOut,
                c => result = new TimeSeries({
                    name: "result",
                    collection: c
                })
            );
            expect(result.size()).toBe(10);
        });

        it("should be able to aggregate in batch global window", () => {
            let result;
            const timeseries = new TimeSeries(TRAFFIC_DATA);

            const p = Pipeline()
                .from(timeseries)
                .filter(e => e.value() < 50)
                .take(10)
                .aggregate({ value: { value: avg() } })
                .to(
                    EventOut,
                    event => {
                        result = event;
                    },
                    true
                );

            expect(result.timerange().toString()).toBe(
                "[1409544000000,1409590800000]"
            );
            expect(result.value()).toBe(27.9);
        });

        it("should be able to collect first 10 events over 65", () => {
            let result;
            const timeseries = new TimeSeries(TRAFFIC_DATA);

            const p = Pipeline()
                .from(timeseries)
                .filter(e => e.value() > 65)
                .take(10)
                .to(
                    CollectionOut,
                    collection => {
                        result = collection;
                    },
                    true
                );

            expect(result.size()).toBe(10);
            expect(result.at(0).value()).toBe(80);
            expect(result.at(1).value()).toBe(88);
            expect(result.at(5).value()).toBe(84);
        });

        it(
            "should be able to collect first 10 events over 65 and under 65",
            () => {
                let result = {};
                const timeseries = new TimeSeries(TRAFFIC_DATA);

                const p = Pipeline()
                    .from(timeseries)
                    .groupBy(e => e.value() > 65 ? "high" : "low")
                    .take(10)
                    .to(
                        CollectionOut,
                        (collection, windowKey, groupByKey) => {
                            result[groupByKey] = collection;
                        },
                        true
                    );

                expect(result["low"].size()).toBe(10);
                expect(result["high"].size()).toBe(10);
            }
        );

        it(
            "should be able to take the first 10 events, then split over 65 and under 65 into two collections",
            () => {
                let result = {};
                const timeseries = new TimeSeries(TRAFFIC_DATA);

                const p = Pipeline()
                    .from(timeseries)
                    .take(10)
                    .groupBy(e => e.value() > 65 ? "high" : "low")
                    .to(
                        CollectionOut,
                        (collection, windowKey, groupByKey) => {
                            result[groupByKey] = collection;
                        },
                        true
                    );

                expect(result["high"].size()).toBe(4);
                expect(result["low"].size()).toBe(6);
            }
        );

        it("should be able to count() the split over 65 and under 65", () => {
            let result = {};
            const timeseries = new TimeSeries(TRAFFIC_DATA);

            const p = Pipeline()
                .from(timeseries)
                .take(10)
                .groupBy(e => e.value() > 65 ? "high" : "low")
                .emitOn("flush")
                .count(
                    (count, windowKey, groupByKey) => result[groupByKey] = count
                );

            expect(result["high"]).toBe(4);
            expect(result["low"]).toBe(6);
        });
    });
});
