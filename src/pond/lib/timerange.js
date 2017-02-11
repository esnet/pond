/*
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";

import moment from "moment";

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
class TimeRange {
    /**
     * Builds a new TimeRange which may be of several different formats:
     *   - Another TimeRange (copy constructor)
     *   - An Immutable.List containing two Dates.
     *   - A Javascript array containing two Date or ms timestamps
     *   - Two arguments, begin and end, each of which may be a Data,
     *     a Moment, or a ms timestamp.
     */
    constructor(arg1, arg2) {
        if (arg1 instanceof TimeRange) {
            const other = arg1;
            this._range = other._range;
        } else if (arg1 instanceof Immutable.List) {
            const rangeList = arg1;
            this._range = rangeList;
        } else if (_.isArray(arg1)) {
            const rangeArray = arg1;
            this._range = new Immutable.List([
                new Date(rangeArray[0]),
                new Date(rangeArray[1])
            ]);
        } else {
            const b = arg1;
            const e = arg2;
            if (_.isDate(b) && _.isDate(e)) {
                this._range = new Immutable.List([
                    new Date(b.getTime()),
                    new Date(e.getTime())
                ]);
            } else if (moment.isMoment(b) && moment.isMoment(e)) {
                this._range = new Immutable.List([
                    new Date(b.valueOf()),
                    new Date(e.valueOf())
                ]);
            } else if (_.isNumber(b) && _.isNumber(e)) {
                this._range = new Immutable.List([new Date(b), new Date(e)]);
            }
        }
    }

    /**
     * Returns the internal range, which is an Immutable List containing
     * begin and end times.
     *
     * @return {Immutable.List} List containing the begin and end of the time range.
     */
    range() {
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
     *
     * @return {string} String representation of the TimeRange
     */
    toLocalString() {
        return `[${this.begin()}, ${this.end()}]`;
    }

    /**
     * Returns the TimeRange as a string expressed in UTC time
     *
     * @return {string} String representation of the TimeRange
     */
    toUTCString() {
        return `[${this.begin().toUTCString()}, ${this.end().toUTCString()}]`;
    }

    /**
     * Returns a human friendly version of the TimeRange, e.g.
     * "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
     *
     * @return {string} Human friendly string representation of the TimeRange
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
     *
     * @return {string} Human friendly string representation of the TimeRange
     */
    relativeString() {
        const begin = moment(this.begin());
        const end = moment(this.end());
        return `${begin.fromNow()} to ${end.fromNow()}`;
    }

    /**
     * Returns the begin time of the TimeRange.
     *
     * @return {Date} The begin time of the TimeRange
     */
    begin() {
        return this._range.get(0);
    }

    /**
     * Returns the end time of the TimeRange.
     *
     * @return {Date} The end time of the TimeRange
     */
    end() {
        return this._range.get(1);
    }

    /**
     * Sets a new begin time on the TimeRange. The result will be
     * a new TimeRange.
     *
     * @param {Date} t Time to set the begin time to
     * @return {TimeRange} The new mutated TimeRange
     */
    setBegin(t) {
        return new TimeRange(this._range.set(0, t));
    }

    /**
     * Sets a new end time on the TimeRange. The result will be
     * a new TimeRange.
     *
     * @param {Date} t Time to set the end time to
     * @return {TimeRange} The new mutated TimeRange
     */
    setEnd(t) {
        return new TimeRange(this._range.set(1, t));
    }

    /**
     * Returns if the two TimeRanges can be considered equal,
     * in that they have the same times.
     *
     * @param {TimeRange} other The TimeRange to compare to
     * @return {boolean} Result
     */
    equals(other) {
        return this.begin().getTime() === other.begin().getTime() &&
            this.end().getTime() === other.end().getTime();
    }

    /**
     * Returns true if other is completely inside this.
     *
     * @param {TimeRange} other The TimeRange to compare to
     * @return {boolean} Result
     */
    contains(other) {
        if (_.isDate(other)) {
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
    within(other) {
        return this.begin() >= other.begin() && this.end() <= other.end();
    }

    /**
     * Returns true if the passed in other TimeRange overlaps this time Range.
     *
     * @param {TimeRange} other The TimeRange to compare to
     * @return {boolean} Result
     */
    overlaps(other) {
        if (
            this.contains(other.begin()) && !this.contains(other.end()) ||
                this.contains(other.end()) && !this.contains(other.begin())
        ) {
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
    disjoint(other) {
        return this.end() < other.begin() || this.begin() > other.end();
    }

    /**
     * @param {TimeRange} other The TimeRange to extend with
     * @return {TimeRange} a new Timerange which covers the extents of this and
     * other combined.
     */
    extents(other) {
        const b = this.begin() < other.begin() ? this.begin() : other.begin();
        const e = this.end() > other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }

    /**
     * @param {TimeRange} other The TimeRange to intersect with
     * @return {TimeRange} A new TimeRange which represents the intersection
     * (overlapping) part of this and other.
     */
    intersection(other) {
        if (this.disjoint(other)) {
            return undefined;
        }
        const b = this.begin() > other.begin() ? this.begin() : other.begin();
        const e = this.end() < other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }

    /**
     * @return {number} The duration of the TimeRange in milliseconds
     */
    duration() {
        return this.end().getTime() - this.begin().getTime();
    }

    /**
     * @return {string} A user friendly version of the duration.
     */
    humanizeDuration() {
        return moment.duration(this.duration()).humanize();
    }

    //
    // Static TimeRange creators
    //
    /**
     * @return {TimeRange} The last day, as a TimeRange
     */
    static lastDay() {
        const endTime = moment();
        const beginTime = endTime.clone().subtract(24, "hours");
        return new TimeRange(beginTime, endTime);
    }

    /**
     * @return {TimeRange} The last seven days, as a TimeRange
     */
    static lastSevenDays() {
        const endTime = moment();
        const beginTime = endTime.clone().subtract(7, "days");
        return new TimeRange(beginTime, endTime);
    }

    /**
     * @return {TimeRange} The last thirty days, as a TimeRange
     */
    static lastThirtyDays() {
        const endTime = moment();
        const beginTime = endTime.clone().subtract(30, "days");
        return new TimeRange(beginTime, endTime);
    }

    /**
     * @return {TimeRange} The last month, as a TimeRange
     */
    static lastMonth() {
        const endTime = moment();
        const beginTime = endTime.clone().subtract(1, "month");
        return new TimeRange(beginTime, endTime);
    }

    /**
     * @return {TimeRange} The last 90 days, as a TimeRange
     */
    static lastNinetyDays() {
        const endTime = moment();
        const beginTime = endTime.clone().subtract(90, "days");
        return new TimeRange(beginTime, endTime);
    }

    /**
     * @return {TimeRange} The last year, as a TimeRange
     */
    static lastYear() {
        const endTime = moment();
        const beginTime = endTime.clone().subtract(1, "year");
        return new TimeRange(beginTime, endTime);
    }
}

export default TimeRange;
