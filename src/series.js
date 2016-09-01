/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";

import Collection from "./collection";
import Index from "./index";
import Event from "./event";
import TimeRangeEvent from "./timerangeevent";
import IndexedEvent from "./indexedevent";
import { Pipeline } from "./pipeline.js";

function buildMetaData(meta) {
    let d = meta ? meta : {};

    // Name
    d.name = meta.name ? meta.name : "";
    
    // Index
    if (meta.index) {
        if (_.isString(meta.index)) {
            d.index = new Index(meta.index);
        } else if (meta.index instanceof(Index)) {
            d.index = meta.index;
        }
    }

    // UTC or Local time
    d.utc = true;
    if (_.isBoolean(meta.utc)) {
        d.utc = meta.utc;
    }

    return new Immutable.Map(d);
}

/**
A `TimeSeries` represents a series of events, with each event being a combination of:

 - time (or `TimeRange`, or `Index`)
 - data - corresponding set of key/values.

### Construction

Currently you can initialize a `TimeSeries` with either a list of events, or with a data format that looks like this:

```javascript
const data = {
    name: "trafficc",
    columns: ["time", "value"],
    points: [
        [1400425947000, 52],
        [1400425948000, 18],
        [1400425949000, 26],
        [1400425950000, 93],
        ...
    ]
};
```

To create a new TimeSeries object from the above format, simply use the constructor:

```javascript
var series = new TimeSeries(data);
```

The format of the data is as follows:

 - **name** - optional, but a good practice
 - **columns** - are necessary and give labels to the data in the points.
 - **points** - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels.
   
As just hinted at, the first column may actually be:

 - "time"
 - "timeRange" represented by a `TimeRange`
 - "index" - a time range represented by an `Index`. By using an index it is possible, for example, to refer to a specific month:

```javascript
var availabilityData = {
    name: "Last 3 months availability",
    columns: ["index", "uptime"],
    points: [
        ["2015-06", "100%"], // <-- 2015-06 specified here represents June 2015
        ["2015-05", "92%"],
        ["2015-04", "87%"],
    ]
};
```

Alternatively, you can construct a `TimeSeries` with a list of events. These may be `Events`, `TimeRangeEvents` or `IndexedEvents`. Here's an example of that:

```javascript
const events = [];
events.push(new Event(new Date(2015, 7, 1), {value: 27}));
events.push(new Event(new Date(2015, 8, 1), {value: 29}));
const series = new TimeSeries({
    name: "avg temps",
    events: events
});
```

### Nested data

The values do not have to be simple types like the above examples. Here's an example where each value is itself an object with "in" and "out" keys:

```javascript
const series = new TimeSeries({
    name: "Map Traffic",
    columns: ["time", "NASA_north", "NASA_south"],
    points: [
        [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
        [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
        [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
        [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}],
    ]
});
```

Complex data is stored in an Immutable structure. To get a value out of nested data like this you will get the Event you want (by row), as usual, and then use `get()` to fetch the value by column name. The result of this call will be a JSON copy of the Immutable data so you can query deeper in the usual way:

```javascript
series.at(0).get("NASA_north")["in"]  // 200`
```

It is then possible to use a value mapper function when calculating different properties. For example, to get the average "in" value of the NASA_north column:

```javascript
series.avg("NASA_north", d => d.in);  // 250
```
 */
class TimeSeries {

    constructor(arg) {
        this._collection = null;  // Collection
        this._data = null;        // Meta data

        if (arg instanceof TimeSeries) {

            //
            // Copy another TimeSeries
            //

            const other = arg;
            this._data = other._data;
            this._collection = other._collection;

        } else if (_.isObject(arg)) {

            //
            // TimeSeries(object data) where data may be:
            //    { "events": [event-1, event-2, ..., event-n]}
            // or
            //    { "columns": [time|timerange|index, column-1, ..., column-n]
            //      "points": [
            //         [t1, v1, v2, ..., v2],
            //         [t2, v1, v2, ..., vn],
            //         ...
            //      ]
            //    }

            const obj = arg;

            if (_.has(obj, "events")) {

                //
                // Initialized from an event list
                //

                const { events, ...meta1 } = obj; //eslint-disable-line
                this._collection = new Collection(events);
                this._data = buildMetaData(meta1);

            } else if (_.has(obj, "collection")) {

                //
                // Initialized from a Collection
                //

                const { collection, ...meta3 } = obj; //eslint-disable-line
                this._collection = collection;
                this._data = buildMetaData(meta3);

            } else if (_.has(obj, "columns") && _.has(obj, "points")) {

                //
                // Initialized from the wire format
                //

                const { columns, points, utc = true, ...meta2 } = obj; //eslint-disable-line
                const [eventType, ...eventFields] = columns;
                const events = points.map(point => {
                    const [t, ...eventValues] = point;
                    const d = _.object(eventFields, eventValues);
                    switch (eventType) {
                        case "time":
                            return new Event(t, d);
                        case "timerange":
                            return new TimeRangeEvent(t, d);
                        case "index":
                            return new IndexedEvent(t, d, utc);
                        default:
                            throw new Error(`Unknown event type: ${eventType}`);
                    }
                });

                this._collection = new Collection(events);
                this._data = buildMetaData(meta2);
            }

            if (!this._collection.isChronological()) {
                throw new Error("Events supplied to TimeSeries constructor must be chronological");
            }
        }
    }

    //
    // Serialize
    //

    /**
     * Turn the TimeSeries into regular javascript objects
     */
    toJSON() {
        let columns;
        const type = this._collection.type();
        if (type === Event) {
            columns = ["time", ...this.columns()];
        } else if (type === TimeRangeEvent) {
            columns = ["timerange", ...this.columns()];
        } else if (type === IndexedEvent) {
            columns = ["index", ...this.columns()];
        }

        const points = [];
        for (const e of this._collection.events()) {
            points.push(e.toPoint());
        }

        return _.extend(this._data.toJSON(), {
            columns,
            points
        });
    }

    /**
     * Represent the TimeSeries as a string
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the extents of the TimeSeries as a TimeRange.
     */
    timerange() {
        return this._collection.range();
    }

    range() {
        return this.timerange();
    }

    /**
     * Gets the earliest time represented in the TimeSeries.
     *
     * @return {Date} Begin time
     */
    begin() {
        return this.range().begin();
    }

    /**
     * Gets the latest time represented in the TimeSeries.
     *
     * @return {Date} End time
     */
    end() {
        return this.range().end();
    }

    /**
     * Access a specific TimeSeries event via its position
     *
     * @param {number} pos The event position
     */
    at(pos) {
        return this._collection.at(pos);
    }

    /**
     * Returns an event in the series by its time. This is the same
     * as calling `bisect` first and then using `at` with the index.
     *
     * @param  {Date} time The time of the event.
     * @return {Event|TimeRangeEvent|IndexedEvent}
     */
    atTime(time) {
        return this._collection.atTime(time);
    }

    /**
     * Returns the first event in the series.
     *
     * @return {Event|TimeRangeEvent|IndexedEvent}
     */
    atFirst() {
        return this._collection.atFirst();
    }

    /**
     * Returns the last event in the series.
     *
     * @return {Event|TimeRangeEvent|IndexedEvent}
     */
    atLast() {
        return this._collection.atLast();
    }

    /**
     * Generator to return all the events in the series
     *
     * @example
     * ```
     * for (let event of series.events()) {
     *     console.log(event.toString());
     * }
     * ```
     */
    * events() {
        for (let i = 0; i < this.size(); i++) {
            yield this.at(i);
        }
    }

    /**
     * Sets a new underlying collection for this TimeSeries.
     *
     * @param {Collection}  collection The new collection
     *
     * @return {TimeSeries}            A new TimeSeries
     */
    setCollection(collection) {
        if (!collection.isChronological()) {
            throw new Error("Collection supplied is not chronological");
        }
        const result = new TimeSeries(this);
        if (collection) {
            result._collection = collection;
        } else {
            result._collection = new Collection();
        }
        return result;
    }

    /**
     * Returns the index that bisects the TimeSeries at the time specified.
     *
     * @param  {Date}    t   The time to bisect the TimeSeries with
     * @param  {number}  b   The position to begin searching at
     *
     * @return {number}      The row number that is the greatest, but still below t.
     */
    bisect(t, b) {
        return this._collection.bisect(t, b);
    }

    /**
     * Perform a slice of events within the TimeSeries, returns a new
     * TimeSeries representing a portion of this TimeSeries from
     * begin up to but not including end.
     *
     * @param {Number} begin   The position to begin slicing
     * @param {Number} end     The position to end slicing
     *
     * @return {TimeSeries}    The new, sliced, TimeSeries.
     */
    slice(begin, end) {
        const sliced = this._collection.slice(begin, end);
        return this.setCollection(sliced);
    }

    /**
     * Crop the TimeSeries to the specified TimeRange and
     * return a new TimeSeries.
     *
     * @param {TimeRange} timerange   The bounds of the new TimeSeries
     *
     * @return {TimeSeries}    The new, cropped, TimeSeries.
     */
    crop(timerange) {
        const beginPos = this.bisect(timerange.begin());
        const endPos = this.bisect(timerange.end(), beginPos);
        return this.slice(beginPos, endPos);
    }

    /**
     * Returns a new TimeSeries by testing the fieldPath
     * values for being valid (not NaN, null or undefined).
     *
     * The resulting TimeSeries will be clean (for that fieldPath).
     *
     * @param  {string}      fieldPath  Name of value to look up. If not supplied,
     *                                  defaults to ['value']. "Deep" syntax is
     *                                  ['deep', 'value'] or 'deep.value'
     *
     * @return {TimeSeries}             A new, modified, TimeSeries.
     */
    clean(fieldSpec) {
        const cleaned = this._collection.clean(fieldSpec);
        return this.setCollection(cleaned);
    }

    /**
     * Generator to return all the events in the collection.
     *
     * @example
     * ```
     * for (let event of timeseries.events()) {
     *     console.log(event.toString());
     * }
     * ```
     */
    * events() {
        for (let i = 0; i < this.size(); i++) {
            yield this.at(i);
        }
    }


    //
    // Access meta data about the series
    //

    /**
     * Fetch the timeseries name
     *
     * @return {string} The name given to this TimeSeries
     */
    name() {
        return this._data.get("name");
    }

    /**
     * Fetch the timeseries Index, if it has one.
     *
     * @return {Index} The Index given to this TimeSeries
     */
    index() {
        return this._data.get("index");
    }

    /**
     * Fetch the timeseries Index, as a string, if it has one.
     *
     * @return {string} The Index, as a string, given to this TimeSeries
     */
    indexAsString() {
        return this.index() ? this.index().asString() : undefined;
    }

    /**
     * Fetch the timeseries Index, as a TimeRange, if it has one.
     *
     * @return {TimeRange} The Index, as a TimeRange, given to this TimeSeries
     */
    indexAsRange() {
        return this.index() ? this.index().asTimerange() : undefined;
    }

    /**
     * Fetch the UTC flag, i.e. are the events in this TimeSeries in
     * UTC or local time (if they are IndexedEvents an event might be
     * "2014-08-31". The actual time range of that representation
     * depends on where you are. Pond supports thinking about that in
     * either as a UTC day, or a local day).
     *
     * @return {TimeRange} The Index, as a TimeRange, given to this TimeSeries
     */
    isUTC() {
        return this._data.get("utc");
    }

    /**
     * Fetch the list of column names. This is determined by
     * traversing though the events and collecting the set.
     *
     * Note: the order is not defined
     *
     * @return {array} List of columns
     */
    columns() {
        const c = {};
        for (const e of this._collection.events()) {
            const d = e.toJSON().data;
            _.each(d, (val, key) => {c[key] = true;});
        }
        return _.keys(c);
    }

    /**
     * Returns the internal collection of events for this TimeSeries
     *
     * @return {Collection} The collection backing this TimeSeries
     */
    collection() {
        return this._collection;
    }

    /**
     * Returns the meta data about this TimeSeries as a JSON object.
     * Any extra data supplied to the TimeSeries constructor will be
     * placed in the meta data object. This returns either all of that
     * data as a JSON object, or a specific key if `key` is supplied.
     *
     * @param {string}   key   Optional specific part of the meta data
     * @return {object}        The meta data
     */
    meta(key) {
        if (!key) {
            return this._data.toJSON();
        } else {
            return this._data.get(key);
        }
    }

    //
    // Access the series itself
    //

    /**
     * Returns the number of events in this TimeSeries
     *
     * @return {number} Count of events
     */
    size() {
        return this._collection.size();
    }

    /**
     * Returns the number of valid items in this TimeSeries.
     *
     * Uses the fieldSpec to look up values in all events.
     * It then counts the number that are considered valid, which
     * specifically are not NaN, undefined or null.
     *
     * @return {number} Count of valid events
     */
    sizeValid(fieldSpec) {
        return this._collection.sizeValid(fieldSpec);
    }

    /**
     * Returns the number of events in this TimeSeries. Alias
     * for size().
     *
     * @return {number} Count of events
     */
    count() {
        return this.size();
    }

    /**
     * Returns the sum for the fieldspec
     *
     * @param {string} fieldSpec    Column or columns to look up. If you
     *                              need to retrieve multiple deep
     *                              nested values that ['can.be', 'done.with',
     *                              'this.notation']. A single deep value with a
     *                              string.like.this.  If not supplied, all columns
     *                              will be aggregated.
     *
     * @return {number} The sum
     */
    sum(fieldSpec) {
        return this._collection.sum(fieldSpec);
    }

    /**
     * Aggregates the events down to their maximum value
     *
     * @param {string} fieldSpec    Column or columns to find the max. If you
     *                              need to retrieve multiple deep
     *                              nested values that ['can.be', 'done.with',
     *                              'this.notation']. A single deep value with a
     *                              string.like.this.  If not supplied, all columns
     *                              will be aggregated.
     *
     * @return {number}             The max value for the field
     */
    max(fieldSpec) {
        return this._collection.max(fieldSpec);
    }

    /**
     * Aggregates the events down to their minimum value
     *
     * @param {string} fieldSpec    Column or columns to find the min. If you
     *                              need to retrieve multiple deep
     *                              nested values that ['can.be', 'done.with',
     *                              'this.notation']. A single deep value with a
     *                              string.like.this.  If not supplied, all columns
     *                              will be aggregated.
     *
     * @return {number}             The min value for the field
     */
    min(fieldSpec) {
        return this._collection.min(fieldSpec);
    }

    /**
     * Aggregates the events in the TimeSeries down to their average
     *
     * @param {string} fieldSpec    Column or columns to look up. If you
     *                              need to retrieve multiple deep
     *                              nested values that ['can.be', 'done.with',
     *                              'this.notation']. A single deep value with a
     *                              string.like.this.  If not supplied, all columns
     *                              will be aggregated.
     *
     * @return {number}             The average
     */
    avg(fieldSpec) {
        return this._collection.avg(fieldSpec);
    }

    /**
     * Aggregates the events in the TimeSeries down to their mean (same as avg)
     *
     * @param {string} fieldSpec    Column or columns to look up. If you
     *                              need to retrieve multiple deep
     *                              nested values that ['can.be', 'done.with',
     *                              'this.notation']. A single deep value with a
     *                              string.like.this.  If not supplied, all columns
     *                              will be aggregated.
     *
     * @return {number}             The mean
     */
    mean(fieldSpec) {
        return this._collection.mean(fieldSpec);
    }

    /**
     * Aggregates the events down to their medium value
     *
     * @param {string} fieldSpec    Column or columns to look up. If you
     *                              need to retrieve multiple deep
     *                              nested values that ['can.be', 'done.with',
     *                              'this.notation']. A single deep value with a
     *                              string.like.this.  If not supplied, all columns
     *                              will be aggregated.
     *
     * @return {number}             The resulting median value
     */
    median(fieldSpec) {
        return this._collection.median(fieldSpec);
    }

    /**
     * Aggregates the events down to their stdev
     *
     * @param {string} fieldSpec    Column or columns to look up. If you
     *                              need to retrieve multiple deep
     *                              nested values that ['can.be', 'done.with',
     *                              'this.notation']. A single deep value with a
     *                              string.like.this.  If not supplied, all columns
     *                              will be aggregated.
     *
     * @return {number}             The resulting stdev value
     */
    stdev(fieldSpec) {
        return this._collection.stdev(fieldSpec);
    }

    /**
     * Gets percentile q within the TimeSeries. This works the same way as numpy.
     *
     * @param  {integer} q         The percentile (should be between 0 and 100)
     *
     * @param {string}   fieldSpec Column or columns to find the stdev. If you
     *                             need to retrieve multiple deep
     *                             nested values that ['can.be', 'done.with',
     *                             'this.notation']. A single deep value with a
     *                             string.like.this.  If not supplied, all columns
     *                             will be aggregated.
     *
     * @param  {string}  interp    Specifies the interpolation method
     *                             to use when the desired quantile lies between
     *                             two data points. Options are:
     *                             options are:
     *                              * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
     *                              * lower: i.
     *                              * higher: j.
     *                              * nearest: i or j whichever is nearest.
     *                              * midpoint: (i + j) / 2.
     *
     * @return {number}            The percentile
     */
    percentile(q, fieldSpec, interp = "linear") {
        return this._collection.percentile(q, fieldSpec, interp);
    }

    /**
     * Aggregates the events down using a user defined function to
     * do the reduction.
     *
     * @param  {function} func    User defined reduction function. Will be
     *                            passed a list of values. Should return a
     *                            singe value.
     * @param  {String} fieldSpec The field to aggregate over
     *
     * @return {number}           The resulting value
     */
    aggregate(func, fieldSpec) {
        return this._collection.aggregate(func, fieldSpec);
    }

    /**
     * Gets n quantiles within the TimeSeries. This works the same way as numpy's percentile().
     * For example `timeseries.quantile(4)` would be the same as using percentile with q = 0.25, 0.5 and 0.75.
     *
     * @param  {integer} n        The number of quantiles to divide the
     *                            TimeSeries into.
     * @param  {string} column    The field to return as the quantile
     * @param  {string} interp    Specifies the interpolation method
     *                            to use when the desired quantile lies between
     *                            two data points. Options are:
     *                            options are:
     *                             * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
     *                             * lower: i.
     *                             * higher: j.
     *                             * nearest: i or j whichever is nearest.
     *                             * midpoint: (i + j) / 2.
     * @return {array}            An array of n quantiles
     */
    quantile(quantity, column = "value", interp = "linear") {
        return this._collection.quantile(quantity, column, interp);
    }

    /**
     * Returns a new Pipeline with input source being initialized to
     * this TimeSeries collection. This allows pipeline operations
     * to be chained directly onto the TimeSeries to produce a new
     * TimeSeries or Event result.
     *
     * @example
     *
     * ```
     * timeseries.pipeline()
     *     .offsetBy(1)
     *     .offsetBy(2)
     *     .to(CollectionOut, c => out = c);
     * ```
     *
     * @return {Pipeline} The Pipeline.
     */
    pipeline() {
        return new Pipeline()
            .from(this._collection);
    }

    /**
     * Takes an operator that is used to remap events from this TimeSeries to
     * a new set of Events.
     *
     * @param  {function}   operator      An operator which will be passed each
     *                                    event and which should return a new event.
     * @return {TimeSeries}               A TimeSeries containing the remapped events
     */
    map(op) {
        const collections = this.pipeline()
            .map(op)
            .toKeyedCollections();
        return this.setCollection(collections["all"]);
    }

    /**
     * Takes a fieldSpec (list of column names) and outputs to the callback just those
     * columns in a new TimeSeries.
     *
     * @param {string}   fieldSpec Column or columns to find the stdev. If you
     *                             need to retrieve multiple deep
     *                             nested values that ['can.be', 'done.with',
     *                             'this.notation']. A single deep value with a
     *                             string.like.this.  If not supplied, all columns
     *                             will be aggregated.
     *
     * @return {Collection}        A collection containing only the selected fields
     */
    select(fieldSpec) {
        const collections = this.pipeline()
            .select(fieldSpec)
            .toKeyedCollections();
        return this.setCollection(collections["all"]);
    }

    /**
     * Takes a fieldSpec (list of column names) and collapses
     * them to a new column named `name` which is the reduction (using
     * the `reducer` function) of the matched columns in the fieldSpecList.
     *
     * The column may be appended to the existing columns, or replace them,
     * using the `append` boolean.
     *
     * The result, a new TimeSeries, will be passed to the supplied callback.
     *
     * @param  {array}      fieldSpecList  The list of columns to collase. If you
     *                                     need to retrieve deep nested values that
     *                                     ['can.be', 'done.with', 'this.notation']
     * @param  {string}     name           The resulting summed column name
     * @param  {function}   reducer        Reducer function e.g. sum
     * @param  {boolean}    append         Append the summed column, rather than replace
     *
     * @return {TimeSeries}                A collapsed TimeSeries
     */
    collapse(fieldSpecList, name, reducer, append) {
        const collections = this.pipeline()
            .collapse(fieldSpecList, name, reducer, append)
            .toKeyedCollections();
        return this.setCollection(collections["all"]);
    }

    /**
     * TimeSeries.map() helper function to rename columns in the underlying events.
     * Takes a object of columns to rename:
     * ```
     * new_ts = ts.rename_columns({'in': 'new_in', 'out': 'new_out'})
     * ```
     *
     * Returns a new TimeSeries containing new events. Columns not
     * in the dict will be retained and not renamed.
     *
     * NOTE: as the name implies, this will only rename the main
     * "top level" (ie: non-deep) columns. If you need more
     * extravagant renaming, roll your own using map().
     *
     * @param {object} renameMap           Columns to rename.
     * @return {TimeSeries}                A new TimeSeries, with new column names
     */
    renameColumns(renameMap) {
        const rename = (event) => {
            const renamedMap = (event) => {
                const b = {};
                _.each(event.data().toJS(), (value, key) => {
                    const k = renameMap[key] || key;
                    b[k] = value;
                });
                return b;
            };

            const renamedData = renamedMap(event);

            if (event instanceof Event) {
                return new Event(event.timestamp(), renamedData);
            } else if (event instanceof TimeRangeEvent) {
                return new TimeRangeEvent([event.begin(), event.end()], renamedData);
            } else if (event instanceof IndexedEvent) {
                return new IndexedEvent(event.index(), renamedData);
            }
        };

        return this.map(rename);
    }

    /**
     * Take the data in this TimeSeries and "fill" any missing or invalid
     * values. This could be setting `null` values to zero so mathematical
     * operations will succeed, interpolate a new value, or pad with the
     * previously given value.
     *
     * The `fill()` method takes a single `options` arg, containing the following:
     *
     * @param  {string|array}   fieldSpec   Column or columns to look up. If you
     *                                      need to retrieve multiple deep
     *                                      nested values that ['can.be', 'done.with',
     *                                      'this.notation']. A single deep value with a
     *                                      string.like.this.
     * @param  {String} method              Filling method: "zero" | "linear" | "pad"
     * @param  {number} limit               Set a limit on the number of consecutive events
     *                                      will be filled before it starts returning invalid
     *                                      values. For linear fill, no filling will happen
     *                                      if the limit is reached before a valid value
     *                                      is found.
     *
     * @return {TimeSeries}                 The new TimeSeries
     */
    fill({fieldSpec = null, method = "zero", limit = null}) {
        let pipeline = this.pipeline();

        if (method === "zero" || method === "pad") {
            pipeline = pipeline.fill({fieldSpec, method, limit});
        } else if (method === "linear" && _.isArray(fieldSpec)) {
            fieldSpec.forEach(fieldPath => {
                pipeline = pipeline.fill({fieldSpec: fieldPath, method, limit});
            });
        } else {
            throw new Error("Invalid fill method:", method);
        }

        const collections = pipeline
            .toKeyedCollections();

        return this.setCollection(collections["all"]);
    }

    /**
     * Align of values to regular time boundaries. The value at
     * the boundary is interpolated. Only the new interpolated
     * points are returned. If limit is reached nulls will be
     * returned at each boundary position.
     *
     * One use case for this is to modify irregular data (i.e. data
     * that falls at irregular times) so that it falls into a
     * sequence of evenly spaced values. We use this to take data we
     * get from the network which is approximately every 30 second
     * (:32, 1:02, 1:34, ...) and output data on exact 30 second
     * boundaries (:30, 1:00, 1:30, ...).
     *
     * Another use case is data that might be already aligned to
     * some regular interval, but that contains missing points.
     * While `fill()` can be used to replace null values, align
     * can be used to add in missing points completely. Those points
     * can have an interpolated value, or by setting limit to 0,
     * can be filled with nulls. This is really useful when downstream
     * processing depends on complete sequences.
     */
    align(fieldSpec = "value", window = "5m", method="linear", limit = null) {
        const collection = this.pipeline()
            .align(fieldSpec, window, method, limit)
            .toKeyedCollections();

        return this.setCollection(collection["all"]);
    }

    /**
     * Returns the derivative of the TimeSeries for the given
     * TimeSeries.
     */
    rate(fieldSpec = "value", allowNegative = true) {
        const collection = this.pipeline()
            .rate(fieldSpec, allowNegative)
            .toKeyedCollections();

        return this.setCollection(collection["all"]);
    }

    /**
     * Builds a new TimeSeries by dividing events within the TimeSeries
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
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     * will aggregate both "in" and "out" using the average aggregation
     * function and return the result as in_avg and out_avg.
     *
     * @example
     * ```
     * const timeseries = new TimeSeries(data);
     * const dailyAvg = timeseries.fixedWindowRollup("1d", {value: {value: avg}});
     * ```
     *
     * @param  {string} windowSize  The size of the window. e.g. "6h" or "5m"
     * @param  {object} aggregation The aggregation specification
     * @return {TimeSeries}         The resulting rolled up TimeSeries
     */
    fixedWindowRollup(windowSize, aggregation, toEvents = false) {
        const aggregatorPipeline = this.pipeline()
            .windowBy(windowSize)
            .emitOn("discard")
            .aggregate(aggregation);

        const eventTypePipeline = toEvents ?
            aggregatorPipeline.asEvents() : aggregatorPipeline;

        const collections = eventTypePipeline
            .clearWindow()
            .toKeyedCollections();

        return this.setCollection(collections["all"]);
    }

    /**
     * Builds a new TimeSeries by dividing events into hours.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     * @param  {bool}   toEvents    Convert the rollup to Events, otherwise it
     *                              will be returned as IndexedEvents.
     * @param  {object} aggregation The aggregation specification
     *
     * @return {TimeSeries}         The resulting rolled up TimeSeries
     */
    hourlyRollup(aggregation, toEvent = false) {
        return this.fixedWindowRollup("1h", aggregation, toEvent);
    }

    /**
     * Builds a new TimeSeries by dividing events into days.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     * @param  {bool}   toEvents    Convert the rollup to Events, otherwise it
     *                              will be returned as IndexedEvents.
     * @param  {object} aggregation The aggregation specification
     *
     * @return {TimeSeries}         The resulting rolled up TimeSeries
     */
    dailyRollup(aggregation, toEvents = false) {
        return this._rollup("daily", aggregation, toEvents);
    }

    /**
     * Builds a new TimeSeries by dividing events into months.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     * @param  {bool}   toEvents    Convert the rollup to Events, otherwise it
     *                              will be returned as IndexedEvents.
     * @param  {object} aggregation The aggregation specification
     *
     * @return {TimeSeries}         The resulting rolled up TimeSeries
     */
    monthlyRollup(aggregation, toEvents = false) {
        return this._rollup("monthly", aggregation, toEvents);
    }

    /**
     * Builds a new TimeSeries by dividing events into years.
     *
     * Each window then has an aggregation specification `aggregation`
     * applied. This specification describes a mapping of output
     * fieldNames to aggregation functions and their fieldPath. For example:
     * ```
     * {in_avg: {in: avg()}, out_avg: {out: avg()}}
     * ```
     * @param  {bool}   toEvents    Convert the rollup to Events, otherwise it
     *                              will be returned as IndexedEvents.
     * @param  {object} aggregation The aggregation specification
     *
     * @return {TimeSeries}         The resulting rolled up TimeSeries
     */
    yearlyRollup(aggregation, toEvents = false) {
        return this._rollup("yearly", aggregation, toEvents);
    }

    /**
     * @private
     *
     * Internal function to build the TimeSeries rollup functions using
     * an aggregator Pipeline.
     */
    _rollup(type, aggregation, toEvents = false) {
        const aggregatorPipeline = this.pipeline()
            .windowBy(type)
            .emitOn("discard")
            .aggregate(aggregation);

        const eventTypePipeline = toEvents ?
            aggregatorPipeline.asEvents() : aggregatorPipeline;

        const collections = eventTypePipeline
            .clearWindow()
            .toKeyedCollections();

        return this.setCollection(collections["all"]);
    }

    /**
     * Builds multiple Collections, each collects together
     * events within a window of size `windowSize`. Note that these
     * are windows defined relative to Jan 1st, 1970, and are UTC.
     *
     * @example
     * ```
     * const timeseries = new TimeSeries(data);
     * const collections = timeseries.collectByFixedWindow("1d");
     * console.log(collections); // {1d-16314: Collection, 1d-16315: Collection, ...}
     * ```
     *
     * @param  {string} windowSize The size of the window. e.g. "6h" or "5m"
     * @return {map}    The result is a mapping from window index to a
     *                  Collection. e.g. "1d-16317" -> Collection
     */
    collectByFixedWindow(windowSize) {
        return this.pipeline()
            .windowBy(windowSize)
            .emitOn("discard")
            .toKeyedCollections();
    }

    /**
     * STATIC
     */

     /**
      * Static function to compare two TimeSeries to each other. If the TimeSeries
      * are of the same instance as each other then equals will return true.
      * @param  {TimeSeries} series1
      * @param  {TimeSeries} series2
      * @return {bool} result
      */
    static equal(series1, series2) {
        return (series1._data === series2._data &&
                series1._collection === series2._collection);
    }

     /**
      * Static function to compare two TimeSeries to each other. If the TimeSeries
      * are of the same value as each other then equals will return true.
      * @param  {TimeSeries} series1
      * @param  {TimeSeries} series2
      * @return {bool} result
      */
    static is(series1, series2) {
        return (Immutable.is(series1._data, series2._data) &&
                Collection.is(series1._collection, series2._collection));
    }

    /**
     * Reduces a list of TimeSeries objects using a reducer function. This works
     * by taking each event in each TimeSeries and collecting them together
     * based on timestamp. All events for a given time are then merged together
     * using the reducer function to produce a new Event. Those Events are then
     * collected together to form a new TimeSeries.
     *
     * @param  {object}         data        Meta data for the resulting TimeSeries
     * @param  {array}          seriesList  A list of TimeSeries objects
     * @param  {func}           reducer     The reducer function
     * @param  {string|array}   fieldSpec   Column or columns to look up. If you
     *                                      need to retrieve multiple deep
     *                                      nested values that ['can.be', 'done.with',
     *                                      'this.notation']. A single deep value with a
     *                                      string.like.this.
     *
     * @return {TimeSeries}           The new TimeSeries
     */
    static timeseriesListReduce(data, seriesList, reducer, fieldSpec) {
        // for each series, map events to the same timestamp/index
        const eventMap = {};
        _.each(seriesList, (series) => {
            for (const event of series.events()) {
                let key;
                if (event instanceof Event) {
                    key = event.timestamp();
                } else if (event instanceof IndexedEvent) {
                    key = event.index();
                } else if (event instanceof TimeRangeEvent) {
                    key = event.timerange().toUTCString();
                }

                if (!_.has(eventMap, key)) {
                    eventMap[key] = [];
                }

                eventMap[key].push(event);
            }
        });

        // For each key, reduce the events associated with that key
        // to a single new event
        const events = [];
        _.each(eventMap, (eventsList) => {
            const event = reducer(eventsList, fieldSpec);
            events.push(event);
        });

        return new TimeSeries({...data, events});
    }

    /**
     * Takes a list of TimeSeries and merges them together to form a new
     * Timeseries.
     *
     * Merging will produce a new Event only when events are conflict free, so
     * it is useful to combine multiple TimeSeries which have different time ranges
     * as well as combine TimeSeries which have different columns.
     *
     * @param  {object}              data       Meta data for the new TimeSeries
     * @param  {array}               seriesList A list of TimeSeries
     *
     * @return {TimeSeries}                     The resulting TimeSeries
     */
    static timeSeriesListMerge(data, seriesList) {
        return TimeSeries.timeseriesListReduce(data,
                                               seriesList,
                                               Event.merge);
    }

    /**
     * Takes a list of TimeSeries and sums them together to form a new
     * Timeseries.
     *
     * @example
     *
     * ```
     * const ts1 = new TimeSeries(weather1);
     * const ts2 = new TimeSeries(weather2);
     * const sum = TimeSeries.timeSeriesListSum({name: "sum"}, [ts1, ts2], ["temp"]);
     * ```
     *
     * @param  {object}   data          Meta data for the new TimeSeries
     * @param  {array}    seriesList    A list of TimeSeries
     * @param  {string}   fieldSpec     Column or columns to sum. If you
     *                                  need to retrieve multiple deep
     *                                  nested values that ['can.be', 'done.with',
     *                                  'this.notation']. A single deep value with a
     *                                  string.like.this. If not supplied all columns
     *                                  will be operated on.
     * @return {TimeSeries}             The resulting TimeSeries
     */
    static timeSeriesListSum(data, seriesList, fieldSpec) {
        return TimeSeries.timeseriesListReduce(data,
                                               seriesList,
                                               Event.sum,
                                               fieldSpec);
    }
}

export default TimeSeries;
