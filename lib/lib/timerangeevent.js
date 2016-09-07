"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _timerange = require("./timerange");

var _timerange2 = _interopRequireDefault(_timerange);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var TimeRangeEvent = function () {

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
        (0, _classCallCheck3.default)(this, TimeRangeEvent);

        if (arg1 instanceof TimeRangeEvent) {
            var other = arg1;
            this._d = other._d;
            return;
        } else if (arg1 instanceof _immutable2.default.Map) {
            this._d = arg1;
            return;
        }
        var range = timeRangeFromArg(arg1);
        var data = dataFromArg(arg2);
        this._d = new _immutable2.default.Map({ range: range, data: data });
    }

    (0, _createClass3.default)(TimeRangeEvent, [{
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
            return (0, _stringify2.default)(this.toJSON());
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
            return [this.timerange().toJSON()].concat((0, _toConsumableArray3.default)(_underscore2.default.values(this.data().toJSON())));
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
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? ["value"] : arguments[0];

            var v = void 0;
            if (_underscore2.default.isArray(fieldSpec)) {
                v = this.data().getIn(fieldSpec);
            } else if (_underscore2.default.isString(fieldSpec)) {
                var searchKeyPath = fieldSpec.split(".");
                v = this.data().getIn(searchKeyPath);
            }

            if (v instanceof _immutable2.default.Map || v instanceof _immutable2.default.List) {
                return v.toJS();
            }
            return v;
        }
    }, {
        key: "value",
        value: function value(fieldSpec) {
            return this.get(fieldSpec);
        }

        /**
         * Collapses this event's columns, represented by the fieldSpecList
         * into a single column. The collapsing itself is done with the reducer
         * function. Optionally the collapsed column could be appended to the
         * existing columns, or replace them (the default).
         */

    }, {
        key: "collapse",
        value: function collapse(fieldSpecList, name, reducer) {
            var _this = this;

            var append = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            var data = append ? this.data().toJS() : {};
            var d = fieldSpecList.map(function (fs) {
                return _this.get(fs);
            });
            data[name] = reducer(d);
            return this.setData(data);
        }
    }]);
    return TimeRangeEvent;
}(); /*
      *  Copyright (c) 2016, The Regents of the University of California,
      *  through Lawrence Berkeley National Laboratory (subject to receipt
      *  of any required approvals from the U.S. Dept. of Energy).
      *  All rights reserved.
      *
      *  This source code is licensed under the BSD-style license found in the
      *  LICENSE file in the root directory of this source tree.
      */

function timeRangeFromArg(arg) {
    if (arg instanceof _timerange2.default) {
        return arg;
    } else if (_underscore2.default.isArray(arg) && arg.length === 2) {
        return new _timerange2.default(arg);
    } else {
        throw new Error("Unable to parse timerange. Should be a TimeRange. Got " + arg + ".");
    }
}

function dataFromArg(arg) {
    var data = void 0;
    if (_underscore2.default.isObject(arg)) {
        // Deeply convert the data to Immutable Map
        data = new _immutable2.default.fromJS(arg);
    } else if (data instanceof _immutable2.default.Map) {
        // Copy reference to the data
        data = arg;
    } else if (_underscore2.default.isNumber(arg) || _underscore2.default.isString(arg)) {
        // Just add it to the value key of a new Map
        // e.g. new Event(t, 25); -> t, {value: 25}
        data = new _immutable2.default.Map({ value: arg });
    } else {
        throw new Error("Unable to interpret event data from " + arg + ".");
    }
    return data;
}

exports.default = TimeRangeEvent;