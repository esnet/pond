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
const types_1 = require("./types");
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
        else if (arg1 instanceof Array) {
            const rangeArray = arg1;
            this._range = Immutable.List([new Date(rangeArray[0]), new Date(rangeArray[1])]);
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
     * Returns a `Time` that is either at the beginning,
     * middle or end of this `TimeRange`. Specify the alignment
     * of the output `Time` with the `align` parameter. This is
     * either:
     *  * TimeAlignment.Begin
     *  * TimeAlignment.Middle
     *  * TimeAlignment.End
     */
    toTime(align) {
        switch (align) {
            case types_1.TimeAlignment.Begin:
                return time_1.time(this.begin());
                break;
            case types_1.TimeAlignment.Middle:
                return time_1.time(this.mid());
                break;
            case types_1.TimeAlignment.End:
                return time_1.time(this.end());
                break;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RpbWVyYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUM1QixpQ0FBaUM7QUFHakMsK0JBQTRCO0FBQzVCLGlDQUFvQztBQUNwQyxtQ0FBd0M7QUFFeEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFhLFNBQVUsU0FBUSxTQUFHO0lBbUI5QixZQUFZLElBQVMsRUFBRSxJQUFVO1FBQzdCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxJQUFJLFlBQVksU0FBUyxFQUFFO1lBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDOUI7YUFBTSxJQUFJLElBQUksWUFBWSxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQ3ZDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztTQUMzQjthQUFNLElBQUksSUFBSSxZQUFZLEtBQUssRUFBRTtZQUM5QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BGO2FBQU07WUFDSCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDZixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDZixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFD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