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

import Collection from "../../src/collection";
import Event from "../../src/event";
import TimeSeries from "../../src/series.js";
import TimeRange from "../../src/range.js";

//
// Load AAPL stock data and make a timeseries out of it
//

const data = require("./aapl_historical.csv");

const name = "AAPL";
const rawCollection = new Collection(data.map(item => {
    const timestamp = new moment(new Date(item.date));
    const { open, close, low, high, volume } = item;
    return new Event(timestamp.toDate(), {
        open: +open,
        close: +close,
        low: +low,
        height: +high,
        volume: +volume
    });
}));
const collection = rawCollection.sortByTime();

describe("AAPL Stock tests", () => {

    describe("Statistics functions", () => {
        
        const series = new TimeSeries({name, collection});

        it("can find the average", (done) => {
            expect(series.avg("close")).be.closeTo(65.7267, 0.001);
            done();
        });

        it("can find the min", (done) => {
            expect(series.min("close")).to.equal(11.1714);
            done();
        });

        it("can find the max", (done) => {
            expect(series.max("close")).to.equal(133);
            done();
        });
    });

    // "2014/03/26","77.1114","74394902.0000","78.0743","78.4285","76.9800"

    describe("Functions for subsets of timeseries", () => {

        const series = new TimeSeries({name, collection});

        it("can find the bisect", (done) => {
            const pos = series.bisect(new Date("2014/03/26"));
            const event = series.at(pos);

            expect(event.get("close")).to.equal(77.1114);
            done();
        });

        it("can find the event at a time", (done) => {
            const event = series.atTime(new Date("2014/03/26"));

            expect(event.get("close")).to.equal(77.1114);
            done();
        });

        it("can find the event at a time", (done) => {
            const event = series.atTime(new Date("2014/03/26"));

            expect(event.get("close")).to.equal(77.1114);
            done();
        });

        it("can crop the series", (done) => {
            const b = new Date("2014/03/26");
            const e = new Date("2016/03/26");
            const timerange = new TimeRange(b, e);
            const croppedSeries = series.crop(timerange);

            expect(croppedSeries.size()).to.equal(503);
            expect(croppedSeries.atFirst().get("close")).to.equal(77.1114);
            expect(croppedSeries.atLast().get("close")).to.equal(106.13);
            done();
        });
    });
});
