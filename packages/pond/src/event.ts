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

/**
 * An Event is a mapping from a time based key K to data represented by type D
 *
 * The key K needs to be a sub-class of the base class `Key`, which typically
 * would be one of the following:
 *
 *  * `Time` - a single timestamp
 *  * `TimeRange` - a timerange over which the Event took place
 *  * `Index` - a different representation of a TimeRange
 *
 * The data object payload maybe any type.
 *
 * ```
 * interface Value {
 *     value: number
 * }
 *
 * const e = new Event<Index, Value>({ value: 42 })
 * ```
 *
 * Getting data out of the Event:
 *
 * Example 1:
 * ```
 * const e = event(index("1d-12355"), { value: 42 });
 * const value = e.data().value; // 42
 * ```
 *
 * Example 2:
 * ```
 * const t = time(new Date("2015-04-22T03:30:00Z"));
 * const e = event(t, { a: 5, b: { c: 6 } });
 * const value = e.data().b.c; // 42
 * ```
 *
 * Fields can refer to deep data with either a path (as an array)
 * or dot notation ("path.to.value").
 *
 * Setting data is done with `setData()`. For example:
 *
 * ```
 * const e = e.setData({ value: e.data().value * 100 })
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
export class Event<K extends Key, D> extends Base {
    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses `Immutable.is()` to compare the event data and
     * the key.
     */
    public static isEqual<D>(event1: Event<Key, D>, event2: Event<Key, D>): boolean {
        return (
            event1.getKey().toString() === event2.getKey().toString() &&
            _.isEqual(event1.data(), event2.data())
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
    public static isDuplicate<D>(
        event1: Event<Key, D>,
        event2: Event<Key, D>,
        ignoreValues: boolean = true
    ): boolean {
        if (ignoreValues) {
            return (
                event1.keyType() === event2.keyType() &&
                event1.getKey().toString() === event2.getKey().toString()
            );
        } else {
            return event1.keyType() === event2.keyType() && Event.isEqual(event1, event2);
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
    public static merge<K extends Key, D>(
        events: Immutable.List<Event<K, D>>,
        reducer: (dataList: D[], key: string) => D
    ): Immutable.List<Event<K, D>> {
        // Early exit
        if (events instanceof Immutable.List && events.size === 0) {
            return Immutable.List();
        }

        //
        // Group events by event key, so that we have a map of the keyName (for example
        // the timestamp) to an array of data (of type D). We also map the keyName back
        // to the original Key
        //

        // Map of keyName -> [ D ]
        const eventMap: { [key: string]: D[] } = {};

        // Map of keyName -> key of type K
        const keyMap: { [key: string]: K } = {};

        events.forEach(e => {
            const key = e.getKey();
            const k = key.toString();
            if (!_.has(eventMap, k)) {
                eventMap[k] = [];
                keyMap[k] = e.getKey();
            }
            eventMap[k].push(e.data());
        });

        //
        // For each key we'll build a new event of the same type as the source
        // events. The data is provided by the user reducer function, which maps
        // a list of event data to a new data object.
        //
        const outEvents: Array<Event<K, D>> = _.map(
            eventMap,
            (perKeyEvents: D[], key: string) =>
                new Event<K, D>(keyMap[key], reducer(perKeyEvents, key))
        );

        return Immutable.List(outEvents);
    }

    /**
     * Construction of an `Event` requires both a time-based key and an
     * a typed data object.
     *
     * The time-based key should be either a `Time`, a `TimeRange` or an `Index`,
     * though it would be possible to subclass `Key` with another type so long
     * as it implements that abstract interface.
     *
     * The data portion maybe any data object, so long as it is defined with an interface
     * (in a Typescript environment).
     *
     * You can use `new Event<T>()` to create a new `Event`, but it's easier to use
     * one of the factory functions: `event()`, `timeEvent()`, `timeRangeEvent()` and
     * `indexedEvent()`
     *
     * Example 1:
     * ```
     * const e = event(time(new Date(1487983075328)), { name: "bob" });
     * ```
     *
     * Example 2:
     * ```
     * // An event for a particular day with indexed key
     * const e = event(index("1d-12355"), { value: 42 });
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
     * // Create a timeEvent with a ms timestamp and data
     * const e = timeEvent({
     *     time: 1487983075328,
     *     data: { a: 2, b: 3 }
     * });
     * ```
     */

    private k: K;
    private d: D;

    constructor(key: K, data: D) {
        super();
        this.k = key;
        this.d = data;
    }

    /**
     * Returns the key this `Event`.
     *
     * The result is of type K (a `Time`, `TimeRange` or `Index`), depending on
     * what the `Event` was constructed with.
     */
    public getKey(): K {
        return this.k;
    }

    /**
     * Returns the label of the key
     */
    public keyType(): string {
        return this.k.type();
    }

    /**
     * Returns the data associated with this event. The data will be of `type D`.
     */
    public data(): D {
        return this.d;
    }

    /**
     * Sets new `data` associated with this event. The new data `d` should be
     * of `type D`. A new `Event<T, D>` will be returned containing this new data,
     * but having the same key of `type K`.
     */
    public setData(d: D): Event<K, D> {
        return new Event<K, D>(this.k, d);
    }

    /**
     * Will return false if the value for the specified `fields` in this `Event` is
     * either `undefined`, `NaN` or `null` for the given field or fields. This
     * serves as a determination of a "missing" value within a `TimeSeries` or
     * `Collection`.
     */
    // XXX
    // public isValid(fields?: string | string[]): boolean {
    //     let invalid = false;
    //     const fieldList: string[] = _.isUndefined(fields) || _.isArray(fields) ? fields : [fields];
    //     fieldList.forEach(field => {
    //         const v = this.get(field);
    //         invalid = _.isUndefined(v) || _.isNaN(v) || _.isNull(v);
    //     });
    //     return !invalid;
    // }

    /**
     * Converts the `Event` into a standard Javascript object
     */
    public toJSON(marshaller?: (d: D) => object): {} {
        const k = this.getKey().toJSON()[this.keyType()];
        return {
            [this.keyType()]: k,
            data: marshaller ? marshaller(this.data()) : this.data()
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
        return this.k.toString();
    }

    /**
     * Returns the `TimeRange` over which this `Event` occurs. If this `Event`
     * has a `Time` key then the duration of this range will be 0.
     */
    public timeRange() {
        return new TimeRange(this.k.begin(), this.k.end());
    }

    /**
     * Shortcut for `timerange()` followed by `toUTCString()`.
     */
    public timeRangeAsUTCString() {
        return this.timeRange().toUTCString();
    }

    /**
     * Returns an array containing the key in the first element and then the data map
     * expressed as JSON as the second element. This is the method that is used by
     * a `TimeSeries` to build its wireformat representation.
     */
    public toPoint(columns: string[], marshaller?: (d: D, column: string) => any) {
        const values = [];
        columns.forEach(c => {
            const v = marshaller(this.data(), c);
            values.push(v === "undefined" ? null : v);
        });
        if (this.keyType() === "time") {
            return [this.timestamp().getTime(), ...values];
        } else if (this.keyType() === "index") {
            return [this.indexAsString(), ...values];
        } else if (this.keyType() === "timerange") {
            return [
                [
                    this.timeRange()
                        .begin()
                        .getTime(),
                    this.timeRange()
                        .end()
                        .getTime()
                ],
                ...values
            ];
        }
    }
}

export interface TimeEventObject<D> {
    time: number;
    data: D;
}

function timeEvent<D>(arg: TimeEventObject<D>): Event<Time, D>;
function timeEvent<D>(t: Time, data: D): Event<Time, D>;
function timeEvent<D>(arg1: any, arg2?: D): Event<Time, D> {
    if (arg1 instanceof Time) {
        return new Event<Time, D>(arg1, arg2);
    } else {
        const t = arg1.time as number;
        return new Event<Time, D>(time(t), arg2);
    }
}

export interface IndexedEventObject<D> {
    index: string;
    data: D;
}

function indexedEvent<D>(arg: IndexedEventObject<D>): Event<Index, D>;
function indexedEvent<D>(idx: Index, data: D): Event<Index, D>;
function indexedEvent<D>(arg1: any, arg2?: D): Event<Index, D> {
    if (arg1 instanceof Index && Immutable.Map.isMap(arg2)) {
        return new Event<Index, D>(arg1, arg2);
    } else {
        const i = arg1.index as string;
        return new Event<Index, D>(index(i), arg2);
    }
}

export interface TimeRangeEventObject<D> {
    timerange: [number, number]; // should be length 2
    data: D;
}

function timeRangeEvent<D>(arg: TimeRangeEventObject<D>): Event<TimeRange, D>;
function timeRangeEvent<D>(tr: TimeRange, data: D): Event<TimeRange, D>;
function timeRangeEvent<D>(arg1: any, arg2?: D): Event<TimeRange, D> {
    if (arg1 instanceof TimeRange && Immutable.Map.isMap(arg2)) {
        return new Event<TimeRange, D>(arg1, arg2);
    } else {
        const tr = arg1.timerange as [number, number];
        const [begin, end] = tr;
        return new Event<TimeRange, D>(timerange(begin, end), arg2);
    }
}

function event<T extends Key, D>(key: T, data: D) {
    return new Event<T, D>(key, data);
}
export { event, timeEvent, timeRangeEvent, indexedEvent };
