/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

declare const it: any;
declare const expect: any;

import { index } from "../src/index";
import { TimeAlignment } from "../src/types";

it("can create a daily index", done => {
    const idx = index("1d-12355");
    expect(idx.toTimeRange().toJSON()).toEqual({ timerange: [1067472000000, 1067558400000] });
    expect(idx.toTimeRange().humanizeDuration()).toBe("a day");
    done();
});

it("can create a hourly index", done => {
    const idx = index("1h-123554");
    const expected = "[Sun, 05 Feb 1984 02:00:00 GMT, Sun, 05 Feb 1984 03:00:00 GMT]";
    expect(idx.toTimeRange().toUTCString()).toBe(expected);
    expect(idx.toTimeRange().humanizeDuration()).toBe("an hour");
    done();
});

it("can create a 5 minute index", done => {
    const idx = index("5m-4135541");
    const expected = "[Sat, 25 Apr 2009 12:25:00 GMT, Sat, 25 Apr 2009 12:30:00 GMT]";
    expect(idx.toTimeRange().toUTCString()).toBe(expected);
    expect(idx.toTimeRange().humanizeDuration()).toBe("5 minutes");
    done();
});

it("can create a 30 second index", done => {
    const idx = index("30s-41135541");
    const expected = "[Sun, 08 Feb 2009 04:10:30 GMT, Sun, 08 Feb 2009 04:11:00 GMT]";
    expect(idx.toTimeRange().toUTCString()).toBe(expected);
    expect(idx.toTimeRange().humanizeDuration()).toBe("a few seconds");
    done();
});

it("can create a year index", done => {
    const idx = index("2014");
    const expected = "[Wed, 01 Jan 2014 00:00:00 GMT, Wed, 31 Dec 2014 23:59:59 GMT]";
    expect(idx.toTimeRange().toUTCString()).toBe(expected);
    expect(idx.toTimeRange().humanizeDuration()).toBe("a year");
    done();
});

it("can create a month index and get its nice string", done => {
    const idx = index("2014-09");
    const expected = "[Mon, 01 Sep 2014 00:00:00 GMT, Tue, 30 Sep 2014 23:59:59 GMT]";
    expect(idx.toTimeRange().toUTCString()).toBe(expected);
    expect(idx.toTimeRange().humanizeDuration()).toBe("a month");
    done();
});

it("can create a day index and get its nice string", done => {
    const idx = index("2014-09-17");
    const expected = "[Wed, 17 Sep 2014 00:00:00 GMT, Wed, 17 Sep 2014 23:59:59 GMT]";
    expect(idx.toTimeRange().toUTCString()).toBe(expected);
    expect(idx.toTimeRange().humanizeDuration()).toBe("a day");
    done();
});

it("can create a day index and get its nice string in a custom format", done => {
    const idx = index("2014");
    const expected = "2014";
    expect(idx.toNiceString()).toBe(expected);
    done();
});

it("can create a month index..", done => {
    const idx = index("2014-09");
    const expected = "September";
    expect(idx.toNiceString()).toBe(expected);
    done();
});

it("can create a day index", done => {
    const idx = index("2014-09-17");
    const expected = "September 17th 2014";
    expect(idx.toNiceString()).toBe(expected);
    done();
});

it("can create a day index", done => {
    const idx = index("2014-09-17");
    const expected = "17 Sep 2014";
    expect(idx.toNiceString("DD MMM YYYY")).toBe(expected);
    done();
});

it("can create an index and get a time from it", done => {
    const idx = index("5m-4135541");
    expect(idx.toTime(TimeAlignment.Begin).toUTCString()).toBe("Sat, 25 Apr 2009 12:25:00 GMT");
    expect(idx.toTime(TimeAlignment.Middle).toUTCString()).toBe("Sat, 25 Apr 2009 12:27:30 GMT");
    expect(idx.toTime(TimeAlignment.End).toUTCString()).toBe("Sat, 25 Apr 2009 12:30:00 GMT");
    done();
});
