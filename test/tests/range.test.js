var moment = require('moment');
var expect = require('chai').expect;

var fmt = "YYYY-MM-DD HH:mm";
var fmt2 = "YYYY-MM-DD HH:mm:ss";

describe("Time ranges", function () {

    var TimeRange = require("../../src/range.js");

    describe("TimeRange creation", function () {
        it('can create a new range with a begin and end time', function(done) {
            var beginTime = moment("2012-01-11 11:11", fmt).toDate();
            var endTime =   moment("2012-02-22 12:12", fmt).toDate();
            var range = new TimeRange(beginTime, endTime);

            expect(range.begin().getTime()).to.equal(beginTime.getTime());
            expect(range.end().getTime()).to.equal(endTime.getTime());
            done();
        });
        it('can create a new range with two UNIX epoch times in an array', function(done) {
            var range = new TimeRange([1326309060000, 1329941520000]);
            expect(range.toJSON()).to.deep.equal([1326309060000, 1329941520000]);
            done();
        });
    });

    describe("TimeRange copying", function () {
        it('can be copied to give a new range', function(done) {
            var beginTime = moment("2012-01-11 1:11", fmt).toDate();
            var endTime =   moment("2012-02-12 2:12", fmt).toDate();
            var newTime =   moment("2012-03-13 3:13", fmt).toDate();
            var rangeOrig = new TimeRange(beginTime, endTime);
            var rangeCopy = new TimeRange(rangeOrig);

            //We expect the copy to not equal the original, but for the dates
            //within the copy to be the same
            expect(rangeCopy).to.not.equal(rangeOrig);
            expect(rangeCopy.begin().getTime()).to.equal(beginTime.getTime());
            expect(rangeCopy.end().getTime()).to.equal(endTime.getTime());
            done();
        });
    });

    describe("TimeRange serialization", function () {
        it('can output JSON in the correct format', function(done) {
            var beginTime = moment("2012-01-11 11:11", fmt).toDate();
            var endTime =   moment("2012-02-22 12:12", fmt).toDate();
            var range = new TimeRange(beginTime, endTime);
            expect(range.toJSON()).to.deep.equal([1326309060000, 1329941520000]);
            done();
        });
        it('can output a string representation', function(done) {
            var beginTime = moment("2012-01-11 11:11", fmt).toDate();
            var endTime =   moment("2012-02-22 12:12", fmt).toDate();
            var range = new TimeRange(beginTime, endTime);
            expect(range.toString()).to.equal('[1326309060000,1329941520000]');
            done();
        });

    });

    describe("TimeRange human friendly display", function () {
        it('can display range as a human friendly string', function(done) {
            var beginTime = moment("2014-08-01 05:19:59", fmt2).toDate();
            var endTime =   moment("2014-08-01 07:41:06", fmt2).toDate();
            var range = new TimeRange(beginTime, endTime);
            var expected = "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
            expect(range.humanize()).to.equal(expected);
            done();
        });
        it('can display relative ranges as a human friendly string', function(done) {
            var range = TimeRange.lastThirtyDays();
            var expected = "a few seconds ago to a month ago"
            expect(range.relativeString()).to.equal(expected);
            done();
        });
    });

    describe("TimeRange mutation", function () {
        it('can be mutatated to form a new range', function(done) {
            var beginTime = moment("2012-01-11 1:11", fmt).toDate();
            var endTime =   moment("2012-02-12 2:12", fmt).toDate();
            var newTime =   moment("2012-03-13 3:13", fmt).toDate();

            var range = new TimeRange(beginTime, endTime);
            var mutatedTimeRange = range.setEnd(newTime);

            //Expect the range to be difference and the end time to be different
            expect(mutatedTimeRange).to.not.equal(range);
            expect(mutatedTimeRange.end().getTime()).to.equal(newTime.getTime());
            done();
        });
    });

    describe("TimeRange compare to another range", function () {

        it('can be compared to see if they are equal', function(done) {
            var ta = moment("2010-01-01 12:00", fmt).toDate();
            var tb = moment("2010-02-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var tc = moment("2010-01-01 12:00", fmt).toDate();
            var td = moment("2010-02-01 12:00", fmt).toDate();
            var range2 = new TimeRange(tc, td);

            var te = moment("2012-03-01 12:00", fmt).toDate();
            var tf = moment("2012-04-02 12:00", fmt).toDate();
            var range3 = new TimeRange(te, tf);

            expect(range1.equals(range2)).to.be.true;
            expect(range1.equals(range3)).to.be.false;

            done();
        });

        it('can be compared for overlap to a non-overlapping range', function(done) {
            var ta = moment("2010-01-01 12:00", fmt).toDate();
            var tb = moment("2010-02-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var tc = moment("2010-03-15 12:00", fmt).toDate();
            var td = moment("2010-04-15 12:00", fmt).toDate();
            var range2 = new TimeRange(tc, td);

            expect(range1.overlaps(range2)).to.be.false;
            expect(range2.overlaps(range1)).to.be.false;
            done();
        });

        it('can be compared for overlap to an overlapping range', function(done) {
            var ta = moment("2010-01-01 12:00", fmt).toDate();
            var tb = moment("2010-09-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var td = moment("2010-08-15 12:00", fmt).toDate();
            var te = moment("2010-11-15 12:00", fmt).toDate();
            var range2 = new TimeRange(td, te);

            expect(range1.overlaps(range2)).to.be.true;
            expect(range2.overlaps(range1)).to.be.true;
            done();
        });

        it('can be compared for containment to an range contained within it completely', function(done) {
            var ta = moment("2010-01-01 12:00", fmt).toDate();
            var tb = moment("2010-09-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var td = moment("2010-03-15 12:00", fmt).toDate();
            var te = moment("2010-06-15 12:00", fmt).toDate();
            var range2 = new TimeRange(td, te);

            expect(range1.contains(range2)).to.be.true;
            done();
        });

        it('can be compared for containment to an overlapping range', function(done) {
            var ta = moment("2010-01-01 12:00", fmt).toDate();
            var tb = moment("2010-09-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var td = moment("2010-06-15 12:00", fmt).toDate();
            var te = moment("2010-12-15 12:00", fmt).toDate();
            var range2 = new TimeRange(td, te);

            expect(range1.contains(range2)).to.be.false;
            done();
        });
    });


    describe("TimeRange compare with time", function () {

        it('can be compared to a time before the range', function(done) {
            var ta = moment("2010-06-01 12:00", fmt).toDate();
            var tb =   moment("2010-08-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var before = moment("2010-01-15 12:00", fmt).toDate();

            expect(range1.contains(before)).to.be.false;
            done();
        });

        it('can be compared to a time during the range', function(done) {
            var ta = moment("2010-06-01 12:00", fmt).toDate();
            var tb =   moment("2010-08-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var during = moment("2010-07-15 12:00", fmt).toDate();

            expect(range1.contains(during)).to.be.true;
            done();
        });

        it('can be compared to a time after the range', function(done) {
            var ta = moment("2010-06-01 12:00", fmt).toDate();
            var tb =   moment("2010-08-01 12:00", fmt).toDate();
            var range1 = new TimeRange(ta, tb);

            var after  = moment("2010-12-15 12:00", fmt).toDate();

            expect(range1.contains(after)).to.be.false;
            done();
        });
    });

    describe("Intersections of ranges", function () {

        it("can be undefined if the ranges don't intersect", function(done) {
            // Two non-overlapping ranges: intersect() returns undefined
            var beginTime = moment("2010-01-01 12:00", fmt).toDate();
            var endTime =   moment("2010-06-01 12:00", fmt).toDate();
            var range = new TimeRange(beginTime, endTime);

            var beginTimeOutside = moment("2010-07-15 12:00", fmt).toDate();
            var endTimeOutside =   moment("2010-08-15 12:00", fmt).toDate();
            var rangeOutside = new TimeRange(beginTimeOutside, endTimeOutside);

            expect(range.intersection(rangeOutside)).to.be.undefined;
            done();
        });

        it("can be a new range if the ranges intersect", function(done) {
            // Two overlapping ranges: intersect() returns 
            //    01 -------06       range
            //           05-----07   rangeOverlap
            //           05-06       intersection
            var beginTime = moment("2010-01-01 12:00", fmt).toDate();
            var endTime =   moment("2010-06-01 12:00", fmt).toDate();
            var range = new TimeRange(beginTime, endTime);

            var beginTimeOverlap = moment("2010-05-01 12:00", fmt).toDate();
            var endTimeOverlap =   moment("2010-07-01 12:00", fmt).toDate();
            var rangeOverlap = new TimeRange(beginTimeOverlap, endTimeOverlap);

            var expected = new TimeRange(beginTimeOverlap, endTime);

            expect(range.intersection(rangeOverlap).toString()).to.equal(expected.toString());
            done();
        });

        it("can be a new range (the smaller range) if one range surrounds another", function(done) {
            // One range fully inside the other intersect() returns the smaller range
            //    01 -------06    range
            //       02--04       rangeInside
            //       02--04       intersection
            var beginTime = moment("2010-01-01 12:00", fmt).toDate();
            var endTime =   moment("2010-06-01 12:00", fmt).toDate();
            var range = new TimeRange(beginTime, endTime);

            var beginTimeInside = moment("2010-02-01 12:00", fmt).toDate();
            var endTimeInside =   moment("2010-04-01 12:00", fmt).toDate();
            var rangeInside = new TimeRange(beginTimeInside, endTimeInside);

            expect(range.intersection(rangeInside).toString()).to.equal(rangeInside.toString());
            expect(rangeInside.intersection(range).toString()).to.equal(rangeInside.toString());
            done();
        });
    });

});