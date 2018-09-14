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
import * as moment from "moment-timezone";
import Moment = moment.Moment;
import { Duration } from "./duration";
import { Index } from "./index";
import { Period } from "./period";
import { TimeRange } from "./timerange";
/**
 * A value is valid if it isn't either undefined, null, or a NaN
 */
declare function isValid(v: number): boolean;
/**
 * The last duration of time until now, represented as a `TimeRange`
 */
declare function untilNow(d: Duration): TimeRange;
/**
 * Single zero left padding, for days and months.
 */
declare function leftPad(value: number): string;
/**
 * Returns a duration in milliseconds given a window period.
 * For example "30s" (30 seconds) should return 30000ms. Accepts
 * seconds (e.g. "30s"), minutes (e.g. "5m"), hours (e.g. "6h") and
 * days (e.g. "30d") as the period.
 */
declare function windowDuration(p: string): number;
export interface DecodedIndexString {
    decodedPeriod: Period;
    decodedDuration: Duration;
    decodedIndex: number;
}
/**
 * Decodes a period based index string. The result is a structure containing:
 *  - decodedPeriod
 *  - decodedDuration
 *  - decodedIndex
 */
declare function decodeIndexString(indexString: string): DecodedIndexString;
declare function isIndexString(indexString: string): boolean;
/**
 * Helper function to get the window position relative
 * to Jan 1, 1970.
 */
declare function windowPositionFromDate(p: string, date: Date): number;
/**
 * Given an index string, return the `TimeRange` that represents. This is the
 * main parsing function as far as taking an index string and decoding it into
 * the timerange that it represents. For example, this is how the Index
 * constructor is able to take a string and represent a timerange. It is also
 * used when windowing to determine trigger times.
 */
declare function timeRangeFromIndexString(indexString: string, tz?: string): TimeRange;
/**
 * Returns a nice string for an index string. If the index string is of
 * the form 1d-2345 then just that string is returned (there's not nice
 * way to put it), but if it represents a day, month, or year
 * (e.g. 2015-07) then a nice string like "July" will be returned. It's
 * also possible to pass in the format of the reply for these types of
 * strings. See moment's format naming conventions:
 * http://momentjs.com/docs/#/displaying/format/
 */
declare function niceIndexString(indexString: string, format: string): string;
/**
 * Returns true if the value is null, undefined or NaN
 */
declare function isMissing(val: any): boolean;
/**
 * Function to turn a constructor args into a timestamp
 */
declare function timestampFromArg(arg: number | string | Date | Moment): Date;
/**
 * Function to turn a constructor args into a `TimeRange`
 */
declare function timeRangeFromArg(arg: TimeRange | string | Date[]): TimeRange;
/**
 * Function to turn a constructor of two args into an `Index`.
 * The second arg defines the timezone (local or UTC)
 */
declare function indexFromArgs(arg1: string | Index, arg2?: string): Index;
/**
 * Function to turn a constructor arg into an `Immutable.Map`
 * of data.
 */
declare function dataFromArg(arg: {} | Immutable.Map<string, any> | number | string): Immutable.Map<string, any>;
/**
 * Convert the `field spec` into a list if it is not already.
 */
declare function fieldAsArray(field: string | string[]): string[];
declare const _default: {
    dataFromArg: typeof dataFromArg;
    fieldAsArray: typeof fieldAsArray;
    indexFromArgs: typeof indexFromArgs;
    isMissing: typeof isMissing;
    isValid: typeof isValid;
    leftPad: typeof leftPad;
    isIndexString: typeof isIndexString;
    decodeIndexString: typeof decodeIndexString;
    niceIndexString: typeof niceIndexString;
    timeRangeFromArg: typeof timeRangeFromArg;
    timeRangeFromIndexString: typeof timeRangeFromIndexString;
    timestampFromArg: typeof timestampFromArg;
    untilNow: typeof untilNow;
    windowDuration: typeof windowDuration;
    windowPositionFromDate: typeof windowPositionFromDate;
};
export default _default;
