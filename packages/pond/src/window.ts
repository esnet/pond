/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as Immutable from "immutable";
import * as _ from "lodash";
import * as moment from "moment-timezone";

import { Duration } from "./duration";
import { Index, index } from "./index";
import { Period } from "./period";
import { Time, time } from "./time";
import { TimeRange } from "./timerange";

export enum WindowType {
    Day = 1,
    Month,
    Week,
    Year
}

export abstract class WindowBase {
    public abstract getIndexSet(t: Time | TimeRange): Immutable.OrderedSet<Index>;
}

/**
 * Specifies a repeating day duration specific to the supplied timezone. You can
 * create one using the `daily()` factory function.
 *
 * Example:
 * ```
 * const dayWindowNewYork = daily("America/New_York");
 * const indexes = dayWindowNewYork.getIndexSet(Util.untilNow(duration("5d")));
 * ```
 */
// tslint:disable-next-line:max-classes-per-file
export class DayWindow extends WindowBase {
    /**
     * Given an index string representing a day (e.g. "2015-08-22"), and optionally
     * the timezone (default is UTC), return the corresponding `TimeRange`.
     */
    public static timeRangeOf(indexString: string, tz: string = "Etc/UTC") {
        const parts = indexString.split("-");
        if (parts.length !== 3) {
            throw new Error("Index string for day is badly formatted");
        }

        let beginTime: moment;
        let endTime: moment;
        if (
            !_.isNaN(parseInt(parts[0], 10)) &&
            !_.isNaN(parseInt(parts[1], 10)) &&
            !_.isNaN(parseInt(parts[2], 10))
        ) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            beginTime = moment.tz([year, month - 1, day], tz);
            endTime = moment.tz([year, month - 1, day], tz).endOf("day");
        }
    }

    private _tz: string;

    /**
     * Construct a new `DayWindow`, optionally supplying the timezone `tz`
     * for the `Window`. The default is `UTC`.
     */
    constructor(tz: string = "Etc/UTC") {
        super();
        this._tz = tz;
    }

    /**
     * Returns an `Immutable.OrderedSet<Index>` set of day `Index`es for the
     * `Time` or `TimeRange` supplied as `t`.
     *
     * The simplest invocation of this function would be to pass in a `Time`
     * and get the day (e.g. "2017-09-10"). What day you get may depend on the
     * timezone specified when constructing this `DayWindow`. The most useful
     * aspect of a `DayWindow` is that you can use this index set to bucket
     * `Event`s into days in a particular timezone.
     */
    public getIndexSet(t: Time | TimeRange): Immutable.OrderedSet<Index> {
        let results = Immutable.OrderedSet<Index>();
        let t1: moment;
        let t2: moment;
        if (t instanceof Time) {
            t1 = moment(+t).tz(this._tz);
            t2 = moment(+t).tz(this._tz);
        } else if (t instanceof TimeRange) {
            t1 = moment(+t.begin()).tz(this._tz);
            t2 = moment(+t.end()).tz(this._tz);
        }
        let tt = t1;
        while (tt.isSameOrBefore(t2)) {
            results = results.add(index(t1.format("YYYY-MM-DD"), this._tz));
            tt = tt.add(1, "d");
        }
        return results;
    }
}

/**
 * A `Window` is a specification for repeating range of time range which is
 * typically used in Pond to describe an aggregation bounds.
 *
 * Windows have a `Period` (which defines the frequency and offset of window
 * placement) combined with a `Duration` (which is the size of the window
 * itself).
 *
 * If a `Window` is defined with only a `Duration` then the freqency of the
 * `Window` is equal to the duration of the window (i.e. a fixed window).
 * If the period is smaller than the duration we have a sliding window.
 *
 * From a `Window` you can get a set of `Index`es for a specific `Time` or
 * `TimeRange`, giving you the `Window` or `Window`s that overlap that `Time`
 * or `TimeRange`. The main use of this is it allows you to easily bucket
 * `Events` into the appropiate `Window`s.
 *
 * Example:
 * ```
 * const timeseries = timeSeries(data);
 * const everyThirtyMinutes = window(duration("30m"));
 * const dailyAvg = timeseries.fixedWindowRollup({
 *     window: everyThirtyMinutes,
 *     aggregation: { average: ["value", avg()] }
 * });
 * ```
 *
 * Note: You can also use `DayWindow` with a specified timezone for more
 * control over daily aggregations.
 */
export class Window extends WindowBase {
    private _period: Period;
    private _duration: Duration;

    /**
     * To construct a `Window` you need to supply the `Duration` or length of the
     * window and the sliding `Period` of the window.
     *
     *  * Supply the `Duration` as the `d` arg.
     *  * Optionally supply the `Period`
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
    // tslint:disable-next-line:max-classes-per-file
    constructor(d: Duration, period?: Period) {
        super();
        this._duration = d;
        if (period) {
            this._period = period;
        } else {
            this._period = new Period(d);
        }
    }

    toString() {
        if (+this._period.frequency() === +this.duration()) {
            return this._period.toString();
        } else {
            return `${this._duration}@${this._period}`;
        }
    }

    /**
     * Returns the underlying period of the Window
     */
    period(): Period {
        return this._period;
    }

    /**
     * Returns the duration of the Window
     */
    duration(): Duration {
        return this._duration;
    }

    /**
     * Specify how often the underlying period repeats
     */
    every(frequency: Duration): Window {
        return new Window(this._duration, this._period.every(frequency));
    }

    /**
     * Specify an offset for the underlying period
     */
    offsetBy(t: Time): Window {
        return new Window(this._duration, this._period.offsetBy(t));
    }

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
    getIndexSet(t: Time | TimeRange): Immutable.OrderedSet<Index> {
        let t1;
        let t2;
        if (t instanceof Time) {
            t1 = t;
            t2 = t;
        } else if (t instanceof TimeRange) {
            t1 = t.begin();
            t2 = t.end();
        }
        let result = Immutable.OrderedSet<Index>();
        const prefix = this.toString();
        const scanBegin = this._period.next(time(+t1 - +this._duration));
        let periodIndex = Math.ceil(+scanBegin / +this._period.frequency());
        const indexes = [];
        while (periodIndex * +this._period.frequency() <= +t2) {
            result = result.add(new Index(`${prefix}-${periodIndex}`));
            periodIndex += 1;
        }

        return result;
    }
}

function window(d: Duration, period?: Period): Window {
    return new Window(d, period);
}

/*
function daily() {
    return new Window(WindowType.Day);
}
function monthly() {
    return new Window(WindowType.Month);
}
function yearly() {
    return new Window(WindowType.Year);
}
*/

function daily(tz: string = "Etc/UTC"): DayWindow {
    return new DayWindow(tz);
}

export { window, daily /*, monthly, yearly*/ };
