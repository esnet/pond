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

import { Duration, duration } from "./duration";
import { Time, time } from "./time";
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
export class Period {
    private _frequency: Duration;
    private _offset: number;

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
    constructor(frequency?: Duration, offset?: Time) {
        this._frequency = frequency;
        this._offset = offset && !_.isNaN(offset) ? offset.timestamp().getTime() : 0;
    }

    /**
     * The `Period` expressed as a string, which is either $freq or $freq-$offset
     * depending on if an offset is present.
     */
    toString() {
        return this._offset ? `${this._frequency}+${this._offset}` : `${this._frequency}`;
    }

    /**
     * Returns the frequency part of the `Period`
     */
    frequency() {
        return this._frequency;
    }

    /**
     * Returns the offset of the `Period`
     */
    offset() {
        return this._offset;
    }

    /**
     * Chaining style specification of the `Duration` of the `Period`.
     * Returns a new `Period`.
     */
    every(frequency: Duration): Period {
        return new Period(frequency, time(this._offset));
    }

    /**
     * Chaining style specification of the offset, supplied as a `Time`.
     * Returns a new `Period`.
     */
    offsetBy(offset: Time): Period {
        return new Period(this._frequency, offset);
    }

    /**
     * Returns true if the `Time` supplied is aligned with this `Period`.
     * If the `Period` is every 5m then 1:35pm align (true) while 1:36 would
     * not (false).
     */
    isAligned(t: Time) {
        return ((+t - +this._offset) / +this._frequency) % 1 === 0;
    }

    /**
     * Given a `Time`, find the next `Time` aligned to the period.
     */
    next(t: Time): Time {
        const index = Math.ceil((+t - +this._offset) / +this._frequency);
        const next = index * +this._frequency + this._offset;
        return next === +t ? new Time(next + +this._frequency) : new Time(next);
    }

    /**
     * Returns an `Immutable.List` of `Time`s within the given `TimeRange`
     * that align with this `Period`. Not this will potentially include
     * the start time of the timerange but never the end time of the timerange.
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
    within(timerange: TimeRange): Immutable.List<Time> {
        let result = Immutable.List<Time>();

        const t1 = time(timerange.begin());
        const t2 = time(timerange.end());

        let scan = this.isAligned(t1) ? t1 : this.next(t1);
        while (+scan < +t2) {
            result = result.push(scan);
            scan = this.next(scan);
        }

        return result;
    }
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
function period(frequency?: Duration, offset?: Time): Period {
    return new Period(frequency, offset);
}

export { period };
