/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as moment from "moment";
import Moment = moment.Moment;

import { Key } from "./key";
import { TimeRange } from "./timerange";
import util from "./util";

/**
 * An `Index` is a specific instance of a `Window`. For example
 * a `Window` may represent "every day", and so an `Index` would
 * represent a specific day like last Tuesday in that case.
 *
 * There are two basic types, determined by string format supplied
 * in the constructor:
 *
 * * *Duration index* - the number of some unit of time
 *                       (e.g. 5 minutes) since the UNIX epoch.
 * * *Calendar index* - a calendar range (e.g. Oct 2014) that
 *                      maybe and uneven amount of time.
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
 * For the second type, a calendar style `Index`, here are several examples:
 *
 * ```text
 *     2003-10-30    // 30th Oct 2003
 *     2014-09       // Sept 2014
 *     2015          // All of the year 2015
 * ```
 *
 * A specific `TimeRange`, and associated data can be associated up based
 * on that string. It also allows us to represent things like months,
 * which have variable length.
 *
 * Indexes also contain a timezone, which defaults to UTC. For instance if
 * you have a day 2017-08-11, then the `TimeRange` representation depends
 * on the timezone of that day.
 */
export class Index extends Key {
    private _tz: string;
    private _string: string;
    private _timerange: TimeRange;

    /**
     * Constructs a new `Index` by passing in the index string `s` and
     * optionally a timezone `tz`. You can also use the `index()` factory
     * function to construct one.
     *
     * Example:
     * ```
     * const idx = index("5m-4135541");
     * idx.asTimerange().humanizeDuration();  // "5 minutes"
     * ```
     */
    constructor(s, tz = "Etc/UTC") {
        super();
        this._tz = tz;
        this._string = s;
        this._timerange = util.timeRangeFromIndexString(s, this._tz);
    }

    public type() {
        return "index";
    }

    /**
     * Returns the timestamp as a `Date` to represent this `Index`, which in this
     * case will return the midpoint of the `TimeRange` this represents
     */
    public timestamp(): Date {
        return this._timerange.mid();
    }

    /**
     * Returns the `Index` as JSON, which will just be its string representation
     * within an object e.g. `{ index: 1d-1234 }`
     */
    public toJSON(): {} {
        return { index: this._string };
    }

    /**
     * Simply returns the `Index` as its string
     */
    public toString(): string {
        return this._string;
    }

    /**
     * For the calendar style `Index`, this lets you return
     * that calendar range as a human readable format, e.g. "June, 2014".
     *
     * The `format` specified is a `Moment.format`.
     *
     * Example:
     * ```
     * const idx = index("2014-09-17");
     * idx.toNiceString("DD MMM YYYY") // "17 Sep 2014"
     * ```
     */
    public toNiceString(format?: string): string {
        return util.niceIndexString(this._string, format);
    }

    /**
     * Alias for `toString()`
     */
    public asString(): string {
        return this.toString();
    }

    /**
     * Returns the `Index` as a `TimeRange`
     */
    public asTimerange(): TimeRange {
        return this._timerange;
    }

    /**
     * Returns the start date of the `Index`
     */
    public begin(): Date {
        return this._timerange.begin();
    }

    /**
     * Returns the end date of the `Index`
     */
    public end(): Date {
        return this._timerange.end();
    }
}
/*
 * An `Index` is a specific instance of a `Window`. For example
 * a `Window` may represent "every day", then an `Index` could
 * represent a specific day like last Tuesday.
 *
 * There are two basic types:
 *
 * * *Duration index* - the number of some unit of time
 *                       (e.g. 5 minutes) since the UNIX epoch.
 * * *Calendar index* - a calendar range (e.g. Oct 2014) that
 *                      maybe and uneven amount of time.
 *
 * Indexes also contain a timezone `tz`, which defaults to UTC. For instance if
 * you have a day 2017-08-11, then the `TimeRange` representation depends
 * on the timezone of that day (a day in London is not the same time range
 * as a day in Los Angeles), they are offset from each other by their timezone
 * difference.
 */
function indexFactory(s, tz = "Etc/UTC"): Index {
    return new Index(s, tz);
}

export { indexFactory as index };
