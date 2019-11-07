"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _processor = _interopRequireDefault(require("./processor"));

var _event = _interopRequireDefault(require("../event"));

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
 * A simple processor used by the testing code to verify Pipeline behavior
 */
class Offset extends _processor.default {
  constructor(arg1, options) {
    super(arg1, options);

    if (arg1 instanceof Offset) {
      var other = arg1;
      this._by = other._by;
      this._fieldSpec = other._fieldSpec;
    } else if ((0, _pipeline.isPipeline)(arg1)) {
      this._by = options.by || 1;
      this._fieldSpec = options.fieldSpec;
    } else {
      throw new Error("Unknown arg to Offset constructor", arg1);
    }
  }

  clone() {
    return new Offset(this);
  }
  /**
   * Output an event that is offset
   */


  addEvent(event) {
    if (this.hasObservers()) {
      var selected = _event.default.selector(event, this._fieldSpec);

      var data = {};

      _underscore.default.each(selected.data().toJSON(), (value, key) => {
        var offsetValue = value + this._by;
        data[key] = offsetValue;
      });

      var outputEvent = event.setData(data);
      this.emit(outputEvent);
    }
  }

}

exports.default = Offset;