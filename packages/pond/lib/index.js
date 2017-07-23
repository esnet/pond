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
 *  *Multiplier index* - the number of some unit of time
 *                       (hours, days etc) since the UNIX epoch.
 *  *Calendar index* - The second represents a calendar range,
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
 * An Index is a nice representation of certain types of time intervals
 * because it can be cached with its string representation as a key.
 * A specific period of time, and associated data can be looked up based
 * on that string. It also allows us to represent things like months,
 * which have variable length.
 *
 * An Index is also useful when collecting into specific time ranges,
 * for example generating all the 5 min ("5m") maximum rollups within a
 * specific day ("1d"). See the processing section within these docs.
 */
class Index extends key_1.Key {
    /**
     * Return the index string given an time period (e.g. 1 hour) and a Date.
     * The resulting string represents the 1 hour period that Date is in.
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
     * Given a TimeRange, return a list of strings of index values,
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
     * Generate an index string with day granularity.
     */
    static getDailyIndexString(date, utc = false) {
        const day = util_1.default.leftPad(utc ? date.getUTCDate() : date.getDate());
        const month = util_1.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}-${month}-${day}`;
    }
    /**
     * Generate an index string with month granularity.
     */
    static getMonthlyIndexString(date, utc = false) {
        const month = util_1.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}-${month}`;
    }
    /**
     * Generate an index string with year granularity.
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
     * Returns the timestamp to represent this Index
     * which in this case will return the midpoint
     * of the TimeRange
     */
    timestamp() {
        return this._timerange.mid();
    }
    /**
     * Returns the Index as JSON, which will just be its string
     * representation
     */
    toJSON() {
        return { index: this._string };
    }
    /**
     * Simply returns the Index as its string
     */
    toString() {
        return this._string;
    }
    /**
     * for the calendar range style Indexes, this lets you return
     * that calendar range as a human readable format, e.g. "June, 2014".
     *
     * The format specified is a Moment.format.
     */
    toNiceString(format) {
        return util_1.default.niceIndexString(this._string, format);
    }
    /**
     * Alias for toString()
     */
    asString() {
        return this.toString();
    }
    /**
     * Returns the Index as a TimeRange
     */
    asTimerange() {
        return this._timerange;
    }
    /**
     * Returns the start date of the Index
     */
    begin() {
        return this._timerange.begin();
    }
    /**
     * Returns the end date of the Index
     */
    end() {
        return this._timerange.end();
    }
}
exports.Index = Index;
/**
 * An index is simply a string that represents a fixed range of time.
 * There are two basic types:
 * *Multiplier index* - the number of some unit of time
 *    (hours, days etc) since the UNIX epoch.
 * *Calendar index* - The second represents a calendar range,
 *    such as Oct 2014.
 */
function indexFactory(s, utc = true) {
    return new Index(s, (utc = true));
}
exports.index = indexFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUtILCtCQUE0QjtBQUU1QixpQ0FBMEI7QUFFMUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUNHO0FBQ0gsV0FBbUIsU0FBUSxTQUFHO0lBQzFCOzs7Ozs7Ozs7OztPQVdHO0lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFjLEVBQUUsSUFBVTtRQUNuRCxNQUFNLEdBQUcsR0FBRyxjQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQWMsRUFBRSxTQUFvQjtRQUNqRSxNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sSUFBSSxHQUFHLGNBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbEUsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2YsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDdEMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNy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