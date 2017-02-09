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

import TimeSeries from "../timeseries";

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
        [300000, 510]
    ]
};

it("can calculate the rate using TimeSeries.rate()", () => {
    const ts = new TimeSeries(RATE);
    const rate = ts.rate({ fieldSpec: "in" });

    // one less than source
    expect(rate.size()).toEqual(RATE["points"].length - 1);
    expect(rate.at(2).get("in_rate")).toEqual(1);
    expect(rate.at(3).get("in_rate")).toEqual(1);
    expect(rate.at(4).get("in_rate")).toEqual(2);
    expect(rate.at(8).get("in_rate")).toEqual(3);
    expect(rate.at(9).get("in_rate")).toEqual(4);
});

/*
 |           100 |              |              |              |   200       |   v
 |           |   |              |              |              |   |         |
 60          89  90            120            150            180 181       210  t ->
 |               |              |              |              |             |
 |<- ? --------->|<- 1.08/s --->|<- 1.08/s --->|<- 1.08/s --->|<- ? ------->|   result
 */
it("can replicate basic esmond alignment and rate", done => {
    const RAW_RATES = {
        name: "traffic",
        columns: ["time", "value"],
        points: [[89000, 100], [181000, 200]]
    };
    const ts = new TimeSeries(RAW_RATES);
    const rates = ts.align({ fieldSpec: "value", period: "30s" }).rate();

    expect(rates.size()).toEqual(3);
    expect(rates.at(0).get("value_rate")).toEqual(1.0869565217391313);
    expect(rates.at(1).get("value_rate")).toEqual(1.0869565217391293);
    expect(rates.at(2).get("value_rate")).toEqual(1.0869565217391313);

    done();
});

it("can output nulls for negative values", done => {
    const ts = new TimeSeries({
        name: "traffic",
        columns: ["time", "value"],
        points: [[89000, 100], [181000, 50]]
    });

    const rates1 = ts.align({ fieldSpec: "value", period: "30s" }).rate();

    //lower counter will produce negative derivatives
    expect(rates1.size()).toEqual(3);
    expect(rates1.at(0).get("value_rate")).toEqual(-0.5434782608695656);
    expect(rates1.at(1).get("value_rate")).toEqual(-0.5434782608695646);
    expect(rates1.at(2).get("value_rate")).toEqual(-0.5434782608695653);

    const rates2 = ts
        .align({ fieldSpec: "value", period: "30s" })
        .rate({ allowNegative: false });

    expect(rates2.size()).toEqual(3);
    expect(rates2.at(0).get("value_rate")).toBeNull();
    expect(rates2.at(1).get("value_rate")).toBeNull();
    expect(rates2.at(2).get("value_rate")).toBeNull();

    done();
});
