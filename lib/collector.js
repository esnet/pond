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

var _generator = require("./generator");

var _generator2 = _interopRequireDefault(_generator);

var Collector = (function () {
    function Collector(size, observer) {
        var convertToTimes = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        _classCallCheck(this, Collector);

        this._generator = new _generator2["default"](size);
        this._bucket = null;
        this._convertToTimes = convertToTimes;

        // Callback
        this._observer = observer;
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */

    _createClass(Collector, [{
        key: "bucket",
        value: function bucket(d) {
            var _this = this;

            var newBucketIndex = this._generator.bucketIndex(d);
            var bucketIndex = this._bucket ? this._bucket.index().asString() : "";
            if (newBucketIndex !== bucketIndex) {
                if (this._bucket) {
                    this._bucket.collect(function (series) {
                        if (_this._observer) {
                            _this._observer(series);
                        }
                    }, this._convertToTimes);
                }
                this._bucket = this._generator.bucket(d);
            }
            return this._bucket;
        }

        /**
         * Forces the current bucket to emit
         */
    }, {
        key: "done",
        value: function done() {
            var _this2 = this;

            if (this._bucket) {
                this._bucket.collect(function (series) {
                    if (_this2._observer) {
                        _this2._observer(series);
                    }
                    _this2._bucket = null;
                }, this._convertToTimes);
            }
        }

        /**
         * Add an event, which will be assigned to a bucket
         */
    }, {
        key: "addEvent",
        value: function addEvent(event, cb) {
            var t = event.timestamp();
            var bucket = this.bucket(t);
            bucket.addEvent(event, function (err) {
                if (cb) {
                    cb(err);
                }
            });
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