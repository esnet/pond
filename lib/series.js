/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _get2 = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _objectWithoutProperties = require("babel-runtime/helpers/object-without-properties")["default"];

var _toArray = require("babel-runtime/helpers/to-array")["default"];

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _event2 = require("./event");

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

/**
 * Base class for a series of events.
 *
 * A series is compact representation for a list of events, with some additional
 * meta data on top of that.
 *
 */

var Series = (function () {

    /**
     * A Series is constructed by either:
     *
     *  1) passing in another series (copy constructor)
     *  2) passing in three arguments:
     *      name - the name of the series
     *      columns - an array containing the title of each data column
     *      data - an array containing the data of each column
     *             Note: data may be either:
     *               a) An Immutable.List of Immutable.Map data objects
     *               b) An array of objects
     *
     * Internally a Series is List of Maps. Each item in the list is one data
     * map, and is stored as an Immutable Map, where the keys are the column
     * names and the value is the data for that column at that index.
     *
     * This enables efficient extraction of Events, since the internal data
     * of the Event can be simply a reference to the Immutable Map in this
     * Series, combined with the time, Timerange or Index.
     */

    function Series(arg1, arg2, arg3, arg4) {
        var _this = this;

        _classCallCheck(this, Series);

        // Series(Series other) - copy
        if (arg1 instanceof Series) {
            var other = arg1;
            this._name = other._name;
            this._meta = other._meta;
            this._columns = other._columns;
            this._series = other._series;

            // Series(string name, object meta, list columns, list | ImmutableList
            // points)
        } else if (_underscore2["default"].isString(arg1) || _underscore2["default"].isUndefined(arg1) && _underscore2["default"].isObject(arg2) || _underscore2["default"].isUndefined(arg2) && _underscore2["default"].isArray(arg3) && (_underscore2["default"].isArray(arg4) || _immutable2["default"].List.isList(arg4))) {
                (function () {

                    //
                    // Object constructor
                    //

                    var name = arg1;
                    var meta = arg2;
                    var columns = arg3;
                    var data = arg4;

                    _this._name = name ? name : "";
                    _this._meta = meta ? _immutable2["default"].fromJS(meta) : new _immutable2["default"].Map();
                    _this._columns = _immutable2["default"].fromJS(columns);

                    if (_immutable2["default"].List.isList(data)) {
                        _this._series = data;
                    } else {
                        _this._series = _immutable2["default"].fromJS(_underscore2["default"].map(data, function (d) {
                            var pointMap = {};
                            _underscore2["default"].each(d, function (p, i) {
                                pointMap[columns[i]] = p;
                            });
                            return pointMap;
                        }));
                    }
                })();
            }
    }

    /** Internal function to find the unique keys of a bunch
      * of immutable maps objects. There's probably a more elegent way
      * to do this.
      */

    //
    // Serialize
    //

    /**
     * Returns a JSON representation, the same format as accepted by the
     * constructor.
     * @return {Object} JSON representation
     */

    _createClass(Series, [{
        key: "toJSON",
        value: function toJSON() {
            var cols = this._columns;
            var series = this._series;
            return {
                name: this._name,
                columns: cols.toJSON(),
                points: series.map(function (value) {
                    return cols.map(function (column) {
                        return value.get(column);
                    });
                })
            };
        }

        /**
         * Return a string representation of the Series.
         * @return {string} The Series, as a string.
         */
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }

        //
        // Access meta data about the series
        //

        /**
         * Returns the same of the series
         * @return {string} The name
         */
    }, {
        key: "name",
        value: function name() {
            return this._name;
        }

        /**
         * Return the list of columns
         * @return {string[]} The columns
         */
    }, {
        key: "columns",
        value: function columns() {
            return this._columns.toJSON();
        }

        /**
         * Return the meta data associated with the Series. To use, supply
         * the key and the get back the value matching that key.
         */
    }, {
        key: "meta",
        value: function meta(key) {
            if (!key) {
                return this._meta.toJSON();
            } else {
                return this._meta.get(key);
            }
        }

        //
        // Access the series itself
        //

        /**
         * Returns the number of rows in the series.
         * @return {number} Size of the series
         */
    }, {
        key: "size",
        value: function size() {
            return this._series.size;
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

        /**
         * Returns the number of rows in the series.
         * @return {number} Size of the series
         */
    }, {
        key: "at",
        value: function at(i) {
            return this._series.get(i);
        }
    }, {
        key: "_get",
        value: function _get(data, column, func) {
            var c = column || "value";
            if (_underscore2["default"].isFunction(func)) {
                return func(data.get(c).toJSON());
            } else {
                return data.get(c);
            }
        }

        //
        // Aggregate the series
        //

    }, {
        key: "sum",
        value: function sum(column, func) {
            var _this2 = this;

            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            return this._series.reduce(function (memo, d) {
                return _this2._get(d, c, func) + memo;
            }, 0);
        }
    }, {
        key: "avg",
        value: function avg(column, func) {
            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            return this.sum(c, func) / this.size();
        }
    }, {
        key: "max",
        value: function max(column, func) {
            var _this3 = this;

            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            var max = this._series.maxBy(function (d) {
                return _this3._get(d, c, func);
            });
            return this._get(max, c, func);
        }
    }, {
        key: "min",
        value: function min(column, func) {
            var _this4 = this;

            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            var min = this._series.minBy(function (d) {
                return _this4._get(d, c, func);
            });
            return this._get(min, c, func);
        }
    }, {
        key: "mean",
        value: function mean(column, func) {
            return this.avg(column, func);
        }
    }, {
        key: "median",
        value: function median(column, func) {
            var _this5 = this;

            var c = column || "value";
            if (!this._columns.contains(c) || this.size() === 0) {
                return undefined;
            }
            var sorted = this._series.sortBy(function (d) {
                return _this5._get(d, c, func);
            });
            var i = Math.floor(sorted.size / 2);
            if (sorted.size % 2 === 0) {
                var a = this._get(sorted.get(i), c, func);
                var b = this._get(sorted.get(i - 1), c, func);
                return (a + b) / 2;
            } else {
                return this._get(sorted.get(i), c, func);
            }
        }
    }, {
        key: "stdev",
        value: function stdev(column, func) {
            var _this6 = this;

            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }

            var mean = this.mean(c, func);
            return Math.sqrt(this._series.reduce(function (memo, d) {
                return Math.pow(_this6._get(d, c, func) - mean, 2) + memo;
            }, 0) / this.size());
        }
    }], [{
        key: "equal",
        value: function equal(series1, series2) {
            return series1._name === series2._name && series1._meta === series2._meta && series1._columns === series2._columns && series1._series === series2._series;
        }
    }, {
        key: "is",
        value: function is(series1, series2) {
            return series1._name === series2._name && _immutable2["default"].is(series1._meta, series2._meta) && _immutable2["default"].is(series1._columns, series2._columns) && _immutable2["default"].is(series1._series, series2._series);
        }
    }]);

    return Series;
})();

exports.Series = Series;
function uniqueKeys(events) {
    var arrayOfKeys = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _getIterator(events), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _getIterator(e.data().keySeq()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var k = _step2.value;

                    arrayOfKeys.push(k);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return new _immutable2["default"].Set(arrayOfKeys);
}

/**
 * Functions used to determine slice indexes. Copied from immutable.js.
 */
function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
}

function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
    return index === undefined ? defaultIndex : index < 0 ? Math.max(0, size + index) : size === undefined ? index : Math.min(size, index);
}

/**
 * A TimeSeries is a a Series where each event is an association of a timestamp
 * and some associated data.
 *
 * Data passed into it may have the following format, which corresponds to
 * InfluxDB's wire format:
 *
 *   {
 *     "name": "traffic",
 *     "columns": ["time", "value", ...],
 *     "points": [
 *        [1400425947000, 52, ...],
 *        [1400425948000, 18, ...],
 *        [1400425949000, 26, ...],
 *        [1400425950000, 93, ...],
 *        ...
 *      ]
 *   }
 *
 * Alternatively, the TimeSeries may be constructed from a list of Events.
 *
 * Internaly the above series is represented as two lists, one of times and
 * one of data associated with those times. The position in the list links them
 * together. For each position, therefore, you have a time and an event:
 *
 * 'time'  -->  Event
 *
 * The time may be of several forms:
 *
 *   - a time
 *   - an index (which represents a timerange)
 *   - a timerange
 *
 * The event itself is stored is an Immutable Map. Requesting a particular
 * position in the list will return an Event that will in fact internally
 * reference the Immutable Map within the series, making it efficient to get
 * back items within the TimeSeries.
 *
 * You can fetch the full item at index n using get(n).
 *
 * The timerange associated with a TimeSeries is simply the bounds of the
 * events within it (i.e. the min and max times).
 */

var TimeSeries = (function (_Series) {
    _inherits(TimeSeries, _Series);

    function TimeSeries(arg1) {
        var _this7 = this;

        _classCallCheck(this, TimeSeries);

        // TimeSeries(TimeSeries other)
        if (arg1 instanceof TimeSeries) {
            _get2(Object.getPrototypeOf(TimeSeries.prototype), "constructor", this).call(this);

            //
            // Copy constructor
            //

            // Construct the base series
            var other = arg1;

            this._name = other._name;
            this._meta = other._meta;
            this._utc = other._utc;
            this._index = other._index;
            this._columns = other._columns;
            this._series = other._series;
            this._times = other._times;

            // TimeSeries(object data) where data may be
            //    {"events": Event list} or
            //    {"columns": string list, "points": value list}
        } else if (_underscore2["default"].isObject(arg1)) {
                (function () {

                    //
                    // Object constructor
                    //
                    // There are two forms of Timeseries construction:
                    //   - As a list of Events
                    //   - As a list of points and columns
                    //
                    // See below.
                    //

                    var obj = arg1;

                    var times = [];
                    var data = [];

                    if (_underscore2["default"].has(obj, "events")) {

                        //
                        // If events is passed in, then we construct the series out of
                        // a list of Event objects
                        //

                        var events = obj.events;
                        var utc = obj.utc;
                        var index = obj.index;
                        var _name = obj.name;
                        var meta = obj.meta;

                        var columns = uniqueKeys(events).toJSON();
                        _underscore2["default"].each(events, function (event) {
                            if (event instanceof _event2.IndexedEvent) {
                                times.push(event.indexAsString());
                            } else if (event instanceof _event2.Event) {
                                times.push(event.timestamp());
                            } else {
                                throw new Error("TimeSeries: Unsupported event type");
                            }
                            data.push(event.data());
                        });

                        // Optional index associated with this TimeSeries
                        if (index) {
                            if (_underscore2["default"].isString(index)) {
                                _this7._index = new _index2["default"](index);
                            } else if (index instanceof _index2["default"]) {
                                _this7._index = index;
                            }
                        }

                        _this7._utc = true;
                        if (_underscore2["default"].isBoolean(utc)) {
                            _this7._utc = utc;
                        }

                        // Construct the base series
                        _get2(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this7).call(_this7, _name, meta, columns, new _immutable2["default"].List(data));

                        // List of times, as Immutable List
                        _this7._times = new _immutable2["default"].List(times);
                    } else if (_underscore2["default"].has(obj, "columns") && _underscore2["default"].has(obj, "points")) {
                        var _name2 = obj.name;
                        var index = obj.index;
                        var utc = obj.utc;
                        var points = obj.points;
                        var columns = obj.columns;

                        var metaData = _objectWithoutProperties(obj, ["name", "index", "utc", "points", "columns"]);

                        //eslint-disable-line
                        var seriesPoints = points || [];
                        var seriesName = _name2 || "";
                        var seriesMeta = metaData || {};
                        var seriesColumns = columns.slice(1) || [];
                        var seriesUTC = _underscore2["default"].isBoolean(utc) ? utc : true;

                        //
                        // If columns and points are passed in, then we construct the
                        // series out of those, assuming the format of each point is:
                        //
                        //   [time, col1, col2, col3]
                        //
                        // TODO: check to see if the first item is the time

                        _underscore2["default"].each(seriesPoints, function (point) {
                            var _point = _toArray(point);

                            var time = _point[0];

                            var others = _point.slice(1);

                            var t = undefined;
                            if (_underscore2["default"].isNumber(time)) {
                                t = new Date(time); // times are stored as Date objects
                            } else {
                                    t = time;
                                }
                            times.push(t);
                            data.push(others);
                        });

                        _get2(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this7).call(_this7, seriesName, seriesMeta, seriesColumns, data);

                        // Optional index associated with this TimeSeries
                        if (index) {
                            if (_underscore2["default"].isString(index)) {
                                _this7._index = new _index2["default"](index);
                            } else if (index instanceof _index2["default"]) {
                                _this7._index = index;
                            }
                        }

                        // Is this data in UTC or local?
                        _this7._utc = seriesUTC;

                        // List of times, as Immutable List
                        _this7._times = _immutable2["default"].fromJS(times);
                    }
                })();
            }
    }

    //
    // Serialize
    //

    /**
     * Turn the TimeSeries into regular javascript objects
     */

    _createClass(TimeSeries, [{
        key: "toJSON",
        value: function toJSON() {
            var name = this._name;
            var index = this._index;
            var cols = this._columns;
            var series = this._series;
            var times = this._times;

            var points = series.map(function (value, i) {
                var t = times.get(i);
                var data = _underscore2["default"].isDate(t) ? [t.getTime()] : [t];
                cols.forEach(function (column) {
                    data.push(value.get(column));
                });
                return data;
            }).toJSON();

            // The JSON output has 'time' as the first column
            var columns = ["time"];
            cols.forEach(function (column) {
                columns.push(column);
            });

            var result = {
                name: name
            };

            if (index) {
                result.index = index.toString();
            }

            result = _underscore2["default"].extend(result, {
                columns: columns,
                points: points
            });

            result = _underscore2["default"].extend(result, this._meta.toJSON());

            return result;
        }

        /**
         * Represent the TimeSeries as a string
         */
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }

        //
        // Series range
        //

        /**
         * From the range of times, or Indexes within the TimeSeries, return
         * the extents of the TimeSeries as a TimeRange.
         * @return {TimeRange} The extents of the TimeSeries
         */
    }, {
        key: "range",
        value: function range() {
            var _this8 = this;

            var min = undefined;
            var max = undefined;
            this._times.forEach(function (time) {
                if (_underscore2["default"].isString(time)) {
                    var r = _util2["default"].rangeFromIndexString(time, _this8.isUTC());
                    if (!min || r.begin() < min) {
                        min = r.begin();
                    }
                    if (!max || r.end() > max) {
                        max = r.end();
                    }
                } else if (_underscore2["default"].isDate(time)) {
                    if (!min || time.getTime() < min) {
                        min = time.getTime();
                    }
                    if (!max || time.getTime() > max) {
                        max = time.getTime();
                    }
                }
            });
            return new _range2["default"](min, max);
        }

        /**
         * From the range of times, or Indexes within the TimeSeries, return
         * the extents of the TimeSeries as a TimeRange.
         * @return {TimeRange} The extents of the TimeSeries
         */
    }, {
        key: "timerange",
        value: function timerange() {
            return this.range();
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
         * Access the Index, if this TimeSeries has one
         */

    }, {
        key: "index",
        value: function index() {
            return this._index;
        }
    }, {
        key: "indexAsString",
        value: function indexAsString() {
            return this._index ? this._index.asString() : undefined;
        }
    }, {
        key: "indexAsRange",
        value: function indexAsRange() {
            return this._index ? this._index.asTimerange() : undefined;
        }

        /**
         * Is the data in UTC or Local?
         */
    }, {
        key: "isUTC",
        value: function isUTC() {
            return this._utc;
        }

        /**
         * Access the series data via index. The result is an Event.
         */
    }, {
        key: "at",
        value: function at(i) {
            var time = this._times.get(i);
            if (_underscore2["default"].isString(time)) {
                var index = time;
                return new _event2.IndexedEvent(index, this._series.get(i), this._utc);
            } else {
                return new _event2.Event(time, this._series.get(i));
            }
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
         * TimeSeries representing a portion of this TimeSeries from begin up to
         * but not including end.
         */
    }, {
        key: "slice",
        value: function slice(begin, end) {
            var size = this.size();
            var b = resolveBegin(begin, size);
            var e = resolveEnd(end, size);

            if (b === 0 && e === size) {
                return this;
            }

            var events = [];
            for (var i = b; i < e; i++) {
                events.push(this.at(i));
            }

            return new TimeSeries({ name: this._name,
                index: this._index,
                utc: this._utc,
                meta: this._meta,
                events: events });
        }

        /**
         *  Generator to allow for..of loops over series.events()
         */
    }, {
        key: "events",
        value: _regeneratorRuntime.mark(function events() {
            var i;
            return _regeneratorRuntime.wrap(function events$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        i = 0;

                    case 1:
                        if (!(i < this.size())) {
                            context$2$0.next = 7;
                            break;
                        }

                        context$2$0.next = 4;
                        return this.at(i);

                    case 4:
                        i++;
                        context$2$0.next = 1;
                        break;

                    case 7:
                    case "end":
                        return context$2$0.stop();
                }
            }, events, this);
        })
    }], [{
        key: "equal",
        value: function equal(series1, series2) {
            return series1._name === series2._name && series1._meta === series2._meta && series1._utc === series2._utc && series1._columns === series2._columns && series1._series === series2._series && series1._times === series2._times;
        }
    }, {
        key: "is",
        value: function is(series1, series2) {
            return series1._name === series2._name && series1._utc === series2._utc && _immutable2["default"].is(series1._meta, series2._meta) && _immutable2["default"].is(series1._columns, series2._columns) && _immutable2["default"].is(series1._series, series2._series) && _immutable2["default"].is(series1._times, series2._times);
        }
    }, {
        key: "map",
        value: function map(options, seriesList, mapper) {
            // for each series, map events to the same timestamp/index
            var eventMap = {};
            _underscore2["default"].each(seriesList, function (series) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = _getIterator(series.events()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _event = _step3.value;

                        var key = undefined;
                        if (_event instanceof _event2.Event) {
                            key = _event.timestamp();
                        } else if (_event instanceof _event2.IndexedEvent) {
                            key = _event.index();
                        } else if (_event instanceof _event2.TimeRangeEvent) {
                            key = _event.timerange().toUTCString();
                        }

                        if (!_underscore2["default"].has(eventMap, key)) {
                            eventMap[key] = [];
                        }

                        eventMap[key].push(_event);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                            _iterator3["return"]();
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
            _underscore2["default"].each(eventMap, function (eventsList) {
                var event = mapper(eventsList);
                events.push(event);
            });

            var name = options.name;
            var index = options.index;

            var metaData = _objectWithoutProperties(options, ["name", "index"]);

            //eslint-disable-line
            return new TimeSeries({
                name: name,
                index: index,
                utc: this._utc,
                meta: metaData,
                events: events
            });
        }
    }, {
        key: "merge",
        value: function merge(options, seriesList) {
            return TimeSeries.map(options, seriesList, _event2.Event.merge);
        }
    }]);

    return TimeSeries;
})(Series);

exports.TimeSeries = TimeSeries;