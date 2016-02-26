/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _event = require("./event");

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var Converter = (function () {

    /**
     * `groupBy` may be either:
     *     * A function which takes an event and returns a string as a key
     *     * A string, which corresponds to a column in the event, like "name"
     *     * A list, which corresponds to a list of columns to join together for the key
     * `observer` is the callback that will receive the emitted events
     */

    function Converter(options, observer) {
        _classCallCheck(this, Converter);

        if (!_underscore2["default"].has(options, "type")) {
            throw new Error("Converter: constructor needs 'type' in options");
        }
        if (options.type === _event.Event || options.type === _event.TimeRangeEvent || options.type === _event.IndexedEvent) {
            this._convertTo = options.type;
        } else {
            throw Error("Unable to interpret type argument passed to Converter constructor");
        }
        if (options.type === _event.TimeRangeEvent || options.type === _event.IndexedEvent) {
            if (options.duration && _underscore2["default"].isString(options.duration)) {
                this._duration = _util2["default"].windowDuration(options.duration);
                this._durationString = options.duration;
            }
        }
        this._alignment = options.alignment || "center";
        this._observer = observer;
    }

    _createClass(Converter, [{
        key: "convertEvent",
        value: function convertEvent(event) {
            if (this._convertTo === _event.Event) {
                return event;
            } else if (this._convertTo === _event.TimeRangeEvent) {
                var alignment = this._alignment;
                var begin = undefined,
                    end = undefined;
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
                var timeRange = new _range2["default"]([begin, end]);
                return new _event.TimeRangeEvent(timeRange, event.data(), event.key());
            } else if (this._convertTo === _event.IndexedEvent) {
                var timestamp = event.timestamp();
                var indexString = _index2["default"].getIndexString(this._durationString, timestamp);
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
                var timestamp = undefined;
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
                var timestamp = undefined;
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
            if (this._convertTo === _event.TimeRangeEvent) {
                return new _event.TimeRangeEvent(event.timerange(), event.data(), event.key());
            }
        }

        /**
         * Add an event will add a key to the event and then emit the
         * event with that key.
         */
    }, {
        key: "addEvent",
        value: function addEvent(event, cb) {
            if (this._observer) {
                var out = undefined;
                if (event instanceof _event.TimeRangeEvent) {
                    out = this.convertTimeRangeEvent(event);
                } else if (event instanceof _event.IndexedEvent) {
                    out = this.convertIndexedEvent(event);
                } else if (event instanceof _event.Event) {
                    out = this.convertEvent(event);
                }
                this._observer(out);
            }
            if (cb) {
                cb(null);
            }
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }, {
        key: "done",
        value: function done() {
            return;
        }
    }]);

    return Converter;
})();

exports["default"] = Converter;
module.exports = exports["default"];