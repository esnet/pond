"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pipelineout = _interopRequireDefault(require("./pipelineout"));

/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
class EventOut extends _pipelineout.default {
  constructor(pipeline, options, callback) {
    super(pipeline);
    this._callback = callback;
  }

  addEvent(event) {
    if (this._callback) {
      this._callback(event);
    } else {
      this._pipeline.addResult(event);
    }
  }

  onEmit(cb) {
    this._callback = cb;
  }

  flush() {
    if (!this._callback) {
      this._pipeline.resultsDone();
    }
  }

}

var _default = EventOut;
exports.default = _default;