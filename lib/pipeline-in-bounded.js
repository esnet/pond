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

var _pipelineIn = require("./pipeline-in");

var _pipelineIn2 = _interopRequireDefault(_pipelineIn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BoundedIn = function (_PipelineIn) {
    (0, _inherits3.default)(BoundedIn, _PipelineIn);

    function BoundedIn() {
        (0, _classCallCheck3.default)(this, BoundedIn);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BoundedIn).call(this));
    }

    (0, _createClass3.default)(BoundedIn, [{
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
    return BoundedIn;
}(_pipelineIn2.default); /**
                          *  Copyright (c) 2016, The Regents of the University of California,
                          *  through Lawrence Berkeley National Laboratory (subject to receipt
                          *  of any required approvals from the U.S. Dept. of Energy).
                          *  All rights reserved.
                          *
                          *  This source code is licensed under the BSD-style license found in the
                          *  LICENSE file in the root directory of this source tree.
                          */

exports.default = BoundedIn;