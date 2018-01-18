import * as Immutable from "immutable";
import { Base } from "./base";
import { Event } from "./event";
import { Index } from "./index";
import { Key } from "./key";
import { TimeRange } from "./timerange";
import { AggregationSpec, AlignmentOptions, CollapseOptions, EventCallback, FillOptions, KeyedCollection, KeyedCollectionCallback, RateOptions, ReduceOptions, SelectOptions, WindowingOptions } from "./types";
/**
 * @private
 *
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
export declare abstract class Node<S extends Base, T extends Base> {
    protected observers: Immutable.List<Node<T, Base>>;
    addObserver(node: Node<T, Base>): void;
    set(input: S): void;
    protected notify(output: T): void;
    protected abstract process(input: S): Immutable.List<T>;
}
/**
 * @private
 *
 * A node which will be at the top of the chain input node. It will accept `Event`s
 * and pass them down the processing chain.
 */
export declare class EventInputNode<T extends Key> extends Node<Event<T>, Event<T>> {
    constructor();
    process(e: Event<T>): Immutable.List<Event<T>>;
}
/**
 * @private
 *
 * A node which will be a top of the chain input node. It will accept `KeyedCollection`s
 * and pass them down the processing chain.
 */
export declare class KeyedCollectionInputNode<T extends Key> extends Node<KeyedCollection<T>, KeyedCollection<T>> {
    constructor();
    process(e: KeyedCollection<T>): Immutable.List<KeyedCollection<T>>;
}
/**
 * @private
 *
 */
export declare class EventOutputNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private callback;
    constructor(callback: EventCallback<T>);
    process(e: Event<T>): Immutable.List<any>;
}
/**
 * @private
 *
 */
export declare class KeyedCollectionOutputNode<T extends Key> extends Node<KeyedCollection<T>, KeyedCollection<T>> {
    private callback;
    constructor(callback: KeyedCollectionCallback<T>);
    process(keyedCollection: KeyedCollection<T>): Immutable.List<any>;
}
/**
 * @private
 *
 */
export declare class MapNode<T extends Key, M extends Key> extends Node<Event<T>, Event<M>> {
    private mapper;
    constructor(mapper: (event: Event<T>) => Event<M>);
    process(e: Event<T>): Immutable.List<Event<M>>;
}
/**
 * @private
 *
 */
export declare class FlatMapNode<T extends Key, M extends Key> extends Node<Event<T>, Event<M>> {
    private mapper;
    constructor(mapper: (event: Event<T>) => Immutable.List<Event<M>>);
    process(e: Event<T>): Immutable.List<Event<M>>;
}
/**
 * @private
 *
 */
export declare class FilterNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private predicate;
    private processor;
    constructor(predicate: (event: Event<T>) => boolean);
    process(e: Event<T>): Immutable.List<any>;
}
/**
 * @private
 *
 */
export declare class FillNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor;
    constructor(options: FillOptions);
    process(e: Event<T>): Immutable.List<Event<T>>;
}
/**
 * @private
 *
 */
export declare class AlignNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor;
    constructor(options: AlignmentOptions);
    process(e: Event<T>): Immutable.List<Event<T>>;
}
/**
 * @private
 *
 */
export declare class SelectNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor;
    constructor(options: SelectOptions);
    process(e: Event<T>): Immutable.List<Event<T>>;
}
/**
 * @private
 *
 */
export declare class CollapseNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor;
    constructor(options: CollapseOptions);
    process(e: Event<T>): Immutable.List<Event<T>>;
}
/**
 * @private
 *
 */
export declare class RateNode<T extends Key> extends Node<Event<T>, Event<TimeRange>> {
    private processor;
    constructor(options: RateOptions);
    process(e: Event<T>): Immutable.List<Event<TimeRange>>;
}
/**
 * @private
 *
 */
export declare class ReduceNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor;
    constructor(options: ReduceOptions<T>);
    process(e: Event<T>): Immutable.List<Event<T>>;
}
/**
 * @private
 *
 */
export declare class WindowOutputNode<T extends Key> extends Node<Event<T>, KeyedCollection<T>> {
    private processor;
    constructor(options: WindowingOptions);
    process(e: Event<T>): Immutable.List<KeyedCollection<T>>;
}
/**
 * @private
 *
 */
export declare class AggregationNode<T extends Key> extends Node<KeyedCollection<T>, Event<Index>> {
    private aggregationSpec;
    constructor(aggregationSpec: AggregationSpec<Key>);
    process(keyedCollection: KeyedCollection<T>): Immutable.List<Event<Index>>;
}
