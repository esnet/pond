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
const index_1 = require("./index");
const align_1 = require("./align");
const collapse_1 = require("./collapse");
const fill_1 = require("./fill");
const rate_1 = require("./rate");
const select_1 = require("./select");
const windowed_1 = require("./windowed");
class Streaming {
}
exports.Streaming = Streaming;
//
// Node baseclass
//
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class Node {
    constructor() {
        // Members
        this.observers = Immutable.List();
    }
    addObserver(node) {
        this.observers = this.observers.push(node);
    }
    set(input) {
        const outputs = this.process(input);
        if (outputs) {
            outputs.forEach(output => this.notify(output));
        }
    }
    notify(output) {
        if (this.observers.size > 0) {
            this.observers.forEach(node => {
                node.set(output);
            });
        }
    }
}
exports.Node = Node;
//
// Nodes
//
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class EventInputNode extends Node {
    constructor() {
        super();
        // pass
    }
    process(e) {
        return Immutable.List([e]);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class EventOutputNode extends Node {
    constructor(callback) {
        super();
        this.callback = callback;
        // pass
    }
    process(e) {
        this.callback(e);
        return Immutable.List();
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class KeyedCollectionOutputNode extends Node {
    constructor(callback) {
        super();
        this.callback = callback;
        // pass
    }
    process(keyedCollection) {
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
class MapNode extends Node {
    constructor(mapper) {
        super();
        this.mapper = mapper;
    }
    process(e) {
        return Immutable.List([this.mapper(e)]);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class FlatMapNode extends Node {
    constructor(mapper) {
        super();
        this.mapper = mapper;
    }
    process(e) {
        return this.mapper(e);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class FillNode extends Node {
    constructor(options) {
        super();
        this.processor = new fill_1.Fill(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class AlignNode extends Node {
    constructor(options) {
        super();
        this.processor = new align_1.Align(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class SelectNode extends Node {
    constructor(options) {
        super();
        this.processor = new select_1.Select(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class CollapseNode extends Node {
    constructor(options) {
        super();
        this.processor = new collapse_1.Collapse(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class RateNode extends Node {
    constructor(options) {
        super();
        this.processor = new rate_1.Rate(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class WindowOutputNode extends Node {
    constructor(options) {
        super();
        this.processor = new windowed_1.WindowedCollection(options);
    }
    process(e) {
        const keyedCollections = this.processor.addEvent(e);
        return keyedCollections;
    }
}
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class AggregationNode extends Node {
    constructor(aggregationSpec) {
        super();
        this.aggregationSpec = aggregationSpec;
    }
    process(keyedCollection) {
        const [group, collection] = keyedCollection;
        const d = {};
        const [groupKey, windowKey] = group.split("::").length === 2 ? group.split("::") : [null, group];
        _.forEach(this.aggregationSpec, (src, dest) => {
            const [srcField, reducer] = src;
            d[dest] = collection.aggregate(reducer, srcField);
        });
        const indexedEvent = new event_1.Event(index_1.index(windowKey), Immutable.fromJS(d));
        return Immutable.List([indexedEvent]);
    }
}
//
// Stream interfaces
//
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
class EventStream {
    // tslint:disable-line:max-classes-per-file
    constructor(stream) {
        this.stream = stream;
    }
    /**
     * Add events into the stream
     */
    addEvent(e) {
        this.stream.addEvent(e);
    }
    /**
     * Remaps each Event<T> in the stream to a new Event<M>.
     */
    map(mapper) {
        return this.stream.addEventMappingNode(new MapNode(mapper));
    }
    /**
     * Remaps each Event<T> in the stream to 0, 1 or many Event<M>s.
     */
    flatMap(mapper) {
        return this.stream.addEventMappingNode(new FlatMapNode(mapper));
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
    fill(options) {
        return this.stream.addEventMappingNode(new FillNode(options));
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
    align(options) {
        return this.stream.addEventMappingNode(new AlignNode(options));
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
    rate(options) {
        return this.stream.addEventMappingNode(new RateNode(options));
    }
    /**
     * Convert incoming events to new events with on the specified
     * fields selected out of the soure.
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
    select(options) {
        return this.stream.addEventMappingNode(new SelectNode(options));
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
    collapse(options) {
        return this.stream.addEventMappingNode(new CollapseNode(options));
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
    output(callback) {
        return this.stream.addEventMappingNode(new EventOutputNode(callback));
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
    groupByWindow(options) {
        return this.stream.addEventToCollectorNode(new WindowOutputNode(options));
    }
}
exports.EventStream = EventStream;
/**
 * @private
 */
// tslint:disable-next-line:max-classes-per-file
class KeyedCollectionStream {
    constructor(stream) {
        this.stream = stream;
    }
    /**
     * Add events into the stream
     */
    addEvent(event) {
        this.stream.addEvent(event);
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
    output(callback) {
        return this.stream.addCollectorMappingNode(new KeyedCollectionOutputNode(callback));
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
    aggregate(spec) {
        return this.stream.addCollectionToEventNode(new AggregationNode(spec));
    }
}
exports.KeyedCollectionStream = KeyedCollectionStream;
//
// Master stream
//
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
// tslint:disable-next-line:max-classes-per-file
class Stream {
    addEventMappingNode(node) {
        this.addNode(node);
        return new EventStream(this);
    }
    addEventToCollectorNode(node) {
        this.addNode(node);
        return new KeyedCollectionStream(this);
    }
    addCollectorMappingNode(node) {
        this.addNode(node);
        return new KeyedCollectionStream(this);
    }
    addCollectionToEventNode(node) {
        this.addNode(node);
        return new EventStream(this);
    }
    addEvent(e) {
        if (this.head) {
            this.head.set(e);
        }
    }
    addNode(node) {
        if (!this.head) {
            this.head = node;
        }
        if (this.tail) {
            this.tail.addObserver(node);
        }
        this.tail = node;
    }
}
exports.Stream = Stream;
function streamFactory() {
    const s = new Stream();
    return s.addEventMappingNode(new EventInputNode());
}
exports.stream = streamFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUk1QixtQ0FBZ0M7QUFDaEMsbUNBQXVDO0FBU3ZDLG1DQUFnQztBQUNoQyx5Q0FBc0M7QUFDdEMsaUNBQThCO0FBQzlCLGlDQUE4QjtBQUM5QixxQ0FBa0M7QUFHbEMseUNBQWdEO0FBY2hEO0NBQXlCO0FBQXpCLDhCQUF5QjtBQXVCekIsRUFBRTtBQUNGLGlCQUFpQjtBQUNqQixFQUFFO0FBRUY7OztHQUdHO0FBQ0gsZ0RBQWdEO0FBQ2hEO0lBQUE7UUFDSSxVQUFVO1FBQ0EsY0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQWlCLENBQUM7SUFzQjFELENBQUM7SUFwQlUsV0FBVyxDQUFDLElBQW1CO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLEdBQUcsQ0FBQyxLQUFRO1FBQ2YsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7SUFDTCxDQUFDO0lBRVMsTUFBTSxDQUFDLE1BQVM7UUFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lB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