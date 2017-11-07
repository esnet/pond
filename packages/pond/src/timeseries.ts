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
import { Collection } from "./collection";
import { duration } from "./duration";
import { event, Event, indexedEvent, timeEvent, timeRangeEvent } from "./event";
import { Index, index } from "./index";
import { Key } from "./key";
import { period, Period } from "./period";
import { Select } from "./select";
import { SortedCollection } from "./sorted";
import { time, Time } from "./time";
import { TimeRange, timerange } from "./timerange";
import { daily, window } from "./window";

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

import {
    AlignmentMethod,
    AlignmentOptions,
    CollapseOptions,
    DedupFunction,
    FillMethod,
    FillOptions,
    RateOptions,
    ReducerFunction,
    RenameColumnOptions,
    RollupOptions,
    SelectOptions,
    TimeSeriesOptions,
    Trigger,
    ValueMap
} from "./types";

function buildMetaData(meta) {
    const d = meta ? meta : {};

    // Name
    d.name = meta.name ? meta.name : "";

    // Index
    if (meta.index) {
        if (_.isString(meta.index)) {
            d.index = new Index(meta.index).asString();
        } else if (meta.index instanceof Index) {
            d.index = meta.index.asString();
        }
    }

    // Timezone
    d.tz = "Etc/UTC";
    if (_.isString(meta.tz)) {
        d.tz = meta.tz;
    }

    return Immutable.Map(d);
}

/*
 * The `TimeSeries` wire format is the easiest way to construct a `TimeSeries`.
 * The most minimal version of this format looks like this:
 * ```
 * {
 *   "name": name,
 *   "columns": [keyName, column-1, ..., column-n]
 *   "points": [
 *      [t1, v1, v2, ..., v2],
 *      [t2, v1, v2, ..., vn],
 *      ...
 *   ]
 * }
 * ```
 */
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
function timeSeries(arg: TimeSeriesWireFormat) {
    const wireFormat = arg as TimeSeriesWireFormat;
    const { columns, points, tz = "Etc/UTC", ...meta2 } = wireFormat;
    const [eventKey, ...eventFields] = columns;
    const events = points.map(point => {
        const [key, ...eventValues] = point;
        const d = _.zipObject(eventFields, eventValues);
        return new Event<Time>(time(key), Immutable.fromJS(d as { [key: string]: {} }));
    });
    return new TimeSeries({ events: Immutable.List(events), ...meta2 });
}

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
function indexedSeries(arg: TimeSeriesWireFormat) {
    const wireFormat = arg as TimeSeriesWireFormat;
    const { columns, points, tz = "Etc/UTC", ...meta2 } = wireFormat;
    const [eventKey, ...eventFields] = columns;
    const events = points.map(point => {
        const [key, ...eventValues] = point;
        const d = _.zipObject(eventFields, eventValues);
        return new Event<Index>(index(key), Immutable.fromJS(d as { [key: string]: {} }));
    });
    return new TimeSeries({ events: Immutable.List(events), ...meta2 });
}

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
function timeRangeSeries(arg: TimeSeriesWireFormat) {
    const wireFormat = arg as TimeSeriesWireFormat;
    const { columns, points, tz = "Etc/UTC", ...meta2 } = wireFormat;
    const [eventKey, ...eventFields] = columns;
    const events = points.map(point => {
        const [key, ...eventValues] = point;
        const d = _.zipObject(eventFields, eventValues);
        return new Event<TimeRange>(
            timerange(key[0], key[1]),
            Immutable.fromJS(d as { [key: string]: {} })
        );
    });
    return new TimeSeries({ events: Immutable.List(events), ...meta2 });
}

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
 *     name: "traffic",
 *     columns: ["time", "in", "out"],
 *     points: [
 *         [1400425947000, 52, 11],
 *         [1400425948000, 18, 45],
 *         [1400425949000, 26, 22],
 *         [1400425950000, 93, 10],
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
 * const series = timeSeries({
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
export class TimeSeries<T extends Key> {
    private _collection: SortedCollection<T> = null;
    private _data = null;

    constructor(arg: TimeSeries<T> | TimeSeriesEvents<T>) {
        if (arg instanceof TimeSeries) {
            //
            // Copy another TimeSeries
            //
            const other = arg as TimeSeries<T>;
            this._data = other._data;
            this._collection = other._collection;
        } else if (_.isObject(arg)) {
            if (_.has(arg, "collection")) {
                //
                // Initialized from a Collection
                //
                const { collection, ...meta3 } = arg;
                this._collection = new SortedCollection<T>(collection);
                this._data = buildMetaData(meta3);
            } else if (_.has(arg, "events")) {
                //
                // Has a list of events
                //
                const { events, ...meta1 } = arg;
                this._collection = new SortedCollection(events);
                this._data = buildMetaData(meta1);
            }
        }
    }

    //
    // Serialize
    //
    /**
     * Turn the `TimeSeries` into regular javascript objects
     */
    toJSON(): {} {
        const e = this.atFirst();
        if (!e) {
            return;
        }

        const columns = [e.keyType(), ...this.columns()];

        const points = [];
        for (const evt of this._collection.eventList()) {
            points.push(evt.toPoint());
        }

        return _.extend(this._data.toJSON(), { columns, points });
    }

    /**
     * Represent the `TimeSeries` as a string
     */
    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the extents of the `TimeSeries` as a `TimeRange`.
     */
    timerange(): TimeRange {
        return this._collection.timerange();
    }

    /**
     * Alias for `timerange()`
     */
    range(): TimeRange {
        return this.timerange();
    }

    /**
     * Gets the earliest time represented in the `TimeSeries`.
     */
    begin(): Date {
        return this.range().begin();
    }

    /**
     * Gets the latest time represented in the `TimeSeries`.
     */
    end(): Date {
        return this.range().end();
    }

    /**
     * Access a specific `TimeSeries` event via its position
     */
    at(pos: number): Event<T> {
        return this._collection.at(pos);
    }

    /**
     * Returns an event in the series by its time. This is the same
     * as calling `bisect()` first and then using `at()` with the index.
     */
    atTime(t: Date): Event<T> {
        const pos = this.bisect(t);
        if (pos >= 0 && pos < this.size()) {
            return this.at(pos);
        }
    }

    /**
     * Returns the first `Event` in the series.
     */
    atFirst(): Event<T> {
        return this._collection.firstEvent();
    }

    /**
     * Returns the last `Event` in the series.
     */
    atLast(): Event<T> {
        return this._collection.lastEvent();
    }

    /**
     * Sets a new underlying collection for this `TimeSeries`.
     */
    setCollection<M extends Key>(collection: SortedCollection<M>): TimeSeries<M> {
        const result = new TimeSeries<M>(this);
        if (collection) {
            result._collection = collection;
        } else {
            result._collection = new SortedCollection<M>();
        }
        return result;
    }

    /**
     * Returns the `Index` that bisects the `TimeSeries` at the time specified.
     */
    bisect(t: Date, b?: number): number {
        return this._collection.bisect(t, b);
    }

    /**
     * Perform a slice of events within the `TimeSeries`, returns a new
     * `TimeSeries` representing a portion of this `TimeSeries` from
     * begin up to but not including end.
     */
    slice(begin?: number, end?: number): TimeSeries<T> {
        const sliced = new SortedCollection(this._collection.slice(begin, end));
        return this.setCollection(sliced);
    }

    /**
     * Crop the `TimeSeries` to the specified `TimeRange` and
     * return a new `TimeSeries`.
     */
    crop(tr: TimeRange): TimeSeries<T> {
        const beginPos = this.bisect(tr.begin());
        const endPos = this.bisect(tr.end(), beginPos);
        return this.slice(beginPos, endPos);
    }

    //
    // Access meta data about the series
    //
    /**
     * Fetch the `TimeSeries` name
     */
    name(): string {
        return this._data.get("name");
    }

    /**
     * Rename the `TimeSeries`
     */
    setName(name: string) {
        return this.setMeta("name", name);
    }

    /**
     * Fetch the timeSeries `Index`, if it has one.
     */
    index(): Index {
        return index(this._data.get("index"));
    }

    /**
     * Fetch the timeSeries `Index`, as a `string`, if it has one.
     */
    indexAsString(): string {
        return this.index() ? this.index().asString() : undefined;
    }

    /**
     * Fetch the timeseries `Index`, as a `TimeRange`, if it has one.
     */
    indexAsRange(): TimeRange {
        return this.index() ? this.index().asTimerange() : undefined;
    }

    /**
     * Fetch the UTC flag, i.e. are the events in this `TimeSeries` in
     * UTC or local time (if they are `IndexedEvent`'s an event might be
     * "2014-08-31". The actual time range of that representation
     * depends on where you are. Pond supports thinking about that in
     * either as a UTC day, or a local day).
     */
    isUTC(): TimeRange {
        return this._data.get("utc");
    }

    /**
     * Fetch the list of column names. This is determined by
     * traversing though the events and collecting the set.
     *
     * Note: the order is not defined
     */
    columns(): string[] {
        const c = {};
        for (const e of this._collection.eventList()) {
            const d = e.getData();
            d.forEach((val, key) => {
                c[key] = true;
            });
        }
        return _.keys(c);
    }

    /**
     * Returns the list of Events in the `Collection` of events for this `TimeSeries`
     */
    eventList() {
        return this.collection().eventList();
    }

    /**
     * Returns the internal `Collection` of events for this `TimeSeries`
     */
    collection(): SortedCollection<T> {
        return this._collection;
    }

    /**
     * Returns the meta data about this `TimeSeries` as a JSON object.
     * Any extra data supplied to the `TimeSeries` constructor will be
     * placed in the meta data object. This returns either all of that
     * data as a JSON object, or a specific key if `key` is supplied.
     */
    meta(key: string): {} {
        if (!key) {
            return this._data.toJSON();
        } else {
            return this._data.get(key);
        }
    }

    /**
     * Set new meta data for the `TimeSeries`. The result will
     * be a new `TimeSeries`.
     */
    setMeta(key: any, value: any): TimeSeries<T> {
        const newTimeSeries = new TimeSeries(this);
        const d = newTimeSeries._data;
        const dd = d.set(key, value);
        newTimeSeries._data = dd;
        return newTimeSeries;
    }

    //
    // Access the series itself
    //
    /**
     * Returns the number of events in this `TimeSeries`
     */
    size(): number {
        return this._collection ? this._collection.size() : 0;
    }

    /**
     * Returns the number of valid items in this `TimeSeries`.
     *
     * Uses the `fieldSpec` to look up values in all events.
     * It then counts the number that are considered valid, which
     * specifically are not NaN, undefined or null.
     */
    sizeValid(fieldSpec: string): number {
        return this._collection.sizeValid(fieldSpec);
    }

    /**
     * Returns the number of events in this `TimeSeries`. Alias
     * for size().
     */
    count(): number {
        return this.size();
    }

    /**
     * Returns the sum for the `fieldspec`
     *
     */
    sum(fieldPath: string = "value", filter?): number {
        return this._collection.sum(fieldPath, filter);
    }

    /**
     * Aggregates the events down to their maximum value
     */
    max(fieldPath: string = "value", filter?): number {
        return this._collection.max(fieldPath, filter);
    }

    /**
     * Aggregates the events down to their minimum value
     */
    min(fieldPath: string = "value", filter?): number {
        return this._collection.min(fieldPath, filter);
    }

    /**
     * Aggregates the events in the `TimeSeries` down to their average
     */
    avg(fieldPath: string = "value", filter?): number {
        return this._collection.avg(fieldPath, filter);
    }

    /**
     * Aggregates the events down to their medium value
     */
    median(fieldPath: string = "value", filter?): number {
        return this._collection.median(fieldPath, filter);
    }

    /**
     * Aggregates the events down to their stdev
     */
    stdev(fieldPath: string = "value", filter?): number {
        return this._collection.stdev(fieldPath, filter);
    }

    /**
     * Gets percentile q within the `TimeSeries`. This works the same way as numpy.
     */
    percentile(
        q: number,
        fieldPath: string = "value",
        interp: InterpolationType = InterpolationType.linear,
        filter?
    ): number {
        return this._collection.percentile(q, fieldPath, interp, filter);
    }

    /**
     * Aggregates the events down using a user defined function to
     * do the reduction.
     */
    aggregate(func: ReducerFunction, fieldPath: string = "value"): number {
        return this._collection.aggregate(func, fieldPath);
    }

    /**
     * Gets n quantiles within the `TimeSeries`. This works the same way as numpy's percentile().
     * For example `timeseries.quantile(4)` would be the same as using percentile
     * with q = 0.25, 0.5 and 0.75.
     */
    quantile(
        quantity: number,
        fieldPath: string = "value",
        interp: InterpolationType = InterpolationType.linear
    ) {
        return this._collection.quantile(quantity, fieldPath, interp);
    }

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
    forEach<M extends Key>(sideEffect: (value?: Event<T>, index?: number) => any) {
        return this._collection.forEach(sideEffect);
    }

    /**
     * Takes an operator that is used to remap events from this `TimeSeries` to
     * a new set of `Event`'s.
     */
    map<M extends Key>(mapper: (event?: Event<T>, index?: number) => Event<M>): TimeSeries<M> {
        const remapped = this._collection.map(mapper);
        return this.setCollection(remapped);
    }

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
    select(options: SelectOptions): TimeSeries<T> {
        const collection = new SortedCollection(this._collection.select(options));
        return this.setCollection(collection);
    }

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
    collapse(options: CollapseOptions): TimeSeries<T> {
        const collection = new SortedCollection(this._collection.collapse(options));
        return this.setCollection(collection);
    }

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
    renameColumns(options: RenameColumnOptions): TimeSeries<Key> {
        const { renameMap } = options;
        return this.map(e => {
            const eventType = e.keyType();
            const d = e.getData().mapKeys(key => renameMap[key] || key);
            switch (eventType) {
                case "time":
                    return new Event(time(e.toPoint()[0]), d);
                case "index":
                    return new Event(index(e.toPoint()[0]), d);
                case "timerange":
                    const timeArray = e.toPoint()[0];
                    return new Event(timerange(timeArray[0], timeArray[1]), d);
            }
        });
    }

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
    fill(options: FillOptions) {
        const { fieldSpec = null, method = FillMethod.Zero, limit = null } = options;

        let filledCollection: Collection<T>;
        if (method === FillMethod.Zero || method === FillMethod.Pad) {
            filledCollection = this._collection.fill({
                fieldSpec,
                method,
                limit
            });
        } else if (method === FillMethod.Linear) {
            if (_.isArray(fieldSpec)) {
                filledCollection = this._collection;
                fieldSpec.forEach(fieldPath => {
                    const args: FillOptions = {
                        fieldSpec: fieldPath,
                        method,
                        limit
                    };
                    filledCollection = filledCollection.fill(args);
                });
            } else {
                filledCollection = this._collection.fill({
                    fieldSpec,
                    method,
                    limit
                });
            }
        } else {
            throw new Error(`Invalid fill method: ${method}`);
        }

        const collection = new SortedCollection(filledCollection);
        return this.setCollection(collection);
    }

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
    align(options: AlignmentOptions) {
        const collection = new SortedCollection(this._collection.align(options));
        return this.setCollection(collection);
    }

    /**
     * Returns the derivative of the `TimeSeries` for the given columns. The result will
     * be per second. Optionally you can substitute in `null` values if the rate
     * is negative. This is useful when a negative rate would be considered invalid.
     */
    rate(options: RateOptions) {
        const collection = new SortedCollection(this._collection.rate(options));
        return this.setCollection(collection);
    }

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
    fixedWindowRollup(options: RollupOptions<T>): TimeSeries<Index> {
        if (!options.window) {
            throw new Error("window must be supplied");
        }

        if (!options.aggregation || !_.isObject(options.aggregation)) {
            throw new Error(
                "aggregation object must be supplied, for example: {value: {value: avg()}}"
            );
        }

        const aggregatorPipeline = this._collection
            .window({ window: options.window, trigger: Trigger.onDiscardedWindow })
            .aggregate(options.aggregation)
            .flatten();

        const collections = new SortedCollection(aggregatorPipeline);

        return this.setCollection(collections);
    }

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
    hourlyRollup(options: RollupOptions<T>): TimeSeries<Index> {
        const { aggregation } = options;

        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error(
                "aggregation object must be supplied, for example: {value: {value: avg()}}"
            );
        }

        return this.fixedWindowRollup({ window: window(duration("1h")), aggregation });
    }

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
    dailyRollup(options: RollupOptions<T>): TimeSeries<Index> {
        const { aggregation, timezone = "Etc/UTC" } = options;

        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error(
                "aggregation object must be supplied, for example: {avg_value: {value: avg()}}"
            );
        }

        return this._rollup({ window: daily(timezone), aggregation });
    }

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
    /*
    monthlyRollup(options: RollupOptions<T>): TimeSeries<Index> {
        const { aggregation } = options;

        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error(
                "aggregation object must be supplied, for example: {value: {value: avg()}}"
            );
        }

        return this._rollup({ windowSize: period("monthly"), aggregation });
    }
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
    /*
    yearlyRollup(options: RollupOptions<T>): TimeSeries<Index> {
        const { aggregation } = options;

        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error(
                "aggregation object must be supplied, for example: {value: {value: avg()}}"
            );
        }

        return this._rollup({ windowSize: period("yearly"), aggregation });
    }
    */

    /**
     * @private
     *
     * Internal function to build the `TimeSeries` rollup functions using
     * an aggregator Pipeline.
     */
    _rollup(options: RollupOptions<T>) {
        const aggregatorPipeline = this._collection
            .window({ window: options.window, trigger: Trigger.onDiscardedWindow })
            .aggregate(options.aggregation)
            .flatten();

        const collections = new SortedCollection(aggregatorPipeline);
        return this.setCollection(collections);
    }

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
    collectByWindow(options: RollupOptions<T>) {
        return this._collection.window({ window: options.window }).ungroup();
    }

    /*
     * STATIC
     */
    /**
     * Static function to compare two `TimeSeries` to each other. If the `TimeSeries`
     * are of the same instance as each other then equals will return true.
     */
    // tslint:disable:member-ordering
    static equal(series1: TimeSeries<Key>, series2: TimeSeries<Key>): boolean {
        return series1._data === series2._data && series1._collection === series2._collection;
    }

    /**
     * Static function to compare two `TimeSeries` to each other. If the `TimeSeries`
     * are of the same value as each other then equals will return true.
     */
    static is(series1: TimeSeries<Key>, series2: TimeSeries<Key>): boolean {
        return (
            Immutable.is(series1._data, series2._data) &&
            SortedCollection.is(series1._collection, series2._collection)
        );
    }

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
    static timeSeriesListReduce(options: TimeSeriesOptions) {
        const { seriesList, fieldSpec, reducer, ...data } = options;
        const combiner = Event.combiner(fieldSpec, reducer);
        return TimeSeries.timeSeriesListEventReduce({
            seriesList,
            fieldSpec,
            reducer: combiner,
            ...data
        });
    }

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
    static timeSeriesListMerge(options: TimeSeriesOptions) {
        const { seriesList, fieldSpec, reducer, deep = false, ...data } = options;
        const merger = Event.merger(deep);
        return TimeSeries.timeSeriesListEventReduce({
            seriesList,
            fieldSpec,
            reducer: merger,
            ...data
        });
    }

    /**
     * @private
     */
    static timeSeriesListEventReduce(options: TimeSeriesListReducerOptions) {
        const { seriesList, fieldSpec, reducer, ...data } = options;
        if (!seriesList || !_.isArray(seriesList)) {
            throw new Error("A list of TimeSeries must be supplied to reduce");
        }

        if (!reducer || !_.isFunction(reducer)) {
            throw new Error("reducer function must be supplied, for example avg()");
        }

        // for each series, make a map from timestamp to the
        // list of events with that timestamp
        const eventList = [];
        seriesList.forEach(series => {
            for (const e of series._collection.eventList()) {
                eventList.push(e);
            }
        });

        const events = reducer(Immutable.List(eventList));

        // Make a collection. If the events are out of order, sort them.
        // It's always possible that events are out of order here, depending
        // on the start times of the series, along with it the series
        // have missing data, so I think we don't have a choice here.
        const collection = new SortedCollection(events);
        const timeseries = new TimeSeries({ ...data, collection });

        return timeseries;
    }
}
