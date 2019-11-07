"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _immutable = _interopRequireDefault(require("immutable"));

var _index = _interopRequireDefault(require("../index"));

var _indexedevent = _interopRequireDefault(require("../indexedevent"));

var _processor = _interopRequireDefault(require("./processor"));

var _timeevent = _interopRequireDefault(require("../timeevent"));

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

/*eslint no-console: 0 */

/**
 * A processor to align the data into bins of regular time period.
 */
class Aligner extends _processor.default {
  constructor(arg1, options) {
    super(arg1, options);

    if (arg1 instanceof Aligner) {
      var other = arg1;
      this._fieldSpec = other._fieldSpec;
      this._window = other._window;
      this._method = other._method;
      this._limit = other._limit;
    } else if ((0, _pipeline.isPipeline)(arg1)) {
      var {
        fieldSpec,
        window,
        method = "hold",
        limit = null
      } = options;
      this._fieldSpec = fieldSpec;
      this._window = window;
      this._method = method;
      this._limit = limit;
    } else {
      throw new Error("Unknown arg to Aligner constructor", arg1);
    } //
    // Internal members
    //


    this._previous = null; // work out field specs

    if (_underscore.default.isString(this._fieldSpec)) {
      this._fieldSpec = [this._fieldSpec];
    } // check input of method


    if (!_underscore.default.contains(["linear", "hold"], this._method)) {
      throw new Error("Unknown method '".concat(this._method, "' passed to Aligner"));
    } // check limit


    if (this._limit && !Number.isInteger(this._limit)) {
      throw new Error("Limit passed to Aligner is not an integer");
    }
  }

  clone() {
    return new Aligner(this);
  }
  /**
   * Test to see if an event is perfectly aligned. Used on first event.
   */


  isAligned(event) {
    var bound = _index.default.getIndexString(this._window, event.timestamp());

    return this.getBoundaryTime(bound) === event.timestamp().getTime();
  }
  /**
   * Returns a list of indexes of window boundaries if the current
   * event and the previous event do not lie in the same window. If
   * they are in the same window, return an empty list.
   */


  getBoundaries(event) {
    var prevIndex = _index.default.getIndexString(this._window, this._previous.timestamp());

    var currentIndex = _index.default.getIndexString(this._window, event.timestamp());

    if (prevIndex !== currentIndex) {
      var range = new _timerange.default(this._previous.timestamp(), event.timestamp());
      return _index.default.getIndexStringList(this._window, range).slice(1);
    } else {
      return [];
    }
  }
  /**
   * We are dealing in UTC only with the Index because the events
   * all have internal timestamps in UTC and that's what we're
   * aligning. Let the user display in local time if that's
   * what they want.
   */


  getBoundaryTime(boundaryIndex) {
    var index = new _index.default(boundaryIndex);
    return index.begin().getTime();
  }
  /**
   * Generate a new event on the requested boundary and carry over the
   * value from the previous event.
   *
   * A variation just sets the values to null, this is used when the
   * limit is hit.
   */


  interpolateHold(boundary) {
    var setNone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var d = new _immutable.default.Map();
    var t = this.getBoundaryTime(boundary);

    this._fieldSpec.forEach(path => {
      var fieldPath = _util.default.fieldPathToArray(path);

      if (!setNone) {
        d = d.setIn(fieldPath, this._previous.get(fieldPath));
      } else {
        d = d.setIn(fieldPath, null);
      }
    });

    return new _timeevent.default(t, d);
  }
  /**
    * Generate a linear differential between two counter values that lie
    * on either side of a window boundary.
    */


  interpolateLinear(boundary, event) {
    var d = new _immutable.default.Map();

    var previousTime = this._previous.timestamp().getTime();

    var boundaryTime = this.getBoundaryTime(boundary);
    var currentTime = event.timestamp().getTime(); // This ratio will be the same for all values being processed

    var f = (boundaryTime - previousTime) / (currentTime - previousTime);

    this._fieldSpec.forEach(path => {
      var fieldPath = _util.default.fieldPathToArray(path); //
      // Generate the delta beteen the values and
      // bulletproof against non-numeric or bad paths
      //


      var previousVal = this._previous.get(fieldPath);

      var currentVal = event.get(fieldPath);
      var interpolatedVal = null;

      if (!_underscore.default.isNumber(previousVal) || !_underscore.default.isNumber(currentVal)) {
        console.warn("Path ".concat(fieldPath, " contains a non-numeric value or does not exist"));
      } else {
        interpolatedVal = previousVal + f * (currentVal - previousVal);
      }

      d = d.setIn(fieldPath, interpolatedVal);
    });

    return new _timeevent.default(boundaryTime, d);
  }
  /**
   * Perform the fill operation on the event and emit.
   */


  addEvent(event) {
    if (event instanceof _timerangeevent.default || event instanceof _indexedevent.default) {
      throw new Error("TimeRangeEvent and IndexedEvent series can not be aligned.");
    }

    if (this.hasObservers()) {
      if (!this._previous) {
        this._previous = event;

        if (this.isAligned(event)) {
          this.emit(event);
        }

        return;
      }

      var boundaries = this.getBoundaries(event); //
      // If the returned list is not empty, interpolate an event
      // on each of the boundaries and emit them
      //

      var count = boundaries.length;
      boundaries.forEach(boundary => {
        var outputEvent;

        if (this._limit && count > this._limit) {
          outputEvent = this.interpolateHold(boundary, true);
        } else {
          if (this._method === "linear") {
            outputEvent = this.interpolateLinear(boundary, event);
          } else {
            outputEvent = this.interpolateHold(boundary);
          }
        }

        this.emit(outputEvent);
      }); //
      // The current event now becomes the previous event
      //

      this._previous = event;
    }
  }

}

exports.default = Aligner;