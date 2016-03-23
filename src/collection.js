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
import { Event } from "./event";
import { BoundedIn } from "./in";

/**
 * A collection is a list of Events. You can construct one out of either
 * another collection, or a list of Events. You can addEvent() to a collection
 * and a new collection will be returned.
 *
 * Basic operations on the list of events are also possible. You
 * can iterate over the collection with a for..of loop, get the size()
 * of the collection and access a specific element with at().
 */
export default class Collection extends BoundedIn {

    constructor(arg1, copyEvents = true) {
        super();

        this._id = _.uniqueId("collection-");
        this._eventList = null;  // The events in this collection
        this._type = null;       // The type (class) of the events in this collection

        if (!arg1) {
            this._eventList = new Immutable.List();
        } else if (arg1 instanceof Collection) {
            const other = arg1;
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
            this._eventList = arg1;
        }
    }

    toJSON() {
        return this._eventList.toJS();
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the Event object type in this collection
     */
    type() {
        return this._type;
    }

    /**
     * Returns the number of items in this collection
     */
    size() {
        return this._eventList.size;
    }

    /**
     * Returns the number of valid items in this collection.
     *
     * Uses the fieldName and optionally a function passed in
     * to look up values in all events. It then counts the number
     * that are considered valid, i.e. are not NaN, undefined or null.
     */
    sizeValid(fieldSpec = "value") {
        let count = 0;
        for (const e of this.events()) {
            if (Event.isValidValue(e, fieldSpec)) count++;
        }
        return count;
    }

    /**
     * Returns an item in the collection by its position
     */
    at(pos) {
        const event = new this._type(this._eventList.get(pos));
        return event;
    }

    atTime(time) {
        const pos = this.bisect(time);
        if (pos && pos < this.size()) {
            return this.at(pos);
        }
    }

    atFirst() {
        if (this.size()) {
            return this.at(0);
        }
    }

    atLast() {
        if (this.size()) {
            return this.at(this.size() - 1);
        }
    }

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

    * events() {
        for (let i = 0; i < this.size(); i++) {
            yield this.at(i);
        }
    }

    eventList() {
        return this._eventList;
    }


    //
    // Series range
    //

    /**
     * From the range of times, or Indexes within the TimeSeries, return
     * the extents of the TimeSeries as a TimeRange.
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
    // Event list mutation
    //

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
     */
    slice(begin, end) {
        const sliced = new Collection(this._eventList.slice(begin, end));
        sliced._type = this._type;
        return sliced;
    }

    filter(func) {
        const filteredEventList = [];
        for (const e of this.events()) {
            if (func(e)) {
                filteredEventList.push(e);
            }
        }
        return new Collection(filteredEventList);
    }

    map(func) {
        const result = [];
        for (const e of this.events()) {
            result.push(func(e));
        }
        return new Collection(result);
    }

    /**
     * Returns a new Collection by testing the fieldSpec
     * values for being valid (not NaN, null or undefined).
     * The resulting Collection will be clean for that fieldSpec.
     */
    clean(fieldSpec) {
        const filteredEvents = [];
        for (const e of this.events()) {
            if (Event.isValidValue(e, fieldSpec)) {
                filteredEvents.push(e);
            }
        }
        return new Collection(filteredEvents);
    }

    //
    // Aggregate the event list to a single value
    //

    count(fieldSpec = "value") {
        return this.sizeValid(fieldSpec);
    }

    first(fieldSpec = "value") {
        const collection = this.clean(fieldSpec);
        const e = collection.atFirst();
        return e.value(fieldSpec);
    }

    last(fieldSpec = "value") {
        const collection = this.clean(fieldSpec);
        const e = collection.atLast();
        return e.value(fieldSpec);
    }

    sum(fieldSpec = "value") {
        let sum = 0;
        const collection = this.clean(fieldSpec);
        for (const e of collection.events()) {
            sum += e.value(fieldSpec);
        }
        return sum;
    }

    avg(fieldSpec = "value") {
        const sum = this.sum(fieldSpec);
        const count = this.sizeValid(fieldSpec);
        return count ? sum / count : undefined;
    }

    max(fieldSpec = "value") {
        const collection = this.clean(fieldSpec);
        let max;
        for (const e of collection.events()) {
            const v = e.value(fieldSpec);
            if (!max || max < v) max = v;
        }
        return max;
    }

    min(fieldSpec = "value") {
        const collection = this.clean(fieldSpec);
        let min;
        for (const e of collection.events()) {
            const v = e.value(fieldSpec);
            if (!min || min > v) min = v;
        }
        return min;
    }

    mean(fieldSpec = "value") {
        return this.avg(fieldSpec);
    }

    median(fieldSpec = "value") {
        const searchKeyPath = fieldSpec.split(".");
        const collection = this.clean(fieldSpec);
        const sorted = collection._eventList.sortBy(d =>
            d.get("data").getIn(searchKeyPath)
        );

        const i = Math.floor(sorted.size / 2);
        if (sorted.size % 2 === 0) {
            const a = sorted.get(i).get("data").getIn(searchKeyPath);
            const b = sorted.get(i - 1).get("data").getIn(searchKeyPath);
            return (a + b) / 2;
        } else {
            return sorted.get(i).get("data").getIn(searchKeyPath);
        }
    }

    stdev(fieldSpec = "value") {
        const collection = this.clean(fieldSpec);
        const mean = this.mean(fieldSpec);
        const count = this.sizeValid(fieldSpec);
        let sums = 0;
        for (const e of collection.events()) {
            sums += Math.pow(e.value(fieldSpec) - mean, 2);
        }
        return Math.sqrt(sums / count);
    }
}
