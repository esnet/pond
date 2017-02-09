/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import PipelineIn from "./pipelinein";

class Bounded extends PipelineIn {
    constructor() {
        super();
    }

    start() {
        throw new Error("start() not supported on bounded source.");
    }

    stop() {
        throw new Error("stop() not supported on bounded source.");
    }

    onEmit() {
        throw new Error("You can not setup a listener to a bounded source.");
    }
}

export default Bounded;
