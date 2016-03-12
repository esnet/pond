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
import Immutable from "immutable";

import { Event, IndexedEvent, TimeRangeEvent } from "./event";
import TimeSeries from "./series";
import TimeRange from "./range";
import Util from "./util";
import Index from "./index";

class MemoryCacheStrategy {
    constructor() {
        this._cache = {};
    }

    init() {
        // nothing for memory cache
    }

    addEvent(name, event, cb) {
        if (!_.has(this._cache, name)) {
            this._cache[name] = Immutable.List();
        }
        this._cache[name] = this._cache[name].push(event);
        cb(null);
    }

    /**
     * Removes the first event in the list
     */
    removeFirstEvent(name) {
        if (_.has(this._cache, name)) {
            this._cache[name] = this._cache[name].shift();
        }
    }

    /**
     * Removes all the events before the given timestamp
     */
    removeOldEvents(name, timestamp) {
        if (_.has(this._cache, name)) {
            this._cache[name] = this._cache[name]
                .filterNot(event => {
                    return event.timestamp().getTime() < timestamp.getTime();
                });
        }
    }

    getEvents(name, cb) {
        if (_.has(this._cache, name)) {
            cb(null, this._cache[name].toJS());
        } else {
            cb("Unknown cache key", null);
        }
    }

    shutdown() {
        // nothing for memory cache
    }
}

function derivative(timerange) {
    return function fn(values) {
        return values.length ?
            (values[values.length - 1] - values[0]) /
            (timerange.duration() / 1000) : undefined;
    };
}

/**
 * A bucket is a mutable collection of values that is used to
 * accumulate aggregations over the index. The index may be an
 * Index instance or a string.
 *
 * The left side of the index is the range indicator, which is
 * itself a combination of a letter and a number:
 *     - the letter is the unit, either s (seconds), d (days),
 *       h (hours), or d (days).
 *     - the size is the quantity of that unit.
 * So 6h is six hours, 7d is seven days.
 *
 * The right side of the index is a number, which is n number of
 * that range since Jan 1, 1970 UTC.
 *
 * And example of an index might be 1d-1673. This uniquely
 * refers to a block of time 1 day long, starting 1673 days after
 * the beginning of 1970.
 */
export class Bucket {

    constructor(key, strategy) {
        // Caching strategy
        if (!strategy) {
            this._cacheStrategy = new MemoryCacheStrategy();
            this._cacheStrategy.init();
        } else {
            this._cacheStrategy = strategy;
        }

        // Event key
        if (_.isString(key)) {
            this._key = key;
        } else {
            this._key = null;
        }
    }

    name() {
        return "bucket";
    }

    key() {
        return this._key;
    }

    //
    // Bucket cache, which could potentially be redis or something
    // so pushing to the cache takes a callback, which will be called
    // when the event is added to the cache.
    //

    _pushToCache(event, cb) {
        this._cacheStrategy.addEvent(this.name(), event, (err) => {
            if (cb) {
                cb(err);
            }
        });
    }

    _readFromCache(cb) {
        this._cacheStrategy.getEvents(this.name(), (err, events) => {
            if (cb) {
                cb(err, events);
            }
        });
    }

    //
    // Add values to the bucket
    //

    addEvent(event, cb) {
        this._pushToCache(event, (err) => {
            if (cb) {
                cb(err);
            }
        });
    }

    getEvents(cb) {
        this._readFromCache(cb);
    }

    //
    // Reduce the bucket to something else, like a number, or a Timeseries...
    //

    /**
     * Takes the values within the bucket and aggregates them together
     * into a new IndexedEvent using the operator supplied.
     * The result or error is passed to the callback.
     */
    aggregate(operator, fieldSpec, cb) {
        this._readFromCache((err, events) => {
            if (!err) {
                if (events.length) {
                    const data = Event.mapReduce(events, fieldSpec, operator);
                    const key = this._key === "_default_" ? undefined : this._key;
                    const event = new IndexedEvent(this._index, data, null, key);
                    if (cb) {
                        cb(event);
                    }
                } else if (cb) {
                    cb();
                }
            } else if (cb) {
                cb();
            }
        });
    }

    /**
     * Takes the values within the bucket and aggregates them together
     * using a derivative function.
     */
    derivative(fieldSpec, cb) {
        const fn = derivative(this._index.asTimerange());
        this.aggregate(fn, fieldSpec, cb);
    }

    /**
     * Takes the values within the bucket and collects them together
     * into a new TimeSeries.
     *
     * The result or error is passed to the callback.
     */
    collect(cb) {
        this._readFromCache((err, events) => {
            if (!err) {
                const series = new TimeSeries({
                    name: this._index.toString(),
                    meta: {},
                    index: this._index,
                    events
                });
                if (cb) {
                    cb(series);
                }
            } else if (cb) {
                cb();
            }
        });
    }
}

/**
 * An indexed bucket represents a fixed range of time, defined by the
 * index supplied to the constructor. The index may be of string form
 * or an actual Index.
 */
export class IndexedBucket extends Bucket {

    constructor(index, key, strategy) {
        super(key, strategy);

        // Index
        if (_.isString(index)) {
            this._index = new Index(index);
        } else if (index instanceof Index) {
            this._index = index;
        }
    }

    name() {
        return this._index.asString();
    }

    //
    // Access the index in different ways
    //

    index() {
        return this._index;
    }

    timerange() {
        return this._index.asTimerange();
    }

    toUTCString() {
        return `${this._index.asString()}: ${this.range().toUTCString()}`;
    }

    toLocalString() {
        return `${this._index.asString()}: ${this.range().toLocalString()}`;
    }

    range() {
        return this._index.asTimerange();
    }

    begin() {
        return this.range().begin();
    }

    end() {
        return this.range().end();
    }
}

/**
 * There are two types of sliding buckets:
 *
 *     - A bucket that keeps a constant number of events. As each event
 *       is added, the oldest event is ejected. If the bucket window is a
 *       number then this is assumed to be the number of events in the bucket.
 *
 *     - A bucket that keeps a constant time. As each event is added, the
 *       bucket moves forward in time to the new event. The bucket timerange
 *       stays the same. Only events no longer in the bucket are removed. If
 *       the bucket is a string e.g. "5m", then this defines the bucket size.
 *
 *  ** Only the second type is currently implemented below.
 */
export class SlidingTimeBucket extends Bucket {
    constructor(arg, key, strategy) {
        super(key, strategy);
        if (_.isString(arg)) {
            this._duration = Util.windowDuration(arg);
        } else if (_.isNumber(arg)) {
            this._duration = arg;
        }
    }

    _pushToCache(event, cb) {
        const name = this.name();
        this._cacheStrategy.addEvent(this.name(), event, (err) => {
            const windowEnd = event.timestamp();
            const windowBegin = new Date(windowEnd.getTime() - this._duration);
            this._cacheStrategy.removeOldEvents(name, windowBegin);
            if (cb) {
                cb(err);
            }
        });
    }

    //
    // Add values to the sliding bucket. The event goes at the end, but
    // it may be that earlier events should also be removed.
    //

    addEvent(event, cb) {
        this._pushToCache(event, (err) => {
            if (cb) {
                cb(err);
            }
        });
    }

    /**
     * Takes the values within the bucket and aggregates them together
     * into a new TimeRangeEvent using the operator supplied.
     * The result or error is passed to the callback.
     */
    aggregate(operator, fieldSpec, cb) {
        this.getEvents((err, events) => {
            if (!err) {
                if (events.length) {
                    const data = Event.mapReduce(events, fieldSpec, operator);
                    const timerange = new TimeRange(
                        events[0].timestamp(),
                        events[events.length - 1].timestamp()
                    );
                    const key = this._key === "_default_" ? undefined : this._key;
                    const event = new TimeRangeEvent(timerange, data, key);
                    if (cb) {
                        cb(event);
                    }
                } else if (cb) {
                    cb();
                }
            } else if (cb) {
                cb(err);
            }
        });
    }

}
