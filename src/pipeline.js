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

import UnboundedIn from "./pipeline-in-unbounded";
import BoundedIn from "./pipeline-in-bounded";
import CollectionOut from "./pipeline-out-collection";
import Processor from "./processor";
import Offset from "./offset";
import Filter from "./filter";
import Taker from "./taker";
import Aggregator from "./aggregator";
import Converter from "./converter";
import Event from "./event";
import TimeSeries from "./series";
import TimeRangeEvent from "./timerangeevent";
import IndexedEvent from "./indexedevent";
import Selector from "./selector";
import Collapser from "./collapser";
import Mapper from "./mapper";


/**
 * A runner is used to extract the chain of processing operations
 * from a Pipeline given an Output. The idea here is to traverse
 * back up the Pipeline(s) and build an execution chain.
 *
 * When the runner is started, events from the "in" are streamed
 * into the execution chain and outputed into the "out".
 *
 * Rebuilding in this way enables us to handle connected pipelines:
 *
 *                     |--
 *  in --> pipeline ---.
 *                     |----pipeline ---| -> out
 *
 * The runner breaks this into the following for execution:
 *
 *   _input        - the "in" or from() bounded input of
 *                   the upstream pipeline
 *   _processChain - the process nodes in the pipelines
 *                   leading to the out
 *   _output       - the supplied output destination for
 *                   the batch process
 *
 * NOTE: There's no current way to merge multiple sources, though
 *       a time series has a TimeSeries.merge() static method for
 *       this purpose.
 */
class Runner {

    /**
     * Create a new batch runner.
     * @param  {Pipeline} pipeline The pipeline to run
     * @param  {PipelineOut} output   The output driving this runner
     */
    constructor(pipeline, output) {

        this._output = output;

        //
        // We use the pipeline's chain() function to walk the
        // DAG back up the tree to the "in" to:
        // 1) assemble a list of process nodes that feed into
        //    this pipeline, the processChain
        // 2) determine the _input
        //
        // TODO: we do not currently support merging, so this is
        // a linear chain.
        //

        let processChain = [];
        if (pipeline.last()) {
            processChain = pipeline.last().chain();
            this._input = processChain[0].pipeline().in();
        } else {
            this._input = pipeline.in();
        }

        //
        // Using the list of nodes of the tree that will be involved in
        // out processing we can build the execution chain. This is the
        // chain of processor clones, linked together for our specific
        // processing pipeline.
        //

        this._executionChain = [this._output];

        let prev = this._output;
        processChain.forEach(p => {
            if (p instanceof Processor) {
                const processor = p.clone();
                if (prev) processor.addObserver(prev);
                this._executionChain.push(processor);
                prev = processor;
            }
        });
    }

    /**
     * Start the runner
     * @param  {Boolean} force Force a flush at the end of the batch source
     *                         to cause any buffers to emit.
     */
    start(force = false) {

        //
        // The head is the first process node in the execution chain.
        // To process the source through the execution chain we add
        // each event from the input to the head.
        //

        const head = this._executionChain.pop();
        for (const e of this._input.events()) {
            head.addEvent(e);
        }

        if (force) {
            head.flush();
        }
    }
}

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
        let source = input;
        if (input instanceof TimeSeries) {
            mode = "batch";
            source = input.collection();
        } else if (input instanceof BoundedIn) {
            mode = "batch";
        } else if (input instanceof UnboundedIn) {
            mode = "stream";
        } else {
            throw new Error("Unknown input type", input);
        }

        const d = this._d.withMutations(map => {
            map.set("in", source)
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

    //
    // Pipeline state chained methods
    //

    /**
     * Set the window, returning a new Pipeline. The argument here
     * is an object with {type, duration}.
     * type may be:
     *  * "Fixed"
     *  * other types coming
     *
     * duration is of the form:
     *  * "30s" or "1d" etc
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
     * You can groupBy using a function `(event) => return key`,
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

        const d = this._d.withMutations(map => {
            map.set("groupBy", grp);
        });

        return new Pipeline(d);
    }

    /**
     * Sets the condition under which an accumulated collection will
     * be emitted. If specified before an aggregation this will control
     * when the resulting event will be emitted relative to the
     * window accumulation. Current options are:
     *  * to emit on every event, or
     *  * just when the collection is complete, or
     *  * when a flush signal is received, either manually calling done(),
     *    or at the end of a bounded source
     *
     * The difference will depend on the output you want, how often
     * you want to get updated, and if you need to get a partial state.
     * There's currently no support for late data or watermarks. If an
     * event passes comes in after a collection window, that collection
     * is considered finished.
     *
     * @param {string} trigger A string indicating how to trigger a
     * Collection should be emitted. May be:
     *     * "eachEvent" - when a new event comes in, all currently
     *                     maintained collections will emit their result
     *     * "discard"   - when a collection is to be discarded,
     *                     first it will emit. But only then.
     *     * "flush"     - when a flush signal is received
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
     * The source to get events from. The source needs to be able to
     * iterate its events using `for..of` loop for bounded Ins, or
     * be able to emit() for unbounded Ins. The actual batch, or stream
     * connection occurs when an output is defined with `to()`.
     *
     * Pipelines can be chained together since a source may be another
     * Pipeline.
     *
     * @param {BoundedIn|UnboundedIn|Pipeline} src The source for the
     *                                             Pipeline, or another
     *                                             Pipeline.
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
     * Sets up the destination sink for the pipeline.
     *
     * For a batch mode connection, i.e. one with a Bounded source,
     * the output is connected to a clone of the parts of the Pipeline dependencies
     * that lead to this output. This is done by a Runner. The source input is
     * then iterated over to process all events into the pipeline and though to the Out.
     *
     * For stream mode connections, the output is connected and from then on
     * any events added to the input will be processed down the pipeline to
     * the out.
     *
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
        
        const out = new Out(this, options, observer);

        if (this.mode() === "batch") {
            const runner = new Runner(this, out);
            runner.start(force);
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

    /**
     * Outputs the count of events
     *
     * @param  {function}  observer The callback function. This will be
     *                              passed the count, the windowKey and
     *                              the groupByKey
     * @param  {Boolean} force    Flush at the end of processing batch
     *                            events, output again with possibly partial
     *                            result.
     * @return {Pipeline} The Pipeline
     */
    count(observer, force = true) {
        return this.to(CollectionOut, (collection, windowKey, groupByKey) => {
            observer(collection.size(), windowKey, groupByKey);
        }, force);
    }

    //
    // Processors
    //
    
    /**
     * Processor to offset a set of fields by a value. Mostly used for
     * testing processor and pipeline operations with a simple operation.
     *
     * @param  {number} by              The amount to offset by
     * @param  {string|array} fieldSpec The field(s)
     *
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
     *
     * `IndexedEvent`s will be emitted out of the aggregator based
     * on the `emitOn` state of the Pipeline.
     *
     * To specify what part of the incoming events should
     * be aggregated together you specify a `fields`
     * object. This is a map from fieldName to operator.
     *
     * @example
     *
     * ```
     * import { Pipeline, EventOut, functions } from "pondjs";
     * const { avg } = functions;
     *
     * const p = Pipeline()
     *   .from(input)
     *   .windowBy("1h")           // 1 day fixed windows
     *   .emitOn("eachEvent")      // emit result on each event
     *   .aggregate({in: avg, out: avg})
     *   .asEvents()
     *   .to(EventOut, {}, event => {
     *      result[`${event.index()}`] = event; // Result
     *   });
     * ```
     *
     * @param  {object} fields Fields and operators to be aggregated
     *
     * @return {Pipeline} The Pipeline
     */
    aggregate(fields) {
        const p = new Aggregator(this, {
            fields,
            prev: this.last() ? this.last() : this
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
            prev: this.last() ? this.last() : this
        });
        
        return this._append(p);
    }

    /**
     * Map the event stream using an operator
     *
     * @param  {function} op A function that returns a new Event
     *
     * @return {Pipeline} The Pipeline
     */
    map(op) {
        const p = new Mapper(this, {
            op,
            prev: this.last() ? this.last() : this
        });

        return this._append(p);
    }

    /**
     * Filter the event stream using an operator
     *
     * @param  {function} op A function that returns true or false
     *
     * @return {Pipeline} The Pipeline
     */
    filter(op) {
        const p = new Filter(this, {
            op,
            prev: this.last() ? this.last() : this
        });

        return this._append(p);
    }

    /**
     * Select a subset of columns
     *
     * @param {array|String} fieldSpec The columns to include in the output
     *
     * @return {Pipeline} The Pipeline
     */
    select(fieldSpec) {
        const p = new Selector(this, {
            fieldSpec,
            prev: this.last() ? this.last() : this
        });

        return this._append(p);
    }

    /**
     * Collapse a subset of columns using a reducer function
     *
     * @example
     *
     * ```
     *  const timeseries = new TimeSeries(inOutData);
     *  Pipeline()
     *      .from(timeseries)
     *      .collapse(["in", "out"], "in_out_sum", sum)
     *      .emitOn("flush")
     *      .to(CollectionOut, c => {
     *           const ts = new TimeSeries({name: "subset", collection: c});
     *           ...
     *      }, true);
     * ```
     * @param {array|String} fieldSpec The columns to collapse into the output
     * @param {string}       name      The resulting output column's name
     * @param {function}     reducer   Function to use to do the reduction
     * @param {boolean}      append    Add the new column to the existing ones, or replace them.
     *
     * @return {Pipeline}              The Pipeline
     */
    collapse(fieldSpec, name, reducer, append) {
        const p = new Collapser(this, {
            fieldSpec,
            name,
            reducer,
            append,
            prev: this.last() ? this.last() : this
        });

        return this._append(p);
    }

    /**
     * Take events up to the supplied limit, per key.
     *
     * @param  {number} limit Integer number of events to take
     *
     * @return {Pipeline} The Pipeline
     */
    take(limit) {
        const p = new Taker(this, {
            limit,
            prev: this.last() ? this.last() : this
        });

        return this._append(p);
    }

    /**
     * Converts incoming Events or IndexedEvents to TimeRangeEvents.
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
            prev: this.last() ? this.last() : this
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
        const type = IndexedEvent;
        const p = new Converter(this, {
            type,
            ...options,
            prev: this.last() ? this.last() : this
        });
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
