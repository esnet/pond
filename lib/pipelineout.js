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

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _pipelinein = require("./pipelinein");

var StreamOut = function StreamOut() {
    _classCallCheck(this, StreamOut);
};

exports.StreamOut = StreamOut;

var BatchOut = function BatchOut() {
    _classCallCheck(this, BatchOut);
};

exports.BatchOut = BatchOut;

var EventOut = (function (_StreamOut) {
    _inherits(EventOut, _StreamOut);

    function EventOut(callback) {
        _classCallCheck(this, EventOut);

        _get(Object.getPrototypeOf(EventOut.prototype), "constructor", this).call(this);
        this._callback = callback;
    }

    _createClass(EventOut, [{
        key: "addEvent",
        value: function addEvent(event) {
            if (this._callback) {
                this._callback(event);
            }
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._callback = cb;
        }
    }]);

    return EventOut;
})(StreamOut);

exports.EventOut = EventOut;

var ConsoleOut = (function (_StreamOut2) {
    _inherits(ConsoleOut, _StreamOut2);

    function ConsoleOut(observer) {
        _classCallCheck(this, ConsoleOut);

        _get(Object.getPrototypeOf(ConsoleOut.prototype), "constructor", this).call(this);
        this._observer = observer;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */

    _createClass(ConsoleOut, [{
        key: "addEvent",
        value: function addEvent(event) {
            console.log("result: addEvent", event.toString());
        }
    }, {
        key: "onEmit",
        value: function onEmit(observer) {
            this._callback = observer;
        }
    }]);

    return ConsoleOut;
})(StreamOut);

exports.ConsoleOut = ConsoleOut;

var CollectionOut = (function (_BatchOut) {
    _inherits(CollectionOut, _BatchOut);

    function CollectionOut(observer) {
        _classCallCheck(this, CollectionOut);

        _get(Object.getPrototypeOf(CollectionOut.prototype), "constructor", this).call(this);
        this._observer = observer;
        this._collection = new _pipelinein.Collection();
    }

    _createClass(CollectionOut, [{
        key: "collection",
        value: function collection() {
            return this._collection;
        }

        /**
         * Add an event will add a key to the event and then emit the
         * event with that key.
         */
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            this._collection = this._collection.addEvent(event);
        }
    }, {
        key: "done",
        value: function done() {
            if (this._observer) {
                this._observer(this.collection());
            }
        }
    }]);

    return CollectionOut;
})(BatchOut);

exports.CollectionOut = CollectionOut;