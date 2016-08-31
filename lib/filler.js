"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _pipeline = require("./pipeline");

var _util = require("./util");

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
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var Filler = function (_Processor) {
    (0, _inherits3.default)(Filler, _Processor);

    function Filler(arg1, options) {
        (0, _classCallCheck3.default)(this, Filler);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Filler).call(this, arg1, options));

        if (arg1 instanceof Filler) {
            var other = arg1;
            _this._fieldSpec = other._fieldSpec;
            _this._method = other._method;
            _this._limit = other._limit;
        } else if ((0, _pipeline.isPipeline)(arg1)) {
            var fieldSpec = options.fieldSpec;
            var _options$method = options.method;
            var method = _options$method === undefined ? "zero" : _options$method;
            var _options$limit = options.limit;
            var limit = _options$limit === undefined ? null : _options$limit;

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

        if (!_underscore2.default.contains(["zero", "pad", "linear"], _this._method)) {
            throw new Error("Unknown method " + _this._method + " passed to Filler");
        }

        if (_underscore2.default.isString(_this._fieldSpec)) {
            _this._fieldSpec = [_this._fieldSpec];
        } else if (_underscore2.default.isNull(_this._fieldSpec)) {
            _this._fieldSpec = ["value"];
        }

        // When using linear mode, only a single column will be
        // processed per instance

        if (_this._method === "linear" && _this.fieldSpec.length > 1) {
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
        key: "_padAndZero",
        value: function _padAndZero(data, paths) {
            var newData = data;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(paths), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
         * Perform the fill operation on the event and emit.
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            if (this.hasObservers()) {

                var toEmit = [];
                var d = event.data();

                var paths = void 0;
                if (!this._fieldSpec) {
                    // generate a list of all possible field paths if no field spec is specified.
                    paths = _util2.default.generatePaths(d.toJS());
                } else {
                    paths = this._fieldSpec;
                }

                if (this._method === "zero" || this._method === "pad") {
                    // zero and pad use much the same method in that
                    // they both will emit a single event every time
                    // add_event() is called.
                    var newData = this._padAndZero(d, paths);
                    var emit = event.setData(newData);
                    toEmit.push(emit);

                    // remember previous event for padding
                    this._previousEvent = emit;
                } else if (this._method === "linear") {
                    // linear filling follows a somewhat different
                    // path since it might emit zero, one or multiple
                    // events every time add_event() is called.
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = (0, _getIterator3.default)(this._linearFill(event, paths)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _emit = _step2.value;

                            toEmit.push(_emit);
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

                // end filling logic

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = (0, _getIterator3.default)(toEmit), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _event = _step3.value;

                        this.emit(_event);
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
        }
    }]);
    return Filler;
}(_processor2.default);

exports.default = Filler;