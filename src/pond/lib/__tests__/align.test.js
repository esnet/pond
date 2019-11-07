/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import { Pipeline } from "../pipeline";
import TimeSeries from "../timeseries";

const SIMPLE_GAP_DATA = {
    name: "traffic",
    columns: ["time", "value"],
    points: [
        [1471824030000, 0.75],
        // Mon, 22 Aug 2016 00:00:30 GMT
        [1471824105000, 2],
        // Mon, 22 Aug 2016 00:01:45 GMT
        [1471824210000, 1],
        // Mon, 22 Aug 2016 00:03:30 GMT
        [1471824390000, 1],
        // Mon, 22 Aug 2016 00:06:30 GMT
        [1471824510000, 3],
        // Mon, 22 Aug 2016 00:08:30 GMT
        //final point in same window, does nothing, for coverage
        // Mon, 22 Aug 2016 00:08:45 GMT
        [1471824525000, 5]
    ]
};

const SIMPLE_GAP_DATA_BAD = {
    name: "traffic",
    columns: ["time", "value"],
    points: [
        [1471824030000, 0.75],
        // Mon, 22 Aug 2016 00:00:30 GMT
        [1471824105000, 2],
        // Mon, 22 Aug 2016 00:01:45 GMT
        [1471824210000, 1],
        // Mon, 22 Aug 2016 00:03:30 GMT
        [1471824390000, 1],
        // Mon, 22 Aug 2016 00:06:30 GMT
        [1471824510000, "bob!"],
        // Mon, 22 Aug 2016 00:08:30 GMT
        // Mon, 22 Aug 2016 00:08:45 GMT
        [1471824525000, 5]
    ]
};

it("can do basic alignment using TimeSeries.align()", done => {
    const ts = new TimeSeries(SIMPLE_GAP_DATA);
    const aligned = ts.align({ fieldSpec: "value", period: "1m" });

    expect(aligned.size()).toBe(8);
    expect(aligned.at(0).get()).toBe(1.25);
    expect(aligned.at(1).get()).toBe(1.8571428571428572);
    expect(aligned.at(2).get()).toBe(1.2857142857142856);
    expect(aligned.at(3).get()).toBe(1.0);
    expect(aligned.at(4).get()).toBe(1.0);
    expect(aligned.at(5).get()).toBe(1.0);
    expect(aligned.at(6).get()).toBe(1.5);
    expect(aligned.at(7).get()).toBe(2.5);

    done();
});

it("can do basic hold alignment with TimeSeries.align() and method hold", done => {
    const ts = new TimeSeries(SIMPLE_GAP_DATA);
    const aligned = ts.align({
        fieldSpec: "value",
        period: "1m",
        method: "hold"
    });

    expect(aligned.size()).toBe(8);
    expect(aligned.at(0).get()).toBe(0.75);
    expect(aligned.at(1).get()).toBe(2);
    expect(aligned.at(2).get()).toBe(2);
    expect(aligned.at(3).get()).toBe(1);
    expect(aligned.at(4).get()).toBe(1);
    expect(aligned.at(5).get()).toBe(1);
    expect(aligned.at(6).get()).toBe(1);
    expect(aligned.at(7).get()).toBe(1);

    done();
});

it("can do alignment with TimeSeries.align() with a limit and hold interpolation", done => {
    const ts = new TimeSeries(SIMPLE_GAP_DATA);
    const aligned = ts.align({
        fieldSpec: "value",
        period: "1m",
        method: "hold",
        limit: 2
    });

    expect(aligned.size()).toBe(8);
    expect(aligned.at(0).get()).toBe(0.75);
    expect(aligned.at(1).get()).toBe(2);
    expect(aligned.at(2).get()).toBe(2);
    expect(aligned.at(3).get()).toBeNull();
    // over limit fill with null
    expect(aligned.at(4).get()).toBeNull();
    // over limit fill with null
    expect(aligned.at(5).get()).toBeNull();
    // over limit fill with null
    expect(aligned.at(6).get()).toBe(1);
    expect(aligned.at(7).get()).toBe(1);

    done();
});

it("can do align with a limit and linear interpolation", done => {
    const ts = new TimeSeries(SIMPLE_GAP_DATA);
    const aligned = ts.align({
        fieldSpec: "value",
        period: "1m",
        method: "linear",
        limit: 2
    });

    expect(aligned.size()).toBe(8);
    expect(aligned.at(0).get()).toBe(1.25);
    expect(aligned.at(1).get()).toBe(1.8571428571428572);
    expect(aligned.at(2).get()).toBe(1.2857142857142856);
    expect(aligned.at(3).get()).toBeNull();
    // over limit fill with null
    expect(aligned.at(4).get()).toBeNull();
    // over limit fill with null
    expect(aligned.at(5).get()).toBeNull();
    // over limit fill with null
    expect(aligned.at(6).get()).toBe(1.5);
    expect(aligned.at(7).get()).toBe(2.5);

    done();
});

it("can do alignment with TimeSeries.align() on a TimeSeries with invalid points", done => {
    const ts = new TimeSeries(SIMPLE_GAP_DATA_BAD);

    // console.warn = jest.genMockFn();

    const aligned = ts.align({
        fieldSpec: "value",
        period: "1m",
        method: "linear"
    });

    // expect(console.warn.mock.calls.length).toBe(2);

    expect(aligned.size()).toBe(8);
    expect(aligned.at(0).get()).toBe(1.25);
    expect(aligned.at(1).get()).toBe(1.8571428571428572);
    expect(aligned.at(2).get()).toBe(1.2857142857142856);
    expect(aligned.at(3).get()).toBe(1.0);
    expect(aligned.at(4).get()).toBe(1.0);
    expect(aligned.at(5).get()).toBe(1.0);
    expect(aligned.at(6).get()).toBeNull();
    // bad value
    expect(aligned.at(7).get()).toBeNull();
    // bad value
    done();
});

it("can do alignment on an already aligned timeseries", () => {
    const ts = new TimeSeries({
        name: "traffic",
        columns: ["time", "value"],
        points: [[1473490770000, 10], [1473490800000, 20], [1473490830000, 30], [1473490860000, 40]]
    });

    const result = Pipeline()
        .from(ts)
        .align("value", "30s", "linear", 10)
        .toKeyedCollections();

    const timeseries = result["all"];

    expect(
        timeseries
            .at(0)
            .timestamp()
            .getTime()
    ).toEqual(1473490770000);
    expect(timeseries.at(0).value()).toEqual(10);

    expect(
        timeseries
            .at(1)
            .timestamp()
            .getTime()
    ).toEqual(1473490800000);
    expect(timeseries.at(1).value()).toEqual(20);

    expect(
        timeseries
            .at(2)
            .timestamp()
            .getTime()
    ).toEqual(1473490830000);
    expect(timeseries.at(2).value()).toEqual(30);

    expect(
        timeseries
            .at(3)
            .timestamp()
            .getTime()
    ).toEqual(1473490860000);
    expect(timeseries.at(3).value()).toEqual(40);
});
