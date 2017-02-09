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

import _ from "underscore";
import Processor from "./processor";
import { isPipeline } from "../pipeline";
import util from "../base/util";

/**
 * A processor that fills missing/invalid values in the event with
 * new values (zero, interpolated or padded).
 *
 * When doing a linear fill, Filler instances should be chained.
 *
 * If no fieldSpec is supplied, the default field "value" will be used.
 */
export default class Filler extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Filler) {
            const other = arg1;
            this._fieldSpec = other._fieldSpec;
            this._method = other._method;
            this._limit = other._limit;
        } else if (isPipeline(arg1)) {
            const { fieldSpec = null, method = "zero", limit = null } = options;
            this._fieldSpec = fieldSpec;
            this._method = method;
            this._limit = limit;
        } else {
            throw new Error("Unknown arg to Filler constructor", arg1);
        }

        //
        // Internal members
        //
        // state for pad to refer to previous event
        this._previousEvent = null;

        // key count for zero and pad fill
        this._keyCount = {};

        // special state for linear fill
        this._lastGoodLinear = null;

        // cache of events pending linear fill
        this._linearFillCache = [];

        //
        // Sanity checks
        //
        if (!_.contains(["zero", "pad", "linear"], this._method)) {
            throw new Error(`Unknown method ${this._method} passed to Filler`);
        }

        if (this._limit && !_.isNumber(this._limit)) {
            throw new Error(`Limit supplied to fill() should be a number`);
        }

        if (_.isString(this._fieldSpec)) {
            this._fieldSpec = [this._fieldSpec];
        } else if (_.isNull(this._fieldSpec)) {
            this._fieldSpec = ["value"];
        }

        // Special case: when using linear mode, only a single
        // column will be processed per instance
        if (this._method === "linear" && this._fieldSpec.length > 1) {
            throw new Error("Linear fill takes a path to a single column");
        }
    }

    clone() {
        return new Filler(this);
    }

    /**
     * Process and fill the values at the paths as apropos when the fill
     * method is either pad or zero.
     */
    constFill(data) {
        let newData = data;

        for (const path of this._fieldSpec) {
            const fieldPath = util.fieldPathToArray(path);
            const pathKey = fieldPath.join(":");

            //initialize a counter for this column
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

                if (this._method === "zero") {
                    // set to zero
                    newData = newData.setIn(fieldPath, 0);
                    this._keyCount[pathKey]++;
                } else if (this._method === "pad") {
                    // set to previous value
                    if (!_.isNull(this._previousEvent)) {
                        const prevVal = this._previousEvent
                            .data()
                            .getIn(fieldPath);

                        if (!util.isMissing(prevVal)) {
                            newData = newData.setIn(fieldPath, prevVal);
                            this._keyCount[pathKey]++;
                        }
                    }
                } else if (this._method === "linear") {
                    //noop
                }
            } else {
                this._keyCount[pathKey] = 0;
            }
        }
        return newData;
    }

    /**
     * Check to see if an event has good values when doing
     * linear fill since we need to keep a completely intact
     * event for the values.
     * While we are inspecting the data payload, make a note if
     * any of the paths are pointing at a list. Then it
     * will trigger that filling code later.
     */
    isValidLinearEvent(event) {
        let valid = true;
        const fieldPath = util.fieldPathToArray(this._fieldSpec[0]);

        // Detect path that doesn't exist
        if (!event.data().hasIn(fieldPath)) {
            console.warn(`path does not exist: ${fieldPath}`);
            return valid;
        }

        const val = event.data().getIn(fieldPath);

        // Detect if missing or not a number
        if (util.isMissing(val) || !_.isNumber(val)) {
            valid = false;
        }
        return valid;
    }

    /**
     * This handles the linear filling. It returns a list of
     * zero or more events to be emitted.
     *
     * If an event is valid - it has valid values for all of
     * the field paths - it is cached as "last good" and
     * returned to be emitted. The return value is then a list
     * of one event.
     *
     * If an event has invalid values, it is cached to be
     * processed later and an empty list is returned.
     *
     * Additional invalid events will continue to be cached until
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
        } else if (!isValidEvent && !_.isNull(this._lastGoodLinear)) {
            this._linearFillCache.push(event);

            // Check limit
            if (
                !_.isNull(this._limit) &&
                    this._linearFillCache.length >= this._limit
            ) {
                // Flush the cache now because limit is reached
                this._linearFillCache.forEach(e => {
                    this.emit(e);
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
            const eventList = [
                this._lastGoodLinear,
                ...this._linearFillCache,
                event
            ];
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
     * The fundamental linear interpolation workhorse code.  Process
     * a list of events and return a new list. Does a pass for
     * every fieldSpec.
     *
     * This is abstracted out like this because we probably want
     * to interpolate a list of events not tied to a Collection.
     * A Pipeline result list, etc etc.
     *
    **/
    interpolateEventList(events) {
        let prevValue;
        let prevTime;

        // new array of interpolated events for each field path
        const newEvents = [];

        const fieldPath = util.fieldPathToArray(this._fieldSpec[0]);

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
            if (
                !util.isMissing(e.get(fieldPath)) &&
                    !_.isNumber(e.get(fieldPath))
            ) {
                console.warn(
                    `linear requires numeric values - skipping this field_spec`
                );
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
                if (!_.isNull(prevValue) && ~_.isNull(nextValue)) {
                    const currentTime = e.timestamp().getTime();
                    if (nextTime === prevTime) {
                        // If times are the same, just avg
                        const newValue = (prevValue + nextValue) / 2;
                        newEvents.push(e.setData(newValue));
                    } else {
                        const f = (currentTime - prevTime) /
                            (nextTime - prevTime);
                        const newValue = prevValue +
                            f * (nextValue - prevValue);
                        const d = e.data().setIn(fieldPath, newValue);
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
     * Perform the fill operation on the event and emit.
     */
    addEvent(event) {
        if (this.hasObservers()) {
            const emitList = [];
            const d = event.data();
            if (this._method === "zero" || this._method === "pad") {
                const dd = this.constFill(d);
                const e = event.setData(dd);
                emitList.push(e);
                this._previousEvent = e;
            } else if (this._method === "linear") {
                this.linearFill(event).forEach(e => {
                    emitList.push(e);
                });
            }
            for (const event of emitList) {
                this.emit(event);
            }
        }
    }

    flush() {
        if (this.hasObservers() && this._method == "linear") {
            for (const event of this._linearFillCache) {
                this.emit(event);
            }
        }
        super.flush();
    }
}
