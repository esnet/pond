"use strict";
/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const key_1 = require("./key");
const util_1 = require("./util");
/**
 * An index is simply a string that represents a fixed range of time.
 * There are two basic types:
 * * *Multiplier index* - the number of some unit of time
 *                       (hours, days etc) since the UNIX epoch.
 * * *Calendar index* - The second represents a calendar range,
 *                     such as Oct 2014.
 *
 * For the first type, a multiplier index, an example might be:
 *
 * ```text
 *     1d-12355      // 30th Oct 2003 (GMT), the 12355th day since the
 *                   // UNIX epoch
 * ```
 *
 * You can also use seconds (e.g. 30s), minutes (e.g. 5m), hours (e.g. 1h)
 * or days (e.g. 7d).
 *
 * Here are several examples of a calendar index:
 *
 * ```text
 *     2003-10-30    // 30th Oct 2003
 *     2014-09       // Sept 2014
 *     2015          // All of the year 2015
 * ```
 *
 * An `Index` is a nice representation of certain types of time intervals
 * because it can be cached with its string representation as a key.
 *
 * A specific period of time, and associated data can be looked up based
 * on that string. It also allows us to represent things like months,
 * which have variable length.
 *
 * An `Index` is also useful when collecting into specific time ranges,
 * for example generating all the 5 min ("5m") maximum rollups within a
 * specific day ("1d"). See the processing section within these docs.
 */
class Index extends key_1.Key {
    /**
     * Return the `index` string given an time period (e.g. 1 hour) and a `Date`.
     * The resulting string represents the 1 hour period that `Date` is in.
     *
     * This lets you find the index string (e.g "1h-412715") given that you
     * want a 1 hour index and you have a Date. For example:
     * ```
     *     import { Index } from "pondjs";
     *     const d = new Date("2017-01-30T11:58:38.741Z");
     *     const index = Index.getIndexString("1h", d);   // '1h-412715'
     * ```
     */
    static getIndexString(period, date) {
        const pos = util_1.default.windowPositionFromDate(period, date);
        return `${period}-${pos}`;
    }
    /**
     * Given a `TimeRange`, return a list of strings of index values,
     * assuming a period, e.g. "1h".
     *
     * This is like `Index.getIndexString()` except it returns a sequence of
     * index strings.
     */
    static getIndexStringList(period, timerange) {
        const pos1 = util_1.default.windowPositionFromDate(period, timerange.begin());
        const pos2 = util_1.default.windowPositionFromDate(period, timerange.end());
        const indexList = [];
        if (pos1 <= pos2) {
            for (let pos = pos1; pos <= pos2; pos++) {
                indexList.push(`${period}-${pos}`);
            }
        }
        return indexList;
    }
    /**
     * Generate an `Index` string with day granularity.
     */
    static getDailyIndexString(date, utc = false) {
        const day = util_1.default.leftPad(utc ? date.getUTCDate() : date.getDate());
        const month = util_1.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}-${month}-${day}`;
    }
    /**
     * Generate an `Index` string with month granularity.
     */
    static getMonthlyIndexString(date, utc = false) {
        const month = util_1.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}-${month}`;
    }
    /**
     * Generate an `Index` string with year granularity.
     */
    static getYearlyIndexString(date, utc = false) {
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}`;
    }
    constructor(s, utc = true) {
        super();
        this._utc = utc;
        this._string = s;
        this._timerange = util_1.default.timeRangeFromIndexString(s, this._utc);
    }
    type() {
        return "index";
    }
    /**
     * Returns the timestamp to represent this `Index`
     * which in this case will return the midpoint
     * of the `TimeRange`
     */
    timestamp() {
        return this._timerange.mid();
    }
    /**
     * Returns the `Index` as JSON, which will just be its string
     * representation
     */
    toJSON() {
        return { index: this._string };
    }
    /**
     * Simply returns the `Index` as its string
     */
    toString() {
        return this._string;
    }
    /**
     * For the calendar range style `Index`es, this lets you return
     * that calendar range as a human readable format, e.g. "June, 2014".
     *
     * The format specified is a `Moment.format`.
     */
    toNiceString(format) {
        return util_1.default.niceIndexString(this._string, format);
    }
    /**
     * Alias for `toString()`
     */
    asString() {
        return this.toString();
    }
    /**
     * Returns the `Index` as a `TimeRange`
     */
    asTimerange() {
        return this._timerange;
    }
    /**
     * Returns the start date of the `Index`
     */
    begin() {
        return this._timerange.begin();
    }
    /**
     * Returns the end date of the `Index`
     */
    end() {
        return this._timerange.end();
    }
}
exports.Index = Index;
/**
 * An `Index` is simply a string that represents a fixed range of time.
 * There are two basic types:
 * * *Multiplier index* - the number of some unit of time
 *    (hours, days etc) since the UNIX epoch.
 * * *Calendar index* - The second represents a calendar range,
 *    such as Oct 2014.
 */
function indexFactory(s, utc = true) {
    return new Index(s, (utc = true));
}
exports.index = indexFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUtILCtCQUE0QjtBQUU1QixpQ0FBMEI7QUFFMUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9DRztBQUNILFdBQW1CLFNBQVEsU0FBRztJQUMxQjs7Ozs7Ozs7Ozs7T0FXRztJQUNJLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBYyxFQUFFLElBQVU7UUFDbkQsTUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxNQUFNLENBQUMsR0FBRyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFjLEVBQUUsU0FBb0I7UUFDakUsTUFBTSxJQUFJLEdBQUcsY0FBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNwRSxNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNmLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBQ3RDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFD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