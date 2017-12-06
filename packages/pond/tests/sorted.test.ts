declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

import { event } from "../src/event";
import { sortedCollection as SortedCollection } from "../src/sorted";
import { time, Time } from "../src/time";

describe("SortedCollection", () => {
    describe("Creation", () => {
        it("can add events to SortedCollection and event will stay sorted", () => {
            const timestamp1 = time("2015-04-22T03:30:00Z");
            const timestamp2 = time("2015-04-22T02:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6 }));
            const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 2 }));

            const c = SortedCollection<Time>()
                .addEvent(e1)
                .addEvent(e2);

            expect(c.size()).toEqual(2);
            expect(c.at(0).get("a")).toEqual(4);
            expect(c.at(1).get("a")).toEqual(5);
        });

        it("can make a collection from another collection", () => {
            const timestamp1 = new Time("2015-04-22T02:30:00Z");
            const timestamp2 = new Time("2015-04-22T03:30:00Z");
            const timestamp3 = new Time("2015-04-22T04:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 1 }));
            const e2 = event(timestamp3, Immutable.Map({ a: 3 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 2 }));

            const c1 = SortedCollection<Time>()
                .addEvent(e1)
                .addEvent(e2)
                .addEvent(e3);

            const c2 = SortedCollection(c1);
            expect(c2.size()).toEqual(3);
            expect(c2.at(0).get("a")).toEqual(1);
            expect(c2.at(1).get("a")).toEqual(2);
            expect(c2.at(2).get("a")).toEqual(3);
        });

        it("make a collection from List", () => {
            const timestamp1 = new Time("2015-04-22T02:30:00Z");
            const timestamp2 = new Time("2015-04-22T03:30:00Z");
            const timestamp3 = new Time("2015-04-22T04:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 1 }));
            const e2 = event(timestamp3, Immutable.Map({ a: 3 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 2 }));

            const eventList = Immutable.List([e1, e3, e2]);

            const c = SortedCollection<Time>(eventList);

            expect(c.size()).toEqual(3);
            expect(c.size()).toEqual(3);
            expect(c.at(0).get("a")).toEqual(1);
            expect(c.at(1).get("a")).toEqual(2);
            expect(c.at(2).get("a")).toEqual(3);
        });

        it("can filter a sorted collection", () => {
            const timestamp1 = new Time("2015-04-22T02:30:00Z");
            const timestamp2 = new Time("2015-04-22T03:30:00Z");
            const timestamp3 = new Time("2015-04-22T04:30:00Z");

            const e1 = event(timestamp1, Immutable.Map({ a: 1 }));
            const e2 = event(timestamp3, Immutable.Map({ a: 3 }));
            const e3 = event(timestamp2, Immutable.Map({ a: 8 }));

            const c = SortedCollection<Time>(Immutable.List([e1, e3, e2]));
            const cc = c.filter(e => e.get("a") > 4);
            expect(cc.size()).toEqual(1);
            expect(cc.at(0).get("a")).toEqual(8);
        });
    });
});
