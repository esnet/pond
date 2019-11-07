"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _processor = _interopRequireDefault(require("./processor"));

var _collector = _interopRequireDefault(require("../collector"));

var _indexedevent = _interopRequireDefault(require("../indexedevent"));

var _timerangeevent = _interopRequireDefault(require("../timerangeevent"));

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
 * An Aggregator takes incoming events and adds them to a Collector
 * with given windowing and grouping parameters. As each Collection is
 * emitted from the Collector it is aggregated into a new event
 * and emitted from this Processor.
 */
class Aggregator extends _processor.default {
  constructor(arg1, options) {
    super(arg1, options);

    if (arg1 instanceof Aggregator) {
      var other = arg1;
      this._fields = other._fields;
      this._windowType = other._windowType;
      this._windowDuration = other._windowDuration;
      this._groupBy = other._groupBy;
      this._emitOn = other._emitOn;
    } else if ((0, _pipeline.isPipeline)(arg1)) {
      var pipeline = arg1;
      this._windowType = pipeline.getWindowType();
      this._windowDuration = pipeline.getWindowDuration();
      this._groupBy = pipeline.getGroupBy();
      this._emitOn = pipeline.getEmitOn();

      if (!_underscore.default.has(options, "fields")) {
        throw new Error("Aggregator: constructor needs an aggregator field mapping");
      } // Check each of the aggregator -> field mappings


      _underscore.default.forEach(options.fields, (operator, field) => {
        // Field should either be an array or a string
        if (!_underscore.default.isString(field) && !_underscore.default.isArray(field)) {
          throw new Error("Aggregator: field of unknown type: " + field);
        }
      });

      if (pipeline.mode() === "stream") {
        if (!pipeline.getWindowType() || !pipeline.getWindowDuration()) {
          throw new Error("Unable to aggregate because no windowing strategy was specified in pipeline");
        }
      }

      this._fields = options.fields;
    } else {
      throw new Error("Unknown arg to Filter constructor", arg1);
    }

    this._collector = new _collector.default({
      windowType: this._windowType,
      windowDuration: this._windowDuration,
      groupBy: this._groupBy,
      emitOn: this._emitOn
    }, (collection, windowKey, groupByKey) => this.handleTrigger(collection, windowKey, groupByKey));
  }

  clone() {
    return new Aggregator(this);
  }

  handleTrigger(collection, windowKey) {
    var d = {};

    _underscore.default.each(this._fields, (f, fieldName) => {
      var keys = Object.keys(f);

      if (keys.length !== 1) {
        throw new Error("Fields should contain exactly one field", f);
      }

      var field = keys[0];
      var operator = f[field];
      d[fieldName] = collection.aggregate(operator, field);
    });

    var event;

    if (windowKey === "global") {
      event = new _timerangeevent.default(collection.range(), d);
    } else {
      //TODO: Specify UTC (or local) pipeline
      var utc = this._windowType === "fixed";
      event = new _indexedevent.default(windowKey, d, utc);
    }

    this.emit(event);
  }

  flush() {
    this._collector.flushCollections();

    super.flush();
  }

  addEvent(event) {
    if (this.hasObservers()) {
      this._collector.addEvent(event);
    }
  }

}

var _default = Aggregator;
exports.default = _default;