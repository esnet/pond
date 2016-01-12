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
import { Event, IndexedEvent } from "./event";
import TimeSeries from "./series";

import Index from "./index";

class MemoryCacheStrategy {
    constructor() {
        this._cache = {};
    }

    init() {
        // nothing for memory cache
    }

    addEvent(name, event, cb) {
        let eventKey = name;
        if (event instanceof Event) {
            eventKey = `${event.timestamp().getTime()}`;
        } else if (event instanceof IndexedEvent) {
            eventKey = `${event.index()}`;
        }

        if (!_.has(this._cache, name)) {
            this._cache[name] = {};
        }

        this._cache[name][eventKey] = event;

        // memory cache never fails (we assume)
        cb(null);
    }

    getEvents(name, cb) {
        if (_.has(this._cache, name)) {
            const events = _.map(this._cache[name], event => event);
            cb(null, events);
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
export default class Bucket {

    constructor(index, key, strategy) {
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

        // Event key
        if (_.isString(key)) {
            this._key = key;
        } else {
            this._key = null;
        }
    }

    name() {
        return this._index.asString();
    }

    key() {
        return this._key;
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
     * into a new IndexedEvent using the operator supplied.
     * The result or error is passed to the callback.
     */
    aggregate(operator, fieldSpec, cb) {
        this._readFromCache((err, events) => {
            if (!err) {
                if (events.length) {
                    const data = Event.mapReduce(events, fieldSpec, operator);
                    const event = new IndexedEvent(this._index, data, null, this._key);
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
