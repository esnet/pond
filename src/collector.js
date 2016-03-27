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

import Collection from "./collection";
import Index from "./index";

/**
 * A sink for processing chains. Outputs a Collection of events
 * each based on the emit on trigger spec. Currently this means it
 * will either output everytime and event comes in, or just when
 * Collections are done with and are about to be discarded.
 */
export class FixedWindowCollector {

    constructor(pipeline, observer) {

        this._observer = observer;

        // Pipeline state
        this._groupBy = pipeline.getGroupBy();
        this._windowType = "fixed";
        this._windowDuration = pipeline.getWindowDuration();
        this._emitOn = pipeline.getEmitOn();

        this._collections = {};
    }

    emitCollections(collections) {
        if (this._observer) {
            _.each(collections, (c, k) => {
                this._observer(c, k);
            });
        }
    }

    done() {
        this.emitCollections(this._collections);
    }

    collections() {
        return this._collections;
    }

    addEvent(event) {
        const timestamp = event.timestamp();

        //
        // We manage our collections here. Each collection is a
        // fixed time window collection. New collections are created
        // as we go along.
        //
        // Collections are stored in a dictionary, where the key is a
        // join of the event key and a window identifier. The combination
        // of the eventKey and the windowKey determines which collection
        // an incoming event should be placed in.
        //
        
        // Out keys will either be:
        //   - global
        //   - 1d-1234
        //   - 1d-1234:groupKey
        //

        const windowType = this._windowType;

        let windowKey;

        if (windowType === "fixed") {
            windowKey = Index.getIndexString(this._windowDuration, timestamp);
        } else {
            windowKey = windowType;
        }
        
        const eventKey = this._groupBy(event);
        const collectionKey = eventKey ?
            `${windowKey}::${eventKey}` : windowKey;

        let discard = false;
        if (!_.has(this._collections, collectionKey)) {
            this._collections[collectionKey] = new Collection();
            discard = true;
        }

        this._collections[collectionKey] =
            this._collections[collectionKey].addEvent(event);
        
        //
        // If fixed windows, collect together old collections that
        // will be discarded
        //
        
        const discards = {};
        if (discard) {
            _.each(this._collections, (c, k) => {
                const wk = collectionKey.split("::")[0];
                if (wk !== k) {
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
        }

        _.each(_.keys(discards), k => {
            delete this._collections[k];
        });
    }
}

/**
 * A sink for processing chains. Maintains a single global collection.
 * This is used for quick and dirty collections.
 *
 * The collection will catch all events, regardless
 * of upstream groupBy or windowing in the pipeline.
 *
 * If you want that, use the fixed window collector.
 */
export class Collector {

    constructor(pipeline, options, observer) {
        this._observer = observer;
        this._collection = new Collection();
    }

    emitCollection() {
        this._observer && this._observer(this._collection);
    }

    done() {
        this.emitCollection();
    }

    collection() {
        return this._collection;
    }

    addEvent(event) {
        this._collection = this._collection.addEvent(event);
        this.emitCollection();
    }
}
