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
     * Duplicated means that the keys are the same. This is the case
     * with incoming events sometimes where a second event is either known
     * to be the same (but duplicate) of the first, or supersedes the first.
     *
     * You can also pass in false for ignoreValues and get a full compare,
     * including the data of the event, thus ignoring the supersede case.
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
     * Returns a function that will take a list of `event`'s and merge them
     * together using the `fieldSpec` provided. This is used as a reducer for
     * merging multiple `TimeSeries` together with `timeSeriesListMerge()`.
     */
    static merger<K extends Key>(
        deep
    ): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>> {
        return (events: Immutable.List<Event<K>>) => Event.merge(events, deep);
    }

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
    // tslint:disable:max-line-length
    public static combine<K extends Key>(
        events: Immutable.List<Event<K>>,
        reducer: ReducerFunction,
        fieldSpec?: string | string[]
    ): Immutable.List<Event<K>> {
        // Early exit
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

        // This function outputs the same as its input. If we are
        // passed an Immutable.List of events, the user will get
        // an Immutable.List back. If an array, a simple JS array will
        // be returned.
        return Immutable.List(outEvents);
    }

    /**
     * Returns a function that will take a list of `Event`'s and combine them
     * together using the `fieldSpec` and reducer function provided. This is
     * used as an event reducer for merging multiple `TimeSeries` together
     * with `timeSeriesListReduce()`.
     */
    static combiner<K extends Key>(
        fieldSpec,
        reducer
    ): (events: Immutable.List<Event<K>>) => Immutable.List<Event<Key>> {
        return (events: Immutable.List<Event<K>>) => Event.combine(events, reducer, fieldSpec);
    }

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
     * Constructor
     */

    constructor(protected key: T, protected data: Immutable.Map<string, any>) {
        super();
    }

    /**
     * Returns the key this `Event` was constructed with
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
     * Returns the data associated with this event, which be
     * of type `T`.
     */
    public getData(): Immutable.Map<string, any> {
        return this.data;
    }

    /**
     * Returns the data associated with this event, which be
     * of type `T`.
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
     */
    public get(field: string | string[] = "value"): any {
        const f = util.fieldAsArray(field);
        return this.getData().getIn(f);
    }

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
    public set(field: string | string[] = "value", value: any): Event<T> {
        const f = util.fieldAsArray(field);
        return new Event<T>(this.getKey(), this.getData().setIn(f, value));
    }

    /**
     * Will return false if the value in this `Event` is either `undefined`, `NaN` or
     * `null` for the given field or fields. This serves as a determination of a "missing"
     * value within a `TimeSeries` or `Collection`.
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

    public toJSON(): {} {
        const k = this.getKey().toJSON()[this.keyType()];
        return {
            [this.keyType()]: k,
            data: this.getData().toJSON()
        };
    }

    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    public timestamp(): Date {
        return this.getKey().timestamp();
    }

    public begin(): Date {
        return this.getKey().begin();
    }

    public end(): Date {
        return this.getKey().end();
    }

    public indexAsString() {
        return this.key.toString();
    }

    public timerange() {
        return new TimeRange(this.key.begin(), this.key.end());
    }

    public timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    public timestampAsUTCString() {
        return this.timestamp().toUTCString();
    }

    public toPoint() {
        if (this.keyType() === "time") {
            return [this.timestamp().getTime(), ..._.values(this.getData().toJSON())];
        } else if (this.keyType() === "index") {
            return [this.indexAsString(), ..._.values(this.getData().toJSON())];
        } else if (this.keyType() === "timerange") {
            return [
                [this.timerange().begin().getTime(), this.timerange().end().getTime()],
                ..._.values(this.getData().toJSON())
            ];
        }
    }

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
     * Selects specific fields of an `Event` using a `fields` and returns
     * a new event with just those fields.
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
