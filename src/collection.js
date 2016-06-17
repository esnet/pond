/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";

import TimeRange from "./range";
import Event from "./event";
import BoundedIn from "./pipeline-in-bounded";
import { sum, avg, max, min, first, last, median, stdev } from "./functions";

/**
 * A collection is an abstraction for a bag of Events.
 *
 * You typically construct a Collection from a list of Events, which
 * may be either within an Immutable.List or an Array. You can also
 * copy another Collection or create an empty one.
 *
 * You can mutate a collection in a number of ways. In each instance
 * a new Collection will be returned.
 *
 * Basic operations on the list of events are also possible. You
 * can iterate over the collection with a for..of loop, get the size()
 * of the collection and access a specific element with at().
 *
 * You can also perform aggregations of the events, map them, filter them
 * clean them, etc.
 *
 * Collections form the backing structure for a TimeSeries, as well as
 * in Pipeline event processing. They are an instance of a BoundedIn, so
 * they can be used as a pipeline source.
 */
class Collection extends BoundedIn {

    /**
     * Construct a new Collection.
     *
     * @param  {Collection|array|Immutable.List}  arg1 Initial data for
     * the collection. If arg1 is another Collection, this will act as
     * a copy constructor.
     * @param  {Boolean} [arg2] When using a the copy constructor
     * this specified whether or not to also copy all the events in this
     * collection. Generally you'll want to let it copy the events.
     * If arg1 is an Immutable.List, then arg2 will specify the type of
     * the Events accepted into the Collection. This form is generally
     * used internally.
     *
     * @return {Collection} The constructed Collection.
     */
    constructor(arg1, arg2) {
        super();

        this._id = _.uniqueId("collection-");
        this._eventList = null;  // The events in this collection
        this._type = null;       // The type (class) of the events in this collection

        if (!arg1) {
            this._eventList = new Immutable.List();
        } else if (arg1 instanceof Collection) {
            const other = arg1;
            const copyEvents = arg2 || true;
            // copyEvents is whether to copy events from other, default is true
            if (_.isUndefined(copyEvents) || copyEvents === true) {
                this._eventList = other._eventList;
                this._type = other._type;
            } else {
                this._eventList = new Immutable.List();
            }
        } else if (_.isArray(arg1)) {
            const events = [];
            arg1.forEach(e => {
                this._check(e);
                events.push(e._d);
            });
            this._eventList = new Immutable.List(events);
        } else if (Immutable.List.isList(arg1)) {
            const type = arg2;
            if (!type) {
                throw new Error("No type supplied to Collection constructor");
            }
            this._type = type;
            this._eventList = arg1;
        }
    }

    /**
     * Returns the Collection as a regular JSON object.
     *
     * @return {Object} The JSON representation of this Collection
     */
    toJSON() {
        return this._eventList.toJS();
    }

    /**
     * Serialize out the Collection as a string. This will be the
     * string representation of `toJSON()`.
     *
     * @return {string} The Collection serialized as a string.
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the Event object type in this Collection.
     *
     * Since Collections may only have one type of event (`Event`, `IndexedEvent`
     * or `TimeRangeEvent`) this will return that type. If no events
     * have been added to the Collection it will return `undefined`.
     *
     * @return {Event|IndexedEvent|TimeRangeEvent} - The class of the type
     *                                               of events contained in
     *                                               this Collection.
     */
    type() {
        return this._type;
    }

    /**
     * Returns the number of events in this collection
     *
     * @return {number} Count of events
     */
    size() {
        return this._eventList.size;
    }

    /**
     * Returns the number of valid items in this collection.
     *
     * Uses the fieldSpec to look up values in all events.
     * It then counts the number that are considered valid, which
     * specifically are not NaN, undefined or null.
     *
     * @return {number} Count of valid events
     */
    sizeValid(fieldSpec = "value") {
        let count = 0;
        for (const e of this.events()) {
            if (Event.isValidValue(e, fieldSpec)) count++;
        }
        return count;
    }

    /**
     * Returns an event in the Collection by its position.
     * @example
     * ```
     * for (let row=0; row < series.size(); row++) {
     *   const event = series.at(row);
     *   console.log(event.toString());
     * }
     * ```
     * @param  {number} pos The position of the event
     * @return {Event|TimeRangeEvent|IndexedEvent}     Returns the
     * event at the pos specified.
     */
    at(pos) {
        const event = new this._type(this._eventList.get(pos));
        return event;
    }

    /**
     * Returns an event in the Collection by its time. This is the same
     * as calling `bisect` first and then using `at` with the index.
     *
     * @param  {Date} time The time of the event.
     * @return {Event|TimeRangeEvent|IndexedEvent}
     */
    atTime(time) {
        const pos = this.bisect(time);
        if (pos && pos < this.size()) {
            return this.at(pos);
        }
    }

    /**
     * Returns the first event in the Collection.
     *
     * @return {Event|TimeRangeEvent|IndexedEvent}
     */
    atFirst() {
        if (this.size()) {
            return this.at(0);
        }
    }

    /**
     * Returns the last event in the Collection.
     *
     * @return {Event|TimeRangeEvent|IndexedEvent}
     */
    atLast() {
        if (this.size()) {
            return this.at(this.size() - 1);
        }
    }

    /**
     * Returns the index that bisects the Collection at the time specified.
     *
     * @param  {Date}    t   The time to bisect the Collection with
     * @param  {number}  b   The position to begin searching at
     *
     * @return {number}      The row number that is the greatest, but still below t.
     */
    bisect(t, b) {
        const tms = t.getTime();
        const size = this.size();
        let i = b || 0;

        if (!size) {
            return undefined;
        }

        for (; i < size; i++) {
            const ts = this.at(i).timestamp().getTime();
            if (ts > tms) {
                return i - 1 >= 0 ? i - 1 : 0;
            } else if (ts === tms) {
                return i;
            }
        }
        return i - 1;
    }

    /**
     * Generator to return all the events in the Collection.
     *
     * @example
     * ```
     * for (let event of collection.events()) {
     *     console.log(event.toString());
     * }
     * ```
     */
    * events() {
        for (let i = 0; i < this.size(); i++) {
            yield this.at(i);
        }
    }

    setEvents(events) {
        const result = new Collection(this);
        result._eventList = events;
        return result;
    }

    /**
     * Returns the raw Immutable event list
     *
     * @return {Immutable.List} All events as an Immutable List.
     */
    eventList() {
        return this._eventList;
    }

    /**
     * Returns a Javascript array representation of the event list
     *
     * @return {Array} All events as a Javascript Array.
     */
    eventListAsArray() {
        const events = [];
        for (const e of this.events()) {
            events.push(e);
        }
        return events;
    }

    //
    // Sorting
    //

    sortByTime() {
        return this.setEvents(this._eventList.sortBy(event => {
            const e = new this._type(event);
            return e.timestamp().getTime();
        }));
    }

    //
    // Series range
    //

    /**
     * From the range of times, or Indexes within the TimeSeries, return
     * the extents of the TimeSeries as a TimeRange. This is currently implemented
     * by walking the events.
     *
     * @return {TimeRange} The extents of the TimeSeries
     */
    range() {
        let min;
        let max;
        for (const e of this.events()) {
            if (!min || e.begin() < min) min = e.begin();
            if (!max || e.end() > max) max = e.end();
        }
        if (min && max) return new TimeRange(min, max);
    }

    //
    // Collection mutation
    //

    /**
     * Adds an event to the collection, returns a new Collection. The event added
     * can be an Event, TimeRangeEvent or IndexedEvent, but it must be of the
     * same type as other events within the Collection.
     *
     * @param {Event|TimeRangeEvent|IndexedEvent} event The event being added.
     *
     * @return {Collection} A new, modified, Collection containing the new event.
     */
    addEvent(event) {
        this._check(event);
        const result = new Collection(this);
        result._eventList = this._eventList.push(event._d);
        return result;
    }

    /**
     * Perform a slice of events within the Collection, returns a new
     * Collection representing a portion of this TimeSeries from begin up to
     * but not including end.
     *
     * @param {Number} begin   The position to begin slicing
     * @param {Number} end     The position to end slicing
     *
     * @return {Collection}    The new, sliced, Collection.
     */
    slice(begin, end) {
        return new Collection(this._eventList.slice(begin, end), this._type);
    }

    /**
     * Filter the collection's event list with the supplied function
     *
     * @param {function} func The filter function, that should return
     *                        true or false when passed in an event.
     *
     * @return {Collection}   A new, filtered, Collection.
     */
    filter(filterFunc) {
        const filteredEventList = [];
        for (const e of this.events()) {
            if (filterFunc(e)) {
                filteredEventList.push(e);
            }
        }
        return new Collection(filteredEventList);
    }

    /**
     * Map the collection's event list to a new event list with
     * the supplied function.
     * @param {function} func The mapping function, that should return
     * a new event when passed in the old event.
     * @return {Collection} A new, modified, Collection.
     */
    map(mapFunc) {
        const result = [];
        for (const e of this.events()) {
            result.push(mapFunc(e));
        }
        return new Collection(result);
    }

    /**
     * Returns a new Collection by testing the fieldSpec
     * values for being valid (not NaN, null or undefined).
     *
     * The resulting Collection will be clean (for that fieldSpec).
     *
     * @param {string}      fieldSpec The field to test
     * @return {Collection}           A new, modified, Collection.
     */
    clean(fieldSpec = "value") {
        const fs = this._fieldSpecToArray(fieldSpec);
        const filteredEvents = [];
        for (const e of this.events()) {
            if (Event.isValidValue(e, fs)) {
                filteredEvents.push(e);
            }
        }
        return new Collection(filteredEvents);
    }

    //
    // Aggregate the event list to a single value
    //

    /**
     * Returns the number of events in this collection
     *
     * @return {number} The number of events
     */
    count() {
        return this.size();
    }

    /**
     * Returns the first value in the Collection for the fieldspec
     *
     * @param {string} fieldSpec The field to fetch
     *
     * @return {number} The first value
     */
    first(fieldSpec = "value") {
        return this.aggregate(first, fieldSpec);
    }

    /**
     * Returns the last value in the Collection for the fieldspec
     *
     * @param {string} fieldSpec The field to fetch
     *
     * @return {number} The last value
     */
    last(fieldSpec = "value") {
        return this.aggregate(last, fieldSpec);
    }

    /**
     * Returns the sum Collection for the fieldspec
     *
     * @param {string} fieldSpec The field to sum over the collection
     *
     * @return {number} The sum
     */
    sum(fieldSpec = "value") {
        return this.aggregate(sum, fieldSpec);
    }

    /**
     * Aggregates the events down to their average
     *
     * @param  {String} fieldSpec The field to average over the collection
     *
     * @return {number}           The average
     */
    avg(fieldSpec = "value") {
        return this.aggregate(avg, fieldSpec);
    }

    /**
     * Aggregates the events down to their maximum value
     *
     * @param  {String} fieldSpec The field to find the max within the collection
     *
     * @return {number}           The max value for the field
     */
    max(fieldSpec = "value") {
        return this.aggregate(max, fieldSpec);
    }

    /**
     * Aggregates the events down to their minimum value
     *
     * @param  {String} fieldSpec The field to find the min within the collection
     *
     * @return {number}           The min value for the field
     */
    min(fieldSpec = "value") {
        return this.aggregate(min, fieldSpec);
    }

    /**
     * Aggregates the events down to their mean (same as avg)
     *
     * @param  {String} fieldSpec The field to find the mean of within the collection
     *
     * @return {number}           The mean
     */
    mean(fieldSpec = "value") {
        return this.avg(fieldSpec);
    }

    /**
     * Aggregates the events down to their medium value
     *
     * @param  {String} fieldSpec The field to aggregate over
     *
     * @return {number}           The resulting median value
     */
    median(fieldSpec = "value") {
        return this.aggregate(median, fieldSpec);
    }

    /**
     * Aggregates the events down to their stdev
     *
     * @param  {String} fieldSpec The field to aggregate over
     *
     * @return {number}           The resulting stdev value
     */
    stdev(fieldSpec = "value") {
        return this.aggregate(stdev, fieldSpec);
    }

    /**
     * Aggregates the events down using a user defined function to
     * do the reduction.
     *
     * @param  {function} func    User defined reduction function. Will be
     *                            passed a list of values. Should return a
     *                            singe value.
     * @param  {String} fieldSpec The field to aggregate over
     *
     * @return {number}           The resulting value
     */
    aggregate(func, fieldSpec = "value") {
        const fs = this._fieldSpecToArray(fieldSpec);
        const result = Event.mapReduce(this.eventListAsArray(), [fs], func);
        return result[fs];
    }

    isChronological() {
        let result = true;
        let t;
        for (const e of this.events()) {
            if (!t) {
                t = e.timestamp().getTime();
            } else {
                if (e.timestamp() < t) {
                    result = false;
                }
                t = e.timestamp();
            }
        }
        return result;
    }

    /**
     * Internal function to take a fieldSpec and
     * return it as an array if it isn't already one. Using
     * arrays in inner loops is faster than splitting
     * a string repeatedly.
     *
     * @private
     */
    _fieldSpecToArray(fieldSpec) {
        if (_.isArray(fieldSpec)) {
            return fieldSpec;
        } else if (_.isString(fieldSpec)) {
            return fieldSpec.split(".");
        }
    }

    /**
     * STATIC
     */

     /**
      * Static function to compare two collections to each other. If the collections
      * are of the same instance as each other then equals will return true.
      *
      * @param  {Collection} collection1
      * @param  {Collection} collection2
      *
      * @return {bool} result
      */
    static equal(collection1, collection2) {
        return (collection1._type === collection2._type &&
                collection1._eventList === collection2._eventList);
    }

     /**
      * Static function to compare two collections to each other. If the collections
      * are of the same value as each other then equals will return true.
      *
      * @param  {Collection} collection1
      * @param  {Collection} collection2
      *
      * @return {bool} result
      */
    static is(collection1, collection2) {
        return (collection1._type === collection2._type &&
                Immutable.is(collection1._eventList, collection2._eventList));
    }
}

export default Collection;
