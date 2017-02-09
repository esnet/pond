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

var _pipelinein = require("./pipelinein");

var _pipelinein2 = _interopRequireDefault(_pipelinein);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bounded = function (_PipelineIn) {
    (0, _inherits3.default)(Bounded, _PipelineIn);

    function Bounded() {
        (0, _classCallCheck3.default)(this, Bounded);
        return (0, _possibleConstructorReturn3.default)(this, (Bounded.__proto__ || (0, _getPrototypeOf2.default)(Bounded)).call(this));
    }

    (0, _createClass3.default)(Bounded, [{
        key: "start",
        value: function start() {
            throw new Error("start() not supported on bounded source.");
        }
    }, {
        key: "stop",
        value: function stop() {
            throw new Error("stop() not supported on bounded source.");
        }
    }, {
        key: "onEmit",
        value: function onEmit() {
            throw new Error("You can not setup a listener to a bounded source.");
        }
    }]);
    return Bounded;
}(_pipelinein2.default); /**
                          *  Copyright (c) 2016-2017, The Regents of the University of California,
                          *  through Lawrence Berkeley National Laboratory (subject to receipt
                          *  of any required approvals from the U.S. Dept. of Energy).
                          *  All rights reserved.
                          *
                          *  This source code is licensed under the BSD-style license found in the
                          *  LICENSE file in the root directory of this source tree.
                          */

exports.default = Bounded;