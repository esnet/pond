/**
 *  Copyright (c) 2016, The Regents of the University of California,
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
/* eslint no-unused-vars: 0 */

import { expect } from "chai";

import { filter, sum, avg, percentile } from "../../src/functions.js";

const goodValues = [1, 2, 3, 4, 5];
const badValues = [1, 2, null, 4, 5];

describe("Functions to clean values", () => {

    it("can use use the keepMissing function to pass through values ", done => {
        expect(filter.keepMissing(goodValues)).to.deep.equal([1, 2, 3, 4, 5]);
        expect(filter.keepMissing(badValues)).to.deep.equal([1, 2, null, 4, 5]);
        done();
    });

    it("can use ignoreMissing to filter out missing values ", done => {
        expect(filter.ignoreMissing(goodValues)).to.deep.equal([1, 2, 3, 4, 5]);
        expect(filter.ignoreMissing(badValues)).to.deep.equal([1, 2, 4, 5]);
        done();
    });

    it("can use zeroMissing to replace missing values with zeros", done => {
        expect(filter.zeroMissing(goodValues)).to.deep.equal([1, 2, 3, 4, 5]);
        expect(filter.zeroMissing(badValues)).to.deep.equal([1, 2, 0, 4, 5]);
        done();
    });

    it("can use propagateMissing to replace missing values with zeros", done => {
        expect(filter.propagateMissing(goodValues)).to.deep.equal([1, 2, 3, 4, 5]);
        expect(filter.propagateMissing(badValues)).to.be.null;
        done();
    });
});

describe("Function: sum()", () => {

    it("can use use the keepMissing function to pass through values ", done => {
        expect(sum(filter.keepMissing)(goodValues)).to.equal(15);
        expect(sum(filter.keepMissing)(badValues)).to.equal(12);
        done();
    });

    it("can use use the ignoreMissing in sum function", done => {
        expect(sum(filter.ignoreMissing)(goodValues)).to.equal(15);
        expect(sum(filter.ignoreMissing)(badValues)).to.equal(12);
        done();
    });

    it("can use use the zeroMissing in sum function", done => {
        expect(sum(filter.zeroMissing)(goodValues)).to.equal(15);
        expect(sum(filter.zeroMissing)(badValues)).to.equal(12);
        done();
    });

    it("can use use the propagateMissing in sum function", done => {
        expect(sum(filter.propagateMissing)(goodValues)).to.equal(15);
        expect(sum(filter.propagateMissing)(badValues)).to.be.null;
        done();
    });

});

describe("Function: avg()", () => {

    it("can use use the keepMissing function to pass through values ", done => {
        expect(avg(filter.keepMissing)(goodValues)).to.equal(3);
        expect(avg(filter.keepMissing)(badValues)).to.equal(2.4);
        done();
    });

    it("can use use the ignoreMissing in avg function", done => {
        expect(avg(filter.ignoreMissing)(goodValues)).to.equal(3);
        expect(avg(filter.ignoreMissing)(badValues)).to.equal(3);
        done();
    });

    it("can use use the zeroMissing in avg function", done => {
        expect(avg(filter.zeroMissing)(goodValues)).to.equal(3);
        expect(avg(filter.zeroMissing)(badValues)).to.equal(2.4);
        done();
    });

    it("can use use the propagateMissing in avg function", done => {
        expect(avg(filter.propagateMissing)(goodValues)).to.equal(3);
        expect(avg(filter.propagateMissing)(badValues)).to.be.null;
        done();
    });

});

describe("Function: percentile()", () => {

    it("can use the percentile function", done => {
        const values = [1142, 944, 433, 367, 986];
        expect(percentile(0)(values)).to.equal(367.0);
        expect(percentile(25)(values)).to.equal(433.0);
        expect(percentile(50)(values)).to.equal(944.0);
        expect(percentile(75)(values)).to.equal(986.0);
        expect(percentile(90)(values)).to.equal(1079.6);
        expect(percentile(95)(values)).to.equal(1110.8);
        expect(percentile(100)(values)).to.equal(1142.0);
        done();
    });

});
