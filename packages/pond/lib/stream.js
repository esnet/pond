"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const _ = require("lodash");
const event_1 = require("./event");
const node_1 = require("./node");
/**
 * @private
 *
 * A `StreamInterface` is the base class for the family of facards placed in front of
 * the underlying `Stream` to provide the appropiate API layer depending on what type
 * of data is being passed through the pipeline at any given stage.
 *
 * At this base class level, it holds onto a reference to the underlying `Stream`
 * object (which contains the root of the `Node` tree into which `Event`s are
 * inserted). It also contains the ability to `addEvent()` method to achieve this (from
 * the user's point of view) and `addNode()` which gives allows additions to the
 * tree.
 *
 * Note that while the tree is held onto by its root node within the `Stream` object,
 * the current addition point, the `tail` is held by each `StreamInterface`. When a
 * `Node` is appended to the `tail` an entirely new interface is returned (its type
 * dependent on the output type of the `Node` appended), and that interface will contain
 * the new tail point on the tree, while the old one is unchanged. This allows for
 * branching of the tree.
 */
class StreamInterface {
    constructor(stream, node) {
        this.stream = stream;
        this.tail = node;
        if (!this.stream.getRoot()) {
            this.stream.setRoot(node);
        }
    }
    /**
     * Returns the underlying `Stream` object, which primarily contains the
     * `root` of the processing graph.
     */
    getStream() {
        return this.stream;
    }
    /**
     * Add events into the stream
     */
    addEvent(e) {
        this.stream.addEvent(e);
    }
    /**
     * @protected
     */
    addNode(node) {
        if (!this.stream.getRoot()) {
            this.stream.setRoot(node);
        }
        if (this.tail) {
            this.tail.addObserver(node);
        }
    }
}
exports.StreamInterface = StreamInterface;
/**
 * An `EventStream` is the interface to the stream provided for manipulation of
 * parts of the streaming pipeline that map a stream of `Event`s of type <IN>.
 *
 * For example a stream of `Event<Time>`s can be mapped to an output stream of
 * new `Event<Time>`s that are aligned to a fixed period boundary. Less or more `Event`s
 * may result.
 *
 * The type parameter `<S>` is the input `Event` type at the top of the stream, since each
 * interface exposes the `addEvent(e: Event<S>)` method for inserting events at the top of
 * the stream this type is maintained across all stream interfaces.
 *
 * The type parameter `<IN>` is the type of `Event`s in this part of the stream. That is
 * nodes created by the API at this point of the tree will expect `Event<IN>`s,
 * and will output new Events, potentially of a different type (identified as `<OUT>`).
 * Typically `<IN>` and `<OUT>` would be `Time`, `TimeRange` or `Index`.
 */
class EventStream extends StreamInterface {
    // tslint:disable-line:max-classes-per-file
    constructor(stream, tail) {
        super(stream, tail);
    }
    /**
     * @private
     *
     * Adds a new `Node` which converts a stream of `Event<IN>` to `Event<OUT>`
     *
     * <IN> is the source type for the processing node
     * <OUT> is the output Event type for the processing node
     *
     * Both IN and OUT extend Key, which is `Time`, `TimeRange` or `Index`, typically.
     */
    addEventToEventNode(node) {
        this.addNode(node);
        return new EventStream(this.getStream(), node);
    }
    /**
     * @private
     *
     * Adds a new `Node` which converts a stream of `Event<IN>`s to a `KeyedCollection<OUT>`.
     *
     * <IN> is the source type for the processing node
     * <OUT> is the output Event type for the processing node
     *
     * Both IN and OUT extend Key, which is Time, TimeRange or Index, typically.
     */
    addEventToCollectorNode(node) {
        this.addNode(node);
        return new KeyedCollectionStream(this.getStream(), node);
    }
    //
    // Public API to a stream carrying `Event`s
    //
    /**
     * Remaps each Event<T> in the stream to a new Event<M>.
     */
    map(mapper) {
        return this.addEventToEventNode(new node_1.MapNode(mapper));
    }
    /**
     * Remaps each Event<IN> in the stream to 0, 1 or many Event<OUT>s.
     */
    flatMap(mapper) {
        return this.addEventToEventNode(new node_1.FlatMapNode(mapper));
    }
    /**
     * Reduces a sequence of past Event<IN>s in the stream to a single output Event<M>.
     */
    reduce(options) {
        return this.addEventToEventNode(new node_1.ReduceNode(options));
    }
    /**
     * Filter out `Event<IN>`s in the stream. Provide a predicate function that
     * given an Event returns true or false.
     *
     * Example:
     * ```
     * const source = stream<Time>()
     *     .filter(e => e.get("a") % 2 !== 0)
     *     .output(evt => {
     *         // -> 1, 3, 5
     *     });
     *
     * source.addEvent(...); // <- 1, 2, 3, 4, 5
     * ```
     */
    filter(predicate) {
        return this.addEventToEventNode(new node_1.FilterNode(predicate));
    }
    /**
     * If you have multiple sources you can feed them into the same stream and combine them
     * with the `coalese()` processor. In this example two event sources are fed into the
     * `Stream`. One contains `Event`s with just a field "in", and the other just a field
     * "out". The resulting output is `Event`s with the latest (in arrival time) value for
     * "in" and "out" together:
     *
     * ```typescript
     * const source = stream()
     *     .coalesce({ fields: ["in", "out"] })
     *     .output((e: Event) => results.push(e));
     *
     * // Stream events
     * for (let i = 0; i < 5; i++) {
     *     source.addEvent(streamIn[i]);  // from stream 1
     *     source.addEvent(streamOut[i]); // from stream 2
     * }
     * ```
     */
    coalesce(options) {
        const { fields } = options;
        function keyIn(...keys) {
            // @ts-ignore
            const keySet = Immutable.Set(...keys);
            return (v, k) => {
                return keySet.has(k);
            };
        }
        return this.addEventToEventNode(new node_1.ReduceNode({
            count: 1,
            iteratee(accum, eventList) {
                const currentEvent = eventList.get(0);
                const currentKey = currentEvent.getKey();
                const accumulatedEvent = !_.isNull(accum)
                    ? accum
                    : event_1.event(currentKey, Immutable.Map({}));
                const filteredData = currentEvent.getData().filter(keyIn(fields));
                return event_1.event(currentKey, accumulatedEvent.getData().merge(filteredData));
            }
        }));
    }
    /**
     * Fill missing values in stream events.
     *
     * Missing values can be filled with different `method`s:
     *  * FillMethod.Linear - linear interpolation
     *  * FillMethod.Pad - as padding (filling with a previous value)
     *  * FillMethod.Zero or filled with zeros.
     *
     * You can also specify the number of events you are willing to fill
     * before giving up using the `limit` option. This is because commonly
     * you might want to fill the occasional hole in data, but if you have
     * a true outage of data then you want to keep that instead of a
     * worthless fill.
     *
     * Example:
     * ```
     * const source = stream()
     *     .fill({ method: FillMethod.Linear, fieldSpec: "value", limit: 2 })
     *     .output(event => {
     *         const e = event as Event;
     *         results.push(e);
     *     });
     * ```
     */
    fill(options) {
        return this.addEventToEventNode(new node_1.FillNode(options));
    }
    /**
     * Align `Event`s in the stream to a specific boundary at a fixed `period`.
     * Options are a `AlignmentOptions` object where you specify which field to
     * align with `fieldSpec`, what boundary `period` to use with `window` and
     * the method of alignment with `method` (which can be either `Linear`
     * interpolation, or `Hold`).
     *
     * Example:
     * ```
     * const s = stream()
     *     .align({
     *         fieldSpec: "value",
     *         window: period("1m"),
     *         method: AlignmentMethod.Linear
     *     })
     * ```
     */
    align(options) {
        return this.addEventToEventNode(new node_1.AlignNode(options));
    }
    /**
     * Convert incoming `Event`s in the stream to rates (essentially taking
     * the derivative over time). The resulting output `Event`s will be
     * of type `Event<TimeRange>`, where the `TimeRange` key will be
     * the time span over which the rate was calculated. If you want you
     * can remap this later and decide on a timestamp to use instead.
     *
     * Options are a `RateOptions` object, where you specify which field
     * to take the rate of with `fieldSpec` and can also optionally choose
     * to include negative rates with `allowNegative`. (the default
     * is to ignore negative rates). This is a useful option if you expect
     * the incoming values to always increase while a decrease is considered
     * a bad condition (e.g. network counters or click counts).
     *
     * Example:
     *
     * ```
     * const s = stream()
     *     .align({...})
     *     .rate({ fieldSpec: "value", allowNegative: false })
     * ```
     */
    rate(options) {
        return this.addEventToEventNode(new node_1.RateNode(options));
    }
    /**
     * Convert incoming `Event`s to new `Event`s with on the specified
     * fields selected out of the source.
     *
     * Example:
     *
     * Events with fields a, b, c can be mapped to events with only
     * b and c:
     *
     * ```
     * const s = stream()
     *      .select(["b", "c"])
     * ```
     */
    select(options) {
        return this.addEventToEventNode(new node_1.SelectNode(options));
    }
    /**
     * Convert incoming `Event`s to new `Event`s with specified
     * fields collapsed into a new field using an aggregation function.
     *
     * Example:
     *
     * Events with fields a, b, c can be mapped to events with only a field
     * containing the avg of a and b called "ab".
     *
     * ```
     * const s = stream()
     *      .collapse({
     *          fieldSpecList: ["a", "b"],
     *          fieldName: "ab",
     *          reducer: avg(),
     *          append: false
     *      })
     * ```
     */
    collapse(options) {
        return this.addEventToEventNode(new node_1.CollapseNode(options));
    }
    /**
     * An output, specified as an `EventCallback`, essentially `(event: Event<Key>) => void`.
     *
     * Using this method you are able to access the stream result. Your callback
     * function will be called whenever a new Event is available. Not that currently the
     * type will be Event<Key> as the event is generically passed through the stream, but
     * you can cast the type (if you are using Typescript).
     *
     * Example:
     * ```
     * const source = stream<Time>()
     *     .groupByWindow({...})
     *     .aggregate({...})
     *     .output(event => {
     *         const e = event as Event<Index>;
     *         // Do something with the event e
     *     });
     * ```
     */
    output(callback) {
        return this.addEventToEventNode(new node_1.EventOutputNode(callback));
    }
    /**
     * The heart of the streaming code is that in addition to remapping operations of
     * a stream of events, you can also group by a window. This is what allows you to do
     * rollups within the streaming code.
     *
     * A window is defined with the `WindowingOptions`, which allows you to specify
     * the window period as a `Period` (e.g. `period("30m")` for each 30 minutes window)
     * as the `window`, and a `Trigger` enum value (emit a completed window on each
     * incoming `Event` or on each completed window).
     *
     * The return type of this operation will no longer be an `EventStream` but rather
     * a `KeyedCollectionStream` as each entity passed down the stream is no longer an
     * `Event` but rather a tuple mapping a key (the window name) to a `Collection`
     * which contains all `Event`s in the window. So, see `KeyedCollectionStream`
     * for what can be done as the next pipeline step. But spoiler alert, generally
     * the next step is to `aggregate()` those windows back to `Events` or to `output()`
     * to `Collection`s.
     *
     * Example:
     *
     * ```
     * const source = stream<Time>()
     *     .groupByWindow({
     *         window: period("30m"),
     *         trigger: Trigger.perEvent
     *     })
     *     .aggregate({...})
     *     .output(e => {
     *         ...
     *     });
     */
    groupByWindow(options) {
        return this.addEventToCollectorNode(new node_1.WindowOutputNode(options));
    }
}
exports.EventStream = EventStream;
/**
 * A `KeyedCollectionStream` is a stream containing tuples mapping a string key
 * to a `Collection`. When you window a stream you will get one of these that
 * maps a string representing the window to the `Collection` of all `Event`s in
 * that window.
 *
 * Using this class you can `output()` that or `aggregate()` the `Collection`s
 * back to `Event`s.
 */
// tslint:disable-next-line:max-classes-per-file
class KeyedCollectionStream extends StreamInterface {
    // tslint:disable-line:max-classes-per-file
    constructor(stream, tail) {
        super(stream, tail);
    }
    /**
     * @private
     *
     * A helper function to create a new `Node` in the graph. The new node will be a
     * processor that remaps a stream of `KeyedCollection`s to another stream of
     * `KeyedCollection`s.
     */
    addKeyedCollectionToKeyedCollectionNode(node) {
        this.addNode(node);
        return new KeyedCollectionStream(this.getStream(), node);
    }
    /**
     * @private
     *
     * Helper function to create a new `Node` in the graph. The new node will be a
     * processor that we remap a stream of `KeyedCollection`s back to `Event`s. An
     * example would be an aggregation.
     */
    addKeyedCollectionToEventNode(node) {
        this.addNode(node);
        return new EventStream(this.getStream(), node);
    }
    /**
     * An output, specified as an `KeyedCollectionCallback`:
     * `(collection: Collection<T>, key: string) => void`.
     *
     * Using this method you are able to access the stream result. Your callback
     * function will be called whenever a new `Collection` is available.
     *
     * Example:
     * ```
     * const source = stream<Time>()
     *     .groupByWindow({...})
     *     .output(collection => {
     *         // Do something with the collection
     *     });
     * ```
     */
    output(callback) {
        return this.addKeyedCollectionToKeyedCollectionNode(new node_1.KeyedCollectionOutputNode(callback));
    }
    /**
     * Takes an incoming tuple mapping a key to a `Collection`
     * (containing all `Event`s in the window) and reduces that down
     * to an output `Event<Index>` using an aggregation specification. As
     * indicated, the output is an `IndexedEvent`, since the `Index` describes
     * the the window the aggregation was made from.
     *
     * The `AggregationSpec` which describes the reduction, is a mapping of the
     * the desired output field to the combination of input field and aggregation function.
     * In the example below, `in_avg` is the new field, which is the aggregation
     * of all the `in` fields in the `Collection` using the `avg()` function. Thus an
     * output event would contain just the `in_avg` field and its value would be
     * the average of all the `in` fields in the collection, for that window. That
     * `Event` would have an `Index` which describes the window from which it came.
     *
     * @example
     *
     * ```
     * const source = stream()
     *     .groupByWindow({
     *         window: period("30m"),
     *         trigger: Trigger.perEvent
     *     })
     *     .aggregate({
     *         in_avg: ["in", avg()],
     *         out_avg: ["out", avg()]
     *     })
     *     .output(event => {
     *         ...
     *     });
     * ```
     */
    aggregate(spec) {
        return this.addKeyedCollectionToEventNode(new node_1.AggregationNode(spec));
    }
}
exports.KeyedCollectionStream = KeyedCollectionStream;
//
// Master stream
//
/**
 * `Stream` and its associated objects are designed for processing of incoming
 * `Event` streams at real time. This is useful for live dashboard situations or
 * possibly real time monitoring and alerting from event streams.
 *
 * Supports remapping, filtering, windowing and aggregation. It is designed for
 * relatively light weight handling of incoming events. Any distribution of
 * incoming events to different streams should be handled by the user. Typically
 * you would separate streams based on some incoming criteria.
 *
 * A `Stream` object manages a tree of processing `Node`s, each type of which
 * maps either `Event`s to other `Event`s or to and from a `KeyedCollection`.
 * When an `Event` is added to the stream it will enter the top processing
 * node where it will be processed to produce 0, 1 or many output `Event`s.
 * Then then are passed down the tree until an output is reached.
 *
 * When a `Stream` is initially created with the `stream()` factory function
 * the interface exposed is an `EventStream`. If you perform a windowing operation
 * you will be exposed to a `KeyedCollectionStream`. If you aggregate a
 * `KeyedCollectionStream` you will be back to an `EventStream` and so on.
 *
 * You can think of the `Stream` as the thing that holds the root of the processing
 * node chain, while either an `EventStream` or `KeyedCollectionStream` holds the
 * current leaf of the tree (the `tail`) onto which additional operating nodes
 * can be added using the `EventStream` or `KeyedCollectionStream` API.
 *
 * ---
 * Note:
 *
 * Generic grouping ("group by") should be handled outside of Pond now by creating
 * multiple streams and mapping incoming `Event`s to those streams. This allows for flexibility
 * as to where those streams live and how work should be divided.
 *
 * For "at scale" stream processing, use Apache Beam or Spark. This library is intended to
 * simplify passing of events to a browser and enabling convenient processing for visualization
 * purposes, or for light weight handling of events in Node.js such as simple event alerting.
 *
 * ---
 * Examples:
 *
 * ```typescript
 * const result = {};
 * const slidingWindow = window(duration("3m"), period(duration("1m")));
 * const fixedHourlyWindow = window(duration("1h"));
 *
 * const source = stream()
 *     .groupByWindow({
 *         window: slidingWindow,
 *         trigger: Trigger.onDiscardedWindow
 *     })
 *     .aggregate({
 *         in_avg: ["in", avg()],
 *         out_avg: ["out", avg()],
 *         count: ["in", count()]
 *     })
 *     .map(e =>
 *         new Event<Time>(time(e.timerange().end()), e.getData())
 *     )
 *     .groupByWindow({
 *         window: fixedHourlyWindow,
 *         trigger: Trigger.perEvent
 *     })
 *     .output((col, key) => {
 *         result[key] = col as Collection<Time>;
 *         calls += 1;
 *     });
 *
 * source.addEvent(e1)
 * source.addEvent(e2)
 * ...
 * ```
 *
 * If you need to branch a stream, pass the parent stream into the `stream()` factory
 * function as its only arg:
 *
 * ```
 * const source = stream().map(
 *     e => event(e.getKey(), Immutable.Map({ a: e.get("a") * 2 }))
 * );
 *
 * stream(source)
 *     .map(e => event(e.getKey(), Immutable.Map({ a: e.get("a") * 3 })))
 *     .output(e => {
 *         //
 *     });
 *
 * stream(source)
 *     .map(e => event(e.getKey(), Immutable.Map({ a: e.get("a") * 4 })))
 *     .output(e => {
 *         //
 *     });
 *
 * source.addEvent(...);
 *
 * ```
 *
 * If you have multiple sources you can feed them into the same stream and combine them
 * with the `coalese()` processor. In this example two event sources are fed into the
 * `Stream`. One contains `Event`s with just a field "in", and the other just a field
 * "out". The resulting output is `Event`s with the latest (in arrival time) value for
 * "in" and "out" together:
 *
 * ```typescript
 * const source = stream()
 *     .coalesce({ fields: ["in", "out"] })
 *     .output(e => results.push(e));
 *
 * // Stream events
 * for (let i = 0; i < 5; i++) {
 *     source.addEvent(streamIn[i]);  // from stream 1
 *     source.addEvent(streamOut[i]); // from stream 2
 * }
 * ```
 *
 * You can do generalized reduce operations where you supply a function that
 * is provided with the last n points (defaults to 1) and the previous result
 * which is an `Event`. You will return the next result, and `Event`.
 *
 * You could use this to produce a running total:
 *
 * ```
 * const source = stream()
 *     .reduce({
 *         count: 1,
 *         accumulator: event(time(), Immutable.Map({ total: 0 })),
 *         iteratee(accum, eventList) {
 *             const current = eventList.get(0);
 *             const total = accum.get("total") + current.get("count");
 *             return event(time(current.timestamp()), Immutable.Map({ total }));
 *         }
 *     })
 *     .output(e => console.log("Running total:", e.toString()) );
 *
 * // Add Events into the source...
 * events.forEach(e => source.addEvent(e));
 * ```
 *
 * Or produce a rolling average:
 * ```
 * const source = stream()
 *     .reduce({
 *         count: 5,
 *         iteratee(accum, eventList) {
 *             const values = eventList.map(e => e.get("value")).toJS();
 *             return event(
 *                 time(eventList.last().timestamp()),
 *                 Immutable.Map({ avg: avg()(values) })
 *             );
 *          }
 *     })
 *     .output(e => console.log("Rolling average:", e.toString()) );
 *
 * // Add Events into the source...
 * events.forEach(e => source.addEvent(e));
 * ```
 */
// tslint:disable-next-line:max-classes-per-file
class Stream {
    constructor(upstream) {
        this.root = null;
    }
    /**
     * @private
     * Set a new new root onto the `Stream`. This is used internally.
     */
    setRoot(node) {
        this.root = node;
    }
    /**
     * @private
     * Returns the `root` node of the entire processing tree. This is used internally.
     */
    getRoot() {
        return this.root;
    }
    /**
     * Add an `Event` into the root node of the stream
     */
    addEvent(e) {
        if (this.root) {
            this.root.set(e);
        }
    }
}
exports.Stream = Stream;
/*
 * `Stream` and its associated objects are designed for processing of incoming
 * `Event` streams at real time. This is useful for live dashboard situations or
 * possibly real time monitoring and alerting from event streams.
 */
function eventStreamFactory() {
    const s = new Stream();
    const n = new node_1.EventInputNode();
    return new EventStream(s, n);
}
exports.stream = eventStreamFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUc1QixtQ0FBdUM7QUFLdkMsaUNBZ0JnQjtBQWlCaEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFhLGVBQWU7SUFLeEIsWUFBWSxNQUFpQixFQUFFLElBQXNCO1FBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVM7UUFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLENBQVc7UUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9CO0lBQ0wsQ0FBQztDQUNKO0FBdkNELDBDQXVDQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsTUFBYSxXQUEyQyxTQUFRLGVBQXNCO0lB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