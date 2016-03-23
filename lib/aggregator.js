/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _collection = require("./collection");

var _collection2 = _interopRequireDefault(_collection);

var _event = require("./event");

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

/**
 * An Aggregator works over one of 3 types of windows:
 *     - fixed        - A window which is a fixed, represented by a
 *                      duration string such as 5m. Windows are fixed in time.
 *                      If events move on from that window, they move into
 *                      a new window.
 *     - sliding      - A window which can hold a fixed number of events. The most
 *                      recent event will be included in the window, along with
 *                      the n events before it.
 *     - sliding-time - A window which is always a fixed with but moves with events.
 *                      The most recent event will be in the window, along with the
 *                      events before it within a fixed time.
 *
 * Events:
 *
 * An incoming sequence of events will be added to the aggregator. Each
 * event will have a time and data. It will also have a groupByKey that
 * may have been set upstream.
 *
 * Fixed windows:
 *
 * To key by a fixed window is simple. Each can be given a key of
 * ${groupByKey}:${index}  Such as interface1:1h-1234 and all events of
 * that key can be placed in the same collection. This window knows to:
 *   a) Aggregate and emit when triggered
 *
 * Sliding windows:
 *
 * To key a moving window, we key just by the ${groupByKey} and place
 * all events in that window. This window knows to:
 *   a) Remove old events that do not fit in the window anymore
 *   b) Aggregate and emit when triggered
 *
 * Triggering:
 *
 * The Collection is given a Trigger strategy when it is created. When
 * the Collection has each event added to it, the trigger determines if the
 * Collection should emit.
 */

var Aggregator = (function (_Processor) {
    _inherits(Aggregator, _Processor);

    function Aggregator(pipeline, options, observer) {
        _classCallCheck(this, Aggregator);

        _get(Object.getPrototypeOf(Aggregator.prototype), "constructor", this).call(this, pipeline, options, observer);

        // Aggregation operators
        var availableOperators = ["sum", "avg", "max", "min", "count", "first", "last"];
        if (!_underscore2["default"].has(options, "fields")) {
            throw new Error("Aggregator: constructor needs an aggregator field mapping");
        }

        // Check each of the aggregator -> field mappings
        _underscore2["default"].forEach(options.fields, function (field, operator) {
            // Check that each operator is in our white list. We should probably
            // allow custom functions here, but this will work for now
            if (availableOperators.indexOf(operator) === -1) {
                throw new Error("Aggregator: unknown aggregation operator: " + operator);
            }

            // Field should either be an array or a string
            if (!_underscore2["default"].isString(field) && !_underscore2["default"].isArray(field)) {
                throw new Error("Aggregator: field of unknown type: " + field);
            }
        });
        this._fields = options.fields;

        // Pipeline state
        this._groupBy = pipeline.getGroupBy();
        this._windowType = pipeline.getWindowType();
        this._windowDuration = pipeline.getWindowDuration();
        this._emitOn = pipeline.getEmitOn();

        // Maintained collections
        this._collections = {};
    }

    _createClass(Aggregator, [{
        key: "emitCollections",
        value: function emitCollections(collections) {
            var _this = this;

            _underscore2["default"].each(collections, function (c) {
                var collection = c.collection;
                var windowKey = c.windowKey;

                var d = {};
                _underscore2["default"].each(_this._fields, function (fields, operator) {
                    var fieldList = _underscore2["default"].isString(fields) ? [fields] : fields;
                    _underscore2["default"].each(fieldList, function (fieldSpec) {
                        var op = collection[operator];
                        var fieldValue = op.call(collection, fieldSpec);
                        var fieldName = fieldSpec.split(".").pop();
                        d[fieldName] = fieldValue;
                    });
                });

                var event = new _event.IndexedEvent(windowKey, d);
                _this.emit(event);
            });
        }
    }, {
        key: "flush",
        value: function flush() {
            this.emitCollections(this._collections);
            _get(Object.getPrototypeOf(Aggregator.prototype), "flush", this).call(this);
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            var _this2 = this;

            if (this.hasObservers()) {
                (function () {
                    var timestamp = event.timestamp();

                    //
                    // We manage our collections here. Each collection is a
                    // time window collection.
                    //
                    // In the case of a fixed window new collections are created
                    // as we go. In the case of a moving window, the same bucket
                    // is used, but based on the user specification, events are
                    // discarded as new events arrive to advance the bucket along.
                    //
                    // Collections are stored in a dictionary, where the key is a
                    // join of the event key and a window identifier. The combination
                    // of the groupbyKey and the windowKey determines which collection
                    // an incoming event should be placed in.
                    //
                    // For a sliding window, the windowKey is simply "sliding", but
                    // for fixed buckets the key identifies a particular time window
                    // using an Index string.
                    //

                    var windowType = _this2._windowType;

                    var windowKey = undefined;
                    if (windowType === "fixed") {
                        windowKey = _index2["default"].getIndexString(_this2._windowDuration, timestamp);
                    } else {
                        windowKey = windowType;
                    }

                    var groupbyKey = _this2._groupBy(event);
                    var collectionKey = groupbyKey ? windowKey + "::" + groupbyKey : windowKey;

                    var discard = false;
                    if (!_underscore2["default"].has(_this2._collections, collectionKey)) {
                        _this2._collections[collectionKey] = {
                            windowKey: windowKey,
                            groupbyKey: groupbyKey,
                            collection: new _collection2["default"]()
                        };
                        discard = true;
                    }
                    _this2._collections[collectionKey].collection = _this2._collections[collectionKey].collection.addEvent(event);

                    //
                    // If fixed windows, collect together old collections that
                    // will be discarded
                    //

                    var discards = {};
                    if (discard && windowType === "fixed") {
                        _underscore2["default"].each(_this2._collections, function (c, k) {
                            if (windowKey !== c.windowKey) {
                                discards[k] = c;
                            }
                        });
                    }

                    //
                    // Emit
                    //

                    var emitOn = _this2._emitOn;
                    if (emitOn === "eachEvent") {
                        _this2.emitCollections(_this2._collections);
                    } else if (emitOn === "discard") {
                        _this2.emitCollections(discards);
                        _underscore2["default"].each(_Object$keys(discards), function (k) {
                            delete _this2._collections[k];
                        });
                    }
                })();
            }
        }
    }]);

    return Aggregator;
})(_processor2["default"]);

exports["default"] = Aggregator;
module.exports = exports["default"];