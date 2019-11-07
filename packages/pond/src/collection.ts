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
import { avg, InterpolationType, max, median, percentile, stdev, sum } from "./functions";
import { Key } from "./key";
import { timerange, TimeRange } from "./timerange";
import { DedupFunction, ReducerFunction } from "./types";

/**
 * A function which takes a data value of type D and returns a single number.
 */
export type Selector<D> = (data: D) => number;

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
 * In Typescript, `Collection` is a generic of type `K` and `D`, which is the homogeneous
 * `Event` type of the `Collection`.
 *
 * `K` is likely one of:
 *  * `Collection<Time>`
 *  * `Collection<TimeRange>`
 *  * `Collection<Index>`
 *
 * `D` is the type of the data in each event.
 *
 * A `Collection` has several sub-classes, including a `SortedCollection`, which maintains
 * `Events` in chronological order.
 *
 * A `TimeSeries` wraps a `SortedCollection` by attaching meta data to the series of
 * chronological `Event`s. This provides the most common structure to use for dealing with
 * sequences of `Event`s.
 */
export class Collection<K extends Key, D> extends Base {
    /**
     * Rebuild the keyMap from scratch
     */
    protected static buildKeyMap<S extends Key, D>(
        events: Immutable.List<Event<S, D>>
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
    protected events: Immutable.List<Event<K, D>>;
    protected keyMap: Immutable.Map<string, Immutable.Set<number>>;

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
     * by supplying an `Immutable.List<Event<K, D>>`, or from another `Collection`
     * to make a copy.
     *
     * See also `SortedCollection`, which keeps `Event`s in chronological order,
     * and also allows you to do `groupBy` and `window` operations. For a higher
     * level interface for managing `Event`s, use the `TimeSeries`, which wraps
     * the `SortedCollection` along with meta data about that collection.
     */
    constructor(arg1?: Immutable.List<Event<K, D>> | Collection<K, D>) {
        super();
        if (!arg1) {
            this.events = Immutable.List<Event<K, D>>();
            this.keyMap = Immutable.Map<string, Immutable.Set<number>>();
        } else if (arg1 instanceof Collection) {
            const other = arg1 as Collection<K, D>;
            this.events = other.events;
            this.keyMap = other.keyMap;
        } else if (Immutable.List.isList(arg1)) {
            this.events = arg1;
            this.keyMap = Collection.buildKeyMap<K, D>(arg1);
        }
    }

    /**
     * Returns the `Collection` as a regular JSON object.
     */
    public toJSON(marshaller?: (d: D) => object): any {
        return this.events.map(e => e.toJSON(marshaller)).toArray();
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
    public addEvent(event: Event<K, D>, dedup?: DedupFunction<K, D> | boolean): Collection<K, D> {
        const k = event.getKey().toString();

        let events = this.events;
        let e = event; // Our event to be added
        let indicies: Immutable.Set<number> = this.keyMap.has(k)
            ? this.keyMap.get(k)
            : Immutable.Set<number>();

        // Dedup
        if (dedup) {
            const conflicts = this.atKey(event.getKey()).toList();
            if (conflicts.size > 0) {
                // Remove duplicates from the event list
                events = this.events.filterNot(
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
        let newKeyMap = this.keyMap;

        indicies = indicies.add(events.size - 1);
        newKeyMap = this.keyMap.set(k, indicies);

        return this.clone(events, newKeyMap) as Collection<K, D>;
    }

    /**
     * Removes the `Event` (or duplicate keyed Events) with the given key.
     */
    public removeEvents(key: K): Collection<K, D> {
        const k = key.toString();
        const indices = this.keyMap.get(k);
        const events = this.events.filterNot((event, i) => indices.has(i));
        const keyMap = this.keyMap.remove(k);
        return this.clone(events, keyMap) as Collection<K, D>;
    }

    /**
     * Takes the last n `Event`'s of the `Collection` and returns a new `Collection`.
     */
    public takeLast(amount: number): Collection<K, D> {
        const events = this.events.takeLast(amount);
        const keyMap = Collection.buildKeyMap(events);
        return this.clone(events, keyMap) as Collection<K, D>;
    }

    /**
     * Completely replace the existing `Event`'s in this Collection.
     */
    public setEvents(events: Immutable.List<Event<K, D>>): Collection<K, D> {
        let keyMap = Immutable.Map<string, Immutable.Set<number>>();
        events.forEach((e, i) => {
            const k = e.getKey().toString();
            const indicies: Immutable.Set<number> = keyMap.has(k)
                ? keyMap.get(k).add(i)
                : Immutable.Set<number>([i]);
            keyMap = keyMap.set(k, indicies);
        });
        return this.clone(events, keyMap) as Collection<K, D>;
    }

    /**
     * Returns the number of `Event`'s in this Collection
     */
    public size(): number {
        return this.events.size;
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
    // XXX
    // public sizeValid(fieldPath: string = "value"): number {
    //     let count = 0;
    //     this.events.forEach(e => {
    //         if (e.isValid(fieldPath)) {
    //             count++;
    //         }
    //     });
    //     return count;
    // }

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
    public at(pos: number): Event<K, D> {
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
    public atKey(key: K): Immutable.List<Event<K, D>> {
        const indexes = this.keyMap.get(key.toString());
        return indexes.map(i => this.events.get(i)).toList();
    }

    /**
     * Returns the first event in the `Collection`.
     */
    public firstEvent(): Event<K, D> {
        return this.events.first();
    }

    /**
     * Returns the last event in the `Collection`.
     */
    public lastEvent(): Event<K, D> {
        return this.events.last();
    }

    /**
     * Returns all the `Event<K, D>`s as an `Immutable.List`.
     */
    public eventList(): Immutable.List<Event<K, D>> {
        return this.events.toList();
    }

    /**
     * Returns the events in the `Collection` as an `Immutable.Map`, where
     * the key of type `T` (`Time`, `Index`, or `TimeRange`),
     * represented as a string, is mapped to the `Event` itself.
     *
     * @returns Immutable.Map<T, Event<K, D>> Events in this Collection,
     *                                     converted to a Map.
     */
    public eventMap() {
        return this.events.toMap();
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
    public entries(): IterableIterator<[number, Event<K, D>]> {
        return this.events.entries();
    }

    /**
     * Iterate over the events in this `Collection`.
     *
     * `Event`s are in the order that they were added, unless the Collection
     * has since been sorted. The `sideEffect` is a user supplied function which
     * is passed the `Event<K, D>` and the index.
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
    public forEach(sideEffect: (value?: Event<K, D>, index?: number) => any): number {
        return this.events.forEach(sideEffect);
    }

    /**
     * Map the `Event`s of type <K, D> in this `Collection` to new `Event`s of
     * type <KK, D> where K and KK may be different.
     *
     * For each `Event` passed to the `mapper` function you return a new Event.
     *
     * Example:
     * ```
     * const mapped = sorted.map(event => {
     *     return new Event(event.key(), { a: event.get("x") * 2 });
     * });
     * ```
     */
    public map<KK extends Key>(
        mapper: (event?: Event<K, D>, index?: number) => Event<KK, D>
    ): Collection<KK, D> {
        const remapped = this.events.map(mapper);
        return new Collection<KK, D>(Immutable.List<Event<KK, D>>(remapped));
    }

    /**
     * Remap the keys, but keep the data the same. You can use this if you
     * have, say, a `Collection` of `Event<Index>` and want to convert to events
     * of `Event<Time>`s. The return result of remapping the keys of a
     * `K = Index` to `KK = Time` i.e. `Collection<K, D>` remapped with new keys of type
     * `KK` as a `Collection<KK>` with the data type remaining the same, `D`.
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
    public mapKeys<KK extends Key>(mapper: (key: K) => KK): Collection<KK, D> {
        const list = this.events.map(
            event => new Event<KK, D>(mapper(event.getKey()), event.data())
        );
        return new Collection<KK, D>(list);
    }

    /**
     * Flat map over the events in this `Collection`.
     *
     * For each `Event<K, D>` passed to your callback function you should map that to
     * zero, one or many `Event<U>`s, returned as an `Immutable.List<Event<U>>`.
     *
     * Example:
     * ```
     * const processor = new Fill<T>(options);  // processor addEvent() returns 0, 1 or n new events
     * const filled = this.flatMap<T>(e => processor.addEvent(e));
     * ```
     */
    public flatMap<KK extends Key, DD>(
        mapper: (event?: Event<K, D>, index?: number) => Immutable.List<Event<KK, DD>>
    ): Collection<KK, DD> {
        const remapped: Immutable.List<Event<KK, DD>> = this.events.flatMap(mapper);
        return new Collection<KK, DD>(Immutable.List<Event<KK, DD>>(remapped));
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
     * Example:
     * ```
     * const sorted = collection.sortByKey();
     * ```
     */
    public sortByKey(): Collection<K, D> {
        const sorted = Immutable.List<Event<K, D>>(
            this.events.sortBy(event => {
                return +event.getKey().timestamp();
            })
        );
        return new Collection<K, D>(sorted);
    }

    /**
     * Sorts the `Collection` using the sort key (a number or string) returned by the sorter.
     */
    public sort(sorter: (data: D) => number | string): Collection<K, D> {
        const sorted = Immutable.List<Event<K, D>>(
            this.events.sortBy(event => {
                return sorter(event.data());
            })
        );
        return new Collection<K, D>(sorted);
    }

    /**
     * Perform a slice of events within the `Collection`, returns a new
     * `Collection` representing a portion of this `TimeSeries` from `begin`
     * up to but not including `end`.
     */
    public slice(begin?: number, end?: number): Collection<K, D> {
        return this.setEvents(this.events.slice(begin, end));
    }

    /**
     * Returns a new `Collection` with all `Event`s except the first
     */
    public rest(): Collection<K, D> {
        return this.setEvents(this.events.rest());
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
    public filter(predicate: (event: Event<K, D>, index: number) => boolean) {
        return this.setEvents(this.events.filter(predicate));
    }

    /**
     * Returns the time range extents of the `Collection` as a new `TimeRange`.
     *
     * Since this `Collection` is not necessarily in order, this method will traverse the
     * entire `Collection` and determine the earliest and latest time represented within it.
     */
    public timeRange(): TimeRange {
        let minimum: number;
        let maximum: number;

        this.forEach(e => {
            if (!minimum || +e.begin() < minimum) {
                minimum = +e.begin();
            }
            if (!maximum || +e.end() > maximum) {
                maximum = +e.end();
            }
        });

        if (minimum && maximum) {
            return timerange(minimum, maximum);
        }
    }

    /**
     * Aggregates the `Collection`'s `Event`s down to a single value per field.
     *
     * The user selects the values to use via the user defined selector function.
     * That function will be passed each data object (type D) and should return
     * either a string or number based on that data.
     *
     * This makes use of a user defined function suppled as the `reducer` to do
     * the reduction of values to a single value. The `ReducerFunction` is defined
     * like so:
     * ```
     * (values: number[]) => number
     * ```
     *
     * Note: The `Collection` class itself contains most of the common aggregation functions
     * built in (e.g. `myCollection.avg(d => d.value)`), but this is here to help when what
     * you need isn't supplied out of the box.
     */
    public aggregate(reducer: ReducerFunction, selector: Selector<D>): number {
        return reducer(
            this.eventList()
                .map(e => selector(e.data()))
                .toArray()
        );
    }

    // /**
    //  * Returns the first value in the `Collection` for the `fieldspec`
    //  */
    // public first(fieldSpec: string, filter?): number;
    // public first(fieldSpec: string[], filter?): { [s: string]: number[] };
    // public first(fieldSpec: any, filter?) {
    //     return this.aggregate(first(filter), fieldSpec);
    // }

    // /**
    //  * Returns the last value in the `Collection` for the `fieldspec`
    //  */
    // public last(fieldSpec: string, filter?): number;
    // public last(fieldSpec: string[], filter?): { [s: string]: number[] };
    // public last(fieldSpec: any, filter?) {
    //     return this.aggregate(last(filter), fieldSpec);
    // }

    /**
     * Returns the sum of the `Event`'s in this `Collection`
     * for the `fieldspec`
     */
    public sum(selector: Selector<D>, filter?): number {
        return this.aggregate(sum(filter), selector);
    }

    /**
     * Aggregates the `Event`'s in this `Collection` down to their average.
     *
     * The `selector()` passed into the `avg()` function is a user defined function to select
     * a numeric value to aggregate from the data.
     *
     * The `filter` is one of the Pond filter functions that can be used to remove
     * bad values in different ways before filtering.
     *
     * Example:
     * ```
     * const e1 = event(time("2015-04-22T02:30:00Z"), { a: 8, b: 2 });
     * const e2 = event(time("2015-04-22T01:30:00Z"), { a: 3, b: 3 });
     * const e3 = event(time("2015-04-22T03:30:00Z"), { a: 5, b: 7 });
     * const c = collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2)
     *     .addEvent(e3);
     *
     * c.avg(a => d.b) // 4
     */
    public avg(selector: Selector<D>, filter?): number {
        return this.aggregate(avg(filter), selector);
    }

    /**
     * Aggregates the `Event`'s in this `Collection` down to their maximum value.
     *
     * The `selector()` passed into the `max()` function is a user defined function to select
     * a numeric value from each data point, the results of which are then used to aggregate
     * the data.
     *
     * The `filter()` is one of the Pond filter functions that can be used to remove
     * bad values in different ways before filtering.
     *
     * The result is the maximum value if the fieldSpec is for one field. If
     * multiple fields then a map of fieldName -> max values is returned
     */
    public max(selector: Selector<D>, filter?): number {
        return this.aggregate(max(filter), selector);
    }

    /**
     * Aggregates the `Event`'s in this `Collection` down to their minumum value.
     *
     * The `selector()` passed into the `min()` function is a user defined function to select
     * a numeric value from each data point, the results of which are then used to aggregate
     * the data.
     *
     * The `filter()` is one of the Pond filter functions that can be used to remove
     * bad values in different ways before filtering.
     *
     * The result is the maximum value if the fieldSpec is for one field. If
     * multiple fields then a map of fieldName -> max values is returned
     */
    public min(selector: Selector<D>, filter?): number {
        return this.aggregate(max(filter), selector);
    }

    /**
     * Aggregates the events down to their median value
     */
    public median(selector: Selector<D>, filter?): number {
        return this.aggregate(median(filter), selector);
    }

    /**
     * Aggregates the events down to their standard deviation
     */
    public stdev(selector: Selector<D>, filter?): number {
        return this.aggregate(stdev(filter), selector);
    }

    /**
     * Gets percentile q within the `Collection`. This works the same way as numpy.
     *
     * The percentile function has several parameters that can be supplied:
     * * `q`          - The percentile (should be between 0 and 100)
     * * `selector()` - User defined function to select a numeric value from each
     *                  data point, the results of which are then used to aggregate
     *                  the data.
     * * `interp`     - Specifies the interpolation method to use when the desired, see below
     * * `filter`     - Optional filter function used to clean data before aggregating
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
    public percentile(
        selector: Selector<D>,
        q: number,
        interp?: InterpolationType,
        filter?
    ): number {
        return this.aggregate(percentile(q, interp, filter), selector);
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
    // XXX
    // public quantile(selector: Selector<D>, n: number, interp?: InterpolationType, filter?): number {
    // }

    // public quantile(
    //     n: number,
    //     column: string = "value",
    //     interp: InterpolationType = InterpolationType.linear
    // ) {
    //     const results = [];
    //     const sorted = this.sort(column);
    //     const subsets = 1.0 / n;

    //     if (n > this.size()) {
    //         throw new Error("Subset n is greater than the Collection length");
    //     }

    //     for (let i = subsets; i < 1; i += subsets) {
    //         const index = Math.floor((sorted.size() - 1) * i);
    //         if (index < sorted.size() - 1) {
    //             const fraction = (sorted.size() - 1) * i - index;
    //             const v0 = +sorted.at(index).get(column);
    //             const v1 = +sorted.at(index + 1).get(column);
    //             let v;
    //             if (InterpolationType.lower || fraction === 0) {
    //                 v = v0;
    //             } else if (InterpolationType.linear) {
    //                 v = v0 + (v1 - v0) * fraction;
    //             } else if (InterpolationType.higher) {
    //                 v = v1;
    //             } else if (InterpolationType.nearest) {
    //                 v = fraction < 0.5 ? v0 : v1;
    //             } else if (InterpolationType.midpoint) {
    //                 v = (v0 + v1) / 2;
    //             }
    //             results.push(v);
    //         }
    //     }
    //     return results;
    // }

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

    //
    // To be reimplemented by subclass
    //

    /**
     * Internal method to clone this `Collection` (protected)
     */
    protected clone(events, keyMap): Base {
        const c = new Collection<K, D>();
        c.events = events;
        c.keyMap = keyMap;
        return c;
    }

    protected onEventAdded(events: Immutable.List<Event<K, D>>): Immutable.List<Event<K, D>> {
        return events;
    }
}

function collectionFactory<K extends Key, D>(
    arg1?: Immutable.List<Event<K, D>> | Collection<K, D>
) {
    return new Collection<K, D>(arg1);
}

export { collectionFactory as collection };
