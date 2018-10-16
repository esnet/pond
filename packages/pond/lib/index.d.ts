import { Key } from "./key";
import { TimeRange } from "./timerange";
import { TimeAlignment } from "./types";
import { Time } from "./time";
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
export declare class Index extends Key {
    private _tz;
    private _string;
    private _timerange;
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
    constructor(s: any, tz?: string);
    type(): string;
    /**
     * Returns the timestamp as a `Date` to represent this `Index`, which in this
     * case will return the midpoint of the `TimeRange` this represents
     */
    timestamp(): Date;
    /**
     * Returns the `Index` as JSON, which will just be its string representation
     * within an object e.g. `{ index: 1d-1234 }`
     */
    toJSON(): {};
    /**
     * Simply returns the `Index` as its string
     */
    toString(): string;
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
    toNiceString(format?: string): string;
    /**
     * Alias for `toString()`
     */
    asString(): string;
    /**
     * Returns a `Time` that is either at the beginning,
     * middle or end of this `Index`. Specify the alignment
     * of the output `Time` with the `align` parameter. This is
     * either:
     *  * TimeAlignment.Begin
     *  * TimeAlignment.Middle
     *  * TimeAlignment.End
     */
    toTime(align: TimeAlignment): Time;
    /**
     * Returns the `Index` as a `TimeRange`
     */
    toTimeRange(): TimeRange;
    /**
     * Returns the start date of the `Index`
     */
    begin(): Date;
    /**
     * Returns the end date of the `Index`
     */
    end(): Date;
}
declare function indexFactory(s: any, tz?: string): Index;
export { indexFactory as index };
