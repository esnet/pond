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
class Event extends base_1.Base {
    /**
     * Constructor
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
     * Duplicated means that the keys are the same. This is the case
     * with incoming events sometimes where a second event is either known
     * to be the same (but duplicate) of the first, or supersedes the first.
     *
     * You can also pass in false for ignoreValues and get a full compare,
     * including the data of the event, thus ignoring the supersede case.
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
     * Returns a function that will take a list of `event`'s and merge them
     * together using the `fieldSpec` provided. This is used as a reducer for
     * merging multiple `TimeSeries` together with `timeSeriesListMerge()`.
     */
    static merger(deep) {
        return (events) => Event.merge(events, deep);
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
    static combine(events, reducer, fieldSpec) {
        // Early exit
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
     * Returns the key this `Event` was constructed with
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
     * Returns the data associated with this event, which be
     * of type `T`.
     */
    getData() {
        return this.data;
    }
    /**
     * Returns the data associated with this event, which be
     * of type `T`.
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
     */
    get(field = "value") {
        const f = util_1.default.fieldAsArray(field);
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
    set(field = "value", value) {
        const f = util_1.default.fieldAsArray(field);
        return new Event(this.getKey(), this.getData().setIn(f, value));
    }
    /**
     * Will return false if the value in this `Event` is either `undefined`, `NaN` or
     * `null` for the given field or fields. This serves as a determination of a "missing"
     * value within a `TimeSeries` or `Collection`.
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
    toJSON() {
        const k = this.getKey().toJSON()[this.keyType()];
        return {
            [this.keyType()]: k,
            data: this.getData().toJSON()
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    timestamp() {
        return this.getKey().timestamp();
    }
    begin() {
        return this.getKey().begin();
    }
    end() {
        return this.getKey().end();
    }
    indexAsString() {
        return this.key.toString();
    }
    timerange() {
        return new timerange_1.TimeRange(this.key.begin(), this.key.end());
    }
    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }
    timestampAsUTCString() {
        return this.timestamp().toUTCString();
    }
    toPoint() {
        if (this.keyType() === "time") {
            return [this.timestamp().getTime(), ..._.values(this.getData().toJSON())];
        }
        else if (this.keyType() === "index") {
            return [this.indexAsString(), ..._.values(this.getData().toJSON())];
        }
        else if (this.keyType() === "timerange") {
            //XXX
            //return [this.timerange().toJSON().timerange, ..._.values(this.getData().toJSON())];
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
    collapse(fieldSpecList, fieldName, reducer, append = false) {
        const data = append ? this.getData().toJS() : {};
        const d = fieldSpecList.map(fs => this.get(fs));
        data[fieldName] = reducer(d);
        return this.setData(Immutable.fromJS(data));
    }
    /**
     * Selects specific fields of an `Event` using a `fields` and returns
     * a new event with just those fields.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFFNUIsaUNBQThCO0FBQzlCLG1DQUF1QztBQUV2QyxpQ0FBb0M7QUFDcEMsMkNBQW1EO0FBSW5ELGlDQUEwQjtBQUUxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtDRztBQUNILFdBQXlDLFNBQVEsV0FBSTtJQXFUakQ7O09BRUc7SUFFSCxZQUFzQixHQUFNLEVBQVksSUFBZ0M7UUFDcEUsS0FBSyxFQUFFLENBQUM7UUFEVSxRQUFHLEdBQUgsR0FBRyxDQUFHO1FBQVksU0FBSSxHQUFKLElBQUksQ0FBNEI7SUFFeEUsQ0FBQztJQTFURDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFrQixFQUFFLE1BQWtCO1FBQ25ELE1BQU0sQ0FBQyxDQUNILE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ3pELE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQzVDLENBQUM7SUFDTixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ksTUFBTSxDQUFDLFdBQVcsQ0FDckIsTUFBa0IsRUFDbEIsTUFBa0IsRUFDbEIsZUFBd0IsSUFBSTtRQUU1QixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLENBQ0gsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxF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