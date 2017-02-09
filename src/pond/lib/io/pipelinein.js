/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Observable from "../base/observable";

class PipelineIn extends Observable {
    constructor() {
        super();
        this._id = _.uniqueId("in-");
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

export default PipelineIn;
