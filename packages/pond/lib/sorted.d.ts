import * as Immutable from "immutable";
import { Collection } from "./collection";
import { Event } from "./event";
import { Key } from "./key";
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
export declare class SortedCollection<T extends Key> extends Collection<T> {
    /**
     * Construct a new Sorted Collection (experimental)
     */
    constructor(arg1?: Immutable.List<Event<T>> | Collection<T>);
    protected clone(events: any, keyMap: any): Collection<T>;
    /**
     * If our new Event was added at the end, then we don't have anything to maintain.
     * However, if the Event would otherwise be out of order then we sort the Collection.
     */
    protected onEventAdded(events: Immutable.List<Event<T>>): Immutable.List<Event<T>>;
}
declare function sortedCollectionFactory<T extends Key>(arg1?: Immutable.List<Event<T>> | Collection<T>): SortedCollection<T>;
export { sortedCollectionFactory as sortedCollection };
