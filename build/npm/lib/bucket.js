"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var moment = require("moment");
var Immutable = require("immutable");
var _ = require("underscore");

var _require = require("./event");

var IndexedEvent = _require.IndexedEvent;

var _require2 = require("./series.js");

var IndexedSeries = _require2.IndexedSeries;

var Index = require("./index");
var TimeRange = require("./range");

/** Internal function to fund the unique keys of a bunch
  * of immutable maps objects. There's probably a more elegent way
  * to do this.
  */
function uniqueKeys(events) {
    var arrayOfKeys = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = e.data().keySeq()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var k = _step2.value;

                    arrayOfKeys.push(k);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
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
            // when the event is added to the cache.
            //
            // TODO: This should be stategy based.
            //

            value: function _pushToCache(event, cb) {
                this._cache.push(event);
                cb && cb(null);
            }
        },
        _readFromCache: {
            value: function _readFromCache(cb) {
                cb && cb(this._cache);
            }
        },
        addEvent: {

            //
            // Add values to the bucket
            //

            value: function addEvent(event, cb) {
                this._pushToCache(event, function (err) {
                    cb && cb(err);
                });
            }
        },
        aggregate: {

            /**
             * Takes the values within the bucket and aggregates them together
             * into a new IndexedEvent using the operator supplied. Then result
             * or error is passed to the callback.
             */

            value: function aggregate(operator, cb) {
                var _this = this;

                this._readFromCache(function (events) {
                    var keys = uniqueKeys(events);
                    var result = {};
                    _.each(keys.toJS(), function (k) {
                        var vals = _.map(events, function (v) {
                            return v.get(k);
                        });
                        result[k] = operator.call(_this, _this._index, vals, k);
                    });
                    var event = new IndexedEvent(_this._index, result);
                    cb && cb(event);
                });
            }
        },
        collect: {

            /**
             * Takes the values within the bucket and collects them together
             * into a new IndexedSeries using the operator supplied. Then result
             * or error is passed to the callback.
             */

            value: function collect(cb) {
                var _this = this;

                this._readFromCache(function (events) {
                    var series = new IndexedSeries(_this._index, {
                        name: _this._index.toString(),
                        events: events
                    });
                    cb && cb(series);
                });
            }
        }
    });

    return Bucket;
})();

module.exports = Bucket;