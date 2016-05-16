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

var _pipelineOutCollection = require("./pipeline-out-collection");

var _pipelineOutCollection2 = _interopRequireDefault(_pipelineOutCollection);

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
 * time (or `TimeRange`, or `Index`)
 * data - corresponding set of key/values.

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

  * **name** - optional, but a good practice
  * **columns** - are necessary and give labels to the data in the points.
  * **points** - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels.
   
  As just hinted at, the first column may actually be:

   * "time"
   * "timeRange" represented by a `TimeRange`
   * "index" - a time range represented by an `Index`. By using an index it is possible, for example, to refer to a specific month:

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
/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
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
         * @return {Date} Begin time
         */

    }, {
        key: "begin",
        value: function begin() {
            return this.range().begin();
        }

        /**
         * Gets the latest time represented in the TimeSeries.
         * @return {Date} End time
         */

    }, {
        key: "end",
        value: function end() {
            return this.range().end();
        }

        /**
         * Access the series events via index
         */

    }, {
        key: "at",
        value: function at(i) {
            return this._collection.at(i);
        }

        /**
         * Sets a new underlying collection for this TimeSeries.
         * @param {Collection} collection The new collection
         * @return {TimeSeries} A new TimeSeries
         */

    }, {
        key: "setCollection",
        value: function setCollection(collection) {
            var result = new TimeSeries(this);
            result._collection = collection;
            return result;
        }

        /**
         * Finds the index that is just less than the time t supplied.
         * In other words every event at the returned index or less
         * has a time before the supplied t, and every sample after the
         * index has a time later than the supplied t.
         *
         * Optionally supply a begin index to start searching from.
         */

    }, {
        key: "bisect",
        value: function bisect(t, b) {
            return this._collection.bisect(t, b);
        }

        /**
         * Perform a slice of events within the TimeSeries, returns a new
         * TimeSeries representing a portion of this TimeSeries from begin up to
         * but not including end.
         */

    }, {
        key: "slice",
        value: function slice(begin, end) {
            var sliced = this._collection.slice(begin, end);
            return this.setCollection(sliced);
        }

        /**
         * Perform a basic cleaning operation of the fieldSpec specified
         * by removing all events in the underlying collection which are
         * NaN, null or undefined.
         */

    }, {
        key: "clean",
        value: function clean(fieldSpec) {
            var cleaned = this._collection.clean(fieldSpec);
            return this.setCollection(cleaned);
        }

        /**
         * Takes a fieldSpecList (list of column names) and collapses
         * them to a new column which is the reduction of the matched columns
         * in the fieldSpecList.
         *
         * @param  {array}      fieldSpecList  The list of columns
         * @param  {string}     nane           The resulting summed column name
         * @param  {function}   reducer        Reducer function e.g. sum
         * @param  {boolean}    append         Append the summed column, rather than replace
         * @return {Collection}                A new, modified, Collection
         */

    }, {
        key: "collapse",
        value: function collapse(fieldSpecList, name, reducer) {
            var append = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

            var collapsed = this._collection.collapse(fieldSpecList, name, reducer, append);
            return this.setCollection(collapsed);
        }

        /**
         *  Generator to allow for..of loops over series.events()
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

        //
        // Access meta data about the series
        //

    }, {
        key: "name",
        value: function name() {
            return this._data.get("name");
        }

        /**
         * Access the Index, if this TimeSeries has one
         */

    }, {
        key: "index",
        value: function index() {
            return this._data.get("index");
        }
    }, {
        key: "indexAsString",
        value: function indexAsString() {
            return this.index() ? this.index().asString() : undefined;
        }
    }, {
        key: "indexAsRange",
        value: function indexAsRange() {
            return this.index() ? this.index().asTimerange() : undefined;
        }
    }, {
        key: "isUTC",
        value: function isUTC() {
            return this._data.get("utc");
        }
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

                    var d = e.toJSON().data;
                    _underscore2.default.each(d, function (val, key) {
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
         */

    }, {
        key: "collection",
        value: function collection() {
            return this._collection;
        }

        /**
         * Returns the meta data about this TimeSeries as a JSON object
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
         * Returns the number of rows in the series.
         */

    }, {
        key: "size",
        value: function size() {
            return this._collection.size();
        }

        /**
         * Returns the number of rows in the series.
         */

    }, {
        key: "sizeValid",
        value: function sizeValid(fieldSpec) {
            return this._collection.sizeValid(fieldSpec);
        }

        /**
         * Returns the number of rows in the series. (Same as size())
         * @return {number} Size of the series
         */

    }, {
        key: "count",
        value: function count() {
            return this.size();
        }
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
    }, {
        key: "avg",
        value: function avg(fieldSpec) {
            return this._collection.avg(fieldSpec);
        }
    }, {
        key: "mean",
        value: function mean(fieldSpec) {
            return this._collection.mean(fieldSpec);
        }
    }, {
        key: "median",
        value: function median(fieldSpec) {
            return this._collection.median(fieldSpec);
        }
    }, {
        key: "stdev",
        value: function stdev(fieldSpec) {
            return this._collection.stdev(fieldSpec);
        }
    }, {
        key: "aggregate",
        value: function aggregate(func, fieldSpec) {
            return this._collection.aggregate(func, fieldSpec);
        }
    }, {
        key: "pipeline",
        value: function pipeline() {
            return new _pipeline.Pipeline().from(this._collection);
        }
    }, {
        key: "select",
        value: function select(data, fieldSpec) {
            var collection = void 0;
            var x = this.pipeline().select(fieldSpec).to(_pipelineOutCollection2.default, function (c) {
                return collection = c;
            });

            console.log(">>>RES>>>", x, collection);

            return new TimeSeries((0, _extends3.default)({}, data, { collection: collection }));
        }

        /**
         * STATIC
         */

    }], [{
        key: "equal",
        value: function equal(series1, series2) {
            return series1._name === series2._name && series1._meta === series2._meta && series1._utc === series2._utc && series1._columns === series2._columns && series1._data === series2._data && series1._times === series2._times;
        }
    }, {
        key: "is",
        value: function is(series1, series2) {
            return series1._name === series2._name && series1._utc === series2._utc && _immutable2.default.is(series1._meta, series2._meta) && _immutable2.default.is(series1._columns, series2._columns) && _immutable2.default.is(series1._data, series2._data) && _immutable2.default.is(series1._times, series2._times);
        }
    }, {
        key: "map",
        value: function map(data, seriesList, mapper, fieldSpec) {
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

            // for each key, merge the events associated with that key
            var events = [];
            _underscore2.default.each(eventMap, function (eventsList) {
                var event = mapper(eventsList, fieldSpec);
                events.push(event);
            });

            return new TimeSeries((0, _extends3.default)({}, data, { events: events }));
        }
    }, {
        key: "merge",
        value: function merge(data, seriesList, fieldSpec) {
            return TimeSeries.map(data, seriesList, _event2.default.merge, fieldSpec);
        }

        /**
         * Takes a list of TimeSeries and sums them together to form a new
         * Timeseries.
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
        key: "sum",
        value: function sum(data, seriesList, fieldSpec) {
            return TimeSeries.map(data, seriesList, _event2.default.sum, fieldSpec);
        }
    }]);
    return TimeSeries;
}();

exports.default = TimeSeries;