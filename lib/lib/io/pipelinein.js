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

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _observable = require("../base/observable");

var _observable2 = _interopRequireDefault(_observable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var PipelineIn = function (_Observable) {
    (0, _inherits3.default)(PipelineIn, _Observable);

    function PipelineIn() {
        (0, _classCallCheck3.default)(this, PipelineIn);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PipelineIn.__proto__ || (0, _getPrototypeOf2.default)(PipelineIn)).call(this));

        _this._id = _underscore2.default.uniqueId("in-");
        _this._type = null; // The type (class) of the events in this In
        return _this;
    }

    (0, _createClass3.default)(PipelineIn, [{
        key: "_check",
        value: function _check(e) {
            if (!this._type) {
                this._type = e.type();
            } else {
                if (!(e instanceof this._type)) {
                    throw new Error("Homogeneous events expected.");
                }
            }
        }
    }]);
    return PipelineIn;
}(_observable2.default);

exports.default = PipelineIn;