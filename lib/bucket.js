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

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _event3 = require("./event");

var _series = require("./series");

var _series2 = _interopRequireDefault(_series);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var MemoryCacheStrategy = (function () {
    function MemoryCacheStrategy() {
        _classCallCheck(this, MemoryCacheStrategy);

        this._cache = {};
    }

    _createClass(MemoryCacheStrategy, [{
        key: "init",
        value: function init() {
            // nothing for memory cache
        }
    }, {
        key: "addEvent",
        value: function addEvent(name, event, cb) {
            if (!_underscore2["default"].has(this._cache, name)) {
                this._cache[name] = _immutable2["default"].List();
            }
            this._cache[name] = this._cache[name].push(event);
            cb(null);
        }

        /**
         * Removes the first event in the list
         */
    }, {
        key: "removeFirstEvent",
        value: function removeFirstEvent(name) {
            if (_underscore2["default"].has(this._cache, name)) {
                this._cache[name] = this._cache[name].shift();
            }
        }

        /**
         * Removes all the events before the given timestamp
         */
    }, {
        key: "removeOldEvents",
        value: function removeOldEvents(name, timestamp) {
            if (_underscore2["default"].has(this._cache, name)) {
                this._cache[name] = this._cache[name].filterNot(function (event) {
                    return event.timestamp().getTime() < timestamp.getTime();
                });
            }
        }
    }, {
        key: "getEvents",
        value: function getEvents(name, cb) {
            if (_underscore2["default"].has(this._cache, name)) {
                cb(null, this._cache[name].toJS());
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

function _derivative(timerange) {
    return function fn(values) {
        return values.length ? (values[values.length - 1] - values[0]) / (timerange.duration() / 1000) : undefined;
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

var Bucket = (function () {
    function Bucket(key, strategy) {
        _classCallCheck(this, Bucket);

        // Caching strategy
        if (!strategy) {
            this._cacheStrategy = new MemoryCacheStrategy();
            this._cacheStrategy.init();
        } else {
            this._cacheStrategy = strategy;
        }

        // Event key
        if (_underscore2["default"].isString(key)) {
            this._key = key;
        } else {
            this._key = null;
        }
    }

    /**
     * An indexed bucket represents a fixed range of time, defined by the
     * index supplied to the constructor. The index may be of string form
     * or an actual Index.
     */

    _createClass(Bucket, [{
        key: "name",
        value: function name() {
            return "bucket";
        }
    }, {
        key: "key",
        value: function key() {
            return this._key;
        }

        //
        // Bucket cache, which could potentially be redis or something
        // so pushing to the cache takes a callback, which will be called
        // when the event is added to the cache.
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
    }, {
        key: "getEvents",
        value: function getEvents(cb) {
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
    }, {
        key: "aggregate",
        value: function aggregate(operator, fieldSpec, cb) {
            var _this = this;

            this._readFromCache(function (err, events) {
                if (!err) {
                    if (events.length) {
                        var data = _event3.Event.mapReduce(events, fieldSpec, operator);
                        var key = _this._key === "_default_" ? undefined : _this._key;
                        var _event = new _event3.IndexedEvent(_this._index, data, null, key);
                        if (cb) {
                            cb(_event);
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
    }, {
        key: "derivative",
        value: function derivative(fieldSpec, cb) {
            var fn = _derivative(this._index.asTimerange());
            this.aggregate(fn, fieldSpec, cb);
        }

        /**
         * Takes the values within the bucket and collects them together
         * into a new TimeSeries.
         *
         * The result or error is passed to the callback.
         */
    }, {
        key: "collect",
        value: function collect(cb) {
            var _this2 = this;

            this._readFromCache(function (err, events) {
                if (!err) {
                    var series = new _series2["default"]({
                        name: _this2._index.toString(),
                        meta: {},
                        index: _this2._index,
                        events: events
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

exports.Bucket = Bucket;

var IndexedBucket = (function (_Bucket) {
    _inherits(IndexedBucket, _Bucket);

    function IndexedBucket(index, key, strategy) {
        _classCallCheck(this, IndexedBucket);

        _get(Object.getPrototypeOf(IndexedBucket.prototype), "constructor", this).call(this, key, strategy);

        // Index
        if (_underscore2["default"].isString(index)) {
            this._index = new _index2["default"](index);
        } else if (index instanceof _index2["default"]) {
            this._index = index;
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

    _createClass(IndexedBucket, [{
        key: "name",
        value: function name() {
            return this._index.asString();
        }

        //
        // Access the index in different ways
        //

    }, {
        key: "index",
        value: function index() {
            return this._index;
        }
    }, {
        key: "timerange",
        value: function timerange() {
            return this._index.asTimerange();
        }
    }, {
        key: "toUTCString",
        value: function toUTCString() {
            return this._index.asString() + ": " + this.range().toUTCString();
        }
    }, {
        key: "toLocalString",
        value: function toLocalString() {
            return this._index.asString() + ": " + this.range().toLocalString();
        }
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
    }]);

    return IndexedBucket;
})(Bucket);

exports.IndexedBucket = IndexedBucket;

var SlidingTimeBucket = (function (_Bucket2) {
    _inherits(SlidingTimeBucket, _Bucket2);

    function SlidingTimeBucket(arg, key, strategy) {
        _classCallCheck(this, SlidingTimeBucket);

        _get(Object.getPrototypeOf(SlidingTimeBucket.prototype), "constructor", this).call(this, key, strategy);
        if (_underscore2["default"].isString(arg)) {
            this._duration = _util2["default"].windowDuration(arg);
        } else if (_underscore2["default"].isNumber(arg)) {
            this._duration = arg;
        }
    }

    _createClass(SlidingTimeBucket, [{
        key: "_pushToCache",
        value: function _pushToCache(event, cb) {
            var _this3 = this;

            var name = this.name();
            this._cacheStrategy.addEvent(this.name(), event, function (err) {
                var windowEnd = event.timestamp();
                var windowBegin = new Date(windowEnd.getTime() - _this3._duration);
                _this3._cacheStrategy.removeOldEvents(name, windowBegin);
                if (cb) {
                    cb(err);
                }
            });
        }

        //
        // Add values to the sliding bucket. The event goes at the end, but
        // it may be that earlier events should also be removed.
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
         * into a new TimeRangeEvent using the operator supplied.
         * The result or error is passed to the callback.
         */
    }, {
        key: "aggregate",
        value: function aggregate(operator, fieldSpec, cb) {
            var _this4 = this;

            this.getEvents(function (err, events) {
                if (!err) {
                    if (events.length) {
                        var data = _event3.Event.mapReduce(events, fieldSpec, operator);
                        var timerange = new _range2["default"](events[0].timestamp(), events[events.length - 1].timestamp());
                        var key = _this4._key === "_default_" ? undefined : _this4._key;
                        var _event2 = new _event3.TimeRangeEvent(timerange, data, key);
                        if (cb) {
                            cb(_event2);
                        }
                    } else if (cb) {
                        cb();
                    }
                } else if (cb) {
                    cb(err);
                }
            });
        }
    }]);

    return SlidingTimeBucket;
})(Bucket);

exports.SlidingTimeBucket = SlidingTimeBucket;