/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as _ from "lodash";
import * as Immutable from "immutable";

import Key from "./key";
import util from "./util";

/**
 * A function that takes a list of numbers and
 * returns a single number
 */
export interface ReducerFunction {
    (values: number[]): number;
}

/**
 * A mapping from string to list of numbers
 */
export interface ValueListMap {
    [s: string]: number[];
}

/**
 * A mapping from string to number
 */
export interface ValueMap {
    [s: string]: number[];
}

/**
 * An Event is a mapping from a time based key to a set
 * of unstuctured data.
 * 
 * The key needs to be a sub-class of the `Key`, though
 * typically, this would either be one of the following:
 *  * `Time` - a single timestamp
 *  * `TimeRange` - a timerange over which the Event took place
 *  * `Index` - a different representation of a TimeRange
 * 
 * The data can be specified as either a JS object or an
 * Immutable.Map<string, any>. To get values out of the data,
 * use `get()`. This method takes what is called a field, which
 * is any key into the data. Fields can refer to deep data with
 * either a path (as an array) or dot notation. Not specifying
 * a field implies a field of name "value".
 */
class Event<T extends Key> {

    protected _key: T;
    protected _data: Immutable.Map<string, any>

    constructor(key: T, data: Object);
    constructor(key: T, data: Immutable.Map<string, any>)
    constructor(key: T, data: any) {
        this._key = key;
        this._data = _.isObject(data) ? Immutable.fromJS(data) : data;
    }

    /**
     * Returns the key this Event was constructed with
     */
    key(): T {
        return this._key;
    }

    /**
     * Returns the label of the key
     */
    keyType(): string {
        return this._key.type();
    }

    /**
     * Returns the data associated with this event as the
     * internal Immutable data structure
     */
    data(): Immutable.Map<string, any> {
        return this._data;
    }

    /**
     * Gets the value of a specific field within the Event.
     *
     * You can refer to a fields with one of the following notations:
     *  * (undefined) -> "value"
     *  * "temperature"
     *  * "path.to.deep.data"
     *  * ["path", "to", "deep", "data"].
     * 
     * @return Object
     */
    get(): any;
    get(field: string): any;
    get(field: Array<string>): any;
    get(field: any = ["value"]): any {
        let v = this.data().getIn(util.fieldAsArray(field));
        if (v instanceof Immutable.Map ||
            v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }

    /**
     * Set a new value on the Event and return a new Event.
     * 
     * `key` is the Event key, for example the `Time` of the `Event`.
     * `value` is the new value to set on the `Event`.
     */
    set(key: string, value: any): Event<T> {
        return new Event<T>(this.key(), this._data.set(key, value));
    }

    /**
     * Will return false if the value in this `Event` is
     * either `undefined`, `NaN` or `null` for the given field
     * or fields. This serves as a determination of a "missing"
     * value within a `TimeSeries` or `Collection`.
     *
     * @param {string|string[]} fields The field or fields to check
     * 
     * @returns boolean If this Event is valid
     */
    isValid(field: string): boolean;
    isValid(fields: Array<string>): boolean;
    isValid(f?): boolean {
        let invalid = false;
        const fieldList: string[] =
            _.isUndefined(f) || _.isArray(f) ? f : [f];
        fieldList.forEach(field => {
            const v = this.get(field);
            invalid = (
                _.isUndefined(v) ||
                _.isNaN(v) ||
                _.isNull(v)
            );
        })
        return !invalid;
    }

    // Public:

    public toJSON(): Object {
        return {
            [this.keyType()]: this.key().toJSON(),
            data: this.data()
        }
    }

    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    public timestamp(): Date {
        return this.key().timestamp();
    }

    public begin(): Date {
        return this.key().begin();
    }

    public end(): Date {
        return this.key().end();
    }

    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses Immutable.is() to compare the event data and
     * the string representation of the key to compare those.
     */
    static is(event1: Event<Key>, event2: Event<Key>): boolean {
        return (
            event1.key().toString() === event2.key().toString() &&
            Immutable.is(event1.data(), event2.data())
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
    static isDuplicate(event1: Event<Key>,
        event2: Event<Key>,
        ignoreValues: boolean = true): boolean {
        if (ignoreValues) {
            return event1.keyType() === event2.keyType() &&
                event1.key().toString() === event2.key().toString();
        } else {
            return event1.keyType() === event2.keyType() && Event.is(event1, event2);
        }
    }

    /**
     * Merges multiple `events` together into a new array of events, one
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
     * See also: TimeSeries.timeSeriesListMerge()
     */
    static merge<T extends Key>(eventList: Event<T>[],
        deep?: boolean): Event<T>[];
    static merge<T extends Key>(eventList: Immutable.List<Event<T>>,
        deep?: boolean): Immutable.List<Event<T>>;
    static merge<T extends Key>(eventList: any,
        deep?: boolean): any {
        // Early exit
        if (eventList instanceof Immutable.List && eventList.size === 0) {
            return Immutable.List();
        }
        if (_.isArray(eventList) && eventList.length === 0) {
            return [];
        }

        const mergeDeep = deep || false;

        // Add type to events
        let events: Event<T>[] = [];
        if (eventList instanceof Immutable.List) {
            events = eventList.toArray();
        } else {
            events = eventList;
        }

        //
        // Group events by event key
        //
        const eventMap: { [key: string]: Event<T>[] } = {};
        const keyMap: { [key: string]: T } = {};
        events.forEach(e => {
            const key = e.key();
            const k = key.toString();
            if (!_.has(eventMap, k)) {
                eventMap[k] = [];
                keyMap[k] = e.key();
            }
            eventMap[k].push(e);
        });

        //
        // For each key we'll build a new event of the same type as the source
        // events. Here we loop through all the events for that key, then for each field
        // we are considering, we get all the values and reduce them (sum, avg, etc).
        //
        const outEvents: Event<T>[] = [];
        _.each(eventMap, (perKeyEvents: Event<T>, key: string) => {
            let data = Immutable.Map();
            _.each(perKeyEvents, (event: Event<T>) => {
                data = mergeDeep ? data.mergeDeep(event.data())
                    : data.merge(event.data());
            });
            outEvents.push(new Event<T>(keyMap[key], data));
        });

        // This function outputs the same as its input. If we are
        // passed an Immutable.List of events, the user will get
        // an Immutable.List back. If an array, a simple JS array will
        // be returned.
        if (eventList instanceof Immutable.List) {
            return Immutable.List(outEvents);
        }
        return outEvents;
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
     * The return result will be an Event of the same type as the input.
     * 
     * Additionally, if you pass in an array of `Events`, you will get an
     * array of events back. If you pass an `Immutable.List` of events then
     * you will get an `Immutable.List` of events back.
     *
     * This is the general version of `Event.sum()` and `Event.avg()`. If those
     * common use cases are what you want, just use those functions. If you
     * want to specify your own reducer you can use this function.
     *
     * See also: `TimeSeries.timeSeriesListSum()`
     */
    static combine<T extends Key>(eventList: Event<T>[],
        reducer: ReducerFunction,
        fieldSpec?: string | string[]): Event<T>[];
    static combine<T extends Key>(eventList: Immutable.List<Event<T>>,
        reducer: ReducerFunction,
        fieldSpec?: string | string[]): Immutable.List<Event<T>>;
    static combine<T extends Key>(eventList: any,
        reducer: ReducerFunction,
        fieldSpec?: string | string[]): any {
        // Early exit
        if (eventList instanceof Immutable.List && eventList.size === 0) {
            return Immutable.List();
        }
        if (_.isArray(eventList) && eventList.length === 0) {
            return [];
        }

        // Type our events
        let events: Event<T>[] = [];
        if (eventList instanceof Immutable.List) {
            events = eventList.toArray();
        } else {
            events = eventList;
        }

        let fieldNames: string[];
        if (_.isString(fieldSpec)) {
            fieldNames = [<string>(fieldSpec)];
        } else if (_.isArray(fieldSpec)) {
            fieldNames = <string[]>fieldSpec;
        }

        //
        // Group events by event key
        //
        const eventMap: { [key: string]: Event<T>[] } = {};
        const keyMap: { [key: string]: T } = {};
        events.forEach(e => {
            const key = e.key();
            const k = key.toString();
            if (!_.has(eventMap, k)) {
                eventMap[k] = [];
                keyMap[k] = e.key();
            }
            eventMap[k].push(e);
        });

        //
        // For each key we'll build a new event of the same type as the source
        // events. Here we loop through all the events for that key, then for
        // each field we are considering, we get all the values and reduce
        // them (sum, avg, etc) to get a the new data for that key.
        //
        const outEvents: Event<T>[] = [];
        _.each(eventMap, (perKeyEvents: Event<T>, key: string) => {
            const mapEvent: { [key: string]: number[] } = {};
            _.each(perKeyEvents, (event: Event<T>) => {
                let fields = fieldNames;
                if (!fields) {
                    fields = _.map(
                        event.data().toJS(),
                        (v, fieldName) => `${fieldName}`
                    );
                }
                fields.forEach(fieldName => {
                    if (!mapEvent[fieldName]) {
                        mapEvent[fieldName] = [];
                    }
                    mapEvent[fieldName].push(event.data().get(fieldName));
                });
            });

            const data: { [key: string]: number } = {};
            _.map(mapEvent, (values, fieldName) => {
                data[fieldName] = reducer(values);
            });
            outEvents.push(new Event<T>(keyMap[key], data));
        });

        // This function outputs the same as its input. If we are
        // passed an Immutable.List of events, the user will get
        // an Immutable.List back. If an array, a simple JS array will
        // be returned.
        if (eventList instanceof Immutable.List) {
            return Immutable.List(outEvents);
        }
        return outEvents;
    }

    /**
     * Takes a list of Events<T> and makes a map from the Event field names 
     * to an array of values, one value for each Event.
     * 
     * @example
     * ```
     * const eventMap = Event.map(events, ["in"]);
     * // { in: [ 2, 4, 6, 8 ], out: [ 11, 13, 15, 18 ] }
     * ```
     */
    static map<T extends Key>(events: Immutable.List<Event<T>>,
        multiFieldSpec: string): ValueListMap;
    static map<T extends Key>(events: Immutable.List<Event<T>>,
        multiFieldSpec: string[]): ValueListMap;
    static map<T extends Key>(events, multiFieldSpec: any = "value") {
        const result = {};
        if (typeof multiFieldSpec === "string") {
            const fieldSpec = multiFieldSpec;
            events.forEach(event => {
                if (!_.has(result, fieldSpec)) {
                    result[fieldSpec] = [];
                }
                const value = event.get(fieldSpec);
                result[fieldSpec].push(value);
            });
        } else if (_.isArray(multiFieldSpec)) {
            const fieldSpecList = multiFieldSpec as string[];
            _.each(fieldSpecList, fieldSpec => {
                events.forEach(event => {
                    if (!_.has(result, fieldSpec)) {
                        result[fieldSpec] = [];
                    }
                    result[fieldSpec].push(event.get(fieldSpec));
                });
            });
        } else {
            events.forEach(event => {
                _.each(event.data().toJSON(), (value, key) => {
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
     * Takes a Immutable.List of events and a reducer function and a
     * fieldSpec (or list of fieldSpecs) and returns an aggregated
     * result in the form of a new Event, for each column.
     * 
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
    static aggregate<T extends Key>(events: Immutable.List<Event<T>>,
        reducer: ReducerFunction,
        multiFieldSpec: string): ValueMap
    static aggregate<T extends Key>(events: Immutable.List<Event<T>>,
        reducer: ReducerFunction,
        multiFieldSpec: string[]): ValueMap
    static aggregate(events: any, reducer, multiFieldSpec): ValueMap {
        function reduce(mapped: ValueListMap, reducer: ReducerFunction): ValueMap {
            const result = {};
            _.each(mapped, (valueList, key) => {
                result[key] = reducer(valueList);
            });
            return result;
        }
        return reduce(this.map(events, multiFieldSpec), reducer);
    }
}

export default Event;
