declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;
import * as _ from "lodash";

import { collection, Collection } from "../src/collection";
import { duration } from "../src/duration";
import { event, Event } from "../src/event";
import { avg, count, keep, sum } from "../src/functions";
import { grouped, GroupedCollection } from "../src/grouped";
import { index, Index } from "../src/index";
import { period } from "../src/period";
import { stream } from "../src/stream";
import { time, Time } from "../src/time";
import { TimeRange } from "../src/timerange";
import { Trigger, WindowingOptions } from "../src/types";
import { window } from "../src/window";

import { AlignmentMethod, TimeAlignment } from "../src/types";

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
            .output(e => {
                result.push(e);
            });

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
        const source = stream()
            .groupByWindow({
                window: everyThirtyMinutes,
                trigger: Trigger.perEvent
            })
            .output((c, key) => {
                result[key] = c as Collection<Time>;
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
            .output(evt => {
                const e = evt as Event<Index>;
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
            .output(evt => {
                const e = evt as Event<Time>;
                result.push(e);
            });

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
            .output(evt => {
                const e = evt as Event<Time>;
                result.push(e);
            });

        eventsIn.forEach(e => source.addEvent(e));

        expect(result[0].get("a")).toEqual(10);

        expect(result[1].get("a")).toEqual(20);
        expect(result[2].get("a")).toEqual(21);

        expect(result[3].get("a")).toEqual(30);
        expect(result[4].get("a")).toEqual(31);
        expect(result[5].get("a")).toEqual(32);
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
            .output(e => {
                result.push(e);
            });

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
});

/*
    // TODO: Streaming grouping

        it("can do streaming aggregation with grouping", () => {
            const eventsIn = [
                // tslint:disable:max-line-length
                event(
                    time(Date.UTC(2015, 2, 14, 7, 57, 0)),
                    Immutable.Map({ type: "a", in: 3, out: 1 })
                ),
                event(
                    time(Date.UTC(2015, 2, 14, 7, 58, 0)),
                    Immutable.Map({ type: "a", in: 9, out: 2 })
                ),
                event(
                    time(Date.UTC(2015, 2, 14, 7, 59, 0)),
                    Immutable.Map({ type: "b", in: 6, out: 6 })
                ),
                event(
                    time(Date.UTC(2015, 2, 14, 8, 0, 0)),
                    Immutable.Map({ type: "a", in: 4, out: 7 })
                ),
                event(
                    time(Date.UTC(2015, 2, 14, 8, 1, 0)),
                    Immutable.Map({ type: "b", in: 5, out: 9 })
                )
            ];

            let result: Collection<Index>;

            const source = stream()
                .emitPerEvent()
                .groupBy("type")
                .fixedWindow(period("1h"))
                .aggregate({
                    type: ["type", keep()],
                    in_avg: ["in", avg()],
                    out_avg: ["out", avg()]
                })
                .output(collection => {
                    result = collection as Collection<Index>;
                });

            eventsIn.forEach(event => source.addEvent(event));

            expect(result.at(0).get("type")).toBe("a");
            expect(result.at(0).get("in_avg")).toBe(6);
            expect(result.at(0).get("out_avg")).toBe(1.5);
            expect(result.at(0).getKey().asString()).toBe("1h-396199");

            expect(result.at(1).get("type")).toBe("a");
            expect(result.at(1).get("in_avg")).toBe(4);
            expect(result.at(1).get("out_avg")).toBe(7);
            expect(result.at(1).getKey().asString()).toBe("1h-396200");

            expect(result.at(3).get("type")).toBe("b");
            expect(result.at(2).get("in_avg")).toBe(6);
            expect(result.at(2).get("out_avg")).toBe(6);
            expect(result.at(2).getKey().asString()).toBe("1h-396199");

            expect(result.at(3).get("type")).toBe("b");
            expect(result.at(3).get("in_avg")).toBe(5);
            expect(result.at(3).get("out_avg")).toBe(9);
            expect(result.at(3).getKey().asString()).toBe("1h-396200");
        });
    });
});
*/
