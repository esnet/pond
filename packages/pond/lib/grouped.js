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
const sorted_1 = require("./sorted");
const windowed_1 = require("./windowed");
const util_1 = require("./util");
/**
 * Represents an association of group names to `Collection`s. Typically
 * this is the resulting representation of performing a `groupBy()` on
 * a `Collection`.
 */
class GroupedCollection {
    constructor(arg1, arg2) {
        if (Immutable.Map.isMap(arg1)) {
            const collectionMap = arg1;
            this.collections = collectionMap;
        }
        else {
            let fn;
            const collection = arg2;
            if (_.isFunction(arg1)) {
                fn = arg1;
            }
            else {
                const fieldSpec = arg1;
                const fs = util_1.default.fieldAsArray(fieldSpec);
                fn = e => e.get(fs);
            }
            this.collections = collection
                .eventList()
                .groupBy(fn)
                .toMap()
                .map(events => new sorted_1.SortedCollection(events.toList()));
        }
    }
    /**
     * Gets the `Collection` contained in the `grouping` specified.
     */
    get(grouping) {
        return this.collections.get(grouping);
    }
    /**
     * Aggregate per grouping, essentially forming a map from the group name
     * to the aggregate of the former `Collection` associated with that group name.
     *
     * Example:
     * ```
     * const eventCollection = new Collection(
     *     Immutable.List([
     *         event(time("2015-04-22T02:28:00Z"), map({ team: "raptors", score: 3 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "raptors", score: 4 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "raptors", score: 5 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "wildcats", score: 3 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "wildcats", score: 4 })),
     *         event(time("2015-04-22T02:31:00Z"), map({ team: "wildcats", score: 6 }))
     *     ])
     * );
     *
     * const rolledUp = eventCollection
     *     .groupBy("team")
     *     .aggregate({
     *         team: ["team", keep()],
     *         total: ["score", sum()]
     *     });
     *
     * const raptorsTotal = rolledUp.get("raptors").get("total");   // 12
     * const wildcatsTotal = rolledUp.get("wildcats").get("total"); // 13
     * ```
     */
    aggregate(aggregationSpec) {
        const result = {};
        this.collections.forEach((collection, group) => {
            const d = {};
            _.forEach(aggregationSpec, (src, dest) => {
                if (!_.isFunction(src)) {
                    const [srcField, reducer] = src;
                    d[dest] = collection.aggregate(reducer, srcField);
                }
                else {
                    d[dest] = src(collection);
                }
            });
            result[group] = d;
        });
        return Immutable.fromJS(result);
    }
    /**
     * Forms a single group from this `GroupedCollection`, returning a new
     * `GroupedCollection` with a single key `_` mapping to a `Collection`
     * containing all `Event`s in all the previous `Collection`s.
     */
    ungroup() {
        let eventList = Immutable.List();
        this.collections.forEach((collection, group) => {
            eventList = eventList.concat(collection.eventList());
        });
        const map = Immutable.Map({ _: new sorted_1.SortedCollection(eventList) });
        return new GroupedCollection(map);
    }
    /**
     * Forms a single `Collection` from this `GroupedCollection`. That
     * `Collection` will containing all `Event`s in all the previously
     * grouped `Collection`s.
     */
    flatten() {
        return this.ungroup().get("_");
    }
    /**
     * Further groups this `GroupedCollection` per window, returning a
     * `WindowedCollection`. This allows you then to first `groupBy()`
     * a `Collection` and then further group by a window.
     *
     * The options are passed as a `WindowOptions` structure, but essentially
     * in the context of chaining `Collections` together this really just needs
     * to contain the `{ window: w }` where `w` here would be a `window` object
     * of some sort.
     *
     * Example:
     * ```
     * const w = window(duration("30m"));
     * const windowedCollection = eventCollection
     *     .groupBy("team")
     *     .window({ window: w });
     * ```
     */
    window(windowOptions) {
        return new windowed_1.WindowedCollection(windowOptions, this.collections);
    }
    /**
     * Runs the `align()` method on each grouped `Collection`.
     */
    align(options) {
        const collections = this.collections.map((collection, group) => {
            return collection.align(options);
        });
        return new GroupedCollection(collections);
    }
    /**
     * Runs the `rate()` method on each grouped `Collection`.
     */
    rate(options) {
        const collections = this.collections.map((collection, group) => {
            return collection.rate(options);
        });
        return new GroupedCollection(collections);
    }
}
exports.GroupedCollection = GroupedCollection;
function groupedFactory(fieldSpec, collection) {
    return new GroupedCollection(fieldSpec, collection);
}
exports.grouped = groupedFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncm91cGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBUzVCLHFDQUE0QztBQUc1Qyx5Q0FBZ0Q7QUFjaEQsaUNBQTBCO0FBOEIxQjs7OztHQUlHO0FBQ0g7SUF3Q0ksWUFBWSxJQUFTLEVBQUUsSUFBVTtRQUM3QixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxhQUFhLEdBQUcsSUFBa0QsQ0FBQztZQUN6RSxJQUFJLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQztRQUNyQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLEVBQXVCLENBQUM7WUFDNUIsTUFBTSxVQUFVLEdBQUcsSUFBMkIsQ0FBQztZQUMvQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNkLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLFNBQVMsR0FBRyxJQUF5QixDQUFDO2dCQUM1QyxNQUFNLEVBQUUsR0FBRyxjQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4QyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVTtpQkFDeEIsU0FBUyxFQUFFO2lCQUNYLE9BQU8sQ0FBQyxFQUFFLENBQUM7aUJBQ1gsS0FBSyxFQUFFO2lCQUNQLEdBQUcsQ0FBQyxNQUFNLElBQUksSUFBSSx5QkFBZ0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxHQUFHLENBQUMsUUFBZ0I7UUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMkJHO0lBQ0ksU0FBUyxDQUNaLGVBQW1DO1FBRW5DLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLO1lBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNiLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBcUIsRUFBRSxJQUFZO2dCQUMzRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQixNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztvQkFDaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzlCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE9BQU87UUFDVixJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSztZQUN2QyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSx5QkFBZ0IsQ0FBSSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckUsTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxPQUFPO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7OztPQWlCRztJQUNJLE1BQU0sQ0FBQyxhQUErQjtRQUN6QyxNQUFNLENBQUMsSUFBSSw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxPQUF5QjtRQUNsQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLO1lBQ3ZELE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBd0IsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixDQUFJLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7T0FFRztJQUNJLElBQUksQ0FBQyxPQUFvQjtRQUM1QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLO1lBQ3ZELE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBZ0MsQ0FBQztRQUNuRSxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDSjtBQXBMRCw4Q0FvTEM7QUFFRCx3QkFDSSxTQUFrRCxFQUNsRCxVQUErQjtJQUUvQixNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBSSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUUwQixpQ0FBTyJ9