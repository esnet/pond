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

import { Align } from "./align";
import { Base } from "./base";
import { Event } from "./event";
import { GroupedCollection, GroupingFunction } from "./groupedcollection";
import { Index, index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Processor } from "./processor";
import { Rate } from "./rate";
import { SortedCollection } from "./sortedcollection";
import { Time, time } from "./time";
import { timerange, TimeRange } from "./timerange";

import util from "./util";

import {
    AggregationSpec,
    AggregationTuple,
    AlignmentOptions,
    DedupFunction,
    KeyedCollection,
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

/**
 * A map of `SortedCollection`s indexed by a string key representing a window.
 */
export class WindowedCollection<T extends Key> extends Base {
    protected collections: Immutable.Map<string, SortedCollection<T>>;
    protected options: WindowingOptions;
    protected group: string | string[] | GroupingFunction<T>;

    private triggerThreshold: Date;

    /**
     * Builds a new grouping that is based on a window period. This is combined
     * with any groupBy to divide the events among multiple `SortedCollection`s, one
     * for each group and window combination.
     *
     * The main way to construct a `WindowedCollection` is to pass in a "window"
     * defined as a `Period` and a "group", which can be a field to group by, or
     * a function that can be called to do the grouping. Optionally, you may pass
     * in a `SortedCollection` of initial `Event`s to group, as is the case when this is
     * used in a batch context.
     *
     * As an `Event` is added via `addEvent()`, the windowing and grouping will be
     * applied to it and it will be appended to the appropiate `SortedCollection`,
     * or a new `SortedCollection` will be created.
     *
     * The other way to construct a `WindowedCollection` is by passing in a map
     * of group name to `SortedCollection`. This is generally used if there are are
     * events already grouped and you want to apply a window group on top of that.
     * This is the case when calling `GroupedCollection.window()`.
     */
    constructor(collectionMap: Immutable.Map<string, SortedCollection<T>>);
    constructor(
        windowing: WindowingOptions,
        collectionMap: Immutable.Map<string, SortedCollection<T>>
    );
    constructor(windowing: WindowingOptions, collection?: SortedCollection<T>);
    constructor(
        windowing: WindowingOptions,
        group: string | string[],
        collection?: SortedCollection<T>
    );
    constructor(arg1: any, arg2?: any, arg3?: any) {
        super();
        if (Immutable.Map.isMap(arg1)) {
            this.collections = arg1;
        } else {
            this.options = arg1 as WindowingOptions;

            if (Immutable.Map.isMap(arg2)) {
                const collections = arg2 as Immutable.Map<string, SortedCollection<T>>;

                // Rekey all the events in the collections with a new key that
                // combines their existing group with the windows they fall in.
                // An event could fall into 0, 1 or many windows, depending on the
                // window's period and duration, as supplied in the `WindowOptions`.
                let remapped = Immutable.List();
                collections.forEach((c, k) => {
                    c.forEach(e => {
                        const groups = this.options.window
                            .getIndexSet(time(e.timestamp()))
                            .toList();
                        groups.forEach(g => {
                            remapped = remapped.push([`${k}::${g.asString()}`, e]);
                        });
                    });
                });

                this.collections = remapped
                    .groupBy(e => e[0])
                    .map(eventList => eventList.map(kv => kv[1]))
                    .map(eventList => new SortedCollection<T>(eventList.toList()))
                    .toMap();
            } else {
                let collection;
                if (_.isString(arg2) || _.isArray(arg2)) {
                    this.group = util.fieldAsArray(arg2 as string | string[]);
                    collection = arg3 as SortedCollection<T>;
                } else {
                    collection = arg2 as SortedCollection<T>;
                }

                if (collection) {
                    throw new Error("Unimplemented");
                } else {
                    this.collections = Immutable.Map<string, SortedCollection<T>>();
                }
            }
        }
    }

    /**
     * Fetch the `SortedCollection` of `Event`s contained in the windowed grouping
     */
    get(key: string): SortedCollection<T> {
        return this.collections.get(key);
    }

    /**
     * Example:
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
        const mapping = eventMap.map(eventList => new SortedCollection<Index>(eventList));
        return new GroupedCollection<Index>(mapping);
    }

    /**
     * Collects all `Event`s from the groupings and returns them placed
     * into a single `SortedCollection`.
     */
    public flatten(): SortedCollection<T> {
        let events = Immutable.List<Event<T>>();
        this.collections.flatten().forEach(collection => {
            events = events.concat(collection.eventList());
        });
        return new SortedCollection<T>(events);
    }

    /**
     * Removes any grouping present, returning an Immutable.Map
     * mapping just the window to the `SortedCollection`.
     */
    public ungroup(): Immutable.Map<string, SortedCollection<T>> {
        const result = Immutable.Map<string, SortedCollection<T>>();
        this.collections.forEach((collection, key) => {
            const newKey = key.split("::")[1];
            result[newKey] = collection;
        });
        return result;
    }

    addEvent(event: Event<T>): Immutable.List<KeyedCollection<T>> {
        let toBeEmitted = Immutable.List<KeyedCollection<T>>();

        const discardWindows = true;
        const emitOnDiscard = this.options.trigger === Trigger.onDiscardedWindow;
        const emitEveryEvent = this.options.trigger === Trigger.perEvent;

        const keys: Immutable.List<string> = this.getEventGroups(event);

        // Add event to an existing collection(s) or a new collection(s)
        keys.forEach(key => {
            // Add event to collection referenced by this key
            let targetCollection: SortedCollection<T>;
            let createdCollection = false;
            if (this.collections.has(key)) {
                targetCollection = this.collections.get(key);
            } else {
                targetCollection = new SortedCollection<T>(Immutable.List());
                createdCollection = true;
            }
            this.collections = this.collections.set(key, targetCollection.addEvent(event));

            // Push onto the emit list
            if (emitEveryEvent) {
                toBeEmitted = toBeEmitted.push([key, this.collections.get(key)]);
            }
        });

        // Discard past collections
        let keep = Immutable.Map<string, SortedCollection<T>>();
        let discard = Immutable.Map<string, SortedCollection<T>>();
        this.collections.forEach((collection, collectionKey) => {
            const [__, windowKey] =
                collectionKey.split("::").length > 1
                    ? collectionKey.split("::")
                    : [null, collectionKey];
            if (+event.timestamp() < +util.timeRangeFromIndexString(windowKey).end()) {
                keep = keep.set(collectionKey, collection);
            } else {
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

    private getEventGroups(event: Event<T>): Immutable.List<string> {
        // Window the data
        const windowKeyList = this.options.window.getIndexSet(time(event.timestamp())).toList();
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
        return windowKeyList.map(
            windowKey => (groupKey ? `${groupKey}::${windowKey}` : `${windowKey}`)
        );
    }
}

function windowFactory<T extends Key>(collectionMap: Immutable.Map<string, SortedCollection<T>>);
function windowFactory<T extends Key>(
    windowOptions: WindowingOptions,
    collectionMap?: Immutable.Map<string, SortedCollection<T>>
);
function windowFactory<T extends Key>(
    windowOptions: WindowingOptions,
    initialCollection?: SortedCollection<T> // tslint:disable-line:unified-signatures
);
function windowFactory<T extends Key>(
    windowOptions: WindowingOptions,
    group: string | string[],
    initialCollection?: SortedCollection<T>
);
function windowFactory<T extends Key>(arg1: any, arg2?: any) {
    return new WindowedCollection<T>(arg1, arg2);
}

export { windowFactory as windowed };
