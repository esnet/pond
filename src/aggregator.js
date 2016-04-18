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

import Processor from "./processor";
import Collector from "./collector";
import { IndexedEvent } from "./event";

/**
 * An Aggregator takes incoming events and adds them to a Collector
 * with given windowing and grouping parameters. As each Collection is
 * emitted from the Collector it is aggregated into a new event
 * and emitted from this Processor.
 */

export default class Aggregator extends Processor {

    constructor(pipeline, options, observer) {

        super(pipeline, options, observer);

        if (!_.has(options, "fields")) {
            throw new Error("Aggregator: constructor needs an aggregator field mapping");
        }

        // Check each of the aggregator -> field mappings
        _.forEach(options.fields, (operator, field) => {
            // Field should either be an array or a string
            if (!_.isString(field) && !_.isArray(field)) {
                throw new Error("Aggregator: field of unknown type: " + field);
            }
        });

        if (!pipeline.getWindowType() || !pipeline.getWindowDuration()) {
            throw new Error("Unable to aggregate because no windowing strategy was specified in pipeline");
        }

        this._fields = options.fields;
        this._collector = new Collector({
            windowType: pipeline.getWindowType(),
            windowDuration: pipeline.getWindowDuration(),
            groupBy: pipeline.getGroupBy(),
            emitOn: pipeline.getEmitOn()
        }, (collection, windowKey) => this.handleTrigger(collection, windowKey));
    }

    handleTrigger(collection, windowKey) {
        const d = {};
        _.each(this._fields, (operator, fields) => {
            const fieldList = _.isString(fields) ? [fields] : fields;
            _.each(fieldList, fieldSpec => {
                const fieldValue = collection.aggregate(operator, fieldSpec);
                const fieldName = fieldSpec.split(".").pop();
                d[fieldName] = fieldValue;
            });
        });

        const event = new IndexedEvent(windowKey, d);
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
