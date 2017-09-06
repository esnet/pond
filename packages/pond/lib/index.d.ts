import { Key } from "./key";
import { TimeRange } from "./timerange";
/**
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
 * A specific period of time, and associated data can be looked up based
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
    constructor(s: any, tz?: string);
    type(): string;
    /**
     * Returns the timestamp to represent this `Index`
     * which in this case will return the midpoint
     * of the `TimeRange`
     */
    timestamp(): Date;
    /**
     * Returns the `Index` as JSON, which will just be its string
     * representation
     */
    toJSON(): {};
    /**
     * Simply returns the `Index` as its string
     */
    toString(): string;
    /**
     * For the calendar range style `Index`es, this lets you return
     * that calendar range as a human readable format, e.g. "June, 2014".
     *
     * The format specified is a `Moment.format`.
     */
    toNiceString(format?: string): string;
    /**
     * Alias for `toString()`
     */
    asString(): string;
    /**
     * Returns the `Index` as a `TimeRange`
     */
    asTimerange(): TimeRange;
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
