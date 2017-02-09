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
 * and uses that to either output a new event
 */
export default class Mapper extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Mapper) {
            const other = arg1;
            this._op = other._op;
        } else if (isPipeline(arg1)) {
            this._op = options.op;
        } else {
            throw new Error("Unknown arg to Mapper constructor", arg1);
        }
    }

    clone() {
        return new Mapper(this);
    }

    /**
     * Output an event that is remapped
     */
    addEvent(event) {
        if (this.hasObservers()) {
            this.emit(this._op(event));
        }
    }
}
