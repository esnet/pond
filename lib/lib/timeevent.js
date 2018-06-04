"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

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
 * The creation of an TimeEvent is done by combining two parts:
 *  * the timestamp
 *  * the data
 *
 * To specify the data you can supply:

 *  * a Javascript object of key/values. The object may contained nested data.
 *  * an Immutable.Map
 *  * a simple type such as an integer. This is a shorthand for supplying {"value": v}.
 *
 * Example:
 *
 * ```
 * const t = new Date("2015-04-22T03:30:00Z");
 * const event1 = new TimeEvent(t, { a: 5, b: 6 });
 * ```
 */
/*
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var TimeEvent = function (_Event) {
    (0, _inherits3.default)(TimeEvent, _Event);

    /**
     * The creation of an TimeEvent is done by combining two parts:
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
    function TimeEvent(arg1, arg2) {
        (0, _classCallCheck3.default)(this, TimeEvent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TimeEvent.__proto__ || (0, _getPrototypeOf2.default)(TimeEvent)).call(this));

        if (arg1 instanceof TimeEvent) {
            var other = arg1;
            _this._d = other._d;
            return (0, _possibleConstructorReturn3.default)(_this);
        } else if (arg1 instanceof _immutable2.default.Map && arg1.has("time") && arg1.has("data")) {
            _this._d = arg1;
            return (0, _possibleConstructorReturn3.default)(_this);
        }
        var time = _util2.default.timestampFromArg(arg1);
        var data = _util2.default.dataFromArg(arg2);
        _this._d = new _immutable2.default.Map({ time: time, data: data });
        return _this;
    }

    /**
     * Returns the timestamp (as ms since the epoch)
     */


    (0, _createClass3.default)(TimeEvent, [{
        key: "key",
        value: function key() {
            return this.timestamp().getTime();
        }

        /**
         * Returns the Event as a JSON object, essentially:
         *  {time: t, data: {key: value, ...}}
         * @return {Object} The event as JSON.
         */

    }, {
        key: "toJSON",
        value: function toJSON() {
            return { time: this.timestamp().getTime(), data: this.data().toJSON() };
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
            return [this.timestamp().getTime()].concat(values);
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
         * Turn the Collection data into a string
         * @return {string} The collection as a string
         */

    }, {
        key: "stringify",
        value: function stringify() {
            return (0, _stringify2.default)(this.data());
        }
    }]);
    return TimeEvent;
}(_event2.default);

exports.default = TimeEvent;