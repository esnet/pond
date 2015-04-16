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
 *
 * When a result is emitted from the Bucket that is in the form
 * of an IndexedEvent.
 */
class Bucket {

    constructor(index) {
        //Index
        if (_.isString(index)) {
            this._i = new Index(index);
        } else if (index instanceof Index) {
            this._i = index;
        }

        console.log("constructed bucket with index", index, this._i);

        this._cache = [];  // Mutable internal list
    }

    index() {
        return this._i;
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
        return this._i.asRange();
    }

    begin() {
        return this.range().begin();
    }

    end() {
        return this.range().end();
    }

    //
    // Bucket cache
    //
    // TODO: bucket cache should be a strategy pattern
    //

    _pushToCache(value) {
        this._cache.push(value);
    }

    _cache() {
        return this._cache;
    }

    addValue(value, fn, cb) {
        this._pushToCache(value);
        var result = fn.call(this, this._cache);
        console.log("   cache", this._cache, "->", result);
        var event = new IndexedEvent(this._i, result);
        cb && cb(event);
    }
}

module.exports = Bucket;
