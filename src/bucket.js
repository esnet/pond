/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import Immutable from "immutable";
import _ from "underscore";
import { Event, IndexedEvent } from "./event";
import { TimeSeries } from "./series";
import Index from "./index";

/**
 * Internal function to fund the unique keys of a bunch
 * of immutable maps objects. There's probably a more elegent way
 * to do this.
 */
function uniqueKeys(events) {
    const arrayOfKeys = [];
    for (const e of events) {
        for (const k of e.data().keySeq()) {
            arrayOfKeys.push(k);
        }
    }
    return new Immutable.Set(arrayOfKeys);
}

class MemoryCacheStrategy {
    constructor() {
        this._cache = {};
    }

    init() {
        // nothing for memory cache
    }

    addEvent(key, event, cb) {
        if (!_.has(this._cache, key)) {
            this._cache[key] = [];
        }
        this._cache[key].push(event);

        // memory cache never fails (we assume)
        cb(null);
    }

    getEvents(key, cb) {
        if (_.has(this._cache, key)) {
            cb(null, this._cache[key]);
        } else {
            cb("Unknown cache key", null);
        }
    }

    shutdown() {
        // nothing for memory cache
    }
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
export default class Bucket {

    constructor(index, strategy) {
        // Caching strategy
        if (!strategy) {
            this._cacheStrategy = new MemoryCacheStrategy();
            this._cacheStrategy.init();
        } else {
            this._cacheStrategy = strategy;
        }

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

    timerange() {
        return this._index.asTimerange();
    }

    index() {
        return this._index;
    }

    toUTCString() {
        return `${this.index().asString()}: ${this.range().toUTCString()}`;
    }

    toLocalString() {
        return `${this.index().asString()}: ${this.range().toLocalString()}`;
    }

    //
    // Convenience access the bucket range
    //

    range() {
        return this._index.asTimerange();
    }

    begin() {
        return this.range().begin();
    }

    end() {
        return this.range().end();
    }

    //
    // Bucket cache, which could potentially be redis or something
    // so pushing to the cache takes a callback, which will be called
    // when the event is added to the cache.
    //
    // TODO: This should be stategy based.
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

    /**
     * Takes the values within the bucket and aggregates them together
     * into a new IndexedEvent using the reducer supplied.
     * The result or error is passed to the callback.
     */
    aggregate(reducer, cb) {
        this._readFromCache((err, events) => {
            if (!err) {
                if (events.length) {
                    const keys = uniqueKeys(events);
                    const result = {};
                    _.each(keys.toJS(), k => {
                        const vals = _.map(events, v => v.get(k));
                        result[k] = reducer.call(
                            this, this._index.asTimerange(), vals, k);
                    });
                    const event = new IndexedEvent(this._index, result);
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
     * Takes the values within the bucket and collects them together
     * into a new TimeSeries. The convertToTimes flag determines if
     * the collected Events should be rebuilt with time (i.e. Events)
     * or left as IndexedEvents.
     *
     * The result or error is passed to the callback.
     */
    collect(cb, convertToTimes = false) {
        this._readFromCache((err, events) => {
            let seriesEvents;
            if (!convertToTimes) {
                seriesEvents = events;
            } else {
                seriesEvents = events.map(event => {
                    if (event instanceof IndexedEvent) {
                        return new Event(event.index().begin(), event.data());
                    } else {
                        return event;
                    }
                });
            }
            if (!err) {
                const series = new TimeSeries({
                    name: this._index.toString(),
                    meta: {},
                    index: this._index,
                    events: seriesEvents
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
