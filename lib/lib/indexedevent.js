"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function indexFromArgs(arg1) {
    var arg2 = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    if (_underscore2.default.isString(arg1)) {
        return new _index2.default(arg1, arg2);
    } else if (arg1 instanceof _index2.default) {
        return arg1;
    } else {
        throw new Error("Unable to get index from " + arg1 + ". Should be a string or Index.");
    }
} /*
   *  Copyright (c) 2015, The Regents of the University of California,
   *  through Lawrence Berkeley National Laboratory (subject to receipt
   *  of any required approvals from the U.S. Dept. of Energy).
   *  All rights reserved.
   *
   *  This source code is licensed under the BSD-style license found in the
   *  LICENSE file in the root directory of this source tree.
   */

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

/**
 * An IndexedEvent uses an Index to specify a timerange over which the event
 * occurs and maps that to a data object representing some measurement or metric
 * during that time range.
 *
 * You can supply the index as a string or as an Index object.
 *
 * Example Indexes are:
 *     - 1d-1565 is the entire duration of the 1565th day since the UNIX epoch
 *     - 2014-03 is the entire duration of march in 2014
 *
 * The range, as expressed by the Index, is provided by the convenience method
 * `range()`, which returns a TimeRange instance. Alternatively the begin
 * and end times represented by the Index can be found with `begin()`
 * and `end()` respectively.
 *
 * The data is also specified during construction, and is generally expected to
 * be an object or an Immutable.Map. If an object is provided it will be stored
 * internally as an ImmutableMap. If the data provided is some other type then
 * it will be equivalent to supplying an object of `{value: data}`. Data may be
 * undefined.
 *
 * The get the data out of an IndexedEvent instance use `data()`. It will return
 * an Immutable.Map.
 */

var IndexedEvent = function () {

    /**
     * The creation of an IndexedEvent is done by combining two parts:
     * the Index and the data.
     *
     * To construct you specify an Index, along with the data.
     *
     * The index may be an Index, or a string.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */

    function IndexedEvent(arg1, arg2, arg3) {
        (0, _classCallCheck3.default)(this, IndexedEvent);

        if (arg1 instanceof IndexedEvent) {
            var other = arg1;
            this._d = other._d;
            return;
        } else if (arg1 instanceof _immutable2.default.Map) {
            this._d = arg1;
            return;
        }
        var index = indexFromArgs(arg1, arg3);
        var data = dataFromArg(arg2);
        this._d = new _immutable2.default.Map({ index: index, data: data });
    }

    (0, _createClass3.default)(IndexedEvent, [{
        key: "toJSON",
        value: function toJSON() {
            return {
                index: this.indexAsString(),
                data: this.data().toJSON()
            };
        }
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
            return [this.indexAsString()].concat((0, _toConsumableArray3.default)(_underscore2.default.values(this.data().toJSON())));
        }

        /**
         * Returns the Index associated with the data in this Event
         * @return {Index} The Index
         */

    }, {
        key: "index",
        value: function index() {
            return this._d.get("index");
        }

        /**
         * Sets the data of the event and returns a new IndexedEvent.
         */

    }, {
        key: "setData",
        value: function setData(data) {
            var d = this._d.set("data", dataFromArg(data));
            return new IndexedEvent(d);
        }

        /**
         * Access the event data
         * @return {Immutable.Map} Data for the Event
         */

    }, {
        key: "data",
        value: function data() {
            return this._d.get("data");
        }

        /**
         * Returns the Index as a string, same as event.index().toString()
         * @return {string} The Index
         */

    }, {
        key: "indexAsString",
        value: function indexAsString() {
            return this.index().asString();
        }

        /**
         * The TimeRange of this data, in UTC, as a string.
         * @return {string} TimeRange of this data.
         */

    }, {
        key: "timerangeAsUTCString",
        value: function timerangeAsUTCString() {
            return this.timerange().toUTCString();
        }

        /**
         * The TimeRange of this data, in Local time, as a string.
         * @return {string} TimeRange of this data.
         */

    }, {
        key: "timerangeAsLocalString",
        value: function timerangeAsLocalString() {
            return this.timerange().toLocalString();
        }

        /**
         * The TimeRange of this data
         * @return {TimeRange} TimeRange of this data.
         */

    }, {
        key: "timerange",
        value: function timerange() {
            return this.index().asTimerange();
        }

        /**
         * The begin time of this Event
         * @return {Data} Begin time
         */

    }, {
        key: "begin",
        value: function begin() {
            return this.timerange().begin();
        }

        /**
         * The end time of this Event
         * @return {Data} End time
         */

    }, {
        key: "end",
        value: function end() {
            return this.timerange().end();
        }

        /**
         * Alias for the begin() time.
         * @return {Data} Time representing this Event
         */

    }, {
        key: "timestamp",
        value: function timestamp() {
            return this.begin();
        }

        /**
         * Get specific data out of the Event. The data will be converted
         * to a js object. You can use a fieldSpec to address deep data.
         * A fieldSpec could be "a.b"
         */

    }, {
        key: "get",
        value: function get() {
            var fieldSpec = arguments.length <= 0 || arguments[0] === undefined ? ["value"] : arguments[0];

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
    }, {
        key: "value",
        value: function value(fieldSpec) {
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

            var append = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            var data = append ? this.data().toJS() : {};
            var d = fieldSpecList.map(function (fs) {
                return _this.get(fs);
            });
            data[name] = reducer(d);
            return this.setData(data);
        }
    }]);
    return IndexedEvent;
}();

exports.default = IndexedEvent;