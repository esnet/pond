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
const _ = require("lodash");
const UNITS = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7
};
const SHORT_UNITS = {
    s: UNITS.seconds,
    m: UNITS.minutes,
    h: UNITS.hours,
    d: UNITS.days,
    w: UNITS.days
};
/**
 * Constructs a new Period object that can be used as
 * a key for Events.
 */
class Period {
    constructor(arg1, arg2) {
        if (_.isNumber(arg1)) {
            if (!arg2) {
                this._duration = arg1;
            }
            else if (_.isString(arg2) && _.has(UNITS, arg2)) {
                const multiplier = arg1;
                this._duration = multiplier * UNITS[arg2];
            }
            else {
                throw new Error("Unknown arguments pssed to Period constructor");
            }
        }
        else if (_.isString(arg1)) {
            this._string = arg1;
            let multiplier;
            let unit;
            const regex = /([0-9]+)([smhdw])/;
            const parts = regex.exec(arg1);
            if (parts && parts.length >= 3) {
                multiplier = parseInt(parts[1], 10);
                unit = parts[2];
                this._duration = multiplier * SHORT_UNITS[unit];
            }
        }
        else {
            throw new Error("Unknown arguments pssed to Period constructor");
        }
    }
    toString() {
        if (this._string) {
            return this._string;
        }
        return `${this._duration}ms`;
    }
    valueOf() {
        return this._duration;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Period;
//# sourceMappingURL=period.js.map