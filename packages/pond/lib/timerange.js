"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
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
const moment = require("moment");
const key_1 = require("./key");
const time_1 = require("./time");
const types_1 = require("./types");
/**
 * A `TimeRange` is a simple representation of a begin and end time, used
 * to maintain consistency across an application.
 *
 * You can define a `TimeRange` with `moments`, Javascript `Date objects
 * or `ms` since UNIX epoch. Here we construct one with two moments:
 *
 * ```js
 * var fmt = "YYYY-MM-DD HH:mm";
 * var beginTime = moment("2012-01-11 11:11", fmt);
 * var endTime =   moment("2012-02-22 12:12", fmt);
 * var range = new TimeRange(beginTime, endTime);
 * ```
 *
 * or with ms times:
 *
 * ```js
 * var range = new TimeRange([1326309060000, 1329941520000]);
 * ```
 */
class TimeRange extends key_1.Key {
  constructor(arg1, arg2) {
    super();
    if (arg1 instanceof TimeRange) {
      const other = arg1;
      this._range = other._range;
    } else if (arg1 instanceof Immutable.List) {
      const rangeList = arg1;
      this._range = rangeList;
    } else if (arg1 instanceof Array) {
      const rangeArray = arg1;
      this._range = Immutable.List([
        new Date(rangeArray[0]),
        new Date(rangeArray[1])
      ]);
    } else {
      const b = arg1;
      const e = arg2;
      if (_.isDate(b) && _.isDate(e)) {
        this._range = Immutable.List([
          new Date(b.getTime()),
          new Date(e.getTime())
        ]);
      } else if (moment.isMoment(b) && moment.isMoment(e)) {
        this._range = Immutable.List([
          new Date(b.valueOf()),
          new Date(e.valueOf())
        ]);
      } else if (time_1.Time.isTime(b) && time_1.Time.isTime(e)) {
        this._range = Immutable.List([
          new Date(b.valueOf()),
          new Date(e.valueOf())
        ]);
      } else if (_.isNumber(b) && _.isNumber(e)) {
        this._range = Immutable.List([new Date(b), new Date(e)]);
      }
    }
  }
  type() {
    return "timerange";
  }
  /**
   * Returns the internal range, which is an `Immutable.List` of two elements
   * containing begin and end times as `Date`'s.
   */
  internal() {
    return this._range;
  }
  /**
   * Returns the `TimeRange` as JSON, which will be a Javascript array
   * of two `ms` timestamps.
   */
  toJSON() {
    return { timerange: [this.begin().getTime(), this.end().getTime()] };
  }
  /**
   * Returns the `TimeRange` as a string, useful for serialization.
   *
   * @return {string} String representation of the TimeRange
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }
  /**
   * Returns the `TimeRange` as a string expressed in local time
   */
  toLocalString() {
    return `[${this.begin()}, ${this.end()}]`;
  }
  /**
   * Returns the `TimeRange` as a string expressed in UTC time
   */
  toUTCString() {
    return `[${this.begin().toUTCString()}, ${this.end().toUTCString()}]`;
  }
  /**
   * Returns a human friendly version of the `TimeRange`, e.g.
   * "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
   */
  humanize() {
    const begin = moment(this.begin());
    const end = moment(this.end());
    const beginStr = begin.format("MMM D, YYYY hh:mm:ss a");
    const endStr = end.format("MMM D, YYYY hh:mm:ss a");
    return `${beginStr} to ${endStr}`;
  }
  /**
   * Returns a human friendly version of the `TimeRange`
   * @example
   * Example: "a few seconds ago to a month ago"
   */
  relativeString() {
    const begin = moment(this.begin());
    const end = moment(this.end());
    return `${begin.fromNow()} to ${end.fromNow()}`;
  }
  /**
   * Returns the begin time of the `TimeRange`.
   */
  begin() {
    return this._range.get(0);
  }
  /**
   * Returns the end time of the `TimeRange`.
   */
  end() {
    return this._range.get(1);
  }
  /**
   * Returns the midpoint of the `TimeRange`.
   */
  mid() {
    return new Date((+this.begin() + +this.end()) / 2);
  }
  /**
   * Returns a `Time` that is either at the beginning,
   * middle or end of this `TimeRange`. Specify the alignment
   * of the output `Time` with the `align` parameter. This is
   * either:
   *  * TimeAlignment.Begin
   *  * TimeAlignment.Middle
   *  * TimeAlignment.End
   */
  toTime(align) {
    switch (align) {
      case types_1.TimeAlignment.Begin:
        return time_1.time(this.begin());
        break;
      case types_1.TimeAlignment.Middle:
        return time_1.time(this.mid());
        break;
      case types_1.TimeAlignment.End:
        return time_1.time(this.end());
        break;
    }
  }
  /**
   * Returns the midpoint of the `TimeRange` as the representitive
   * timestamp for the timerange.
   */
  timestamp() {
    return this.mid();
  }
  /**
   * Sets a new begin time on the `TimeRange`. The result will be
   * a new `TimeRange`.
   */
  setBegin(t) {
    return new TimeRange(this._range.set(0, t));
  }
  /**
   * Sets a new end time on the `TimeRange`. The result will be
   * a new `TimeRange`.
   */
  setEnd(t) {
    return new TimeRange(this._range.set(1, t));
  }
  /**
   * Returns if the two `TimeRange`'s can be considered equal,
   * in that they have the same times.
   */
  equals(other) {
    return (
      this.begin().getTime() === other.begin().getTime() &&
      this.end().getTime() === other.end().getTime()
    );
  }
  /**
   * Determine if a `Date` or a `TimeRange` is contained entirely
   * within this `TimeRange`
   */
  contains(other) {
    if (_.isDate(other)) {
      return this.begin() <= other && this.end() >= other;
    } else {
      return this.begin() <= other.begin() && this.end() >= other.end();
    }
  }
  /**
   * Returns true if this `TimeRange` is completely within the supplied
   * other `TimeRange`.
   */
  within(other) {
    return this.begin() >= other.begin() && this.end() <= other.end();
  }
  /**
   * Returns true if the passed in other `TimeRange` overlaps
   * this `TimeRange`.
   */
  overlaps(other) {
    if (
      (this.contains(other.begin()) && !this.contains(other.end())) ||
      (this.contains(other.end()) && !this.contains(other.begin()))
    ) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Returns true if the passed in other `TimeRange` in no way
   * overlaps this `TimeRange`.
   */
  disjoint(other) {
    return this.end() < other.begin() || this.begin() > other.end();
  }
  /**
   * Returns a new `Timerange` which covers the extents of this and
   * other combined.
   */
  extents(other) {
    const b = this.begin() < other.begin() ? this.begin() : other.begin();
    const e = this.end() > other.end() ? this.end() : other.end();
    return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
  }
  /**
   * Returns a new `TimeRange` which represents the intersection
   * (overlapping) part of this and other.
   */
  intersection(other) {
    if (this.disjoint(other)) {
      return;
    }
    const b = this.begin() > other.begin() ? this.begin() : other.begin();
    const e = this.end() < other.end() ? this.end() : other.end();
    return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
  }
  /**
   * Returns the duration of the `TimeRange` in milliseconds
   */
  duration() {
    return this.end().getTime() - this.begin().getTime();
  }
  /**
   * A user friendly version of the duration.
   */
  humanizeDuration() {
    return moment.duration(this.duration()).humanize();
  }
}
exports.TimeRange = TimeRange;
function timerange(arg1, arg2) {
  return new TimeRange(arg1, arg2);
}
exports.timerange = timerange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RpbWVyYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUM1QixpQ0FBaUM7QUFHakMsK0JBQTRCO0FBQzVCLGlDQUFvQztBQUNwQyxtQ0FBd0M7QUFFeEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFhLFNBQVUsU0FBUSxTQUFHO0lBbUI5QixZQUFZLElBQVMsRUFBRSxJQUFVO1FBQzdCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxJQUFJLFlBQVksU0FBUyxFQUFFO1lBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDOUI7YUFBTSxJQUFJLElBQUksWUFBWSxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQ3ZDLE1BQU0sU0FBUyxHQUFHLElBQTRCLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7U0FDM0I7YUFBTSxJQUFJLElBQUksWUFBWSxLQUFLLEVBQUU7WUFDOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwRjthQUFNO1lBQ0gsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2YsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2YsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JB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
