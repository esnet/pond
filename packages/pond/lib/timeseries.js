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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const _ = require("lodash");
const event_1 = require("./event");
const index_1 = require("./index");
const period_1 = require("./period");
const sorted_1 = require("./sorted");
const time_1 = require("./time");
const timerange_1 = require("./timerange");
const functions_1 = require("./functions");
const types_1 = require("./types");
function buildMetaData(meta) {
    const d = meta ? meta : {};
    // Name
    d.name = meta.name ? meta.name : "";
    // Index
    if (meta.index) {
        if (_.isString(meta.index)) {
            d.index = new index_1.Index(meta.index).asString();
        }
        else if (meta.index instanceof index_1.Index) {
            d.index = meta.index.asString();
        }
    }
    // UTC or Local time
    d.utc = true;
    if (_.isBoolean(meta.utc)) {
        d.utc = meta.utc;
    }
    return Immutable.Map(d);
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
function timeSeries(arg) {
    const wireFormat = arg;
    const { columns, points, utc = true } = wireFormat, meta2 = __rest(wireFormat, ["columns", "points", "utc"]);
    const [eventKey, ...eventFields] = columns;
    const events = points.map(point => {
        const [key, ...eventValues] = point;
        const d = _.zipObject(eventFields, eventValues);
        return new event_1.Event(time_1.time(key), Immutable.Map(d));
    });
    return new TimeSeries(Object.assign({ events: Immutable.List(events) }, meta2));
}
exports.timeSeries = timeSeries;
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
function indexedSeries(arg) {
    const wireFormat = arg;
    const { columns, points, utc = true } = wireFormat, meta2 = __rest(wireFormat, ["columns", "points", "utc"]);
    const [eventKey, ...eventFields] = columns;
    const events = points.map(point => {
        const [key, ...eventValues] = point;
        const d = _.zipObject(eventFields, eventValues);
        return new event_1.Event(index_1.index(key), Immutable.Map(d));
    });
    return new TimeSeries(Object.assign({ events: Immutable.List(events) }, meta2));
}
exports.indexedSeries = indexedSeries;
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
function timeRangeSeries(arg) {
    const wireFormat = arg;
    const { columns, points, utc = true } = wireFormat, meta2 = __rest(wireFormat, ["columns", "points", "utc"]);
    const [eventKey, ...eventFields] = columns;
    const events = points.map(point => {
        const [key, ...eventValues] = point;
        const d = _.zipObject(eventFields, eventValues);
        return new event_1.Event(timerange_1.timerange(key[0], key[1]), Immutable.Map(d));
    });
    return new TimeSeries(Object.assign({ events: Immutable.List(events) }, meta2));
}
exports.timeRangeSeries = timeRangeSeries;
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
class TimeSeries {
    constructor(arg) {
        this._collection = null;
        this._data = null;
        if (arg instanceof TimeSeries) {
            //
            // Copy another TimeSeries
            //
            const other = arg;
            this._data = other._data;
            this._collection = other._collection;
        }
        else if (_.isObject(arg)) {
            if (_.has(arg, "collection")) {
                //
                // Initialized from a Collection
                //
                const { collection } = arg, meta3 = __rest(arg, ["collection"]);
                this._collection = new sorted_1.SortedCollection(collection);
                this._data = buildMetaData(meta3);
            }
            else if (_.has(arg, "events")) {
                //
                // Has a list of events
                //
                const { events } = arg, meta1 = __rest(arg, ["events"]);
                this._collection = new sorted_1.SortedCollection(events);
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
    toJSON() {
        const e = this.atFirst();
        if (!e) {
            return;
        }
        const columns = [e.keyType(), ...this.columns()];
        const points = [];
        for (const event of this._collection.eventList()) {
            points.push(event.toPoint());
        }
        return _.extend(this._data.toJSON(), { columns, points });
    }
    /**
     * Represent the `TimeSeries` as a string
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
    /**
     * Returns the extents of the `TimeSeries` as a `TimeRange`.
     */
    timerange() {
        return this._collection.timerange();
    }
    /**
     * Alias for `timerange()`
     */
    range() {
        return this.timerange();
    }
    /**
     * Gets the earliest time represented in the `TimeSeries`.
     */
    begin() {
        return this.range().begin();
    }
    /**
     * Gets the latest time represented in the `TimeSeries`.
     */
    end() {
        return this.range().end();
    }
    /**
     * Access a specific `TimeSeries` event via its position
     */
    at(pos) {
        return this._collection.at(pos);
    }
    /**
     * Returns an event in the series by its time. This is the same
     * as calling `bisect()` first and then using `at()` with the index.
     */
    atTime(time) {
        const pos = this.bisect(time);
        if (pos >= 0 && pos < this.size()) {
            return this.at(pos);
        }
    }
    /**
     * Returns the first `Event` in the series.
     */
    atFirst() {
        return this._collection.firstEvent();
    }
    /**
     * Returns the last `Event` in the series.
     */
    atLast() {
        return this._collection.lastEvent();
    }
    /**
     * Sets a new underlying collection for this `TimeSeries`.
     */
    setCollection(collection) {
        const result = new TimeSeries(this);
        if (collection) {
            result._collection = collection;
        }
        else {
            result._collection = new sorted_1.SortedCollection();
        }
        return result;
    }
    /**
     * Returns the `Index` that bisects the `TimeSeries` at the time specified.
     */
    bisect(t, b) {
        return this._collection.bisect(t, b);
    }
    /**
     * Perform a slice of events within the `TimeSeries`, returns a new
     * `TimeSeries` representing a portion of this `TimeSeries` from
     * begin up to but not including end.
     */
    slice(begin, end) {
        const sliced = new sorted_1.SortedCollection(this._collection.slice(begin, end));
        return this.setCollection(sliced);
    }
    /**
     * Crop the `TimeSeries` to the specified `TimeRange` and
     * return a new `TimeSeries`.
     */
    crop(timerange) {
        const beginPos = this.bisect(timerange.begin());
        const endPos = this.bisect(timerange.end(), beginPos);
        return this.slice(beginPos, endPos);
    }
    //
    // Access meta data about the series
    //
    /**
     * Fetch the `TimeSeries` name
     */
    name() {
        return this._data.get("name");
    }
    /**
     * Rename the `TimeSeries`
     */
    setName(name) {
        return this.setMeta("name", name);
    }
    /**
     * Fetch the timeSeries `Index`, if it has one.
     */
    index() {
        return index_1.index(this._data.get("index"));
    }
    /**
     * Fetch the timeSeries `Index`, as a `string`, if it has one.
     */
    indexAsString() {
        return this.index() ? this.index().asString() : undefined;
    }
    /**
     * Fetch the timeseries `Index`, as a `TimeRange`, if it has one.
     */
    indexAsRange() {
        return this.index() ? this.index().asTimerange() : undefined;
    }
    /**
     * Fetch the UTC flag, i.e. are the events in this `TimeSeries` in
     * UTC or local time (if they are `IndexedEvent`'s an event might be
     * "2014-08-31". The actual time range of that representation
     * depends on where you are. Pond supports thinking about that in
     * either as a UTC day, or a local day).
     */
    isUTC() {
        return this._data.get("utc");
    }
    /**
     * Fetch the list of column names. This is determined by
     * traversing though the events and collecting the set.
     *
     * Note: the order is not defined
     */
    columns() {
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
     * Returns the internal `Collection` of events for this `TimeSeries`
     */
    collection() {
        return this._collection;
    }
    /**
     * Returns the meta data about this `TimeSeries` as a JSON object.
     * Any extra data supplied to the `TimeSeries` constructor will be
     * placed in the meta data object. This returns either all of that
     * data as a JSON object, or a specific key if `key` is supplied.
     */
    meta(key) {
        if (!key) {
            return this._data.toJSON();
        }
        else {
            return this._data.get(key);
        }
    }
    /**
     * Set new meta data for the `TimeSeries`. The result will
     * be a new `TimeSeries`.
     */
    setMeta(key, value) {
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
    size() {
        return this._collection ? this._collection.size() : 0;
    }
    /**
     * Returns the number of valid items in this `TimeSeries`.
     *
     * Uses the `fieldSpec` to look up values in all events.
     * It then counts the number that are considered valid, which
     * specifically are not NaN, undefined or null.
     */
    sizeValid(fieldSpec) {
        return this._collection.sizeValid(fieldSpec);
    }
    /**
     * Returns the number of events in this `TimeSeries`. Alias
     * for size().
     */
    count() {
        return this.size();
    }
    /**
     * Returns the sum for the `fieldspec`
     *
     */
    sum(fieldPath = "value", filter) {
        return this._collection.sum(fieldPath, filter);
    }
    /**
     * Aggregates the events down to their maximum value
     */
    max(fieldPath = "value", filter) {
        return this._collection.max(fieldPath, filter);
    }
    /**
     * Aggregates the events down to their minimum value
     */
    min(fieldPath = "value", filter) {
        return this._collection.min(fieldPath, filter);
    }
    /**
     * Aggregates the events in the `TimeSeries` down to their average
     */
    avg(fieldPath = "value", filter) {
        return this._collection.avg(fieldPath, filter);
    }
    /**
     * Aggregates the events down to their medium value
     */
    median(fieldPath = "value", filter) {
        return this._collection.median(fieldPath, filter);
    }
    /**
     * Aggregates the events down to their stdev
     */
    stdev(fieldPath = "value", filter) {
        return this._collection.stdev(fieldPath, filter);
    }
    /**
     * Gets percentile q within the `TimeSeries`. This works the same way as numpy.
     */
    percentile(q, fieldPath = "value", interp = functions_1.InterpolationType.linear, filter) {
        return this._collection.percentile(q, fieldPath, interp, filter);
    }
    /**
     * Aggregates the events down using a user defined function to
     * do the reduction.
     */
    aggregate(func, fieldPath = "value") {
        return this._collection.aggregate(func, fieldPath);
    }
    /**
     * Gets n quantiles within the `TimeSeries`. This works the same way as numpy's percentile().
     * For example `timeseries.quantile(4)` would be the same as using percentile
     * with q = 0.25, 0.5 and 0.75.
     */
    quantile(quantity, fieldPath = "value", interp = functions_1.InterpolationType.linear) {
        return this._collection.quantile(quantity, fieldPath, interp);
    }
    /**
     * Takes an operator that is used to remap events from this `TimeSeries` to
     * a new set of `Event`'s.
     */
    map(mapper) {
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
    select(options) {
        const collection = new sorted_1.SortedCollection(this._collection.select(options));
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
    collapse(options) {
        const collection = new sorted_1.SortedCollection(this._collection.collapse(options));
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
    renameColumns(options) {
        const { renameMap } = options;
        return this.map(event => {
            const eventType = event.keyType();
            const d = event.getData().mapKeys(key => renameMap[key] || key);
            switch (eventType) {
                case "time":
                    return new event_1.Event(time_1.time(event.toPoint()[0]), d);
                case "index":
                    return new event_1.Event(index_1.index(event.toPoint()[0]), d);
                case "timerange":
                    const timeArray = event.toPoint()[0];
                    return new event_1.Event(timerange_1.timerange(timeArray[0], timeArray[1]), d);
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
    fill(options) {
        const { fieldSpec = null, method = types_1.FillMethod.Zero, limit = null } = options;
        let filledCollection;
        if (method === types_1.FillMethod.Zero || method === types_1.FillMethod.Pad) {
            filledCollection = this._collection.fill(options);
        }
        else if (method === types_1.FillMethod.Linear && _.isArray(fieldSpec)) {
            fieldSpec.forEach(fieldPath => {
                const args = {
                    fieldSpec: fieldPath,
                    method,
                    limit
                };
                filledCollection = filledCollection.fill(args);
            });
        }
        else {
            throw new Error(`Invalid fill method: ${method}`);
        }
        const collection = new sorted_1.SortedCollection(filledCollection);
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
    align(options) {
        const { fieldSpec = "value", window = period_1.period("5m"), method = types_1.AlignmentMethod.Linear, limit = null } = options;
        const collection = new sorted_1.SortedCollection(this._collection.align({ fieldSpec, window, method, limit }));
        return this.setCollection(collection);
    }
    /**
     * Returns the derivative of the `TimeSeries` for the given columns. The result will
     * be per second. Optionally you can substitute in `null` values if the rate
     * is negative. This is useful when a negative rate would be considered invalid.
     */
    rate(options) {
        const { fieldSpec = "value", allowNegative = true } = options;
        const collection = new sorted_1.SortedCollection(this._collection.rate({ fieldSpec, allowNegative }));
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
    fixedWindowRollup(options) {
        const { windowSize, aggregation } = options;
        if (!windowSize) {
            throw new Error("windowSize must be supplied, for example '5m' for five minute rollups");
        }
        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
        }
        const aggregatorPipeline = this._collection
            .window({ window: windowSize, trigger: types_1.Trigger.onDiscardedWindow })
            .aggregate(aggregation)
            .flatten();
        const collections = new sorted_1.SortedCollection(aggregatorPipeline);
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
    hourlyRollup(options) {
        const { aggregation } = options;
        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
        }
        return this.fixedWindowRollup({ windowSize: period_1.period("1h"), aggregation });
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
    dailyRollup(options) {
        const { aggregation } = options;
        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
        }
        return this._rollup({ windowSize: period_1.period("daily"), aggregation });
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
    monthlyRollup(options) {
        const { aggregation } = options;
        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
        }
        return this._rollup({ windowSize: period_1.period("monthly"), aggregation });
    }
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
    yearlyRollup(options) {
        const { aggregation } = options;
        if (!aggregation || !_.isObject(aggregation)) {
            throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
        }
        return this._rollup({ windowSize: period_1.period("yearly"), aggregation });
    }
    /**
     * @private
     *
     * Internal function to build the `TimeSeries` rollup functions using
     * an aggregator Pipeline.
     */
    _rollup(options) {
        const { windowSize, aggregation } = options;
        const aggregatorPipeline = this._collection
            .window({ window: windowSize, trigger: types_1.Trigger.onDiscardedWindow })
            .aggregate(aggregation)
            .flatten();
        const collections = new sorted_1.SortedCollection(aggregatorPipeline);
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
    collectByFixedWindow(options) {
        return this._collection
            .window({ window: options.windowSize, trigger: types_1.Trigger.onDiscardedWindow })
            .ungroup();
    }
    /*
     * STATIC
     */
    /**
     * Static function to compare two `TimeSeries` to each other. If the `TimeSeries`
     * are of the same instance as each other then equals will return true.
     */
    // tslint:disable:member-ordering
    static equal(series1, series2) {
        return series1._data === series2._data && series1._collection === series2._collection;
    }
    /**
     * Static function to compare two `TimeSeries` to each other. If the `TimeSeries`
     * are of the same value as each other then equals will return true.
     */
    static is(series1, series2) {
        return (Immutable.is(series1._data, series2._data) &&
            sorted_1.SortedCollection.is(series1._collection, series2._collection));
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
    static timeSeriesListReduce(options) {
        const { seriesList, fieldSpec, reducer } = options, data = __rest(options, ["seriesList", "fieldSpec", "reducer"]);
        const combiner = event_1.Event.combiner(fieldSpec, reducer);
        return TimeSeries.timeSeriesListEventReduce(Object.assign({ seriesList,
            fieldSpec, reducer: combiner }, data));
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
    static timeSeriesListMerge(options) {
        const { seriesList, fieldSpec, reducer, deep = false } = options, data = __rest(options, ["seriesList", "fieldSpec", "reducer", "deep"]);
        const merger = event_1.Event.merger(deep);
        return TimeSeries.timeSeriesListEventReduce(Object.assign({ seriesList,
            fieldSpec, reducer: merger }, data));
    }
    /**
     * @private
     */
    static timeSeriesListEventReduce(options) {
        const { seriesList, fieldSpec, reducer } = options, data = __rest(options, ["seriesList", "fieldSpec", "reducer"]);
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
            for (const event of series._collection.eventList()) {
                eventList.push(event);
            }
        });
        const events = reducer(Immutable.List(eventList));
        // Make a collection. If the events are out of order, sort them.
        // It's always possible that events are out of order here, depending
        // on the start times of the series, along with it the series
        // have missing data, so I think we don't have a choice here.
        const collection = new sorted_1.SortedCollection(events);
        const timeseries = new TimeSeries(Object.assign({}, data, { collection }));
        return timeseries;
    }
}
exports.TimeSeries = TimeSeries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90aW1lc2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7Ozs7Ozs7Ozs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBRzVCLG1DQUFnRjtBQUNoRixtQ0FBdUM7QUFFdkMscUNBQTBDO0FBRTFDLHFDQUE0QztBQUM1QyxpQ0FBb0M7QUFDcEMsMkNBQW1EO0FBRW5ELDJDQVdxQjtBQUVyQixtQ0FnQmlCO0FBRWpCLHVCQUF1QixJQUFJO0lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRTNCLE9BQU87SUFDUCxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFcEMsUUFBUTtJQUNSLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQy9DLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxhQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG9CQUFvQjtJQUNwQixDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztJQUNiLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFD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