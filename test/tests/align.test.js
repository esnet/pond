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

import moment from "moment";
import { expect } from "chai";

import Event from "../../src/event";
import TimeSeries from "../../src/series.js";

const SIMPLE_GAP_DATA = {
    name: "traffic",
    columns: ["time", "value"],
    points: [
        [1471824030000, .75],  // Mon, 22 Aug 2016 00:00:30 GMT
        [1471824105000, 2],    // Mon, 22 Aug 2016 00:01:45 GMT
        [1471824210000, 1],    // Mon, 22 Aug 2016 00:03:30 GMT
        [1471824390000, 1],    // Mon, 22 Aug 2016 00:06:30 GMT
        [1471824510000, 3],    // Mon, 22 Aug 2016 00:08:30 GMT
        //final point in same window, does nothing, for coverage
        [1471824525000, 5],    // Mon, 22 Aug 2016 00:08:45 GMT
    ]
};

const SIMPLE_GAP_DATA_BAD = {
    name: "traffic",
    columns: ["time", "value"],
    points: [
        [1471824030000, .75],     // Mon, 22 Aug 2016 00:00:30 GMT
        [1471824105000, 2],       // Mon, 22 Aug 2016 00:01:45 GMT
        [1471824210000, 1],       // Mon, 22 Aug 2016 00:03:30 GMT
        [1471824390000, 1],       // Mon, 22 Aug 2016 00:06:30 GMT
        [1471824510000, "bob!"],  // Mon, 22 Aug 2016 00:08:30 GMT
        [1471824525000, 5],       // Mon, 22 Aug 2016 00:08:45 GMT
    ]
};

// already aligned totally synthetic rates to make sure
// the underlying math is at the right order of magnitude.
const RATE = {
    name: "traffic",
    columns: ["time", "in"],
    points: [
        [0, 1],
        [30000, 3],
        [60000, 10],
        [90000, 40],
        [120000, 70],
        [150000, 130],
        [180000, 190],
        [210000, 220],
        [240000, 300],
        [270000, 390],
        [300000, 510],
    ]
};

describe("Testing the align() processor", () => {
   
    it("can do basic alignment", done => {
        const ts = new TimeSeries(SIMPLE_GAP_DATA);
        const aligned = ts.align("value", "1m");

        expect(aligned.size()).to.equal(8);
        expect(aligned.at(0).get()).to.equal(1.25);
        expect(aligned.at(1).get()).to.equal(1.8571428571428572);
        expect(aligned.at(2).get()).to.equal(1.2857142857142856);
        expect(aligned.at(3).get()).to.equal(1.0);
        expect(aligned.at(4).get()).to.equal(1.0);
        expect(aligned.at(5).get()).to.equal(1.0);
        expect(aligned.at(6).get()).to.equal(1.5);
        expect(aligned.at(7).get()).to.equal(2.5);

        done();
    });

    it("can do basic hold alignment", done => {
        const ts = new TimeSeries(SIMPLE_GAP_DATA);
        const aligned = ts.align("value", "1m", "hold");

        expect(aligned.size()).to.equal(8);
        expect(aligned.at(0).get()).to.equal(.75);
        expect(aligned.at(1).get()).to.equal(2);
        expect(aligned.at(2).get()).to.equal(2);
        expect(aligned.at(3).get()).to.equal(1);
        expect(aligned.at(4).get()).to.equal(1);
        expect(aligned.at(5).get()).to.equal(1);
        expect(aligned.at(6).get()).to.equal(1);
        expect(aligned.at(7).get()).to.equal(1);

        done();
    });

    it("can do align with a limit (hold)", done => {
        const ts = new TimeSeries(SIMPLE_GAP_DATA);
        const aligned = ts.align("value", "1m", "hold", 2);

        expect(aligned.size()).to.equal(8);
        expect(aligned.at(0).get()).to.equal(.75);
        expect(aligned.at(1).get()).to.equal(2);
        expect(aligned.at(2).get()).to.equal(2);
        expect(aligned.at(3).get()).to.be.null;  // over limit fill with null
        expect(aligned.at(4).get()).to.be.null;  // over limit fill with null
        expect(aligned.at(5).get()).to.be.null;  // over limit fill with null
        expect(aligned.at(6).get()).to.equal(1);
        expect(aligned.at(7).get()).to.equal(1);

        done();
    });

    it("can do align with a limit (linear)", done => {
        const ts = new TimeSeries(SIMPLE_GAP_DATA);
        const aligned = ts.align("value", "1m", "linear", 2);

        expect(aligned.size()).to.equal(8);
        expect(aligned.at(0).get()).to.equal(1.25);
        expect(aligned.at(1).get()).to.equal(1.8571428571428572);
        expect(aligned.at(2).get()).to.equal(1.2857142857142856);
        expect(aligned.at(3).get()).to.be.null;  // over limit fill with null
        expect(aligned.at(4).get()).to.be.null;  // over limit fill with null
        expect(aligned.at(5).get()).to.be.null;  // over limit fill with null
        expect(aligned.at(6).get()).to.equal(1.5);
        expect(aligned.at(7).get()).to.equal(2.5);

        done();
    });

    it("can do align with with invalid points", done => {
        const ts = new TimeSeries(SIMPLE_GAP_DATA_BAD);
        const aligned = ts.align("value", "1m", "linear", 2);

        expect(aligned.size()).to.equal(8);
        expect(aligned.at(0).get()).to.equal(1.25);
        expect(aligned.at(1).get()).to.equal(1.8571428571428572);
        expect(aligned.at(2).get()).to.equal(1.2857142857142856);
        //expect(aligned.at(3).get()).to.equal(1.0);
        //expect(aligned.at(4).get()).to.equal(1.0); // ???
        //expect(aligned.at(5).get()).to.equal(1.0);
        expect(aligned.at(6).get()).to.be.null;  // bad value
        expect(aligned.at(7).get()).to.be.null;  // bad value
        done();
    });

});


describe("Testing align() and rate() together", () => {

    it("can do rates", done => {
        const ts = new TimeSeries(RATE);
        const rate = ts.rate("in");

        // one less than source
        expect(rate.size()).to.equal(RATE["points"].length - 1);
        expect(rate.at(2).get("in_rate")).to.equal(1);
        expect(rate.at(3).get("in_rate")).to.equal(1);
        expect(rate.at(4).get("in_rate")).to.equal(2);
        expect(rate.at(8).get("in_rate")).to.equal(3);
        expect(rate.at(9).get("in_rate")).to.equal(4);

        done();
    });

    /*
     |           100 |              |              |              |   200       |   v
     |           |   |              |              |              |   |         |
     60          89  90            120            150            180 181       210  t ->
     |               |              |              |              |             |
     |<- ? --------->|<- 1.08/s --->|<- 1.08/s --->|<- 1.08/s --->|<- ? ------->|   result
     */
    
    it("can replicate basic esmond rates", done => {
        const RAW_RATES = {
            name: "traffic",
            columns: ["time", "value"],
            points: [
                [89000, 100],
                [181000, 200]
            ]
        };
        const ts = new TimeSeries(RAW_RATES);
        const rates = ts.align("value", "30s").rate();

        expect(rates.size()).to.equal(3);
        expect(rates.at(0).get("value_rate")).to.equal(1.0869565217391313);
        expect(rates.at(1).get("value_rate")).to.equal(1.0869565217391293);
        expect(rates.at(2).get("value_rate")).to.equal(1.0869565217391313);

        done();
    });

    it("can handle bad args");

    it("can output nulls for negative values", done => {

        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "value"],
            points: [
                [89000, 100],
                [181000, 50]
            ]
        });

        const rates1 = ts.align("value", "30s").rate();

        //lower counter will produce negative derivatives
        expect(rates1.size()).to.equal(3);
        expect(rates1.at(0).get("value_rate")).to.equal(-0.5434782608695656);
        expect(rates1.at(1).get("value_rate")).to.equal(-0.5434782608695646);
        expect(rates1.at(2).get("value_rate")).to.equal(-0.5434782608695653);

        const rates2 = ts.align("value", "30s").rate(null, false);

        expect(rates2.size()).to.equal(3)
        expect(rates2.at(0).get("value_rate")).to.be.null;
        expect(rates2.at(1).get("value_rate")).to.be.null;
        expect(rates2.at(2).get("value_rate")).to.be.null;
        
        done();
    });
});





