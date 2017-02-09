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

export default class Stream extends PipelineIn {
    constructor() {
        super();

        this._running = true;
    }

    /**
     * Start listening to events
     */
    start() {
        this._running = true;
    }

    /**
     * Stop listening to events
     */
    stop() {
        this._running = false;
        this.flush(); // emit a flush to let processors cleanly exit.
    }

    /**
     * Add an incoming event to the source
     */
    addEvent(event) {
        this._check(event);
        if (this.hasObservers() && this._running) {
            this.emit(event);
        }
    }

    *events() {
        throw new Error("Iteration across unbounded sources is not supported.");
    }
}
