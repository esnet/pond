/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as Immutable from "immutable";
import * as _ from "lodash";

import { Base } from "./base";

import { Align } from "./align";
import { Collection } from "./collection";
import { Event } from "./event";
import { GroupedCollection, GroupingFunction } from "./grouped";
import { Index, index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Processor } from "./processor";
import { Rate } from "./rate";
import { Time } from "./time";
import { timerange, TimeRange } from "./timerange";

import { KeyedCollection } from "./stream";

import util from "./util";

import {
    AggregationSpec,
    AggregationTuple,
    AlignmentOptions,
    DedupFunction,
    RateOptions,
    ReducerFunction,
    Trigger,
    WindowingOptions
} from "./types";

import {
    avg,
    first,
    InterpolationType,
    last,
    max,
    median,
    min,
    percentile,
    stdev,
    sum
} from "./functions";

export class WindowedCollection<T extends Key> extends Base {
    protected collections: Immutable.Map<string, Collection<T>>;
    protected options: WindowingOptions;
    protected group: string | string[] | GroupingFunction<T>;

    private triggerThreshold: Date;

    /**
     * Builds a new grouping that is based on a window period. This is combined
     * with any groupBy to divide the events among multiple `Collection`s, one
     * for each group and window combination.
     *
     * The main way to construct a `WindowedCollection` is to pass in a "window"
     * defined as a `Period` and a "group", which can be a field to group by, or
     * a function that can be called to do the grouping. Optionally, you may pass
     * in a `Collection` of initial `Event`s to group, as is the case when this is
     * used in a batch context.
     *
     * As an `Event` is added to this `Processor`, via `addEvent()`, the windowing
     * and grouping will be applied to it and it will be appended to the appropiate
     * `Collection`, or a new `Collection` will be created.
     *
     * @TODO: Need hooks for removing old Collections and when to return new
     * aggregated events and when to not.
     *
     * The other way to construct a `WindowedCollection` is by passing in a map
     * of group name to Collection. This is generally used if there are are
     * events already grouped and you want to apply a window group on top of that.
     * This is the case when calling `window()` on a `GroupedCollection`.
     */
    constructor(collectionMap: Immutable.Map<string, Collection<T>>);
    constructor(windowing: WindowingOptions, collectionMap: Immutable.Map<string, Collection<T>>);
    constructor(windowing: WindowingOptions, collection?: Collection<T>);
    constructor(windowing: WindowingOptions, group: string | string[], collection?: Collection<T>);
    constructor(arg1: any, arg2?: any, arg3?: any) {
        super();
        if (Immutable.Map.isMap(arg1)) {
            this.collections = arg1;
        } else {
            this.options = arg1 as WindowingOptions;
            if (Immutable.Map.isMap(arg2)) {
                const collections = arg2 as Immutable.Map<string, Collection<T>>;
                this.collections = collections.flatMap((collection, groupKey) => {
                    return collection
                        .eventList()
                        .groupBy(e =>
                            Index.getIndexString(this.options.window.toString(), e.timestamp())
                        )
                        .toMap()
                        .map(events => new Collection(events.toList()))
                        .mapEntries(([key, _]) => [groupKey ? `${groupKey}::${key}` : `${key}`, _]);
                });
            } else {
                let collection;
                if (_.isString(arg2) || _.isArray(arg2)) {
                    this.group = util.fieldAsArray(arg2 as string | string[]);
                    collection = arg3 as Collection<T>;
                } else {
                    collection = arg2 as Collection<T>;
                }

                if (collection) {
                    this.collections = collection
                        .eventList()
                        .groupBy(e =>
                            Index.getIndexString(this.options.window.toString(), e.timestamp())
                        )
                        .toMap()
                        .map(events => new Collection(events.toList()))
                        .mapEntries(([window, e]) => [
                            this.group ? `${e.get(this.group)}::${window}` : `all::${window}`,
                            e
                        ]);
                } else {
                    this.collections = Immutable.Map<string, Collection<T>>();
                }
            }
        }

        // Find the latest timestamp in the collections. The result of this will be a timestamp
        // on the end boundary of the latest collection produced above
        this.collections.forEach(c => {
            const end = c.timerange().end();
            if (!this.triggerThreshold) {
                this.triggerThreshold = end;
            } else if (this.triggerThreshold.getTime() < end.getTime()) {
                this.triggerThreshold = end;
            }
        });
    }

    /**
     * Fetch the Collection of events contained in the windowed grouping
     */
    get(key: string): Collection<T> {
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
    aggregate(aggregationSpec: AggregationSpec<T>): GroupedCollection<Index> {
        let eventMap = Immutable.Map<string, Immutable.List<Event<Index>>>();
        this.collections.forEach((collection, group) => {
            const d = {};
            const [groupKey, windowKey] = group.split("::");
            _.forEach(aggregationSpec, (src: AggregationTuple, dest: string) => {
                const [srcField, reducer] = src;
                d[dest] = collection.aggregate(reducer, srcField);
            });
            const eventKey = index(windowKey);
            const indexedEvent = new Event<Index>(eventKey, Immutable.fromJS(d));
            if (!eventMap.has(groupKey)) {
                eventMap = eventMap.set(groupKey, Immutable.List());
            }
            eventMap = eventMap.set(groupKey, eventMap.get(groupKey).push(indexedEvent));
        });
        const mapping = eventMap.map(eventList => new Collection<Index>(eventList));
        return new GroupedCollection<Index>(mapping);
    }

    public flatten(): Collection<T> {
        let events = Immutable.List<Event<T>>();
        this.collections.flatten().forEach(collection => {
            events = events.concat(collection.eventList());
        });
        return new Collection<T>(events);
    }

    public ungroup(): Immutable.Map<string, Collection<T>> {
        const result = Immutable.Map<string, Collection<T>>();
        this.collections.forEach((collection, key) => {
            const newKey = key.split("::")[1];
            result[newKey] = collection;
        });
        return result;
    }

    addEvent(event: Event<T>): Immutable.List<KeyedCollection<T>> {
        let keyedCollections = Immutable.List<KeyedCollection<T>>();

        const discardWindows = true;
        const emitOnDiscard = this.options.trigger === Trigger.onDiscardedWindow;
        const emitEveryEvent = this.options.trigger === Trigger.perEvent;

        const key = this.groupEvent(event);

        // Add event to an existing collection or a new collection
        let targetCollection: Collection<T>;
        let createdCollection = false;
        if (this.collections.has(key)) {
            targetCollection = this.collections.get(key);
        } else {
            targetCollection = new Collection<T>(Immutable.List());
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
            const newTriggerThreshold = util.timeRangeFromIndexString(key, true).end();
            this.triggerThreshold = newTriggerThreshold;
        }

        const currentWindowKey = Index.getIndexString(
            this.options.window.toString(),
            event.timestamp()
        );

        if (trigger) {
            let keep = Immutable.Map<string, Collection<T>>();
            let discard = Immutable.Map<string, Collection<T>>();
            this.collections.forEach((collection, collectionKey) => {
                const [_, w] =
                    collectionKey.split("::").length > 1
                        ? collectionKey.split("::")
                        : [null, collectionKey];
                if (w === currentWindowKey) {
                    keep = keep.set(collectionKey, collection);
                } else {
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

    private groupEvent(event) {
        // Window the data
        const windowKey = Index.getIndexString(this.options.window.toString(), event.timestamp());
        let fn;
        // Group the data
        if (this.group) {
            if (_.isFunction(this.group)) {
                fn = this.group;
            } else {
                const fieldSpec = this.group as string | string[];
                const fs = util.fieldAsArray(fieldSpec);
                fn = e => e.get(fs);
            }
        }
        const groupKey = fn ? fn(event) : null;
        return groupKey ? `${groupKey}::${windowKey}` : `${windowKey}`;
    }
}

function windowFactory<T extends Key>(collectionMap: Immutable.Map<string, Collection<T>>);
function windowFactory<T extends Key>(
    windowOptions: WindowingOptions,
    collectionMap?: Immutable.Map<string, Collection<T>>
);
function windowFactory<T extends Key>(
    windowOptions: WindowingOptions,
    initialCollection?: Collection<T> // tslint:disable-line:unified-signatures
);
function windowFactory<T extends Key>(
    windowOptions: WindowingOptions,
    group: string | string[],
    initialCollection?: Collection<T>
);
function windowFactory<T extends Key>(arg1: any, arg2?: any) {
    return new WindowedCollection<T>(arg1, arg2);
}

export { windowFactory as windowed };
