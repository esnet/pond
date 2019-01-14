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

var _timeevent = require("./timeevent");

var _timeevent2 = _interopRequireDefault(_timeevent);

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
 * A `TimeSeries` represents a series of events, with each event being a combination of:
 *
 *  - time (or `TimeRange`, or `Index`)
 *  - data - corresponding set of key/values.
 *
 * ### Construction
 *
 * Currently you can initialize a `TimeSeries` with either a list of events, or with a data format that looks like this:
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
 * To create a new TimeSeries object from the above format, simply use the constructor:
 *
 * ```javascript
 * const series = new TimeSeries(data);
 * ```
 *
 * The format of the data is as follows:
 *
 *  - **name** - optional, but a good practice
 *  - **columns** - are necessary and give labels to the data in the points.
 *  - **points** - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels.
 *
 * As just hinted at, the first column may actually be:
 *
 *  - "time"
 *  - "timeRange" represented by a `TimeRange`
 *  - "index" - a time range represented by an `Index`. By using an index it is possible, for example, to refer to a specific month:
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
/*
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var TimeSeries = function () {
    function TimeSeries(arg) {
        (0, _classCallCheck3.default)(this, TimeSeries);

        this._collection = null;
        // Collection
        this._data = null;

        // Meta data
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
                var events = obj.events,
                    meta1 = (0, _objectWithoutProperties3.default)(obj, ["events"]);
                //eslint-disable-line

                this._collection = new _collection2.default(events);
                this._data = buildMetaData(meta1);
            } else if (_underscore2.default.has(obj, "collection")) {
                //
                // Initialized from a Collection
                //
                var collection = obj.collection,
                    meta3 = (0, _objectWithoutProperties3.default)(obj, ["collection"]);
                //eslint-disable-line

                this._collection = collection;
                this._data = buildMetaData(meta3);
            } else if (_underscore2.default.has(obj, "columns") && _underscore2.default.has(obj, "points")) {
                //
                // Initialized from the wire format
                //
                var columns = obj.columns,
                    points = obj.points,
                    _obj$utc = obj.utc,
                    utc = _obj$utc === undefined ? true : _obj$utc,
                    meta2 = (0, _objectWithoutProperties3.default)(obj, ["columns", "points", "utc"]);
                //eslint-disable-line

                var _columns = (0, _toArray3.default)(columns),
                    eventKey = _columns[0],
                    eventFields = _columns.slice(1);

                var _events = points.map(function (point) {
                    var _point = (0, _toArray3.default)(point),
                        t = _point[0],
                        eventValues = _point.slice(1);

                    var d = _underscore2.default.object(eventFields, eventValues);
                    var options = utc;
                    switch (eventKey) {
                        case "time":
                            return new _timeevent2.default(t, d, options);
                        case "index":
                            return new _indexedevent2.default(t, d, options);
                        case "timerange":
                            return new _timerangeevent2.default(t, d, options);
                        default:
                            throw new Error("Unknown event type");
                    }
                });

                this._collection = new _collection2.default(_events);
                this._data = buildMetaData(meta2);
            }

            if (!this._collection.isChronological()) {
                throw new Error("TimeSeries was passed non-chronological events");
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
            var e = this.atFirst();
            if (!e) {
                return;
            }

            var columnList = this.columns();

            var columns = void 0;
            if (e instanceof _timeevent2.default) {
                columns = ["time"].concat((0, _toConsumableArray3.default)(columnList));
            } else if (e instanceof _timerangeevent2.default) {
                columns = ["timerange"].concat((0, _toConsumableArray3.default)(columnList));
            } else if (e instanceof _indexedevent2.default) {
                columns = ["index"].concat((0, _toConsumableArray3.default)(columnList));
            }

            var points = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this._collection.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _e = _step.value;

                    points.push(_e.toPoint(columnList));
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

            return _underscore2.default.extend(this._data.toJSON(), { columns: columns, points: points });
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

        /**
         * Alias for `timerange()`
         */

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
         * @return {TimeEvent|IndexedEvent|TimeRangeEvent}
         */

    }, {
        key: "atTime",
        value: function atTime(time) {
            var pos = this.bisect(time);
            if (pos >= 0 && pos < this.size()) {
                return this.at(pos);
            }
        }

        /**
         * Returns the first event in the series.
         *
         * @return {TimeEvent|IndexedEvent|TimeRangeEvent}
         */

    }, {
        key: "atFirst",
        value: function atFirst() {
            return this._collection.atFirst();
        }

        /**
         * Returns the last event in the series.
         *
         * @return {TimeEvent|IndexedEvent|TimeRangeEvent}
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
        value: /*#__PURE__*/_regenerator2.default.mark(function events() {
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
         * @param {Collection}  collection       The new collection
         * @param {boolean}     isChronological  Causes the chronological
         *                                       order of the events to
         *                                       not be checked
         *
         * @return {TimeSeries}                  A new TimeSeries
         */

    }, {
        key: "setCollection",
        value: function setCollection(collection) {
            var isChronological = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (!isChronological && !collection.isChronological()) {
                throw new Error("Collection supplied is not chronological");
            }
            var result = new TimeSeries(this);
            if (collection) {
                result._collection = collection;
            } else {
                result._collection = new _collection2.default();
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

    }, {
        key: "bisect",
        value: function bisect(t, b) {
            var tms = t.getTime();
            var size = this.size();
            var i = b || 0;

            if (!size) {
                return undefined;
            }

            for (; i < size; i++) {
                var ts = this.at(i).timestamp().getTime();
                if (ts > tms) {
                    return i - 1 >= 0 ? i - 1 : 0;
                } else if (ts === tms) {
                    return i;
                }
            }
            return i - 1;
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
            return this.setCollection(sliced, true);
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
            var timerangeBegin = timerange.begin();
            var beginPos = this.bisect(timerangeBegin);
            var bisectedEventOutsideRange = this.at(beginPos).timestamp() < timerangeBegin;
            beginPos = bisectedEventOutsideRange ? beginPos + 1 : beginPos;
            var endPos = this.bisect(timerange.end(), beginPos);
            return this.slice(beginPos, endPos + 1);
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

    }, {
        key: "clean",
        value: function clean(fieldSpec) {
            var cleaned = this._collection.clean(fieldSpec);
            return this.setCollection(cleaned, true);
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
        value: /*#__PURE__*/_regenerator2.default.mark(function events() {
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
         * Rename the timeseries
         */

    }, {
        key: "setName",
        value: function setName(name) {
            return this.setMeta("name", name);
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
         * Fetch the timeseries `Index`, as a `TimeRange`, if it has one.
         *
         * @return {TimeRange} The `Index`, as a `TimeRange`, given to this `TimeSeries`
         */

    }, {
        key: "indexAsRange",
        value: function indexAsRange() {
            return this.index() ? this.index().asTimerange() : undefined;
        }

        /**
         * Fetch the UTC flag, i.e. are the events in this `TimeSeries` in
         * UTC or local time (if they are `IndexedEvent`s an event might be
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
         * Returns the internal `Collection` of events for this `TimeSeries`
         *
         * @return {Collection} The collection backing this `TimeSeries`
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

        /**
         * Set new meta data for the TimeSeries. The result will
         * be a new TimeSeries.
         */

    }, {
        key: "setMeta",
        value: function setMeta(key, value) {
            var newTimeSeries = new TimeSeries(this);
            var d = newTimeSeries._data;
            var dd = d.set(key, value);
            newTimeSeries._data = dd;
            return newTimeSeries;
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
            return this._collection ? this._collection.size() : 0;
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
         * @param {string} fieldPath  Column to find the stdev of. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The sum
         */

    }, {
        key: "sum",
        value: function sum(fieldPath, filter) {
            return this._collection.sum(fieldPath, filter);
        }

        /**
         * Aggregates the events down to their maximum value
         *
         * @param {string} fieldPath  Column to find the max of. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         *
         * @return {number}           The max value for the field
         */

    }, {
        key: "max",
        value: function max(fieldPath, filter) {
            return this._collection.max(fieldPath, filter);
        }

        /**
         * Aggregates the events down to their minimum value
         *
         * @param {string} fieldPath  Column to find the min of. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The min value for the field
         */

    }, {
        key: "min",
        value: function min(fieldPath, filter) {
            return this._collection.min(fieldPath, filter);
        }

        /**
         * Aggregates the events in the TimeSeries down to their average
         *
         * @param {string} fieldPath  Column to find the avg of. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The average
         */

    }, {
        key: "avg",
        value: function avg(fieldPath, filter) {
            return this._collection.avg(fieldPath, filter);
        }

        /**
         * Aggregates the events in the TimeSeries down to their mean (same as avg)
         *
         * @param {string} fieldPath  Column to find the mean of. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The mean
         */

    }, {
        key: "mean",
        value: function mean(fieldPath, filter) {
            return this._collection.mean(fieldPath, filter);
        }

        /**
         * Aggregates the events down to their medium value
         *
         * @param {string} fieldPath  Column to find the median of. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The resulting median value
         */

    }, {
        key: "median",
        value: function median(fieldPath, filter) {
            return this._collection.median(fieldPath, filter);
        }

        /**
         * Aggregates the events down to their stdev
         *
         * @param {string} fieldPath  Column to find the stdev of. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The resulting stdev value
         */

    }, {
        key: "stdev",
        value: function stdev(fieldPath, filter) {
            return this._collection.stdev(fieldPath, filter);
        }

        /**
         * Gets percentile q within the TimeSeries. This works the same way as numpy.
         *
         * @param  {integer} q         The percentile (should be between 0 and 100)
         *
         * @param {string} fieldPath   Column to find the qth percentile of. A deep value can
         *                             be referenced with a string.like.this.  If not supplied
         *                             the `value` column will be aggregated.
         *
         * @param  {string}  interp    Specifies the interpolation method
         *                             to use when the desired quantile lies between
         *                             two data points. Options are: "linear", "lower", "higher",
         *                             "nearest", "midpoint"
         * @param {function} filter    Optional filter function used to clean data before aggregating
         *
         * @return {number}            The percentile
         */

    }, {
        key: "percentile",
        value: function percentile(q, fieldPath) {
            var interp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "linear";
            var filter = arguments[3];

            return this._collection.percentile(q, fieldPath, interp, filter);
        }

        /**
         * Aggregates the events down using a user defined function to
         * do the reduction.
         *
         * @param  {function} func    User defined reduction function. Will be
         *                            passed a list of values. Should return a
         *                            singe value.
         * @param {string} fieldPath  Column to aggregate over. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         *
         * @return {number}           The resulting value
         */

    }, {
        key: "aggregate",
        value: function aggregate(func, fieldPath) {
            return this._collection.aggregate(func, fieldPath);
        }

        /**
         * Gets n quantiles within the TimeSeries. This works the same way as numpy's percentile().
         * For example `timeseries.quantile(4)` would be the same as using percentile with q = 0.25, 0.5 and 0.75.
         *
         * @param  {integer} n        The number of quantiles to divide the
         *                            TimeSeries into.
         * @param {string} fieldPath  Column to calculate over. A deep value can
         *                            be referenced with a string.like.this.  If not supplied
         *                            the `value` column will be aggregated.
         * @param  {string} interp    Specifies the interpolation method
         *                            to use when the desired quantile lies between
         *                            two data points. Options are: "linear", "lower", "higher",
         *                            "nearest", "midpoint".
         * @return {array}            An array of n quantiles
         */

    }, {
        key: "quantile",
        value: function quantile(quantity) {
            var fieldPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "value";
            var interp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "linear";

            return this._collection.quantile(quantity, fieldPath, interp);
        }

        /**
         * Returns a new Pipeline with input source being initialized to
         * this TimeSeries collection. This allows pipeline operations
         * to be chained directly onto the TimeSeries to produce a new
         * TimeSeries or event result.
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
         * a new set of events.
         *
         * @param  {function}   operator      An operator which will be passed each
         *                                    event and which should return a new event.
         * @return {TimeSeries}               A TimeSeries containing the remapped events
         */

    }, {
        key: "map",
        value: function map(op) {
            var collections = this.pipeline().map(op).toKeyedCollections();
            return this.setCollection(collections["all"], true);
        }

        /**
         * Takes a fieldSpec (list of column names) and outputs to the callback just those
         * columns in a new TimeSeries.
         *
         * @example
         *
         * ```
         *     const ts = timeseries.select({fieldSpec: ["uptime", "notes"]});
         * ```
         *
         * @param                options           An object containing options for the command
         * @param {string|array} options.fieldSpec Column or columns to select into the new TimeSeries.
         *                                         If you need to retrieve multiple deep nested values
         *                                         that ['can.be', 'done.with', 'this.notation'].
         *                                         A single deep value with a string.like.this.
         *
         * @return {TimeSeries}                    The resulting TimeSeries with renamed columns
         */

    }, {
        key: "select",
        value: function select(options) {
            var fieldSpec = options.fieldSpec;

            var collections = this.pipeline().select(fieldSpec).toKeyedCollections();
            return this.setCollection(collections["all"], true);
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
         *     const sums = ts.collapse({
         *          name: "sum_series",
         *          fieldSpecList: ["in", "out"],
         *          reducer: sum(),
         *          append: false
         *     });
         * ```
         *
         * @param                options                An object containing options:
         * @param {array}        options.fieldSpecList  The list of columns to collapse. (required)
         * @param {string}       options.name           The resulting collapsed column name (required)
         * @param {function}     options.reducer        The reducer function (required)
         * @param {bool}         options.append         Append the collapsed column, rather
         *                                              than replace
         *
         * @return {TimeSeries}     The resulting collapsed TimeSeries
         */

    }, {
        key: "collapse",
        value: function collapse(options) {
            var fieldSpecList = options.fieldSpecList,
                name = options.name,
                reducer = options.reducer,
                append = options.append;

            var collections = this.pipeline().collapse(fieldSpecList, name, reducer, append).toKeyedCollections();
            return this.setCollection(collections["all"], true);
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
         * @note As the name implies, this will only rename the main
         * "top level" (ie: non-deep) columns. If you need more
         * extravagant renaming, roll your own using `TimeSeries.map()`.
         *
         * @param                options                An object containing options:
         * @param {Object}       options.renameMap      Columns to rename.
         *
         * @return {TimeSeries}     The resulting TimeSeries with renamed columns
         */

    }, {
        key: "renameColumns",
        value: function renameColumns(options) {
            var renameMap = options.renameMap;

            return this.map(function (event) {
                var eventType = event.type();
                var d = event.data().mapKeys(function (key) {
                    return renameMap[key] || key;
                });
                return new eventType(event.key(), d);
            });
        }

        /**
         * Take the data in this TimeSeries and "fill" any missing or invalid
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
         *
         * @param                options                An object containing options:
         * @param {string|array} options.fieldSpec      Column or columns to fill. If you need to
         *                                              retrieve multiple deep nested values
         *                                              that ['can.be', 'done.with', 'this.notation'].
         *                                              A single deep value with a string.like.this.
         * @param {string}       options.method         "linear" or "pad" or "zero" style interpolation
         * @param {number}       options.limit          The maximum number of points which should be
         *                                              interpolated onto missing points. You might set this to
         *                                              2 if you are willing to fill 2 new points,
         *                                              and then beyond that leave data with missing values.
         *
         * @return {TimeSeries}                         The resulting filled TimeSeries
         */

    }, {
        key: "fill",
        value: function fill(options) {
            var _options$fieldSpec = options.fieldSpec,
                fieldSpec = _options$fieldSpec === undefined ? null : _options$fieldSpec,
                _options$method = options.method,
                method = _options$method === undefined ? "zero" : _options$method,
                _options$limit = options.limit,
                limit = _options$limit === undefined ? null : _options$limit;


            var pipeline = this.pipeline();

            if (method === "zero" || method === "pad") {
                pipeline = pipeline.fill({ fieldSpec: fieldSpec, method: method, limit: limit });
            } else if (method === "linear" && _underscore2.default.isArray(fieldSpec)) {
                fieldSpec.forEach(function (fieldPath) {
                    pipeline = pipeline.fill({
                        fieldSpec: fieldPath,
                        method: method,
                        limit: limit
                    });
                });
            } else {
                throw new Error("Invalid fill method:", method);
            }

            var collections = pipeline.toKeyedCollections();

            return this.setCollection(collections["all"], true);
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
         *
         * @param                options                An object containing options:
         * @param {string|array} options.fieldSpec      Column or columns to align. If you need to
         *                                              retrieve multiple deep nested values
         *                                              that ['can.be', 'done.with', 'this.notation'].
         *                                              A single deep value with a string.like.this.
         * @param {string}       options.period         Spacing of aligned values. e.g. "6h" or "5m"
         * @param {string}       options.method         "linear" or "pad" style interpolation to boundaries.
         * @param {number}       options.limit          The maximum number of points which should be
         *                                              interpolated onto boundaries. You might set this to
         *                                              2 if you are willing to interpolate 2 new points,
         *                                              and then beyond that just emit nulls on the boundaries.
         *
         * @return {TimeSeries}     The resulting aligned TimeSeries
         */

    }, {
        key: "align",
        value: function align(options) {
            var _options$fieldSpec2 = options.fieldSpec,
                fieldSpec = _options$fieldSpec2 === undefined ? "value" : _options$fieldSpec2,
                _options$period = options.period,
                period = _options$period === undefined ? "5m" : _options$period,
                _options$method2 = options.method,
                method = _options$method2 === undefined ? "linear" : _options$method2,
                _options$limit2 = options.limit,
                limit = _options$limit2 === undefined ? null : _options$limit2;

            var collection = this.pipeline().align(fieldSpec, period, method, limit).toKeyedCollections();

            return this.setCollection(collection["all"], true);
        }

        /**
         * Returns the derivative of the TimeSeries for the given columns. The result will
         * be per second. Optionally you can substitute in `null` values if the rate
         * is negative. This is useful when a negative rate would be considered invalid.
         *
         * @param                options                An object containing options:
         * @param {string|array} options.fieldSpec      Column or columns to get the rate of. If you
         *                                              need to retrieve multiple deep nested values
         *                                              that ['can.be', 'done.with', 'this.notation'].
         * @param {bool}         options.allowNegative  Will output null values for negative rates.
         *                                              This is useful if you are getting the rate
         *                                              of a counter that always goes up, except
         *                                              when perhaps it rolls around or resets.
         *
         * @return {TimeSeries}                         The resulting `TimeSeries` containing calculated rates.
         */

    }, {
        key: "rate",
        value: function rate() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _options$fieldSpec3 = options.fieldSpec,
                fieldSpec = _options$fieldSpec3 === undefined ? "value" : _options$fieldSpec3,
                _options$allowNegativ = options.allowNegative,
                allowNegative = _options$allowNegativ === undefined ? true : _options$allowNegativ;

            var collection = this.pipeline().rate(fieldSpec, allowNegative).toKeyedCollections();

            return this.setCollection(collection["all"], true);
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
         * @param                options                An object containing options:
         * @param {string}       options.windowSize     The size of the window. e.g. "6h" or "5m"
         * @param {object}       options.aggregation    The aggregation specification (see description above)
         * @param {bool}         options.toTimeEvents   Output as `TimeEvent`s, rather than `IndexedEvent`s
         * @return {TimeSeries}                         The resulting rolled up `TimeSeries`
         */

    }, {
        key: "fixedWindowRollup",
        value: function fixedWindowRollup(options) {
            var windowSize = options.windowSize,
                aggregation = options.aggregation,
                _options$toTimeEvents = options.toTimeEvents,
                toTimeEvents = _options$toTimeEvents === undefined ? false : _options$toTimeEvents;

            if (!windowSize) {
                throw new Error("windowSize must be supplied, for example '5m' for five minute rollups");
            }

            if (!aggregation || !_underscore2.default.isObject(aggregation)) {
                throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
            }

            var aggregatorPipeline = this.pipeline().windowBy(windowSize).emitOn("discard").aggregate(aggregation);

            var eventTypePipeline = toTimeEvents ? aggregatorPipeline.asTimeEvents() : aggregatorPipeline;

            var collections = eventTypePipeline.clearWindow().toKeyedCollections();

            return this.setCollection(collections["all"], true);
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
         *
         * @param                options                An object containing options:
         * @param {bool}         options.toTimeEvents   Convert the rollup events to `TimeEvent`s, otherwise it
         *                                              will be returned as a `TimeSeries` of `IndexedEvent`s.
         * @param {object}       options.aggregation    The aggregation specification (see description above)
         *
         * @return {TimeSeries}     The resulting rolled up TimeSeries
         */

    }, {
        key: "hourlyRollup",
        value: function hourlyRollup(options) {
            var aggregation = options.aggregation,
                _options$toTimeEvents2 = options.toTimeEvents,
                toTimeEvents = _options$toTimeEvents2 === undefined ? false : _options$toTimeEvents2;


            if (!aggregation || !_underscore2.default.isObject(aggregation)) {
                throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
            }

            return this.fixedWindowRollup("1h", aggregation, toTimeEvents);
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
         *
         * @param                options                An object containing options:
         * @param {bool}         options.toTimeEvents   Convert the rollup events to `TimeEvent`s, otherwise it
         *                                              will be returned as a `TimeSeries` of `IndexedEvent`s.
         * @param {object}       options.aggregation    The aggregation specification (see description above)
         *
         * @return {TimeSeries}     The resulting rolled up TimeSeries
         */

    }, {
        key: "dailyRollup",
        value: function dailyRollup(options) {
            var aggregation = options.aggregation,
                _options$toTimeEvents3 = options.toTimeEvents,
                toTimeEvents = _options$toTimeEvents3 === undefined ? false : _options$toTimeEvents3;


            if (!aggregation || !_underscore2.default.isObject(aggregation)) {
                throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
            }

            return this._rollup("daily", aggregation, toTimeEvents);
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
         *
         * @param                options                An object containing options:
         * @param {bool}         options.toTimeEvents   Convert the rollup events to `TimeEvent`s, otherwise it
         *                                              will be returned as a `TimeSeries` of `IndexedEvent`s.
         * @param {object}       options.aggregation    The aggregation specification (see description above)
         *
         * @return {TimeSeries}                         The resulting rolled up `TimeSeries`
         */

    }, {
        key: "monthlyRollup",
        value: function monthlyRollup(options) {
            var aggregation = options.aggregation,
                _options$toTimeEvents4 = options.toTimeEvents,
                toTimeEvents = _options$toTimeEvents4 === undefined ? false : _options$toTimeEvents4;


            if (!aggregation || !_underscore2.default.isObject(aggregation)) {
                throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
            }

            return this._rollup("monthly", aggregation, toTimeEvents);
        }

        /**
         * Builds a new TimeSeries by dividing events into years.
         *
         * Each window then has an aggregation specification `aggregation`
         * applied. This specification describes a mapping of output
         * fieldNames to aggregation functions and their fieldPath. For example:
         *
         * ```
         * {in_avg: {in: avg()}, out_avg: {out: avg()}}
         * ```
         *
         * @param                options                An object containing options:
         * @param {bool}         options.toTimeEvents   Convert the rollup events to `TimeEvent`s, otherwise it
         *                                              will be returned as a `TimeSeries` of `IndexedEvent`s.
         * @param {object}       options.aggregation    The aggregation specification (see description above)
         *
         * @return {TimeSeries}                         The resulting rolled up `TimeSeries`
         */

    }, {
        key: "yearlyRollup",
        value: function yearlyRollup(options) {
            var aggregation = options.aggregation,
                _options$toTimeEvents5 = options.toTimeEvents,
                toTimeEvents = _options$toTimeEvents5 === undefined ? false : _options$toTimeEvents5;


            if (!aggregation || !_underscore2.default.isObject(aggregation)) {
                throw new Error("aggregation object must be supplied, for example: {value: {value: avg()}}");
            }

            return this._rollup("yearly", aggregation, toTimeEvents);
        }

        /**
         * @private
         *
         * Internal function to build the TimeSeries rollup functions using
         * an aggregator Pipeline.
         */

    }, {
        key: "_rollup",
        value: function _rollup(type, aggregation) {
            var toTimeEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var aggregatorPipeline = this.pipeline().windowBy(type).emitOn("discard").aggregate(aggregation);

            var eventTypePipeline = toTimeEvents ? aggregatorPipeline.asTimeEvents() : aggregatorPipeline;

            var collections = eventTypePipeline.clearWindow().toKeyedCollections();

            return this.setCollection(collections["all"], true);
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
         * @param                options                An object containing options:
         * @param {bool}         options.windowSize     The size of the window. e.g. "6h" or "5m"
         *
         * @return {map}    The result is a mapping from window index to a Collection.
         */

    }, {
        key: "collectByFixedWindow",
        value: function collectByFixedWindow(_ref) {
            var windowSize = _ref.windowSize;

            return this.pipeline().windowBy(windowSize).emitOn("discard").toKeyedCollections();
        }

        /*
         * STATIC
         */
        /**
         * Defines the event type contained in this TimeSeries. The default here
         * is to use the supplied type (time, timerange or index) to build either
         * a TimeEvent, TimeRangeEvent or IndexedEvent. However, you can also
         * subclass the TimeSeries and reimplement this to return another event
         * type.
         */

    }], [{
        key: "event",
        value: function event(eventKey) {
            switch (eventKey) {
                case "time":
                    return _timeevent2.default;
                case "timerange":
                    return _timerangeevent2.default;
                case "index":
                    return _indexedevent2.default;
                default:
                    throw new Error("Unknown event type: " + eventKey);
            }
        }

        /**
         * Static function to compare two TimeSeries to each other. If the TimeSeries
         * are of the same instance as each other then equals will return true.
         * @param  {TimeSeries} series1
         * @param  {TimeSeries} series2
         * @return {bool} result
         */

    }, {
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
         * using the reducer function to produce a new event. The reducer function is
         * applied to all columns in the fieldSpec. Those new events are then
         * collected together to form a new TimeSeries.
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
         *
         * @param                  options                An object containing options. Additional key
         *                                                values in the options will be added as meta data
         *                                                to the resulting TimeSeries.
         * @param {array}          options.seriesList     A list of `TimeSeries` (required)
         * @param {function}       options.reducer        The reducer function e.g. `max()` (required)
         * @param {array | string} options.fieldSpec      Column or columns to reduce. If you
         *                                                need to retrieve multiple deep
         *                                                nested values that ['can.be', 'done.with',
         *                                                'this.notation']. A single deep value with a
         *                                                string.like.this.
         *
         * @return {TimeSeries}                           The reduced TimeSeries
         */

    }, {
        key: "timeSeriesListReduce",
        value: function timeSeriesListReduce(options) {
            var fieldSpec = options.fieldSpec,
                reducer = options.reducer,
                data = (0, _objectWithoutProperties3.default)(options, ["fieldSpec", "reducer"]);

            var combiner = _event2.default.combiner(fieldSpec, reducer);
            return TimeSeries.timeSeriesListEventReduce((0, _extends3.default)({
                fieldSpec: fieldSpec,
                reducer: combiner
            }, data));
        }

        /**
         * Takes a list of TimeSeries and merges them together to form a new
         * Timeseries.
         *
         * Merging will produce a new Event;
        only when events are conflict free, so
         * it is useful in the following cases:
         *  * to combine multiple TimeSeries which have different time ranges, essentially
         *  concatenating them together
         *  * combine TimeSeries which have different columns, for example inTraffic has
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
         *
         * @param                  options                An object containing options. Additional key
         *                                                values in the options will be added as meta data
         *                                                to the resulting TimeSeries.
         * @param {array}          options.seriesList     A list of `TimeSeries` (required)
         * @param {array | string} options.fieldSpec      Column or columns to merge. If you
         *                                                need to retrieve multiple deep
         *                                                nested values that ['can.be', 'done.with',
         *                                                'this.notation']. A single deep value with a
         *                                                string.like.this.
         *
         * @return {TimeSeries}                           The merged TimeSeries
         */

    }, {
        key: "timeSeriesListMerge",
        value: function timeSeriesListMerge(options) {
            var fieldSpec = options.fieldSpec,
                data = (0, _objectWithoutProperties3.default)(options, ["fieldSpec"]);

            var merger = _event2.default.merger(fieldSpec);
            return TimeSeries.timeSeriesListEventReduce((0, _extends3.default)({
                fieldSpec: fieldSpec,
                reducer: merger
            }, data));
        }

        /**
         * @private
         */

    }, {
        key: "timeSeriesListEventReduce",
        value: function timeSeriesListEventReduce(options) {
            var seriesList = options.seriesList,
                fieldSpec = options.fieldSpec,
                reducer = options.reducer,
                data = (0, _objectWithoutProperties3.default)(options, ["seriesList", "fieldSpec", "reducer"]);


            if (!seriesList || !_underscore2.default.isArray(seriesList)) {
                throw new Error("A list of TimeSeries must be supplied to reduce");
            }

            if (!reducer || !_underscore2.default.isFunction(reducer)) {
                throw new Error("reducer function must be supplied, for example avg()");
            }

            // for each series, make a map from timestamp to the
            // list of events with that timestamp
            var eventList = [];
            seriesList.forEach(function (series) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = (0, _getIterator3.default)(series.events()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var event = _step3.value;

                        eventList.push(event);
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

            var events = reducer(eventList, fieldSpec);

            // Make a collection. If the events are out of order, sort them.
            // It's always possible that events are out of order here, depending
            // on the start times of the series, along with it the series
            // have missing data, so I think we don't have a choice here.
            var collection = new _collection2.default(events);
            if (!collection.isChronological()) {
                collection = collection.sortByTime();
            }

            var timeseries = new TimeSeries((0, _extends3.default)({}, data, { collection: collection }));

            return timeseries;
        }
    }]);
    return TimeSeries;
}();

exports.default = TimeSeries;