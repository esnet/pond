/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Grouper from "./grouper";
import Aggregator from "./aggregator";
import Derivative from "./derivative";
import Collector from "./collector";
import Binner from "./binner";

const END = true;

export default class Outputer {

    constructor(observer) {
        this._observer = observer;
    }

    addEvent(event) {
        if (this._observer) {
            this._observer(event);
        }
    }

    done() {}
}

class Processor {

    /**
     * Options:
     *     - 'emit'      - (optional) Rate to emit events. Either:
     *                     "always" - emit an event on every change
     *                     "next" - just when we advance to the next bucket
     */
    constructor(options) {
        this._processingList = [];
        this._current = null;
        this._emit = "next";
        this._end = false;
        if (options) {
            if (_.has(options, "emit")) {
                this._emit = options.emit;
            }
        }
    }
 
    /**
     * Add an event
     */
    addEvent(event) {
        if (this._processingList.length) {
            this._processingList[0].addEvent(event);
        }
    }

    /**
     * Add an event list
     */
    addEvents(eventList) {
        eventList.forEach(event => this.addEvent(event));
    }

    flush() {
        throw new Error("Calling flush() on a Processor chain is not supported.");
    }

    /**
     * Connects a new processor into the chain. If the chain has already been
     * ended this throws an error. To terminate, pass in END (or true) to this
     * function as the terminate argument.
     */
    _chain(name, processor, terminate = false) {
        if (this._end) {
            throw new Error(`Cannot chain a ${name} after the chain has ended.`);
        }
        this._processingList.push(processor);
        if (this._current) {
            this._current.onEmit(event => processor.addEvent(event));
        }
        this._current = processor;
        if (terminate) {
            this._end = true;
        }
        return this;
    }

    groupBy(groupBy) {
        return this._chain("group by", new Grouper({groupBy}));
    }

    aggregate(window, operator, fieldSpec) {
        const emit = this._emit;
        return this._chain(
            "aggregator",
            new Aggregator({window, operator, fieldSpec, emit})
        );
    }

    derivative(window, fieldSpec) {
        return this._chain(
            "derivative calculator",
            new Derivative({window, fieldSpec})
        );
    }

    collect(window, convertToTimes, observer) {
        const emit = this._emit;
        return this._chain(
            "collector",
            new Collector({window, convertToTimes, emit}, observer),
            END
        );
    }

    binner(window, fieldSpec) {
        return this._chain(
            "binner",
            new Binner({window, fieldSpec})
        );
    }

    out(func) {
        return this._chain("output function", new Outputer(func), END);
    }

    combine(sourceList) {
        sourceList.forEach(source => {
            source.onEmit(event => this.addEvent(event));
        });
    }
}

export default (options) => new Processor(options);
