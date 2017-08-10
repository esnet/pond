/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as Immutable from "immutable";
import * as _ from "lodash";
import * as moment from "moment";
import Moment = moment.Moment;
import { Duration, duration } from "./duration";
import { Index, index } from "./index";
import { TimeRange, timerange } from "./timerange";

const UNITS = {
    n: { label: "nanoseconds", length: 1 / 1000000 },
    u: { label: "microseconds", length: 1 / 1000 },
    l: { label: "milliseconds", length: 1 },
    s: { label: "seconds", length: 1000 },
    m: { label: "minutes", length: 60 * 1000 },
    h: { label: "hours", length: 60 * 60 * 1000 },
    d: { label: "days", length: 60 * 60 * 24 * 1000 }
};

/**
 * A value is valid if it isn't either undefined, null, or a NaN
 */
function isValid(v: number): boolean {
    return !(_.isUndefined(v) || _.isNaN(v) || _.isNull(v));
}

/**
 * The last duration of time until now, represented as a `TimeRange`
 */
function untilNow(d: Duration): TimeRange {
    const t = new Date();
    const begin = new Date(+t - +d);
    return new TimeRange(begin, t);
}

/**
 * Single zero left padding, for days and months.
 */
function leftPad(value: number): string {
    return `${value < 10 ? "0" : ""}${value}`;
}

/**
 * Returns a duration in milliseconds given a window period.
 * For example "30s" (30 seconds) should return 30000ms. Accepts
 * seconds (e.g. "30s"), minutes (e.g. "5m"), hours (e.g. "6h") and
 * days (e.g. "30d") as the period.
 */
function windowDuration(period): number {
    // window should be two parts, a number and a letter if it's a
    // range based index, e.g "1h".
    const regex = /([0-9]+)([smhd])/;
    const parts = regex.exec(period);
    if (parts && parts.length >= 3) {
        const num = parseInt(parts[1], 10);
        const unit = parts[2];
        return num * UNITS[unit].length * 1000;
    }
}

/**
 * Helper function to get the window position relative
 * to Jan 1, 1970.
 */
function windowPositionFromDate(period: string, date: Date) {
    const duration = this.windowDuration(period);
    let dd = moment.utc(date).valueOf();
    return Math.floor((dd /= duration));
}

function isIndexString(indexString: string): boolean {
    const regex = /([0-9]+)([smhdlun])-([0-9]+)/;
    return regex.test(indexString);
}

/**
 * Given an index string, return the `TimeRange` that represents.
 */
function timeRangeFromIndexString(indexString: string, utc: boolean): TimeRange {
    const isUTC = !_.isUndefined(utc) ? utc : true;
    const parts = indexString.split("-");

    let beginTime: Moment;
    let endTime: Moment;

    switch (parts.length) {
        case 3:
            // A day, month and year e.g. 2014-10-24
            if (
                !_.isNaN(parseInt(parts[0], 10)) &&
                !_.isNaN(parseInt(parts[1], 10)) &&
                !_.isNaN(parseInt(parts[2], 10))
            ) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                beginTime = isUTC
                    ? moment.utc([year, month - 1, day])
                    : moment([year, month - 1, day]);
                endTime = isUTC
                    ? moment.utc(beginTime).endOf("day")
                    : moment(beginTime).endOf("day");
            }
            break;

        case 2:
            if (isIndexString(indexString)) {
                const [prefix, periodIndex] = parts;
                const [frequency, length = frequency] = prefix.split(":");
                const periodStride = +duration(frequency);
                const periodLength = +duration(length);
                const index = parseInt(periodIndex, 10);

                beginTime = isUTC ? moment.utc(index * periodStride) : moment(index * periodStride);
                endTime = isUTC
                    ? moment.utc(+beginTime + periodLength)
                    : moment(+beginTime + periodLength);
            } else if (!_.isNaN(parseInt(parts[0], 10)) && !_.isNaN(parseInt(parts[1], 10))) {
                // A month and year e.g 2015-09
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                beginTime = isUTC ? moment.utc([year, month - 1]) : moment([year, month - 1]);
                endTime = isUTC
                    ? moment.utc(beginTime).endOf("month")
                    : moment(beginTime).endOf("month");
            }
            break;

        // A year e.g. 2015
        case 1:
            const year = parts[0];
            beginTime = isUTC ? moment.utc([year]) : moment([year]);
            endTime = isUTC ? moment.utc(beginTime).endOf("year") : moment(beginTime).endOf("year");
            break;
    }

    if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
        return timerange(beginTime, endTime);
    } else {
        return undefined;
    }
}

/**
 * Returns a nice string for an index string. If the index string is of
 * the form 1d-2345 then just that string is returned (there's not nice
 * way to put it), but if it represents a day, month, or year
 * (e.g. 2015-07) then a nice string like "July" will be returned. It's
 * also possible to pass in the format of the reply for these types of
 * strings. See moment's format naming conventions:
 * http://momentjs.com/docs/#/displaying/format/
 */
function niceIndexString(indexString: string, format: string): string {
    let t;
    const parts = indexString.split("-");
    switch (parts.length) {
        case 3:
            if (
                !_.isNaN(parseInt(parts[0], 10)) &&
                !_.isNaN(parseInt(parts[1], 10)) &&
                !_.isNaN(parseInt(parts[2], 10))
            ) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                t = moment.utc([year, month - 1, day]);
                if (format) {
                    return t.format(format);
                } else {
                    return t.format("MMMM Do YYYY");
                }
            }
            break;
        case 2:
            if (isIndexString(indexString)) {
                return indexString;
            } else if (!_.isNaN(parseInt(parts[0], 10)) && !_.isNaN(parseInt(parts[1], 10))) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                t = moment.utc([year, month - 1]);
                if (format) {
                    return t.format(format);
                } else {
                    return t.format("MMMM");
                }
            }
            break;
        case 1:
            const year = parts[0];
            t = moment.utc([year]);
            if (format) {
                return t.format(format);
            } else {
                return t.format("YYYY");
            }
    }
    return indexString;
}

/**
 * Returns true if the value is null, undefined or NaN
 */
function isMissing(val: any): boolean {
    return _.isNull(val) || _.isUndefined(val) || _.isNaN(val);
}

/**
 * Function to turn a constructor args into a timestamp
 */
function timestampFromArg(arg: number | string | Date | Moment): Date {
    if (_.isNumber(arg)) {
        return new Date(arg);
    } else if (_.isString(arg)) {
        return new Date(+arg);
    } else if (_.isDate(arg)) {
        return new Date(arg.getTime());
    } else if (moment.isMoment(arg)) {
        return new Date(arg.valueOf());
    } else {
        throw new Error(
            `Unable to get timestamp from ${arg}. Should be a number, date, or moment.`
        );
    }
}

/**
 * Function to turn a constructor args into a `TimeRange`
 */
function timeRangeFromArg(arg: TimeRange | string | Date[]): TimeRange {
    if (arg instanceof TimeRange) {
        return arg;
    } else if (_.isString(arg)) {
        const [begin, end] = arg.split(",");
        return new TimeRange(+begin, +end);
    } else if (_.isArray(arg) && arg.length === 2) {
        const argArray = arg as Date[];
        return new TimeRange(argArray[0], argArray[1]);
    } else {
        throw new Error(`Unable to parse timerange. Should be a TimeRange. Got ${arg}.`);
    }
}

/**
 * Function to turn a constructor of two args into an `Index`.
 * The second arg defines the timezone (local or UTC)
 */
function indexFromArgs(arg1: string | Index, arg2: boolean = true): Index {
    if (_.isString(arg1)) {
        return index(arg1, arg2);
    } else if (arg1 instanceof Index) {
        return arg1;
    } else {
        throw new Error(`Unable to get index from ${arg1}. Should be a string or Index.`);
    }
}

/**
 * Function to turn a constructor arg into an `Immutable.Map`
 * of data.
 */
function dataFromArg(
    arg: {} | Immutable.Map<string, any> | number | string
): Immutable.Map<string, any> {
    let data;
    if (_.isObject(arg)) {
        // Deeply convert the data to Immutable Map
        data = Immutable.fromJS(arg);
    } else if (data instanceof Immutable.Map) {
        // Copy reference to the data
        data = arg;
    } else if (_.isNumber(arg) || _.isString(arg)) {
        // Just add it to the value key of a new Map
        // e.g. new Event(t, 25); -> t, {value: 25}
        data = Immutable.Map({ value: arg });
    } else {
        throw new Error(`Unable to interpret event data from ${arg}.`);
    }
    return data;
}

/**
 * Convert the `field spec` into a list if it is not already.
 */
function fieldAsArray(field: string | string[]): string[] {
    if (_.isArray(field)) {
        return field;
    } else if (_.isString(field)) {
        return field.split(".");
    }
}

export default {
    dataFromArg,
    fieldAsArray,
    indexFromArgs,
    isMissing,
    isValid,
    leftPad,
    isIndexString,
    niceIndexString,
    timeRangeFromArg,
    timeRangeFromIndexString,
    timestampFromArg,
    untilNow,
    windowDuration,
    windowPositionFromDate
};
