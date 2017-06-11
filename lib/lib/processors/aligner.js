"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _isInteger = require("babel-runtime/core-js/number/is-integer");

var _isInteger2 = _interopRequireDefault(_isInteger);

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

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _index = require("../index");

var _index2 = _interopRequireDefault(_index);

var _indexedevent = require("../indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _timeevent = require("../timeevent");

var _timeevent2 = _interopRequireDefault(_timeevent);

var _timerange = require("../timerange");

var _timerange2 = _interopRequireDefault(_timerange);

var _timerangeevent = require("../timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _pipeline = require("../pipeline");

var _util = require("../base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A processor to align the data into bins of regular time period.
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

/*eslint no-console: 0 */

var Aligner = function (_Processor) {
    (0, _inherits3.default)(Aligner, _Processor);

    function Aligner(arg1, options) {
        (0, _classCallCheck3.default)(this, Aligner);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Aligner.__proto__ || (0, _getPrototypeOf2.default)(Aligner)).call(this, arg1, options));

        if (arg1 instanceof Aligner) {
            var other = arg1;
            _this._fieldSpec = other._fieldSpec;
            _this._window = other._window;
            _this._method = other._method;
            _this._limit = other._limit;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            var fieldSpec = options.fieldSpec,
                window = options.window,
                _options$method = options.method,
                method = _options$method === undefined ? "hold" : _options$method,
                _options$limit = options.limit,
                limit = _options$limit === undefined ? null : _options$limit;


            _this._fieldSpec = fieldSpec;
            _this._window = window;
            _this._method = method;
            _this._limit = limit;
        } else {
            throw new Error("Unknown arg to Aligner constructor", arg1);
        }

        //
        // Internal members
        //
        _this._previous = null;

        // work out field specs
        if (_underscore2.default.isString(_this._fieldSpec)) {
            _this._fieldSpec = [_this._fieldSpec];
        }

        // check input of method
        if (!_underscore2.default.contains(["linear", "hold"], _this._method)) {
            throw new Error("Unknown method '" + _this._method + "' passed to Aligner");
        }

        // check limit
        if (_this._limit && !(0, _isInteger2.default)(_this._limit)) {
            throw new Error("Limit passed to Aligner is not an integer");
        }
        return _this;
    }

    (0, _createClass3.default)(Aligner, [{
        key: "clone",
        value: function clone() {
            return new Aligner(this);
        }

        /**
         * Test to see if an event is perfectly aligned. Used on first event.
         */

    }, {
        key: "isAligned",
        value: function isAligned(event) {
            var bound = _index2.default.getIndexString(this._window, event.timestamp());
            return this.getBoundaryTime(bound) === event.timestamp().getTime();
        }

        /**
         * Returns a list of indexes of window boundaries if the current
         * event and the previous event do not lie in the same window. If
         * they are in the same window, return an empty list.
         */

    }, {
        key: "getBoundaries",
        value: function getBoundaries(event) {
            var prevIndex = _index2.default.getIndexString(this._window, this._previous.timestamp());
            var currentIndex = _index2.default.getIndexString(this._window, event.timestamp());
            if (prevIndex !== currentIndex) {
                var range = new _timerange2.default(this._previous.timestamp(), event.timestamp());
                return _index2.default.getIndexStringList(this._window, range).slice(1);
            } else {
                return [];
            }
        }

        /**
         * We are dealing in UTC only with the Index because the events
         * all have internal timestamps in UTC and that's what we're
         * aligning. Let the user display in local time if that's
         * what they want.
         */

    }, {
        key: "getBoundaryTime",
        value: function getBoundaryTime(boundaryIndex) {
            var index = new _index2.default(boundaryIndex);
            return index.begin().getTime();
        }

        /**
         * Generate a new event on the requested boundary and carry over the
         * value from the previous event.
         *
         * A variation just sets the values to null, this is used when the
         * limit is hit.
         */

    }, {
        key: "interpolateHold",
        value: function interpolateHold(boundary) {
            var _this2 = this;

            var setNone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var d = new _immutable2.default.Map();
            var t = this.getBoundaryTime(boundary);
            this._fieldSpec.forEach(function (path) {
                var fieldPath = _util2.default.fieldPathToArray(path);
                if (!setNone) {
                    d = d.setIn(fieldPath, _this2._previous.get(fieldPath));
                } else {
                    d = d.setIn(fieldPath, null);
                }
            });
            return new _timeevent2.default(t, d);
        }

        /**
          * Generate a linear differential between two counter values that lie
          * on either side of a window boundary.
          */

    }, {
        key: "interpolateLinear",
        value: function interpolateLinear(boundary, event) {
            var _this3 = this;

            var d = new _immutable2.default.Map();

            var previousTime = this._previous.timestamp().getTime();
            var boundaryTime = this.getBoundaryTime(boundary);
            var currentTime = event.timestamp().getTime();

            // This ratio will be the same for all values being processed
            var f = (boundaryTime - previousTime) / (currentTime - previousTime);

            this._fieldSpec.forEach(function (path) {
                var fieldPath = _util2.default.fieldPathToArray(path);

                //
                // Generate the delta beteen the values and
                // bulletproof against non-numeric or bad paths
                //
                var previousVal = _this3._previous.get(fieldPath);
                var currentVal = event.get(fieldPath);

                var interpolatedVal = null;
                if (!_underscore2.default.isNumber(previousVal) || !_underscore2.default.isNumber(currentVal)) {
                    console.warn("Path " + fieldPath + " contains a non-numeric value or does not exist");
                } else {
                    interpolatedVal = previousVal + f * (currentVal - previousVal);
                }
                d = d.setIn(fieldPath, interpolatedVal);
            });

            return new _timeevent2.default(boundaryTime, d);
        }

        /**
         * Perform the fill operation on the event and emit.
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            var _this4 = this;

            if (event instanceof _timerangeevent2.default || event instanceof _indexedevent2.default) {
                throw new Error("TimeRangeEvent and IndexedEvent series can not be aligned.");
            }

            if (this.hasObservers()) {
                if (!this._previous) {
                    this._previous = event;
                    if (this.isAligned(event)) {
                        this.emit(event);
                    }
                    return;
                }

                var boundaries = this.getBoundaries(event);

                //
                // If the returned list is not empty, interpolate an event
                // on each of the boundaries and emit them
                //
                var count = boundaries.length;
                boundaries.forEach(function (boundary) {
                    var outputEvent = void 0;
                    if (_this4._limit && count > _this4._limit) {
                        outputEvent = _this4.interpolateHold(boundary, true);
                    } else {
                        if (_this4._method === "linear") {
                            outputEvent = _this4.interpolateLinear(boundary, event);
                        } else {
                            outputEvent = _this4.interpolateHold(boundary);
                        }
                    }
                    _this4.emit(outputEvent);
                });

                //
                // The current event now becomes the previous event
                //
                this._previous = event;
            }
        }
    }]);
    return Aligner;
}(_processor2.default);

exports.default = Aligner;