"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _immutable = _interopRequireDefault(require("immutable"));

var _event = _interopRequireDefault(require("./event"));

var _util = _interopRequireDefault(require("./base/util"));

/*
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * The creation of an TimeEvent is done by combining two parts:
 *  * the timestamp
 *  * the data
 *
 * To specify the data you can supply:

 *  * a Javascript object of key/values. The object may contained nested data.
 *  * an Immutable.Map
 *  * a simple type such as an integer. This is a shorthand for supplying {"value": v}.
 *
 * Example:
 *
 * ```
 * const t = new Date("2015-04-22T03:30:00Z");
 * const event1 = new TimeEvent(t, { a: 5, b: 6 });
 * ```
 */
class TimeEvent extends _event.default {
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
  constructor(arg1, arg2) {
    super();

    if (arg1 instanceof TimeEvent) {
      var other = arg1;
      this._d = other._d;
      return;
    } else if (arg1 instanceof _immutable.default.Map && arg1.has("time") && arg1.has("data")) {
      this._d = arg1;
      return;
    }

    var time = _util.default.timestampFromArg(arg1);

    var data = _util.default.dataFromArg(arg2);

    this._d = new _immutable.default.Map({
      time,
      data
    });
  }
  /**
   * Returns the timestamp (as ms since the epoch)
   */


  key() {
    return this.timestamp().getTime();
  }
  /**
   * Returns the Event as a JSON object, essentially:
   *  {time: t, data: {key: value, ...}}
   * @return {Object} The event as JSON.
   */


  toJSON() {
    return {
      time: this.timestamp().getTime(),
      data: this.data().toJSON()
    };
  }
  /**
   * Returns a flat array starting with the timestamp, followed by the values.
   */


  toPoint(columns) {
    var values = [];
    columns.forEach(c => {
      var v = this.data().get(c);
      values.push(v === "undefined" ? null : v);
    });
    return [this.timestamp().getTime(), ...values];
  }
  /**
   * The timestamp of this data, in UTC time, as a string.
   */


  timestampAsUTCString() {
    return this.timestamp().toUTCString();
  }
  /**
   * The timestamp of this data, in Local time, as a string.
   */


  timestampAsLocalString() {
    return this.timestamp().toString();
  }
  /**
   * The timestamp of this data
   */


  timestamp() {
    return this._d.get("time");
  }
  /**
   * The begin time of this Event, which will be just the timestamp
   */


  begin() {
    return this.timestamp();
  }
  /**
   * The end time of this Event, which will be just the timestamp
   */


  end() {
    return this.timestamp();
  }
  /**
   * Turn the Collection data into a string
   * @return {string} The collection as a string
   */


  stringify() {
    return JSON.stringify(this.data());
  }

}

var _default = TimeEvent;
exports.default = _default;