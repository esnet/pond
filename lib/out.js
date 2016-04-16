"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConsoleOut = exports.EventOut = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var EventOut = exports.EventOut = function () {
    function EventOut(pipeline, options, callback) {
        (0, _classCallCheck3.default)(this, EventOut);

        this._callback = callback;
    }

    (0, _createClass3.default)(EventOut, [{
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
}();

var ConsoleOut = exports.ConsoleOut = function () {
    function ConsoleOut(observer) {
        (0, _classCallCheck3.default)(this, ConsoleOut);

        this._observer = observer;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */


    (0, _createClass3.default)(ConsoleOut, [{
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
}();