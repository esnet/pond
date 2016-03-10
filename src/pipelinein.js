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
import Immutable from "immutable";

import { Event, TimeRangeEvent, IndexedEvent } from "./event";

export class In {
    constructor() {
        this._id = _.uniqueId("source-");
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
        if (this._observer && this._running) {
            this._observer(event);
        }
    }

    * events() {
        throw new Error("Iteration across unbounded sources is not supported.");
    }

    /**
     * Define a callback for outbound events from the source
     */
    onEmit(cb) {
        this._observer = cb;
    }
}

/**
 * A collection is a list of Events. You can construct one out of either
 * another collection, or a list of Events. You can addEvent() to a collection
 * and a new collection will be returned.
 *
 * Basic operations on the list of events are also possible. You
 * can iterate over the collection with a for..of loop, get the size()
 * of the collection and access a specific element with at().
 */
export class Collection extends BoundedIn {

    constructor(arg1, arg2) {
        super();

        this._eventList = null;  // The events in this collection
        this._type = null;       // The type (class) of the events in this collection

        if (!arg1) {
            this._eventList = new Immutable.List();
        } else if (arg1 instanceof Collection) {
            const other = arg1;
            // arg2 is whether to copy events from other, default is true
            if (_.isUndefined(arg2) || arg2 === true) {
                this._eventList = other._eventList;
                this._type = other._type;
            } else {
                this._eventList = new Immutable.List();
            }
        } else if (_.isArray(arg1)) {
            const events = [];
            arg1.forEach(e => {
                this._check(e);
                events.push(e._d);
            });
            this._eventList = new Immutable.List(events);
        } else if (Immutable.List.isList(arg1)) {
            this._eventList = arg1;
        }
    }

    toJSON() {
        return this._eventList.toJS();
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    size() {
        return this._eventList.size;
    }

    at(i) {
        return new this._type(this._eventList.get(i));
    }

    bisect(t, b) {
        const tms = t.getTime();
        const size = this.size();
        let i = b || 0;

        if (!size) {
            return undefined;
        }

        for (; i < size; i++) {
            const ts = this.at(i).timestamp().getTime();
            if (ts > tms) {
                return i - 1 >= 0 ? i - 1 : 0;
            } else if (ts === tms) {
                return i;
            }
        }
        return i - 1;
    }

    * events() {
        for (let i = 0; i < this.size(); i++) {
            yield this.at(i);
        }
    }

    addEvent(event) {
        this._check(event);
        const result = new Collection(this);
        result._eventList = this._eventList.push(event._d);
        return result;
    }
}
