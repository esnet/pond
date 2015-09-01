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
     * Returns the internal range, which is an Immutable List containing begin and end keys
     */

    _createClass(TimeRange, [{
        key: "range",
        value: function range() {
            return this._range;
        }

        //
        // Serialize
        //

    }, {
        key: "toJSON",
        value: function toJSON() {
            return [this.begin().getTime(), this.end().getTime()];
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }
    }, {
        key: "toLocalString",
        value: function toLocalString() {
            return "[" + this.begin() + ", " + this.end() + "]";
        }
    }, {
        key: "toUTCString",
        value: function toUTCString() {
            return "[" + this.begin().toUTCString() + ", " + this.end().toUTCString() + "]";
        }
    }, {
        key: "humanize",
        value: function humanize() {
            var begin = (0, _moment2["default"])(this.begin());
            var end = (0, _moment2["default"])(this.end());
            return begin.format("MMM D, YYYY hh:mm:ss a") + " to " + end.format("MMM D, YYYY hh:mm:ss a");
        }
    }, {
        key: "relativeString",
        value: function relativeString() {
            var begin = (0, _moment2["default"])(this.begin());
            var end = (0, _moment2["default"])(this.end());
            return begin.fromNow() + " to " + end.fromNow();
        }
    }, {
        key: "begin",
        value: function begin() {
            return this._range.get(0);
        }
    }, {
        key: "end",
        value: function end() {
            return this._range.get(1);
        }

        /**
         * Sets a new begin time on the TimeRange. The result will be a new TimeRange.
         *
         * @param {Date} - The begin time to set the start of the Timerange to.
         */
    }, {
        key: "setBegin",
        value: function setBegin(t) {
            return new TimeRange(this._range.set(0, t));
        }

        /**
         * Sets a new end time on the TimeRange. The result will be a new TimeRange.
         *
         * @param {Date} - The time to set the end of the Timerange to.
         */
    }, {
        key: "setEnd",
        value: function setEnd(t) {
            return new TimeRange(this._range.set(1, t));
        }

        /**
         * @returns {boolean} Returns if the two TimeRanges can be considered equal,
         *                    in that they have the same times.
         */
    }, {
        key: "equals",
        value: function equals(other) {
            return this.begin().getTime() === other.begin().getTime() && this.end().getTime() === other.end().getTime();
        }

        /**
         * @param {TimeRange|Date} - The other Range or Date to compare this to.
         * @returns {boolean} Returns true if other is completely inside this.
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
         * @param - The other Range to compare this to.
         * @returns {boolean} Returns true if this TimeRange is completely within the supplied other TimeRange.
         */
    }, {
        key: "within",
        value: function within(other) {
            return this.begin() >= other.begin() && this.end() <= other.end();
        }

        /**
         * @param - The other Range to compare this to.
         * @returns {boolean} Returns true if the passed in other TimeRange overlaps this time Range.
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
         * @param - The other Range to compare this to.
         * @returns {boolean} Returns true if the passed in other Range in no way
         * overlaps this time Range.
         */
    }, {
        key: "disjoint",
        value: function disjoint(other) {
            return this.end() < other.begin() || this.begin() > other.end();
        }

        /**
        * Returns a new Timerange which covers the extents of this and other combined.
        *
        * @param - The other Range to take the Union with.
        * @returns {TimeRange} Returns a new Range that is the union of this and other.
        */
    }, {
        key: "extents",
        value: function extents(other) {
            var b = this.begin() < other.begin() ? this.begin() : other.begin();
            var e = this.end() > other.end() ? this.end() : other.end();
            return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
        }

        /**
        * Returns a new TimeRange which is the intersection of this and other.
        * @param - The other TimeRange to take the intersection with.
        * @returns {TimeRange} Returns a new TimeRange which represents the intersection
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