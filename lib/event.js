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

var _toConsumableArray = require("babel-runtime/helpers/to-consumable-array")["default"];

var _slicedToArray = require("babel-runtime/helpers/sliced-to-array")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _functions = require("./functions");

function timestampFromArg(arg) {
    if (_underscore2["default"].isNumber(arg)) {
        return new Date(arg);
    } else if (_underscore2["default"].isDate(arg)) {
        return new Date(arg.getTime());
    } else if (_moment2["default"].isMoment(arg)) {
        return new Date(arg.valueOf());
    } else {
        throw new Error("Unable to get timestamp from " + arg + ". Should be a number, date, or moment.");
    }
}

function timeRangeFromArg(arg) {
    if (arg instanceof _range2["default"]) {
        return arg;
    } else if (_underscore2["default"].isArray(arg) && arg.length === 2) {
        return new _range2["default"](arg);
    } else {
        throw new Error("Unable to parse timerange. Should be a TimeRange. Got " + arg + ".");
    }
}

function indexFromArgs(arg1, arg2) {
    if (_underscore2["default"].isString(arg1)) {
        return new _index2["default"](arg1, arg2 || true);
    } else if (arg1 instanceof _index2["default"]) {
        return arg1;
    } else {
        throw new Error("Unable to get index from " + arg1 + ". Should be a string or Index.");
    }
}

function dataFromArg(arg) {
    var data = undefined;
    if (_underscore2["default"].isObject(arg)) {
        // Deeply convert the data to Immutable Map
        data = new _immutable2["default"].fromJS(arg);
    } else if (data instanceof _immutable2["default"].Map) {
        // Copy reference to the data
        data = arg;
    } else if (_underscore2["default"].isNumber(arg) || _underscore2["default"].isString(arg)) {
        // Just add it to the value key of a new Map
        // e.g. new Event(t, 25); -> t, {value: 25}
        data = new _immutable2["default"].Map({ value: arg });
    } else {
        throw new Error("Unable to interpret event data from " + arg + ".");
    }
    return data;
}

/**
 * A generic event
 *
 * This represents a data object at a single timestamp, supplied
 * at initialization.
 *
 * The timestamp may be a javascript Date object or a Moment, but is
 * stored internally as ms since UNIX epoch.
 *
 * The data may be any type.
 *
 * Asking the Event object for the timestamp returns an integer copy
 * of the number of ms since the UNIX epoch.
 */

var Event = (function () {

    /**
     * The creation of an Event is done by combining two parts:
     * the timestamp and the data.
     *
     * To construct you specify the timestamp as either:
     *     - Javascript Date object
     *     - a Moment, or
     *     - millisecond timestamp: the number of ms since the UNIX epoch
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */

    function Event(arg1, arg2) {
        _classCallCheck(this, Event);

        if (arg1 instanceof Event) {
            var other = arg1;
            this._d = other._d;
            return;
        }
        if (arg1 instanceof _immutable2["default"].Map && arg1.has("time") && arg1.has("data")) {
            this._d = arg1;
            return;
        }
        var time = timestampFromArg(arg1);
        var data = dataFromArg(arg2);
        this._d = new _immutable2["default"].Map({ time: time, data: data });
    }

    /**
     * A TimeRangeEvent uses a TimeRange to specify the range over
     * which the event occurs and maps that to a data object representing
     * some measurements or metrics during that time range.
     *
     * You supply the timerange as a TimeRange object.
     *
     * The data is also specified during construction and me be either:
     *  1) a Javascript object or simple type
     *  2) an Immutable.Map.
     *  3) Simple measurement
     *
     * If an Javascript object is provided it will be stored internally as an
     * Immutable Map. If the data provided is some other simple type (such as an
     * integer) then it will be equivalent to supplying an object of {value: data}.
     * Data may also be undefined.
     *
     * To get the data out of an TimeRangeEvent instance use `data()`.
     * It will return an Immutable.Map. Alternatively you can call `toJSON()`
     * to return a Javascript object representation of the data, while
     * `toString()` will serialize the entire event to a string.
     */

    /**
     * Returns the Event as a JSON object, essentially:
     *  {time: t, data: {key: value, ...}}
     * @return {Object} The event as JSON.
     */

    _createClass(Event, [{
        key: "toJSON",
        value: function toJSON() {
            return {
                time: this.timestamp().getTime(),
                data: this.data().toJSON()
            };
        }

        /**
         * Retruns the Event as a string, useful for serialization.
         * @return {string} The Event as a string
         */
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }

        /**
         * Returns a flat array starting with the timestamp, followed by the values.
         */
    }, {
        key: "toPoint",
        value: function toPoint() {
            return [this.timestamp().getTime()].concat(_toConsumableArray(_underscore2["default"].values(this.data().toJSON())));
        }

        /**
         * The timestamp of this data, in UTC time, as a string.
         */
    }, {
        key: "timestampAsUTCString",
        value: function timestampAsUTCString() {
            return this.timestamp().toUTCString();
        }

        /**
         * The timestamp of this data, in Local time, as a string.
         */
    }, {
        key: "timestampAsLocalString",
        value: function timestampAsLocalString() {
            return this.timestamp().toString();
        }

        /**
         * The timestamp of this data
         */
    }, {
        key: "timestamp",
        value: function timestamp() {
            return this._d.get("time");
        }

        /**
         * The begin time of this Event, which will be just the timestamp
         */
    }, {
        key: "begin",
        value: function begin() {
            return this.timestamp();
        }

        /**
         * The end time of this Event, which will be just the timestamp
         */
    }, {
        key: "end",
        value: function end() {
            return this.timestamp();
        }

        /**
         * Direct access to the event data. The result will be an Immutable.Map.
         */
    }, {
        key: "data",
        value: function data() {
            return this._d.get("data");
        }

        /**
         * Sets the data portion of the event and returns a new Event.
         */
    }, {
        key: "setData",
        value: function setData(data) {
            var d = this._d.set("data", dataFromArg(data));
            return new Event(d);
        }

        /**
         * Get specific data out of the Event. The data will be converted
         * to a js object. You can use a fieldSpec to address deep data.
         * A fieldSpec could be "a.b"
         */
    }, {
        key: "get",
        value: function get() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var v = undefined;
            if (_underscore2["default"].isString(fieldSpec)) {
                var searchKeyPath = fieldSpec.split(".");
                if (this.data().hasIn(searchKeyPath)) {
                    v = this.data().getIn(searchKeyPath);
                }
            }

            if (v instanceof _immutable2["default"].Map || v instanceof _immutable2["default"].List) {
                return v.toJS();
            }
            return v;
        }

        /**
         * Alias for get()
         */
    }, {
        key: "value",
        value: function value(fieldSpec) {
            return this.get(fieldSpec);
        }
    }, {
        key: "stringify",
        value: function stringify() {
            return JSON.stringify(this.data());
        }

        /*
        fill(type, arg1, arg2) {
            if (type === "NaN") {
                const fixedValue = arg1;
                const fixedKey = arg2;
                const data = this._data.withMutations(d => {
                    this._data.forEach((value, key) => {
                        if (_.isNaN(value) && (!fixedKey || fixedKey === key)) {
                            d.set(key, fixedValue);
                        }
                    });
                });
                this._data = data;
                return this;
            } else {
                const msg = "Invalid fill type";
                throw new Error(msg);
            }
        }
        */

    }], [{
        key: "is",
        value: function is(event1, event2) {
            return _immutable2["default"].is(event1._d, event2._d);
        }

        /**
         * The same as Event.value() only it will return false if the
         * value is either undefined, NaN or Null.
         */
    }, {
        key: "isValidValue",
        value: function isValidValue(event) {
            var fieldSpec = arguments.length <= 1 || arguments[1] === undefined ? "value" : arguments[1];

            var v = event.value(fieldSpec);
            var invalid = _underscore2["default"].isUndefined(v) || _underscore2["default"].isNaN(v) || _underscore2["default"].isNull(v);
            return !invalid;
        }

        /**
         * Function to select specific fields of an event using
         * a fieldSpec and return a new event with just those fields.
         *
         * The fieldSpec currently can be:
         *  * A single field name
         *  * An array of field names
         *
         * The function returns a new event.
         */
    }, {
        key: "selector",
        value: function selector(event, fieldSpec) {
            var data = {};
            if (_underscore2["default"].isString(fieldSpec)) {
                var fieldName = fieldSpec;
                var value = event.get(fieldName);
                data[fieldName] = value;
            } else if (_underscore2["default"].isArray(fieldSpec)) {
                _underscore2["default"].each(fieldSpec, function (fieldName) {
                    var value = event.get(fieldName);
                    data[fieldName] = value;
                });
            } else {
                return event;
            }
            return event.setData(data);
        }
    }, {
        key: "mergeEvents",
        value: function mergeEvents(events) {
            var t = events[0].timestamp();
            var data = {};
            _underscore2["default"].each(events, function (event) {
                if (!event instanceof Event) {
                    var msg = "Events being merged must have the same type";
                    throw new Error(msg);
                }

                if (t.getTime() !== event.timestamp().getTime()) {
                    var msg = "Events being merged must have the same timestamp";
                    throw new Error(msg);
                }

                var d = event.toJSON().data;
                _underscore2["default"].each(d, function (val, key) {
                    if (_underscore2["default"].has(data, key)) {
                        var msg = "Events being merged may not have the same key '" + key + "'";
                        throw new Error(msg);
                    }
                    data[key] = val;
                });
            });

            var e = new Event(t.getTime(), data);
            return e;
        }
    }, {
        key: "mergeTimeRangeEvents",
        value: function mergeTimeRangeEvents(events) {
            var timerange = events[0].timerange();
            var data = {};
            _underscore2["default"].each(events, function (event) {
                if (!event instanceof TimeRangeEvent) {
                    var msg = "Events being merged must have the same type";
                    throw new Error(msg);
                }

                if (timerange.toUTCString() !== event.timerange().toUTCString()) {
                    var msg = "Events being merged must have the same timerange";
                    throw new Error(msg);
                }

                var d = event.toJSON().data;
                _underscore2["default"].each(d, function (val, key) {
                    if (_underscore2["default"].has(data, key)) {
                        var msg = "Events being merged may not have the same key '" + key + "'";
                        throw new Error(msg);
                    }
                    data[key] = val;
                });
            });

            return new TimeRangeEvent(timerange, data);
        }
    }, {
        key: "mergeIndexedEvents",
        value: function mergeIndexedEvents(events) {
            var index = events[0].indexAsString();
            var data = {};
            _underscore2["default"].each(events, function (event) {
                if (!event instanceof IndexedEvent) {
                    throw new Error("Events being merged must have the same type");
                }

                if (index !== event.indexAsString()) {
                    throw new Error("Events being merged must have the same index");
                }

                var d = event.toJSON().data;
                _underscore2["default"].each(d, function (val, key) {
                    if (_underscore2["default"].has(data, key)) {
                        var msg = "Events being merged may not have the same key '" + key + "'";
                        throw new Error(msg);
                    }
                    data[key] = val;
                });
            });
            return new IndexedEvent(index, data);
        }
    }, {
        key: "merge",
        value: function merge(events) {
            if (events.length < 1) {
                return;
            } else if (events.length === 1) {
                return events[0];
            }

            if (events[0] instanceof Event) {
                return Event.mergeEvents(events);
            } else if (events[0] instanceof TimeRangeEvent) {
                return Event.mergeTimeRangeEvents(events);
            } else if (events[0] instanceof IndexedEvent) {
                return Event.mergeIndexedEvents(events);
            }
        }

        /**
         * Combines multiple events with the same time together
         * to form a new event. Doesn't currently work on IndexedEvents
         * or TimeRangeEvents.
         */
    }, {
        key: "combine",
        value: function combine(events, fieldSpec, reducer) {
            if (events.length < 1) {
                return;
            }
            var mapped = Event.map(events, function (event) {
                var mapEvent = {};
                // Which field do we want to work with
                var fieldNames = [];
                if (!fieldSpec) {
                    fieldNames = _underscore2["default"].map(event.data().toJSON(), function (value, fieldName) {
                        return fieldName;
                    });
                } else if (_underscore2["default"].isString(fieldSpec)) {
                    fieldNames = [fieldSpec];
                } else if (_underscore2["default"].isArray(fieldSpec)) {
                    fieldNames = fieldSpec;
                }
                // Map the fields, along with the timestamp, to the value
                _underscore2["default"].each(fieldNames, function (fieldName) {
                    mapEvent[event.timestamp().getTime() + "::" + fieldName] = event.data().get(fieldName);
                });

                return mapEvent;
            });
            var eventData = {};
            _underscore2["default"].each(Event.reduce(mapped, reducer), function (value, key) {
                var _key$split = key.split("::");

                var _key$split2 = _slicedToArray(_key$split, 2);

                var timestamp = _key$split2[0];
                var fieldName = _key$split2[1];

                if (!_underscore2["default"].has(eventData, timestamp)) {
                    eventData[timestamp] = {};
                }
                eventData[timestamp][fieldName] = value;
            });
            return _underscore2["default"].map(eventData, function (data, timestamp) {
                return new Event(+timestamp, data);
            });
        }
    }, {
        key: "sum",
        value: function sum(events, fieldSpec) {
            return Event.combine(events, fieldSpec, _functions.sum);
        }
    }, {
        key: "avg",
        value: function avg(events, fieldSpec) {
            return Event.combine(events, fieldSpec, _functions.avg);
        }

        /**
         * Maps a list of events according to the selection
         * specification passed in. The spec maybe a single
         * field name, a list of field names, or a function
         * that takes an event and returns a key/value pair.
         *
         * Example 1:
         *         in   out
         *  3am    1    2
         *  4am    3    4
         *
         * Mapper result:  { in: [1, 3], out: [2, 4]}
         */
    }, {
        key: "map",
        value: function map(events, fieldSpec) {
            var result = {};

            if (_underscore2["default"].isString(fieldSpec)) {
                (function () {
                    var fieldName = fieldSpec;
                    _underscore2["default"].each(events, function (event) {
                        if (!_underscore2["default"].has(result, fieldName)) {
                            result[fieldName] = [];
                        }
                        var value = event.get(fieldName);
                        result[fieldName].push(value);
                    });
                })();
            } else if (_underscore2["default"].isArray(fieldSpec)) {
                _underscore2["default"].each(fieldSpec, function (fieldName) {
                    _underscore2["default"].each(events, function (event) {
                        if (!_underscore2["default"].has(result, fieldName)) {
                            result[fieldName] = [];
                        }
                        result[fieldName].push(event.get(fieldName));
                    });
                });
            } else if (_underscore2["default"].isFunction(fieldSpec)) {
                _underscore2["default"].each(events, function (event) {
                    var pair = fieldSpec(event);
                    _underscore2["default"].each(pair, function (value, key) {
                        if (!_underscore2["default"].has(result, key)) {
                            result[key] = [];
                        }
                        result[key].push(value);
                    });
                });
            } else {
                _underscore2["default"].each(events, function (event) {
                    _underscore2["default"].each(event.data().toJSON(), function (value, key) {
                        if (!_underscore2["default"].has(result, key)) {
                            result[key] = [];
                        }
                        result[key].push(value);
                    });
                });
            }
            return result;
        }

        /**
         * Takes a list of events and a reducer function and returns
         * a new Event with the result, for each column. The reducer is
         * of the form:
         *     function sum(valueList) {
         *         return calcValue;
         *     }
         */
    }, {
        key: "reduce",
        value: function reduce(mapped, reducer) {
            var result = {};
            _underscore2["default"].each(mapped, function (valueList, key) {
                result[key] = reducer(valueList);
            });
            return result;
        }
    }, {
        key: "mapReduce",
        value: function mapReduce(events, fieldSpec, reducer) {
            return Event.reduce(this.map(events, fieldSpec), reducer);
        }
    }]);

    return Event;
})();

exports.Event = Event;

var TimeRangeEvent = (function () {

    /**
     * The creation of an TimeRangeEvent is done by combining two parts:
     * the timerange and the data.
     *
     * To construct you specify a TimeRange, along with the data.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */

    function TimeRangeEvent(arg1, arg2) {
        _classCallCheck(this, TimeRangeEvent);

        if (arg1 instanceof TimeRangeEvent) {
            var other = arg1;
            this._d = other._d;
            return;
        } else if (arg1 instanceof _immutable2["default"].Map) {
            this._d = arg1;
            return;
        }
        var range = timeRangeFromArg(arg1);
        var data = dataFromArg(arg2);
        this._d = new _immutable2["default"].Map({ range: range, data: data });
    }

    /**
     * An IndexedEvent uses an Index to specify a timerange over which the event
     * occurs and maps that to a data object representing some measurement or metric
     * during that time range.
     *
     * You can supply the index as a string or as an Index object.
     *
     * Example Indexes are:
     *     - 1d-1565 is the entire duration of the 1565th day since the UNIX epoch
     *     - 2014-03 is the entire duration of march in 2014
     *
     * The range, as expressed by the Index, is provided by the convenience method
     * `range()`, which returns a TimeRange instance. Alternatively the begin
     * and end times represented by the Index can be found with `begin()`
     * and `end()` respectively.
     *
     * The data is also specified during construction, and is generally expected to
     * be an object or an Immutable.Map. If an object is provided it will be stored
     * internally as an ImmutableMap. If the data provided is some other type then
     * it will be equivalent to supplying an object of `{value: data}`. Data may be
     * undefined.
     *
     * The get the data out of an IndexedEvent instance use `data()`. It will return
     * an Immutable.Map.
     */

    _createClass(TimeRangeEvent, [{
        key: "toJSON",
        value: function toJSON() {
            return {
                timerange: this.timerange().toJSON(),
                data: this.data().toJSON()
            };
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }

        //
        // Access the timerange represented by the index
        //

        /**
         * Returns a flat array starting with the timestamp, followed by the values.
         */
    }, {
        key: "toPoint",
        value: function toPoint() {
            return [this.timerange().toJSON()].concat(_toConsumableArray(_underscore2["default"].values(this.data().toJSON())));
        }

        /**
         * The TimeRange of this data
         * @return {TimeRange} TimeRange of this data.
         */
    }, {
        key: "timerange",
        value: function timerange() {
            return this._d.get("range");
        }

        /**
         * Access the event data
         * @return {Immutable.Map} Data for the Event
         */
    }, {
        key: "data",
        value: function data() {
            return this._d.get("data");
        }

        /**
         * Sets the data portion of the event and
         * returns a new TimeRangeEvent.
         */
    }, {
        key: "setData",
        value: function setData(data) {
            var d = this._d.set("data", dataFromArg(data));
            return new TimeRangeEvent(d);
        }

        /**
         * The TimeRange of this data, in UTC, as a string.
         * @return {string} TimeRange of this data.
         */
    }, {
        key: "timerangeAsUTCString",
        value: function timerangeAsUTCString() {
            return this.timerange().toUTCString();
        }

        /**
         * The TimeRange of this data, in Local time, as a string.
         * @return {string} TimeRange of this data.
         */
    }, {
        key: "timerangeAsLocalString",
        value: function timerangeAsLocalString() {
            return this.timerange().toLocalString();
        }

        /**
         * The begin time of this Event
         * @return {Data} Begin time
         */
    }, {
        key: "begin",
        value: function begin() {
            return this.timerange().begin();
        }

        /**
         * The end time of this Event
         * @return {Data} End time
         */
    }, {
        key: "end",
        value: function end() {
            return this.timerange().end();
        }

        /**
         * Alias for the begin() time.
         * @return {Data} Time representing this Event
         */
    }, {
        key: "timestamp",
        value: function timestamp() {
            return this.begin();
        }
    }, {
        key: "humanizeDuration",
        value: function humanizeDuration() {
            return this.timerange().humanizeDuration();
        }

        /**
         * Get specific data out of the Event. The data will be converted
         * to a js object. You can use a fieldSpec to address deep data.
         * A fieldSpec could be "a.b"
         */
    }, {
        key: "get",
        value: function get() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var v = undefined;
            if (_underscore2["default"].isString(fieldSpec)) {
                var searchKeyPath = fieldSpec.split(".");
                if (this.data().hasIn(searchKeyPath)) {
                    v = this.data().getIn(searchKeyPath);
                }
            }

            if (v instanceof _immutable2["default"].Map || v instanceof _immutable2["default"].List) {
                return v.toJS();
            }
            return v;
        }
    }, {
        key: "value",
        value: function value(fieldSpec) {
            return this.get(fieldSpec);
        }
    }]);

    return TimeRangeEvent;
})();

exports.TimeRangeEvent = TimeRangeEvent;

var IndexedEvent = (function () {

    /**
     * The creation of an IndexedEvent is done by combining two parts:
     * the Index and the data.
     *
     * To construct you specify an Index, along with the data.
     *
     * The index may be an Index, or a string.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */

    function IndexedEvent(arg1, arg2, arg3) {
        _classCallCheck(this, IndexedEvent);

        if (arg1 instanceof IndexedEvent) {
            var other = arg1;
            this._d = other._d;
            return;
        } else if (arg1 instanceof _immutable2["default"].Map) {
            this._d = arg1;
            return;
        }
        var index = indexFromArgs(arg1, arg3);
        var data = dataFromArg(arg2);
        this._d = new _immutable2["default"].Map({ index: index, data: data });
    }

    _createClass(IndexedEvent, [{
        key: "toJSON",
        value: function toJSON() {
            return {
                index: this.indexAsString(),
                data: this.data().toJSON()
            };
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }

        /**
         * Returns a flat array starting with the timestamp, followed by the values.
         */
    }, {
        key: "toPoint",
        value: function toPoint() {
            return [this.indexAsString()].concat(_toConsumableArray(_underscore2["default"].values(this.data().toJSON())));
        }

        /**
         * Returns the Index associated with the data in this Event
         * @return {Index} The Index
         */
    }, {
        key: "index",
        value: function index() {
            return this._d.get("index");
        }

        /**
         * Sets the data of the event and returns a new IndexedEvent.
         */
    }, {
        key: "setData",
        value: function setData(data) {
            var d = this._d.set("data", dataFromArg(data));
            return new IndexedEvent(d);
        }

        /**
         * Access the event data
         * @return {Immutable.Map} Data for the Event
         */
    }, {
        key: "data",
        value: function data() {
            return this._d.get("data");
        }

        /**
         * Returns the Index as a string, same as event.index().toString()
         * @return {string} The Index
         */
    }, {
        key: "indexAsString",
        value: function indexAsString() {
            return this.index().asString();
        }

        /**
         * The TimeRange of this data, in UTC, as a string.
         * @return {string} TimeRange of this data.
         */
    }, {
        key: "timerangeAsUTCString",
        value: function timerangeAsUTCString() {
            return this.timerange().toUTCString();
        }

        /**
         * The TimeRange of this data, in Local time, as a string.
         * @return {string} TimeRange of this data.
         */
    }, {
        key: "timerangeAsLocalString",
        value: function timerangeAsLocalString() {
            return this.timerange().toLocalString();
        }

        /**
         * The TimeRange of this data
         * @return {TimeRange} TimeRange of this data.
         */
    }, {
        key: "timerange",
        value: function timerange() {
            return this.index().asTimerange();
        }

        /**
         * The begin time of this Event
         * @return {Data} Begin time
         */
    }, {
        key: "begin",
        value: function begin() {
            return this.timerange().begin();
        }

        /**
         * The end time of this Event
         * @return {Data} End time
         */
    }, {
        key: "end",
        value: function end() {
            return this.timerange().end();
        }

        /**
         * Alias for the begin() time.
         * @return {Data} Time representing this Event
         */
    }, {
        key: "timestamp",
        value: function timestamp() {
            return this.begin();
        }

        /**
         * Get specific data out of the Event. The data will be converted
         * to a js object. You can use a fieldSpec to address deep data.
         * A fieldSpec could be "a.b"
         */
    }, {
        key: "get",
        value: function get() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var v = undefined;
            if (_underscore2["default"].isString(fieldSpec)) {
                var searchKeyPath = fieldSpec.split(".");
                if (this.data().hasIn(searchKeyPath)) {
                    v = this.data().getIn(searchKeyPath);
                }
            }

            if (v instanceof _immutable2["default"].Map || v instanceof _immutable2["default"].List) {
                return v.toJS();
            }
            return v;
        }
    }, {
        key: "value",
        value: function value(fieldSpec) {
            return this.get(fieldSpec);
        }
    }]);

    return IndexedEvent;
})();

exports.IndexedEvent = IndexedEvent;