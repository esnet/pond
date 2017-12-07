import * as Immutable from "immutable";
import { Event } from "./event";
import { Key } from "./key";
import { SortedCollection } from "./sortedcollection";
import { TimeRange } from "./timerange";
import { WindowedCollection } from "./windowedcollection";
import { Aggregation, AlignmentOptions, RateOptions, WindowingOptions } from "./types";
/**
 * Example:
 * ```
 * const spec: AggregationSpec = {
 *    in_avg: ["in", avg(), "bob"],
 *    out_avg: ["out", avg()],
 * };
 * ```
 */
export interface AggregationSpec<T extends Key> {
    [dest: string]: Aggregation<T>;
}
export declare type GroupingFunction<T extends Key> = (e: Event<T>) => string;
/**
 * Represents an association of group names to `Collection`s. Typically
 * this is the resulting representation of performing a `groupBy()` on
 * a `Collection`.
 */
export declare class GroupedCollection<T extends Key> {
    protected collections: Immutable.Map<string, SortedCollection<T>>;
    /**
     * Builds a new Grouping from a `fieldSpec` and a `Collection`. This grouping
     * is represented as a map from a string group name to a `Collection`.
     *
     * While you could create a `GroupedCollection` using its constructor, or
     * the `grouped()` factory function, however more typically this is
     * the result of a `groupBy()` on a `Collection`.
     *
     * Grouping is not currently supported for streaming, if you need that it is most
     * likely at the input end of a processing chain and the best approach is to just
     * manually direct events into different chains based on the group.
     *
     * Example:
     * ```
     * const eventCollection = new Collection(
     *     Immutable.List([
     *         event(time("2015-04-22T02:28:00Z"), map({ team: "raptors", score: 3 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "raptors", score: 4 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "raptors", score: 5 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "wildcats", score: 3 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "wildcats", score: 4 })),
     *         event(time("2015-04-22T02:31:00Z"), map({ team: "wildcats", score: 6 }))
     *      ])
     *  );
     *  const everyThirtyMinutes = window(duration("30m"));
     *  const windowedCollection = eventCollection
     *      .groupBy("team")
     *      .window({ window: everyThirtyMinutes });
     *  ```
     * In this example the result of the `.groupBy()` will be the `GroupedCollection`
     * and the result of calling `window()` on this will be a `WindowedCollection`.
     */
    constructor(collectionMap: Immutable.Map<string, SortedCollection<T>>);
    constructor(fieldSpec: string | string[] | GroupingFunction<T>, collection: SortedCollection<T>);
    /**
     * Gets the `Collection` contained in the `grouping` specified.
     */
    get(grouping: string): SortedCollection<T>;
    /**
     * Aggregate per grouping, essentially forming a map from the group name
     * to the aggregate of the former `Collection` associated with that group name.
     *
     * Example:
     * ```
     * const eventCollection = new Collection(
     *     Immutable.List([
     *         event(time("2015-04-22T02:28:00Z"), map({ team: "raptors", score: 3 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "raptors", score: 4 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "raptors", score: 5 })),
     *         event(time("2015-04-22T02:29:00Z"), map({ team: "wildcats", score: 3 })),
     *         event(time("2015-04-22T02:30:00Z"), map({ team: "wildcats", score: 4 })),
     *         event(time("2015-04-22T02:31:00Z"), map({ team: "wildcats", score: 6 }))
     *     ])
     * );
     *
     * const rolledUp = eventCollection
     *     .groupBy("team")
     *     .aggregate({
     *         team: ["team", keep()],
     *         total: ["score", sum()]
     *     });
     *
     * const raptorsTotal = rolledUp.get("raptors").get("total");   // 12
     * const wildcatsTotal = rolledUp.get("wildcats").get("total"); // 13
     * ```
     */
    aggregate(aggregationSpec: AggregationSpec<T>): Immutable.Map<string, Immutable.Map<string, any>>;
    /**
     * Forms a single group from this `GroupedCollection`, returning a new
     * `GroupedCollection` with a single key `_` mapping to a `Collection`
     * containing all `Event`s in all the previous `Collection`s.
     */
    ungroup(): GroupedCollection<T>;
    /**
     * Forms a single `Collection` from this `GroupedCollection`. That
     * `Collection` will containing all `Event`s in all the previously
     * grouped `Collection`s.
     */
    flatten(): SortedCollection<T>;
    /**
     * Further groups this `GroupedCollection` per window, returning a
     * `WindowedCollection`. This allows you then to first `groupBy()`
     * a `Collection` and then further group by a window.
     *
     * The options are passed as a `WindowOptions` structure, but essentially
     * in the context of chaining `Collections` together this really just needs
     * to contain the `{ window: w }` where `w` here would be a `window` object
     * of some sort.
     *
     * Example:
     * ```
     * const w = window(duration("30m"));
     * const windowedCollection = eventCollection
     *     .groupBy("team")
     *     .window({ window: w });
     * ```
     */
    window(windowOptions: WindowingOptions): WindowedCollection<T>;
    /**
     * Runs the `align()` method on each grouped `Collection`.
     */
    align(options: AlignmentOptions): GroupedCollection<T>;
    /**
     * Runs the `rate()` method on each grouped `Collection`.
     */
    rate(options: RateOptions): GroupedCollection<TimeRange>;
}
declare function groupedFactory<T extends Key>(fieldSpec: string | string[] | GroupingFunction<T>, collection: SortedCollection<T>): GroupedCollection<T>;
export { groupedFactory as grouped };
