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
import { Duration } from "./duration";
import { Index } from "./index";
import { Period } from "./period";
import { TimeRange } from "./timerange";
export interface DecodedIndexString {
    decodedPeriod: Period;
    decodedDuration: Duration;
    decodedIndex: number;
}
declare const _default: {
    dataFromArg: (
        arg: string | number | {} | Immutable.Map<string, any>
    ) => Immutable.Map<string, any>;
    fieldAsArray: (field: string | string[]) => string[];
    indexFromArgs: (arg1: string | Index, arg2?: string) => Index;
    isMissing: (val: any) => boolean;
    isValid: (v: number) => boolean;
    leftPad: (value: number) => string;
    isIndexString: (indexString: string) => boolean;
    decodeIndexString: (indexString: string) => DecodedIndexString;
    niceIndexString: (indexString: string, format: string) => string;
    timeRangeFromArg: (arg: string | TimeRange | Date[]) => TimeRange;
    timeRangeFromIndexString: (indexString: string, tz?: string) => TimeRange;
    timestampFromArg: (arg: any) => Date;
    untilNow: (d: Duration) => TimeRange;
    windowDuration: (p: string) => number;
    windowPositionFromDate: (p: string, date: Date) => number;
};
export default _default;
