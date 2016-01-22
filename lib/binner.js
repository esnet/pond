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

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _event = require("./event");

/**
 * Bins a stream of events to a new stream of events with a fixed
 * frequency.
 */

var Binner = (function () {
    function Binner(options, observer) {
        _classCallCheck(this, Binner);

        if (!_underscore2["default"].has(options, "window")) {
            throw new Error("Binner: constructor needs 'window' in options");
        }
        if (!_underscore2["default"].has(options, "operator")) {
            throw new Error("Binner: constructor needs 'operator' function in options");
        }

        this._window = options.window;
        this._operator = options.operator;
        this._fieldSpec = options.fieldSpec;
        this._observer = observer;

        this._activeBucketList = {};
        this._lastTime = {};
        this._lastValue = {};
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */

    _createClass(Binner, [{
        key: "incrementActiveBucketList",
        value: function incrementActiveBucketList(key, timestamp) {
            var _this = this;

            var bucketList = [];

            if (!_underscore2["default"].has(this._lastTime, key) || !this._lastTime[key]) {
                bucketList = [];
            } else {
                bucketList = _index2["default"].getBucketList(this._window, new _range2["default"](this._lastTime[key], timestamp), key);
            }
            _underscore2["default"].each(bucketList, function (b) {
                if (!_underscore2["default"].has(_this._activeBucketList, b.index() + "::" + key)) {
                    _this._activeBucketList[b.index() + "::" + key] = b;
                }
            });
            return bucketList;
        }

        /**
         *   |-range -----------|
         *         |-bucket------------|
         *         |            x      |  - v2
         *         |                   |
         *         o                   |  - va
         *   x     |                   |  - v1
         *         |-intersect--|      |
         */
    }, {
        key: "getEdgeValues",
        value: function getEdgeValues(range, v1, v2, intersection) {
            var tr = range.duration();
            var ta = intersection.begin().getTime();
            var tb = intersection.end().getTime();
            var t1 = range.begin().getTime();
            return {
                va: v1 + (ta - t1) / tr * (v2 - v1),
                vb: v1 + (tb - t1) / tr * (v2 - v1)
            };
        }

        /**
         * Add an event, which will be assigned to a bucket.
         * TODO: If we make the cache more general we should pass
         * in a callback here.
         */
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            var _this2 = this;

            var time = event.timestamp();
            var value = event.get();
            var key = event.key() === "" ? "_default_" : event.key();

            this.incrementActiveBucketList(key, time);

            // Process the active bundle list
            _underscore2["default"].each(this._activeBucketList, function (bucket) {
                var bucketTimeRange = bucket.index().asTimerange();
                var pointsTimeRange = new _range2["default"](_this2._lastTime[key], time);
                var intersection = pointsTimeRange.intersection(bucketTimeRange);
                if (intersection && intersection.begin().getTime() === bucketTimeRange.begin().getTime()) {
                    var _getEdgeValues = _this2.getEdgeValues(pointsTimeRange, _this2._lastValue[key], value, intersection);

                    var va = _getEdgeValues.va;
                    var vb = _getEdgeValues.vb;

                    bucket.addEvent(new _event.Event(bucketTimeRange.begin(), va));
                    bucket.addEvent(new _event.Event(bucketTimeRange.end(), vb));
                }
            });

            // delete unused buckets
            var deleteList = [];
            _underscore2["default"].each(this._activeBucketList, function (bucket, activeKey) {
                if (bucket.end() < time) {
                    bucket.aggregate(_this2._operator, _this2._fieldSpec, function (e) {
                        if (!_underscore2["default"].isUndefined(e) && _this2._observer) {
                            _this2._observer(e);
                        }
                        deleteList.push(activeKey);
                    });
                }
            });
            _underscore2["default"].each(deleteList, function (activeKey) {
                return delete _this2._activeBucketList[activeKey];
            });

            this._lastTime[key] = time;
            this._lastValue[key] = value;
        }

        /**
         * Forces the current buckets to emit
         */
    }, {
        key: "flush",
        value: function flush() {
            var _this3 = this;

            _underscore2["default"].each(this._activeBucketList, function (bucket) {
                bucket.aggregate(_this3._operator, _this3._fieldSpec, function (e) {
                    if (_this3._observer) {
                        _this3._observer(e);
                    }
                });
            });
            this._activeBucketList = {};
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

    return Binner;
})();

exports["default"] = Binner;
module.exports = exports["default"];