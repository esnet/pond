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
import { Time } from "./time";
import { AlignmentOptions } from "./types";
/**
 * A processor to align the data into bins of regular time period, using a
 * `Period` object.
 */
export declare class Align<T extends Key> extends Processor<T, T> {
    private _fieldSpec;
    private _period;
    private _method;
    private _limit;
    private _previous;
    constructor(options: AlignmentOptions);
    /**
     * Test to see if an event is perfectly aligned. Used on first event.
     */
    isAligned(event: Event<T>): boolean;
    /**
     * Returns a list of indexes of window boundaries if the current
     * event and the previous event do not lie in the same window. If
     * they are in the same window, return an empty list.
     */
    getBoundaries(event: Event<T>): Immutable.List<Time>;
    /**
     * Generate a new event on the requested boundary and carry over the
     * value from the previous event.
     *
     * A variation just sets the values to null, this is used when the
     * limit is hit.
     */
    interpolateHold(boundaryTime: Time, setNone?: boolean): Event<Time>;
    /**
     * Generate a linear differential between two counter values that lie
     * on either side of a window boundary.
     */
    interpolateLinear(boundaryTime: Time, event: Event<T>): Event<Time>;
    /**
     * Perform the align operation on the event and emit.
     */
    addEvent(event: Event<T>): Immutable.List<Event<T>>;
}
