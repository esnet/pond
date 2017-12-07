import * as Immutable from "immutable";
import { Duration } from "./duration";
import { Time } from "./time";
import { TimeRange } from "./timerange";
/**
 * A `Period` is a repeating time which is typically used to
 * either define the repeating nature of a `Window` or to describe periodic
 * boundaries of fill or align operations when doing data cleaning
 * on a `TimeSeries`.
 *
 * Periods have a frequency and an offset. If there is no offset, it
 * is aligned to Jan 1, 1970 00:00 UTC.
 *
 * To create a repeating window, see `Window` creation.
 */
export declare class Period {
    private _frequency;
    private _offset;
    /**
     * To define a `Period`, you need to supply the `duration` of the frequency that the
     * period repeats on. Optionally you can specify an `offset` for the period.
     *
     * Typically you would construct a `Period` object with the `period()` factory
     * function, which has a chaining style to it to make it easier to read in the code.
     * There is also a more standard constructor form.
     *
     * Example:
     * ```
     * const everyFiveMinutes = period()
     *     .every(duration("5m"))
     *     .offsetBy(time("2017-07-21T09:38:00.000Z"));
     * ```
     */
    constructor(frequency?: Duration, offset?: Time);
    /**
     * The `Period` expressed as a string, which is either $freq or $freq-$offset
     * depending on if an offset is present.
     */
    toString(): string;
    /**
     * Returns the frequency part of the `Period`
     */
    frequency(): Duration;
    /**
     * Returns the offset of the `Period`
     */
    offset(): number;
    /**
     * Chaining style specification of the `Duration` of the `Period`.
     * Returns a new `Period`.
     */
    every(frequency: Duration): Period;
    /**
     * Chaining style specification of the offset, supplied as a `Time`.
     * Returns a new `Period`.
     */
    offsetBy(offset: Time): Period;
    /**
     * Returns true if the `Time` supplied is aligned with this `Period`.
     * If the `Period` is every 5m then 1:35pm align (true) while 1:36 would
     * not (false).
     */
    isAligned(t: Time): boolean;
    /**
     * Given a `Time`, find the next `Time` aligned to the period.
     */
    next(t: Time): Time;
    /**
     * Returns an `Immutable.List` of `Time`s within the given `TimeRange`
     * that align with this `Period`.
     *
     * Example:
     * ```
     * const range = timerange(
     *     time("2017-07-21T09:30:00.000Z"),
     *     time("2017-07-21T09:45:00.000Z")
     * );
     * const everyFiveMinutes = period()
     *     .every(duration("5m"))
     *     .offsetBy(time("2017-07-21T09:38:00.000Z"));
     *
     * const within = everyFiveMinutes.within(range);  // 9:33am, 9:38am, 9:43am
     * ```
     */
    within(timerange: TimeRange): Immutable.List<Time>;
}
/**
 * A `Period` is a repeating time which is typically used in Pond to
 * either define the repeating nature of a `Window`
 * or to describe `Align` or `Fill` positions when doing data cleaning
 * on a `TimeSeries`.
 *
 * To define a `Period`, you need to supply the `duration` of the frequency that the
 * period repeats on. Optionally you can specify an `offset` for the period. You can
 * also use a chaining style construction.
 */
declare function period(frequency?: Duration, offset?: Time): Period;
export { period };
