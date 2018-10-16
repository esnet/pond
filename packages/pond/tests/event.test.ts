declare const describe: any;
declare const it: any;
declare const expect: any;

import * as Immutable from "immutable";

import { event, Event, timeEvent } from "../src/event";
import { avg, sum } from "../src/functions";
import { index } from "../src/index";
import { time } from "../src/time";
import { timerange } from "../src/timerange";

const DATE = new Date("2015-04-22T03:30:00Z");

const DEEP_EVENT_DATA = Immutable.fromJS({
    NorthRoute: { in: 123, out: 456 },
    SouthRoute: { in: 654, out: 223 }
});

const ALT_DEEP_EVENT_DATA = Immutable.fromJS({
    NorthRoute: { in: 100, out: 456 },
    SouthRoute: { in: 654, out: 200 }
});

const OUTAGE_EVENT_LIST = {
    status: "OK",
    outageList: [
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
        const event1 = event(time(DATE), DEEP_EVENT_DATA);
        const event2 = event(time(DATE), DEEP_EVENT_DATA);
        const event3 = event(time(DATE), ALT_DEEP_EVENT_DATA);
        expect(Event.is(event1, event2)).toBeTruthy();
        expect(Event.is(event1, event3)).toBeFalsy();
    });

    it("can detect duplicated event", () => {
        const e1 = event(time(DATE), Immutable.Map({ a: 5, b: 6, c: 7 }));
        const e2 = event(time(DATE), Immutable.Map({ a: 5, b: 6, c: 7 }));
        const e3 = event(time(DATE), Immutable.Map({ a: 6, b: 6, c: 7 }));

        // Just check times and type
        expect(Event.isDuplicate(e1, e2)).toBeTruthy();
        expect(Event.isDuplicate(e1, e3)).toBeTruthy();

        // Check times, type and values
        expect(Event.isDuplicate(e1, e3, false)).toBeFalsy();
        expect(Event.isDuplicate(e1, e2, false)).toBeTruthy();
    });
});

describe("Time Events", () => {
    it("can create a time event", () => {
        const t = time(new Date(1487983075328));
        const e = event(t, Immutable.Map({ name: "bob" }));
        expect(e.toString()).toEqual(`{"time":1487983075328,"data":{"name":"bob"}}`);
    });

    it("can create a time event with a serialized object", () => {
        const e = timeEvent({
            time: 1487983075328,
            data: { a: 2, b: 3 }
        });
        expect(e.toString()).toEqual(`{\"time\":1487983075328,\"data\":{\"a\":2,\"b\":3}}`);
    });

    it("can set a new value", () => {
        const t = time(new Date(1487983075328));
        const e = event(t, Immutable.Map({ name: "bob" }));
        const ee = e.set("name", "fred");
        expect(ee.toString()).toEqual(`{"time":1487983075328,"data":{"name":"fred"}}`);
    });

    it("can create a Event<Time>, with deep data", () => {
        const timestamp = time(DATE);
        const event1 = event(timestamp, DEEP_EVENT_DATA);
        expect(event1.get("NorthRoute").toJS()).toEqual({ in: 123, out: 456 });
        expect(event1.get("SouthRoute").toJS()).toEqual({ in: 654, out: 223 });
    });

    it("can use dot notation to get values in deep data", () => {
        const timestamp = time(new Date("2015-04-22T03:30:00Z"));
        const event1 = event(timestamp, DEEP_EVENT_DATA);
        const eventValue = event1.get(["NorthRoute", "in"]);
        expect(eventValue).toBe(123);
    });
});

describe("Indexed Events", () => {
    it("can create an IndexedEvent using a existing Index and data", () => {
        const event1 = event(index("1d-12355"), Immutable.Map({ value: 42 }));
        const expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
        const e = event1.getKey().toTimeRange();
        expect(e.toUTCString()).toBe(expected);
        expect(event1.get("value")).toBe(42);
    });
});

describe("TimeRange Events", () => {
    it("can create a TimeRange Event using a object", () => {
        // Pick one event
        const sampleEvent = Immutable.Map(OUTAGE_EVENT_LIST.outageList[0]);

        // Extract the begin and end times  TODO: Fix the ts warning here
        // @ts-ignore
        const beginTime = new Date(sampleEvent.get("start_time"));
        // @ts-ignore
        const endTime = new Date(sampleEvent.get("end_time"));
        const e = event(timerange(beginTime, endTime), sampleEvent);

        // tslint:disable-next-line:max-line-length
        const expected = `{"timerange":[1429673400000,1429707600000],"data":{"external_ticket":"","start_time":"2015-04-22T03:30:00Z","completed":true,"end_time":"2015-04-22T13:00:00Z","organization":"Internet2 / Level 3","title":"STAR-CR5 < 100 ge 06519 > ANL  - Outage","type":"U","esnet_ticket":"ESNET-20150421-013","description":"At 13:33 pacific circuit 06519 went down."}}`;

        expect(`${e}`).toBe(expected);
        expect(e.begin().getTime()).toBe(1429673400000);
        expect(e.end().getTime()).toBe(1429707600000);
        expect(e.getKey().humanizeDuration()).toBe("10 hours");
        expect(e.get("title")).toBe("STAR-CR5 < 100 ge 06519 > ANL  - Outage");
    });
});

describe("Event list merge", () => {
    it("can merge multiple events together", () => {
        const t = time(new Date("2015-04-22T03:30:00Z"));
        const event1 = event(t, Immutable.Map({ a: 5, b: 6 }));
        const event2 = event(t, Immutable.Map({ c: 2 }));
        const merged = Event.merge(Immutable.List([event1, event2]));

        expect(merged.get(0).get("a")).toBe(5);
        expect(merged.get(0).get("b")).toBe(6);
        expect(merged.get(0).get("c")).toBe(2);
    });

    it("can merge multiple indexed events together", () => {
        const event1 = event(index("1h-396206"), Immutable.Map({ a: 5, b: 6 }));
        const event2 = event(index("1h-396206"), Immutable.Map({ c: 2 }));
        const merged = Event.merge(Immutable.List([event1, event2]));

        expect(merged.get(0).get("a")).toBe(5);
        expect(merged.get(0).get("b")).toBe(6);
        expect(merged.get(0).get("c")).toBe(2);
    });

    it("can merge multiple timerange events together", () => {
        const beginTime = new Date("2015-04-22T03:30:00Z");
        const endTime = new Date("2015-04-22T13:00:00Z");
        const tr = timerange(beginTime, endTime);
        const event1 = event(tr, Immutable.Map({ a: 5, b: 6 }));
        const event2 = event(tr, Immutable.Map({ c: 2 }));
        const merged = Event.merge(Immutable.List([event1, event2]));

        expect(merged.get(0).get("a")).toBe(5);
        expect(merged.get(0).get("b")).toBe(6);
        expect(merged.get(0).get("c")).toBe(2);
    });

    it("can deeply merge multiple events together", () => {
        const t = time(new Date("2015-04-22T03:30:00Z"));
        const event1 = event(t, Immutable.fromJS({ a: 5, b: { c: 6 } }));
        const event2 = event(t, Immutable.fromJS({ d: 2, b: { e: 4 } }));
        const merged = Event.merge(Immutable.List([event1, event2]), true);

        expect(merged.get(0).get("a")).toBe(5);
        expect(merged.get(0).get("b.c")).toBe(6);
        expect(merged.get(0).get("d")).toBe(2);
        expect(merged.get(0).get("b.e")).toBe(4);
    });
});

describe("Event field collapsing", () => {
    it("can collapse fields down to a single field using an aggregation function", () => {
        const t = time(new Date("2015-04-22T03:30:00Z"));
        const e = event(t, Immutable.Map({ a: 5, b: 6, c: 7 }));
        const result = e.collapse(["a", "b"], "result", avg());

        expect(result.get(["result"])).toBe(5.5);
    });

    it("can sum multiple events together using an Immutable.List", () => {
        const t = time(new Date("2015-04-22T03:30:00Z"));
        const e = event(t, Immutable.Map({ in: 5, out: 6, status: "ok" }));
        const result = e.collapse(["in", "out"], "total", sum(), true);

        expect(result.get(["in"])).toBe(5);
        expect(result.get(["out"])).toBe(6);
        expect(result.get(["status"])).toBe("ok");
        expect(result.get(["total"])).toBe(11);
    });
});

describe("Event field selecting", () => {
    it("can select a subset of fields", () => {
        const t = time(new Date("2015-04-22T03:30:00Z"));
        const e = event(t, Immutable.Map({ a: 5, b: 6, c: 7 }));
        const result = e.select(["a", "b"]);

        expect(result.get("a")).toBe(5);
        expect(result.get("b")).toBe(6);
        expect(result.get("c")).toBeUndefined();
    });
});

describe("Event list combining", () => {
    it("can sum multiple events together using an Immutable.List", () => {
        const t = time("2015-04-22T03:30:00Z");
        const events = [
            event(t, Immutable.Map({ a: 5, b: 6, c: 7 })),
            event(t, Immutable.Map({ a: 2, b: 3, c: 4 })),
            event(t, Immutable.Map({ a: 1, b: 2, c: 3 }))
        ];
        const result = Event.combine(Immutable.List(events), sum());

        expect(result.get(0).get("a")).toBe(8);
        expect(result.get(0).get("b")).toBe(11);
        expect(result.get(0).get("c")).toBe(14);
    });

    it("can pass no events to sum and get back an empty list", () => {
        const t = new Date("2015-04-22T03:30:00Z");
        const events = Immutable.List();
        const result1 = Event.combine(events, sum());
        expect(result1.size).toBe(0);

        const result2 = Event.combine(Immutable.List(events), sum());
        expect(result2.size).toBe(0);
    });

    it("can sum multiple indexed events together", () => {
        const events = Immutable.List([
            event(index("1d-1234"), Immutable.Map({ a: 5, b: 6, c: 7 })),
            event(index("1d-1234"), Immutable.Map({ a: 2, b: 3, c: 4 })),
            event(index("1d-1235"), Immutable.Map({ a: 1, b: 2, c: 3 }))
        ]);

        const result = Event.combine(events, sum());

        expect(result.size).toEqual(2);
        expect(`${result.get(0).getKey()}`).toBe("1d-1234");
        expect(result.get(0).get("a")).toBe(7);
        expect(result.get(0).get("b")).toBe(9);
        expect(result.get(0).get("c")).toBe(11);
        expect(`${result.get(1).getKey()}`).toBe("1d-1235");
        expect(result.get(1).get("a")).toBe(1);
        expect(result.get(1).get("b")).toBe(2);
        expect(result.get(1).get("c")).toBe(3);
    });

    it("can sum multiple events together if they have different timestamps", () => {
        const ts1 = time("2015-04-22T03:30:00Z");
        const ts2 = time("2015-04-22T04:00:00Z");
        const ts3 = time("2015-04-22T04:30:00Z");
        const events = Immutable.List([
            event(ts1, Immutable.Map({ a: 5, b: 6, c: 7 })),
            event(ts1, Immutable.Map({ a: 2, b: 3, c: 4 })),
            event(ts3, Immutable.Map({ a: 1, b: 2, c: 3 }))
        ]);
        const result = Event.combine(events, sum());
        expect(result.get(0).get("a")).toBe(7);
    });
});

const t1 = time(1445449170000);
const t2 = time(1445449200000);
const t3 = time(1445449230000);
const t4 = time(1445449260000);

const EVENTS = [];
EVENTS.push(
    event(
        t1,
        Immutable.Map({
            name: "source1",
            in: 2,
            out: 11
        })
    )
);
EVENTS.push(
    event(
        t2,
        Immutable.Map({
            name: "source1",
            in: 4,
            out: 13
        })
    )
);
EVENTS.push(
    event(
        t3,
        Immutable.Map({
            name: "source1",
            in: 6,
            out: 15
        })
    )
);
EVENTS.push(
    event(
        t4,
        Immutable.Map({
            name: "source1",
            in: 8,
            out: 18
        })
    )
);

const EVENT_LIST = Immutable.List(EVENTS);

describe("Event list map generation", () => {
    it("should generate the correct key values for a string selector", () => {
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
