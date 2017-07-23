/*
 *  Copyright (c) 2017, The Regents of the University of California,
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

export abstract class Processor<T extends Key, S extends Key> {
    abstract addEvent(event: Event<T>, options?: any): Immutable.List<Event<S>>;
}
