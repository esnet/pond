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

import { Event } from "./event";
import { grouped, GroupedCollection, GroupingFunction } from "./grouped";
import { Index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Time } from "./time";
import { timerange, TimeRange } from "./timerange";
import { windowed, WindowedCollection } from "./windowed";

import { Align } from "./align";
import { Collapse } from "./collapse";
import { Fill } from "./fill";
import { Rate } from "./rate";
import { Select } from "./select";

import {
    AlignmentMethod,
    AlignmentOptions,
    CollapseOptions,
    FillOptions,
    RateOptions,
    SelectOptions,
    WindowingOptions
} from "./types";

import util from "./util";

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
 * A Collection holds a ordered (but not sorted) list of Events.
 *
 * In Typescript, you can give a `Collection<T>` a type T, which is
 * the `Event` type accepted into the Collection (e.g. `Collection<Time>`).
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
     * Construct a new Collection
     *
     * @example
     * ```
     * const e1 = new Event(time("2015-04-22T03:30:00Z"), { a: 5, b: 6 });
     * const e2 = new Event(time("2015-04-22T02:30:00Z"), { a: 4, b: 2 });
     *
     * let collection = new Collection<Time>();
     * collection = collection
     *     .addEvent(e1)
     *     .addEvent(e2);
     * ```
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
     * Returns the `Collection` as a regular JSON object. This
     * is implementation specific, in that different types of
     * `Collections` will likely implement this in their own way.
     *
     * In the case of our `OrderedMap`, this code simply called
     * `internalOrderedMap.toJS()` and lets `Immutable.js` do its
     * thing.
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
     * containing that `Event`. Optionally the Events may be de-duplicated.
     *
     * The dedup arg may either be a boolean (in which case any existing
     * Events with the same key will be replaced by this new Event), or
     * with a function. If dedup is a function that function will be
     * passed a list of all `Event`'s with that key and will be expected
     * to return a single `Event` to replace them with.
     *
     * @example
     * ```
     * let collection = pond.collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2);
     * ```
     * @example
     * ```
     * // dedup with the sum of the duplicated events
     * const collection = pond.collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2)
     *     .addEvent(e3, (events) => {
     *         const a = events.reduce((sum, e) => sum + e.get("a"), 0);
     *         return new Event<Time>(timestamp2, { a });
     *     });
     *
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
        let newEvents = events;

        newEvents = this.onEventAdded(events);

        if (newEvents === events) {
            // Add in the new event's index to our keyMap indicies
            indicies = indicies.add(newEvents.size - 1);
            newKeyMap = this._keyMap.set(k, indicies);
        } else {
            newKeyMap = Collection.buildKeyMap(newEvents);
        }

        return this.clone(newEvents, newKeyMap) as Collection<T>;
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
     * Returns the `Event` at the given position `pos` in the
     * `Collection`.
     *
     * Note: this is the least efficient way to fetch a point.
     *
     * If you wish to scan the whole set of Events, use an
     * iterator (see `forEach()` and `map()`). For direct access
     * the `Collection` is optimised for returning results via
     * the `Event`'s key (see `atKey()`).
     */
    public at(pos: number): Event<T> {
        return this.eventList().get(pos);
    }

    /**
     * Returns the `Event` located at the key specified, if it
     * exists. Note that this doesn't find the closest key, or
     * implement `bisect`. For that you need the sorted
     * Collection that is part of a `TimeSeries`. On the plus side,
     * if you know the key this is an efficient way to access the
     * `Event` within the `Collection`.
     *
     * @example
     * ```
     * const timestamp = new Time("2015-04-22T03:30:00Z");
     * const event = collection.atKey(timestamp)
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
    public eventList() {
        return this._events.toList();
    }

    /**
     * Returns the events in the `Collection` as an `Immutable.Map`, where
     * the key of type `T` (e.g. Time, Index, or TimeRange),
     * represented as a string, is mapped to the Event itself.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    public eventMap() {
        return this._events.toMap();
    }

    /**
     * Returns an iterator (`Immutable.Iterator`) into the internal
     * event `OrderedMap`.
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
    public entries(): IterableIterator<[number, Event<T>]> {
        return this._events.entries();
    }

    /**
     * Iterate over the events in this `Collection`. Events are in the
     * order that they were added, unless the Collection has since been
     * sorted.
     * 
     * Returns the number of items iterated.
     *
     * @example
     * ```
     * collection.forEach((e, k) => {
     *     console.log(e, k);
     * })
     * ```
     */
    public forEach(sideEffect: (value?: Event<T>, index?: number) => any): number {
        return this._events.forEach(sideEffect);
    }

    /**
     * Map over the events in this Collection. For each `Event`
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
    public map<M extends Key>(
        mapper: (event?: Event<T>, index?: number) => Event<M>
    ): Collection<M> {
        const remapped = this._events.map(mapper);
        return new Collection<M>(Immutable.List<Event<M>>(remapped));
    }

    /**
     * Remap the keys, but keep the data the same. You can use this if you
     * have a `Collection` of `Index`es and want to convert to `Time`s, for
     * example. The return result of remapping the keys of a `Collection<T>`
     * with new keys of type `U`, will be a `Collection<U>`.
     *
     * @example
     *
     * In this example we remap `Time` keys to `TimeRange` keys using the `Time.toTimeRange()`
     * method, centering the new `TimeRange`s around each `Time` with duration given
     * by the `Duration` object supplied, in this case representing one hour.
     *
     * ```
     * const remapped = myCollection.mapKeys<TimeRange>((t) =>
     *     t.toTimeRange(duration("1h"), TimeAlignment.Middle));
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
     * FlatMap over the events in this `Collection`. For each `Event`
     * passed to your callback function you should map that to
     * zero, one or many Events, returned as an `Immutable.List`.
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
     * GroupBy a field's value. The result is a `CollectionMap`, mapping
     * a key (the value of the field) to a `Collection` of Events that
     * matched field.
     *
     * ```
     * const grouped = c
     *     .groupBy("team_name")
     *     .aggregate({
     *         "a_avg": ["a", avg()],
     *         "b_avg": ["b", avg()],
     *     });
     * ```
     */
    public groupBy(field: string | string[] | GroupingFunction<T>): GroupedCollection<T> {
        return grouped(field, this);
    }

    /**
     * Window the `Collection` into a given period of time.
     *
     * @example
     * ```
     * const windowed = collection.window(period("1h"));
     * ```
     */
    public window(options: WindowingOptions): WindowedCollection<T> {
        return windowed(options, Immutable.Map({ all: this }));
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
     * Filter the Collection's `Event`'s with the supplied function
     * @example
     * ```
     * const filtered = collection.filter(e => e.get("a") < 8)
     * ```
     */

    // filter(predicate: (event: Event<T>, key: T) => boolean) {
    //     return new Collection<T>(Immutable.OrderedMap<T, Event<T>>(
    //         this._events.filter(predicate)
    //     ));
    // }

    /**
     * Returns the extents of the `Collection` as a `TimeRange`.
     * Since this `Collection` is not necessarily in order, this
     * method will traverse the `Collection` and determine the
     * ealiest and latest time represented within it.
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
     * to their average(s)
     */
    public avg(fieldSpec: string, filter?): number;
    public avg(fieldSpec: string[], filter?): { [s: string]: number[] };
    public avg(fieldSpec: any, filter?) {
        return this.aggregate(avg(filter), fieldSpec);
    }

    /**
     * Aggregates the `Event`'s in this `Collection` down to
     * their maximum value(s)
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
     * * q - The percentile (should be between 0 and 100)
     * * fieldSpec - Field or fields to find the percentile of
     * * interp - Specifies the interpolation method to use when the desired
     * * filter - Optional filter function used to clean data before aggregating
     *
     * Percentile lies between two data points.
     *
     * Options are:
     *   * linear: i + (j - i) * fraction, where fraction is the
     *             fractional part of the index surrounded by i and j.
     *   * lower: i.
     *   * higher: j.
     *   * nearest: i or j whichever is nearest.
     *   * midpoint: (i + j) / 2.
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
     * This works the same way as numpy.
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
     * The `align()` method applied to a collection of events that might come in with timestamps
     * at uneven intervals and produces a new `Collection` of those points, but aligned on
     * precise time window boundaries. A `Collection` containing four events with following
     * timestamps:
     * ```
     *     0:40
     *     1:05
     *     1:45
     *     2:10
     * ```
     *
     * Given a period of 1m (every one minute), a new `Collection` with two events at the following
     * times will be produced:
     *
     * ```
     *     1:00
     *     2:00
     * ```
     *
     * Only a `Collection` of `Event<Time>` objects can be aligned. `Event<Index>`
     * objects are basically already aligned and it makes no sense in the case of a
     * `Event<TimeRange>`.
     *
     * It should also be noted that the aligned event will only contain the fields that
     * alignment was requested on. Which is to say if you have two columns, "in" and "out",
     * and only request to align the "in" column, the "out" value will not be contained in
     * the resulting collection.
     */
    public align(options: AlignmentOptions): Collection<T> {
        const p = new Align<T>(options);
        return this.flatMap<T>(e => p.addEvent(e));
    }

    public rate(options: RateOptions): Collection<TimeRange> {
        const p = new Rate<T>(options);
        return this.flatMap<TimeRange>(e => p.addEvent(e));
    }

    public fill(options: FillOptions): Collection<T> {
        const p = new Fill<T>(options);
        return this.flatMap<T>(e => p.addEvent(e));
    }

    public collapse(options: CollapseOptions): Collection<T> {
        const p = new Collapse<T>(options);
        return this.flatMap(e => p.addEvent(e));
    }

    public select(options: SelectOptions): Collection<T> {
        const p = new Select<T>(options);
        return this.flatMap(e => p.addEvent(e));
    }

    //
    // To be reimplemented by subclass
    //

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
