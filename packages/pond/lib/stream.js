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
const reduce_1 = require("./reduce");
const select_1 = require("./select");
const windowedcollection_1 = require("./windowedcollection");
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
class ReduceNode extends Node {
    constructor(options) {
        super();
        this.processor = new reduce_1.Reducer(options);
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
        this.processor = new windowedcollection_1.WindowedCollection(options);
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
     * @private
     *
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
     * Reduces a sequence of past Event<T>s in the stream to a single output Event<M>.
     */
    reduce(options) {
        return this.stream.addEventMappingNode(new ReduceNode(options));
    }
    coalesce(options) {
        const { fields } = options;
        function keyIn(...keys) {
            const keySet = Immutable.Set(...keys);
            return (v, k) => {
                return keySet.has(k);
            };
        }
        return this.stream.addEventMappingNode(new ReduceNode({
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
 *
 */
// tslint:disable-next-line:max-classes-per-file
class KeyedCollectionStream {
    constructor(stream) {
        this.stream = stream;
    }
    /**
     * @private
     * Add events into the stream
     */
    addEvent(e) {
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
class Stream {
    /**
     * @private
     */
    addEventMappingNode(node) {
        this.addNode(node);
        return new EventStream(this);
    }
    /**
     * @private
     */
    addEventToCollectorNode(node) {
        this.addNode(node);
        return new KeyedCollectionStream(this);
    }
    /**
     * @private
     */
    addCollectorMappingNode(node) {
        this.addNode(node);
        return new KeyedCollectionStream(this);
    }
    /**
     * @private
     */
    addCollectionToEventNode(node) {
        this.addNode(node);
        return new EventStream(this);
    }
    /**
     * Add an `Event` into the stream
     */
    addEvent(e) {
        if (this.head) {
            this.head.set(e);
        }
    }
    /**
     * @private
     */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUk1QixtQ0FBdUM7QUFDdkMsbUNBQXVDO0FBU3ZDLG1DQUFnQztBQUNoQyx5Q0FBc0M7QUFDdEMsaUNBQThCO0FBQzlCLGlDQUE4QjtBQUM5QixxQ0FBbUM7QUFDbkMscUNBQWtDO0FBR2xDLDZEQUEwRDtBQXFDMUQ7OztHQUdHO0FBQ0gsZ0RBQWdEO0FBQ2hEO0lBQUE7UUFDSSxVQUFVO1FBQ0EsY0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQWlCLENBQUM7SUFzQjFELENBQUM7SUFwQlUsV0FBVyxDQUFDLElBQW1CO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLEdBQUcsQ0FBQyxLQUFRO1FBQ2YsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO0lBQ0wsQ0FBQztJQUVTLE1BQU0sQ0FBQyxNQUFTO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7UUFDUCxD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