/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import "babel-polyfill";

// Chrome debugging for the tests
import Immutable from "immutable";
import installDevTools from "immutable-devtools";
if (typeof window !== "undefined") {
    installDevTools(Immutable);
}

require("./tests/index.test.js");
require("./tests/range.test.js");
require("./tests/event.test.js");
require("./tests/collection.test.js");
require("./tests/pipeline.test.js");
require("./tests/series.test.js");
require("./tests/aapl.test.js");
