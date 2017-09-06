"use strict";
/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const _ = require("lodash");
const processor_1 = require("./processor");
const util_1 = require("./util");
const types_1 = require("./types");
/**
 * A processor that fills missing/invalid values in the `Event` with
 * new values (zero, interpolated or padded).
 *
 * When doing a linear fill, Filler instances should be chained.
 */
class Fill extends processor_1.Processor {
    constructor(options) {
        super();
        const { fieldSpec, method = types_1.FillMethod.Pad, limit = null } = options;
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
        if (this._method === types_1.FillMethod.Linear && this._fieldSpec.length > 1) {
            throw new Error("Linear fill takes a path to a single field");
        }
    }
    /**
     * Process and fill the values at the paths as apropos when the fill
     * method is either pad or zero.
     */
    constFill(data) {
        let newData = data;
        for (const path of this._fieldSpec) {
            const fieldPath = util_1.default.fieldAsArray(path);
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
            if (util_1.default.isMissing(val)) {
                // Have we hit the limit?
                if (this._limit && this._keyCount[pathKey] >= this._limit) {
                    continue;
                }
                if (this._method === types_1.FillMethod.Zero) {
                    // set to zero
                    newData = newData.setIn(fieldPath, 0);
                    this._keyCount[pathKey]++;
                }
                else if (this._method === types_1.FillMethod.Pad) {
                    // set to previous value
                    if (!_.isNull(this._previous)) {
                        const prevVal = this._previous.getData().getIn(fieldPath);
                        if (!util_1.default.isMissing(prevVal)) {
                            newData = newData.setIn(fieldPath, prevVal);
                            this._keyCount[pathKey]++;
                        }
                    }
                }
                else if (this._method === types_1.FillMethod.Linear) {
                    // noop
                }
            }
            else {
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
    isValidLinearEvent(event) {
        let valid = true;
        const fieldPath = util_1.default.fieldAsArray(this._fieldSpec[0]);
        // Detect path that doesn't exist
        if (!event.getData().hasIn(fieldPath)) {
            // tslint:disable-next-line
            console.warn(`path does not exist: ${fieldPath}`);
            return valid;
        }
        const val = event.getData().getIn(fieldPath);
        // Detect if missing or not a number
        if (util_1.default.isMissing(val) || !_.isNumber(val)) {
            valid = false;
        }
        return valid;
    }
    /**
     * This handles the linear filling. It returns a list of
     * zero or more `Event`'s to be emitted.
     *
     * If an `Event` is valid:
     *  * it has valid values for all of the field paths
     *  * it is cached as "last good" and returned to be emitted.
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
    linearFill(event) {
        // See if the event is valid and also if it has any
        // list values to be filled.
        const isValidEvent = this.isValidLinearEvent(event);
        const events = [];
        if (isValidEvent && !this._linearFillCache.length) {
            // Valid event, no cached events, use as last good val
            this._lastGoodLinear = event;
            events.push(event);
        }
        else if (!isValidEvent && !_.isNull(this._lastGoodLinear)) {
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
        }
        else if (!isValidEvent && _.isNull(this._lastGoodLinear)) {
            //
            // An invalid event but we have not seen a good
            // event yet so there is nothing to start filling "from"
            // so just return and live with it.
            //
            events.push(event);
        }
        else if (isValidEvent && this._linearFillCache) {
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
    interpolateEventList(events) {
        let prevValue;
        let prevTime;
        // new array of interpolated events for each field path
        const newEvents = [];
        const fieldPath = util_1.default.fieldAsArray(this._fieldSpec[0]);
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
            if (!util_1.default.isMissing(e.get(fieldPath)) && !_.isNumber(e.get(fieldPath))) {
                // tslint:disable-next-line
                console.warn(`linear requires numeric values - skipping this field_spec`);
                return events;
            }
            // Found a missing value so start calculating.
            if (util_1.default.isMissing(e.get(fieldPath))) {
                // Find the next valid value in the original events
                let ii = i + 1;
                let nextValue = null;
                let nextTime = null;
                while (_.isNull(nextValue) && ii < events.length) {
                    const val = events[ii].get(fieldPath);
                    if (!util_1.default.isMissing(val)) {
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
                    }
                    else {
                        const f = (currentTime - prevTime) / (nextTime - prevTime);
                        const newValue = prevValue + f * (nextValue - prevValue);
                        const d = e.getData().setIn(fieldPath, newValue);
                        newEvents.push(e.setData(d));
                    }
                }
                else {
                    newEvents.push(e);
                }
            }
            else {
                newEvents.push(e);
            }
        }
        return newEvents;
    }
    /**
     * Perform the fill operation on the `Event` and return filled
     * in events
     */
    addEvent(event) {
        const eventList = new Array();
        const d = event.getData();
        if (this._method === types_1.FillMethod.Zero || this._method === types_1.FillMethod.Pad) {
            const dd = this.constFill(d);
            const e = event.setData(dd);
            eventList.push(e);
            this._previous = e;
        }
        else if (this._method === types_1.FillMethod.Linear) {
            this.linearFill(event).forEach(e => {
                eventList.push(e);
            });
        }
        return Immutable.List(eventList);
    }
}
exports.Fill = Fill;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9maWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBSTVCLDJDQUF3QztBQUN4QyxpQ0FBMEI7QUFFMUIsbUNBQWtEO0FBRWxEOzs7OztHQUtHO0FBQ0gsVUFBaUMsU0FBUSxxQkFBZTtJQVlwRCxZQUFZLE9BQW9CO1FBQzVCLEtBQUssRUFBRSxDQUFDO1FBRVIsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEdBQUcsa0JBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUVyRSxVQUFVO1FBQ1YsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRXBCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsMkNBQTJDO1FBQ2xFLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsa0NBQWtDO1FBQ3ZELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUMsZ0NBQWdDO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQyxzQ0FBc0M7UUFFbEUsNkRBQTZEO1FBQzdELGdEQUFnRDtRQUNoRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLGtCQUFVLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ2xF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