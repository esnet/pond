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
const _ = require("lodash");
const key_1 = require("./key");
const timerange_1 = require("./timerange");
const types_1 = require("./types");
/**
 * Constructs a new `Time` object that can be used as a key for `Event`'s.
 *
 * A `Time` object represents a timestamp, and is stored as a Javascript `Date`
 * object. The difference with just a `Date` is that is conforms to the interface
 * required to be an `Event` key.
 */
class Time extends key_1.Key {
    static isTime(t) {
        return t instanceof Time;
    }
    constructor(d) {
        super();
        if (_.isDate(d)) {
            this._d = d;
        }
        else if (_.isNumber(d)) {
            this._d = new Date(d);
        }
        else if (_.isString(d)) {
            this._d = new Date(d);
        }
        else {
            this._d = new Date();
        }
    }
    type() {
        return "time";
    }
    toJSON() {
        return { time: +this._d };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    /**
     * Returns the native Date object for this `Time`
     */
    toDate() {
        return this.timestamp();
    }
    /**
     * The timestamp of this data, in UTC time, as a string.
     */
    toUTCString() {
        return this.timestamp().toUTCString();
    }
    /**
     * The timestamp of this data, in Local time, as a string.
     */
    toLocalString() {
        return this.timestamp().toString();
    }
    /**
     * The timestamp of this data
     */
    timestamp() {
        return this._d;
    }
    valueOf() {
        return +this._d;
    }
    /**
     * The begin time of this `Event`, which will be just the timestamp
     */
    begin() {
        return this.timestamp();
    }
    /**
     * The end time of this `Event`, which will be just the timestamp
     */
    end() {
        return this.timestamp();
    }
    /**
     * Takes this Time and returns a TimeRange of given duration
     * which is either centrally located around the Time, or aligned
     * to either the Begin or End time.
     *
     * For example remapping keys, each one of the keys is a Time, but
     * we want to convert the timeseries to use TimeRanges instead:
     * ```
     * const remapped = series.mapKeys(t => t.toTimeRange(duration("5m"), TimeAlignment.Middle));
     * ```
     *
     * The alignment is either:
     *  * TimeAlignment.Begin
     *  * TimeAlignment.Middle
     *  * TimeAlignment.End
     *
     */
    toTimeRange(duration, align) {
        const d = +duration;
        const timestamp = +this.timestamp();
        switch (align) {
            case types_1.TimeAlignment.Begin:
                return new timerange_1.TimeRange(timestamp, timestamp + d);
            case types_1.TimeAlignment.Middle:
                const half = Math.round(d / 2);
                return new timerange_1.TimeRange(timestamp - half, timestamp + d - half);
            case types_1.TimeAlignment.End:
                return new timerange_1.TimeRange(timestamp - d, timestamp);
        }
    }
}
exports.Time = Time;
/**
 * Constructs a new `Time` object. A `Time` object represents a timestamp,
 * and is stored as a Javascript `Date` object. The difference with just a Date is that
 * this conforms to the interface required to be an `Event` key.
 */
function timeFactory(d) {
    return new Time(d);
}
exports.time = timeFactory;
/**
 * Returns the the current time as a `Time` object
 */
function now() {
    return new Time(new Date());
}
exports.now = now;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCw0QkFBNEI7QUFFNUIsK0JBQTRCO0FBQzVCLDJDQUF3QztBQUN4QyxtQ0FBd0M7QUFFeEM7Ozs7OztHQU1HO0FBQ0gsTUFBYSxJQUFLLFNBQVEsU0FBRztJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQU87UUFDakIsT0FBTyxDQUFDLFlBQVksSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFJRCxZQUFZLENBQTBCO1FBQ2xDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2IsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pCO2FBQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekI7YUFBTTtZQUNILElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztTQUN4QjtJQUNMLENBQUM7SUFFRCxJQUFJO1FBQ0EsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU07UUFDRixPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU07UUFDRixPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxXQUFXO1FBQ1AsT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNULE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDTCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELE9BQU87UUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsR0FBRztRQUNDLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7OztPQWdCRztJQUNILFdBQVcsQ0FBQyxRQUFrQixFQUFFLEtBQW9CO1FBQ2hELE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxxQkFBYSxDQUFDLEtBQUs7Z0JBQ3BCLE9BQU8sSUFBSSxxQkFBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsS0FBSyxxQkFBYSxDQUFDLE1BQU07Z0JBQ3JCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixPQUFPLElBQUkscUJBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDakUsS0FBSyxxQkFBYSxDQUFDLEdBQUc7Z0JBQ2xCLE9BQU8sSUFBSSxxQkFBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDdEQ7SUFDTCxDQUFDO0NBQ0o7QUE1R0Qsb0JBNEdDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsV0FBVyxDQUFDLENBQTBCO0lBQzNDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQVM0QiwyQkFBSTtBQVBqQzs7R0FFRztBQUNILFNBQVMsR0FBRztJQUNSLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFUSxrQkFBRyJ9