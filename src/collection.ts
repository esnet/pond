/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as _ from "lodash";
import * as Immutable from "immutable";

import Key from "./key";
import Event from "./event";
import Time from "./time";
import Index from "./index";
import TimeRange from "./timerange";
import util from "./util";
import {
    ReducerFunction,
    InterpolationType,
    sum,
    avg,
    max,
    min,
    first,
    last,
    median,
    stdev,
    percentile
} from "./functions";

/**
 * A Collection holds a ordered (but not sorted) map of Events.
 *
 * The Events stored in a `Collection` are mapped by their key
 * so a Collection can not hold more than one Event of the same
 * key, thus de-duplication is part of how a Collection works.
 * Later Events to be added supersede early ones. Internally, a
 * Collection holds its data in an Immutable.OrderedMap.
 * 
 * In Typescript, you can give a Collection<T> a type T, which is
 * the Event type accepted into the Collection (e.g. Collection<Time>). 
 */
class Collection<T extends Key> {

    private _events: Immutable.OrderedMap<T, Event<T>>;

    /**
     * Construct a new Collection
     * 
     * @example
     * ```
     * const timestamp1 = new Time("2015-04-22T03:30:00Z");
     const timestamp2 = new Time("2015-04-22T02:30:00Z");
     *
     * const e1 = new Event(timestamp1, { a: 5, b: 6 });
     * const e2 = new Event(timestamp2, { a: 4, b: 2 });
     *
     * let collection = new Collection<Time>();
     * collection = collection.addEvent(e1);
     * collection = collection.addEvent(e2);
     * ```
     */
    constructor();
    constructor(arg1: Immutable.OrderedMap<T, Event<T>>);
    constructor(arg1: Collection<T>);
    constructor(arg1?: any) {
        if (!arg1) {
            this._events = Immutable.OrderedMap<T, Event<T>>();
        } else if (arg1 instanceof Collection) {
            const other = arg1;
            this._events = other._events;
        } else if (Immutable.OrderedMap.isOrderedMap(arg1)) {
            this._events = arg1;
        }
    }

    /**
     * Returns the Collection as a regular JSON object. This
     * is implementation specific, in that different types of
     * Collections will likely implement this in their own way.
     * 
     * In the case of our OrderedMap, this code simply called
     * internalOrderedMap.toJS() and lets Immutable.js do its
     * thing.
     *
     * @return {Object} The JSON representation of this Collection
     */
    toJSON() {
        return this._events.toList().toJS();
    }

    /**
     * Serialize out the Collection as a string. This will be the
     * string representation of `toJSON()`.
     *
     * @return {string} The Collection serialized as a string.
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Adds a new Event into the Collection. Since a Collection only
     * represents a bag of Events with unique keys, the Event will
     * be de-duped. You can optionally provide a callback that will
     * be called with the existing event in the case of an Event
     * already existing in the Collection. You can return from this
     * the Event to actually add. The default is to replace existing
     * Event with the new Event.
     * 
     * @example
     * ```
     * let collection = new Collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2);
     * ```
     * @example
     * ```
     * collection = collection.addEvent(e2, e => {
     *     return new Event<Time>(
     *         timestamp1,
     *         { a: e2.get("a") + e.get("a") } // sum them
     *     );
     * });
     * ```
     * @param event The new Event of type T to be added into the Collection
     * @param dudup Callback function to reconcile an existing Event
     * 
     * @returns Collection<T> The new Collection with the Event
     *                        added into it
     */
    addEvent(
        event: Event<T>,
        dedup?: (event: Event<T>) => Event<T>
    ): Collection<T> {
        const k = event.key();
        let e = event;
        if (this._events.has(k) && dedup) {
            e = dedup(this._events.get(k));
        }
        return new Collection<T>(this._events.set(k, e));
    }

    /**
     * Completely replace the existing Events in this Collection.
     * 
     * @param events An Immutable.OrderedMap of new Events<T> which
     *               to add as the Events within this Collection.
     * @returns Collection<T> The new Collection with the Event
     *                        added into it
     */
    setEvents(
        events: Immutable.OrderedMap<T, Event<T>>
    ): Collection<T> {
        return new Collection<T>(events);
    }

    /**
     * @returns The number of Events in this Collection
     */
    size(): number {
        return this._events.size;
    }

    /**
     * Returns the number of valid items in this `Collection`.
     *
     * Uses the `fieldPath` to look up values in all Events.
     * 
     * It then counts the number that are considered valid, which
     * specifically are not:
     *  * NaN
     *  * undefined
     *  * null.
     *
     * @param fieldPath
     * 
     * @return {number} Count of valid events
     */
    sizeValid(fieldPath: string = "value"): number {
        let count = 0;
        this._events.forEach(e => {
            if (e.isValid(fieldPath)) count++;
        });
        return count;
    }

    /**
     * Returns the Event at the given position `pos` in the
     * Collection.
     * 
     * Note: this is the least efficient way to fetch a point.
     * 
     * If you wish to scan the whole set of Events, use an
     * iterator (see `forEach()` and `map()`). For direct access
     * the Collection is optimised for returning results via
     * the Event's key (see `atKey()`).
     */
    eventAt(pos: number): Event<T> {
        return this.eventList().get(pos);
    }

    /**
     * Returns the Event located at the key specified, if it
     * exists. Note that this doesn't find the closest key, or
     * implement `bisect`. For that you need the sorted
     * Collection that is part of a TimeSeries. On the plus side,
     * if you know the key this is an efficient way to access the
     * Event within the Collection.
     * 
     * @example
     * ```
     * const timestamp = new Time("2015-04-22T03:30:00Z");
     * const event = collection.atKey(timestamp)
     * ```
     */
    eventAtKey(key: T): Event<T> {
        return this._events.get(key);
    }

    /**
     * Returns the first event in the Collection.
     */
    firstEvent(): Event<T> {
        return this._events.first();
    }

    /**
     * Returns the last event in the Collection.
     */
    lastEvent(): Event<T> {
        return this._events.last();
    }

    /**
     * Returns all the Event<T>s as an Immutable.List.
     */
    eventList() {
        return this._events.toList();
    }

    /**
     * Returns the events in the Collection as a Immutable.Map, where
     * the key of type T (e.g. Time, Index, or TimeRange),
     * represented as a string, is mapped to the Event itself.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    eventMap() {
        return this._events.toMap();
    }

    /**
     * Returns an iterator (Immutable.Iterator) into the internal
     * event OrderedMap.
     * 
     * @example
     * ```
     * let iterator = collection.entries();
     * for (let x = iterator.next(); !x.done; x = iterator.next()) {
     *     const [key, event] = x.value;
     *     console.log(`Key: ${key}, Event: ${event.toString()}`);
     * }
     * ```
     */
    entries() {
        return this._events.entries();
    }

    /**
     * Iterate over the events in this Collection. Events are in the
     * order that they were added, unless the Collection has since been
     * sorted.
     * 
     * @example
     * ```
     * collection.forEach((e, k) => {
     *     console.log(e, k);
     * })
     * ```
     */
    forEach(sideEffect: (value?: Event<T>, key?: T) => any) {
        return this._events.forEach((e, k) => {
            return sideEffect(e, k)
        });
    }

    /**a
     * Map over the events in this Collection. For each Event
     * passed to your callback function you should map that to
     * a new Event.
     * 
     * @example
     * ```
     * const mapped = sorted.map(event => {
     *     return new Event(event.key(), { a: 55 });
     * });
     * ```
     */
    map(mapper: (event?: Event<T>, key?: T) => Event<T>): Collection<T> {
        return new Collection<T>(Immutable.OrderedMap<T, Event<T>>(
            this._events.map(mapper)
        ));
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
     * const sorted = collection.sortByTime();
     * ```
     * @returns Collection<T> A new collection, sorted by the
     *                        Event key of type T
     */
    sortByTime(): Collection<T> {
        const sorted = Immutable.OrderedMap<T, Event<T>>(
            this._events.sortBy(event => {
                return +event.key().timestamp();
            })
        );
        return new Collection<T>(sorted);
    }

    /**
     * Sorts the Collection using the value referenced by
     * the `field`.
     */
    sort(field: string = "value"): Collection<T> {
        const fs = util.fieldAsArray(field);
        const sorted = Immutable.OrderedMap<T, Event<T>>(
            this._events.sortBy(event => {
                return event.get(fs);
            })
        );
        return new Collection<T>(sorted);
    }

    /**
     * Perform a slice of events within the Collection, returns a new
     * Collection representing a portion of this TimeSeries from `begin` up to
     * but not including `end`.
     */
    slice(begin?: number, end?: number): Collection<T> {
        return this.setEvents(this._events.slice(begin, end));
    }

    /**
     * Returns a new Collection with all Events except the first
     */
    rest(): Collection<T> {
        return this.setEvents(this._events.rest());
    }

    /**
     * Filter the Collection's Events with the supplied function
     * @example
     * ```
     * const filtered = collection.filter(e => e.get("a") < 8)
     * ```
     */
    filter(predicate: (event: Event<T>, key: T) => boolean) {
        return new Collection<T>(Immutable.OrderedMap<T, Event<T>>(
            this._events.filter(predicate)
        ));
    }

    /**
     * Returns the extents of the Collection as a TimeRange.
     * Since this Collection is not necessarily in order, this
     * method will traverse the Collection and determine the
     * ealiest and latest time represented within it.
     */
    timerange(): TimeRange {
        let min;
        let max;
        this.forEach(e => {
            if (!min || e.begin() < min) min = e.begin();
            if (!max || e.end() > max) max = e.end();
        })
        if (min && max) {
            return new TimeRange(min, max);
        }
    }

    /**
     * Aggregates the `Collection`'s `Event`s down using a user defined function
     * `reducer` to do the reduction. Fields to be aggregated are specified using a
     * `fieldSpec` argument, which can be a field name or array of field names.
     * 
     * If the `fieldSpec` matches multiple fields then an object is returned
     * with keys being the fields and values being the aggregation.
     * 
     * The `Collection` class itself contains most of the common aggregation functions
     * built in, but this is here to help when what you need isn't supplied
     * out of the box.
     */
    aggregate(reducer: ReducerFunction, fieldSpec?: string[]);
    aggregate(reducer: ReducerFunction, fieldSpec?: string);
    aggregate(reducer: ReducerFunction, fieldSpec?) {
        const v = Event.aggregate(this.eventList(), reducer, fieldSpec);
        if (_.isString(fieldSpec)) {
            return v[fieldSpec]
        } else if (_.isArray(fieldSpec)) {
            return v;
        } else if (_.isUndefined(fieldSpec)) {
            return v["value"];
        }
    }

    /**
     * Returns the first value in the Collection for the fieldspec
     */
    first(fieldSpec: string, filter?): number;
    first(fieldSpec: string[], filter?): { [s: string]: number[]; };
    first(fieldSpec: any, filter?) {
        return this.aggregate(first(filter), fieldSpec);
    }

    /**
     * Returns the last value in the `Collection` for the fieldspec
     */
    last(fieldSpec: string, filter?): number;
    last(fieldSpec: string[], filter?): { [s: string]: number[]; };
    last(fieldSpec: any, filter?) {
        return this.aggregate(last(filter), fieldSpec);
    }

    /**
     * Returns the sum of the `Event`s in this `Collection`
     * for the fieldspec
     */
    sum(fieldSpec: string, filter?): number;
    sum(fieldSpec: string[], filter?): { [s: string]: number[]; };
    sum(fieldSpec: any, filter?) {
        return this.aggregate(sum(filter), fieldSpec);
    }

    /**
     * Aggregates the `Event`s in this `Collection` down
     * to their average(s)
     */
    avg(fieldSpec: string, filter?): number;
    avg(fieldSpec: string[], filter?): { [s: string]: number[]; };
    avg(fieldSpec: any, filter?) {
        return this.aggregate(avg(filter), fieldSpec);
    }

    /**
     * Aggregates the `Event`s in this `Collection` down to
     * their maximum value(s)
     */
    max(fieldSpec: string, filter?): number;
    max(fieldSpec: string[], filter?): { [s: string]: number[]; };
    max(fieldSpec: any, filter?) {
        return this.aggregate(max(filter), fieldSpec);
    }

    /**
     * Aggregates the `Event`s in this `Collection` down to
     * their minimum value(s)
     */
    min(fieldSpec: string, filter?): number;
    min(fieldSpec: string[], filter?): { [s: string]: number[]; };
    min(fieldSpec: any, filter?) {
        return this.aggregate(min(filter), fieldSpec);
    }

    /**
     * Aggregates the events down to their minimum value
     *
     * @param {string} fieldPath  Column to find the median of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The median value
     */
    median(fieldSpec: string, filter?): number;
    median(fieldSpec: string[], filter?): { [s: string]: number[]; };
    median(fieldSpec: any, filter?) {
        return this.aggregate(median(filter), fieldSpec);
    }

    /**
     * Aggregates the events down to their stdev
     *
     * @param {string} fieldPath  Column to find the stdev of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The resulting stdev value
     */
    stdev(fieldSpec: string, filter?): number;
    stdev(fieldSpec: string[], filter?): { [s: string]: number[]; };
    stdev(fieldSpec: any, filter?) {
        return this.aggregate(stdev(filter), fieldSpec;
    }

    /**
     * Gets percentile q within the Collection. This works the same way as numpy.
     *
     * The percentile function has several parameters that can be supplied:
     * q - The percentile (should be between 0 and 100)
     * fieldSpec - Field or fields to find the percentile of
     * interp - Specifies the interpolation method to use when the desired
     * percentile lies between two data points. Options are:
     *   * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
     *   * lower: i.
     *   * higher: j.
     *   * nearest: i or j whichever is nearest.
     *   * midpoint: (i + j) / 2.
     * filter - Optional filter function used to clean data before aggregating
     */
    percentile(q: number, fieldSpec: string, interp?: InterpolationType, filter?): number;
    percentile(q: number, fieldSpec: string[], interp?: InterpolationType, filter?): { [s: string]: number[]; };
    percentile(q: number, fieldSpec: any, interp: InterpolationType = InterpolationType.linear, filter?) {
        return this.aggregate(percentile(q, interp, filter), fieldSpec);
    }

}

export default Collection;
