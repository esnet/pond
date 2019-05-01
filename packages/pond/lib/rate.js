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
   * Perform the rate operation on the `Event` and the the `_previous`
   * `Event` and emit the result.
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
      if (_.isNumber(currentVal) && _.isNumber(previousVal)) {
        // Calculate the rate
        rate = (currentVal - previousVal) / deltaTime;
      } else if (
        (previousVal !== null && !_.isNumber(previousVal)) ||
        (currentVal !== null && !_.isNumber(currentVal))
      ) {
        // Only issue warning if the current or previous values are bad
        // i.e. not a number or not null (null values result in null output)
        console.warn(
          `Event field "${fieldPath}" is a non-numeric or non-null value`
        );
      }
      d =
        this._allowNegative === false && rate < 0
          ? (d = d.setIn(ratePath, null)) // don't allow negative differentials in certain cases
          : (d = d.setIn(ratePath, rate));
    });
    return new event_1.Event(
      timerange_1.timerange(previousTime, currentTime),
      d
    );
  }
}
exports.Rate = Rate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBRTVCLG1DQUFnQztBQUVoQywyQ0FBd0M7QUFDeEMsMkNBQW1EO0FBQ25ELGlDQUEwQjtBQUkxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSCxNQUFhLElBQW9CLFNBQVEscUJBQXVCO0lBTzVELFlBQVksT0FBb0I7UUFDNUIsS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLEVBQUUsU0FBUyxFQUFFLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFckQsVUFBVTtRQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBRXBDLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksUUFBUSxDQUFDLEtBQWU7UUFDM0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxLQUFLLEVBQW9CLENBQUM7UUFFaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFvQixDQUFDO1NBQzdDO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksRUFBRTtZQUNOLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUV2QixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7T0FHRztJQUNLLE9BQU8sQ0FBQyxLQUFlO1FBQzNCLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQWUsQ0FBQztRQUVyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoRCxNQUFNLFNBQVMsR0FBRyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFdEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0IsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDO1lBRXpDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBRWhCLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNuRCxxQkFBcUI7Z0JBQ3JCLElBQUksR0FBRyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDakQ7aUJBQU0sSUFDSCxDQUFDLFdBQVcsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLFVBQVUsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQ2xEO2dCQUNFLCtEQUErRDtnQkFDL0Qsb0VBQW9FO2dCQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixTQUFTLHNDQUFzQyxDQUFDLENBQUM7YUFDakY7WUFFRCxDQUFDO2dCQUNHLElBQUksQ0FBQyxjQUFjLEtBQUssS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDO29CQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxzREFBc0Q7b0JBQ3RGLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLGFBQUssQ0FBQyxxQkFBUyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0NBQ0o7QUFsRkQsb0JBa0ZDIn0=
