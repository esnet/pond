"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _collector = _interopRequireDefault(require("../collector"));

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
class CollectionOut extends _pipelineout.default {
  constructor(pipeline, options, callback) {
    super(pipeline);
    this._callback = callback;
    this._collector = new _collector.default({
      windowType: pipeline.getWindowType(),
      windowDuration: pipeline.getWindowDuration(),
      groupBy: pipeline.getGroupBy(),
      emitOn: pipeline.getEmitOn()
    }, (collection, windowKey, groupByKey) => {
      var groupBy = groupByKey ? groupByKey : "all";

      if (this._callback) {
        this._callback(collection, windowKey, groupBy);
      } else {
        var keys = [];

        if (windowKey !== "global") {
          keys.push(windowKey);
        }

        if (groupBy !== "all") {
          keys.push(groupBy);
        }

        var k = keys.length > 0 ? keys.join("--") : "all";

        this._pipeline.addResult(k, collection);
      }
    });
  }

  addEvent(event) {
    this._collector.addEvent(event);
  }

  onEmit(cb) {
    this._callback = cb;
  }

  flush() {
    this._collector.flushCollections();

    if (!this._callback) {
      this._pipeline.resultsDone();
    }
  }

}

var _default = CollectionOut;
exports.default = _default;