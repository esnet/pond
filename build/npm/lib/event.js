"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var moment = require("moment");
var _ = require("underscore");
var Immutable = require("immutable");

var util = require("./util");
var Index = require("./index");
var TimeRange = require("./range");

function timestampFromArgs(arg1) {
    var timestamp = undefined;
    if (_.isNumber(arg1)) {
        timestamp = new Date(timestamp);
    } else if (_.isDate(timestamp)) {
        timestamp = new Date(timestamp.getTime());
    } else if (moment.isMoment(timestamp)) {
        timestamp = new Date(timestamp.valueOf());
    }
    return timestamp;
}

function dataFromArgs(arg1) {
    var data = {};
    if (_.isObject(arg1)) {
        data = new Immutable.Map(arg1);
    } else if (data instanceof Immutable.Map) {
        data = arg1;
    } else {
        data = new Immutable.Map({ value: arg1 });
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

        //Copy constructor
        if (arg1 instanceof Event) {
            var other = arg1;
            this._time = other._time;
            this._data = other._data;
            return;
        }

        //Timestamp
        this._time = timestampFromArgs(arg1);

        //Data
        this._data = dataFromArgs(arg2);
        console.log("Taken arg2", arg1, arg2);
    }

    _createClass(Event, {
        toJSON: {
            value: function toJSON() {
                return { time: this._time.getTime(), data: this._data.toJSON() };
            }
        },
        toString: {
            value: function toString() {
                return JSON.stringify(this.toJSON());
            }
        },
        timestampAsUTCString: {
            value: function timestampAsUTCString() {
                return this._time.toUTCString();
            }
        },
        timestampAsLocalString: {
            value: function timestampAsLocalString() {
                return this._time.toString();
            }
        },
        timestamp: {
            value: function timestamp() {
                return this._time;
            }
        },
        data: {
            value: function data() {
                return this._data;
            }
        },
        get: {
            value: function get(key) {
                var k = key || "value";
                return this._data.get(k);
            }
        },
        stringify: {
            value: function stringify() {
                return data.stringify(this._data);
            }
        }
    });

    return Event;
})();

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

        console.log("Construct TimeRangeEvent");

        //Timerange
        if (arg1 instanceof TimeRange) {
            var timerange = arg1;
            this._range = timerange;
        }

        //Data
        this._data = dataFromArgs(arg2);
    }

    _createClass(TimeRangeEvent, {
        toJSON: {
            value: function toJSON() {
                return { timerange: this._range.toJSON(), data: this._data.toJSON() };
            }
        },
        toString: {
            value: function toString() {
                return JSON.stringify(this.toJSON());
            }
        },
        timerange: {

            //
            // Access the timerange represented by the index
            //

            value: function timerange() {
                return this._range;
            }
        },
        timerangeAsUTCString: {
            value: function timerangeAsUTCString() {
                return this.timerange().toUTCString();
            }
        },
        timerangeAsLocalString: {
            value: function timerangeAsLocalString() {
                return this.timerange().toLocalString();
            }
        },
        begin: {
            value: function begin() {
                console.log("call begin", this._range);
                return this._range.begin();
            }
        },
        end: {
            value: function end() {
                return this._range.end();
            }
        },
        humanizeDuration: {
            value: function humanizeDuration() {
                return this._range.humanizeDuration();
            }
        },
        data: {

            //
            // Access the event data
            //

            value: function data() {
                return this._data;
            }
        },
        get: {
            value: function get(key) {
                var k = key || "value";
                console.log("   get", this._data.toJSON());
                return this._data.get(k);
            }
        }
    });

    return TimeRangeEvent;
})();

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
    function IndexedEvent(index, data) {
        _classCallCheck(this, IndexedEvent);

        //Index
        if (_.isString(index)) {
            this._i = new Index(index);
        } else if (index instanceof Index) {
            this._i = index;
        }

        //Data
        if (_.isObject(data)) {
            this._data = new Immutable.Map(data);
        } else if (data instanceof Immutable.Map) {
            this._data = data;
        } else {
            this._data = new Immutable.Map({ value: data });
        }
    }

    _createClass(IndexedEvent, {
        toJSON: {
            value: function toJSON() {
                return { index: this._i.asString(), data: this._data.toJSON() };
            }
        },
        toString: {
            value: function toString() {
                return JSON.stringify(this.toJSON());
            }
        },
        index: {

            //
            // Access the index itself
            //

            value: function index() {
                return this._i;
            }
        },
        timerangeAsUTCString: {

            //
            // Access the timerange represented by the index
            //

            value: function timerangeAsUTCString() {
                return this.timerange().toUTCString();
            }
        },
        timerangeAsLocalString: {
            value: function timerangeAsLocalString() {
                return this.timerange().toLocalString();
            }
        },
        timerange: {
            value: function timerange() {
                return this._i.asTimerange();
            }
        },
        begin: {
            value: function begin() {
                return this.timerange().begin();
            }
        },
        end: {
            value: function end() {
                return this.timerange().end();
            }
        },
        data: {

            //
            // Access the event data
            //

            value: function data() {
                return this._data;
            }
        },
        get: {
            value: function get(key) {
                var k = key || "value";
                return this._data.get(k);
            }
        }
    });

    return IndexedEvent;
})();

module.exports.Event = Event;
module.exports.TimeRangeEvent = TimeRangeEvent;
module.exports.IndexedEvent = IndexedEvent;