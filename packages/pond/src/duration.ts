/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as _ from "lodash";
import * as moment from "moment";

const UNITS: { [key: string]: number } = {
    nanoseconds: 1 / 1000 / 1000,
    microseconds: 1 / 1000,
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7
};

const SHORT_UNITS: { [key: string]: number } = {
    n: 1 / 1000 / 1000,
    u: 1 / 1000,
    l: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7
};

/**
 * A `Duration` is a fixed length of time, unattached to any point in time.
 *
 * It is typically used in combination with a `Period` to describe an aggregation
 * window. For example a `period(duration("1d"))` would indicate windows that are
 * a day long.
 */
export class Duration {
    private _duration: number;
    private _string: string;

    /**
     * There are a number of ways to construct a duration:
     *  * Passing a number to the constructor will be considered milliseconds
     *  * Passing a string to the constuctor will be considered a duration string, with a
     *    format of `%d[s|m|h|d]`
     *  * Passing a number and a string will be considered a quantity and a unit.
     *    The string should be one of: "milliseconds", "seconds", "minutes", "hours",
     *    "days" or "weeks"
     *  * Finally, you can pass either a `moment.Duration` or a `Moment.Duration-like`
     *    object to the constructor
     *
     * Example 1
     * ```
     * const thirtyMinutes = duration("30m";
     * ```
     *
     * Example 2:
     * ```
     * const dayDuration = duration(24, "hours");
     * ```
     *
     * Example 3:
     * ```
     * const p = duration({
     *     seconds: 2,
     *     minutes: 2,
     *     hours: 2,
     *     days: 2,
     *     weeks: 2,
     *     months: 2,
     *     years: 2
     * });
     * ```
     * In all cases you can use `new Duration()` or the factory function `duration()`.
     */
    constructor(arg1: number | string, arg2?: string) {
        if (_.isNumber(arg1)) {
            if (!arg2) {
                this._duration = arg1;
            } else if (_.isString(arg2) && _.has(UNITS, arg2)) {
                const multiplier = arg1;
                this._duration = multiplier * UNITS[arg2];
            } else {
                throw new Error("Unknown arguments pssed to Duration constructor");
            }
        } else if (_.isString(arg1)) {
            this._string = arg1;
            let multiplier: number;
            let unit: string;
            const regex = /([0-9]+)([nulsmhdw])/;
            const parts = regex.exec(arg1);
            if (parts && parts.length >= 3) {
                multiplier = parseInt(parts[1], 10);
                unit = parts[2];
                this._duration = multiplier * SHORT_UNITS[unit];
            }
        } else if (moment.isDuration(arg1)) {
            const d = arg1 as moment.Duration;
            this._string = d.toISOString();
            this._duration = d.asMilliseconds();
        } else if (_.isObject(arg1)) {
            const d = moment.duration(arg1);
            this._string = d.toISOString();
            this._duration = d.asMilliseconds();
        } else {
            throw new Error("Unknown arguments pssed to Duration constructor");
        }
    }

    /**
     * Returns a string for the `Duration`. If the `Duration` was originally
     * defined with a string then that string is returned. If defined with a `Moment.duration`
     * then Moment's `toISOString()` is used. Otherwise this falls back to a millisecond
     * representation.
     */
    toString(): string {
        if (this._string) {
            return this._string;
        }
        return `${this._duration}ms`;
    }

    /**
     * Returns the number of milliseconds for this `Duration`.
     *
     * Example:
     * ```
     * const p = duration(moment.duration(24, "hours"));
     * console.log(+p) // 86400000
     */
    valueOf(): number {
        return this._duration;
    }
}

function durationFactory(d: number | string, arg2?: string);
function durationFactory(arg1: number, arg2: string);
function durationFactory(arg1: object | moment.Duration);
function durationFactory(arg1?: any, arg2?: any): Duration {
    return new Duration(arg1, arg2);
}

export { durationFactory as duration };
