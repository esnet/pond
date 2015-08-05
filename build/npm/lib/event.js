"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
        data = new _immutable2["default"].Map({ "value": arg1 });
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
 * of the number of ms since the UNIX epoch. There's not method on
 * the Event object to mutate the Event timestamp after it is created.
 *
 */

var Event = (function () {
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

    _createClass(Event, [{
        key: "toJSON",
        value: function toJSON() {
            return { time: this._time.getTime(), data: this._data.toJSON() };
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }
    }, {
        key: "timestampAsUTCString",
        value: function timestampAsUTCString() {
            return this._time.toUTCString();
        }
    }, {
        key: "timestampAsLocalString",
        value: function timestampAsLocalString() {
            return this._time.toString();
        }
    }, {
        key: "timestamp",
        value: function timestamp() {
            return this._time;
        }
    }, {
        key: "data",
        value: function data() {
            return this._data;
        }
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
    }]);

    return Event;
})();

exports.Event = Event;

/**
 * An time range event uses a TimeRange to specify the range over which the event occurs
 * and maps that to a data object representing some measurements or metrics during
 * that time range.
 *
 * You supply the timerange as a TimeRange object.
 *
 * The data is also specified during construction and me be either:
 *  1) a Javascript object or simple type
 *  2) an Immutable.Map.
 *
 * If an Javascript object is provided it will be stored internally as an Immutable Map.
 * If the data provided is some other simple type (such as an integer) then it will be
 * equivalent to supplying an object of {value: data}. Data may also be undefined.
 *
 * The get the data out of an IndexedEvent instance use data(). It will return an
 * Immutable.Map. Alternatively you can call toJSON() to return a Javascript object
 * representation of the data, while toString() will serialize the event to a string.
 *
 */

var TimeRangeEvent = (function () {
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
    }, {
        key: "timerange",

        //
        // Access the timerange represented by the index
        //

        value: function timerange() {
            return this._range;
        }
    }, {
        key: "timerangeAsUTCString",
        value: function timerangeAsUTCString() {
            return this.timerange().toUTCString();
        }
    }, {
        key: "timerangeAsLocalString",
        value: function timerangeAsLocalString() {
            return this.timerange().toLocalString();
        }
    }, {
        key: "begin",
        value: function begin() {
            return this._range.begin();
        }
    }, {
        key: "end",
        value: function end() {
            return this._range.end();
        }
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
    }, {
        key: "data",

        //
        // Access the event data
        //

        value: function data() {
            return this._data;
        }
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

/**
 * An indexed event uses a Index to specify a timerange over which the event occurs
 * and maps that to a data object representing some measurement of metric during
 * that time range.
 *
 * You can supply the index as a string or as an Index object.
 *
 * Example Indexes are:
 *     - 1d-156 is the entire duration of the 156th day since the UNIX epoch
 *     - 12:Mar:2014 is the entire duration of march in 2014 [not supported yet]
 *
 * The range, as expressed by the Index, is provided by the convenience method range(),
 * which returns a TimeRange instance. Alternatively the begin and end times represented
 * by the Index can be found with begin() and end() respectively.
 *
 * The data is also specified during construction, and is generally expected to be an
 * object or an Immutable.Map. If an object is provided it will be stored internally as
 * an ImmutableMap. If the data provided is some other type then it will be equivalent to
 * supplying an object of {value: data}. Data may be undefined.
 *
 * The get the data out of an IndexedEvent instance use data(). It will return an
 * Immutable.Map.
 */

var IndexedEvent = (function () {
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
            this._data = new _immutable2["default"].Map({ "value": data });
        }
    }

    _createClass(IndexedEvent, [{
        key: "toJSON",
        value: function toJSON() {
            return { index: this._index.asString(), data: this._data.toJSON() };
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }
    }, {
        key: "index",

        //
        // Access the index itself
        //

        value: function index() {
            return this._index;
        }
    }, {
        key: "timerangeAsUTCString",

        //
        // Access the timerange represented by the index
        //

        value: function timerangeAsUTCString() {
            return this.timerange().toUTCString();
        }
    }, {
        key: "timerangeAsLocalString",
        value: function timerangeAsLocalString() {
            return this.timerange().toLocalString();
        }
    }, {
        key: "timerange",
        value: function timerange() {
            return this._index.asTimerange();
        }
    }, {
        key: "begin",
        value: function begin() {
            return this.timerange().begin();
        }
    }, {
        key: "end",
        value: function end() {
            return this.timerange().end();
        }
    }, {
        key: "timestamp",
        value: function timestamp() {
            return this.begin();
        }
    }, {
        key: "data",

        //
        // Access the event data
        //

        value: function data() {
            return this._data;
        }
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