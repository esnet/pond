"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

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

var _collector = require("../collector");

var _collector2 = _interopRequireDefault(_collector);

var _indexedevent = require("../indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _timerangeevent = require("../timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _pipeline = require("../pipeline");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * An Aggregator takes incoming events and adds them to a Collector
 * with given windowing and grouping parameters. As each Collection is
 * emitted from the Collector it is aggregated into a new event
 * and emitted from this Processor.
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

var Aggregator = function (_Processor) {
    (0, _inherits3.default)(Aggregator, _Processor);

    function Aggregator(arg1, options) {
        (0, _classCallCheck3.default)(this, Aggregator);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Aggregator.__proto__ || (0, _getPrototypeOf2.default)(Aggregator)).call(this, arg1, options));

        if (arg1 instanceof Aggregator) {
            var other = arg1;

            _this._fields = other._fields;
            _this._windowType = other._windowType;
            _this._windowDuration = other._windowDuration;
            _this._groupBy = other._groupBy;
            _this._emitOn = other._emitOn;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            var pipeline = arg1;

            _this._windowType = pipeline.getWindowType();
            _this._windowDuration = pipeline.getWindowDuration();
            _this._groupBy = pipeline.getGroupBy();
            _this._emitOn = pipeline.getEmitOn();

            if (!_underscore2.default.has(options, "fields")) {
                throw new Error("Aggregator: constructor needs an aggregator field mapping");
            }

            // Check each of the aggregator -> field mappings
            _underscore2.default.forEach(options.fields, function (operator, field) {
                // Field should either be an array or a string
                if (!_underscore2.default.isString(field) && !_underscore2.default.isArray(field)) {
                    throw new Error("Aggregator: field of unknown type: " + field);
                }
            });

            if (pipeline.mode() === "stream") {
                if (!pipeline.getWindowType() || !pipeline.getWindowDuration()) {
                    throw new Error("Unable to aggregate because no windowing strategy was specified in pipeline");
                }
            }
            _this._fields = options.fields;
        } else {
            throw new Error("Unknown arg to Filter constructor", arg1);
        }

        _this._collector = new _collector2.default({
            windowType: _this._windowType,
            windowDuration: _this._windowDuration,
            groupBy: _this._groupBy,
            emitOn: _this._emitOn
        }, function (collection, windowKey, groupByKey) {
            return _this.handleTrigger(collection, windowKey, groupByKey);
        });
        return _this;
    }

    (0, _createClass3.default)(Aggregator, [{
        key: "clone",
        value: function clone() {
            return new Aggregator(this);
        }
    }, {
        key: "handleTrigger",
        value: function handleTrigger(collection, windowKey) {
            var d = {};
            _underscore2.default.each(this._fields, function (f, fieldName) {
                var keys = (0, _keys2.default)(f);
                if (keys.length !== 1) {
                    throw new Error("Fields should contain exactly one field", f);
                }
                var field = keys[0];
                var operator = f[field];

                d[fieldName] = collection.aggregate(operator, field);
            });

            var event = void 0;
            if (windowKey === "global") {
                event = new _timerangeevent2.default(collection.range(), d);
            } else {
                //TODO: Specify UTC (or local) pipeline
                var utc = this._windowType === "fixed";
                event = new _indexedevent2.default(windowKey, d, utc);
            }

            this.emit(event);
        }
    }, {
        key: "flush",
        value: function flush() {
            this._collector.flushCollections();
            (0, _get3.default)(Aggregator.prototype.__proto__ || (0, _getPrototypeOf2.default)(Aggregator.prototype), "flush", this).call(this);
        }
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {
                this._collector.addEvent(event);
            }
        }
    }]);
    return Aggregator;
}(_processor2.default);

exports.default = Aggregator;