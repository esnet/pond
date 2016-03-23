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

var _extends = require("babel-runtime/helpers/extends")["default"];

var _objectWithoutProperties = require("babel-runtime/helpers/object-without-properties")["default"];

var _toArray = require("babel-runtime/helpers/to-array")["default"];

var _toConsumableArray = require("babel-runtime/helpers/to-consumable-array")["default"];

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

var _collection = require("./collection");

var _collection2 = _interopRequireDefault(_collection);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _event2 = require("./event");

var _pipelineJs = require("./pipeline.js");

function buildMetaData(meta) {
    var d = meta ? meta : {};

    // Name
    d.name = meta.name ? meta.name : "";

    // Index
    if (meta.index) {
        if (_underscore2["default"].isString(meta.index)) {
            d.index = new _index2["default"](meta.index);
        } else if (meta.index instanceof _index2["default"]) {
            d.index = meta.index;
        }
    }

    // UTC or Local time
    d.utc = true;
    if (_underscore2["default"].isBoolean(meta.utc)) {
        d.utc = meta.utc;
    }

    return new _immutable2["default"].Map(d);
}

/**
 * A TimeSeries is a a Series where each event is an association of a timestamp
 * and some associated data.
 *
 * Data passed into it may have the following format, which is our wire format:
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
 * Alternatively, the TimeSeries may be constructed from a list of Event objects.
 *
 * Internaly the above series is represented as two parts:
 *  * Collection - an Immutable.List of Events and associated methods
 *                   to query and manipulate that list
 *  * Meta data  - an Immutable.Map of extra data associated with the
 *                   TimeSeries
 *
 * The events stored in the collection may be Events (timestamp based),
 * TimeRangeEvents (time range based) or IndexedEvents (an alternative form
 * of a time range, such as "2014-08" or "1d-1234")
 *
 * The timerange associated with a TimeSeries is simply the bounds of the
 * events within it (i.e. the min and max times).
 */

var TimeSeries = (function () {
    function TimeSeries(arg) {
        var _this = this;

        _classCallCheck(this, TimeSeries);

        this._collection = null; // Collection
        this._data = null; // Meta data

        if (arg instanceof TimeSeries) {

            //
            // Copy another TimeSeries
            //

            var other = arg;
            this._data = other._data;
            this._collection = other._collection;
        } else if (_underscore2["default"].isObject(arg)) {

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

            if (_underscore2["default"].has(obj, "events")) {

                //
                // Initialized from an event list
                //

                var events = obj.events;

                var meta1 = _objectWithoutProperties(obj, ["events"]);

                //eslint-disable-line

                this._collection = new _collection2["default"](events);
                this._data = buildMetaData(meta1);
            } else if (_underscore2["default"].has(obj, "collection")) {
                var collection = obj.collection;

                var meta3 = _objectWithoutProperties(obj, ["collection"]);

                //eslint-disable-line
                this._collection = collection;
                this._data = buildMetaData(meta3);
            } else if (_underscore2["default"].has(obj, "columns") && _underscore2["default"].has(obj, "points")) {
                (function () {

                    //
                    // Initialized from the wire format
                    //

                    var columns = obj.columns;
                    var points = obj.points;

                    var meta2 = _objectWithoutProperties(obj, ["columns", "points"]);

                    //eslint-disable-line

                    var _columns = _toArray(columns);

                    var eventType = _columns[0];

                    var eventFields = _columns.slice(1);

                    var events = points.map(function (point) {
                        var _point = _toArray(point);

                        var t = _point[0];

                        var eventValues = _point.slice(1);

                        var d = _underscore2["default"].object(eventFields, eventValues);
                        switch (eventType) {
                            case "time":
                                return new _event2.Event(t, d);
                            case "timerange":
                                return new _event2.TimeRangeEvent(t, d);
                            case "index":
                                return new _event2.IndexedEvent(t, d);
                            default:
                                throw new Error("Unknown event type: " + eventType);
                        }
                    });

                    _this._collection = new _collection2["default"](events);
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

    _createClass(TimeSeries, [{
        key: "toJSON",
        value: function toJSON() {
            var columns = undefined;
            var type = this._collection.type();
            if (type === _event2.Event) {
                columns = ["time"].concat(_toConsumableArray(this.columns()));
            } else if (type === _event2.TimeRangeEvent) {
                columns = ["timerange"].concat(_toConsumableArray(this.columns()));
            } else if (type === _event2.IndexedEvent) {
                columns = ["index"].concat(_toConsumableArray(this.columns()));
            }

            var points = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _getIterator(this._collection.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    points.push(e.toPoint());
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

            return _underscore2["default"].extend(this._data.toJSON(), {
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
            return JSON.stringify(this.toJSON());
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
            var result = new TimeSeries(this);
            result._collection = sliced;
            return result;
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
                for (var _iterator2 = _getIterator(this._collection.events()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var e = _step2.value;

                    var d = e.toJSON().data;
                    _underscore2["default"].each(d, function (val, key) {
                        c[key] = true;
                    });
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

            return _underscore2["default"].keys(c);
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
        key: "pipeline",
        value: function pipeline() {
            return new _pipelineJs.Pipeline().from(this._collection);
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
            return series1._name === series2._name && series1._utc === series2._utc && _immutable2["default"].is(series1._meta, series2._meta) && _immutable2["default"].is(series1._columns, series2._columns) && _immutable2["default"].is(series1._data, series2._data) && _immutable2["default"].is(series1._times, series2._times);
        }
    }, {
        key: "map",
        value: function map(data, seriesList, mapper) {
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

            return new TimeSeries(_extends({}, data, { events: events }));
        }
    }, {
        key: "merge",
        value: function merge(data, seriesList) {
            return TimeSeries.map(data, seriesList, _event2.Event.merge);
        }
    }]);

    return TimeSeries;
})();

exports["default"] = TimeSeries;
module.exports = exports["default"];