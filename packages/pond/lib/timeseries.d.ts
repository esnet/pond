import * as Immutable from "immutable";
import { Collection } from "./collection";
import { Event } from "./event";
import { Index } from "./index";
import { Key } from "./key";
import { SortedCollection } from "./sorted";
import { Time } from "./time";
import { TimeRange } from "./timerange";
import { InterpolationType } from "./functions";
import {
    AlignmentOptions,
    CollapseOptions,
    FillOptions,
    RateOptions,
    ReducerFunction,
    RenameColumnOptions,
    RollupOptions,
    SelectOptions,
    TimeSeriesOptions
} from "./types";
export interface TimeSeriesWireFormat {
    name?: string;
    tz?: string;
    columns: string[];
    points: any[];
    [propName: string]: any;
}
/**
 * You can construct a `TimeSeries` with a list of Events, by passing in an
 * object containing a single property "events".
 *
 * ```
 * { "events": [event-1, event-2, ..., event-n]}
 * ```
 */
export interface TimeSeriesEvents<T extends Key> {
    events?: Immutable.List<Event<T>>;
    [propName: string]: any;
}
export interface TimeSeriesListReducerOptions {
    seriesList: Array<TimeSeries<Key>>;
    reducer?: (events: Immutable.List<Event<Key>>) => Immutable.List<Event<Key>>;
    fieldSpec?: string | string[];
    [propName: string]: any;
}
/**
 * Create a `Time` based `TimeSeries` using the wire format
 * ```
 * {
 *   "name": name,
 *   "columns": ["time", column-1, ..., column-n]
 *   "points": [
 *      [t1, v1, v2, ..., v2],
 *      [t2, v1, v2, ..., vn],
 *      ...
 *   ]
 * }
 * ```
 */
declare function timeSeries(arg: TimeSeriesWireFormat): TimeSeries<Time>;
/**
 * Create an `Index` based `TimeSeries` using the wire format
 * ```
 * {
 *   "name": name,
 *   "columns": ["index", column-1, ..., column-n]
 *   "points": [
 *      [t1, v1, v2, ..., v2],
 *      [t2, v1, v2, ..., vn],
 *      ...
 *   ]
 * }
 * ```
 */
declare function indexedSeries(arg: TimeSeriesWireFormat): TimeSeries<Index>;
/**
 * Create a `Timerange` based `TimeSeries` using the wire format
 * ```
 * {
 *   "name": name,
 *   "columns": ["timerange", column-1, ..., column-n]
 *   "points": [
 *      [t1, v1, v2, ..., v2],
 *      [t2, v1, v2, ..., vn],
 *      ...
 *   ]
 * }
 * ```
 */
declare function timeRangeSeries(arg: TimeSeriesWireFormat): TimeSeries<TimeRange>;
export { timeSeries, indexedSeries, timeRangeSeries };
/**
 * A `TimeSeries` represents a series of `Event`'s, with each event being a combination of:
 * * time (or `TimeRange`, or `Index`)
 * * data - corresponding set of key/values.
 *
 * ### Construction
 *
 * Currently you can initialize a `TimeSeries` with either a list of `Event`'s, or with
 * a data format that looks like this:
 *
 * ```javascript
 * const data = {
 *     name: "trafficc",
 *     columns: ["time", "value"],
 *     points: [
 *         [1400425947000, 52],
 *         [1400425948000, 18],
 *         [1400425949000, 26],
 *         [1400425950000, 93],
 *         ...
 *     ]
 * };
 * ```
 *
 * To create a new `TimeSeries` object from the above format, simply use the constructor:
 *
 * ```javascript
 * const series = new TimeSeries(data);
 * ```
 *
 * The format of the data is as follows:
 *
 *  - **name** - optional, but a good practice
 *  - **columns** - are necessary and give labels to the data in the points.
 *  - **points** - are an array of tuples. Each row is at a different time (or timerange),
 * and each value corresponds to the column labels.
 *
 * As just hinted at, the first column may actually be:
 *
 *  - "time"
 *  - "timeRange" represented by a `TimeRange`
 *  - "index" - a time range represented by an `Index`. By using an index it is possible,
 * for example, to refer to a specific month:
 *
 * ```javascript
 * const availabilityData = {
 *     name: "Last 3 months availability",
 *     columns: ["index", "uptime"],
 *     points: [
 *         ["2015-06", "100%"], // <-- 2015-06 specified here represents June 2015
 *         ["2015-05", "92%"],
 *         ["2015-04", "87%"],
 *     ]
 * };
 * ```
 *
 * Alternatively, you can construct a `TimeSeries` with a list of events.
 * These may be `TimeEvents`, `TimeRangeEvents` or `IndexedEvents`. Here's an example of that:
 *
 * ```javascript
 * const events = [];
 * events.push(new TimeEvent(new Date(2015, 7, 1), {value: 27}));
 * events.push(new TimeEvent(new Date(2015, 8, 1), {value: 29}));
 * const series = new TimeSeries({
 *     name: "avg temps",
 *     events: events
 * });
 * ```
 *
 * ### Nested data
 *
 * The values do not have to be simple types like the above examples. Here's an
 * example where each value is itself an object with "in" and "out" keys:
 *
 * ```javascript
 * const series = new TimeSeries({
 *     name: "Map Traffic",
 *     columns: ["time", "NASA_north", "NASA_south"],
 *     points: [
 *         [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
 *         [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
 *         [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
 *         [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}],
 *     ]
 * });
 * ```
 *
 * Complex data is stored in an Immutable structure. To get a value out of nested
 * data like this you will get the event you want (by row), as usual, and then use
 * `get()` to fetch the value by column name. The result of this call will be a
 * JSON copy of the Immutable data so you can query deeper in the usual way:
 *
 * ```javascript
 * series.at(0).get("NASA_north")["in"]  // 200`
 * ```
 *
 * It is then possible to use a value mapper function when calculating different
 * properties. For example, to get the average "in" value of the NASA_north column:
 *
 * ```javascript
 * series.avg("NASA_north", d => d.in);  // 250
 * ```
 */
export declare class TimeSeries<T extends Key> {
    private _collection;
    private _data;
    constructor(arg: TimeSeries<T> | TimeSeriesEvents<T>);
    /**
     * Turn the `TimeSeries` into regular javascript objects
     */
    toJSON(): {};
    /**
     * Represent the `TimeSeries` as a string
     */
    toString(): string;
    /**
     * Returns the extents of the `TimeSeries` as a `TimeRange`.
     */
    timerange(): TimeRange;
    /**
     * Alias for `timerange()`
     */
    range(): TimeRange;
    /**
     * Gets the earliest time represented in the `TimeSeries`.
     */
    begin(): Date;
    /**
     * Gets the latest time represented in the `TimeSeries`.
     */
    end(): Date;
    /**
     * Access a specific `TimeSeries` event via its position
     */
    at(pos: number): Event<T>;
    /**
     * Returns an event in the series by its time. This is the same
     * as calling `bisect()` first and then using `at()` with the index.
     */
    atTime(t: Date): Event<T>;
    /**
     * Returns the first `Event` in the series.
     */
    atFirst(): Event<T>;
    /**
     * Returns the last `Event` in the series.
     */
    atLast(): Event<T>;
    /**
     * Sets a new underlying collection for this `TimeSeries`.
     */
    setCollection<M extends Key>(collection: SortedCollection<M>): TimeSeries<M>;
    /**
     * Returns the `Index` that bisects the `TimeSeries` at the time specified.
     */
    bisect(t: Date, b?: number): number;
    /**
     * Perform a slice of events within the `TimeSeries`, returns a new
     * `TimeSeries` representing a portion of this `TimeSeries` from
     * begin up to but not including end.
     */
    slice(begin?: number, end?: number): TimeSeries<T>;
    /**
     * Crop the `TimeSeries` to the specified `TimeRange` and
     * return a new `TimeSeries`.
     */
    crop(tr: TimeRange): TimeSeries<T>;
    /**
     * Fetch the `TimeSeries` name
     */
    name(): string;
    /**
     * Rename the `TimeSeries`
     */
    setName(name: string): TimeSeries<T>;
    /**
     * Fetch the timeSeries `Index`, if it has one.
     */
    index(): Index;
    /**
     * Fetch the timeSeries `Index`, as a `string`, if it has one.
     */
    indexAsString(): string;
    /**
     * Fetch the timeseries `Index`, as a `TimeRange`, if it has one.
     */
    indexAsRange(): TimeRange;
    /**
     * Fetch the UTC flag, i.e. are the events in this `TimeSeries` in
     * UTC or local time (if they are `IndexedEvent`'s an event might be
     * "2014-08-31". The actual time range of that representation
     * depends on where you are. Pond supports thinking about that in
     * either as a UTC day, or a local day).
     */
    isUTC(): TimeRange;
    /**
     * Fetch the list of column names. This is determined by
     * traversing though the events and collecting the set.
     *
     * Note: the order is not defined
     */
    columns(): string[];
    /**
     * Returns the list of Events in the `Collection` of events for this `TimeSeries`
     */
    eventList(): Immutable.List<Event<T>>;
    /**
     * Returns the internal `Collection` of events for this `TimeSeries`
     */
    collection(): SortedCollection<T>;
    /**
     * Returns the meta data about this `TimeSeries` as a JSON object.
     * Any extra data supplied to the `TimeSeries` constructor will be
     * placed in the meta data object. This returns either all of that
     * data as a JSON object, or a specific key if `key` is supplied.
     */
    meta(key: string): {};
    /**
     * Set new meta data for the `TimeSeries`. The result will
     * be a new `TimeSeries`.
     */
    setMeta(key: any, value: any): TimeSeries<T>;
    /**
     * Returns the number of events in this `TimeSeries`
     */
    size(): number;
    /**
     * Returns the number of valid items in this `TimeSeries`.
     *
     * Uses the `fieldSpec` to look up values in all events.
     * It then counts the number that are considered valid, which
     * specifically are not NaN, undefined or null.
     */
    sizeValid(fieldSpec: string): number;
    /**
     * Returns the number of events in this `TimeSeries`. Alias
     * for size().
     */
    count(): number;
    /**
     * Returns the sum for the `fieldspec`
     *
     */
    sum(fieldPath?: string, filter?: any): number;
    /**
     * Aggregates the events down to their maximum value
     */
    max(fieldPath?: string, filter?: any): number;
    /**
     * Aggregates the events down to their minimum value
     */
    min(fieldPath?: string, filter?: any): number;
    /**
     * Aggregates the events in the `TimeSeries` down to their average
     */
    avg(fieldPath?: string, filter?: any): number;
    /**
     * Aggregates the events down to their medium value
     */
    median(fieldPath?: string, filter?: any): number;
    /**
     * Aggregates the events down to their stdev
     */
    stdev(fieldPath?: string, filter?: any): number;
    /**
     * Gets percentile q within the `TimeSeries`. This works the same way as numpy.
     */
    percentile(q: number, fieldPath?: string, interp?: InterpolationType, filter?: any): number;
    /**
     * Aggregates the events down using a user defined function to
     * do the reduction.
     */
    aggregate(func: ReducerFunction, fieldPath?: string): number;
    /**
     * Gets n quantiles within the `TimeSeries`. This works the same way as numpy's percentile().
     * For example `timeseries.quantile(4)` would be the same as using percentile
     * with q = 0.25, 0.5 and 0.75.
     */
    quantile(quantity: number, fieldPath?: string, interp?: InterpolationType): any[];
    /**
     * Iterate over the events in this `TimeSeries`. Events are in the
     * order that they were added, unless the underlying Collection has since been
     * sorted.
     *
     * @example
     * ```
     * series.forEach((e, k) => {
     *     console.log(e, k);
     * })
     * ```
     */
    forEach<M extends Key>(sideEffect: (value?: Event<T>, index?: number) => any): number;
    /**
     * Takes an operator that is used to remap events from this `TimeSeries` to
     * a new set of `Event`'s.
     */
    map<M extends Key>(mapper: (event?: Event<T>, index?: number) => Event<M>): TimeSeries<M>;
    /**
     * Takes a `fieldSpec` (list of column names) and outputs to the callback just those
     * columns in a new `TimeSeries`.
     *
     * @example
     *
     * ```
     * const ts = timeseries.select({fieldSpec: ["uptime", "notes"]});
     * ```
     */
    select(options: SelectOptions): TimeSeries<T>;
    /**
     * Takes a `fieldSpecList` (list of column names) and collapses
     * them to a new column named `name` which is the reduction (using
     * the `reducer` function) of the matched columns in the `fieldSpecList`.
     *
     * The column may be appended to the existing columns, or replace them,
     * based on the `append` boolean.
     *
     * @example
     *
     * ```
     * const sums = ts.collapse({
     *     name: "sum_series",
     *     fieldSpecList: ["in", "out"],
     *     reducer: sum(),
     *     append: false
     * });
     * ```
     */
    collapse(options: CollapseOptions): TimeSeries<T>;
    /**
     * Rename columns in the underlying events.
     *
     * Takes a object of columns to rename. Returns a new `TimeSeries` containing
     * new events. Columns not in the dict will be retained and not renamed.
     *
     * @example
     * ```
     * new_ts = ts.renameColumns({
     *     renameMap: {in: "new_in", out: "new_out"}
     * });
     * ```
     *
     * As the name implies, this will only rename the main
     * "top level" (ie: non-deep) columns. If you need more
     * extravagant renaming, roll your own using `TimeSeries.map()`.
     */
    renameColumns(options: RenameColumnOptions): TimeSeries<Key>;
    /**
     * Take the data in this `TimeSeries` and "fill" any missing or invalid
     * values. This could be setting `null` values to zero so mathematical
     * operations will succeed, interpolate a new value, or pad with the
     * previously given value.
     *
     * The `fill()` method takes a single `options` arg.
     *
     * @example
     * ```
     * const filled = timeseries.fill({
     *     fieldSpec: ["direction.in", "direction.out"],
     *     method: "zero",
     *     limit: 3
     * });
     * ```
     */
    fill(options: FillOptions): TimeSeries<T>;
    /**
     * Align event values to regular time boundaries. The value at
     * the boundary is interpolated. Only the new interpolated
     * points are returned. If limit is reached nulls will be
     * returned at each boundary position.
     *
     * One use case for this is to modify irregular data (i.e. data
     * that falls at slightly irregular times) so that it falls into a
     * sequence of evenly spaced values. We use this to take data we
     * get from the network which is approximately every 30 second
     * (:32, 1:02, 1:34, ...) and output data on exact 30 second
     * boundaries (:30, 1:00, 1:30, ...).
     *
     * Another use case is data that might be already aligned to
     * some regular interval, but that contains missing points.
     * While `fill()` can be used to replace `null` values, `align()`
     * can be used to add in missing points completely. Those points
     * can have an interpolated value, or by setting limit to 0,
     * can be filled with nulls. This is really useful when downstream
     * processing depends on complete sequences.
     *
     * @example
     * ```
     * const aligned = ts.align({
     *     fieldSpec: "value",
     *     period: "1m",
     *     method: "linear"
     * });
     * ```
     */
    align(options: AlignmentOptions): TimeSeries<T>;
    /**
     * Returns the derivative of the `TimeSeries` for the given columns. The result will
     * be per second. Optionally you can substitute in `null` values if the rate
     * is negative. This is useful when a negative rate would be considered invalid.
     */
    rate(options: RateOptions): TimeSeries<TimeRange>;
    /**
     * Builds a new `TimeSeries` by dividing events within the `TimeSeries`
     * across multiple fixed windows of size `windowSize`.
     *
     * Note that these are windows defined relative to Jan 1st, 1970,
     * and are UTC, so this is best suited to smaller window sizes
     * (hourly, 5m, 30s, 1s etc), or in situations where you don't care
     * about the specific window, just that the data is smaller.
     *
     * Each window then has an aggregation specification applied as
     * `aggregation`. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * { in_avg: { in: avg() }, out_avg: { out: avg() } }
     * ```
     * will aggregate both "in" and "out" using the average aggregation
     * function and return the result as in_avg and out_avg.
     *
     * Note that each aggregation function, such as `avg()` also can take a
     * filter function to apply before the aggregation. A set of filter functions
     * exists to do common data cleanup such as removing bad values. For example:
     * ```
     * { value_avg: { value: avg(filter.ignoreMissing) } }
     * ```
     *
     * @example
     * ```
     *     const timeseries = new TimeSeries(data);
     *     const dailyAvg = timeseries.fixedWindowRollup({
     *         windowSize: "1d",
     *         aggregation: {value: {value: avg()}}
     *     });
     * ```
     *
     * Note that to output the result as `TimeEvent`'s instead of `IndexedEvent`'s,
     * you can do the following :
     * ```
     * timeseries.fixedWindowRollup(options).mapKeys(index => time(index.asTimerange().mid()))
     * ```
     *
     */
    fixedWindowRollup(options: RollupOptions<T>): TimeSeries<Index>;
    /**
     * Builds a new `TimeSeries` by dividing events into hours.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     *
     */
    hourlyRollup(options: RollupOptions<T>): TimeSeries<Index>;
    /**
     * Builds a new `TimeSeries` by dividing events into days.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     *
     */
    dailyRollup(options: RollupOptions<T>): TimeSeries<Index>;
    /**
     * Builds a new `TimeSeries` by dividing events into months.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     *
     */
    /**
     * Builds a new `TimeSeries` by dividing events into years.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     *
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     *
     */
    /**
     * @private
     *
     * Internal function to build the `TimeSeries` rollup functions using
     * an aggregator Pipeline.
     */
    _rollup(options: RollupOptions<T>): TimeSeries<Index>;
    /**
     * Builds multiple `Collection`s, each collects together
     * events within a window of size `windowSize`. Note that these
     * are windows defined relative to Jan 1st, 1970, and are UTC.
     *
     * @example
     * ```
     * const timeseries = new TimeSeries(data);
     * const collections = timeseries.collectByFixedWindow({windowSize: "1d"});
     * console.log(collections); // {1d-16314: Collection, 1d-16315: Collection, ...}
     * ```
     *
     */
    collectByWindow(options: RollupOptions<T>): Immutable.Map<string, Collection<T>>;
    /**
     * Static function to compare two `TimeSeries` to each other. If the `TimeSeries`
     * are of the same instance as each other then equals will return true.
     */
    static equal(series1: TimeSeries<Key>, series2: TimeSeries<Key>): boolean;
    /**
     * Static function to compare two `TimeSeries` to each other. If the `TimeSeries`
     * are of the same value as each other then equals will return true.
     */
    static is(series1: TimeSeries<Key>, series2: TimeSeries<Key>): boolean;
    /**
     * Reduces a list of `TimeSeries` objects using a reducer function. This works
     * by taking each event in each `TimeSeries` and collecting them together
     * based on timestamp. All events for a given time are then merged together
     * using the reducer function to produce a new event. The reducer function is
     * applied to all columns in the `fieldSpec`. Those new events are then
     * collected together to form a new `TimeSeries`.
     *
     * @example
     *
     * For example you might have three TimeSeries with columns "in" and "out" which
     * corresponds to two measurements per timestamp. You could use this function to
     * obtain a new TimeSeries which was the sum of the the three measurements using
     * the `sum()` reducer function and an ["in", "out"] fieldSpec.
     *
     * ```
     * const totalSeries = TimeSeries.timeSeriesListReduce({
     *     name: "totals",
     *     seriesList: [inTraffic, outTraffic],
     *     reducer: sum(),
     *     fieldSpec: [ "in", "out" ]
     * });
     * ```
     */
    static timeSeriesListReduce(options: TimeSeriesOptions): TimeSeries<Key>;
    /**
     * Takes a list of `TimeSeries` and merges them together to form a new
     * `TimeSeries`.
     *
     * Merging will produce a new `Event`;
     * only when events are conflict free, so
     * it is useful in the following cases:
     *  * to combine multiple `TimeSeries` which have different time ranges, essentially
     *  concatenating them together
     *  * combine `TimeSeries` which have different columns, for example inTraffic has
     *  a column "in" and outTraffic has a column "out" and you want to produce a merged
     *  trafficSeries with columns "in" and "out".
     *
     * @example
     * ```
     * const inTraffic = new TimeSeries(trafficDataIn);
     * const outTraffic = new TimeSeries(trafficDataOut);
     * const trafficSeries = TimeSeries.timeSeriesListMerge({
     *     name: "traffic",
     *     seriesList: [inTraffic, outTraffic]
     * });
     * ```
     */
    static timeSeriesListMerge(options: TimeSeriesOptions): TimeSeries<Key>;
    /**
     * @private
     */
    static timeSeriesListEventReduce(options: TimeSeriesListReducerOptions): TimeSeries<Key>;
}
