/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* global it, describe */
/* eslint no-unused-expressions: 0 */
/* eslint-disable max-len */

import { expect } from "chai";
import moment from "moment";
import TimeRange from "../../src/range.js";

const fmt = "YYYY-MM-DD HH:mm";
const fmt2 = "YYYY-MM-DD HH:mm:ss";

describe("Time range", () => {

    describe("creation", () => {

        it("can create a new range with a begin and end time", done => {
            const beginTime = moment("2012-01-11 11:11", fmt).toDate();
            const endTime = moment("2012-02-22 12:12", fmt).toDate();
            const range = new TimeRange(beginTime, endTime);
            expect(range.begin().getTime()).to.equal(beginTime.getTime());
            expect(range.end().getTime()).to.equal(endTime.getTime());
            done();
        });

        it("can create a new range with two UNIX epoch times in an array", done => {
            const range = new TimeRange([1326309060000, 1329941520000]);
            expect(range.toJSON()).to.deep.equal([1326309060000, 1329941520000]);
            done();
        });

    });

    describe("copy constructor", () => {

        it("can be used to give a new range", done => {
            const beginTime = moment("2012-01-11 1:11", fmt).toDate();
            const endTime = moment("2012-02-12 2:12", fmt).toDate();
            const rangeOrig = new TimeRange(beginTime, endTime);
            const rangeCopy = new TimeRange(rangeOrig);
            // We expect the copy to not equal the original, but for the dates
            // within the copy to be the same
            expect(rangeCopy).to.not.equal(rangeOrig);
            expect(rangeCopy.begin().getTime()).to.equal(beginTime.getTime());
            expect(rangeCopy.end().getTime()).to.equal(endTime.getTime());
            done();
        });

    });

    describe("serialization", () => {

        it("can output JSON in the correct format", done => {
            const beginTime = moment.utc("2012-01-11 11:11", fmt).toDate();
            const endTime = moment.utc("2012-02-22 12:12", fmt).toDate();
            const range = new TimeRange(beginTime, endTime);
            expect(range.toJSON()).to.deep.equal([1326280260000, 1329912720000]);
            done();
        });

        it("can output a string representation", done => {
            const beginTime = moment.utc("2012-01-11 11:11", fmt).toDate();
            const endTime = moment.utc("2012-02-22 12:12", fmt).toDate();
            const range = new TimeRange(beginTime, endTime);
            expect(range.toString()).to.equal("[1326280260000,1329912720000]");
            done();
        });

    });

    describe("human friendly display code", () => {

        it("can display a range as a human friendly string", done => {
            const beginTime = moment("2014-08-01 05:19:59", fmt2).toDate();
            const endTime = moment("2014-08-01 07:41:06", fmt2).toDate();
            const range = new TimeRange(beginTime, endTime);
            const expected = "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am";
            expect(range.humanize()).to.equal(expected);
            done();
        });

        it("can display last day as a human friendly string", done => {
            const range = TimeRange.lastDay();
            const expected = "a day ago to a few seconds ago";
            expect(range.relativeString()).to.equal(expected);
            done();
        });

        it("can display last 7 days as a human friendly string", done => {
            const range = TimeRange.lastSevenDays();
            const expected = "7 days ago to a few seconds ago";
            expect(range.relativeString()).to.equal(expected);
            done();
        });

        it("can display last 30 days as a human friendly string", done => {
            const range = TimeRange.lastThirtyDays();
            const expected = "a month ago to a few seconds ago";
            expect(range.relativeString()).to.equal(expected);
            done();
        });

        it("can display last month as a human friendly string", done => {
            const range = TimeRange.lastMonth();
            const expected = "a month ago to a few seconds ago";
            expect(range.relativeString()).to.equal(expected);
            done();
        });

        it("can display last 90 days as a human friendly string", done => {
            const range = TimeRange.lastNinetyDays();
            const expected = "3 months ago to a few seconds ago";
            expect(range.relativeString()).to.equal(expected);
            done();
        });
    });

    describe("mutation", () => {

        it("can be mutatated to form a new range", done => {
            const beginTime = moment("2012-01-11 1:11", fmt).toDate();
            const endTime = moment("2012-02-12 2:12", fmt).toDate();
            const newTime = moment("2012-03-13 3:13", fmt).toDate();
            const range = new TimeRange(beginTime, endTime);
            const mutatedTimeRange = range.setEnd(newTime);

            // Expect the range to be difference and the end time to be different
            expect(mutatedTimeRange).to.not.equal(range);
            expect(mutatedTimeRange.end().getTime()).to.equal(newTime.getTime());
            done();
        });
    });

    describe("TimeRange compare to another range", () => {

        it("can be compared to see if they are equal", done => {
            const ta = moment("2010-01-01 12:00", fmt).toDate();
            const tb = moment("2010-02-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);
            const tc = moment("2010-01-01 12:00", fmt).toDate();
            const td = moment("2010-02-01 12:00", fmt).toDate();
            const range2 = new TimeRange(tc, td);
            const te = moment("2012-03-01 12:00", fmt).toDate();
            const tf = moment("2012-04-02 12:00", fmt).toDate();
            const range3 = new TimeRange(te, tf);
            expect(range1.equals(range2)).to.be.true;
            expect(range1.equals(range3)).to.be.false;
            done();
        });

        it("can be compared for overlap to a non-overlapping range", done => {
            const ta = moment("2010-01-01 12:00", fmt).toDate();
            const tb = moment("2010-02-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);
            const tc = moment("2010-03-15 12:00", fmt).toDate();
            const td = moment("2010-04-15 12:00", fmt).toDate();
            const range2 = new TimeRange(tc, td);
            expect(range1.overlaps(range2)).to.be.false;
            expect(range2.overlaps(range1)).to.be.false;
            done();
        });

        it("can be compared for overlap to an overlapping range", done => {
            const ta = moment("2010-01-01 12:00", fmt).toDate();
            const tb = moment("2010-09-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);

            const td = moment("2010-08-15 12:00", fmt).toDate();
            const te = moment("2010-11-15 12:00", fmt).toDate();
            const range2 = new TimeRange(td, te);

            expect(range1.overlaps(range2)).to.be.true;
            expect(range2.overlaps(range1)).to.be.true;
            done();
        });

        it("can be compared for containment to an range contained within it completely", done => {
            const ta = moment("2010-01-01 12:00", fmt).toDate();
            const tb = moment("2010-09-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);

            const td = moment("2010-03-15 12:00", fmt).toDate();
            const te = moment("2010-06-15 12:00", fmt).toDate();
            const range2 = new TimeRange(td, te);

            expect(range1.contains(range2)).to.be.true;
            done();
        });

        it("can be compared for containment to an overlapping range", done => {
            const ta = moment("2010-01-01 12:00", fmt).toDate();
            const tb = moment("2010-09-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);

            const td = moment("2010-06-15 12:00", fmt).toDate();
            const te = moment("2010-12-15 12:00", fmt).toDate();
            const range2 = new TimeRange(td, te);

            expect(range1.contains(range2)).to.be.false;
            done();
        });
    });


    describe("TimeRange compare with time", () => {

        it("can be compared to a time before the range", done => {
            const ta = moment("2010-06-01 12:00", fmt).toDate();
            const tb = moment("2010-08-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);
            const before = moment("2010-01-15 12:00", fmt).toDate();
            expect(range1.contains(before)).to.be.false;
            done();
        });

        it("can be compared to a time during the range", done => {
            const ta = moment("2010-06-01 12:00", fmt).toDate();
            const tb = moment("2010-08-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);
            const during = moment("2010-07-15 12:00", fmt).toDate();
            expect(range1.contains(during)).to.be.true;
            done();
        });

        it("can be compared to a time after the range", done => {
            const ta = moment("2010-06-01 12:00", fmt).toDate();
            const tb = moment("2010-08-01 12:00", fmt).toDate();
            const range1 = new TimeRange(ta, tb);
            const after = moment("2010-12-15 12:00", fmt).toDate();
            expect(range1.contains(after)).to.be.false;
            done();
        });
    });

    describe("Intersections of ranges", () => {

        it("can be undefined if the ranges don't intersect", done => {
            // Two non-overlapping ranges: intersect() returns undefined
            const beginTime = moment("2010-01-01 12:00", fmt).toDate();
            const endTime = moment("2010-06-01 12:00", fmt).toDate();
            const range = new TimeRange(beginTime, endTime);
            const beginTimeOutside = moment("2010-07-15 12:00", fmt).toDate();
            const endTimeOutside = moment("2010-08-15 12:00", fmt).toDate();
            const rangeOutside = new TimeRange(beginTimeOutside, endTimeOutside);
            expect(range.intersection(rangeOutside)).to.be.undefined;
            done();
        });

        it("can be a new range if the ranges intersect", done => {
            // Two overlapping ranges: intersect() returns
            //    01 -------06       range
            //           05-----07   rangeOverlap
            //           05-06       intersection
            const beginTime = moment("2010-01-01 12:00", fmt).toDate();
            const endTime = moment("2010-06-01 12:00", fmt).toDate();
            const range = new TimeRange(beginTime, endTime);
            const beginTimeOverlap = moment("2010-05-01 12:00", fmt).toDate();
            const endTimeOverlap = moment("2010-07-01 12:00", fmt).toDate();
            const rangeOverlap = new TimeRange(beginTimeOverlap, endTimeOverlap);
            const expected = new TimeRange(beginTimeOverlap, endTime);
            expect(range.intersection(rangeOverlap).toString()).to.equal(expected.toString());
            done();
        });

        it("can be a new range (the smaller range) if one range surrounds another", done => {
            // One range fully inside the other intersect() returns the smaller range
            //    01 -------06    range
            //       02--04       rangeInside
            //       02--04       intersection
            const beginTime = moment("2010-01-01 12:00", fmt).toDate();
            const endTime = moment("2010-06-01 12:00", fmt).toDate();
            const range = new TimeRange(beginTime, endTime);
            const beginTimeInside = moment("2010-02-01 12:00", fmt).toDate();
            const endTimeInside = moment("2010-04-01 12:00", fmt).toDate();
            const rangeInside = new TimeRange(beginTimeInside, endTimeInside);
            expect(range.intersection(rangeInside).toString()).to.equal(rangeInside.toString());
            expect(rangeInside.intersection(range).toString()).to.equal(rangeInside.toString());
            done();
        });
    });
});
