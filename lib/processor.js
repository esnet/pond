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

var _observable = require("./observable");

var _observable2 = _interopRequireDefault(_observable);

var _pipeline = require("./pipeline");

function addPrevToChain(_x, _x2) {
    var _again = true;

    _function: while (_again) {
        var n = _x,
            chain = _x2;
        _again = false;

        chain.push(n);
        if ((0, _pipeline.isPipeline)(n.prev())) {
            chain.push(n.prev()._in);
            return chain;
        } else {
            _x = n.prev();
            _x2 = chain;
            _again = true;
            continue _function;
        }
    }
}

var Processor = (function (_Observable) {
    _inherits(Processor, _Observable);

    function Processor(arg1, options) {
        _classCallCheck(this, Processor);

        _get(Object.getPrototypeOf(Processor.prototype), "constructor", this).call(this);

        if ((0, _pipeline.isPipeline)(arg1)) {
            this._pipeline = arg1;
            this._prev = options.prev;
        }
    }

    _createClass(Processor, [{
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
            return addPrevToChain(this.prev(), chain);
        }
    }, {
        key: "flush",
        value: function flush() {
            _get(Object.getPrototypeOf(Processor.prototype), "flush", this).call(this);
        }
    }]);

    return Processor;
})(_observable2["default"]);

exports["default"] = Processor;
module.exports = exports["default"];