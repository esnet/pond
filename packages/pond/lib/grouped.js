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
const windowed_1 = require("./windowed");
const util_1 = require("./util");
class GroupedCollection extends base_1.Base {
    constructor(arg1, arg2) {
        super();
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
                .map(events => new collection_1.Collection(events.toList()));
        }
    }
    /**
     * Fetch the Collection of events contained in the grouping
     */
    get(grouping) {
        return this.collections.get(grouping);
    }
    /**
     *
     * @example
     * ```
     * grouped
     *     .aggregate({
     *         a_avg: [ "a", avg() ],
     *         b_avg: [ "b", avg() ],
     *     });
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
    ungroup() {
        let eventList = Immutable.List();
        this.collections.forEach((collection, group) => {
            eventList = eventList.concat(collection.eventList());
        });
        const map = Immutable.Map({ _: new collection_1.Collection(eventList) });
        return new GroupedCollection(map);
    }
    flatten() {
        return this.ungroup().get("_");
    }
    window(period) {
        return new windowed_1.WindowedCollection(period, this.collections);
    }
    align(options) {
        const collections = this.collections.map((collection, group) => {
            return collection.align(options);
        });
        return new GroupedCollection(collections);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ncm91cGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBRzVCLGlDQUE4QjtBQUM5Qiw2Q0FBMEM7QUFRMUMseUNBQWdEO0FBYWhELGlDQUEwQjtBQThCMUIsdUJBQThDLFNBQVEsV0FBTztJQVF6RCxZQUFZLElBQVMsRUFBRSxJQUFVO1FBQzdCLEtBQUssRUFBRSxDQUFDO1FBQ1IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sYUFBYSxHQUFHLElBQTRDLENBQUM7WUFDbkUsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUM7UUFDckMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxFQUF1QixDQUFDO1lBQzVCLE1BQU0sVUFBVSxHQUFHLElBQXFCLENBQUM7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSxTQUFTLEdBQUcsSUFBeUIsQ0FBQztnQkFDNUMsTUFBTSxFQUFFLEdBQUcsY0FBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDeEMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLENBQUM7WUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVU7aUJBQ3hCLFNBQVMsRUFBRTtpQkFDWCxPQUFPLENBQUMsRUFBRSxDQUFDO2lCQUNYLEtBQUssRUFBRTtpQkFDUCxHQUFHLENBQUMsTUFBTSxJQUFJLElB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