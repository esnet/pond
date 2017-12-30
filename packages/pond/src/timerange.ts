/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as Immutable from "immutable";
import * as _ from "lodash";
import * as moment from "moment";
import Moment = moment.Moment;

import { Key } from "./key";
import { Period } from "./period";
import { Time } from "./time";

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
export class TimeRange extends Key {
    /**
     * Internally, the timerange is stored as an Immutable.List
     */
    private _range: Immutable.List<Date>;

    /**
     * Builds a new `TimeRange` which may be of several different formats:
     *   - Another `TimeRange` (copy constructor)
     *   - An `Immutable.List` containing two Dates.
     *   - A Javascript array containing two millisecond timestamps
     *   - Two arguments, `begin` and `end`, each of which may be a `Date`,
     *     a `Moment`, or a millisecond timestamp.
     */
    constructor(arg: TimeRange | Immutable.List<Date> | number[]);
    constructor(begin: Date, end: Date);
    constructor(begin: Time, end: Time);
    constructor(begin: Moment, end: Moment);
    constructor(begin: number, end: number);
    constructor(arg1: any, arg2?: any) {
        super();
        if (arg1 instanceof TimeRange) {
            const other = arg1;
            this._range = other._range;
        } else if (arg1 instanceof Immutable.List) {
            const rangeList = arg1;
            this._range = rangeList;
        } else if (arg1 instanceof Array) {
            const rangeArray = arg1;
            this._range = Immutable.List([new Date(rangeArray[0]), new Date(rangeArray[1])]);
        } else {
            const b = arg1;
            const e = arg2;
            if (_.isDate(b) && _.isDate(e)) {
                this._range = Immutable.List([new Date(b.getTime()), new Date(e.getTime())]);
            } else if (moment.isMoment(b) && moment.isMoment(e)) {
                this._range = Immutable.List([new Date(b.valueOf()), new Date(e.valueOf())]);
            } else if (Time.isTime(b) && Time.isTime(e)) {
                this._range = Immutable.List([new Date(b.valueOf()), new Date(e.valueOf())]);
            } else if (_.isNumber(b) && _.isNumber(e)) {
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
    internal(): Immutable.List<Date> {
        return this._range;
    }

    /**
     * Returns the `TimeRange` as JSON, which will be a Javascript array
     * of two `ms` timestamps.
     */
    toJSON(): {} {
        return { timerange: [this.begin().getTime(), this.end().getTime()] };
    }

    /**
     * Returns the `TimeRange` as a string, useful for serialization.
     *
     * @return {string} String representation of the TimeRange
     */
    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the `TimeRange` as a string expressed in local time
     */
    toLocalString(): string {
        return `[${this.begin()}, ${this.end()}]`;
    }

    /**
     * Returns the `TimeRange` as a string expressed in UTC time
     */
    toUTCString(): string {
        return `[${this.begin().toUTCString()}, ${this.end().toUTCString()}]`;
    }

    /**
     * Returns a human friendly version of the `TimeRange`, e.g.
     * "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
     */
    humanize(): string {
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
    relativeString(): string {
        const begin = moment(this.begin());
        const end = moment(this.end());
        return `${begin.fromNow()} to ${end.fromNow()}`;
    }

    /**
     * Returns the begin time of the `TimeRange`.
     */
    begin(): Date {
        return this._range.get(0);
    }

    /**
     * Returns the end time of the `TimeRange`.
     */
    end(): Date {
        return this._range.get(1);
    }

    /**
     * Returns the midpoint of the `TimeRange`.
     */
    mid(): Date {
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
    setBegin(t: Date): TimeRange {
        return new TimeRange(this._range.set(0, t));
    }

    /**
     * Sets a new end time on the `TimeRange`. The result will be
     * a new `TimeRange`.
     */
    setEnd(t: Date): TimeRange {
        return new TimeRange(this._range.set(1, t));
    }

    /**
     * Returns if the two `TimeRange`'s can be considered equal,
     * in that they have the same times.
     */
    equals(other: TimeRange): boolean {
        return (
            this.begin().getTime() === other.begin().getTime() &&
            this.end().getTime() === other.end().getTime()
        );
    }

    /**
     * Determine if a `Date` or a `TimeRange` is contained entirely
     * within this `TimeRange`
     */
    contains(other: Date | TimeRange): boolean {
        if (_.isDate(other)) {
            return this.begin() <= other && this.end() >= other;
        } else {
            return this.begin() <= other.begin() && this.end() >= other.end();
        }
    }

    /**
     * Returns true if this `TimeRange` is completely within the supplied
     * other `TimeRange`.
     */
    within(other: TimeRange): boolean {
        return this.begin() >= other.begin() && this.end() <= other.end();
    }

    /**
     * Returns true if the passed in other `TimeRange` overlaps
     * this `TimeRange`.
     */
    overlaps(other: TimeRange): boolean {
        if (
            (this.contains(other.begin()) && !this.contains(other.end())) ||
            (this.contains(other.end()) && !this.contains(other.begin()))
        ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns true if the passed in other `TimeRange` in no way
     * overlaps this `TimeRange`.
     */
    disjoint(other: TimeRange): boolean {
        return this.end() < other.begin() || this.begin() > other.end();
    }

    /**
     * Returns a new `Timerange` which covers the extents of this and
     * other combined.
     */
    extents(other: TimeRange): TimeRange {
        const b = this.begin() < other.begin() ? this.begin() : other.begin();
        const e = this.end() > other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }

    /**
     * Returns a new `TimeRange` which represents the intersection
     * (overlapping) part of this and other.
     */
    intersection(other: TimeRange): TimeRange | void {
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
    duration(): number {
        return this.end().getTime() - this.begin().getTime();
    }

    /**
     * A user friendly version of the duration.
     */
    humanizeDuration(): string {
        return moment.duration(this.duration()).humanize();
    }
}

/**
 * A `Timerange` is a simple representation of a begin and end time, used
 * to maintain consistency across an application.
 */
function timerange(arg: TimeRange | Immutable.List<Date> | number[]);
function timerange(begin: Date, end: Date);
function timerange(begin: Time, end: Time);
function timerange(begin: Moment, end: Moment);
function timerange(begin: number, end: number);
function timerange(arg1: any, arg2?: any) {
    return new TimeRange(arg1, arg2);
}

export { timerange };
