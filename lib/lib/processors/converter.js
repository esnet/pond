"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _processor = _interopRequireDefault(require("./processor"));

var _index = _interopRequireDefault(require("../index"));

var _timeevent = _interopRequireDefault(require("../timeevent"));

var _indexedevent = _interopRequireDefault(require("../indexedevent"));

var _timerange = _interopRequireDefault(require("../timerange"));

var _timerangeevent = _interopRequireDefault(require("../timerangeevent"));

var _pipeline = require("../pipeline");

var _util = _interopRequireDefault(require("../base/util"));

/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
function isSubclass(Base, X) {
  return Base === X || X.prototype === Base;
}

class Converter extends _processor.default {
  constructor(arg1, options) {
    super(arg1, options);

    if (arg1 instanceof Converter) {
      var other = arg1;
      this._convertTo = other._convertTo;
      this._duration = other._duration;
      this._durationString = other._durationString;
      this._alignment = other._alignment;
    } else if ((0, _pipeline.isPipeline)(arg1)) {
      if (!_underscore.default.has(options, "type")) {
        throw new Error("Converter: constructor needs 'type' in options");
      }

      if (isSubclass(_timeevent.default, options.type)) {
        this._convertTo = options.type;
      } else if (isSubclass(_timerangeevent.default, options.type) || isSubclass(_indexedevent.default, options.type)) {
        this._convertTo = options.type;

        if (options.duration && _underscore.default.isString(options.duration)) {
          this._duration = _util.default.windowDuration(options.duration);
          this._durationString = options.duration;
        }
      } else {
        throw Error("Unable to interpret type argument passed to Converter constructor");
      }

      this._alignment = options.alignment || "center";
    } else {
      throw new Error("Unknown arg to Converter constructor", arg1);
    }
  }

  clone() {
    return new Converter(this);
  }

  convertEvent(event) {
    var T = this._convertTo;

    if (isSubclass(_timeevent.default, T)) {
      return event;
    } else if (isSubclass(_timerangeevent.default, T)) {
      var alignment = this._alignment;
      var begin, end;

      if (!this._duration) {
        throw new Error("Duration expected in converter");
      }

      switch (alignment) {
        case "front":
          begin = event.timestamp();
          end = new Date(+event.timestamp() + this._duration);
          break;

        case "center":
          begin = new Date(+event.timestamp() - parseInt(this._duration / 2, 10));
          end = new Date(+event.timestamp() + parseInt(this._duration / 2, 10));
          break;

        case "behind":
          end = event.timestamp();
          begin = new Date(+event.timestamp() - this._duration);
          break;

        default:
          throw new Error("Unknown alignment of converter");
      }

      var timeRange = new _timerange.default([begin, end]);
      return new T(timeRange, event.data());
    } else if (isSubclass(_indexedevent.default, T)) {
      var timestamp = event.timestamp();

      var indexString = _index.default.getIndexString(this._durationString, timestamp);

      return new this._convertTo(indexString, event.data(), null);
    }
  }

  convertTimeRangeEvent(event) {
    var T = this._convertTo;

    if (isSubclass(_timerangeevent.default, T)) {
      return event;
    }

    if (isSubclass(_timeevent.default, T)) {
      var alignment = this._alignment;
      var beginTime = event.begin();
      var endTime = event.end();
      var timestamp;

      switch (alignment) {
        case "lag":
          timestamp = beginTime;
          break;

        case "center":
          timestamp = new Date(parseInt((beginTime.getTime() + endTime.getTime()) / 2, 10));
          break;

        case "lead":
          timestamp = endTime;
          break;
      }

      return new T(timestamp, event.data());
    }

    if (isSubclass(_indexedevent.default, T)) {
      throw new Error("Cannot convert TimeRangeEvent to an IndexedEvent");
    }
  }

  convertIndexedEvent(event) {
    var T = this._convertTo;

    if (isSubclass(_indexedevent.default, T)) {
      return event;
    }

    if (isSubclass(_timeevent.default, T)) {
      var alignment = this._alignment;
      var beginTime = event.begin();
      var endTime = event.end();
      var timestamp;

      switch (alignment) {
        case "lag":
          timestamp = beginTime;
          break;

        case "center":
          timestamp = new Date(parseInt((beginTime.getTime() + endTime.getTime()) / 2, 10));
          break;

        case "lead":
          timestamp = endTime;
          break;
      }

      return new T(timestamp, event.data());
    }

    if (isSubclass(_timerangeevent.default, T)) {
      return new T(event.timerange(), event.data());
    }
  }
  /**
   * Output a converted event
   */


  addEvent(event) {
    if (this.hasObservers()) {
      var outputEvent;

      if (event instanceof _timerangeevent.default) {
        outputEvent = this.convertTimeRangeEvent(event);
      } else if (event instanceof _indexedevent.default) {
        outputEvent = this.convertIndexedEvent(event);
      } else if (event instanceof _timeevent.default) {
        outputEvent = this.convertEvent(event);
      } else {
        throw new Error("Unknown event type received");
      }

      this.emit(outputEvent);
    }
  }

}

exports.default = Converter;