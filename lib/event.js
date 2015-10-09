"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

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

//
// Util
//

function timestampFromArgs(arg1) {
    var timestamp = undefined;
    if (_underscore2["default"].isNumber(arg1)) {
        timestamp = new Date(arg1);
    } else if (_underscore2["default"].isDate(arg1)) {
        timestamp = new Date(arg1.getTime());
    } else if (_moment2["default"].isMoment(arg1)) {
        timestamp = new Date(arg1.valueOf());
    }
    return timestamp;
}

function dataFromArgs(arg1) {
    var data = {};
    if (_underscore2["default"].isObject(arg1)) {
        data = new _immutable2["default"].Map(arg1);
    } else if (data instanceof _immutable2["default"].Map) {
        data = arg1;
    } else {
        data = new _immutable2["default"].Map({ value: arg1 });
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
 * of the number of ms since the UNIX epoch. There's no method on
 * the Event object to mutate the Event timestamp after it is created.
 */

var Event = (function () {

    /**
     * The creation of an Event is done by combining two parts:
     * the timestamp (or time range, or Index...) and the data.
     *
     * To construct you specify the timestamp as either:
     *     - Javascript Date object
     *     - a Moment, or
     *     - ms timestamp: the number of ms since the UNIX epoch
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */

    function Event(arg1, arg2) {
        _classCallCheck(this, Event);

        // Copy constructor
        if (arg1 instanceof Event) {
            var other = arg1;
            this._time = other._time;
            this._data = other._data;
            return;
        }

        // Timestamp
        this._time = timestampFromArgs(arg1);

        // Data
        this._data = dataFromArgs(arg2);
    }

    /**
     * A TimeRangeEvent uses a TimeRange to specify the range over
     * which the event occurs and maps that to a data object representing some
     * measurements or metrics during that time range.
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
     * `toString()` will serialize the event to a string.
     */

    /**
     * Returns the Event as a JSON object, essentially:
     *  {time: t, data: {key: value, ...}}
     * @return {Object} The event as JSON.
     */

    _createClass(Event, [{
        key: "toJSON",
        value: function toJSON() {
            return { time: this._time.getTime(), data: this._data.toJSON() };
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
         * The timestamp of this data, in UTC time, as a string.
         * @return {string} Time of this data.
         */
    }, {
        key: "timestampAsUTCString",
        value: function timestampAsUTCString() {
            return this._time.toUTCString();
        }

        /**
         * The timestamp of this data, in Local time, as a string.
         * @return {string} Time of this data.
         */
    }, {
        key: "timestampAsLocalString",
        value: function timestampAsLocalString() {
            return this._time.toString();
        }

        /**
         * The timestamp of this data
         * @return {Date} Time of this data.
         */
    }, {
        key: "timestamp",
        value: function timestamp() {
            return this._time;
        }

        /**
         * Access the event data
         * @return {Immutable.Map} Data for the Event
         */
    }, {
        key: "data",
        value: function data() {
            return this._data;
        }

        /**
         * Get specific data out of the Event
         * @param  {string} key Key to lookup, or "value" if not specified.
         * @return {Object}     The data associated with this key
         */
    }, {
        key: "get",
        value: function get(key) {
            var k = key || "value";
            return this._data.get(k);
        }
    }, {
        key: "stringify",
        value: function stringify() {
            return JSON.stringify(this._data);
        }
    }], [{
        key: "mergeEvents",
        value: function mergeEvents(events) {
            var t = events[0].timestamp();
            var data = {};
            _underscore2["default"].each(events, function (event) {
                if (!event instanceof Event) {
                    throw new Error("Events being merged must have the same type");
                }

                if (t.getTime() !== event.timestamp().getTime()) {
                    throw new Error("Events being merged must have the same timestamp");
                }

                var d = event.toJSON().data;
                _underscore2["default"].each(d, function (val, key) {
                    if (_underscore2["default"].has(data, key)) {
                        throw new Error("Events being merged may not have the same key '" + key + "'");
                    }
                    data[key] = val;
                });
            });

            return new Event(t, data);
        }
    }, {
        key: "mergeTimeRangeEvents",
        value: function mergeTimeRangeEvents(events) {
            var timerange = events[0].timerange();
            var data = {};
            _underscore2["default"].each(events, function (event) {
                if (!event instanceof TimeRangeEvent) {
                    throw new Error("Events being merged must have the same type");
                }

                if (timerange.toUTCString() !== event.timerange().toUTCString()) {
                    throw new Error("Events being merged must have the same timerange");
                }

                var d = event.toJSON().data;
                _underscore2["default"].each(d, function (val, key) {
                    if (_underscore2["default"].has(data, key)) {
                        throw new Error("Events being merged may not have the same key '" + key + "'");
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
                        throw new Error("Events being merged may not have the same key '" + key + "'");
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

        // Timerange
        if (arg1 instanceof _range2["default"]) {
            var timerange = arg1;
            this._range = timerange;
        }

        // Data
        this._data = dataFromArgs(arg2);
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
            return { timerange: this._range.toJSON(), data: this._data.toJSON() };
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
         * The TimeRange of this data
         * @return {TimeRange} TimeRange of this data.
         */
    }, {
        key: "timerange",
        value: function timerange() {
            return this._range;
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
            return this._range.begin();
        }

        /**
         * The end time of this Event
         * @return {Data} End time
         */
    }, {
        key: "end",
        value: function end() {
            return this._range.end();
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
            return this._range.humanizeDuration();
        }

        /**
         * Access the event data
         * @return {Immutable.Map} Data for the Event
         */
    }, {
        key: "data",
        value: function data() {
            return this._data;
        }

        /**
         * Get specific data out of the Event
         * @param  {string} key Key to lookup, or "value" if not specified.
         * @return {Object}     The data associated with this key
         */
    }, {
        key: "get",
        value: function get(key) {
            var k = key || "value";
            return this._data.get(k);
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

    function IndexedEvent(index, data, utc) {
        _classCallCheck(this, IndexedEvent);

        // Index
        if (_underscore2["default"].isString(index)) {
            this._index = new _index2["default"](index, utc);
        } else if (index instanceof _index2["default"]) {
            this._index = index;
        }

        // Data
        if (_underscore2["default"].isObject(data)) {
            this._data = new _immutable2["default"].Map(data);
        } else if (data instanceof _immutable2["default"].Map) {
            this._data = data;
        } else {
            this._data = new _immutable2["default"].Map({ value: data });
        }
    }

    _createClass(IndexedEvent, [{
        key: "toJSON",
        value: function toJSON() {
            return { index: this.indexAsString(), data: this.data().toJSON() };
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }

        /**
         * Returns the Index associated with the data in this Event
         * @return {Index} The Index
         */
    }, {
        key: "index",
        value: function index() {
            return this._index;
        }

        /**
         * Returns the Index as a string, same as event.index().toString()
         * @return {string} The Index
         */
    }, {
        key: "indexAsString",
        value: function indexAsString() {
            return this._index.asString();
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
            return this._index.asTimerange();
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
         * Access the event data
         * @return {Immutable.Map} Data for the Event
         */
    }, {
        key: "data",
        value: function data() {
            return this._data;
        }

        /**
         * Get specific data out of the Event
         * @param  {string} key Key to lookup, or "value" if not specified.
         * @return {Object}     The data associated with this key
         */
    }, {
        key: "get",
        value: function get(key) {
            var k = key || "value";
            return this._data.get(k);
        }
    }]);

    return IndexedEvent;
})();

exports.IndexedEvent = IndexedEvent;