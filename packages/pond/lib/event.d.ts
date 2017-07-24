import * as Immutable from "immutable";
import { Base } from "./base";
import { Index } from "./index";
import { Key } from "./key";
import { Time } from "./time";
import { TimeRange } from "./timerange";
import { ReducerFunction, ValueListMap, ValueMap } from "./types";
/**
 * An Event is a mapping from a time based key to a Data object.
 *
 * The key needs to be a sub-class of the `Key`, which typically
 * would be one of the following:
 *
 *  * `Time` - a single timestamp
 *  * `TimeRange` - a timerange over which the Event took place
 *  * `Index` - a different representation of a TimeRange
 *
 * The data needs to be a sub-class of the `Data` type. That
 * type lets you construct it as either:
 *  - A string or number
 *  - A JS object
 *  - An Immutable.Map<string, any>
 *
 * Internally the Data object is, by default (since subclasses my
 * implement differently) a `Immutable.Map`.
 *
 * To get values out of the data, use `get()`. This method takes
 * what is called a field, which is a top level key of the Data
 * Map.
 *
 * Fields can refer to deep data with either a path (as an array)
 * or dot notation. Not specifying  a field implies a field of
 * name `"value""`.
 *
 * @example
 *
 * ```
 * const timestamp = time(new Date("2015-04-22T03:30:00Z");
 * const e = new Event(timestamp, data({ temperature: 42 }));
 * ```
 *
 */
export declare class Event<T extends Key = Time> extends Base {
    protected key: T;
    protected data: Immutable.Map<string, any>;
    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses `Immutable.is()` to compare the event data and
     * the key.
     */
    static is(event1: Event<Key>, event2: Event<Key>): boolean;
    /**
     * Returns if the two supplied events are duplicates of each other.
     *
     * Duplicated means that the keys are the same. This is the case
     * with incoming events sometimes where a second event is either known
     * to be the same (but duplicate) of the first, or supersedes the first.
     *
     * You can also pass in false for ignoreValues and get a full compare,
     * including the data of the event, thus ignoring the supersede case.
     */
    static isDuplicate(event1: Event<Key>, event2: Event<Key>, ignoreValues?: boolean): boolean;
    /**
     * Merges multiple `Event`'s together into a new array of events, one
     * for each key of the source events. Merging is done on the data of
     * each event. Values from later events in the list overwrite
     * early values if fields conflict.
     *
     * Common use cases:
     *   - append events of different timestamps
     *   - merge in events with one field to events with another
     *   - merge in events that supersede the previous events
     *
     * Events in the supplied list need to be of homogeneous types
     *
     * See also: `TimeSeries.timeSeriesListMerge()`.
     */
    static merge<K extends Key>(events: Immutable.List<Event<K>>, deep?: boolean): Immutable.List<Event<K>>;
    /**
     * Returns a function that will take a list of `event`'s and merge them
     * together using the `fieldSpec` provided. This is used as a reducer for
     * merging multiple `TimeSeries` together with `timeSeriesListMerge()`.
     */
    static merger<K extends Key>(deep: any): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>>;
    /**
     * Combines multiple `Event`s together into a new array of events, one
     * for each key of the source events. The list of Events may be specified
     * as an array or `Immutable.List`.
     *
     * Combining acts on the fields specified in the `fieldSpec` (or all
     * fields) and uses the reducer function supplied to take the multiple
     * values associated with the key and reduce them down to a single value.
     *
     * The return result will be an `Event` of the same type as the input.
     *
     * This is the general version of `Event.sum()` and `Event.avg()`. If those
     * common use cases are what you want, just use those functions. If you
     * want to specify your own reducer you can use this function.
     *
     * See also: `TimeSeries.timeSeriesListSum()`
     */
    static combine<K extends Key>(events: Immutable.List<Event<K>>, reducer: ReducerFunction, fieldSpec?: string | string[]): Immutable.List<Event<K>>;
    /**
     * Returns a function that will take a list of `Event`'s and combine them
     * together using the `fieldSpec` and reducer function provided. This is
     * used as an event reducer for merging multiple `TimeSeries` together
     * with `timeSeriesListReduce()`.
     */
    static combiner<K extends Key>(fieldSpec: any, reducer: any): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>>;
    /**
     * Takes a list of `Events<T>` and makes a map from the `Event` field names
     * to an array of values, one value for each Event.
     *
     * @example
     * ```
     * const eventMap = Event.map(events, ["in"]);
     * // { in: [ 2, 4, 6, 8 ], out: [ 11, 13, 15, 18 ] }
     * ```
     */
    static map<K extends Key>(events: Immutable.List<Event<K>>, multiFieldSpec: string | string[]): ValueListMap;
    /**
     * Takes a `Immutable.List` of events and a reducer function and a
     * `fieldSpec` (or list of fieldSpecs) and returns an aggregated
     * result in the form of a new Event, for each column.
     * The reducer is of the form:
     * ```
     * function sum(valueList) {
     *     return calcValue;
     * }
     * ```
     *
     * @example
     * ```
     * const result = Event.aggregate(EVENT_LIST, avg(), ["in", "out"]);
     * // result = { in: 5, out: 14.25 }
     * ```
     */
    static aggregate<K extends Key>(events: Immutable.List<Event<K>>, reducer: ReducerFunction, multiFieldSpec: string | string[]): ValueMap;
    /**
     * Constructor
     */
    constructor(key: T, data: Immutable.Map<string, any>);
    /**
     * Returns the key this `Event` was constructed with
     */
    getKey(): T;
    /**
     * Returns the label of the key
     */
    keyType(): string;
    /**
     * Returns the data associated with this event, which be
     * of type `T`.
     */
    getData(): Immutable.Map<string, any>;
    /**
     * Returns the data associated with this event, which be
     * of type `T`.
     */
    setData(data: Immutable.Map<string, any>): Event<T>;
    /**
     * Gets the `value` of a specific field within the `Event`.
     *
     * You can refer to a fields with one of the following notations:
     *  * (undefined) -> "value"
     *  * "temperature"
     *  * "path.to.deep.data"
     *  * ["path", "to", "deep", "data"].
     *
     */
    get(field?: string | string[]): any;
    /**
     * Set a new `value` on the `Event` for the given `field`, and return a new `Event`.
     *
     * You can refer to a `field`s with one of the following notations:
     *  * (undefined) -> "value"
     *  * "temperature"
     *  * "path.to.deep.data"
     *  * ["path", "to", "deep", "data"].
     *
     * `value` is the new value to set on for the given `field` on the `Event`.
     */
    set(field: string | string[], value: any): Event<T>;
    /**
     * Will return false if the value in this `Event` is either `undefined`, `NaN` or
     * `null` for the given field or fields. This serves as a determination of a "missing"
     * value within a `TimeSeries` or `Collection`.
     */
    isValid(fields?: string | string[]): boolean;
    toJSON(): {};
    toString(): string;
    timestamp(): Date;
    begin(): Date;
    end(): Date;
    indexAsString(): string;
    timerange(): TimeRange;
    timerangeAsUTCString(): string;
    timestampAsUTCString(): string;
    toPoint(): any[];
    /**
     * Collapses multiple fields (specified in the `fieldSpecList`) into a single
     * field named `fieldName` using the supplied reducer. Optionally you can keep
     * all existing fields by supplying the `append` argument as true.
     *
     * @example:
     * ```
     * const t = time(new Date("2015-04-22T03:30:00Z"));
     * const e = event(t, Immutable.Map({ in: 5, out: 6, status: "ok" }));
     * const result = e.collapse(["in", "out"], "total", sum(), true);
     * // result: data: { "in": 5, "out": 6, "status": "ok", "total": 11 } }
     * ```
     */
    collapse(fieldSpecList: string[], fieldName: string, reducer: ReducerFunction, append?: boolean): Event<T>;
    /**
     * Selects specific fields of an `Event` using a `fields` and returns
     * a new event with just those fields.
     */
    select(fields: string[]): Event<T>;
}
export interface TimeEventObject {
    time: number;
    data: {
        [data: string]: any;
    };
}
declare function timeEvent(arg: TimeEventObject): Event<Time>;
declare function timeEvent(t: Time, data: Immutable.Map<string, any>): Event<Time>;
export interface IndexedEventObject {
    index: string;
    data: {
        [data: string]: any;
    };
}
declare function indexedEvent(arg: IndexedEventObject): Event<Index>;
declare function indexedEvent(idx: Index, data: Immutable.Map<string, any>): Event<Index>;
export interface TimeRangeEventObject {
    timerange: number[];
    data: {
        [data: string]: any;
    };
}
declare function timeRangeEvent(arg: TimeRangeEventObject): Event<TimeRange>;
declare function timeRangeEvent(idx: Index, data: Immutable.Map<string, any>): Event<TimeRange>;
declare function event<T extends Key>(key: T, data: Immutable.Map<string, any>): Event<T>;
export { event, timeEvent, timeRangeEvent, indexedEvent };
