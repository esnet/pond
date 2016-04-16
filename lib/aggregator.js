"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require("babel-runtime/helpers/get");

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _collection = require("./collection");

var _collection2 = _interopRequireDefault(_collection);

var _event = require("./event");

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Aggregator = function (_Processor) {
    (0, _inherits3.default)(Aggregator, _Processor);

    function Aggregator(pipeline, options, observer) {
        (0, _classCallCheck3.default)(this, Aggregator);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Aggregator).call(this, pipeline, options, observer));

        if (!_underscore2.default.has(options, "fields")) {
            throw new Error("Aggregator: constructor needs an aggregator field mapping");
        }

        // Check each of the aggregator -> field mappings
        _underscore2.default.forEach(options.fields, function (operator, field) {
            // Field should either be an array or a string
            if (!_underscore2.default.isString(field) && !_underscore2.default.isArray(field)) {
                throw new Error("Aggregator: field of unknown type: " + field);
            }
        });

        _this._fields = options.fields;

        // Pipeline state
        _this._groupBy = pipeline.getGroupBy();
        _this._windowType = pipeline.getWindowType();
        _this._windowDuration = pipeline.getWindowDuration();

        if (!_this._windowType || !_this._windowDuration) {
            throw new Error("Unable to aggregate because no windowing strategy is supplied (use windowBy)");
        }

        _this._emitOn = pipeline.getEmitOn();

        // Maintained collections
        _this._collections = {};
        return _this;
    }

    (0, _createClass3.default)(Aggregator, [{
        key: "emitCollections",
        value: function emitCollections(collections) {
            var _this2 = this;

            _underscore2.default.each(collections, function (c) {
                var collection = c.collection;
                var windowKey = c.windowKey;

                var d = {};

                _underscore2.default.each(_this2._fields, function (operator, fields) {
                    var fieldList = _underscore2.default.isString(fields) ? [fields] : fields;
                    _underscore2.default.each(fieldList, function (fieldSpec) {
                        var fieldValue = collection.aggregate(operator, fieldSpec);
                        var fieldName = fieldSpec.split(".").pop();
                        d[fieldName] = fieldValue;
                    });
                });

                var event = new _event.IndexedEvent(windowKey, d);
                _this2.emit(event);
            });
        }
    }, {
        key: "flush",
        value: function flush() {
            this.emitCollections(this._collections);
            (0, _get3.default)((0, _getPrototypeOf2.default)(Aggregator.prototype), "flush", this).call(this);
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            var _this3 = this;

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

                    var windowType = _this3._windowType;

                    var windowKey = void 0;
                    if (windowType === "fixed") {
                        windowKey = _index2.default.getIndexString(_this3._windowDuration, timestamp);
                    } else {
                        windowKey = windowType;
                    }

                    var groupbyKey = _this3._groupBy(event);
                    var collectionKey = groupbyKey ? windowKey + "::" + groupbyKey : windowKey;

                    var discard = false;
                    if (!_underscore2.default.has(_this3._collections, collectionKey)) {
                        _this3._collections[collectionKey] = {
                            windowKey: windowKey,
                            groupbyKey: groupbyKey,
                            collection: new _collection2.default()
                        };
                        discard = true;
                    }
                    _this3._collections[collectionKey].collection = _this3._collections[collectionKey].collection.addEvent(event);

                    //
                    // If fixed windows, collect together old collections that
                    // will be discarded
                    //

                    var discards = {};
                    if (discard && windowType === "fixed") {
                        _underscore2.default.each(_this3._collections, function (c, k) {
                            if (windowKey !== c.windowKey) {
                                discards[k] = c;
                            }
                        });
                    }

                    //
                    // Emit
                    //

                    var emitOn = _this3._emitOn;
                    if (emitOn === "eachEvent") {
                        _this3.emitCollections(_this3._collections);
                    } else if (emitOn === "discard") {
                        _this3.emitCollections(discards);
                        _underscore2.default.each((0, _keys2.default)(discards), function (k) {
                            delete _this3._collections[k];
                        });
                    }
                })();
            }
        }
    }]);
    return Aggregator;
}(_processor2.default); /**
                         *  Copyright (c) 2016, The Regents of the University of California,
                         *  through Lawrence Berkeley National Laboratory (subject to receipt
                         *  of any required approvals from the U.S. Dept. of Energy).
                         *  All rights reserved.
                         *
                         *  This source code is licensed under the BSD-style license found in the
                         *  LICENSE file in the root directory of this source tree.
                         */

exports.default = Aggregator;