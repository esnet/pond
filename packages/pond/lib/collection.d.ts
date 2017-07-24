import * as Immutable from "immutable";
import { Base } from "./base";
import { Event } from "./event";
import { GroupedCollection, GroupingFunction } from "./grouped";
import { Key } from "./key";
import { TimeRange } from "./timerange";
import { WindowedCollection } from "./windowed";
import { AlignmentOptions, CollapseOptions, FillOptions, RateOptions, SelectOptions, WindowingOptions } from "./types";
import { DedupFunction, ReducerFunction } from "./types";
import { InterpolationType } from "./functions";
/**
 * A Collection holds a ordered (but not sorted) list of Events.
 *
 * In Typescript, you can give a `Collection<T>` a type T, which is
 * the `Event` type accepted into the Collection (e.g. `Collection<Time>`).
 */
export declare class Collection<T extends Key> extends Base {
    /**
     * Rebuild the keyMap from scratch
     */
    protected static buildKeyMap<S extends Key>(events: Immutable.List<Event<S>>): Immutable.Map<string, Immutable.Set<number>>;
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
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>);
    /**
     * Returns the `Collection` as a regular JSON object. This
     * is implementation specific, in that different types of
     * `Collections` will likely implement this in their own way.
     *
     * In the case of our `OrderedMap`, this code simply called
     * `internalOrderedMap.toJS()` and lets `Immutable.js` do its
     * thing.
     */
    toJSON(): any;
    /**
     * Serialize out the `Collection` as a string. This will be the
     * string representation of `toJSON()`.
     */
    toString(): string;
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
    addEvent(event: Event<T>, dedup?: DedupFunction<T> | boolean): Collection<T>;
    /**
     * Removes the `Event` (or duplicate keyed Events) with the given key.
     */
    removeEvents(key: T): Collection<T>;
    /**
     * Takes the last n `Event`'s of the `Collection` and returns a new `Collection`.
     */
    takeLast(amount: number): Collection<T>;
    /**
     * Completely replace the existing `Event`'s in this Collection.
     */
    setEvents(events: Immutable.List<Event<T>>): Collection<T>;
    /**
     * Returns the number of `Event`'s in this Collection
     */
    size(): number;
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
    sizeValid(fieldPath?: string): number;
    /**
     * Return if the `Collection` has any events in it
     */
    isEmpty(): boolean;
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
    at(pos: number): Event<T>;
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
    atKey(key: T): Immutable.List<Event<T>>;
    /**
     * Returns the first event in the `Collection`.
     */
    firstEvent(): Event<T>;
    /**
     * Returns the last event in the `Collection`.
     */
    lastEvent(): Event<T>;
    /**
     * Returns all the `Event<T>`s as an `Immutable.List`.
     */
    eventList(): Immutable.List<Event<T>>;
    /**
     * Returns the events in the `Collection` as an `Immutable.Map`, where
     * the key of type `T` (e.g. Time, Index, or TimeRange),
     * represented as a string, is mapped to the Event itself.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    eventMap(): Immutable.Map<number, Event<T>>;
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
    entries(): IterableIterator<[number, Event<T>]>;
    /**
     * Iterate over the events in this `Collection`. Events are in the
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
    forEach(sideEffect: (value?: Event<T>, index?: number) => any): number;
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
    map<M extends Key>(mapper: (event?: Event<T>, index?: number) => Event<M>): Collection<M>;
    /**
     * Remap the keys, but keep the data the same. You can use this if you
     * have a `Collection` of `Index`es and want to convert to `Time`s, for
     * example. The return result of remapping the keys of a `Collection<T>`
     * with new keys of type `U`, will be a `Collection<U>`.
     *
     * @example
     *
     * Here we remap Time keys to `TimeRange` keys using the `Time.toTimeRange()`
     * method to center new `TimeRange`s around each `Time` with duration given
     * by the `Period`, in this case 1 hour.
     *
     * ```
     * const remapped = myCollection.mapKeys<TimeRange>((t) =>
     *     t.toTimeRange(period("1h"), TimeAlignment.Middle));
     * ```
     *
     */
    mapKeys<U extends Key>(mapper: (key: T) => U): Collection<U>;
    /**
     * FlatMap over the events in this `Collection`. For each `Event`
     * passed to your callback function you should map that to
     * zero, one or many Events, returned as an `Immutable.List`.
     */
    flatMap<U extends Key>(mapper: (event?: Event<T>, index?: number) => Immutable.List<Event<U>>): Collection<U>;
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
    sortByKey(): Collection<T>;
    /**
     * Sorts the `Collection` using the value referenced by
     * the `field`.
     */
    sort(field: string | string[]): Collection<T>;
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
    groupBy(field: string | string[] | GroupingFunction<T>): GroupedCollection<T>;
    /**
     * Window the `Collection` into a given period of time.
     *
     * @example
     * ```
     * const windowed = collection.window(period("1h"));
     * ```
     */
    window(options: WindowingOptions): WindowedCollection<T>;
    /**
     * Perform a slice of events within the `Collection`, returns a new
     * `Collection` representing a portion of this `TimeSeries` from `begin` up to
     * but not including `end`.
     */
    slice(begin?: number, end?: number): Collection<T>;
    /**
     * Returns a new `Collection` with all `Event`s except the first
     */
    rest(): Collection<T>;
    /**
     * Filter the Collection's `Event`'s with the supplied function
     * @example
     * ```
     * const filtered = collection.filter(e => e.get("a") < 8)
     * ```
     */
    /**
     * Returns the extents of the `Collection` as a `TimeRange`.
     * Since this `Collection` is not necessarily in order, this
     * method will traverse the `Collection` and determine the
     * ealiest and latest time represented within it.
     */
    timerange(): TimeRange;
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
    aggregate(reducer: ReducerFunction, fieldSpec: string | string[]): any;
    /**
     * Returns the first value in the `Collection` for the `fieldspec`
     */
    first(fieldSpec: string, filter?: any): number;
    first(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
    /**
     * Returns the last value in the `Collection` for the `fieldspec`
     */
    last(fieldSpec: string, filter?: any): number;
    last(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
    /**
     * Returns the sum of the `Event`'s in this `Collection`
     * for the `fieldspec`
     */
    sum(fieldSpec: string, filter?: any): number;
    sum(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
    /**
     * Aggregates the `Event`'s in this `Collection` down
     * to their average(s)
     */
    avg(fieldSpec: string, filter?: any): number;
    avg(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
    /**
     * Aggregates the `Event`'s in this `Collection` down to
     * their maximum value(s)
     */
    max(fieldSpec: string, filter?: any): number;
    max(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
    /**
     * Aggregates the `Event`'s in this `Collection` down to
     * their minimum value(s)
     */
    min(fieldSpec: string, filter?: any): number;
    min(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
    /**
     * Aggregates the events down to their median value
     */
    median(fieldSpec: string, filter?: any): number;
    median(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
    /**
     * Aggregates the events down to their standard deviation
     */
    stdev(fieldSpec: string, filter?: any): number;
    stdev(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
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
    percentile(q: number, fieldSpec: string, interp?: InterpolationType, filter?: any): number;
    percentile(q: number, fieldSpec: string[], interp?: InterpolationType, filter?: any): {
        [s: string]: number[];
    };
    /**
     * Gets n quantiles within the `Collection`.
     * This works the same way as numpy.
     */
    quantile(n: number, column?: string, interp?: InterpolationType): any[];
    /**
     * Returns true if all events in this `Collection` are in chronological order.
     */
    isChronological(): boolean;
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
    align(options: AlignmentOptions): Collection<T>;
    rate(options: RateOptions): Collection<TimeRange>;
    fill(options: FillOptions): Collection<T>;
    collapse(options: CollapseOptions): Collection<T>;
    select(options: SelectOptions): Collection<T>;
    protected clone(events: any, keyMap: any): Base;
    protected onEventAdded(events: Immutable.List<Event<T>>): Immutable.List<Event<T>>;
}
declare function collectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>): Collection<T>;
export { collectionFactory as collection };
