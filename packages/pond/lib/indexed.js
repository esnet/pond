/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const eventkey_1 = require("./eventkey");
/**
An index is simply a string that represents a fixed range of time.
There are two basic types:
 * *Multiplier index* - the number of some unit of time
   (hours, days etc) since the UNIX epoch.
 * *Calendar index* - The second represents a calendar range,
   such as Oct 2014.

For the first type, a multiplier index, an example might be:

```text
    1d-12355      // 30th Oct 2003 (GMT), the 12355th day since the
                  // UNIX epoch
```

You can also use seconds (e.g. 30s), minutes (e.g. 5m), hours (e.g. 1h)
or days (e.g. 7d).

Here are several examples of a calendar index:

```text
    2003-10-30    // 30th Oct 2003
    2014-09       // Sept 2014
    2015          // All of the year 2015
```

An Index is a nice representation of certain types of time intervals
because it can be cached with its string representation as a key.
A specific period of time, and associated data can be looked up based
on that string. It also allows us to represent things like months,
which have variable length.

An Index is also useful when collecting into specific time ranges,
for example generating all the 5 min ("5m") maximum rollups within a
specific day ("1d"). See the processing section within these docs.

 */
class Indexed extends eventkey_1.default {
    constructor(s, utc = true) {
        super();
        this._utc = utc;
        this._string = s;
        this._timerange = util_1.default.rangeFromIndexString(s, this._utc);
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
        return this._string;
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
        let day = util_1.default.leftPad(utc ? date.getUTCDate() : date.getDate());
        let month = util_1.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}-${month}-${day}`;
    }
    /**
     * Generate an index string with month granularity.
     */
    static getMonthlyIndexString(date, utc = false) {
        let month = util_1.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);
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
}
exports.default = Indexed;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztHQVFHOzs7QUFFSCxpQ0FBMEI7QUFLMUIseUNBQWtDO0FBRWxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQ0c7QUFDSCxhQUE2QixTQUFRLGtCQUFRO0lBTXpDLFlBQVksQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJO1FBQ3JCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsSUFBSTtRQUNBLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU07UUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxDQUFDLE1BQWM7UUFDdkIsTUFBTSxDQUFDLGNBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7O09B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