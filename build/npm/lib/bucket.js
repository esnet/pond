"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var moment = require("moment");
var _ = require("underscore");

var _require = require("./event");

var IndexedEvent = _require.IndexedEvent;

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

var Bucket = (function () {
    function Bucket(index) {
        _classCallCheck(this, Bucket);

        //Index
        if (_.isString(index)) {
            this._index = new Index(index);
        } else if (index instanceof Index) {
            this._index = index;
        }

        this._cache = []; // Mutable internal list
    }

    _createClass(Bucket, {
        index: {
            value: function index() {
                return this._index;
            }
        },
        toUTCString: {
            value: function toUTCString() {
                return this.index().asString() + ": " + this.range().toUTCString();
            }
        },
        toLocalString: {
            value: function toLocalString() {
                return this.index().asString() + ": " + this.range().toLocalString();
            }
        },
        range: {

            //
            // Convenience access the bucket range
            //

            value: function range() {
                return this._index.asTimerange();
            }
        },
        begin: {
            value: function begin() {
                return this.range().begin();
            }
        },
        end: {
            value: function end() {
                return this.range().end();
            }
        },
        _pushToCache: {

            //
            // Bucket cache, which could potentially be redis or something
            // so pushing to the cache takes a callback, which will be called
            // when the value is added to the cache
            //

            value: function _pushToCache(value, cb) {
                this._cache.push(value);
                var err = null;
                cb && cb(null);
            }
        },
        _readValuesFromCache: {
            value: function _readValuesFromCache(cb) {
                cb && cb(this._cache);
            }
        },
        addValue: {

            //
            // Add values to the bucket
            //

            value: function addValue(value, cb) {
                this._pushToCache(value, function (err) {
                    cb && cb(err);
                });
            }
        },
        sync: {

            //
            // Sync the processing result from the bucket
            //

            value: function sync(processor, cb) {
                var _this = this;

                this._readValuesFromCache(function (values) {
                    var result = processor.call(_this, _this._index, values);
                    cb && cb(result);
                });
            }
        }
    });

    return Bucket;
})();

module.exports = Bucket;