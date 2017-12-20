import * as Immutable from "immutable";
import { Base } from "./base";
import { Index } from "./index";
import { Key } from "./key";
import { Time } from "./time";
import { TimeRange } from "./timerange";
import { ReducerFunction, ValueListMap, ValueMap } from "./types";
/**
 * An Event is a mapping from a time based key to a data object represented
 * by an `Immutable.Map`.
 *
 * The key needs to be a sub-class of the base class `Key`, which typically
 * would be one of the following:
 *
 *  * `Time` - a single timestamp
 *  * `TimeRange` - a timerange over which the Event took place
 *  * `Index` - a different representation of a TimeRange
 *
 * The data object needs to be an `Immutable.Map<string, any>`.
 *
 * To get values out of the data, use `get()`. This method takes
 * what is called a field, which is a top level key of the data
 * map.
 *
 * Fields can refer to deep data with either a path (as an array)
 * or dot notation ("path.to.value").
 *
 * Example:
 *
 * ```
 * const timestamp = time(new Date("2015-04-22T03:30:00Z");
 * const e = event(t, Immutable.Map({ temperature: 75.2, humidity: 84 }));
 * const humidity = e.get("humidity");  // 84
 * ```
 *
 * There exists several static methods for `Event` that enable the
 * ability to compare `Events`, `merge()` or `combine()` lists of `Event`s or
 * check for duplicates.
 *
 * You can also do per-`Event` operations like `select()` out specific fields or
 * `collapse()` multiple fields into one using an aggregation function.
 *
 * Note: Managing multiple `Event`s is typically done with a `Collection`
 * which is literally a collections of `Event`s, or a `TimeSeries` which
 * is an chronological set of `Event`s plus some additional meta data.
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
     * Duplicated is defined as the keys of the `Event`s being the same.
     * This is the case with incoming events sometimes where a second event
     * is either known to be the same (but duplicate) of the first, or
     * supersedes the first.
     *
     * You can also pass in `false` for `ignoreValues` and get a full compare,
     * including the data of the event, thus ignoring the supersede case.
     *
     * Example:
     * ```
     * const e1 = event(t, Immutable.Map({ a: 5, b: 6, c: 7 }));
     * const e2 = event(t, Immutable.Map({ a: 5, b: 6, c: 7 }));
     * const e3 = event(t, Immutable.Map({ a: 100, b: 6, c: 7 }));
     *
     * Event.isDuplicate(e1, e2)        // true
     * Event.isDuplicate(e1, e3)        // true
     * Event.isDuplicate(e1, e3, false) // false
     * Event.isDuplicate(e1, e2, false) // false
     * ```
     */
    static isDuplicate(event1: Event<Key>, event2: Event<Key>, ignoreValues?: boolean): boolean;
    /**
     * Merges multiple `Event`'s together into a new array of `Event`s, one
     * for each key of the source events. Merging is done on the data of
     * each `Event`. Values from later events in the list overwrite
     * earlier values if fields conflict.
     *
     * Common use cases:
     *   * append events of different timestamps
     *     e.g. merge earlier events with later events
     *   * merge in events with one field to events with another field
     *     e.g. combine events with a field "in" with another list of events
     *          with a field "out" to get events with both "in" and "out"
     *   * merge in events that supersede the previous events
     *
     * Events in the supplied list need to be of homogeneous types
     *
     * See also:
     *  * `TimeSeries.timeSeriesListMerge()` if what you have is a
     * `TimeSeries`. That uses this code but with a friendlier API.
     *
     * Example:
     * ```
     * const t = time(new Date("2015-04-22T03:30:00Z"));
     * const event1 = event(t, Immutable.Map({ a: 5, b: 6 }));
     * const event2 = event(t, Immutable.Map({ c: 2 }));
     * const merged = Event.merge(Immutable.List([event1, event2]));
     * merged.get(0).get("a");    // 5
     * merged.get(0).get("b");    // 6
     * merged.get(0).get("c");    // 2
     */
    static merge<K extends Key>(events: Immutable.List<Event<K>>, deep?: boolean): Immutable.List<Event<K>>;
    /**
     * Returns a function that will take a list of `Event`s and merge them
     * together using the `fieldSpec` provided. This is used as a `reducer` for
     * merging multiple `TimeSeries` together with `TimeSeries.timeSeriesListMerge()`.
     */
    static merger<K extends Key>(deep: any): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>>;
    /**
     * Static function to combine multiple `Event`s together into a new array
     * of events, one `Event` for each key of the source events. The list of
     * `Events` should be specified as an array or `Immutable.List<Event<K>>`.
     *
     * Combining acts on the fields specified in the `fieldSpec` (or all
     * fields) and uses the `reducer` function supplied to take the multiple
     * values associated with the key and reduce them down to a single value.
     *
     * The return result will be an `Immutable.List<Event<K>>` of the same type K
     * as the input.
     *
     * Example:
     * ```
     * const t = time("2015-04-22T03:30:00Z");
     * const events = [
     *     event(t, Immutable.Map({ a: 5, b: 6, c: 7 })),
     *     event(t, Immutable.Map({ a: 2, b: 3, c: 4 })),
     *     event(t, Immutable.Map({ a: 1, b: 2, c: 3 }))
     * ];
     * const result = Event.combine(Immutable.List(events), sum());
     * // result[0] is {a: 8, b: 11, c: 14 }
     * ```
     * See also: `TimeSeries.timeSeriesListSum()`
     */
    static combine<K extends Key>(events: Immutable.List<Event<K>>, reducer: ReducerFunction, fieldSpec?: string | string[]): Immutable.List<Event<K>>;
    /**
     * Static method that returns a function that will take a list of `Event`'s
     * and combine them together using the `fieldSpec` and reducer function provided.
     * This is used as an event reducer for merging multiple `TimeSeries` together
     * with `timeSeriesListReduce()`.
     */
    static combiner<K extends Key>(fieldSpec: any, reducer: any): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>>;
    /**
     * Static function that takes a list of `Events<T>` and makes a map from each
     * field names to an array of values, one value for each Event.
     *
     * Example:
     * ```
     * const events = [
     *     event(t1, Immutable.Map({in: 2, out: 11 })),
     *     event(t2, Immutable.Map({in: 4, out: 13 })),
     *     event(t3, Immutable.Map({in: 6, out: 15 })),
     *     event(t4, Immutable.Map({in: 8, out: 17 }))
     * ];
     *
     * const fieldMapping = Event.map(events, ["in", "out"]);
     * // { in: [ 2, 4, 6, 8 ], out: [ 11, 13, 15, 18 ] }
     * ```
     */
    static map<K extends Key>(events: Immutable.List<Event<K>>, multiFieldSpec: string | string[]): ValueListMap;
    /**
     * Static function that takes a `Immutable.List` of events, a `reducer` function and a
     * `fieldSpec` (field or list of fields) and returns an aggregated result in the form
     * of a new Event, for each column.
     *
     * The reducer is of the form:
     * ```
     * (values: number[]) => number
     * ```
     *
     * Example:
     * ```
     * const result = Event.aggregate(EVENT_LIST, avg(), ["in", "out"]);
     * // result = { in: 5, out: 14.25 }
     * ```
     */
    static aggregate<K extends Key>(events: Immutable.List<Event<K>>, reducer: ReducerFunction, multiFieldSpec: string | string[]): ValueMap;
    /**
     * Construction of an `Event` requires both a time-based key and an
     * `Immutable.Map` of (`string` -> data) mappings.
     *
     * The time-based key should be either a `Time`, a `TimeRange` or an `Index`,
     * though it would be possible to subclass `Key` with another type so long
     * as it implements that abstract interface.
     *
     * The data portion maybe deep data. Using `Immutable.toJS()` is helpful in
     * that case.
     *
     * You can use `new Event<T>()` to create a new `Event`, but it's easier to use
     * one of the factory functions: `event()`, `timeEvent()`, `timeRangeEvent()` and
     * `indexedEvent()`
     *
     * Example 1:
     * ```
     * const e = event(time(new Date(1487983075328)), Immutable.Map({ name: "bob" }));
     * ```
     *
     * Example 2:
     * ```
     * // An event for a particular day with indexed key
     * const e = event(index("1d-12355"), Immutable.Map({ value: 42 }));
     * ```
     *
     * Example 3:
     * ```
     * // Outage event spans a timerange
     * const e = event(timerange(beginTime, endTime), Immutable.Map({ ticket: "A1787383" }));
     * ```
     *
     * Example 4:
     * ```
     * const e = timeEvent({
     *     time: 1487983075328,
     *     data: { a: 2, b: 3 }
     * });
     * ```
     */
    constructor(key: T, data: Immutable.Map<string, any>);
    /**
     * Returns the key this `Event`.
     *
     * The result is of type T (a `Time`, `TimeRange` or `Index`), depending on
     * what the `Event` was constructed with.
     */
    getKey(): T;
    /**
     * Returns the label of the key
     */
    keyType(): string;
    /**
     * Returns the data associated with this event in the form
     * of an `Immutable.Map`. This is infact an accessor for the internal
     * representation of data in this `Event`.
     */
    getData(): Immutable.Map<string, any>;
    /**
     * Sets new `data` associated with this event. The new `data` is supplied
     * in the form of an `Immutable.Map`. A new `Event<T>` will be returned
     * containing this new data, but having the same key.
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
     * Example 1:
     * ```
     * const e = event(index("1d-12355"), Immutable.Map({ value: 42 }));
     * e.get("value"); // 42
     * ```
     *
     * Example 2:
     * ```
     * const t = time(new Date("2015-04-22T03:30:00Z"));
     * const e = event(t, Immutable.fromJS({ a: 5, b: { c: 6 } }));
     * e.get("b.c"); // 6
     * ```
     *
     * Note: the default `field` is "value".
     */
    get(field?: string | string[]): any;
    /**
     * Set a new `value` on the `Event` for the given `field`, and return a new `Event`.
     *
     * You can refer to a `field` with one of the following notations:
     *  * (undefined) -> "value"
     *  * "temperature"
     *  * "path.to.deep.data"
     *  * ["path", "to", "deep", "data"].
     *
     * `value` is the new value to set on for the given `field` on the `Event`.
     *
     * ```
     * const t = time(new Date(1487983075328));
     * const initial = event(t, Immutable.Map({ name: "bob" }));
     * const modified = e.set("name", "fred");
     * modified.toString() // {"time": 1487983075328, "data": {"name":"fred"} }
     * ```
     */
    set(field: string | string[], value: any): Event<T>;
    /**
     * Will return false if the value for the specified `fields` in this `Event` is
     * either `undefined`, `NaN` or `null` for the given field or fields. This
     * serves as a determination of a "missing" value within a `TimeSeries` or
     * `Collection`.
     */
    isValid(fields?: string | string[]): boolean;
    /**
     * Converts the `Event` into a standard Javascript object
     */
    toJSON(): {};
    /**
     * Converts the `Event` to a string
     */
    toString(): string;
    /**
     * Returns the timestamp of the `Event`.
     *
     * This a convenience for calling `Event.getKey()` followed by `timestamp()`.
     */
    timestamp(): Date;
    /**
     * The begin time of the `Event`. If the key of the `Event` is a `Time` then
     * the begin and end time of the `Event` will be the same as the `Event`
     * timestamp.
     */
    begin(): Date;
    /**
     * The end time of the `Event`. If the key of the `Event` is a `Time` then
     * the begin and end time of the `Event` will be the same as the `Event`
     * timestamp.
     */
    end(): Date;
    index(): Index;
    indexAsString(): string;
    /**
     * Returns the `TimeRange` over which this `Event` occurs. If this `Event`
     * has a `Time` key then the duration of this range will be 0.
     */
    timerange(): TimeRange;
    /**
     * Shortcut for `timerange()` followed by `toUTCString()`.
     */
    timerangeAsUTCString(): string;
    /**
     * Shortcut for `timestamp()` followed by `toUTCString()`.
     */
    timestampAsUTCString(): string;
    /**
     * Returns an array containing the key in the first element and then the data map
     * expressed as JSON as the second element. This is the method that is used by
     * a `TimeSeries` to build its wireformat representation.
     */
    toPoint(columns: string[]): any[];
    /**
     * Collapses an array of fields, specified in the `fieldSpecList`, into a single
     * field named `fieldName` using the supplied reducer function. Optionally you can keep
     * all existing fields by supplying the `append` argument as `true`.
     *
     * Example:
     * ```
     * const t = time(new Date("2015-04-22T03:30:00Z"));
     * const e = event(t, Immutable.Map({ in: 5, out: 6, status: "ok" }));
     * const result = e.collapse(["in", "out"], "total", sum(), true);
     * // { "in": 5, "out": 6, "status": "ok", "total": 11 } }
     * ```
     */
    collapse(fieldSpecList: string[], fieldName: string, reducer: ReducerFunction, append?: boolean): Event<T>;
    /**
     * Selects specific fields of an `Event` using the `fields` array of strings
     * and returns a new event with just those fields.
     *
     * Example:
     * ```
     * const t = time(new Date("2015-04-22T03:30:00Z"));
     * const e = event(t, Immutable.Map({ a: 5, b: 6, c: 7 }));
     * const result = e.select(["a", "b"]);  // data is { a: 5, b: 6 }}
     * ```
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
