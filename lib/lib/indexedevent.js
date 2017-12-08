"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _event = require("./event");

var _event2 = _interopRequireDefault(_event);

var _util = require("./base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * An `IndexedEvent` uses an `Index` to specify a timerange over which the event
 * occurs and maps that to a data object representing some measurement or metric
 * during that time range.
 *
 * You can supply the index as a string or as an Index object.
 *
 * Example Indexes are:
 *  * 1d-1565 is the entire duration of the 1565th day since the UNIX epoch
 *  * 2014-03 is the entire duration of march in 2014
 *
 * The range, as expressed by the `Index`, is provided by the convenience method
 * `range()`, which returns a `TimeRange` instance. Alternatively the begin
 * and end times represented by the Index can be found with `begin()`
 * and `end()` respectively.
 *
 * The data is also specified during construction, and is generally expected to
 * be an object or an Immutable Map. If an object is provided it will be stored
 * internally as an Immutable Map. If the data provided is some other type then
 * it will be equivalent to supplying an object of `{value: data}`. Data may be
 * undefined.
 *
 * The get the data out of an IndexedEvent instance use `data()`. It will return
 * an Immutable.Map.
 */
/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var IndexedEvent = function (_Event) {
    (0, _inherits3.default)(IndexedEvent, _Event);

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

        var _this = (0, _possibleConstructorReturn3.default)(this, (IndexedEvent.__proto__ || (0, _getPrototypeOf2.default)(IndexedEvent)).call(this));

        if (arg1 instanceof IndexedEvent) {
            var other = arg1;
            _this._d = other._d;
            return (0, _possibleConstructorReturn3.default)(_this);
        } else if (arg1 instanceof _immutable2.default.Map) {
            _this._d = arg1;
            return (0, _possibleConstructorReturn3.default)(_this);
        }
        var index = _util2.default.indexFromArgs(arg1, arg3);
        var data = _util2.default.dataFromArg(arg2);
        _this._d = new _immutable2.default.Map({ index: index, data: data });
        return _this;
    }

    /**
     * Returns the timestamp (as ms since the epoch)
     */


    (0, _createClass3.default)(IndexedEvent, [{
        key: "key",
        value: function key() {
            return this.indexAsString();
        }

        /**
         * For Avro serialization, this defines the event's key (the Index)
         * as a simple string
         */

    }, {
        key: "toJSON",


        /**
         * Express the IndexedEvent as a JSON object
         */
        value: function toJSON() {
            return { index: this.indexAsString(), data: this.data().toJSON() };
        }

        /**
         * Returns a flat array starting with the index, followed by the values.
         */

    }, {
        key: "toPoint",
        value: function toPoint(columns) {
            var _this2 = this;

            var values = [];
            columns.forEach(function (c) {
                var v = _this2.data().get(c);
                values.push(v === "undefined" ? null : v);
            });
            return [this.indexAsString()].concat(values);
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
    }], [{
        key: "keySchema",
        value: function keySchema() {
            return { name: "index", type: "string" };
        }
    }]);
    return IndexedEvent;
}(_event2.default);

exports.default = IndexedEvent;