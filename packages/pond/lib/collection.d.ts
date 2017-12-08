import * as Immutable from "immutable";
import { Base } from "./base";
import { Event } from "./event";
import { Key } from "./key";
import { TimeRange } from "./timerange";
import { CollapseOptions, SelectOptions } from "./types";
import { DedupFunction, ReducerFunction } from "./types";
import { InterpolationType } from "./functions";
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
export declare class Collection<T extends Key> extends Base {
    /**
     * Rebuild the keyMap from scratch
     */
    protected static buildKeyMap<S extends Key>(events: Immutable.List<Event<S>>): Immutable.Map<string, Immutable.Set<number>>;
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
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>);
    /**
     * Returns the `Collection` as a regular JSON object.
     */
    toJSON(): any;
    /**
     * Serialize out the `Collection` as a string. This will be the
     * string representation of `toJSON()`.
     */
    toString(): string;
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
    at(pos: number): Event<T>;
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
     * the key of type `T` (`Time`, `Index`, or `TimeRange`),
     * represented as a string, is mapped to the `Event` itself.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    eventMap(): Immutable.Map<number, Event<T>>;
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
    entries(): IterableIterator<[number, Event<T>]>;
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
    forEach(sideEffect: (value?: Event<T>, index?: number) => any): number;
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
    map<M extends Key>(mapper: (event?: Event<T>, index?: number) => Event<M>): Collection<M>;
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
    mapKeys<U extends Key>(mapper: (key: T) => U): Collection<U>;
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
    filter(predicate: (event: Event<T>, index: number) => boolean): Collection<T>;
    /**
     * Returns the time range extents of the `Collection` as a `TimeRange`.
     *
     * Since this `Collection` is not necessarily in order, this method will traverse the
     * `Collection` and determine the earliest and latest time represented within it.
     */
    timerange(): TimeRange;
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
    avg(fieldSpec: string, filter?: any): number;
    avg(fieldSpec: string[], filter?: any): {
        [s: string]: number[];
    };
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
    percentile(q: number, fieldSpec: string, interp?: InterpolationType, filter?: any): number;
    percentile(q: number, fieldSpec: string[], interp?: InterpolationType, filter?: any): {
        [s: string]: number[];
    };
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
    quantile(n: number, column?: string, interp?: InterpolationType): any[];
    /**
     * Returns true if all events in this `Collection` are in chronological order.
     */
    isChronological(): boolean;
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
    collapse(options: CollapseOptions): Collection<T>;
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
    select(options: SelectOptions): Collection<T>;
    /**
     * Internal method to clone this `Collection` (protected)
     */
    protected clone(events: any, keyMap: any): Base;
    protected onEventAdded(events: Immutable.List<Event<T>>): Immutable.List<Event<T>>;
}
declare function collectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>): Collection<T>;
export { collectionFactory as collection };
