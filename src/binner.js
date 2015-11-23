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
import TimeRange from "./range";
import { Event } from "./event";

/**
 * Bins a stream of events to a new stream of events with a fixed
 * frequency.
 */
export default class Binner {

    constructor(size, processor, observer) {
        this._generator = new Generator(size);
        this._processor = processor;
        this._bucket = null;
        this._observer = observer;
        this._activeBucketList = {};
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */
    incrementActiveBucketList(timestamp) {
        let bucketList = [];
        if (!this._lastTime) {
            bucketList = [];
        } else {
            bucketList = this._generator.bucketList(this._lastTime, timestamp);
        }
        _.each(bucketList, (b) => {
            if (!_.has(this._activeBucketList, b.index().asString())) {
                this._activeBucketList[b.index().asString()] = b;
            }
        });
        return bucketList;
    }

    /**
     *   |-range -----------|
     *         |-bucket------------|
     *         |            x      |  - v2
     *         |                   |
     *         o                   |  - va
     *   x     |                   |  - v1
     *         |-intersect--|      |
     */
    getEdgeValues(range, v1, v2, intersection) {
        const tr = range.duration();
        const ta = intersection.begin().getTime();
        const tb = intersection.end().getTime();
        const t1 = range.begin().getTime();
        return {va: v1 + (ta - t1) / tr * (v2 - v1),
                vb: v1 + (tb - t1) / tr * (v2 - v1)};
    }

    /**
     * Add an event, which will be assigned to a bucket.
     * TODO: If we make the cache more general we should pass
     * in a callback here.
     */
    addEvent(event) {
        const time = event.timestamp();
        const value = event.get();

        this.incrementActiveBucketList(time);

        // Process the active bundle list
        _.each(this._activeBucketList, (bucket) => {
            const bucketTimeRange = bucket.index().asTimerange();
            const pointsTimeRange = new TimeRange(this._lastTime, time);
            const intersection = pointsTimeRange.intersection(bucketTimeRange);
            if (intersection && intersection.begin().getTime() ===
                bucketTimeRange.begin().getTime()) {
                const {va, vb} = this.getEdgeValues(pointsTimeRange,
                                                    this._lastValue,
                                                    value,
                                                    intersection);
                bucket.addEvent(new Event(bucketTimeRange.begin(), va));
                bucket.addEvent(new Event(bucketTimeRange.end(), vb));
            }
        });

        // Flush buckets
        const deleteList = [];
        _.each(this._activeBucketList, (bucket, key) => {
            if (bucket.end() < time) {
                bucket.aggregate(this._processor, e => {
                    if (!_.isUndefined(e) && this._observer) {
                        this._observer(e);
                    }
                    deleteList.push(key);
                });
            }
        });
        _.each(deleteList, key => delete this._activeBucketList[key]);

        this._lastTime = time;
        this._lastValue = value;
    }

    /**
     * Forces the current buckets to emit
     */
    flush() {
        _.each(this._activeBucketList, bucket => {
            bucket.aggregate(this._processor, event => {
                if (event) {
                    if (this._observer) {
                        this._observer(event);
                    }
                }
            });
        });
        this._activeBucketList = {};
    }

    /**
     * Set the emit callback after the constructor
     */
    onEmit(cb) {
        this._observer = cb;
    }
}
