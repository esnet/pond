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

import { expect } from "chai";
import _ from "underscore";
import { Event, IndexedEvent } from "../../src/event";
import TimeRange from "../../src/range";
import Generator from "../../src/generator.js";
import Aggregator from "../../src/aggregator";
import Collector from "../../src/collector";
import Binner from "../../src/binner";
import Derivative from "../../src/derivative";
import Grouper from "../../src/grouper";
import Processor from "../../src/processor";

import { max, avg, sum, count, difference } from "../../src/functions";

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

describe("Buckets", () => {

    describe("Generator tests", () => {
        // Test date: Sat Mar 14 2015 07:32:22 GMT-0700 (PDT)
        const d = Date.UTC(2015, 2, 14, 7, 32, 22);
        const generator = new Generator("5m");
        const key = "poptart";

        it("should generate correct bucket", done => {
            const b = generator.bucket(d);
            const expected = "5m-4754394";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it("should have the correct index string", done => {
            const indexString = generator.bucketIndex(d);
            const expected = "5m-4754394";
            expect(indexString).to.equal(expected);
            done();
        });

        it("should generate bucket with key", done => {
            const b = generator.bucket(d, key);
            expect(b.key()).to.equal(key);
            done();
        });

        const d1 = Date.UTC(2015, 2, 14, 7, 30, 0);
        const d2 = Date.UTC(2015, 2, 14, 8, 29, 59);

        it("should have the correct bucket list for a date range", done => {
            const timerange = new TimeRange(d1, d2);
            const bucketList = generator.bucketList(timerange);
            const expectedBegin = "5m-4754394";
            const expectedEnd = "5m-4754405";

            expect(bucketList.length).to.equal(12);
            expect(bucketList[0].index().asString()).to.equal(expectedBegin);
            expect(bucketList[bucketList.length - 1].index().asString()).to.equal(expectedEnd);
            done();
        });

        it("should have the correct index string list for a TimeRange", done => {
            const timerange = new TimeRange(d1, d2);
            const indexList = generator.bucketIndexList(timerange);
            const expectedBegin = "5m-4754394";
            const expectedEnd = "5m-4754405";

            expect(indexList.length).to.equal(12);
            expect(indexList[0]).to.equal(expectedBegin);
            expect(indexList[indexList.length - 1]).to.equal(expectedEnd);

            done();
        });
    });

    describe("5min bucket tests", () => {

        const BucketGenerator = require("../../src/generator.js");

        // Test date: Sat Mar 14 2015 07:32:22 UTC
        const d = Date.UTC(2015, 2, 14, 7, 32, 22);
        const Buckets = new BucketGenerator("5m");
        it("should have the correct index", done => {
            const b = Buckets.bucket(d);
            const expected = "5m-4754394";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it("should have the correct UTC string", done => {
            const b = Buckets.bucket(d);
            const expected = "5m-4754394: [Sat, 14 Mar 2015 07:30:00 GMT, Sat, 14 Mar 2015 07:35:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });
    });

    describe("Hourly bucket tests", () => {

        const BucketGenerator = require("../../src/generator.js");

        // Test date: Sat Mar 14 2015 07:32:22 UTC
        const d = Date.UTC(2015, 2, 14, 7, 32, 22);
        const Buckets = new BucketGenerator("1h");

        it("should have the correct index", done => {
            const b = Buckets.bucket(d);
            const expected = "1h-396199";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it("should have the correct UTC string", done => {
            const b = Buckets.bucket(d);
            const expected = "1h-396199: [Sat, 14 Mar 2015 07:00:00 GMT, Sat, 14 Mar 2015 08:00:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });
    });

    describe("Daily bucket tests", () => {
        const BucketGenerator = require("../../src/generator.js");

        // Test date: Sat Mar 14 2015 07:32:22 UTC
        const d = new Date(2015, 2, 14, 7, 32, 22);
        const Buckets = new BucketGenerator("1d");

        it("should have the correct index", done => {
            const b = Buckets.bucket(d);
            const expected = "1d-16508";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it("should have the correct UTC string", done => {
            const b = Buckets.bucket(d);
            const expected = "1d-16508: [Sat, 14 Mar 2015 00:00:00 GMT, Sun, 15 Mar 2015 00:00:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });
    });

    describe("Aggregator", () => {
        const incomingEvents = [];
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), 3));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), 9));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), 6));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), 4));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), 5));

        const groupedEvents = [];
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {name: "a", value: 1}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {name: "b", value: 3}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {name: "a", value: 2}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {name: "b", value: 4}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {name: "a", value: 3}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {name: "b", value: 5}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {name: "a", value: 4}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {name: "b", value: 6}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {name: "a", value: 5}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {name: "b", value: 7}));

        it("should calculate the correct max for the two 1hr buckets", done => {
            const maxEvents = {};

            const MaxAggregator = new Aggregator({
                window: "1h",
                operator: max
            });

            MaxAggregator.onEmit(event => {
                maxEvents[event.index().asString()] = event;
            });

            // Add events
            _.each(incomingEvents, (event) => {
                MaxAggregator.addEvent(event);
            });

            // Done
            MaxAggregator.flush();

            expect(maxEvents["1h-396199"].get()).to.equal(9);
            expect(maxEvents["1h-396200"].get()).to.equal(5);
            done();
        });

        it("should calculate the correct avg for the two 1hr buckets", done => {
            const avgEvents = {};

            const AvgAggregator = new Aggregator({
                window: "1h",
                operator: avg
            });

            AvgAggregator.onEmit(event => {
                avgEvents[event.index().asString()] = event;
            });

            // Add events
            _.each(incomingEvents, (event) => {
                AvgAggregator.addEvent(event);
            });

            // Done
            AvgAggregator.flush();

            expect(avgEvents["1h-396199"].get()).to.equal(6);
            expect(avgEvents["1h-396200"].get()).to.equal(4.5);
            done();
        });

        it("should calculate the correct sum for the two 1hr buckets", done => {
            const sumEvents = {};
            const SumAggregator = new Aggregator({
                window: "1h",
                operator: sum
            });
            SumAggregator.onEmit(event => {
                sumEvents[event.index().asString()] = event;
            });

            // Add events
            _.each(incomingEvents, (event) => {
                SumAggregator.addEvent(event);
            });

            // Done
            SumAggregator.flush();

            expect(sumEvents["1h-396199"].get("value")).to.equal(18);
            expect(sumEvents["1h-396200"].get("value")).to.equal(9);
            done();
        });

        it("should calculate the correct count for the two 1hr buckets", done => {
            const countEvents = {};
            const CountAggregator = new Aggregator({
                window: "1h",
                operator: count
            });
            CountAggregator.onEmit(event => {
                countEvents[event.index().asString()] = event;
            });
            _.each(incomingEvents, event => {
                CountAggregator.addEvent(event);
            });

            // Done
            CountAggregator.flush();

            expect(countEvents["1h-396199"].get()).to.equal(3);
            expect(countEvents["1h-396200"].get()).to.equal(2);
            done();
        });

        it("should calculate the correct count for a series of points", done => {
            const events = [];
            const countEvents = {};

            // Convert the series to events
            _.each(sept2014Data.points, (point) => {
                events.push(new Event(point[0], point[1]));
            });

            const CountAggregator = new Aggregator({
                window: "1d",
                operator: count
            });
            CountAggregator.onEmit(event => {
                countEvents[event.index().asString()] = event;
            });
            _.each(events, (event) => {
                CountAggregator.addEvent(event);
            });

            CountAggregator.flush();

            expect(countEvents["1d-16314"].get()).to.equal(24);
            expect(countEvents["1d-16318"].get()).to.equal(20);
            done();
        });

        it("should calculate the correct count with inline emit", done => {
            const events = [];
            const countEvents = {};

            // Convert the series to events
            _.each(sept2014Data.points, (point) => {
                events.push(new Event(point[0], point[1]));
            });

            const CountAggregator = new Aggregator({
                window: "1d",
                operator: count
            }, event => {
                countEvents[event.index().asString()] = event;
            });

            _.each(events, (event) => {
                CountAggregator.addEvent(event);
            });

            // Done
            CountAggregator.flush();

            expect(countEvents["1d-16314"].get()).to.equal(24);
            expect(countEvents["1d-16318"].get()).to.equal(20);
            done();
        });

        it("should calculate the correct count with grouped events", done => {
            const results = {};
            const aggregate1hMax = new Aggregator({window: "1h", operator: max}, event => {
                results[`${event.index()} ${event.key()}`] = event.get();
            });
            const groupByName = new Grouper({
                groupBy: "name"
            }, event => {
                aggregate1hMax.addEvent(event);
            });

            // Add events
            _.each(groupedEvents, (event) => {
                groupByName.addEvent(event);
            });

            // Done
            aggregate1hMax.flush();

            expect(results["1h-396199 a"]).to.equal(3);
            expect(results["1h-396199 b"]).to.equal(5);
            expect(results["1h-396200 a"]).to.equal(5);
            expect(results["1h-396200 b"]).to.equal(7);

            done();
        });

    });

    describe("Aggregator tests with duplicates", () => {
        const dupEvents = [];
        dupEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), 3));
        dupEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), 3));
        dupEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), 9));
        dupEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), 9));
        dupEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), 6));
        dupEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), 6));

        it("should be able to handle duplicate events", done => {
            const avgEvents = {};

            const AvgAggregator = new Aggregator({
                window: "1h",
                operator: avg,
                emit: "always"
            });

            AvgAggregator.onEmit(event => {
                avgEvents[event.index().asString()] = event;
            });

            // Add events
            _.each(dupEvents, (event) => {
                AvgAggregator.addEvent(event);
            });

            expect(avgEvents["1h-396199"].get()).to.equal(6);
            done();
        });
    });

    describe("Aggregator tests for object events", () => {
        const incomingEvents = [];
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {cpu1: 23.4, cpu2: 55.1}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {cpu1: 36.2, cpu2: 45.6}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {cpu1: 38.6, cpu2: 65.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {cpu1: 24.5, cpu2: 85.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {cpu1: 45.2, cpu2: 91.6}));

        it("should calculate the correct sum for the two 1hr buckets", done => {
            const sumEvents = {};
            const SumAggregator = new Aggregator({window: "1h", operator: sum});
            SumAggregator.onEmit(event => {
                sumEvents[event.index().asString()] = event;
            });

            // Add events
            _.each(incomingEvents, (event) => {
                SumAggregator.addEvent(event);
            });

            // Done
            SumAggregator.flush();

            expect(sumEvents["1h-396199"].get("cpu1")).to.equal(98.2);
            expect(sumEvents["1h-396199"].get("cpu2")).to.equal(165.9);
            expect(sumEvents["1h-396200"].get("cpu1")).to.equal(69.7);
            expect(sumEvents["1h-396200"].get("cpu2")).to.equal(176.8);
            done();
        });
    });

    describe("Collection tests", () => {
        const incomingEvents = [];
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {cpu1: 23.4, cpu2: 55.1}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {cpu1: 36.2, cpu2: 45.6}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {cpu1: 38.6, cpu2: 65.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {cpu1: 24.5, cpu2: 85.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {cpu1: 45.2, cpu2: 91.6}));

        it("should collect together 5 events using Date objects and two data fields", done => {
            const collection = {};

            const hourlyCollection = new Collector({window: "1h"}, series => {
                collection[series.index().asString()] = series;
            });

            // Add events
            _.each(incomingEvents, (event) => {
                hourlyCollection.addEvent(event);
            });


            // Done
            hourlyCollection.flush();

            expect(collection["1h-396199"].indexAsString()).to.equal("1h-396199");
            expect(collection["1h-396200"].indexAsString()).to.equal("1h-396200");

            expect(collection["1h-396199"].size()).to.equal(3);
            expect(collection["1h-396200"].size()).to.equal(2);

            done();
        });

        it("should be able to collect events using a ms timestamp", done => {
            const events = [];
            events.push(new Event(1445449170000, {in: 1516472753.3333333, out: 2449781785.0666666}));
            events.push(new Event(1445449200000, {in: 2352267287.733333, out: 2383241021.0666666}));
            events.push(new Event(1445449230000, {in: 5602383779.466666, out: 2270295356.2666664}));
            events.push(new Event(1445449260000, {in: 7822001988.533334, out: 2566206616.7999997}));
            const collection = {};

            const hourlyCollection = new Collector({window: "1h"}, series => {
                collection[series.index().asString()] = series;
            });

            // Add events
            _.each(events, (event) => {
                hourlyCollection.addEvent(event);
            });

            // Done
            hourlyCollection.flush();

            done();
        });

        it("should be able to collect IndexedEvent", done => {
            const events = [];
            events.push(new IndexedEvent("5m-4818240", {in: 11, out: 55}));
            events.push(new IndexedEvent("5m-4818241", {in: 31, out: 16}));
            events.push(new IndexedEvent("5m-4818242", {in: 56, out: 22}));
            events.push(new IndexedEvent("5m-4818243", {in: 73, out: 18}));
            const collection = {};

            const collector = new Collector({window: "7d"}, (series) => {
                collection[series.index().asString()] = series;
            }, true);

            // Add events
            _.each(events, (event) => {
                collector.addEvent(event);
            });

            // Done
            collector.flush();

            done();
        });
    });

});

describe("Resample bin fitting", () => {

    describe("Differences", () => {

        // 0               100            |   v
        // |               |              |
        // 0              30              |   t ->
        // |               |              |
        // |<- 100 ------->|<- 0 -------->|   result (with flush)
        it("should calculate the correct fitted data for two boundry aligned values", done => {
            const input = [new Event(0, 0), new Event(30000, 100)];
            const result = {};
            const binner = new Binner({
                window: "30s",
                operator: difference
            }, event => {
                const key = event.index().asString();
                result[key] = event;
            });

            // Feed events
            _.each(input, event => binner.addEvent(event));
            binner.flush();

            expect(result["30s-0"].get()).to.equal(100);
            expect(result["30s-1"].get()).to.equal(0);
            done();

        });

        // In this case, there is no middle buckets at all
        //
        //     |   100         |   213        |   v
        //     |   |           |   |          |
        //    30  31          60  62         90   t ->
        //     |               |              |
        //     |<- 0           |<- 7.3 ------>|   result (with flush)
        //         30s-1           30s-2
        //
        it("should calculate the correct fitted data for no middle buckets with flush", done => {
            const input = [new Event(31000, 100), new Event(62000, 213)];
            const result = {};
            const binner = new Binner({
                window: "30s",
                operator: difference
            }, event => {
                const key = event.index().asString();
                result[key] = event;
            });

            // Feed events
            input.forEach(event => binner.addEvent(event));
            binner.flush();

            expect(result["30s-1"]).to.be.undefined;
            expect(result["30s-2"].get()).to.equal(7.2903225806451815);
            expect(result["30s-3"]).to.be.undefined;
            done();
        });

        //     100             |    200       |   v
        //     |               |    |         |
        //    90             120  121       150  t ->
        //     |               |              |
        //     |<- 96.7 ------>| ?            |   result
        it("should calculate the correct fitted data for no middle buckets that isn't flushed", done => {
            const input = [new Event(90000, 100), new Event(121000, 200)];

            const result = {};
            const binner = new Binner({
                window: "30s",
                operator: difference
            }, event => {
                const key = event.index().asString();
                result[key] = event;
            });

            _.each(input, event => binner.addEvent(event));

            expect(result["30s-2"]).to.be.undefined;
            expect(result["30s-3"].get()).to.equal(96.7741935483871);
            expect(result["30s-4"]).to.be.undefined;
            done();
        });

        //     |           100 |              |              |              |   200       |   v
        //     |           |   |              |              |              |   |         |
        //    60          89  90            120            150            180 181       210   t ->
        //     |               |              |              |              |             |
        //     |<- ? --------->|<- 32.6 ----->|<- 32.6 ----->|<- 32.6 ----->|<- ? ------->|   result
        it("should calculate the correct values for a sequence of middle buckets", done => {
            const input = [new Event(89000, 100), new Event(181000, 200)];

            const result = {};
            const binner = new Binner({
                window: "30s",
                operator: difference
            }, event => {
                const key = event.index().asString();
                result[key] = event;
            });

            _.each(input, event => binner.addEvent(event));

            expect(result["30s-2"]).to.be.undefined;
            expect(result["30s-3"].get()).to.equal(32.608695652173935);
            expect(result["30s-4"].get()).to.equal(32.60869565217388);
            expect(result["30s-5"].get()).to.equal(32.608695652173935);
            expect(result["30s-6"]).to.be.undefined;
            done();
        });

        it("should not return a result for two points in the same bucket", done => {
            const input = [
                new Event(1386369693000, 141368641534364),
                new Event(1386369719000, 141368891281597)
            ];

            const result = {};
            const binner = new Binner({
                window: "30s",
                operator: difference
            }, event => {
                const key = event.index().asString();
                result[key] = event;
            });

            _.each(input, event => binner.addEvent(event));

            expect(result["30s-46212323"]).to.be.undefined;
            done();
        });

    });

    describe("Derivatives", () => {
        //     |           100 |              |              |              |   200       |   v
        //     |           |   |              |              |              |   |         |
        //    60          89  90            120            150            180 181       210   t ->
        //     |               |              |              |              |             |
        //     |<- ? --------->|<- 1.08/s --->|<- 1.08/s --->|<- 1.08/s --->|<- ? ------->|   result
        //
        it("should calculate the correct derivative", done => {
            const input = [
                new Event(89000, 100),
                new Event(181000, 200)
            ];

            const result = {};
            const binner = new Derivative({
                window: "30s"
            }, event => {
                const key = event.index().asString();
                result[key] = event;
            });

            _.each(input, event => binner.addEvent(event));

            expect(result["30s-2"]).to.be.undefined;
            expect(result["30s-3"].get()).to.equal(1.0869565217391313);
            expect(result["30s-4"].get()).to.equal(1.0869565217391293);
            expect(result["30s-5"].get()).to.equal(1.0869565217391313);
            expect(result["30s-6"]).to.be.undefined;
            done();
        });
    });
});


describe("Process chains", () => {

    describe("Groupers", () => {
        const incomingEvents = [];
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0),
            {name: "a", subname: "x", cpu1: 23.4, cpu2: 55.1}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0),
            {name: "a", subname: "y", cpu1: 36.2, cpu2: 45.6}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0),
            {name: "b", subname: "z", cpu1: 38.6, cpu2: 65.2}));

        it("should generate the correct keys for column based groupBy", done => {
            const results = [];
            const groupByName = new Grouper({groupBy: "name"}, event => {
                results.push(event);
            });

            // Add events
            _.each(incomingEvents, (event) => {
                groupByName.addEvent(event);
            });

            expect(results[0].key()).to.equal("a");
            expect(results[1].key()).to.equal("a");
            expect(results[2].key()).to.equal("b");

            done();
        });

        it("should generate the correct keys for column list based groupBy", done => {
            const results = [];
            const groupByName = new Grouper({groupBy: ["name", "subname"]}, event => {
                results.push(event);
            });

            // Add events
            _.each(incomingEvents, (event) => {
                groupByName.addEvent(event);
            });

            expect(results[0].key()).to.equal("a::x");
            expect(results[1].key()).to.equal("a::y");
            expect(results[2].key()).to.equal("b::z");

            done();
        });
    });

    describe("Process chains", () => {

        const groupedEvents = [];
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {name: "a", value: 1}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {name: "b", value: 3}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {name: "a", value: 2}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {name: "b", value: 4}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {name: "a", value: 3}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {name: "b", value: 5}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {name: "a", value: 4}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {name: "b", value: 6}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {name: "a", value: 5}));
        groupedEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {name: "b", value: 7}));

        it("should generate the correct keys for column based groupBy..", done => {
            const results = {};
            let resultCount = 0;

            const processChain = Processor()
                .groupBy("name")
                .aggregate("1h", avg, ["value"])
                .out(event => {
                    console.log("out", event);
                    results[`${event.index()}::${event.key()}`] = `${event}`;
                    resultCount++;
                });

            processChain.addEvents(groupedEvents);

            expect(resultCount).to.equal(2);
            expect(`${results["1h-396199::a"]}`)
                .to.equal(`{"index":"1h-396199","data":{"value":2},"key":"a"}`);
            expect(`${results["1h-396199::b"]}`)
                .to.equal(`{"index":"1h-396199","data":{"value":4},"key":"b"}`);
            done();
        });

        it("should generate the correct keys for column based groupBy..", done => {
            const results = {};
            let resultCount = 0;
            const processChain = Processor({emit: "always"})
                .groupBy("name")
                .aggregate("1h", avg, ["value"])
                .out(event => {
                    results[`${event.index()}::${event.key()}`] = `${event}`;
                    resultCount++;
                });
            processChain.addEvents(groupedEvents);
            expect(resultCount).to.equal(10);
            expect(`${results["1h-396199::a"]}`)
                .to.equal(`{"index":"1h-396199","data":{"value":2},"key":"a"}`);
            expect(`${results["1h-396199::b"]}`)
                .to.equal(`{"index":"1h-396199","data":{"value":4},"key":"b"}`);
            done();
        });

        const incomingEvents = [];
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {cpu1: 23.4, cpu2: 55.1}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {cpu1: 36.2, cpu2: 45.6}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {cpu1: 38.6, cpu2: 65.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {cpu1: 24.5, cpu2: 85.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {cpu1: 45.2, cpu2: 91.6}));

        it("should collect together 5 events using a process chain", done => {
            const collection = {};
            let emitCount = 0;
            const processChain = Processor({emit: "always"})
                .groupBy("name")
                .collect("1h", false, series => {
                    collection[series.index().asString()] = series;
                    emitCount++;
                });
            processChain.addEvents(incomingEvents);
            expect(emitCount).to.equal(5);
            expect(collection["1h-396199"].indexAsString()).to.equal("1h-396199");
            expect(collection["1h-396200"].indexAsString()).to.equal("1h-396200");
            expect(collection["1h-396199"].size()).to.equal(3);
            expect(collection["1h-396200"].size()).to.equal(2);

            done();
        });
    });
});
