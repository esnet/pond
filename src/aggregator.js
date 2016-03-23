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
import Collection from "./collection";
import { IndexedEvent } from "./event";
import Index from "./index";

/**
 * An Aggregator works over one of 3 types of windows:
 *     - fixed        - A window which is a fixed, represented by a
 *                      duration string such as 5m. Windows are fixed in time.
 *                      If events move on from that window, they move into
 *                      a new window.
 *     - sliding      - A window which can hold a fixed number of events. The most
 *                      recent event will be included in the window, along with
 *                      the n events before it.
 *     - sliding-time - A window which is always a fixed with but moves with events.
 *                      The most recent event will be in the window, along with the
 *                      events before it within a fixed time.
 *
 * Events:
 *
 * An incoming sequence of events will be added to the aggregator. Each
 * event will have a time and data. It will also have a groupByKey that
 * may have been set upstream.
 *
 * Fixed windows:
 *
 * To key by a fixed window is simple. Each can be given a key of
 * ${groupByKey}:${index}  Such as interface1:1h-1234 and all events of
 * that key can be placed in the same collection. This window knows to:
 *   a) Aggregate and emit when triggered
 *
 * Sliding windows:
 *
 * To key a moving window, we key just by the ${groupByKey} and place
 * all events in that window. This window knows to:
 *   a) Remove old events that do not fit in the window anymore
 *   b) Aggregate and emit when triggered
 *
 * Triggering:
 *
 * The Collection is given a Trigger strategy when it is created. When
 * the Collection has each event added to it, the trigger determines if the
 * Collection should emit.
 */

export default class Aggregator extends Processor {

    constructor(pipeline, options, observer) {
        super(pipeline, options, observer);

        // Aggregation operators
        const availableOperators =
            ["sum", "avg", "max", "min", "count", "first", "last"];
        if (!_.has(options, "fields")) {
            throw new Error("Aggregator: constructor needs an aggregator field mapping");
        }

        // Check each of the aggregator -> field mappings
        _.forEach(options.fields, (field, operator) => {
            // Check that each operator is in our white list. We should probably
            // allow custom functions here, but this will work for now
            if (availableOperators.indexOf(operator) === -1) {
                throw new Error("Aggregator: unknown aggregation operator: " + operator);
            }

            // Field should either be an array or a string
            if (!_.isString(field) && !_.isArray(field)) {
                throw new Error("Aggregator: field of unknown type: " + field);
            }
        });
        this._fields = options.fields;

        // Pipeline state
        this._groupBy = pipeline.getGroupBy();
        this._windowType = pipeline.getWindowType();
        this._windowDuration = pipeline.getWindowDuration();
        this._emitOn = pipeline.getEmitOn();

        // Maintained collections
        this._collections = {};
    }

    emitCollections(collections) {
        _.each(collections, c => {
            const { collection, windowKey } = c;
            const d = {};
            _.each(this._fields, (fields, operator) => {
                const fieldList = _.isString(fields) ? [fields] : fields;
                _.each(fieldList, fieldSpec => {
                    const op = collection[operator];
                    const fieldValue = op.call(collection, fieldSpec);
                    const fieldName = fieldSpec.split(".").pop();
                    d[fieldName] = fieldValue;
                });
            });

            const event = new IndexedEvent(windowKey, d);
            this.emit(event);
        });
    }

    flush() {
        this.emitCollections(this._collections);
        super.flush();
    }

    addEvent(event) {
        if (this.hasObservers()) {
            const timestamp = event.timestamp();

            //
            // We manage our collections here. Each collection is a
            // time window collection.
            //
            // In the case of a fixed window new collections are created
            // as we go. In the case of a moving window, the same bucket
            // is used, but based on the user specification, events are
            // discarded as new events arrive to advance the bucket along.
            //
            // Collections are stored in a dictionary, where the key is a
            // join of the event key and a window identifier. The combination
            // of the groupbyKey and the windowKey determines which collection
            // an incoming event should be placed in.
            //
            // For a sliding window, the windowKey is simply "sliding", but
            // for fixed buckets the key identifies a particular time window
            // using an Index string.
            //

            const windowType = this._windowType;

            let windowKey;
            if (windowType === "fixed") {
                windowKey = Index.getIndexString(this._windowDuration, timestamp);
            } else {
                windowKey = windowType;
            }
            
            const groupbyKey = this._groupBy(event);
            const collectionKey = groupbyKey ?
                `${windowKey}::${groupbyKey}` : windowKey;

            let discard = false;
            if (!_.has(this._collections, collectionKey)) {
                this._collections[collectionKey] = {
                    windowKey,
                    groupbyKey,
                    collection: new Collection()
                };
                discard = true;
            }
            this._collections[collectionKey].collection =
                this._collections[collectionKey].collection.addEvent(event);
            
            //
            // If fixed windows, collect together old collections that
            // will be discarded
            //
            
            const discards = {};
            if (discard && windowType === "fixed") {
                _.each(this._collections, (c, k) => {
                    if (windowKey !== c.windowKey) {
                        discards[k] = c;
                    }
                });
            }

            //
            // Emit
            //

            const emitOn = this._emitOn;
            if (emitOn === "eachEvent") {
                this.emitCollections(this._collections);
            } else if (emitOn === "discard") {
                this.emitCollections(discards);
                _.each(Object.keys(discards), k => {
                    delete this._collections[k];
                });
            }
        }
    }
}
