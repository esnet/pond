/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

// Chrome debugging for immutable.js structures
const Immutable = require("immutable");
const installDevTools = require("immutable-devtools");
if (typeof window !== "undefined") {
    installDevTools(Immutable);
}

// Structures
export Event from "./lib/event";
export TimeEvent from "./lib/timeevent";
export TimeRangeEvent from "./lib/timerangeevent";
export IndexedEvent from "./lib/indexedevent";
export Index from "./lib/index.js";
export TimeRange from "./lib/timerange.js";
export Collection from "./lib/collection.js";
export TimeSeries from "./lib/timeseries.js";

// Pipeline
export { Pipeline } from "./lib/pipeline.js";

// I/O
export Stream from "./lib/io/stream";
export Bounded from "./lib/io/bounded";
export PipelineOut from "./lib/io/pipelineout";
export EventOut from "./lib/io/eventout";
export CollectionOut from "./lib/io/collectionout";

// Functions
export {
    keep,
    sum,
    avg,
    max,
    min,
    count,
    first,
    last,
    difference,
    median,
    stdev,
    percentile,
    filter
} from "./lib/base/functions";
