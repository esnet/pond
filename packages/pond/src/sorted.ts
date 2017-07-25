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

import { Collection } from "./collection";
import { Event } from "./event";
import { Key } from "./key";

import { DedupFunction } from "./types";

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
export class SortedCollection<T extends Key> extends Collection<T> {
    /**
     * Construct a new `Sorted Collection` (experimental)
     */
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>) {
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
    public map<M extends Key>(
        mapper: (event?: Event<T>, index?: number) => Event<M>
    ): SortedCollection<M> {
        const remapped = this._events.map(mapper);
        return new SortedCollection<M>(Immutable.List<Event<M>>(remapped));
    }

    /**
     * Returns the index that `bisect`'s the `TimeSeries` at the time specified.
     */
    public bisect(t: Date, b?: number): number {
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
            } else if (ts === tms) {
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
    static is(collection1: SortedCollection<Key>, collection2: SortedCollection<Key>) {
        let result = true;
        collection1.forEach((e, k) => {
            result = result && Event.is(e, collection2.at(k));
        });
        return result;
    }

    protected clone(events, keyMap): Collection<T> {
        const c = new SortedCollection<T>();
        c._events = events;
        c._keyMap = keyMap;
        return c;
    }

    /**
     * If our new `Event` was added at the end, then we don't have anything to maintain.
     * However, if the `Event` would otherwise be out of order then we sort the `Collection`.
     */
    protected onEventAdded(events: Immutable.List<Event<T>>): Immutable.List<Event<T>> {
        const size = events.size;
        if (size > 1 && events.get(size - 2).begin() > events.get(size - 1).begin()) {
            return events.sortBy(event => +event.getKey().timestamp());
        }
        return events;
    }
}

function sortedCollectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>) {
    return new SortedCollection<T>(arg1);
}

export { sortedCollectionFactory as sortedCollection };
