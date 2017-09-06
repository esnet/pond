import * as Immutable from "immutable";
import { Duration } from "./duration";
import { Index } from "./index";
import { Period } from "./period";
import { Time } from "./time";
import { TimeRange } from "./timerange";
export enum WindowType {
    Day = 1,
    Month = 2,
    Week = 3,
    Year = 4
}
export abstract class WindowBase {
    abstract getIndexSet(t: Time | TimeRange): Immutable.OrderedSet<Index>;
}
export declare class DayWindow extends WindowBase {
    /**
     * Given an index string representing a day (e.g. "2015-08-22"), and optionally
     * the timezone (default is UTC), return the corresponding `TimeRange`.
     */
    static timeRangeOf(indexString: string, tz?: string): void;
    private _tz;
    constructor(tz?: string);
    getIndexSet(t: Time | TimeRange): Immutable.OrderedSet<Index>;
}
/**
 * A `Window` is a specification for repeating range of time range which is
 * typically used in Pond to describe an aggregation bounds. For example:
 *
 * Windows have a `Period` (which defines a frequency and offset of window
 * placement) combined with a `Duration` (which is the size of the window
 * itself).
 *
 * If a window is defined with only a `Duration` then the freqency of the
 * window is equal to the duration of the window (i.e. a fixed window).
 * If the period is smaller than the duration we have a sliding window.
 * ```
 * Window(period("5m"), duration("1h"))
 * ```
 */
export declare class Window extends WindowBase {
    private _period;
    private _duration;
    /**
     * A Window is a reoccurring duration of time, for example: "every day", or
     * "1 hour, repeated every 5 minutes".
     *
     * A Window can be made in two ways. The first is a "Calendar" Window.
     * You construct one of these by providing the appropriate type:
     *  * "Day"
     *  * "Month"
     *  * "Year"
     *
     * The second is a `Period` based `Window`. An example might be to repeat a
     * 5 minute interval every 10 second, starting at some beginning time.
     *
     * To define an duration `Period`, you need to specify up to three parts:
     *
     * Repeats of the Window are given an index to represent that specific repeat.
     * That index is represented by an `Index` object and can also be represented
     * by a string that encodes the specific repeat.
     *
     * Since an `Index` can be a key for a `TimeSeries`, a repeated period and
     * associated data can be represented that way.
     *
     * ```
     *              |<- duration ---------->|
     * |<- offset ->|<- freq ->|                  (<- period )
     *              [-----------------------]
     *                         [-----------------------]
     *                                    [-----------------------]
     *                                            ...
     * ```
     *
     */
    constructor(d: Duration, period?: Period);
    toString(): string;
    /**
     * Returns the underlying period of the Window
     */
    period(): Period;
    /**
     * Returns the duration of the Window
     */
    duration(): Duration;
    /**
     * Specify how often the underlying period repeats
     */
    every(frequency: Duration): Window;
    /**
     * Specify an offset for the underlying period
     */
    offsetBy(t: Time): Window;
    /**
     * Returns the Window repeats as an `Immutable.Set<Index>` that covers
     * (in whole or in part) the time or timerange supplied. In this example,
     * B, C, D and E will be returned:
     *
     * ```
     *                    t (Time)
     *                    |
     *  [----------------]|                    A
     *      [-------------|--]                 B*
     *          [---------|------]             C*
     *              [-----|----------]         D*
     *                  [-|--------------]     E*
     *                    | [----------------] F
     * ```
     *
     */
    getIndexSet(t: Time | TimeRange): Immutable.OrderedSet<Index>;
}
declare function window(d: Duration, period?: Period): Window;
declare function daily(tz?: string): DayWindow;
export { window, daily };
