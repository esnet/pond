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

import * as Immutable from "immutable";

import { event, Event } from "../src/event";
import { stream } from "../src/stream";
import { time } from "../src/time";
import { timeSeries } from "../src/timeseries";

import { FillMethod } from "../src/types";

it("can use the TimeSeries.fill() to fill missing values with zero", () => {
    const ts = timeSeries({
        name: "traffic",
        columns: ["time", "direction"],
        points: [
            [1400425947000, { in: 1, out: null }],
            [1400425948000, { in: null, out: 4 }],
            [1400425949000, { in: 5, out: null }],
            [1400425950000, { in: null, out: 8 }],
            [1400425960000, { in: 9, out: null }],
            [1400425970000, { in: null, out: 12 }]
        ]
    });

    //
    // fill all columns, limit to 3
    //
    const newTS = ts.fill({
        fieldSpec: ["direction.in", "direction.out"],
        method: FillMethod.Zero,
        limit: 3
    });

    expect(newTS.size()).toBe(6);
    expect(newTS.at(0).get("direction.out")).toBe(0);
    expect(newTS.at(2).get("direction.out")).toBe(0);
    expect(newTS.at(1).get("direction.in")).toBe(0);

    //
    // fill one column, limit to 4 in result set
    //
    const newTS2 = ts.fill({
        fieldSpec: "direction.in",
        method: FillMethod.Zero,
        limit: 4
    });

    expect(newTS2.at(1).get("direction.in")).toBe(0);
    expect(newTS2.at(3).get("direction.in")).toBe(0);
    expect(newTS2.at(0).get("direction.out")).toBeNull();
    expect(newTS2.at(2).get("direction.out")).toBeNull();
});

it("can use TimeSeries.fill() on a more complex example with nested paths", () => {
    const ts = timeSeries({
        name: "traffic",
        columns: ["time", "direction"],
        points: [
            [1400425947000, { in: { tcp: 1, udp: 3 }, out: { tcp: 2, udp: 3 } }],
            [1400425948000, { in: { tcp: 3, udp: null }, out: { tcp: 4, udp: 3 } }],
            [1400425949000, { in: { tcp: 5, udp: null }, out: { tcp: null, udp: 3 } }],
            [1400425950000, { in: { tcp: 7, udp: null }, out: { tcp: null, udp: 3 } }],
            [1400425960000, { in: { tcp: 9, udp: 4 }, out: { tcp: 6, udp: 3 } }],
            [1400425970000, { in: { tcp: 11, udp: 5 }, out: { tcp: 8, udp: 3 } }]
        ]
    });

    const newTS = ts.fill({
        method: FillMethod.Zero,
        fieldSpec: ["direction.out.tcp", "direction.in.udp"]
    });

    expect(newTS.at(0).get("direction.in.udp")).toBe(3);

    expect(newTS.at(1).get("direction.in.udp")).toBe(0); // fill
    expect(newTS.at(2).get("direction.in.udp")).toBe(0); // fill
    expect(newTS.at(3).get("direction.in.udp")).toBe(0); // fill
    expect(newTS.at(4).get("direction.in.udp")).toBe(4);
    expect(newTS.at(5).get("direction.in.udp")).toBe(5);

    expect(newTS.at(0).get("direction.out.tcp")).toBe(2);
    expect(newTS.at(1).get("direction.out.tcp")).toBe(4);
    expect(newTS.at(2).get("direction.out.tcp")).toBe(0); // fill
    expect(newTS.at(3).get("direction.out.tcp")).toBe(0); // fill
    expect(newTS.at(4).get("direction.out.tcp")).toBe(6);
    expect(newTS.at(5).get("direction.out.tcp")).toBe(8);

    //
    // Do it again, but only fill the out.tcp
    //

    const newTS2 = ts.fill({
        method: FillMethod.Zero,
        fieldSpec: ["direction.out.tcp"]
    });

    expect(newTS2.at(0).get("direction.out.tcp")).toBe(2);
    expect(newTS2.at(1).get("direction.out.tcp")).toBe(4);
    expect(newTS2.at(2).get("direction.out.tcp")).toBe(0); // fill
    expect(newTS2.at(3).get("direction.out.tcp")).toBe(0); // fill
    expect(newTS2.at(4).get("direction.out.tcp")).toBe(6);
    expect(newTS2.at(5).get("direction.out.tcp")).toBe(8);

    expect(newTS2.at(0).get("direction.in.udp")).toBe(3);
    expect(newTS2.at(1).get("direction.in.udp")).toBeNull(); // no fill
    expect(newTS2.at(2).get("direction.in.udp")).toBeNull(); // no fill
    expect(newTS2.at(3).get("direction.in.udp")).toBeNull(); // no fill
    expect(newTS2.at(4).get("direction.in.udp")).toBe(4);
    expect(newTS2.at(5).get("direction.in.udp")).toBe(5);
});

it("can use TimeSeries.fill() with limit pad and zero filling", () => {
    const ts = timeSeries({
        name: "traffic",
        columns: ["time", "direction"],
        points: [
            [1400425947000, { in: 1, out: null }],
            [1400425948000, { in: null, out: null }],
            [1400425949000, { in: null, out: null }],
            [1400425950000, { in: 3, out: 8 }],
            [1400425960000, { in: null, out: null }],
            [1400425970000, { in: null, out: 12 }],
            [1400425980000, { in: null, out: 13 }],
            [1400425990000, { in: 7, out: null }],
            [1400426000000, { in: 8, out: null }],
            [1400426010000, { in: 9, out: null }],
            [1400426020000, { in: 10, out: null }]
        ]
    });

    // verify fill limit for zero fill
    const zeroTS = ts.fill({
        fieldSpec: ["direction.in", "direction.out"],
        method: FillMethod.Zero,
        limit: 2
    });

    expect(zeroTS.at(0).get("direction.in")).toBe(1);
    expect(zeroTS.at(1).get("direction.in")).toBe(0); // fill
    expect(zeroTS.at(2).get("direction.in")).toBe(0); // fill
    expect(zeroTS.at(3).get("direction.in")).toBe(3);
    expect(zeroTS.at(4).get("direction.in")).toBe(0); // fill
    expect(zeroTS.at(5).get("direction.in")).toBe(0); // fill
    expect(zeroTS.at(6).get("direction.in")).toBeNull(); // over limit skip
    expect(zeroTS.at(7).get("direction.in")).toBe(7);
    expect(zeroTS.at(8).get("direction.in")).toBe(8);
    expect(zeroTS.at(9).get("direction.in")).toBe(9);
    expect(zeroTS.at(10).get("direction.in")).toBe(10);

    expect(zeroTS.at(0).get("direction.out")).toBe(0); // fill
    expect(zeroTS.at(1).get("direction.out")).toBe(0); // fill
    expect(zeroTS.at(2).get("direction.out")).toBeNull(); // over limit skip
    expect(zeroTS.at(3).get("direction.out")).toBe(8);
    expect(zeroTS.at(4).get("direction.out")).toBe(0); // fill
    expect(zeroTS.at(5).get("direction.out")).toBe(12);
    expect(zeroTS.at(6).get("direction.out")).toBe(13);
    expect(zeroTS.at(7).get("direction.out")).toBe(0); // fill
    expect(zeroTS.at(8).get("direction.out")).toBe(0); // fill
    expect(zeroTS.at(9).get("direction.out")).toBeNull(); // over limit skip
    expect(zeroTS.at(10).get("direction.out")).toBeNull();

    // over limit skip
    // verify fill limit for pad fill
    const padTS = ts.fill({
        fieldSpec: ["direction.in", "direction.out"],
        method: FillMethod.Pad,
        limit: 2
    });

    expect(padTS.at(0).get("direction.in")).toBe(1);
    expect(padTS.at(1).get("direction.in")).toBe(1); // fill
    expect(padTS.at(2).get("direction.in")).toBe(1); // fill
    expect(padTS.at(3).get("direction.in")).toBe(3);
    expect(padTS.at(4).get("direction.in")).toBe(3); // fill
    expect(padTS.at(5).get("direction.in")).toBe(3); // fill
    expect(padTS.at(6).get("direction.in")).toBeNull(); // over limit skip
    expect(padTS.at(7).get("direction.in")).toBe(7);
    expect(padTS.at(8).get("direction.in")).toBe(8);
    expect(padTS.at(9).get("direction.in")).toBe(9);
    expect(padTS.at(10).get("direction.in")).toBe(10);

    expect(padTS.at(0).get("direction.out")).toBeNull(); // no fill start
    expect(padTS.at(1).get("direction.out")).toBeNull(); // no fill start
    expect(padTS.at(2).get("direction.out")).toBeNull(); // no fill start
    expect(padTS.at(3).get("direction.out")).toBe(8);
    expect(padTS.at(4).get("direction.out")).toBe(8); // fill
    expect(padTS.at(5).get("direction.out")).toBe(12);
    expect(padTS.at(6).get("direction.out")).toBe(13);
    expect(padTS.at(7).get("direction.out")).toBe(13); // fill
    expect(padTS.at(8).get("direction.out")).toBe(13); // fill
    expect(padTS.at(9).get("direction.out")).toBeNull(); // over limit skip
    expect(padTS.at(10).get("direction.out")).toBeNull(); // over limit skip
});

it("can do linear interpolation fill (test_linear)", () => {
    const ts = timeSeries({
        name: "traffic",
        columns: ["time", "direction"],
        points: [
            [1400425947000, { in: 1, out: 2 }],
            [1400425948000, { in: null, out: null }],
            [1400425949000, { in: null, out: null }],
            [1400425950000, { in: 3, out: null }],
            [1400425960000, { in: null, out: null }],
            [1400425970000, { in: 5, out: 12 }],
            [1400425980000, { in: 6, out: 13 }]
        ]
    });

    const result = ts.fill({
        fieldSpec: ["direction.in", "direction.out"],
        method: FillMethod.Linear
    });

    expect(result.size()).toBe(7);

    expect(result.at(0).get("direction.in")).toBe(1);
    expect(result.at(1).get("direction.in")).toBe(1.6666666666666665); // filled
    expect(result.at(2).get("direction.in")).toBe(2.333333333333333); // filled
    expect(result.at(3).get("direction.in")).toBe(3);
    expect(result.at(4).get("direction.in")).toBe(4.0); // filled
    expect(result.at(5).get("direction.in")).toBe(5);

    expect(result.at(0).get("direction.out")).toBe(2);
    expect(result.at(1).get("direction.out")).toBe(2.4347826086956523); // filled
    expect(result.at(2).get("direction.out")).toBe(2.869565217391304); // filled
    expect(result.at(3).get("direction.out")).toBe(3.3043478260869565); // filled
    expect(result.at(4).get("direction.out")).toBe(7.652173913043478); // filled
    expect(result.at(5).get("direction.out")).toBe(12);
});

it("can do linear interpolation fill with a pipeline (test_linear_list)", () => {
    const ts = timeSeries({
        name: "traffic",
        columns: ["time", "direction"],
        points: [
            [1400425947000, { in: 1, out: 2 }],
            [1400425948000, { in: null, out: null }],
            [1400425949000, { in: null, out: null }],
            [1400425950000, { in: 3, out: null }],
            [1400425960000, { in: null, out: null }],
            [1400425970000, { in: 5, out: 12 }],
            [1400425980000, { in: 6, out: 13 }]
        ]
    });

    const result = ts
        .fill({ fieldSpec: "direction.in", method: FillMethod.Linear })
        .fill({ fieldSpec: "direction.out", method: FillMethod.Linear });

    expect(result.size()).toBe(7);

    expect(result.at(0).get("direction.in")).toBe(1);
    expect(result.at(1).get("direction.in")).toBe(1.6666666666666665); // filled
    expect(result.at(2).get("direction.in")).toBe(2.333333333333333); // filled
    expect(result.at(3).get("direction.in")).toBe(3);
    expect(result.at(4).get("direction.in")).toBe(4.0); // filled
    expect(result.at(5).get("direction.in")).toBe(5);

    expect(result.at(0).get("direction.out")).toBe(2);
    expect(result.at(1).get("direction.out")).toBe(2.4347826086956523); // filled
    expect(result.at(2).get("direction.out")).toBe(2.869565217391304); // filled
    expect(result.at(3).get("direction.out")).toBe(3.3043478260869565); // filled
    expect(result.at(4).get("direction.out")).toBe(7.652173913043478); // filled
    expect(result.at(5).get("direction.out")).toBe(12);
});

it("can do assymetric linear interpolation (test_assymetric_linear_fill)", () => {
    const ts = timeSeries({
        name: "traffic",
        columns: ["time", "direction"],
        points: [
            [1400425947000, { in: 1, out: null }],
            [1400425948000, { in: null, out: null }],
            [1400425949000, { in: null, out: null }],
            [1400425950000, { in: 3, out: 8 }],
            [1400425960000, { in: null, out: null }],
            [1400425970000, { in: 5, out: 12 }],
            [1400425980000, { in: 6, out: 13 }]
        ]
    });

    const result = ts.fill({
        fieldSpec: ["direction.in", "direction.out"],
        method: FillMethod.Linear
    });

    expect(result.at(0).get("direction.in")).toBe(1);
    expect(result.at(1).get("direction.in")).toBe(1.6666666666666665); // filled
    expect(result.at(2).get("direction.in")).toBe(2.333333333333333); // filled
    expect(result.at(3).get("direction.in")).toBe(3);
    expect(result.at(4).get("direction.in")).toBe(4.0); // filled
    expect(result.at(5).get("direction.in")).toBe(5);

    expect(result.at(0).get("direction.out")).toBeNull();
    expect(result.at(1).get("direction.out")).toBeNull();
    expect(result.at(2).get("direction.out")).toBeNull();
    expect(result.at(3).get("direction.out")).toBe(8);
    expect(result.at(4).get("direction.out")).toBe(10); // filled
    expect(result.at(5).get("direction.out")).toBe(12);
});

const STREAM_EVENTS = [
    event(time(1400425947000), Immutable.Map({ value: 1 })),
    event(time(1400425948000), Immutable.Map({ value: 2 })),
    event(time(1400425949000), Immutable.Map({ value: null })),
    event(time(1400425950000), Immutable.Map({ value: 3 })),
    event(time(1400425951000), Immutable.Map({ value: null })),
    event(time(1400425952000), Immutable.Map({ value: null })),
    event(time(1400425953000), Immutable.Map({ value: null })),
    event(time(1400425954000), Immutable.Map({ value: null }))
];

it("can do streaming fill with limit (linear fill)", () => {
    const results: Event[] = [];

    const source = stream()
        .fill({ method: FillMethod.Linear, fieldSpec: "value", limit: 3 })
        .output(evt => {
            const e = evt as Event;
            results.push(e);
        });
    STREAM_EVENTS.forEach(e => source.addEvent(e));

    expect(results.length).toBe(8);
    expect(results[0].get("value")).toBe(1);
    expect(results[1].get("value")).toBe(2);
    expect(results[2].get("value")).toBe(2.5);
    expect(results[3].get("value")).toBe(3);
    expect(results[4].get("value")).toBeNull();
    expect(results[5].get("value")).toBeNull();
    expect(results[6].get("value")).toBeNull();
    expect(results[7].get("value")).toBeNull();
});

it("can do streaming fill with limit (pad fill)", () => {
    const results: Event[] = [];

    const source = stream()
        .fill({ method: FillMethod.Pad, fieldSpec: "value", limit: 3 })
        .output(evt => {
            const e = evt as Event;
            results.push(e);
        });
    STREAM_EVENTS.forEach(e => source.addEvent(e));

    expect(results.length).toBe(8);
    expect(results[0].get("value")).toBe(1);
    expect(results[1].get("value")).toBe(2);
    expect(results[2].get("value")).toBe(2); // filled
    expect(results[3].get("value")).toBe(3);
    expect(results[4].get("value")).toBe(3); // filled
    expect(results[5].get("value")).toBe(3); // filled
    expect(results[6].get("value")).toBe(3); // filled
    expect(results[7].get("value")).toBeNull(); // because of limit
});

it("can do streaming fill with limit (zero fill)", () => {
    const results: Event[] = [];

    const source = stream()
        .fill({ method: FillMethod.Zero, fieldSpec: "value", limit: 2 })
        .output(evt => {
            const e = evt as Event;
            results.push(e);
        });
    STREAM_EVENTS.forEach(e => source.addEvent(e));

    expect(results.length).toBe(8);
    expect(results[0].get("value")).toBe(1);
    expect(results[1].get("value")).toBe(2);
    expect(results[2].get("value")).toBe(0);
    expect(results[3].get("value")).toBe(3);
    expect(results[4].get("value")).toBe(0);
    expect(results[5].get("value")).toBe(0);
    expect(results[6].get("value")).toBeNull();
    expect(results[7].get("value")).toBeNull();
});
