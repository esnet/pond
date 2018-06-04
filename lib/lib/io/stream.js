"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

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

var Stream = function (_PipelineIn) {
    (0, _inherits3.default)(Stream, _PipelineIn);

    function Stream() {
        (0, _classCallCheck3.default)(this, Stream);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Stream.__proto__ || (0, _getPrototypeOf2.default)(Stream)).call(this));

        _this._running = true;
        return _this;
    }

    /**
     * Start listening to events
     */


    (0, _createClass3.default)(Stream, [{
        key: "start",
        value: function start() {
            this._running = true;
        }

        /**
         * Stop listening to events
         */

    }, {
        key: "stop",
        value: function stop() {
            this._running = false;
            this.flush(); // emit a flush to let processors cleanly exit.
        }

        /**
         * Add an incoming event to the source
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            this._check(event);
            if (this.hasObservers() && this._running) {
                this.emit(event);
            }
        }
    }, {
        key: "events",
        value: /*#__PURE__*/_regenerator2.default.mark(function events() {
            return _regenerator2.default.wrap(function events$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            throw new Error("Iteration across unbounded sources is not supported.");

                        case 1:
                        case "end":
                            return _context.stop();
                    }
                }
            }, events, this);
        })
    }]);
    return Stream;
}(_pipelinein2.default); /**
                          *  Copyright (c) 2016-2017, The Regents of the University of California,
                          *  through Lawrence Berkeley National Laboratory (subject to receipt
                          *  of any required approvals from the U.S. Dept. of Energy).
                          *  All rights reserved.
                          *
                          *  This source code is licensed under the BSD-style license found in the
                          *  LICENSE file in the root directory of this source tree.
                          */

exports.default = Stream;