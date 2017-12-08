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
import { FillOptions } from "./types";
/**
 * A processor that fills missing/invalid values in the `Event` with
 * new values (zero, interpolated or padded).
 *
 * When doing a linear fill, Filler instances should be chained.
 */
export declare class Fill<T extends Key> extends Processor<T, T> {
    private _fieldSpec;
    private _method;
    private _limit;
    private _previous;
    private _keyCount;
    private _lastGoodLinear;
    private _linearFillCache;
    constructor(options: FillOptions);
    /**
     * Process and fill the values at the paths as apropos when the fill
     * method is either pad or zero.
     */
    constFill(data: Immutable.Map<string, any>): Immutable.Map<string, any>;
    /**
     * Check to see if an `Event` has good values when doing
     * linear fill since we need to keep a completely intact
     * event for the values.
     * While we are inspecting the data payload, make a note if
     * any of the paths are pointing at a list. Then it
     * will trigger that filling code later.
     */
    isValidLinearEvent(event: Event<T>): boolean;
    /**
     * This handles the linear filling. It returns a list of
     * zero or more `Event`'s to be emitted.
     *
     * If an `Event` is valid:
     *  * it has valid values for all of the field paths
     *  * it is cached as "last good" and returned to be emitted.
     * The return value is then a list of one `Event`.
     *
     * If an `Event` has invalid values, it is cached to be
     * processed later and an empty list is returned.
     *
     * Additional invalid `Event`'s will continue to be cached until
     * a new valid value is seen, then the cached events will
     * be filled and returned. That will be a list of indeterminate
     * length.
     */
    linearFill(event: Event<T>): Array<Event<T>>;
    /**
     * The fundamental linear interpolation workhorse code. Process
     * a list of `Event`'s and return a new list. Does a pass for
     * every `fieldSpec`.
     *
     * This is abstracted out like this because we probably want
     * to interpolate a list of `Event`'s not tied to a `Collection`.
     * A Pipeline result list, etc etc.
     *
     */
    interpolateEventList(events: Array<Event<T>>): Array<Event<T>>;
    /**
     * Perform the fill operation on the `Event` and return filled
     * in events
     */
    addEvent(event: Event<T>): Immutable.List<Event<T>>;
}
