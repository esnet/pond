/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import { Collection } from "./pipelinein";

export class StreamOut {
    constructor() {
    }
}

export class BatchOut {
    constructor() {
    }
}

export class EventOut extends StreamOut {

    constructor(callback) {
        super();
        this._callback = callback;
    }

    addEvent(event) {
        if (this._callback) {
            this._callback(event);
        }
    }

    onEmit(cb) {
        this._callback = cb;
    }
}

export class ConsoleOut extends StreamOut {

    constructor(observer) {
        super();
        this._observer = observer;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */
    addEvent(event) {
        console.log("result: addEvent", event.toString());
    }

    onEmit(observer) {
        this._callback = observer;
    }
}

export class CollectionOut extends BatchOut {

    constructor(observer) {
        super();
        this._observer = observer;
        this._collection = new Collection();
    }

    collection() {
        return this._collection;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */
    addEvent(event) {
        this._collection = this._collection.addEvent(event);
    }

    done() {
        if (this._observer) {
            this._observer(this.collection());
        }
    }
}
