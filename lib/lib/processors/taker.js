"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _processor = _interopRequireDefault(require("./processor"));

var _index = _interopRequireDefault(require("../index"));

var _pipeline = require("../pipeline");

/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * A processor which takes an operator as its only option
 * and uses that to either output the event or skip the
 * event
 */
class Taker extends _processor.default {
  constructor(arg1, options) {
    super(arg1, options);

    if (arg1 instanceof Taker) {
      var other = arg1;
      this._limit = other._limit;
      this._windowType = other._windowType;
      this._windowDuration = other._windowDuration;
      this._groupBy = other._groupBy;
    } else if ((0, _pipeline.isPipeline)(arg1)) {
      var pipeline = arg1;
      this._limit = options.limit;
      this._windowType = pipeline.getWindowType();
      this._windowDuration = pipeline.getWindowDuration();
      this._groupBy = pipeline.getGroupBy();
    } else {
      throw new Error("Unknown arg to Taker constructor", arg1);
    }

    this._count = {};
  }

  clone() {
    return new Taker(this);
  }

  flush() {
    super.flush();
  }
  /**
   * Output an event that is offset
   */


  addEvent(event) {
    if (this.hasObservers()) {
      var timestamp = event.timestamp();
      var windowType = this._windowType;
      var windowKey;

      if (windowType === "fixed") {
        windowKey = _index.default.getIndexString(this._windowDuration, timestamp);
      } else {
        windowKey = windowType;
      }

      var groupByKey = this._groupBy(event);

      var collectionKey = groupByKey ? "".concat(windowKey, "::").concat(groupByKey) : windowKey;

      if (!_underscore.default.has(this._count, collectionKey)) {
        this._count[collectionKey] = 0;
      }

      if (this._count[collectionKey] < this._limit) {
        this.emit(event);
      }

      this._count[collectionKey]++;
    }
  }

}

exports.default = Taker;