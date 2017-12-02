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
import { Index, index } from "./index";
import { Key } from "./key";
import { Time, time } from "./time";
import { TimeRange, timerange } from "./timerange";

import { ReducerFunction, ValueListMap, ValueMap } from "./types";

import util from "./util";

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
 * const e = event(t, Immutable.Map({ temperatuue: 75.2, humidity: 84 }));
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
export class Event<T extends Key = Time> extends Base {
    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses `Immutable.is()` to compare the event data and
     * the key.
     */
    public static is(event1: Event<Key>, event2: Event<Key>): boolean {
        return (
            event1.getKey().toString() === event2.getKey().toString() &&
            event1.getData().equals(event2.getData())
        );
    }

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
    public static isDuplicate(
        event1: Event<Key>,
        event2: Event<Key>,
        ignoreValues: boolean = true
    ): boolean {
        if (ignoreValues) {
            return (
                event1.keyType() === event2.keyType() &&
                event1.getKey().toString() === event2.getKey().toString()
            );
        } else {
            return event1.keyType() === event2.keyType() && Event.is(event1, event2);
        }
    }

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
    public static merge<K extends Key>(
        events: Immutable.List<Event<K>>,
        deep?: boolean
    ): Immutable.List<Event<K>> {
        // Early exit
        if (events instanceof Immutable.List && events.size === 0) {
            return Immutable.List();
        }

        //
        // Group events by event key
        //
        const mergeDeep = deep || false;
        const eventList: Array<Event<K>> = [];

        const eventMap: { [key: string]: Array<Event<K>> } = {};
        const keyMap: { [key: string]: K } = {};
        events.forEach(e => {
            const key = e.getKey();
            const k = key.toString();
            if (!_.has(eventMap, k)) {
                eventMap[k] = [];
                keyMap[k] = e.getKey();
            }
            eventMap[k].push(e);
        });

        //
        // For each key we'll build a new event of the same type as the source
        // events. Here we loop through all the events for that key, then for each field
        // we are considering, we get all the values and reduce them (sum, avg, etc)
        // to a new data object d, which we then build a new Event from.
        //
        const outEvents: Array<Event<K>> = [];
        _.each(eventMap, (perKeyEvents: Event<K>, key: string) => {
            let reduced: Event<K> = null;
            let d = null;
            _.each(perKeyEvents, (e: Event<K>) => {
                if (!reduced) {
                    reduced = e;
                    d = reduced.getData();
                } else {
                    d = mergeDeep ? d.mergeDeep(e.getData()) : d.merge(e.getData());
                }
                reduced = reduced.setData(d);
            });
            outEvents.push(reduced);
        });

        return Immutable.List(outEvents);
    }

    /**
     * Returns a function that will take a list of `Event`s and merge them
     * together using the `fieldSpec` provided. This is used as a `reducer` for
     * merging multiple `TimeSeries` together with `TimeSeries.timeSeriesListMerge()`.
     */
    static merger<K extends Key>(
        deep
    ): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>> {
        return (events: Immutable.List<Event<K>>) => Event.merge(events, deep);
    }

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
    public static combine<K extends Key>(
        events: Immutable.List<Event<K>>,
        reducer: ReducerFunction,
        fieldSpec?: string | string[]
    ): Immutable.List<Event<K>> {
        if (events instanceof Immutable.List && events.size === 0) {
            return Immutable.List();
        }

        let eventTemplate;
        if (events instanceof Immutable.List) {
            eventTemplate = events.get(0);
        } else {
            eventTemplate = events[0];
        }

        let fieldNames: string[];
        if (_.isString(fieldSpec)) {
            fieldNames = [fieldSpec as string];
        } else if (_.isArray(fieldSpec)) {
            fieldNames = fieldSpec as string[];
        }

        //
        // Group events by event key
        //
        const eventMap: { [key: string]: Array<Event<K>> } = {};
        const keyMap: { [key: string]: K } = {};
        events.forEach(e => {
            const key = e.getKey();
            const k = key.toString();
            if (!_.has(eventMap, k)) {
                eventMap[k] = [];
                keyMap[k] = e.getKey();
            }
            eventMap[k].push(e);
        });

        //
        // For each key we'll build a new event of the same type as the source
        // events. Here we loop through all the events for that key, then for
        // each field we are considering, we get all the values and reduce
        // them (sum, avg, etc) to get a the new data for that key.
        //
        const outEvents: Array<Event<K>> = [];
        _.each(eventMap, (perKeyEvents: Event<K>, key: string) => {
            // tslint:disable-next-line
            const mapEvent: { [key: string]: number[] } = {};
            _.each(perKeyEvents, (perKeyEvent: Event<K>) => {
                let fields = fieldNames;
                if (!fields) {
                    const obj = perKeyEvent.getData().toJSON() as {};
                    fields = _.map(obj, (v, fieldName) => `${fieldName}`);
                }
                fields.forEach(fieldName => {
                    if (!mapEvent[fieldName]) {
                        mapEvent[fieldName] = [];
                    }
                    mapEvent[fieldName].push(perKeyEvent.getData().get(fieldName));
                });
            });

            const data: { [key: string]: number } = {};
            _.map(mapEvent, (values, fieldName) => {
                data[fieldName] = reducer(values);
            });

            const e = new Event<K>(keyMap[key], eventTemplate.getData().merge(data));

            outEvents.push(e);
        });

        return Immutable.List(outEvents);
    }

    /**
     * Static method that returns a function that will take a list of `Event`'s
     * and combine them together using the `fieldSpec` and reducer function provided.
     * This is used as an event reducer for merging multiple `TimeSeries` together
     * with `timeSeriesListReduce()`.
     */
    static combiner<K extends Key>(
        fieldSpec,
        reducer
    ): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>> {
        return (events: Immutable.List<Event<K>>) => Event.combine(events, reducer, fieldSpec);
    }

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
    public static map<K extends Key>(
        events: Immutable.List<Event<K>>,
        multiFieldSpec: string | string[]
    ): ValueListMap;
    public static map<K extends Key>(events, multiFieldSpec: any = "value") {
        const result = {};
        if (typeof multiFieldSpec === "string") {
            const fieldSpec = multiFieldSpec;
            events.forEach(e => {
                if (!_.has(result, fieldSpec)) {
                    result[fieldSpec] = [];
                }
                const value = e.get(fieldSpec);
                result[fieldSpec].push(value);
            });
        } else if (_.isArray(multiFieldSpec)) {
            const fieldSpecList = multiFieldSpec as string[];
            _.each(fieldSpecList, fieldSpec => {
                events.forEach(e => {
                    if (!_.has(result, fieldSpec)) {
                        result[fieldSpec] = [];
                    }
                    result[fieldSpec].push(e.get(fieldSpec));
                });
            });
        } else {
            events.forEach(e => {
                _.each(e.data().toJSON(), (value, key) => {
                    if (!_.has(result, key)) {
                        result[key] = [];
                    }
                    result[key].push(value);
                });
            });
        }
        return result;
    }

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
    public static aggregate<K extends Key>(
        events: Immutable.List<Event<K>>,
        reducer: ReducerFunction,
        multiFieldSpec: string | string[]
    ): ValueMap {
        function reduce(mapped: ValueListMap, f: ReducerFunction): ValueMap {
            const result = {};
            _.each(mapped, (valueList, key) => {
                result[key] = f(valueList);
            });
            return result;
        }

        return reduce(this.map(events, multiFieldSpec), reducer);
    }

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
     */

    constructor(protected key: T, protected data: Immutable.Map<string, any>) {
        super();
    }

    /**
     * Returns the key this `Event`.
     *
     * The result is of type T (a `Time`, `TimeRange` or `Index`), depending on
     * what the `Event` was constructed with.
     */
    public getKey(): T {
        return this.key;
    }

    /**
     * Returns the label of the key
     */
    public keyType(): string {
        return this.key.type();
    }

    /**
     * Returns the data associated with this event in the form
     * of an `Immutable.Map`. This is infact an accessor for the internal
     * representation of data in this `Event`.
     */
    public getData(): Immutable.Map<string, any> {
        return this.data;
    }

    /**
     * Sets new `data` associated with this event. The new `data` is supplied
     * in the form of an `Immutable.Map`. A new `Event<T>` will be returned
     * containing this new data, but having the same key.
     */
    public setData(data: Immutable.Map<string, any>): Event<T> {
        return new Event<T>(this.key, data);
    }

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
    public get(field: string | string[] = "value"): any {
        const f = util.fieldAsArray(field);
        return this.getData().getIn(f);
    }

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
    public set(field: string | string[] = "value", value: any): Event<T> {
        const f = util.fieldAsArray(field);
        return new Event<T>(this.getKey(), this.getData().setIn(f, value));
    }

    /**
     * Will return false if the value for the specified `fields` in this `Event` is
     * either `undefined`, `NaN` or `null` for the given field or fields. This
     * serves as a determination of a "missing" value within a `TimeSeries` or
     * `Collection`.
     */
    public isValid(fields?: string | string[]): boolean {
        let invalid = false;
        const fieldList: string[] = _.isUndefined(fields) || _.isArray(fields) ? fields : [fields];
        fieldList.forEach(field => {
            const v = this.get(field);
            invalid = _.isUndefined(v) || _.isNaN(v) || _.isNull(v);
        });
        return !invalid;
    }

    /**
     * Converts the `Event` into a standard Javascript object
     */
    public toJSON(): {} {
        const k = this.getKey().toJSON()[this.keyType()];
        return {
            [this.keyType()]: k,
            data: this.getData().toJSON()
        };
    }

    /**
     * Converts the `Event` to a string
     */
    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the timestamp of the `Event`.
     *
     * This a convenience for calling `Event.getKey()` followed by `timestamp()`.
     */
    public timestamp(): Date {
        return this.getKey().timestamp();
    }

    /**
     * The begin time of the `Event`. If the key of the `Event` is a `Time` then
     * the begin and end time of the `Event` will be the same as the `Event`
     * timestamp.
     */
    public begin(): Date {
        return this.getKey().begin();
    }

    /**
     * The end time of the `Event`. If the key of the `Event` is a `Time` then
     * the begin and end time of the `Event` will be the same as the `Event`
     * timestamp.
     */
    public end(): Date {
        return this.getKey().end();
    }

    public index() {
        return index(this.indexAsString());
    }

    public indexAsString() {
        return this.key.toString();
    }

    /**
     * Returns the `TimeRange` over which this `Event` occurs. If this `Event`
     * has a `Time` key then the duration of this range will be 0.
     */
    public timerange() {
        return new TimeRange(this.key.begin(), this.key.end());
    }

    /**
     * Shortcut for `timerange()` followed by `toUTCString()`.
     */
    public timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    /**
     * Shortcut for `timestamp()` followed by `toUTCString()`.
     */
    public timestampAsUTCString() {
        return this.timestamp().toUTCString();
    }

    /**
     * Returns an array containing the key in the first element and then the data map
     * expressed as JSON as the second element. This is the method that is used by
     * a `TimeSeries` to build its wireformat representation.
     */
    public toPoint(columns: string[]) {
        const values = [];
        columns.forEach(c => {
            const v = this.getData().get(c);
            values.push(v === "undefined" ? null : v);
        });
        if (this.keyType() === "time") {
            return [this.timestamp().getTime(), ...values];
        } else if (this.keyType() === "index") {
            return [this.indexAsString(), ...values];
        } else if (this.keyType() === "timerange") {
            return [
                [
                    this.timerange()
                        .begin()
                        .getTime(),
                    this.timerange()
                        .end()
                        .getTime()
                ],
                ...values
            ];
        }
    }

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
    public collapse(
        fieldSpecList: string[],
        fieldName: string,
        reducer: ReducerFunction,
        append: boolean = false
    ): Event<T> {
        const data = append ? this.getData().toJS() : {};
        const d = fieldSpecList.map(fs => this.get(fs));
        data[fieldName] = reducer(d);
        return this.setData(Immutable.fromJS(data));
    }

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
    public select(fields: string[]): Event<T> {
        const data = {};
        _.each(fields, fieldName => {
            const value = this.get(fieldName);
            data[fieldName] = value;
        });
        return this.setData(Immutable.fromJS(data));
    }
}

export interface TimeEventObject {
    time: number;
    data: { [data: string]: any };
}

function timeEvent(arg: TimeEventObject): Event<Time>;
function timeEvent(t: Time, data: Immutable.Map<string, any>): Event<Time>;
function timeEvent(arg1: any, arg2?: any): Event<Time> {
    if (arg1 instanceof Time && Immutable.Map.isMap(arg2)) {
        const data = arg2 as Immutable.Map<string, any>;
        return new Event<Time>(arg1, data);
    } else {
        const t = arg1.time as number;
        const data = arg1.data as { [data: string]: any };
        return new Event<Time>(time(t), Immutable.Map(data));
    }
}

export interface IndexedEventObject {
    index: string;
    data: { [data: string]: any };
}

function indexedEvent(arg: IndexedEventObject): Event<Index>;
function indexedEvent(idx: Index, data: Immutable.Map<string, any>): Event<Index>;
function indexedEvent(arg1: any, arg2?: any): Event<Index> {
    if (arg1 instanceof Index && Immutable.Map.isMap(arg2)) {
        const data = arg2 as Immutable.Map<string, any>;
        return new Event<Index>(arg1, data);
    } else {
        const i = arg1.index as number;
        const data = arg1.data as { [data: string]: any };
        return new Event<Index>(index(i), Immutable.Map(data));
    }
}

export interface TimeRangeEventObject {
    timerange: number[]; // should be length 2
    data: { [data: string]: any };
}

function timeRangeEvent(arg: TimeRangeEventObject): Event<TimeRange>;
function timeRangeEvent(idx: Index, data: Immutable.Map<string, any>): Event<TimeRange>;
function timeRangeEvent(arg1: any, arg2?: any): Event<TimeRange> {
    if (arg1 instanceof TimeRange && Immutable.Map.isMap(arg2)) {
        const data = arg2 as Immutable.Map<string, any>;
        return new Event<TimeRange>(arg1, data);
    } else {
        const tr = arg1.timerange as number[];
        const data = arg1.data as { [data: string]: any };
        return new Event<TimeRange>(timerange(tr[0], tr[1]), Immutable.Map(data));
    }
}

function event<T extends Key>(key: T, data: Immutable.Map<string, any>) {
    return new Event<T>(key, data);
}
export { event, timeEvent, timeRangeEvent, indexedEvent };
