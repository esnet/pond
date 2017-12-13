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
import * as _ from "lodash";

import { Event } from "./event";
import { Index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Processor } from "./processor";
import { time, Time } from "./time";
import { TimeRange, timerange } from "./timerange";
import util from "./util";

import { ListReducer, ReduceOptions, ReducerFunction } from "./types";

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
export class Reducer<T extends Key> extends Processor<T, T> {
    // Internal state
    private _count: number;
    private _accumulator: Event<T>;
    private _iteratee: ListReducer<T>;
    private _previous: Immutable.List<Event<T>>;

    constructor(options: ReduceOptions<T>) {
        super();
        const { count = 1, iteratee, accumulator } = options;
        this._count = count;
        this._iteratee = iteratee;
        this._previous = Immutable.List<Event<T>>();
        this._accumulator = accumulator ? accumulator : null;
    }

    /**
     * Perform the reduce operation on the `Event` and emit.
     */
    addEvent(event: Event<T>): Immutable.List<Event<T>> {
        this._previous = this._previous.push(event);
        if (this._previous.size > this._count) {
            this._previous = this._previous.shift();
        }
        this._accumulator = this._iteratee(this._accumulator, this._previous);
        return Immutable.List([this._accumulator]);
    }
}
