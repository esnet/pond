"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _observable = _interopRequireDefault(require("../base/observable"));

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
function addPrevToChain(n, chain) {
  chain.push(n);

  if ((0, _pipeline.isPipeline)(n.prev())) {
    chain.push(n.prev().in());
    return chain;
  } else {
    return addPrevToChain(n.prev(), chain);
  }
}
/**
 * Base class for all Pipeline processors
 */


class Processor extends _observable.default {
  constructor(arg1, options) {
    super();

    if ((0, _pipeline.isPipeline)(arg1)) {
      this._pipeline = arg1;
      this._prev = options.prev;
    }
  }

  prev() {
    return this._prev;
  }

  pipeline() {
    return this._pipeline;
  }

  chain() {
    var chain = [this];

    if ((0, _pipeline.isPipeline)(this.prev())) {
      chain.push(this.prev().in());
      return chain;
    } else {
      return addPrevToChain(this.prev(), chain);
    }
  }

  flush() {
    super.flush();
  }

}

var _default = Processor;
exports.default = _default;