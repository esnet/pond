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

var _get2 = require("babel-runtime/helpers/get");

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _observable = require("../base/observable");

var _observable2 = _interopRequireDefault(_observable);

var _pipeline = require("../pipeline");

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

function addPrevToChain(n, chain) {
    chain.push(n);
    if ((0, _pipeline.isPipeline)(n.prev())) {
        chain.push(n.prev().in());
        return chain;
    } else {
        return addPrevToChain(n.prev(), chain);
    }
}

/**
 * Base class for all Pipeline processors
 */

var Processor = function (_Observable) {
    (0, _inherits3.default)(Processor, _Observable);

    function Processor(arg1, options) {
        (0, _classCallCheck3.default)(this, Processor);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Processor.__proto__ || (0, _getPrototypeOf2.default)(Processor)).call(this));

        if ((0, _pipeline.isPipeline)(arg1)) {
            _this._pipeline = arg1;
            _this._prev = options.prev;
        }
        return _this;
    }

    (0, _createClass3.default)(Processor, [{
        key: "prev",
        value: function prev() {
            return this._prev;
        }
    }, {
        key: "pipeline",
        value: function pipeline() {
            return this._pipeline;
        }
    }, {
        key: "chain",
        value: function chain() {
            var chain = [this];
            if ((0, _pipeline.isPipeline)(this.prev())) {
                chain.push(this.prev().in());
                return chain;
            } else {
                return addPrevToChain(this.prev(), chain);
            }
        }
    }, {
        key: "flush",
        value: function flush() {
            (0, _get3.default)(Processor.prototype.__proto__ || (0, _getPrototypeOf2.default)(Processor.prototype), "flush", this).call(this);
        }
    }]);
    return Processor;
}(_observable2.default);

exports.default = Processor;