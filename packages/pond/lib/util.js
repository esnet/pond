"use strict";
/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const _ = require("lodash");
const moment = require("moment-timezone");
const duration_1 = require("./duration");
const index_1 = require("./index");
const time_1 = require("./time");
const timerange_1 = require("./timerange");
const period_1 = require("./period");
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
function isValid(v) {
    return !(_.isUndefined(v) || _.isNaN(v) || _.isNull(v));
}
/**
 * The last duration of time until now, represented as a `TimeRange`
 */
function untilNow(d) {
    const t = new Date();
    const begin = new Date(+t - +d);
    return new timerange_1.TimeRange(begin, t);
}
/**
 * Single zero left padding, for days and months.
 */
function leftPad(value) {
    return `${value < 10 ? "0" : ""}${value}`;
}
const indexStringRegex = /^((([0-9]+)([smhdlun]))@)*(([0-9]+)([smhdlun]))(\+([0-9]+))*-([0-9]+)$/;
/**
 * Returns a duration in milliseconds given a window period.
 * For example "30s" (30 seconds) should return 30000ms. Accepts
 * seconds (e.g. "30s"), minutes (e.g. "5m"), hours (e.g. "6h") and
 * days (e.g. "30d") as the period.
 */
function windowDuration(period) {
    // window should be two parts, a number and a letter if it's a
    // range based index, e.g "1h".
    const parts = indexStringRegex.exec(period);
    if (parts && parts.length >= 3) {
        const num = parseInt(parts[1], 10);
        const unit = parts[2];
        return num * UNITS[unit].length * 1000;
    }
}
/**
 * Decodes a period based index string. The result is a structure containing:
 *  - decodedPeriod
 *  - decodedDuration
 *  - decodedIndex
 */
function decodeIndexString(indexString) {
    const parts = indexStringRegex.exec(indexString);
    const [g1, d, g2, g3, g4, frequency, g6, g7, g8, offset, index] = parts;
    const decodedPeriod = period_1.period(duration_1.duration(frequency), offset ? time_1.time(parseInt(offset, 10)) : null);
    const decodedDuration = d ? duration_1.duration(d) : decodedPeriod.frequency();
    const decodedIndex = parseInt(index, 10);
    return { decodedPeriod, decodedDuration, decodedIndex };
}
function isIndexString(indexString) {
    return indexStringRegex.test(indexString);
}
/**
 * Helper function to get the window position relative
 * to Jan 1, 1970.
 */
function windowPositionFromDate(period, date) {
    const duration = this.windowDuration(period);
    let dd = moment.utc(date).valueOf();
    return Math.floor((dd /= duration));
}
/**
 * Given an index string, return the `TimeRange` that represents. This is the
 * main parsing function as far as taking an index string and decoding it into
 * the timerange that it represents. For example, this is how the Index
 * constructor is able to take a string and represent a timerange. It is also
 * used when windowing to determine trigger times.
 */
function timeRangeFromIndexString(indexString, tz = "Etc/UTC") {
    const parts = indexString.split("-");
    let beginTime;
    let endTime;
    switch (parts.length) {
        case 3:
            // A day, month and year e.g. 2014-10-24
            if (!_.isNaN(parseInt(parts[0], 10)) &&
                !_.isNaN(parseInt(parts[1], 10)) &&
                !_.isNaN(parseInt(parts[2], 10))) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                beginTime = moment.tz([year, month - 1, day], tz);
                endTime = moment.tz([year, month - 1, day], tz).endOf("day");
            }
            break;
        case 2:
            if (isIndexString(indexString)) {
                // Period index string e.g. 1d-1234
                const { decodedPeriod, decodedDuration, decodedIndex } = decodeIndexString(indexString);
                const beginTimestamp = decodedIndex * +decodedPeriod.frequency();
                const endTimestamp = beginTimestamp + +decodedDuration;
                beginTime = moment(beginTimestamp).tz(tz);
                endTime = moment(endTimestamp).tz(tz);
            }
            else if (!_.isNaN(parseInt(parts[0], 10)) && !_.isNaN(parseInt(parts[1], 10))) {
                // A month and year e.g 2015-09
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                beginTime = moment.tz([year, month - 1], tz);
                endTime = moment.tz([year, month - 1], tz).endOf("month");
            }
            break;
        // A year e.g. 2015
        case 1:
            const year = parseInt(parts[0], 10);
            beginTime = moment.tz([year], tz);
            endTime = moment.tz([year], tz).endOf("year");
            break;
    }
    if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
        return timerange_1.timerange(beginTime, endTime);
    }
    else {
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
function niceIndexString(indexString, format) {
    let t;
    const parts = indexString.split("-");
    switch (parts.length) {
        case 3:
            if (!_.isNaN(parseInt(parts[0], 10)) &&
                !_.isNaN(parseInt(parts[1], 10)) &&
                !_.isNaN(parseInt(parts[2], 10))) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                t = moment.utc([year, month - 1, day]);
                if (format) {
                    return t.format(format);
                }
                else {
                    return t.format("MMMM Do YYYY");
                }
            }
            break;
        case 2:
            if (isIndexString(indexString)) {
                return indexString;
            }
            else if (!_.isNaN(parseInt(parts[0], 10)) && !_.isNaN(parseInt(parts[1], 10))) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                t = moment.utc([year, month - 1]);
                if (format) {
                    return t.format(format);
                }
                else {
                    return t.format("MMMM");
                }
            }
            break;
        case 1:
            const year = parts[0];
            t = moment.utc([year]);
            if (format) {
                return t.format(format);
            }
            else {
                return t.format("YYYY");
            }
    }
    return indexString;
}
/**
 * Returns true if the value is null, undefined or NaN
 */
function isMissing(val) {
    return _.isNull(val) || _.isUndefined(val) || _.isNaN(val);
}
/**
 * Function to turn a constructor args into a timestamp
 */
function timestampFromArg(arg) {
    if (_.isNumber(arg)) {
        return new Date(arg);
    }
    else if (_.isString(arg)) {
        return new Date(+arg);
    }
    else if (_.isDate(arg)) {
        return new Date(arg.getTime());
    }
    else if (moment.isMoment(arg)) {
        return new Date(arg.valueOf());
    }
    else {
        throw new Error(`Unable to get timestamp from ${arg}. Should be a number, date, or moment.`);
    }
}
/**
 * Function to turn a constructor args into a `TimeRange`
 */
function timeRangeFromArg(arg) {
    if (arg instanceof timerange_1.TimeRange) {
        return arg;
    }
    else if (_.isString(arg)) {
        const [begin, end] = arg.split(",");
        return new timerange_1.TimeRange(+begin, +end);
    }
    else if (_.isArray(arg) && arg.length === 2) {
        const argArray = arg;
        return new timerange_1.TimeRange(argArray[0], argArray[1]);
    }
    else {
        throw new Error(`Unable to parse timerange. Should be a TimeRange. Got ${arg}.`);
    }
}
/**
 * Function to turn a constructor of two args into an `Index`.
 * The second arg defines the timezone (local or UTC)
 */
function indexFromArgs(arg1, arg2 = "Etc/UTC") {
    if (_.isString(arg1)) {
        return index_1.index(arg1, arg2);
    }
    else if (arg1 instanceof index_1.Index) {
        return arg1;
    }
    else {
        throw new Error(`Unable to get index from ${arg1}. Should be a string or Index.`);
    }
}
/**
 * Function to turn a constructor arg into an `Immutable.Map`
 * of data.
 */
function dataFromArg(arg) {
    let data;
    if (_.isObject(arg)) {
        // Deeply convert the data to Immutable Map
        data = Immutable.fromJS(arg);
    }
    else if (data instanceof Immutable.Map) {
        // Copy reference to the data
        data = arg;
    }
    else if (_.isNumber(arg) || _.isString(arg)) {
        // Just add it to the value key of a new Map
        // e.g. new Event(t, 25); -> t, {value: 25}
        data = Immutable.Map({ value: arg });
    }
    else {
        throw new Error(`Unable to interpret event data from ${arg}.`);
    }
    return data;
}
/**
 * Convert the `field spec` into a list if it is not already.
 */
function fieldAsArray(field) {
    if (_.isArray(field)) {
        return field;
    }
    else if (_.isString(field)) {
        return field.split(".");
    }
}
exports.default = {
    dataFromArg,
    fieldAsArray,
    indexFromArgs,
    isMissing,
    isValid,
    leftPad,
    isIndexString,
    decodeIndexString,
    niceIndexString,
    timeRangeFromArg,
    timeRangeFromIndexString,
    timestampFromArg,
    untilNow,
    windowDuration,
    windowPositionFromDate
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBQzVCLDBDQUEwQztBQUUxQyx5Q0FBZ0Q7QUFDaEQsbUNBQXVDO0FBQ3ZDLGlDQUE4QjtBQUM5QiwyQ0FBbUQ7QUFDbkQscUNBQTBDO0FBRTFDLE1BQU0sS0FBSyxHQUFHO0lBQ1YsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRTtJQUNoRCxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFO0lBQzlDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtJQUN2QyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDckMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRTtJQUMxQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBRTtJQUM3QyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUU7Q0FDcEQsQ0FBQztBQUVGOztHQUVHO0FBQ0gsaUJBQWlCLENBQVM7SUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FB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