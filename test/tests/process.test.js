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
import { Event, IndexedEvent, TimeRangeEvent } from "../../src/event";
import TimeRange from "../../src/range";
import Binner from "../../src/binner";
import Derivative from "../../src/derivative";
import Grouper from "../../src/grouper";
import Processor from "../../src/processor";
import Index from "../../src/index";
import { avg, difference } from "../../src/functions";

describe("Buckets", () => {

    /**
     * It is possible to get a Bucket given an window size such as "1h" and a
     * time. That is, for an indexed piece of time, we can get a Bucket which
     * will hold events for that time.
     *
     * It is possible to then take the filled or partially filled bucket
     * and aggregate or collect the events within it.
     */
    describe("Generating buckets", () => {

        const d = Date.UTC(2015, 2, 14, 7, 32, 22);
        const key = "poptart";

        /**
         * Test getting a basic IndexedBucket. We can then query the bucket for
         * the index() it covers, then query the index as a string and it should be
         * "5m-4754394".
         */
        it("should be possible to get a bucket with a window and a date", done => {
            const b = Index.getBucket("5m", d);
            const expected = "5m-4754394";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        /**
         * Test directly getting the Index string without actually making a
         * new bucket. This is done using the Index.getIndexString() static
         * function.
         *
         * In this case it should be the same string as the last example.
         */
        it("should be possible to get an index string given a window and date", done => {
            const indexString = Index.getIndexString("5m", d);
            const expected = "5m-4754394";
            expect(indexString).to.equal(expected);
            done();
        });

        /**
         * A bucket may also will keep track of its key, which is used for
         * groupBy functionality in processing chains. Typically a bucket
         * will collect events for a particular key only. When a bucket emits
         * an event, the emitted event will also have that key. Here we just test
         * that when we generate a bucket and specify a key, that the bucket
         * stores that key and we can get it back.
         */
        it("should generate bucket with key", done => {
            const b = Index.getBucket("5m", d, key);
            expect(b.key()).to.equal(key);
            done();
        });

        /**
         * For getting a list of buckets given a TimeRange we use the
         * Index.bucketList() static function. For 7:30 am until 8:29:59am
         * on 2/14/2015 we expect 12 buckets with indexes from "5m-4754394" to
         * "5m-4754405".
         */

        const d1 = Date.UTC(2015, 2, 14, 7, 30, 0);
        const d2 = Date.UTC(2015, 2, 14, 8, 29, 59);

        it("should have the correct bucket list for a date range", done => {
            const timerange = new TimeRange(d1, d2);
            const bucketList = Index.getBucketList("5m", timerange);

            const expectedBegin = "5m-4754394";
            const expectedEnd = "5m-4754405";
            expect(bucketList.length).to.equal(12);
            expect(bucketList[0].index().asString()).to.equal(expectedBegin);
            expect(bucketList[bucketList.length - 1].index().asString()).to.equal(expectedEnd);
            done();
        });

        /**
         * We also can also get just for the list of Index strings for a
         * TimeRange using the Index.bucketIndexList static function. This
         * is actually really useful for tiling data because for a requested
         * time range you can find out the names of all the tiles you need to
         * complete that request.
         */
        it("should have the correct index string list for a TimeRange", done => {
            const timerange = new TimeRange(d1, d2);
            const indexList = Index.getIndexStringList("5m", timerange);

            const expectedBegin = "5m-4754394";
            const expectedEnd = "5m-4754405";
            expect(indexList.length).to.equal(12);
            expect(indexList[0]).to.equal(expectedBegin);
            expect(indexList[indexList.length - 1]).to.equal(expectedEnd);

            done();
        });
    });

    /**
     * Our bucket tests here use 5m, 1h and 1d buckets and test that the
     * index and the toUTCString() functionality works ok.
     */
    
    /*
    describe("Bucket tests", () => {

        // Test date: Sat Mar 14 2015 07:32:22 UTC
        const d = Date.UTC(2015, 2, 14, 7, 32, 22);

        it("should have the correct index for a 5 min bucket", done => {
            const b = Index.getBucket("5m", d);
            const expected = "5m-4754394";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it("should have the correct UTC string for a 5 min bucket", done => {
            const b = Index.getBucket("5m", d);
            const expected = "5m-4754394: [Sat, 14 Mar 2015 07:30:00 GMT, Sat, 14 Mar 2015 07:35:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });

        it("should have the correct index for a 1 hour bucket", done => {
            const b = Index.getBucket("1h", d);
            const expected = "1h-396199";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it("should have the correct UTC string for a 1 hour bucket", done => {
            const b = Index.getBucket("1h", d);
            const expected = "1h-396199: [Sat, 14 Mar 2015 07:00:00 GMT, Sat, 14 Mar 2015 08:00:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });

        it("should have the correct index for a 1 day bucket", done => {
            const b = Index.getBucket("1d", d);
            const expected = "1d-16508";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it("should have the correct UTC string for a 1 day bucket", done => {
            const b = Index.getBucket("1d", d);
            const expected = "1d-16508: [Sat, 14 Mar 2015 00:00:00 GMT, Sun, 15 Mar 2015 00:00:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });
    });
    */
   
    /**
     * We also have a sliding time bucket
     */
    
    /*
    describe("Sliding Bucket tests", () => {

        const event1 = new Event(Date.UTC(2015, 2, 14, 7, 57, 0), 3);
        const event2 = new Event(Date.UTC(2015, 2, 14, 7, 57, 30), 5);
        const event3 = new Event(Date.UTC(2015, 2, 14, 7, 58, 10), 7);

        it("should be able to create a sliding bucket", done => {
            //
            // In this test the first event will be removed by the third
            // event since the third event will advance the window forward
            // such that the first event is more than a minute old
            //
            const slidingBucket = new SlidingTimeBucket("1m");
            slidingBucket.addEvent(event1);
            slidingBucket.addEvent(event2);
            slidingBucket.addEvent(event3);

            slidingBucket.getEvents((err, events) => {
                expect(events.length)
                    .to.equal(2);
                expect(events[0].toString())
                    .to.equal(`{"time":1426319850000,"data":{"value":5},"key":""}`);
                expect(events[1].toString())
                    .to.equal(`{"time":1426319890000,"data":{"value":7},"key":""}`);
                done();
            });
        });

        it("should be able to do sliding bucket aggregation", done => {
            const events = [];

            const AvgAggregator = new Aggregator({
                window: {type: "sliding-time", duration: "1m"},
                operator: avg,
                emit: "always"
            }, event => {
                events.push(event);
            });

            AvgAggregator.addEvent(event1);
            AvgAggregator.addEvent(event2);
            AvgAggregator.addEvent(event3);

            expect(events.length)
                .to.equal(3);
            expect(events[0].toString())
                .to.equal(`{"timerange":[1426319820000,1426319820000],"data":{"value":3},"key":""}`);
            expect(events[1].toString())
                .to.equal(`{"timerange":[1426319820000,1426319850000],"data":{"value":4},"key":""}`);
            expect(events[2].toString())
                .to.equal(`{"timerange":[1426319850000,1426319890000],"data":{"value":6},"key":""}`);
            done();

        });
    });
    */
   
    /*
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
                window: {duration: "1h"},
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
                window: {duration: "1h"},
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
                window: {duration: "1h"},
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
                window: {duration: "1h"},
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
                window: {duration: "1d"},
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
                window: {duration: "1d"},
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
            const aggregate1hMax = new Aggregator({
                window: {duration: "1h"},
                operator: max
            }, event => {
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
    */
   
    /*
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
                window: {duration: "1h"},
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
    */
   
    /*
    describe("Aggregator tests for object events", () => {
        const incomingEvents = [];
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 57, 0), {cpu1: 23.4, cpu2: 55.1}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 58, 0), {cpu1: 36.2, cpu2: 45.6}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 7, 59, 0), {cpu1: 38.6, cpu2: 65.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 0, 0), {cpu1: 24.5, cpu2: 85.2}));
        incomingEvents.push(new Event(Date.UTC(2015, 2, 14, 8, 1, 0), {cpu1: 45.2, cpu2: 91.6}));

        it("should calculate the correct sum for the two 1hr buckets", done => {
            const sumEvents = {};
            const SumAggregator = new Aggregator({
                window: {duration: "1h"}, operator: sum
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

            expect(sumEvents["1h-396199"].get("cpu1")).to.equal(98.2);
            expect(sumEvents["1h-396199"].get("cpu2")).to.equal(165.9);
            expect(sumEvents["1h-396200"].get("cpu1")).to.equal(69.7);
            expect(sumEvents["1h-396200"].get("cpu2")).to.equal(176.8);
            done();
        });
    });
    */
   
    /*
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

            const hourlyCollection = new Collector({
                window: {duration: "1h"}
            }, series => {
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

            const collector = new Collector({
                window: "7d"
            }, (series) => {
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
    */
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

    describe("Event conversion", () => {

        const timestamp = new Date(1426316400000);
        const e = new Event(timestamp , 3);

        it("should be able to convert from an Event to an TimeRangeEvent, using a duration, in front of the event", done => {
            const processChain = Processor()
                .convertTo(TimeRangeEvent, "front", "1h")
                .out(event => {
                    expect(`${event}`).to.equal(`{"timerange":[1426316400000,1426320000000],"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(e);
        });

        it("should be able to convert from an Event to an TimeRangeEvent, using a duration, surrounding the event", done => {
            const processChain = Processor()
                .convertTo(TimeRangeEvent, "center", "1h")
                .out(event => {
                    expect(`${event}`).to.equal(`{"timerange":[1426314600000,1426318200000],"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(e);
        });

        it("should be able to convert from an Event to an TimeRangeEvent, using a duration, in behind of the event", done => {
            const processChain = Processor()
                .convertTo(TimeRangeEvent, "behind", "1h")
                .out(event => {
                    expect(`${event}`).to.equal(`{"timerange":[1426312800000,1426316400000],"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(e);
        });

        it("should be able to convert from an Event to an IndexedEvent", done => {
            const processChain = Processor()
                .convertTo(IndexedEvent, null, "1h")
                .out(event => {
                    expect(`${event}`).to.equal(`{"index":"1h-396199","data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(e);
        });

        it("should be able to convert from an Event to an Event as a noop", done => {
            const processChain = Processor()
                .convertTo(Event)
                .out(event => {
                    expect(event).to.equal(e);
                    done();
                });
            processChain.addEvent(e);
        });
    });

    describe("TimeRangeEvent conversion", () => {

        const timeRange = new TimeRange([1426316400000, 1426320000000]);
        const timeRangeEvent = new TimeRangeEvent(timeRange, 3);

        it("should be able to convert from an TimeRangeEvent to an Event, using the center of the range", done => {
            const processChain = Processor()
                .convertTo(Event)
                .out(event => {
                    expect(`${event}`).to.equal(`{"time":1426318200000,"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(timeRangeEvent);
        });

        it("should be able to convert from an TimeRangeEvent to an Event, using beginning of the range", done => {
            const processChain = Processor()
                .convertTo(Event, "lag")
                .out(event => {
                    expect(`${event}`).to.equal(`{"time":1426316400000,"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(timeRangeEvent);
        });

        it("should be able to convert from an TimeRangeEvent to an Event, using the end of the range", done => {
            const processChain = Processor()
                .convertTo(Event, "lead")
                .out(event => {
                    expect(`${event}`).to.equal(`{"time":1426320000000,"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(timeRangeEvent);
        });

        it("should be able to convert from an TimeRangeEvent to an TimeRangeEvent as a noop", done => {
            const processChain = Processor()
                .convertTo(TimeRangeEvent)
                .out(event => {
                    expect(event).to.equal(timeRangeEvent);
                    done();
                });
            processChain.addEvent(timeRangeEvent);
        });
    });

    describe("IndexedEvent conversion", () => {

        const indexedEvent = new IndexedEvent("1h-396199", 3);

        it("should be able to convert from an IndexedEvent to an Event, using the center of the range", done => {
            const processChain = Processor()
                .convertTo(Event)
                .out(event => {
                    expect(`${event}`).to.equal(`{"time":1426318200000,"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(indexedEvent);
        });

        it("should be able to convert from an IndexedEvent to an Event, using beginning of the range", done => {
            const processChain = Processor()
                .convertTo(Event, "lag")
                .out(event => {
                    expect(`${event}`).to.equal(`{"time":1426316400000,"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(indexedEvent);
        });

        it("should be able to convert from an IndexedEvent to an Event, using the end of the range", done => {
            const processChain = Processor()
                .convertTo(Event, "lead")
                .out(event => {
                    expect(`${event}`).to.equal(`{"time":1426320000000,"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(indexedEvent);
        });

        it("should be able to convert from an IndexedEvent to an TimeRangeEvent", done => {
            const processChain = Processor()
                .convertTo(TimeRangeEvent)
                .out(event => {
                    expect(`${event}`).to.equal(`{"timerange":[1426316400000,1426320000000],"data":{"value":3},"key":""}`);
                    done();
                });
            processChain.addEvent(indexedEvent);
        });

        it("should be able to convert from an IndexedEvent to an IndexedEvent as a noop", done => {
            const processChain = Processor()
                .convertTo(IndexedEvent)
                .out(event => {
                    expect(event).to.equal(indexedEvent);
                    done();
                });
            processChain.addEvent(indexedEvent);
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

        it("should be able to combine groupby with aggregation using a processor chain", done => {
            const results = {};
            let resultCount = 0;

            const processChain = Processor()
                .groupBy("name")
                .aggregate({duration: "1h"}, avg, ["value"])
                .out(event => {
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

        it("should be able to emit always", done => {
            const results = {};
            let resultCount = 0;
            const processChain = Processor({emit: "always"})
                .groupBy("name")
                .aggregate({duration: "1h"}, avg, ["value"])
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
                .collect("1h", series => {
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

        /*
        it("should be able to aggregate to IndexedEvents and then collect Events into a TimeSeries", done => {
            const results = [];
            const processChain = Processor({emit: "always"})
                .groupBy("name")
                .aggregate({duration: "1h"}, avg, ["value"])
                .convertTo(TimeRangeEvent)
                .out(event => {
                    // console.log(`$$ ${event}`);
                });
                // .collect("1h", series => {
                //    console.log(series, `:: ${series}`);
                //});

            processChain.addEvents(groupedEvents);

            // console.log("Resulting events", results);

            done();
        });
        */
    });
});
