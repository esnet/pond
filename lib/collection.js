"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

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

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _event = require("./event");

var _in = require("./in");

var _functions = require("./functions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A collection is a list of Events. You can construct one out of either
 * another collection, or a list of Events. You can addEvent() to a collection
 * and a new collection will be returned.
 *
 * Basic operations on the list of events are also possible. You
 * can iterate over the collection with a for..of loop, get the size()
 * of the collection and access a specific element with at().
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

var Collection = function (_BoundedIn) {
    (0, _inherits3.default)(Collection, _BoundedIn);

    function Collection(arg1) {
        var copyEvents = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
        (0, _classCallCheck3.default)(this, Collection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Collection).call(this));

        _this._id = _underscore2.default.uniqueId("collection-");
        _this._eventList = null; // The events in this collection
        _this._type = null; // The type (class) of the events in this collection

        if (!arg1) {
            _this._eventList = new _immutable2.default.List();
        } else if (arg1 instanceof Collection) {
            var other = arg1;
            // copyEvents is whether to copy events from other, default is true
            if (_underscore2.default.isUndefined(copyEvents) || copyEvents === true) {
                _this._eventList = other._eventList;
                _this._type = other._type;
            } else {
                _this._eventList = new _immutable2.default.List();
            }
        } else if (_underscore2.default.isArray(arg1)) {
            (function () {
                var events = [];
                arg1.forEach(function (e) {
                    _this._check(e);
                    events.push(e._d);
                });
                _this._eventList = new _immutable2.default.List(events);
            })();
        } else if (_immutable2.default.List.isList(arg1)) {
            _this._eventList = arg1;
        }
        return _this;
    }

    (0, _createClass3.default)(Collection, [{
        key: "toJSON",
        value: function toJSON() {
            return this._eventList.toJS();
        }
    }, {
        key: "toString",
        value: function toString() {
            return (0, _stringify2.default)(this.toJSON());
        }

        /**
         * Returns the Event object type in this collection
         */

    }, {
        key: "type",
        value: function type() {
            return this._type;
        }

        /**
         * Returns the number of items in this collection
         */

    }, {
        key: "size",
        value: function size() {
            return this._eventList.size;
        }

        /**
         * Returns the number of valid items in this collection.
         *
         * Uses the fieldName and optionally a function passed in
         * to look up values in all events. It then counts the number
         * that are considered valid, i.e. are not NaN, undefined or null.
         */

    }, {
        key: "sizeValid",
        value: function sizeValid() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var count = 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    if (_event.Event.isValidValue(e, fieldSpec)) count++;
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

            return count;
        }

        /**
         * Returns an item in the collection by its position
         */

    }, {
        key: "at",
        value: function at(pos) {
            var event = new this._type(this._eventList.get(pos));
            return event;
        }
    }, {
        key: "atTime",
        value: function atTime(time) {
            var pos = this.bisect(time);
            if (pos && pos < this.size()) {
                return this.at(pos);
            }
        }
    }, {
        key: "atFirst",
        value: function atFirst() {
            if (this.size()) {
                return this.at(0);
            }
        }
    }, {
        key: "atLast",
        value: function atLast() {
            if (this.size()) {
                return this.at(this.size() - 1);
            }
        }
    }, {
        key: "bisect",
        value: function bisect(t, b) {
            var tms = t.getTime();
            var size = this.size();
            var i = b || 0;

            if (!size) {
                return undefined;
            }

            for (; i < size; i++) {
                var ts = this.at(i).timestamp().getTime();
                if (ts > tms) {
                    return i - 1 >= 0 ? i - 1 : 0;
                } else if (ts === tms) {
                    return i;
                }
            }
            return i - 1;
        }
    }, {
        key: "events",
        value: _regenerator2.default.mark(function events() {
            var i;
            return _regenerator2.default.wrap(function events$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            i = 0;

                        case 1:
                            if (!(i < this.size())) {
                                _context.next = 7;
                                break;
                            }

                            _context.next = 4;
                            return this.at(i);

                        case 4:
                            i++;
                            _context.next = 1;
                            break;

                        case 7:
                        case "end":
                            return _context.stop();
                    }
                }
            }, events, this);
        })
    }, {
        key: "eventList",
        value: function eventList() {
            return this._eventList;
        }
    }, {
        key: "eventListAsArray",
        value: function eventListAsArray() {
            var events = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(this.events()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var e = _step2.value;

                    events.push(e);
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

            return events;
        }

        //
        // Series range
        //

        /**
         * From the range of times, or Indexes within the TimeSeries, return
         * the extents of the TimeSeries as a TimeRange.
         * @return {TimeRange} The extents of the TimeSeries
         */

    }, {
        key: "range",
        value: function range() {
            var min = void 0;
            var max = void 0;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = (0, _getIterator3.default)(this.events()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var e = _step3.value;

                    if (!min || e.begin() < min) min = e.begin();
                    if (!max || e.end() > max) max = e.end();
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

            if (min && max) return new _range2.default(min, max);
        }

        //
        // Collection mutation
        //

        /**
         * Adds an event to the collection, returns a new collection
         */

    }, {
        key: "addEvent",
        value: function addEvent(event) {
            this._check(event);
            var result = new Collection(this);
            result._eventList = this._eventList.push(event._d);
            return result;
        }

        /**
         * Perform a slice of events within the Collection, returns a new
         * Collection representing a portion of this TimeSeries from begin up to
         * but not including end.
         */

    }, {
        key: "slice",
        value: function slice(begin, end) {
            var sliced = new Collection(this._eventList.slice(begin, end));
            sliced._type = this._type;
            return sliced;
        }

        /**
         * Filter the collection's event list with the supplied function
         */

    }, {
        key: "filter",
        value: function filter(func) {
            var filteredEventList = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (0, _getIterator3.default)(this.events()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var e = _step4.value;

                    if (func(e)) {
                        filteredEventList.push(e);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return new Collection(filteredEventList);
        }

        /**
         * Map the collection's event list to a new event list with
         * the supplied function.
         */

    }, {
        key: "map",
        value: function map(func) {
            var result = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = (0, _getIterator3.default)(this.events()), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var e = _step5.value;

                    result.push(func(e));
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return new Collection(result);
        }

        /**
         * Returns a new Collection by testing the fieldSpec
         * values for being valid (not NaN, null or undefined).
         * The resulting Collection will be clean for that fieldSpec.
         */

    }, {
        key: "clean",
        value: function clean() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var fs = this._fieldSpecToArray(fieldSpec);
            var filteredEvents = [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = (0, _getIterator3.default)(this.events()), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var e = _step6.value;

                    if (_event.Event.isValidValue(e, fs)) {
                        filteredEvents.push(e);
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return new Collection(filteredEvents);
        }

        //
        // Aggregate the event list to a single value
        //

    }, {
        key: "count",
        value: function count() {
            return this.size();
        }
    }, {
        key: "first",
        value: function first() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.first, fieldSpec);
        }
    }, {
        key: "last",
        value: function last() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.last, fieldSpec);
        }
    }, {
        key: "sum",
        value: function sum() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.sum, fieldSpec);
        }
    }, {
        key: "avg",
        value: function avg() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.avg, fieldSpec);
        }
    }, {
        key: "max",
        value: function max() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.max, fieldSpec);
        }
    }, {
        key: "min",
        value: function min() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.min, fieldSpec);
        }
    }, {
        key: "mean",
        value: function mean() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.avg(fieldSpec);
        }
    }, {
        key: "median",
        value: function median() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.median, fieldSpec);
        }
    }, {
        key: "stdev",
        value: function stdev() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.stdev, fieldSpec);
        }
    }, {
        key: "aggregate",
        value: function aggregate(func) {
            var fieldSpec = arguments.length <= 1 || arguments[1] === undefined ? "value" : arguments[1];

            var fs = this._fieldSpecToArray(fieldSpec);
            var result = _event.Event.mapReduce(this.eventListAsArray(), [fs], func);
            return result[fs];
        }

        /**
         * Internal function to take a fieldSpec and
         * return it as an array if it isn't already one. Using
         * arrays in inner loops is faster than splitting
         * a string repeatedly.
         */

    }, {
        key: "_fieldSpecToArray",
        value: function _fieldSpecToArray(fieldSpec) {
            if (_underscore2.default.isArray(fieldSpec)) {
                return fieldSpec;
            } else if (_underscore2.default.isString(fieldSpec)) {
                return fieldSpec.split(".");
            }
        }
    }]);
    return Collection;
}(_in.BoundedIn);

exports.default = Collection;