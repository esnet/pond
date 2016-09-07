"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _indexedevent = require("./indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _timerangeevent = require("./timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _functions = require("./base/functions");

var _util = require("./base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
There are three types of Events in Pond:

1. *Event* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

### Construction

The creation of an Event is done by combining two parts: the timestamp (or time range, or Index...) and the data, along with an optional key which is described below.

 * For a basic `Event`, you specify the timestamp as either a Javascript Date object, a Moment, or the number of milliseconds since the UNIX epoch.

 * For a `TimeRangeEvent`, you specify a TimeRange, along with the data.

 * For a `IndexedEvent`, you specify an Index, along with the data, and if the event should be considered to be in UTC time or not.

To specify the data you can supply:

 * a Javascript object of key/values. The object may contained nested data.

 * an Immutable.Map

 * a simple type such as an integer. This is a shorthand for supplying {"value": v}.

**Example:**

Given some source of data that looks like this:

```json
const sampleEvent = {
    "start_time": "2015-04-22T03:30:00Z",
    "end_time": "2015-04-22T13:00:00Z",
    "description": "At 13:33 pacific circuit 06519 went down.",
    "title": "STAR-CR5 - Outage",
    "completed": true,
    "external_ticket": "",
    "esnet_ticket": "ESNET-20150421-013",
    "organization": "Internet2 / Level 3",
    "type": "U"
}
```

We first extract the begin and end times to build a TimeRange:

```js
let b = new Date(sampleEvent.start_time);
let e = new Date(sampleEvent.end_time);
let timerange = new TimeRange(b, e);
```

Then we combine the TimeRange and the event itself to create the Event.

```js
let outageEvent = new TimeRangeEvent(timerange, sampleEvent);
```

Once we have an event we can get access the time range with:

```js
outageEvent.begin().getTime()   // 1429673400000
outageEvent.end().getTime())    // 1429707600000
outageEvent.humanizeDuration()) // "10 hours"
```

And we can access the data like so:

```js
outageEvent.get("title")  // "STAR-CR5 - Outage"
```

Or use:

```js
outageEvent.data()
```

to fetch the whole data object, which will be an Immutable Map.
*/

var Event = function () {

    /**
     * The creation of an Event is done by combining two parts:
     * the timestamp and the data.
     *
     * To construct you specify the timestamp as either:
     *     - Javascript Date object
     *     - a Moment, or
     *     - millisecond timestamp: the number of ms since the UNIX epoch
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */

    function Event(arg1, arg2) {
        (0, _classCallCheck3.default)(this, Event);

        if (arg1 instanceof Event) {
            var other = arg1;
            this._d = other._d;
            return;
        }
        if (arg1 instanceof _immutable2.default.Map && arg1.has("time") && arg1.has("data")) {
            this._d = arg1;
            return;
        }
        var time = timestampFromArg(arg1);
        var data = dataFromArg(arg2);
        this._d = new _immutable2.default.Map({ time: time, data: data });
    }

    /**
     * Returns the Event as a JSON object, essentially:
     *  {time: t, data: {key: value, ...}}
     * @return {Object} The event as JSON.
     */


    (0, _createClass3.default)(Event, [{
        key: "toJSON",
        value: function toJSON() {
            return {
                time: this.timestamp().getTime(),
                data: this.data().toJSON()
            };
        }

        /**
         * Retruns the Event as a string, useful for serialization.
         * @return {string} The Event as a string
         */

    }, {
        key: "toString",
        value: function toString() {
            return (0, _stringify2.default)(this.toJSON());
        }

        /**
         * Returns a flat array starting with the timestamp, followed by the values.
         */

    }, {
        key: "toPoint",
        value: function toPoint() {
            return [this.timestamp().getTime()].concat((0, _toConsumableArray3.default)(_underscore2.default.values(this.data().toJSON())));
        }

        /**
         * The timestamp of this data, in UTC time, as a string.
         */

    }, {
        key: "timestampAsUTCString",
        value: function timestampAsUTCString() {
            return this.timestamp().toUTCString();
        }

        /**
         * The timestamp of this data, in Local time, as a string.
         */

    }, {
        key: "timestampAsLocalString",
        value: function timestampAsLocalString() {
            return this.timestamp().toString();
        }

        /**
         * The timestamp of this data
         */

    }, {
        key: "timestamp",
        value: function timestamp() {
            return this._d.get("time");
        }

        /**
         * The begin time of this Event, which will be just the timestamp
         */

    }, {
        key: "begin",
        value: function begin() {
            return this.timestamp();
        }

        /**
         * The end time of this Event, which will be just the timestamp
         */

    }, {
        key: "end",
        value: function end() {
            return this.timestamp();
        }

        /**
         * Direct access to the event data. The result will be an Immutable.Map.
         */

    }, {
        key: "data",
        value: function data() {
            return this._d.get("data");
        }

        /**
         * Sets the data portion of the event and returns a new Event.
         */

    }, {
        key: "setData",
        value: function setData(data) {
            var d = this._d.set("data", dataFromArg(data));
            return new Event(d);
        }

        /**
         * Get specific data out of the Event. The data will be converted
         * to a js object. You can use a fieldPath to address deep data.
         * @param  {Array}  fieldPath   Name of value to look up. If not provided,
         *                              defaults to ['value']. "Deep" syntax is
         *                              ['deep', 'value'] or 'deep.value.'
         * @return                      The value of the field
         */

    }, {
        key: "get",
        value: function get(fieldPath) {
            var v = void 0;
            var fspec = _util2.default.fieldPathToArray(fieldPath);
            v = this.data().getIn(fspec);
            if (v instanceof _immutable2.default.Map || v instanceof _immutable2.default.List) {
                return v.toJS();
            }
            return v;
        }

        /**
         * Get specific data out of the Event. Alias for get(). The data will
         * be converted to a js object. You can use a fieldPath to address deep data.
         * @param  {Array}  fieldPath   Name of value to look up. If not provided,
         *                              defaults to ['value']. "Deep" syntax is
         *                              ['deep', 'value'] or 'deep.value.'
         * @return                      The value of the field
         */

    }, {
        key: "value",
        value: function value(fieldSpec) {
            return this.get(fieldSpec);
        }

        /**
         * Turn the Collection data into a string
         * @return {string} The collection as a string
         */

    }, {
        key: "stringify",
        value: function stringify() {
            return (0, _stringify2.default)(this.data());
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

            var append = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            var data = append ? this.data().toJS() : {};
            var d = fieldSpecList.map(function (fs) {
                return _this.get(fs);
            });
            data[name] = reducer(d);
            return this.setData(data);
        }
    }], [{
        key: "is",
        value: function is(event1, event2) {
            return _immutable2.default.is(event1._d, event2._d);
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
    }, {
        key: "mergeEvents",
        value: function mergeEvents(events) {
            var t = events[0].timestamp();
            var data = {};
            _underscore2.default.each(events, function (event) {
                if (!event instanceof Event) {
                    var msg = "Events being merged must have the same type";
                    throw new Error(msg);
                }

                if (t.getTime() !== event.timestamp().getTime()) {
                    var _msg = "Events being merged must have the same timestamp";
                    throw new Error(_msg);
                }

                var d = event.toJSON().data;
                _underscore2.default.each(d, function (val, key) {
                    if (_underscore2.default.has(data, key)) {
                        var _msg2 = "Events being merged may not have the same key '" + key + "'";
                        throw new Error(_msg2);
                    }
                    data[key] = val;
                });
            });

            var e = new Event(t.getTime(), data);
            return e;
        }
    }, {
        key: "mergeTimeRangeEvents",
        value: function mergeTimeRangeEvents(events) {
            var timerange = events[0].timerange();
            var data = {};
            _underscore2.default.each(events, function (event) {
                if (!event instanceof _timerangeevent2.default) {
                    var msg = "Events being merged must have the same type";
                    throw new Error(msg);
                }

                if (timerange.toUTCString() !== event.timerange().toUTCString()) {
                    var _msg3 = "Events being merged must have the same timerange";
                    throw new Error(_msg3);
                }

                var d = event.toJSON().data;
                _underscore2.default.each(d, function (val, key) {
                    if (_underscore2.default.has(data, key)) {
                        var _msg4 = "Events being merged may not have the same key '" + key + "'";
                        throw new Error(_msg4);
                    }
                    data[key] = val;
                });
            });

            return new _timerangeevent2.default(timerange, data);
        }
    }, {
        key: "mergeIndexedEvents",
        value: function mergeIndexedEvents(events) {
            var index = events[0].indexAsString();
            var data = {};
            _underscore2.default.each(events, function (event) {
                if (!event instanceof _indexedevent2.default) {
                    throw new Error("Events being merged must have the same type");
                }

                if (index !== event.indexAsString()) {
                    throw new Error("Events being merged must have the same index");
                }

                var d = event.toJSON().data;
                _underscore2.default.each(d, function (val, key) {
                    if (_underscore2.default.has(data, key)) {
                        var msg = "Events being merged may not have the same key '" + key + "'";
                        throw new Error(msg);
                    }
                    data[key] = val;
                });
            });
            return new _indexedevent2.default(index, data);
        }
    }, {
        key: "merge",
        value: function merge(events) {
            if (events.length < 1) {
                return;
            } else if (events.length === 1) {
                return events[0];
            }

            if (events[0] instanceof Event) {
                return Event.mergeEvents(events);
            } else if (events[0] instanceof _timerangeevent2.default) {
                return Event.mergeTimeRangeEvents(events);
            } else if (events[0] instanceof _indexedevent2.default) {
                return Event.mergeIndexedEvents(events);
            }
        }

        /**
         * Combines multiple events with the same time together
         * to form a new event. Doesn't currently work on IndexedEvents
         * or TimeRangeEvents.
         *
         * @param {array}        events     Array of event objects
         * @param {string|array} fieldSpec  Column or columns to look up. If you need
         *                                  to retrieve multiple deep nested values that
         *                                  ['can.be', 'done.with', 'this.notation'].
         *                                  A single deep value with a string.like.this.
         *                                  If not supplied, all columns will be operated on.
         * @param {function}     reducer    Reducer function to apply to column data.
         */

    }, {
        key: "combine",
        value: function combine(events, fieldSpec, reducer) {
            if (events.length < 1) {
                return;
            }
            var mapped = Event.map(events, function (event) {
                var mapEvent = {};
                // Which field do we want to work with
                var fieldNames = [];
                if (!fieldSpec) {
                    fieldNames = _underscore2.default.map(event.data().toJSON(), function (value, fieldName) {
                        return fieldName;
                    });
                } else if (_underscore2.default.isString(fieldSpec)) {
                    fieldNames = [fieldSpec];
                } else if (_underscore2.default.isArray(fieldSpec)) {
                    fieldNames = fieldSpec;
                }
                // Map the fields, along with the timestamp, to the value
                _underscore2.default.each(fieldNames, function (fieldName) {
                    mapEvent[event.timestamp().getTime() + "::" + fieldName] = event.data().get(fieldName);
                });

                return mapEvent;
            });

            var eventData = {};
            _underscore2.default.each(Event.reduce(mapped, reducer), function (value, key) {
                var _key$split = key.split("::");

                var _key$split2 = (0, _slicedToArray3.default)(_key$split, 2);

                var timestamp = _key$split2[0];
                var fieldName = _key$split2[1];

                if (!_underscore2.default.has(eventData, timestamp)) {
                    eventData[timestamp] = {};
                }
                eventData[timestamp][fieldName] = value;
            });

            return _underscore2.default.map(eventData, function (data, timestamp) {
                return new Event(+timestamp, data);
            });
        }

        /**
         * Sum takes multiple events, groups them by timestamp, and uses combine()
         * to add them together. If the events do not have the same timestamp an
         * exception will be thrown.
         *
         * @param {array}        events     Array of event objects
         * @param {string|array} fieldSpec  Column or columns to look up. If you need
         *                                  to retrieve multiple deep nested values that
         *                                  ['can.be', 'done.with', 'this.notation'].
         *                                  A single deep value with a string.like.this.
         *                                  If not supplied, all columns will be operated on.
         */

    }, {
        key: "sum",
        value: function sum(events, fieldSpec) {
            // Since all the events should be of the same time
            // we can just take the first result from combine
            var t = void 0;
            events.forEach(function (e) {
                if (!t) t = e.timestamp().getTime();
                if (t !== e.timestamp().getTime()) {
                    throw new Error("sum() expects all events to have the same timestamp");
                }
            });

            return Event.combine(events, fieldSpec, (0, _functions.sum)())[0];
        }

        /**
         * Sum takes multiple events, groups them by timestamp, and uses combine()
         * to average them. If the events do not have the same timestamp an
         * exception will be thrown.
         *
         * @param {array}        events     Array of event objects
         * @param {string|array} fieldSpec  Column or columns to look up. If you need
         *                                  to retrieve multiple deep nested values that
         *                                  ['can.be', 'done.with', 'this.notation'].
         *                                  A single deep value with a string.like.this.
         *                                  If not supplied, all columns will be operated on.
         */

    }, {
        key: "avg",
        value: function avg(events, fieldSpec) {
            return Event.combine(events, fieldSpec, (0, _functions.avg)())[0];
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
            var multiFieldSpec = arguments.length <= 1 || arguments[1] === undefined ? "value" : arguments[1];

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
                (function () {
                    var fieldSpec = multiFieldSpec;
                    events.forEach(function (event) {
                        if (!_underscore2.default.has(result, fieldSpec)) {
                            result[fieldSpec] = [];
                        }
                        var value = event.get(fieldSpec);

                        result[fieldSpec].push(value);
                    });
                })();
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
      *  Copyright (c) 2015, The Regents of the University of California,
      *  through Lawrence Berkeley National Laboratory (subject to receipt
      *  of any required approvals from the U.S. Dept. of Energy).
      *  All rights reserved.
      *
      *  This source code is licensed under the BSD-style license found in the
      *  LICENSE file in the root directory of this source tree.
      */

function timestampFromArg(arg) {
    if (_underscore2.default.isNumber(arg)) {
        return new Date(arg);
    } else if (_underscore2.default.isDate(arg)) {
        return new Date(arg.getTime());
    } else if (_moment2.default.isMoment(arg)) {
        return new Date(arg.valueOf());
    } else {
        throw new Error("Unable to get timestamp from " + arg + ". Should be a number, date, or moment.");
    }
}

function dataFromArg(arg) {
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

exports.default = Event;