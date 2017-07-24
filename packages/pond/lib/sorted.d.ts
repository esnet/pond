import * as Immutable from "immutable";
import { Collection } from "./collection";
import { Event } from "./event";
import { Key } from "./key";
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
export declare class SortedCollection<T extends Key> extends Collection<T> {
    /**
     * Construct a new `Sorted Collection` (experimental)
     */
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>);
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
    map<M extends Key>(mapper: (event?: Event<T>, index?: number) => Event<M>): SortedCollection<M>;
    /**
     * Returns the index that `bisect`'s the `TimeSeries` at the time specified.
     */
    bisect(t: Date, b?: number): number;
    /**
     * Static function to compare two collections to each other. If the collections
     * are of the same value as each other then equals will return true.
     */
    static is(collection1: SortedCollection<Key>, collection2: SortedCollection<Key>): boolean;
    protected clone(events: any, keyMap: any): Collection<T>;
    /**
     * If our new `Event` was added at the end, then we don't have anything to maintain.
     * However, if the `Event` would otherwise be out of order then we sort the `Collection`.
     */
    protected onEventAdded(events: Immutable.List<Event<T>>): Immutable.List<Event<T>>;
}
declare function sortedCollectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>): SortedCollection<T>;
export { sortedCollectionFactory as sortedCollection };
