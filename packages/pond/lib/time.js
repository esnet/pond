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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCw0QkFBNEI7QUFFNUIsK0JBQTRCO0FBQzVCLDJDQUF3QztBQUN4QyxtQ0FBd0M7QUFFeEM7Ozs7OztHQU1HO0FBQ0gsVUFBa0IsU0FBUSxTQUFHO0lBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBTztRQUNqQixNQUFNLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQztJQUM3QixDQUFDO0lBSUQsWUFBWSxDQUEwQjtRQUNsQyxLQUFLLEVBQUUsQ0FBQztRQUNSLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFFRCxJQUFJO1FBQ0EsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTTtRQUNGLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQsUUFBUTtRQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWE7UUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsT0FBTztRQUNILE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsR0FBRztRQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFrQixFQUFFLEtBQW9CO1FBQ2hELE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWixLQUFLLHFCQUFhLENBQUMsS0FBSztnQkFDcEIsTUFBTSxDQUFDLElBQUkscUJBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELEtBQUsscUJBQWEsQ0FBQyxNQUFNO2dCQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLElBQUkscUJBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDakUsS0FBSyxxQkFBYSxDQUFDLEdBQUc7Z0JBQ2xCLE1BQU0sQ0FBQyxJQUFJLHFCQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN2RCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBcEZELG9CQW9GQztBQUVEOzs7O0dBSUc7QUFDSCxxQkFBcUIsQ0FBMEI7SUFDM0MsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFTNEIsMkJBQUk7QUFQakM7O0dBRUc7QUFDSDtJQUNJLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUVRLGtCQUFHIn0=