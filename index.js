/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint "no-var": 0 */

// Chrome debugging
var Immutable = require("immutable");
var installDevTools = require("immutable-devtools");
if (typeof window !== "undefined") {
    installDevTools(Immutable);
}

exports.Index = require("./lib/index.js");
exports.TimeRange = require("./lib/range.js");
exports.Event = require("./lib/event.js").Event;
exports.TimeRangeEvent = require("./lib/event.js").TimeRangeEvent;
exports.IndexedEvent = require("./lib/event.js").IndexedEvent;
exports.TimeSeries = require("./lib/series.js").TimeSeries;
exports.Bucket = require("./lib/bucket.js");
exports.Generator = require("./lib/generator.js");
exports.Aggregator = require("./lib/aggregator.js");
exports.Collector = require("./lib/collector.js");
exports.Derivative = require("./lib/derivative.js");
exports.Binner = require("./lib/binner.js");
exports.Processor = require("./lib/processor.js");
exports.Functions = require("./lib/functions.js");
