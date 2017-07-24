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
import { SelectOptions } from "./types";
/**
 * A `Processor` which takes a `fieldSpec` and returns a new `Event`
 * with only those selected columns.
 */
export declare class Select<T extends Key> extends Processor<T, T> {
    private options;
    constructor(options: SelectOptions);
    addEvent(event: Event<T>): Immutable.List<Event<T>>;
}
