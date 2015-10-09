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

export default class Aggregator {

    constructor(size, processor, observer) {
        this._generator = new Generator(size);
        this._processor = processor;
        this._bucket = null;
        this._observer = observer;
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */
    bucket(d) {
        const thisBucketIndex = this._generator.bucketIndex(d);
        const currentBucketIndex = this._bucket ?
            this._bucket.index().asString() : "";
        if (thisBucketIndex !== currentBucketIndex) {
            if (this._bucket) {
                this._bucket.aggregate(this._processor, event => {
                    if (this._observer) {
                        this._observer(this._bucket.index(), event);
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
            this._bucket.aggregate(this._processor, event => {
                if (this._observer) {
                    this._observer(this._bucket.index(), event);
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

        //
        // Adding the value to the bucket. This could be an async operation
        // so the passed in callback to this function will be called when this
        // is done.
        //

        bucket.addEvent(event, err => {
            if (err) {
                console.error("Could not add value to bucket:", err);
            }
            if (cb) {
                cb(err);
            }
        });
    }

    /**
     * Set the emit callback after the constructor
     */
    onEmit(cb) {
        this._observer = cb;
    }
}
