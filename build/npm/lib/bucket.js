"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _event = require("./event");

var _seriesJs = require("./series.js");

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

/**
 * Internal function to fund the unique keys of a bunch
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

    return new _immutable2["default"].Set(arrayOfKeys);
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

        // Index
        if (_underscore2["default"].isString(index)) {
            this._index = new _index2["default"](index);
        } else if (index instanceof _index2["default"]) {
            this._index = index;
        }

        // Mutable internal list
        this._cache = [];
    }

    _createClass(Bucket, [{
        key: "index",
        value: function index() {
            return this._index;
        }
    }, {
        key: "toUTCString",
        value: function toUTCString() {
            return this.index().asString() + ": " + this.range().toUTCString();
        }
    }, {
        key: "toLocalString",
        value: function toLocalString() {
            return this.index().asString() + ": " + this.range().toLocalString();
        }
    }, {
        key: "range",

        //
        // Convenience access the bucket range
        //

        value: function range() {
            return this._index.asTimerange();
        }
    }, {
        key: "begin",
        value: function begin() {
            return this.range().begin();
        }
    }, {
        key: "end",
        value: function end() {
            return this.range().end();
        }
    }, {
        key: "_pushToCache",

        //
        // Bucket cache, which could potentially be redis or something
        // so pushing to the cache takes a callback, which will be called
        // when the event is added to the cache.
        //
        // TODO: This should be stategy based.
        //

        value: function _pushToCache(event, cb) {
            this._cache.push(event);
            if (cb) cb(null);
        }
    }, {
        key: "_readFromCache",
        value: function _readFromCache(cb) {
            if (cb) cb(this._cache);
        }
    }, {
        key: "addEvent",

        //
        // Add values to the bucket
        //

        value: function addEvent(event, cb) {
            this._pushToCache(event, function (err) {
                if (cb) cb(err);
            });
        }
    }, {
        key: "aggregate",

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
                _underscore2["default"].each(keys.toJS(), function (k) {
                    var vals = _underscore2["default"].map(events, function (v) {
                        return v.get(k);
                    });
                    result[k] = operator.call(_this, _this._index, vals, k);
                });
                var event = new _event.IndexedEvent(_this._index, result);
                if (cb) cb(event);
            });
        }
    }, {
        key: "collect",

        /**
         * Takes the values within the bucket and collects them together
         * into a new IndexedSeries using the operator supplied. Then result
         * or error is passed to the callback.
         */
        value: function collect(cb) {
            var _this2 = this;

            this._readFromCache(function (events) {
                var series = new _seriesJs.IndexedSeries(_this2._index, {
                    "name": _this2._index.toString(),
                    "events": events
                });
                if (cb) cb(series);
            });
        }
    }]);

    return Bucket;
})();

exports["default"] = Bucket;
module.exports = exports["default"];