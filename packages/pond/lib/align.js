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
const event_1 = require("./event");
const index_1 = require("./index");
const processor_1 = require("./processor");
const time_1 = require("./time");
const timerange_1 = require("./timerange");
const types_1 = require("./types");
/**
 * A processor to align the data into bins of regular time period.
 */
class Align extends processor_1.Processor {
    constructor(options) {
        super();
        const { fieldSpec, window, method = types_1.AlignmentMethod.Hold, limit = null } = options;
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
    isAligned(event) {
        const bound = index_1.Index.getIndexString(this._window.toString(), event.timestamp());
        return this.getBoundaryTime(bound) === event.timestamp().getTime();
    }
    /**
     * Returns a list of indexes of window boundaries if the current
     * event and the previous event do not lie in the same window. If
     * they are in the same window, return an empty list.
     */
    getBoundaries(event) {
        const prevIndex = index_1.Index.getIndexString(this._window.toString(), this._previous.timestamp());
        const currentIndex = index_1.Index.getIndexString(this._window.toString(), event.timestamp());
        if (prevIndex !== currentIndex) {
            const range = new timerange_1.TimeRange(this._previous.timestamp(), event.timestamp());
            return index_1.Index.getIndexStringList(this._window.toString(), range).slice(1);
        }
        else {
            return [];
        }
    }
    /**
     * We are dealing in UTC only with the Index because the events
     * all have internal timestamps in UTC and that's what we're
     * aligning. Let the user display in local time if that's
     * what they want.
     */
    getBoundaryTime(boundaryIndex) {
        const index = new index_1.Index(boundaryIndex);
        return index.begin().getTime();
    }
    /**
     * Generate a new event on the requested boundary and carry over the
     * value from the previous event.
     *
     * A variation just sets the values to null, this is used when the
     * limit is hit.
     */
    interpolateHold(boundaryIndex, setNone = false) {
        let d = Immutable.Map();
        const t = this.getBoundaryTime(boundaryIndex);
        this._fieldSpec.forEach(fieldPath => {
            const value = setNone ? null : this._previous.get(fieldPath);
            d = _.isString(fieldPath) ? d.set(fieldPath, value) : d.setIn(fieldPath, value);
        });
        return new event_1.Event(time_1.time(t), d);
    }
    /**
     * Generate a linear differential between two counter values that lie
     * on either side of a window boundary.
     */
    interpolateLinear(boundary, event) {
        let d = Immutable.Map();
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
            let interpolatedVal = null;
            if (!_.isNumber(previousVal) || !_.isNumber(currentVal)) {
                console.warn(`Path ${fieldPath} contains a non-numeric value or does not exist`);
            }
            else {
                interpolatedVal = previousVal + f * (currentVal - previousVal);
            }
            d = _.isString(fieldPath)
                ? d.set(fieldPath, interpolatedVal)
                : d.setIn(fieldPath, interpolatedVal);
        });
        return new event_1.Event(time_1.time(boundaryTime), d);
    }
    /**
     * Perform the fill operation on the event and emit.
     */
    addEvent(event) {
        if (!(event.getKey() instanceof time_1.Time)) {
            throw new Error("The key of aligned events must be Time");
        }
        const eventList = new Array();
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
            }
            else {
                switch (this._method) {
                    case types_1.AlignmentMethod.Linear:
                        outputEvent = this.interpolateLinear(boundary, event);
                        break;
                    case types_1.AlignmentMethod.Hold:
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
exports.Align = Align;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpZ24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWxpZ24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFFNUIsbUNBQWdDO0FBQ2hDLG1DQUFnQztBQUdoQywyQ0FBd0M7QUFDeEMsaUNBQW9DO0FBQ3BDLDJDQUF3QztBQUd4QyxtQ0FBNEQ7QUFFNUQ7O0dBRUc7QUFDSCxXQUFrQyxTQUFRLHFCQUFlO0lBUXJELFlBQVksT0FBeUI7UUFDakMsS0FBSyxFQUFFLENBQUM7UUFFUixNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsdUJBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUVuRixVQUFVO1FBQ1YsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXRCLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLENBQUMsS0FBZTtRQUNyQixNQUFNLEtBQUssR0FBRyxhQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDL0UsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3ZFLENB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