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
import { Time, time } from "./time";
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
export class Period {
    private _frequency: Duration;
    private _offset: number;

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
    constructor(frequency?: Duration, offset?: Time) {
        this._frequency = frequency;
        this._offset = offset ? offset.timestamp().getTime() : 0;
    }

    frequency() {
        return this._frequency;
    }

    offset() {
        return this._offset;
    }

    every(frequency: Duration): Period {
        return new Period(frequency, time(this._offset));
    }

    offsetBy(offset: Time): Period {
        return new Period(this._frequency, offset);
    }

    /**
     * Returns true if the `Time` supplied is aligned with this `Period`.
     */
    isAligned(time: Time) {
        return (+time - +this._offset) / +this._frequency % 1 == 0;
    }

    /**
     * Given a time, find the next time aligned to the period.
     */
    next(time: Time): Time {
        const index = Math.ceil((+time - +this._offset) / +this._frequency);
        const next = index * +this._frequency + this._offset;
        return next === +time ? new Time(next + +this._frequency) : new Time(next);
    }

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
    within(timerange: TimeRange): Immutable.List<Time> {
        let result = Immutable.List<Time>();

        const t1 = time(timerange.begin());
        const t2 = time(timerange.end());

        let scan = this.isAligned(t1) ? t1 : this.next(t1);
        while (+scan <= +t2) {
            result = result.push(scan);
            scan = this.next(scan);
        }

        return result;
    }
}

function period(frequency?: Duration, offset?: Time): Period {
    return new Period(frequency, offset);
}

export { period };
