/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as Immutable from "immutable";
import * as _ from "lodash";

import { Base } from "./base";
import { Collection } from "./collection";
import { Event, event } from "./event";
import { Index, index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Processor } from "./processor";
import { Time, time } from "./time";
import { TimeRange } from "./timerange";

import { Trigger } from "./types";

import { GroupedCollection } from "./groupedcollection";
import { WindowedCollection } from "./windowedcollection";

import {
    AggregationNode,
    AlignNode,
    CollapseNode,
    EventInputNode,
    EventOutputNode,
    FillNode,
    FilterNode,
    FlatMapNode,
    KeyedCollectionOutputNode,
    MapNode,
    Node,
    RateNode,
    ReduceNode,
    SelectNode,
    WindowOutputNode
} from "./node";

import {
    AggregationSpec,
    AggregationTuple,
    AlignmentMethod,
    AlignmentOptions,
    CoalesceOptions,
    CollapseOptions,
    EventCallback,
    FillOptions,
    KeyedCollection,
    KeyedCollectionCallback,
    RateOptions,
    ReduceOptions,
    SelectOptions,
    WindowingOptions
} from "./types";

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
export class StreamInterface<IN extends Key, S extends Key> {
    // tslint:disable-line:max-classes-per-file

    constructor(protected stream: Stream<S>, protected tail: Node<Base, Base>) {}

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
    addEvent(e: Event<S>) {
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
export class EventStream<IN extends Key, S extends Key> extends StreamInterface<IN, S> {
    // tslint:disable-line:max-classes-per-file
    constructor(stream: Stream<S>, tail: Node<Base, Base>) {
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
    addEventToEventNode<OUT extends Key>(node: EventMap<IN, OUT>) {
        this.addNode(node);
        return new EventStream<OUT, S>(this.getStream(), node);
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
    addEventToCollectorNode<OUT extends Key>(node: EventToKeyedCollection<IN, OUT>) {
        this.addNode(node);
        return new KeyedCollectionStream<OUT, S>(this.getStream(), node);
    }

    //
    // Public API to a stream carrying `Event`s
    //

    /**
     * Remaps each Event<T> in the stream to a new Event<M>.
     */
    map<OUT extends Key>(mapper: (event: Event<IN>) => Event<OUT>) {
        return this.addEventToEventNode(new MapNode<IN, OUT>(mapper));
    }

    /**
     * Remaps each Event<IN> in the stream to 0, 1 or many Event<OUT>s.
     */
    flatMap<OUT extends Key>(mapper: (event: Event<IN>) => Immutable.List<Event<OUT>>) {
        return this.addEventToEventNode(new FlatMapNode<IN, OUT>(mapper));
    }

    /**
     * Reduces a sequence of past Event<IN>s in the stream to a single output Event<M>.
     */
    reduce(options: ReduceOptions<IN>) {
        return this.addEventToEventNode(new ReduceNode<IN>(options));
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
    filter<M extends Key>(predicate: (event: Event<IN>) => boolean) {
        return this.addEventToEventNode(new FilterNode<IN>(predicate));
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
    coalesce(options: CoalesceOptions) {
        const { fields } = options;
        function keyIn(...keys) {
            const keySet = Immutable.Set(...keys);
            return (v, k) => {
                return keySet.has(k);
            };
        }
        return this.addEventToEventNode(
            new ReduceNode<IN>({
                count: 1,
                iteratee(accum, eventList) {
                    const currentEvent = eventList.get(0);
                    const currentKey = currentEvent.getKey();
                    const accumulatedEvent = !_.isNull(accum)
                        ? accum
                        : event(currentKey, Immutable.Map({}));
                    const filteredData = currentEvent.getData().filter(keyIn(fields));
                    return event(currentKey, accumulatedEvent.getData().merge(filteredData));
                }
            })
        );
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
    fill(options: FillOptions) {
        return this.addEventToEventNode(new FillNode<IN>(options));
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
    align(options: AlignmentOptions) {
        return this.addEventToEventNode(new AlignNode<IN>(options));
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
    rate(options: RateOptions) {
        return this.addEventToEventNode(new RateNode<IN>(options));
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
    select(options: SelectOptions) {
        return this.addEventToEventNode(new SelectNode<IN>(options));
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
    collapse(options: CollapseOptions) {
        return this.addEventToEventNode(new CollapseNode<IN>(options));
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
    output(callback: EventCallback<IN>) {
        return this.addEventToEventNode<IN>(new EventOutputNode<IN>(callback));
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
    groupByWindow(options: WindowingOptions) {
        return this.addEventToCollectorNode(new WindowOutputNode<IN>(options));
    }
}

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
export class KeyedCollectionStream<IN extends Key, S extends Key> extends StreamInterface<IN, S> {
    // tslint:disable-line:max-classes-per-file
    constructor(stream: Stream<S>, tail: Node<Base, Base>) {
        super(stream, tail);
    }

    /**
     * @private
     *
     * A helper function to create a new `Node` in the graph. The new node will be a
     * processor that remaps a stream of `KeyedCollection`s to another stream of
     * `KeyedCollection`s.
     */
    addKeyedCollectionToKeyedCollectionNode<OUT extends Key>(node: KeyedCollectionMap<IN, OUT>) {
        this.addNode(node);
        return new KeyedCollectionStream<OUT, S>(this.getStream(), node);
    }

    /**
     * @private
     *
     * Helper function to create a new `Node` in the graph. The new node will be a
     * processor that we remap a stream of `KeyedCollection`s back to `Event`s. An
     * example would be an aggregation.
     */
    addKeyedCollectionToEventNode<OUT extends Key>(node: KeyedCollectionToEvent<IN, OUT>) {
        this.addNode(node);
        return new EventStream<OUT, S>(this.getStream(), node);
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
    output(callback: KeyedCollectionCallback<IN>) {
        return this.addKeyedCollectionToKeyedCollectionNode<IN>(
            new KeyedCollectionOutputNode<IN>(callback)
        );
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
    aggregate(spec: AggregationSpec<IN>) {
        return this.addKeyedCollectionToEventNode<Index>(new AggregationNode<IN>(spec));
    }
}

//
// Node types map from S -> T
//

export type EventToKeyedCollection<S extends Key, T extends Key> = Node<
    Event<S>,
    KeyedCollection<T>
>;
export type KeyedCollectionToEvent<S extends Key, T extends Key> = Node<
    KeyedCollection<S>,
    Event<T>
>;
export type KeyedCollectionMap<S extends Key, T extends Key> = Node<
    KeyedCollection<S>,
    KeyedCollection<T>
>;
export type EventMap<S extends Key, T extends Key> = Node<Event<S>, Event<T>>;

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
export class Stream<U extends Key = Time> {
    /**
     * The root of the entire event processing tree. All incoming `Event`s are
     * provided to this `Node`.
     */
    private root: Node<Base, Base>;

    constructor(upstream?: Stream<U>) {
        this.root = null;
    }

    /**
     * @private
     * Set a new new root onto the `Stream`. This is used internally.
     */
    setRoot(node: Node<Base, Base>) {
        this.root = node;
    }

    /**
     * @private
     * Returns the `root` node of the entire processing tree. This is used internally.
     */
    getRoot(): Node<Base, Base> {
        return this.root;
    }

    /**
     * Add an `Event` into the root node of the stream
     */
    addEvent<T extends Key>(e: Event<U>) {
        if (this.root) {
            this.root.set(e);
        }
    }
}

/*
 * `Stream` and its associated objects are designed for processing of incoming
 * `Event` streams at real time. This is useful for live dashboard situations or
 * possibly real time monitoring and alerting from event streams.
 */
function eventStreamFactory<T extends Key>(): EventStream<T, T> {
    const s = new Stream<T>();
    const n = new EventInputNode<T>();
    return new EventStream<T, T>(s, n);
}

export { eventStreamFactory as stream };
