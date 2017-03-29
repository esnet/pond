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
const Immutable = require("immutable");
const timerange_1 = require("./timerange");
const util_1 = require("./util");
/**
 * A Collection holds a ordered (but not sorted) map of Events.
 *
 * The Events stored in a Collection are mapped by their key
 * so a Collection can not hold more than one Event of the same
 * key, thus de-duplication is part of how a Collection works.
 * Later Events to be added supersede early ones. Internally, a
 * Collection holds its data in an Immutable.OrderedMap.
 *
 * In Typescript, you can give a Collection<T> a type T, which is
 * the Event type accepted into the Collection (e.g. Collection<Time>).
 */
class Collection {
    constructor(arg1) {
        if (!arg1) {
            this._events = Immutable.OrderedMap();
        }
        else if (arg1 instanceof Collection) {
            const other = arg1;
            this._events = other._events;
        }
        else if (Immutable.OrderedMap.isOrderedMap(arg1)) {
            this._events = arg1;
        }
    }
    /**
     * Returns the Collection as a regular JSON object. This
     * is implementation specific, in that different types of
     * Collections will likely implement this in their own way.
     *
     * In the case of our OrderedMap, this code simply called
     * internalOrderedMap.toJS() and lets Immutable.js do its
     * thing.
     *
     * @return {Object} The JSON representation of this Collection
     */
    toJSON() {
        return this._events.toJS();
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
     * Adds a new Event into the Collection. Since a Collection only
     * represents a bag of Events with unique keys, the Event will
     * be deduped. You can optionally provide a callback that will
     * be called with the existing event in the case of an Event
     * already existing in the Collection. You can return from this
     * the Event to actually add. The default is to replace existing
     * Events with the new Event.
     *
     * @example
     * ```
     * collection = collection.addEvent(e2, e => {
     *     return new Event<Time>(
     *         timestamp1,
     *         { a: e2.get("a") + e.get("a") } // sum them
     *     );
     * });
     * ```
     * @param event The new Event of type T to be added into the Collection
     * @param dudup Callback function to reconcile an existing Event
     *
     * @returns Collection<T> The new Collection with the Event
     *                        added into it
     */
    addEvent(event, dedup) {
        const k = event.key();
        let e = event;
        if (this._events.has(k) && dedup) {
            e = dedup(this._events.get(k));
        }
        return new Collection(this._events.set(k, e));
    }
    setEvents(events) {
        return new Collection(events);
    }
    /**
     * @returns The number of Events in this Collection
     */
    size() {
        return this._events.size;
    }
    /**
     * Returns the number of valid items in this `Collection`.
     *
     * Uses the `fieldPath` to look up values in all Events.
     * It then counts the number that are considered valid, which
     * specifically are not:
     *  * NaN
     *  * undefined
     *  * null.
     *
     * @param
     *
     * @return {number} Count of valid events
     */
    sizeValid(fieldPath = "value") {
        let count = 0;
        this._events.forEach(e => {
            if (e.isValid(fieldPath))
                count++;
        });
        return count;
    }
    /**
     * Returns the Event at the given position `pos` in the
     * Collection. Note that this probably the least efficient
     * way to fetch a point. If you wish to scan the whole set
     * of Events, use an iterator (see `forEach()` and `map()`).
     * For direct access the Collection is optimised for
     * returning results via key (see `atKey()`).
     *
     * @param pos The position of the Event to return
     */
    at(pos) {
        return this.eventList()[pos];
    }
    /**
     * Returns the Event located at the key specified, if it
     * exists. Note that this doesn't find the closest key, or
     * implement bisect. For that you need the order maintained
     * Collection that is part of TimeSeries.
     *
     * @example
     * ```
     * const timestamp = new Time("2015-04-22T03:30:00Z");
     * const event = collection.atKey(timestamp)
     * ```
     * @param key The key of the Event
     */
    atKey(key) {
        return this._events.get(key);
    }
    /**
     * Returns all the Events as an Immutable.List
     *
     * @returns Immutable.List<Event<t>> The list of Events in
     *                                   this Collection, converted to
     *                                   a List.
     */
    eventList() {
        return this._events.toList();
    }
    /**
     * Returns the events in the Collection as a Immutable.Map, where
     * the key of the Event (e.g. timestamp, index, or TimeRange),
     * represented as a string, is mapped to the Event.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    eventMap() {
        return this._events.toMap();
    }
    /**
     * Returns an iterator into the internal event SortedMap.
     *
     * @example
     * ```
     * let iterator = this._events.entries();
     * for (let x = iterator.next(); !x.done; x = iterator.next()) {
     *     const [key, event] = x.value;
     *     console.log("Key:", +key, "Event:", event.toString());
     * }
     * ```
     * @returns Immutable.Iterator<any[]> Iterator
     */
    entries() {
        return this._events.entries();
    }
    /**
     * Iterate over the events in this Collection. Events are in the
     * order that they were added, unless the Collection has since been
     * sorted.
     *
     * If you return false from the sideEffect callback, the iteration
     * will end. The function returns the number of events iterated.
     *
     * @example
     * ```
     * collection.forEach((e, k) => {
     *     console.log(e, k);
     * })
     * ```
     */
    forEach(sideEffect) {
        return this._events.forEach((e, k) => {
            return sideEffect(e, k);
        });
    }
    /**
     * Map over the events in this Collection. For each Event
     * passed to your callback function you should map that to
     * a new Event.
     *
     * @example
     * ```
     * const mapped = sorted.map(event => {
     *     return new Event(event.key(), { a: 55 });
     * });
     * ```
     */
    map(mapper) {
        const remapped = Immutable.OrderedMap(this._events.map((e, k) => {
            return mapper(e, k);
        }));
        return new Collection(remapped);
    }
    /**
     * Sorts the `Collection` by the `Event` key `T`.
     *
     * In the case case of the key being `Time`, this is clear.
     * For `TimeRangeEvents` and `IndexedEvents`, the `Collection`
     * will be sorted by the begin time.
     *
     * This method is particularly useful when the `Collection`
     * will be passed into a `TimeSeries`.
     *
     * See also `Collection.isChronological()`.
     *
     * @example
     * ```
     * const sorted = collection.sortByTime();
     * ```
     * @returns Collection<T> A new collection, sorted by the
     *                        Event key of type T
     */
    sortByTime() {
        const sorted = Immutable.OrderedMap(this._events.sortBy(event => {
            return +event.key().timestamp();
        }));
        return new Collection(sorted);
    }
    /**
     * Sorts the Collection using the value referenced by
     * the `field`.
     */
    sort(field) {
        const fs = util_1.default.fieldAsArray(field);
        const sorted = Immutable.OrderedMap(this._events.sortBy(event => {
            return event.get(fs);
        }));
        return new Collection(sorted);
    }
    /**
     * Returns the extents of the Collection as a TimeRange.
     * Since this Collection is not necessarily in order, this
     * method will traverse the Collection and determine the
     * ealiest and latest time represented within it.
     */
    timerange() {
        let min;
        let max;
        this.forEach(e => {
            if (!min || e.begin() < min)
                min = e.begin();
            if (!max || e.end() > max)
                max = e.end();
        });
        if (min && max) {
            return new timerange_1.default(min, max);
        }
    }
}
exports.default = Collection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztHQVFHOzs7QUFHSCx1Q0FBdUM7QUFNdkMsMkNBQW9DO0FBQ3BDLGlDQUEwQjtBQUUxQjs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBT0ksWUFBWSxJQUFVO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBZSxDQUFDO1FBQ3ZELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUNqQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxNQUFNO1FBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsUUFBUTtRQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F1Qkc7SUFDSCxRQUFRLENBQ0osS0FBZSxFQUNmLEtBQXFDO1FBRXJDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUs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