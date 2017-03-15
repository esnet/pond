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

import Immutable from "immutable";

import Event from "../event";
import Index from "../index";
import IndexedEvent from "../indexedevent";
import TimeEvent from "../timeevent";
import TimeRange from "../timerange";
import TimeRangeEvent from "../timerangeevent";
import { avg, sum } from "../base/functions";

const OUTAGE_EVENT_LIST = {
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
        },
        {
            start_time: "2015-04-22T03:30:00Z",
            end_time: "2015-04-22T16:50:00Z",
            title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
            description: (
                `The listed circuit was unavailable due to
bent pins in two clots of the optical node chassis.`
            ),
            completed: true,
            external_ticket: "3576:144",
            esnet_ticket: "ESNET-20150421-013",
            organization: "Internet2 / Level 3",
            type: "U"
        },
        {
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

const DEEP_EVENT_DATA = {
    NorthRoute: { in: 123, out: 456 },
    SouthRoute: { in: 654, out: 223 }
};

const EVENT_LIST = [];
EVENT_LIST.push(new TimeEvent(1445449170000, {
    name: "source1",
    in: 2,
    out: 11
}));
EVENT_LIST.push(new TimeEvent(1445449200000, {
    name: "source1",
    in: 4,
    out: 13
}));
EVENT_LIST.push(new TimeEvent(1445449230000, {
    name: "source1",
    in: 6,
    out: 15
}));
EVENT_LIST.push(new TimeEvent(1445449260000, {
    name: "source1",
    in: 8,
    out: 18
}));

//
// TimeEvent creation
//
it("can create a regular TimeEvent, with deep data", () => {
    const timestamp = new Date("2015-04-22T03:30:00Z");
    const event = new TimeEvent(timestamp, DEEP_EVENT_DATA);

    expect(event.get("NorthRoute")).toEqual({ in: 123, out: 456 });
    expect(event.get("SouthRoute")).toEqual({ in: 654, out: 223 });
});

it("can't make an Event directly", () => {
    const timestamp = new Date("2015-04-22T03:30:00Z");
    expect(() => {
      const event = new Event(timestamp, DEEP_EVENT_DATA);
    }).toThrow();   
});

it("can create an IndexedEvent using a string index and data", () => {
    const event = new IndexedEvent("1d-12355", { value: 42 });
    const expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";

    expect(event.timerangeAsUTCString()).toBe(expected);
    expect(event.get("value")).toBe(42);
});

it("can create an IndexedEvent using an existing Index and data", () => {
    const index = new Index("1d-12355");
    const event = new IndexedEvent(index, { value: 42 });
    const expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";

    expect(event.timerangeAsUTCString()).toBe(expected);
    expect(event.get("value")).toBe(42);
});

it("can create a TimeRangeEvent using a object", () => {
    // Pick one event
    const sampleEvent = OUTAGE_EVENT_LIST["outage_events"][0];

    // Extract the begin and end times
    const beginTime = new Date(sampleEvent.start_time);
    const endTime = new Date(sampleEvent.end_time);
    const timerange = new TimeRange(beginTime, endTime);
    const event = new TimeRangeEvent(timerange, sampleEvent);
    const expected = `{"timerange":[1429673400000,1429707600000],"data":{"external_ticket":"","start_time":"2015-04-22T03:30:00Z","completed":true,"end_time":"2015-04-22T13:00:00Z","organization":"Internet2 / Level 3","title":"STAR-CR5 < 100 ge 06519 > ANL  - Outage","type":"U","esnet_ticket":"ESNET-20150421-013","description":"At 13:33 pacific circuit 06519 went down."}}`;

    expect(`${event}`).toBe(expected);
    expect(event.begin().getTime()).toBe(1429673400000);
    expect(event.end().getTime()).toBe(1429707600000);
    expect(event.humanizeDuration()).toBe("10 hours");
    expect(event.get("title")).toBe("STAR-CR5 < 100 ge 06519 > ANL  - Outage");
});

//
// Event merging
//
it("can merge multiple events together", () => {
    const t = new Date("2015-04-22T03:30:00Z");
    const event1 = new TimeEvent(t, { a: 5, b: 6 });
    const event2 = new TimeEvent(t, { c: 2 });
    const merged = Event.merge([event1, event2]);

    expect(merged[0].get("a")).toBe(5);
    expect(merged[0].get("b")).toBe(6);
    expect(merged[0].get("c")).toBe(2);
});

it("can merge multiple events together using an Immutable.List", () => {
    const t = new Date("2015-04-22T03:30:00Z");
    const event1 = new TimeEvent(t, { a: 5, b: 6 });
    const event2 = new TimeEvent(t, { c: 2 });
    const merged = Event.merge(new Immutable.List([event1, event2]));

    expect(merged.get(0).get("a")).toBe(5);
    expect(merged.get(0).get("b")).toBe(6);
    expect(merged.get(0).get("c")).toBe(2);
});

it("can merge multiple indexed events together", () => {
    const index = "1h-396206";
    const event1 = new IndexedEvent(index, { a: 5, b: 6 });
    const event2 = new IndexedEvent(index, { c: 2 });
    const merged = Event.merge([event1, event2]);

    expect(merged[0].get("a")).toBe(5);
    expect(merged[0].get("b")).toBe(6);
    expect(merged[0].get("c")).toBe(2);
});

it("can merge multiple timerange events together", () => {
    const beginTime = new Date("2015-04-22T03:30:00Z");
    const endTime = new Date("2015-04-22T13:00:00Z");
    const timerange = new TimeRange(beginTime, endTime);
    const event1 = new TimeRangeEvent(timerange, { a: 5, b: 6 });
    const event2 = new TimeRangeEvent(timerange, { c: 2 });
    const merged = Event.merge([event1, event2]);

    expect(merged[0].get("a")).toBe(5);
    expect(merged[0].get("b")).toBe(6);
    expect(merged[0].get("c")).toBe(2);
});

it("can deeply merge multiple events together", () => {
    const t = new Date("2015-04-22T03:30:00Z");
    const event1 = new TimeEvent(t, { a: 5, b: { c: 6 } });
    const event2 = new TimeEvent(t, { d: 2, b: { e: 4 } });
    const merged = Event.merge([event1, event2], true);

    expect(merged[0].get("a")).toBe(5);
    expect(merged[0].get("b.c")).toBe(6);
    expect(merged[0].get("d")).toBe(2);
    expect(merged[0].get("b.e")).toBe(4);
});

//
// Event sums
//
it("can sum multiple events together", () => {
    const t = new Date("2015-04-22T03:30:00Z");
    const events = [
        new TimeEvent(t, { a: 5, b: 6, c: 7 }),
        new TimeEvent(t, { a: 2, b: 3, c: 4 }),
        new TimeEvent(t, { a: 1, b: 2, c: 3 })
    ];
    const result = Event.combine(events, sum());

    expect(result[0].get("a")).toBe(8);
    expect(result[0].get("b")).toBe(11);
    expect(result[0].get("c")).toBe(14);
});

it("can sum multiple events together using an Immutable.List", () => {
    const t = new Date("2015-04-22T03:30:00Z");
    const events = [
        new TimeEvent(t, { a: 5, b: 6, c: 7 }),
        new TimeEvent(t, { a: 2, b: 3, c: 4 }),
        new TimeEvent(t, { a: 1, b: 2, c: 3 })
    ];
    const result = Event.combine(new Immutable.List(events), sum());

    expect(result.getIn([0, "a"])).toBe(8);
    expect(result.getIn([0, "b"])).toBe(11);
    expect(result.getIn([0, "c"])).toBe(14);
});

it("can pass no events to sum and get back an empty list", () => {
    const t = new Date("2015-04-22T03:30:00Z");
    const events = [];
    const result1 = Event.combine(events, sum());
    expect(result1.length).toBe(0);

    const result2 = Event.combine(new Immutable.List(events), sum());
    expect(result2.length).toBe(0);
});

it("can sum multiple indexed events together", () => {
    const events = [
        new IndexedEvent("1d-1234", { a: 5, b: 6, c: 7 }),
        new IndexedEvent("1d-1234", { a: 2, b: 3, c: 4 }),
        new IndexedEvent("1d-1235", { a: 1, b: 2, c: 3 })
    ];
    const result = Event.combine(events, sum());

    expect(result.length).toEqual(2);

    expect(`${result[0].index()}`).toBe("1d-1234");
    expect(result[0].get("a")).toBe(7);
    expect(result[0].get("b")).toBe(9);
    expect(result[0].get("c")).toBe(11);

    expect(`${result[1].index()}`).toBe("1d-1235");
    expect(result[1].get("a")).toBe(1);
    expect(result[1].get("b")).toBe(2);
    expect(result[1].get("c")).toBe(3);
});

it("can sum multiple events together if they have different timestamps", () => {
    const t1 = new Date("2015-04-22T03:30:00Z");
    const t2 = new Date("2015-04-22T04:00:00Z");
    const t3 = new Date("2015-04-22T04:30:00Z");
    const events = [
        new TimeEvent(t1, { a: 5, b: 6, c: 7 }),
        new TimeEvent(t1, { a: 2, b: 3, c: 4 }),
        new TimeEvent(t3, { a: 1, b: 2, c: 3 })
    ];
    const result = Event.combine(events, sum());

    expect(result[0].get("a")).toBe(7);
});

//
// Test duplication
//
it("can detect duplicated event", () => {
    const e1 = new TimeEvent(1477058455872, { a: 5, b: 6, c: 7 });
    const e2 = new TimeEvent(1477058455872, { a: 5, b: 6, c: 7 });
    const e3 = new TimeEvent(1477058455872, { a: 6, b: 6, c: 7 });

    // Just check times and type
    expect(Event.isDuplicate(e1, e2)).toBeTruthy();
    expect(Event.isDuplicate(e1, e3)).toBeTruthy();

    // Check times, type and values
    expect(Event.isDuplicate(e1, e3, false)).toBeFalsy();
    expect(Event.isDuplicate(e1, e2, false)).toBeTruthy();
});

//
// Deep data
//
it(
    "can create an event with deep data and then get values back with dot notation",
    () => {
        const timestamp = new Date("2015-04-22T03:30:00Z");
        const event = new TimeEvent(timestamp, DEEP_EVENT_DATA);
        let eventValue;
        for (let i = 0; i < 100000; i++) {
            eventValue = event.get(["NorthRoute", "in"]); //1550ms
        }

        expect(eventValue).toBe(123);
    }
);

//
// Event map and reduce
//
it("should generate the correct key values for a string selector", () => {
    expect(Event.map(EVENT_LIST, "in")).toEqual({ in: [2, 4, 6, 8] });
});

it("should generate the correct key values for a string selector", () => {
    expect(Event.map(EVENT_LIST, ["in", "out"])).toEqual({
        in: [2, 4, 6, 8],
        out: [11, 13, 15, 18]
    });
});

it("should generate the correct key values for a string selector", () => {
    const result = Event.map(EVENT_LIST, event => ({
        sum: event.get("in") + event.get("out")
    }));

    expect(result).toEqual({ sum: [13, 17, 21, 26] });

    expect(Event.reduce(result, avg())).toEqual({ sum: 19.25 });
});

it("should be able to run a simple mapReduce calculation", () => {
    const result = Event.mapReduce(EVENT_LIST, ["in", "out"], avg());

    expect(result).toEqual({ in: 5, out: 14.25 });
});
