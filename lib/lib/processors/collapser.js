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
 * A processor which takes a fieldSpec and returns a new event
 * with a new column that is a collapsed result of the selected
 * columns. To collapse the columns it uses the supplied reducer
 * function. Optionally the new column can completely replace
 * the existing columns in the event.
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

var Collapser = function (_Processor) {
    (0, _inherits3.default)(Collapser, _Processor);

    function Collapser(arg1, options) {
        (0, _classCallCheck3.default)(this, Collapser);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Collapser.__proto__ || (0, _getPrototypeOf2.default)(Collapser)).call(this, arg1, options));

        if (arg1 instanceof Collapser) {
            var other = arg1;
            _this._fieldSpecList = other._fieldSpecList;
            _this._name = other._name;
            _this._reducer = other._reducer;
            _this._append = other._append;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            _this._fieldSpecList = options.fieldSpecList;
            _this._name = options.name;
            _this._reducer = options.reducer;
            _this._append = options.append;
        } else {
            throw new Error("Unknown arg to Collapser constructor", arg1);
        }
        return _this;
    }

    (0, _createClass3.default)(Collapser, [{
        key: "clone",
        value: function clone() {
            return new Collapser(this);
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {
                this.emit(event.collapse(this._fieldSpecList, this._name, this._reducer, this._append));
            }
        }
    }]);
    return Collapser;
}(_processor2.default);

exports.default = Collapser;