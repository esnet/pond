"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _moment = _interopRequireDefault(require("moment"));

var _timerange = _interopRequireDefault(require("../timerange.js"));

/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */
var fmt = "YYYY-MM-DD HH:mm";
var fmt2 = "YYYY-MM-DD HH:mm:ss"; //
// Creation
//

it("can create a new range with a begin and end time", () => {
  var beginTime = (0, _moment.default)("2012-01-11 11:11", fmt).toDate();
  var endTime = (0, _moment.default)("2012-02-22 12:12", fmt).toDate();
  var range = new _timerange.default(beginTime, endTime);
  expect(range.begin().getTime()).toBe(beginTime.getTime());
  expect(range.end().getTime()).toBe(endTime.getTime());
});
it("can create a new range with two UNIX epoch times in an array", () => {
  var range = new _timerange.default([1326309060000, 1329941520000]);
  expect(range.toJSON()).toEqual([1326309060000, 1329941520000]);
});
it("can be used to give a new range", () => {
  var beginTime = (0, _moment.default)("2012-01-11 1:11", fmt).toDate();
  var endTime = (0, _moment.default)("2012-02-12 2:12", fmt).toDate();
  var rangeOrig = new _timerange.default(beginTime, endTime);
  var rangeCopy = new _timerange.default(rangeOrig); // We expect the copy to not equal the original, but for the dates
  // within the copy to be the same

  expect(rangeCopy).not.toBe(rangeOrig);
  expect(rangeCopy.begin().getTime()).toBe(beginTime.getTime());
  expect(rangeCopy.end().getTime()).toBe(endTime.getTime());
}); //
// Serialization
//

it("can output JSON in the correct format", () => {
  var beginTime = _moment.default.utc("2012-01-11 11:11", fmt).toDate();

  var endTime = _moment.default.utc("2012-02-22 12:12", fmt).toDate();

  var range = new _timerange.default(beginTime, endTime);
  expect(range.toJSON()).toEqual([1326280260000, 1329912720000]);
});
it("can output a string representation", () => {
  var beginTime = _moment.default.utc("2012-01-11 11:11", fmt).toDate();

  var endTime = _moment.default.utc("2012-02-22 12:12", fmt).toDate();

  var range = new _timerange.default(beginTime, endTime);
  expect(range.toString()).toBe("[1326280260000,1329912720000]");
}); //
// Display
//

it("can display a range as a human friendly string", () => {
  var beginTime = (0, _moment.default)("2014-08-01 05:19:59", fmt2).toDate();
  var endTime = (0, _moment.default)("2014-08-01 07:41:06", fmt2).toDate();
  var range = new _timerange.default(beginTime, endTime);
  var expected = "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am";
  expect(range.humanize()).toBe(expected);
});
it("can display last day as a human friendly string", () => {
  var range = _timerange.default.lastDay();

  var expected = "a day ago to a few seconds ago";
  expect(range.relativeString()).toBe(expected);
});
it("can display last 7 days as a human friendly string", () => {
  var range = _timerange.default.lastSevenDays();

  var expected = "7 days ago to a few seconds ago";
  expect(range.relativeString()).toBe(expected);
});
it("can display last 30 days as a human friendly string", () => {
  var range = _timerange.default.lastThirtyDays();

  var expected = "a month ago to a few seconds ago";
  expect(range.relativeString()).toBe(expected);
});
it("can display last month as a human friendly string", () => {
  var range = _timerange.default.lastMonth();

  var expected = "a month ago to a few seconds ago";
  expect(range.relativeString()).toBe(expected);
});
it("can display last 90 days as a human friendly string", () => {
  var range = _timerange.default.lastNinetyDays();

  var expected = "3 months ago to a few seconds ago";
  expect(range.relativeString()).toBe(expected);
}); //
// Mutation
//

it("can be mutatated to form a new range", () => {
  var beginTime = (0, _moment.default)("2012-01-11 1:11", fmt).toDate();
  var endTime = (0, _moment.default)("2012-02-12 2:12", fmt).toDate();
  var newTime = (0, _moment.default)("2012-03-13 3:13", fmt).toDate();
  var range = new _timerange.default(beginTime, endTime);
  var mutatedTimeRange = range.setEnd(newTime); // Expect the range to be difference and the end time to be different

  expect(mutatedTimeRange).not.toBe(range);
  expect(mutatedTimeRange.end().getTime()).toBe(newTime.getTime());
}); //
// Compare
//

it("can be compared to see if they are equal", () => {
  var ta = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-02-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var tc = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var td = (0, _moment.default)("2010-02-01 12:00", fmt).toDate();
  var range2 = new _timerange.default(tc, td);
  var te = (0, _moment.default)("2012-03-01 12:00", fmt).toDate();
  var tf = (0, _moment.default)("2012-04-02 12:00", fmt).toDate();
  var range3 = new _timerange.default(te, tf);
  expect(range1.equals(range2)).toBeTruthy();
  expect(range1.equals(range3)).toBeFalsy();
});
it("can be compared for overlap to a non-overlapping range", () => {
  var ta = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-02-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var tc = (0, _moment.default)("2010-03-15 12:00", fmt).toDate();
  var td = (0, _moment.default)("2010-04-15 12:00", fmt).toDate();
  var range2 = new _timerange.default(tc, td);
  expect(range1.overlaps(range2)).toBeFalsy();
  expect(range2.overlaps(range1)).toBeFalsy();
});
it("can be compared for overlap to an overlapping range", () => {
  var ta = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-09-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var td = (0, _moment.default)("2010-08-15 12:00", fmt).toDate();
  var te = (0, _moment.default)("2010-11-15 12:00", fmt).toDate();
  var range2 = new _timerange.default(td, te);
  expect(range1.overlaps(range2)).toBeTruthy();
  expect(range2.overlaps(range1)).toBeTruthy();
});
it("can be compared for containment to an range contained within it completely", () => {
  var ta = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-09-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var td = (0, _moment.default)("2010-03-15 12:00", fmt).toDate();
  var te = (0, _moment.default)("2010-06-15 12:00", fmt).toDate();
  var range2 = new _timerange.default(td, te);
  expect(range1.contains(range2)).toBeTruthy();
});
it("can be compared for containment to an overlapping range", () => {
  var ta = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-09-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var td = (0, _moment.default)("2010-06-15 12:00", fmt).toDate();
  var te = (0, _moment.default)("2010-12-15 12:00", fmt).toDate();
  var range2 = new _timerange.default(td, te);
  expect(range1.contains(range2)).toBeFalsy();
}); //
// Compare TimeRanges relative to each other
//

it("can be compared to a time before the range", () => {
  var ta = (0, _moment.default)("2010-06-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-08-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var before = (0, _moment.default)("2010-01-15 12:00", fmt).toDate();
  expect(range1.contains(before)).toBeFalsy();
});
it("can be compared to a time during the range", () => {
  var ta = (0, _moment.default)("2010-06-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-08-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var during = (0, _moment.default)("2010-07-15 12:00", fmt).toDate();
  expect(range1.contains(during)).toBeTruthy();
});
it("can be compared to a time after the range", () => {
  var ta = (0, _moment.default)("2010-06-01 12:00", fmt).toDate();
  var tb = (0, _moment.default)("2010-08-01 12:00", fmt).toDate();
  var range1 = new _timerange.default(ta, tb);
  var after = (0, _moment.default)("2010-12-15 12:00", fmt).toDate();
  expect(range1.contains(after)).toBeFalsy();
});
it("can be undefined if the ranges don't intersect", () => {
  // Two non-overlapping ranges: intersect() returns undefined
  var beginTime = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var endTime = (0, _moment.default)("2010-06-01 12:00", fmt).toDate();
  var range = new _timerange.default(beginTime, endTime);
  var beginTimeOutside = (0, _moment.default)("2010-07-15 12:00", fmt).toDate();
  var endTimeOutside = (0, _moment.default)("2010-08-15 12:00", fmt).toDate();
  var rangeOutside = new _timerange.default(beginTimeOutside, endTimeOutside);
  expect(range.intersection(rangeOutside)).toBeUndefined();
});
it("can be a new range if the ranges intersect", () => {
  // Two overlapping ranges: intersect() returns
  //    01 -------06       range
  //           05-----07   rangeOverlap
  //           05-06       intersection
  var beginTime = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var endTime = (0, _moment.default)("2010-06-01 12:00", fmt).toDate();
  var range = new _timerange.default(beginTime, endTime);
  var beginTimeOverlap = (0, _moment.default)("2010-05-01 12:00", fmt).toDate();
  var endTimeOverlap = (0, _moment.default)("2010-07-01 12:00", fmt).toDate();
  var rangeOverlap = new _timerange.default(beginTimeOverlap, endTimeOverlap);
  var expected = new _timerange.default(beginTimeOverlap, endTime);
  expect(range.intersection(rangeOverlap).toString()).toBe(expected.toString());
});
it("can be a new range (the smaller range) if one range surrounds another", () => {
  // One range fully inside the other intersect() returns the smaller range
  //    01 -------06    range
  //       02--04       rangeInside
  //       02--04       intersection
  var beginTime = (0, _moment.default)("2010-01-01 12:00", fmt).toDate();
  var endTime = (0, _moment.default)("2010-06-01 12:00", fmt).toDate();
  var range = new _timerange.default(beginTime, endTime);
  var beginTimeInside = (0, _moment.default)("2010-02-01 12:00", fmt).toDate();
  var endTimeInside = (0, _moment.default)("2010-04-01 12:00", fmt).toDate();
  var rangeInside = new _timerange.default(beginTimeInside, endTimeInside);
  expect(range.intersection(rangeInside).toString()).toBe(rangeInside.toString());
  expect(rangeInside.intersection(range).toString()).toBe(rangeInside.toString());
});