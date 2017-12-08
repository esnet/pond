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
const _ = require("lodash");
const moment = require("moment");
const UNITS = {
    nanoseconds: 1 / 1000 / 1000,
    microseconds: 1 / 1000,
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7
};
const SHORT_UNITS = {
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
class Duration {
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
    constructor(arg1, arg2) {
        if (_.isNumber(arg1)) {
            if (!arg2) {
                this._duration = arg1;
            }
            else if (_.isString(arg2) && _.has(UNITS, arg2)) {
                const multiplier = arg1;
                this._duration = multiplier * UNITS[arg2];
            }
            else {
                throw new Error("Unknown arguments pssed to Duration constructor");
            }
        }
        else if (_.isString(arg1)) {
            this._string = arg1;
            let multiplier;
            let unit;
            const regex = /([0-9]+)([nulsmhdw])/;
            const parts = regex.exec(arg1);
            if (parts && parts.length >= 3) {
                multiplier = parseInt(parts[1], 10);
                unit = parts[2];
                this._duration = multiplier * SHORT_UNITS[unit];
            }
        }
        else if (moment.isDuration(arg1)) {
            const d = arg1;
            this._string = d.toISOString();
            this._duration = d.asMilliseconds();
        }
        else if (_.isObject(arg1)) {
            const d = moment.duration(arg1);
            this._string = d.toISOString();
            this._duration = d.asMilliseconds();
        }
        else {
            throw new Error("Unknown arguments pssed to Duration constructor");
        }
    }
    /**
     * Returns a string for the `Duration`. If the `Duration` was originally
     * defined with a string then that string is returned. If defined with a `Moment.duration`
     * then Moment's `toISOString()` is used. Otherwise this falls back to a millisecond
     * representation.
     */
    toString() {
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
    valueOf() {
        return this._duration;
    }
}
exports.Duration = Duration;
function durationFactory(arg1, arg2) {
    return new Duration(arg1, arg2);
}
exports.duration = durationFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZHVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILDRCQUE0QjtBQUM1QixpQ0FBaUM7QUFFakMsTUFBTSxLQUFLLEdBQThCO0lBQ3JDLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUk7SUFDNUIsWUFBWSxFQUFFLENBQUMsR0FBRyxJQUFJO0lBQ3RCLFlBQVksRUFBRSxDQUFDO0lBQ2YsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUU7SUFDbEIsS0FBSyxFQUFFLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRTtJQUNyQixJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtJQUN6QixLQUFLLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDakMsQ0FBQztBQUVGLE1BQU0sV0FBVyxHQUE4QjtJQUMzQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJO0lBQ2xCLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSTtJQUNYLENBQUMsRUFBRSxDQUFDO0lBQ0osQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUU7SUFDWixDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFO0lBQ2pCLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0lBQ3RCLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUM3QixDQUFDO0FBRUY7Ozs7OztHQU1HO0FBQ0g7SUFJSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWtDRztJQUNILFlBQVksSUFBcUIsRUFBRSxJQUFhO1FBQzVD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