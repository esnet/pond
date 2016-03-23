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

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _event = require("./event");

var _pipeline = require("./pipeline");

/**
 * A simple processor used by the testing code to verify Pipeline behavior
 */

var Offset = (function (_Processor) {
    _inherits(Offset, _Processor);

    function Offset(arg1, options, observer) {
        _classCallCheck(this, Offset);

        _get(Object.getPrototypeOf(Offset.prototype), "constructor", this).call(this, arg1, options, observer);

        if (arg1 instanceof Offset) {
            var other = arg1;
            this._by = other._by;
            this._fieldSpec = other._fieldSpec;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            this._by = options.by || 1;
            this._fieldSpec = options.fieldSpec;
        } else {
            throw new Error("Unknown arg to Offset constructor", arg1);
        }
    }

    _createClass(Offset, [{
        key: "clone",
        value: function clone() {
            return new Offset(this);
        }

        /**
         * Add an event will add a key to the event and then emit the
         * event with that key.
         */
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            var _this = this;

            if (this.hasObservers()) {
                (function () {
                    var selected = _event.Event.selector(event, _this._fieldSpec);
                    var data = {};
                    _underscore2["default"].each(selected.data().toJSON(), function (value, key) {
                        var offsetValue = value + _this._by;
                        data[key] = offsetValue;
                    });
                    var outputEvent = event.setData(data);

                    _this.emit(outputEvent);
                })();
            }
        }
    }]);

    return Offset;
})(_processor2["default"]);

exports["default"] = Offset;
module.exports = exports["default"];