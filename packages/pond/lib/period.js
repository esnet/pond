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
const time_1 = require("./time");
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
class Period {
    /**
     * To define a `Period`, you need to supply the `duration` of the frequency that the
     * period repeats on. Optionally you can specify an `offset` for the period.
     */
    constructor(frequency, offset) {
        this._frequency = frequency;
        this._offset = offset && !_.isNaN(offset) ? offset.timestamp().getTime() : 0;
    }
    toString() {
        return this._offset ? `${this._frequency}+${this._offset}` : `${this._frequency}`;
    }
    frequency() {
        return this._frequency;
    }
    offset() {
        return this._offset;
    }
    every(frequency) {
        return new Period(frequency, time_1.time(this._offset));
    }
    offsetBy(offset) {
        return new Period(this._frequency, offset);
    }
    /**
     * Returns true if the `Time` supplied is aligned with this `Period`.
     */
    isAligned(t) {
        return (+t - +this._offset) / +this._frequency % 1 === 0;
    }
    /**
     * Given a time, find the next time aligned to the period.
     */
    next(t) {
        const index = Math.ceil((+t - +this._offset) / +this._frequency);
        const next = index * +this._frequency + this._offset;
        return next === +t ? new time_1.Time(next + +this._frequency) : new time_1.Time(next);
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
    within(timerange) {
        let result = Immutable.List();
        const t1 = time_1.time(timerange.begin());
        const t2 = time_1.time(timerange.end());
        let scan = this.isAligned(t1) ? t1 : this.next(t1);
        while (+scan <= +t2) {
            result = result.push(scan);
            scan = this.next(scan);
        }
        return result;
    }
}
exports.Period = Period;
/**
 * A `period` is a repeating time which is typically used in Pond to
 * either define the repeating nature of a bucket (used for windowing)
 * or to describe alignment of fill positions when doing data cleaning
 * on a `TimeSeries`.
 *
 * To define a `Period`, you need to supply the `duration` of the frequency that the
 * period repeats on. Optionally you can specify an `offset` for the period.
 */
function period(frequency, offset) {
    return new Period(frequency, offset);
}
exports.period = period;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyaW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BlcmlvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUs1QixpQ0FBb0M7QUFHcEM7Ozs7Ozs7Ozs7R0FVRztBQUNIO0lBSUk7OztPQUdHO0lBQ0gsWUFBWSxTQUFvQixFQUFFLE1BQWE7UUFDM0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELFFBQVE7UUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RGLENBQUM7SUFFRCxTQUFTO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU07UUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQW1CO1FBQ3JCLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsV0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxRQUFRLENBQUMsTUFBWTtRQUNqQixNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLENBQUMsQ0FBTztRQUNiLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRDs7T0FFRztJQUNILElBQUksQ0FBQyxDQUFPO1FBQ1IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyRCxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksV0FBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsTUFBTSxDQUFDLFNBQW9CO1FBQ3ZCLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQVEsQ0FBQztRQUVwQyxNQUFNLEVBQUUsR0FBRyxXQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkMsTUFBTSxFQUFFLEdBQUcsV0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRWpDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQTVFRCx3QkE0RUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILGdCQUFnQixTQUFvQixFQUFFLE1BQWE7SUFDL0MsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBRVEsd0JBQU0ifQ==