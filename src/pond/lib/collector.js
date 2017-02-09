/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
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
 * A Collector is used to accumulate events into multiple collections,
 * based on potentially many strategies. In this current implementation
 * a collection is partitioned based on the window that it falls in
 * and the group it is part of.
 *
 * Collections are emitted from this class to the supplied onTrigger
 * callback.
 */
export default class Collector {
    constructor(options, onTrigger) {
        const { windowType, windowDuration, groupBy, emitOn } = options;

        this._groupBy = groupBy;
        this._emitOn = emitOn;
        this._windowType = windowType;
        this._windowDuration = windowDuration;

        // Callback for trigger
        this._onTrigger = onTrigger;

        // Maintained collections
        this._collections = {};
    }

    flushCollections() {
        this.emitCollections(this._collections);
    }

    emitCollections(collections) {
        if (this._onTrigger) {
            _.each(collections, c => {
                const { collection, windowKey, groupByKey } = c;
                this._onTrigger &&
                    this._onTrigger(collection, windowKey, groupByKey);
            });
        }
    }

    addEvent(event) {
        const timestamp = event.timestamp();

        //
        // Window key
        //
        const windowType = this._windowType;
        let windowKey;
        if (windowType === "fixed") {
            windowKey = Index.getIndexString(this._windowDuration, timestamp);
        } else if (windowType === "daily") {
            windowKey = Index.getDailyIndexString(timestamp);
        } else if (windowType === "monthly") {
            windowKey = Index.getMonthlyIndexString(timestamp);
        } else if (windowType === "yearly") {
            windowKey = Index.getYearlyIndexString(timestamp);
        } else {
            windowKey = windowType;
        }

        //
        // Groupby key
        //
        const groupByKey = this._groupBy(event);

        //
        // Collection key
        //
        const collectionKey = groupByKey
            ? `${windowKey}::${groupByKey}`
            : windowKey;

        let discard = false;
        if (!_.has(this._collections, collectionKey)) {
            this._collections[collectionKey] = {
                windowKey,
                groupByKey,
                collection: new Collection()
            };
            discard = true;
        }
        this._collections[collectionKey].collection = this._collections[
            collectionKey
        ].collection.addEvent(event);

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
        } else if (emitOn === "flush") {
            // pass
        } else {
            throw new Error("Unknown emit type supplied to Collector");
        }
    }
}
