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
import Key from "./key";

/**
 * Constructs a new Time object that can be used as
 * a key for Events. A Time object represents a
 * timestamp, and is stored as a Javascript Date
 * object. The difference with just a Date is that
 * is conforms to the interface required to be an
 * Event key.
 */
export default class Time extends Key {

    private _d: Date;

    constructor();
    constructor(d: Date);
    constructor(d: number);
    constructor(d: string);
    constructor(d?: Date | number | string) {
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

    toJSON(): Object {
        return +this._d;
    }

    toString(): string {
        return `${this.toJSON()}`;
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

    static isTime(t: Time) {
        return t instanceof Time;
    }
}
