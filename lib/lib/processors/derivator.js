"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _immutable = _interopRequireDefault(require("immutable"));

var _processor = _interopRequireDefault(require("./processor"));

var _indexedevent = _interopRequireDefault(require("../indexedevent"));

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
 * Simple processor generate the Rate of two Event objects and
 * emit them as a TimeRangeEvent. Can be used alone or chained
 * with the Align processor for snmp rates, etc.
 */
class Derivator extends _processor.default {
  constructor(arg1, options) {
    super(arg1, options);

    if (arg1 instanceof Derivator) {
      var other = arg1;
      this._fieldSpec = other._fieldSpec;
      this._allowNegative = other._allowNegative;
    } else if ((0, _pipeline.isPipeline)(arg1)) {
      var {
        fieldSpec,
        allowNegative
      } = options;
      this._fieldSpec = fieldSpec;
      this._allowNegative = allowNegative;
    } else {
      throw new Error("Unknown arg to Derivator constructor", arg1);
    } //
    // Internal members
    //


    this._previous = null; // work out field specs

    if (_underscore.default.isString(this._fieldSpec)) {
      this._fieldSpec = [this._fieldSpec];
    } else if (!this._fieldSpec) {
      this._fieldSpec = ["value"];
    }
  }

  clone() {
    return new Derivator(this);
  }
  /**
   * Generate a new TimeRangeEvent containing the rate per second
   * between two events.
   */


  getRate(event) {
    var d = new _immutable.default.Map();

    var previousTime = this._previous.timestamp().getTime();

    var currentTime = event.timestamp().getTime();
    var deltaTime = (currentTime - previousTime) / 1000;

    this._fieldSpec.forEach(path => {
      var fieldPath = _util.default.fieldPathToArray(path);

      var ratePath = fieldPath.slice();
      ratePath[ratePath.length - 1] += "_rate";

      var previousVal = this._previous.get(fieldPath);

      var currentVal = event.get(fieldPath);
      var rate = null;

      if (!_underscore.default.isNumber(previousVal) || !_underscore.default.isNumber(currentVal)) {
        console.warn("Path ".concat(fieldPath, " contains a non-numeric value or does not exist"));
      } else {
        rate = (currentVal - previousVal) / deltaTime;
      }

      if (this._allowNegative === false && rate < 0) {
        // don't allow negative differentials in certain cases
        d = d.setIn(ratePath, null);
      } else {
        d = d.setIn(ratePath, rate);
      }
    });

    return new _timerangeevent.default([previousTime, currentTime], d);
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
        return;
      }

      var outputEvent = this.getRate(event);
      this.emit(outputEvent); // The current event now becomes the previous event

      this._previous = event;
    }
  }

}

exports.default = Derivator;