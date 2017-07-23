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
const collection_1 = require("./collection");
const event_1 = require("./event");
const grouped_1 = require("./grouped");
const index_1 = require("./index");
const util_1 = require("./util");
const types_1 = require("./types");
// const specTest: AggregationSpec = {
//    in_avg: ["in", avg(), "bob"],
//    out_avg: ["out", avg()],
// };
// const tupleTest: AggregationTuple = ["in", avg()];
// const [a, b] = tupleTest;
// console.log("a", a);
// console.log("b", b);
/*
WindowedCollection
    - Map of (group, index) -> Collection (e.g. 1d-1234 -> collection( events in that window ))
    Operations:
        [✓] aggregate() -> reduce index-collection map to list of
            Event<Index>s and place in collection
              -> collection<Index>
        [ ] map() -> new WindowedCollection (Collection => Collection)
        [ ] groupBy() -> WindowedCollection
        [ ] removeWindow() -> GroupedCollection
        [ ] removeGrouping() -> WindowedCollection ("all" -> Collection)
        [ ] flatten() -> Collection (removeWindow, )
*/
class WindowedCollection extends base_1.Base {
    constructor(arg1, arg2, arg3) {
        super();
        if (Immutable.Map.isMap(arg1)) {
            this.collections = arg1;
        }
        else {
            this.windowPeriod = arg1;
            if (Immutable.Map.isMap(arg2)) {
                const collections = arg2;
                this.collections = collections.flatMap((collection, groupKey) => {
                    return collection
                        .eventList()
                        .groupBy(e => index_1.Index.getIndexString(this.windowPeriod.toString(), e.timestamp()))
                        .toMap()
                        .map(events => new collection_1.Collection(events.toList()))
                        .mapEntries(([key, _]) => [groupKey ? `${groupKey}::${key}` : `${key}`, _]);
                });
            }
            else {
                let collection;
                if (_.isString(arg2) || _.isArray(arg2)) {
                    this.group = util_1.default.fieldAsArray(arg2);
                    collection = arg3;
                }
                else {
                    collection = arg2;
                }
                if (collection) {
                    this.collections = collection
                        .eventList()
                        .groupBy(e => index_1.Index.getIndexString(this.windowPeriod.toString(), e.timestamp()))
                        .toMap()
                        .map(events => new collection_1.Collection(events.toList()))
                        .mapEntries(([window, e]) => [
                        this.group ? `${e.get(this.group)}::${window}` : `all::${window}`,
                        e
                    ]);
                }
                else {
                    this.collections = Immutable.Map();
                }
            }
            this.collections.map(c => c.timerange().end()).forEach((d, k) => {
                this.latest = this.latest < d.getTime() || !this.latest ? d.getTime() : this.latest;
            });
        }
    }
    /**
     * Fetch the Collection of events contained in the windowed grouping
     */
    get(key) {
        return this.collections.get(key);
    }
    triggeredCollection(trigger) {
        switch (trigger) {
            case types_1.Trigger.perEvent:
                const currentIndex = index_1.Index.getIndexString(this.windowPeriod.toString(), new Date(this.latest));
                if (!this.group) {
                    return [`all::${currentIndex}`, this.get(`all::${currentIndex}`)];
                }
                else {
                    // pass
                }
                break;
        }
    }
    /**
     * @example
     * ```
     * const rolledUp = collection
     *   .groupBy("team")
     *   .window(period("30m"))
     *   .aggregate({
     *       team: ["team", keep()],
     *       total: [ "score", sum() ],
     *   });
     * ```
     */
    aggregate(aggregationSpec) {
        // console.log("AGG");
        let eventMap = Immutable.Map();
        this.collections.forEach((collection, group) => {
            const d = {};
            const [groupKey, windowKey] = group.split("::");
            _.forEach(aggregationSpec, (src, dest) => {
                const [srcField, reducer] = src;
                d[dest] = collection.aggregate(reducer, srcField);
            });
            const eventKey = index_1.index(windowKey);
            const indexedEvent = new event_1.Event(eventKey, Immutable.fromJS(d));
            if (!eventMap.has(groupKey)) {
                eventMap = eventMap.set(groupKey, Immutable.List());
            }
            eventMap = eventMap.set(groupKey, eventMap.get(groupKey).push(indexedEvent));
        });
        const mapping = eventMap.map(eventList => new collection_1.Collection(eventList));
        return new grouped_1.GroupedCollection(mapping);
    }
    flatten(options) {
        let events = Immutable.List();
        this.collections.flatten().forEach(collection => {
            events = events.concat(collection.eventList);
        });
        return new collection_1.Collection(events);
    }
    align(options) {
        const collections = this.collections.map((collection, group) => {
            return collection.align(options);
        });
        return new WindowedCollection(collections);
    }
}
exports.WindowedCollection = WindowedCollection;
function windowFactory(arg1, arg2, arg3) {
    return new WindowedCollection(arg1, arg2, arg3);
}
exports.windowed = windowFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvd2luZG93ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFFNUIsaUNBQThCO0FBRzlCLDZDQUEwQztBQUMxQyxtQ0FBZ0M7QUFDaEMsdUNBQWdFO0FBQ2hFLG1DQUF1QztBQVF2QyxpQ0FBMEI7QUFFMUIsbUNBUWlCO0FBZWpCLHNDQUFzQztBQUN0QyxtQ0FBbUM7QUFDbkMsOEJBQThCO0FBQzlCLEtBQUs7QUFFTCxxREFBcUQ7QUFDckQsNEJBQTRCO0FBQzVCLHVCQUF1QjtBQUN2Qix1QkFBdUI7QUFFdkI7Ozs7Ozs7Ozs7OztFQVlFO0FBRUYsd0JBQStDLFNBQVEsV0FBTztJQWlDMUQsWUFBWSxJQUFTLEVBQUUsSUFBVSxFQUFFLElBQVU7UUFDekMsS0FBSyxFQUFFLENBQUM7UUFDUixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDNUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFjLENBQUM7WUFDbkMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLFdBQVcsR0FBRyxJQUE0QyxDQUFDO2dCQUNqRSxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsUUFBUTtvQkFDeEQsTUFBTSxDQUFDLFVBQVU7eUJBQ1osU0FBUyxFQUFFO3lCQUNYLE9BQU8sQ0FBQyxDQUFDLElBQ04sYUFBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFD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