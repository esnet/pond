import * as Immutable from "immutable";
import { Collection } from "./collection";
import { Event } from "./event";
import { GroupedCollection, GroupingFunction } from "./grouped";
import { Key } from "./key";
import { TimeRange } from "./timerange";
import { DedupFunction } from "./types";
import { WindowedCollection } from "./windowed";
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
export declare class SortedCollection<T extends Key> extends Collection<T> {
    /**
     * Construct a new `Sorted Collection`
     */
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>);
    /**
     * TODO: Add comment here
     */
    addEvent(event: Event<T>, dedup?: DedupFunction<T> | boolean): SortedCollection<T>;
    /**
     * Returns true if all events in this `Collection` are in chronological order.
     */
    isChronological(): boolean;
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
    map<M extends Key>(mapper: (event?: Event<T>, index?: number) => Event<M>): SortedCollection<M>;
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
    flatMap<U extends Key>(mapper: (event?: Event<T>, index?: number) => Immutable.List<Event<U>>): SortedCollection<U>;
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
    filter(predicate: (event: Event<T>, index: number) => boolean): SortedCollection<T>;
    /**
     * Returns the index that `bisect`'s the `TimeSeries` at the time specified.
     */
    bisect(t: Date, b?: number): number;
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
    align(options: AlignmentOptions): SortedCollection<T>;
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
    rate(options: RateOptions): SortedCollection<TimeRange>;
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
    fill(options: FillOptions): SortedCollection<T>;
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
    groupBy(field: string | string[] | GroupingFunction<T>): GroupedCollection<T>;
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
    window(options: WindowingOptions): WindowedCollection<T>;
    /**
     * Static function to compare two collections to each other. If the collections
     * are of the same value as each other then equals will return true.
     */
    static is(collection1: SortedCollection<Key>, collection2: SortedCollection<Key>): boolean;
    protected clone(events: any, keyMap: any): Collection<T>;
}
declare function sortedCollectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>): SortedCollection<T>;
export { sortedCollectionFactory as sortedCollection, sortedCollectionFactory as sorted };
