import * as Immutable from "immutable";
import { Collection } from "./collection";
import { Event } from "./event";
import { Key } from "./key";
import { Period } from "./period";
import { TimeSeries } from "./timeseries";
import { WindowBase } from "./window";
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
    [s: string]: number;
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
 * Method of filling used by the `fill()` function:
 *  * `Hold` - Fill with the previous value
 *  * `Linear` - Fill between the last value and the next value linearly
 *  * `Zero` - Fill with 0
 */
export declare enum FillMethod {
    Zero = 1,
    Pad = 2,
    Linear = 3,
}
/**
 * Options object expected by the `reduce()` stream processor. The idea
 * of this processor is to take a list of Events, always of size `count`
 * (default is 1),
 * e.g.
 * ```
 * {
 *     count: 1,
 *     accumulator: event(time(), Immutable.Map({ total: 0 })),
 *     iteratee(accum, eventList) {
 *         const current = eventList.get(0);
 *         const total = accum.get("total") + current.get("count");
 *         return event(time(current.timestamp()), Immutable.Map({ total }));
 *     }
 * }
 * ```
 *  * count - The number of `Event`s to include on each call
 *  * reducer - a function mapping an `Immutable.List<Event>` to an `Event`
 *  * accumulator - an optional `Event` initial value
 */
export interface ReduceOptions<K extends Key> {
    count: number;
    accumulator?: Event<K>;
    iteratee: ListReducer<K>;
}
/**
 * Options object expected by the `coalesce()` stream processor. This
 * will take the latest of each field in `fields` and combine that into
 * a new `Event`.
 */
export interface CoalesceOptions {
    fields: string[];
}
/**
 * Options object expected by the `windowBy...()` functions. At this point,
 * this just defines the fixed window (e.g. window: period("1d")) and the
 * trigger for downstream notification, which can currently be either
 * on every incoming event, or whenever a window is about to be discarded.
 *  * `type` - the type of the window, currently either Fixed or Sliding
 *  * `window` - the size of the window, expressed as a `Period`
 *  * `trigger` - the output rate of the window, currently either
 *                Trigger.perEvent or Trigger.onDiscardedWindow
 */
export interface WindowingOptions {
    window: WindowBase;
    trigger?: Trigger;
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
    period: Period;
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
 * Options object expected by the `fill()` function:
 *  * `fieldSpec` - the field to fill
 *  * `method` - the interpolation method, one of
 *    `FillMethod.Hold`, `FillMethod.Pad` or `FillMethod.Linear`
 *  * `limit` - the number of missing values to fill before giving up
 */
export interface FillOptions {
    fieldSpec: string | string[];
    method?: FillMethod;
    limit?: number;
}
/**
 * Options object expected by the `fixedWindowRollup()` function:
 *  * `window` - the window specification. e.g. window(duration("6h"))
 *  * `aggregation` - the aggregation specification
 *  * `toTimeEvents` - Convert the rollup events to `TimeEvent`s, otherwise it
 *                     will be returned as a `TimeSeries` of `IndexedEvent`s
 */
export interface RollupOptions<T extends Key> {
    window: WindowBase;
    timezone?: string;
    aggregation?: AggregationSpec<T>;
    toTimeEvents?: boolean;
}
/**
 * Options object expected by the `select()` function:
 *  * `fields` - the fields to select out of the Event
 */
export interface SelectOptions {
    fields: string[];
}
/**
 * Options object expected by the `select()` function:
 *  * `fields` - the fields to select out of the Event
 */
export interface RenameColumnOptions {
    renameMap: {
        key: string;
        value: string;
    };
}
/**
 * Options object expected by the `TimeSeries` merge and reduce functions:
 *  * `seriesList` - A list of `TimeSeries` (required)
 *  * `reducer` - The reducer function e.g. `max()`
 *  * `fieldSpec` - Column or columns to reduce. If you
 *                  need to retrieve multiple deep
 *                  nested values that ['can.be', 'done.with',
 *                  'this.notation']. A single deep value with a
 *                  string.like.this.
 */
export interface TimeSeriesOptions {
    seriesList: Array<TimeSeries<Key>>;
    reducer?: ReducerFunction | ArrayMapper | ListMapper;
    fieldSpec?: string | string[];
    [propName: string]: any;
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
 * A function which combines an Array<Event<Key>> into a new Array<Event<Key>>
 */
export declare type ArrayMapper = (events: Array<Event<Key>>) => Array<Event<Key>>;
/**
 * A function which combines a list of `Event`s into a new list of `Event`s
 */
export declare type ListMapper = (events: Immutable.List<Event<Key>>) => Immutable.List<Event<Key>>;
/**
 * A function which combines a `Immutable.List<Event<Key>>` into a single `Event`
 */
export declare type ListReducer<T extends Key> = (accum: Event<T>, events: Immutable.List<Event<T>>) => Event<T>;
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
