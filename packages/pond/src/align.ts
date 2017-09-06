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
import { Index } from "./index";
import { Key } from "./key";
import { Period } from "./period";
import { Processor } from "./processor";
import { time, Time } from "./time";
import { timerange } from "./timerange";
import util from "./util";

import { AlignmentMethod, AlignmentOptions } from "./types";

/**
 * A processor to align the data into bins of regular time period, using a
 * `Period` object.
 */
export class Align<T extends Key> extends Processor<T, T> {
    // Internal state
    private _fieldSpec: string[];
    private _period: Period;
    private _method: AlignmentMethod;
    private _limit: number | null;
    private _previous: Event<T>;

    constructor(options: AlignmentOptions) {
        super();

        const { fieldSpec, period, method = AlignmentMethod.Hold, limit = null } = options;
        this._fieldSpec = _.isString(fieldSpec) ? [fieldSpec] : fieldSpec;
        this._method = method;
        this._limit = limit;
        this._period = period;

        // Previous event
        this._previous = null;
    }

    /**
     * Test to see if an event is perfectly aligned. Used on first event.
     */
    isAligned(event: Event<T>): boolean {
        return this._period.isAligned(time(event.timestamp()));
    }

    /**
     * Returns a list of indexes of window boundaries if the current
     * event and the previous event do not lie in the same window. If
     * they are in the same window, return an empty list.
     */
    getBoundaries(event: Event<T>): Immutable.List<Time> {
        const range = timerange(this._previous.timestamp(), event.timestamp());
        return this._period.within(range);
    }

    /**
     * Generate a new event on the requested boundary and carry over the
     * value from the previous event.
     *
     * A variation just sets the values to null, this is used when the
     * limit is hit.
     */
    interpolateHold(boundaryTime: Time, setNone: boolean = false): Event<Time> {
        let d = Immutable.Map<string, any>();
        this._fieldSpec.forEach(fieldPath => {
            const value = setNone ? null : this._previous.get(fieldPath);
            d = _.isString(fieldPath) ? d.set(fieldPath, value) : d.setIn(fieldPath, value);
        });
        return new Event(boundaryTime, d);
    }

    /**
     * Generate a linear differential between two counter values that lie
     * on either side of a window boundary.
     */
    interpolateLinear(boundaryTime: Time, event: Event<T>): Event<Time> {
        let d = Immutable.Map<string, any>();

        const previousTime = this._previous.timestamp().getTime();
        const currentTime = event.timestamp().getTime();

        // This ratio will be the same for all values being processed
        const f = (+boundaryTime - previousTime) / (currentTime - previousTime);

        this._fieldSpec.forEach(fieldPath => {
            //
            // Generate the delta beteen the values and
            // bulletproof against non-numeric or bad paths
            //
            const previousVal = this._previous.get(fieldPath);
            const currentVal = event.get(fieldPath);

            let interpolatedVal = null;
            if (!_.isNumber(previousVal) || !_.isNumber(currentVal)) {
                // tslint:disable-next-line
                console.warn(`Path ${fieldPath} contains a non-numeric value or does not exist`);
            } else {
                interpolatedVal = previousVal + f * (currentVal - previousVal);
            }
            d = _.isString(fieldPath)
                ? d.set(fieldPath, interpolatedVal)
                : d.setIn(fieldPath, interpolatedVal);
        });

        return new Event<Time>(boundaryTime, d);
    }

    /**
     * Perform the align operation on the event and emit.
     */
    addEvent(event: Event<T>): Immutable.List<Event<T>> {
        if (!(event.getKey() instanceof Time)) {
            throw new Error("The key of aligned events must be a Time");
        }

        const eventList = new Array<Event<T>>();

        if (!this._previous) {
            this._previous = event;
            if (this.isAligned(event)) {
                eventList.push(event);
            }
            return Immutable.List();
        }

        const boundaries: Immutable.List<Time> = this.getBoundaries(event);
        boundaries.forEach(boundaryTime => {
            let outputEvent;
            if (this._limit && boundaries.size > this._limit) {
                outputEvent = this.interpolateHold(boundaryTime, true);
            } else {
                switch (this._method) {
                    case AlignmentMethod.Linear:
                        outputEvent = this.interpolateLinear(boundaryTime, event);
                        break;
                    case AlignmentMethod.Hold:
                        outputEvent = this.interpolateHold(boundaryTime);
                        break;
                    default:
                        throw new Error("Unknown AlignmentMethod");
                }
            }
            eventList.push(outputEvent);
        });

        this._previous = event;

        return Immutable.List(eventList);
    }
}
