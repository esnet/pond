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
 * Constructs a new Period object that can be used as
 * a key for Events.
 */
export default class Period {

    private _duration: number;
    private _string: string;

    /**
     * Passing a number to the constructor will
     * be considered as a ms duration
     */
    constructor(d: number);

    /**
     * Passing a string to the constuctor will
     * be considered a duration string, with a
     * format of %d[s|m|h|d]
     */
    constructor(d: string);

    /**
     * Passing a number and a string will be considered
     * a quantity and a unit. The string should be one of:
     *  * milliseconds
     *  * seconds
     *  * minutes
     *  * hours
     *  * days
     *  * weeks
     */
    constructor(arg1: number, arg2: string);

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
