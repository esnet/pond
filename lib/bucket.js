/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _event = require("./event");

var _series = require("./series");

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
        for (var _iterator = _getIterator(events), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _getIterator(e.data().keySeq()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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

var MemoryCacheStrategy = (function () {
    function MemoryCacheStrategy() {
        _classCallCheck(this, MemoryCacheStrategy);

        this._cache = {};
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

    _createClass(MemoryCacheStrategy, [{
        key: "init",
        value: function init() {
            // nothing for memory cache
        }
    }, {
        key: "addEvent",
        value: function addEvent(key, event, cb) {
            if (!_underscore2["default"].has(this._cache, key)) {
                this._cache[key] = [];
            }
            this._cache[key].push(event);

            // memory cache never fails (we assume)
            cb(null);
        }
    }, {
        key: "getEvents",
        value: function getEvents(key, cb) {
            if (_underscore2["default"].has(this._cache, key)) {
                cb(null, this._cache[key]);
            } else {
                cb("Unknown cache key", null);
            }
        }
    }, {
        key: "shutdown",
        value: function shutdown() {
            // nothing for memory cache
        }
    }]);

    return MemoryCacheStrategy;
})();

var Bucket = (function () {
    function Bucket(index, strategy) {
        _classCallCheck(this, Bucket);

        // Caching strategy
        if (!strategy) {
            this._cacheStrategy = new MemoryCacheStrategy();
            this._cacheStrategy.init();
        } else {
            this._cacheStrategy = strategy;
        }

        // Index
        if (_underscore2["default"].isString(index)) {
            this._index = new _index2["default"](index);
        } else if (index instanceof _index2["default"]) {
            this._index = index;
        }
    }

    _createClass(Bucket, [{
        key: "name",
        value: function name() {
            return this._index.asString();
        }
    }, {
        key: "timerange",
        value: function timerange() {
            return this._index.asTimerange();
        }
    }, {
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

        //
        // Convenience access the bucket range
        //

    }, {
        key: "range",
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

        //
        // Bucket cache, which could potentially be redis or something
        // so pushing to the cache takes a callback, which will be called
        // when the event is added to the cache.
        //
        // TODO: This should be stategy based.
        //

    }, {
        key: "_pushToCache",
        value: function _pushToCache(event, cb) {
            this._cacheStrategy.addEvent(this.name(), event, function (err) {
                if (cb) {
                    cb(err);
                }
            });
        }
    }, {
        key: "_readFromCache",
        value: function _readFromCache(cb) {
            this._cacheStrategy.getEvents(this.name(), function (err, events) {
                if (cb) {
                    cb(err, events);
                }
            });
        }

        //
        // Add values to the bucket
        //

    }, {
        key: "addEvent",
        value: function addEvent(event, cb) {
            this._pushToCache(event, function (err) {
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
    }, {
        key: "aggregate",
        value: function aggregate(reducer, cb) {
            var _this = this;

            this._readFromCache(function (err, events) {
                if (!err) {
                    if (events.length) {
                        (function () {
                            var keys = uniqueKeys(events);
                            var result = {};
                            _underscore2["default"].each(keys.toJS(), function (k) {
                                var vals = _underscore2["default"].map(events, function (v) {
                                    return v.get(k);
                                });
                                result[k] = reducer.call(_this, _this._index.asTimerange(), vals, k);
                            });
                            var event = new _event.IndexedEvent(_this._index, result);
                            if (cb) {
                                cb(event);
                            }
                        })();
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
    }, {
        key: "collect",
        value: function collect(cb) {
            var _this2 = this;

            var convertToTimes = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            this._readFromCache(function (err, events) {
                var seriesEvents = undefined;
                if (!convertToTimes) {
                    seriesEvents = events;
                } else {
                    seriesEvents = events.map(function (event) {
                        if (event instanceof _event.IndexedEvent) {
                            return new _event.Event(event.index().begin(), event.data());
                        } else {
                            return event;
                        }
                    });
                }
                if (!err) {
                    var series = new _series.TimeSeries({
                        name: _this2._index.toString(),
                        meta: {},
                        index: _this2._index,
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
    }]);

    return Bucket;
})();

exports["default"] = Bucket;
module.exports = exports["default"];