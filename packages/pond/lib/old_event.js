/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Immutable = require("immutable");
const util_1 = require("./util");
/**
There are three types of Events in Pond, while this class provides the base class
for them all:

1. *TimeEvent* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

Event contains several static methods that may be useful, though in general
are used by the Collection and TimeSeries classes. So, if you already have a
TimeSeries or Collection you may want to examine the API there to see if you
can do what you want to do.
*/
class Event {
    /**
     * Express the event as a string
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
    /**
     * Returns the type of this class instance
     */
    type() {
        return (this.constructor);
    }
    /**
     * Sets the data of the event in bulk and returns a new event of the
     * same type. The data passed in is a Javascript object.
     */
    setData(data) {
        const eventType = this.type();
        const d = this._d.set("data", util_1.default.dataFromArg(data));
        return new eventType(d);
    }
    /**
     * Access the event data in its native form. The result
     * will be an Immutable.Map.
     */
    data() {
        return this._d.get("data");
    }
    get(fieldSpec = ["value"]) {
        let v;
        if (_.isArray(fieldSpec)) {
            v = this.data().getIn(fieldSpec);
        }
        else if (_.isString(fieldSpec)) {
            const searchKeyPath = fieldSpec.split(".");
            v = this.data().getIn(searchKeyPath);
        }
        if (v instanceof Immutable.Map || v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }
    value(fieldSpec = ["value"]) {
        return this.get(fieldSpec);
    }
    /**
     * Collapses this event's columns, represented by the fieldSpecList
     * into a single column. The collapsing itself is done with the reducer
     * function. Optionally the collapsed column could be appended to the
     * existing columns, or replace them (the default).
     */
    collapse(fieldSpecList, columnName, reducer, append = false) {
        const data = append ? this.data().toJS() : {};
        const d = fieldSpecList.map(fs => this.get(fs));
        data[columnName] = reducer(d);
        return this.setData(data);
    }
    //
    // Static Event functions
    //
    /**
     * Do the two supplied events contain the same data,
     * even if they are not the same instance.
     * @param  {Event}  event1 First event to compare
     * @param  {Event}  event2 Second event to compare
     * @return {Boolean}       Result
     */
    static is(event1, event2) {
        return event1.key() === event2.key() &&
            Immutable.is(event1._d.get("data"), event2._d.get("data"));
    }
    /**
     * Returns if the two supplied events are duplicates
     * of each other. By default, duplicated means that the
     * timestamps are the same. This is the case with incoming events
     * where the second event is either known to be the same (but
     * duplicate) of the first, or supersedes the first. You can
     * also pass in false for ignoreValues and get a full
     * compare.
     *
     * @return {Boolean}              The result of the compare
     */
    static isDuplicate(event1, event2, ignoreValues = true) {
        if (ignoreValues) {
            return event1.type() === event2.type() &&
                event1.key() === event2.key();
        }
        else {
            return event1.type() === event2.type() && Event.is(event1, event2);
        }
    }
    /**
     * The same as Event.value() only it will return false if the
     * value is either undefined, NaN or Null.
     *
     * @param {Event} event The Event to check
     * @param {string|array} The field to check
     */
    static isValidValue(event, fieldPath) {
        const v = event.value(fieldPath);
        const invalid = _.isUndefined(v) || _.isNaN(v) || _.isNull(v);
        return !invalid;
    }
    /**
     * Function to select specific fields of an event using
     * a fieldPath and return a new event with just those fields.
     *
     * The fieldPath currently can be:
     *  * A single field name
     *  * An array of field names
     *
     * The function returns a new event.
     */
    static selector(event, fieldPath) {
        const data = {};
        if (_.isString(fieldPath)) {
            const fieldName = fieldPath;
            const value = event.get(fieldName);
            data[fieldName] = value;
        }
        else if (_.isArray(fieldPath)) {
            _.each(fieldPath, fieldName => {
                const value = event.get(fieldName);
                data[fieldName] = value;
            });
        }
        else {
            return event;
        }
        return event.setData(data);
    }
    static merge(events, deep) {
        if (events instanceof Immutable.List && events.size === 0 ||
            _.isArray(events) && events.length === 0) {
            return [];
        }
        //
        // Group by the time (the key), as well as keeping track
        // of the event types so we can check that for a given key
        // they are homogeneous and also so we can build an output
        // event for this key
        //
        const eventMap = {};
        const typeMap = {};
        events.forEach(e => {
            const type = e.type();
            const key = e.key();
            if (!_.has(eventMap, key)) {
                eventMap[key] = [];
            }
            eventMap[key].push(e);
            if (!_.has(typeMap, key)) {
                typeMap[key] = type;
            }
            else {
                if (typeMap[key] !== type) {
                    throw new Error(`Events for time ${key} are not homogeneous`);
                }
            }
        });
        //
        // For each key we'll build a new event of the same type as the source
        // events. Here we loop through all the events for that key, then for each field
        // we are considering, we get all the values and reduce them (sum, avg, etc).
        //
        const outEvents = [];
        _.each(eventMap, (events, key) => {
            let data = Immutable.Map();
            _.each(events, event => {
                data = deep
                    ? data.mergeDeep(event.data())
                    : data.merge(event.data());
            });
            const type = typeMap[key];
            outEvents.push(new type(key, data));
        });
        // This function outputs the same as its input. If we are
        // passed an Immutable.List of events, the user will get
        // an Immutable.List back. If an array, a simple JS array will
        // be returned.
        if (events instanceof Immutable.List) {
            return Immutable.List(outEvents);
        }
        return outEvents;
    }
    static combine(events, reducer, fieldSpec) {
        if (events instanceof Immutable.List && events.size === 0 ||
            _.isArray(events) && events.length === 0) {
            return [];
        }
        let fieldNames;
        if (_.isString(fieldSpec)) {
            fieldNames = [fieldSpec];
        }
        else if (_.isArray(fieldSpec)) {
            fieldNames = fieldSpec;
        }
        const eventMap = {};
        const typeMap = {};
        //
        // Group by the time (the key), as well as keeping track
        // of the event types so we can check that for a given key
        // they are homogeneous and also so we can build an output
        // event for this key
        //
        events.forEach(e => {
            const type = e.type();
            const key = e.key();
            if (!_.has(eventMap, key)) {
                eventMap[key] = [];
            }
            eventMap[key].push(e);
            if (!_.has(typeMap, key)) {
                typeMap[key] = type;
            }
            else {
                if (typeMap[key] !== type) {
                    throw new Error(`Events for time ${key} are not homogeneous`);
                }
            }
        });
        //
        // For each key we'll build a new event of the same type as the source
        // events. Here we loop through all the events for that key, then for each field
        // we are considering, we get all the values and reduce them (sum, avg, etc).
        //
        const outEvents = [];
        _.each(eventMap, (events, key) => {
            const mapEvent = {};
            _.each(events, event => {
                let fields = fieldNames;
                if (!fieldNames) {
                    fields = _.map(event.data().toJSON(), (value, fieldName) => fieldName);
                }
                fields.forEach(fieldName => {
                    if (!mapEvent[fieldName]) {
                        mapEvent[fieldName] = [];
                    }
                    mapEvent[fieldName].push(event.data().get(fieldName));
                });
            });
            const data = {};
            _.map(mapEvent, (values, fieldName) => {
                data[fieldName] = reducer(values);
            });
            const type = typeMap[key];
            outEvents.push(new type(key, data));
        });
        // This function outputs the same as its input. If we are
        // passed an Immutable.List of events, the user will get
        // an Immutable.List back. If an array, a simple JS array will
        // be returned.
        if (events instanceof Immutable.List) {
            return Immutable.List(outEvents);
        }
        return outEvents;
    }
    /**
     * Returns a function that will take a list of events and combine them
     * together using the fieldSpec and reducer function provided. This is
     * used as an event reducer for merging multiple TimeSeries together
     * with `timeSeriesListReduce()`.
     */
    static combiner(fieldSpec, reducer) {
        return events => Event.combine(events, reducer, fieldSpec);
    }
    /**
     * Returns a function that will take a list of events and merge them
     * together using the fieldSpec provided. This is used as a reducer for
     * merging multiple TimeSeries together with `timeSeriesListMerge()`.
     */
    static merger(fieldSpec) {
        return events => Event.merge(events, fieldSpec);
    }
    /**
     * Maps a list of events according to the fieldSpec
     * passed in. The spec maybe a single field name, a
     * list of field names, or a function that takes an
     * event and returns a key/value pair.
     *
     * @example
     * ````
     *         in   out
     *  3am    1    2
     *  4am    3    4
     *
     * Mapper result:  { in: [1, 3], out: [2, 4]}
     * ```
     * @param {string|array} fieldSpec  Column or columns to look up. If you need
     *                                  to retrieve multiple deep nested values that
     *                                  ['can.be', 'done.with', 'this.notation'].
     *                                  A single deep value with a string.like.this.
     *                                  If not supplied, all columns will be operated on.
     *                                  If field_spec is a function, the function should
     *                                  return a map. The keys will be come the
     *                                  "column names" that will be used in the map that
     *                                  is returned.
     */
    static map(evts, multiFieldSpec = "value") {
        const result = {};
        let events;
        if (evts instanceof Immutable.List) {
            events = evts;
        }
        else if (_.isArray(evts)) {
            events = new Immutable.List(evts);
        }
        else {
            throw new Error("Unknown event list type. Should be an array or Immutable List");
        }
        if (_.isString(multiFieldSpec)) {
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
            _.each(multiFieldSpec, fieldSpec => {
                events.forEach(event => {
                    if (!_.has(result, fieldSpec)) {
                        result[fieldSpec] = [];
                    }
                    result[fieldSpec].push(event.get(fieldSpec));
                });
            });
        }
        else if (_.isFunction(multiFieldSpec)) {
            events.forEach(event => {
                const pair = multiFieldSpec(event);
                _.each(pair, (value, key) => {
                    if (!_.has(result, key)) {
                        result[key] = [];
                    }
                    result[key].push(value);
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
     * Takes a list of events and a reducer function and returns
     * a new Event with the result, for each column. The reducer is
     * of the form:
     * ```
     *     function sum(valueList) {
     *         return calcValue;
     *     }
     * ```
     * @param {map}         mapped      A map, as produced from map()
     * @param {function}    reducer     The reducer function
     */
    static reduce(mapped, reducer) {
        const result = {};
        _.each(mapped, (valueList, key) => {
            result[key] = reducer(valueList);
        });
        return result;
    }
    /*
     * @param {array}        events     Array of event objects
     * @param {string|array} fieldSpec  Column or columns to look up. If you need
     *                                  to retrieve multiple deep nested values that
     *                                  ['can.be', 'done.with', 'this.notation'].
     *                                  A single deep value with a string.like.this.
     *                                  If not supplied, all columns will be operated on.
     * @param {function}     reducer    The reducer function
     */
    static mapReduce(events, multiFieldSpec, reducer) {
        return Event.reduce(this.map(events, multiFieldSpec), reducer);
    }
}
exports.default = Event;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xkX2V2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29sZF9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7R0FRRzs7O0FBRUgsNEJBQTRCO0FBQzVCLHVDQUF1QztBQUl2QyxpQ0FBMEI7QUFFMUI7Ozs7Ozs7Ozs7OztFQVlFO0FBQ0Y7SUFJSTs7T0FFRztJQUNILFFBQVE7UUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBT0Q7O09BRUc7SUFDSCxJQUFJO1FBQ0EsTUFBTSxDQUFzQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsT0FBTyxDQUFDLElBQVk7UUFDaEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxjQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJO1FBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFpQkQsR0FBRyxDQUFDLFlBQWlCLENBQUMsT0FBTyxDQUFDO1FBQzFCLElBQUksQ0FBQyxDQUFDO1FBQ04sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUFD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