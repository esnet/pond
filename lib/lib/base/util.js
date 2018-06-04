"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _timerange = require("../timerange");

var _timerange2 = _interopRequireDefault(_timerange);

var _index = require("../index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var units = {
    s: { label: "seconds", length: 1 },
    m: { label: "minutes", length: 60 },
    h: { label: "hours", length: 60 * 60 },
    d: { label: "days", length: 60 * 60 * 24 }
};

/**
 * This function will take an index, which may be of two forms:
 *     2015-07-14  (day)
 *     2015-07     (month)
 *     2015        (year)
 * or:
 *     1d-278      (range, in n x days, hours, minutes or seconds)
 *
 * and return a TimeRange for that time. The TimeRange may be considered to be
 * local time or UTC time, depending on the utc flag passed in.
 */
/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

exports.default = {
    /**
     * Single zero left padding, for days and months.
     */
    leftPad: function leftPad(value) {
        return "" + (value < 10 ? "0" : "") + value;
    },

    /**
     * Returns a duration in milliseconds given a window duration string.
     * For example "30s" (30 seconds) should return 30000ms. Accepts
     * seconds (e.g. "30s"), minutes (e.g. "5m"), hours (e.g. "6h") and
     * days (e.g. "30d")
     */
    windowDuration: function windowDuration(w) {
        // window should be two parts, a number and a letter if it's a
        // range based index, e.g "1h".
        var regex = /([0-9]+)([smhd])/;
        var parts = regex.exec(w);
        if (parts && parts.length >= 3) {
            var num = parseInt(parts[1], 10);
            var unit = parts[2];
            return num * units[unit].length * 1000;
        }
    },
    windowPositionFromDate: function windowPositionFromDate(w, date) {
        var duration = this.windowDuration(w);
        var dd = _moment2.default.utc(date).valueOf();
        return parseInt(dd /= duration, 10);
    },
    rangeFromIndexString: function rangeFromIndexString(index, utc) {
        var isUTC = !_underscore2.default.isUndefined(utc) ? utc : true;
        var parts = index.split("-");

        var beginTime = void 0;
        var endTime = void 0;

        switch (parts.length) {
            case 3:
                // A day, month and year e.g. 2014-10-24
                if (!_underscore2.default.isNaN(parseInt(parts[0], 10)) && !_underscore2.default.isNaN(parseInt(parts[1], 10)) && !_underscore2.default.isNaN(parseInt(parts[2], 10))) {
                    var _year = parseInt(parts[0], 10);
                    var month = parseInt(parts[1], 10);
                    var day = parseInt(parts[2], 10);
                    beginTime = isUTC ? _moment2.default.utc([_year, month - 1, day]) : (0, _moment2.default)([_year, month - 1, day]);
                    endTime = isUTC ? _moment2.default.utc(beginTime).endOf("day") : (0, _moment2.default)(beginTime).endOf("day");
                }
                break;

            case 2:
                // Size should be two parts, a number and a letter if it's a
                // range based index, e.g 1h-23478
                var rangeRegex = /([0-9]+)([smhd])/;
                var sizeParts = rangeRegex.exec(parts[0]);
                if (sizeParts && sizeParts.length >= 3 && !_underscore2.default.isNaN(parseInt(parts[1], 10))) {
                    var pos = parseInt(parts[1], 10);
                    var num = parseInt(sizeParts[1], 10);
                    var unit = sizeParts[2];
                    var length = num * units[unit].length * 1000;

                    beginTime = isUTC ? _moment2.default.utc(pos * length) : (0, _moment2.default)(pos * length);
                    endTime = isUTC ? _moment2.default.utc((pos + 1) * length) : (0, _moment2.default)((pos + 1) * length);
                    // A month and year e.g 2015-09
                } else if (!_underscore2.default.isNaN(parseInt(parts[0], 10)) && !_underscore2.default.isNaN(parseInt(parts[1], 10))) {
                    var _year2 = parseInt(parts[0], 10);
                    var _month = parseInt(parts[1], 10);
                    beginTime = isUTC ? _moment2.default.utc([_year2, _month - 1]) : (0, _moment2.default)([_year2, _month - 1]);
                    endTime = isUTC ? _moment2.default.utc(beginTime).endOf("month") : (0, _moment2.default)(beginTime).endOf("month");
                }
                break;

            // A year e.g. 2015
            case 1:
                var year = parts[0];
                beginTime = isUTC ? _moment2.default.utc([year]) : (0, _moment2.default)([year]);
                endTime = isUTC ? _moment2.default.utc(beginTime).endOf("year") : (0, _moment2.default)(beginTime).endOf("year");
                break;
        }

        if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
            return new _timerange2.default(beginTime, endTime);
        } else {
            return undefined;
        }
    },

    /**
     * Returns a nice string for the index. If the index is of the form
     * 1d-2345 then just that string is returned (there's not nice way to put
     * it), but if it represents a day, month, or year (e.g. 2015-07) then a
     * nice string like "July" will be returned. It's also possible to pass in
     * the format of the reply for these types of strings. See moment's format
     * naming conventions:
     * http://momentjs.com/docs/#/displaying/format/
     */
    niceIndexString: function niceIndexString(index, format) {
        var t = void 0;

        var parts = index.split("-");
        switch (parts.length) {
            case 3:
                if (!_underscore2.default.isNaN(parseInt(parts[0], 10)) && !_underscore2.default.isNaN(parseInt(parts[1], 10)) && !_underscore2.default.isNaN(parseInt(parts[2], 10))) {
                    var _year3 = parseInt(parts[0], 10);
                    var month = parseInt(parts[1], 10);
                    var day = parseInt(parts[2], 10);
                    t = _moment2.default.utc([_year3, month - 1, day]);
                    if (format) {
                        return t.format(format);
                    } else {
                        return t.format("MMMM Do YYYY");
                    }
                }
                break;

            case 2:
                var rangeRegex = /([0-9]+)([smhd])/;
                var sizeParts = rangeRegex.exec(parts[0]);
                if (sizeParts && sizeParts.length >= 3 && !_underscore2.default.isNaN(parseInt(parts[1], 10))) {
                    return index;
                } else if (!_underscore2.default.isNaN(parseInt(parts[0], 10)) && !_underscore2.default.isNaN(parseInt(parts[1], 10))) {
                    var _year4 = parseInt(parts[0], 10);
                    var _month2 = parseInt(parts[1], 10);
                    t = _moment2.default.utc([_year4, _month2 - 1]);
                    if (format) {
                        return t.format(format);
                    } else {
                        return t.format("MMMM");
                    }
                }
                break;

            case 1:
                var year = parts[0];
                t = _moment2.default.utc([year]);
                if (format) {
                    return t.format(format);
                } else {
                    return t.format("YYYY");
                }
                break;
        }
        return index;
    },
    isMissing: function isMissing(val) {
        return _underscore2.default.isNull(val) || _underscore2.default.isUndefined(val) || _underscore2.default.isNaN(val);
    },

    /**
     * Split the field spec if it is not already a list.
     *
     * Also, allow for deep fields to be passed in as a tuple because
     * it will need to be used as a dict key in some of the processor
     * Options.
     *
     * This is deployed in Event.get() to process anything passed
     * to it, but this should also be deployed "upstream" to avoid
     * having that split() done over and over in a loop.
     */
    fieldPathToArray: function fieldPathToArray(fieldSpec) {
        if (_underscore2.default.isArray(fieldSpec) || _underscore2.default.isFunction(fieldSpec)) {
            return fieldSpec;
        } else if (_underscore2.default.isString(fieldSpec)) {
            return fieldSpec.split(".");
        } else if (_underscore2.default.isUndefined(fieldSpec)) {
            return ["value"];
        }
    },

    /**
     * Generate a list of all possible field paths in an object. This is
     * for to determine all deep paths when none is given.
     */
    generatePaths: function generatePaths(newData) {
        var _marked = /*#__PURE__*/_regenerator2.default.mark(recurse);

        var paths = [];

        function recurse(data) {
            var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, path;

            return _regenerator2.default.wrap(function recurse$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!_underscore2.default.isObject(data)) {
                                _context.next = 53;
                                break;
                            }

                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 4;
                            _iterator = (0, _getIterator3.default)((0, _keys2.default)(data));

                        case 6:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context.next = 37;
                                break;
                            }

                            key = _step.value;
                            _iteratorNormalCompletion2 = true;
                            _didIteratorError2 = false;
                            _iteratorError2 = undefined;
                            _context.prev = 11;
                            _iterator2 = (0, _getIterator3.default)(recurse(data[key], [].concat((0, _toConsumableArray3.default)(keys), [key])));

                        case 13:
                            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                _context.next = 20;
                                break;
                            }

                            path = _step2.value;
                            _context.next = 17;
                            return path;

                        case 17:
                            _iteratorNormalCompletion2 = true;
                            _context.next = 13;
                            break;

                        case 20:
                            _context.next = 26;
                            break;

                        case 22:
                            _context.prev = 22;
                            _context.t0 = _context["catch"](11);
                            _didIteratorError2 = true;
                            _iteratorError2 = _context.t0;

                        case 26:
                            _context.prev = 26;
                            _context.prev = 27;

                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }

                        case 29:
                            _context.prev = 29;

                            if (!_didIteratorError2) {
                                _context.next = 32;
                                break;
                            }

                            throw _iteratorError2;

                        case 32:
                            return _context.finish(29);

                        case 33:
                            return _context.finish(26);

                        case 34:
                            _iteratorNormalCompletion = true;
                            _context.next = 6;
                            break;

                        case 37:
                            _context.next = 43;
                            break;

                        case 39:
                            _context.prev = 39;
                            _context.t1 = _context["catch"](4);
                            _didIteratorError = true;
                            _iteratorError = _context.t1;

                        case 43:
                            _context.prev = 43;
                            _context.prev = 44;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 46:
                            _context.prev = 46;

                            if (!_didIteratorError) {
                                _context.next = 49;
                                break;
                            }

                            throw _iteratorError;

                        case 49:
                            return _context.finish(46);

                        case 50:
                            return _context.finish(43);

                        case 51:
                            _context.next = 55;
                            break;

                        case 53:
                            _context.next = 55;
                            return keys;

                        case 55:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _marked, this, [[4, 39, 43, 51], [11, 22, 26, 34], [27,, 29, 33], [44,, 46, 50]]);
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = (0, _getIterator3.default)(recurse(newData)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var key = _step3.value;

                paths.push(key);
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

        return paths;
    },

    //
    // Functions to turn constructor args
    // into other stuff
    //
    timestampFromArg: function timestampFromArg(arg) {
        if (_underscore2.default.isNumber(arg)) {
            return new Date(arg);
        } else if (_underscore2.default.isString(arg)) {
            return new Date(+arg);
        } else if (_underscore2.default.isDate(arg)) {
            return new Date(arg.getTime());
        } else if (_moment2.default.isMoment(arg)) {
            return new Date(arg.valueOf());
        } else {
            throw new Error("Unable to get timestamp from " + arg + ". Should be a number, date, or moment.");
        }
    },
    timeRangeFromArg: function timeRangeFromArg(arg) {
        if (arg instanceof _timerange2.default) {
            return arg;
        } else if (_underscore2.default.isString(arg)) {
            var _arg$split = arg.split(","),
                _arg$split2 = (0, _slicedToArray3.default)(_arg$split, 2),
                begin = _arg$split2[0],
                end = _arg$split2[1];

            return new _timerange2.default([+begin, +end]);
        } else if (_underscore2.default.isArray(arg) && arg.length === 2) {
            return new _timerange2.default(arg);
        } else {
            throw new Error("Unable to parse timerange. Should be a TimeRange. Got " + arg + ".");
        }
    },
    indexFromArgs: function indexFromArgs(arg1) {
        var arg2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (_underscore2.default.isString(arg1)) {
            return new _index2.default(arg1, arg2);
        } else if (arg1 instanceof _index2.default) {
            return arg1;
        } else {
            throw new Error("Unable to get index from " + arg1 + ". Should be a string or Index.");
        }
    },
    dataFromArg: function dataFromArg(arg) {
        var data = void 0;
        if (_underscore2.default.isObject(arg)) {
            // Deeply convert the data to Immutable Map
            data = new _immutable2.default.fromJS(arg);
        } else if (data instanceof _immutable2.default.Map) {
            // Copy reference to the data
            data = arg;
        } else if (_underscore2.default.isNumber(arg) || _underscore2.default.isString(arg)) {
            // Just add it to the value key of a new Map
            // e.g. new Event(t, 25); -> t, {value: 25}
            data = new _immutable2.default.Map({ value: arg });
        } else {
            throw new Error("Unable to interpret event data from " + arg + ".");
        }
        return data;
    }
};