declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import * as Immutable from "immutable";
import Moment = moment.Moment;
import * as _ from "lodash";
import * as moment from "moment";

import { collection, Collection } from "../src/collection";
import { duration } from "../src/duration";
import { event, Event } from "../src/event";
import { avg, count, keep, sum } from "../src/functions";
import { grouped, GroupedCollection } from "../src/groupedcollection";
import { index, Index } from "../src/index";
import { period } from "../src/period";
import { stream } from "../src/stream";
import { time, Time } from "../src/time";
import { TimeRange } from "../src/timerange";
import { Trigger, WindowingOptions } from "../src/types";
import { window } from "../src/window";

import { AlignmentMethod, TimeAlignment } from "../src/types";

const streamingEvents = [
    event(time(0), Immutable.Map({ count: 5, value: 1 })),
    event(time(30000), Immutable.Map({ count: 3, value: 3 })),
    event(time(60000), Immutable.Map({ count: 4, value: 10 })),
    event(time(90000), Immutable.Map({ count: 1, value: 40 })),
    event(time(120000), Immutable.Map({ count: 5, value: 70 })),
    event(time(150000), Immutable.Map({ count: 3, value: 130 })),
    event(time(180000), Immutable.Map({ count: 2, value: 190 })),
    event(time(210000), Immutable.Map({ count: 6, value: 220 })),
    event(time(240000), Immutable.Map({ count: 1, value: 300 })),
    event(time(270000), Immutable.Map({ count: 0, value: 390 })),
    event(time(300000), Immutable.Map({ count: 2, value: 510 }))
];

describe("Streaming", () => {
    it("can do streaming of just events", () => {
        const SIMPLE_GAP_DATA = [
            [1471824030000, 0.75], // 00:00:30
            [1471824105000, 2], // 00:01:45
            [1471824210000, 1], // 00:03:30
            [1471824390000, 1], // 00:06:30
            [1471824510000, 3], // 00:08:30
            [1471824525000, 5] // 00:08:45
        ];

        const list = SIMPLE_GAP_DATA.map(e => {
            return event(time(e[0]), Immutable.Map({ value: e[1] }));
        });

        const result = [];
        const everyMinute = period(duration("1m"));
        const s = stream()
            .align({
                fieldSpec: "value",
                period: everyMinute,
                method: AlignmentMethod.Linear
            })
            .rate({ fieldSpec: "value", allowNegative: false })
            .output(e => result.push(e));

        list.forEach(e => {
            s.addEvent(e);
        });

        expect(result[0].get("value_rate")).toEqual(0.01011904761904762);
        expect(result[1].get("value_rate")).toBeNull();
        expect(result[2].get("value_rate")).toBeNull();
        expect(result[3].get("value_rate")).toEqual(0);
        expect(result[4].get("value_rate")).toEqual(0);
        expect(result[5].get("value_rate")).toEqual(0.008333333333333333);
        expect(result[6].get("value_rate")).toEqual(0.016666666666666666);
    });

    it("can do build keyed collection pairs", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 7, 57, 0)), Immutable.Map({ in: 3, out: 1 })),
            event(time(Date.UTC(2015, 2, 14, 7, 58, 0)), Immutable.Map({ in: 9, out: 2 })),
            event(time(Date.UTC(2015, 2, 14, 7, 59, 0)), Immutable.Map({ in: 6, out: 6 })),
            event(time(Date.UTC(2015, 2, 14, 8, 0, 0)), Immutable.Map({ in: 4, out: 7 })),
            event(time(Date.UTC(2015, 2, 14, 8, 1, 0)), Immutable.Map({ in: 5, out: 9 }))
        ];

        const result: { [key: string]: Collection<Time> } = {};
        const everyThirtyMinutes = window(duration("30m"));
        let calls = 0;
        const source = stream<Time>()
            .groupByWindow({
                window: everyThirtyMinutes,
                trigger: Trigger.perEvent
            })
            .output((c, key) => {
                result[key] = c;
                calls += 1;
            });

        eventsIn.forEach(e => source.addEvent(e));

        expect(result["30m-792399"].size()).toEqual(3);
        expect(result["30m-792400"].size()).toEqual(2);
        expect(calls).toEqual(eventsIn.length);
    });

    it("can do streaming aggregation per event", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 7, 57, 0)), Immutable.Map({ in: 3, out: 1 })),
            event(time(Date.UTC(2015, 2, 14, 7, 58, 0)), Immutable.Map({ in: 9, out: 2 })),
            event(time(Date.UTC(2015, 2, 14, 7, 59, 0)), Immutable.Map({ in: 6, out: 6 })),
            event(time(Date.UTC(2015, 2, 14, 8, 0, 0)), Immutable.Map({ in: 4, out: 7 })),
            event(time(Date.UTC(2015, 2, 14, 8, 1, 0)), Immutable.Map({ in: 5, out: 9 }))
        ];

        const result: { [key: string]: Event<Index> } = {};
        const everyThirtyMinutes = window(duration("30m"));
        let calls = 0;
        const source = stream<Time>()
            .groupByWindow({
                window: everyThirtyMinutes,
                trigger: Trigger.perEvent
            })
            .aggregate({
                in_avg: ["in", avg()],
                out_avg: ["out", avg()]
            })
            .output(e => {
                result[e.getKey().toString()] = e;
                calls += 1;
            });

        eventsIn.forEach(e => source.addEvent(e));

        expect(result["30m-792399"].get("in_avg")).toEqual(6);
        expect(result["30m-792399"].get("out_avg")).toEqual(3);
        expect(result["30m-792400"].get("in_avg")).toEqual(4.5);
        expect(result["30m-792400"].get("out_avg")).toEqual(8);
        expect(calls).toEqual(eventsIn.length);
    });

    it("can do streaming aggregation on discards", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 7, 57, 0)), Immutable.Map({ in: 3, out: 1 })),
            event(time(Date.UTC(2015, 2, 14, 7, 58, 0)), Immutable.Map({ in: 9, out: 2 })),
            event(time(Date.UTC(2015, 2, 14, 7, 59, 0)), Immutable.Map({ in: 6, out: 6 })),
            event(time(Date.UTC(2015, 2, 14, 8, 0, 0)), Immutable.Map({ in: 4, out: 7 })),
            event(time(Date.UTC(2015, 2, 14, 8, 1, 0)), Immutable.Map({ in: 5, out: 9 })),
            event(time(Date.UTC(2015, 2, 14, 8, 31, 0)), Immutable.Map({ in: 0, out: 0 }))
        ];

        const result: { [key: string]: Event<Index> } = {};
        let outputCalls = 0;
        const everyThirtyMinutes = window(duration("30m"));

        const source = stream<Time>()
            .groupByWindow({
                window: everyThirtyMinutes,
                trigger: Trigger.onDiscardedWindow
            })
            .aggregate({
                in_avg: ["in", avg()],
                out_avg: ["out", avg()]
            })
            .output(evt => {
                const e = evt as Event<Index>;
                result[e.getKey().toString()] = e;
                outputCalls += 1;
            });

        eventsIn.forEach(e => source.addEvent(e));

        expect(outputCalls).toBe(2); // .output should be called twice
        expect(result["30m-792399"].get("in_avg")).toEqual(6);
        expect(result["30m-792399"].get("out_avg")).toEqual(3);
        expect(result["30m-792400"].get("in_avg")).toEqual(4.5);
        expect(result["30m-792400"].get("out_avg")).toEqual(8);
    });
    it("can do streaming event remapping", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 7, 57, 0)), Immutable.Map({ a: 1 })),
            event(time(Date.UTC(2015, 2, 14, 7, 58, 0)), Immutable.Map({ a: 2 })),
            event(time(Date.UTC(2015, 2, 14, 7, 59, 0)), Immutable.Map({ a: 3 }))
        ];

        const result: Event[] = [];

        const source = stream<Time>()
            .map(e => event(e.getKey(), Immutable.Map({ a: e.get("a") * 2 })))
            .output(e => result.push(e));

        eventsIn.forEach(e => source.addEvent(e));

        expect(result[0].get("a")).toEqual(2);
        expect(result[1].get("a")).toEqual(4);
        expect(result[2].get("a")).toEqual(6);
    });

    it("can do streaming event flatmap", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 7, 57, 0)), Immutable.Map({ a: 1 })),
            event(time(Date.UTC(2015, 2, 14, 7, 58, 0)), Immutable.Map({ a: 2 })),
            event(time(Date.UTC(2015, 2, 14, 7, 59, 0)), Immutable.Map({ a: 3 }))
        ];

        const result: Event[] = [];

        const source = stream<Time>()
            .flatMap(e => {
                let eventList = Immutable.List<Event<Time>>();
                const num = e.get("a");
                for (let i = 0; i < num; i++) {
                    eventList = eventList.push(
                        event(e.getKey(), Immutable.Map({ a: num * 10 + i }))
                    );
                }
                return eventList;
            })
            .output(e => result.push(e));

        eventsIn.forEach(e => source.addEvent(e));

        expect(result[0].get("a")).toEqual(10);

        expect(result[1].get("a")).toEqual(20);
        expect(result[2].get("a")).toEqual(21);

        expect(result[3].get("a")).toEqual(30);
        expect(result[4].get("a")).toEqual(31);
        expect(result[5].get("a")).toEqual(32);
    });

    it("can do filtering on a stream of events", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 7, 31, 0)), Immutable.Map({ a: 1 })),
            event(time(Date.UTC(2015, 2, 14, 7, 32, 0)), Immutable.Map({ a: 2 })),
            event(time(Date.UTC(2015, 2, 14, 7, 33, 0)), Immutable.Map({ a: 3 })),
            event(time(Date.UTC(2015, 2, 14, 7, 34, 0)), Immutable.Map({ a: 4 })),
            event(time(Date.UTC(2015, 2, 14, 7, 35, 0)), Immutable.Map({ a: 5 }))
        ];

        const result: Event[] = [];

        const source = stream<Time>()
            .filter(e => e.get("a") % 2 !== 0)
            .output(e => result.push(e));

        eventsIn.forEach(e => source.addEvent(e));

        expect(result[0].get("a")).toEqual(1);
        expect(result[1].get("a")).toEqual(3);
        expect(result[2].get("a")).toEqual(5);
    });

    it("can selection of specific event fields", () => {
        const DATA = [[1471824030000, 1, 2, 3], [1471824105000, 4, 5, 6], [1471824210000, 7, 8, 9]];

        const list = DATA.map(e => {
            return event(time(e[0]), Immutable.Map({ a: e[1], b: e[2], c: e[3] }));
        });

        const result = [];

        const s = stream()
            .select({
                fields: ["b", "c"]
            })
            .output(e => result.push(e));

        list.forEach(e => {
            s.addEvent(e);
        });

        expect(result.length).toBe(3);

        expect(result[0].get("a")).toBeUndefined();
        expect(result[0].get("b")).toBe(2);
        expect(result[0].get("c")).toBe(3);

        expect(result[2].get("a")).toBeUndefined();
        expect(result[2].get("b")).toBe(8);
        expect(result[2].get("c")).toBe(9);
    });

    it("can collapse of specific event fields", () => {
        const DATA = [[1471824030000, 1, 2, 3], [1471824105000, 4, 5, 6], [1471824210000, 7, 8, 9]];

        const list = DATA.map(e => {
            return event(time(e[0]), Immutable.Map({ a: e[1], b: e[2], c: e[3] }));
        });

        const result = [];

        const s = stream()
            .collapse({
                fieldSpecList: ["a", "b"],
                fieldName: "ab",
                reducer: sum(),
                append: false
            })
            .output(e => {
                result.push(e);
            });

        list.forEach(e => {
            s.addEvent(e);
        });

        expect(result.length).toBe(3);

        expect(result[0].get("ab")).toBe(3);
        expect(result[1].get("ab")).toBe(9);
        expect(result[2].get("ab")).toBe(15);
    });
    it("can process a sliding window", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 1, 15, 0)), Immutable.Map({ in: 1, out: 6 })),
            event(time(Date.UTC(2015, 2, 14, 1, 16, 0)), Immutable.Map({ in: 2, out: 7 })),
            event(time(Date.UTC(2015, 2, 14, 1, 17, 0)), Immutable.Map({ in: 3, out: 8 })),
            event(time(Date.UTC(2015, 2, 14, 1, 18, 0)), Immutable.Map({ in: 4, out: 9 })),
            event(time(Date.UTC(2015, 2, 14, 1, 19, 0)), Immutable.Map({ in: 5, out: 10 }))
        ];

        const result: { [key: string]: Collection<Time> } = {};
        const slidingWindow = window(duration("3m"), period(duration("1m")));
        const fixedHourlyWindow = window(duration("1h"));
        let calls = 0;
        const source = stream()
            .groupByWindow({
                window: slidingWindow,
                trigger: Trigger.onDiscardedWindow
            })
            .aggregate({
                in_avg: ["in", avg()],
                out_avg: ["out", avg()],
                count: ["in", count()]
            })
            .map(e => new Event<Time>(time(e.timerange().end()), e.getData()))
            .groupByWindow({
                window: fixedHourlyWindow,
                trigger: Trigger.perEvent
            })
            .output((col, key) => {
                result[key] = col as Collection<Time>;
                calls += 1;
            });

        eventsIn.forEach(e => source.addEvent(e));

        const c = result["1h-396193"];
        expect(c.size()).toBe(4);

        expect(+c.at(0).timestamp()).toBe(1426295760000);
        expect(c.at(0).get("in_avg")).toBe(1);
        expect(c.at(0).get("count")).toBe(1);

        expect(+c.at(1).timestamp()).toBe(1426295820000);
        expect(c.at(1).get("in_avg")).toBe(1.5);
        expect(c.at(1).get("count")).toBe(2);

        expect(+c.at(2).timestamp()).toBe(1426295880000);
        expect(c.at(2).get("in_avg")).toBe(2);
        expect(c.at(2).get("count")).toBe(3);

        expect(+c.at(3).timestamp()).toBe(1426295940000);
        expect(c.at(3).get("in_avg")).toBe(3);
        expect(c.at(3).get("count")).toBe(3);
    });

    it("can process a running total using the straeam reduce() function", () => {
        const results = [];

        const source = stream()
            .reduce({
                count: 1,
                accumulator: event(time(), Immutable.Map({ total: 0 })),
                iteratee(accum, eventList) {
                    const current = eventList.get(0);
                    const total = accum.get("total") + current.get("count");
                    return event(time(current.timestamp()), Immutable.Map({ total }));
                }
            })
            .output(e => results.push(e));

        // Stream events
        streamingEvents.forEach(e => source.addEvent(e));

        expect(results[0].get("total")).toBe(5);
        expect(results[5].get("total")).toBe(21);
        expect(results[10].get("total")).toBe(32);
    });

    it("can process a rolling average of the last 5 points", () => {
        const results = [];

        const source = stream()
            .reduce({
                count: 5,
                iteratee(accum, eventList) {
                    const values = eventList.map(e => e.get("value")).toJS();
                    return event(
                        time(eventList.last().timestamp()),
                        Immutable.Map({ avg: avg()(values) })
                    );
                }
            })
            .output(e => results.push(e));

        // Stream events
        streamingEvents.forEach(e => source.addEvent(e));

        expect(results[0].get("avg")).toBe(1);
        expect(results[5].get("avg")).toBe(50.6);
        expect(results[10].get("avg")).toBe(322);
    });

    it("can do a split of two streams", () => {
        const eventsIn = [
            event(time(Date.UTC(2015, 2, 14, 7, 57, 0)), Immutable.Map({ a: 1 })),
            event(time(Date.UTC(2015, 2, 14, 7, 58, 0)), Immutable.Map({ a: 2 })),
            event(time(Date.UTC(2015, 2, 14, 7, 59, 0)), Immutable.Map({ a: 3 }))
        ];

        const result1: Event[] = [];
        const result2: Event[] = [];

        const source = stream<Time>().map(e =>
            event(e.getKey(), Immutable.Map({ a: e.get("a") * 2 }))
        ); // 2, 4, 6

        const branch1 = source
            .map(e => event(e.getKey(), Immutable.Map({ a: e.get("a") * 3 }))) // 6, 12, 18
            .output(e => result1.push(e));

        const branch2 = source
            .map(e => event(e.getKey(), Immutable.Map({ a: e.get("a") * 4 }))) // 8, 16, 24
            .output(e => result2.push(e));

        eventsIn.forEach(e => source.addEvent(e));

        expect(result1[0].get("a")).toBe(6);
        expect(result1[1].get("a")).toBe(12);
        expect(result1[2].get("a")).toBe(18);

        expect(result2[0].get("a")).toBe(8);
        expect(result2[1].get("a")).toBe(16);
        expect(result2[2].get("a")).toBe(24);
    });

    it("can coalese two streams", () => {
        const results = [];

        const streamIn = [
            event(time(Date.UTC(2015, 2, 14, 1, 15, 0)), Immutable.Map({ in: 1 })),
            event(time(Date.UTC(2015, 2, 14, 1, 16, 0)), Immutable.Map({ in: 2 })),
            event(time(Date.UTC(2015, 2, 14, 1, 17, 0)), Immutable.Map({ in: 3 })),
            event(time(Date.UTC(2015, 2, 14, 1, 18, 0)), Immutable.Map({ in: 4 })),
            event(time(Date.UTC(2015, 2, 14, 1, 19, 0)), Immutable.Map({ in: 5 }))
        ];

        const streamOut = [
            event(time(Date.UTC(2015, 2, 14, 1, 15, 0)), Immutable.Map({ out: 9, count: 2 })),
            event(time(Date.UTC(2015, 2, 14, 1, 16, 0)), Immutable.Map({ out: 10, count: 3 })),
            event(time(Date.UTC(2015, 2, 14, 1, 17, 0)), Immutable.Map({ count: 4 })),
            event(time(Date.UTC(2015, 2, 14, 1, 18, 0)), Immutable.Map({ out: 12, count: 5 })),
            event(time(Date.UTC(2015, 2, 14, 1, 19, 0)), Immutable.Map({ out: 13, count: 6 }))
        ];

        const source = stream()
            .coalesce({
                fields: ["in", "out"]
            })
            .output((e: Event) => results.push(e));

        // Stream events
        for (let i = 0; i < 5; i++) {
            source.addEvent(streamIn[i]);
            source.addEvent(streamOut[i]);
        }

        expect(results.length).toBe(10);
        expect(results[5].get("in")).toBe(3);
        expect(results[5].get("out")).toBe(10);
        expect(results[8].get("in")).toBe(5);
        expect(results[8].get("out")).toBe(12);
        expect(results[9].get("in")).toBe(5);
        expect(results[9].get("out")).toBe(13);
    });
});
