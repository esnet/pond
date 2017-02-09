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

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _index = require("../index");

var _index2 = _interopRequireDefault(_index);

var _pipeline = require("../pipeline");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A processor which takes an operator as its only option
 * and uses that to either output the event or skip the
 * event
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

var Taker = function (_Processor) {
    (0, _inherits3.default)(Taker, _Processor);

    function Taker(arg1, options) {
        (0, _classCallCheck3.default)(this, Taker);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Taker.__proto__ || (0, _getPrototypeOf2.default)(Taker)).call(this, arg1, options));

        if (arg1 instanceof Taker) {
            var other = arg1;
            _this._limit = other._limit;
            _this._windowType = other._windowType;
            _this._windowDuration = other._windowDuration;
            _this._groupBy = other._groupBy;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            var pipeline = arg1;
            _this._limit = options.limit;
            _this._windowType = pipeline.getWindowType();
            _this._windowDuration = pipeline.getWindowDuration();
            _this._groupBy = pipeline.getGroupBy();
        } else {
            throw new Error("Unknown arg to Taker constructor", arg1);
        }

        _this._count = {};
        return _this;
    }

    (0, _createClass3.default)(Taker, [{
        key: "clone",
        value: function clone() {
            return new Taker(this);
        }
    }, {
        key: "flush",
        value: function flush() {
            (0, _get3.default)(Taker.prototype.__proto__ || (0, _getPrototypeOf2.default)(Taker.prototype), "flush", this).call(this);
        }

        /**
         * Output an event that is offset
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {
                var timestamp = event.timestamp();

                var windowType = this._windowType;
                var windowKey = void 0;
                if (windowType === "fixed") {
                    windowKey = _index2.default.getIndexString(this._windowDuration, timestamp);
                } else {
                    windowKey = windowType;
                }
                var groupByKey = this._groupBy(event);
                var collectionKey = groupByKey ? windowKey + "::" + groupByKey : windowKey;

                if (!_underscore2.default.has(this._count, collectionKey)) {
                    this._count[collectionKey] = 0;
                }

                if (this._count[collectionKey] < this._limit) {
                    this.emit(event);
                }

                this._count[collectionKey]++;
            }
        }
    }]);
    return Taker;
}(_processor2.default);

exports.default = Taker;