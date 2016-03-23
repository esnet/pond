/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * Base class for objects in the processing chain which
 * need other object to listen to them. It provides a basic
 * interface to define the relationships and to emit events
 * to the interested observers.
 */
"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Observable = (function () {
    function Observable() {
        _classCallCheck(this, Observable);

        this._observers = [];
    }

    _createClass(Observable, [{
        key: "emit",
        value: function emit(event) {
            this._observers.forEach(function (observer) {
                return observer.addEvent(event);
            });
        }
    }, {
        key: "flush",
        value: function flush() {
            this._observers.forEach(function (observer) {
                if (observer instanceof Observable) {
                    observer.flush();
                }
            });
        }
    }, {
        key: "addObserver",
        value: function addObserver(observer) {
            var shouldAdd = true;
            this._observers.forEach(function (o) {
                if (o === observer) {
                    shouldAdd = false;
                }
            });

            if (shouldAdd) this._observers.push(observer);
        }
    }, {
        key: "hasObservers",
        value: function hasObservers() {
            return this._observers.length > 0;
        }
    }]);

    return Observable;
})();

exports["default"] = Observable;
module.exports = exports["default"];