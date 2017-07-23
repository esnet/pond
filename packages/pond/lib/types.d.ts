import * as Immutable from "immutable";
import { Collection } from "./collection";
import { Event } from "./event";
import { Key } from "./key";
import { Period } from "./period";
/**
 * A mapping from string to list of numbers
 */
export interface ValueListMap {
    [s: string]: number[];
}
/**
 * A mapping from string to number
 */
export interface ValueMap {
    [s: string]: number[];
}
/**
 * When relating a `TimeRange` to a `Time` this enum lets you specify where
 * in the `TimeRange` you mean:
 *  * `Begin`
 *  * `Middle`
 *  * `End`
 */
export declare enum TimeAlignment {
    Begin = 1,
    Middle = 2,
    End = 3,
}
/**
 * Rate of emit from within a stream:
 *  * `perEvent` - an updated `Collection` is emitted on each new `Event`
 *  * `onDiscardedWindow` - an updated `Collection` is emitted whenever a window is no longer used
 */
export declare enum Trigger {
    perEvent = 1,
    onDiscardedWindow = 2,
}
/**
 * Method of interpolation used by the `align()` function:
 *  * `Hold` - Emits the last known good value at alignment boundaries
 *  * `Linear` - Emits linearly interpolated values at alignment boundaries
 */
export declare enum AlignmentMethod {
    Hold = 1,
    Linear = 2,
}
/**
 * An enum which controls the WindowType for aggregation. This can
 * essentially be a Fixed window, which is a window for each `Period`
 * (e.g. every hour), or calendar style periods such as Day, Month
 * and Year.
 *  * Fixed
 *  * Day
 *  * Month
 *  * Year
 */
export declare enum WindowType {
    Global = 1,
    Fixed = 2,
    Day = 3,
    Month = 4,
    Year = 5,
}
/**
 * Options object expected by the `align()` function:
 *  * `fieldSpec` - the field to align
 *  * `window` - the `Period` of the window whose boundaries we want to align to
 *  * `method` - the interpolation method, one of `AlignmentMethod.Hold` or `AlignmentMethod.Linear`
 *  * `limit` - the number of boundaries to align to without a new Event, before emitting `null` on
 *              the boundaries
 */
export interface AlignmentOptions {
    fieldSpec: string | string[];
    window: Period;
    method?: AlignmentMethod;
    limit?: number;
}
/**
 * Options object passed to the `collapse()` function:
 *  * `fieldSpecList` - the list of fields to collapse
 *  * `fieldName` - the new field's name
 *  * `reducer()` - a function to collapse using e.g. `avg()`
 *  * `append` - to include only the new field, or include it in addition to the previous fields.
 */
export interface CollapseOptions {
    fieldSpecList: string[];
    fieldName: string;
    reducer: any;
    append: boolean;
}
/**
 * Option object passed to the `rate()` function:
 *  * fieldSpec - the field to calculate the rate on
 *  * allowNegative - allow emit of negative rates
 */
export interface RateOptions {
    fieldSpec: string | string[];
    allowNegative?: boolean;
}
/**
 * A function that takes a list of `Event`s and returns a new `Event`.
 * When deduping a `Collection` or `TimeSeries` a `DedupFunction` can be
 * supplied to let you control the de-duplication result. It will
 * be called with all `Event`s which are considered duplicates and
 * the result you return will be the `Event` that those `Event`s will
 * be replaced with.
 */
export declare type DedupFunction<T extends Key> = (events: Immutable.List<Event<T>>) => Event<T>;
/**
 * A function which takes a list of numbers and returns a single number.
 */
export declare type ReducerFunction = (values: number[]) => number;
/**
 * Tuple mapping a string -> `ReducerFunction`
 * e.g. `["value", avg()]`
 */
export declare type AggregationTuple = [string, ReducerFunction];
/**
 * An alternative to the `AggregationTuple` where you can specify a function to
 * generate the resulting aggregation given the full `Collection` as input.
 */
export declare type AggregationMapFunction<T extends Key> = (collection: Collection<T>) => any;
/**
 * A general aggregation specification, either as a `AggregationTuple` or
 * `AggregationMapFunction`. Your choice.
 */
export declare type Aggregation<T extends Key> = AggregationTuple | AggregationMapFunction<T>;
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
