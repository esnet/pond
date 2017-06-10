"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _util = require("./base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
There are three types of Events in Pond, while this class provides the base class
for them all:

1. *TimeEvent* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

Event contains several static methods that may be useful, though in general
are used by the Collection and TimeSeries classes. So, if you already have a
TimeSeries or Collection you may want to examine the API there to see if you
can do what you want to do.
*/
var Event = function () {
    function Event() {
        (0, _classCallCheck3.default)(this, Event);

        if (this.constructor.name === "Event") {
            throw new TypeError("Cannot construct Event instances directly");
        }
    }

    /**
     * Express the event as a string
     */


    (0, _createClass3.default)(Event, [{
        key: "toString",
        value: function toString() {
            if (this.toJSON === undefined) {
                throw new TypeError("Must implement toJSON()");
            }
            return (0, _stringify2.default)(this.toJSON());
        }

        /**
         * Returns the type of this class instance
         */

    }, {
        key: "type",
        value: function type() {
            return this.constructor;
        }

        /**
         * Sets the data of the event and returns a new event of the
         * same type.
         *
         * @param {object}  data    New data for the event
         * @return {object}         A new event
         */

    }, {
        key: "setData",
        value: function setData(data) {
            var eventType = this.type();
            var d = this._d.set("data", _util2.default.dataFromArg(data));
            return new eventType(d);
        }

        /**
         * Access the event data in its native form. The result
         * will be an Immutable.Map.
         *
         * @return {Immutable.Map} Data for the Event
         */

    }, {
        key: "data",
        value: function data() {
            return this._d.get("data");
        }

        /**
         * Get specific data out of the event. The data will be converted
         * to a JS Object. You can use a `fieldSpec` to address deep data.
         * A `fieldSpec` could be "a.b"
         */

    }, {
        key: "get",
        value: function get() {
            var fieldSpec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ["value"];

            var v = void 0;
            if (_underscore2.default.isArray(fieldSpec)) {
                v = this.data().getIn(fieldSpec);
            } else if (_underscore2.default.isString(fieldSpec)) {
                var searchKeyPath = fieldSpec.split(".");
                v = this.data().getIn(searchKeyPath);
            }

            if (v instanceof _immutable2.default.Map || v instanceof _immutable2.default.List) {
                return v.toJS();
            }
            return v;
        }

        /**
         * Alias for `get()`.
         */

    }, {
        key: "value",
        value: function value() {
            var fieldSpec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ["value"];

            return this.get(fieldSpec);
        }

        /**
         * Collapses this event's columns, represented by the fieldSpecList
         * into a single column. The collapsing itself is done with the reducer
         * function. Optionally the collapsed column could be appended to the
         * existing columns, or replace them (the default).
         */

    }, {
        key: "collapse",
        value: function collapse(fieldSpecList, name, reducer) {
            var _this = this;

            var append = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            var data = append ? this.data().toJS() : {};
            var d = fieldSpecList.map(function (fs) {
                return _this.get(fs);
            });
            data[name] = reducer(d);
            return this.setData(data);
        }

        //
        // Static Event functions
        //
        /**
         * Do the two supplied events contain the same data,
         * even if they are not the same instance.
         * @param  {Event}  event1 First event to compare
         * @param  {Event}  event2 Second event to compare
         * @return {Boolean}       Result
         */

    }], [{
        key: "is",
        value: function is(event1, event2) {
            return event1.key() === event2.key() && _immutable2.default.is(event1._d.get("data"), event2._d.get("data"));
        }

        /**
         * Returns if the two supplied events are duplicates
         * of each other. By default, duplicated means that the
         * timestamps are the same. This is the case with incoming events
         * where the second event is either known to be the same (but
         * duplicate) of the first, or supersedes the first. You can
         * also pass in false for ignoreValues and get a full
         * compare.
         *
         * @return {Boolean}              The result of the compare
         */

    }, {
        key: "isDuplicate",
        value: function isDuplicate(event1, event2) {
            var ignoreValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            if (ignoreValues) {
                return event1.type() === event2.type() && event1.key() === event2.key();
            } else {
                return event1.type() === event2.type() && Event.is(event1, event2);
            }
        }

        /**
         * The same as Event.value() only it will return false if the
         * value is either undefined, NaN or Null.
         *
         * @param {Event} event The Event to check
         * @param {string|array} The field to check
         */

    }, {
        key: "isValidValue",
        value: function isValidValue(event, fieldPath) {
            var v = event.value(fieldPath);
            var invalid = _underscore2.default.isUndefined(v) || _underscore2.default.isNaN(v) || _underscore2.default.isNull(v);
            return !invalid;
        }

        /**
         * Function to select specific fields of an event using
         * a fieldPath and return a new event with just those fields.
         *
         * The fieldPath currently can be:
         *  * A single field name
         *  * An array of field names
         *
         * The function returns a new event.
         */

    }, {
        key: "selector",
        value: function selector(event, fieldPath) {
            var data = {};
            if (_underscore2.default.isString(fieldPath)) {
                var fieldName = fieldPath;
                var value = event.get(fieldName);
                data[fieldName] = value;
            } else if (_underscore2.default.isArray(fieldPath)) {
                _underscore2.default.each(fieldPath, function (fieldName) {
                    var value = event.get(fieldName);
                    data[fieldName] = value;
                });
            } else {
                return event;
            }
            return event.setData(data);
        }

        /**
         * Merges multiple `events` together into a new array of events, one
         * for each time/index/timerange of the source events. Merging is done on
         * the data of each event. Values from later events in the list overwrite
         * early values if fields conflict.
         *
         * Common use cases:
         *   - append events of different timestamps
         *   - merge in events with one field to events with another
         *   - merge in events that supersede the previous events
         *
         * See also: TimeSeries.timeSeriesListMerge()
         *
         * @param {Immutable.List|array} events  Array or Immutable.List of events
         *
         * @return {Immutable.List|array}        Array or Immutable.List of events
         */

    }, {
        key: "merge",
        value: function merge(events, deep) {
            if (events instanceof _immutable2.default.List && events.size === 0 || _underscore2.default.isArray(events) && events.length === 0) {
                return [];
            }

            //
            // Group by the time (the key), as well as keeping track
            // of the event types so we can check that for a given key
            // they are homogeneous and also so we can build an output
            // event for this key
            //
            var eventMap = {};
            var typeMap = {};

            events.forEach(function (e) {
                var type = e.type();
                var key = e.key();
                if (!_underscore2.default.has(eventMap, key)) {
                    eventMap[key] = [];
                }
                eventMap[key].push(e);

                if (!_underscore2.default.has(typeMap, key)) {
                    typeMap[key] = type;
                } else {
                    if (typeMap[key] !== type) {
                        throw new Error("Events for time " + key + " are not homogeneous");
                    }
                }
            });

            //
            // For each key we'll build a new event of the same type as the source
            // events. Here we loop through all the events for that key, then for each field
            // we are considering, we get all the values and reduce them (sum, avg, etc).
            //
            var outEvents = [];
            _underscore2.default.each(eventMap, function (events, key) {
                var data = _immutable2.default.Map();
                events.forEach(function (event) {
                    data = deep ? data.mergeDeep(event.data()) : data.merge(event.data());
                });
                var type = typeMap[key];
                outEvents.push(new type(key, data));
            });

            // This function outputs the same as its input. If we are
            // passed an Immutable.List of events, the user will get
            // an Immutable.List back. If an array, a simple JS array will
            // be returned.
            if (events instanceof _immutable2.default.List) {
                return _immutable2.default.List(outEvents);
            }
            return outEvents;
        }

        /**
         * Combines multiple `events` together into a new array of events, one
         * for each time/index/timerange of the source events. The list of
         * events may be specified as an array or `Immutable.List`. Combining acts
         * on the fields specified in the `fieldSpec` and uses the reducer
         * function to take the multiple values and reducer them down to one.
         *
         * The return result will be an of the same form as the input. If you
         * pass in an array of events, you will get an array of events back. If
         * you pass an `Immutable.List` of events then you will get an
         * `Immutable.List` of events back.
         *
         * This is the general version of `Event.sum()` and `Event.avg()`. If those
         * common use cases are what you want, just use those functions. If you
         * want to specify your own reducer you can use this function.
         *
         * See also: `TimeSeries.timeSeriesListSum()`
         *
         * @param {Immutable.List|array} events     Array of event objects
         * @param {string|array}         fieldSpec  Column or columns to look up. If you need
         *                                          to retrieve multiple deep nested values that
         *                                          ['can.be', 'done.with', 'this.notation'].
         *                                          A single deep value with a string.like.this.
         *                                          If not supplied, all columns will be operated on.
         * @param {function}             reducer    Reducer function to apply to column data.
         *
         * @return {Immutable.List|array}   An Immutable.List or array of events
         */

    }, {
        key: "combine",
        value: function combine(events, reducer, fieldSpec) {
            if (events instanceof _immutable2.default.List && events.size === 0 || _underscore2.default.isArray(events) && events.length === 0) {
                return [];
            }

            var fieldNames = void 0;
            if (_underscore2.default.isString(fieldSpec)) {
                fieldNames = [fieldSpec];
            } else if (_underscore2.default.isArray(fieldSpec)) {
                fieldNames = fieldSpec;
            }

            var eventMap = {};
            var typeMap = {};

            //
            // Group by the time (the key), as well as keeping track
            // of the event types so we can check that for a given key
            // they are homogeneous and also so we can build an output
            // event for this key
            //
            events.forEach(function (e) {
                var type = e.type();
                var key = e.key();
                if (!_underscore2.default.has(eventMap, key)) {
                    eventMap[key] = [];
                }
                eventMap[key].push(e);
                if (!_underscore2.default.has(typeMap, key)) {
                    typeMap[key] = type;
                } else {
                    if (typeMap[key] !== type) {
                        throw new Error("Events for time " + key + " are not homogeneous");
                    }
                }
            });

            //
            // For each key we'll build a new event of the same type as the source
            // events. Here we loop through all the events for that key, then for each field
            // we are considering, we get all the values and reduce them (sum, avg, etc).
            //
            var outEvents = [];
            _underscore2.default.each(eventMap, function (events, key) {
                var mapEvent = {};
                events.forEach(function (event) {
                    var fields = fieldNames;
                    if (!fieldNames) {
                        fields = _underscore2.default.map(event.data().toJSON(), function (value, fieldName) {
                            return fieldName;
                        });
                    }
                    fields.forEach(function (fieldName) {
                        if (!mapEvent[fieldName]) {
                            mapEvent[fieldName] = [];
                        }
                        mapEvent[fieldName].push(event.data().get(fieldName));
                    });
                });

                var data = {};
                _underscore2.default.map(mapEvent, function (values, fieldName) {
                    data[fieldName] = reducer(values);
                });

                var type = typeMap[key];
                outEvents.push(new type(key, data));
            });

            // This function outputs the same as its input. If we are
            // passed an Immutable.List of events, the user will get
            // an Immutable.List back. If an array, a simple JS array will
            // be returned.
            if (events instanceof _immutable2.default.List) {
                return _immutable2.default.List(outEvents);
            }
            return outEvents;
        }

        /**
         * Returns a function that will take a list of events and combine them
         * together using the fieldSpec and reducer function provided. This is
         * used as an event reducer for merging multiple TimeSeries together
         * with `timeSeriesListReduce()`.
         */

    }, {
        key: "combiner",
        value: function combiner(fieldSpec, reducer) {
            return function (events) {
                return Event.combine(events, reducer, fieldSpec);
            };
        }

        /**
         * Returns a function that will take a list of events and merge them
         * together using the fieldSpec provided. This is used as a reducer for
         * merging multiple TimeSeries together with `timeSeriesListMerge()`.
         */

    }, {
        key: "merger",
        value: function merger(fieldSpec) {
            return function (events) {
                return Event.merge(events, fieldSpec);
            };
        }

        /**
         * Maps a list of events according to the fieldSpec
         * passed in. The spec maybe a single field name, a
         * list of field names, or a function that takes an
         * event and returns a key/value pair.
         *
         * @example
         * ````
         *         in   out
         *  3am    1    2
         *  4am    3    4
         *
         * Mapper result:  { in: [1, 3], out: [2, 4]}
         * ```
         * @param {string|array} fieldSpec  Column or columns to look up. If you need
         *                                  to retrieve multiple deep nested values that
         *                                  ['can.be', 'done.with', 'this.notation'].
         *                                  A single deep value with a string.like.this.
         *                                  If not supplied, all columns will be operated on.
         *                                  If field_spec is a function, the function should
         *                                  return a map. The keys will be come the
         *                                  "column names" that will be used in the map that
         *                                  is returned.
         */

    }, {
        key: "map",
        value: function map(evts) {
            var multiFieldSpec = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "value";

            var result = {};

            var events = void 0;
            if (evts instanceof _immutable2.default.List) {
                events = evts;
            } else if (_underscore2.default.isArray(evts)) {
                events = new _immutable2.default.List(evts);
            } else {
                throw new Error("Unknown event list type. Should be an array or Immutable List");
            }

            if (_underscore2.default.isString(multiFieldSpec)) {
                var fieldSpec = multiFieldSpec;
                events.forEach(function (event) {
                    if (!_underscore2.default.has(result, fieldSpec)) {
                        result[fieldSpec] = [];
                    }
                    var value = event.get(fieldSpec);

                    result[fieldSpec].push(value);
                });
            } else if (_underscore2.default.isArray(multiFieldSpec)) {
                _underscore2.default.each(multiFieldSpec, function (fieldSpec) {
                    events.forEach(function (event) {
                        if (!_underscore2.default.has(result, fieldSpec)) {
                            result[fieldSpec] = [];
                        }
                        result[fieldSpec].push(event.get(fieldSpec));
                    });
                });
            } else if (_underscore2.default.isFunction(multiFieldSpec)) {
                events.forEach(function (event) {
                    var pair = multiFieldSpec(event);
                    _underscore2.default.each(pair, function (value, key) {
                        if (!_underscore2.default.has(result, key)) {
                            result[key] = [];
                        }
                        result[key].push(value);
                    });
                });
            } else {
                events.forEach(function (event) {
                    _underscore2.default.each(event.data().toJSON(), function (value, key) {
                        if (!_underscore2.default.has(result, key)) {
                            result[key] = [];
                        }
                        result[key].push(value);
                    });
                });
            }
            return result;
        }

        /**
         * Takes a list of events and a reducer function and returns
         * a new Event with the result, for each column. The reducer is
         * of the form:
         * ```
         *     function sum(valueList) {
         *         return calcValue;
         *     }
         * ```
         * @param {map}         mapped      A map, as produced from map()
         * @param {function}    reducer     The reducer function
         */

    }, {
        key: "reduce",
        value: function reduce(mapped, reducer) {
            var result = {};
            _underscore2.default.each(mapped, function (valueList, key) {
                result[key] = reducer(valueList);
            });
            return result;
        }
        /*
         * @param {array}        events     Array of event objects
         * @param {string|array} fieldSpec  Column or columns to look up. If you need
         *                                  to retrieve multiple deep nested values that
         *                                  ['can.be', 'done.with', 'this.notation'].
         *                                  A single deep value with a string.like.this.
         *                                  If not supplied, all columns will be operated on.
         * @param {function}     reducer    The reducer function
         */

    }, {
        key: "mapReduce",
        value: function mapReduce(events, multiFieldSpec, reducer) {
            return Event.reduce(this.map(events, multiFieldSpec), reducer);
        }
    }]);
    return Event;
}(); /*
      *  Copyright (c) 2016-2017, The Regents of the University of California,
      *  through Lawrence Berkeley National Laboratory (subject to receipt
      *  of any required approvals from the U.S. Dept. of Energy).
      *  All rights reserved.
      *
      *  This source code is licensed under the BSD-style license found in the
      *  LICENSE file in the root directory of this source tree.
      */

exports.default = Event;