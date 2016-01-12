/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Generator from "./generator";

/**
 * An aggregator takes the following options:
 *
 *     - 'window'    -     size of the window to aggregate over (e.g. "5m")
 *     - 'operator'  -     function (e.g. avg)
  *    - 'fieldSpec' -     (optional) describes what part of the events to
 *                         include in the aggregation. May be a string, list
 *                         of strings for each event column, or a function.
 *                         If a function it should return a list of key/values
 *                         in an object.
 *     - 'emit'      - (optional) Rate to emit events. Either:
 *                         "always" - emit an event on every change
 *                         "next" - just when we advance to the next bucket
 */
export default class Aggregator {

    constructor(options, observer) {
        if (!options) {
            throw new Error("Aggregator: no options supplied");
        }
        if (!_.has(options, "window")) {
            throw new Error("Aggregator: constructor needs 'window' in options");
        }
        if (!_.has(options, "operator")) {
            throw new Error("Aggregator: constructor needs 'operator' function in options");
        }
        this._generator = new Generator(options.window);
        this._operator = options.operator;
        this._fieldSpec = options.fieldSpec;
        this._emitFrequency = options.emit || "next";
        if (["always", "next"].indexOf(this._emitFrequency) === -1) {
            throw new Error("Aggregator: emitFrequency options should be 'always' or 'next'");
        }
        this._buckets = {};
        this._observer = observer;
    }

    /**
     * Forces the current bucket to emit
     */
    flush() {
        _.each(this._buckets, (bucket, key) => {
            this._buckets[key].aggregate(this._operator, this._fieldSpec, event => {
                if (this._observer) {
                    this._observer(event);
                }
            });
        });
        this._buckets = {};
    }

    /**
     * Add an event, which will be assigned to a bucket
     */
    addEvent(event, cb) {
        const key = event.key() === "" ? "_default_" : event.key();
        const timestamp = event.timestamp();
        const index = this._generator.bucketIndex(timestamp);
        const currentBucket = this._buckets[key];
        const currentBucketIndex = currentBucket ? currentBucket.index().asString() : "";

        // See if we need a new bucket
        if (index !== currentBucketIndex) {
            // Emit the old bucket if we are emitting on 'next'
            if (currentBucket && this._emitFrequency === "next") {
                currentBucket.aggregate(this._operator, this._fieldSpec, event => {
                    if (this._observer) {
                        this._observer(event);
                    }
                });
            }
            // And now make the new bucket to add our event to
            this._buckets[key] = this._generator.bucket(timestamp, key);
        }

        // Add our event to the current/new bucket
        const bucket = this._buckets[key];
        bucket.addEvent(event, err => {
            if (cb) {
                cb(err);
            }
        });

        // Finally, emit the current/new bucket with the new event in it, if
        // we have been asked to always emit
        if (this._emitFrequency === "always") {
            if (bucket) {
                bucket.aggregate(this._operator, this._fieldSpec, event => {
                    if (this._observer) {
                        this._observer(event);
                    }
                });
            }
        }
    }

    /**
     * Set the emit callback after the constructor
     */
    onEmit(cb) {
        this._observer = cb;
    }
}
