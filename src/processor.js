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

export default class Printer {

    constructor(observer) {
        this._observer = observer;
    }

    addEvent(event) {
        if (this._observer) {
            this._observer(event);
        }
    }

    onEmit(cb) {
        this._observer = cb;
    }

    done() {}
}

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

    groupBy(groupBy) {
        if (this._end) {
            throw new Error("Cannot chain a groupBy after the chain has ended.");
        }
        const grouper = new Grouper({groupBy});
        this._processingList.push(grouper);
        if (this._current) {
            this._current.onEmit(event => grouper.addEvent(event));
        }
        this._current = grouper;
        return this;
    }

    aggregate(window, operator, fieldSpec) {
        if (this._end) {
            throw new Error("Cannot chain a aggregator after the chain has ended.");
        }
        const emit = this._emit;
        const aggregator = new Aggregator({
            window,
            operator,
            fieldSpec,
            emit
        });
        this._processingList.push(aggregator);
        if (this._current) {
            this._current.onEmit(event => aggregator.addEvent(event));
        }
        this._current = aggregator;
        return this;
    }

    derivative(window, fieldSpec) {
        if (this._end) {
            throw new Error("Cannot chain a derivative calculator after the chain has ended.");
        }
        const derivative = new Derivative({
            window,
            fieldSpec
        });
        this._processingList.push(derivative);
        if (this._current) {
            this._current.onEmit(event => derivative.addEvent(event));
        }
        this._current = derivative;
        return this;
    }

    collect(window, convertToTimes, observer) {
        if (this._end) {
            throw new Error("Cannot chain a collector after the chain has ended.");
        }
        const emit = this._emit;
        const collector = new Collector({
            window,
            convertToTimes,
            emit
        }, observer);
        this._processingList.push(collector);
        if (this._current) {
            this._current.onEmit(event => collector.addEvent(event));
        }
        this._current = collector;
        this._end = true;
        return this;
    }

    log() {
        if (this._end) {
            throw new Error("Cannot chain a logger after the chain has ended.");
        }
        const printer = new Printer() ;
        this._processingList.push(printer);
        if (this._current) {
            this._current.onEmit(event => printer.addEvent(event));
        }
        this._current = printer;
        this._end = true;
        return this;
    }

    out(func) {
        if (this._end) {
            throw new Error("Cannot chain an output function after the chain has ended.");
        }
        const output = new Outputer(func) ;
        this._processingList.push(output);
        if (this._current) {
            this._current.onEmit(event => output.addEvent(event));
        }
        this._current = output;
        this._end = true;
        return this;
    }

    combine(sourceList) {
        sourceList.forEach(source => {
            source.onEmit(event => this.addEvent(event));
        });
    }
}

export default (options) => new Processor(options);
