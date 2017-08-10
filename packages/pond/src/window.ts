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
import * as moment from "moment";

import { Duration, duration } from "./duration";
import { Index } from "./index";
import { Time } from "./time";
import { TimeRange } from "./timerange";
import { Period } from "./period";

export enum WindowType {
    Day = 1,
    Month,
    Year,
    Duration
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
export class Window {
    private _type: WindowType;
    private _period: Period;
    private _duration: Duration;

    /**
     * A Window is a reoccuring duration of time, for example: "every day", or
     * "1 hour, repeated every 5 minutes". 
     *
     * A Window can be made in two ways. The first is a "Calendar" Window.
     * You construct one of these by providing the appropiate type:
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
    constructor(type: WindowType, duration: Duration, period?: Period) {
        this._type = type;
        this._duration = duration;
        if (period) {
            this._period = period;
        } else {
            this._period = new Period(duration);
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
        return new Window(this._type, this._duration, this._period.every(frequency));
    }

    /**
     * Specify an offset for the underlying period
     */
    offsetBy(time: Time): Window {
        return new Window(this._type, this._duration, this._period.offsetBy(time));
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
        console.log("t1, t2", t1, t2);
        let result = Immutable.OrderedSet<Index>();
        if (this._type === WindowType.Duration) {
            let prefix = `${this._period.frequency()}`;
            if (this._duration && this._duration !== this._period.frequency()) {
                prefix += `:${this._duration}`;
            }
            if (this._period.offset()) {
                prefix += `+${this._period.offset()}`;
            }
            const scanBegin = +t1 - +this._duration;
            let periodIndex = Math.ceil(scanBegin / +this._period.frequency());
            const indexes = [];
            while (periodIndex * +this._period.frequency() < +t2) {
                result = result.add(new Index(`${prefix}-${periodIndex}`));
                periodIndex += 1;
            }
        }
        return result;
    }
}

function window(duration: Duration, period?: Period): Window {
    return new Window(WindowType.Duration, duration, period);
}
function daily() {
    return new Window(WindowType.Day);
}
function monthly() {
    return new Window(WindowType.Month);
}
function yearly() {
    return new Window(WindowType.Year);
}

export { window, daily, monthly, yearly };
