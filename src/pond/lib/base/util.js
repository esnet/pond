/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";
import moment from "moment";
import TimeRange from "../timerange";
import Index from "../index";

const units = {
    s: { label: "seconds", length: 1 },
    m: { label: "minutes", length: 60 },
    h: { label: "hours", length: 60 * 60 },
    d: { label: "days", length: 60 * 60 * 24 }
};

/**
 * This function will take an index, which may be of two forms:
 *     2015-07-14  (day)
 *     2015-07     (month)
 *     2015        (year)
 * or:
 *     1d-278      (range, in n x days, hours, minutes or seconds)
 *
 * and return a TimeRange for that time. The TimeRange may be considered to be
 * local time or UTC time, depending on the utc flag passed in.
 */
export default {
    /**
     * Single zero left padding, for days and months.
     */
    leftPad(value) {
        return `${value < 10 ? "0" : ""}${value}`;
    },
    /**
     * Returns a duration in milliseconds given a window duration string.
     * For example "30s" (30 seconds) should return 30000ms. Accepts
     * seconds (e.g. "30s"), minutes (e.g. "5m"), hours (e.g. "6h") and
     * days (e.g. "30d")
     */
    windowDuration(w) {
        // window should be two parts, a number and a letter if it's a
        // range based index, e.g "1h".
        const regex = /([0-9]+)([smhd])/;
        const parts = regex.exec(w);
        if (parts && parts.length >= 3) {
            const num = parseInt(parts[1], 10);
            const unit = parts[2];
            return num * units[unit].length * 1000;
        }
    },
    windowPositionFromDate(w, date) {
        const duration = this.windowDuration(w);
        let dd = moment.utc(date).valueOf();
        return parseInt(dd /= duration, 10);
    },
    rangeFromIndexString(index, utc) {
        const isUTC = !_.isUndefined(utc) ? utc : true;
        const parts = index.split("-");

        let beginTime;
        let endTime;

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
                // Size should be two parts, a number and a letter if it's a
                // range based index, e.g 1h-23478
                const rangeRegex = /([0-9]+)([smhd])/;
                const sizeParts = rangeRegex.exec(parts[0]);
                if (
                    sizeParts &&
                        sizeParts.length >= 3 &&
                        !_.isNaN(parseInt(parts[1], 10))
                ) {
                    const pos = parseInt(parts[1], 10);
                    const num = parseInt(sizeParts[1], 10);
                    const unit = sizeParts[2];
                    const length = num * units[unit].length * 1000;

                    beginTime = isUTC
                        ? moment.utc(pos * length)
                        : moment(pos * length);
                    endTime = isUTC
                        ? moment.utc((pos + 1) * length)
                        : moment((pos + 1) * length);
                    // A month and year e.g 2015-09
                } else if (
                    !_.isNaN(parseInt(parts[0], 10)) &&
                        !_.isNaN(parseInt(parts[1], 10))
                ) {
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
            return new TimeRange(beginTime, endTime);
        } else {
            return undefined;
        }
    },
    /**
     * Returns a nice string for the index. If the index is of the form
     * 1d-2345 then just that string is returned (there's not nice way to put
     * it), but if it represents a day, month, or year (e.g. 2015-07) then a
     * nice string like "July" will be returned. It's also possible to pass in
     * the format of the reply for these types of strings. See moment's format
     * naming conventions:
     * http://momentjs.com/docs/#/displaying/format/
     */
    niceIndexString(index, format) {
        let t;

        const parts = index.split("-");
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
                const rangeRegex = /([0-9]+)([smhd])/;
                const sizeParts = rangeRegex.exec(parts[0]);
                if (
                    sizeParts &&
                        sizeParts.length >= 3 &&
                        !_.isNaN(parseInt(parts[1], 10))
                ) {
                    return index;
                } else if (
                    !_.isNaN(parseInt(parts[0], 10)) &&
                        !_.isNaN(parseInt(parts[1], 10))
                ) {
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
                break;
        }
        return index;
    },
    isMissing(val) {
        return _.isNull(val) || _.isUndefined(val) || _.isNaN(val);
    },
    /**
     * Split the field spec if it is not already a list.
     *
     * Also, allow for deep fields to be passed in as a tuple because
     * it will need to be used as a dict key in some of the processor
     * Options.
     *
     * This is deployed in Event.get() to process anything passed
     * to it, but this should also be deployed "upstream" to avoid
     * having that split() done over and over in a loop.
     */
    fieldPathToArray(fieldSpec) {
        if (_.isArray(fieldSpec) || _.isFunction(fieldSpec)) {
            return fieldSpec;
        } else if (_.isString(fieldSpec)) {
            return fieldSpec.split(".");
        } else if (_.isUndefined(fieldSpec)) {
            return ["value"];
        }
    },
    /**
     * Generate a list of all possible field paths in an object. This is
     * for to determine all deep paths when none is given.
     */
    generatePaths(newData) {
        const paths = [];

        function* recurse(data, keys = []) {
            if (_.isObject(data)) {
                for (const key of Object.keys(data)) {
                    for (const path of recurse(data[key], [...keys, key])) {
                        yield path;
                    }
                }
            } else {
                yield keys;
            }
        }

        for (const key of recurse(newData)) {
            paths.push(key);
        }

        return paths;
    },
    //
    // Functions to turn constructor args
    // into other stuff
    //
    timestampFromArg(arg) {
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
    },
    timeRangeFromArg(arg) {
        if (arg instanceof TimeRange) {
            return arg;
        } else if (_.isString(arg)) {
            const [begin, end] = arg.split(",");
            return new TimeRange([+begin, +end]);
        } else if (_.isArray(arg) && arg.length === 2) {
            return new TimeRange(arg);
        } else {
            throw new Error(
                `Unable to parse timerange. Should be a TimeRange. Got ${arg}.`
            );
        }
    },
    indexFromArgs(arg1, arg2 = true) {
        if (_.isString(arg1)) {
            return new Index(arg1, arg2);
        } else if (arg1 instanceof Index) {
            return arg1;
        } else {
            throw new Error(
                `Unable to get index from ${arg1}. Should be a string or Index.`
            );
        }
    },
    dataFromArg(arg) {
        let data;
        if (_.isObject(arg)) {
            // Deeply convert the data to Immutable Map
            data = new Immutable.fromJS(arg);
        } else if (data instanceof Immutable.Map) {
            // Copy reference to the data
            data = arg;
        } else if (_.isNumber(arg) || _.isString(arg)) {
            // Just add it to the value key of a new Map
            // e.g. new Event(t, 25); -> t, {value: 25}
            data = new Immutable.Map({ value: arg });
        } else {
            throw new Error(`Unable to interpret event data from ${arg}.`);
        }
        return data;
    }
};
