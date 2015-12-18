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
 * A collector takes the following options:
 *
 *     - 'window'        - size of the window to collect over (e.g. "1d")
 *     - 'convertToTimes'- to transform IndexedEvents to Events during collection
 *     - 'emit'         - (optional) Rate to emit events. Either:
 *                             "always" - emit an event on every change
 *                             "next" - just when we advance to the next bucket
 *
 * TODO: It might make more sense to make an event transformer for
 *       converting between a stream of IndexedEvents to Events...
 */
export default class Collector {

    constructor(options, observer) {
        if (!_.has(options, "window")) {
            throw new Error("Collector: constructor needs 'window' in options");
        }
        this._emitFrequency = options.emit || "next";
        if (["always", "next"].indexOf(this._emitFrequency) === -1) {
            throw new Error("Collector: emitFrequency options should be 'always' or 'next'");
        }
        this._convertToTimes = options.convertToTimes || false;
        this._generator = new Generator(options.window);
        this._buckets = {};
        this._observer = observer;
    }

    /**
     * Forces the current bucket to emit
     */
    flush() {
        _.each(this._buckets, (bucket, key) => {
            this._buckets[key].collect(series => {
                if (this._observer) {
                    this._observer(series);
                }
            }, this._convertToTimes);
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
                currentBucket.collect(series => {
                    if (this._observer) {
                        this._observer(series);
                    }
                }, this._convertToTimes);
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
                bucket.collect(series => {
                    if (this._observer) {
                        this._observer(series);
                    }
                }, this._convertToTimes);
            }
        }
    }

    onEmit(cb) {
        this._observer = cb;
    }
}
