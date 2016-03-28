/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _event = require("./event");

var _in = require("./in");

/**
 * A collection is a list of Events. You can construct one out of either
 * another collection, or a list of Events. You can addEvent() to a collection
 * and a new collection will be returned.
 *
 * Basic operations on the list of events are also possible. You
 * can iterate over the collection with a for..of loop, get the size()
 * of the collection and access a specific element with at().
 */

var Collection = (function (_BoundedIn) {
    _inherits(Collection, _BoundedIn);

    function Collection(arg1) {
        var _this = this;

        var copyEvents = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).call(this);

        this._id = _underscore2["default"].uniqueId("collection-");
        this._eventList = null; // The events in this collection
        this._type = null; // The type (class) of the events in this collection

        if (!arg1) {
            this._eventList = new _immutable2["default"].List();
        } else if (arg1 instanceof Collection) {
            var other = arg1;
            // copyEvents is whether to copy events from other, default is true
            if (_underscore2["default"].isUndefined(copyEvents) || copyEvents === true) {
                this._eventList = other._eventList;
                this._type = other._type;
            } else {
                this._eventList = new _immutable2["default"].List();
            }
        } else if (_underscore2["default"].isArray(arg1)) {
            (function () {
                var events = [];
                arg1.forEach(function (e) {
                    _this._check(e);
                    events.push(e._d);
                });
                _this._eventList = new _immutable2["default"].List(events);
            })();
        } else if (_immutable2["default"].List.isList(arg1)) {
            this._eventList = arg1;
        }
    }

    _createClass(Collection, [{
        key: "toJSON",
        value: function toJSON() {
            return this._eventList.toJS();
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
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
                for (var _iterator = _getIterator(this.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    if (_event.Event.isValidValue(e, fieldSpec)) count++;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
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
        value: _regeneratorRuntime.mark(function events() {
            var i;
            return _regeneratorRuntime.wrap(function events$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        i = 0;

                    case 1:
                        if (!(i < this.size())) {
                            context$2$0.next = 7;
                            break;
                        }

                        context$2$0.next = 4;
                        return this.at(i);

                    case 4:
                        i++;
                        context$2$0.next = 1;
                        break;

                    case 7:
                    case "end":
                        return context$2$0.stop();
                }
            }, events, this);
        })
    }, {
        key: "eventList",
        value: function eventList() {
            return this._eventList;
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
            var min = undefined;
            var max = undefined;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _getIterator(this.events()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var e = _step2.value;

                    if (!min || e.begin() < min) min = e.begin();
                    if (!max || e.end() > max) max = e.end();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            if (min && max) return new _range2["default"](min, max);
        }

        //
        // Event list mutation
        //

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
    }, {
        key: "filter",
        value: function filter(func) {
            var filteredEventList = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = _getIterator(this.events()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var e = _step3.value;

                    if (func(e)) {
                        filteredEventList.push(e);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return new Collection(filteredEventList);
        }
    }, {
        key: "map",
        value: function map(func) {
            var result = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = _getIterator(this.events()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var e = _step4.value;

                    result.push(func(e));
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
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
        value: function clean(fieldSpec) {
            var fs = fieldSpec || "value";
            var filteredEvents = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = _getIterator(this.events()), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var e = _step5.value;

                    if (_event.Event.isValidValue(e, fs)) {
                        filteredEvents.push(e);
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return new Collection(filteredEvents);
        }
    }, {
        key: "_fieldSpecToArray",
        value: function _fieldSpecToArray(fieldSpec) {
            if (_underscore2["default"].isArray(fieldSpec)) {
                return fieldSpec;
            } else if (_underscore2["default"].isString(fieldSpec)) {
                return fieldSpec.split(".");
            }
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

            var e = this.atFirst();
            return e.value(fieldSpec);
        }
    }, {
        key: "last",
        value: function last() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var e = this.atLast();
            return e.value(fieldSpec);
        }
    }, {
        key: "sum",
        value: function sum() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var fs = this._fieldSpecToArray(fieldSpec);
            var sum = 0;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = _getIterator(this.events()), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var e = _step6.value;

                    sum += e.value(fs);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                        _iterator6["return"]();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return sum;
        }
    }, {
        key: "avg",
        value: function avg() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var sum = this.sum(fieldSpec);
            var count = this.size();
            return count ? sum / count : undefined;
        }
    }, {
        key: "max",
        value: function max() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var fs = this._fieldSpecToArray(fieldSpec);
            var max = undefined;
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = _getIterator(this.events()), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var e = _step7.value;

                    var v = e.value(fs);
                    if (!max || max < v) max = v;
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                        _iterator7["return"]();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            return max;
        }
    }, {
        key: "min",
        value: function min() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var fs = this._fieldSpecToArray(fieldSpec);
            var min = undefined;
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = _getIterator(this.events()), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var e = _step8.value;

                    var v = e.value(fs);
                    if (!min || min > v) min = v;
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                        _iterator8["return"]();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            return min;
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

            var fs = this._fieldSpecToArray(fieldSpec);
            var sorted = this._eventList.sortBy(function (d) {
                return d.get("data").getIn(fs);
            });

            var i = Math.floor(sorted.size / 2);
            if (sorted.size % 2 === 0) {
                var a = sorted.get(i).get("data").getIn(fs);
                var b = sorted.get(i - 1).get("data").getIn(fs);
                return (a + b) / 2;
            } else {
                return sorted.get(i).get("data").getIn(fs);
            }
        }
    }, {
        key: "stdev",
        value: function stdev() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            var fs = this._fieldSpecToArray(fieldSpec);
            var mean = this.mean(fs);
            var count = this.size();
            var sums = 0;
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = _getIterator(this.events()), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var e = _step9.value;

                    sums += Math.pow(e.value(fs) - mean, 2);
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                        _iterator9["return"]();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            return Math.sqrt(sums / count);
        }
    }]);

    return Collection;
})(_in.BoundedIn);

exports["default"] = Collection;
module.exports = exports["default"];