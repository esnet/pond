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

var Grouper = (function () {

    /**
     * `groupBy` may be either:
     *     * A function which takes an event and returns a string as a key
     *     * A string, which corresponds to a column in the event, like "name"
     *     * A list, which corresponds to a list of columns to join together for the key
     * `observer` is the callback that will receive the emitted events
     */

    function Grouper(options, observer) {
        _classCallCheck(this, Grouper);

        if (!_underscore2["default"].has(options, "groupBy")) {
            throw new Error("Grouper: constructor needs 'groupBy' in options");
        }

        if (_underscore2["default"].isFunction(options.groupBy)) {
            this._groupBy = options.groupBy;
        } else if (_underscore2["default"].isArray(options.groupBy)) {
            this._groupBy = function (event) {
                return _underscore2["default"].map(options.groupBy, function (column) {
                    return "" + event.get(column);
                }).join("::");
            };
        } else if (_underscore2["default"].isString(options.groupBy)) {
            this._groupBy = function (event) {
                return "" + event.get(options.groupBy);
            };
        } else {
            throw Error("Unable to interpret groupBy argument passed to Grouper constructor");
        }
        this._observer = observer;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */

    _createClass(Grouper, [{
        key: "addEvent",
        value: function addEvent(event, cb) {
            if (this._observer) {
                this._observer(event.setKey(this._groupBy(event)));
            }
            if (cb) {
                cb(null);
            }
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }, {
        key: "done",
        value: function done() {
            return;
        }
    }]);

    return Grouper;
})();

exports["default"] = Grouper;
module.exports = exports["default"];