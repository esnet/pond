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
import { TimeRange } from "./timerange";
import util from "./util";

import { AlignmentMethod, AlignmentOptions } from "./types";

/**
 * A processor to align the data into bins of regular time period.
 */
export class Align<T extends Key> extends Processor<T, T> {
    // Internal state
    private _fieldSpec: string[];
    private _window: Period;
    private _method: AlignmentMethod;
    private _limit: number | null;
    private _previous: Event<T>;

    constructor(options: AlignmentOptions) {
        super();

        const { fieldSpec, window, method = AlignmentMethod.Hold, limit = null } = options;

        // Options
        this._fieldSpec = _.isString(fieldSpec) ? [fieldSpec] : fieldSpec;
        this._method = method;
        this._limit = limit;
        this._window = window;

        // Previous event
        this._previous = null;
    }

    /**
     * Test to see if an event is perfectly aligned. Used on first event.
     */
    isAligned(event: Event<T>): boolean {
        const bound = Index.getIndexString(this._window.toString(), event.timestamp());
        return this.getBoundaryTime(bound) === event.timestamp().getTime();
    }

    /**
     * Returns a list of indexes of window boundaries if the current
     * event and the previous event do not lie in the same window. If
     * they are in the same window, return an empty list.
     */
    getBoundaries(event: Event<T>): string[] {
        const prevIndex = Index.getIndexString(this._window.toString(), this._previous.timestamp());
        const currentIndex = Index.getIndexString(this._window.toString(), event.timestamp());
        if (prevIndex !== currentIndex) {
            const range = new TimeRange(this._previous.timestamp(), event.timestamp());
            return Index.getIndexStringList(this._window.toString(), range).slice(1);
        } else {
            return [];
        }
    }

    /**
     * We are dealing in UTC only with the Index because the events
     * all have internal timestamps in UTC and that's what we're
     * aligning. Let the user display in local time if that's
     * what they want.
     */
    getBoundaryTime(boundaryIndex: string): number {
        const index = new Index(boundaryIndex);
        return index.begin().getTime();
    }

    /**
     * Generate a new event on the requested boundary and carry over the
     * value from the previous event.
     *
     * A variation just sets the values to null, this is used when the
     * limit is hit.
     */
    interpolateHold(boundaryIndex: string, setNone = false) {
        let d = Immutable.Map<string, any>();
        const t = this.getBoundaryTime(boundaryIndex);
        this._fieldSpec.forEach(fieldPath => {
            const value = setNone ? null : this._previous.get(fieldPath);
            d = _.isString(fieldPath) ? d.set(fieldPath, value) : d.setIn(fieldPath, value);
        });
        return new Event(time(t), d);
    }

    /**
     * Generate a linear differential between two counter values that lie
     * on either side of a window boundary.
     */
    interpolateLinear(boundary, event) {
        let d = Immutable.Map<string, any>();

        const previousTime = this._previous.timestamp().getTime();
        const boundaryTime = this.getBoundaryTime(boundary);
        const currentTime = event.timestamp().getTime();

        // This ratio will be the same for all values being processed
        const f = (boundaryTime - previousTime) / (currentTime - previousTime);

        this._fieldSpec.forEach(fieldPath => {
            //
            // Generate the delta beteen the values and
            // bulletproof against non-numeric or bad paths
            //
            const previousVal = this._previous.get(fieldPath);
            const currentVal = event.get(fieldPath);

            const interpolatedVal = previousVal + f * (+currentVal - +previousVal);

            d = _.isString(fieldPath)
                ? d.set(fieldPath, interpolatedVal)
                : d.setIn(fieldPath, interpolatedVal);
        });

        return new Event(time(boundaryTime), d);
    }

    /**
     * Perform the align operation on the event and emit.
     */
    addEvent(event: Event<T>): Immutable.List<Event<T>> {
        if (!(event.getKey() instanceof Time)) {
            throw new Error("The key of aligned events must be Time");
        }

        const eventList = new Array<Event<T>>();

        if (!this._previous) {
            this._previous = event;
            if (this.isAligned(event)) {
                eventList.push(event);
            }
            return Immutable.List();
        }

        const boundaries = this.getBoundaries(event);

        //
        // If the returned list is not empty, interpolate an event
        // on each of the boundaries and emit them
        //
        const count = boundaries.length;
        boundaries.forEach(boundary => {
            let outputEvent;
            if (this._limit && count > this._limit) {
                outputEvent = this.interpolateHold(boundary, true);
            } else {
                switch (this._method) {
                    case AlignmentMethod.Linear:
                        outputEvent = this.interpolateLinear(boundary, event);
                        break;
                    case AlignmentMethod.Hold:
                        outputEvent = this.interpolateHold(boundary);
                        break;
                    default:
                        throw new Error("Unknown AlignmentMethod");
                }
            }
            eventList.push(outputEvent);
        });

        //
        // The current event now becomes the previous event
        //
        this._previous = event;

        return Immutable.List(eventList);
    }
}
