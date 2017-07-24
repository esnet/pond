import * as Immutable from "immutable";
import { Collection } from "./collection";
import { Event } from "./event";
import { Key } from "./key";
import { TimeRange } from "./timerange";
import { WindowedCollection } from "./windowed";
import { Aggregation, AlignmentOptions, RateOptions, WindowingOptions } from "./types";
/**
 * @example
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
export declare class GroupedCollection<T extends Key> {
    protected collections: Immutable.Map<string, Collection<T>>;
    /**
     * Builds a new Grouping from a `fieldSpec` and a `Collection`
     */
    constructor(collectionMap: Immutable.Map<string, Collection<T>>);
    constructor(fieldSpec: string | string[] | GroupingFunction<T>, collection: Collection<T>);
    /**
     * Fetch the `Collection` of `Event`'s contained in the grouping
     */
    get(grouping: string): Collection<T>;
    /**
     *
     * @example
     * ```
     * grouped
     *     .aggregate({
     *         a_avg: [ "a", avg() ],
     *         b_avg: [ "b", avg() ],
     *     });
     * ```
     */
    aggregate(aggregationSpec: AggregationSpec<T>): Immutable.Map<string, Immutable.Map<string, any>>;
    ungroup(): GroupedCollection<T>;
    flatten(): Collection<T>;
    window(windowOptions: WindowingOptions): WindowedCollection<T>;
    align(options: AlignmentOptions): GroupedCollection<T>;
    rate(options: RateOptions): GroupedCollection<TimeRange>;
}
declare function groupedFactory<T extends Key>(fieldSpec: string | string[] | GroupingFunction<T>, collection: Collection<T>): GroupedCollection<T>;
export { groupedFactory as grouped };
