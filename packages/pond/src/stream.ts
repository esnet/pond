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

import { Align } from "./align";
import { Collapse } from "./collapse";
import { Fill } from "./fill";
import { Rate } from "./rate";
import { Reducer } from "./reduce";
import { Select } from "./select";

import { GroupedCollection } from "./groupedcollection";
import { WindowedCollection } from "./windowedcollection";

import {
    AggregationSpec,
    AggregationTuple,
    AlignmentMethod,
    AlignmentOptions,
    CoalesceOptions,
    CollapseOptions,
    FillOptions,
    RateOptions,
    ReduceOptions,
    SelectOptions,
    WindowingOptions
} from "./types";

/**
 * A Node is a transformation between type S and type T. Both S
 * and T much extend Base.
 *
 * The transformation happens when a `Node` has its `set()` method called
 * by another `Node`. The `input` to set() is of type `S`. When this happens
 * a subclass specific implementation of `process` is called to actually
 * transform the input (of type `S` to an output of type `T`). Of course
 * `S` and `T` maybe the same if the input and output types are expected
 * to be the same. The result of `process`, of type `T`, is returned and
 * the passed onto other downstream Nodes, by calling their `set()` methods.
 */

export type EventCallback = (event: Event<Key>) => void;
export type KeyedCollectionCallback<T extends Key> = (
    collection: Collection<T>,
    key: string
) => void;

export type KeyedCollection<T extends Key> = [string, Collection<T>];

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
export abstract class Node<S extends Base, T extends Base> {
    // Members
    protected observers = Immutable.List<Node<T, Base>>();

    public addObserver(node: Node<T, Base>): void {
        this.observers = this.observers.push(node);
    }

    public set(input: S) {
        const outputs = this.process(input);
        if (outputs) {
            outputs.forEach(output => this.notify(output));
        }
    }

    protected notify(output: T): void {
        if (this.observers.size > 0) {
            this.observers.forEach(node => {
                node.set(output);
            });
        }
    }

    protected abstract process(input: S): Immutable.List<T>;
}

//
// Nodes
//

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class EventInputNode<T extends Key> extends Node<Event<T>, Event<T>> {
    constructor() {
        super();
        // pass
    }
    process(e: Event<T>): Immutable.List<Event<T>> {
        return Immutable.List([e]);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class EventOutputNode<T extends Key> extends Node<Event<T>, Event<T>> {
    constructor(private callback: EventCallback) {
        super();
        // pass
    }
    process(e: Event<T>) {
        this.callback(e);
        return Immutable.List();
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class KeyedCollectionOutputNode<T extends Key> extends Node<
    KeyedCollection<T>,
    KeyedCollection<T>
> {
    constructor(private callback: KeyedCollectionCallback<T>) {
        super();
        // pass
    }
    process(keyedCollection: KeyedCollection<T>) {
        const [key, collection] = keyedCollection;
        this.callback(collection, key);
        return Immutable.List();
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class MapNode<T extends Key, M extends Key> extends Node<Event<T>, Event<M>> {
    constructor(private mapper: (event: Event<T>) => Event<M>) {
        super();
    }

    process(e: Event<T>): Immutable.List<Event<M>> {
        return Immutable.List([this.mapper(e)]);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class FlatMapNode<T extends Key, M extends Key> extends Node<Event<T>, Event<M>> {
    constructor(private mapper: (event: Event<T>) => Immutable.List<Event<M>>) {
        super();
    }

    process(e: Event<T>) {
        return this.mapper(e);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class FillNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor: Fill<T>;
    constructor(options: FillOptions) {
        super();
        this.processor = new Fill<T>(options);
    }

    process(e: Event<T>) {
        return this.processor.addEvent(e);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class AlignNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor: Align<T>;
    constructor(options: AlignmentOptions) {
        super();
        this.processor = new Align<T>(options);
    }

    process(e: Event<T>) {
        return this.processor.addEvent(e);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class SelectNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor: Select<T>;
    constructor(options: SelectOptions) {
        super();
        this.processor = new Select<T>(options);
    }

    process(e: Event<T>) {
        return this.processor.addEvent(e);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class CollapseNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor: Collapse<T>;
    constructor(options: CollapseOptions) {
        super();
        this.processor = new Collapse<T>(options);
    }

    process(e: Event<T>) {
        return this.processor.addEvent(e);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class RateNode<T extends Key> extends Node<Event<T>, Event<TimeRange>> {
    private processor: Rate<T>;
    constructor(options: RateOptions) {
        super();
        this.processor = new Rate<T>(options);
    }

    process(e: Event<T>) {
        return this.processor.addEvent(e);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class ReduceNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor: Reducer<T>;
    constructor(options: ReduceOptions<T>) {
        super();
        this.processor = new Reducer<T>(options);
    }

    process(e: Event<T>) {
        return this.processor.addEvent(e);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class WindowOutputNode<T extends Key> extends Node<Event<T>, KeyedCollection<T>> {
    private processor: WindowedCollection<T>;
    constructor(options: WindowingOptions) {
        super();
        this.processor = new WindowedCollection<T>(options);
    }

    process(e: Event<T>): Immutable.List<KeyedCollection<T>> {
        const keyedCollections = this.processor.addEvent(e);
        return keyedCollections;
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class AggregationNode<T extends Key> extends Node<KeyedCollection<T>, Event<Index>> {
    constructor(private aggregationSpec: AggregationSpec<Key>) {
        super();
    }

    process(keyedCollection: KeyedCollection<T>): Immutable.List<Event<Index>> {
        const [group, collection] = keyedCollection;
        const d = {};
        const [groupKey, windowKey] =
            group.split("::").length === 2 ? group.split("::") : [null, group];
        _.forEach(this.aggregationSpec, (src: AggregationTuple, dest: string) => {
            const [srcField, reducer] = src;
            d[dest] = collection.aggregate(reducer, srcField);
        });
        const indexedEvent = new Event<Index>(index(windowKey), Immutable.fromJS(d));
        return Immutable.List<Event<Index>>([indexedEvent]);
    }
}

//
// Stream interfaces
//

/**
 * An `EventStream` is the interface to the stream provided for manipulation of
 * parts of the streaming pipeline that map a stream of Events of type <T>.
 *
 * For example a stream of Events<Time> can be mapped to an output stream of
 * new Events<Time> that are aligned to a fixed period boundary. Less or more Events
 * may result.
 *
 * The type parameter `<U>` is the input `Event` type at the top of the stream, since each
 * interface exposes the `addEvent(Event<U>)` method for inserting events at the top of
 * the stream.
 *
 * The type parameter `<T>` is the type of `Event`s in this part of the stream. That is
 * nodes created by the API at this point of the stream will expect Events of type T,
 * and will output new Events, potentially of a different type.
 */
export class EventStream<T extends Key, U extends Key> {
    // tslint:disable-line:max-classes-per-file
    constructor(private stream: Stream<U>) {}

    /**
     * @private
     *
     * Add events into the stream
     */
    addEvent(e: Event<U>) {
        this.stream.addEvent(e);
    }

    /**
     * Remaps each Event<T> in the stream to a new Event<M>.
     */
    map<M extends Key>(mapper: (event: Event<T>) => Event<M>) {
        return this.stream.addEventMappingNode(new MapNode<T, M>(mapper));
    }

    /**
     * Remaps each Event<T> in the stream to 0, 1 or many Event<M>s.
     */
    flatMap<M extends Key>(mapper: (event: Event<T>) => Immutable.List<Event<M>>) {
        return this.stream.addEventMappingNode(new FlatMapNode<T, M>(mapper));
    }

    /**
     * Reduces a sequence of past Event<T>s in the stream to a single output Event<M>.
     */
    reduce<M extends Key>(options: ReduceOptions<T>) {
        return this.stream.addEventMappingNode(new ReduceNode<T>(options));
    }

    coalesce(options: CoalesceOptions) {
        const { fields } = options;
        function keyIn(...keys) {
            const keySet = Immutable.Set(...keys);
            return (v, k) => {
                return keySet.has(k);
            };
        }
        return this.stream.addEventMappingNode(
            new ReduceNode<T>({
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
     * @example
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
        return this.stream.addEventMappingNode(new FillNode<T>(options));
    }

    /**
     * Align Events in the stream to a specific boundary at a fixed period.
     * Options are a `AlignmentOptions` object where you specify which field to
     * align with `fieldSpec`, what boundary period to use with `window` and
     * the method of alignment with `method` (which can be either `Linear`
     * interpolation, or `Hold`).
     *
     * @example
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
        return this.stream.addEventMappingNode(new AlignNode<T>(options));
    }

    /**
     * Convert incoming Events in the stream to rates (essentially taking
     * the derivative over time). The resulting output Events will be
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
     * @example
     *
     * ```
     * const s = stream()
     *     .align({...})
     *     .rate({ fieldSpec: "value", allowNegative: false })
     * ```
     */
    rate(options: RateOptions) {
        return this.stream.addEventMappingNode(new RateNode<T>(options));
    }

    /**
     * Convert incoming events to new events with on the specified
     * fields selected out of the source.
     *
     * @example
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
        return this.stream.addEventMappingNode(new SelectNode<T>(options));
    }

    /**
     * Convert incoming events to new events with specified
     * fields collapsed into a new field using an aggregation function.
     *
     * @example
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
        return this.stream.addEventMappingNode(new CollapseNode<T>(options));
    }

    /**
     * An output, specified as an `EventCallback`, essentially `(event: Event<Key>) => void`.
     * Using this method you are able to access the stream result. Your callback
     * function will be called whenever a new Event is available. Not that currently the
     * type will be Event<Key> as the event is generically passed through the stream, but
     * you can cast the type (if you are using Typescript).
     *
     * @example
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
    output(callback: EventCallback) {
        return this.stream.addEventMappingNode<T, T>(new EventOutputNode<T>(callback));
    }

    /**
     * The heart of the streaming code is that in addition to remapping operations of
     * a stream of events, you can also group by a window. This is what allows you to do
     * rollups with the streaming code.
     *
     * A window is defined with the `WindowingOptions`, which allows you to specify
     * the window period as a `Period` (e.g. `period("30m")` for each 30 minutes window)
     * as the `window` and a `Trigger` enum value (emit a completed window on each
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
     * @example
     *
     * ```
     * const source = stream<Time>()
     *     .groupByWindow({
     *         window: period("30m"),
     *         trigger: Trigger.perEvent
     *     })
     *     .aggregate({...})
     *     .output(event => {
     *         ...
     *     });
     */
    groupByWindow(options: WindowingOptions) {
        return this.stream.addEventToCollectorNode(new WindowOutputNode<T>(options));
    }
}

/**
 *
 */
// tslint:disable-next-line:max-classes-per-file
export class KeyedCollectionStream<T extends Key, U extends Key> {
    constructor(private stream: Stream<U>) {}

    /**
     * @private
     * Add events into the stream
     */
    addEvent(e: Event<U>) {
        this.stream.addEvent(e);
    }

    /**
     * An output, specified as an `KeyedCollectionCallback`, essentially
     * `(collection: Collection<T>,vkey: string) => void`.
     *
     * Using this method you are able to access the stream result. Your callback
     * function will be called whenever a new `Collection` is available.
     *
     * @example
     * ```
     * const source = stream<Time>()
     *     .groupByWindow({...})
     *     .output(collection => {
     *         // Do something with the collection
     *     });
     * ```
     */
    output(callback: KeyedCollectionCallback<T>) {
        return this.stream.addCollectorMappingNode<T, T>(
            new KeyedCollectionOutputNode<T>(callback)
        );
    }

    /**
     * Takes an incoming tuple mapping a key (the window name) to a `Collection`
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
    aggregate(spec: AggregationSpec<T>) {
        return this.stream.addCollectionToEventNode<T, Index>(new AggregationNode<T>(spec));
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
 * A `Stream` object manages a chain of processing nodes, each type of which
 * provides an appropiate interface. When a `Stream` is initially created with
 * the `stream()` factory function the interface exposed is an `EventStream`.
 * If you perform a windowing operation you will be exposed to a
 * `KeyedCollectionStream`. If you aggregate a `KeyedCollectionStream` you
 * will be back to an `EventStream` and so on.
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
 * purposes, or for light weight handling of events in Node.
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
 *     .output((e: Event) => console.log("Running total:", e.toString()) );
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
 *     .output((e: Event) => console.log("Rolling average:", e.toString()) );
 *
 * // Add Events into the source...
 * events.forEach(e => source.addEvent(e));
 * ```
 */
// tslint:disable-next-line:max-classes-per-file
export class Stream<U extends Key = Time> {
    private head: Node<Base, Base>;
    private tail: Node<Base, Base>;

    /**
     * @private
     */
    addEventMappingNode<S extends Key, T extends Key>(node: EventMap<S, T>) {
        this.addNode(node);
        return new EventStream<T, U>(this);
    }

    /**
     * @private
     */
    addEventToCollectorNode<S extends Key, T extends Key>(node: EventToKeyedCollection<S, T>) {
        this.addNode(node);
        return new KeyedCollectionStream<T, U>(this);
    }

    /**
     * @private
     */
    addCollectorMappingNode<S extends Key, T extends Key>(node: KeyedCollectionMap<S, T>) {
        this.addNode(node);
        return new KeyedCollectionStream<T, U>(this);
    }

    /**
     * @private
     */
    addCollectionToEventNode<S extends Key, T extends Key>(node: KeyedCollectionToEvent<S, T>) {
        this.addNode(node);
        return new EventStream<T, U>(this);
    }

    /**
     * Add an `Event` into the stream
     */
    addEvent<T extends Key>(e: Event<U>) {
        if (this.head) {
            this.head.set(e);
        }
    }

    /**
     * @private
     */
    protected addNode(node) {
        if (!this.head) {
            this.head = node;
        }
        if (this.tail) {
            this.tail.addObserver(node);
        }
        this.tail = node;
    }
}

function streamFactory<T extends Key>(): EventStream<T, T> {
    const s = new Stream<T>();
    return s.addEventMappingNode(new EventInputNode<T>());
}

export { streamFactory as stream };
