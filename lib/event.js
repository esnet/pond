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
 * An Event is a mapping from a time based key to a set
 * of unstuctured data.
 *
 * The key needs to be a sub-class of the `EventKey`, though
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
class Event {
    constructor(key, data) {
        this._key = key;
        this._data = _.isObject(data) ? Immutable.fromJS(data) : data;
    }
    /**
     * Returns the key this Event was constructed with
     */
    key() {
        return this._key;
    }
    /**
     * Returns the label of the key
     */
    keyType() {
        return this._key.type();
    }
    /**
     * Returns the data associated with this event as the
     * internal Immutable data structure
     */
    data() {
        return this._data;
    }
    get(field = ["value"]) {
        let v = this.data().getIn(util_1.default.fieldAsArray(field));
        if (v instanceof Immutable.Map ||
            v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }
    /**
     * Set a new value on the Event and return a new Event
     *
     * @param key The Event key, for example the Time of the Event
     * @param value The new value to set on the Event.
     *
     * @returns Event<T> The `Event` with modified data
     */
    set(key, value) {
        return new Event(this.key(), this._data.set(key, value));
    }
    isValid(f) {
        let invalid = false;
        const fieldList = _.isUndefined(f) || _.isArray(f) ? f : [f];
        fieldList.forEach(field => {
            const v = this.get(field);
            const invalid = (_.isUndefined(v) ||
                _.isNaN(v) ||
                _.isNull(v));
        });
        return !invalid;
    }
    // Public:
    toJSON() {
        return {
            [this.keyType()]: this.key().toJSON(),
            data: this.data()
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    timestamp() {
        return this.key().timestamp();
    }
    begin() {
        return this.key().begin();
    }
    end() {
        return this.key().end();
    }
    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses Immutable.is() to compare the event data and
     * the string representation of the key to compare those.
     */
    static is(event1, event2) {
        return (event1.key().toString() === event2.key().toString() &&
            Immutable.is(event1.data(), event2.data()));
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
            return event1.keyType() === event2.keyType() &&
                event1.key() === event2.key();
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
        const outEvents = [];
        _.each(eventMap, (perKeyEvents, key) => {
            let data = Immutable.Map();
            _.each(perKeyEvents, (event) => {
                data = mergeDeep ? data.mergeDeep(event.data())
                    : data.merge(event.data());
            });
            outEvents.push(new Event(keyMap[key], data));
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
    static combine(eventList, reducer, fieldSpec) {
        // Early exit
        if (eventList instanceof Immutable.List && eventList.size === 0) {
            return Immutable.List();
        }
        if (_.isArray(eventList) && eventList.length === 0) {
            return [];
        }
        // Type our events
        let events = [];
        if (eventList instanceof Immutable.List) {
            events = eventList.toArray();
        }
        else {
            events = eventList;
        }
        let fieldNames;
        if (_.isString(fieldSpec)) {
            fieldNames = [(fieldSpec)];
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
        const outEvents = [];
        _.each(eventMap, (perKeyEvents, key) => {
            const mapEvent = {};
            _.each(perKeyEvents, (event) => {
                let fields = fieldNames;
                if (!fields) {
                    fields = _.map(event.data().toJS(), (v, fieldName) => `${fieldName}`);
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
            outEvents.push(new Event(keyMap[key], data));
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
}
exports.default = Event;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0dBUUc7OztBQUVILDRCQUE0QjtBQUM1Qix1Q0FBdUM7QUFLdkMsaUNBQTBCO0FBTTFCOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0g7SUFPSSxZQUFZLEdBQU0sRUFBRSxJQUFTO1FBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNsRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxHQUFHO1FBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJO1FBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQWdCRCxHQUFHLENBQUMsUUFBYSxDQUFDLE9BQU8sQ0FBQztRQUN0QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksU0FBUyxDQUFDLEdBQUc7WUFDMUIsQ0FBQyxZQUFZLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7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