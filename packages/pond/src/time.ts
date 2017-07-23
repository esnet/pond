/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as _ from "lodash";
import { Key } from "./key";
import { Period } from "./period";
import { TimeRange } from "./timerange";

import { TimeAlignment } from "./types";

/**
 * Constructs a new `Time` object that can be used as
 * a key for `Event`'s. A `Time` object represents a
 * timestamp, and is stored as a Javascript `Date`
 * object. The difference with just a Date is that
 * is conforms to the interface required to be an
 * `Event` key.
 */
export class Time extends Key {
    static isTime(t: Time) {
        return t instanceof Time;
    }

    private _d: Date;

    constructor(d?: number | string | Date) {
        super();
        if (_.isDate(d)) {
            this._d = d;
        } else if (_.isNumber(d) || _.isString(d)) {
            this._d = new Date(d);
        } else {
            this._d = new Date();
        }
    }

    type() {
        return "time";
    }

    toJSON(): {} {
        return { time: +this._d };
    }

    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    /**
     * The timestamp of this data, in UTC time, as a string.
     */
    toUTCString(): string {
        return this.timestamp().toUTCString();
    }

    /**
     * The timestamp of this data, in Local time, as a string.
     */
    toLocalString(): string {
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

    toTimeRange(period: Period, align: TimeAlignment): TimeRange {
        const duration = +period;
        const timestamp = +this.timestamp();
        switch (align) {
            case TimeAlignment.Begin:
                return new TimeRange(timestamp, timestamp + duration);
            case TimeAlignment.Middle:
                const half = Math.round(duration / 2);
                return new TimeRange(timestamp - half, timestamp + duration - half);
            case TimeAlignment.End:
                return new TimeRange(timestamp - duration, timestamp);
        }
    }
}

function timeFactory(d?: number | string | Date): Time {
    return new Time(d);
}

export { timeFactory as time };
