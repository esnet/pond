/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import Processor from "./processor";
import { isPipeline } from "../pipeline";

/**
 * A processor which takes an operator as its only option
 * and uses that to either output the event or skip the
 * event
 */
export default class Filter extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Filter) {
            const other = arg1;
            this._op = other._op;
        } else if (isPipeline(arg1)) {
            this._op = options.op;
        } else {
            throw new Error("Unknown arg to Filter constructor", arg1);
        }
    }

    clone() {
        return new Filter(this);
    }

    /**
     * Output an event that is offset
     */
    addEvent(event) {
        if (this.hasObservers()) {
            if (this._op(event)) {
                this.emit(event);
            }
        }
    }
}
