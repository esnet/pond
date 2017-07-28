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
import * as moment from "moment";

const UNITS: { [key: string]: number } = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7
};

const SHORT_UNITS: { [key: string]: number } = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7
};

/**
 * A period is a repeating unit of time which is typically
 * used in pond to describe an aggregation bucket. For example
 * a `period("1d")` would indicate buckets that are a day long.
 */
export class Period {
    private _duration: number;
    private _string: string;

    /**
     * * Passing a number to the constructor will
     * be considered as a `ms` duration.
     * * Passing a string to the constuctor will
     * be considered a duration string, with a
     * format of `%d[s|m|h|d]`
     * * Passing a number and a string will be considered
     * a quantity and a unit. The string should be one of:
     *   * milliseconds
     *   * seconds
     *   * minutes
     *   * hours
     *   * days
     *   * weeks
     * * Finally, you can pass either a `moment.Duration` or a
     * `Moment.Duration-like` object to the constructor
     */
    constructor(arg1: number | string, arg2?: string) {
        if (_.isNumber(arg1)) {
            if (!arg2) {
                this._duration = arg1;
            } else if (_.isString(arg2) && _.has(UNITS, arg2)) {
                const multiplier = arg1;
                this._duration = multiplier * UNITS[arg2];
            } else {
                throw new Error("Unknown arguments pssed to Period constructor");
            }
        } else if (_.isString(arg1)) {
            this._string = arg1;
            let multiplier: number;
            let unit: string;
            const regex = /([0-9]+)([smhdw])/;
            const parts = regex.exec(arg1);
            if (parts && parts.length >= 3) {
                multiplier = parseInt(parts[1], 10);
                unit = parts[2];
                this._duration = multiplier * SHORT_UNITS[unit];
            }
        } else if (moment.isDuration(arg1)) {
            const d = arg1 as moment.Duration;
            this._string = d.toISOString();
            this._duration = d.asMilliseconds();
        } else if (_.isObject(arg1)) {
            const d = moment.duration(arg1);
            this._string = d.toISOString();
            this._duration = d.asMilliseconds();
        } else {
            throw new Error("Unknown arguments pssed to Period constructor");
        }
    }

    toString(): string {
        if (this._string) {
            return this._string;
        }
        return `${this._duration}ms`;
    }

    valueOf(): number {
        return this._duration;
    }
}

function periodFactory(d: number | string, arg2?: string);
function periodFactory(arg1: number, arg2: string);
function periodFactory(arg1: object | moment.Duration);
function periodFactory(arg1?: any, arg2?: any): Period {
    return new Period(arg1, arg2);
}

export { periodFactory as period };
