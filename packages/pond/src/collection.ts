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

import { Base } from "./base";
import { Collapse } from "./collapse";
import { Event } from "./event";
import { Key } from "./key";
import { Select } from "./select";
import { timerange, TimeRange } from "./timerange";

import { CollapseOptions, SelectOptions } from "./types";

import { DedupFunction, ReducerFunction, ValueMap } from "./types";

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
 * Convert the `fieldspec` into a list if it is not already.
 */
function fieldAsArray(field: string | string[]): string[] {
    if (_.isArray(field)) {
        return field;
    } else if (_.isString(field)) {
        return field.split(".");
    }
}

/**
 * A `Collection` holds a ordered (but not sorted) list of `Event`s and provides the
 * underlying functionality for manipulating those `Event`s.
 *
 * In Typescript, `Collection` is a generic of type `T`, which is the homogeneous
 * `Event` type of the `Collection`. `T` is likely one of:
 *  * `Collection<Time>`
 *  * `Collection<TimeRange>`
 *  * `Collection<Index>`
 *
 * A `Collection` has several sub-classes, including a `SortedCollection`, which maintains
 * `Events` in chronological order.
 *
 * A `TimeSeries` wraps a `SortedCollection` by attaching meta data to the series of
 * chronological `Event`s. This provides the most common structure to use for dealing with
 * sequences of `Event`s.
 */
export class Collection<T extends Key> extends Base {
    /**
     * Rebuild the keyMap from scratch
     */
    protected static buildKeyMap<S extends Key>(
        events: Immutable.List<Event<S>>
    ): Immutable.Map<string, Immutable.Set<number>> {
        let keyMap = Immutable.Map<string, Immutable.Set<number>>();

        events.forEach((e, i) => {
            const k = e.getKey().toString();
            const indicies: Immutable.Set<number> = keyMap.has(k)
                ? keyMap.get(k).add(i)
                : Immutable.Set<number>([i]);
            keyMap = keyMap.set(k, indicies);
        });

        return keyMap;
    }

    // Member variables
    protected _events: Immutable.List<Event<T>>;
    protected _keyMap: Immutable.Map<string, Immutable.Set<number>>;

    /**
     * Construct a new `Collection`.
     *
     * You can construct a new empty `Collection` with `new`:
     *
     * ```
     * const myCollection = new Collection<Time>();
     * ```
     *
     * Alternatively, you can use the factory function:
     *
     * ```
     * const myCollection = collection<Time>();
     * ```
     *
     * A `Collection` may also be constructed with an initial list of `Events`
     * by supplying an `Immutable.List<Event<T>>`, or from another `Collection`
     * to make a copy.
     *
     * See also `SortedCollection`, which keeps `Event`s in chronological order,
     * and also allows you to do `groupBy` and `window` operations. For a higher
     * level interface for managing `Event`s, use the `TimeSeries`, which wraps
     * the `SortedCollection` along with meta data about that collection.
     */
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>) {
        super();
        if (!arg1) {
            this._events = Immutable.List<Event<T>>();
            this._keyMap = Immutable.Map<string, Immutable.Set<number>>();
        } else if (arg1 instanceof Collection) {
            const other = arg1 as Collection<T>;
            this._events = other._events;
            this._keyMap = other._keyMap;
        } else if (Immutable.List.isList(arg1)) {
            this._events = arg1;
            this._keyMap = Collection.buildKeyMap<T>(arg1);
        }
    }

    /**
     * Returns the `Collection` as a regular JSON object.
     */
    public toJSON(): any {
        return this._events.toJS();
    }

    /**
     * Serialize out the `Collection` as a string. This will be the
     * string representation of `toJSON()`.
     */
    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Adds a new `Event` into the `Collection`, returning a new `Collection`
     * containing that `Event`. Optionally the `Event`s may be de-duplicated.
     *
     * The dedup arg may `true` (in which case any existing `Event`s with the
     * same key will be replaced by this new Event), or with a function. If
     * dedup is a user function that function will be passed a list of all `Event`s
     * with that duplicated key and will be expected to return a single `Event`
     * to replace them with, thus shifting de-duplication logic to the user.
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
     * const myCollection = collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2)
     *     .addEvent(e3, (events) => {
     *         const a = events.reduce((sum, e) => sum + e.get("a"), 0);
     *         return new Event<Time>(t, { a });
     *     });
     * ```
     */
    public addEvent(event: Event<T>, dedup?: DedupFunction<T> | boolean): Collection<T> {
        const k = event.getKey().toString();

        let events = this._events;
        let e = event; // Our event to be added
        let indicies: Immutable.Set<number> = this._keyMap.has(k)
            ? this._keyMap.get(k)
            : Immutable.Set<number>();

        // Dedup
        if (dedup) {
            const conflicts = this.atKey(event.getKey()).toList();
            if (conflicts.size > 0) {
                // Remove duplicates from the event list
                events = this._events.filterNot(
                    duplicate => duplicate.getKey().toString() === event.getKey().toString()
                );

                // Resolves the duplicates and this event to a single event
                if (_.isFunction(dedup)) {
                    e = dedup(conflicts.concat(e));
                }

                // Indicies for this key will only have this one event in it
                indicies = Immutable.Set();
            }
        }

        // Add the new event to our event list
        events = events.push(e);

        // Call the post add hook to give sub-classes a chance to modify
        // the event list. If they do, then we'll rebuild the keyMap.
        let newKeyMap = this._keyMap;

        indicies = indicies.add(events.size - 1);
        newKeyMap = this._keyMap.set(k, indicies);

        return this.clone(events, newKeyMap) as Collection<T>;
    }

    /**
     * Removes the `Event` (or duplicate keyed Events) with the given key.
     */
    public removeEvents(key: T): Collection<T> {
        const k = key.toString();
        const indices = this._keyMap.get(k);
        const events = this._events.filterNot((event, i) => indices.has(i));
        const keyMap = this._keyMap.remove(k);
        return this.clone(events, keyMap) as Collection<T>;
    }

    /**
     * Takes the last n `Event`'s of the `Collection` and returns a new `Collection`.
     */
    public takeLast(amount: number): Collection<T> {
        const events = this._events.takeLast(amount);
        const keyMap = Collection.buildKeyMap(events);
        return this.clone(events, keyMap) as Collection<T>;
    }

    /**
     * Completely replace the existing `Event`'s in this Collection.
     */
    public setEvents(events: Immutable.List<Event<T>>): Collection<T> {
        let keyMap = Immutable.Map<string, Immutable.Set<number>>();
        events.forEach((e, i) => {
            const k = e.getKey().toString();
            const indicies: Immutable.Set<number> = keyMap.has(k)
                ? keyMap.get(k).add(i)
                : Immutable.Set<number>([i]);
            keyMap = keyMap.set(k, indicies);
        });
        return this.clone(events, keyMap) as Collection<T>;
    }

    /**
     * Returns the number of `Event`'s in this Collection
     */
    public size(): number {
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
     */
    public sizeValid(fieldPath: string = "value"): number {
        let count = 0;
        this._events.forEach(e => {
            if (e.isValid(fieldPath)) {
                count++;
            }
        });
        return count;
    }

    /**
     * Return if the `Collection` has any events in it
     */
    public isEmpty(): boolean {
        return this.size() === 0;
    }

    /**
     * Returns the `Event` at the given position `pos` in the `Collection`. The
     * events in the `Collection` will be in the same order as they were inserted,
     * unless some sorting has been evoked by the user.
     *
     * Note: this is the least efficient way to fetch a point. If you wish to scan
     * the whole set of Events, use iterators (see `forEach()` and `map()`).
     * For direct access the `Collection` is optimized for returning results via
     * the `Event`'s key T, i.e. timestamp (see `atKey()`).
     *
     * Example:
     * ```
     * const c1 = collection(
     *     Immutable.List([
     *         event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 6 })),
     *         event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 4, b: 2 }))
     *     ])
     * );
     * c1.at(1).get("a")  // 4
     * ```
     */
    public at(pos: number): Event<T> {
        return this.eventList().get(pos);
    }

    /**
     * Returns the `Event` located at the key specified, if it exists.
     *
     * Note: this doesn't find the closest key, or implement `bisect`. For that you need the
     * `SortedCollection`, that is also part of a `TimeSeries`.
     * On the plus side, if you know the key this is an efficient way to access the
     * `Event` within the `Collection`.
     *
     * Example:
     * ```
     * const t1 = time("2015-04-22T03:30:00Z");
     * const t2 = time("2015-04-22T02:30:00Z");
     * const c1 = collection(
     *     Immutable.List([
     *         event(t1, Immutable.Map({ a: 5, b: 6 })),
     *         event(t2, Immutable.Map({ a: 4, b: 2 }))
     *     ])
     * );
     * const event = collection.atKey(t2);
     * event.get("a")   // 4
     * ```
     */
    public atKey(key: T): Immutable.List<Event<T>> {
        const indexes = this._keyMap.get(key.toString());
        return indexes
            .map(i => {
                return this._events.get(i);
            })
            .toList();
    }

    /**
     * Returns the first event in the `Collection`.
     */
    public firstEvent(): Event<T> {
        return this._events.first();
    }

    /**
     * Returns the last event in the `Collection`.
     */
    public lastEvent(): Event<T> {
        return this._events.last();
    }

    /**
     * Returns all the `Event<T>`s as an `Immutable.List`.
     */
    public eventList(): Immutable.List<Event<T>> {
        return this._events.toList();
    }

    /**
     * Returns the events in the `Collection` as an `Immutable.Map`, where
     * the key of type `T` (`Time`, `Index`, or `TimeRange`),
     * represented as a string, is mapped to the `Event` itself.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    public eventMap() {
        return this._events.toMap();
    }

    /**
     * Returns an iterator (`IterableIterator`) into the internal
     * list of events within this `Collection`.
     *
     * Example:
     * ```
     * let iterator = collection.entries();
     * for (let x = iterator.next(); !x.done; x = iterator.next()) {
     *     const [key, event] = x.value;
     *     console.log(`Key: ${key}, Event: ${event.toString()}`);
     * }
     * ```
     */
    public entries(): IterableIterator<[number, Event<T>]> {
        return this._events.entries();
    }

    /**
     * Iterate over the events in this `Collection`.
     *
     * `Event`s are in the order that they were added, unless the Collection
     * has since been sorted. The `sideEffect` is a user supplied function which
     * is passed the `Event<T>` and the index.
     *
     * Returns the number of items iterated.
     *
     * Example:
     * ```
     * collection.forEach((e, i) => {
     *     console.log(`Event[${i}] is ${e.toString()}`);
     * })
     * ```
     */
    public forEach(sideEffect: (value?: Event<T>, index?: number) => any): number {
        return this._events.forEach(sideEffect);
    }

    /**
     * Map the `Event`s in this `Collection` to new `Event`s.
     *
     * For each `Event` passed to your `mapper` function you return a new Event.
     *
     * Example:
     * ```
     * const mapped = sorted.map(event => {
     *     return new Event(event.key(), { a: event.get("x") * 2 });
     * });
     * ```
     */
    public map<M extends Key>(
        mapper: (event?: Event<T>, index?: number) => Event<M>
    ): Collection<M> {
        const remapped = this._events.map(mapper);
        return new Collection<M>(Immutable.List<Event<M>>(remapped));
    }

    /**
     * Remap the keys, but keep the data the same. You can use this if you
     * have a `Collection` of `Event<Index>` and want to convert to events
     * of `Event<Time>`s, for example. The return result of remapping the
     * keys of a T to U i.e. `Collection<T>` remapped with new keys of type
     * `U` as a `Collection<U>`.
     *
     * Example:
     *
     * In this example we remap `Time` keys to `TimeRange` keys using the `Time.toTimeRange()`
     * method, centering the new `TimeRange`s around each `Time` with duration given
     * by the `Duration` object supplied, in this case representing one hour.
     *
     * ```
     * const remapped = myCollection.mapKeys<TimeRange>(t =>
     *     t.toTimeRange(duration("1h"), TimeAlignment.Middle)
     * );
     * ```
     *
     */
    public mapKeys<U extends Key>(mapper: (key: T) => U): Collection<U> {
        const list = this._events.map(
            event => new Event<U>(mapper(event.getKey()), event.getData())
        );
        return new Collection<U>(list);
    }

    /**
     * Flat map over the events in this `Collection`.
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
    ): Collection<U> {
        const remapped: Immutable.List<Event<U>> = this._events.flatMap(mapper);
        return new Collection<U>(Immutable.List<Event<U>>(remapped));
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
        const sorted = Immutable.List<Event<T>>(
            this._events.sortBy(event => {
                return +event.getKey().timestamp();
            })
        );
        return new Collection<T>(sorted);
    }

    /**
     * Sorts the `Collection` using the value referenced by
     * the `field`.
     */
    public sort(field: string | string[]): Collection<T> {
        const fs = fieldAsArray(field);
        const sorted = Immutable.List<Event<T>>(
            this._events.sortBy(event => {
                return event.get(fs);
            })
        );
        return new Collection<T>(sorted);
    }

    /**
     * Perform a slice of events within the `Collection`, returns a new
     * `Collection` representing a portion of this `TimeSeries` from `begin` up to
     * but not including `end`.
     */
    public slice(begin?: number, end?: number): Collection<T> {
        return this.setEvents(this._events.slice(begin, end));
    }

    /**
     * Returns a new `Collection` with all `Event`s except the first
     */
    public rest(): Collection<T> {
        return this.setEvents(this._events.rest());
    }

    /**
     * Filter the Collection's `Event`'s with the supplied function.
     *
     * The function `predicate` is passed each `Event` and should return
     * true to keep the `Event` or false to discard.
     *
     * Example:
     * ```
     * const filtered = collection.filter(e => e.get("a") < 8)
     * ```
     */
    public filter(predicate: (event: Event<T>, index: number) => boolean) {
        return this.setEvents(this._events.filter(predicate));
    }

    /**
     * Returns the time range extents of the `Collection` as a `TimeRange`.
     *
     * Since this `Collection` is not necessarily in order, this method will traverse the
     * `Collection` and determine the earliest and latest time represented within it.
     */
    public timerange(): TimeRange {
        let minimum;
        let maximum;
        this.forEach(e => {
            if (!minimum || e.begin() < minimum) {
                minimum = e.begin();
            }
            if (!maximum || e.end() > maximum) {
                maximum = e.end();
            }
        });
        if (minimum && maximum) {
            return timerange(minimum, maximum);
        }
    }

    /**
     * Aggregates the `Collection`'s `Event`s down to a single value per field.
     *
     * This makes use of a user defined function suppled as the `reducer` to do
     * the reduction of values to a single value. The `ReducerFunction` is defined
     * like so:
     *
     * ```
     * (values: number[]) => number
     * ```
     *
     * Fields to be aggregated are specified using a `fieldSpec` argument, which
     * can be a field name or array of field names.
     *
     * If the `fieldSpec` matches multiple fields then an object is returned
     * with keys being the fields and the values being the aggregated value for
     * those fields. If the `fieldSpec` is for a single field then just the
     * aggregated value is returned.
     *
     * Note: The `Collection` class itself contains most of the common aggregation functions
     * built in (e.g. `myCollection.avg("value")`), but this is here to help when what
     * you need isn't supplied out of the box.
     */
    public aggregate(reducer: ReducerFunction, fieldSpec: string | string[]);
    public aggregate(reducer: ReducerFunction, fieldSpec?) {
        const v: ValueMap = Event.aggregate(this.eventList(), reducer, fieldSpec);
        if (_.isString(fieldSpec)) {
            return v[fieldSpec];
        } else if (_.isArray(fieldSpec)) {
            return v;
        }
    }

    /**
     * Returns the first value in the `Collection` for the `fieldspec`
     */
    public first(fieldSpec: string, filter?): number;
    public first(fieldSpec: string[], filter?): { [s: string]: number[] };
    public first(fieldSpec: any, filter?) {
        return this.aggregate(first(filter), fieldSpec);
    }

    /**
     * Returns the last value in the `Collection` for the `fieldspec`
     */
    public last(fieldSpec: string, filter?): number;
    public last(fieldSpec: string[], filter?): { [s: string]: number[] };
    public last(fieldSpec: any, filter?) {
        return this.aggregate(last(filter), fieldSpec);
    }

    /**
     * Returns the sum of the `Event`'s in this `Collection`
     * for the `fieldspec`
     */
    public sum(fieldSpec: string, filter?): number;
    public sum(fieldSpec: string[], filter?): { [s: string]: number[] };
    public sum(fieldSpec: any, filter?) {
        return this.aggregate(sum(filter), fieldSpec);
    }

    /**
     * Aggregates the `Event`'s in this `Collection` down
     * to their average(s).
     *
     * The `fieldSpec` passed into the avg function is either
     * a field name or a list of fields.
     *
     * The `filter` is one of the Pond filter functions that can be used to remove
     * bad values in different ways before filtering.
     *
     * Example:
     * ```
     * const e1 = event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 8, b: 2 }));
     * const e2 = event(time("2015-04-22T01:30:00Z"), Immutable.Map({ a: 3, b: 3 }));
     * const e3 = event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 7 }));
     * const c = collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2)
     *     .addEvent(e3);
     *
     * c.avg("b") // 4
     */
    public avg(fieldSpec: string, filter?): number;
    public avg(fieldSpec: string[], filter?): { [s: string]: number[] };
    public avg(fieldSpec: any, filter?) {
        return this.aggregate(avg(filter), fieldSpec);
    }

    /**
     * Aggregates the `Event`'s in this `Collection` down to
     * their maximum value(s).
     *
     * The `fieldSpec` passed into the avg function is either a field name or
     * a list of fields.
     *
     * The `filter` is one of the Pond filter functions that can be used to remove
     * bad values in different ways before filtering.
     *
     * The result is the maximum value if the fieldSpec is for one field. If
     * multiple fields then a map of fieldName -> max values is returned
     */
    public max(fieldSpec: string, filter?): number;
    public max(fieldSpec: string[], filter?): { [s: string]: number[] };
    public max(fieldSpec: any, filter?) {
        return this.aggregate(max(filter), fieldSpec);
    }

    /**
     * Aggregates the `Event`'s in this `Collection` down to
     * their minimum value(s)
     */
    public min(fieldSpec: string, filter?): number;
    public min(fieldSpec: string[], filter?): { [s: string]: number[] };
    public min(fieldSpec: any, filter?) {
        return this.aggregate(min(filter), fieldSpec);
    }

    /**
     * Aggregates the events down to their median value
     */
    public median(fieldSpec: string, filter?): number;
    public median(fieldSpec: string[], filter?): { [s: string]: number[] };
    public median(fieldSpec: any, filter?) {
        return this.aggregate(median(filter), fieldSpec);
    }

    /**
     * Aggregates the events down to their standard deviation
     */
    public stdev(fieldSpec: string, filter?): number;
    public stdev(fieldSpec: string[], filter?): { [s: string]: number[] };
    public stdev(fieldSpec: any, filter?) {
        return this.aggregate(stdev(filter), fieldSpec);
    }

    /**
     * Gets percentile q within the `Collection`. This works the same way as numpy.
     *
     * The percentile function has several parameters that can be supplied:
     * * `q` - The percentile (should be between 0 and 100)
     * * `fieldSpec` - Field or fields to find the percentile of
     * * `interp` - Specifies the interpolation method to use when the desired, see below
     * * `filter` - Optional filter function used to clean data before aggregating
     *
     * For `interp` a `InterpolationType` should be supplied if the default ("linear") is
     * not used. This enum is defined like so:
     * ```
     * enum InterpolationType {
     *     linear = 1,
     *     lower,
     *     higher,
     *     nearest,
     *     midpoint
     * }
     * ```
     * Emum values:
     *   * `linear`: i + (j - i) * fraction, where fraction is the
     *             fractional part of the index surrounded by i and j.
     *   * `lower`: i.
     *   * `higher`: j.
     *   * `nearest`: i or j whichever is nearest.
     *   * `midpoint`: (i + j) / 2.
     *
     */
    public percentile(q: number, fieldSpec: string, interp?: InterpolationType, filter?): number;
    public percentile(
        q: number,
        fieldSpec: string[],
        interp?: InterpolationType,
        filter?
    ): { [s: string]: number[] };
    public percentile(
        q: number,
        fieldSpec: any,
        interp: InterpolationType = InterpolationType.linear,
        filter?
    ) {
        return this.aggregate(percentile(q, interp, filter), fieldSpec);
    }

    /**
     * Gets n quantiles within the `Collection`.
     *
     * The quantiles function has several parameters that can be supplied:
     * * `n` - The number of quantiles
     * * `column` - Field to find the quantiles within
     * * `interp` - Specifies the interpolation method to use when the desired, see below
     *
     * For `interp` a `InterpolationType` should be supplied if the default ("linear") is
     * not used. This enum is defined like so:
     * ```
     * enum InterpolationType {
     *     linear = 1,
     *     lower,
     *     higher,
     *     nearest,
     *     midpoint
     * }
     * ```
     * Emum values:
     *   * `linear`: i + (j - i) * fraction, where fraction is the
     *             fractional part of the index surrounded by i and j.
     *   * `lower`: i.
     *   * `higher`: j.
     *   * `nearest`: i or j whichever is nearest.
     *   * `midpoint`: (i + j) / 2.
     */
    public quantile(
        n: number,
        column: string = "value",
        interp: InterpolationType = InterpolationType.linear
    ) {
        const results = [];
        const sorted = this.sort(column);
        const subsets = 1.0 / n;

        if (n > this.size()) {
            throw new Error("Subset n is greater than the Collection length");
        }

        for (let i = subsets; i < 1; i += subsets) {
            const index = Math.floor((sorted.size() - 1) * i);
            if (index < sorted.size() - 1) {
                const fraction = (sorted.size() - 1) * i - index;
                const v0 = +sorted.at(index).get(column);
                const v1 = +sorted.at(index + 1).get(column);
                let v;
                if (InterpolationType.lower || fraction === 0) {
                    v = v0;
                } else if (InterpolationType.linear) {
                    v = v0 + (v1 - v0) * fraction;
                } else if (InterpolationType.higher) {
                    v = v1;
                } else if (InterpolationType.nearest) {
                    v = fraction < 0.5 ? v0 : v1;
                } else if (InterpolationType.midpoint) {
                    v = (v0 + v1) / 2;
                }
                results.push(v);
            }
        }
        return results;
    }

    /**
     * Returns true if all events in this `Collection` are in chronological order.
     */
    public isChronological(): boolean {
        let result = true;
        let t;
        this.forEach(e => {
            if (!t) {
                t = e.timestamp().getTime();
            } else {
                if (e.timestamp() < t) {
                    result = false;
                }
                t = e.timestamp();
            }
        });
        return result;
    }

    /**
     * Collapse multiple columns of a `Collection` into a new column.
     *
     * The `collapse()` method needs to be supplied with a `CollapseOptions`
     * object. You use this to specify the columns to collapse, the column name
     * of the column to collapse to and the reducer function. In addition you
     * can choose to append this new column or use it in place of the columns
     * collapsed.
     *
     * ```
     * {
     *    fieldSpecList: string[];
     *    fieldName: string;
     *    reducer: any;
     *    append: boolean;
     * }
     * ```
     * Options:
     *  * `fieldSpecList` - the list of fields to collapse
     *  * `fieldName` - the new field's name
     *  * `reducer()` - a function to collapse using e.g. `avg()`
     *  * `append` - to include only the new field, or include it in addition
     *     to the previous fields.
     *
     * Example:
     * ```
     * // Initial collection
     * const t1 = time("2015-04-22T02:30:00Z");
     * const t2 = time("2015-04-22T03:30:00Z");
     * const t3 = time("2015-04-22T04:30:00Z");
     * const c = collection<Time>()
     *     .addEvent(event(t1, Immutable.Map({ a: 5, b: 6 })))
     *     .addEvent(event(t2, Immutable.Map({ a: 4, b: 2 })))
     *     .addEvent( event(t2, Immutable.Map({ a: 6, b: 3 })));
     *
     * // Sum columns "a" and "b" into a new column "v"
     * const sums = c.collapse({
     *     fieldSpecList: ["a", "b"],
     *     fieldName: "v",
     *     reducer: sum(),
     *     append: false
     * });
     *
     * sums.at(0).get("v")  // 11
     * sums.at(1).get("v")  // 6
     * sums.at(2).get("v")  // 9
     * ```
     */
    public collapse(options: CollapseOptions): Collection<T> {
        const p = new Collapse<T>(options);
        return this.flatMap(e => p.addEvent(e));
    }

    /**
     * Select out specified columns from the `Event`s within this `Collection`.
     *
     * The `select()` method needs to be supplied with a `SelectOptions`
     * object, which takes the following form:
     *
     * ```
     * {
     *     fields: string[];
     * }
     * ```
     * Options:
     *  * `fields` - array of columns to keep within each `Event`.
     *
     * Example:
     * ```
     * const timestamp1 = time("2015-04-22T02:30:00Z");
     * const timestamp2 = time("2015-04-22T03:30:00Z");
     * const timestamp3 = time("2015-04-22T04:30:00Z");
     * const e1 = event(timestamp1, Immutable.Map({ a: 5, b: 6, c: 7 }));
     * const e2 = event(timestamp2, Immutable.Map({ a: 4, b: 5, c: 6 }));
     * const e3 = event(timestamp2, Immutable.Map({ a: 6, b: 3, c: 2 }));
     *
     * const c = collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2)
     *     .addEvent(e3);
     *
     * const c1 = c.select({
     *     fields: ["b", "c"]
     * });
     *
     * // result: 3 events containing just b and c (a is discarded)
     * ```
     */
    public select(options: SelectOptions): Collection<T> {
        const p = new Select<T>(options);
        return this.flatMap(e => p.addEvent(e));
    }

    //
    // To be reimplemented by subclass
    //

    /**
     * Internal method to clone this `Collection` (protected)
     */
    protected clone(events, keyMap): Base {
        const c = new Collection<T>();
        c._events = events;
        c._keyMap = keyMap;
        return c;
    }

    protected onEventAdded(events: Immutable.List<Event<T>>): Immutable.List<Event<T>> {
        return events;
    }
}

function collectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>) {
    return new Collection<T>(arg1);
}

export { collectionFactory as collection };
