"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _event = require("./event");

var _event2 = _interopRequireDefault(_event);

var _util = require("./base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A `TimeRangeEvent` uses a `TimeRange` to specify the range over
 * which the event occurs and maps that to a data object representing
 * some measurements or metrics during that time range.
 *
 * You supply the timerange as a `TimeRange` object.
 *
 * The data is also specified during construction and maybe either:
 *  1) a Javascript object or simple type
 *  2) an Immutable.Map.
 *  3) Simple measurement
 *
 * If an Javascript object is provided it will be stored internally as an
 * Immutable Map. If the data provided is some other simple type (such as an
 * integer) then it will be equivalent to supplying an object of {value: data}.
 * Data may also be undefined.
 *
 * ```
 * const e = new TimeRangeEvent(timerange, data);
 * ```
 *
 * To get the data out of an TimeRangeEvent instance use `data()`.
 * It will return an Immutable.Map. Alternatively you can call `toJSON()`
 * to return a Javascript object representation of the data, while
 * `toString()` will serialize the entire event to a string.
 *
 * **Example:**
 *
 * Given some source of data that looks like this:
 *
 * ```json
 * const event = {
 *     "start_time": "2015-04-22T03:30:00Z",
 *     "end_time": "2015-04-22T13:00:00Z",
 *     "description": "At 13:33 pacific circuit 06519 went down.",
 *     "title": "STAR-CR5 - Outage",
 *     "completed": true,
 *     "external_ticket": "",
 *     "esnet_ticket": "ESNET-20150421-013",
 *     "organization": "Internet2 / Level 3",
 *     "type": "U"
 * }
 * ```
 *
 * We first extract the begin and end times to build a TimeRange:
 *
 * ```js
 * let b = new Date(event.start_time);
 * let e = new Date(event.end_time);
 * let timerange = new TimeRange(b, e);
 * ```
 *
 * Then we combine the TimeRange and the event itself to create the Event.
 *
 * ```js
 * let outageEvent = new TimeRangeEvent(timerange, sampleEvent);
 * ```
 *
 * Once we have an event we can get access the time range with:
 *
 * ```js
 * outageEvent.begin().getTime()   // 1429673400000
 * outageEvent.end().getTime())    // 1429707600000
 * outageEvent.humanizeDuration()) // "10 hours"
 * ```
 *
 * And we can access the data like so:
 *
 * ```js
 * outageEvent.get("title")  // "STAR-CR5 - Outage"
 * ```
 */
/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var TimeRangeEvent = function (_Event) {
    (0, _inherits3.default)(TimeRangeEvent, _Event);

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

        var _this = (0, _possibleConstructorReturn3.default)(this, (TimeRangeEvent.__proto__ || (0, _getPrototypeOf2.default)(TimeRangeEvent)).call(this));

        if (arg1 instanceof TimeRangeEvent) {
            var other = arg1;
            _this._d = other._d;
            return (0, _possibleConstructorReturn3.default)(_this);
        } else if (arg1 instanceof _immutable2.default.Map) {
            _this._d = arg1;
            return (0, _possibleConstructorReturn3.default)(_this);
        }
        var range = _util2.default.timeRangeFromArg(arg1);
        var data = _util2.default.dataFromArg(arg2);
        _this._d = new _immutable2.default.Map({ range: range, data: data });
        return _this;
    }

    /**
     * Returns the timerange as a string
     */


    (0, _createClass3.default)(TimeRangeEvent, [{
        key: "key",
        value: function key() {
            return +this.timerange().begin() + "," + +this.timerange().end();
        }

        /**
         * Returns the TimeRangeEvent as a JSON object, converting all
         * Immutable structures in the process.
         */

    }, {
        key: "toJSON",
        value: function toJSON() {
            return {
                timerange: this.timerange().toJSON(),
                data: this.data().toJSON()
            };
        }

        /**
         * Returns a flat array starting with the timestamp, followed by the values.
         */

    }, {
        key: "toPoint",
        value: function toPoint(columns) {
            var _this2 = this;

            var values = [];
            columns.forEach(function (c) {
                var v = _this2.data().get(c);
                values.push(v === "undefined" ? null : v);
            });
            return [this.timerange().toJSON()].concat(values);
        }

        /**
         * The timerange of this data as a `TimeRange` object
         * @return {TimeRange} TimeRange of this data.
         */

    }, {
        key: "timerange",
        value: function timerange() {
            return this._d.get("range");
        }

        /**
         * The TimeRange of this event, in UTC, as a string.
         * @return {string} TimeRange of this data.
         */

    }, {
        key: "timerangeAsUTCString",
        value: function timerangeAsUTCString() {
            return this.timerange().toUTCString();
        }

        /**
         * The TimeRange of this event, in Local time, as a string.
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

        /**
         * A human friendly version of the duration of this event
         */

    }, {
        key: "humanizeDuration",
        value: function humanizeDuration() {
            return this.timerange().humanizeDuration();
        }
    }]);
    return TimeRangeEvent;
}(_event2.default);

exports.default = TimeRangeEvent;