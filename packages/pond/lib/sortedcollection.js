"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const align_1 = require("./align");
const collection_1 = require("./collection");
const event_1 = require("./event");
const fill_1 = require("./fill");
const groupedcollection_1 = require("./groupedcollection");
const rate_1 = require("./rate");
const windowedcollection_1 = require("./windowedcollection");
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
class SortedCollection extends collection_1.Collection {
    /**
     * Construct a new `Sorted Collection`
     */
    constructor(arg1) {
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
    addEvent(event, dedup) {
        const events = this.eventList();
        const sortRequired = events.size > 0 && event.begin() < events.get(0).begin();
        const c = super.addEvent(event, dedup);
        if (sortRequired) {
            return new SortedCollection(c.sortByKey());
        }
        else {
            return new SortedCollection(c);
        }
    }
    /**
     * Returns true if all `Event`s are in chronological order. In the case
     * of a `SortedCollection` this will always return `true`.
     */
    isChronological() {
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
    sortByKey() {
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
    map(mapper) {
        const remapped = this._events.map(mapper);
        return new SortedCollection(Immutable.List(remapped));
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
    flatMap(mapper) {
        const remapped = this._events.flatMap(mapper);
        return new SortedCollection(Immutable.List(remapped));
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
    filter(predicate) {
        const filtered = this._events.filter(predicate);
        return new SortedCollection(Immutable.List(filtered));
    }
    /**
     * Returns the index that `bisect`'s the `TimeSeries` at the time specified.
     */
    bisect(t, b) {
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
            }
            else if (ts === tms) {
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
    align(options) {
        const p = new align_1.Align(options);
        return this.flatMap(e => p.addEvent(e));
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
    rate(options) {
        const p = new rate_1.Rate(options);
        return this.flatMap(e => p.addEvent(e));
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
    fill(options) {
        const p = new fill_1.Fill(options);
        return this.flatMap(e => p.addEvent(e));
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
    groupBy(field) {
        return groupedcollection_1.grouped(field, this);
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
    window(options) {
        return windowedcollection_1.windowed(options, Immutable.Map({ all: this }));
    }
    /**
     * Static function to compare two collections to each other. If the collections
     * are of the same value as each other then equals will return true.
     */
    // tslint:disable:member-ordering
    static is(collection1, collection2) {
        let result = true;
        const size1 = collection1.size();
        const size2 = collection2.size();
        if (size1 !== size2) {
            return false;
        }
        else {
            for (let i = 0; i < size1; i++) {
                result = result && event_1.Event.is(collection1.at(i), collection2.at(i));
            }
            return result;
        }
    }
    clone(events, keyMap) {
        const c = new SortedCollection();
        c._events = events;
        c._keyMap = keyMap;
        return c;
    }
}
exports.SortedCollection = SortedCollection;
function sortedCollectionFactory(arg1) {
    return new SortedCollection(arg1);
}
exports.sortedCollection = sortedCollectionFactory;
exports.sorted = sortedCollectionFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGVkY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0ZWRjb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFHdkMsbUNBQWdDO0FBQ2hDLDZDQUEwQztBQUMxQyxtQ0FBZ0M7QUFDaEMsaUNBQThCO0FBQzlCLDJEQUFtRjtBQUVuRixpQ0FBOEI7QUFHOUIsNkRBQW9FO0FBSXBFOzs7Ozs7Ozs7R0FTRztBQUNILHNCQUE2QyxTQUFRLHVCQUFhO0lBQzlEOztPQUVHO0lBQ0gsWUFBWSxJQUErQztRQUN2RCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWtDRztJQUNJLFFBQVEsQ0FBQyxLQUFlLEVBQUUsS0FBa0M7UUFDL0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlFLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLEVB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