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

var _timeevent = require("./timeevent");

var _timeevent2 = _interopRequireDefault(_timeevent);

var _indexedevent = require("./indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _timerangeevent = require("./timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _timeseries = require("./timeseries");

var _timeseries2 = _interopRequireDefault(_timeseries);

var _bounded = require("./io/bounded");

var _bounded2 = _interopRequireDefault(_bounded);

var _collectionout = require("./io/collectionout");

var _collectionout2 = _interopRequireDefault(_collectionout);

var _eventout = require("./io/eventout");

var _eventout2 = _interopRequireDefault(_eventout);

var _stream = require("./io/stream");

var _stream2 = _interopRequireDefault(_stream);

var _aggregator = require("./processors/aggregator");

var _aggregator2 = _interopRequireDefault(_aggregator);

var _aligner = require("./processors/aligner");

var _aligner2 = _interopRequireDefault(_aligner);

var _collapser = require("./processors/collapser");

var _collapser2 = _interopRequireDefault(_collapser);

var _converter = require("./processors/converter");

var _converter2 = _interopRequireDefault(_converter);

var _derivator = require("./processors/derivator");

var _derivator2 = _interopRequireDefault(_derivator);

var _filler = require("./processors/filler");

var _filler2 = _interopRequireDefault(_filler);

var _filter = require("./processors/filter");

var _filter2 = _interopRequireDefault(_filter);

var _mapper = require("./processors/mapper");

var _mapper2 = _interopRequireDefault(_mapper);

var _offset = require("./processors/offset");

var _offset2 = _interopRequireDefault(_offset);

var _processor = require("./processors/processor");

var _processor2 = _interopRequireDefault(_processor);

var _selector = require("./processors/selector");

var _selector2 = _interopRequireDefault(_selector);

var _taker = require("./processors/taker");

var _taker2 = _interopRequireDefault(_taker);

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


// Processors


// I/O
/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
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
            var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

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
            if (input instanceof _timeseries2.default) {
                mode = "batch";
                source = input.collection();
            } else if (input instanceof _bounded2.default) {
                mode = "batch";
            } else if (input instanceof _stream2.default) {
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
    }, {
        key: "_chainPrev",
        value: function _chainPrev() {
            return this.last() || this;
        }

        //
        // Pipeline state chained methods
        //
        /**
         * Set the window, returning a new Pipeline. A new window will
         * have a type and duration associated with it. Current available
         * types are:
         *   * fixed (e.g. every 5m)
         *   * calendar based windows (e.g. every month)
         *
         * Windows are a type of grouping. Typically you'd define a window
         * on the pipeline before doing an aggregation or some other operation
         * on the resulting grouped collection. You can combine window-based
         * grouping with key-grouping (see groupBy()).
         *
         * There are several ways to define a window. The general format is
         * an options object containing a `type` field and a `duration` field.
         *
         * Currently the only accepted type is `fixed`, but others are planned.
         * For duration, this is a duration string, for example "30s" or "1d".
         * Supported are: seconds (s), minutes (m), hours (h) and days (d).
         *
         * If no arg is supplied, the window type is set to 'global' and there
         * is no duration.
         *
         * There is also a short-cut notation for a fixed window or a calendar
         * window. Simply supplying the duration string ("30s" for example) will
         * result in a `fixed` window type with the supplied duration.
         *
         * Calendar types are specified by simply specifying "daily", "monthly"
         * or "yearly".
         *
         * @param {string|object} w Window or duration - See above
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
         * Sets a new key grouping. Returns a new Pipeline.
         *
         * Grouping is a state set on the Pipeline. Operations downstream
         * of the group specification will use that state. For example, an
         * aggregation would occur over any grouping specified. You can
         * combine a key grouping with windowing (see windowBy()).
         *
         * Note: the key, if it is a field path, is not a list of multiple
         * columns, it is the path to a single column to pull group by keys
         * from. For example, a column called 'status' that contains the
         * values 'OK' and 'FAIL' - then the key would be 'status' and two
         * collections OK and FAIL will be generated.
         *
         * @param {function|array|string}   k   The key to group by.
         *                                      You can groupBy using a function
         *                                      `(event) => return key`,
         *                                      a field path (a field name, or dot
         *                                      delimitted path to a field),
         *                                      or a array of field paths.
         *
         * @return {Pipeline}                   The Pipeline
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
         * @param {Bounded|Stream} src The source for the Pipeline
         * @return {Pipeline} The Pipeline
         */

    }, {
        key: "from",
        value: function from(src) {
            return this._setIn(src);
        }

        /**
         * Directly return the results from the processor rather than
         * feeding to a callback. This breaks the chain, causing a result to
         * be returned (the array of events) rather than a reference to the
         * Pipeline itself. This function is only available for sync batch
         * processing.
         *
         * @return {array|map}     Returns the _results attribute from a Pipeline
         *                         object after processing. Will contain Collection
         *                         objects.
         */

    }, {
        key: "toEventList",
        value: function toEventList() {
            return this.to(_eventout2.default);
        }

        /**
         * Directly return the results from the processor rather than
         * passing a callback in. This breaks the chain, causing a result to
         * be returned (the collections) rather than a reference to the
         * Pipeline itself. This function is only available for sync batch
         * processing.
         *
         * @return {array|map}     Returns the _results attribute from a Pipeline
         *                         object after processing. Will contain Collection
         *                         objects.
         */

    }, {
        key: "toKeyedCollections",
        value: function toKeyedCollections() {
            var result = this.to(_collectionout2.default);
            if (result) {
                return result;
            } else {
                return {};
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
            var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            return this.to(_collectionout2.default, function (collection, windowKey, groupByKey) {
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
            var p = new _offset2.default(this, { by: by, fieldSpec: fieldSpec, prev: this._chainPrev() });

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
         *   .aggregate({
         *      in_avg: {in: avg},
         *      out_avg: {in: avg}
         *   })
         *   .asTimeEvents()
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
            var p = new _aggregator2.default(this, { fields: fields, prev: this._chainPrev() });
            return this._append(p);
        }

        /**
         * Converts incoming TimeRangeEvents or IndexedEvents to
         * TimeEvents. This is helpful since some processors,
         * especially aggregators, will emit TimeRangeEvents or
         * IndexedEvents, which may be unsuitable for some applications.
         *
         * @param  {object} options To convert to an TimeEvent you need
         * to convert a time range to a single time. There are three options:
         *  1. use the beginning time (options = {alignment: "lag"})
         *  2. use the center time (options = {alignment: "center"})
         *  3. use the end time (options = {alignment: "lead"})
         *
         * @return {Pipeline} The Pipeline
         */

    }, {
        key: "asTimeEvents",
        value: function asTimeEvents(options) {
            var type = _timeevent2.default;
            var p = new _converter2.default(this, (0, _extends3.default)({
                type: type
            }, options, {
                prev: this._chainPrev()
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
            var p = new _mapper2.default(this, { op: op, prev: this._chainPrev() });

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
            var p = new _filter2.default(this, { op: op, prev: this._chainPrev() });

            return this._append(p);
        }

        /**
         * Select a subset of columns
         *
         * @param {string|array} fieldSpec  Column or columns to look up. If you need
         *                                  to retrieve multiple deep nested values that
         *                                  ['can.be', 'done.with', 'this.notation'].
         *                                  A single deep value with a string.like.this.
         *                                  If not supplied, the 'value' column will be used.
         *
         * @return {Pipeline} The Pipeline
         */

    }, {
        key: "select",
        value: function select(fieldSpec) {
            var p = new _selector2.default(this, { fieldSpec: fieldSpec, prev: this._chainPrev() });

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
         * @param {string|array} fieldSpecList  Column or columns to collapse. If you need
         *                                      to retrieve multiple deep nested values that
         *                                      ['can.be', 'done.with', 'this.notation'].
         * @param {string}       name       The resulting output column's name
         * @param {function}     reducer    Function to use to do the reduction
         * @param {boolean}      append     Add the new column to the existing ones,
         *                                  or replace them.
         *
         * @return {Pipeline}               The Pipeline
         */

    }, {
        key: "collapse",
        value: function collapse(fieldSpecList, name, reducer, append) {
            var p = new _collapser2.default(this, {
                fieldSpecList: fieldSpecList,
                name: name,
                reducer: reducer,
                append: append,
                prev: this._chainPrev()
            });

            return this._append(p);
        }

        /**
         * Take the data in this event steam and "fill" any missing
         * or invalid values. This could be setting `null` values to `0`
         * so mathematical operations will succeed, interpolate a new
         * value, or pad with the previously given value.
         *
         * If one wishes to limit the number of filled events in the result
         * set, use Pipeline.keep() in the chain. See: TimeSeries.fill()
         * for an example.
         *
         * Fill takes a single arg `options` which should be composed of:
         *  * fieldSpec - Column or columns to look up. If you need
         *                to retrieve multiple deep nested values that
         *                ['can.be', 'done.with', 'this.notation'].
         *                A single deep value with a string.like.this.
         *  * method -    Filling method: zero | linear | pad
         *
         * @return {Pipeline}               The Pipeline
         */

    }, {
        key: "fill",
        value: function fill(_ref) {
            var _ref$fieldSpec = _ref.fieldSpec,
                fieldSpec = _ref$fieldSpec === undefined ? null : _ref$fieldSpec,
                _ref$method = _ref.method,
                method = _ref$method === undefined ? "linear" : _ref$method,
                _ref$limit = _ref.limit,
                limit = _ref$limit === undefined ? null : _ref$limit;

            var prev = this._chainPrev();
            return this._append(new _filler2.default(this, {
                fieldSpec: fieldSpec,
                method: method,
                limit: limit,
                prev: prev
            }));
        }
    }, {
        key: "align",
        value: function align(fieldSpec, window, method, limit) {
            var prev = this._chainPrev();
            return this._append(new _aligner2.default(this, {
                fieldSpec: fieldSpec,
                window: window,
                method: method,
                limit: limit,
                prev: prev
            }));
        }
    }, {
        key: "rate",
        value: function rate(fieldSpec) {
            var allowNegative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var p = new _derivator2.default(this, {
                fieldSpec: fieldSpec,
                allowNegative: allowNegative,
                prev: this._chainPrev()
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
            var p = new _taker2.default(this, { limit: limit, prev: this._chainPrev() });

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
                prev: this._chainPrev()
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
                prev: this._chainPrev()
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