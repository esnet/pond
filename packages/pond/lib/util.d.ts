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
import * as moment from "moment";
import { Index } from "./index";
import { Period } from "./period";
import { TimeRange } from "./timerange";
declare const _default: {
    dataFromArg: (arg: string | number | {} | Immutable.Map<string, any>) => Immutable.Map<string, any>;
    fieldAsArray: (field: string | string[]) => string[];
    indexFromArgs: (arg1: string | Index, arg2?: boolean) => Index;
    isMissing: (val: any) => boolean;
    isValid: (v: number) => boolean;
    leftPad: (value: number) => string;
    niceIndexString: (indexString: string, format: string) => string;
    timeRangeFromArg: (arg: string | TimeRange | Date[]) => TimeRange;
    timeRangeFromIndexString: (indexString: string, utc: boolean) => TimeRange;
    timestampFromArg: (arg: string | number | Date | moment.Moment) => Date;
    untilNow: (period: Period) => TimeRange;
    windowDuration: (period: any) => number;
    windowPositionFromDate: (period: string, date: Date) => number;
};
export default _default;
