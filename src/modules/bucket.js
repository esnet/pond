var moment = require("moment");
var _ = require("underscore");

var {IndexedEvent} = require("./event");
var Index = require("./index");
var TimeRange = require("./range");

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
class Bucket {

    constructor(index) {
        //Index
        if (_.isString(index)) {
            this._index = new Index(index);
        } else if (index instanceof Index) {
            this._index = index;
        }

        this._cache = [];  // Mutable internal list
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
    // when the value is added to the cache
    //

    _pushToCache(value, cb) {
        this._cache.push(value);
        let err = null;
        cb && cb(null);
    }

    _readValuesFromCache(cb) {
        cb && cb(this._cache);
    }

    //
    // Add values to the bucket
    //

    addValue(value, cb) {
        this._pushToCache(value, (err) => {cb && cb(err)});
    }

    //
    // Sync the processing result from the bucket
    //

    sync(processor, cb) {
        this._readValuesFromCache((values) => {
            let result = processor.call(this, this._index, values);
            cb && cb(result);
        });
    }
}

module.exports = Bucket;
