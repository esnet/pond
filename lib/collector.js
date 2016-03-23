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

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _collection = require("./collection");

var _collection2 = _interopRequireDefault(_collection);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

/**
 * A sink for processing chains. Outputs a Collection of events
 * each based on the emit on trigger spec. Currently this means it
 * will either output everytime and event comes in, or just when
 * Collections are done with and are about to be discarded.
 */

var FixedWindowCollector = (function () {
    function FixedWindowCollector(pipeline, observer) {
        _classCallCheck(this, FixedWindowCollector);

        this._observer = observer;

        // Pipeline state
        this._groupBy = pipeline.getGroupBy();
        this._windowType = "fixed";
        this._windowDuration = pipeline.getWindowDuration();
        this._emitOn = pipeline.getEmitOn();

        this._collections = {};
    }

    /**
     * A sink for processing chains. Maintains a single global collection.
     * This is used for quick and dirty collections.
     *
     * The collection will catch all events, regardless
     * of upstream groupBy or windowing in the pipeline.
     *
     * If you want that, use the fixed window collector.
     */

    _createClass(FixedWindowCollector, [{
        key: "emitCollections",
        value: function emitCollections(collections) {
            var _this = this;

            if (this._observer) {
                _underscore2["default"].each(collections, function (c, k) {
                    _this._observer(c, k);
                });
            }
        }
    }, {
        key: "done",
        value: function done() {
            this.emitCollections(this._collections);
        }
    }, {
        key: "collections",
        value: function collections() {
            return this._collections;
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            var _this2 = this;

            var timestamp = event.timestamp();

            //
            // We manage our collections here. Each collection is a
            // fixed time window collection. New collections are created
            // as we go along.
            //
            // Collections are stored in a dictionary, where the key is a
            // join of the event key and a window identifier. The combination
            // of the eventKey and the windowKey determines which collection
            // an incoming event should be placed in.
            //

            // Out keys will either be:
            //   - global
            //   - 1d-1234
            //   - 1d-1234:groupKey
            //

            var windowType = this._windowType;

            var windowKey = undefined;

            if (windowType === "fixed") {
                windowKey = _index2["default"].getIndexString(this._windowDuration, timestamp);
            } else {
                windowKey = windowType;
            }

            var eventKey = this._groupBy(event);
            var collectionKey = eventKey ? windowKey + "::" + eventKey : windowKey;

            var discard = false;
            if (!_underscore2["default"].has(this._collections, collectionKey)) {
                this._collections[collectionKey] = new _collection2["default"]();
                discard = true;
            }

            this._collections[collectionKey] = this._collections[collectionKey].addEvent(event);

            //
            // If fixed windows, collect together old collections that
            // will be discarded
            //

            var discards = {};
            if (discard) {
                _underscore2["default"].each(this._collections, function (c, k) {
                    var wk = collectionKey.split("::")[0];
                    if (wk !== k) {
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
            }

            _underscore2["default"].each(_underscore2["default"].keys(discards), function (k) {
                delete _this2._collections[k];
            });
        }
    }]);

    return FixedWindowCollector;
})();

exports.FixedWindowCollector = FixedWindowCollector;

var Collector = (function () {
    function Collector(pipeline, options, observer) {
        _classCallCheck(this, Collector);

        console.log("Created Collector", pipeline, options, observer);
        this._observer = observer;
        this._collection = new _collection2["default"]();
    }

    _createClass(Collector, [{
        key: "emitCollection",
        value: function emitCollection() {
            this._observer && this._observer(this._collection);
        }
    }, {
        key: "done",
        value: function done() {
            this.emitCollection();
        }
    }, {
        key: "collection",
        value: function collection() {
            return this._collection;
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            this._collection = this._collection.addEvent(event);
            this.emitCollection();
        }
    }]);

    return Collector;
})();

exports.Collector = Collector;