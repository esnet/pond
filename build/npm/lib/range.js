"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("underscore");
var Immutable = require("immutable");
var moment = require("moment");

var TimeRange = (function () {
    function TimeRange(arg1, arg2) {
        _classCallCheck(this, TimeRange);

        if (arg1 instanceof TimeRange) {
            var other = arg1;
            this._range = other._range;
        } else if (arg1 instanceof Immutable.List) {
            var rangeList = arg1;
            this._range = rangeList;
        } else if (_.isArray(arg1)) {
            var rangeArray = arg1;
            this._range = Immutable.List([new Date(rangeArray[0]), new Date(rangeArray[1])]);
        } else {
            var b = arg1;
            var e = arg2;
            if (_.isDate(b) && _.isDate(e)) {
                this._range = Immutable.List([new Date(b.getTime()), new Date(e.getTime())]);
            } else if (moment.isMoment(b) && moment.isMoment(e)) {
                this._range = Immutable.List([new Date(b.valueOf()), new Date(e.valueOf())]);
            } else if (_.isNumber(b) && _.isNumber(e)) {
                this._range = Immutable.List([new Date(b), new Date(e)]);
            }
        }
    }

    _createClass(TimeRange, [{
        key: "range",

        /**
         * Returns the internal range, which is an Immutable List containing begin and end keys
         */
        value: function range() {
            return this._range;
        }
    }, {
        key: "toJSON",

        //
        // Serialize
        //

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
            return "[" + this.begin().toString() + ", " + this.end().toString() + "]";
        }
    }, {
        key: "toUTCString",
        value: function toUTCString() {
            return "[" + this.begin().toUTCString() + ", " + this.end().toUTCString() + "]";
        }
    }, {
        key: "humanize",
        value: function humanize() {
            var begin = new moment(this.begin());
            var end = new moment(this.end());
            return "" + begin.format("MMM D, YYYY hh:mm:ss a") + " to " + end.format("MMM D, YYYY hh:mm:ss a");
        }
    }, {
        key: "relativeString",
        value: function relativeString() {
            var begin = new moment(this.begin());
            var end = new moment(this.end());
            return "" + begin.fromNow() + " to " + end.fromNow();
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
    }, {
        key: "setBegin",

        /**
         * Sets a new begin time on the TimeRange. The result will be a new TimeRange.
         *
         * @param {Date} - The begin time to set the start of the Timerange to.
         */
        value: function setBegin(t) {
            return new TimeRange(this._range.set(0, t));
        }
    }, {
        key: "setEnd",

        /**
         * Sets a new end time on the TimeRange. The result will be a new TimeRange.
         *
         * @param {Date} - The time to set the end of the Timerange to.
         */
        value: function setEnd(t) {
            return new TimeRange(this._range.set(1, t));
        }
    }, {
        key: "equals",

        /**
         * @returns {boolean} Returns if the two TimeRanges can be considered equal,
         *                    in that they have the same times.
         */
        value: function equals(other) {
            return this.begin() === other.begin() && this.end() === other.end();
        }
    }, {
        key: "contains",

        /**
         * @param {TimeRange|Date} - The other Range or Date to compare this to.
         * @returns {boolean} Returns true if other is completely inside this.
         */
        value: function contains(other) {
            if (_.isDate(other)) {
                return this.begin() <= other && this.end() >= other;
            } else {
                return this.begin() <= other.begin() && this.end() >= other.end();
            }
            return false;
        }
    }, {
        key: "within",

        /**
         * @param - The other Range to compare this to.
         * @returns {boolean} Returns true if this TimeRange is completely within the supplied other TimeRange.
         */
        value: function within(other) {
            return this.begin() >= other.begin() && this.end() <= other.end();
        }
    }, {
        key: "overlaps",

        /**
         * @param - The other Range to compare this to.
         * @returns {boolean} Returns true if the passed in other TimeRange overlaps this time Range.
         */
        value: function overlaps(other) {
            if (this.contains(other.begin()) && !this.contains(other.end()) || this.contains(other.end()) && !this.contains(other.begin())) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "disjoint",

        /**
         * @param - The other Range to compare this to.
         * @returns {boolean} Returns true if the passed in other Range in no way
         * overlaps this time Range.
         */
        value: function disjoint(other) {
            return this.end() < other.begin() || this.begin() > other.end();
        }
    }, {
        key: "extents",

        /**
        * Returns a new Timerange which covers the extents of this and other combined.
        *
        * @param - The other Range to take the Union with.
        * @returns {TimeRange} Returns a new Range that is the union of this and other.
        */
        value: function extents(other) {
            var b = this.begin() < other.begin() ? this.begin() : other.begin();
            var e = this.end() > other.end() ? this.end() : other.end();
            return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
        }
    }, {
        key: "intersection",

        /**
        * Returns a new TimeRange which is the intersection of this and other.
        * @param - The other TimeRange to take the intersection with.
        * @returns {TimeRange} Returns a new TimeRange which represents the intersection
        * (overlapping) part of this and other.
        */
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
            return moment.duration(this.duration()).humanize();
        }
    }], [{
        key: "lastDay",

        //
        // Static TimeRange creators
        //

        value: function lastDay(thing) {
            var beginTime = moment();
            var endTime = beginTime.clone().subtract(24, "hours");
            return new TimeRange(beginTime, endTime);
        }
    }, {
        key: "lastSevenDays",
        value: function lastSevenDays(thing) {
            var beginTime = moment();
            var endTime = beginTime.clone().subtract(7, "days");
            return new TimeRange(beginTime, endTime);
        }
    }, {
        key: "lastThirtyDays",
        value: function lastThirtyDays(thing) {
            var beginTime = moment();
            var endTime = beginTime.clone().subtract(30, "days");
            return new TimeRange(beginTime, endTime);
        }
    }, {
        key: "lastNinetyDays",
        value: function lastNinetyDays(thing) {
            var beginTime = moment();
            var endTime = beginTime.clone().subtract(90, "days");
            return new TimeRange(beginTime, endTime);
        }
    }]);

    return TimeRange;
})();

module.exports = TimeRange;