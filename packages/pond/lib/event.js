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
const base_1 = require("./base");
const index_1 = require("./index");
const time_1 = require("./time");
const timerange_1 = require("./timerange");
const util_1 = require("./util");
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
class Event extends base_1.Base {
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
    constructor(key, data) {
        super();
        this.key = key;
        this.data = data;
    }
    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses `Immutable.is()` to compare the event data and
     * the key.
     */
    static is(event1, event2) {
        return (event1.getKey().toString() === event2.getKey().toString() &&
            event1.getData().equals(event2.getData()));
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
    static isDuplicate(event1, event2, ignoreValues = true) {
        if (ignoreValues) {
            return (event1.keyType() === event2.keyType() &&
                event1.getKey().toString() === event2.getKey().toString());
        }
        else {
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
    static merge(events, deep) {
        // Early exit
        if (events instanceof Immutable.List && events.size === 0) {
            return Immutable.List();
        }
        //
        // Group events by event key
        //
        const mergeDeep = deep || false;
        const eventList = [];
        const eventMap = {};
        const keyMap = {};
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
        const outEvents = [];
        _.each(eventMap, (perKeyEvents, key) => {
            let reduced = null;
            let d = null;
            _.each(perKeyEvents, (e) => {
                if (!reduced) {
                    reduced = e;
                    d = reduced.getData();
                }
                else {
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
    static merger(deep) {
        return (events) => Event.merge(events, deep);
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
    static combine(events, reducer, fieldSpec) {
        if (events instanceof Immutable.List && events.size === 0) {
            return Immutable.List();
        }
        let eventTemplate;
        if (events instanceof Immutable.List) {
            eventTemplate = events.get(0);
        }
        else {
            eventTemplate = events[0];
        }
        let fieldNames;
        if (_.isString(fieldSpec)) {
            fieldNames = [fieldSpec];
        }
        else if (_.isArray(fieldSpec)) {
            fieldNames = fieldSpec;
        }
        //
        // Group events by event key
        //
        const eventMap = {};
        const keyMap = {};
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
        const outEvents = [];
        _.each(eventMap, (perKeyEvents, key) => {
            // tslint:disable-next-line
            const mapEvent = {};
            _.each(perKeyEvents, (perKeyEvent) => {
                let fields = fieldNames;
                if (!fields) {
                    const obj = perKeyEvent.getData().toJSON();
                    fields = _.map(obj, (v, fieldName) => `${fieldName}`);
                }
                fields.forEach(fieldName => {
                    if (!mapEvent[fieldName]) {
                        mapEvent[fieldName] = [];
                    }
                    mapEvent[fieldName].push(perKeyEvent.getData().get(fieldName));
                });
            });
            const data = {};
            _.map(mapEvent, (values, fieldName) => {
                data[fieldName] = reducer(values);
            });
            const e = new Event(keyMap[key], eventTemplate.getData().merge(data));
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
    static combiner(fieldSpec, reducer) {
        return (events) => Event.combine(events, reducer, fieldSpec);
    }
    static map(events, multiFieldSpec = "value") {
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
        }
        else if (_.isArray(multiFieldSpec)) {
            const fieldSpecList = multiFieldSpec;
            _.each(fieldSpecList, fieldSpec => {
                events.forEach(e => {
                    if (!_.has(result, fieldSpec)) {
                        result[fieldSpec] = [];
                    }
                    result[fieldSpec].push(e.get(fieldSpec));
                });
            });
        }
        else {
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
    static aggregate(events, reducer, multiFieldSpec) {
        function reduce(mapped, f) {
            const result = {};
            _.each(mapped, (valueList, key) => {
                result[key] = f(valueList);
            });
            return result;
        }
        return reduce(this.map(events, multiFieldSpec), reducer);
    }
    /**
     * Returns the key this `Event`.
     *
     * The result is of type T (a `Time`, `TimeRange` or `Index`), depending on
     * what the `Event` was constructed with.
     */
    getKey() {
        return this.key;
    }
    /**
     * Returns the label of the key
     */
    keyType() {
        return this.key.type();
    }
    /**
     * Returns the data associated with this event in the form
     * of an `Immutable.Map`. This is infact an accessor for the internal
     * representation of data in this `Event`.
     */
    getData() {
        return this.data;
    }
    /**
     * Sets new `data` associated with this event. The new `data` is supplied
     * in the form of an `Immutable.Map`. A new `Event<T>` will be returned
     * containing this new data, but having the same key.
     */
    setData(data) {
        return new Event(this.key, data);
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
    get(field = "value") {
        const f = util_1.default.fieldAsArray(field);
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
    set(field = "value", value) {
        const f = util_1.default.fieldAsArray(field);
        return new Event(this.getKey(), this.getData().setIn(f, value));
    }
    /**
     * Will return false if the value for the specified `fields` in this `Event` is
     * either `undefined`, `NaN` or `null` for the given field or fields. This
     * serves as a determination of a "missing" value within a `TimeSeries` or
     * `Collection`.
     */
    isValid(fields) {
        let invalid = false;
        const fieldList = _.isUndefined(fields) || _.isArray(fields) ? fields : [fields];
        fieldList.forEach(field => {
            const v = this.get(field);
            invalid = _.isUndefined(v) || _.isNaN(v) || _.isNull(v);
        });
        return !invalid;
    }
    /**
     * Converts the `Event` into a standard Javascript object
     */
    toJSON() {
        const k = this.getKey().toJSON()[this.keyType()];
        return {
            [this.keyType()]: k,
            data: this.getData().toJSON()
        };
    }
    /**
     * Converts the `Event` to a string
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
    /**
     * Returns the timestamp of the `Event`.
     *
     * This a convenience for calling `Event.getKey()` followed by `timestamp()`.
     */
    timestamp() {
        return this.getKey().timestamp();
    }
    /**
     * The begin time of the `Event`. If the key of the `Event` is a `Time` then
     * the begin and end time of the `Event` will be the same as the `Event`
     * timestamp.
     */
    begin() {
        return this.getKey().begin();
    }
    /**
     * The end time of the `Event`. If the key of the `Event` is a `Time` then
     * the begin and end time of the `Event` will be the same as the `Event`
     * timestamp.
     */
    end() {
        return this.getKey().end();
    }
    index() {
        return index_1.index(this.indexAsString());
    }
    indexAsString() {
        return this.key.toString();
    }
    /**
     * Returns the `TimeRange` over which this `Event` occurs. If this `Event`
     * has a `Time` key then the duration of this range will be 0.
     */
    timerange() {
        return new timerange_1.TimeRange(this.key.begin(), this.key.end());
    }
    /**
     * Shortcut for `timerange()` followed by `toUTCString()`.
     */
    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }
    /**
     * Shortcut for `timestamp()` followed by `toUTCString()`.
     */
    timestampAsUTCString() {
        return this.timestamp().toUTCString();
    }
    /**
     * Returns an array containing the key in the first element and then the data map
     * expressed as JSON as the second element. This is the method that is used by
     * a `TimeSeries` to build its wireformat representation.
     */
    toPoint(columns) {
        const values = [];
        columns.forEach(c => {
            const v = this.getData().get(c);
            values.push(v === "undefined" ? null : v);
        });
        if (this.keyType() === "time") {
            return [this.timestamp().getTime(), ...values];
        }
        else if (this.keyType() === "index") {
            return [this.indexAsString(), ...values];
        }
        else if (this.keyType() === "timerange") {
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
    collapse(fieldSpecList, fieldName, reducer, append = false) {
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
    select(fields) {
        const data = {};
        _.each(fields, fieldName => {
            const value = this.get(fieldName);
            data[fieldName] = value;
        });
        return this.setData(Immutable.fromJS(data));
    }
}
exports.Event = Event;
function timeEvent(arg1, arg2) {
    if (arg1 instanceof time_1.Time && Immutable.Map.isMap(arg2)) {
        const data = arg2;
        return new Event(arg1, data);
    }
    else {
        const t = arg1.time;
        const data = arg1.data;
        return new Event(time_1.time(t), Immutable.Map(data));
    }
}
exports.timeEvent = timeEvent;
function indexedEvent(arg1, arg2) {
    if (arg1 instanceof index_1.Index && Immutable.Map.isMap(arg2)) {
        const data = arg2;
        return new Event(arg1, data);
    }
    else {
        const i = arg1.index;
        const data = arg1.data;
        return new Event(index_1.index(i), Immutable.Map(data));
    }
}
exports.indexedEvent = indexedEvent;
function timeRangeEvent(arg1, arg2) {
    if (arg1 instanceof timerange_1.TimeRange && Immutable.Map.isMap(arg2)) {
        const data = arg2;
        return new Event(arg1, data);
    }
    else {
        const tr = arg1.timerange;
        const data = arg1.data;
        return new Event(timerange_1.timerange(tr[0], tr[1]), Immutable.Map(data));
    }
}
exports.timeRangeEvent = timeRangeEvent;
function event(key, data) {
    return new Event(key, data);
}
exports.event = event;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFFNUIsaUNBQThCO0FBQzlCLG1DQUF1QztBQUV2QyxpQ0FBb0M7QUFDcEMsMkNBQW1EO0FBSW5ELGlDQUEwQjtBQUUxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSCxXQUF5QyxTQUFRLFdBQUk7SUF3VmpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F1Q0c7SUFFSCxZQUFzQixHQUFNLEVBQVksSUFBZ0M7UUFDcEUsS0FBSyxFQUFFLENBQUM7UUFEVSxRQUFHLEdBQUgsR0FBRyxDQUFHO1FBQVksU0FBSSxHQUFKLElBQUksQ0FBNEI7SUFFeEUsQ0FBQztJQWxZRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFrQixFQUFFLE1BQWtCO1FBQ25ELE1BQU0sQ0FBQyxDQUNILE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ3pELE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQzVDLENBQUM7SUFDTixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FzQkc7SUFDSSxNQUFNLENBQUMsV0FBVyxDQUNyQixNQUFrQixFQUNsQixNQUFrQixFQUNsQixlQUF3QixJQUFJO1FBRTVCLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMsQ0FDSCxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDckMsTUFBTSxDQUFDLE1BQU0s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