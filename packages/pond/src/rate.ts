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
import * as _ from "lodash";

import { Event } from "./event";
import { Key } from "./key";
import { Processor } from "./processor";
import { TimeRange, timerange } from "./timerange";
import util from "./util";

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
 *  * `fieldSeparator` - the separator used in the `fieldSpec` (defaults to ".")
 *  * `allowNegative` - allow emit of negative rates
 */
export class Rate<T extends Key> extends Processor<T, TimeRange> {
    // Internal state
    private fieldSpec: string[];
    private fieldSeparator: string;
    private allowNegative: boolean;

    private previous: Event<T>;

    constructor(options: RateOptions) {
        super();
        const { fieldSpec, allowNegative = false, fieldSeparator = "." } = options;

        // Options
        this.fieldSpec = _.isString(fieldSpec) ? [fieldSpec] : fieldSpec;
        this.fieldSeparator = fieldSeparator;
        this.allowNegative = allowNegative;

        // Previous event
        this.previous = null;
    }

    /**
     * Perform the rate operation on the `Event` and the the `_previous`
     * `Event` and emit the result.
     */
    public addEvent(event: Event<T>): Immutable.List<Event<TimeRange>> {
        const eventList = new Array<Event<TimeRange>>();

        if (!this.previous) {
            this.previous = event;
            return Immutable.List<Event<TimeRange>>();
        }

        const rate = this.getRate(event);
        if (rate) {
            eventList.push(rate);
        }

        this.previous = event;

        return Immutable.List(eventList);
    }

    /**
     * Generate a new `TimeRangeEvent` containing the rate per second
     * between two events.
     */
    private getRate(event: Event<T>): Event<TimeRange> {
        let d = Immutable.Map<string, any>();

        const previousTime = this.previous.timestamp().getTime();
        const currentTime = event.timestamp().getTime();
        const deltaTime = (currentTime - previousTime) / 1000;

        this.fieldSpec.forEach(path => {
            const fieldPath = util.fieldAsArray(path, this.fieldSeparator);
            const ratePath = fieldPath.slice();
            ratePath[ratePath.length - 1] += "_rate";

            const previousVal = this.previous.get(fieldPath);
            const currentVal = event.get(fieldPath);

            let rate = null;

            if (_.isNumber(currentVal) && _.isNumber(previousVal)) {
                // Calculate the rate
                rate = (currentVal - previousVal) / deltaTime;
            } else if (
                (previousVal !== null && !_.isNumber(previousVal)) ||
                (currentVal !== null && !_.isNumber(currentVal))
            ) {
                // Only issue warning if the current or previous values are bad
                // i.e. not a number or not null (null values result in null output)
                console.warn(`Event field "${fieldPath}" is a non-numeric or non-null value`);
            }

            d =
                this.allowNegative === false && rate < 0
                    ? (d = d.setIn(ratePath, null)) // don't allow negative differentials in certain cases
                    : (d = d.setIn(ratePath, rate));
        });

        return new Event(timerange(previousTime, currentTime), d);
    }
}
