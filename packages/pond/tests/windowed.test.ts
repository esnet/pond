declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

const map = Immutable.Map;

import { collection, Collection } from "../src/collection";
import { duration } from "../src/duration";
import { event } from "../src/event";
import { avg, count, keep, sum } from "../src/functions";
import { grouped, GroupedCollection } from "../src/grouped";
import { index } from "../src/index";
import { period } from "../src/period";
import { time, Time } from "../src/time";
import { TimeRange } from "../src/timerange";
import { window } from "../src/window";

import { WindowedCollection } from "../src/windowed";

import { TimeAlignment } from "../src/types";

describe("Windowed", () => {
    it("can build a WindowedCollection", () => {
        const collection = new Collection()
            .addEvent(event(time("2015-04-22T02:28:00Z"), map({ team: "a", value: 3 })))
            .addEvent(event(time("2015-04-22T02:29:00Z"), map({ team: "a", value: 4 })))
            .addEvent(event(time("2015-04-22T02:30:00Z"), map({ team: "b", value: 5 })));

        const everyThirtyMinutes = window(duration("30m"));
        const windowedCollection = collection.window({ window: everyThirtyMinutes });

        expect(windowedCollection.get("all::30m-794260").size()).toEqual(2);
        expect(windowedCollection.get("all::30m-794260").at(0).get("value")).toEqual(3);
        expect(windowedCollection.get("all::30m-794260").at(0).get("team")).toEqual("a");
        expect(windowedCollection.get("all::30m-794260").at(1).get("value")).toEqual(4);
        expect(windowedCollection.get("all::30m-794260").at(1).get("team")).toEqual("a");

        expect(windowedCollection.get("all::30m-794261").size()).toEqual(1);
        expect(windowedCollection.get("all::30m-794261").at(0).get("value")).toEqual(5);
        expect(windowedCollection.get("all::30m-794261").at(0).get("team")).toEqual("b");
    });

    it("can combine a groupBy with a window", () => {
        const collection = new Collection(
            Immutable.List([
                event(time("2015-04-22T02:28:00Z"), map({ team: "raptors", score: 3 })),
                event(time("2015-04-22T02:29:00Z"), map({ team: "raptors", score: 4 })),
                event(time("2015-04-22T02:30:00Z"), map({ team: "raptors", score: 5 })),
                event(time("2015-04-22T02:29:00Z"), map({ team: "wildcats", score: 3 })),
                event(time("2015-04-22T02:30:00Z"), map({ team: "wildcats", score: 4 })),
                event(time("2015-04-22T02:31:00Z"), map({ team: "wildcats", score: 6 }))
            ])
        );

        const everyThirtyMinutes = window(duration("30m"));
        const windowedCollection = collection
            .groupBy("team")
            .window({ window: everyThirtyMinutes });

        expect(windowedCollection.get("raptors::30m-794260").size()).toEqual(2);
        expect(windowedCollection.get("raptors::30m-794260").at(0).get("score")).toEqual(3);
        expect(windowedCollection.get("raptors::30m-794260").at(1).get("score")).toEqual(4);
        expect(windowedCollection.get("wildcats::30m-794260").size()).toEqual(1);
        expect(windowedCollection.get("wildcats::30m-794261").size()).toEqual(2);
    });

    it("can build an aggregated Collection with grouping and windowing", () => {
        const collection = new Collection(
            Immutable.List([
                event(time("2015-04-22T02:28:00Z"), map({ team: "raptors", score: 3 })),
                event(time("2015-04-22T02:29:00Z"), map({ team: "raptors", score: 4 })),
                event(time("2015-04-22T02:30:00Z"), map({ team: "raptors", score: 5 })),
                event(time("2015-04-22T02:29:00Z"), map({ team: "wildcats", score: 3 })),
                event(time("2015-04-22T02:30:00Z"), map({ team: "wildcats", score: 4 })),
                event(time("2015-04-22T02:31:00Z"), map({ team: "wildcats", score: 6 }))
            ])
        );

        const everyThirtyMinutes = window(duration("30m"));
        const rolledUp = collection
            .groupBy("team")
            .window({ window: everyThirtyMinutes })
            .aggregate({
                team: ["team", keep()],
                total: ["score", sum()]
            })
            .flatten()
            .mapKeys(index => time(index.asTimerange().mid()));

        expect(rolledUp.size()).toBe(4);
        expect(rolledUp.at(0).get("total")).toBe(7);
        expect(rolledUp.at(1).get("total")).toBe(5);
        expect(rolledUp.at(2).get("total")).toBe(3);
        expect(rolledUp.at(3).get("total")).toBe(10);
    });
});
