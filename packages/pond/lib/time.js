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
        else if (_.isNumber(d) || _.isString(d)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCw0QkFBNEI7QUFFNUIsK0JBQTRCO0FBQzVCLDJDQUF3QztBQUN4QyxtQ0FBd0M7QUFFeEM7Ozs7OztHQU1HO0FBQ0gsVUFBa0IsU0FBUSxTQUFHO0lBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBTztRQUNqQixNQUFNLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQztJQUM3QixDQUFDO0lBSUQsWUFBWSxDQUEwQjtRQUNsQyxLQUFLLEVBQUUsQ0FBQztRQUNSLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3pCLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSTtRQUNBLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU07UUFDRixNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELFFBQVE7UUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxXQUFXO1FBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhO1FBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELE9BQU87UUFDSCxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILEdBQUc7UUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxXQUFXLENBQUMsUUFBa0IsRUFBRSxLQUFvQjtRQUNoRCxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUNwQixNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNwQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1osS0FBSyxxQkFBYSxDQUFDLEtBQUs7Z0JBQ3BCLE1BQU0sQ0FBQyxJQUFJLHFCQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxLQUFLLHFCQUFhLENBQUMsTUFBTTtnQkFDckIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLHFCQUFTLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ2pFLEtBQUsscUJBQWEsQ0FBQyxHQUFHO2dCQUNsQixNQUFNLENBQUMsSUFBSSxxQkFBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkQsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQWxGRCxvQkFrRkM7QUFFRDs7OztHQUlHO0FBQ0gscUJBQXFCLENBQTBCO0lBQzNDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBUzRCLDJCQUFJO0FBUGpDOztHQUVHO0FBQ0g7SUFDSSxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFUSxrQkFBRyJ9