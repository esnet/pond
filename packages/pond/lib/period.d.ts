import * as Immutable from "immutable";
import { Duration } from "./duration";
import { Time } from "./time";
import { TimeRange } from "./timerange";
/**
 * A period is a repeating time which is typically used in pond to
 * either define the repeating nature of a bucket (used for windowing)
 * or to describe alignment of fill positions when doing data cleaning
 * on a `TimeSeries`.
 *
 * Periods have a frequency and an offset. If there is no offset, it
 * is aligned to Jan 1, 1970 00:00 UTC.
 *
 * To create a repeating window, see `Bucket` creation.
 */
export declare class Period {
    private _frequency;
    private _offset;
    /**
     * To define a `Period`, you need to the duration of the frequency that the
     * period repeats. Optionally you can specify and offset for the period.
     *
     *  * the `stride` of the period which is how often the beginning of the
     *    duration of time repeats itself. This is a `Duration`, i.e. the duration
     *    of the length of the stride, or basically the length between the beginning
     *    of each period repeat. In the above example that would be `duration("10s")`.
     *  * the `offset`, a point in time to calculate the period from, which defaults
     *    to Jan 1, 1970 UTC or timestamp 0. This is specified as a `Time`.
     *
     */
    constructor(frequency?: Duration, offset?: Time);
    frequency(): Duration;
    offset(): number;
    every(frequency: Duration): Period;
    offsetBy(offset: Time): Period;
    /**
     * Returns true if the `Time` supplied is aligned with this `Period`.
     */
    isAligned(time: Time): boolean;
    /**
     * Given a time, find the next time aligned to the period.
     */
    next(time: Time): Time;
    /**
     * Returns `Time`s within the given TimeRange that align with this
     * `Period`.
     *
     * @example
     * ```
     * const range = timerange(time("2017-07-21T09:30:00.000Z"), time("2017-07-21T09:45:00.000Z"))
     * const everyFiveMinutes = period()
     *     .every(duration("5m"))
     *     .offsetBy(time("2017-07-21T09:38:00.000Z"));
     * const result = everyFiveMinutes.within(range);  // 9:33am, 9:38am, 9:43am
     * ```
     */
    within(timerange: TimeRange): Immutable.List<Time>;
}
declare function period(frequency?: Duration, offset?: Time): Period
export { period };
