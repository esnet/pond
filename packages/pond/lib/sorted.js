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
const collection_1 = require("./collection");
const event_1 = require("./event");
/**
 * In general, a `Collection` is a bucket of `Event`'s, with no particular order. This,
 * however, is a sub-class of a `Collection` which always maintains time-based sorting.
 *
 * As a result, it allows certain operations such as `bisect()` which depend on a
 * known ordering.
 *
 * This is the backing structure for a `TimeSeries`. You probably want to use a
 * `TimeSeries` directly.
 */
class SortedCollection extends collection_1.Collection {
    /**
     * Construct a new `Sorted Collection` (experimental)
     */
    constructor(arg1) {
        super(arg1);
        if (!this.isChronological()) {
            this.sortByKey();
        }
    }
    /**
     * Map over the events in this `Collection`. For each `Event`
     * passed to your callback function you should map that to
     * a new `Event`.
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
        return new SortedCollection(Immutable.List(remapped));
    }
    /**
     * Returns the index that `bisect`'s the `TimeSeries` at the time specified.
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
            }
            else if (ts === tms) {
                return i;
            }
        }
        return i - 1;
    }
    /**
     * Static function to compare two collections to each other. If the collections
     * are of the same value as each other then equals will return true.
     */
    // tslint:disable:member-ordering
    static is(collection1, collection2) {
        /*
            It seems that immutable.js doesn't do deep conversion, so if your value is object,
            it stays to be object.
            As you're creating different object in each update step, and those objects will be
            treated different when you compare to each other, so you should also convert it to
            Immutable.Map object, to make the compare be true.
        */
        let result = true;
        collection1.forEach((e, k) => {
            result = result && event_1.Event.is(e, collection2.at(k));
        });
        return result;
    }
    clone(events, keyMap) {
        const c = new SortedCollection();
        c._events = events;
        c._keyMap = keyMap;
        return c;
    }
    /**
     * If our new `Event` was added at the end, then we don't have anything to maintain.
     * However, if the `Event` would otherwise be out of order then we sort the `Collection`.
     */
    onEventAdded(events) {
        const size = events.size;
        if (size > 1 && events.get(size - 2).begin() > events.get(size - 1).begin()) {
            return events.sortBy(event => +event.getKey().timestamp());
        }
        return events;
    }
}
exports.SortedCollection = SortedCollection;
function sortedCollectionFactory(arg1) {
    return new SortedCollection(arg1);
}
exports.sortedCollection = sortedCollectionFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvcnRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBR3ZDLDZDQUEwQztBQUMxQyxtQ0FBZ0M7QUFLaEM7Ozs7Ozs7OztHQVNHO0FBQ0gsc0JBQTZDLFNBQVEsdUJBQWE7SUFDOUQ7O09BRUc7SUFDSCxZQUFZLElBQStDO1FBQ3ZELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckIsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNJLEdBQUcsQ0FDTixNQUFzRDtRQUV0RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBSSxTQUFTLENBQUMsSUFBSSxDQUFXLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLENBQU8sRUFBRSxDQUFVO1FBQzdCLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVmLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNSLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ25CLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDNUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxpQ0FBaUM7SUFDakMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFrQyxFQUFFLFdBQWtDO1FBQzVFOzs7Ozs7VUFNRTtRQUNGLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUNsQixXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDckIsTUFBTSxHQUFHLE1BQU0sSUFBSSxhQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFUyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU07UUFDMUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxnQkFBZ0IsRUFBSyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sWUFBWSxDQUFDLE1BQWdDO1FBQ25ELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKO0FBM0ZELDRDQTJGQztBQUVELGlDQUFnRCxJQUErQztJQUMzRixNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBSSxJQUFJLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBRW1DLG1EQUFnQiJ9