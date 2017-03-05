/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";
import util from "./base/util";

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
    constructor() {
        if (this.constructor.name === "Event") {
            throw new TypeError("Cannot construct Event instances directly");
        }
    }

    /**
     * Express the event as a string
     */
    toString() {
        if (this.toJSON === undefined) {
            throw new TypeError("Must implement toJSON()");
        }
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the type of this class instance
     */
    type() {
        return this.constructor;
    }

    /**
     * Sets the data of the event and returns a new event of the
     * same type.
     *
     * @param {object}  data    New data for the event
     * @return {object}         A new event
     */
    setData(data) {
        const eventType = this.type();
        const d = this._d.set("data", util.dataFromArg(data));
        return new eventType(d);
    }

    /**
     * Access the event data in its native form. The result
     * will be an Immutable.Map.
     *
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._d.get("data");
    }

    /**
     * Get specific data out of the event. The data will be converted
     * to a JS Object. You can use a `fieldSpec` to address deep data.
     * A `fieldSpec` could be "a.b"
     */
    get(fieldSpec = ["value"]) {
        let v;
        if (_.isArray(fieldSpec)) {
            v = this.data().getIn(fieldSpec);
        } else if (_.isString(fieldSpec)) {
            const searchKeyPath = fieldSpec.split(".");
            v = this.data().getIn(searchKeyPath);
        }

        if (v instanceof Immutable.Map || v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }

    /**
     * Alias for `get()`.
     */
    value(fieldSpec = ["value"]) {
        return this.get(fieldSpec);
    }

    /**
     * Collapses this event's columns, represented by the fieldSpecList
     * into a single column. The collapsing itself is done with the reducer
     * function. Optionally the collapsed column could be appended to the
     * existing columns, or replace them (the default).
     */
    collapse(fieldSpecList, name, reducer, append = false) {
        const data = append ? this.data().toJS() : {};
        const d = fieldSpecList.map(fs => this.get(fs));
        data[name] = reducer(d);
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
        } else {
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
        } else if (_.isArray(fieldPath)) {
            _.each(fieldPath, fieldName => {
                const value = event.get(fieldName);
                data[fieldName] = value;
            });
        } else {
            return event;
        }
        return event.setData(data);
    }

    /**
     * Merges multiple `events` together into a new array of events, one
     * for each time/index/timerange of the source events. Merging is done on
     * the data of each event. Values from later events in the list overwrite
     * early values if fields conflict.
     *
     * Common use cases:
     *   - append events of different timestamps
     *   - merge in events with one field to events with another
     *   - merge in events that supersede the previous events
     *
     * See also: TimeSeries.timeSeriesListMerge()
     *
     * @param {Immutable.List|array} events  Array or Immutable.List of events
     *
     * @return {Immutable.List|array}        Array or Immutable.List of events
     */
    static merge(events, deep) {
        if (
            events instanceof Immutable.List && events.size === 0 ||
                _.isArray(events) && events.length === 0
        ) {
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
            } else {
                if (typeMap[key] !== type) {
                    throw new Error(
                        `Events for time ${key} are not homogeneous`
                    );
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
            events.forEach(event => {
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

    /**
     * Combines multiple `events` together into a new array of events, one
     * for each time/index/timerange of the source events. The list of
     * events may be specified as an array or `Immutable.List`. Combining acts
     * on the fields specified in the `fieldSpec` and uses the reducer
     * function to take the multiple values and reducer them down to one.
     *
     * The return result will be an of the same form as the input. If you
     * pass in an array of events, you will get an array of events back. If
     * you pass an `Immutable.List` of events then you will get an
     * `Immutable.List` of events back.
     *
     * This is the general version of `Event.sum()` and `Event.avg()`. If those
     * common use cases are what you want, just use those functions. If you
     * want to specify your own reducer you can use this function.
     *
     * See also: `TimeSeries.timeSeriesListSum()`
     *
     * @param {Immutable.List|array} events     Array of event objects
     * @param {string|array}         fieldSpec  Column or columns to look up. If you need
     *                                          to retrieve multiple deep nested values that
     *                                          ['can.be', 'done.with', 'this.notation'].
     *                                          A single deep value with a string.like.this.
     *                                          If not supplied, all columns will be operated on.
     * @param {function}             reducer    Reducer function to apply to column data.
     *
     * @return {Immutable.List|array}   An Immutable.List or array of events
     */
    static combine(events, reducer, fieldSpec) {
        if (
            events instanceof Immutable.List && events.size === 0 ||
                _.isArray(events) && events.length === 0
        ) {
            return [];
        }

        let fieldNames;
        if (_.isString(fieldSpec)) {
            fieldNames = [fieldSpec];
        } else if (_.isArray(fieldSpec)) {
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
            } else {
                if (typeMap[key] !== type) {
                    throw new Error(
                        `Events for time ${key} are not homogeneous`
                    );
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
            events.forEach(event => {
                let fields = fieldNames;
                if (!fieldNames) {
                    fields = _.map(
                        event.data().toJSON(),
                        (value, fieldName) => fieldName
                    );
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
        } else if (_.isArray(evts)) {
            events = new Immutable.List(evts);
        } else {
            throw new Error(
                "Unknown event list type. Should be an array or Immutable List"
            );
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
        } else if (_.isArray(multiFieldSpec)) {
            _.each(multiFieldSpec, fieldSpec => {
                events.forEach(event => {
                    if (!_.has(result, fieldSpec)) {
                        result[fieldSpec] = [];
                    }
                    result[fieldSpec].push(event.get(fieldSpec));
                });
            });
        } else if (_.isFunction(multiFieldSpec)) {
            events.forEach(event => {
                const pair = multiFieldSpec(event);
                _.each(pair, (value, key) => {
                    if (!_.has(result, key)) {
                        result[key] = [];
                    }
                    result[key].push(value);
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

export default Event;
