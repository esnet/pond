"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base class for objects in the processing chain which
 * need other object to listen to them. It provides a basic
 * interface to define the relationships and to emit events
 * to the interested observers.
 */
var Observable = function () {
    function Observable() {
        (0, _classCallCheck3.default)(this, Observable);

        this._id = _underscore2.default.uniqueId("id-");
        this._observers = [];
    }

    (0, _createClass3.default)(Observable, [{
        key: "emit",
        value: function emit(event) {
            this._observers.forEach(function (observer) {
                observer.addEvent(event);
            });
        }
    }, {
        key: "flush",
        value: function flush() {
            this._observers.forEach(function (observer) {
                observer.flush();
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
}(); /**
      *  Copyright (c) 2016, The Regents of the University of California,
      *  through Lawrence Berkeley National Laboratory (subject to receipt
      *  of any required approvals from the U.S. Dept. of Energy).
      *  All rights reserved.
      *
      *  This source code is licensed under the BSD-style license found in the
      *  LICENSE file in the root directory of this source tree.
      */

exports.default = Observable;