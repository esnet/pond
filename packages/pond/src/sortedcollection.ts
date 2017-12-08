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
import { Collection } from "./collection";
import { Event } from "./event";
import { Fill } from "./fill";
import { grouped, GroupedCollection, GroupingFunction } from "./groupedcollection";
import { Key } from "./key";
import { Rate } from "./rate";
import { TimeRange } from "./timerange";
import { DedupFunction } from "./types";
import { windowed, WindowedCollection } from "./windowedcollection";

import { AlignmentOptions, FillOptions, RateOptions, WindowingOptions } from "./types";

/**
 * In general, a `Collection` is a bucket of `Event`'s, with no particular order. This,
 * however, is a sub-class of a `Collection` which always maintains time-based sorting.
 *
 * As a result, it allows certain operations such as `bisect()` which depend on a
 * known ordering.
 *
 * This is the backing structure for a `TimeSeries`. You probably want to use a
 * `TimeSeries` directly.
 */
export class SortedCollection<T extends Key> extends Collection<T> {
    /**
     * Construct a new `Sorted Collection`
     */
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>) {
        super(arg1);
        if (!super.isChronological()) {
            this._events = this._events.sortBy(event => {
                return +event.getKey().timestamp();
            });
        }
    }

    /**
     * Appends a new `Event` to the `SortedCollection`, returning a new `SortedCollection`
     * containing that `Event`. Optionally the `Event`s may be de-duplicated.
     *
     * The `dedup` arg may `true` (in which case any existing `Event`s with the
     * same key will be replaced by this new `Event`), or with a function. If
     * `dedup` is a user function that function will be passed a list of all `Event`s
     * with that duplicated key and will be expected to return a single `Event`
     * to replace them with, thus shifting de-duplication logic to the user.
     *
     * DedupFunction:
     * ```
     * (events: Immutable.List<Event<T>>) => Event<T>
     * ```
     *
     * Example 1:
     *
     * ```
     * let myCollection = collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2);
     * ```
     *
     * Example 2:
     * ```
     * // dedup with the sum of the duplicated events
     * const myDedupedCollection = sortedCollection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2)
     *     .addEvent(e3, (events) => {
     *         const a = events.reduce((sum, e) => sum + e.get("a"), 0);
     *         return new Event<Time>(t, { a });
     *     });
     * ```
     */
    public addEvent(event: Event<T>, dedup?: DedupFunction<T> | boolean): SortedCollection<T> {
        const events = this.eventList();
        const sortRequired = events.size > 0 && event.begin() < events.get(0).begin();
        const c = super.addEvent(event, dedup);
        if (sortRequired) {
            return new SortedCollection(c.sortByKey());
        } else {
            return new SortedCollection(c);
        }
    }

    /**
     * Returns true if all `Event`s are in chronological order. In the case
     * of a `SortedCollection` this will always return `true`.
     */
    public isChronological(): boolean {
        return true;
    }

    /**
     * Sorts the `Collection` by the `Event` key `T`.
     *
     * In the case case of the key being `Time`, this is clear.
     * For `TimeRangeEvents` and `IndexedEvents`, the `Collection`
     * will be sorted by the begin time.
     *
     * This method is particularly useful when the `Collection`
     * will be passed into a `TimeSeries`.
     *
     * See also `Collection.isChronological()`.
     *
     * @example
     * ```
     * const sorted = collection.sortByKey();
     * ```
     */
    public sortByKey(): Collection<T> {
        return this;
    }

    /**
     * Map over the events in this `SortedCollection`. For each `Event`
     * passed to your callback function you should map that to
     * a new `Event`.
     *
     * @example
     * ```
     * const mapped = sorted.map(event => {
     *     return new Event(event.key(), { a: 55 });
     * });
     * ```
     */
    public map<M extends Key>(
        mapper: (event?: Event<T>, index?: number) => Event<M>
    ): SortedCollection<M> {
        const remapped = this._events.map(mapper);
        return new SortedCollection<M>(Immutable.List<Event<M>>(remapped));
    }

    /**
     * Flat map over the events in this `SortedCollection`.
     *
     * For each `Event<T>` passed to your callback function you should map that to
     * zero, one or many `Event<U>`s, returned as an `Immutable.List<Event<U>>`.
     *
     * Example:
     * ```
     * const processor = new Fill<T>(options);  // processor addEvent() returns 0, 1 or n new events
     * const filled = this.flatMap<T>(e => processor.addEvent(e));
     * ```
     */
    public flatMap<U extends Key>(
        mapper: (event?: Event<T>, index?: number) => Immutable.List<Event<U>>
    ): SortedCollection<U> {
        const remapped: Immutable.List<Event<U>> = this._events.flatMap(mapper);
        return new SortedCollection<U>(Immutable.List<Event<U>>(remapped));
    }

    /**
     * Filter the `SortedCollection`'s `Event`'s with the supplied function.
     *
     * The function `predicate` is passed each `Event` and should return
     * true to keep the `Event` or false to discard.
     *
     * Example:
     * ```
     * const filtered = collection.filter(e => e.get("a") < 8)
     * ```
     */
    public filter(predicate: (event: Event<T>, index: number) => boolean): SortedCollection<T> {
        const filtered: Immutable.List<Event<T>> = this._events.filter(predicate);
        return new SortedCollection<T>(Immutable.List<Event<T>>(filtered));
    }

    /**
     * Returns the index that `bisect`'s the `TimeSeries` at the time specified.
     */
    public bisect(t: Date, b?: number): number {
        const tms = t.getTime();
        const size = this.size();
        let i = b || 0;

        if (!size) {
            return undefined;
        }

        for (; i < size; i++) {
            const ts = this.at(i)
                .timestamp()
                .getTime();
            if (ts > tms) {
                return i - 1 >= 0 ? i - 1 : 0;
            } else if (ts === tms) {
                return i;
            }
        }
        return i - 1;
    }

    /**
     * The `align()` method takes a `Event`s and interpolates new values on precise
     * time intervals. For example we get measurements from our network every 30 seconds,
     * but not exactly. We might get values timestamped at :32, 1:01, 1:28, 2:00 and so on.
     *
     * It is helpful to remove this at some stage of processing incoming data so that later
     * the aligned values can be aggregated together (combining multiple series into a singe
     * aggregated series).
     *
     * The alignment is controlled by the `AlignmentOptions`. This is an object of the form:
     * ```
     * {
     *    fieldSpec: string | string[];
     *    period: Period;
     *    method?: AlignmentMethod;
     *    limit?: number;
     * }
     * ```
     * Options:
     *  * `fieldSpec` - the field or fields to align
     *  * `period` - a `Period` object to control the time interval to align to
     *  * `method` - the interpolation method, which may be
     *    `AlignmentMethod.Linear` or `AlignmentMethod.Hold`
     *  * `limit` - how long to interpolate values before inserting nulls on boundaries.
     *
     * Note: Only a `Collection` of `Event<Time>` objects can be aligned. `Event<Index>`
     * objects are basically already aligned and it makes no sense in the case of a
     * `Event<TimeRange>`.
     *
     * Note: Aligned `Event`s will only contain the fields that the alignment was requested
     * on. Which is to say if you have two columns, "in" and "out", and only request to align
     * the "in" column, the "out" value will not be contained in the resulting collection.
     */
    public align(options: AlignmentOptions): SortedCollection<T> {
        const p = new Align<T>(options);
        return this.flatMap<T>(e => p.addEvent(e));
    }

    /**
     * Returns the derivative of the `Event`s in this `Collection` for the given columns.
     *
     * The result will be per second. Optionally you can substitute in `null` values
     * if the rate is negative. This is useful when a negative rate would be considered
     * invalid like an ever increasing counter.
     *
     * To control the rate calculation you need to specify a `RateOptions` object, which
     * takes the following form:
     * ```
     * {
     *     fieldSpec: string | string[];
     *     allowNegative?: boolean;
     * }
     * ```
     * Options:
     *  * `fieldSpec` - the field to calculate the rate on
     *  * `allowNegative` - allow emit of negative rates
     */
    public rate(options: RateOptions): SortedCollection<TimeRange> {
        const p = new Rate<T>(options);
        return this.flatMap<TimeRange>(e => p.addEvent(e));
    }

    /**
     * Fills missing/invalid values in the `Event` with new values.
     *
     * These new value can be either zeros, interpolated values from neighbors, or padded,
     * meaning copies of previous value.
     *
     * The fill is controlled by the `FillOptions`. This is an object of the form:
     * ```
     * {
     *     fieldSpec: string | string[];
     *     method?: FillMethod;
     *     limit?: number;
     * }
     * ```
     * Options:
     *  * `fieldSpec` - the field to fill
     *  * `method` - the interpolation method, one of `FillMethod.Hold`, `FillMethod.Pad`
     *               or `FillMethod.Linear`
     *  * `limit` - the number of missing values to fill before giving up
     *
     * Returns a new filled `Collection`.
     */
    public fill(options: FillOptions): SortedCollection<T> {
        const p = new Fill<T>(options);
        return this.flatMap<T>(e => p.addEvent(e));
    }

    /**
     * GroupBy a field's value. The result is a `GroupedCollection`, which internally maps
     * a key (the value of the field) to a `Collection` of `Event`s in that group.
     *
     * Example:
     *
     * In this example we group by the field "team_name" and then call the `aggregate()`
     * method on the resulting `GroupedCollection`.
     *
     * ```
     * const teamAverages = c
     *     .groupBy("team_name")
     *     .aggregate({
     *         "goals_avg": ["goals", avg()],
     *         "against_avg": ["against", avg()],
     *     });
     * teamAverages.get("raptors").get("goals_avg"));
     * teamAverages.get("raptors").get("against_avg"))
     * ```
     */
    public groupBy(field: string | string[] | GroupingFunction<T>): GroupedCollection<T> {
        return grouped(field, this);
    }

    /**
     * Window the `Collection` into a given period of time.
     *
     * This is similar to `groupBy` except `Event`s are grouped by their timestamp
     * based on the `Period` supplied. The result is a `WindowedCollection`.
     *
     * The windowing is controlled by the `WindowingOptions`, which takes the form:
     * ```
     * {
     *     window: WindowBase;
     *     trigger?: Trigger;
     * }
     * ```
     * Options:
     *  * `window` - a `WindowBase` subclass, currently `Window` or `DayWindow`
     *  * `trigger` - not needed in this context
     *
     * Example:
     *
     * ```
     * const c = new Collection()
     *     .addEvent(event(time("2015-04-22T02:28:00Z"), map({ team: "a", value: 3 })))
     *     .addEvent(event(time("2015-04-22T02:29:00Z"), map({ team: "a", value: 4 })))
     *     .addEvent(event(time("2015-04-22T02:30:00Z"), map({ team: "b", value: 5 })));
     *
     * const thirtyMinutes = window(duration("30m"));
     *
     * const windowedCollection = c.window({
     *     window: thirtyMinutes
     * });
     *
     * ```
     */
    public window(options: WindowingOptions): WindowedCollection<T> {
        return windowed(options, Immutable.Map({ all: this }));
    }

    /**
     * Static function to compare two collections to each other. If the collections
     * are of the same value as each other then equals will return true.
     */
    // tslint:disable:member-ordering
    static is(collection1: SortedCollection<Key>, collection2: SortedCollection<Key>) {
        let result = true;
        const size1 = collection1.size();
        const size2 = collection2.size();

        if (size1 !== size2) {
            return false;
        } else {
            for (let i = 0; i < size1; i++) {
                result = result && Event.is(collection1.at(i), collection2.at(i));
            }
            return result;
        }
    }

    protected clone(events, keyMap): Collection<T> {
        const c = new SortedCollection<T>();
        c._events = events;
        c._keyMap = keyMap;
        return c;
    }
}

function sortedCollectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>) {
    return new SortedCollection<T>(arg1);
}

export { sortedCollectionFactory as sortedCollection, sortedCollectionFactory as sorted };
