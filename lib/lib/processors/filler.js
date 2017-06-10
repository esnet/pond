"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _pipeline = require("../pipeline");

var _util = require("../base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A processor that fills missing/invalid values in the event with
 * new values (zero, interpolated or padded).
 *
 * When doing a linear fill, Filler instances should be chained.
 *
 * If no fieldSpec is supplied, the default field "value" will be used.
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

var Filler = function (_Processor) {
    (0, _inherits3.default)(Filler, _Processor);

    function Filler(arg1, options) {
        (0, _classCallCheck3.default)(this, Filler);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Filler.__proto__ || (0, _getPrototypeOf2.default)(Filler)).call(this, arg1, options));

        if (arg1 instanceof Filler) {
            var other = arg1;
            _this._fieldSpec = other._fieldSpec;
            _this._method = other._method;
            _this._limit = other._limit;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            var _options$fieldSpec = options.fieldSpec,
                fieldSpec = _options$fieldSpec === undefined ? null : _options$fieldSpec,
                _options$method = options.method,
                method = _options$method === undefined ? "zero" : _options$method,
                _options$limit = options.limit,
                limit = _options$limit === undefined ? null : _options$limit;

            _this._fieldSpec = fieldSpec;
            _this._method = method;
            _this._limit = limit;
        } else {
            throw new Error("Unknown arg to Filler constructor", arg1);
        }

        //
        // Internal members
        //
        // state for pad to refer to previous event
        _this._previousEvent = null;

        // key count for zero and pad fill
        _this._keyCount = {};

        // special state for linear fill
        _this._lastGoodLinear = null;

        // cache of events pending linear fill
        _this._linearFillCache = [];

        //
        // Sanity checks
        //
        if (!_underscore2.default.contains(["zero", "pad", "linear"], _this._method)) {
            throw new Error("Unknown method " + _this._method + " passed to Filler");
        }

        if (_this._limit && !_underscore2.default.isNumber(_this._limit)) {
            throw new Error("Limit supplied to fill() should be a number");
        }

        if (_underscore2.default.isString(_this._fieldSpec)) {
            _this._fieldSpec = [_this._fieldSpec];
        } else if (_underscore2.default.isNull(_this._fieldSpec)) {
            _this._fieldSpec = ["value"];
        }

        // Special case: when using linear mode, only a single
        // column will be processed per instance
        if (_this._method === "linear" && _this._fieldSpec.length > 1) {
            throw new Error("Linear fill takes a path to a single column");
        }
        return _this;
    }

    (0, _createClass3.default)(Filler, [{
        key: "clone",
        value: function clone() {
            return new Filler(this);
        }

        /**
         * Process and fill the values at the paths as apropos when the fill
         * method is either pad or zero.
         */

    }, {
        key: "constFill",
        value: function constFill(data) {
            var newData = data;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this._fieldSpec), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var path = _step.value;

                    var fieldPath = _util2.default.fieldPathToArray(path);
                    var pathKey = fieldPath.join(":");

                    //initialize a counter for this column
                    if (!_underscore2.default.has(this._keyCount, pathKey)) {
                        this._keyCount[pathKey] = 0;
                    }

                    // this is pointing at a path that does not exist
                    if (!newData.hasIn(fieldPath)) {
                        continue;
                    }

                    // Get the next value using the fieldPath
                    var val = newData.getIn(fieldPath);

                    if (_util2.default.isMissing(val)) {
                        // Have we hit the limit?
                        if (this._limit && this._keyCount[pathKey] >= this._limit) {
                            continue;
                        }

                        if (this._method === "zero") {
                            // set to zero
                            newData = newData.setIn(fieldPath, 0);
                            this._keyCount[pathKey]++;
                        } else if (this._method === "pad") {
                            // set to previous value
                            if (!_underscore2.default.isNull(this._previousEvent)) {
                                var prevVal = this._previousEvent.data().getIn(fieldPath);

                                if (!_util2.default.isMissing(prevVal)) {
                                    newData = newData.setIn(fieldPath, prevVal);
                                    this._keyCount[pathKey]++;
                                }
                            }
                        } else if (this._method === "linear") {
                            //noop
                        }
                    } else {
                        this._keyCount[pathKey] = 0;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return newData;
        }

        /**
         * Check to see if an event has good values when doing
         * linear fill since we need to keep a completely intact
         * event for the values.
         * While we are inspecting the data payload, make a note if
         * any of the paths are pointing at a list. Then it
         * will trigger that filling code later.
         */

    }, {
        key: "isValidLinearEvent",
        value: function isValidLinearEvent(event) {
            var valid = true;
            var fieldPath = _util2.default.fieldPathToArray(this._fieldSpec[0]);

            // Detect path that doesn't exist
            if (!event.data().hasIn(fieldPath)) {
                console.warn("path does not exist: " + fieldPath);
                return valid;
            }

            var val = event.data().getIn(fieldPath);

            // Detect if missing or not a number
            if (_util2.default.isMissing(val) || !_underscore2.default.isNumber(val)) {
                valid = false;
            }
            return valid;
        }

        /**
         * This handles the linear filling. It returns a list of
         * zero or more events to be emitted.
         *
         * If an event is valid - it has valid values for all of
         * the field paths - it is cached as "last good" and
         * returned to be emitted. The return value is then a list
         * of one event.
         *
         * If an event has invalid values, it is cached to be
         * processed later and an empty list is returned.
         *
         * Additional invalid events will continue to be cached until
         * a new valid value is seen, then the cached events will
         * be filled and returned. That will be a list of indeterminate
         * length.
         */

    }, {
        key: "linearFill",
        value: function linearFill(event) {
            var _this2 = this;

            // See if the event is valid and also if it has any
            // list values to be filled.
            var isValidEvent = this.isValidLinearEvent(event);

            var events = [];
            if (isValidEvent && !this._linearFillCache.length) {
                // Valid event, no cached events, use as last good val
                this._lastGoodLinear = event;
                events.push(event);
            } else if (!isValidEvent && !_underscore2.default.isNull(this._lastGoodLinear)) {
                this._linearFillCache.push(event);

                // Check limit
                if (!_underscore2.default.isNull(this._limit) && this._linearFillCache.length >= this._limit) {
                    // Flush the cache now because limit is reached
                    this._linearFillCache.forEach(function (e) {
                        _this2.emit(e);
                    });

                    // Reset
                    this._linearFillCache = [];
                    this._lastGoodLinear = null;
                }
            } else if (!isValidEvent && _underscore2.default.isNull(this._lastGoodLinear)) {
                //
                // An invalid event but we have not seen a good
                // event yet so there is nothing to start filling "from"
                // so just return and live with it.
                //
                events.push(event);
            } else if (isValidEvent && this._linearFillCache) {
                // Linear interpolation between last good and this event
                var eventList = [this._lastGoodLinear].concat((0, _toConsumableArray3.default)(this._linearFillCache), [event]);
                var interpolatedEvents = this.interpolateEventList(eventList);

                //
                // The first event in the returned list from interpolatedEvents
                // is our last good event. This event has already been emitted so
                // it is sliced off.
                //
                interpolatedEvents.slice(1).forEach(function (e) {
                    events.push(e);
                });

                // Reset
                this._linearFillCache = [];
                this._lastGoodLinear = event;
            }

            return events;
        }

        /**
         * The fundamental linear interpolation workhorse code.  Process
         * a list of events and return a new list. Does a pass for
         * every fieldSpec.
         *
         * This is abstracted out like this because we probably want
         * to interpolate a list of events not tied to a Collection.
         * A Pipeline result list, etc etc.
         *
        **/

    }, {
        key: "interpolateEventList",
        value: function interpolateEventList(events) {
            var prevValue = void 0;
            var prevTime = void 0;

            // new array of interpolated events for each field path
            var newEvents = [];

            var fieldPath = _util2.default.fieldPathToArray(this._fieldSpec[0]);

            // setup done, loop through the events
            for (var i = 0; i < events.length; i++) {
                var e = events[i];

                // Can't interpolate first or last event so just save it
                // as is and move on.
                if (i === 0) {
                    prevValue = e.get(fieldPath);
                    prevTime = e.timestamp().getTime();
                    newEvents.push(e);
                    continue;
                }

                if (i === events.length - 1) {
                    newEvents.push(e);
                    continue;
                }

                // Detect non-numeric value
                if (!_util2.default.isMissing(e.get(fieldPath)) && !_underscore2.default.isNumber(e.get(fieldPath))) {
                    console.warn("linear requires numeric values - skipping this field_spec");
                    return events;
                }

                // Found a missing value so start calculating.
                if (_util2.default.isMissing(e.get(fieldPath))) {
                    // Find the next valid value in the original events
                    var ii = i + 1;
                    var nextValue = null;
                    var nextTime = null;
                    while (_underscore2.default.isNull(nextValue) && ii < events.length) {
                        var val = events[ii].get(fieldPath);
                        if (!_util2.default.isMissing(val)) {
                            nextValue = val;
                            // exits loop
                            nextTime = events[ii].timestamp().getTime();
                        }
                        ii++;
                    }

                    // Interpolate a new value to fill
                    if (!_underscore2.default.isNull(prevValue) && ~_underscore2.default.isNull(nextValue)) {
                        var currentTime = e.timestamp().getTime();
                        if (nextTime === prevTime) {
                            // If times are the same, just avg
                            var newValue = (prevValue + nextValue) / 2;
                            newEvents.push(e.setData(newValue));
                        } else {
                            var f = (currentTime - prevTime) / (nextTime - prevTime);
                            var _newValue = prevValue + f * (nextValue - prevValue);
                            var d = e.data().setIn(fieldPath, _newValue);
                            newEvents.push(e.setData(d));
                        }
                    } else {
                        newEvents.push(e);
                    }
                } else {
                    newEvents.push(e);
                }
            }

            return newEvents;
        }

        /**
         * Perform the fill operation on the event and emit.
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {
                var emitList = [];
                var d = event.data();
                if (this._method === "zero" || this._method === "pad") {
                    var dd = this.constFill(d);
                    var e = event.setData(dd);
                    emitList.push(e);
                    this._previousEvent = e;
                } else if (this._method === "linear") {
                    this.linearFill(event).forEach(function (e) {
                        emitList.push(e);
                    });
                }
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = (0, _getIterator3.default)(emitList), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _event = _step2.value;

                        this.emit(_event);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }
    }, {
        key: "flush",
        value: function flush() {
            if (this.hasObservers() && this._method == "linear") {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = (0, _getIterator3.default)(this._linearFillCache), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var event = _step3.value;

                        this.emit(event);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
            (0, _get3.default)(Filler.prototype.__proto__ || (0, _getPrototypeOf2.default)(Filler.prototype), "flush", this).call(this);
        }
    }]);
    return Filler;
}(_processor2.default);

exports.default = Filler;