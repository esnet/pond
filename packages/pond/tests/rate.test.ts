declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

import { collection } from "../src/collection";
import { duration } from "../src/duration";
import { event } from "../src/event";
import { period } from "../src/period";
import { sortedCollection } from "../src/sortedcollection";
import { time } from "../src/time";

import { AlignmentMethod } from "../src/types";

const DATA2 = [
    [0, 1],
    [30000, 3],
    [60000, 10],
    [90000, 40],
    [120000, 70],
    [150000, 130],
    [180000, 190],
    [210000, 220],
    [240000, 300],
    [270000, 390],
    [300000, 510]
];

it("can calculate the rate using Collection.rate()", () => {
    const list = DATA2.map(e => {
        return event(time(e[0]), Immutable.Map({ in: e[1] }));
    });

    const c = sortedCollection(Immutable.List(list));
    const rates = c.rate({ fieldSpec: "in" });

    expect(rates.size()).toEqual(list.length - 1);
    expect(rates.at(2).get("in_rate")).toEqual(1);
    expect(rates.at(3).get("in_rate")).toEqual(1);
    expect(rates.at(4).get("in_rate")).toEqual(2);
    expect(rates.at(8).get("in_rate")).toEqual(3);
    expect(rates.at(9).get("in_rate")).toEqual(4);
});

it("can do basic rate using Collection.rate()", () => {
    const list = [[89000, 100], [181000, 200]].map(e => {
        return event(time(e[0]), Immutable.Map({ value: e[1] }));
    });

    const c = sortedCollection(Immutable.List(list));
    const rates = c
        .align({
            fieldSpec: "value",
            period: period(duration("30s")),
            method: AlignmentMethod.Linear
        })
        .rate({
            fieldSpec: "value"
        })
        .mapKeys(tr => time(tr.mid()));

    expect(rates.size()).toEqual(3);
    expect(rates.at(0).get("value_rate")).toEqual(1.0869565217391313);
    expect(rates.at(1).get("value_rate")).toEqual(1.0869565217391293);
    expect(rates.at(2).get("value_rate")).toEqual(1.0869565217391313);
});

it("can output nulls for negative values", () => {
    const list = [[89000, 100], [181000, 50]].map(e => {
        return event(time(e[0]), Immutable.Map({ value: e[1] }));
    });

    const c = sortedCollection(Immutable.List(list));

    const rates1 = c
        .align({
            fieldSpec: "value",
            period: period(duration("30s")),
            method: AlignmentMethod.Linear
        })
        .rate({
            fieldSpec: "value",
            allowNegative: true
        });

    expect(rates1.size()).toEqual(3);
    expect(rates1.at(0).get("value_rate")).toEqual(-0.5434782608695656);
    expect(rates1.at(1).get("value_rate")).toEqual(-0.5434782608695646);
    expect(rates1.at(2).get("value_rate")).toEqual(-0.5434782608695653);

    const rates2 = c
        .align({
            fieldSpec: "value",
            period: period(duration("30s")),
            method: AlignmentMethod.Linear
        })
        .rate({
            fieldSpec: "value",
            allowNegative: false
        });

    expect(rates2.size()).toEqual(3);
    expect(rates2.at(0).get("value_rate")).toBeNull();
    expect(rates2.at(1).get("value_rate")).toBeNull();
    expect(rates2.at(2).get("value_rate")).toBeNull();
});
