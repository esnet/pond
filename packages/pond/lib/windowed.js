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
const sorted_1 = require("./sorted");
const event_1 = require("./event");
const grouped_1 = require("./grouped");
const index_1 = require("./index");
const time_1 = require("./time");
const util_1 = require("./util");
const types_1 = require("./types");
class WindowedCollection extends base_1.Base {
    constructor(arg1, arg2, arg3) {
        super();
        if (Immutable.Map.isMap(arg1)) {
            this.collections = arg1;
        }
        else {
            this.options = arg1;
            if (Immutable.Map.isMap(arg2)) {
                const collections = arg2;
                // Rekey all the events in the collections with a new key that
                // combines their existing group with the windows they fall in.
                // An event could fall into 0, 1 or many windows, depending on the
                // window's period and duration, as supplied in the WindowOptions.
                let remapped = Immutable.List();
                collections.forEach((c, k) => {
                    c.forEach(e => {
                        const groups = this.options.window
                            .getIndexSet(time_1.time(e.timestamp()))
                            .toList();
                        groups.forEach(g => {
                            remapped = remapped.push([`${k}::${g.asString()}`, e]);
                        });
                    });
                });
                this.collections = remapped
                    .groupBy(e => e[0])
                    .map(eventList => eventList.map(kv => kv[1]))
                    .map(eventList => new sorted_1.SortedCollection(eventList.toList()))
                    .toMap();
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
                    // TODO: do we use this code path?
                    throw new Error("Unimplemented");
                }
                else {
                    this.collections = Immutable.Map();
                }
            }
        }
    }
    /**
     * Fetch the SortedCollection of events contained in the windowed grouping
     */
    get(key) {
        return this.collections.get(key);
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
        const mapping = eventMap.map(eventList => new sorted_1.SortedCollection(eventList));
        return new grouped_1.GroupedCollection(mapping);
    }
    flatten() {
        let events = Immutable.List();
        this.collections.flatten().forEach(collection => {
            events = events.concat(collection.eventList());
        });
        return new sorted_1.SortedCollection(events);
    }
    ungroup() {
        const result = Immutable.Map();
        this.collections.forEach((collection, key) => {
            const newKey = key.split("::")[1];
            result[newKey] = collection;
        });
        return result;
    }
    addEvent(event) {
        let toBeEmitted = Immutable.List();
        const discardWindows = true;
        const emitOnDiscard = this.options.trigger === types_1.Trigger.onDiscardedWindow;
        const emitEveryEvent = this.options.trigger === types_1.Trigger.perEvent;
        const keys = this.getEventGroups(event);
        // Add event to an existing collection(s) or a new collection(s)
        keys.forEach(key => {
            // Add event to collection referenced by this key
            let targetCollection;
            let createdCollection = false;
            if (this.collections.has(key)) {
                targetCollection = this.collections.get(key);
            }
            else {
                targetCollection = new sorted_1.SortedCollection(Immutable.List());
                createdCollection = true;
            }
            this.collections = this.collections.set(key, targetCollection.addEvent(event));
            // Push onto the emit list
            if (emitEveryEvent) {
                toBeEmitted = toBeEmitted.push([key, this.collections.get(key)]);
            }
        });
        // Discard past collections
        let keep = Immutable.Map();
        let discard = Immutable.Map();
        this.collections.forEach((collection, collectionKey) => {
            const [__, windowKey] = collectionKey.split("::").length > 1
                ? collectionKey.split("::")
                : [null, collectionKey];
            if (+event.timestamp() < +util_1.default.timeRangeFromIndexString(windowKey).end()) {
                keep = keep.set(collectionKey, collection);
            }
            else {
                discard = discard.set(collectionKey, collection);
            }
        });
        if (emitOnDiscard) {
            discard.forEach((collection, collectionKey) => {
                toBeEmitted = toBeEmitted.push([collectionKey, collection]);
            });
        }
        this.collections = keep;
        return toBeEmitted;
    }
    getEventGroups(event) {
        // Window the data
        const windowKeyList = this.options.window.getIndexSet(time_1.time(event.timestamp())).toList();
        let fn;
        // Group the data
        if (this.group) {
            if (_.isFunction(this.group)) {
                fn = this.group;
            }
            else {
                const fieldSpec = this.group;
                const fs = util_1.default.fieldAsArray(fieldSpec);
                fn = e => e.get(fs);
            }
        }
        const groupKey = fn ? fn(event) : null;
        return windowKeyList.map(windowKey => (groupKey ? `${groupKey}::${windowKey}` : `${windowKey}`));
    }
}
exports.WindowedCollection = WindowedCollection;
function windowFactory(arg1, arg2) {
    return new WindowedCollection(arg1, arg2);
}
exports.windowed = windowFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvd2luZG93ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFHNUIsaUNBQThCO0FBQzlCLHFDQUE0QztBQUM1QyxtQ0FBZ0M7QUFDaEMsdUNBQWdFO0FBQ2hFLG1DQUF1QztBQU12QyxpQ0FBb0M7QUFFcEMsaUNBQTBCO0FBRTFCLG1DQVNpQjtBQWVqQix3QkFBK0MsU0FBUSxXQUFJO0lBeUN2RCxZQUFZLElBQVMsRUFBRSxJQUFVLEVBQUUsSUFBVTtRQUN6QyxLQUFLLEVBQUUsQ0FBQztRQUNSLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUM1QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsT0FBTyxHQUFHLElBQXdCLENBQUM7WUFFeEMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLFdBQVcsR0FBRyxJQUFrRCxDQUFDO2dCQUV2RSw4REFBOEQ7Z0JBQzlELCtEQUErRDtnQkFDL0Qsa0VBQWtFO2dCQUNsRSxrRUFBa0U7Z0JBQ2xFLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNyQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ1AsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNOzZCQUM3QixXQUFXLENBQUMsV0FBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FB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