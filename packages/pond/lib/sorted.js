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
const collection_1 = require("./collection");
/**
 * In general, a Collection is a bucket of Events, with no particular order. This,
 * however, is a sub-class of a Collection which always maintains time-based sorting.
 *
 * As a result, it allows certain operations such as bisect which depend on a
 * known ordering.
 *
 * This is the backing structure for a TimeSeries. You probably want to use a
 * TimeSeries directly.
 */
class SortedCollection extends collection_1.Collection {
    /**
     * Construct a new Sorted Collection (experimental)
     */
    constructor(arg1) {
        super(arg1);
        if (!this.isChronological()) {
            this.sortByKey();
        }
    }
    clone(events, keyMap) {
        const c = new SortedCollection();
        c._events = events;
        c._keyMap = keyMap;
        return c;
    }
    /**
     * If our new Event was added at the end, then we don't have anything to maintain.
     * However, if the Event would otherwise be out of order then we sort the Collection.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvcnRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBS0gsNkNBQTBDO0FBTTFDOzs7Ozs7Ozs7R0FTRztBQUNILHNCQUE2QyxTQUFRLHVCQUFhO0lBQzlEOztPQUVHO0lBQ0gsWUFBWSxJQUErQztRQUN2RCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLENBQUM7SUFDTCxDQUFDO0lBRVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNO1FBQzFCLE1BQU0sQ0FBQyxHQUFHLElBQUksZ0JBQWdCLEVBQUssQ0FBQztRQUNwQyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUNuQixDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUNuQixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7T0FHRztJQUNPLFlBQVksQ0FBQyxNQUFnQztRQUNuRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQTdCRCw0Q0E2QkM7QUFFRCxpQ0FBZ0QsSUFBK0M7SUFDM0YsTUFBTSxDQUFDLElBQUksZ0JBQWdCLENBQUksSUFBSSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVtQyxtREFBZ0IifQ==