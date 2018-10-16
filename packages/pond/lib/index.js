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
const types_1 = require("./types");
const time_1 = require("./time");
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
class Index extends key_1.Key {
    /**
     * Constructs a new `Index` by passing in the index string `s` and
     * optionally a timezone `tz`. You can also use the `index()` factory
     * function to construct one.
     *
     * Example:
     * ```
     * const idx = index("5m-4135541");
     * idx.toTimeRange().humanizeDuration();  // "5 minutes"
     * ```
     */
    constructor(s, tz = "Etc/UTC") {
        super();
        this._tz = tz;
        this._string = s;
        this._timerange = util_1.default.timeRangeFromIndexString(s, this._tz);
    }
    type() {
        return "index";
    }
    /**
     * Returns the timestamp as a `Date` to represent this `Index`, which in this
     * case will return the midpoint of the `TimeRange` this represents
     */
    timestamp() {
        return this._timerange.mid();
    }
    /**
     * Returns the `Index` as JSON, which will just be its string representation
     * within an object e.g. `{ index: 1d-1234 }`
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
     * Returns a `Time` that is either at the beginning,
     * middle or end of this `Index`. Specify the alignment
     * of the output `Time` with the `align` parameter. This is
     * either:
     *  * TimeAlignment.Begin
     *  * TimeAlignment.Middle
     *  * TimeAlignment.End
     */
    toTime(align) {
        switch (align) {
            case types_1.TimeAlignment.Begin:
                return time_1.time(this.begin());
                break;
            case types_1.TimeAlignment.Middle:
                return time_1.time(this.toTimeRange().mid());
                break;
            case types_1.TimeAlignment.End:
                return time_1.time(this.end());
                break;
        }
    }
    /**
     * Returns the `Index` as a `TimeRange`
     */
    toTimeRange() {
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
function indexFactory(s, tz = "Etc/UTC") {
    return new Index(s, tz);
}
exports.index = indexFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUtILCtCQUE0QjtBQUU1QixpQ0FBMEI7QUFDMUIsbUNBQXdDO0FBQ3hDLGlDQUFvQztBQUVwQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSCxNQUFhLEtBQU0sU0FBUSxTQUFHO0lBSzFCOzs7Ozs7Ozs7O09BVUc7SUFDSCxZQUFZLENBQUMsRUFBRSxFQUFFLEdBQUcsU0FBUztRQUN6QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxjQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0sSUFBSTtRQUNQLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7O09BR0c7SUFDSSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNO1FBQ1QsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSSxZQUFZLENBQUMsTUFBZTtRQUMvQixPQUFPLGNBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFDLEtBQW9CO1FBQzlCLFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxxQkFBYSxDQUFDLEtBQUs7Z0JBQ3BCLE9BQU8sV0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQixNQUFNO1lBQ1YsS0FBSyxxQkFBYSxDQUFDLE1BQU07Z0JBQ3JCLE9BQU8sV0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNO1lBQ1YsS0FBSyxxQkFBYSxDQUFDLEdBQUc7Z0JBQ2xCLE9BQU8sV0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNO1NBQ2I7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxXQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUs7UUFDUixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksR0FBRztRQUNOLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0NBQ0o7QUFwSEQsc0JBb0hDO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxTQUFTO0lBQ25DLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFd0IsNkJBQUsifQ==