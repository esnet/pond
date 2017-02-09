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

var _collector = require("../collector");

var _collector2 = _interopRequireDefault(_collector);

var _pipelineout = require("./pipelineout");

var _pipelineout2 = _interopRequireDefault(_pipelineout);

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

var CollectionOut = function (_PipelineOut) {
    (0, _inherits3.default)(CollectionOut, _PipelineOut);

    function CollectionOut(pipeline, options, callback) {
        (0, _classCallCheck3.default)(this, CollectionOut);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CollectionOut.__proto__ || (0, _getPrototypeOf2.default)(CollectionOut)).call(this, pipeline));

        _this._callback = callback;
        _this._collector = new _collector2.default({
            windowType: pipeline.getWindowType(),
            windowDuration: pipeline.getWindowDuration(),
            groupBy: pipeline.getGroupBy(),
            emitOn: pipeline.getEmitOn()
        }, function (collection, windowKey, groupByKey) {
            var groupBy = groupByKey ? groupByKey : "all";
            if (_this._callback) {
                _this._callback(collection, windowKey, groupBy);
            } else {
                var keys = [];
                if (windowKey !== "global") {
                    keys.push(windowKey);
                }
                if (groupBy !== "all") {
                    keys.push(groupBy);
                }
                var k = keys.length > 0 ? keys.join("--") : "all";
                _this._pipeline.addResult(k, collection);
            }
        });
        return _this;
    }

    (0, _createClass3.default)(CollectionOut, [{
        key: "addEvent",
        value: function addEvent(event) {
            this._collector.addEvent(event);
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._callback = cb;
        }
    }, {
        key: "flush",
        value: function flush() {
            this._collector.flushCollections();
            if (!this._callback) {
                this._pipeline.resultsDone();
            }
        }
    }]);
    return CollectionOut;
}(_pipelineout2.default);

exports.default = CollectionOut;