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
import { Key } from "./key";
import { Rate } from "./rate";
import { TimeRange } from "./timerange";
import { DedupFunction } from "./types";

import { AlignmentOptions, FillOptions, RateOptions } from "./types";

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
     * Construct a new `Sorted Collection` (experimental)
     */
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>) {
        super(arg1);
        if (!this.isChronological()) {
            this.sortByKey();
        }
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

    /**
     * If our new `Event` was added at the end, then we don't have anything to maintain.
     * However, if the `Event` would otherwise be out of order then we sort the `Collection`.
     */
    protected onEventAdded(events: Immutable.List<Event<T>>): Immutable.List<Event<T>> {
        const size = events.size;
        if (size > 1 && events.get(size - 2).begin() > events.get(size - 1).begin()) {
            return events.sortBy(event => +event.getKey().timestamp());
        }
        return events;
    }
}

function sortedCollectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>) {
    return new SortedCollection<T>(arg1);
}

export { sortedCollectionFactory as sortedCollection };
