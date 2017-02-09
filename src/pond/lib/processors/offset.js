/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";

import Processor from "./processor";

import Event from "../event";
import { isPipeline } from "../pipeline";

/**
 * A simple processor used by the testing code to verify Pipeline behavior
 */
export default class Offset extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Offset) {
            const other = arg1;
            this._by = other._by;
            this._fieldSpec = other._fieldSpec;
        } else if (isPipeline(arg1)) {
            this._by = options.by || 1;
            this._fieldSpec = options.fieldSpec;
        } else {
            throw new Error("Unknown arg to Offset constructor", arg1);
        }
    }

    clone() {
        return new Offset(this);
    }

    /**
     * Output an event that is offset
     */
    addEvent(event) {
        if (this.hasObservers()) {
            const selected = Event.selector(event, this._fieldSpec);
            const data = {};
            _.each(selected.data().toJSON(), (value, key) => {
                const offsetValue = value + this._by;
                data[key] = offsetValue;
            });
            const outputEvent = event.setData(data);

            this.emit(outputEvent);
        }
    }
}
