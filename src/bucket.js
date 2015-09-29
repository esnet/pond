import Immutable from "immutable";
import _ from "underscore";
import {IndexedEvent} from "./event";
import {TimeSeries} from "./series";
import Index from "./index";

/**
 * Internal function to fund the unique keys of a bunch
 * of immutable maps objects. There's probably a more elegent way
 * to do this.
 */
function uniqueKeys(events) {
    var arrayOfKeys = [];
    for (let e of events) {
        for (let k of e.data().keySeq()) {
            arrayOfKeys.push(k);
        }
    }
    return new Immutable.Set(arrayOfKeys);
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

    constructor(index) {
        // Index
        if (_.isString(index)) {
            this._index = new Index(index);
        } else if (index instanceof Index) {
            this._index = index;
        }

        // Mutable internal list
        this._cache = [];
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
        return this.index().asString() + ": " + this.range().toUTCString();
    }

    toLocalString() {
        return this.index().asString() + ": " + this.range().toLocalString();
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
        this._cache.push(event);
        if (cb) {
            cb(null);
        }
    }

    _readFromCache(cb) {
        if (cb) {
            cb(this._cache);
        }
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
     * into a new IndexedEvent using the operator supplied. Then result
     * or error is passed to the callback.
     */
    aggregate(operator, cb) {
        this._readFromCache((events) => {
            if (events.length) {
                let keys = uniqueKeys(events);
                let result = {};
                _.each(keys.toJS(), k => {
                    let vals = _.map(events, (v) => { return v.get(k); });
                    result[k] = operator.call(this, this._index, vals, k);
                });
                const event = new IndexedEvent(this._index, result);
                if (cb) {
                    cb(event);
                }
            } else if (cb) {
                cb();
            }
        });
    }

    /**
     * Takes the values within the bucket and collects them together
     * into a new IndexedSeries using the operator supplied. Then result
     * or error is passed to the callback.
     */
    collect(cb) {
        this._readFromCache((events) => {
            var series = new TimeSeries({
                name: this._index.toString(),
                meta: {},
                index: this._index,
                events: events
            });
            if (cb) {
                cb(series);
            }
        });
    }
}
