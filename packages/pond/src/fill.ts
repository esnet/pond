/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/*eslint no-console: 0 */

import * as Immutable from "immutable";
import * as _ from "lodash";

import { Event } from "./event";
import { Key } from "./key";
import { Processor } from "./processor";
import { FillMethod, FillOptions } from "./types";
import util from "./util";

/**
 * A `Processor` that fills missing/invalid values in the `Event` with
 * new values (zero, interpolated or padded).
 *
 * When doing a linear fill, Filler instances should be chained.
 *
 * If no `fieldSpec` is supplied, the default field "value" will be used.
 */
export class Fill<T extends Key> extends Processor<T, T> {
    // Options
    private _fieldSpec: string[];
    private _method: FillMethod;
    private _limit: number | null;

    // Internal state
    private _previous: Event<T>;
    private _keyCount;
    private _lastGoodLinear;
    private _linearFillCache;

    constructor(options: FillOptions) {
        super();

        const { fieldSpec, method = FillMethod.Pad, limit = null } = options;

        // Options
        this._fieldSpec = _.isString(fieldSpec) ? [fieldSpec] : fieldSpec;
        this._method = method;
        this._limit = limit;

        this._previous = null; // state for pad to refer to previous event
        this._keyCount = {}; // key count for zero and pad fill
        this._lastGoodLinear = null; // special state for linear fill
        this._linearFillCache = []; // cache of events pending linear fill

        // Special case: when using linear mode, only a single column
        //               will be processed per instance!
        if (this._method === FillMethod.Linear && this._fieldSpec.length > 1) {
            throw new Error("Linear fill takes a path to a single field");
        }
    }

    /**
     * Process and fill the values at the paths as apropos when the fill
     * method is either pad or zero.
     */
    constFill(data: Immutable.Map<string, any>) {
        let newData = data;

        for (const path of this._fieldSpec) {
            const fieldPath = util.fieldAsArray(path);
            const pathKey = fieldPath.join(":");

            // initialize a counter for this column
            if (!_.has(this._keyCount, pathKey)) {
                this._keyCount[pathKey] = 0;
            }

            // this is pointing at a path that does not exist
            if (!newData.hasIn(fieldPath)) {
                continue;
            }

            // Get the next value using the fieldPath
            const val = newData.getIn(fieldPath);

            if (util.isMissing(val)) {
                // Have we hit the limit?
                if (this._limit && this._keyCount[pathKey] >= this._limit) {
                    continue;
                }

                if (this._method === FillMethod.Zero) {
                    // set to zero
                    newData = newData.setIn(fieldPath, 0);
                    this._keyCount[pathKey]++;
                } else if (this._method === FillMethod.Pad) {
                    // set to previous value
                    if (!_.isNull(this._previous)) {
                        const prevVal = this._previous.getData().getIn(fieldPath);

                        if (!util.isMissing(prevVal)) {
                            newData = newData.setIn(fieldPath, prevVal);
                            this._keyCount[pathKey]++;
                        }
                    }
                } else if (this._method === FillMethod.Linear) {
                    // noop
                }
            } else {
                this._keyCount[pathKey] = 0;
            }
        }
        return newData;
    }

    /**
     * Check to see if an `Event` has good values when doing
     * linear fill since we need to keep a completely intact
     * event for the values.
     * While we are inspecting the data payload, make a note if
     * any of the paths are pointing at a list. Then it
     * will trigger that filling code later.
     */
    isValidLinearEvent(event: Event<T>) {
        let valid = true;
        const fieldPath = util.fieldAsArray(this._fieldSpec[0]);

        // Detect path that doesn't exist
        if (!event.getData().hasIn(fieldPath)) {
            console.warn(`path does not exist: ${fieldPath}`);
            return valid;
        }

        const val = event.getData().getIn(fieldPath);

        // Detect if missing or not a number
        if (util.isMissing(val) || !_.isNumber(val)) {
            valid = false;
        }
        return valid;
    }

    /**
     * This handles the linear filling. It returns a list of
     * zero or more `Event`'s to be emitted.
     *
     * If an `Event` is valid 
     * * it has valid values for all of the field paths 
     * * it is cached as "last good" and returned to be emitted. 
     * The return value is then a list of one `Event`.
     *
     * If an `Event` has invalid values, it is cached to be
     * processed later and an empty list is returned.
     *
     * Additional invalid `Event`'s will continue to be cached until
     * a new valid value is seen, then the cached events will
     * be filled and returned. That will be a list of indeterminate
     * length.
     */
    linearFill(event: Event<T>): Array<Event<T>> {
        // See if the event is valid and also if it has any
        // list values to be filled.
        const isValidEvent = this.isValidLinearEvent(event);

        const events: Array<Event<T>> = [];
        if (isValidEvent && !this._linearFillCache.length) {
            // Valid event, no cached events, use as last good val
            this._lastGoodLinear = event;
            events.push(event);
        } else if (!isValidEvent && !_.isNull(this._lastGoodLinear)) {
            this._linearFillCache.push(event);

            // Check limit
            if (!_.isNull(this._limit) && this._linearFillCache.length >= this._limit) {
                // Flush the cache now because limit is reached
                this._linearFillCache.forEach(e => {
                    events.push(e);
                });

                // Reset
                this._linearFillCache = [];
                this._lastGoodLinear = null;
            }
        } else if (!isValidEvent && _.isNull(this._lastGoodLinear)) {
            //
            // An invalid event but we have not seen a good
            // event yet so there is nothing to start filling "from"
            // so just return and live with it.
            //
            events.push(event);
        } else if (isValidEvent && this._linearFillCache) {
            // Linear interpolation between last good and this event
            const eventList = [this._lastGoodLinear, ...this._linearFillCache, event];
            const interpolatedEvents = this.interpolateEventList(eventList);

            //
            // The first event in the returned list from interpolatedEvents
            // is our last good event. This event has already been emitted so
            // it is sliced off.
            //
            interpolatedEvents.slice(1).forEach(e => {
                events.push(e);
            });

            // Reset
            this._linearFillCache = [];
            this._lastGoodLinear = event;
        }

        return events;
    }

    /**
     * The fundamental linear interpolation workhorse code. Process
     * a list of `Event`'s and return a new list. Does a pass for
     * every `fieldSpec`.
     *
     * This is abstracted out like this because we probably want
     * to interpolate a list of `Event`'s not tied to a `Collection`.
     * A Pipeline result list, etc etc.
     *
     */
    interpolateEventList(events: Array<Event<T>>): Array<Event<T>> {
        let prevValue;
        let prevTime;

        // new array of interpolated events for each field path
        const newEvents: Array<Event<T>> = [];

        const fieldPath = util.fieldAsArray(this._fieldSpec[0]);

        // setup done, loop through the events
        for (let i = 0; i < events.length; i++) {
            const e = events[i];

            // Can't interpolate first or last event so just save it
            // as is and move on.
            if (i === 0) {
                prevValue = e.get(fieldPath);
                prevTime = e.timestamp().getTime();
                newEvents.push(e);
                continue;
            }

            if (i === events.length - 1) {
                newEvents.push(e);
                continue;
            }

            // Detect non-numeric value
            if (!util.isMissing(e.get(fieldPath)) && !_.isNumber(e.get(fieldPath))) {
                console.warn(`linear requires numeric values - skipping this field_spec`);
                return events;
            }

            // Found a missing value so start calculating.
            if (util.isMissing(e.get(fieldPath))) {
                // Find the next valid value in the original events
                let ii = i + 1;
                let nextValue = null;
                let nextTime = null;
                while (_.isNull(nextValue) && ii < events.length) {
                    const val = events[ii].get(fieldPath);
                    if (!util.isMissing(val)) {
                        nextValue = val;
                        // exits loop
                        nextTime = events[ii].timestamp().getTime();
                    }
                    ii++;
                }

                // Interpolate a new value to fill
                if (!_.isNull(prevValue) && !_.isNull(nextValue)) {
                    const currentTime = e.timestamp().getTime();
                    if (nextTime === prevTime) {
                        // If times are the same, just avg
                        const newValue = (prevValue + nextValue) / 2;
                        const d = e.getData().setIn(fieldPath, newValue);
                        newEvents.push(e.setData(d));
                    } else {
                        const f = (currentTime - prevTime) / (nextTime - prevTime);
                        const newValue = prevValue + f * (nextValue - prevValue);
                        const d = e.getData().setIn(fieldPath, newValue);
                        newEvents.push(e.setData(d));
                    }
                } else {
                    newEvents.push(e);
                }
            } else {
                newEvents.push(e);
            }
        }

        return newEvents;
    }

    /**
     * Perform the fill operation on the `Event` and return filled
     * in events
     */
    addEvent(event: Event<T>): Immutable.List<Event<T>> {
        const eventList = new Array<Event<T>>();
        const d = event.getData();
        if (this._method === FillMethod.Zero || this._method === FillMethod.Pad) {
            const dd = this.constFill(d);
            const e = event.setData(dd);
            eventList.push(e);
            this._previous = e;
        } else if (this._method === FillMethod.Linear) {
            this.linearFill(event).forEach(e => {
                eventList.push(e);
            });
        }
        return Immutable.List(eventList);
    }
}
