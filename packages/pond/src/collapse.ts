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
import { TimeRange } from "./timerange";
import util from "./util";

import { CollapseOptions } from "./types";

/**
 * A processor which takes a fieldSpec and returns a new event
 * with a new column that is a collapsed result of the selected
 * columns. To collapse the columns it uses the supplied reducer
 * function. Optionally the new column can completely replace
 * the existing columns in the event.
 */
export class Collapse<T extends Key> extends Processor<T, T> {
    constructor(private options: CollapseOptions) {
        super();
    }
    addEvent(event: Event<T>): Immutable.List<Event<T>> {
        return Immutable.List([
            event.collapse(
                this.options.fieldSpecList,
                this.options.fieldName,
                this.options.reducer,
                this.options.append
            )
        ]);
    }
}
