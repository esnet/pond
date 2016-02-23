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

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _bucket = require("./bucket");

/**
 * An aggregator takes the following options:
 *
 *     - 'window'    -     size of the window to aggregate over (e.g. "5m")
 *     - 'operator'  -     function (e.g. avg)
  *    - 'fieldSpec' -     (optional) describes what part of the events to
 *                         include in the aggregation. May be a string, list
 *                         of strings for each event column, or a function.
 *                         If a function it should return a list of key/values
 *                         in an object.
 *     - 'emit'      -     (optional) Rate to emit events. Either:
 *                             "always" - emit an event on every change
 *                             "next" - just when we advance to the next bucket
 */

/**
 * const aggregator = new Aggregator({
 *     window: {duration: "1h", type: "sliding"},
 *     emit: 5 // every 5 points the event will emit
 * })
 *
 * Example windows:
 *     what kind of bucket to maintain:
 *
 *     duration: "1h"   type:  sliding   - A sliding window 1hr long
 *     size:      5     type:  sliding   - A sliding window 5 events long
 *     duration: "30s"  type:  fixed     - A fixed window 30s long
 *
 * Example emit:
 *     emit determines how often an event is emitted:
 *
 *     emit always   - Emit a result for every incoming event, same as emit 1
 *     emit next     - Emit a result whenever a fixed window moves
 *     emit 100      - Emit a result, even partial, every 100 events
 *
 */

var Aggregator = (function () {
    function Aggregator(options, observer) {
        _classCallCheck(this, Aggregator);

        // Options
        if (!options) {
            throw new Error("Aggregator: no options supplied");
        }
        if (!_underscore2["default"].has(options, "window")) {
            throw new Error("Aggregator: constructor needs 'window' in options");
        }
        if (!_underscore2["default"].has(options, "operator")) {
            throw new Error("Aggregator: constructor needs 'operator' function in options");
        }

        var type = options.window.type || "fixed";
        switch (type) {
            case "fixed":
                this._bucketType = "fixed";
                this._fixedWindow = options.window.duration || "1m";
                break;
            case "sliding":
                this._bucketType = "sliding";
                this._slidingWindowSize = options.window.size || 10;
                break;
            case "sliding-time":
                this._bucketType = "sliding-time";
                this._slidingWindowDuration = options.window.duration || "1m";
                break;
        }

        // this._window = options.window;
        this._operator = options.operator;
        this._fieldSpec = options.fieldSpec;
        this._emitFrequency = options.emit || "next";
        if (["always", "next"].indexOf(this._emitFrequency) === -1) {
            throw new Error("Aggregator: emitFrequency options should be 'always' or 'next'");
        }
        this._buckets = {};
        this._observer = observer;
    }

    //
    // Triggering
    //

    _createClass(Aggregator, [{
        key: "emitOnBucketAdvance",
        value: function emitOnBucketAdvance() {
            return this._emitFrequency === "next";
        }
    }, {
        key: "emitOnEvent",
        value: function emitOnEvent() {
            return this._emitFrequency === "always";
        }

        //
        // New buckets
        //

    }, {
        key: "generateNewBucket",
        value: function generateNewBucket(timestamp, key) {
            switch (this._bucketType) {
                case "fixed":
                    return _index2["default"].getBucket(this._fixedWindow, timestamp, key);
                case "sliding":
                    return null;
                case "sliding-time":
                    return new _bucket.SlidingTimeBucket(this._slidingWindowDuration, key);
                default:
                    return;
            }
        }

        /**
         * Forces the current bucket to emit
         */
    }, {
        key: "flush",
        value: function flush() {
            var _this = this;

            _underscore2["default"].each(this._buckets, function (bucket, key) {
                _this._buckets[key].aggregate(_this._operator, _this._fieldSpec, function (event) {
                    if (_this._observer) {
                        _this._observer(event);
                    }
                });
            });
            this._buckets = {};
        }

        /**
         * Add an event, which will be assigned to a bucket
         */
    }, {
        key: "addEvent",
        value: function addEvent(event, cb) {
            var _this2 = this;

            var key = event.key() === "" ? "_default_" : event.key();
            var timestamp = event.timestamp();
            var currentBucket = this._buckets[key];

            // If we have a fixed bucket, we might need to generate a new bucket
            // when the events advance enough. However, with sliding windows we always use the
            // same window, we just advance it as necessary.
            if (this._bucketType === "fixed") {
                // See if we need a new bucket
                var currentIndexString = currentBucket ? currentBucket.index().asString() : "";
                var nextIndexString = _index2["default"].getIndexString(this._fixedWindow, timestamp);
                if (nextIndexString !== currentIndexString) {
                    // Emit the old bucket if we are emitting on 'next'
                    if (currentBucket && this.emitOnBucketAdvance()) {
                        currentBucket.aggregate(this._operator, this._fieldSpec, function (event) {
                            if (_this2._observer) {
                                _this2._observer(event);
                            }
                        });
                    }
                    // And now make the new bucket to add our event to
                    this._buckets[key] = this.generateNewBucket(timestamp, key);
                }
            } else {
                if (!this._buckets[key]) {
                    this._buckets[key] = this.generateNewBucket(timestamp, key);
                }
            }

            // Add our event to the current/new bucket
            var bucket = this._buckets[key];
            bucket.addEvent(event, function (err) {
                if (cb) {
                    cb(err);
                }
            });

            // Finally, emit the current/new bucket with the new event in it, if
            // we have been asked to always emit
            if (this.emitOnEvent()) {
                if (bucket) {
                    bucket.aggregate(this._operator, this._fieldSpec, function (event) {
                        if (_this2._observer) {
                            _this2._observer(event);
                        }
                    });
                }
            }
        }

        /**
         * Set the emit callback after the constructor
         */
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }]);

    return Aggregator;
})();

exports["default"] = Aggregator;
module.exports = exports["default"];