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
const processor_1 = require("./processor");
const timerange_1 = require("./timerange");
const util_1 = require("./util");
/**
 * A `Processor` to align the data into bins of regular time period.
 */
class Rate extends processor_1.Processor {
    constructor(options) {
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
    getRate(event) {
        let d = Immutable.Map();
        const previousTime = this._previous.timestamp().getTime();
        const currentTime = event.timestamp().getTime();
        const deltaTime = (currentTime - previousTime) / 1000;
        this._fieldSpec.forEach(path => {
            const fieldPath = util_1.default.fieldAsArray(path);
            const ratePath = fieldPath.slice();
            ratePath[ratePath.length - 1] += "_rate";
            const previousVal = this._previous.get(fieldPath);
            const currentVal = event.get(fieldPath);
            let rate = null;
            if (!_.isNumber(previousVal) || !_.isNumber(currentVal)) {
                console.warn(`Path ${fieldPath} contains a non-numeric value or does not exist`);
            }
            else {
                rate = (currentVal - previousVal) / deltaTime;
            }
            if (this._allowNegative === false && rate < 0) {
                // don't allow negative differentials in certain cases
                d = d.setIn(ratePath, null);
            }
            else {
                d = d.setIn(ratePath, rate);
            }
        });
        return new event_1.Event(timerange_1.timerange(previousTime, currentTime), d);
    }
    /**
     * Perform the `fill` operation on the `Event` and emit.
     */
    addEvent(event) {
        const eventList = new Array();
        if (!this._previous) {
            this._previous = event;
            return Immutable.List();
        }
        const rate = this.getRate(event);
        if (rate) {
            eventList.push(rate);
        }
        this._previous = event;
        return Immutable.List(eventList);
    }
}
exports.Rate = Rate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBRTVCLG1DQUFnQztBQUloQywyQ0FBd0M7QUFFeEMsMkNBQW1EO0FBQ25ELGlDQUEwQjtBQUkxQjs7R0FFRztBQUNILFVBQWlDLFNBQVEscUJBQXVCO0lBTzVELFlBQVksT0FBb0I7UUFDNUIsS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLEVBQUUsU0FBUyxFQUFFLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFckQsVUFBVTtRQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUNsRSxJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztRQUVwQyxpQkFBaUI7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7T0FHRztJQUNILE9BQU8sQ0FBQyxLQUFLO1FBQ1QsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBZSxDQUFDO1FBRXJDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hELE1BQU0sU0FBUyxHQUFHLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUV0RCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQ3hCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25DLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQztZQUV6QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUNoQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLFNBQVMsaURBQWlELENBQUMsQ0FBQztZQUNyRixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztZQUNsRCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLHNEQUFzRDtnQkFDdEQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLElBQUksYUFBSyxDQUFDLHFCQUFTLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVEsQ0FBQyxLQUFlO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLElBQUksS0FBSyxFQUFvQixDQUFDO1FBRWhELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQW9CLENBQUM7UUFDOUMsQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBRXZCLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Q0FDSjtBQTVFRCxvQkE0RUMifQ==