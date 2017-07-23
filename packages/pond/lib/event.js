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
 * implement differently) a Immutable.Map.
 *
 * To get values out of the data, use `get()`. This method takes
 * what is called a field, which is a top level key of the Data
 * Map.
 *
 * Fields can refer to deep data with either a path (as an array)
 * or dot notation. Not specifying  a field implies a field of
 * name "value".
 *
 * @example
 *
 * ```
 * const timestamp = time(new Date("2015-04-22T03:30:00Z");
 * const e = new Event(timestamp, data({ temperature: 42 }));
 * ```
 */
class Event extends base_1.Base {
    constructor(key, data) {
        super();
        this.key = key;
        this.data = data;
    }
    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses Immutable.is() to compare the event data and
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
    static merge(eventList, deep) {
        // Early exit
        if (eventList instanceof Immutable.List && eventList.size === 0) {
            return Immutable.List();
        }
        if (_.isArray(eventList) && eventList.length === 0) {
            return [];
        }
        const mergeDeep = deep || false;
        // Add type to events
        let events = [];
        if (eventList instanceof Immutable.List) {
            events = eventList.toArray();
        }
        else {
            events = eventList;
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
        // events. Here we loop through all the events for that key, then for each field
        // we are considering, we get all the values and reduce them (sum, avg, etc)
        // to a new data object d, which we then build a new Event from.
        //
        const outEvents = [];
        _.each(eventMap, (perKeyEvents, key) => {
            let reduced = null;
            let d = null;
            _.each(perKeyEvents, (event) => {
                if (!reduced) {
                    reduced = event;
                    d = reduced.getData();
                }
                else {
                    d = mergeDeep ? d.mergeDeep(event.getData()) : d.merge(event.getData());
                }
                reduced = reduced.setData(d);
            });
            outEvents.push(reduced);
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
     * This is the general version of `Event.sum()` and `Event.avg()`. If those
     * common use cases are what you want, just use those functions. If you
     * want to specify your own reducer you can use this function.
     *
     * See also: `TimeSeries.timeSeriesListSum()`
     */
    static combine(events, reducer, fieldSpec) {
        // Early exit
        if (events instanceof Immutable.List && events.size === 0) {
            return Immutable.List();
        }
        const eventTemplate = events.get(0);
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
            _.each(perKeyEvents, (event) => {
                let fields = fieldNames;
                if (!fields) {
                    const obj = event.getData().toJSON();
                    fields = _.map(obj, (v, fieldName) => `${fieldName}`);
                }
                fields.forEach(fieldName => {
                    if (!mapEvent[fieldName]) {
                        mapEvent[fieldName] = [];
                    }
                    mapEvent[fieldName].push(event.getData().get(fieldName));
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
    static map(events, multiFieldSpec = "value") {
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
        }
        else if (_.isArray(multiFieldSpec)) {
            const fieldSpecList = multiFieldSpec;
            _.each(fieldSpecList, fieldSpec => {
                events.forEach(event => {
                    if (!_.has(result, fieldSpec)) {
                        result[fieldSpec] = [];
                    }
                    result[fieldSpec].push(event.get(fieldSpec));
                });
            });
        }
        else {
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
     * Returns the key this Event was constructed with
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
     * of type T.
     */
    getData() {
        return this.data;
    }
    /**
     * Returns the data associated with this event, which be
     * of type T.
     */
    setData(data) {
        return new Event(this.key, data);
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
    get(field) {
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
    set(field, value) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFFNUIsaUNBQThCO0FBQzlCLG1DQUF1QztBQUV2QyxpQ0FBb0M7QUFDcEMsMkNBQW1EO0FBSW5ELGlDQUEwQjtBQUUxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNHO0FBQ0gsV0FBa0MsU0FBUSxXQUFPO0lBMFM3QyxZQUFzQixHQUFNLEVBQVksSUFBZ0M7UUFDcEUsS0FBSyxFQUFFLENBQUM7UUFEVSxRQUFHLEdBQUgsR0FBRyxDQUFHO1FBQVksU0FBSSxHQUFKLElBQUksQ0FBNEI7SUFFeEUsQ0FBQztJQTNTRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFrQixFQUFFLE1BQWtCO1FBQ25ELE1BQU0sQ0FBQyxDQUNILE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ3pELE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQzVDLENBQUM7SUFDTixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ksTUFBTSxDQUFDLFdBQVcsQ0FDckIsTUFBa0IsRUFDbEIsTUFBa0IsRUFDbEIsZUFBd0IsSUFBSTtRQUU1QixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLENBQ0gsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQzVELENB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