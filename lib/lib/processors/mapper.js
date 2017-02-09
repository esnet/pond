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

var _pipeline = require("../pipeline");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A processor which takes an operator as its only option
 * and uses that to either output a new event
 */
/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var Mapper = function (_Processor) {
    (0, _inherits3.default)(Mapper, _Processor);

    function Mapper(arg1, options) {
        (0, _classCallCheck3.default)(this, Mapper);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Mapper.__proto__ || (0, _getPrototypeOf2.default)(Mapper)).call(this, arg1, options));

        if (arg1 instanceof Mapper) {
            var other = arg1;
            _this._op = other._op;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            _this._op = options.op;
        } else {
            throw new Error("Unknown arg to Mapper constructor", arg1);
        }
        return _this;
    }

    (0, _createClass3.default)(Mapper, [{
        key: "clone",
        value: function clone() {
            return new Mapper(this);
        }

        /**
         * Output an event that is remapped
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {
                this.emit(this._op(event));
            }
        }
    }]);
    return Mapper;
}(_processor2.default);

exports.default = Mapper;