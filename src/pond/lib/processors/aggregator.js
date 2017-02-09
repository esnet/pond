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
import Collector from "../collector";
import IndexedEvent from "../indexedevent";
import TimeRangeEvent from "../timerangeevent";
import { isPipeline } from "../pipeline";

/**
 * An Aggregator takes incoming events and adds them to a Collector
 * with given windowing and grouping parameters. As each Collection is
 * emitted from the Collector it is aggregated into a new event
 * and emitted from this Processor.
 */
class Aggregator extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Aggregator) {
            const other = arg1;

            this._fields = other._fields;
            this._windowType = other._windowType;
            this._windowDuration = other._windowDuration;
            this._groupBy = other._groupBy;
            this._emitOn = other._emitOn;
        } else if (isPipeline(arg1)) {
            const pipeline = arg1;

            this._windowType = pipeline.getWindowType();
            this._windowDuration = pipeline.getWindowDuration();
            this._groupBy = pipeline.getGroupBy();
            this._emitOn = pipeline.getEmitOn();

            if (!_.has(options, "fields")) {
                throw new Error(
                    "Aggregator: constructor needs an aggregator field mapping"
                );
            }

            // Check each of the aggregator -> field mappings
            _.forEach(options.fields, (operator, field) => {
                // Field should either be an array or a string
                if (!_.isString(field) && !_.isArray(field)) {
                    throw new Error(
                        "Aggregator: field of unknown type: " + field
                    );
                }
            });

            if (pipeline.mode() === "stream") {
                if (
                    !pipeline.getWindowType() || !pipeline.getWindowDuration()
                ) {
                    throw new Error(
                        "Unable to aggregate because no windowing strategy was specified in pipeline"
                    );
                }
            }
            this._fields = options.fields;
        } else {
            throw new Error("Unknown arg to Filter constructor", arg1);
        }

        this._collector = new Collector(
            {
                windowType: this._windowType,
                windowDuration: this._windowDuration,
                groupBy: this._groupBy,
                emitOn: this._emitOn
            },
            (collection, windowKey, groupByKey) =>
                this.handleTrigger(collection, windowKey, groupByKey)
        );
    }

    clone() {
        return new Aggregator(this);
    }

    handleTrigger(collection, windowKey) {
        const d = {};
        _.each(this._fields, (f, fieldName) => {
            const keys = Object.keys(f);
            if (keys.length !== 1) {
                throw new Error("Fields should contain exactly one field", f);
            }
            const field = keys[0];
            const operator = f[field];

            d[fieldName] = collection.aggregate(operator, field);
        });

        let event;
        if (windowKey === "global") {
            event = new TimeRangeEvent(collection.range(), d);
        } else {
            //TODO: Specify UTC (or local) pipeline
            const utc = this._windowType === "fixed";
            event = new IndexedEvent(windowKey, d, utc);
        }

        this.emit(event);
    }

    flush() {
        this._collector.flushCollections();
        super.flush();
    }

    addEvent(event) {
        if (this.hasObservers()) {
            this._collector.addEvent(event);
        }
    }
}

export default Aggregator;
