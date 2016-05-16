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

import Event from "../../src/event";
import TimeRangeEvent from "../../src/timerangeevent";
import IndexedEvent from "../../src/indexedevent";
import TimeRange from "../../src/range.js";
import Index from "../../src/index.js";

import { avg } from "../../src/functions.js";

const outageList = {
    status: "OK",
    outage_events: [
        {
            start_time: "2015-04-22T03:30:00Z",
            end_time: "2015-04-22T13:00:00Z",
            description: "At 13:33 pacific circuit 06519 went down.",
            title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
            completed: true,
            external_ticket: "",
            esnet_ticket: "ESNET-20150421-013",
            organization: "Internet2 / Level 3",
            type: "U"
        }, {
            start_time: "2015-04-22T03:30:00Z",
            end_time: "2015-04-22T16:50:00Z",
            title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
            description: `The listed circuit was unavailable due to
bent pins in two clots of the optical node chassis.`,
            completed: true,
            external_ticket: "3576:144",
            esnet_ticket: "ESNET-20150421-013",
            organization: "Internet2 / Level 3",
            type: "U"
        }, {
            start_time: "2015-03-04T09:00:00Z",
            end_time: "2015-03-04T14:00:00Z",
            title: "ANL Scheduled Maintenance",
            description: "ANL will be switching border routers...",
            completed: true,
            external_ticket: "",
            esnet_ticket: "ESNET-20150302-002",
            organization: "ANL",
            type: "P"
        }
    ]
};

const deepEventData = {
    NorthRoute: {
        in: 123,
        out: 456
    },
    SouthRoute: {
        in: 654,
        out: 223
    }
};

describe("Events", () => {

    describe("Event creation", () => {

        it("can create a regular Event, with deep data", done => {
            const timestamp = new Date("2015-04-22T03:30:00Z");
            const event = new Event(timestamp, deepEventData);
            expect(event.get("NorthRoute")).to.deep.equal({in: 123, out: 456});
            expect(event.get("SouthRoute")).to.deep.equal({in: 654, out: 223});
            done();
        });

        it("can create an IndexedEvent using a string index and data", done => {
            const event = new IndexedEvent("1d-12355", {value: 42});
            const expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.timerangeAsUTCString()).to.equal(expected);
            expect(event.get("value")).to.equal(42);
            done();
        });

        it("can create an indexed event using an existing Index and data", done => {
            const index = new Index("1d-12355");
            const event = new IndexedEvent(index, {value: 42});
            const expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.timerangeAsUTCString()).to.equal(expected);
            expect(event.get("value")).to.equal(42);
            done();
        });

        it("can create a TimeRangeEvent using a object", done => {
            // Pick one event
            const sampleEvent = outageList["outage_events"][0];

            // Extract the begin and end times
            const beginTime = new Date(sampleEvent.start_time);
            const endTime = new Date(sampleEvent.end_time);
            const timerange = new TimeRange(beginTime, endTime);
            const event = new TimeRangeEvent(timerange, sampleEvent);
            const expected = `{"timerange":[1429673400000,1429707600000],"data":{"external_ticket":"","start_time":"2015-04-22T03:30:00Z","completed":true,"end_time":"2015-04-22T13:00:00Z","organization":"Internet2 / Level 3","title":"STAR-CR5 < 100 ge 06519 > ANL  - Outage","type":"U","esnet_ticket":"ESNET-20150421-013","description":"At 13:33 pacific circuit 06519 went down."}}`;
            expect(`${event}`).to.equal(expected);
            expect(event.begin().getTime()).to.equal(1429673400000);
            expect(event.end().getTime()).to.equal(1429707600000);
            expect(event.humanizeDuration()).to.equal("10 hours");
            expect(event.get("title")).to.equal("STAR-CR5 < 100 ge 06519 > ANL  - Outage");
            done();
        });
    });

    describe("Event merging", () => {

        it("can merge multiple events together", done => {
            const t = new Date("2015-04-22T03:30:00Z");
            const event1 = new Event(t, {a: 5, b: 6});
            const event2 = new Event(t, {c: 2});
            const merged = Event.merge([event1, event2]);
            expect(merged.get("a")).to.equal(5);
            expect(merged.get("b")).to.equal(6);
            expect(merged.get("c")).to.equal(2);
            done();
        });

        it("can merge multiple indexed events together", done => {
            const index = "1h-396206";
            const event1 = new IndexedEvent(index, {a: 5, b: 6});
            const event2 = new IndexedEvent(index, {c: 2});
            const merged = Event.merge([event1, event2]);
            expect(merged.get("a")).to.equal(5);
            expect(merged.get("b")).to.equal(6);
            expect(merged.get("c")).to.equal(2);
            done();
        });

        it("can merge multiple timerange events together", done => {
            const beginTime = new Date("2015-04-22T03:30:00Z");
            const endTime = new Date("2015-04-22T13:00:00Z");
            const timerange = new TimeRange(beginTime, endTime);
            const event1 = new TimeRangeEvent(timerange, {a: 5, b: 6});
            const event2 = new TimeRangeEvent(timerange, {c: 2});
            const merged = Event.merge([event1, event2]);
            expect(merged.get("a")).to.equal(5);
            expect(merged.get("b")).to.equal(6);
            expect(merged.get("c")).to.equal(2);
            done();
        });
    });

    describe("Event summing", () => {

        it("can sum multiple events together", done => {
            const t = new Date("2015-04-22T03:30:00Z");
            const events = [
                new Event(t, {a: 5, b: 6, c: 7}),
                new Event(t, {a: 2, b: 3, c: 4}),
                new Event(t, {a: 1, b: 2, c: 3})
            ];
            const result = Event.sum(events);
            expect(result.get("a")).to.equal(8);
            expect(result.get("b")).to.equal(11);
            expect(result.get("c")).to.equal(14);
            done();
        });

        it("can't sum multiple events together if they have different timestamps", done => {
            const t1 = new Date("2015-04-22T03:30:00Z");
            const t2 = new Date("2015-04-22T04:00:00Z");
            const t3 = new Date("2015-04-22T04:30:00Z");
            const events = [
                new Event(t1, {a: 5, b: 6, c: 7}),
                new Event(t2, {a: 2, b: 3, c: 4}),
                new Event(t3, {a: 1, b: 2, c: 3})
            ];

            expect(Event.sum.bind(this, events)).to.throw("sum() expects all events to have the same timestamp");

            done();
        });
    });

    /*
    describe("Event filling", () => {

        it("can fill NaNs with a fixed value for a specific field", done => {
            const t = new Date("2015-04-22T03:30:00Z");
            const event = new Event(t, {a: 5, b: NaN, c: NaN});
            const filled = event.fill("NaN", 0, "b");
            expect(filled.get("a")).to.equal(5);
            expect(filled.get("b")).to.equal(0);
            expect(isNaN(filled.get("c"))).to.equal(true);
            done();
        });

        it("can fill NaNs with a fixed value for all fields", done => {
            const t = new Date("2015-04-22T03:30:00Z");
            const event = new Event(t, {a: 5, b: NaN, c: NaN});
            const filled = event.fill("NaN", 99);
            expect(filled.get("a")).to.equal(5);
            expect(filled.get("b")).to.equal(99);
            expect(filled.get("c")).to.equal(99);
            done();
        });
    });*/

    describe("Deep event get", () => {
        it("can create an event with deep data and then get values back with dot notation", done => {
            const timestamp = new Date("2015-04-22T03:30:00Z");
            const event = new Event(timestamp, deepEventData);
            let eventValue;
            for (let i = 0; i < 100000; i++) {
                eventValue = event.get(["NorthRoute", "in"]); //1550ms
            }
            expect(eventValue).to.equal(123);
            done();
        });
    });

    describe("Event mapreduce", () => {

        const events = [];
        events.push(new Event(1445449170000, {name: "source1", in: 2, out: 11}));
        events.push(new Event(1445449200000, {name: "source1", in: 4, out: 13}));
        events.push(new Event(1445449230000, {name: "source1", in: 6, out: 15}));
        events.push(new Event(1445449260000, {name: "source1", in: 8, out: 18}));

        it("should generate the correct key values for a string selector", done => {
            expect(Event.map(events, "in")).to.deep.equal({in: [2, 4, 6, 8]});
            done();
        });

        it("should generate the correct key values for a string selector", done => {
            expect(Event.map(events, ["in", "out"])).to.deep.equal({
                in: [2, 4, 6, 8],
                out: [11, 13, 15, 18]
            });
            done();
        });

        it("should generate the correct key values for a string selector", done => {
            const result = Event.map(events, (event) => ({
                sum: event.get("in") + event.get("out")
            }));
            expect(result).to.deep.equal({
                sum: [13, 17, 21, 26]
            });

            expect(Event.reduce(result, avg)).to.deep.equal({sum: 19.25});

            done();
        });

        it("should be able to run a simple mapReduce calculation", done => {
            const result = Event.mapReduce(events, ["in", "out"], avg);
            expect(result).to.deep.equal({ in: 5, out: 14.25 });
            done();
        });
    });
});
