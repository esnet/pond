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
const UNITS = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7
};
const SHORT_UNITS = {
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
exports.default = Period;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyaW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BlcmlvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7R0FRRzs7O0FBRUgsNEJBQTRCO0FBRzVCLE1BQU0sS0FBSyxHQUE4QjtJQUNyQyxZQUFZLEVBQUUsQ0FBQztJQUNmLE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFFO0lBQ2xCLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDckIsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDekIsS0FBSyxFQUFFLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ2pDLENBQUM7QUFFRixNQUFNLFdBQVcsR0FBOEI7SUFDM0MsQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUU7SUFDWixDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFO0lBQ2pCLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0lBQ3RCLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUM3QixDQUFDO0FBRUY7OztHQUdHO0FBQ0g7SUE4QkksWUFBWSxJQUFxQixFQUFFLElBQWE7UUFDNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQzFCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7WUFDckUsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxVQUFrQixDQUFDO1lBQ3ZCLElBQUksSUFBWSxDQUFDO1lBQ2pCLE1BQU0sS0FBSyxHQUFHLG1CQUFtQixDQUFDO1lBQ2xDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0IsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxDQUFDO1FBQ0wsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7SUFDTCxDQUFDO0lBRUQsUUFBUTtRQUNKLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQztJQUNqQyxDQUFDO0lBRUQsT0FBTztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQWxFRCx5QkFrRUMifQ==