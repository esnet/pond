/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import Immutable from "immutable";
import _ from "underscore";

import { UnboundedIn, BoundedIn } from "./in";
import Processor from "./processor";
import Offset from "./offset";
import Aggregator from "./aggregator";
import Converter from "./converter";
import Event from "./event";
import TimeRangeEvent from "./timerangeevent";
import IndexedEvent from "./indexedevent";

/**
 * A pipeline manages a processing chain, for either batch or stream processing
 * of collection data.
 */

class Pipeline {

    /**
     * Build a new Pipeline.
     *
     * @param  {Pipeline|Immutable.Map|null} [arg] May be either:
     *  * a Pipeline (copy contructor)
     *  * an Immutable.Map, in which case the internal state of the
     *    Pipeline will be contructed from the Map
     *  * not specified
     *
     * Usually you would initialize a Pipeline using the factory
     * function, rather than this object directly with `new`.
     *
     * @example
     * ```
     * import { Pipeline } from "pondjs";
     * const process = Pipeline()...`
     * ```
     *
     * @return {Pipeline} The Pipeline
     */
    constructor(arg) {
        if (arg instanceof Pipeline) {
            const other = arg;
            this._d = other._d;
        } else if (arg instanceof Immutable.Map) {
            this._d = arg;
        } else {
            this._d = new Immutable.Map({
                type: null,
                in: null,
                first: null,
                last: null,
                groupBy: () => "",
                windowType: "global",
                windowDuration: null,
                emitOn: "eachEvent"
            });
        }
    }

    //
    // Accessors to the current Pipeline state
    //

    in() {
        return this._d.get("in");
    }

    mode() {
        return this._d.get("mode");
    }

    first() {
        return this._d.get("first");
    }

    last() {
        return this._d.get("last");
    }

    getWindowType() {
        return this._d.get("windowType");
    }

    getWindowDuration() {
        return this._d.get("windowDuration");
    }

    getGroupBy() {
        return this._d.get("groupBy");
    }

    getEmitOn() {
        return this._d.get("emitOn");
    }

    //
    // Pipeline mutations
    //

    /**
     * Setting the In for the Pipeline returns a new Pipeline
     *
     * @private
     */
    _setIn(input) {
        let mode;
        if (input instanceof BoundedIn) {
            mode = "batch";
        } else if (input instanceof UnboundedIn) {
            mode = "stream";
        } else {
            throw new Error("Unknown input type", input);
        }
        
        const d = this._d.withMutations(map => {
            map.set("in", input)
               .set("mode", mode);
        });

        return new Pipeline(d);
    }

    /**
     * Set the first processing node pointed to, returning
     * a new Pipeline. The original pipeline will still point
     * to its orginal processing node.
     *
     * @private
     */
    _setFirst(n) {
        const d = this._d.set("first", n);
        return new Pipeline(d);
    }

    /**
     * Set the last processing node pointed to, returning
     * a new Pipeline. The original pipeline will still point
     * to its orginal processing node.
     *
     * @private
     */
    _setLast(n) {
        const d = this._d.set("last", n);
        return new Pipeline(d);
    }

    /**
     * @private
     */
    _append(processor) {
        let first = this.first();
        let last = this.last();

        if (!first) first = processor;
        if (last) last.addObserver(processor);
        last = processor;

        const d = this._d.withMutations(map => {
            map.set("first", first)
               .set("last", last);
        });
        return new Pipeline(d);
    }

    _setState(key, value) {
        const d = this._d.withMutations(map => {
            map.set(key, value);
        });
        return new Pipeline(d);
    }

    //
    // Pipeline state chained methods
    //

    /**
     * Set the window, returning a new Pipeline. The argument here
     * is an object with {type, duration}.
     * type may be:
     *  * "Fixed"
     * duration is of the form:
     *  * "30s", "5m" or "1d" etc
     *
     * @return {Pipeline} The Pipeline
     */
    windowBy(w) {
        let type, duration;
        if (_.isString(w)) {
            // assume fixed window with size w
            type = "fixed";
            duration = w;
        } else if (_.isObject(w)) {
            type = w.type;
            duration = w.duration;
        }

        const d = this._d.withMutations(map => {
            map.set("windowType", type)
               .set("windowDuration", duration);
        });

        return new Pipeline(d);
    }

    /**
     * Sets a new groupBy expression. Returns a new Pipeline.
     *
     * Grouping is a state set on the Pipeline. Operations downstream
     * of the group specification will use that state. For example, an
     * aggregation would occur over any grouping specified.
     *
     * @param {function|array|string} k The key to group by.
     * You can groupby using a function `(event) => return key`,
     * a fieldSpec (a field name, or dot delimitted path to a field),
     * or a array of fieldSpecs
     *
     * @return {Pipeline} The Pipeline
     */
    groupBy(k) {
        let grp;
        const groupBy = k || "value";
        if (_.isFunction(groupBy)) {
            // group using a user defined function
            // (event) => key
            grp = groupBy;
        } else if (_.isArray(groupBy)) {
            // group by several column values
            grp = e => _.map(groupBy, c => `${e.get(c)}`).join("::");
        } else if (_.isString(groupBy)) {
            // group by a column value
            grp = e =>
                `${e.get(groupBy)}`;
        } else {
            throw Error("Unable to interpret groupBy argument", k);
        }

        return this._setState("groupBy", grp);
    }

    /**
     * Sets the condition under which accumulated collection will
     * be emitted. If specified before an aggregation this will control
     * when the resulting event will be emitted relative to the
     * window accumulation. Current options are to emit on every event
     * or just when the collection is complete.
     *
     * @param {string} trigger A string indicating how to trigger a
     * Collection should be emitted. May be:
     *     * "eachEvent" - when a new event comes in, all currently
     *                     maintained collections will emit their result
     *     * "discard"   - when a collection is to be discarded,
     *                     first it will emit. But only then.
     *
     * @return {Pipeline} The Pipeline
     */
    emitOn(trigger) {
        const d = this._d.set("emitOn", trigger);
        return new Pipeline(d);
    }

    //
    // I/O
    //

    /**
     * The "In" to get events from. The In needs to be able to
     * iterate its events using for..of loop for bounded Ins, or
     * be able to emit for unbounded Ins. The actual batch, or stream
     * connection occurs when an output is defined with to().
     *
     * from() returns a new Pipeline.
     *
     * @param {In} src The source for the Pipeline.
     *
     * @return {Pipeline} The Pipeline
     */
    from(src) {
        if (src instanceof Pipeline) {
            const pipelineIn = src.in();
            return this._setIn(pipelineIn);
        } else {
            return this._setIn(src);
        }
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
     * @example
     * ```
     * const p = Pipeline()
     *  ...
     *  .to(EventOut, {}, event => {
     *      result[`${event.index()}`] = event;
     *  });
     * ```
     * @return {Pipeline} The Pipeline
     */
    to(arg1, arg2, arg3, arg4) {
        const Out = arg1;
        let force = false;
        let observer = () => {};
        let options = {};

        if (_.isFunction(arg2)) {
            observer = arg2;
            force = arg3 ? arg3 : false;
        } else if (_.isObject(arg2)) {
            options = arg2;
            observer = arg3;
            force = arg4 ? arg4 : false;
        }

        if (!this.in()) {
            throw new Error("Tried to eval pipeline without a In. Missing from() in chain?");
        }
        if (this.mode() === "batch") {
            //
            // Walk the DAG back up the tree to the source to assemble the
            // process nodes that feed into this output. NOTE: we do not
            // currently support merging, so this is a linear chain.
            //

            const processChain = this.last().chain();
            const input = processChain[0].pipeline().in();

            //
            // Execution chain is the chain of processor clones, linked
            // together for our specific batch processing pipeline.
            //

            const executionChain = [];
            let prev = new Out(this, options, observer);
            processChain.forEach(p => {
                if (p instanceof Processor) {
                    const processor = p.clone();
                    if (prev) {
                        processor.addObserver(prev);
                    }
                    executionChain.push(processor);
                    prev = processor;
                }
            });

            //
            // The head is the first process node in the execution chain.
            // To process the source through the execution chain we add
            // each event from the input to the head.
            //

            const head = executionChain.pop();
            for (const e of input.events()) {
                head.addEvent(e);
            }

            if (force) head.flush();
 
        } else if (this.mode() === "stream") {
            const out = new Out(this, options, observer);
            if (this.first()) {
                this.in().addObserver(this.first());
            }
            if (this.last()) {
                this.last().addObserver(out);
            } else {
                this.in().addObserver(out);
            }
        }

        return this;
    }

    //
    // Processors
    //
    
    /**
     * Processor to offset a set of fields by a value. Mostly used for
     * testing processor operations.
     * @param  {number} by              The amount to offset by
     * @param  {string|array} fieldSpec The field(s)
     * @return {Pipeline}               The modified Pipeline
     */
    offsetBy(by, fieldSpec) {
        const p = new Offset(this, {
            by,
            fieldSpec,
            prev: this.last() ? this.last() : this
        });

        return this._append(p);
    }

    /**
     * Uses the current Pipeline windowing and grouping
     * state to build collections of events and aggregate them.
     * `IndexedEvent`s will be emitted out of the aggregator based
     * on the `emitOn` state of the Pipeline.
     *
     * To specify what part of the incoming events should
     * be aggregated together you specify a `fields`
     * object. This is a map from fieldName to operator.
     *
     * @example
     *
     * import { Pipeline, EventOut, functions } from "pondjs";
     * const { avg } = functions;
     *
     * const p = Pipeline()
     *   .from(input)
     *   .windowBy("1h")           // 1 day fixed windows
     *   .emitOn("eachEvent")    // emit result on each event
     *   .aggregate({in: avg, out: avg})
     *   .asEvents()
     *   .to(EventOut, {}, event => {
     *      result[`${event.index()}`] = event;
     *   });
     * @param  {object} fields Fields and operators to be aggregated
     *
     * @return {Pipeline} The Pipeline
     */
    aggregate(fields) {
        const p = new Aggregator(this, {
            fields,
            prev: this._last ? this._last : this
        });
        
        return this._append(p);
    }

    /**
     * Converts incoming TimeRangeEvents or IndexedEvents to
     * Events. This is helpful since some processors will
     * emit TimeRangeEvents or IndexedEvents, which may be
     * unsuitable for some applications.
     *
     * @param  {object} options To convert to an Event you need
     * to convert a time range to a single time. There are three options:
     *  1. use the beginning time (options = {alignment: "lag"})
     *  2. use the center time (options = {alignment: "center"})
     *  3. use the end time (options = {alignment: "lead"})
     *
     * @return {Pipeline} The Pipeline
     */
    asEvents(options) {
        const type = Event;
        const p = new Converter(this, {
            type,
            ...options,
            prev: this._last ? this._last : this
        });
        
        return this._append(p);
    }

    /**
     * Converts incoming Events or IndexedEvents to
     * TimeRangeEvents.
     *
     * @param {object} options To convert from an Event you need
     * to convert a single time to a time range. To control this you
     * need to specify the duration of that time range, along with
     * the positioning (alignment) of the time range with respect to
     * the time stamp of the Event.
     *
     * There are three option for alignment:
     *  1. time range will be in front of the timestamp (options = {alignment: "front"})
     *  2. time range will be centered on the timestamp (options = {alignment: "center"})
     *  3. time range will be positoned behind the timestamp (options = {alignment: "behind"})
     *
     * The duration is of the form "1h" for one hour, "30s" for 30 seconds and so on.
     *
     * @return {Pipeline} The Pipeline
     */
    asTimeRangeEvents(options) {
        const type = TimeRangeEvent;
        const p = new Converter(this, {
            type,
            ...options,
            prev: this._last ? this._last : this
        });
        
        return this._append(p);
    }

    /**
     * Converts incoming Events to IndexedEvents.
     *
     * Note: It isn't possible to convert TimeRangeEvents to IndexedEvents.
     *
     * @param {Object} options            An object containing the conversion
     * options. In this case the duration string of the Index is expected.
     * @param {string} options.duration   The duration string is of the form "1h" for one hour, "30s"
     * for 30 seconds and so on.
     *
     * @return {Pipeline} The Pipeline
     */
    asIndexedEvents(options) {
        console.log("asIndexedEvents");

        const type = IndexedEvent;
        const p = new Converter(this, {
            type,
            ...options,
            prev: this._last ? this._last : this
        });
        console.log(p);
        return this._append(p);
    }
}

function pipeline(args) {
    return new Pipeline(args);
}

function is(p) {
    return p instanceof Pipeline;
}

export { pipeline as Pipeline, is as isPipeline };
