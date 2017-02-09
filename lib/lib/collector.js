"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _collection = require("./collection");

var _collection2 = _interopRequireDefault(_collection);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Collector is used to accumulate events into multiple collections,
 * based on potentially many strategies. In this current implementation
 * a collection is partitioned based on the window that it falls in
 * and the group it is part of.
 *
 * Collections are emitted from this class to the supplied onTrigger
 * callback.
 */
var Collector = function () {
    function Collector(options, onTrigger) {
        (0, _classCallCheck3.default)(this, Collector);
        var windowType = options.windowType,
            windowDuration = options.windowDuration,
            groupBy = options.groupBy,
            emitOn = options.emitOn;


        this._groupBy = groupBy;
        this._emitOn = emitOn;
        this._windowType = windowType;
        this._windowDuration = windowDuration;

        // Callback for trigger
        this._onTrigger = onTrigger;

        // Maintained collections
        this._collections = {};
    }

    (0, _createClass3.default)(Collector, [{
        key: "flushCollections",
        value: function flushCollections() {
            this.emitCollections(this._collections);
        }
    }, {
        key: "emitCollections",
        value: function emitCollections(collections) {
            var _this = this;

            if (this._onTrigger) {
                _underscore2.default.each(collections, function (c) {
                    var collection = c.collection,
                        windowKey = c.windowKey,
                        groupByKey = c.groupByKey;

                    _this._onTrigger && _this._onTrigger(collection, windowKey, groupByKey);
                });
            }
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            var _this2 = this;

            var timestamp = event.timestamp();

            //
            // Window key
            //
            var windowType = this._windowType;
            var windowKey = void 0;
            if (windowType === "fixed") {
                windowKey = _index2.default.getIndexString(this._windowDuration, timestamp);
            } else if (windowType === "daily") {
                windowKey = _index2.default.getDailyIndexString(timestamp);
            } else if (windowType === "monthly") {
                windowKey = _index2.default.getMonthlyIndexString(timestamp);
            } else if (windowType === "yearly") {
                windowKey = _index2.default.getYearlyIndexString(timestamp);
            } else {
                windowKey = windowType;
            }

            //
            // Groupby key
            //
            var groupByKey = this._groupBy(event);

            //
            // Collection key
            //
            var collectionKey = groupByKey ? windowKey + "::" + groupByKey : windowKey;

            var discard = false;
            if (!_underscore2.default.has(this._collections, collectionKey)) {
                this._collections[collectionKey] = {
                    windowKey: windowKey,
                    groupByKey: groupByKey,
                    collection: new _collection2.default()
                };
                discard = true;
            }
            this._collections[collectionKey].collection = this._collections[collectionKey].collection.addEvent(event);

            //
            // If fixed windows, collect together old collections that
            // will be discarded
            //
            var discards = {};
            if (discard && windowType === "fixed") {
                _underscore2.default.each(this._collections, function (c, k) {
                    if (windowKey !== c.windowKey) {
                        discards[k] = c;
                    }
                });
            }

            //
            // Emit
            //
            var emitOn = this._emitOn;
            if (emitOn === "eachEvent") {
                this.emitCollections(this._collections);
            } else if (emitOn === "discard") {
                this.emitCollections(discards);
                _underscore2.default.each((0, _keys2.default)(discards), function (k) {
                    delete _this2._collections[k];
                });
            } else if (emitOn === "flush") {
                // pass
            } else {
                throw new Error("Unknown emit type supplied to Collector");
            }
        }
    }]);
    return Collector;
}(); /*
      *  Copyright (c) 2016-2017, The Regents of the University of California,
      *  through Lawrence Berkeley National Laboratory (subject to receipt
      *  of any required approvals from the U.S. Dept. of Energy).
      *  All rights reserved.
      *
      *  This source code is licensed under the BSD-style license found in the
      *  LICENSE file in the root directory of this source tree.
      */

exports.default = Collector;