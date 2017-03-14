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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TimeRange;
//# sourceMappingURL=timerange.js.map