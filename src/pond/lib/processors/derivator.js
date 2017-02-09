/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/*eslint no-console: 0 */

import _ from "underscore";
import Immutable from "immutable";

import Processor from "./processor";

import IndexedEvent from "../indexedevent";
import TimeRangeEvent from "../timerangeevent";
import { isPipeline } from "../pipeline";

import util from "../base/util";

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
            this._allowNegative = other._allowNegative;
        } else if (isPipeline(arg1)) {
            const { fieldSpec, allowNegative } = options;
            this._fieldSpec = fieldSpec;
            this._allowNegative = allowNegative;
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
        } else if (!this._fieldSpec) {
            this._fieldSpec = ["value"];
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
                console.warn(
                    `Path ${fieldPath} contains a non-numeric value or does not exist`
                );
            } else {
                rate = (currentVal - previousVal) / deltaTime;
            }

            if (this._allowNegative === false && rate < 0) {
                // don't allow negative differentials in certain cases
                d = d.setIn(ratePath, null);
            } else {
                d = d.setIn(ratePath, rate);
            }
        });

        return new TimeRangeEvent([previousTime, currentTime], d);
    }

    /**
     * Perform the fill operation on the event and emit.
     */
    addEvent(event) {
        if (event instanceof TimeRangeEvent || event instanceof IndexedEvent) {
            throw new Error(
                "TimeRangeEvent and IndexedEvent series can not be aligned."
            );
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
