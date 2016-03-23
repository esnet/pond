/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import { Event, TimeRangeEvent, IndexedEvent } from "./event";
import Observable from "./observable";

export class In extends Observable {

    constructor() {
        super();

        this._id = _.uniqueId("in-");
        this._type = null;       // The type (class) of the events in this In
    }

    _check(e) {
        if (!this._type) {
            if (e instanceof Event) {
                this._type = Event;
            } else if (e instanceof TimeRangeEvent) {
                this._type = TimeRangeEvent;
            } else if (e instanceof IndexedEvent) {
                this._type = IndexedEvent;
            }
        } else {
            if (!(e instanceof this._type)) {
                throw new Error("Homogeneous events expected.");
            }
        }
    }
}

export class BoundedIn extends In {
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

export class UnboundedIn extends In {

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

    * events() {
        throw new Error("Iteration across unbounded sources is not supported.");
    }

    /**
     * Push a flush message down the chain. This will cause aggregations to
     * emit what they have.
     */
    flush() {
        if (this.hasObservers()) {
            console.log("UnboundedIn FLUSH", this);            
            super.flush();
        }
    }
}
