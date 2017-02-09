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

import Index from "../index";
import { isPipeline } from "../pipeline";

/**
 * A processor which takes an operator as its only option
 * and uses that to either output the event or skip the
 * event
 */
export default class Taker extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Taker) {
            const other = arg1;
            this._limit = other._limit;
            this._windowType = other._windowType;
            this._windowDuration = other._windowDuration;
            this._groupBy = other._groupBy;
        } else if (isPipeline(arg1)) {
            const pipeline = arg1;
            this._limit = options.limit;
            this._windowType = pipeline.getWindowType();
            this._windowDuration = pipeline.getWindowDuration();
            this._groupBy = pipeline.getGroupBy();
        } else {
            throw new Error("Unknown arg to Taker constructor", arg1);
        }

        this._count = {};
    }

    clone() {
        return new Taker(this);
    }

    flush() {
        super.flush();
    }

    /**
     * Output an event that is offset
     */
    addEvent(event) {
        if (this.hasObservers()) {
            const timestamp = event.timestamp();

            const windowType = this._windowType;
            let windowKey;
            if (windowType === "fixed") {
                windowKey = Index.getIndexString(
                    this._windowDuration,
                    timestamp
                );
            } else {
                windowKey = windowType;
            }
            const groupByKey = this._groupBy(event);
            const collectionKey = groupByKey
                ? `${windowKey}::${groupByKey}`
                : windowKey;

            if (!_.has(this._count, collectionKey)) {
                this._count[collectionKey] = 0;
            }

            if (this._count[collectionKey] < this._limit) {
                this.emit(event);
            }

            this._count[collectionKey]++;
        }
    }
}
