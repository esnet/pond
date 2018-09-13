import * as Immutable from "immutable";
import * as _ from "lodash";

import { Base } from "./base";
import { Event } from "./event";
import { Index, index } from "./index";
import { Key } from "./key";
import { TimeRange } from "./timerange";

import { Align } from "./align";
import { Collapse } from "./collapse";
import { Fill } from "./fill";
import { Rate } from "./rate";
import { Reducer } from "./reduce";
import { Select } from "./select";

import { WindowedCollection } from "./windowedcollection";

import {
    AggregationSpec,
    AggregationTuple,
    AlignmentOptions,
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
// tslint:disable-next-line:max-classes-per-file
export abstract class Node<S extends Base, T extends Base> {
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
 * A node which will be at the top of the chain input node. It will accept `Event`s
 * and pass them down the processing chain.
 */
// tslint:disable-next-line:max-classes-per-file
export class EventInputNode<T extends Key> extends Node<Event<T>, Event<T>> {
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
 * A node which will be a top of the chain input node. It will accept `KeyedCollection`s
 * and pass them down the processing chain.
 */
// tslint:disable-next-line:max-classes-per-file
export class KeyedCollectionInputNode<T extends Key> extends Node<
    KeyedCollection<T>,
    KeyedCollection<T>
> {
    constructor() {
        super();
        // pass
    }
    process(e: KeyedCollection<T>): Immutable.List<KeyedCollection<T>> {
        return Immutable.List([e]);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
export class EventOutputNode<T extends Key> extends Node<Event<T>, Event<T>> {
    constructor(private callback: EventCallback<T>) {
        super();
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
export class KeyedCollectionOutputNode<T extends Key> extends Node<
    KeyedCollection<T>,
    KeyedCollection<T>
> {
    constructor(private callback: KeyedCollectionCallback<T>) {
        super();
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
export class MapNode<T extends Key, M extends Key> extends Node<Event<T>, Event<M>> {
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
export class FlatMapNode<T extends Key, M extends Key> extends Node<Event<T>, Event<M>> {
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
export class FilterNode<T extends Key> extends Node<Event<T>, Event<T>> {
    private processor: Fill<T>;
    constructor(private predicate: (event: Event<T>) => boolean) {
        super();
    }

    process(e: Event<T>) {
        return this.predicate(e) ? Immutable.List([e]) : Immutable.List([]);
    }
}

/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
export class FillNode<T extends Key> extends Node<Event<T>, Event<T>> {
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
export class AlignNode<T extends Key> extends Node<Event<T>, Event<T>> {
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
export class SelectNode<T extends Key> extends Node<Event<T>, Event<T>> {
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
export class CollapseNode<T extends Key> extends Node<Event<T>, Event<T>> {
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
export class RateNode<T extends Key> extends Node<Event<T>, Event<TimeRange>> {
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
export class ReduceNode<T extends Key> extends Node<Event<T>, Event<T>> {
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
export class WindowOutputNode<T extends Key> extends Node<Event<T>, KeyedCollection<T>> {
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
export class AggregationNode<T extends Key> extends Node<KeyedCollection<T>, Event<Index>> {
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
