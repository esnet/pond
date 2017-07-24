import * as Immutable from "immutable";
import { Base } from "./base";
import { Collection } from "./collection";
import { Event } from "./event";
import { GroupedCollection, GroupingFunction } from "./grouped";
import { Index } from "./index";
import { Key } from "./key";
import { KeyedCollection } from "./stream";
import { AggregationSpec, WindowingOptions } from "./types";
export declare class WindowedCollection<T extends Key> extends Base {
    protected collections: Immutable.Map<string, Collection<T>>;
    protected options: WindowingOptions;
    protected group: string | string[] | GroupingFunction<T>;
    private triggerThreshold;
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
    /**
     * Fetch the Collection of events contained in the windowed grouping
     */
    get(key: string): Collection<T>;
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
    aggregate(aggregationSpec: AggregationSpec<T>): GroupedCollection<Index>;
    flatten(): Collection<T>;
    ungroup(): Immutable.Map<string, Collection<T>>;
    addEvent(event: Event<T>): Immutable.List<KeyedCollection<T>>;
    private groupEvent(event);
}
declare function windowFactory<T extends Key>(collectionMap: Immutable.Map<string, Collection<T>>): any;
declare function windowFactory<T extends Key>(windowOptions: WindowingOptions, collectionMap?: Immutable.Map<string, Collection<T>>): any;
declare function windowFactory<T extends Key>(windowOptions: WindowingOptions, initialCollection?: Collection<T>): any;
declare function windowFactory<T extends Key>(windowOptions: WindowingOptions, group: string | string[], initialCollection?: Collection<T>): any;
export { windowFactory as windowed };
