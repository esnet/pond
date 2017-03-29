/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
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
const Immutable = require("immutable");
const moment = require("moment");
const indexed_1 = require("./indexed");
const timerange_1 = require("./timerange");
const UNITS = {
    s: { label: "seconds", length: 1 },
    m: { label: "minutes", length: 60 },
    h: { label: "hours", length: 60 * 60 },
    d: { label: "days", length: 60 * 60 * 24 }
};
/**
 * Single zero left padding, for days and months.
 */
function leftPad(value) {
    return `${value < 10 ? "0" : ""}${value}`;
}
/**
 * Returns a duration in milliseconds given a window period.
 * For example "30s" (30 seconds) should return 30000ms. Accepts
 * seconds (e.g. "30s"), minutes (e.g. "5m"), hours (e.g. "6h") and
 * days (e.g. "30d") as the period.
 */
function windowDuration(period) {
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
function windowPositionFromDate(period, date) {
    const duration = this.windowDuration(period);
    let dd = moment.utc(date).valueOf();
    return Math.floor(dd /= duration);
}
/**
 * Given an index string, return the TimeRange that represents.
 */
function rangeFromIndexString(indexString, utc) {
    const isUTC = !_.isUndefined(utc) ? utc : true;
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
                beginTime = isUTC
                    ? moment.utc([year, month - 1, day])
                    : moment([year, month - 1, day]);
                endTime = isUTC
                    ? moment.utc(beginTime).endOf("day")
                    : moment(beginTime).endOf("day");
            }
            break;
        case 2:
            // Size should be two parts, a number and a letter if it's a
            // range based index, e.g 1h-23478
            const rangeRegex = /([0-9]+)([smhd])/;
            const sizeParts = rangeRegex.exec(parts[0]);
            if (sizeParts &&
                sizeParts.length >= 3 &&
                !_.isNaN(parseInt(parts[1], 10))) {
                const pos = parseInt(parts[1], 10);
                const num = parseInt(sizeParts[1], 10);
                const unit = sizeParts[2];
                const length = num * UNITS[unit].length * 1000;
                beginTime = isUTC
                    ? moment.utc(pos * length)
                    : moment(pos * length);
                endTime = isUTC
                    ? moment.utc((pos + 1) * length)
                    : moment((pos + 1) * length);
                // A month and year e.g 2015-09
            }
            else if (!_.isNaN(parseInt(parts[0], 10)) &&
                !_.isNaN(parseInt(parts[1], 10))) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                beginTime = isUTC
                    ? moment.utc([year, month - 1])
                    : moment([year, month - 1]);
                endTime = isUTC
                    ? moment.utc(beginTime).endOf("month")
                    : moment(beginTime).endOf("month");
            }
            break;
        // A year e.g. 2015
        case 1:
            const year = parts[0];
            beginTime = isUTC ? moment.utc([year]) : moment([year]);
            endTime = isUTC
                ? moment.utc(beginTime).endOf("year")
                : moment(beginTime).endOf("year");
            break;
    }
    if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
        return new timerange_1.default(beginTime, endTime);
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
            const rangeRegex = /([0-9]+)([smhd])/;
            const sizeParts = rangeRegex.exec(parts[0]);
            if (sizeParts &&
                sizeParts.length >= 3 &&
                !_.isNaN(parseInt(parts[1], 10))) {
                return indexString;
            }
            else if (!_.isNaN(parseInt(parts[0], 10)) &&
                !_.isNaN(parseInt(parts[1], 10))) {
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
function fieldAsArray(fieldSpec) {
    if (_.isArray(fieldSpec)) {
        return fieldSpec;
    }
    else if (_.isString(fieldSpec)) {
        return fieldSpec.split(".");
    }
    else if (_.isUndefined(fieldSpec)) {
        return ["value"];
    }
}
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
function timeRangeFromArg(arg) {
    if (arg instanceof timerange_1.default) {
        return arg;
    }
    else if (_.isString(arg)) {
        const [begin, end] = arg.split(",");
        return new timerange_1.default(+begin, +end);
    }
    else if (_.isArray(arg) && arg.length === 2) {
        const argArray = (arg);
        return new timerange_1.default(argArray[0], argArray[1]);
    }
    else {
        throw new Error(`Unable to parse timerange. Should be a TimeRange. Got ${arg}.`);
    }
}
/**
 * Function to turn a constructor of two args into an Index.
 * The second arg defines the timezone (local or UTC)
 */
function indexFromArgs(arg1, arg2 = true) {
    if (_.isString(arg1)) {
        return new indexed_1.default(arg1, arg2);
    }
    else if (arg1 instanceof indexed_1.default) {
        return arg1;
    }
    else {
        throw new Error(`Unable to get index from ${arg1}. Should be a string or Index.`);
    }
}
/**
 * Function to turn a constructor arg into an Immutable.Map
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
exports.default = {
    leftPad,
    windowDuration,
    windowPositionFromDate,
    rangeFromIndexString,
    niceIndexString,
    isMissing,
    fieldAsArray,
    timestampFromArg,
    timeRangeFromArg,
    indexFromArgs,
    dataFromArg
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztHQVFHOzs7QUFFSCw0QkFBNEI7QUFDNUIsdUNBQXVDO0FBQ3ZDLGlDQUFpQztBQUdqQyx1Q0FBOEI7QUFDOUIsMkNBQW9DO0FBRXBDLE1BQU0sS0FBSyxHQUFHO0lBQ1YsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO0lBQ2xDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtJQUNuQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3RDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0NBQzdDLENBQUM7QUFFRjs7R0FFRztBQUNILGlCQUFpQixLQUFhO0lBQzFCLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUM5QyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCx3QkFBd0IsTUFBTTtJQUMxQiw4REFBOEQ7SUFDOUQsK0JBQStCO0lBQy9CLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO0lBQ2pDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLE1BQU0s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