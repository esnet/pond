/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";
import IndexedEvent from "./indexedevent";
import Processor from "./processor";
import TimeRangeEvent from "./timerangeevent";
import util from "./util";
import { isPipeline } from "./pipeline";

/**
 * Simple processor generate the Rate of two Event objects and
 * emit them as a TimeRangeEvent. Can be used alone or chained
 * with the Align processor for snmp rates, etc.
 */
export default class Derivator extends Processor {

    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Derivator) {
            const other = arg1;
            this._fieldSpec = other._fieldSpec;
        } else if (isPipeline(arg1)) {
            const {
                fieldSpec
            } = options;
            this._fieldSpec = fieldSpec;
        } else {
            throw new Error("Unknown arg to Derivator constructor", arg1);
        }

        //
        // Internal members
        //

        this._previous = null;

        // work out field specs
        if (_.isString(this._fieldSpec)) {
            this._fieldSpec = [this._fieldSpec];
        }
    }

    clone() {
        return new Derivator(this);
    }

    /**
     * Generate a new TimeRangeEvent containing the rate per second
     * between two events.
     */
    getRate(event) {
        let d = new Immutable.Map();

        const previousTime = this._previous.timestamp().getTime();
        const currentTime = event.timestamp().getTime();
        const deltaTime = (currentTime - previousTime) / 1000;

        this._fieldSpec.forEach(path => {
            const fieldPath = util.fieldPathToArray(path);
            const ratePath = fieldPath.slice();
            ratePath[ratePath.length - 1] += "_rate";

            const previousVal = this._previous.get(fieldPath);
            const currentVal = event.get(fieldPath);

            let rate = null;
            if (!_.isNumber(previousVal) || !_.isNumber(currentVal)) {
                console.warn(`Path ${fieldPath} contains a non-numeric value or does not exist`);
            } else {
                rate = (currentVal - previousVal) / deltaTime;
            }
            d = d.setIn(ratePath, rate);
        });

        return new TimeRangeEvent([previousTime, currentTime], d);
    }

    /**
     * Perform the fill operation on the event and emit.
     */
    addEvent(event) {
        if (event instanceof TimeRangeEvent ||
            event instanceof IndexedEvent) {
            throw new Error("TimeRangeEvent and IndexedEvent series can not be aligned.");
        }

        if (this.hasObservers()) {
            if (!this._previous) {
                this._previous = event;
                return;
            }

            const outputEvent = this.getRate(event);
            this.emit(outputEvent);

            // The current event now becomes the previous event
            this._previous = event;

        }
    }
}
