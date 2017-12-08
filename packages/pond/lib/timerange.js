"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const _ = require("lodash");
const moment = require("moment");
const key_1 = require("./key");
const time_1 = require("./time");
/**
 * A `TimeRange` is a simple representation of a begin and end time, used
 * to maintain consistency across an application.
 *
 * You can define a `TimeRange` with `moments`, Javascript `Date objects
 * or `ms` since UNIX epoch. Here we construct one with two moments:
 *
 * ```js
 * var fmt = "YYYY-MM-DD HH:mm";
 * var beginTime = moment("2012-01-11 11:11", fmt);
 * var endTime =   moment("2012-02-22 12:12", fmt);
 * var range = new TimeRange(beginTime, endTime);
 * ```
 *
 * or with ms times:
 *
 * ```js
 * var range = new TimeRange([1326309060000, 1329941520000]);
 * ```
 */
class TimeRange extends key_1.Key {
    constructor(arg1, arg2) {
        super();
        if (arg1 instanceof TimeRange) {
            const other = arg1;
            this._range = other._range;
        }
        else if (arg1 instanceof Immutable.List) {
            const rangeList = arg1;
            this._range = rangeList;
        }
        else {
            const b = arg1;
            const e = arg2;
            if (_.isDate(b) && _.isDate(e)) {
                this._range = Immutable.List([new Date(b.getTime()), new Date(e.getTime())]);
            }
            else if (moment.isMoment(b) && moment.isMoment(e)) {
                this._range = Immutable.List([new Date(b.valueOf()), new Date(e.valueOf())]);
            }
            else if (time_1.Time.isTime(b) && time_1.Time.isTime(e)) {
                this._range = Immutable.List([new Date(b.valueOf()), new Date(e.valueOf())]);
            }
            else if (_.isNumber(b) && _.isNumber(e)) {
                this._range = Immutable.List([new Date(b), new Date(e)]);
            }
        }
    }
    type() {
        return "timerange";
    }
    /**
     * Returns the internal range, which is an `Immutable.List` of two elements
     * containing begin and end times as `Date`'s.
     */
    internal() {
        return this._range;
    }
    /**
     * Returns the `TimeRange` as JSON, which will be a Javascript array
     * of two `ms` timestamps.
     */
    toJSON() {
        return { timerange: [this.begin().getTime(), this.end().getTime()] };
    }
    /**
     * Returns the `TimeRange` as a string, useful for serialization.
     *
     * @return {string} String representation of the TimeRange
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
    /**
     * Returns the `TimeRange` as a string expressed in local time
     */
    toLocalString() {
        return `[${this.begin()}, ${this.end()}]`;
    }
    /**
     * Returns the `TimeRange` as a string expressed in UTC time
     */
    toUTCString() {
        return `[${this.begin().toUTCString()}, ${this.end().toUTCString()}]`;
    }
    /**
     * Returns a human friendly version of the `TimeRange`, e.g.
     * "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
     */
    humanize() {
        const begin = moment(this.begin());
        const end = moment(this.end());
        const beginStr = begin.format("MMM D, YYYY hh:mm:ss a");
        const endStr = end.format("MMM D, YYYY hh:mm:ss a");
        return `${beginStr} to ${endStr}`;
    }
    /**
     * Returns a human friendly version of the `TimeRange`
     * @example
     * Example: "a few seconds ago to a month ago"
     */
    relativeString() {
        const begin = moment(this.begin());
        const end = moment(this.end());
        return `${begin.fromNow()} to ${end.fromNow()}`;
    }
    /**
     * Returns the begin time of the `TimeRange`.
     */
    begin() {
        return this._range.get(0);
    }
    /**
     * Returns the end time of the `TimeRange`.
     */
    end() {
        return this._range.get(1);
    }
    /**
     * Returns the midpoint of the `TimeRange`.
     */
    mid() {
        return new Date((+this.begin() + +this.end()) / 2);
    }
    /**
     * Returns the midpoint of the `TimeRange` as the representitive
     * timestamp for the timerange.
     */
    timestamp() {
        return this.mid();
    }
    /**
     * Sets a new begin time on the `TimeRange`. The result will be
     * a new `TimeRange`.
     */
    setBegin(t) {
        return new TimeRange(this._range.set(0, t));
    }
    /**
     * Sets a new end time on the `TimeRange`. The result will be
     * a new `TimeRange`.
     */
    setEnd(t) {
        return new TimeRange(this._range.set(1, t));
    }
    /**
     * Returns if the two `TimeRange`'s can be considered equal,
     * in that they have the same times.
     */
    equals(other) {
        return (this.begin().getTime() === other.begin().getTime() &&
            this.end().getTime() === other.end().getTime());
    }
    /**
     * Determine if a `Date` or a `TimeRange` is contained entirely
     * within this `TimeRange`
     */
    contains(other) {
        if (_.isDate(other)) {
            return this.begin() <= other && this.end() >= other;
        }
        else {
            return this.begin() <= other.begin() && this.end() >= other.end();
        }
    }
    /**
     * Returns true if this `TimeRange` is completely within the supplied
     * other `TimeRange`.
     */
    within(other) {
        return this.begin() >= other.begin() && this.end() <= other.end();
    }
    /**
     * Returns true if the passed in other `TimeRange` overlaps
     * this `TimeRange`.
     */
    overlaps(other) {
        if ((this.contains(other.begin()) && !this.contains(other.end())) ||
            (this.contains(other.end()) && !this.contains(other.begin()))) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Returns true if the passed in other `TimeRange` in no way
     * overlaps this `TimeRange`.
     */
    disjoint(other) {
        return this.end() < other.begin() || this.begin() > other.end();
    }
    /**
     * Returns a new `Timerange` which covers the extents of this and
     * other combined.
     */
    extents(other) {
        const b = this.begin() < other.begin() ? this.begin() : other.begin();
        const e = this.end() > other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }
    /**
     * Returns a new `TimeRange` which represents the intersection
     * (overlapping) part of this and other.
     */
    intersection(other) {
        if (this.disjoint(other)) {
            return;
        }
        const b = this.begin() > other.begin() ? this.begin() : other.begin();
        const e = this.end() < other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }
    /**
     * Returns the duration of the `TimeRange` in milliseconds
     */
    duration() {
        return this.end().getTime() - this.begin().getTime();
    }
    /**
     * A user friendly version of the duration.
     */
    humanizeDuration() {
        return moment.duration(this.duration()).humanize();
    }
}
exports.TimeRange = TimeRange;
function timerange(arg1, arg2) {
    return new TimeRange(arg1, arg2);
}
exports.timerange = timerange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RpbWVyYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUM1QixpQ0FBaUM7QUFHakMsK0JBQTRCO0FBRTVCLGlDQUE4QjtBQUU5Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILGVBQXVCLFNBQVEsU0FBRztJQW1COUIsWUFBWSxJQUFTLEVBQUUsSUFBVTtRQUM3QixLQUFLLEVBQUUsQ0FBQztRQUNSLEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQzVCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNmLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNmLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxJQUFJO1FBQ0EsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUTtRQUNK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