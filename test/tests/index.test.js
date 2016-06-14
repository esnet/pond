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
import Index from "../../src/index.js";

describe("Indexes", () => {

    describe("Index creation", () => {

        it("can create a daily index", done => {
            const index = new Index("1d-12355");
            const expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("a day");
            done();
        });

        it("can create a hourly index", done => {
            const index = new Index("1h-123554");
            const expected = "[Sun, 05 Feb 1984 02:00:00 GMT, Sun, 05 Feb 1984 03:00:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("an hour");
            done();
        });

        it("can create a 5 minute index", done => {
            const index = new Index("5m-4135541");
            const expected = "[Sat, 25 Apr 2009 12:25:00 GMT, Sat, 25 Apr 2009 12:30:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("5 minutes");
            done();
        });

        it("can create a 30 second index", done => {
            const index = new Index("30s-41135541");
            const expected = "[Sun, 08 Feb 2009 04:10:30 GMT, Sun, 08 Feb 2009 04:11:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("a few seconds");
            done();
        });

        it("can create a year index", done => {
            const index = new Index("2014");
            const expected = "[Wed, 01 Jan 2014 00:00:00 GMT, Wed, 31 Dec 2014 23:59:59 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("a year");
            done();
        });

        it("can create a month index", done => {
            const index = new Index("2014-09");
            const expected = "[Mon, 01 Sep 2014 00:00:00 GMT, Tue, 30 Sep 2014 23:59:59 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("a month");
            done();
        });

        it("can create a day index", done => {
            const index = new Index("2014-09-17");
            const expected = "[Wed, 17 Sep 2014 00:00:00 GMT, Wed, 17 Sep 2014 23:59:59 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("a day");
            done();
        });

    });

    describe("Index nice names", () => {

        it("can create a year index", done => {
            const index = new Index("2014");
            const expected = "2014";
            expect(index.toNiceString()).to.equal(expected);
            done();
        });

        it("can create a month index..", done => {
            const index = new Index("2014-09");
            const expected = "September";
            expect(index.toNiceString()).to.equal(expected);
            done();
        });

        it("can create a day index", done => {
            const index = new Index("2014-09-17");
            const expected = "September 17th 2014";
            expect(index.toNiceString()).to.equal(expected);
            done();
        });

        it("can create a day index", done => {
            const index = new Index("2014-09-17");
            const expected = "17 Sep 2014";
            expect(index.toNiceString("DD MMM YYYY")).to.equal(expected);
            done();
        });
    });

    describe("Index bucketing from a date", () => {

        it("can create a day index for a date", done => {
            const date = new Date(1429673400000);
            const expected = "2015-04-21";
            expect(Index.getDailyIndexString(date)).to.equal(expected);
            done();
        });

        it("can create a month index for a date", done => {
            const date = new Date(1429673400000);
            const expected = "2015-04";
            expect(Index.getMonthlyIndexString(date)).to.equal(expected);
            done();
        });

        it("can create a year index for a date", done => {
            const date = new Date(1429673400000);
            const expected = "2015";
            expect(Index.getYearlyIndexString(date)).to.equal(expected);
            done();
        });
    });
});
