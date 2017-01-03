"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _timerange = require("./timerange");

var _timerange2 = _interopRequireDefault(_timerange);

var _util = require("./base/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A TimeRangeEvent uses a TimeRange to specify the range over
 * which the event occurs and maps that to a data object representing
 * some measurements or metrics during that time range.
 *
 * You supply the timerange as a TimeRange object.
 *
 * The data is also specified during construction and me be either:
 *  1) a Javascript object or simple type
 *  2) an Immutable.Map.
 *  3) Simple measurement
 *
 * If an Javascript object is provided it will be stored internally as an
 * Immutable Map. If the data provided is some other simple type (such as an
 * integer) then it will be equivalent to supplying an object of {value: data}.
 * Data may also be undefined.
 *
 * To get the data out of an TimeRangeEvent instance use `data()`.
 * It will return an Immutable.Map. Alternatively you can call `toJSON()`
 * to return a Javascript object representation of the data, while
 * `toString()` will serialize the entire event to a string.
 */
var TimeRangeEvent = function (_Event) {
    (0, _inherits3.default)(TimeRangeEvent, _Event);

    /**
     * The creation of an TimeRangeEvent is done by combining two parts:
     * the timerange and the data.
     *
     * To construct you specify a TimeRange, along with the data.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    function TimeRangeEvent(arg1, arg2) {
        (0, _classCallCheck3.default)(this, TimeRangeEvent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TimeRangeEvent.__proto__ || (0, _getPrototypeOf2.default)(TimeRangeEvent)).call(this));

        if (arg1 instanceof TimeRangeEvent) {
            var other = arg1;
            _this._d = other._d;
            return (0, _possibleConstructorReturn3.default)(_this);
        } else if (arg1 instanceof Buffer) {
            var avroData = void 0;
            try {
                avroData = _this.schema().fromBuffer(arg1);
            } catch (err) {
                console.error("Unable to convert supplied avro buffer to event");
            }
            var _range = new _timerange2.default(avroData.timerange);
            var _data = new _immutable2.default.Map(avroData.data);
            _this._d = new _immutable2.default.Map({ range: _range, data: _data });
            return (0, _possibleConstructorReturn3.default)(_this);
        } else if (arg1 instanceof _immutable2.default.Map) {
            _this._d = arg1;
            return (0, _possibleConstructorReturn3.default)(_this);
        }
        var range = _util2.default.timeRangeFromArg(arg1);
        var data = _util2.default.dataFromArg(arg2);
        _this._d = new _immutable2.default.Map({ range: range, data: data });
        return _this;
    }

    /**
     * Returns the timerange as a string
     */


    (0, _createClass3.default)(TimeRangeEvent, [{
        key: "key",
        value: function key() {
            return +this.timerange().begin() + "," + +this.timerange().end();
        }
    }, {
        key: "toJSON",
        value: function toJSON() {
            return {
                timerange: this.timerange().toJSON(),
                data: this.data().toJSON()
            };
        }

        /**
         * For Avro serialization, this defines the event's key
         * (the TimeRange as an array)
         */

    }, {
        key: "toPoint",


        //
        // Access the timerange represented by the index
        //

        /**
         * Returns a flat array starting with the timestamp, followed by the values.
         */
        value: function toPoint() {
            return [this.timerange().toJSON()].concat((0, _toConsumableArray3.default)(_underscore2.default.values(this.data().toJSON())));
        }

        /**
         * The TimeRange of this data
         * @return {TimeRange} TimeRange of this data.
         */

    }, {
        key: "timerange",
        value: function timerange() {
            return this._d.get("range");
        }

        /**
         * The TimeRange of this event, in UTC, as a string.
         * @return {string} TimeRange of this data.
         */

    }, {
        key: "timerangeAsUTCString",
        value: function timerangeAsUTCString() {
            return this.timerange().toUTCString();
        }

        /**
         * The TimeRange of this event, in Local time, as a string.
         * @return {string} TimeRange of this data.
         */

    }, {
        key: "timerangeAsLocalString",
        value: function timerangeAsLocalString() {
            return this.timerange().toLocalString();
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
    }, {
        key: "humanizeDuration",
        value: function humanizeDuration() {
            return this.timerange().humanizeDuration();
        }
    }], [{
        key: "keySchema",
        value: function keySchema() {
            return {
                name: "timerange",
                type: {
                    type: "array",
                    items: "long"
                }
            };
        }
    }]);
    return TimeRangeEvent;
}(_event2.default); /*
                     *  Copyright (c) 2016, The Regents of the University of California,
                     *  through Lawrence Berkeley National Laboratory (subject to receipt
                     *  of any required approvals from the U.S. Dept. of Energy).
                     *  All rights reserved.
                     *
                     *  This source code is licensed under the BSD-style license found in the
                     *  LICENSE file in the root directory of this source tree.
                     */

exports.default = TimeRangeEvent;