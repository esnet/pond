"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

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
/*
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var TimeEvent = function (_Event) {
    (0, _inherits3.default)(TimeEvent, _Event);


    /**
     * The creation of an TimeEvent is done by combining two parts:
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

    function TimeEvent(arg1, arg2) {
        (0, _classCallCheck3.default)(this, TimeEvent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TimeEvent).call(this));

        if (arg1 instanceof TimeEvent) {
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
            _this._d = new _immutable2.default.Map();
            _this._d = _this._d.set("time", new Date(avroData.time));
            _this._d = _this._d.set("data", new _immutable2.default.Map(avroData.data));
            return (0, _possibleConstructorReturn3.default)(_this);
        } else if (arg1 instanceof _immutable2.default.Map && arg1.has("time") && arg1.has("data")) {
            _this._d = arg1;
            return (0, _possibleConstructorReturn3.default)(_this);
        }
        var time = _util2.default.timestampFromArg(arg1);
        var data = _util2.default.dataFromArg(arg2);
        _this._d = new _immutable2.default.Map({ time: time, data: data });
        return _this;
    }

    /**
     * Returns the timestamp (as ms since the epoch)
     */


    (0, _createClass3.default)(TimeEvent, [{
        key: "key",
        value: function key() {
            return this.timestamp().getTime();
        }

        /**
         * For Avro serialization, this defines the event's key (the timestamp)
         * as a simple a long (logicalType of timestamp milliseconds)
         */

    }, {
        key: "toJSON",


        /**
         * Returns the Event as a JSON object, essentially:
         *  {time: t, data: {key: value, ...}}
         * @return {Object} The event as JSON.
         */
        value: function toJSON() {
            return {
                time: this.timestamp().getTime(),
                data: this.data().toJSON()
            };
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
         * Turn the Collection data into a string
         * @return {string} The collection as a string
         */

    }, {
        key: "stringify",
        value: function stringify() {
            return (0, _stringify2.default)(this.data());
        }
    }], [{
        key: "keySchema",
        value: function keySchema() {
            return {
                name: "time",
                type: {
                    type: "long",
                    logicalType: "timestamp-millis"
                }
            };
        }
    }]);
    return TimeEvent;
}(_event2.default);

exports.default = TimeEvent;