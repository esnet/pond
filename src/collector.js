/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import Generator from "./generator";

export default class Collector {

    constructor(size, observer) {
        this._generator = new Generator(size);
        this._bucket = null;

        // Callback
        this._observer = observer;
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */
    bucket(d) {
        const newBucketIndex = this._generator.bucketIndex(d);
        const bucketIndex = this._bucket ? this._bucket.index().asString() : "";
        if (newBucketIndex !== bucketIndex) {
            if (this._bucket) {
                this._bucket.collect(series => {
                    if (this._observer) {
                        this._observer(series);
                    }
                });
            }
            this._bucket = this._generator.bucket(d);
        }
        return this._bucket;
    }

    /**
     * Forces the current bucket to emit
     */
    done() {
        if (this._bucket) {
            this._bucket.collect(series => {
                if (this._observer) {
                    this._observer(series);
                }
                this._bucket = null;
            });
        }
    }

    /**
     * Add an event, which will be assigned to a bucket
     */
    addEvent(event, cb) {
        const t = event.timestamp();
        const bucket = this.bucket(t);
        bucket.addEvent(event, err => {
            if (err) {
                console.error("Could not add value to bucket:", err);
            }
            if (cb) {
                cb(err);
            }
        });
    }

    onEmit(cb) {
        this._observer = cb;
    }
}
