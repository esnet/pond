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
 *  * `allowNegative` - allow emit of negative rates
 */
export class Rate<T extends Key> extends Processor<T, TimeRange> {
    // Internal state
    private _fieldSpec: string[];
    private _allowNegative: boolean;

    private _previous: Event<T>;

    constructor(options: RateOptions) {
        super();
        const { fieldSpec, allowNegative = false } = options;

        // Options
        this._fieldSpec = _.isString(fieldSpec) ? [fieldSpec] : fieldSpec;
        this._allowNegative = allowNegative;

        // Previous event
        this._previous = null;
    }

    /**
     * Generate a new `TimeRangeEvent` containing the rate per second
     * between two events.
     */
    getRate(event): Event<TimeRange> {
        let d = Immutable.Map<string, any>();

        const previousTime = this._previous.timestamp().getTime();
        const currentTime = event.timestamp().getTime();
        const deltaTime = (currentTime - previousTime) / 1000;

        this._fieldSpec.forEach(path => {
            const fieldPath = util.fieldAsArray(path);
            const ratePath = fieldPath.slice();
            ratePath[ratePath.length - 1] += "_rate";

            const previousVal = this._previous.get(fieldPath);
            const currentVal = event.get(fieldPath);

            let rate = null;
            if (!_.isNumber(previousVal) || !_.isNumber(currentVal)) {
                // tslint:disable-next-line
                console.warn(`Path ${fieldPath} contains a non-numeric value or does not exist`);
            } else {
                rate = (currentVal - previousVal) / deltaTime;
            }

            if (this._allowNegative === false && rate < 0) {
                // don't allow negative differentials in certain cases
                d = d.setIn(ratePath, null);
            } else {
                d = d.setIn(ratePath, rate);
            }
        });

        return new Event(timerange(previousTime, currentTime), d);
    }

    /**
     * Perform the rate operation on the `Event` and the the `_previous`
     * `Event` and emit the result.
     */
    addEvent(event: Event<T>): Immutable.List<Event<TimeRange>> {
        const eventList = new Array<Event<TimeRange>>();

        if (!this._previous) {
            this._previous = event;
            return Immutable.List<Event<TimeRange>>();
        }

        const rate = this.getRate(event);
        if (rate) {
            eventList.push(rate);
        }

        this._previous = event;

        return Immutable.List(eventList);
    }
}
