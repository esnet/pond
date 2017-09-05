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
class Period {
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
    isAligned(time) {
        return (+time - +this._offset) / +this._frequency % 1 == 0;
    }
    /**
     * Given a time, find the next time aligned to the period.
     */
    next(time) {
        const index = Math.ceil((+time - +this._offset) / +this._frequency);
        const next = index * +this._frequency + this._offset;
        return next === +time ? new time_1.Time(next + +this._frequency) : new time_1.Time(next);
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
function period(frequency, offset) {
    return new Period(frequency, offset);
}
exports.period = period;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyaW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BlcmlvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUs1QixpQ0FBb0M7QUFHcEM7Ozs7Ozs7Ozs7R0FVRztBQUNIO0lBSUk7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxZQUFZLFNBQW9CLEVBQUUsTUFBYTtRQUMzQyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsUUFBUTtRQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEYsQ0FBQztJQUVELFNBQVM7UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQsTUFBTTtRQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBbUI7UUFDckIsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxXQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELFFBQVEsQ0FBQyxNQUFZO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxJQUFVO1FBQ2hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7T0FFRztJQUNILElBQUksQ0FBQyxJQUFVO1FBQ1gsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyRCxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsTUFBTSxDQUFDLFNBQW9CO1FBQ3ZCLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQVEsQ0FBQztRQUVwQyxNQUFNLEVBQUUsR0FBRyxXQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkMsTUFBTSxFQUFFLEdBQUcsV0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRWpDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQXBGRCx3QkFvRkM7QUFFRCxnQkFBZ0IsU0FBb0IsRUFBRSxNQUFhO0lBQy9DLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVRLHdCQUFNIn0=