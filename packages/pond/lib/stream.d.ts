import * as Immutable from "immutable";
import { Base } from "./base";
import { Collection } from "./collection";
import { Event } from "./event";
import { Index } from "./index";
import { Key } from "./key";
import { Time } from "./time";
import { TimeRange } from "./timerange";
import {
    AggregationSpec,
    AlignmentOptions,
    CollapseOptions,
    FillOptions,
    RateOptions,
    SelectOptions,
    WindowingOptions
} from "./types";
export declare class Streaming {}
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
export declare type EventCallback = (event: Event<Key>) => void;
export declare type KeyedCollectionCallback<T extends Key> = (
    collection: Collection<T>,
    key: string
) => void;
export declare type KeyedCollection<T extends Key> = [string, Collection<T>];
/**
 * @private
 *
 */
export abstract class Node<S extends Base, T extends Base> {
    protected observers: Immutable.List<Node<T, Base>>;
    addObserver(node: Node<T, Base>): void;
    set(input: S): void;
    protected notify(output: T): void;
    protected abstract process(input: S): Immutable.List<T>;
}
/**
 *
 * @private
 *
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
export declare class EventStream<T extends Key, U extends Key> {
    private stream;
    constructor(stream: Stream<U>);
    /**
     * Add events into the stream
     */
    addEvent(e: Event<U>): void;
    /**
     * Remaps each Event<T> in the stream to a new Event<M>.
     */
    map<M extends Key>(mapper: (event: Event<T>) => Event<M>): EventStream<M, U>;
    /**
     * Remaps each Event<T> in the stream to 0, 1 or many Event<M>s.
     */
    flatMap<M extends Key>(
        mapper: (event: Event<T>) => Immutable.List<Event<M>>
    ): EventStream<M, U>;
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
    fill(options: FillOptions): EventStream<T, U>;
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
    align(options: AlignmentOptions): EventStream<T, U>;
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
    rate(options: RateOptions): EventStream<TimeRange, U>;
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
    select(options: SelectOptions): EventStream<T, U>;
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
    collapse(options: CollapseOptions): EventStream<T, U>;
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
    output(callback: EventCallback): EventStream<T, U>;
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
    groupByWindow(options: WindowingOptions): KeyedCollectionStream<T, U>;
}
/**
 * @private
 */
export declare class KeyedCollectionStream<T extends Key, U extends Key> {
    private stream;
    constructor(stream: Stream<U>);
    /**
     * Add events into the stream
     */
    addEvent(event: Event<U>): void;
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
    output(callback: KeyedCollectionCallback<T>): KeyedCollectionStream<T, U>;
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
    aggregate(spec: AggregationSpec<T>): EventStream<Index, U>;
}
export declare type EventToKeyedCollection<S extends Key, T extends Key> = Node<
    Event<S>,
    KeyedCollection<T>
>;
export declare type KeyedCollectionToEvent<S extends Key, T extends Key> = Node<
    KeyedCollection<S>,
    Event<T>
>;
export declare type KeyedCollectionMap<S extends Key, T extends Key> = Node<
    KeyedCollection<S>,
    KeyedCollection<T>
>;
export declare type EventMap<S extends Key, T extends Key> = Node<Event<S>, Event<T>>;
/**
 * @private
 *
 * A stream is the user facing object which implements addEvent()
 * in such a way that the pipeline is executed.
 *
 * @example
 * ```
 * const s = Stream()
 *  .align({})
 *  .rate({});
 *
 * s.addEvent(e);
 *
 * ```
 */
export declare class Stream<U extends Key = Time> {
    private head;
    private tail;
    addEventMappingNode<S extends Key, T extends Key>(node: EventMap<S, T>): EventStream<T, U>;
    addEventToCollectorNode<S extends Key, T extends Key>(
        node: EventToKeyedCollection<S, T>
    ): KeyedCollectionStream<T, U>;
    addCollectorMappingNode<S extends Key, T extends Key>(
        node: KeyedCollectionMap<S, T>
    ): KeyedCollectionStream<T, U>;
    addCollectionToEventNode<S extends Key, T extends Key>(
        node: KeyedCollectionToEvent<S, T>
    ): EventStream<T, U>;
    addEvent<T extends Key>(e: Event<U>): void;
    protected addNode(node: any): void;
}
declare function streamFactory<T extends Key>(): EventStream<T, T>;
export { streamFactory as stream };
