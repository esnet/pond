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
import Immutable from "immutable";
import Index from "../index";
import IndexedEvent from "../indexedevent";
import Processor from "./processor";
import TimeEvent from "../timeevent";
import TimeRange from "../timerange";
import TimeRangeEvent from "../timerangeevent";
import { isPipeline } from "../pipeline";
import util from "../base/util";

/**
 * A processor to align the data into bins of regular time period.
 */
export default class Aligner extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Aligner) {
            const other = arg1;
            this._fieldSpec = other._fieldSpec;
            this._window = other._window;
            this._method = other._method;
            this._limit = other._limit;
        } else if (isPipeline(arg1)) {
            const {
                fieldSpec,
                window,
                method = "hold",
                limit = null
            } = options;

            this._fieldSpec = fieldSpec;
            this._window = window;
            this._method = method;
            this._limit = limit;
        } else {
            throw new Error("Unknown arg to Aligner constructor", arg1);
        }

        //
        // Internal members
        //
        this._previous = null;

        // work out field specs
        if (_.isString(this._fieldSpec)) {
            this._fieldSpec = [this._fieldSpec];
        }

        // check input of method
        if (!_.contains(["linear", "hold"], this._method)) {
            throw new Error(
                `Unknown method '${this._method}' passed to Aligner`
            );
        }

        // check limit
        if (this._limit && !Number.isInteger(this._limit)) {
            throw new Error("Limit passed to Aligner is not an integer");
        }
    }

    clone() {
        return new Aligner(this);
    }

    /**
     * Test to see if an event is perfectly aligned. Used on first event.
     */
    isAligned(event) {
        const bound = Index.getIndexString(this._window, event.timestamp());
        return this.getBoundaryTime(bound) === event.timestamp().getTime();
    }

    /**
     * Returns a list of indexes of window boundaries if the current
     * event and the previous event do not lie in the same window. If
     * they are in the same window, return an empty list.
     */
    getBoundaries(event) {
        const prevIndex = Index.getIndexString(
            this._window,
            this._previous.timestamp()
        );
        const currentIndex = Index.getIndexString(
            this._window,
            event.timestamp()
        );
        if (prevIndex !== currentIndex) {
            const range = new TimeRange(
                this._previous.timestamp(),
                event.timestamp()
            );
            return Index.getIndexStringList(this._window, range).slice(1);
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
    getBoundaryTime(boundaryIndex) {
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
    interpolateHold(boundary, setNone = false) {
        let d = new Immutable.Map();
        const t = this.getBoundaryTime(boundary);
        this._fieldSpec.forEach(path => {
            const fieldPath = util.fieldPathToArray(path);
            if (!setNone) {
                d = d.setIn(fieldPath, this._previous.get(fieldPath));
            } else {
                d = d.setIn(fieldPath, null);
            }
        });
        return new TimeEvent(t, d);
    }

    /**
      * Generate a linear differential between two counter values that lie
      * on either side of a window boundary.
      */
    interpolateLinear(boundary, event) {
        let d = new Immutable.Map();

        const previousTime = this._previous.timestamp().getTime();
        const boundaryTime = this.getBoundaryTime(boundary);
        const currentTime = event.timestamp().getTime();

        // This ratio will be the same for all values being processed
        const f = (boundaryTime - previousTime) / (currentTime - previousTime);

        this._fieldSpec.forEach(path => {
            const fieldPath = util.fieldPathToArray(path);

            //
            // Generate the delta beteen the values and
            // bulletproof against non-numeric or bad paths
            //
            const previousVal = this._previous.get(fieldPath);
            const currentVal = event.get(fieldPath);

            let interpolatedVal = null;
            if (!_.isNumber(previousVal) || !_.isNumber(currentVal)) {
                console.warn(
                    `Path ${fieldPath} contains a non-numeric value or does not exist`
                );
            } else {
                interpolatedVal = previousVal + f * (currentVal - previousVal);
            }
            d = d.setIn(fieldPath, interpolatedVal);
        });

        return new TimeEvent(boundaryTime, d);
    }

    /**
     * Perform the fill operation on the event and emit.
     */
    addEvent(event) {
        if (event instanceof TimeRangeEvent || event instanceof IndexedEvent) {
            throw new Error(
                "TimeRangeEvent and IndexedEvent series can not be aligned."
            );
        }

        if (this.hasObservers()) {
            if (!this._previous) {
                this._previous = event;
                if (this.isAligned(event)) {
                    this.emit(event);
                }
                return;
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
                    if (this._method === "linear") {
                        outputEvent = this.interpolateLinear(boundary, event);
                    } else {
                        outputEvent = this.interpolateHold(boundary);
                    }
                }
                this.emit(outputEvent);
            });

            //
            // The current event now becomes the previous event
            //
            this._previous = event;
        }
    }
}
