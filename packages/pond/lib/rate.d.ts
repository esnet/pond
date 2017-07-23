/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
import * as Immutable from "immutable";
import { Event } from "./event";
import { Key } from "./key";
import { Processor } from "./processor";
import { TimeRange } from "./timerange";
import { RateOptions } from "./types";
/**
 * A processor to align the data into bins of regular time period.
 */
export declare class Rate<T extends Key> extends Processor<T, TimeRange> {
    private _fieldSpec;
    private _allowNegative;
    private _previous;
    constructor(options: RateOptions);
    /**
     * Generate a new TimeRangeEvent containing the rate per second
     * between two events.
     */
    getRate(event: any): Event<TimeRange>;
    /**
     * Perform the fill operation on the event and emit.
     */
    addEvent(event: Event<T>): Immutable.List<Event<TimeRange>>;
}
