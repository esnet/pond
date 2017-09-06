"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const _ = require("lodash");
const moment = require("moment-timezone");
const index_1 = require("./index");
const period_1 = require("./period");
const time_1 = require("./time");
const timerange_1 = require("./timerange");
var WindowType;
(function (WindowType) {
    WindowType[WindowType["Day"] = 1] = "Day";
    WindowType[WindowType["Month"] = 2] = "Month";
    WindowType[WindowType["Week"] = 3] = "Week";
    WindowType[WindowType["Year"] = 4] = "Year";
})(WindowType = exports.WindowType || (exports.WindowType = {}));
class WindowBase {
}
exports.WindowBase = WindowBase;
// tslint:disable-next-line:max-classes-per-file
class DayWindow extends WindowBase {
    /**
     * Given an index string representing a day (e.g. "2015-08-22"), and optionally
     * the timezone (default is UTC), return the corresponding `TimeRange`.
     */
    static timeRangeOf(indexString, tz = "Etc/UTC") {
        const parts = indexString.split("-");
        if (parts.length !== 3) {
            throw new Error("Index string for day is badly formatted");
        }
        let beginTime;
        let endTime;
        if (!_.isNaN(parseInt(parts[0], 10)) &&
            !_.isNaN(parseInt(parts[1], 10)) &&
            !_.isNaN(parseInt(parts[2], 10))) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            beginTime = moment.tz([year, month - 1, day], tz);
            endTime = moment.tz([year, month - 1, day], tz).endOf("day");
        }
    }
    constructor(tz = "Etc/UTC") {
        super();
        this._tz = tz;
    }
    getIndexSet(t) {
        let results = Immutable.OrderedSet();
        let t1;
        let t2;
        if (t instanceof time_1.Time) {
            t1 = moment(+t).tz(this._tz);
            t2 = moment(+t).tz(this._tz);
        }
        else if (t instanceof timerange_1.TimeRange) {
            t1 = moment(+t.begin()).tz(this._tz);
            t2 = moment(+t.end()).tz(this._tz);
        }
        let tt = t1;
        while (tt.isSameOrBefore(t2)) {
            results = results.add(index_1.index(t1.format("YYYY-MM-DD"), this._tz));
            tt = tt.add(1, "d");
        }
        return results;
    }
}
exports.DayWindow = DayWindow;
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
class Window extends WindowBase {
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
    constructor(d, period) {
        super();
        this._duration = d;
        if (period) {
            this._period = period;
        }
        else {
            this._period = new period_1.Period(d);
        }
    }
    toString() {
        if (+this._period.frequency() === +this.duration()) {
            return this._period.toString();
        }
        else {
            return `${this._duration}@${this._period}`;
        }
    }
    /**
     * Returns the underlying period of the Window
     */
    period() {
        return this._period;
    }
    /**
     * Returns the duration of the Window
     */
    duration() {
        return this._duration;
    }
    /**
     * Specify how often the underlying period repeats
     */
    every(frequency) {
        return new Window(this._duration, this._period.every(frequency));
    }
    /**
     * Specify an offset for the underlying period
     */
    offsetBy(t) {
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
    getIndexSet(t) {
        let t1;
        let t2;
        if (t instanceof time_1.Time) {
            t1 = t;
            t2 = t;
        }
        else if (t instanceof timerange_1.TimeRange) {
            t1 = t.begin();
            t2 = t.end();
        }
        let result = Immutable.OrderedSet();
        const prefix = this.toString();
        const scanBegin = this._period.next(time_1.time(+t1 - +this._duration));
        let periodIndex = Math.ceil(+scanBegin / +this._period.frequency());
        const indexes = [];
        while (periodIndex * +this._period.frequency() <= +t2) {
            result = result.add(new index_1.Index(`${prefix}-${periodIndex}`));
            periodIndex += 1;
        }
        return result;
    }
}
exports.Window = Window;
function window(d, period) {
    return new Window(d, period);
}
exports.window = window;
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
function daily(tz = "Etc/UTC") {
    return new DayWindow(tz);
}
exports.daily = daily;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3dpbmRvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBRXZDLDRCQUE0QjtBQUM1QiwwQ0FBMEM7QUFHMUMsbUNBQXVDO0FBQ3ZDLHFDQUFrQztBQUNsQyxpQ0FBb0M7QUFDcEMsMkNBQXdDO0FBRXhDLElBQVksVUFLWDtBQUxELFdBQVksVUFBVTtJQUNsQix5Q0FBTyxDQUFBO0lBQ1AsNkNBQUssQ0FBQTtJQUNMLDJDQUFJLENBQUE7SUFDSiwyQ0FBSSxDQUFBO0FBQ1IsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0FBRUQ7Q0FFQztBQUZELGdDQUVDO0FBRUQsZ0RBQWdEO0FBQ2hELGVBQXVCLFNBQVEsVUFBVTtJQUNyQzs7O09BR0c7SUFDSSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQW1CLEVBQUUsS0FBYSxTQUFTO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxTQUFpQixDQUFDO1FBQ3RCLElBQUksT0FBZSxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxDQUNDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMs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