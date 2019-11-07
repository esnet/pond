"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = _interopRequireDefault(require("./base/util"));

/*
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
An index is simply a string that represents a fixed range of time. There are two basic types:
 * *Multiplier index* - the number of some unit of time (hours, days etc) since the UNIX epoch.
 * *Calendar index* - The second represents a calendar range, such as Oct 2014.

For the first type, a multiplier index, an example might be:

```text
    1d-12355      //  30th Oct 2003 (GMT), the 12355th day since the UNIX epoch
```

You can also use seconds (e.g. 30s), minutes (e.g. 5m), hours (e.g. 1h) or days (e.g. 7d).

Here are several examples of a calendar index:

```text
    2003-10-30    // 30th Oct 2003
    2014-09       // Sept 2014
    2015          // All of the year 2015
```

An Index is a nice representation of certain types of time intervals because it can be cached with its string representation as a key. A specific chunk of time, and associated data can be looked up based on that string. It also allows us to represent things like months, which have variable length.

An Index is also useful when collecting into specific time ranges, for example generating all the 5 min ("5m") maximum rollups within a specific day ("1d"). See the processing section within these docs.

 */
class Index {
  constructor(s) {
    var utc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    this._utc = utc;
    this._string = s;
    this._timerange = _util.default.rangeFromIndexString(s, this._utc);
  }
  /**
   * Returns the Index as JSON, which will just be its string
   * representation
   */


  toJSON() {
    return this._string;
  }
  /**
   * Simply returns the Index as its string
   */


  toString() {
    return this._string;
  }
  /**
   * for the calendar range style Indexes, this lets you return
   * that calendar range as a human readable format, e.g. "June, 2014".
   * The format specified is a Moment.format.
   */


  toNiceString(format) {
    return _util.default.niceIndexString(this._string, format);
  }
  /**
   * Alias for toString()
   */


  asString() {
    return this.toString();
  }
  /**
   * Returns the Index as a TimeRange
   */


  asTimerange() {
    return this._timerange;
  }
  /**
   * Returns the start date of the Index
   */


  begin() {
    return this._timerange.begin();
  }
  /**
   * Returns the end date of the Index
   */


  end() {
    return this._timerange.end();
  }
  /**
   * Return the index string given an index prefix and a datetime object.
   */


  static getIndexString(win, date) {
    var pos = _util.default.windowPositionFromDate(win, date);

    return "".concat(win, "-").concat(pos);
  }
  /**
   * Given the time range, return a list of strings of index values every <prefix> tick.
   */


  static getIndexStringList(win, timerange) {
    var pos1 = _util.default.windowPositionFromDate(win, timerange.begin());

    var pos2 = _util.default.windowPositionFromDate(win, timerange.end());

    var indexList = [];

    if (pos1 <= pos2) {
      for (var pos = pos1; pos <= pos2; pos++) {
        indexList.push("".concat(win, "-").concat(pos));
      }
    }

    return indexList;
  }
  /**
   * Generate an index string with day granularity.
   */


  static getDailyIndexString(date) {
    var utc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var day = _util.default.leftPad(utc ? date.getUTCDate() : date.getDate());

    var month = _util.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);

    var year = utc ? date.getUTCFullYear() : date.getFullYear();
    return "".concat(year, "-").concat(month, "-").concat(day);
  }
  /**
   * Generate an index string with month granularity.
   */


  static getMonthlyIndexString(date) {
    var utc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var month = _util.default.leftPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);

    var year = utc ? date.getUTCFullYear() : date.getFullYear();
    return "".concat(year, "-").concat(month);
  }
  /**
   * Generate an index string with month granularity.
   */


  static getYearlyIndexString(date) {
    var utc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var year = utc ? date.getUTCFullYear() : date.getFullYear();
    return "".concat(year);
  }

}

var _default = Index;
exports.default = _default;