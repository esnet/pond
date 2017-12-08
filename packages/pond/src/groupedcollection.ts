/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as Immutable from "immutable";
import * as _ from "lodash";

import { Align } from "./align";
import { Base } from "./base";
import { Event } from "./event";
import { Index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Rate } from "./rate";
import { SortedCollection } from "./sortedcollection";
import { Time } from "./time";
import { timerange, TimeRange } from "./timerange";
import { WindowedCollection } from "./windowedcollection";

import {
    Aggregation,
    AggregationMapFunction,
    AggregationTuple,
    AlignmentOptions,
    CollapseOptions,
    DedupFunction,
    RateOptions,
    ReducerFunction,
    WindowingOptions
} from "./types";

import util from "./util";

import {
    avg,
    first,
    InterpolationType,
    last,
    max,
    median,
    min,
    percentile,
    stdev,
    sum
} from "./functions";

/**
 * Example:
 * ```
 * const spec: AggregationSpec = {
 *    in_avg: ["in", avg(), "bob"],
 *    out_avg: ["out", avg()],
 * };
 * ```
 */
export interface AggregationSpec<T extends Key> {
    [dest: string]: Aggregation<T>;
}

export type GroupingFunction<T extends Key> = (e: Event<T>) => string;

/**
 * Represents an association of group names to `Collection`s. Typically
 * this is the resulting representation of performing a `groupBy()` on
 * a `Collection`.
 */
export class GroupedCollection<T extends Key> {
    protected collections: Immutable.Map<string, SortedCollection<T>>;

    /**
     * Builds a new Grouping from a `fieldSpec` and a `Collection`. This grouping
     * is represented as a map from a string group name to a `Collection`.
     *
     * While you could create a `GroupedCollection` using its constructor, or
     * the `grouped()` factory function, however more typically this is
     * the result of a `groupBy()` on a `Collection`.
     *
     * Grouping is not currently supported for streaming, if you need that it is most
     * likely at the input end of a processing chain and the best approach is to just
     * manually direct events into different chains based on the group.
     *
     * Example:
     * ```
     * const eventCollection = new Collection(
     *     Immutable.List([
     *         event(time("2015-04-22T02:28:00Z"), map({ team: "raptors", score: 3 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "raptors", score: 4 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "raptors", score: 5 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "wildcats", score: 3 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "wildcats", score: 4 })),
     *         event(time("2015-04-22T02:31:00Z"), map({ team: "wildcats", score: 6 }))
     *      ])
     *  );
     *  const everyThirtyMinutes = window(duration("30m"));
     *  const windowedCollection = eventCollection
     *      .groupBy("team")
     *      .window({ window: everyThirtyMinutes });
     *  ```
     * In this example the result of the `.groupBy()` will be the `GroupedCollection`
     * and the result of calling `window()` on this will be a `WindowedCollection`.
     */
    constructor(collectionMap: Immutable.Map<string, SortedCollection<T>>);
    constructor(
        fieldSpec: string | string[] | GroupingFunction<T>,
        collection: SortedCollection<T>
    );
    constructor(arg1: any, arg2?: any) {
        if (Immutable.Map.isMap(arg1)) {
            const collectionMap = arg1 as Immutable.Map<string, SortedCollection<T>>;
            this.collections = collectionMap;
        } else {
            let fn: GroupingFunction<T>;
            const collection = arg2 as SortedCollection<T>;
            if (_.isFunction(arg1)) {
                fn = arg1;
            } else {
                const fieldSpec = arg1 as string | string[];
                const fs = util.fieldAsArray(fieldSpec);
                fn = e => e.get(fs);
            }
            this.collections = collection
                .eventList()
                .groupBy(fn)
                .toMap()
                .map(events => new SortedCollection(events.toList()));
        }
    }

    /**
     * Gets the `Collection` contained in the `grouping` specified.
     */
    public get(grouping: string): SortedCollection<T> {
        return this.collections.get(grouping);
    }

    /**
     * Aggregate per grouping, essentially forming a map from the group name
     * to the aggregate of the former `Collection` associated with that group name.
     *
     * Example:
     * ```
     * const eventCollection = new Collection(
     *     Immutable.List([
     *         event(time("2015-04-22T02:28:00Z"), map({ team: "raptors", score: 3 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "raptors", score: 4 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "raptors", score: 5 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "wildcats", score: 3 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "wildcats", score: 4 })),
     *         event(time("2015-04-22T02:31:00Z"), map({ team: "wildcats", score: 6 }))
     *     ])
     * );
     *
     * const rolledUp = eventCollection
     *     .groupBy("team")
     *     .aggregate({
     *         team: ["team", keep()],
     *         total: ["score", sum()]
     *     });
     *
     * const raptorsTotal = rolledUp.get("raptors").get("total");   // 12
     * const wildcatsTotal = rolledUp.get("wildcats").get("total"); // 13
     * ```
     */
    public aggregate(
        aggregationSpec: AggregationSpec<T>
    ): Immutable.Map<string, Immutable.Map<string, any>> {
        const result = {};
        this.collections.forEach((collection, group) => {
            const d = {};
            _.forEach(aggregationSpec, (src: AggregationTuple, dest: string) => {
                if (!_.isFunction(src)) {
                    const [srcField, reducer] = src;
                    d[dest] = collection.aggregate(reducer, srcField);
                } else {
                    d[dest] = src(collection);
                }
            });
            result[group] = d;
        });
        return Immutable.fromJS(result);
    }

    /**
     * Forms a single group from this `GroupedCollection`, returning a new
     * `GroupedCollection` with a single key `_` mapping to a `Collection`
     * containing all `Event`s in all the previous `Collection`s.
     */
    public ungroup(): GroupedCollection<T> {
        let eventList = Immutable.List();
        this.collections.forEach((collection, group) => {
            eventList = eventList.concat(collection.eventList());
        });
        const map = Immutable.Map({ _: new SortedCollection<T>(eventList) });
        return new GroupedCollection(map);
    }

    /**
     * Forms a single `Collection` from this `GroupedCollection`. That
     * `Collection` will containing all `Event`s in all the previously
     * grouped `Collection`s.
     */
    public flatten(): SortedCollection<T> {
        return this.ungroup().get("_");
    }

    /**
     * Further groups this `GroupedCollection` per window, returning a
     * `WindowedCollection`. This allows you then to first `groupBy()`
     * a `Collection` and then further group by a window.
     *
     * The options are passed as a `WindowOptions` structure, but essentially
     * in the context of chaining `Collections` together this really just needs
     * to contain the `{ window: w }` where `w` here would be a `window` object
     * of some sort.
     *
     * Example:
     * ```
     * const w = window(duration("30m"));
     * const windowedCollection = eventCollection
     *     .groupBy("team")
     *     .window({ window: w });
     * ```
     */
    public window(windowOptions: WindowingOptions): WindowedCollection<T> {
        return new WindowedCollection(windowOptions, this.collections);
    }

    /**
     * Runs the `align()` method on each grouped `Collection`.
     */
    public align(options: AlignmentOptions): GroupedCollection<T> {
        const collections = this.collections.map((collection, group) => {
            return collection.align(options) as SortedCollection<T>;
        });
        return new GroupedCollection<T>(collections);
    }

    /**
     * Runs the `rate()` method on each grouped `Collection`.
     */
    public rate(options: RateOptions): GroupedCollection<TimeRange> {
        const collections = this.collections.map((collection, group) => {
            return collection.rate(options) as SortedCollection<TimeRange>;
        });
        return new GroupedCollection(collections);
    }
}

function groupedFactory<T extends Key>(
    fieldSpec: string | string[] | GroupingFunction<T>,
    collection: SortedCollection<T>
) {
    return new GroupedCollection<T>(fieldSpec, collection);
}

export { groupedFactory as grouped };
