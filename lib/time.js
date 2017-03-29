/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const eventkey_1 = require("./eventkey");
/**
 * Constructs a new Time object that can be used as
 * a key for Events. A Time object represents a
 * timestamp, and is stored as a Javascript Date
 * object. The difference with just a Date is that
 * is conforms to the interface required to be an
 * Event key.
 */
class Time extends eventkey_1.default {
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
        return +this._d;
    }
    toString() {
        return `${this.toJSON()}`;
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
     * The begin time of this Event, which will be just the timestamp
     */
    begin() {
        return this.timestamp();
    }
    /**
     * The end time of this Event, which will be just the timestamp
     */
    end() {
        return this.timestamp();
    }
    static isTime(t) {
        return t instanceof Time;
    }
}
exports.default = Time;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztHQVFHOzs7QUFFSCw0QkFBNEI7QUFDNUIseUNBQWtDO0FBRWxDOzs7Ozs7O0dBT0c7QUFDSCxVQUEwQixTQUFRLGtCQUFRO0lBUXRDLFlBQVksQ0FBMEI7UUFDbEMsS0FBSyxFQUFFLENBQUM7UUFDUixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNkLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUk7UUFDQSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNO1FBQ0YsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQsUUFBUTtRQUNKLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWE7UUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsT0FBTztRQUNILE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsR0FBRztRQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBTztRQUNqQixNQUFNLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQztJQUM3QixDQUFDO0NBQ0o7QUF6RUQsdUJBeUVDIn0=