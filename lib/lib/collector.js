"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _collection = _interopRequireDefault(require("./collection"));

var _index = _interopRequireDefault(require("./index"));

/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * A Collector is used to accumulate events into multiple collections,
 * based on potentially many strategies. In this current implementation
 * a collection is partitioned based on the window that it falls in
 * and the group it is part of.
 *
 * Collections are emitted from this class to the supplied onTrigger
 * callback.
 */
class Collector {
  constructor(options, onTrigger) {
    var {
      windowType,
      windowDuration,
      groupBy,
      emitOn
    } = options;
    this._groupBy = groupBy;
    this._emitOn = emitOn;
    this._windowType = windowType;
    this._windowDuration = windowDuration; // Callback for trigger

    this._onTrigger = onTrigger; // Maintained collections

    this._collections = {};
  }

  flushCollections() {
    this.emitCollections(this._collections);
  }

  emitCollections(collections) {
    if (this._onTrigger) {
      _underscore.default.each(collections, c => {
        var {
          collection,
          windowKey,
          groupByKey
        } = c;
        this._onTrigger && this._onTrigger(collection, windowKey, groupByKey);
      });
    }
  }

  addEvent(event) {
    var timestamp = event.timestamp(); //
    // Window key
    //

    var windowType = this._windowType;
    var windowKey;

    if (windowType === "fixed") {
      windowKey = _index.default.getIndexString(this._windowDuration, timestamp);
    } else if (windowType === "daily") {
      windowKey = _index.default.getDailyIndexString(timestamp);
    } else if (windowType === "monthly") {
      windowKey = _index.default.getMonthlyIndexString(timestamp);
    } else if (windowType === "yearly") {
      windowKey = _index.default.getYearlyIndexString(timestamp);
    } else {
      windowKey = windowType;
    } //
    // Groupby key
    //


    var groupByKey = this._groupBy(event); //
    // Collection key
    //


    var collectionKey = groupByKey ? "".concat(windowKey, "::").concat(groupByKey) : windowKey;
    var discard = false;

    if (!_underscore.default.has(this._collections, collectionKey)) {
      this._collections[collectionKey] = {
        windowKey,
        groupByKey,
        collection: new _collection.default()
      };
      discard = true;
    }

    this._collections[collectionKey].collection = this._collections[collectionKey].collection.addEvent(event); //
    // If fixed windows, collect together old collections that
    // will be discarded
    //

    var discards = {};

    if (discard && windowType === "fixed") {
      _underscore.default.each(this._collections, (c, k) => {
        if (windowKey !== c.windowKey) {
          discards[k] = c;
        }
      });
    } //
    // Emit
    //


    var emitOn = this._emitOn;

    if (emitOn === "eachEvent") {
      this.emitCollections(this._collections);
    } else if (emitOn === "discard") {
      this.emitCollections(discards);

      _underscore.default.each(Object.keys(discards), k => {
        delete this._collections[k];
      });
    } else if (emitOn === "flush") {// pass
    } else {
      throw new Error("Unknown emit type supplied to Collector");
    }
  }

}

exports.default = Collector;