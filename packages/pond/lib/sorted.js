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
const grouped_1 = require("./grouped");
const rate_1 = require("./rate");
const windowed_1 = require("./windowed");
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
     * TODO: Add comment here
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
     * Returns true if all events in this `Collection` are in chronological order.
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
        return grouped_1.grouped(field, this);
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
        return windowed_1.windowed(options, Immutable.Map({ all: this }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvcnRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBR3ZDLG1DQUFnQztBQUNoQyw2Q0FBMEM7QUFDMUMsbUNBQWdDO0FBQ2hDLGlDQUE4QjtBQUM5Qix1Q0FBeUU7QUFFekUsaUNBQThCO0FBRzlCLHlDQUEwRDtBQUkxRDs7Ozs7Ozs7O0dBU0c7QUFDSCxzQkFBNkMsU0FBUSx1QkFBYTtJQUM5RDs7T0FFRztJQUNILFlBQVksSUFBK0M7UUFDdkQsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSztnQkFDcEMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLFFBQVEsQ0FBQyxLQUFlLEVBQUUsS0FBa0M7UUFDL0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlFLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FB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