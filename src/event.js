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

import IndexedEvent from "./indexedevent";
import TimeRangeEvent from "./timerangeevent";
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

/**
There are three types of Events in Pond:

1. *Event* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

### Construction

The creation of an Event is done by combining two parts: the timestamp (or time range, or Index...) and the data, along with an optional key which is described below.

 * For a basic `Event`, you specify the timestamp as either a Javascript Date object, a Moment, or the number of milliseconds since the UNIX epoch.

 * For a `TimeRangeEvent`, you specify a TimeRange, along with the data.

 * For a `IndexedEvent`, you specify an Index, along with the data, and if the event should be considered to be in UTC time or not.

To specify the data you can supply:

 * a Javascript object of key/values. The object may contained nested data.

 * an Immutable.Map

 * a simple type such as an integer. This is a shorthand for supplying {"value": v}.

**Example:**

Given some source of data that looks like this:

```json
const sampleEvent = {
    "start_time": "2015-04-22T03:30:00Z",
    "end_time": "2015-04-22T13:00:00Z",
    "description": "At 13:33 pacific circuit 06519 went down.",
    "title": "STAR-CR5 - Outage",
    "completed": true,
    "external_ticket": "",
    "esnet_ticket": "ESNET-20150421-013",
    "organization": "Internet2 / Level 3",
    "type": "U"
}
```

We first extract the begin and end times to build a TimeRange:

```js
let b = new Date(sampleEvent.start_time);
let e = new Date(sampleEvent.end_time);
let timerange = new TimeRange(b, e);
```

Then we combine the TimeRange and the event itself to create the Event.

```js
let outageEvent = new TimeRangeEvent(timerange, sampleEvent);
```

Once we have an event we can get access the time range with:

```js
outageEvent.begin().getTime()   // 1429673400000
outageEvent.end().getTime())    // 1429707600000
outageEvent.humanizeDuration()) // "10 hours"
```

And we can access the data like so:

```js
outageEvent.get("title")  // "STAR-CR5 - Outage"
```

Or use:

```js
outageEvent.data()
```

to fetch the whole data object, which will be an Immutable Map.
*/
class Event {

    /**
     * The creation of an Event is done by combining two parts:
     * the timestamp and the data.
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
    constructor(arg1, arg2) {
        if (arg1 instanceof Event) {
            const other = arg1;
            this._d = other._d;
            return;
        }
        if (arg1 instanceof Immutable.Map &&
            arg1.has("time") && arg1.has("data")) {
            this._d = arg1;
            return;
        }
        const time = timestampFromArg(arg1);
        const data = dataFromArg(arg2);
        this._d = new Immutable.Map({time, data});
    }

    /**
     * Returns the Event as a JSON object, essentially:
     *  {time: t, data: {key: value, ...}}
     * @return {Object} The event as JSON.
     */
    toJSON() {
        return {
            time: this.timestamp().getTime(),
            data: this.data().toJSON()
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
     * Returns a flat array starting with the timestamp, followed by the values.
     */
    toPoint() {
        return [this.timestamp().getTime(), ..._.values(this.data().toJSON())];
    }

    /**
     * The timestamp of this data, in UTC time, as a string.
     */
    timestampAsUTCString() {
        return this.timestamp().toUTCString();
    }

    /**
     * The timestamp of this data, in Local time, as a string.
     */
    timestampAsLocalString() {
        return this.timestamp().toString();
    }

    /**
     * The timestamp of this data
     */
    timestamp() {
        return this._d.get("time");
    }

    /**
     * The begin time of this Event, which will be just the timestamp
     */
    begin() {
        return this.timestamp();
    }

    /**
     * The end time of this Event, which will be just the timestamp
     */
    end() {
        return this.timestamp();
    }

    /**
     * Direct access to the event data. The result will be an Immutable.Map.
     */
    data() {
        return this._d.get("data");
    }

    /**
     * Sets the data portion of the event and returns a new Event.
     */
    setData(data) {
        const d = this._d.set("data", dataFromArg(data));
        return new Event(d);
    }

    /**
     * Get specific data out of the Event. The data will be converted
     * to a js object. You can use a fieldSpec to address deep data.
     * A fieldSpec could be "a.b"
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
     * Alias for get()
     */
    value(fieldSpec) {
        return this.get(fieldSpec);
    }

    stringify() {
        return JSON.stringify(this.data());
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

    static is(event1, event2) {
        return Immutable.is(event1._d, event2._d);
    }

    /**
     * The same as Event.value() only it will return false if the
     * value is either undefined, NaN or Null.
     */
    static isValidValue(event, fieldSpec = "value") {
        const v = event.value(fieldSpec);
        const invalid = (_.isUndefined(v) || _.isNaN(v) || _.isNull(v));
        return !invalid;
    }

    /**
     * Function to select specific fields of an event using
     * a fieldSpec and return a new event with just those fields.
     *
     * The fieldSpec currently can be:
     *  * A single field name
     *  * An array of field names
     *
     * The function returns a new event.
     */
    static selector(event, fieldSpec) {
        const data = {};
        if (_.isString(fieldSpec)) {
            const fieldName = fieldSpec;
            const value = event.get(fieldName);
            data[fieldName] = value;
        } else if (_.isArray(fieldSpec)) {
            _.each(fieldSpec, fieldName => {
                const value = event.get(fieldName);
                data[fieldName] = value;
            });
        } else {
            return event;
        }
        return event.setData(data);
    }

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
        const mapped = Event.map(events, event => {
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
            _.each(fieldNames, fieldName => {
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

    /**
     * Sum takes multiple events of the same time and uses
     * combine() to add them together
     */
    static sum(events, fieldSpec) {
        // Since all the events should be of the same time
        // we can just take the first result from combine
        let t;
        events.forEach(e => {
            if (!t) t = e.timestamp().getTime();
            if (t !== e.timestamp().getTime()) {
                throw new Error("sum() expects all events to have the same timestamp");
            }
        });

        return Event.combine(events, fieldSpec, sum)[0];
    }

    /**
     * Avg takes multiple events of the same time and uses
     * combine() to avg them
     */
    static avg(events, fieldSpec) {
        return Event.combine(events, fieldSpec, avg)[0];
    }

    /**
     * Maps a list of events according to the fieldSpec
     * passed in. The spec maybe a single field name, a
     * list of field names, or a function that takes an
     * event and returns a key/value pair.
     *
     * Example 1:
     *         in   out
     *  3am    1    2
     *  4am    3    4
     *
     * Mapper result:  { in: [1, 3], out: [2, 4]}
     */
    static map(evts, multiFieldSpec = "value") {
        const result = {};

        let events;
        if (evts instanceof Immutable.List) {
            events = evts;
        } else if (_.isArray(evts)) {
            events = new Immutable.List(evts);
        } else {
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

    static mapReduce(events, multiFieldSpec, reducer) {
        return Event.reduce(this.map(events, multiFieldSpec), reducer);
    }
}

export default Event;
