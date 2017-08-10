declare const describe: any;
declare const it: any;
declare const fit: any;
declare const expect: any;
declare const beforeEach: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

import { collection } from "../src/collection";
import { event } from "../src/event";
import { avg, sum } from "../src/functions";
import { AggregationSpec } from "../src/grouped";
import { index, Index } from "../src/index";
import { duration } from "../src/duration";
import { time, Time } from "../src/time";
import { TimeRange } from "../src/timerange";

import { TimeAlignment } from "../src/types";

describe("Collection", () => {
    describe("Creation", () => {
        it("can remap keys", () => {
            const c1 = collection(
                Immutable.List([
                    event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 6 })),
                    event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 4, b: 2 }))
                ])
            );

            const c2 = c1.mapKeys<TimeRange>(t =>
                t.toTimeRange(duration("1h"), TimeAlignment.Middle)
            );

            expect(c2.at(0).getKey().toUTCString()).toBe(
                "[Wed, 22 Apr 2015 03:00:00 GMT, Wed, 22 Apr 2015 04:00:00 GMT]"
            );
        });

        it("can make an empty collection and add events to it", () => {
            const c = collection(
                Immutable.List([
                    event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 6 })),
                    event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 4, b: 2 }))
                ])
            );

            expect(c.size()).toEqual(2);
            expect(c.at(0).get("a")).toEqual(5);
            expect(c.at(1).get("a")).toEqual(4);
        });

        it("can make a collection from another collection", () => {
            const timestamp1 = new Time("2015-04-22T03:30:00Z");
            const timestamp2 = new Time("2015-04-22T02:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 2 }));

            const c1 = collection().addEvent(e1).addEvent(e2);
            const c2 = collection(c1);

            expect(c2.size()).toEqual(2);
            expect(c2.at(0).get("a")).toEqual(5);
            expect(c2.at(1).get("a")).toEqual(4);
        });

        it("make a collection from List", () => {
            const e1 = event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 4, b: 2 }));
            const eventList = Immutable.List([e1, e2]);
            const c = collection(eventList);

            expect(c.size()).toEqual(2);
            expect(c.at(0).get("a")).toEqual(5);
            expect(c.at(1).get("a")).toEqual(4);
        });
    });

    describe("Conversion", () => {
        it("can convert the collection to a string", () => {
            const e1 = event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 4, b: 2 }));
            const c = collection(Immutable.List([e1, e2]));

            // tslint:disable-next-line:max-line-length
            const expected =
                '[{"time":1429673400000,"data":{"a":5,"b":6}},{"time":1429669800000,"data":{"a":4,"b":2}}]';
            expect(c.toString()).toEqual(expected);
        });
    });

    describe("Persistent changes", () => {
        it("can add an event and de-dup with default latest wins", () => {
            const timestamp1 = time("2015-04-22T03:30:00Z");
            const timestamp2 = time("2015-04-22T02:30:00Z");
            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 2 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 6, b: 3 }));
            const c = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3, true);
            expect(c.size()).toEqual(2);
            expect(c.at(1).get("a")).toEqual(6);
        });

        it("can add an event and de-dup with custom function", () => {
            const timestamp1 = time("2015-04-22T03:30:00Z");
            const timestamp2 = time("2015-04-22T02:30:00Z");
            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 2 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 6, b: 3 }));
            const c = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3, events => {
                const a = events.reduce((sum, e) => sum + e.get("a"), 0);
                return event(timestamp2, Immutable.Map({ a }));
            });
            expect(c.size()).toEqual(2);
            expect(c.at(1).get("a")).toEqual(10);
        });

        it("can add an event and de-dup multiple existing duplicates", () => {
            const timestamp1 = time("2015-04-22T03:30:00Z");
            const timestamp2 = time("2015-04-22T02:30:00Z");
            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 2 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 6, b: 3 }));
            const e4 = event(timestamp2, Immutable.Map({ a: 7, b: 1 }));
            const c = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3);

            const c2 = c.addEvent(e4, events => {
                const a = events.reduce((sum, e) => sum + e.get("a"), 0);
                return event(timestamp2, Immutable.Map({ a }));
            });
            expect(c.size()).toEqual(3);
            expect(c.at(0).get("a")).toEqual(5);
            expect(c.at(1).get("a")).toEqual(4);
            expect(c.at(2).get("a")).toEqual(6);

            expect(c2.size()).toEqual(2);
            expect(c2.at(0).get("a")).toEqual(5);
            expect(c2.at(1).get("a")).toEqual(17);
        });

        it("can use setEvents to replace all events in the collection", () => {
            const timestamp1 = time("2015-04-22T03:30:00Z");
            const timestamp2 = time("2015-04-22T02:30:00Z");

            const e0 = event(timestamp1, Immutable.Map({ a: 1, b: 2 }));
            const c = collection<Time>().addEvent(e0);
            expect(c.size()).toEqual(1);

            // events
            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 2 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 3, b: 2 }));
            const c2 = c.setEvents(Immutable.List([e1, e2, e3]));

            expect(c2.size()).toEqual(3);
            expect(c2.at(0).get("a")).toEqual(5);
            expect(c2.at(1).get("a")).toEqual(4);
            expect(c2.at(2).get("a")).toEqual(3);
        });
    });

    describe("Query", () => {
        it("can return the number of valid events", () => {
            const timestamp1 = new Time("2015-04-22T01:30:00Z");
            const timestamp2 = new Time("2015-04-22T02:30:00Z");
            const timestamp3 = new Time("2015-04-22T03:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: null, b: 2 }));
            const e3 = event(timestamp3, Immutable.Map({ a: 4, b: 2 }));

            const c = collection<Time>(Immutable.List([e1, e2, e3]));

            expect(c.size()).toEqual(3);
            expect(c.sizeValid("a")).toEqual(2);
        });

        it("can return the timerange covered by the collection", () => {
            const t1 = time("2015-04-22T02:30:00Z");
            const t2 = time("2015-04-22T01:30:00Z");
            const t3 = time("2015-04-22T03:30:00Z");

            const e1 = event(t1, Immutable.Map({ a: 8 }));
            const e2 = event(t2, Immutable.Map({ a: 3 }));
            const e3 = event(t3, Immutable.Map({ a: 5 }));

            const timerange = collection(Immutable.List([e1, e2, e3])).timerange();

            expect(timerange.duration()).toEqual(7200000);
            expect(timerange.begin()).toEqual(t2.timestamp());
            expect(timerange.end()).toEqual(t3.timestamp());
        });

        it("can access events using at() and atKey()", () => {
            const timestamp1 = time("2015-04-22T01:30:00Z");
            const timestamp2 = time("2015-04-22T02:30:00Z");
            const timestamp3 = time("2015-04-22T03:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 1 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 2 }));
            const e3 = event(timestamp3, Immutable.Map({ a: 3 }));

            const c = collection(Immutable.List([e1, e2, e2]));

            expect(c.at(1).get("a")).toEqual(2);
            expect(c.atKey(timestamp2).get(0).get("a")).toEqual(2);
        });

        it("can return the first and last events", () => {
            const t1 = new Time("2015-04-22T02:30:00Z");
            const t2 = new Time("2015-04-22T01:30:00Z");
            const t3 = new Time("2015-04-22T03:30:00Z");

            const e1 = event(t1, Immutable.Map({ a: 8 }));
            const e2 = event(t2, Immutable.Map({ a: 3 }));
            const e3 = event(t3, Immutable.Map({ a: 5 }));

            const c = collection(Immutable.List([e1, e2, e3]));

            expect(c.firstEvent().get("a")).toEqual(8);
            expect(c.lastEvent().get("a")).toEqual(5);
        });

        it("can determine if a collection is chronological", () => {
            const unorderedEvents = Immutable.List([
                event(time("2015-04-22T03:31:00Z"), Immutable.Map({ in: 3, out: 4 })),
                event(time("2015-04-22T03:30:00Z"), Immutable.Map({ in: 1, out: 2 })),
                event(time("2015-04-22T03:32:00Z"), Immutable.Map({ in: 5, out: 6 }))
            ]);

            const unsortedCollection = collection(unorderedEvents);
            expect(unsortedCollection.isChronological()).toBeFalsy();
            const sortedCollection = unsortedCollection.sortByKey();
            expect(sortedCollection.isChronological()).toBeTruthy();
        });
    });

    describe("Side effects", () => {
        it("can iterate over the events", () => {
            const timestamp1 = new Time("2015-04-22T01:30:00Z");
            const timestamp2 = new Time("2015-04-22T02:30:00Z");
            const timestamp3 = new Time("2015-04-22T03:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 1 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 2 }));
            const e3 = event(timestamp3, Immutable.Map({ a: 3 }));

            const c = collection(Immutable.List([e1, e2, e3]));

            let sum = 0;
            c.forEach(e => {
                sum = sum + e.get("a");
            });

            expect(sum).toEqual(6);
        });
    });

    describe("Sequence", () => {
        it("can map over the events", () => {
            const timestamp1 = new Time("2015-04-22T01:30:00Z");
            const timestamp2 = new Time("2015-04-22T02:30:00Z");
            const timestamp3 = new Time("2015-04-22T03:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 1 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 2 }));
            const e3 = event(timestamp3, Immutable.Map({ a: 3 }));

            const c = collection(Immutable.List([e1, e2, e3]));

            let i = 1;
            const remapped = c.map(e => {
                return event(e.getKey(), Immutable.Map({ a: 3 * i++ }));
            });

            expect(remapped.at(0).get("a")).toEqual(3);
            expect(remapped.at(1).get("a")).toEqual(6);
            expect(remapped.at(2).get("a")).toEqual(9);
        });

        /*
        it("can filter the collection", () => {
            const t1 = new Time("2015-04-22T02:30:00Z");
            const t2 = new Time("2015-04-22T01:30:00Z");
            const t3 = new Time("2015-04-22T03:30:00Z");

            const e1 = event(t1, { a: 8 });
            const e2 = event(t2, { a: 3 });
            const e3 = event(t3, { a: 5 });

            const filtered = collection<Time>()
                .addEvent(e1)
                .addEvent(e2)
                .addEvent(e3)
                .filter((e) => e.get("a") < 8);

            expect(filtered.size()).toEqual(2);
        });
        */

        it("can sort by time", () => {
            const timestamp1 = new Time("2015-04-22T02:30:00Z");
            const timestamp2 = new Time("2015-04-22T01:30:00Z");
            const timestamp3 = new Time("2015-04-22T03:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 1 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 2 }));
            const e3 = event(timestamp3, Immutable.Map({ a: 3 }));

            const sorted = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3).sortByKey();

            expect(sorted.at(0).get("a")).toEqual(2);
            expect(sorted.at(1).get("a")).toEqual(1);
            expect(sorted.at(2).get("a")).toEqual(3);
        });

        it("can sort by field", () => {
            const timestamp1 = time("2015-04-22T02:30:00Z");
            const timestamp2 = time("2015-04-22T01:30:00Z");
            const timestamp3 = time("2015-04-22T03:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 8 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 3 }));
            const e3 = event(timestamp3, Immutable.Map({ a: 5 }));

            const sorted = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3).sort("a");

            expect(sorted.at(0).get("a")).toEqual(3);
            expect(sorted.at(1).get("a")).toEqual(5);
            expect(sorted.at(2).get("a")).toEqual(8);
        });
    });

    describe("Aggregation", () => {
        const e1 = event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 8, b: 2 }));
        const e2 = event(time("2015-04-22T01:30:00Z"), Immutable.Map({ a: 3, b: 1 }));
        const e3 = event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 5 }));
        const test = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3);

        it("can find the first event", () => {
            expect(test.first("a")).toEqual(8);
            expect(test.first(["a", "b"])).toEqual({ a: 8, b: 2 });
        });

        it("can find the last event", () => {
            expect(test.last("a")).toEqual(5);
            expect(test.last(["a", "b"])).toEqual({ a: 5, b: 5 });
        });

        it("can sum events", () => {
            expect(test.sum("a")).toEqual(16);
            expect(test.sum(["a"])).toEqual({ a: 16 });
            expect(test.sum(["a", "b"])).toEqual({ a: 16, b: 8 });
        });

        it("can average events", () => {
            expect(test.avg("a")).toEqual(5.333333333333333);
            expect(test.avg(["a"])).toEqual({ a: 5.333333333333333 });
            expect(test.avg(["a", "b"])).toEqual({ a: 5.333333333333333, b: 2.6666666666666665 });
        });

        it("can find max events", () => {
            expect(test.max("a")).toEqual(8);
            expect(test.max(["a"])).toEqual({ a: 8 });
            expect(test.max(["a", "b"])).toEqual({ a: 8, b: 5 });
        });

        it("can find min events", () => {
            expect(test.min("a")).toEqual(3);
            expect(test.min(["a"])).toEqual({ a: 3 });
            expect(test.min(["a", "b"])).toEqual({ a: 3, b: 1 });
        });
    });

    describe("Processing", () => {
        it("can collapse events in a Collection", () => {
            const timestamp1 = time("2015-04-22T02:30:00Z");
            const timestamp2 = time("2015-04-22T03:30:00Z");
            const timestamp3 = time("2015-04-22T04:30:00Z");
            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 2 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 6, b: 3 }));

            const c = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3);

            const c1 = c.collapse({
                fieldSpecList: ["a", "b"],
                fieldName: "ab",
                reducer: sum(),
                append: false
            });

            const c2 = c.collapse({
                fieldSpecList: ["a", "b"],
                fieldName: "ab",
                reducer: avg(),
                append: true
            });

            expect(c1.size()).toEqual(3);
            expect(c1.at(0).get("ab")).toEqual(11);
            expect(c1.at(1).get("ab")).toEqual(6);
            expect(c1.at(2).get("ab")).toEqual(9);
            expect(c1.at(0).get("a")).toBeUndefined();

            expect(c2.size()).toEqual(3);
            expect(c2.at(0).get("ab")).toEqual(5.5);
            expect(c2.at(0).get("a")).toEqual(5);
        });

        it("can select fields from events in a Collection", () => {
            const timestamp1 = time("2015-04-22T02:30:00Z");
            const timestamp2 = time("2015-04-22T03:30:00Z");
            const timestamp3 = time("2015-04-22T04:30:00Z");
            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6, c: 7 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 5, c: 6 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 6, b: 3, c: 2 }));

            const c = collection<Time>().addEvent(e1).addEvent(e2).addEvent(e3);

            const c1 = c.select({
                fields: ["b", "c"]
            });

            expect(c1.size()).toEqual(3);
            expect(c1.at(0).get("a")).toBeUndefined();
            expect(c1.at(0).get("b")).toBe(6);
            expect(c1.at(0).get("c")).toBe(7);
            expect(c1.at(2).get("a")).toBeUndefined();
            expect(c1.at(2).get("b")).toBe(3);
            expect(c1.at(2).get("c")).toBe(2);
        });

        it("can use groupBy with a fieldSpec on a Collection", () => {
            const t1 = time("2015-04-22T02:30:00Z");
            const t2 = time("2015-04-22T03:30:00Z");
            const t3 = time("2015-04-22T04:30:00Z");

            const e1 = event(t1, Immutable.Map({ team: "raptors", a: 3, b: 1 }));
            const e2 = event(t2, Immutable.Map({ team: "raptors", a: 4, b: 2 }));
            const e3 = event(t1, Immutable.Map({ team: "dragons", a: 6, b: 3 }));
            const e4 = event(t2, Immutable.Map({ team: "dragons", a: 7, b: 4 }));
            const e5 = event(t3, Immutable.Map({ team: "dragons", a: 8, b: 5 }));
            const events = Immutable.List([e1, e2, e3, e4, e5]);

            const grouped = collection(events).groupBy("team");

            expect(grouped.get("raptors").avg("b")).toBe(1.5);
            expect(grouped.get("dragons").avg("a")).toBe(7);

            const agg = grouped.aggregate({
                a_avg: ["a", avg()],
                b_avg: ["b", avg()]
            });

            expect(agg.get("raptors").get("a_avg")).toBe(3.5); // 3, 4
            expect(agg.get("dragons").get("b_avg")).toBe(4); // 3, 4, 5
        });

        it("can use groupBy with a fieldSpec on a Collection", () => {
            const t1 = time("2015-04-22T02:30:00Z");
            const t2 = time("2015-04-22T03:30:00Z");
            const t3 = time("2015-04-22T04:30:00Z");

            const e1 = event(t1, Immutable.Map({ team: "raptors", a: 3, b: 1 }));
            const e2 = event(t2, Immutable.Map({ team: "raptors", a: 4, b: 2 }));
            const e3 = event(t1, Immutable.Map({ team: "dragons", a: 6, b: 3 }));
            const e4 = event(t2, Immutable.Map({ team: "dragons", a: 7, b: 4 }));
            const e5 = event(t3, Immutable.Map({ team: "dragons", a: 8, b: 5 }));
            const events = Immutable.List([e1, e2, e3, e4, e5]);

            const grouped = collection(events).groupBy("team");

            expect(grouped.get("raptors").avg("b")).toBe(1.5);
            expect(grouped.get("dragons").avg("a")).toBe(7);

            const agg = grouped.aggregate({
                a_avg: ["a", avg()],
                b_avg: ["b", avg()]
            });

            expect(agg.get("raptors").get("a_avg")).toBe(3.5); // 3, 4
            expect(agg.get("dragons").get("b_avg")).toBe(4); // 3, 4, 5

            /*
            const windowed = collection(events)
                .window(period("1h"));

            const agg2 = windowed
                .aggregatePerWindow({
                    a: [ "a", avg() ],
                    b: [ "b", avg() ],
                })
                .mapKeys((key) => time(key.asTimerange().mid()));

            console.log(">>", agg2.toJSON());

            const agg3 = collection(events)
                .groupBy("team")
                .window(period("1h"))
                .aggregatePerWindow({
                    a: [ "a", avg() ],
                    b: [ "b", avg() ],
                })
                .mapKeys((key) => time(key.asTimerange().mid()));

            console.log("AGG3", agg3.toJSON())

            const grpwin = grouped
                .window(period("3h"));

            const ungrouped = grouped.removeGrouping();

            console.log("Ungrouped", ungrouped);

            */
        });
    });
});
