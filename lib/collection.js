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

var _event2 = _interopRequireDefault(_event);

var _pipelineInBounded = require("./pipeline-in-bounded");

var _pipelineInBounded2 = _interopRequireDefault(_pipelineInBounded);

var _functions = require("./functions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A collection is an abstraction for a bag of Events.
 *
 * You typically construct a Collection from a list of Events, which
 * may be either within an Immutable.List or an Array. You can also
 * copy another Collection or create an empty one.
 *
 * You can mutate a collection in a number of ways. In each instance
 * a new Collection will be returned.
 *
 * Basic operations on the list of events are also possible. You
 * can iterate over the collection with a for..of loop, get the size()
 * of the collection and access a specific element with at().
 *
 * You can also perform aggregations of the events, map them, filter them
 * and clean them.
 *
 * Collections form the backing structure for a TimeSeries, as well as
 * in Pipeline event processing.
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


    /**
     * Construct a new Collection.
     *
     * @param  {Collection|array|Immutable.List}  arg1 Initial data for
     * the collection. If arg1 is another Collection, this will act as
     * a copy constructor.
     * @param  {Boolean} [copyEvents] When using a the copy constructor
     * this specified whether or not to also copy all the events in this
     * collection. Generally you'll want to let it copy the events.
     * @return {Collection} The constructed Collection.
     */

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

    /**
     * Returns the Collection as a regular JSON object.
     * @return {Object} The JSON representation of this Collection
     */


    (0, _createClass3.default)(Collection, [{
        key: "toJSON",
        value: function toJSON() {
            return this._eventList.toJS();
        }

        /**
         * Serialize out the Collection as a string. This will be the
         * string representation of `toJSON()`.
         * @return {string} The Collection serialized as a string.
         */

    }, {
        key: "toString",
        value: function toString() {
            return (0, _stringify2.default)(this.toJSON());
        }

        /**
         * Returns the Event object type in this collection. Since
         * Collections my only have one type of Event (Event, IndexedEvent
         * or TimeRangeEvent) this will return that type. If no events
         * have been added to the Collection it will return undefined.
         *
         * @return {Event|IndexedEvent|TimeRangeEvent} - The class of the type
         * of events contained in this Collection.
         */

    }, {
        key: "type",
        value: function type() {
            return this._type;
        }

        /**
         * Returns the number of events in this collection
         * @return {number} Count of events
         */

    }, {
        key: "size",
        value: function size() {
            return this._eventList.size;
        }

        /**
         * Returns the number of valid items in this collection.
         *
         * Uses the fieldSpec to look up values in all events.
         * It then counts the number that are considered valid,
         * i.e. are not NaN, undefined or null.
         *
         * @return {number} Count of valid events
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

                    if (_event2.default.isValidValue(e, fieldSpec)) count++;
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
         * Returns an event in the Collection by its position.
         * @example
         * ```
         * for (let row=0; row < series.size(); row++) {
         *   const event = series.at(row);
         *   console.log(event.toString());
         * }
         * ```
         * @param  {number} pos The position of the event
         * @return {Event|TimeRangeEvent|IndexedEvent}     Returns the
         * event at the pos specified.
         */

    }, {
        key: "at",
        value: function at(pos) {
            var event = new this._type(this._eventList.get(pos));
            return event;
        }

        /**
         * Returns an event in the Collection by its time.
         * @param  {Date} time The time of the event.
         * @return {Event|TimeRangeEvent|IndexedEvent}
         */

    }, {
        key: "atTime",
        value: function atTime(time) {
            var pos = this.bisect(time);
            if (pos && pos < this.size()) {
                return this.at(pos);
            }
        }

        /**
         * Returns the first event in the Collection.
         * @return {Event|TimeRangeEvent|IndexedEvent}
         */

    }, {
        key: "atFirst",
        value: function atFirst() {
            if (this.size()) {
                return this.at(0);
            }
        }

        /**
         * Returns the last event in the Collection.
         * @return {Event|TimeRangeEvent|IndexedEvent}
         */

    }, {
        key: "atLast",
        value: function atLast() {
            if (this.size()) {
                return this.at(this.size() - 1);
            }
        }

        /**
         * Returns the index that bisects the Collection at
         * the time specified
         * @param  {Data} t The time to bisect the Collection with
         * @param  {number} b The position to begin searching at
         * @return {number}   The row number that is the greatest, but still below t.
         */

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

        /**
         * Generator to return all the events in the collection.
         * @example
         * ```
         * for (let event of series.events()) {
         *     console.log(event.toString());
         * }
         * ```
         */

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

        /**
         * Returns the raw Immutable event list
         * @return {Immutable.List} All events as an Immutable List.
         */

    }, {
        key: "eventList",
        value: function eventList() {
            return this._eventList;
        }

        /**
         * Returns a Javascript array of events
         * @return {Array} All events as a Javascript Array.
         */

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
         * Adds an event to the collection, returns a new Collection
         * @param {Event|TimeRangeEvent|IndexedEvent} event The event being added.
         * @return {Collection} A new, modified, Collection.
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
         * @param {Number} begin The position to begin slicing
         * @param {Number} end The position to end slicing
         * @return {Collection} A new, modified, Collection.
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
         *
         * @param {function} func The filter function, that should return
         * true or false when passed in an event.
         * @return {Collection} A new, modified, Collection.
         */

    }, {
        key: "filter",
        value: function filter(filterFunc) {
            var filteredEventList = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (0, _getIterator3.default)(this.events()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var e = _step4.value;

                    if (filterFunc(e)) {
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
         * @param {function} func The mapping function, that should return
         * a new event when passed in the old event.
         * @return {Collection} A new, modified, Collection.
         */

    }, {
        key: "map",
        value: function map(mapFunc) {
            var result = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = (0, _getIterator3.default)(this.events()), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var e = _step5.value;

                    result.push(mapFunc(e));
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
         *
         * The resulting Collection will be clean (for that fieldSpec).
         *
         * @param {string}      fieldSpec The field to test
         * @return {Collection}           A new, modified, Collection.
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

                    if (_event2.default.isValidValue(e, fs)) {
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

        /**
         * Returns the number of events in this collection
         * @return {number} The number of events
         */

    }, {
        key: "count",
        value: function count() {
            return this.size();
        }

        /**
         * Returns the first value in the Collection for the fieldspec
         */

    }, {
        key: "first",
        value: function first() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.first, fieldSpec);
        }

        /**
         * Returns the last value in the Collection for the fieldspec
         */

    }, {
        key: "last",
        value: function last() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.last, fieldSpec);
        }

        /**
         * Returns the sum Collection for the fieldspec
         */

    }, {
        key: "sum",
        value: function sum() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.sum, fieldSpec);
        }

        /**
         * Aggregates the events down to their average
         * @param  {String} fieldSpec The field to aggregate
         * @return {number}           The resulting value
         */

    }, {
        key: "avg",
        value: function avg() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.avg, fieldSpec);
        }

        /**
         * Aggregates the events down to their maximum value
         * @param  {String} fieldSpec The field to aggregate
         * @return {number}           The resulting value
         */

    }, {
        key: "max",
        value: function max() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.max, fieldSpec);
        }

        /**
         * Aggregates the events down to their minimum value
         * @param  {String} fieldSpec The field to aggregate
         * @return {number}           The resulting value
         */

    }, {
        key: "min",
        value: function min() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.min, fieldSpec);
        }

        /**
         * Aggregates the events down to their mean
         * @param  {String} fieldSpec The field to aggregate
         * @return {number}           The resulting value
         */

    }, {
        key: "mean",
        value: function mean() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.avg(fieldSpec);
        }

        /**
         * Aggregates the events down to their medium value
         * @param  {String} fieldSpec The field to aggregate
         * @return {number}           The resulting value
         */

    }, {
        key: "median",
        value: function median() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.median, fieldSpec);
        }

        /**
         * Aggregates the events down to their stdev
         * @param  {String} fieldSpec The field to aggregate
         * @return {number}           The resulting value
         */

    }, {
        key: "stdev",
        value: function stdev() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? "value" : arguments[0];

            return this.aggregate(_functions.stdev, fieldSpec);
        }

        /**
         * Aggregates the events down using a user defined function to
         * do the reduction.
         *
         * @param  {function} func User defined reduction function. Will be
         * passed a list of values. Should return a singe value.
         * @param  {String} fieldSpec The field to aggregate
         * @return {number}           The resulting value
         */

    }, {
        key: "aggregate",
        value: function aggregate(func) {
            var fieldSpec = arguments.length <= 1 || arguments[1] === undefined ? "value" : arguments[1];

            var fs = this._fieldSpecToArray(fieldSpec);
            var result = _event2.default.mapReduce(this.eventListAsArray(), [fs], func);
            return result[fs];
        }

        /**
         * Internal function to take a fieldSpec and
         * return it as an array if it isn't already one. Using
         * arrays in inner loops is faster than splitting
         * a string repeatedly.
         *
         * @private
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

        /**
         * STATIC
         */

        /**
         * Static function to compare two collections to each other. If the collections
         * are of the same instance as each other then equals will return true.
         * @param  {Collection} collection1
         * @param  {Collection} collection2
         * @return {bool} result
         */

    }], [{
        key: "equal",
        value: function equal(collection1, collection2) {
            return collection1._type === collection2._type && collection1._eventList === collection2._eventList;
        }

        /**
         * Static function to compare two collections to each other. If the collections
         * are of the same value as each other then equals will return true.
         * @param  {Collection} collection1
         * @param  {Collection} collection2
         * @return {bool} result
         */

    }, {
        key: "is",
        value: function is(collection1, collection2) {
            return collection1._type === collection2._type && _immutable2.default.is(collection1._eventList, collection2._eventList);
        }
    }]);
    return Collection;
}(_pipelineInBounded2.default);

exports.default = Collection;