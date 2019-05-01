/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
import * as Immutable from "immutable";
import { Event } from "./event";
import { Key } from "./key";
import { Processor } from "./processor";
import { TimeRange } from "./timerange";
import { RateOptions } from "./types";
/**
 * A `Processor` to take the derivative of the incoming `Event`s
 * for the given fields. The resulting output `Event`s will contain
 * per second values.
 *
 * Optionally you can substitute in `null` values if the rate is negative.
 * This is useful when a negative rate would be considered invalid like an
 * ever increasing counter.
 *
 * To control the rate calculation you need to specify a `RateOptions` object
 * in the constuctor, which takes the following form:
 * ```
 * {
 *     fieldSpec: string | string[];
 *     allowNegative?: boolean;
 * }
 * ```
 * Options:
 *  * `fieldSpec` - the field to calculate the rate on
 *  * `allowNegative` - allow emit of negative rates
 */
export declare class Rate<T extends Key> extends Processor<T, TimeRange> {
  private _fieldSpec;
  private _allowNegative;
  private _previous;
  constructor(options: RateOptions);
  /**
   * Perform the rate operation on the `Event` and the the `_previous`
   * `Event` and emit the result.
   */
  addEvent(event: Event<T>): Immutable.List<Event<TimeRange>>;
  /**
   * Generate a new `TimeRangeEvent` containing the rate per second
   * between two events.
   */
  private getRate;
}
