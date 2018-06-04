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

var _bounded = require("./io/bounded");

var _bounded2 = _interopRequireDefault(_bounded);

var _event = require("./event");

var _event2 = _interopRequireDefault(_event);

var _timerange = require("./timerange");

var _timerange2 = _interopRequireDefault(_timerange);

var _util = require("./base/util");

var _util2 = _interopRequireDefault(_util);

var _functions = require("./base/functions");

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
 * clean them, etc.
 *
 * Collections form the backing structure for a TimeSeries, as well as
 * in Pipeline event processing. They are an instance of a BoundedIn, so
 * they can be used as a pipeline source.
 */
var Collection = function (_Bounded) {
    (0, _inherits3.default)(Collection, _Bounded);

    /**
     * Construct a new Collection.
     *
     * @param  {Collection|array|Immutable.List}  arg1 Initial data for
     * the collection. If arg1 is another Collection, this will act as
     * a copy constructor.
     * @param  {Boolean} [arg2] When using a the copy constructor
     * this specified whether or not to also copy all the events in this
     * collection. Generally you'll want to let it copy the events.
     * If arg1 is an Immutable.List, then arg2 will specify the type of
     * the Events accepted into the Collection. This form is generally
     * used internally.
     *
     * @return {Collection} The constructed Collection.
     */
    function Collection(arg1, arg2) {
        (0, _classCallCheck3.default)(this, Collection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Collection.__proto__ || (0, _getPrototypeOf2.default)(Collection)).call(this));

        _this._id = _underscore2.default.uniqueId("collection-");
        _this._eventList = null;
        // The events in this collection
        _this._type = null;

        // The type (class) of the events in this collection
        if (!arg1) {
            _this._eventList = new _immutable2.default.List();
        } else if (arg1 instanceof Collection) {
            var other = arg1;
            var copyEvents = arg2 || true;
            // copyEvents is whether to copy events from other, default is true
            if (_underscore2.default.isUndefined(copyEvents) || copyEvents === true) {
                _this._eventList = other._eventList;
                _this._type = other._type;
            } else {
                _this._eventList = new _immutable2.default.List();
            }
        } else if (_underscore2.default.isArray(arg1)) {
            var events = [];
            arg1.forEach(function (e) {
                _this._check(e);
                events.push(e._d);
            });
            _this._eventList = new _immutable2.default.List(events);
        } else if (_immutable2.default.List.isList(arg1)) {
            var type = arg2;
            if (!type) {
                throw new Error("No type supplied to Collection constructor");
            }
            _this._type = type;
            _this._eventList = arg1;
        }
        return _this;
    }

    /**
     * Returns the Collection as a regular JSON object.
     *
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
         *
         * @return {string} The Collection serialized as a string.
         */

    }, {
        key: "toString",
        value: function toString() {
            return (0, _stringify2.default)(this.toJSON());
        }

        /**
         * Returns the Event object type in this Collection.
         *
         * Since Collections may only have one type of event (`Event`, `IndexedEvent`
         * or `TimeRangeEvent`) this will return that type. If no events
         * have been added to the Collection it will return `undefined`.
         *
         * @return {Event} - The class of the type of events contained in
         *                   this Collection.
         */

    }, {
        key: "type",
        value: function type() {
            return this._type;
        }

        /**
         * Returns the number of events in this collection
         *
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
         * Uses the fieldPath to look up values in all events.
         * It then counts the number that are considered valid, which
         * specifically are not NaN, undefined or null.
         *
         * @return {number} Count of valid events
         */

    }, {
        key: "sizeValid",
        value: function sizeValid() {
            var fieldPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "value";

            var count = 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    if (_event2.default.isValidValue(e, fieldPath)) count++;
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
         * @return {Event}      Returns the event at the pos specified.
         */

    }, {
        key: "at",
        value: function at(pos) {
            if (this._eventList.size > 0) {
                var event = new this._type(this._eventList.get(pos));
                return event;
            }
        }

        /**
         * Returns a list of events in the Collection which have
         * the exact key (time, timerange or index) as the key specified
         * by 'at'. Note that this is an O(n) search for the time specified,
         * since collections are an unordered bag of events.
         *
         * @param  {Date|string|TimeRange} key The key of the event.
         * @return {Array} All events at that key
         */

    }, {
        key: "atKey",
        value: function atKey(k) {
            var result = [];
            var key = void 0;
            if (k instanceof Date) {
                key = k.getTime();
            } else if (_underscore2.default.isString(k)) {
                key = k;
            } else if (k instanceof _timerange2.default) {
                key = this.timerange().begin() + "," + this.timerange().end();
            }
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(this.events()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var e = _step2.value;

                    if (e.key() === key) {
                        result.push(e);
                    }
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

            return result;
        }

        /**
         * Returns the first event in the Collection.
         *
         * @return {Event}
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
         *
         * @return {Event}
         */

    }, {
        key: "atLast",
        value: function atLast() {
            if (this.size()) {
                return this.at(this.size() - 1);
            }
        }

        /**
         * Generator to return all the events in the Collection.
         *
         * @example
         * ```
         * for (let event of collection.events()) {
         *     console.log(event.toString());
         * }
         * ```
         */

    }, {
        key: "events",
        value: /*#__PURE__*/_regenerator2.default.mark(function events() {
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
        key: "setEvents",
        value: function setEvents(events) {
            var result = new Collection(this);
            result._eventList = events;
            return result;
        }

        /**
         * Returns the raw Immutable event list
         *
         * @return {Immutable.List} All events as an Immutable List.
         */

    }, {
        key: "eventList",
        value: function eventList() {
            return this._eventList;
        }

        /**
         * Returns a Javascript array representation of the event list
         *
         * @return {Array} All events as a Javascript Array.
         */

    }, {
        key: "eventListAsArray",
        value: function eventListAsArray() {
            var events = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = (0, _getIterator3.default)(this.events()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var e = _step3.value;

                    events.push(e);
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

            return events;
        }

        /**
         * Returns the events in the collection as a Javascript Map, where
         * the key is the timestamp, index or timerange and the
         * value is an array of events with that key.
         *
         * @return {map} The map of events
         */

    }, {
        key: "eventListAsMap",
        value: function eventListAsMap() {
            var events = {};
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (0, _getIterator3.default)(this.events()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var e = _step4.value;

                    var key = e.key();
                    if (!_underscore2.default.has(events, key)) {
                        events[key] = [];
                    }
                    events[key].push(e);
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

            return events;
        }

        //
        // De-duplicate
        //
        /**
         * Removes duplicates from the Collection. If duplicates
         * exist in the collection with the same key but with different
         * values, then later event values will be used.
         *
         * @return {Collection} The sorted Collection.
         */

    }, {
        key: "dedup",
        value: function dedup() {
            var events = _event2.default.merge(this.eventListAsArray());
            return new Collection(events);
        }

        //
        // Sorting
        //
        /**
         * Sorts the Collection by the timestamp. In the case
         * of TimeRangeEvents and IndexedEvents, it will be sorted
         * by the begin time. This is useful when the collection
         * will be passed into a TimeSeries.
         *
         * See also isChronological().
         *
         * @return {Collection} The sorted Collection
         */

    }, {
        key: "sortByTime",
        value: function sortByTime() {
            var _this2 = this;

            var sorted = this._eventList.sortBy(function (event) {
                var e = new _this2._type(event);
                return e.timestamp().getTime();
            });
            return this.setEvents(sorted);
        }

        /**
         * Sorts the Collection using the value referenced by
         * the fieldPath.
         *
         * @return {Collection} The extents of the Collection
         */

    }, {
        key: "sort",
        value: function sort(fieldPath) {
            var _this3 = this;

            var fs = _util2.default.fieldPathToArray(fieldPath);
            var sorted = this._eventList.sortBy(function (event) {
                var e = new _this3._type(event);
                return e.get(fs);
            });
            return this.setEvents(sorted);
        }

        //
        // Series range
        //
        /**
         * From the range of times, or Indexes within the TimeSeries, return
         * the extents of the TimeSeries as a TimeRange. This is currently implemented
         * by walking the events.
         *
         * @return {TimeRange} The extents of the TimeSeries
         */

    }, {
        key: "range",
        value: function range() {
            var min = void 0;
            var max = void 0;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = (0, _getIterator3.default)(this.events()), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var e = _step5.value;

                    if (!min || e.begin() < min) min = e.begin();
                    if (!max || e.end() > max) max = e.end();
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

            if (min && max) return new _timerange2.default(min, max);
        }

        //
        // Collection mutation
        //
        /**
         * Adds an event to the collection, returns a new Collection. The event added
         * can be an Event, TimeRangeEvent or IndexedEvent, but it must be of the
         * same type as other events within the Collection.
         *
         * @param {Event} event The event being added.
         *
         * @return {Collection} A new, modified, Collection containing the new event.
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
         *
         * @param {Number} begin   The position to begin slicing
         * @param {Number} end     The position to end slicing
         *
         * @return {Collection}    The new, sliced, Collection.
         */

    }, {
        key: "slice",
        value: function slice(begin, end) {
            return new Collection(this._eventList.slice(begin, end), this._type);
        }

        /**
         * Filter the collection's event list with the supplied function
         *
         * @param {function} func The filter function, that should return
         *                        true or false when passed in an event.
         *
         * @return {Collection}   A new, filtered, Collection.
         */

    }, {
        key: "filter",
        value: function filter(filterFunc) {
            var filteredEventList = [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = (0, _getIterator3.default)(this.events()), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var e = _step6.value;

                    if (filterFunc(e)) {
                        filteredEventList.push(e);
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

            return new Collection(filteredEventList);
        }

        /**
         * Map the collection's event list to a new event list with
         * the supplied function.
         * @param {function} func The mapping function, that should return
         * a new event when passed in the old event.
         *
         * @return {Collection} A new, modified, Collection.
         */

    }, {
        key: "map",
        value: function map(mapFunc) {
            var result = [];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = (0, _getIterator3.default)(this.events()), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var e = _step7.value;

                    result.push(mapFunc(e));
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            return new Collection(result);
        }

        /**
         * Returns a new Collection by testing the fieldPath
         * values for being valid (not NaN, null or undefined).
         *
         * The resulting Collection will be clean (for that fieldPath).
         *
         * @param  {string}      fieldPath  Name of value to look up. If not supplied,
         *                                  defaults to ['value']. "Deep" syntax is
         *                                  ['deep', 'value'] or 'deep.value'
         *
         * @return {Collection}             A new, modified, Collection.
         */

    }, {
        key: "clean",
        value: function clean(fieldPath) {
            var fs = _util2.default.fieldPathToArray(fieldPath);
            var filteredEvents = [];
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = (0, _getIterator3.default)(this.events()), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var e = _step8.value;

                    if (_event2.default.isValidValue(e, fs)) {
                        filteredEvents.push(e);
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
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
         *
         * @return {number} The number of events
         */

    }, {
        key: "count",
        value: function count() {
            return this.size();
        }

        /**
         * Returns the first value in the Collection for the fieldspec
         *
         * @param {string} fieldPath  Column to find the first value of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The first value
         */

    }, {
        key: "first",
        value: function first(fieldPath, filter) {
            return this.aggregate((0, _functions.first)(filter), fieldPath);
        }

        /**
         * Returns the last value in the Collection for the fieldspec
         *
         * @param {string} fieldPath  Column to find the last value of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The last value
         */

    }, {
        key: "last",
        value: function last(fieldPath, filter) {
            return this.aggregate((0, _functions.last)(filter), fieldPath);
        }

        /**
         * Returns the sum of the Collection for the fieldspec
         *
         * @param {string} fieldPath  Column to find the sum of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The sum
         */

    }, {
        key: "sum",
        value: function sum(fieldPath, filter) {
            return this.aggregate((0, _functions.sum)(filter), fieldPath);
        }

        /**
         * Aggregates the events down to their average(s)
         *
         * @param {string} fieldPath  Column to find the avg of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The average
         */

    }, {
        key: "avg",
        value: function avg(fieldPath, filter) {
            return this.aggregate((0, _functions.avg)(filter), fieldPath);
        }

        /**
         * Aggregates the events down to their maximum value
         *
         * @param {string} fieldPath  Column to find the max of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The max value for the field
         */

    }, {
        key: "max",
        value: function max(fieldPath, filter) {
            return this.aggregate((0, _functions.max)(filter), fieldPath);
        }

        /**
         * Aggregates the events down to their minimum value
         *
         * @param {string} fieldPath  Column to find the min of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The min value for the field
         */

    }, {
        key: "min",
        value: function min(fieldPath, filter) {
            return this.aggregate((0, _functions.min)(filter), fieldPath);
        }

        /**
         * Aggregates the events down to their mean (same as avg)
         *
         * @param {string} fieldPath  Column to find the mean of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The mean
         */

    }, {
        key: "mean",
        value: function mean(fieldPath, filter) {
            return this.avg(fieldPath, filter);
        }

        /**
         * Aggregates the events down to their minimum value
         *
         * @param {string} fieldPath  Column to find the median of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The median value
         */

    }, {
        key: "median",
        value: function median(fieldPath, filter) {
            return this.aggregate((0, _functions.median)(filter), fieldPath);
        }

        /**
         * Aggregates the events down to their stdev
         *
         * @param {string} fieldPath  Column to find the stdev of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The resulting stdev value
         */

    }, {
        key: "stdev",
        value: function stdev(fieldPath, filter) {
            return this.aggregate((0, _functions.stdev)(filter), fieldPath);
        }

        /**
         * Gets percentile q within the Collection. This works the same way as numpy.
         *
         * @param  {integer} q        The percentile (should be between 0 and 100)
         *
         * @param {string} fieldPath  Column to find the percentile of. A deep value can be referenced with a
         *                            string.like.this.  If not supplied the `value` column will be
         *                            aggregated.
         *
         * @param  {string} interp    Specifies the interpolation method
         *                            to use when the desired quantile lies between
         *                            two data points. Options are:
         *                            options are:
         *                             * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
         *                             * lower: i.
         *                             * higher: j.
         *                             * nearest: i or j whichever is nearest.
         *                             * midpoint: (i + j) / 2.
         * @param {function} filter   Optional filter function used to clean data before aggregating
         *
         * @return {number}           The percentile
         */

    }, {
        key: "percentile",
        value: function percentile(q, fieldPath) {
            var interp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "linear";
            var filter = arguments[3];

            return this.aggregate((0, _functions.percentile)(q, interp, filter), fieldPath);
        }

        /**
         * Aggregates the events down using a user defined function to
         * do the reduction.
         *
         * @param  {function} func    User defined reduction function. Will be
         *                            passed a list of values. Should return a
         *                            singe value.
         *
         * @param  {String} fieldPath The field to aggregate over
         *
         * @return {number}           The resulting value
         */

    }, {
        key: "aggregate",
        value: function aggregate(func, fieldPath) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var fpath = void 0;
            if (!_underscore2.default.isFunction(func)) {
                throw new Error("First arg to aggregate() must be a function");
            }

            if (_underscore2.default.isString(fieldPath)) {
                fpath = fieldPath;
            } else if (_underscore2.default.isArray(fieldPath)) {
                // if the ['array', 'style', 'fieldpath'] is being used,
                // we need to turn it back into a string since we are
                // using a subset of the the map() functionality on
                // a single column
                fpath = fieldPath.split(".");
            } else if (_underscore2.default.isUndefined(fieldPath)) {
                // map() needs a field name to use as a key. Normally
                // this case is normally handled by _field_spec_to_array()
                // inside get(). Also, if map(func, field_spec=None) then
                // it will map all the columns.
                fpath = "value";
            } else {
                throw new Error("Collection.aggregate() takes a string/array fieldPath");
            }

            var result = _event2.default.mapReduce(this.eventListAsArray(), fpath, func, options);
            return result[fpath];
        }

        /**
         * Gets n quantiles within the Collection. This works the same way as numpy.
         *
         * @param  {integer} n        The number of quantiles to divide the
         *                            Collection into.
         *
         * @param  {string} column    The field to return as the quantile
         *
         * @param  {string} interp    Specifies the interpolation method
         *                            to use when the desired quantile lies between
         *                            two data points. Options are:
         *                            options are:
         *                             * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
         *                             * lower: i.
         *                             * higher: j.
         *                             * nearest: i or j whichever is nearest.
         *                             * midpoint: (i + j) / 2.
         *
         * @return {array}            An array of n quantiles
         */

    }, {
        key: "quantile",
        value: function quantile(n) {
            var column = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "value";
            var interp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "linear";

            var results = [];
            var sorted = this.sort(column);
            var subsets = 1.0 / n;

            if (n > this.length) {
                throw new Error("Subset n is greater than the Collection length");
            }

            for (var i = subsets; i < 1; i += subsets) {
                var index = Math.floor((sorted.size() - 1) * i);
                if (index < sorted.size() - 1) {
                    var fraction = (sorted.size() - 1) * i - index;
                    var v0 = sorted.at(index).get(column);
                    var v1 = sorted.at(index + 1).get(column);
                    var v = void 0;

                    if (interp === "lower" || fraction === 0) {
                        v = v0;
                    } else if (interp === "linear") {
                        v = v0 + (v1 - v0) * fraction;
                    } else if (interp === "higher") {
                        v = v1;
                    } else if (interp === "nearest") {
                        v = fraction < 0.5 ? v0 : v1;
                    } else if (interp === "midpoint") {
                        v = (v0 + v1) / 2;
                    }

                    results.push(v);
                }
            }
            return results;
        }

        /**
         * Returns true if all events in this Collection are in chronological order.
         * @return {Boolean} True if all events are in order, oldest events to newest.
         */

    }, {
        key: "isChronological",
        value: function isChronological() {
            var result = true;
            var t = void 0;
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = (0, _getIterator3.default)(this.events()), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var e = _step9.value;

                    if (!t) {
                        t = e.timestamp().getTime();
                    } else {
                        if (e.timestamp() < t) {
                            result = false;
                        }
                        t = e.timestamp();
                    }
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            return result;
        }

        /**
         * STATIC
         */
        /**
          * Static function to compare two collections to each other. If the collections
          * are of the same instance as each other then equals will return true.
          *
          * @param  {Collection} collection1
          * @param  {Collection} collection2
          *
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
          *
          * @param  {Collection} collection1
          * @param  {Collection} collection2
          *
          * @return {bool} result
          */

    }, {
        key: "is",
        value: function is(collection1, collection2) {
            return collection1._type === collection2._type && _immutable2.default.is(collection1._eventList, collection2._eventList);
        }
    }]);
    return Collection;
}(_bounded2.default); /*
                       *  Copyright (c) 2016-2017, The Regents of the University of California,
                       *  through Lawrence Berkeley National Laboratory (subject to receipt
                       *  of any required approvals from the U.S. Dept. of Energy).
                       *  All rights reserved.
                       *
                       *  This source code is licensed under the BSD-style license found in the
                       *  LICENSE file in the root directory of this source tree.
                       */

exports.default = Collection;