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
import { ReduceOptions } from "./types";
/**
 * A `Processor` to take a rolling set of incoming `Event`s, a
 * Immutable.List<Event>, and reduce them down to a single output `Event`.
 * This enables different types of past dependent functions.
 *
 * To control the rate calculation you need to specify a `ReduceOptions` object
 * in the constuctor, which takes the following form:
 * ```
 * {
 *     count: number;
 *     accumulator: Event
 *     iteratee: ListReducer;
 * }
 * ```
 * Options:
 *  * `count` - The number of `Event`s to include on each call. The last `count`
 *              `Event`s are passed to the `reducer` function.
 *  * `accumulator` - optional initial value
 *  * `iteratee` - a function mapping an `Immutable.List<Event>` to an `Event`
 */
export declare class Reducer<T extends Key> extends Processor<T, T> {
    private _count;
    private _accumulator;
    private _iteratee;
    private _previous;
    constructor(options: ReduceOptions<T>);
    /**
     * Perform the reduce operation on the `Event` and emit.
     */
    addEvent(event: Event<T>): Immutable.List<Event<T>>;
}
