"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
 * A processor which takes a fieldSpec as its only argument
 * and returns a new event with only those selected columns
 */
class Selector extends _processor.default {
  constructor(arg1, options) {
    super(arg1, options);

    if (arg1 instanceof Selector) {
      var other = arg1;
      this._fieldSpec = other._fieldSpec;
    } else if ((0, _pipeline.isPipeline)(arg1)) {
      this._fieldSpec = options.fieldSpec;
    } else {
      throw new Error("Unknown arg to filter constructor", arg1);
    }
  }

  clone() {
    return new Selector(this);
  }

  addEvent(event) {
    if (this.hasObservers()) {
      this.emit(_event.default.selector(event, this._fieldSpec));
    }
  }

}

exports.default = Selector;