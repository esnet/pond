/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import moment from "moment";
import _ from "underscore";
import Immutable from "immutable";

import Index from "./index";
import TimeRange from "./range";
import { sum, avg } from "./functions";

function timestampFromArg(arg) {
    if (_.isNumber(arg)) {
        return new Date(arg);
    } else if (_.isDate(arg)) {
        return new Date(arg.getTime());
    } else if (moment.isMoment(arg)) {
        return new Date(arg.valueOf());
    } else {
        throw new Error(`Unable to get timestamp from ${arg}. Should be a number, date, or moment.`);
    }
}

function timeRangeFromArg(arg) {
    if (arg instanceof TimeRange) {
        return arg;
    } else {
        throw new Error(`Unable to parse timerange. Should be a TimeRange.`);
    }
}

function indexFromArgs(arg1, arg2) {
    if (_.isString(arg1)) {
        return new Index(arg1, arg2 || true);
    } else if (arg1 instanceof Index) {
        return arg1;
    } else {
        throw new Error(`Unable to get index from ${arg1}. Should be a string or Index.`);
    }
}

function dataFromArg(arg) {
    let data;
    if (_.isObject(arg)) {
        // Deeply convert the data to Immutable Map
        data = new Immutable.fromJS(arg);
    } else if (data instanceof Immutable.Map) {
        // Copy reference to the data
        data = arg;
    } else if (_.isNumber(arg) || _.isString(arg)) {
        // Just add it to the value key of a new Map
        // e.g. new Event(t, 25); -> t, {value: 25}
        data = new Immutable.Map({value: arg});
    } else {
        throw new Error(`Unable to interpret event data from ${arg}.`);
    }
    return data;
}

function keyFromArg(arg) {
    if (_.isString(arg)) {
        return arg;
    } else if (_.isUndefined(arg) || _.isNull(arg)) {
        return "";
    } else {
        throw new Error(`Unable to get key from ${arg}. Should be a string.`);
    }
}


/**
 * A generic event
 *
 * This represents a data object at a single timestamp, supplied
 * at initialization.
 *
 * The timestamp may be a javascript Date object or a Moment, but is
 * stored internally as ms since UNIX epoch.
 *
 * The data may be any type.
 *
 * Asking the Event object for the timestamp returns an integer copy
 * of the number of ms since the UNIX epoch. There's no method on
 * the Event object to mutate the Event timestamp after it is created.
 */
export class Event {

    /**
     * The creation of an Event is done by combining two parts:
     * the timestamp (or time range, or Index...) and the data.
     *
     * To construct you specify the timestamp as either:
     *     - Javascript Date object
     *     - a Moment, or
     *     - millisecond timestamp: the number of ms since the UNIX epoch
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    constructor(arg1, arg2, arg3) {
        if (arg1 instanceof Event) {
            const other = arg1;
            this._d = other._d;
            return;
        }
        if (arg1 instanceof Immutable.Map &&
            arg1.has("time") && arg1.has("data") && arg1.has("key")) {
            this._d = arg1;
            return;
        }
        const time = timestampFromArg(arg1);
        const data = dataFromArg(arg2);
        const key = keyFromArg(arg3);
        this._d = new Immutable.Map({time, data, key});
    }

    /**
     * Returns the Event as a JSON object, essentially:
     *  {time: t, data: {key: value, ...}}
     * @return {Object} The event as JSON.
     */
    toJSON() {
        return {
            time: this.timestamp().getTime(),
            data: this.data().toJSON(),
            key: this.key()
        };
    }

    /**
     * Retruns the Event as a string, useful for serialization.
     * @return {string} The Event as a string
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * The timestamp of this data, in UTC time, as a string.
     * @return {string} Time of this data.
     */
    timestampAsUTCString() {
        return this.timestamp().toUTCString();
    }

    /**
     * The timestamp of this data, in Local time, as a string.
     * @return {string} Time of this data.
     */
    timestampAsLocalString() {
        return this.timestamp().toString();
    }

    /**
     * The timestamp of this data
     * @return {Date} Time of this data.
     */
    timestamp() {
        return this._d.get("time");
    }

    /**
     * Access the event data
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._d.get("data");
    }

    /**
     * Access the event key
     * @return {string} Key for the Event
     */
    key() {
        return this._d.get("key");
    }

    setKey(key) {
        const d = this._d.set("key", key);
        return new Event(d);
    }

    /**
     * Get specific data out of the Event. The data will be converted
     * to a Javascript object.
     * @param  {string} key Key to lookup, or "value" if not specified.
     * @return {Object}     The data associated with this key
     */
    get(key) {
        const k = key || "value";
        const v = this.data().get(k);
        if (v instanceof Immutable.Map || v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }

    value(key) {
        return this.get(key);
    }

    stringify() {
        return JSON.stringify(this.data());
    }

    /*
    fill(type, arg1, arg2) {
        if (type === "NaN") {
            const fixedValue = arg1;
            const fixedKey = arg2;
            const data = this._data.withMutations(d => {
                this._data.forEach((value, key) => {
                    if (_.isNaN(value) && (!fixedKey || fixedKey === key)) {
                        d.set(key, fixedValue);
                    }
                });
            });
            this._data = data;
            return this;
        } else {
            const msg = "Invalid fill type";
            throw new Error(msg);
        }
    }
    */

    static mergeEvents(events) {
        const t = events[0].timestamp();
        const data = {};
        _.each(events, event => {
            if (!event instanceof Event) {
                const msg = "Events being merged must have the same type";
                throw new Error(msg);
            }

            if (t.getTime() !== event.timestamp().getTime()) {
                const msg = "Events being merged must have the same timestamp";
                throw new Error(msg);
            }

            const d = event.toJSON().data;
            _.each(d, (val, key) => {
                if (_.has(data, key)) {
                    const msg =
                    `Events being merged may not have the same key '${key}'`;
                    throw new Error(msg);
                }
                data[key] = val;
            });
        });

        const e = new Event(t.getTime(), data);
        return e;
    }

    static mergeTimeRangeEvents(events) {
        const timerange = events[0].timerange();
        const data = {};
        _.each(events, event => {
            if (!event instanceof TimeRangeEvent) {
                const msg = "Events being merged must have the same type";
                throw new Error(msg);
            }

            if (timerange.toUTCString() !== event.timerange().toUTCString()) {
                const msg = "Events being merged must have the same timerange";
                throw new Error(msg);
            }

            const d = event.toJSON().data;
            _.each(d, (val, key) => {
                if (_.has(data, key)) {
                    const msg =
                    `Events being merged may not have the same key '${key}'`;
                    throw new Error(msg);
                }
                data[key] = val;
            });
        });

        return new TimeRangeEvent(timerange, data);
    }

    static mergeIndexedEvents(events) {
        const index = events[0].indexAsString();
        const data = {};
        _.each(events, event => {
            if (!event instanceof IndexedEvent) {
                throw new Error("Events being merged must have the same type");
            }

            if (index !== event.indexAsString()) {
                throw new Error("Events being merged must have the same index");
            }

            const d = event.toJSON().data;
            _.each(d, (val, key) => {
                if (_.has(data, key)) {
                    const msg =
                    `Events being merged may not have the same key '${key}'`;
                    throw new Error(msg);
                }
                data[key] = val;
            });
        });
        return new IndexedEvent(index, data);
    }

    static merge(events) {
        if (events.length < 1) {
            return;
        } else if (events.length === 1) {
            return events[0];
        }

        if (events[0] instanceof Event) {
            return Event.mergeEvents(events);
        } else if (events[0] instanceof TimeRangeEvent) {
            return Event.mergeTimeRangeEvents(events);
        } else if (events[0] instanceof IndexedEvent) {
            return Event.mergeIndexedEvents(events);
        }
    }

    /**
     * Combines multiple events with the same time together
     * to form a new event. Doesn't currently work on IndexedEvents
     * or TimeRangeEvents.
     */
    static combine(events, fieldSpec, reducer) {
        if (events.length < 1) {
            return;
        }
        const mapped = Event.map(events, (event) => {
            const mapEvent = {};
            // Which field do we want to work with
            let fieldNames = [];
            if (!fieldSpec) {
                fieldNames = _.map(event.data().toJSON(), (value, fieldName) => fieldName);
            } else if (_.isString(fieldSpec)) {
                fieldNames = [fieldSpec];
            } else if (_.isArray(fieldSpec)) {
                fieldNames = fieldSpec;
            }
            // Map the fields, along with the timestamp, to the value
            _.each(fieldNames, (fieldName) => {
                mapEvent[`${event.timestamp().getTime()}::${fieldName}`] =
                    event.data().get(fieldName);
            });

            return mapEvent;
        });
        const eventData = {};
        _.each(Event.reduce(mapped, reducer), (value, key) => {
            const [ timestamp, fieldName ] = key.split("::");
            if (!_.has(eventData, timestamp)) {
                eventData[timestamp] = {};
            }
            eventData[timestamp][fieldName] = value;
        });
        return _.map(eventData, (data, timestamp) => {
            return new Event(+timestamp, data);
        });
    }

    static sum(events, fieldSpec) {
        return Event.combine(events, fieldSpec, sum);
    }

    static avg(events, fieldSpec) {
        return Event.combine(events, fieldSpec, avg);
    }

    /**
     * Maps a list of events according to the selection
     * specification passed in. The spec maybe a single
     * field name, a list of field names, or a function
     * that takes an event and returns a key/value pair.
     *
     * Example 1:
     *         in   out
     *  3am    1    2
     *  4am    3    4
     *
     * Mapper result:  { in: [1, 3], out: [2, 4]}
     */
    static map(events, fieldSpec) {
        const result = {};

        if (_.isString(fieldSpec)) {
            const fieldName = fieldSpec;
            _.each(events, event => {
                if (!_.has(result, fieldName)) {
                    result[fieldName] = [];
                }
                const value = event.get(fieldName);
                result[fieldName].push(value);
            });
        } else if (_.isArray(fieldSpec)) {
            _.each(fieldSpec, fieldName => {
                _.each(events, event => {
                    if (!_.has(result, fieldName)) {
                        result[fieldName] = [];
                    }
                    result[fieldName].push(event.get(fieldName));
                });
            });
        } else if (_.isFunction(fieldSpec)) {
            _.each(events, event => {
                const pair = fieldSpec(event);
                _.each(pair, (value, key) => {
                    if (!_.has(result, key)) {
                        result[key] = [];
                    }
                    result[key].push(value);
                });
            });
        } else {
            _.each(events, event => {
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
     *     function sum(valueList) {
     *         return calcValue;
     *     }
     */
    static reduce(mapped, reducer) {
        const result = {};
        _.each(mapped, (valueList, key) => {
            result[key] = reducer(valueList);
        });
        return result;
    }

    static mapReduce(events, fieldSpec, reducer) {
        const mapped = this.map(events, fieldSpec);
        return Event.reduce(mapped, reducer);
    }
}

/**
 * A TimeRangeEvent uses a TimeRange to specify the range over
 * which the event occurs and maps that to a data object representing some
 * measurements or metrics during that time range.
 *
 * You supply the timerange as a TimeRange object.
 *
 * The data is also specified during construction and me be either:
 *  1) a Javascript object or simple type
 *  2) an Immutable.Map.
 *  3) Simple measurement
 *
 * If an Javascript object is provided it will be stored internally as an
 * Immutable Map. If the data provided is some other simple type (such as an
 * integer) then it will be equivalent to supplying an object of {value: data}.
 * Data may also be undefined.
 *
 * To get the data out of an TimeRangeEvent instance use `data()`.
 * It will return an Immutable.Map. Alternatively you can call `toJSON()`
 * to return a Javascript object representation of the data, while
 * `toString()` will serialize the event to a string.
 */
export class TimeRangeEvent {

    /**
     * The creation of an TimeRangeEvent is done by combining two parts:
     * the timerange and the data.
     *
     * To construct you specify a TimeRange, along with the data.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    constructor(arg1, arg2, arg3) {
        if (arg1 instanceof TimeRangeEvent) {
            const other = arg1;
            this._d = other._d;
            return;
        }
        const range = timeRangeFromArg(arg1);
        const data = dataFromArg(arg2);
        const key = keyFromArg(arg3);
        this._d = new Immutable.Map({range, data, key});
    }

    toJSON() {
        return {
            timerange: this.timerange().toJSON(),
            data: this.data().toJSON(),
            key: this.key()
        };
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    //
    // Access the timerange represented by the index
    //

    /**
     * The TimeRange of this data
     * @return {TimeRange} TimeRange of this data.
     */
    timerange() {
        return this._d.get("range");
    }

    /**
     * Access the event data
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._d.get("data");
    }

    /**
     * Access the event key
     * @return {string} Key for the Event
     */
    key() {
        return this._d.get("key");
    }

    /**
     * The TimeRange of this data, in UTC, as a string.
     * @return {string} TimeRange of this data.
     */
    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    /**
     * The TimeRange of this data, in Local time, as a string.
     * @return {string} TimeRange of this data.
     */
    timerangeAsLocalString() {
        return this.timerange().toLocalString();
    }

    /**
     * The begin time of this Event
     * @return {Data} Begin time
     */
    begin() {
        return this.timerange().begin();
    }

    /**
     * The end time of this Event
     * @return {Data} End time
     */
    end() {
        return this.timerange().end();
    }

    /**
     * Alias for the begin() time.
     * @return {Data} Time representing this Event
     */
    timestamp() {
        return this.begin();
    }

    humanizeDuration() {
        return this.timerange().humanizeDuration();
    }

    /**
     * Get specific data out of the Event
     * @param  {string} key Key to lookup, or "value" if not specified.
     * @return {Object}     The data associated with this key
     */
    get(key) {
        const k = key || "value";
        const v = this.data().get(k);
        if (v instanceof Immutable.Map || v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }

    value(key) {
        return this.get(key);
    }
}

/**
 * An IndexedEvent uses an Index to specify a timerange over which the event
 * occurs and maps that to a data object representing some measurement or metric
 * during that time range.
 *
 * You can supply the index as a string or as an Index object.
 *
 * Example Indexes are:
 *     - 1d-1565 is the entire duration of the 1565th day since the UNIX epoch
 *     - 2014-03 is the entire duration of march in 2014
 *
 * The range, as expressed by the Index, is provided by the convenience method
 * `range()`, which returns a TimeRange instance. Alternatively the begin
 * and end times represented by the Index can be found with `begin()`
 * and `end()` respectively.
 *
 * The data is also specified during construction, and is generally expected to
 * be an object or an Immutable.Map. If an object is provided it will be stored
 * internally as an ImmutableMap. If the data provided is some other type then
 * it will be equivalent to supplying an object of `{value: data}`. Data may be
 * undefined.
 *
 * The get the data out of an IndexedEvent instance use `data()`. It will return
 * an Immutable.Map.
 */
export class IndexedEvent {

    /**
     * The creation of an IndexedEvent is done by combining two parts:
     * the Index and the data.
     *
     * To construct you specify an Index, along with the data.
     *
     * The index may be an Index, or a string.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    constructor(arg1, arg2, arg3, arg4) {
        if (arg1 instanceof IndexedEvent) {
            const other = arg1;
            this._d = other._d;
            return;
        }
        const index = indexFromArgs(arg1, arg3);
        const data = dataFromArg(arg2);
        const key = keyFromArg(arg4);
        this._d = new Immutable.Map({index, data, key});
    }

    toJSON() {
        return {
            index: this.indexAsString(),
            data: this.data().toJSON(),
            key: this.key()
        };
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the Index associated with the data in this Event
     * @return {Index} The Index
     */
    index() {
        return this._d.get("index");
    }

    /**
     * Access the event data
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._d.get("data");
    }

    /**
     * Access the event data
     * @return {string} Key for the Event
     */
    key() {
        return this._d.get("key");
    }

    /**
     * Returns the Index as a string, same as event.index().toString()
     * @return {string} The Index
     */
    indexAsString() {
        return this.index().asString();
    }

    /**
     * The TimeRange of this data, in UTC, as a string.
     * @return {string} TimeRange of this data.
     */
    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    /**
     * The TimeRange of this data, in Local time, as a string.
     * @return {string} TimeRange of this data.
     */
    timerangeAsLocalString() {
        return this.timerange().toLocalString();
    }

    /**
     * The TimeRange of this data
     * @return {TimeRange} TimeRange of this data.
     */
    timerange() {
        return this.index().asTimerange();
    }

    /**
     * The begin time of this Event
     * @return {Data} Begin time
     */
    begin() {
        return this.timerange().begin();
    }

    /**
     * The end time of this Event
     * @return {Data} End time
     */
    end() {
        return this.timerange().end();
    }

    /**
     * Alias for the begin() time.
     * @return {Data} Time representing this Event
     */
    timestamp() {
        return this.begin();
    }

    /**
     * Get specific data out of the Event
     * @param  {string} key Key to lookup, or "value" if not specified.
     * @return {Object}     The data associated with this key
     */
    get(key) {
        const k = key || "value";
        const v = this.data().get(k);
        if (v instanceof Immutable.Map || v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }

    value(key) {
        return this.get(key);
    }
}
