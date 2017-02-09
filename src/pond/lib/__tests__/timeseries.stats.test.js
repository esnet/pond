/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import TimeSeries from "../timeseries";

const TIMESERIES_DATA = {
    name: "traffic",
    columns: ["time", "value", "status"],
    points: [
        [1400425947000, 52, "ok"],
        [1400425948000, 18, "ok"],
        [1400425949000, 26, "fail"],
        [1400425950000, 93, "offline"]
    ]
};

const STATS_DATA = {
    name: "stats",
    columns: ["time", "value"],
    points: [
        [1400425941000, 13],
        [1400425942000, 18],
        [1400425943000, 13],
        [1400425944000, 14],
        [1400425945000, 13],
        [1400425946000, 16],
        [1400425947000, 14],
        [1400425948000, 21],
        [1400425948000, 13]
    ]
};

const STATS_DATA2 = {
    name: "stats",
    columns: ["time", "value"],
    points: [
        [1400425941000, 26],
        [1400425942000, 33],
        [1400425943000, 65],
        [1400425944000, 28],
        [1400425945000, 34],
        [1400425946000, 55],
        [1400425947000, 25],
        [1400425948000, 44],
        [1400425949000, 50],
        [1400425950000, 36],
        [1400425951000, 26],
        [1400425952000, 37],
        [1400425953000, 43],
        [1400425954000, 62],
        [1400425955000, 35],
        [1400425956000, 38],
        [1400425957000, 45],
        [1400425958000, 32],
        [1400425959000, 28],
        [1400425960000, 34]
    ]
};

const INTERFACE_DATA = {
    name: "star-cr5:to_anl_ip-a_v4",
    description: "star-cr5->anl(as683):100ge:site-ex:show:intercloud",
    device: "star-cr5",
    id: 169,
    interface: "to_anl_ip-a_v4",
    is_ipv6: false,
    is_oscars: false,
    oscars_id: null,
    resource_uri: "",
    site: "anl",
    site_device: "noni",
    site_interface: "et-1/0/0",
    stats_type: "Standard",
    title: null,
    columns: ["time", "in", "out"],
    points: [
        [1400425947000, 52, 34],
        [1400425948000, 18, 13],
        [1400425949000, 26, 67],
        [1400425950000, 93, 91]
    ]
};

const MISSING_DATA_TIMESERIES = new TimeSeries({
    name: "series",
    columns: ["time", "in", "out"],
    points: [
        [1400425951000, 100, null],
        [1400425952000, 300, undefined],
        [1400425953000, null, 500],
        [1400425954000, 200, 400]
    ]
});

const NULL_DATA_TIMESERIES = new TimeSeries({
    name: "series",
    columns: ["time", "in", "out"],
    points: [
        [1400425951000, null, null],
        [1400425952000, null, null],
        [1400425953000, null, null],
        [1400425954000, null, null]
    ]
});

const NO_DATA_TIMESERIES = new TimeSeries({
    name: "series",
    columns: ["time", "in", "out"],
    points: []
});

const availabilitySeries = {
    name: "availability",
    columns: ["index", "uptime", "notes", "outages"],
    points: [
        ["2014-07", 100, "", 2],
        ["2014-08", 88, "", 17],
        ["2014-09", 95, "", 6],
        ["2014-10", 99, "", 3],
        ["2014-11", 91, "", 14],
        ["2014-12", 99, "", 3],
        ["2015-01", 100, "", 0],
        ["2015-02", 92, "", 12],
        ["2015-03", 99, "Minor outage March 2", 4],
        ["2015-04", 87, "Planned downtime in April", 82],
        ["2015-05", 92, "Router failure June 12", 26],
        ["2015-06", 100, "", 0]
    ]
};

//
// Reducing functions
//
it("can sum the series", () => {
    const series = new TimeSeries(TIMESERIES_DATA);
    expect(series.sum("value")).toBe(189);
});

it("can sum a series with deep data", () => {
    const series = new TimeSeries({
        name: "Map Traffic",
        columns: ["time", "NASA_north", "NASA_south"],
        points: [
            [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
            [1400425952000, { in: 200, out: 400 }, { in: 146, out: 142 }],
            [1400425953000, { in: 300, out: 600 }, { in: 147, out: 158 }],
            [1400425954000, { in: 400, out: 800 }, { in: 155, out: 175 }]
        ]
    });
    expect(series.sum("NASA_north.in")).toBe(1000);
});

it("can sum a series with missing data", () => {
    const inSeries = MISSING_DATA_TIMESERIES.clean("in");
    const outSeries = MISSING_DATA_TIMESERIES.clean("out");
    expect(inSeries.sum("in")).toBe(600);
    expect(outSeries.sum("out")).toBe(900);
    expect(inSeries.sizeValid("in")).toBe(3);
    expect(outSeries.sizeValid("out")).toBe(2);
});

it("can sum the series with no column name specified", () => {
    const series = new TimeSeries(TIMESERIES_DATA);
    expect(series.sum()).toBe(189);
});

it("can find the max of the series", () => {
    const series = new TimeSeries(TIMESERIES_DATA);
    expect(series.max()).toBe(93);
});

it("can find the max of the series with missing data", () => {
    const series = new TimeSeries(MISSING_DATA_TIMESERIES);
    expect(series.max("in")).toBe(300);
    expect(series.max("out")).toBe(500);
});

it("can find the max of the series with no data", () => {
    const series = new TimeSeries(NO_DATA_TIMESERIES);
    expect(series.max()).toBeUndefined();
});

it("can find the max of the series with null data", () => {
    const series = new TimeSeries(NULL_DATA_TIMESERIES);
    expect(series.max()).toBeUndefined();
});

it("can find the max of a series with deep data", () => {
    const series = new TimeSeries({
        name: "Map Traffic",
        columns: ["time", "NASA_north", "NASA_south"],
        points: [
            [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
            [1400425952000, { in: 200, out: 400 }, { in: 146, out: 182 }],
            [1400425953000, { in: 300, out: 600 }, { in: 147, out: 158 }],
            [1400425954000, { in: 400, out: 800 }, { in: 155, out: 175 }]
        ]
    });
    expect(series.max("NASA_south.out")).toBe(182);
});

it("can find the min of the series", () => {
    const series = new TimeSeries(TIMESERIES_DATA);
    expect(series.min()).toBe(18);
});

it("can find the min of the series with missing data", () => {
    const series = new TimeSeries(MISSING_DATA_TIMESERIES);
    const inSeries = series.clean("in");
    const outSeries = series.clean("out");
    expect(inSeries.min("in")).toBe(100);
    expect(outSeries.min("out")).toBe(400);
});

it("can find the min of a series with deep data", () => {
    const series = new TimeSeries({
        name: "Map Traffic",
        columns: ["time", "NASA_north", "NASA_south"],
        points: [
            [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
            [1400425952000, { in: 200, out: 400 }, { in: 146, out: 182 }],
            [1400425953000, { in: 300, out: 600 }, { in: 147, out: 158 }],
            [1400425954000, { in: 400, out: 800 }, { in: 155, out: 175 }]
        ]
    });
    expect(series.min("NASA_south.out")).toBe(135);
});

//
// Getting statistics on a TimeSeries
//
it("can avg the series", () => {
    const series = new TimeSeries(STATS_DATA);
    expect(series.avg()).toBe(15);
});

it("can avg series with deep data", () => {
    const series = new TimeSeries({
        name: "Map Traffic",
        columns: ["time", "NASA_north", "NASA_south"],
        points: [
            [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
            [1400425952000, { in: 200, out: 400 }, { in: 146, out: 142 }],
            [1400425953000, { in: 300, out: 600 }, { in: 147, out: 158 }],
            [1400425954000, { in: 400, out: 800 }, { in: 155, out: 175 }]
        ]
    });
    expect(series.avg("NASA_north.in")).toBe(250);
});

it("can avg series with deep data", () => {
    const series = new TimeSeries(availabilitySeries);
    expect(series.avg("uptime")).toBe(95.16666666666667);
});

it("can find the max of the series with no data", () => {
    const series = new TimeSeries(NO_DATA_TIMESERIES);
    expect(series.avg()).toBeUndefined();
});

it("can mean of the series (the avg)", () => {
    const series = new TimeSeries(STATS_DATA);
    expect(series.mean()).toBe(15);
});

it("can find the median of the series", () => {
    const series = new TimeSeries(STATS_DATA);
    expect(series.median()).toBe(14);
});

it(
    "can find the median of a series with deep data and even number of events",
    () => {
        const series = new TimeSeries({
            name: "Map Traffic",
            columns: ["time", "NASA_north", "NASA_south"],
            points: [
                [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
                [1400425952000, { in: 200, out: 400 }, { in: 146, out: 142 }],
                [1400425953000, { in: 400, out: 600 }, { in: 147, out: 158 }],
                [1400425954000, { in: 800, out: 800 }, { in: 155, out: 175 }]
            ]
        });
        expect(series.median("NASA_north.in")).toBe(300);
    }
);

it(
    "can find the median of a series with deep data and odd number of events",
    () => {
        const series = new TimeSeries({
            name: "Map Traffic",
            columns: ["time", "NASA_north", "NASA_south"],
            points: [
                [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
                [1400425952000, { in: 200, out: 400 }, { in: 146, out: 142 }],
                [1400425953000, { in: 400, out: 600 }, { in: 147, out: 158 }]
            ]
        });
        expect(series.median("NASA_north.out")).toBe(400);
    }
);

it("can find the standard deviation of the series", () => {
    const series = new TimeSeries(STATS_DATA);
    expect(series.stdev()).toBe(2.6666666666666665);
});

it("can find the standard deviation and mean of another series", () => {
    const series = new TimeSeries(STATS_DATA2);
    expect(Math.round(series.mean() * 10) / 10).toBe(38.8);
    expect(Math.round(series.stdev() * 10) / 10).toBe(11.4);
});

it("can find the standard deviation of a series with deep data", () => {
    const series = new TimeSeries({
        name: "Map Traffic",
        columns: ["time", "NASA_north", "NASA_south"],
        points: [
            [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
            [1400425952000, { in: 200, out: 400 }, { in: 146, out: 142 }],
            [1400425953000, { in: 400, out: 600 }, { in: 147, out: 158 }],
            [1400425954000, { in: 800, out: 800 }, { in: 155, out: 175 }]
        ]
    });
    expect(series.stdev("NASA_south.out")).toBe(15.435349040433131);
});

it("can find the quantiles of a TimeSeries", () => {
    const series = new TimeSeries({
        name: "Sensor values",
        columns: ["time", "temperature"],
        points: [
            [1400425951000, 22.3],
            [1400425952000, 32.4],
            [1400425953000, 12.1],
            [1400425955000, 76.8],
            [1400425956000, 87.3],
            [1400425957000, 54.6],
            [1400425958000, 45.5],
            [1400425959000, 87.9]
        ]
    });

    expect(series.quantile(4, "temperature")).toEqual([29.875, 50.05, 79.425]);
    expect(series.quantile(4, "temperature", "linear")).toEqual([
        29.875,
        50.05,
        79.425
    ]);
    expect(series.quantile(4, "temperature", "lower")).toEqual([
        22.3,
        45.5,
        76.8
    ]);
    expect(series.quantile(4, "temperature", "higher")).toEqual([
        32.4,
        54.6,
        87.3
    ]);
    expect(series.quantile(4, "temperature", "nearest")).toEqual([
        32.4,
        54.6,
        76.8
    ]);
    expect(series.quantile(4, "temperature", "midpoint")).toEqual([
        27.35,
        50.05,
        82.05
    ]);
    expect(series.quantile(1, "temperature", "linear")).toEqual([]);
});

it("can find the percentiles of a TimeSeries", () => {
    const series = new TimeSeries({
        name: "Sensor values",
        columns: ["time", "temperature"],
        points: [
            [1400425951000, 22.3],
            [1400425952000, 32.4],
            [1400425953000, 12.1],
            [1400425955000, 76.8],
            [1400425956000, 87.3],
            [1400425957000, 54.6],
            [1400425958000, 45.5],
            [1400425959000, 87.9]
        ]
    });

    expect(series.percentile(50, "temperature")).toBe(50.05);
    expect(series.percentile(95, "temperature")).toBeCloseTo(87.690, 3);
    expect(series.percentile(99, "temperature")).toBeCloseTo(87.858, 3);

    expect(series.percentile(99, "temperature", "lower")).toBe(87.3);
    expect(series.percentile(99, "temperature", "higher")).toBe(87.9);
    expect(series.percentile(99, "temperature", "nearest")).toBe(87.9);
    expect(series.percentile(99, "temperature", "midpoint")).toBe(87.6);

    expect(series.percentile(0, "temperature")).toBe(12.1);
    expect(series.percentile(100, "temperature")).toBe(87.9);
});

it("can find the percentiles of an empty TimeSeries", () => {
    const series = new TimeSeries({
        name: "Sensor values",
        columns: ["time", "temperature"],
        points: []
    });

    expect(series.percentile(0, "temperature")).toBeUndefined();
    expect(series.percentile(100, "temperature")).toBeUndefined();
});

it("can find the percentiles of a TimeSeries with one point", () => {
    const series = new TimeSeries({
        name: "Sensor values",
        columns: ["time", "temperature"],
        points: [[1400425951000, 22.3]]
    });

    expect(series.percentile(0, "temperature")).toBe(22.3);
    expect(series.percentile(50, "temperature")).toBe(22.3);
    expect(series.percentile(100, "temperature")).toBe(22.3);
});

it("can find the percentiles of a TimeSeries with two points", () => {
    const series = new TimeSeries({
        name: "Sensor values",
        columns: ["time", "temperature"],
        points: [[1400425951000, 4], [1400425952000, 5]]
    });

    expect(series.percentile(0, "temperature")).toBe(4);
    expect(series.percentile(50, "temperature")).toBe(4.5);
    expect(series.percentile(100, "temperature")).toBe(5);
});
