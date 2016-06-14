"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _toArray2 = require("babel-runtime/helpers/toArray");

var _toArray3 = _interopRequireDefault(_toArray2);

var _objectWithoutProperties2 = require("babel-runtime/helpers/objectWithoutProperties");

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _collection = require("./collection");

var _collection2 = _interopRequireDefault(_collection);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _event = require("./event");

var _event2 = _interopRequireDefault(_event);

var _timerangeevent = require("./timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _indexedevent = require("./indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _pipeline = require("./pipeline.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import EventOut from "./pipeline-out-event.js";
// import CollectionOut from "./pipeline-out-collection.js";

/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

function buildMetaData(meta) {
    var d = meta ? meta : {};

    // Name
    d.name = meta.name ? meta.name : "";

    // Index
    if (meta.index) {
        if (_underscore2.default.isString(meta.index)) {
            d.index = new _index2.default(meta.index);
        } else if (meta.index instanceof _index2.default) {
            d.index = meta.index;
        }
    }

    // UTC or Local time
    d.utc = true;
    if (_underscore2.default.isBoolean(meta.utc)) {
        d.utc = meta.utc;
    }

    return new _immutable2.default.Map(d);
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

var TimeSeries = function () {
    function TimeSeries(arg) {
        var _this = this;

        (0, _classCallCheck3.default)(this, TimeSeries);

        this._collection = null; // Collection
        this._data = null; // Meta data

        if (arg instanceof TimeSeries) {

            //
            // Copy another TimeSeries
            //

            var other = arg;
            this._data = other._data;
            this._collection = other._collection;
        } else if (_underscore2.default.isObject(arg)) {

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

            var obj = arg;

            if (_underscore2.default.has(obj, "events")) {

                //
                // Initialized from an event list
                //

                var events = obj.events;
                var meta1 = (0, _objectWithoutProperties3.default)(obj, ["events"]); //eslint-disable-line

                this._collection = new _collection2.default(events);
                this._data = buildMetaData(meta1);
            } else if (_underscore2.default.has(obj, "collection")) {

                //
                // Initialized from a Collection
                //

                var collection = obj.collection;
                var meta3 = (0, _objectWithoutProperties3.default)(obj, ["collection"]); //eslint-disable-line

                this._collection = collection;
                this._data = buildMetaData(meta3);
            } else if (_underscore2.default.has(obj, "columns") && _underscore2.default.has(obj, "points")) {
                (function () {

                    //
                    // Initialized from the wire format
                    //

                    var columns = obj.columns;
                    var points = obj.points;
                    var meta2 = (0, _objectWithoutProperties3.default)(obj, ["columns", "points"]); //eslint-disable-line

                    var _columns = (0, _toArray3.default)(columns);

                    var eventType = _columns[0];

                    var eventFields = _columns.slice(1);

                    var events = points.map(function (point) {
                        var _point = (0, _toArray3.default)(point);

                        var t = _point[0];

                        var eventValues = _point.slice(1);

                        var d = _underscore2.default.object(eventFields, eventValues);
                        switch (eventType) {
                            case "time":
                                return new _event2.default(t, d);
                            case "timerange":
                                return new _timerangeevent2.default(t, d);
                            case "index":
                                return new _indexedevent2.default(t, d);
                            default:
                                throw new Error("Unknown event type: " + eventType);
                        }
                    });

                    _this._collection = new _collection2.default(events);
                    _this._data = buildMetaData(meta2);
                })();
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


    (0, _createClass3.default)(TimeSeries, [{
        key: "toJSON",
        value: function toJSON() {
            var columns = void 0;
            var type = this._collection.type();
            if (type === _event2.default) {
                columns = ["time"].concat((0, _toConsumableArray3.default)(this.columns()));
            } else if (type === _timerangeevent2.default) {
                columns = ["timerange"].concat((0, _toConsumableArray3.default)(this.columns()));
            } else if (type === _indexedevent2.default) {
                columns = ["index"].concat((0, _toConsumableArray3.default)(this.columns()));
            }

            var points = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this._collection.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    points.push(e.toPoint());
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return _underscore2.default.extend(this._data.toJSON(), {
                columns: columns,
                points: points
            });
        }

        /**
         * Represent the TimeSeries as a string
         */

    }, {
        key: "toString",
        value: function toString() {
            return (0, _stringify2.default)(this.toJSON());
        }

        /**
         * Returns the extents of the TimeSeries as a TimeRange.
         */

    }, {
        key: "timerange",
        value: function timerange() {
            return this._collection.range();
        }
    }, {
        key: "range",
        value: function range() {
            return this.timerange();
        }

        /**
         * Gets the earliest time represented in the TimeSeries.
         *
         * @return {Date} Begin time
         */

    }, {
        key: "begin",
        value: function begin() {
            return this.range().begin();
        }

        /**
         * Gets the latest time represented in the TimeSeries.
         *
         * @return {Date} End time
         */

    }, {
        key: "end",
        value: function end() {
            return this.range().end();
        }

        /**
         * Access a specific TimeSeries event via its position
         *
         * @param {number} pos The event position
         */

    }, {
        key: "at",
        value: function at(pos) {
            return this._collection.at(pos);
        }

        /**
         * Returns an event in the series by its time. This is the same
         * as calling `bisect` first and then using `at` with the index.
         *
         * @param  {Date} time The time of the event.
         * @return {Event|TimeRangeEvent|IndexedEvent}
         */

    }, {
        key: "atTime",
        value: function atTime(time) {
            return this._collection.atTime(time);
        }

        /**
         * Returns the first event in the series.
         *
         * @return {Event|TimeRangeEvent|IndexedEvent}
         */

    }, {
        key: "atFirst",
        value: function atFirst() {
            return this._collection.atFirst();
        }

        /**
         * Returns the last event in the series.
         *
         * @return {Event|TimeRangeEvent|IndexedEvent}
         */

    }, {
        key: "atLast",
        value: function atLast() {
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

    }, {
        key: "events",
        value: _regenerator2.default.mark(function events() {
            var i;
            return _regenerator2.default.wrap(function events$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            i = 0;

                        case 1:
                            if (!(i < this.size())) {
                                _context.next = 7;
                                break;
                            }

                            _context.next = 4;
                            return this.at(i);

                        case 4:
                            i++;
                            _context.next = 1;
                            break;

                        case 7:
                        case "end":
                            return _context.stop();
                    }
                }
            }, events, this);
        })

        /**
         * Sets a new underlying collection for this TimeSeries.
         *
         * @param {Collection}  collection The new collection
         *
         * @return {TimeSeries}            A new TimeSeries
         */

    }, {
        key: "setCollection",
        value: function setCollection(collection) {
            if (!collection.isChronological()) {
                throw new Error("Collection supplied is not chronological");
            }
            var result = new TimeSeries(this);
            result._collection = collection;
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

    }, {
        key: "bisect",
        value: function bisect(t, b) {
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

    }, {
        key: "slice",
        value: function slice(begin, end) {
            var sliced = this._collection.slice(begin, end);
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

    }, {
        key: "crop",
        value: function crop(timerange) {
            var beginPos = this.bisect(timerange.begin());
            var endPos = this.bisect(timerange.end(), beginPos);
            return this.slice(beginPos, endPos);
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

    }, {
        key: "clean",
        value: function clean(fieldSpec) {
            var cleaned = this._collection.clean(fieldSpec);
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

    }, {
        key: "events",
        value: _regenerator2.default.mark(function events() {
            var i;
            return _regenerator2.default.wrap(function events$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            i = 0;

                        case 1:
                            if (!(i < this.size())) {
                                _context2.next = 7;
                                break;
                            }

                            _context2.next = 4;
                            return this.at(i);

                        case 4:
                            i++;
                            _context2.next = 1;
                            break;

                        case 7:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, events, this);
        })

        //
        // Access meta data about the series
        //

        /**
         * Fetch the timeseries name
         *
         * @return {string} The name given to this TimeSeries
         */

    }, {
        key: "name",
        value: function name() {
            return this._data.get("name");
        }

        /**
         * Fetch the timeseries Index, if it has one.
         *
         * @return {Index} The Index given to this TimeSeries
         */

    }, {
        key: "index",
        value: function index() {
            return this._data.get("index");
        }

        /**
         * Fetch the timeseries Index, as a string, if it has one.
         *
         * @return {string} The Index, as a string, given to this TimeSeries
         */

    }, {
        key: "indexAsString",
        value: function indexAsString() {
            return this.index() ? this.index().asString() : undefined;
        }

        /**
         * Fetch the timeseries Index, as a TimeRange, if it has one.
         *
         * @return {TimeRange} The Index, as a TimeRange, given to this TimeSeries
         */

    }, {
        key: "indexAsRange",
        value: function indexAsRange() {
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

    }, {
        key: "isUTC",
        value: function isUTC() {
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

    }, {
        key: "columns",
        value: function columns() {
            var c = {};
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(this._collection.events()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var e = _step2.value;

                    var _d = e.toJSON().data;
                    _underscore2.default.each(_d, function (val, key) {
                        c[key] = true;
                    });
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return _underscore2.default.keys(c);
        }

        /**
         * Returns the internal collection of events for this TimeSeries
         *
         * @return {Collection} The collection backing this TimeSeries
         */

    }, {
        key: "collection",
        value: function collection() {
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

    }, {
        key: "meta",
        value: function meta(key) {
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

    }, {
        key: "size",
        value: function size() {
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

    }, {
        key: "sizeValid",
        value: function sizeValid(fieldSpec) {
            return this._collection.sizeValid(fieldSpec);
        }

        /**
         * Returns the number of events in this TimeSeries. Alias
         * for size().
         *
         * @return {number} Count of events
         */

    }, {
        key: "count",
        value: function count() {
            return this.size();
        }

        /**
         * Returns the sum for the fieldspec
         *
         * @param {string} fieldSpec The field to sum over the TimeSeries
         *
         * @return {number} The sum
         */

    }, {
        key: "sum",
        value: function sum(fieldSpec) {
            return this._collection.sum(fieldSpec);
        }
    }, {
        key: "max",
        value: function max(fieldSpec) {
            return this._collection.max(fieldSpec);
        }
    }, {
        key: "min",
        value: function min(fieldSpec) {
            return this._collection.min(fieldSpec);
        }

        /**
         * Aggregates the events in the TimeSeries down to their average
         *
         * @param  {String} fieldSpec The field to average over in the TimeSeries
         *
         * @return {number}           The average
         */

    }, {
        key: "avg",
        value: function avg(fieldSpec) {
            return this._collection.avg(fieldSpec);
        }

        /**
         * Aggregates the events in the TimeSeries down to their mean (same as avg)
         *
         * @param  {String} fieldSpec The field to find the mean of within the collection
         *
         * @return {number}           The mean
         */

    }, {
        key: "mean",
        value: function mean(fieldSpec) {
            return this._collection.mean(fieldSpec);
        }

        /**
         * Aggregates the events down to their medium value
         *
         * @param  {String} fieldSpec The field to aggregate over
         *
         * @return {number}           The resulting median value
         */

    }, {
        key: "median",
        value: function median(fieldSpec) {
            return this._collection.median(fieldSpec);
        }

        /**
         * Aggregates the events down to their stdev
         *
         * @param  {String} fieldSpec The field to aggregate over
         *
         * @return {number}           The resulting stdev value
         */

    }, {
        key: "stdev",
        value: function stdev(fieldSpec) {
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

    }, {
        key: "aggregate",
        value: function aggregate(func, fieldSpec) {
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

    }, {
        key: "pipeline",
        value: function pipeline() {
            return new _pipeline.Pipeline().from(this._collection);
        }

        /**
         * Takes an operator that is used to remap events from this TimeSeries to
         * a new set of Events. The result is returned via the callback.
         *
         * @param  {function}   operator      An operator which will be passed each event and
         *                                    which should return a new event.
         * @param  {function}   cb            Callback containing a collapsed TimeSeries
         */

    }, {
        key: "map",
        value: function map(op) {
            var collections = this.pipeline().map(op).toKeyedCollections();
            return this.setCollection(collections["all"]);
        }

        /**
         * Takes a fieldSpec (list of column names) and outputs to the callback just those
         * columns in a new TimeSeries.
         *
         * @return {Collection} A collection containing only the selected fields
         */

    }, {
        key: "select",
        value: function select(fieldSpec) {
            var collections = this.pipeline().select(fieldSpec).toKeyedCollections();
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
         * @param  {array}      fieldSpec      The list of columns
         * @param  {string}     name           The resulting summed column name
         * @param  {function}   reducer        Reducer function e.g. sum
         * @param  {boolean}    append         Append the summed column, rather than replace
         *
         * @return {Collection} A collapsed collection
         */

    }, {
        key: "collapse",
        value: function collapse(fieldSpec, name, reducer, append) {
            var collections = this.pipeline().collapse(fieldSpec, name, reducer, append).toKeyedCollections();
            return this.setCollection(collections["all"]);
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
         * `aggregation`. This specification describes a mapping of fieldNames
         * to aggregation functions. For example:
         * ```
         * {in: avg, out: avg}
         * ```
         * will aggregate both "in" and "out" using the average aggregation
         * function.
         *
         * @example
         * ```
         * const timeseries = new TimeSeries(data);
         * const dailyAvg = timeseries.fixedWindowRollup("1d", {value: avg});
         * ```
         *
         * @param  {string} windowSize  The size of the window. e.g. "6h" or "5m"
         * @param  {object} aggregation The aggregation specification
         * @return {TimeSeries}         The resulting rolled up TimeSeries
         */

    }, {
        key: "fixedWindowRollup",
        value: function fixedWindowRollup(windowSize, aggregation) {
            var toEvents = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            var aggregatorPipeline = this.pipeline().windowBy(windowSize).emitOn("discard").aggregate(aggregation);

            var eventTypePipeline = toEvents ? aggregatorPipeline.asEvents() : aggregatorPipeline;

            var collections = eventTypePipeline.clearWindow().toKeyedCollections();

            return this.setCollection(collections["all"]);
        }

        /**
         * Builds a new TimeSeries by dividing events into days. The days are
         * in either local or UTC time, depending on if utc(true) is set on the
         * Pipeline.
         *
         * Each window then has an aggregation specification applied as
         * `aggregation`. This specification describes a mapping of fieldNames
         * to aggregation functions. For example:
         * ```
         * {in: avg, out: avg}
         * ```
         * will aggregate both "in" and "out" using the average aggregation
         * function across all events within each day.
         *
         * @example
         * ```
         * const timeseries = new TimeSeries(weatherData);
         * const dailyMaxTemperature = timeseries.dailyRollup({temperature: max});
         * ```
         *
         * @param  {string} windowSize  The size of the window. e.g. "6h" or "5m"
         * @param  {object} aggregation The aggregation specification
         * @return {TimeSeries}         The resulting rolled up TimeSeries
         */

    }, {
        key: "hourlyRollup",
        value: function hourlyRollup(aggregation) {
            var toEvent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            return this.fixedWindowRollup("1h", aggregation, toEvent);
        }
    }, {
        key: "dailyRollup",
        value: function dailyRollup(aggregation) {
            var toEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            return this._rollup("daily", aggregation, toEvents);
        }
    }, {
        key: "monthlyRollup",
        value: function monthlyRollup(aggregation) {
            var toEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            return this._rollup("monthly", aggregation, toEvents);
        }
    }, {
        key: "yearlyRollup",
        value: function yearlyRollup(aggregation) {
            var toEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            return this._rollup("yearly", aggregation, toEvents);
        }
    }, {
        key: "_rollup",
        value: function _rollup(type, aggregation) {
            var toEvents = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            var aggregatorPipeline = this.pipeline().windowBy(type).emitOn("discard").aggregate(aggregation);

            var eventTypePipeline = toEvents ? aggregatorPipeline.asEvents() : aggregatorPipeline;

            var collections = eventTypePipeline.clearWindow().toKeyedCollections();

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

    }, {
        key: "collectByFixedWindow",
        value: function collectByFixedWindow(windowSize) {
            return this.pipeline().windowBy(windowSize).emitOn("discard").toKeyedCollections();
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

    }], [{
        key: "equal",
        value: function equal(series1, series2) {
            return series1._data === series2._data && series1._collection === series2._collection;
        }

        /**
         * Static function to compare two TimeSeries to each other. If the TimeSeries
         * are of the same value as each other then equals will return true.
         * @param  {TimeSeries} series1
         * @param  {TimeSeries} series2
         * @return {bool} result
         */

    }, {
        key: "is",
        value: function is(series1, series2) {
            return _immutable2.default.is(series1._data, series2._data) && _collection2.default.is(series1._collection, series2._collection);
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

    }, {
        key: "timeseriesListReduce",
        value: function timeseriesListReduce(data, seriesList, reducer, fieldSpec) {
            // for each series, map events to the same timestamp/index
            var eventMap = {};
            _underscore2.default.each(seriesList, function (series) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = (0, _getIterator3.default)(series.events()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var event = _step3.value;

                        var key = void 0;
                        if (event instanceof _event2.default) {
                            key = event.timestamp();
                        } else if (event instanceof _indexedevent2.default) {
                            key = event.index();
                        } else if (event instanceof _timerangeevent2.default) {
                            key = event.timerange().toUTCString();
                        }

                        if (!_underscore2.default.has(eventMap, key)) {
                            eventMap[key] = [];
                        }

                        eventMap[key].push(event);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            });

            // For each key, reduce the events associated with that key
            // to a single new event
            var events = [];
            _underscore2.default.each(eventMap, function (eventsList) {
                var event = reducer(eventsList, fieldSpec);
                events.push(event);
            });

            return new TimeSeries((0, _extends3.default)({}, data, { events: events }));
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

    }, {
        key: "timeSeriesListMerge",
        value: function timeSeriesListMerge(data, seriesList) {
            return TimeSeries.timeseriesListReduce(data, seriesList, _event2.default.merge);
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

    }, {
        key: "timeSeriesListSum",
        value: function timeSeriesListSum(data, seriesList, fieldSpec) {
            return TimeSeries.timeseriesListReduce(data, seriesList, _event2.default.sum, fieldSpec);
        }
    }]);
    return TimeSeries;
}();

exports.default = TimeSeries;