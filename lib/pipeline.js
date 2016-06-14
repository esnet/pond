"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isPipeline = exports.Pipeline = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _pipelineInUnbounded = require("./pipeline-in-unbounded");

var _pipelineInUnbounded2 = _interopRequireDefault(_pipelineInUnbounded);

var _pipelineInBounded = require("./pipeline-in-bounded");

var _pipelineInBounded2 = _interopRequireDefault(_pipelineInBounded);

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _offset = require("./offset");

var _offset2 = _interopRequireDefault(_offset);

var _filter = require("./filter");

var _filter2 = _interopRequireDefault(_filter);

var _taker = require("./taker");

var _taker2 = _interopRequireDefault(_taker);

var _aggregator = require("./aggregator");

var _aggregator2 = _interopRequireDefault(_aggregator);

var _converter = require("./converter");

var _converter2 = _interopRequireDefault(_converter);

var _event = require("./event");

var _event2 = _interopRequireDefault(_event);

var _series = require("./series");

var _series2 = _interopRequireDefault(_series);

var _timerangeevent = require("./timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _indexedevent = require("./indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _selector = require("./selector");

var _selector2 = _interopRequireDefault(_selector);

var _collapser = require("./collapser");

var _collapser2 = _interopRequireDefault(_collapser);

var _mapper = require("./mapper");

var _mapper2 = _interopRequireDefault(_mapper);

var _pipelineOutEvent = require("./pipeline-out-event.js");

var _pipelineOutEvent2 = _interopRequireDefault(_pipelineOutEvent);

var _pipelineOutCollection = require("./pipeline-out-collection.js");

var _pipelineOutCollection2 = _interopRequireDefault(_pipelineOutCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Runner = function () {

    /**
     * Create a new batch runner.
     * @param  {Pipeline} pipeline The pipeline to run
     * @param  {PipelineOut} output   The output driving this runner
     */

    function Runner(pipeline, output) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Runner);


        this._output = output;
        this._pipeline = pipeline;

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

        var processChain = [];
        if (pipeline.last()) {
            processChain = pipeline.last().chain();
            this._input = processChain[0].pipeline().in();
        } else {
            this._input = pipeline.in();
        }

        //
        // Using the list of nodes in the tree that will be involved in
        // our processing we can build an execution chain. This is the
        // chain of processor clones, linked together, for our specific
        // processing pipeline. We run this execution chain later by
        // evoking start().
        //

        this._executionChain = [this._output];
        var prev = this._output;
        processChain.forEach(function (p) {
            if (p instanceof _processor2.default) {
                var processor = p.clone();
                if (prev) processor.addObserver(prev);
                _this._executionChain.push(processor);
                prev = processor;
            }
        });
    }

    /**
     * Start the runner
     * @param  {Boolean} force Force a flush at the end of the batch source
     *                         to cause any buffers to emit.
     */


    (0, _createClass3.default)(Runner, [{
        key: "start",
        value: function start() {
            var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];


            // Clear any results ready for the run
            this._pipeline.clearResults();

            //
            // The head is the first process node in the execution chain.
            // To process the source through the execution chain we add
            // each event from the input to the head.
            //

            var head = this._executionChain.pop();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this._input.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    head.addEvent(e);
                }

                //
                // The runner indicates that it is finished with the bounded
                // data by sending a flush() call down the chain. If force is
                // set to false (the default) this is never called.
                //
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (force) {
                head.flush();
            }
        }
    }]);
    return Runner;
}();

/**
 * A pipeline manages a processing chain, for either batch or stream processing
 * of collection data.
 */
/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var Pipeline = function () {

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
     * const p = Pipeline()...`
     * ```
     *
     * @return {Pipeline} The Pipeline
     */

    function Pipeline(arg) {
        (0, _classCallCheck3.default)(this, Pipeline);

        if (arg instanceof Pipeline) {
            var other = arg;
            this._d = other._d;
        } else if (arg instanceof _immutable2.default.Map) {
            this._d = arg;
        } else {
            this._d = new _immutable2.default.Map({
                type: null,
                in: null,
                first: null,
                last: null,
                groupBy: function groupBy() {
                    return "";
                },
                windowType: "global",
                windowDuration: null,
                emitOn: "eachEvent"
            });
        }
        this._results = [];
    }

    //
    // Accessors to the current Pipeline state
    //

    (0, _createClass3.default)(Pipeline, [{
        key: "in",
        value: function _in() {
            return this._d.get("in");
        }
    }, {
        key: "mode",
        value: function mode() {
            return this._d.get("mode");
        }
    }, {
        key: "first",
        value: function first() {
            return this._d.get("first");
        }
    }, {
        key: "last",
        value: function last() {
            return this._d.get("last");
        }
    }, {
        key: "getWindowType",
        value: function getWindowType() {
            return this._d.get("windowType");
        }
    }, {
        key: "getWindowDuration",
        value: function getWindowDuration() {
            return this._d.get("windowDuration");
        }
    }, {
        key: "getGroupBy",
        value: function getGroupBy() {
            return this._d.get("groupBy");
        }
    }, {
        key: "getEmitOn",
        value: function getEmitOn() {
            return this._d.get("emitOn");
        }

        //
        // Results
        //

    }, {
        key: "clearResults",
        value: function clearResults() {
            this._resultsDone = false;
            this._results = null;
        }
    }, {
        key: "addResult",
        value: function addResult(arg1, arg2) {
            if (!this._results) {
                if (_underscore2.default.isString(arg1) && arg2) {
                    this._results = {};
                } else {
                    this._results = [];
                }
            }

            if (_underscore2.default.isString(arg1) && arg2) {
                this._results[arg1] = arg2;
            } else {
                this._results.push(arg1);
            }
            this._resultsDone = false;
        }
    }, {
        key: "resultsDone",
        value: function resultsDone() {
            this._resultsDone = true;
        }

        //
        // Pipeline mutations
        //

        /**
         * Setting the In for the Pipeline returns a new Pipeline
         *
         * @private
         */

    }, {
        key: "_setIn",
        value: function _setIn(input) {
            var mode = void 0;
            var source = input;
            if (input instanceof _series2.default) {
                mode = "batch";
                source = input.collection();
            } else if (input instanceof _pipelineInBounded2.default) {
                mode = "batch";
            } else if (input instanceof _pipelineInUnbounded2.default) {
                mode = "stream";
            } else {
                throw new Error("Unknown input type", input);
            }

            var d = this._d.withMutations(function (map) {
                map.set("in", source).set("mode", mode);
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

    }, {
        key: "_setFirst",
        value: function _setFirst(n) {
            var d = this._d.set("first", n);
            return new Pipeline(d);
        }

        /**
         * Set the last processing node pointed to, returning
         * a new Pipeline. The original pipeline will still point
         * to its orginal processing node.
         *
         * @private
         */

    }, {
        key: "_setLast",
        value: function _setLast(n) {
            var d = this._d.set("last", n);
            return new Pipeline(d);
        }

        /**
         * @private
         */

    }, {
        key: "_append",
        value: function _append(processor) {
            var first = this.first();
            var last = this.last();

            if (!first) first = processor;
            if (last) last.addObserver(processor);
            last = processor;

            var d = this._d.withMutations(function (map) {
                map.set("first", first).set("last", last);
            });
            return new Pipeline(d);
        }

        //
        // Pipeline state chained methods
        //

        /**
         * Set the window, returning a new Pipeline. The argument here
         * is an object with {type, duration}.
         *
         * Window `w` may be:
         *  * A fixed interval: "fixed"
         *  * A calendar interval: "day", "month" or "year"
         *  * ...
         *
         * duration is of the form:
         *  * "30s" or "1d" etc (supports seconds (s), minutes (m), hours (h))
         *
         * @return {Pipeline} The Pipeline
         */

    }, {
        key: "windowBy",
        value: function windowBy(w) {
            var type = void 0,
                duration = void 0;
            if (_underscore2.default.isString(w)) {
                if (w === "daily" || w === "monthly" || w === "yearly") {
                    type = w;
                } else {
                    // assume fixed window with size w
                    type = "fixed";
                    duration = w;
                }
            } else if (_underscore2.default.isObject(w)) {
                type = w.type;
                duration = w.duration;
            } else {
                type = "global";
                duration = null;
            }

            var d = this._d.withMutations(function (map) {
                map.set("windowType", type).set("windowDuration", duration);
            });

            return new Pipeline(d);
        }

        /**
         * Remove windowing from the Pipeline. This will
         * return the pipeline to no window grouping. This is
         * useful if you have first done some aggregated by
         * some window size and then wish to collect together
         * the all resulting events.
         *
         * @return {Pipeline} The Pipeline
         */

    }, {
        key: "clearWindow",
        value: function clearWindow() {
            return this.windowBy();
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

    }, {
        key: "groupBy",
        value: function groupBy(k) {
            var grp = void 0;
            var groupBy = k || "value";
            if (_underscore2.default.isFunction(groupBy)) {
                // group using a user defined function
                // (event) => key
                grp = groupBy;
            } else if (_underscore2.default.isArray(groupBy)) {
                // group by several column values
                grp = function grp(e) {
                    return _underscore2.default.map(groupBy, function (c) {
                        return "" + e.get(c);
                    }).join("::");
                };
            } else if (_underscore2.default.isString(groupBy)) {
                // group by a column value
                grp = function grp(e) {
                    return "" + e.get(groupBy);
                };
            } else {
                // Reset to no grouping
                grp = function grp() {
                    return "";
                };
            }

            var d = this._d.withMutations(function (map) {
                map.set("groupBy", grp);
            });

            return new Pipeline(d);
        }

        /**
         * Remove the grouping from the pipeline. In other words
         * recombine the events.
         *
         * @return {Pipeline} The Pipeline
         */

    }, {
        key: "clearGroupBy",
        value: function clearGroupBy() {
            return this.groupBy();
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

    }, {
        key: "emitOn",
        value: function emitOn(trigger) {
            var d = this._d.set("emitOn", trigger);
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

    }, {
        key: "from",
        value: function from(src) {
            if (src instanceof Pipeline) {
                var pipelineIn = src.in();
                return this._setIn(pipelineIn);
            } else {
                return this._setIn(src);
            }
        }
    }, {
        key: "toEventList",
        value: function toEventList() {
            return this.to(_pipelineOutEvent2.default);
        }
    }, {
        key: "toKeyedCollections",
        value: function toKeyedCollections() {
            return this.to(_pipelineOutCollection2.default);
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

    }, {
        key: "to",
        value: function to(arg1, arg2, arg3) {
            var Out = arg1;
            var observer = void 0;
            var options = {};

            if (_underscore2.default.isFunction(arg2)) {
                observer = arg2;
            } else if (_underscore2.default.isObject(arg2)) {
                options = arg2;
                observer = arg3;
            }

            if (!this.in()) {
                throw new Error("Tried to eval pipeline without a In. Missing from() in chain?");
            }

            var out = new Out(this, options, observer);

            if (this.mode() === "batch") {
                var runner = new Runner(this, out);
                runner.start(true);
                if (this._resultsDone && !observer) {
                    return this._results;
                }
            } else if (this.mode() === "stream") {
                var _out = new Out(this, options, observer);
                if (this.first()) {
                    this.in().addObserver(this.first());
                }
                if (this.last()) {
                    this.last().addObserver(_out);
                } else {
                    this.in().addObserver(_out);
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

    }, {
        key: "count",
        value: function count(observer) {
            var force = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            return this.to(_pipelineOutCollection2.default, function (collection, windowKey, groupByKey) {
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

    }, {
        key: "offsetBy",
        value: function offsetBy(by, fieldSpec) {
            var p = new _offset2.default(this, {
                by: by,
                fieldSpec: fieldSpec,
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

    }, {
        key: "aggregate",
        value: function aggregate(fields) {
            var p = new _aggregator2.default(this, {
                fields: fields,
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

    }, {
        key: "asEvents",
        value: function asEvents(options) {
            var type = _event2.default;
            var p = new _converter2.default(this, (0, _extends3.default)({
                type: type
            }, options, {
                prev: this.last() ? this.last() : this
            }));

            return this._append(p);
        }

        /**
         * Map the event stream using an operator
         *
         * @param  {function} op A function that returns a new Event
         *
         * @return {Pipeline} The Pipeline
         */

    }, {
        key: "map",
        value: function map(op) {
            var p = new _mapper2.default(this, {
                op: op,
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

    }, {
        key: "filter",
        value: function filter(op) {
            var p = new _filter2.default(this, {
                op: op,
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

    }, {
        key: "select",
        value: function select(fieldSpec) {
            var p = new _selector2.default(this, {
                fieldSpec: fieldSpec,
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

    }, {
        key: "collapse",
        value: function collapse(fieldSpec, name, reducer, append) {
            var p = new _collapser2.default(this, {
                fieldSpec: fieldSpec,
                name: name,
                reducer: reducer,
                append: append,
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

    }, {
        key: "take",
        value: function take(limit) {
            var p = new _taker2.default(this, {
                limit: limit,
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

    }, {
        key: "asTimeRangeEvents",
        value: function asTimeRangeEvents(options) {
            var type = _timerangeevent2.default;
            var p = new _converter2.default(this, (0, _extends3.default)({
                type: type
            }, options, {
                prev: this.last() ? this.last() : this
            }));

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

    }, {
        key: "asIndexedEvents",
        value: function asIndexedEvents(options) {
            var type = _indexedevent2.default;
            var p = new _converter2.default(this, (0, _extends3.default)({
                type: type
            }, options, {
                prev: this.last() ? this.last() : this
            }));
            return this._append(p);
        }
    }]);
    return Pipeline;
}();

function pipeline(args) {
    return new Pipeline(args);
}

function is(p) {
    return p instanceof Pipeline;
}

exports.Pipeline = pipeline;
exports.isPipeline = is;