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
const event_1 = require("./event");
const grouped_1 = require("./grouped");
const timerange_1 = require("./timerange");
const windowed_1 = require("./windowed");
const align_1 = require("./align");
const collapse_1 = require("./collapse");
const fill_1 = require("./fill");
const rate_1 = require("./rate");
const select_1 = require("./select");
const functions_1 = require("./functions");
/**
 * Convert the `fieldspec` into a list if it is not already.
 */
function fieldAsArray(field) {
    if (_.isArray(field)) {
        return field;
    }
    else if (_.isString(field)) {
        return field.split(".");
    }
}
/**
 * A Collection holds a ordered (but not sorted) list of Events.
 *
 * In Typescript, you can give a `Collection<T>` a type T, which is
 * the `Event` type accepted into the Collection (e.g. `Collection<Time>`).
 */
class Collection extends base_1.Base {
    /**
     * Construct a new Collection
     *
     * @example
     * ```
     * const e1 = new Event(time("2015-04-22T03:30:00Z"), { a: 5, b: 6 });
     * const e2 = new Event(time("2015-04-22T02:30:00Z"), { a: 4, b: 2 });
     *
     * let collection = new Collection<Time>();
     * collection = collection
     *     .addEvent(e1)
     *     .addEvent(e2);
     * ```
     */
    constructor(arg1) {
        super();
        if (!arg1) {
            this._events = Immutable.List();
            this._keyMap = Immutable.Map();
        }
        else if (arg1 instanceof Collection) {
            const other = arg1;
            this._events = other._events;
            this._keyMap = other._keyMap;
        }
        else if (Immutable.List.isList(arg1)) {
            this._events = arg1;
            this._keyMap = Collection.buildKeyMap(arg1);
        }
    }
    /**
     * Rebuild the keyMap from scratch
     */
    static buildKeyMap(events) {
        let keyMap = Immutable.Map();
        events.forEach((e, i) => {
            const k = e.getKey().toString();
            const indicies = keyMap.has(k)
                ? keyMap.get(k).add(i)
                : Immutable.Set([i]);
            keyMap = keyMap.set(k, indicies);
        });
        return keyMap;
    }
    /**
     * Returns the `Collection` as a regular JSON object. This
     * is implementation specific, in that different types of
     * `Collections` will likely implement this in their own way.
     *
     * In the case of our `OrderedMap`, this code simply called
     * `internalOrderedMap.toJS()` and lets `Immutable.js` do its
     * thing.
     */
    toJSON() {
        return this._events.toJS();
    }
    /**
     * Serialize out the `Collection` as a string. This will be the
     * string representation of `toJSON()`.
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
    /**
     * Adds a new `Event` into the `Collection`, returning a new `Collection`
     * containing that `Event`. Optionally the Events may be de-duplicated.
     *
     * The dedup arg may either be a boolean (in which case any existing
     * Events with the same key will be replaced by this new Event), or
     * with a function. If dedup is a function that function will be
     * passed a list of all `Event`'s with that key and will be expected
     * to return a single `Event` to replace them with.
     *
     * @example
     * ```
     * let collection = pond.collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2);
     * ```
     * @example
     * ```
     * // dedup with the sum of the duplicated events
     * const collection = pond.collection<Time>()
     *     .addEvent(e1)
     *     .addEvent(e2)
     *     .addEvent(e3, (events) => {
     *         const a = events.reduce((sum, e) => sum + e.get("a"), 0);
     *         return new Event<Time>(timestamp2, { a });
     *     });
     *
     * ```
     */
    addEvent(event, dedup) {
        const k = event.getKey().toString();
        let events = this._events;
        let e = event; // Our event to be added
        let indicies = this._keyMap.has(k)
            ? this._keyMap.get(k)
            : Immutable.Set();
        // Dedup
        if (dedup) {
            const conflicts = this.atKey(event.getKey()).toList();
            if (conflicts.size > 0) {
                // Remove duplicates from the event list
                events = this._events.filterNot(duplicate => duplicate.getKey().toString() === event.getKey().toString());
                // Resolves the duplicates and this event to a single event
                if (_.isFunction(dedup)) {
                    e = dedup(conflicts.concat(e));
                }
                // Indicies for this key will only have this one event in it
                indicies = Immutable.Set();
            }
        }
        // Add the new event to our event list
        events = events.push(e);
        // Call the post add hook to give sub-classes a chance to modify
        // the event list. If they do, then we'll rebuild the keyMap.
        let newKeyMap = this._keyMap;
        let newEvents = events;
        newEvents = this.onEventAdded(events);
        if (newEvents === events) {
            // Add in the new event's index to our keyMap indicies
            indicies = indicies.add(newEvents.size - 1);
            newKeyMap = this._keyMap.set(k, indicies);
        }
        else {
            newKeyMap = Collection.buildKeyMap(newEvents);
        }
        return this.clone(newEvents, newKeyMap);
    }
    /**
     * Removes the `Event` (or duplicate keyed Events) with the given key.
     */
    removeEvents(key) {
        const k = key.toString();
        const indices = this._keyMap.get(k);
        const events = this._events.filterNot((event, i) => indices.has(i));
        const keyMap = this._keyMap.remove(k);
        return this.clone(events, keyMap);
    }
    /**
     * Takes the last n `Event`'s of the `Collection` and returns a new `Collection`.
     */
    takeLast(amount) {
        const events = this._events.takeLast(amount);
        const keyMap = Collection.buildKeyMap(events);
        return this.clone(events, keyMap);
    }
    /**
     * Completely replace the existing `Event`'s in this Collection.
     */
    setEvents(events) {
        let keyMap = Immutable.Map();
        events.forEach((e, i) => {
            const k = e.getKey().toString();
            const indicies = keyMap.has(k)
                ? keyMap.get(k).add(i)
                : Immutable.Set([i]);
            keyMap = keyMap.set(k, indicies);
        });
        return this.clone(events, keyMap);
    }
    /**
     * Returns the number of `Event`'s in this Collection
     */
    size() {
        return this._events.size;
    }
    /**
     * Returns the number of valid items in this `Collection`.
     *
     * Uses the `fieldPath` to look up values in all Events.
     *
     * It then counts the number that are considered valid, which
     * specifically are not:
     *  * NaN
     *  * undefined
     *  * null.
     */
    sizeValid(fieldPath = "value") {
        let count = 0;
        this._events.forEach(e => {
            if (e.isValid(fieldPath)) {
                count++;
            }
        });
        return count;
    }
    /**
     * Return if the `Collection` has any events in it
     */
    isEmpty() {
        return this.size() === 0;
    }
    /**
     * Returns the `Event` at the given position `pos` in the
     * `Collection`.
     *
     * Note: this is the least efficient way to fetch a point.
     *
     * If you wish to scan the whole set of Events, use an
     * iterator (see `forEach()` and `map()`). For direct access
     * the `Collection` is optimized for returning results via
     * the `Event`'s key (see `atKey()`).
     */
    at(pos) {
        return this.eventList().get(pos);
    }
    /**
     * Returns the `Event` located at the key specified, if it
     * exists. Note that this doesn't find the closest key, or
     * implement `bisect`. For that you need the sorted
     * Collection that is part of a `TimeSeries`. On the plus side,
     * if you know the key this is an efficient way to access the
     * `Event` within the `Collection`.
     *
     * @example
     * ```
     * const timestamp = new Time("2015-04-22T03:30:00Z");
     * const event = collection.atKey(timestamp)
     * ```
     */
    atKey(key) {
        const indexes = this._keyMap.get(key.toString());
        return indexes
            .map(i => {
            return this._events.get(i);
        })
            .toList();
    }
    /**
     * Returns the first event in the `Collection`.
     */
    firstEvent() {
        return this._events.first();
    }
    /**
     * Returns the last event in the `Collection`.
     */
    lastEvent() {
        return this._events.last();
    }
    /**
     * Returns all the `Event<T>`s as an `Immutable.List`.
     */
    eventList() {
        return this._events.toList();
    }
    /**
     * Returns the events in the `Collection` as an `Immutable.Map`, where
     * the key of type `T` (e.g. Time, Index, or TimeRange),
     * represented as a string, is mapped to the Event itself.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    eventMap() {
        return this._events.toMap();
    }
    /**
     * Returns an iterator (`Immutable.Iterator`) into the internal
     * event `OrderedMap`.
     *
     * @example
     * ```
     * let iterator = collection.entries();
     * for (let x = iterator.next(); !x.done; x = iterator.next()) {
     *     const [key, event] = x.value;
     *     console.log(`Key: ${key}, Event: ${event.toString()}`);
     * }
     * ```
     */
    entries() {
        return this._events.entries();
    }
    /**
     * Iterate over the events in this `Collection`. Events are in the
     * order that they were added, unless the Collection has since been
     * sorted.
     *
     * Returns the number of items iterated.
     *
     * @example
     * ```
     * collection.forEach((e, k) => {
     *     console.log(e, k);
     * })
     * ```
     */
    forEach(sideEffect) {
        return this._events.forEach(sideEffect);
    }
    /**
     * Map over the events in this Collection. For each `Event`
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
        const remapped = this._events.map(mapper);
        return new Collection(Immutable.List(remapped));
    }
    /**
     * Remap the keys, but keep the data the same. You can use this if you
     * have a `Collection` of `Index`es and want to convert to `Time`s, for
     * example. The return result of remapping the keys of a `Collection<T>`
     * with new keys of type `U`, will be a `Collection<U>`.
     *
     * @example
     *
     * In this example we remap `Time` keys to `TimeRange` keys using the `Time.toTimeRange()`
     * method, centering the new `TimeRange`s around each `Time` with duration given
     * by the `Duration` object supplied, in this case representing one hour.
     *
     * ```
     * const remapped = myCollection.mapKeys<TimeRange>((t) =>
     *     t.toTimeRange(duration("1h"), TimeAlignment.Middle));
     * ```
     *
     */
    mapKeys(mapper) {
        const list = this._events.map(event => new event_1.Event(mapper(event.getKey()), event.getData()));
        return new Collection(list);
    }
    /**
     * FlatMap over the events in this `Collection`. For each `Event`
     * passed to your callback function you should map that to
     * zero, one or many Events, returned as an `Immutable.List`.
     */
    flatMap(mapper) {
        const remapped = this._events.flatMap(mapper);
        return new Collection(Immutable.List(remapped));
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
     * const sorted = collection.sortByKey();
     * ```
     */
    sortByKey() {
        const sorted = Immutable.List(this._events.sortBy(event => {
            return +event.getKey().timestamp();
        }));
        return new Collection(sorted);
    }
    /**
     * Sorts the `Collection` using the value referenced by
     * the `field`.
     */
    sort(field) {
        const fs = fieldAsArray(field);
        const sorted = Immutable.List(this._events.sortBy(event => {
            return event.get(fs);
        }));
        return new Collection(sorted);
    }
    /**
     * GroupBy a field's value. The result is a `CollectionMap`, mapping
     * a key (the value of the field) to a `Collection` of Events that
     * matched field.
     *
     * ```
     * const grouped = c
     *     .groupBy("team_name")
     *     .aggregate({
     *         "a_avg": ["a", avg()],
     *         "b_avg": ["b", avg()],
     *     });
     * ```
     */
    groupBy(field) {
        return grouped_1.grouped(field, this);
    }
    /**
     * Window the `Collection` into a given period of time.
     *
     * @example
     * ```
     * const windowed = collection.window(period("1h"));
     * ```
     */
    window(options) {
        return windowed_1.windowed(options, Immutable.Map({ all: this }));
    }
    /**
     * Perform a slice of events within the `Collection`, returns a new
     * `Collection` representing a portion of this `TimeSeries` from `begin` up to
     * but not including `end`.
     */
    slice(begin, end) {
        return this.setEvents(this._events.slice(begin, end));
    }
    /**
     * Returns a new `Collection` with all `Event`s except the first
     */
    rest() {
        return this.setEvents(this._events.rest());
    }
    /**
     * Filter the Collection's `Event`'s with the supplied function
     * @example
     * ```
     * const filtered = collection.filter(e => e.get("a") < 8)
     * ```
     */
    // filter(predicate: (event: Event<T>, key: T) => boolean) {
    //     return new Collection<T>(Immutable.OrderedMap<T, Event<T>>(
    //         this._events.filter(predicate)
    //     ));
    // }
    /**
     * Returns the extents of the `Collection` as a `TimeRange`.
     * Since this `Collection` is not necessarily in order, this
     * method will traverse the `Collection` and determine the
     * ealiest and latest time represented within it.
     */
    timerange() {
        let minimum;
        let maximum;
        this.forEach(e => {
            if (!minimum || e.begin() < minimum) {
                minimum = e.begin();
            }
            if (!maximum || e.end() > maximum) {
                maximum = e.end();
            }
        });
        if (minimum && maximum) {
            return timerange_1.timerange(minimum, maximum);
        }
    }
    aggregate(reducer, fieldSpec) {
        const v = event_1.Event.aggregate(this.eventList(), reducer, fieldSpec);
        if (_.isString(fieldSpec)) {
            return v[fieldSpec];
        }
        else if (_.isArray(fieldSpec)) {
            return v;
        }
    }
    first(fieldSpec, filter) {
        return this.aggregate(functions_1.first(filter), fieldSpec);
    }
    last(fieldSpec, filter) {
        return this.aggregate(functions_1.last(filter), fieldSpec);
    }
    sum(fieldSpec, filter) {
        return this.aggregate(functions_1.sum(filter), fieldSpec);
    }
    avg(fieldSpec, filter) {
        return this.aggregate(functions_1.avg(filter), fieldSpec);
    }
    max(fieldSpec, filter) {
        return this.aggregate(functions_1.max(filter), fieldSpec);
    }
    min(fieldSpec, filter) {
        return this.aggregate(functions_1.min(filter), fieldSpec);
    }
    median(fieldSpec, filter) {
        return this.aggregate(functions_1.median(filter), fieldSpec);
    }
    stdev(fieldSpec, filter) {
        return this.aggregate(functions_1.stdev(filter), fieldSpec);
    }
    percentile(q, fieldSpec, interp = functions_1.InterpolationType.linear, filter) {
        return this.aggregate(functions_1.percentile(q, interp, filter), fieldSpec);
    }
    /**
     * Gets n quantiles within the `Collection`.
     * This works the same way as numpy.
     */
    quantile(n, column = "value", interp = functions_1.InterpolationType.linear) {
        const results = [];
        const sorted = this.sort(column);
        const subsets = 1.0 / n;
        if (n > this.size()) {
            throw new Error("Subset n is greater than the Collection length");
        }
        for (let i = subsets; i < 1; i += subsets) {
            const index = Math.floor((sorted.size() - 1) * i);
            if (index < sorted.size() - 1) {
                const fraction = (sorted.size() - 1) * i - index;
                const v0 = +sorted.at(index).get(column);
                const v1 = +sorted.at(index + 1).get(column);
                let v;
                if (functions_1.InterpolationType.lower || fraction === 0) {
                    v = v0;
                }
                else if (functions_1.InterpolationType.linear) {
                    v = v0 + (v1 - v0) * fraction;
                }
                else if (functions_1.InterpolationType.higher) {
                    v = v1;
                }
                else if (functions_1.InterpolationType.nearest) {
                    v = fraction < 0.5 ? v0 : v1;
                }
                else if (functions_1.InterpolationType.midpoint) {
                    v = (v0 + v1) / 2;
                }
                results.push(v);
            }
        }
        return results;
    }
    /**
     * Returns true if all events in this `Collection` are in chronological order.
     */
    isChronological() {
        let result = true;
        let t;
        this.forEach(e => {
            if (!t) {
                t = e.timestamp().getTime();
            }
            else {
                if (e.timestamp() < t) {
                    result = false;
                }
                t = e.timestamp();
            }
        });
        return result;
    }
    /**
     * The `align()` method applied to a collection of events that might come in with timestamps
     * at uneven intervals and produces a new `Collection` of those points, but aligned on
     * precise time window boundaries. A `Collection` containing four events with following
     * timestamps:
     * ```
     *     0:40
     *     1:05
     *     1:45
     *     2:10
     * ```
     *
     * Given a period of 1m (every one minute), a new `Collection` with two events at the following
     * times will be produced:
     *
     * ```
     *     1:00
     *     2:00
     * ```
     *
     * Only a `Collection` of `Event<Time>` objects can be aligned. `Event<Index>`
     * objects are basically already aligned and it makes no sense in the case of a
     * `Event<TimeRange>`.
     *
     * It should also be noted that the aligned event will only contain the fields that
     * alignment was requested on. Which is to say if you have two columns, "in" and "out",
     * and only request to align the "in" column, the "out" value will not be contained in
     * the resulting collection.
     */
    align(options) {
        const p = new align_1.Align(options);
        return this.flatMap(e => p.addEvent(e));
    }
    rate(options) {
        const p = new rate_1.Rate(options);
        return this.flatMap(e => p.addEvent(e));
    }
    fill(options) {
        const p = new fill_1.Fill(options);
        return this.flatMap(e => p.addEvent(e));
    }
    collapse(options) {
        const p = new collapse_1.Collapse(options);
        return this.flatMap(e => p.addEvent(e));
    }
    select(options) {
        const p = new select_1.Select(options);
        return this.flatMap(e => p.addEvent(e));
    }
    //
    // To be reimplemented by subclass
    //
    clone(events, keyMap) {
        const c = new Collection();
        c._events = events;
        c._keyMap = keyMap;
        return c;
    }
    onEventAdded(events) {
        return events;
    }
}
exports.Collection = Collection;
function collectionFactory(arg1) {
    return new Collection(arg1);
}
exports.collection = collectionFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBRTVCLGlDQUE4QjtBQUU5QixtQ0FBZ0M7QUFDaEMsdUNBQXlFO0FBS3pFLDJDQUFtRDtBQUNuRCx5Q0FBMEQ7QUFFMUQsbUNBQWdDO0FBQ2hDLHlDQUFzQztBQUN0QyxpQ0FBOEI7QUFDOUIsaUNBQThCO0FBQzlCLHFDQUFrQztBQWdCbEMsMkNBV3FCO0FBRXJCOztHQUVHO0FBQ0gsc0JBQXNCLEtBQXdCO0lBQzFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsZ0JBQXVDLFNBQVEsV0FBSTtJQXdCL0M7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNILFlBQVksSUFBK0M7UUFDdkQsS0FBSyxFQUFFLENBQUM7UUFDUixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQVksQ0FBQztZQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQWlDLENBQUM7UUFDbEUsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNwQyxN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