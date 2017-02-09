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

import Bounded from "./io/bounded";
import Event from "./event";
import TimeRange from "./timerange";

import util from "./base/util";
import {
    sum,
    avg,
    max,
    min,
    first,
    last,
    median,
    stdev,
    percentile
} from "./base/functions";

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
class Collection extends Bounded {
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
        this._eventList = null;
        // The events in this collection
        this._type = null;

        // The type (class) of the events in this collection
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
     * @return {Event} - The class of the type of events contained in
     *                   this Collection.
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
     * Uses the fieldPath to look up values in all events.
     * It then counts the number that are considered valid, which
     * specifically are not NaN, undefined or null.
     *
     * @return {number} Count of valid events
     */
    sizeValid(fieldPath = "value") {
        let count = 0;
        for (const e of this.events()) {
            if (Event.isValidValue(e, fieldPath)) count++;
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
     * @return {Event}      Returns the event at the pos specified.
     */
    at(pos) {
        if (this._eventList.size > 0) {
            const event = new this._type(this._eventList.get(pos));
            return event;
        }
    }

    /**
     * Returns a list of events in the Collection which have
     * the exact key (time, timerange or index) as the key specified
     * by 'at'. Note that this is an O(n) search for the time specified,
     * since collections are an unordered bag of events.
     *
     * @param  {Date|string|TimeRange} key The key of the event.
     * @return {Array} All events at that key
     */
    atKey(k) {
        const result = [];
        let key;
        if (k instanceof Date) {
            key = k.getTime();
        } else if (_.isString(k)) {
            key = k;
        } else if (k instanceof TimeRange) {
            key = `${this.timerange().begin()},${this.timerange().end()}`;
        }
        for (const e of this.events()) {
            if (e.key() === key) {
                result.push(e);
            }
        }
        return result;
    }

    /**
     * Returns the first event in the Collection.
     *
     * @return {Event}
     */
    atFirst() {
        if (this.size()) {
            return this.at(0);
        }
    }

    /**
     * Returns the last event in the Collection.
     *
     * @return {Event}
     */
    atLast() {
        if (this.size()) {
            return this.at(this.size() - 1);
        }
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
    *events() {
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

    /**
     * Returns the events in the collection as a Javascript Map, where
     * the key is the timestamp, index or timerange and the
     * value is an array of events with that key.
     *
     * @return {map} The map of events
     */
    eventListAsMap() {
        const events = {};
        for (const e of this.events()) {
            const key = e.key();
            if (!_.has(events, key)) {
                events[key] = [];
            }
            events[key].push(e);
        }
        return events;
    }

    //
    // De-duplicate
    //
    /**
     * Removes duplicates from the Collection. If duplicates
     * exist in the collection with the same key but with different
     * values, then later event values will be used.
     *
     * @return {Collection} The sorted Collection.
     */
    dedup() {
        const events = Event.merge(this.eventListAsArray());
        return new Collection(events);
    }

    //
    // Sorting
    //
    /**
     * Sorts the Collection by the timestamp. In the case
     * of TimeRangeEvents and IndexedEvents, it will be sorted
     * by the begin time. This is useful when the collection
     * will be passed into a TimeSeries.
     *
     * See also isChronological().
     *
     * @return {Collection} The sorted Collection
     */
    sortByTime() {
        const sorted = this._eventList.sortBy(event => {
            const e = new this._type(event);
            return e.timestamp().getTime();
        });
        return this.setEvents(sorted);
    }

    /**
     * Sorts the Collection using the value referenced by
     * the fieldPath.
     *
     * @return {Collection} The extents of the Collection
     */
    sort(fieldPath) {
        const fs = util.fieldPathToArray(fieldPath);
        const sorted = this._eventList.sortBy(event => {
            const e = new this._type(event);
            return e.get(fs);
        });
        return this.setEvents(sorted);
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
     * @param {Event} event The event being added.
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
     *
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
     * Returns a new Collection by testing the fieldPath
     * values for being valid (not NaN, null or undefined).
     *
     * The resulting Collection will be clean (for that fieldPath).
     *
     * @param  {string}      fieldPath  Name of value to look up. If not supplied,
     *                                  defaults to ['value']. "Deep" syntax is
     *                                  ['deep', 'value'] or 'deep.value'
     *
     * @return {Collection}             A new, modified, Collection.
     */
    clean(fieldPath) {
        const fs = util.fieldPathToArray(fieldPath);
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
     * @param {string} fieldPath  Column to find the first value of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The first value
     */
    first(fieldPath, filter) {
        return this.aggregate(first(filter), fieldPath);
    }

    /**
     * Returns the last value in the Collection for the fieldspec
     *
     * @param {string} fieldPath  Column to find the last value of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The last value
     */
    last(fieldPath, filter) {
        return this.aggregate(last(filter), fieldPath);
    }

    /**
     * Returns the sum of the Collection for the fieldspec
     *
     * @param {string} fieldPath  Column to find the sum of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The sum
     */
    sum(fieldPath, filter) {
        return this.aggregate(sum(filter), fieldPath);
    }

    /**
     * Aggregates the events down to their average(s)
     *
     * @param {string} fieldPath  Column to find the avg of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The average
     */
    avg(fieldPath, filter) {
        return this.aggregate(avg(filter), fieldPath);
    }

    /**
     * Aggregates the events down to their maximum value
     *
     * @param {string} fieldPath  Column to find the max of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The max value for the field
     */
    max(fieldPath, filter) {
        return this.aggregate(max(filter), fieldPath);
    }

    /**
     * Aggregates the events down to their minimum value
     *
     * @param {string} fieldPath  Column to find the min of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The min value for the field
     */
    min(fieldPath, filter) {
        return this.aggregate(min(filter), fieldPath);
    }

    /**
     * Aggregates the events down to their mean (same as avg)
     *
     * @param {string} fieldPath  Column to find the mean of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The mean
     */
    mean(fieldPath, filter) {
        return this.avg(fieldPath, filter);
    }

    /**
     * Aggregates the events down to their minimum value
     *
     * @param {string} fieldPath  Column to find the median of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The median value
     */
    median(fieldPath, filter) {
        return this.aggregate(median(filter), fieldPath);
    }

    /**
     * Aggregates the events down to their stdev
     *
     * @param {string} fieldPath  Column to find the stdev of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The resulting stdev value
     */
    stdev(fieldPath, filter) {
        return this.aggregate(stdev(filter), fieldPath);
    }

    /**
     * Gets percentile q within the Collection. This works the same way as numpy.
     *
     * @param  {integer} q        The percentile (should be between 0 and 100)
     *
     * @param {string} fieldPath  Column to find the percentile of. A deep value can be referenced with a
     *                            string.like.this.  If not supplied the `value` column will be
     *                            aggregated.
     *
     * @param  {string} interp    Specifies the interpolation method
     *                            to use when the desired quantile lies between
     *                            two data points. Options are:
     *                            options are:
     *                             * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
     *                             * lower: i.
     *                             * higher: j.
     *                             * nearest: i or j whichever is nearest.
     *                             * midpoint: (i + j) / 2.
     * @param {function} filter   Optional filter function used to clean data before aggregating
     *
     * @return {number}           The percentile
     */
    percentile(q, fieldPath, interp = "linear", filter) {
        return this.aggregate(percentile(q, interp, filter), fieldPath);
    }

    /**
     * Aggregates the events down using a user defined function to
     * do the reduction.
     *
     * @param  {function} func    User defined reduction function. Will be
     *                            passed a list of values. Should return a
     *                            singe value.
     *
     * @param  {String} fieldPath The field to aggregate over
     *
     * @return {number}           The resulting value
     */
    aggregate(func, fieldPath, options = {}) {
        let fpath;
        if (!_.isFunction(func)) {
            throw new Error("First arg to aggregate() must be a function");
        }

        if (_.isString(fieldPath)) {
            fpath = fieldPath;
        } else if (_.isArray(fieldPath)) {
            // if the ['array', 'style', 'fieldpath'] is being used,
            // we need to turn it back into a string since we are
            // using a subset of the the map() functionality on
            // a single column
            fpath = fieldPath.split(".");
        } else if (_.isUndefined(fieldPath)) {
            // map() needs a field name to use as a key. Normally
            // this case is normally handled by _field_spec_to_array()
            // inside get(). Also, if map(func, field_spec=None) then
            // it will map all the columns.
            fpath = "value";
        } else {
            throw new Error(
                "Collection.aggregate() takes a string/array fieldPath"
            );
        }

        const result = Event.mapReduce(
            this.eventListAsArray(),
            fpath,
            func,
            options
        );
        return result[fpath];
    }

    /**
     * Gets n quantiles within the Collection. This works the same way as numpy.
     *
     * @param  {integer} n        The number of quantiles to divide the
     *                            Collection into.
     *
     * @param  {string} column    The field to return as the quantile
     *
     * @param  {string} interp    Specifies the interpolation method
     *                            to use when the desired quantile lies between
     *                            two data points. Options are:
     *                            options are:
     *                             * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
     *                             * lower: i.
     *                             * higher: j.
     *                             * nearest: i or j whichever is nearest.
     *                             * midpoint: (i + j) / 2.
     *
     * @return {array}            An array of n quantiles
     */
    quantile(n, column = "value", interp = "linear") {
        const results = [];
        const sorted = this.sort(column);
        const subsets = 1.0 / n;

        if (n > this.length) {
            throw new Error("Subset n is greater than the Collection length");
        }

        for (let i = subsets; i < 1; i += subsets) {
            const index = Math.floor((sorted.size() - 1) * i);
            if (index < sorted.size() - 1) {
                const fraction = (sorted.size() - 1) * i - index;
                const v0 = sorted.at(index).get(column);
                const v1 = sorted.at(index + 1).get(column);
                let v;

                if (interp === "lower" || fraction === 0) {
                    v = v0;
                } else if (interp === "linear") {
                    v = v0 + (v1 - v0) * fraction;
                } else if (interp === "higher") {
                    v = v1;
                } else if (interp === "nearest") {
                    v = fraction < 0.5 ? v0 : v1;
                } else if (interp === "midpoint") {
                    v = (v0 + v1) / 2;
                }

                results.push(v);
            }
        }
        return results;
    }

    /**
     * Returns true if all events in this Collection are in chronological order.
     * @return {Boolean} True if all events are in order, oldest events to newest.
     */
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
        return collection1._type === collection2._type &&
            collection1._eventList === collection2._eventList;
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
        return collection1._type === collection2._type &&
            Immutable.is(collection1._eventList, collection2._eventList);
    }
}

export default Collection;
