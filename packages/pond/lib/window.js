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
    /**
     * Construct a new `DayWindow`, optionally supplying the timezone `tz`
     * for the `Window`. The default is `UTC`.
     */
    constructor(tz = "Etc/UTC") {
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
class Window extends WindowBase {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3dpbmRvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBRXZDLDRCQUE0QjtBQUM1QiwwQ0FBMEM7QUFHMUMsbUNBQXVDO0FBQ3ZDLHFDQUFrQztBQUNsQyxpQ0FBb0M7QUFDcEMsMkNBQXdDO0FBRXhDLElBQVksVUFLWDtBQUxELFdBQVksVUFBVTtJQUNsQix5Q0FBTyxDQUFBO0lBQ1AsNkNBQUssQ0FBQTtJQUNMLDJDQUFJLENBQUE7SUFDSiwyQ0FBSSxDQUFBO0FBQ1IsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0FBRUQ7Q0FFQztBQUZELGdDQUVDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsZ0RBQWdEO0FBQ2hELGVBQXVCLFNBQVEsVUFBVTtJQUNyQzs7O09BR0c7SUFDSSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQW1CLEVBQUUsS0FBYSxTQUFTO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxTQUFpQixDQUFDO1FBQ3RCLElBQUksT0FBZSxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxDQUNDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDLEtB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