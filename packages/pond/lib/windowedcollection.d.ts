import * as Immutable from "immutable";
import { Base } from "./base";
import { Event } from "./event";
import { GroupedCollection, GroupingFunction } from "./groupedcollection";
import { Index } from "./index";
import { Key } from "./key";
import { SortedCollection } from "./sortedcollection";
import { AggregationSpec, KeyedCollection, WindowingOptions } from "./types";
/**
 * A map of `SortedCollection`s indexed by a string key representing a window.
 */
export declare class WindowedCollection<T extends Key> extends Base {
    protected collections: Immutable.Map<string, SortedCollection<T>>;
    protected options: WindowingOptions;
    protected group: string | string[] | GroupingFunction<T>;
    private triggerThreshold;
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
    constructor(windowing: WindowingOptions, collectionMap: Immutable.Map<string, SortedCollection<T>>);
    constructor(windowing: WindowingOptions, collection?: SortedCollection<T>);
    constructor(windowing: WindowingOptions, group: string | string[], collection?: SortedCollection<T>);
    /**
     * Fetch the `SortedCollection` of `Event`s contained in the windowed grouping
     */
    get(key: string): SortedCollection<T>;
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
    aggregate(aggregationSpec: AggregationSpec<T>): GroupedCollection<Index>;
    /**
     * Collects all `Event`s from the groupings and returns them placed
     * into a single `SortedCollection`.
     */
    flatten(): SortedCollection<T>;
    /**
     * Removes any grouping present, returning an Immutable.Map
     * mapping just the window to the `SortedCollection`.
     */
    ungroup(): Immutable.Map<string, SortedCollection<T>>;
    addEvent(event: Event<T>): Immutable.List<KeyedCollection<T>>;
    private getEventGroups(event);
}
declare function windowFactory<T extends Key>(collectionMap: Immutable.Map<string, SortedCollection<T>>): any;
declare function windowFactory<T extends Key>(windowOptions: WindowingOptions, collectionMap?: Immutable.Map<string, SortedCollection<T>>): any;
declare function windowFactory<T extends Key>(windowOptions: WindowingOptions, initialCollection?: SortedCollection<T>): any;
declare function windowFactory<T extends Key>(windowOptions: WindowingOptions, group: string | string[], initialCollection?: SortedCollection<T>): any;
export { windowFactory as windowed };
