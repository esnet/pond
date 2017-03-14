/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import util from "./util";
import TimeRange from "./timerange";
import * as moment from "moment";
import Moment = moment.Moment;

import EventKey from "./eventkey";

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
export default class Indexed extends EventKey {

    private _utc : boolean;
    private _string : string;
    private _timerange : TimeRange;

    constructor(s, utc = true) {
        super();
        this._utc = utc;
        this._string = s;
        this._timerange = util.rangeFromIndexString(s, this._utc);
    }

    type() {
        return "index";
    }

    /**
     * Returns the timestamp to represent this Index
     * which in this case will return the midpoint
     * of the TimeRange
     */
    timestamp(): Date {
        return this._timerange.mid();
    }

    /**
     * Returns the Index as JSON, which will just be its string
     * representation
     */
    toJSON() : string {
        return this._string;
    }

    /**
     * Simply returns the Index as its string
     */
    toString() : string {
        return this._string;
    }

    /**
     * for the calendar range style Indexes, this lets you return
     * that calendar range as a human readable format, e.g. "June, 2014".
     *
     * The format specified is a Moment.format.
     */
    toNiceString(format: string) : string {
        return util.niceIndexString(this._string, format);
    }

    /**
     * Alias for toString()
     */
    asString() : string {
        return this.toString();
    }

    /**
     * Returns the Index as a TimeRange
     */
    asTimerange() : TimeRange {
        return this._timerange;
    }

    /**
     * Returns the start date of the Index
     */
    begin() : Date {
        return this._timerange.begin();
    }

    /**
     * Returns the end date of the Index
     */
    end() : Date {
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
    static getIndexString(period: string, date: Date) : string {
        const pos = util.windowPositionFromDate(period, date);
        return `${period}-${pos}`;
    }

    /**
     * Given a TimeRange, return a list of strings of index values,
     * assuming a period, e.g. "1h".
     *
     * This is like `Index.getIndexString()` except it returns a sequence of
     * index strings.
     */
    static getIndexStringList(period: string, timerange: TimeRange) : Array<string> {
        const pos1 = util.windowPositionFromDate(period, timerange.begin());
        const pos2 = util.windowPositionFromDate(period, timerange.end());
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
    static getDailyIndexString(date: Date, utc: boolean = false) : string {
        let day = util.leftPad(utc ? date.getUTCDate() : date.getDate());
        let month = util.leftPad(
            utc ? date.getUTCMonth() + 1 : date.getMonth() + 1
        );
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    /**
     * Generate an index string with month granularity.
     */
    static getMonthlyIndexString(date: Date, utc: boolean = false) : string {
        let month = util.leftPad(
            utc ? date.getUTCMonth() + 1 : date.getMonth() + 1
        );
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}-${month}`;
    }

    /**
     * Generate an index string with year granularity.
     */
    static getYearlyIndexString(date: Date, utc: boolean = false) : string {
        const year = utc ? date.getUTCFullYear() : date.getFullYear();
        return `${year}`;
    }
}
