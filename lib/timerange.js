/*
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Immutable = require("immutable");
const moment = require("moment");
const eventkey_1 = require("./eventkey");
const time_1 = require("./time");
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
class TimeRange extends eventkey_1.default {
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
                this._range = Immutable.List([
                    new Date(b.getTime()),
                    new Date(e.getTime())
                ]);
            }
            else if (moment.isMoment(b) && moment.isMoment(e)) {
                this._range = Immutable.List([
                    new Date(b.valueOf()),
                    new Date(e.valueOf())
                ]);
            }
            else if (time_1.default.isTime(b) && time_1.default.isTime(e)) {
                this._range = Immutable.List([
                    new Date(b.valueOf()),
                    new Date(e.valueOf())
                ]);
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
     * Returns the internal range, which is an Immutable.List of two elements
     * containing begin and end times as Dates.
     */
    internal() {
        return this._range;
    }
    /**
     * Returns the TimeRange as JSON, which will be a Javascript array
     * of two ms timestamps.
     */
    toJSON() {
        return [this.begin().getTime(), this.end().getTime()];
    }
    /**
     * Returns the TimeRange as a string, useful for serialization.
     *
     * @return {string} String representation of the TimeRange
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
    /**
     * Returns the TimeRange as a string expressed in local time
     */
    toLocalString() {
        return `[${this.begin()}, ${this.end()}]`;
    }
    /**
     * Returns the TimeRange as a string expressed in UTC time
     */
    toUTCString() {
        return `[${this.begin().toUTCString()}, ${this.end().toUTCString()}]`;
    }
    /**
     * Returns a human friendly version of the TimeRange, e.g.
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
     * Returns a human friendly version of the TimeRange
     * @example
     * "a few seconds ago to a month ago"
     */
    relativeString() {
        const begin = moment(this.begin());
        const end = moment(this.end());
        return `${begin.fromNow()} to ${end.fromNow()}`;
    }
    /**
     * Returns the begin time of the TimeRange.
     */
    begin() {
        return this._range.get(0);
    }
    /**
     * Returns the end time of the TimeRange.
     */
    end() {
        return this._range.get(1);
    }
    /**
     * Returns the midpoint of the TimeRange
     */
    mid() {
        return new Date((+this.begin() + +this.end()) / 2);
    }
    /**
     * Returns the midpoint of the TimeRange as the representitive
     * timestamp for the timerange.
     */
    timestamp() {
        return this.mid();
    }
    /**
     * Sets a new begin time on the TimeRange. The result will be
     * a new TimeRange.
     */
    setBegin(t) {
        return new TimeRange(this._range.set(0, t));
    }
    /**
     * Sets a new end time on the TimeRange. The result will be
     * a new TimeRange.
     */
    setEnd(t) {
        return new TimeRange(this._range.set(1, t));
    }
    /**
     * Returns if the two TimeRanges can be considered equal,
     * in that they have the same times.
     */
    equals(other) {
        return this.begin().getTime() === other.begin().getTime() &&
            this.end().getTime() === other.end().getTime();
    }
    contains(other) {
        if (_.isDate(other)) {
            return (this.begin() <= other &&
                this.end() >= other);
        }
        else {
            return (this.begin() <= other.begin() &&
                this.end() >= other.end());
        }
    }
    /**
     * Returns true if this TimeRange is completely within the supplied
     * other TimeRange.
     */
    within(other) {
        return this.begin() >= other.begin() && this.end() <= other.end();
    }
    /**
     * Returns true if the passed in other TimeRange overlaps
     * this time Range.
     */
    overlaps(other) {
        if (this.contains(other.begin()) && !this.contains(other.end()) ||
            this.contains(other.end()) && !this.contains(other.begin())) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Returns true if the passed in other TimeRange in no way
     * overlaps this TimeRange.
     */
    disjoint(other) {
        return this.end() < other.begin() || this.begin() > other.end();
    }
    /**
     * Returns a new Timerange which covers the extents of this and
     * other combined.
     */
    extents(other) {
        const b = this.begin() < other.begin() ? this.begin() : other.begin();
        const e = this.end() > other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }
    /**
     * Returns a new TimeRange which represents the intersection
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
     * Returns the duration of the TimeRange in milliseconds
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
    /**
     * The last
     */
    static last(period) {
        const end = new Date();
        const begin = new Date(+end - +period);
        return new TimeRange(begin, end);
    }
}
exports.default = TimeRange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RpbWVyYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7R0FRRzs7O0FBRUgsNEJBQTRCO0FBQzVCLHVDQUF1QztBQUN2QyxpQ0FBaUM7QUFHakMseUNBQWtDO0FBQ2xDLGlDQUEwQjtBQUcxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUVILGVBQWdCLFNBQVEsa0JBQVE7SUFxQjVCLFlBQVksSUFBVSxFQUFFLElBQVc7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFDUixFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztRQUM1QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDZixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDZixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQ3pCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFD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