/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import { filter, sum, avg, percentile } from "../base/functions";

const goodValues = [1, 2, 3, 4, 5];
const badValues = [1, 2, null, 4, 5];

describe("Functions to clean values", () => {
    it("can use use the keepMissing function to pass through values ", () => {
        expect(filter.keepMissing(goodValues)).toEqual([1, 2, 3, 4, 5]);
        expect(filter.keepMissing(badValues)).toEqual([1, 2, null, 4, 5]);
    });

    it("can use ignoreMissing to filter out missing values ", () => {
        expect(filter.ignoreMissing(goodValues)).toEqual([1, 2, 3, 4, 5]);
        expect(filter.ignoreMissing(badValues)).toEqual([1, 2, 4, 5]);
    });

    it("can use zeroMissing to replace missing values with zeros", () => {
        expect(filter.zeroMissing(goodValues)).toEqual([1, 2, 3, 4, 5]);
        expect(filter.zeroMissing(badValues)).toEqual([1, 2, 0, 4, 5]);
    });

    it("can use propagateMissing to replace missing values with zeros", () => {
        expect(filter.propagateMissing(goodValues)).toEqual([1, 2, 3, 4, 5]);
        expect(filter.propagateMissing(badValues)).toBeNull();
    });
});

describe("Function: sum()", () => {
    it("can use use the keepMissing function to pass through values ", () => {
        expect(sum(filter.keepMissing)(goodValues)).toEqual(15);
        expect(sum(filter.keepMissing)(badValues)).toEqual(12);
    });

    it("can use use the ignoreMissing in sum function", () => {
        expect(sum(filter.ignoreMissing)(goodValues)).toEqual(15);
        expect(sum(filter.ignoreMissing)(badValues)).toEqual(12);
    });

    it("can use use the zeroMissing in sum function", () => {
        expect(sum(filter.zeroMissing)(goodValues)).toEqual(15);
        expect(sum(filter.zeroMissing)(badValues)).toEqual(12);
    });

    it("can use use the propagateMissing in sum function", () => {
        expect(sum(filter.propagateMissing)(goodValues)).toEqual(15);
        expect(sum(filter.propagateMissing)(badValues)).toBeNull();
    });
});

describe("Function: avg()", () => {
    it("can use use the keepMissing function to pass through values ", () => {
        expect(avg(filter.keepMissing)(goodValues)).toEqual(3);
        expect(avg(filter.keepMissing)(badValues)).toEqual(2.4);
    });

    it("can use use the ignoreMissing in avg function", () => {
        expect(avg(filter.ignoreMissing)(goodValues)).toEqual(3);
        expect(avg(filter.ignoreMissing)(badValues)).toEqual(3);
    });

    it("can use use the zeroMissing in avg function", () => {
        expect(avg(filter.zeroMissing)(goodValues)).toEqual(3);
        expect(avg(filter.zeroMissing)(badValues)).toEqual(2.4);
    });

    it("can use use the propagateMissing in avg function", () => {
        expect(avg(filter.propagateMissing)(goodValues)).toEqual(3);
        expect(avg(filter.propagateMissing)(badValues)).toBeNull();
    });
});

describe("Function: percentile()", () => {
    it("can use the percentile function", () => {
        const values = [1142, 944, 433, 367, 986];
        expect(percentile(0)(values)).toEqual(367.0);
        expect(percentile(25)(values)).toEqual(433.0);
        expect(percentile(50)(values)).toEqual(944.0);
        expect(percentile(75)(values)).toEqual(986.0);
        expect(percentile(90)(values)).toEqual(1079.6);
        expect(percentile(95)(values)).toEqual(1110.8);
        expect(percentile(100)(values)).toEqual(1142.0);
    });
});
