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

var Aggregator = (function () {
    function Aggregator(size, processor, observer) {
        _classCallCheck(this, Aggregator);

        this._generator = new _generator2["default"](size);
        this._processor = processor;
        this._bucket = null;
        this._observer = observer;
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */

    _createClass(Aggregator, [{
        key: "bucket",
        value: function bucket(d) {
            var _this = this;

            var thisBucketIndex = this._generator.bucketIndex(d);
            var currentBucketIndex = this._bucket ? this._bucket.index().asString() : "";
            if (thisBucketIndex !== currentBucketIndex) {
                if (this._bucket) {
                    this._bucket.aggregate(this._processor, function (event) {
                        if (_this._observer) {
                            _this._observer(_this._bucket.index(), event);
                        }
                    });
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
                this._bucket.aggregate(this._processor, function (event) {
                    if (_this2._observer) {
                        _this2._observer(_this2._bucket.index(), event);
                    }
                    _this2._bucket = null;
                });
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

            //
            // Adding the value to the bucket. This could be an async operation
            // so the passed in callback to this function will be called when this
            // is done.
            //

            bucket.addEvent(event, function (err) {
                if (cb) {
                    cb(err);
                }
            });
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