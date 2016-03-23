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

Object.defineProperty(exports, "__esModule", {
    value: true
});

var EventOut = (function () {
    function EventOut(callback) {
        _classCallCheck(this, EventOut);

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
    }, {
        key: "done",
        value: function done() {}
    }]);

    return EventOut;
})();

exports.EventOut = EventOut;

var ConsoleOut = (function () {
    function ConsoleOut(observer) {
        _classCallCheck(this, ConsoleOut);

        this._observer = observer;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */

    _createClass(ConsoleOut, [{
        key: "addEvent",
        value: function addEvent(event) {
            console.log("OUT:", event.toString()); //eslint-disable-line
        }
    }, {
        key: "onEmit",
        value: function onEmit(observer) {
            this._callback = observer;
        }
    }]);

    return ConsoleOut;
})();

exports.ConsoleOut = ConsoleOut;