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
                this.collections = collections.flatMap((collection, groupKey) => {
                    return collection
                        .eventList()
                        .groupBy(e => index_1.Index.getIndexString(this.options.window.toString(), e.timestamp()))
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
                        .groupBy(e => index_1.Index.getIndexString(this.options.window.toString(), e.timestamp()))
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
        }
        // Find the latest timestamp in the collections. The result of this will be a timestamp
        // on the end boundary of the latest collection produced above
        this.collections.forEach(c => {
            const end = c.timerange().end();
            if (!this.triggerThreshold) {
                this.triggerThreshold = end;
            }
            else if (this.triggerThreshold.getTime() < end.getTime()) {
                this.triggerThreshold = end;
            }
        });
    }
    /**
     * Fetch the Collection of events contained in the windowed grouping
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
        const mapping = eventMap.map(eventList => new collection_1.Collection(eventList));
        return new grouped_1.GroupedCollection(mapping);
    }
    flatten() {
        let events = Immutable.List();
        this.collections.flatten().forEach(collection => {
            events = events.concat(collection.eventList());
        });
        return new collection_1.Collection(events);
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
        let keyedCollections = Immutable.List();
        const discardWindows = true;
        const emitOnDiscard = this.options.trigger === types_1.Trigger.onDiscardedWindow;
        const emitEveryEvent = this.options.trigger === types_1.Trigger.perEvent;
        const key = this.groupEvent(event);
        // Add event to an existing collection or a new collection
        let targetCollection;
        let createdCollection = false;
        if (this.collections.has(key)) {
            targetCollection = this.collections.get(key);
        }
        else {
            targetCollection = new collection_1.Collection(Immutable.List());
            createdCollection = true;
        }
        this.collections = this.collections.set(key, targetCollection.addEvent(event));
        // Emit
        if (emitEveryEvent) {
            keyedCollections = keyedCollections.push([key, this.collections.get(key)]);
        }
        let trigger = false;
        if (!this.triggerThreshold || +event.timestamp() >= +this.triggerThreshold) {
            if (this.triggerThreshold) {
                trigger = true;
            }
            const newTriggerThreshold = util_1.default.timeRangeFromIndexString(key, true).end();
            this.triggerThreshold = newTriggerThreshold;
        }
        const currentWindowKey = index_1.Index.getIndexString(this.options.window.toString(), event.timestamp());
        if (trigger) {
            let keep = Immutable.Map();
            let discard = Immutable.Map();
            this.collections.forEach((collection, collectionKey) => {
                const [_, w] = collectionKey.split("::").length > 1
                    ? collectionKey.split("::")
                    : [null, collectionKey];
                if (w === currentWindowKey) {
                    keep = keep.set(collectionKey, collection);
                }
                else {
                    discard = discard.set(collectionKey, collection);
                }
            });
            if (emitOnDiscard) {
                discard.forEach((collection, collectionKey) => {
                    keyedCollections = keyedCollections.push([collectionKey, collection]);
                });
            }
            this.collections = keep;
        }
        return keyedCollections;
    }
    groupEvent(event) {
        // Window the data
        const windowKey = index_1.Index.getIndexString(this.options.window.toString(), event.timestamp());
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
        return groupKey ? `${groupKey}::${windowKey}` : `${windowKey}`;
    }
}
exports.WindowedCollection = WindowedCollection;
function windowFactory(arg1, arg2) {
    return new WindowedCollection(arg1, arg2);
}
exports.windowed = windowFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvd2luZG93ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFFNUIsaUNBQThCO0FBRzlCLDZDQUEwQztBQUMxQyxtQ0FBZ0M7QUFDaEMsdUNBQWdFO0FBQ2hFLG1DQUF1QztBQVV2QyxpQ0FBMEI7QUFFMUIsbUNBU2lCO0FBZWpCLHdCQUErQyxTQUFRLFdBQUk7SUFrQ3ZELFlBQVksSUFBUyxFQUFFLElBQVUsRUFBRSxJQUFVO1FBQ3pDLEtBQUssRUFBRSxDQUFDO1FBQ1IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBd0IsQ0FBQztZQUN4QyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sV0FBVyxHQUFHLElBQTRDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxRQUFRO29CQUN4RCxNQUFNLENBQUMsVUFBVTt5QkFDWixTQUFTLEVBQUU7eUJBQ1gsT0FBTyxDQUFDLENBQUMsSUFDTixhQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUN0RTt5QkFDQSxLQUFLLEVBQUU7eUJBQ1AsR0FBRyxDQUFDLE1BQU0sSUFBSSxJQUFJLHVCQUFVLENBQUMsTUFBTSxD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