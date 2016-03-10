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

import { UnboundedIn, BoundedIn } from "./pipelinein";
import { BatchOut, StreamOut } from "./pipelineout";
import { Event } from "./event";

function findIn(n) {
    if (n._prev instanceof Pipeline) {
        return n._prev._in;
    } else {
        return findIn(n._prev);
    }
}

class Transform {

    constructor(options, observer) {
        this._prev = options.prev;
        this._observer = observer;
    }

    in() {
        return findIn(this);
    }
}

class Offset extends Transform {

    constructor(options, observer) {
        super(options, observer);
        this._by = options.by || 1;
        this._fieldSpec = options.fieldSpec;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */
    addEvent(event, cb) {
        if (this._observer) {
            const selected = Event.selector(event, this._fieldSpec);
            const data = {};
            _.each(selected.data().toJSON(), (value, key) => {
                const offsetValue = value + this._by;
                data[key] = offsetValue;
            });
            this._observer(event.setData(data));
        }
        if (cb) {
            cb(null);
        }
    }


    onEmit(cb) {
        this._observer = cb;
    }
}

/**
 * A pipeline manages a processing chain, for either batch or stream processing
 * of collection data.
 *
 * The contructor takes the in, which must be a Collection. You can then using
 * the chaining functions to construct your pipeline.
 *
 * const p = new Pipeline();
 *     p.from(collection)
 *      .add(1)
 *      .add(2)
 *      .to(collection => result = collection);
 */

class Pipeline {

    constructor(arg) {
        this._in = null;
        this._first = null;      // First processor in the chain
        this._last = null;       // Last processor in the chain
        if (arg instanceof Pipeline) {
            const other = arg;
            this._in = other._in;
            this._first = other._first;
            this._last = other._last;
        }
    }

    //
    // I/O
    //

    /**
     * The "in" to get events from. The in needs to be able to
     * iterate its events using for ... of loop for bounded ins, or
     * be able to emit for unbounded ins. The actual batch, or stream
     * connection occurs when an output is defined with to().
     */
    from(input) {
        this._in = input;
        if (this._in instanceof BoundedIn) {
            this._mode = "batch";
        }
        if (this._in instanceof UnboundedIn) {
            this._mode = "stream";
        }
        return this;
    }

    /**
     * Sets up the destination sink for the pipeline. The output should
     * be a BatchOut subclass for a bounded input and a StreamOut subclass
     * for an unbounded input.
     *
     * For a batch mode connection, the output is connected and then the
     * source input is iterated over to process all events into the pipeline and
     * down to the out.
     *
     * For stream mode connections, the output is connected and from then on
     * any events added to the input will be processed down the pipeline to
     * the out.
     */
    to(output) {
        if (!this._last) return this;
        if (!this._in) {
            throw new Error("Tried to eval pipeline without a In. Missing from() in chain?");
        }
        if (this._mode === "batch") {
            if (output instanceof BatchOut) {

                // Get ready to read from the end of the processing chain
                this._last && this._last.onEmit(event => output.addEvent(event));

                // Pull from the in into the beginning of the processing chain
                const input = this._last.in();
                for (const e of input.events()) {
                    if (this._first) {
                        console.log("->", e.toString());
                        this._first.addEvent(e);
                    }
                }
                output.done();
            }

        } else if (this._mode === "stream") {
            if (output instanceof StreamOut) {
                if (this._first) {
                    this._in.onEmit(event =>
                        this._first.addEvent(event)
                    );
                }
                if (this._last) {
                    this._last.onEmit(event =>
                        output.addEvent(event)
                    );
                }
            }
        }

        return this;
    }

    //
    // Test transformations
    //
    
    offsetBy(by, fieldSpec) {
        const transform = new Offset({
            by,
            fieldSpec,
            prev: this._last ? this._last : this
        });
        if (!this._first) {
            this._first = transform;
        }
        this._last && this._last.onEmit(e => transform.addEvent(e));
        this._last = transform;

        return this;
    }
}

export default (options) => new Pipeline(options);
