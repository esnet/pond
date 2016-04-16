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

var _event = require("./event");

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _pipeline = require("./pipeline");

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Converter = function (_Processor) {
    (0, _inherits3.default)(Converter, _Processor);

    function Converter(arg1, options, observer) {
        (0, _classCallCheck3.default)(this, Converter);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Converter).call(this, arg1, options, observer));

        if (arg1 instanceof Converter) {
            var other = arg1;
            _this._by = other._by;
            _this._fieldSpec = other._fieldSpec;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            if (!_underscore2.default.has(options, "type")) {
                throw new Error("Converter: constructor needs 'type' in options");
            }

            if (options.type === _event.Event || options.type === _event.TimeRangeEvent || options.type === _event.IndexedEvent) {
                _this._convertTo = options.type;
            } else {
                throw Error("Unable to interpret type argument passed to Converter constructor");
            }

            if (options.type === _event.TimeRangeEvent || options.type === _event.IndexedEvent) {
                if (options.duration && _underscore2.default.isString(options.duration)) {
                    _this._duration = _util2.default.windowDuration(options.duration);
                    _this._durationString = options.duration;
                }
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
            if (this._convertTo === _event.Event) {
                return event;
            } else if (this._convertTo === _event.TimeRangeEvent) {
                var alignment = this._alignment;
                var begin = void 0,
                    end = void 0;
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
                }
                var timeRange = new _range2.default([begin, end]);
                return new _event.TimeRangeEvent(timeRange, event.data(), event.key());
            } else if (this._convertTo === _event.IndexedEvent) {
                var timestamp = event.timestamp();
                var indexString = _index2.default.getIndexString(this._durationString, timestamp);
                return new _event.IndexedEvent(indexString, event.data(), null, event.key());
            }
        }
    }, {
        key: "convertTimeRangeEvent",
        value: function convertTimeRangeEvent(event) {
            if (this._convertTo === _event.TimeRangeEvent) {
                return event;
            }
            if (this._convertTo === _event.Event) {
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
                return new _event.Event(timestamp, event.data(), event.key());
            }
            if (this._convertTo === _event.IndexedEvent) {
                throw new Error("Cannot convert TimeRangeEvent to an IndexedEvent");
            }
        }
    }, {
        key: "convertIndexedEvent",
        value: function convertIndexedEvent(event) {
            if (this._convertTo === _event.IndexedEvent) {
                return event;
            }
            if (this._convertTo === _event.Event) {
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
                return new _event.Event(timestamp, event.data());
            }
            if (this._convertTo === _event.TimeRangeEvent) {
                return new _event.TimeRangeEvent(event.timerange(), event.data(), event.key());
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
                if (event instanceof _event.TimeRangeEvent) {
                    outputEvent = this.convertTimeRangeEvent(event);
                } else if (event instanceof _event.IndexedEvent) {
                    outputEvent = this.convertIndexedEvent(event);
                } else if (event instanceof _event.Event) {
                    outputEvent = this.convertEvent(event);
                } else {
                    throw new Error("Unknown event type received");
                }
                this.emit(outputEvent);
            }
        }
    }]);
    return Converter;
}(_processor2.default); /**
                         *  Copyright (c) 2016, The Regents of the University of California,
                         *  through Lawrence Berkeley National Laboratory (subject to receipt
                         *  of any required approvals from the U.S. Dept. of Energy).
                         *  All rights reserved.
                         *
                         *  This source code is licensed under the BSD-style license found in the
                         *  LICENSE file in the root directory of this source tree.
                         */

exports.default = Converter;