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
import { Period } from "./period";
import { TimeSeries } from "./timeseries";
import { Window, WindowBase } from "./window";

//
// General types
//

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

//
// Enums
//

/**
 * When relating a `TimeRange` to a `Time` this enum lets you specify where
 * in the `TimeRange` you mean:
 *  * `Begin`
 *  * `Middle`
 *  * `End`
 */
export enum TimeAlignment {
    Begin = 1,
    Middle,
    End
}

/**
 * Rate of emit from within a stream:
 *  * `perEvent` - an updated `Collection` is emitted on each new `Event`
 *  * `onDiscardedWindow` - an updated `Collection` is emitted whenever a window is no longer used
 */
export enum Trigger {
    perEvent = 1,
    onDiscardedWindow
}

/**
 * Method of interpolation used by the `align()` function:
 *  * `Hold` - Emits the last known good value at alignment boundaries
 *  * `Linear` - Emits linearly interpolated values at alignment boundaries
 */
export enum AlignmentMethod {
    Hold = 1,
    Linear
}

/**
 * Method of filling used by the `fill()` function:
 *  * `Hold` - Fill with the previous value
 *  * `Linear` - Fill between the last value and the next value linearly
 *  * `Zero` - Fill with 0
 */
export enum FillMethod {
    Zero = 1,
    Pad,
    Linear
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
    reducer?: ReducerFunction | ArrayReducer | ListReducer;
    fieldSpec?: string | string[];
    [propName: string]: any;
}

//
// Callback functions
//

/**
 * A function that takes a list of `Event`s and returns a new `Event`.
 * When deduping a `Collection` or `TimeSeries` a `DedupFunction` can be
 * supplied to let you control the de-duplication result. It will
 * be called with all `Event`s which are considered duplicates and
 * the result you return will be the `Event` that those `Event`s will
 * be replaced with.
 */
export type DedupFunction<T extends Key> = (events: Immutable.List<Event<T>>) => Event<T>;

/**
 * A function which takes a list of numbers and returns a single number.
 */
export type ReducerFunction = (values: number[]) => number;

/**
 * A function which combines an array of events into a new array of events
 */
export type ArrayReducer = (events: Array<Event<Key>>) => Array<Event<Key>>;

/**
 * A function which combines a list of events into a new list of events
 */
export type ListReducer = (events: Immutable.List<Event<Key>>) => Immutable.List<Event<Key>>;

//
// Aggregation specification
//

/**
 * Tuple mapping a string -> `ReducerFunction`
 * e.g. `["value", avg()]`
 */
export type AggregationTuple = [string, ReducerFunction];

/**
 * An alternative to the `AggregationTuple` where you can specify a function to
 * generate the resulting aggregation given the full `Collection` as input.
 */
export type AggregationMapFunction<T extends Key> = (collection: Collection<T>) => any;

/**
 * A general aggregation specification, either as a `AggregationTuple` or
 * `AggregationMapFunction`. Your choice.
 */
export type Aggregation<T extends Key> = AggregationTuple | AggregationMapFunction<T>;

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
