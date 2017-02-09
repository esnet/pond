"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _event = require("../event");

var _event2 = _interopRequireDefault(_event);

var _pipeline = require("../pipeline");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A processor which takes a fieldSpec as its only argument
 * and returns a new event with only those selected columns
 */
var Selector = function (_Processor) {
    (0, _inherits3.default)(Selector, _Processor);

    function Selector(arg1, options) {
        (0, _classCallCheck3.default)(this, Selector);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Selector.__proto__ || (0, _getPrototypeOf2.default)(Selector)).call(this, arg1, options));

        if (arg1 instanceof Selector) {
            var other = arg1;
            _this._fieldSpec = other._fieldSpec;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            _this._fieldSpec = options.fieldSpec;
        } else {
            throw new Error("Unknown arg to filter constructor", arg1);
        }
        return _this;
    }

    (0, _createClass3.default)(Selector, [{
        key: "clone",
        value: function clone() {
            return new Selector(this);
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {
                this.emit(_event2.default.selector(event, this._fieldSpec));
            }
        }
    }]);
    return Selector;
}(_processor2.default); /**
                         *  Copyright (c) 2016-2017, The Regents of the University of California,
                         *  through Lawrence Berkeley National Laboratory (subject to receipt
                         *  of any required approvals from the U.S. Dept. of Energy).
                         *  All rights reserved.
                         *
                         *  This source code is licensed under the BSD-style license found in the
                         *  LICENSE file in the root directory of this source tree.
                         */

exports.default = Selector;