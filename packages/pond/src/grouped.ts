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
import { Collection } from "./collection";
import { Event } from "./event";
import { Index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Rate } from "./rate";
import { Time } from "./time";
import { timerange, TimeRange } from "./timerange";
import { WindowedCollection } from "./windowed";

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
 * @example
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

export class GroupedCollection<T extends Key> {
    protected collections: Immutable.Map<string, Collection<T>>;

    /**
     * Builds a new Grouping from a `fieldSpec` and a `Collection`
     */
    constructor(collectionMap: Immutable.Map<string, Collection<T>>);
    constructor(fieldSpec: string | string[] | GroupingFunction<T>, collection: Collection<T>);
    constructor(arg1: any, arg2?: any) {
        if (Immutable.Map.isMap(arg1)) {
            const collectionMap = arg1 as Immutable.Map<string, Collection<T>>;
            this.collections = collectionMap;
        } else {
            let fn: GroupingFunction<T>;
            const collection = arg2 as Collection<T>;
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
                .map(events => new Collection(events.toList()));
        }
    }

    /**
     * Fetch the `Collection` of `Event`'s contained in the grouping
     */
    public get(grouping: string): Collection<T> {
        return this.collections.get(grouping);
    }

    /**
     *
     * @example
     * ```
     * grouped
     *     .aggregate({
     *         a_avg: [ "a", avg() ],
     *         b_avg: [ "b", avg() ],
     *     });
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

    public ungroup(): GroupedCollection<T> {
        let eventList = Immutable.List();
        this.collections.forEach((collection, group) => {
            eventList = eventList.concat(collection.eventList());
        });
        const map = Immutable.Map({ _: new Collection<T>(eventList) });
        return new GroupedCollection(map);
    }

    public flatten(): Collection<T> {
        return this.ungroup().get("_");
    }

    public window(windowOptions: WindowingOptions): WindowedCollection<T> {
        return new WindowedCollection(windowOptions, this.collections);
    }

    public align(options: AlignmentOptions): GroupedCollection<T> {
        const collections = this.collections.map((collection, group) => {
            return collection.align(options) as Collection<T>;
        });
        return new GroupedCollection<T>(collections);
    }

    public rate(options: RateOptions): GroupedCollection<TimeRange> {
        const collections = this.collections.map((collection, group) => {
            return collection.rate(options) as Collection<TimeRange>;
        });
        return new GroupedCollection(collections);
    }
}

function groupedFactory<T extends Key>(
    fieldSpec: string | string[] | GroupingFunction<T>,
    collection: Collection<T>
) {
    return new GroupedCollection<T>(fieldSpec, collection);
}

export { groupedFactory as grouped };
