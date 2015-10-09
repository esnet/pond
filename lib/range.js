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

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var TimeRange = (function () {

    /**
     * Builds a new TimeRange which may be of several different formats:
     *   - Another TimeRange (copy constructor)
     *   - An Immutable.List containing two Dates.
     *   - A Javascript array containing two Date or ms timestamps
     *   - Two arguments, begin and end, each of which may be a Data,
     *     a Moment, or a ms timestamp.
     */

    function TimeRange(arg1, arg2) {
        _classCallCheck(this, TimeRange);

        if (arg1 instanceof TimeRange) {
            var other = arg1;
            this._range = other._range;
        } else if (arg1 instanceof _immutable2["default"].List) {
            var rangeList = arg1;
            this._range = rangeList;
        } else if (_underscore2["default"].isArray(arg1)) {
            var rangeArray = arg1;
            this._range = new _immutable2["default"].List([new Date(rangeArray[0]), new Date(rangeArray[1])]);
        } else {
            var b = arg1;
            var e = arg2;
            if (_underscore2["default"].isDate(b) && _underscore2["default"].isDate(e)) {
                this._range = new _immutable2["default"].List([new Date(b.getTime()), new Date(e.getTime())]);
            } else if (_moment2["default"].isMoment(b) && _moment2["default"].isMoment(e)) {
                this._range = new _immutable2["default"].List([new Date(b.valueOf()), new Date(e.valueOf())]);
            } else if (_underscore2["default"].isNumber(b) && _underscore2["default"].isNumber(e)) {
                this._range = new _immutable2["default"].List([new Date(b), new Date(e)]);
            }
        }
    }

    /**
     * Returns the internal range, which is an Immutable List containing
     * begin and end keys
     */

    _createClass(TimeRange, [{
        key: "range",
        value: function range() {
            return this._range;
        }

        //
        // Serialize
        //

        /**
         * Returns the TimeRange as JSON, which will be a Javascript array
         * of two ms timestamps.
         * @return {number[]} JSON representation of the TimeRange
         */
    }, {
        key: "toJSON",
        value: function toJSON() {
            return [this.begin().getTime(), this.end().getTime()];
        }

        /**
         * Returns the TimeRange as a string, useful for serialization.
         * @return {string} String representation of the TimeRange
         */
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }

        /**
         * Returns the TimeRange as a string expressed in local time
         * @return {string} String representation of the TimeRange
         */
    }, {
        key: "toLocalString",
        value: function toLocalString() {
            return "[" + this.begin() + ", " + this.end() + "]";
        }

        /**
         * Returns the TimeRange as a string expressed in UTC time
         * @return {string} String representation of the TimeRange
         */
    }, {
        key: "toUTCString",
        value: function toUTCString() {
            return "[" + this.begin().toUTCString() + ", " + this.end().toUTCString() + "]";
        }

        /**
         * Returns a human friendly version of the TimeRange, e.g.
         * "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
         * @return {string} Human friendly string representation of the TimeRange
         */
    }, {
        key: "humanize",
        value: function humanize() {
            var begin = (0, _moment2["default"])(this.begin());
            var end = (0, _moment2["default"])(this.end());
            var beginStr = begin.format("MMM D, YYYY hh:mm:ss a");
            var endStr = end.format("MMM D, YYYY hh:mm:ss a");

            return beginStr + " to " + endStr;
        }

        /**
         * Returns a human friendly version of the TimeRange, e.g.
         * e.g. "a few seconds ago to a month ago"
         * @return {string} Human friendly string representation of the TimeRange
         */
    }, {
        key: "relativeString",
        value: function relativeString() {
            var begin = (0, _moment2["default"])(this.begin());
            var end = (0, _moment2["default"])(this.end());
            return begin.fromNow() + " to " + end.fromNow();
        }

        /**
         * Returns the begin time of the TimeRange.
         * @return {Date} Begin time
         */
    }, {
        key: "begin",
        value: function begin() {
            return this._range.get(0);
        }

        /**
         * Returns the end time of the TimeRange.
         * @return {Date} End time
         */
    }, {
        key: "end",
        value: function end() {
            return this._range.get(1);
        }

        /**
         * Sets a new begin time on the TimeRange. The result will be
         * a new TimeRange.
         */
    }, {
        key: "setBegin",
        value: function setBegin(t) {
            return new TimeRange(this._range.set(0, t));
        }

        /**
         * Sets a new end time on the TimeRange. The result will be a new TimeRange.
         */
    }, {
        key: "setEnd",
        value: function setEnd(t) {
            return new TimeRange(this._range.set(1, t));
        }

        /**
         * Returns if the two TimeRanges can be considered equal,
         * in that they have the same times.
         */
    }, {
        key: "equals",
        value: function equals(other) {
            return this.begin().getTime() === other.begin().getTime() && this.end().getTime() === other.end().getTime();
        }

        /**
         * Returns true if other is completely inside this.
         */
    }, {
        key: "contains",
        value: function contains(other) {
            if (_underscore2["default"].isDate(other)) {
                return this.begin() <= other && this.end() >= other;
            } else {
                return this.begin() <= other.begin() && this.end() >= other.end();
            }
            return false;
        }

        /**
         * Returns true if this TimeRange is completely within the supplied
         * other TimeRange.
         */
    }, {
        key: "within",
        value: function within(other) {
            return this.begin() >= other.begin() && this.end() <= other.end();
        }

        /**
         * Returns true if the passed in other TimeRange overlaps this time Range.
         */
    }, {
        key: "overlaps",
        value: function overlaps(other) {
            if (this.contains(other.begin()) && !this.contains(other.end()) || this.contains(other.end()) && !this.contains(other.begin())) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Returns true if the passed in other Range in no way
         * overlaps this time Range.
         */
    }, {
        key: "disjoint",
        value: function disjoint(other) {
            return this.end() < other.begin() || this.begin() > other.end();
        }

        /**
        * Returns a new Timerange which covers the extents of this and
        * other combined.
        */
    }, {
        key: "extents",
        value: function extents(other) {
            var b = this.begin() < other.begin() ? this.begin() : other.begin();
            var e = this.end() > other.end() ? this.end() : other.end();
            return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
        }

        /**
        * Returns a new TimeRange which represents the intersection
        * (overlapping) part of this and other.
        */
    }, {
        key: "intersection",
        value: function intersection(other) {
            if (this.disjoint(other)) {
                return undefined;
            }
            var b = this.begin() > other.begin() ? this.begin() : other.begin();
            var e = this.end() < other.end() ? this.end() : other.end();
            return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
        }
    }, {
        key: "duration",
        value: function duration() {
            return this.end().getTime() - this.begin().getTime();
        }
    }, {
        key: "humanizeDuration",
        value: function humanizeDuration() {
            return _moment2["default"].duration(this.duration()).humanize();
        }

        //
        // Static TimeRange creators
        //

    }], [{
        key: "lastDay",
        value: function lastDay() {
            var beginTime = (0, _moment2["default"])();
            var endTime = beginTime.clone().subtract(24, "hours");
            return new TimeRange(beginTime, endTime);
        }
    }, {
        key: "lastSevenDays",
        value: function lastSevenDays() {
            var beginTime = (0, _moment2["default"])();
            var endTime = beginTime.clone().subtract(7, "days");
            return new TimeRange(beginTime, endTime);
        }
    }, {
        key: "lastThirtyDays",
        value: function lastThirtyDays() {
            var beginTime = (0, _moment2["default"])();
            var endTime = beginTime.clone().subtract(30, "days");
            return new TimeRange(beginTime, endTime);
        }
    }, {
        key: "lastNinetyDays",
        value: function lastNinetyDays() {
            var beginTime = (0, _moment2["default"])();
            var endTime = beginTime.clone().subtract(90, "days");
            return new TimeRange(beginTime, endTime);
        }
    }]);

    return TimeRange;
})();

exports["default"] = TimeRange;
module.exports = exports["default"];