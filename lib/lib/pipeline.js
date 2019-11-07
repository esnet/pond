"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pipeline = pipeline;
exports.isPipeline = is;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _immutable = _interopRequireDefault(require("immutable"));

var _underscore = _interopRequireDefault(require("underscore"));

var _timeevent = _interopRequireDefault(require("./timeevent"));

var _indexedevent = _interopRequireDefault(require("./indexedevent"));

var _timerangeevent = _interopRequireDefault(require("./timerangeevent"));

var _timeseries = _interopRequireDefault(require("./timeseries"));

var _bounded = _interopRequireDefault(require("./io/bounded"));

var _collectionout = _interopRequireDefault(require("./io/collectionout"));

var _eventout = _interopRequireDefault(require("./io/eventout"));

var _stream = _interopRequireDefault(require("./io/stream"));

var _aggregator = _interopRequireDefault(require("./processors/aggregator"));

var _aligner = _interopRequireDefault(require("./processors/aligner"));

var _collapser = _interopRequireDefault(require("./processors/collapser"));

var _converter = _interopRequireDefault(require("./processors/converter"));

var _derivator = _interopRequireDefault(require("./processors/derivator"));

var _filler = _interopRequireDefault(require("./processors/filler"));

var _filter = _interopRequireDefault(require("./processors/filter"));

var _mapper = _interopRequireDefault(require("./processors/mapper"));

var _offset = _interopRequireDefault(require("./processors/offset"));

var _processor = _interopRequireDefault(require("./processors/processor"));

var _selector = _interopRequireDefault(require("./processors/selector"));

var _taker = _interopRequireDefault(require("./processors/taker"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
    this._pipeline = pipeline; //
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
    } //
    // Using the list of nodes in the tree that will be involved in
    // our processing we can build an execution chain. This is the
    // chain of processor clones, linked together, for our specific
    // processing pipeline. We run this execution chain later by
    // evoking start().
    //


    this._executionChain = [this._output];
    var prev = this._output;
    processChain.forEach(p => {
      if (p instanceof _processor.default) {
        var processor = p.clone();
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


  start() {
    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    // Clear any results ready for the run
    this._pipeline.clearResults(); //
    // The head is the first process node in the execution chain.
    // To process the source through the execution chain we add
    // each event from the input to the head.
    //


    var head = this._executionChain.pop();

    for (var e of this._input.events()) {
      head.addEvent(e);
    } //
    // The runner indicates that it is finished with the bounded
    // data by sending a flush() call down the chain. If force is
    // set to false (the default) this is never called.
    //


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
   * const p = Pipeline()...`
   * ```
   *
   * @return {Pipeline} The Pipeline
   */
  constructor(arg) {
    if (arg instanceof Pipeline) {
      var other = arg;
      this._d = other._d;
    } else if (arg instanceof _immutable.default.Map) {
      this._d = arg;
    } else {
      this._d = new _immutable.default.Map({
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

    this._results = [];
  } //
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
  } //
  // Results
  //


  clearResults() {
    this._resultsDone = false;
    this._results = null;
  }

  addResult(arg1, arg2) {
    if (!this._results) {
      if (_underscore.default.isString(arg1) && arg2) {
        this._results = {};
      } else {
        this._results = [];
      }
    }

    if (_underscore.default.isString(arg1) && arg2) {
      this._results[arg1] = arg2;
    } else {
      this._results.push(arg1);
    }

    this._resultsDone = false;
  }

  resultsDone() {
    this._resultsDone = true;
  } //
  // Pipeline mutations
  //

  /**
   * Setting the In for the Pipeline returns a new Pipeline
   *
   * @private
   */


  _setIn(input) {
    var mode;
    var source = input;

    if (input instanceof _timeseries.default) {
      mode = "batch";
      source = input.collection();
    } else if (input instanceof _bounded.default) {
      mode = "batch";
    } else if (input instanceof _stream.default) {
      mode = "stream";
    } else {
      throw new Error("Unknown input type", input);
    }

    var d = this._d.withMutations(map => {
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


  _setFirst(n) {
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


  _setLast(n) {
    var d = this._d.set("last", n);

    return new Pipeline(d);
  }
  /**
   * @private
   */


  _append(processor) {
    var first = this.first();
    var last = this.last();
    if (!first) first = processor;
    if (last) last.addObserver(processor);
    last = processor;

    var d = this._d.withMutations(map => {
      map.set("first", first).set("last", last);
    });

    return new Pipeline(d);
  }

  _chainPrev() {
    return this.last() || this;
  } //
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


  windowBy(w) {
    var type, duration;

    if (_underscore.default.isString(w)) {
      if (w === "daily" || w === "monthly" || w === "yearly") {
        type = w;
      } else {
        // assume fixed window with size w
        type = "fixed";
        duration = w;
      }
    } else if (_underscore.default.isObject(w)) {
      type = w.type;
      duration = w.duration;
    } else {
      type = "global";
      duration = null;
    }

    var d = this._d.withMutations(map => {
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


  clearWindow() {
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


  groupBy(k) {
    var grp;
    var groupBy = k || "value";

    if (_underscore.default.isFunction(groupBy)) {
      // group using a user defined function
      // (event) => key
      grp = groupBy;
    } else if (_underscore.default.isArray(groupBy)) {
      // group by several column values
      grp = e => _underscore.default.map(groupBy, c => "".concat(e.get(c))).join("::");
    } else if (_underscore.default.isString(groupBy)) {
      // group by a column value
      grp = e => "".concat(e.get(groupBy));
    } else {
      // Reset to no grouping
      grp = () => "";
    }

    var d = this._d.withMutations(map => {
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


  clearGroupBy() {
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


  emitOn(trigger) {
    var d = this._d.set("emitOn", trigger);

    return new Pipeline(d);
  } //
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


  from(src) {
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


  toEventList() {
    return this.to(_eventout.default);
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


  toKeyedCollections() {
    var result = this.to(_collectionout.default);

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


  to(arg1, arg2, arg3) {
    var Out = arg1;
    var observer;
    var options = {};

    if (_underscore.default.isFunction(arg2)) {
      observer = arg2;
    } else if (_underscore.default.isObject(arg2)) {
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


  count(observer) {
    var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return this.to(_collectionout.default, (collection, windowKey, groupByKey) => {
      observer(collection.size(), windowKey, groupByKey);
    }, force);
  } //
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
    var p = new _offset.default(this, {
      by,
      fieldSpec,
      prev: this._chainPrev()
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


  aggregate(fields) {
    var p = new _aggregator.default(this, {
      fields,
      prev: this._chainPrev()
    });
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


  asTimeEvents(options) {
    var type = _timeevent.default;
    var p = new _converter.default(this, _objectSpread({
      type
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


  map(op) {
    var p = new _mapper.default(this, {
      op,
      prev: this._chainPrev()
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
    var p = new _filter.default(this, {
      op,
      prev: this._chainPrev()
    });
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


  select(fieldSpec) {
    var p = new _selector.default(this, {
      fieldSpec,
      prev: this._chainPrev()
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


  collapse(fieldSpecList, name, reducer, append) {
    var p = new _collapser.default(this, {
      fieldSpecList,
      name,
      reducer,
      append,
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


  fill(_ref) {
    var {
      fieldSpec = null,
      method = "linear",
      limit = null
    } = _ref;

    var prev = this._chainPrev();

    return this._append(new _filler.default(this, {
      fieldSpec,
      method,
      limit,
      prev
    }));
  }

  align(fieldSpec, window, method, limit) {
    var prev = this._chainPrev();

    return this._append(new _aligner.default(this, {
      fieldSpec,
      window,
      method,
      limit,
      prev
    }));
  }

  rate(fieldSpec) {
    var allowNegative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var p = new _derivator.default(this, {
      fieldSpec,
      allowNegative,
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


  take(limit) {
    var p = new _taker.default(this, {
      limit,
      prev: this._chainPrev()
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
    var type = _timerangeevent.default;
    var p = new _converter.default(this, _objectSpread({
      type
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


  asIndexedEvents(options) {
    var type = _indexedevent.default;
    var p = new _converter.default(this, _objectSpread({
      type
    }, options, {
      prev: this._chainPrev()
    }));
    return this._append(p);
  }

}

function pipeline(args) {
  return new Pipeline(args);
}

function is(p) {
  return p instanceof Pipeline;
}