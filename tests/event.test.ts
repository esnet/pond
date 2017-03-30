declare const describe: any;
declare const it: any;
declare const expect: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

import Event from "../src/event";
import Time from "../src/time";
import Index from "../src/index";
import TimeRange from "../src/timerange";
import Collection from "../src/collection";
import { sum, avg } from "../src/functions";

const fmt = "YYYY-MM-DD HH:mm";

const DEEP_EVENT_DATA = {
    NorthRoute: { in: 123, out: 456 },
    SouthRoute: { in: 654, out: 223 }
};

const ALT_DEEP_EVENT_DATA = {
    NorthRoute: { in: 100, out: 456 },
    SouthRoute: { in: 654, out: 200 }
};

const DATE = new Date("2015-04-22T03:30:00Z");

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
            description: `The listed circuit was unavailable...`,
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

describe("Event static", () => {

    it("can tell if two events are the same with Event.is()", () => {
        const timestamp = new Time(DATE);
        const event1 = new Event(timestamp, DEEP_EVENT_DATA);
        const event2 = new Event(timestamp, DEEP_EVENT_DATA);
        const event3 = new Event(timestamp, ALT_DEEP_EVENT_DATA);
        expect(Event.is(event1, event2)).toBeTruthy();
        expect(Event.is(event1, event3)).toBeFalsy();
    });

    it("can detect duplicated event", () => {
        const timestamp = new Time(DATE);
        const e1 = new Event(timestamp, { a: 5, b: 6, c: 7 });
        const e2 = new Event(timestamp, { a: 5, b: 6, c: 7 });
        const e3 = new Event(timestamp, { a: 6, b: 6, c: 7 });

        // Just check times and type
        expect(Event.isDuplicate(e1, e2)).toBeTruthy();
        expect(Event.isDuplicate(e1, e3)).toBeTruthy();

        // Check times, type and values
        expect(Event.isDuplicate(e1, e3, false)).toBeFalsy();
        expect(Event.isDuplicate(e1, e2, false)).toBeTruthy();
    });

});

describe("Time Events", () => {

    it("can create a new time event", () => {
        const time = new Time(new Date(1487983075328));
        const timeEvent = new Event(time, Immutable.Map({ name: "bob" }));
        expect(timeEvent.toString()).toEqual(`{"time":1487983075328,"data":{"name":"bob"}}`);
    });

    it("can set a new value", () => {
        const time = new Time(new Date(1487983075328));
        const timeEvent = new Event(time, Immutable.Map({ name: "bob" }));
        const newTimeEvent = timeEvent.set("name", "fred");
        expect(newTimeEvent.toString()).toEqual(`{"time":1487983075328,"data":{"name":"fred"}}`);
    });

    it("can create a regular TimeEvent, with deep data", () => {
        const timestamp = new Time(DATE);
        const event = new Event(timestamp, DEEP_EVENT_DATA);
        expect(event.get("NorthRoute")).toEqual({ in: 123, out: 456 });
        expect(event.get("SouthRoute")).toEqual({ in: 654, out: 223 });
    });

    it("can use dot notation to get values in deep data", () => {
        const timestamp = new Date("2015-04-22T03:30:00Z");
        const time = new Time(timestamp);
        const event = new Event(time, DEEP_EVENT_DATA);
        const eventValue = event.get(["NorthRoute", "in"]);
        expect(eventValue).toBe(123);
    });

});

describe("Indexed Events", () => {

    it("can create an IndexedEvent using a existing Index and data", () => {
        const index = new Index("1d-12355");
        const event = new Event(index, { value: 42 });
        const expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
        const timerange = event.key().asTimerange();

        expect(timerange.toUTCString()).toBe(expected);
        expect(event.get("value")).toBe(42);
    });

});

describe("TimeRange Events", () => {

    it("can create a TimeRange Event using a object", () => {
        // Pick one event
        const sampleEvent = OUTAGE_EVENT_LIST["outage_events"][0];

        // Extract the begin and end times
        const beginTime = new Date(sampleEvent.start_time);
        const endTime = new Date(sampleEvent.end_time);
        const timerange = new TimeRange(beginTime, endTime);
        const event = new Event(timerange, sampleEvent);
        const expected = `{"timerange":[1429673400000,1429707600000],"data":{"external_ticket":"","start_time":"2015-04-22T03:30:00Z","completed":true,"end_time":"2015-04-22T13:00:00Z","organization":"Internet2 / Level 3","title":"STAR-CR5 < 100 ge 06519 > ANL  - Outage","type":"U","esnet_ticket":"ESNET-20150421-013","description":"At 13:33 pacific circuit 06519 went down."}}`;

        expect(`${event}`).toBe(expected);
        expect(event.begin().getTime()).toBe(1429673400000);
        expect(event.end().getTime()).toBe(1429707600000);
        expect(event.key().humanizeDuration()).toBe("10 hours");
        expect(event.get("title")).toBe("STAR-CR5 < 100 ge 06519 > ANL  - Outage");
    });
});

describe("Event list merge", () => {
    it("can merge multiple events together", () => {
        const t = new Time(new Date("2015-04-22T03:30:00Z"));
        const event1 = new Event(t, { a: 5, b: 6 });
        const event2 = new Event(t, { c: 2 });
        const merged = Event.merge([event1, event2]);

        // type error:
        // const index = new Index("1d-12355");
        // const event3 = new Event(index, { value: 42 });
        // const merged2 = Event.merge([event1, event2]);

        expect(merged[0].get("a")).toBe(5);
        expect(merged[0].get("b")).toBe(6);
        expect(merged[0].get("c")).toBe(2);
    });

    it("can merge multiple events together using an Immutable.List", () => {
        const t = new Time(new Date("2015-04-22T03:30:00Z"));
        const event1 = new Event(t, { a: 5, b: 6 });
        const event2 = new Event(t, { c: 2 });
        const merged = Event.merge(Immutable.List([event1, event2]));

        expect(merged.get(0).get("a")).toBe(5);
        expect(merged.get(0).get("b")).toBe(6);
        expect(merged.get(0).get("c")).toBe(2);
    });

    it("can merge multiple indexed events together", () => {
        const index = new Index("1h-396206");
        const event1 = new Event(index, { a: 5, b: 6 });
        const event2 = new Event(index, { c: 2 });
        const merged = Event.merge([event1, event2]);

        expect(merged[0].get("a")).toBe(5);
        expect(merged[0].get("b")).toBe(6);
        expect(merged[0].get("c")).toBe(2);
    });

    it("can merge multiple timerange events together", () => {
        const beginTime = new Date("2015-04-22T03:30:00Z");
        const endTime = new Date("2015-04-22T13:00:00Z");
        const timerange = new TimeRange(beginTime, endTime);
        const event1 = new Event(timerange, { a: 5, b: 6 });
        const event2 = new Event(timerange, { c: 2 });
        const merged = Event.merge([event1, event2]);

        expect(merged[0].get("a")).toBe(5);
        expect(merged[0].get("b")).toBe(6);
        expect(merged[0].get("c")).toBe(2);
    });

    it("can deeply merge multiple events together", () => {
        const t = new Time(new Date("2015-04-22T03:30:00Z"));
        const event1 = new Event(t, { a: 5, b: { c: 6 } });
        const event2 = new Event(t, { d: 2, b: { e: 4 } });
        const merged = Event.merge([event1, event2], true);

        expect(merged[0].get("a")).toBe(5);
        expect(merged[0].get("b.c")).toBe(6);
        expect(merged[0].get("d")).toBe(2);
        expect(merged[0].get("b.e")).toBe(4);
    });
});

describe("Event list combining", () => {

    it("can sum multiple events together", () => {
        const t = new Time("2015-04-22T03:30:00Z");
        const events = [
            new Event(t, { a: 5, b: 6, c: 7 }),
            new Event(t, { a: 2, b: 3, c: 4 }),
            new Event(t, { a: 1, b: 2, c: 3 })
        ];
        const result = Event.combine(events, sum());

        expect(result[0].get("a")).toBe(8);
        expect(result[0].get("b")).toBe(11);
        expect(result[0].get("c")).toBe(14);
    });

    it("can sum multiple events together using an Immutable.List", () => {
        const t = new Time("2015-04-22T03:30:00Z");
        const events = [
            new Event(t, { a: 5, b: 6, c: 7 }),
            new Event(t, { a: 2, b: 3, c: 4 }),
            new Event(t, { a: 1, b: 2, c: 3 })
        ];
        const result = Event.combine(Immutable.List(events), sum());
        expect(result.getIn([0, "a"])).toBe(8);
        expect(result.getIn([0, "b"])).toBe(11);
        expect(result.getIn([0, "c"])).toBe(14);
    });

    it("can pass no events to sum and get back an empty list", () => {
        const t = new Date("2015-04-22T03:30:00Z");
        const events = [];
        const result1 = Event.combine(events, sum());
        expect(result1.length).toBe(0);

        const result2 = Event.combine(Immutable.List(events), sum());
        expect(result2.size).toBe(0);
    });

    it("can sum multiple indexed events together", () => {
        const events = [
            new Event(new Index("1d-1234"), { a: 5, b: 6, c: 7 }),
            new Event(new Index("1d-1234"), { a: 2, b: 3, c: 4 }),
            new Event(new Index("1d-1235"), { a: 1, b: 2, c: 3 })
        ];
        const result = Event.combine(events, sum());

        expect(result.length).toEqual(2);

        expect(`${result[0].key().toString()}`).toBe("1d-1234");
        expect(result[0].get("a")).toBe(7);
        expect(result[0].get("b")).toBe(9);
        expect(result[0].get("c")).toBe(11);

        expect(`${result[1].key().toString()}`).toBe("1d-1235");
        expect(result[1].get("a")).toBe(1);
        expect(result[1].get("b")).toBe(2);
        expect(result[1].get("c")).toBe(3);
    });

    it("can sum multiple events together if they have different timestamps", () => {
        const t1 = new Time("2015-04-22T03:30:00Z");
        const t2 = new Time("2015-04-22T04:00:00Z");
        const t3 = new Time("2015-04-22T04:30:00Z");
        const events = [
            new Event(t1, { a: 5, b: 6, c: 7 }),
            new Event(t1, { a: 2, b: 3, c: 4 }),
            new Event(t3, { a: 1, b: 2, c: 3 })
        ];
        const result = Event.combine(events, sum());

        expect(result[0].get("a")).toBe(7);
    });
});

const t1 = new Time(1445449170000);
const t2 = new Time(1445449200000);
const t3 = new Time(1445449230000);
const t4 = new Time(1445449260000);

const EVENTS = [];
EVENTS.push(new Event(t1, {
    name: "source1",
    in: 2,
    out: 11
}));
EVENTS.push(new Event(t2, {
    name: "source1",
    in: 4,
    out: 13
}));
EVENTS.push(new Event(t3, {
    name: "source1",
    in: 6,
    out: 15
}));
EVENTS.push(new Event(t4, {
    name: "source1",
    in: 8,
    out: 18
}));

const EVENT_LIST = Immutable.List(EVENTS);

describe("Event list map generation", () => {

    it("should generate the correct key values for a string selector", () => {
        console.log("Map:", Event.map(EVENT_LIST, ["in", "out"]));
        expect(Event.map(EVENT_LIST, ["in"])).toEqual({ in: [2, 4, 6, 8] });
    });

    it("should generate the correct key values for a string selector", () => {
        expect(Event.map(EVENT_LIST, ["in", "out"])).toEqual({
            in: [2, 4, 6, 8],
            out: [11, 13, 15, 18]
        });
    });

    it("should be able to run a simple aggregation calculation", () => {
        const result = Event.aggregate(EVENT_LIST, avg(), ["in", "out"]);
        expect(result).toEqual({ in: 5, out: 14.25 });
    });

});
