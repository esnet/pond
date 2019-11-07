"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _observable = _interopRequireDefault(require("../base/observable"));

/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
class PipelineIn extends _observable.default {
  constructor() {
    super();
    this._id = _underscore.default.uniqueId("in-");
    this._type = null; // The type (class) of the events in this In
  }

  _check(e) {
    if (!this._type) {
      this._type = e.type();
    } else {
      if (!(e instanceof this._type)) {
        throw new Error("Homogeneous events expected.");
      }
    }
  }

}

var _default = PipelineIn;
exports.default = _default;