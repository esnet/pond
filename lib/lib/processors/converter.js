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

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _index = require("../index");

var _index2 = _interopRequireDefault(_index);

var _timeevent = require("../timeevent");

var _timeevent2 = _interopRequireDefault(_timeevent);

var _indexedevent = require("../indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _timerange = require("../timerange");

var _timerange2 = _interopRequireDefault(_timerange);

var _timerangeevent = require("../timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _pipeline = require("../pipeline");

var _util = require("../base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isSubclass(Base, X) {
    return Base === X || X.prototype === Base;
} /**
   *  Copyright (c) 2016-2017, The Regents of the University of California,
   *  through Lawrence Berkeley National Laboratory (subject to receipt
   *  of any required approvals from the U.S. Dept. of Energy).
   *  All rights reserved.
   *
   *  This source code is licensed under the BSD-style license found in the
   *  LICENSE file in the root directory of this source tree.
   */

var Converter = function (_Processor) {
    (0, _inherits3.default)(Converter, _Processor);

    function Converter(arg1, options) {
        (0, _classCallCheck3.default)(this, Converter);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Converter.__proto__ || (0, _getPrototypeOf2.default)(Converter)).call(this, arg1, options));

        if (arg1 instanceof Converter) {
            var other = arg1;
            _this._convertTo = other._convertTo;
            _this._duration = other._duration;
            _this._durationString = other._durationString;
            _this._alignment = other._alignment;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            if (!_underscore2.default.has(options, "type")) {
                throw new Error("Converter: constructor needs 'type' in options");
            }
            if (isSubclass(_timeevent2.default, options.type)) {
                _this._convertTo = options.type;
            } else if (isSubclass(_timerangeevent2.default, options.type) || isSubclass(_indexedevent2.default, options.type)) {
                _this._convertTo = options.type;
                if (options.duration && _underscore2.default.isString(options.duration)) {
                    _this._duration = _util2.default.windowDuration(options.duration);
                    _this._durationString = options.duration;
                }
            } else {
                throw Error("Unable to interpret type argument passed to Converter constructor");
            }
            _this._alignment = options.alignment || "center";
        } else {
            throw new Error("Unknown arg to Converter constructor", arg1);
        }
        return _this;
    }

    (0, _createClass3.default)(Converter, [{
        key: "clone",
        value: function clone() {
            return new Converter(this);
        }
    }, {
        key: "convertEvent",
        value: function convertEvent(event) {
            var T = this._convertTo;
            if (isSubclass(_timeevent2.default, T)) {
                return event;
            } else if (isSubclass(_timerangeevent2.default, T)) {
                var alignment = this._alignment;
                var begin = void 0,
                    end = void 0;
                if (!this._duration) {
                    throw new Error("Duration expected in converter");
                }
                switch (alignment) {
                    case "front":
                        begin = event.timestamp();
                        end = new Date(+event.timestamp() + this._duration);
                        break;
                    case "center":
                        begin = new Date(+event.timestamp() - parseInt(this._duration / 2, 10));
                        end = new Date(+event.timestamp() + parseInt(this._duration / 2, 10));
                        break;
                    case "behind":
                        end = event.timestamp();
                        begin = new Date(+event.timestamp() - this._duration);
                        break;
                    default:
                        throw new Error("Unknown alignment of converter");
                }
                var timeRange = new _timerange2.default([begin, end]);
                return new T(timeRange, event.data());
            } else if (isSubclass(_indexedevent2.default, T)) {
                var timestamp = event.timestamp();
                var indexString = _index2.default.getIndexString(this._durationString, timestamp);
                return new this._convertTo(indexString, event.data(), null);
            }
        }
    }, {
        key: "convertTimeRangeEvent",
        value: function convertTimeRangeEvent(event) {
            var T = this._convertTo;
            if (isSubclass(_timerangeevent2.default, T)) {
                return event;
            }
            if (isSubclass(_timeevent2.default, T)) {
                var alignment = this._alignment;
                var beginTime = event.begin();
                var endTime = event.end();
                var timestamp = void 0;
                switch (alignment) {
                    case "lag":
                        timestamp = beginTime;
                        break;
                    case "center":
                        timestamp = new Date(parseInt((beginTime.getTime() + endTime.getTime()) / 2, 10));
                        break;
                    case "lead":
                        timestamp = endTime;
                        break;
                }
                return new T(timestamp, event.data());
            }
            if (isSubclass(_indexedevent2.default, T)) {
                throw new Error("Cannot convert TimeRangeEvent to an IndexedEvent");
            }
        }
    }, {
        key: "convertIndexedEvent",
        value: function convertIndexedEvent(event) {
            var T = this._convertTo;
            if (isSubclass(_indexedevent2.default, T)) {
                return event;
            }
            if (isSubclass(_timeevent2.default, T)) {
                var alignment = this._alignment;
                var beginTime = event.begin();
                var endTime = event.end();
                var timestamp = void 0;
                switch (alignment) {
                    case "lag":
                        timestamp = beginTime;
                        break;
                    case "center":
                        timestamp = new Date(parseInt((beginTime.getTime() + endTime.getTime()) / 2, 10));
                        break;
                    case "lead":
                        timestamp = endTime;
                        break;
                }
                return new T(timestamp, event.data());
            }
            if (isSubclass(_timerangeevent2.default, T)) {
                return new T(event.timerange(), event.data());
            }
        }

        /**
         * Output a converted event
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {
                var outputEvent = void 0;
                if (event instanceof _timerangeevent2.default) {
                    outputEvent = this.convertTimeRangeEvent(event);
                } else if (event instanceof _indexedevent2.default) {
                    outputEvent = this.convertIndexedEvent(event);
                } else if (event instanceof _timeevent2.default) {
                    outputEvent = this.convertEvent(event);
                } else {
                    throw new Error("Unknown event type received");
                }
                this.emit(outputEvent);
            }
        }
    }]);
    return Converter;
}(_processor2.default);

exports.default = Converter;