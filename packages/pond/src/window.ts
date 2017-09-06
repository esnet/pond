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
import { OrderedSet } from "immutable";
import * as _ from "lodash";
import * as moment from "moment-timezone";

import { Duration, duration } from "./duration";
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

    constructor(tz: string = "Etc/UTC") {
        super();
        this._tz = tz;
    }

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
export class Window extends WindowBase {
    private _period: Period;
    private _duration: Duration;

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
