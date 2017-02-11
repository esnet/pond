"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
A time range is a simple representation of a begin and end time, used
to maintain consistency across an application.

### Construction

You can define a TimeRange with moments, Javascript Date objects
or ms since UNIX epoch. Here we construct one with two moments:

```js
var fmt = "YYYY-MM-DD HH:mm";
var beginTime = moment("2012-01-11 11:11", fmt);
var endTime =   moment("2012-02-22 12:12", fmt);
var range = new TimeRange(beginTime, endTime);
```

or with ms times:

```js
var range = new TimeRange([1326309060000, 1329941520000]);
```

 */
var TimeRange = function () {
    /**
     * Builds a new TimeRange which may be of several different formats:
     *   - Another TimeRange (copy constructor)
     *   - An Immutable.List containing two Dates.
     *   - A Javascript array containing two Date or ms timestamps
     *   - Two arguments, begin and end, each of which may be a Data,
     *     a Moment, or a ms timestamp.
     */
    function TimeRange(arg1, arg2) {
        (0, _classCallCheck3.default)(this, TimeRange);

        if (arg1 instanceof TimeRange) {
            var other = arg1;
            this._range = other._range;
        } else if (arg1 instanceof _immutable2.default.List) {
            var rangeList = arg1;
            this._range = rangeList;
        } else if (_underscore2.default.isArray(arg1)) {
            var rangeArray = arg1;
            this._range = new _immutable2.default.List([new Date(rangeArray[0]), new Date(rangeArray[1])]);
        } else {
            var b = arg1;
            var e = arg2;
            if (_underscore2.default.isDate(b) && _underscore2.default.isDate(e)) {
                this._range = new _immutable2.default.List([new Date(b.getTime()), new Date(e.getTime())]);
            } else if (_moment2.default.isMoment(b) && _moment2.default.isMoment(e)) {
                this._range = new _immutable2.default.List([new Date(b.valueOf()), new Date(e.valueOf())]);
            } else if (_underscore2.default.isNumber(b) && _underscore2.default.isNumber(e)) {
                this._range = new _immutable2.default.List([new Date(b), new Date(e)]);
            }
        }
    }

    /**
     * Returns the internal range, which is an Immutable List containing
     * begin and end times.
     *
     * @return {Immutable.List} List containing the begin and end of the time range.
     */


    (0, _createClass3.default)(TimeRange, [{
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
         *
         * @return {number[]} JSON representation of the TimeRange
         */

    }, {
        key: "toJSON",
        value: function toJSON() {
            return [this.begin().getTime(), this.end().getTime()];
        }

        /**
         * Returns the TimeRange as a string, useful for serialization.
         *
         * @return {string} String representation of the TimeRange
         */

    }, {
        key: "toString",
        value: function toString() {
            return (0, _stringify2.default)(this.toJSON());
        }

        /**
         * Returns the TimeRange as a string expressed in local time
         *
         * @return {string} String representation of the TimeRange
         */

    }, {
        key: "toLocalString",
        value: function toLocalString() {
            return "[" + this.begin() + ", " + this.end() + "]";
        }

        /**
         * Returns the TimeRange as a string expressed in UTC time
         *
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
         *
         * @return {string} Human friendly string representation of the TimeRange
         */

    }, {
        key: "humanize",
        value: function humanize() {
            var begin = (0, _moment2.default)(this.begin());
            var end = (0, _moment2.default)(this.end());
            var beginStr = begin.format("MMM D, YYYY hh:mm:ss a");
            var endStr = end.format("MMM D, YYYY hh:mm:ss a");

            return beginStr + " to " + endStr;
        }

        /**
         * Returns a human friendly version of the TimeRange
         * @example
         * "a few seconds ago to a month ago"
         *
         * @return {string} Human friendly string representation of the TimeRange
         */

    }, {
        key: "relativeString",
        value: function relativeString() {
            var begin = (0, _moment2.default)(this.begin());
            var end = (0, _moment2.default)(this.end());
            return begin.fromNow() + " to " + end.fromNow();
        }

        /**
         * Returns the begin time of the TimeRange.
         *
         * @return {Date} The begin time of the TimeRange
         */

    }, {
        key: "begin",
        value: function begin() {
            return this._range.get(0);
        }

        /**
         * Returns the end time of the TimeRange.
         *
         * @return {Date} The end time of the TimeRange
         */

    }, {
        key: "end",
        value: function end() {
            return this._range.get(1);
        }

        /**
         * Sets a new begin time on the TimeRange. The result will be
         * a new TimeRange.
         *
         * @param {Date} t Time to set the begin time to
         * @return {TimeRange} The new mutated TimeRange
         */

    }, {
        key: "setBegin",
        value: function setBegin(t) {
            return new TimeRange(this._range.set(0, t));
        }

        /**
         * Sets a new end time on the TimeRange. The result will be
         * a new TimeRange.
         *
         * @param {Date} t Time to set the end time to
         * @return {TimeRange} The new mutated TimeRange
         */

    }, {
        key: "setEnd",
        value: function setEnd(t) {
            return new TimeRange(this._range.set(1, t));
        }

        /**
         * Returns if the two TimeRanges can be considered equal,
         * in that they have the same times.
         *
         * @param {TimeRange} other The TimeRange to compare to
         * @return {boolean} Result
         */

    }, {
        key: "equals",
        value: function equals(other) {
            return this.begin().getTime() === other.begin().getTime() && this.end().getTime() === other.end().getTime();
        }

        /**
         * Returns true if other is completely inside this.
         *
         * @param {TimeRange} other The TimeRange to compare to
         * @return {boolean} Result
         */

    }, {
        key: "contains",
        value: function contains(other) {
            if (_underscore2.default.isDate(other)) {
                return this.begin() <= other && this.end() >= other;
            } else {
                return this.begin() <= other.begin() && this.end() >= other.end();
            }
            return false;
        }

        /**
         * Returns true if this TimeRange is completely within the supplied
         * other TimeRange.
         *
         * @param {TimeRange} other The TimeRange to compare to
         * @return {boolean} Result
         */

    }, {
        key: "within",
        value: function within(other) {
            return this.begin() >= other.begin() && this.end() <= other.end();
        }

        /**
         * Returns true if the passed in other TimeRange overlaps this time Range.
         *
         * @param {TimeRange} other The TimeRange to compare to
         * @return {boolean} Result
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
         *
         * @param {TimeRange} other The TimeRange to compare to
         * @return {boolean} Result
         */

    }, {
        key: "disjoint",
        value: function disjoint(other) {
            return this.end() < other.begin() || this.begin() > other.end();
        }

        /**
         * @param {TimeRange} other The TimeRange to extend with
         * @return {TimeRange} a new Timerange which covers the extents of this and
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
         * @param {TimeRange} other The TimeRange to intersect with
         * @return {TimeRange} A new TimeRange which represents the intersection
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

        /**
         * @return {number} The duration of the TimeRange in milliseconds
         */

    }, {
        key: "duration",
        value: function duration() {
            return this.end().getTime() - this.begin().getTime();
        }

        /**
         * @return {string} A user friendly version of the duration.
         */

    }, {
        key: "humanizeDuration",
        value: function humanizeDuration() {
            return _moment2.default.duration(this.duration()).humanize();
        }

        //
        // Static TimeRange creators
        //
        /**
         * @return {TimeRange} The last day, as a TimeRange
         */

    }], [{
        key: "lastDay",
        value: function lastDay() {
            var endTime = (0, _moment2.default)();
            var beginTime = endTime.clone().subtract(24, "hours");
            return new TimeRange(beginTime, endTime);
        }

        /**
         * @return {TimeRange} The last seven days, as a TimeRange
         */

    }, {
        key: "lastSevenDays",
        value: function lastSevenDays() {
            var endTime = (0, _moment2.default)();
            var beginTime = endTime.clone().subtract(7, "days");
            return new TimeRange(beginTime, endTime);
        }

        /**
         * @return {TimeRange} The last thirty days, as a TimeRange
         */

    }, {
        key: "lastThirtyDays",
        value: function lastThirtyDays() {
            var endTime = (0, _moment2.default)();
            var beginTime = endTime.clone().subtract(30, "days");
            return new TimeRange(beginTime, endTime);
        }

        /**
         * @return {TimeRange} The last month, as a TimeRange
         */

    }, {
        key: "lastMonth",
        value: function lastMonth() {
            var endTime = (0, _moment2.default)();
            var beginTime = endTime.clone().subtract(1, "month");
            return new TimeRange(beginTime, endTime);
        }

        /**
         * @return {TimeRange} The last 90 days, as a TimeRange
         */

    }, {
        key: "lastNinetyDays",
        value: function lastNinetyDays() {
            var endTime = (0, _moment2.default)();
            var beginTime = endTime.clone().subtract(90, "days");
            return new TimeRange(beginTime, endTime);
        }

        /**
         * @return {TimeRange} The last year, as a TimeRange
         */

    }, {
        key: "lastYear",
        value: function lastYear() {
            var endTime = (0, _moment2.default)();
            var beginTime = endTime.clone().subtract(1, "year");
            return new TimeRange(beginTime, endTime);
        }
    }]);
    return TimeRange;
}(); /*
      *  Copyright (c) 2015-2017, The Regents of the University of California,
      *  through Lawrence Berkeley National Laboratory (subject to receipt
      *  of any required approvals from the U.S. Dept. of Energy).
      *  All rights reserved.
      *
      *  This source code is licensed under the BSD-style license found in the
      *  LICENSE file in the root directory of this source tree.
      */

exports.default = TimeRange;