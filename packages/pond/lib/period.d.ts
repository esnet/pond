import * as Immutable from "immutable";
import { Duration } from "./duration";
import { Time } from "./time";
import { TimeRange } from "./timerange";
/**
 * A `period` is a repeating time which is typically used in Pond to
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
     * To define a `Period`, you need to supply the `duration` of the frequency that the
     * period repeats on. Optionally you can specify an `offset` for the period.
     */
    constructor(frequency?: Duration, offset?: Time);
    toString(): string;
    frequency(): Duration;
    offset(): number;
    every(frequency: Duration): Period;
    offsetBy(offset: Time): Period;
    /**
     * Returns true if the `Time` supplied is aligned with this `Period`.
     */
    isAligned(t: Time): boolean;
    /**
     * Given a time, find the next time aligned to the period.
     */
    next(t: Time): Time;
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
/**
 * A `period` is a repeating time which is typically used in Pond to
 * either define the repeating nature of a bucket (used for windowing)
 * or to describe alignment of fill positions when doing data cleaning
 * on a `TimeSeries`.
 *
 * To define a `Period`, you need to supply the `duration` of the frequency that the
 * period repeats on. Optionally you can specify an `offset` for the period.
 */
declare function period(frequency?: Duration, offset?: Time): Period;
export { period };
