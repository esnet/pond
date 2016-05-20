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
import CollectionOut from "./pipeline-out-collection";
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
                const { collection, ...meta3 } = obj; //eslint-disable-line
                this._collection = collection;
                this._data = buildMetaData(meta3);
            } else if (_.has(obj, "columns") && _.has(obj, "points")) {

                //
                // Initialized from the wire format
                //

                const { columns, points, ...meta2 } = obj; //eslint-disable-line
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
                            return new IndexedEvent(t, d);
                        default:
                            throw new Error(`Unknown event type: ${eventType}`);
                    }
                });

                this._collection = new Collection(events);
                this._data = buildMetaData(meta2);
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
     * Sets a new underlying collection for this TimeSeries.
     *
     * @param {Collection}  collection The new collection
     *
     * @return {TimeSeries}            A new TimeSeries
     */
    setCollection(collection) {
        const result = new TimeSeries(this);
        result._collection = collection;
        return result;
    }

    /**
     * Returns the index that bisects the TimeSeries at the time specified.
     *
     * @param  {Data}    t   The time to bisect the TimeSeries with
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
     * Returns a new Collection by testing the fieldSpec
     * values for being valid (not NaN, null or undefined).
     *
     * The resulting TimeSeries will be clean (for that fieldSpec).
     *
     * @param {string}      fieldSpec The field to test
     * @return {TimeSeries}           A new, modified, TimeSeries.
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
     * @param {string} fieldSpec The field to sum over the TimeSeries
     *
     * @return {number} The sum
     */
    sum(fieldSpec) {
        return this._collection.sum(fieldSpec);
    }

    max(fieldSpec) {
        return this._collection.max(fieldSpec);
    }

    min(fieldSpec) {
        return this._collection.min(fieldSpec);
    }

    /**
     * Aggregates the events in the TimeSeries down to their average
     *
     * @param  {String} fieldSpec The field to average over in the TimeSeries
     *
     * @return {number}           The average
     */
    avg(fieldSpec) {
        return this._collection.avg(fieldSpec);
    }

    /**
     * Aggregates the events in the TimeSeries down to their mean (same as avg)
     *
     * @param  {String} fieldSpec The field to find the mean of within the collection
     *
     * @return {number}           The mean
     */
    mean(fieldSpec) {
        return this._collection.mean(fieldSpec);
    }

    /**
     * Aggregates the events down to their medium value
     *
     * @param  {String} fieldSpec The field to aggregate over
     *
     * @return {number}           The resulting median value
     */
    median(fieldSpec) {
        return this._collection.median(fieldSpec);
    }

    /**
     * Aggregates the events down to their stdev
     *
     * @param  {String} fieldSpec The field to aggregate over
     *
     * @return {number}           The resulting stdev value
     */
    stdev(fieldSpec) {
        return this._collection.stdev(fieldSpec);
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
     * a new set of Events. The result is returned via the callback.
     *
     * @param  {function}   operator      An operator which will be passed each event and
     *                                    which should return a new event.
     * @param  {function}   cb            Callback containing a collapsed TimeSeries
     */
    map(op, cb) {
        this.pipeline()
            .emitOn("flush")
            .map(op)
            .to(CollectionOut, collection => {
                cb(this.setCollection(collection));
            }, true);
    }

    /**
     * Takes a fieldSpec (list of column names) and outputs to the callback just those
     * columns in a new TimeSeries.
     *
     * @param  {array}      fieldSpec     The list of columns
     * @param  {function}   cb            Callback containing a collapsed TimeSeries
     */
    select(fieldSpec, cb) {
        this.pipeline()
            .emitOn("flush")
            .select(fieldSpec)
            .to(CollectionOut, collection => {
                cb(this.setCollection(collection));
            }, true);
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
     * @param  {array}      fieldSpec      The list of columns
     * @param  {string}     name           The resulting summed column name
     * @param  {function}   reducer        Reducer function e.g. sum
     * @param  {boolean}    append         Append the summed column, rather than replace
     * @param  {function}   cb             Callback containing a collapsed TimeSeries
     */
    collapse(fieldSpec, name, reducer, append, cb) {
        this.pipeline()
            .collapse(fieldSpec, name, reducer, append)
            .emitOn("flush")
            .to(CollectionOut, collection => {
                cb(this.setCollection(collection));
            }, true);
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
     * @param  {object}   data        Meta data for the resulting TimeSeries
     * @param  {array}    seriesList  A list of TimeSeries objects
     * @param  {func}     reducer     The reducer function
     * @param  {string}   fieldSpec   The fields to map
     *
     * @return {TimeSeries}        The new TimeSeries
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
     * const sum = TimeSeries.sum({name: "sum"}, [ts1, ts2], ["temp"]);
     * ```
     *
     * @param  {object}              data       Meta data for the new TimeSeries
     * @param  {array}               seriesList A list of TimeSeries
     * @param  {object|array|string} fieldSpec  Which fields to use in the sum
     * @return {TimeSeries}                     The resulting TimeSeries
     */
    static timeSeriesListSum(data, seriesList, fieldSpec) {
        return TimeSeries.timeseriesListReduce(data,
                                               seriesList,
                                               Event.sum,
                                               fieldSpec);
    }
}

export default TimeSeries;
