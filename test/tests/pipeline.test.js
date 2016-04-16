/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* global it, describe */
/* eslint no-unused-expressions: 0 */
/* eslint-disable max-len */
/* eslint no-unused-vars: 0 */

import { expect } from "chai";

import { Pipeline } from "../../src/pipeline.js";
import { UnboundedIn } from "../../src/in.js";
import { ConsoleOut, EventOut } from "../../src/out.js";

import Collection from "../../src/collection.js";
import TimeSeries from "../../src/series.js";
import { Collector, FixedWindowCollector } from "../../src/collector.js";

import { Event } from "../../src/event.js";
import { keep, avg } from "../../src/functions.js";

const eventList1 = [
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new Event(new Date("2015-04-22T03:32:00Z"), {in: 5, out: 6})
];

/*
const eventList2 = [
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new IndexedEvent("2015-04-22", {in: 5, out: 6})
];
*/

const sept2014Data = {
    name: "traffic",
    columns: ["time", "value"],
    points: [
        [1409529600000, 80],
        [1409533200000, 88],
        [1409536800000, 52],
        [1409540400000, 80],
        [1409544000000, 26],
        [1409547600000, 37],
        [1409551200000, 6 ],
        [1409554800000, 32],
        [1409558400000, 69],
        [1409562000000, 21],
        [1409565600000, 6 ],
        [1409569200000, 54],
        [1409572800000, 88],
        [1409576400000, 41],
        [1409580000000, 35],
        [1409583600000, 43],
        [1409587200000, 84],
        [1409590800000, 32],
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
        [1409727600000, 4 ],
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
        [1409889600000, 6 ],
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

describe("Pipeline", () => {


    describe("Collections", () => {

        it("can create a Collection from an event list", done => {
            const collection = new Collection(eventList1);
            expect(collection).to.be.ok;
            done();
        });

        it("can use size() and at() to get to Collection items", done => {
            const collection = new Collection(eventList1);
            expect(collection.size()).to.equal(3);
            expect(Event.is(collection.at(0), eventList1[0])).to.be.true;
            expect(Event.is(collection.at(1), eventList1[1])).to.be.true;
            expect(Event.is(collection.at(2), eventList1[2])).to.be.true;
            done();
        });

        it("can loop (for .. of) over a Collection's events", done => {
            const collection = new Collection(eventList1);
            const events = [];
            for (const e of collection.events()) {
                events.push(e);
            }
            expect(events.length).to.equal(3);
            expect(Event.is(events[0], eventList1[0])).to.be.true;
            expect(Event.is(events[1], eventList1[1])).to.be.true;
            expect(Event.is(events[2], eventList1[2])).to.be.true;
            done();
        });

        it("can add an event and get a new Collection back", done => {
            const collection = new Collection(eventList1);
            const event = new Event(new Date("2015-04-22T03:32:00Z"), {in: 1, out: 2});
            const newCollection = collection.addEvent(event);
            expect(newCollection.size()).to.equal(4);
            done();
        });

    });

    describe("test processor using offsetBy", () => {

        it("can transform process events with an offsetBy chain", done => {

            const events = eventList1;
            const collection = new Collection(events);

            let c1;
            let c2;

            const p1 = Pipeline()
                .from(collection)                  // This links to the src collection
                .offsetBy(1, "in")                 // Transforms to a new collection
                .offsetBy(2)                       // And then to another collection
                .to(Collector, {}, c => c1 = c);   // Evokes the action to pass collection
                                                   // into offsetBy, and so on
            const p2 = p1
                .offsetBy(3, "in")                 // Transforms to a new collection
                .to(Collector, {}, c => c2 = c);   // Evokes the action to pass collection

            expect(c1.size()).to.equal(3);
            expect(c1.at(0).get("in")).to.equal(4);
            expect(c1.at(1).get("in")).to.equal(6);
            expect(c1.at(2).get("in")).to.equal(8);

            expect(c2.size()).to.equal(3);
            expect(c2.at(0).get("in")).to.equal(7);
            expect(c2.at(1).get("in")).to.equal(9);
            expect(c2.at(2).get("in")).to.equal(11);

            done();
        });
        
        it("can stream from an unbounded source directly to output", done => {
            let out;
            const events = eventList1;
            const source = new UnboundedIn();

            const p = Pipeline()
                .from(source)
                .to(Collector, {}, c => out = c);

            source.addEvent(events[0]);
            source.addEvent(events[1]);

            expect(out.size()).to.equal(2);

            done();
        });

        it("can stream events with an offsetBy pipeline", done => {
            let out;
            const events = eventList1;
            const source = new UnboundedIn();

            const p = Pipeline()
                .from(source)
                .offsetBy(3, "in")
                .to(Collector, {}, c => out = c);

            source.addEvent(events[0]);
            source.addEvent(events[1]);

            expect(out.size()).to.equal(2);
            expect(out.at(0).get("in")).to.equal(4);
            expect(out.at(1).get("in")).to.equal(6);
            done();
        });

        it("can stream events with two offsetBy pipelines...", done => {
            let out1, out2;
            const events = eventList1;
            const source = new UnboundedIn();

            const p1 = Pipeline()
                .from(source)
                .offsetBy(1, "in")
                .offsetBy(2)
                .to(Collector, {}, c => out1 = c);

            const p2 = p1
                .offsetBy(3, "in")
                .to(Collector, {}, c => out2 = c);

            source.addEvent(events[0]);
            
            expect(out1.size()).to.equal(1);
            expect(out2.size()).to.equal(1);

            expect(out1.at(0).get("in")).to.equal(4);
            expect(out2.at(0).get("in")).to.equal(7);

            done();
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

        it("can transform process events with an offsetBy chain", done => {
            let out;
            const timeseries = new TimeSeries(data);

            const p1 = Pipeline()
                .from(timeseries.collection())
                .offsetBy(1, "value")
                .offsetBy(2)
                .to(Collector, {}, c => out = c);

            expect(out.at(0).get()).to.equal(55);
            expect(out.at(1).get()).to.equal(21);
            expect(out.at(2).get()).to.equal(29);
            expect(out.at(3).get()).to.equal(96);
            done();
        });

        it("can transform process events with an offsetBy chain straight from a TimeSeries", done => {
            let out;
            const timeseries = new TimeSeries(data);

            timeseries.pipeline()
                .offsetBy(1, "value")
                .offsetBy(2)
                .to(Collector, {}, c => out = c);

            expect(out.at(0).get()).to.equal(55);
            expect(out.at(1).get()).to.equal(21);
            expect(out.at(2).get()).to.equal(29);
            expect(out.at(3).get()).to.equal(96);
            done();
        });

    });

    describe("aggregation", () => {

        it("can aggregate events into a windowed avg", done => {

            const eventsIn = [];
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {in: 3, out: 1}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {in: 9, out: 2}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {in: 6, out: 6}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {in: 4, out: 7}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {in: 5, out: 9}));

            const input = new UnboundedIn();
            const result = {};

            const p = Pipeline()
                .from(input)
                .windowBy("1h")           // 1 day fixed windows
                .emitOn("eachEvent")    // emit result on each event
                .aggregate({in: avg, out: avg})
                .to(EventOut, {}, event => {
                    result[`${event.index()}`] = event;
                });

            eventsIn.forEach(event => input.addEvent(event));

            expect(result["1h-396199"].get("in")).to.equal(6);
            expect(result["1h-396199"].get("out")).to.equal(3);
            expect(result["1h-396200"].get("in")).to.equal(4.5);
            expect(result["1h-396200"].get("out")).to.equal(8);

            done();
        });
       
        it("an collect together events and aggregate", done => {

            const eventsIn = [];
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {type: "a", in: 3, out: 1}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {type: "a", in: 9, out: 2}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {type: "b", in: 6, out: 6}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {type: "a", in: 4, out: 7}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {type: "b", in: 5, out: 9}));

            const input = new UnboundedIn();
            const result = {};

            const p = Pipeline()
                .from(input)
                .groupBy("type")
                .windowBy("1h")           // 1 day fixed windows
                .emitOn("eachEvent")    // emit result on each event
                .aggregate({type: keep, in: avg, out: avg})
                .to(EventOut, {}, event => {
                    result[`${event.index()}:${event.get("type")}`] = event;
                });

            eventsIn.forEach(event => input.addEvent(event));

            expect(result["1h-396199:a"].get("in")).to.equal(6);
            expect(result["1h-396199:a"].get("out")).to.equal(1.5);
            expect(result["1h-396199:b"].get("in")).to.equal(6);
            expect(result["1h-396199:b"].get("out")).to.equal(6);
            expect(result["1h-396200:a"].get("in")).to.equal(4);
            expect(result["1h-396200:a"].get("out")).to.equal(7);
            expect(result["1h-396200:b"].get("in")).to.equal(5);
            expect(result["1h-396200:b"].get("out")).to.equal(9);

            done();
        });

        it("can aggregate events into a windowed avg and convert them to Events", done => {

            const eventsIn = [];
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 1, 57, 0), {in: 3, out: 1}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 1, 58, 0), {in: 9, out: 2}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 1, 59, 0), {in: 6, out: 6}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 2, 0, 0), {in: 4, out: 7}));
            eventsIn.push(new Event(Date.UTC(2015, 2, 14, 2, 1, 0), {in: 5, out: 9}));

            const input = new UnboundedIn();
            const result = {};

            const p = Pipeline()
                .from(input)
                .windowBy("1h")           // 1 day fixed windows
                .emitOn("eachEvent")    // emit result on each event
                .aggregate({in: avg, out: avg})
                .asTimeRangeEvents({alignment: "lag"})
                .to(EventOut, {}, event => {
                    result[`${+event.timestamp()}`] = event;
                });

            eventsIn.forEach(event => input.addEvent(event));

            expect(result["1426294800000"].get("in")).to.equal(6);
            expect(result["1426294800000"].get("out")).to.equal(3);
            expect(result["1426298400000"].get("in")).to.equal(4.5);
            expect(result["1426298400000"].get("out")).to.equal(8);
           
            done();
        });
    });

    /*
    describe("Aggregation pipeline with emit on discards", () => {

        const eventsIn = [];
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), 3));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), 9));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), 6));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), 4));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), 5));

        it("can transform process events without a window avg", done => {
            const input = new UnboundedIn();
            const result = {};
            const p = Pipeline()
                .from(input)
                .window("1h")           // 1 day fixed windows
                .emitOn("discard")      // emit result each time we have a new window
                .aggregate("avg")
                .to(new EventOut(event => {
                    console.log(`EVT: ${event.index()} - ${event}`);
                    //result[`${event.index()}`] = event;
                }));

            eventsIn.forEach(event => input.addEvent(event));

            //expect(result["1h-396199"].get("avg")).to.equal(6);
            //expect(result["1h-396200"].get("avg")).to.equal(4.5);
            done();
        });
    });

    describe("Aggregation pipeline with fieldSpec", () => {

        const eventsIn = [];
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {in: 3, out: {part1: 3, part2: 4}}));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {in: 9, out: {part1: 4, part2: 4}}));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {in: 6, out: {part1: 2, part2: 4}}));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {in: 4, out: {part1: 2, part2: 4}}));
        eventsIn.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {in: 5, out: {part1: 1, part2: 4}}));

        it("can transform process events without a window avg", done => {
            const input = new UnboundedIn();
            const result = {};

            const p = Pipeline()
                .from(input)
                .window("1h")           // 1 day fixed windows
                .emitOn("eachEvent")  // emit result on each event
                .aggregate("avg", {avg_in: "in", avg_out: "out.part1"})
                .to(new EventOut(event => result[`${event.index()}`] = event));

            eventsIn.forEach(event => input.addEvent(event));

            expect(result["1h-396199"].get("avg_in")).to.equal(6);
            expect(result["1h-396199"].get("avg_out")).to.equal(3);
            expect(result["1h-396200"].get("avg_in")).to.equal(4.5);
            expect(result["1h-396200"].get("avg_out")).to.equal(1.5);
            done();
        });
    });
    */
});
