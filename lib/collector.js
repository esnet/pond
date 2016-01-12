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

var _generator = require("./generator");

var _generator2 = _interopRequireDefault(_generator);

/**
 * A collector takes the following options:
 *
 *     - 'window'        - size of the window to collect over (e.g. "1d")
 *     - 'convertToTimes'- to transform IndexedEvents to Events during collection
 *     - 'emit'         - (optional) Rate to emit events. Either:
 *                             "always" - emit an event on every change
 *                             "next" - just when we advance to the next bucket
 *
 * TODO: It might make more sense to make an event transformer for
 *       converting between a stream of IndexedEvents to Events...
 */

var Collector = (function () {
    function Collector(options, observer) {
        _classCallCheck(this, Collector);

        if (!_underscore2["default"].has(options, "window")) {
            throw new Error("Collector: constructor needs 'window' in options");
        }
        this._emitFrequency = options.emit || "next";
        if (["always", "next"].indexOf(this._emitFrequency) === -1) {
            throw new Error("Collector: emitFrequency options should be 'always' or 'next'");
        }
        this._convertToTimes = options.convertToTimes || false;
        this._generator = new _generator2["default"](options.window);
        this._buckets = {};
        this._observer = observer;
    }

    /**
     * Forces the current bucket to emit
     */

    _createClass(Collector, [{
        key: "flush",
        value: function flush() {
            var _this = this;

            _underscore2["default"].each(this._buckets, function (bucket, key) {
                _this._buckets[key].collect(function (series) {
                    if (_this._observer) {
                        _this._observer(series);
                    }
                }, _this._convertToTimes);
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
            var index = this._generator.bucketIndex(timestamp);
            var currentBucket = this._buckets[key];
            var currentBucketIndex = currentBucket ? currentBucket.index().asString() : "";

            // See if we need a new bucket
            if (index !== currentBucketIndex) {
                // Emit the old bucket if we are emitting on 'next'
                if (currentBucket && this._emitFrequency === "next") {
                    currentBucket.collect(function (series) {
                        if (_this2._observer) {
                            _this2._observer(series);
                        }
                    }, this._convertToTimes);
                }
                // And now make the new bucket to add our event to
                this._buckets[key] = this._generator.bucket(timestamp, key);
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
            if (this._emitFrequency === "always") {
                if (bucket) {
                    bucket.collect(function (series) {
                        if (_this2._observer) {
                            _this2._observer(series);
                        }
                    }, this._convertToTimes);
                }
            }
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }]);

    return Collector;
})();

exports["default"] = Collector;
module.exports = exports["default"];