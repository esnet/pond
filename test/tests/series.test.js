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
import TimeRangeEvent from "../../src/timerangeevent";
import TimeSeries from "../../src/series.js";
import TimeRange from "../../src/range.js";
import { sum, max } from "../../src/functions";

const data = {
    name: "traffic",
    columns: ["time", "value", "status"],
    points: [
        [1400425947000, 52, "ok"],
        [1400425948000, 18, "ok"],
        [1400425949000, 26, "fail"],
        [1400425950000, 93, "offline"]
    ]
};

const indexedData = {
    index: "1d-625",
    name: "traffic",
    columns: ["time", "value", "status"],
    points: [
        [1400425947000, 52, "ok"],
        [1400425948000, 18, "ok"],
        [1400425949000, 26, "fail"],
        [1400425950000, 93, "offline"]
    ]
};

const statsData = {
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

const statsData2 = {
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

const availabilityData = {
    name: "availability",
    columns: ["index", "uptime"],
    points: [
        ["2015-06", "100%"],
        ["2015-05", "92%"],
        ["2015-04", "87%"],
        ["2015-03", "99%"],
        ["2015-02", "92%"],
        ["2015-01", "100%"],
        ["2014-12", "99%"],
        ["2014-11", "91%"],
        ["2014-10", "99%"],
        ["2014-09", "95%"],
        ["2014-08", "88%"],
        ["2014-07", "100%"]
    ]
};

const availabilitySeries = {
    name: "availability",
    columns: ["index", "uptime", "notes", "outages"],
    points: [
        ["2015-06", 100, "", 0],
        ["2015-05", 92, "Router failure June 12", 26],
        ["2015-04", 87, "Planned downtime in April", 82],
        ["2015-03", 99, "Minor outage March 2", 4],
        ["2015-02", 92, "",12],
        ["2015-01", 100, "", 0],
        ["2014-12", 99, "", 3],
        ["2014-11", 91, "", 14],
        ["2014-10", 99, "", 3],
        ["2014-09", 95, "", 6],
        ["2014-08", 88, "", 17],
        ["2014-09", 100, "", 2]
    ]
};

const interfaceData = {
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

const trafficBNLtoNEWY = {
    name: "BNL to NEWY",
    columns: ["time", "in"],
    points: [
        [1441051950000, 2998846524.2666664],
        [1441051980000, 2682032885.3333335],
        [1441052010000, 2753537586.9333334]
    ]
};

const trafficNEWYtoBNL = {
    name: "NEWY to BNL",
    columns: ["time","out"],
    points: [
        [1441051950000, 22034579982.4],
        [1441051980000, 24783871443.2],
        [1441052010000, 26907368572.800003]
    ]
};

const fmt = "YYYY-MM-DD HH:mm";
const bisectTestData = {
    name: "test",
    columns: ["time", "value"],
    points: [
        [moment("2012-01-11 01:00", fmt).valueOf(), 22],
        [moment("2012-01-11 02:00", fmt).valueOf(), 33],
        [moment("2012-01-11 03:00", fmt).valueOf(), 44],
        [moment("2012-01-11 04:00", fmt).valueOf(), 55],
        [moment("2012-01-11 05:00", fmt).valueOf(), 66],
        [moment("2012-01-11 06:00", fmt).valueOf(), 77],
        [moment("2012-01-11 07:00", fmt).valueOf(), 88]
    ]
};

const trafficDataIn = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "in"],
    points: [
        [1400425947000, 52],
        [1400425948000, 18],
        [1400425949000, 26],
        [1400425950000, 93]
    ]
};

const trafficDataOut = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "out"],
    points: [
        [1400425947000, 34],
        [1400425948000, 13],
        [1400425949000, 67],
        [1400425950000, 91]
    ]
};

const partialTraffic1 = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "value"],
    points: [
        [1400425947000, 34],
        [1400425948000, 13],
        [1400425949000, 67],
        [1400425950000, 91]
    ]
};

const partialTraffic2 = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "value"],
    points: [
        [1400425951000, 65],
        [1400425952000, 86],
        [1400425953000, 27],
        [1400425954000, 72]
    ]
};

const missingDataSeries = new TimeSeries({
    name: "series",
    columns: ["time", "in", "out"],
    points: [
        [1400425951000, 100, null],
        [1400425952000, 300, undefined],
        [1400425953000, null, 500],
        [1400425954000, 200, 400]
    ]
});

const nullDataSeries = new TimeSeries({
    name: "series",
    columns: ["time", "in", "out"],
    points: [
        [1400425951000, null, null],
        [1400425952000, null, null],
        [1400425953000, null, null],
        [1400425954000, null, null]
    ]
});

const noDataSeries = new TimeSeries({
    name: "series",
    columns: ["time", "in", "out"],
    points: []
});

const outageEvents = [
    {
        startTime: "2015-04-22T03:30:00Z",
        endTime: "2015-04-22T13:00:00Z",
        description: "At 13:33 pacific circuit 06519 went down.",
        title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
        completed: true,
        external_ticket: "",
        esnet_ticket: "ESNET-20150421-013",
        organization: "Internet2 / Level 3",
        type: "Unplanned"
    }, {
        startTime: "2015-04-22T03:30:00Z",
        endTime: "2015-04-22T16:50:00Z",
        title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
        description: "The listed circuit was unavailable due to bent pins.",
        completed: true,
        external_ticket: "3576:144",
        esnet_ticket: "ESNET-20150421-013",
        organization: "Internet2 / Level 3",
        type: "Unplanned"
    }, {
        startTime: "2015-03-04T09:00:00Z",
        endTime: "2015-03-04T14:00:00Z",
        title: "ANL Scheduled Maintenance",
        description: "ANL will be switching border routers...",
        completed: true,
        external_ticket: "",
        esnet_ticket: "ESNET-20150302-002",
        organization: "ANL",
        type: "Planned"
    }
];

const sumPart1 = {
    name: "part1",
    columns: ["time", "in", "out"],
    points: [
        [1400425951000, 1, 6],
        [1400425952000, 2, 7],
        [1400425953000, 3, 8],
        [1400425954000, 4, 9]
    ]
};
const sumPart2 = {
    name: "part2",
    columns: ["time", "in", "out"],
    points: [
        [1400425951000, 9, 1],
        [1400425952000, 7, 2],
        [1400425953000, 5, 3],
        [1400425954000, 3, 4]
    ]
};

describe("TimeSeries", () => {

    describe("TimeSeries created with our wire format", () => {

        it("can create an series", done => {
            const series = new TimeSeries(data);
            expect(series).to.be.ok;
            done();
        });

    });

    describe("TimeSeries can be created with a list of events", () => {

        it("can create an series", done => {
            const events = [];
            events.push(new Event(new Date(2015, 7, 1), {value: 27}));
            events.push(new Event(new Date(2015, 8, 1), {value: 14}));
            const series = new TimeSeries({
                name: "events",
                events
            });
            expect(series.size()).to.equal(2);
            done();
        });

        it("can create an series with no events", done => {
            const events = [];
            const series = new TimeSeries({
                name: "events",
                events
            });
            expect(series.size()).to.equal(0);
            done();
        });

    });

    describe("Timeseries basic query API", () => {

        it("can return the size of the series", done => {
            const series = new TimeSeries(data);
            expect(series.size()).to.equal(4);
            done();
        });

        it("can return an item in the series as an event", done => {
            const series = new TimeSeries(data);
            const event = series.at(1);
            expect(event).to.be.an.instanceof(Event);
            done();
        });

        it("can return an item in the series with the correct data", done => {
            const series = new TimeSeries(data);
            const event = series.at(1);
            expect(JSON.stringify(event.data())).to.equal(`{"value":18,"status":"ok"}`);
            expect(event.timestamp().getTime()).to.equal(1400425948000);
            done();
        });

        it("can serialize to a string", done => {
            const series = new TimeSeries(data);
            const expectedString = `{"name":"traffic","utc":true,"columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}`;
            expect(series.toString()).to.equal(expectedString);
            done();
        });

        it("can return the time range of the series", done => {
            const series = new TimeSeries(data);
            const expectedString = "[Sun, 18 May 2014 15:12:27 GMT, Sun, 18 May 2014 15:12:30 GMT]";
            expect(series.timerange().toUTCString()).to.equal(expectedString);
            done();
        });
    });

    describe("Timeseries support for meta data", () => {

        it("can create a series with meta data and get that data back", done => {
            const series = new TimeSeries(interfaceData);
            const expected = `{"site_interface":"et-1/0/0","utc":true,"site":"anl","name":"star-cr5:to_anl_ip-a_v4","site_device":"noni","device":"star-cr5","oscars_id":null,"title":null,"is_oscars":false,"interface":"to_anl_ip-a_v4","stats_type":"Standard","id":169,"resource_uri":"","is_ipv6":false,"description":"star-cr5->anl(as683):100ge:site-ex:show:intercloud","columns":["time","in","out"],"points":[[1400425947000,52,34],[1400425948000,18,13],[1400425949000,26,67],[1400425950000,93,91]]}`;
            expect(series.toString()).to.equal(expected);
            expect(series.meta("interface")).to.equal("to_anl_ip-a_v4");
            done();
        });

    });

    describe("Timeseries support for deeply nested structures", () => {

        it("can create a series with a nested object", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
                    [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
                    [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}]
                ]
            });
            expect(series.at(0).get("NASA_north").in).to.equal(100);
            expect(series.at(0).get("NASA_north").out).to.equal(200);
            done();
        });

        it("can create a series with nested events", done => {
            const events = [];
            events.push(new Event(new Date(2015, 6, 1), {NASA_north: {in: 100, out: 200}, NASA_south: {in: 145, out: 135}}));
            events.push(new Event(new Date(2015, 7, 1), {NASA_north: {in: 200, out: 400}, NASA_south: {in: 146, out: 142}}));
            events.push(new Event(new Date(2015, 8, 1), {NASA_north: {in: 300, out: 600}, NASA_south: {in: 147, out: 158}}));
            events.push(new Event(new Date(2015, 9, 1), {NASA_north: {in: 400, out: 800}, NASA_south: {in: 155, out: 175}}));
            const series = new TimeSeries({
                name: "Map traffic",
                events
            });
            expect(series.at(0).get("NASA_north").in).to.equal(100);
            expect(series.at(3).get("NASA_south").out).to.equal(175);
            expect(series.size()).to.equal(4);
            done();
        });
    });

    describe("Timeseries compare", () => {

        it("can compare a series and a reference to a series as being equal", done => {
            const series = new TimeSeries(data);
            const refSeries = series;
            expect(series).to.equal(refSeries);
            done();
        });

        it("can use the equals() comparator to compare a series and a copy of the series as true", done => {
            const series = new TimeSeries(data);
            const copyOfSeries = new TimeSeries(series);
            expect(TimeSeries.equal(series, copyOfSeries)).to.be.true;
            done();
        });

        it("can use the equals() comparator to compare a series and a value equivalent series as false", done => {
            const series = new TimeSeries(data);
            const otherSeries = new TimeSeries(data);
            expect(TimeSeries.equal(series, otherSeries)).to.be.false;
            done();
        });

        it("can use the is() comparator to compare a series and a value equivalent series as true", done => {
            const series = new TimeSeries(data);
            const otherSeries = new TimeSeries(data);
            expect(TimeSeries.is(series, otherSeries)).to.be.true;
            done();
        });

    });

    describe("TimeSeries reducing functions", () => {

        it("can sum the series", done => {
            const series = new TimeSeries(data);
            expect(series.sum("value")).to.equal(189);
            done();
        });

        it("can sum a series with deep data", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
                    [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
                    [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}]
                ]
            });
            expect(series.sum("NASA_north.in")).to.equal(1000);
            done();
        });

        it("can sum a series with missing data", done => {
            const inSeries = missingDataSeries.clean("in");
            const outSeries = missingDataSeries.clean("out");
            expect(inSeries.sum("in")).to.equal(600);
            expect(outSeries.sum("out")).to.equal(900);
            expect(inSeries.sizeValid("in")).to.equal(3);
            expect(outSeries.sizeValid("out")).to.equal(2);
            done();
        });

        it("can sum the series with no column name specified", done => {
            const series = new TimeSeries(data);
            expect(series.sum()).to.equal(189);
            done();
        });
       
        it("can find the max of the series", done => {
            const series = new TimeSeries(data);
            expect(series.max()).to.equal(93);
            done();
        });

        it("can find the max of the series with missing data", done => {
            const series = new TimeSeries(missingDataSeries);
            expect(series.max("in")).to.equal(300);
            expect(series.max("out")).to.equal(500);
            done();
        });

        it("can find the max of the series with no data", done => {
            const series = new TimeSeries(noDataSeries);
            expect(series.max()).to.be.undefined;
            done();
        });

        it("can find the max of the series with null data", done => {
            const series = new TimeSeries(nullDataSeries);
            expect(series.max()).to.be.undefined;
            done();
        });

        it("can find the max of a series with deep data", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 182}],
                    [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
                    [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}]
                ]
            });
            expect(series.max("NASA_south.out")).to.equal(182);
            done();
        });

        it("can find the min of the series", done => {
            const series = new TimeSeries(data);
            expect(series.min()).to.equal(18);
            done();
        });

        it("can find the min of the series with missing data", done => {
            const series = new TimeSeries(missingDataSeries);
            const inSeries = series.clean("in");
            const outSeries = series.clean("out");
            expect(inSeries.min("in")).to.equal(100);
            expect(outSeries.min("out")).to.equal(400);
            done();
        });

        it("can find the min of a series with deep data", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 182}],
                    [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
                    [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}]
                ]
            });
            expect(series.min("NASA_south.out")).to.equal(135);
            done();
        });
    });

    describe("TimeSeries statistics functions", () => {

        it("can avg the series", done => {
            const series = new TimeSeries(statsData);
            expect(series.avg()).to.equal(15);
            done();
        });

        it("can avg series with deep data", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
                    [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
                    [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}]
                ]
            });
            expect(series.avg("NASA_north.in")).to.equal(250);
            done();
        });
       
        it("can avg series with deep data", done => {
            const series = new TimeSeries(availabilitySeries);
            expect(series.avg("uptime")).to.equal(95.16666666666667);
            done();
        });

        it("can find the max of the series with no data", done => {
            const series = new TimeSeries(noDataSeries);
            expect(series.avg()).to.be.undefined;
            done();
        });

        it("can mean of the series (the avg)", done => {
            const series = new TimeSeries(statsData);
            expect(series.mean()).to.equal(15);
            done();
        });

        it("can find the median of the series", done => {
            const series = new TimeSeries(statsData);
            expect(series.median()).to.equal(14);
            done();
        });

        it("can find the median of a series with deep data and even number of events", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
                    [1400425953000, {in: 400, out: 600}, {in: 147, out: 158}],
                    [1400425954000, {in: 800, out: 800}, {in: 155, out: 175}]
                ]
            });
            expect(series.median("NASA_north.in")).to.equal(300);
            done();
        });
       
        it("can find the median of a series with deep data and odd number of events", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
                    [1400425953000, {in: 400, out: 600}, {in: 147, out: 158}]
                ]
            });
            expect(series.median("NASA_north.out")).to.equal(400);
            done();
        });

        
        it("can find the standard deviation of the series", done => {
            const series = new TimeSeries(statsData);
            expect(series.stdev()).to.equal(2.6666666666666665);
            done();
        });

        it("can find the standard deviation and mean of another series", done => {
            const series = new TimeSeries(statsData2);
            expect(Math.round(series.mean() * 10) / 10).to.equal(38.8);
            expect(Math.round(series.stdev() * 10) / 10).to.equal(11.4);
            done();
        });

        it("can find the standard deviation of a series with deep data", done => {
            const series = new TimeSeries({
                name: "Map Traffic",
                columns: ["time", "NASA_north", "NASA_south"],
                points: [
                    [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
                    [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
                    [1400425953000, {in: 400, out: 600}, {in: 147, out: 158}],
                    [1400425954000, {in: 800, out: 800}, {in: 155, out: 175}]
                ]
            });
            expect(series.stdev("NASA_south.out")).to.equal(15.435349040433131);
            done();
        });

    });

    describe("TimeSeries bisect function", () => {

        it("can find the bisect starting from 0", done => {
            const series = new TimeSeries(bisectTestData);
            expect(series.bisect(moment("2012-01-11 00:30", fmt).toDate())).to.equal(0);
            expect(series.bisect(moment("2012-01-11 03:00", fmt).toDate())).to.equal(2);
            expect(series.bisect(moment("2012-01-11 03:30", fmt).toDate())).to.equal(2);
            expect(series.bisect(moment("2012-01-11 08:00", fmt).toDate())).to.equal(6);
            done();
        });

        it("can find the bisect starting from an begin index", done => {
            const series = new TimeSeries(bisectTestData);

            expect(series.bisect(moment("2012-01-11 03:00", fmt).toDate(), 2)).to.equal(2);
            expect(series.bisect(moment("2012-01-11 03:30", fmt).toDate(), 3)).to.equal(2);
            expect(series.bisect(moment("2012-01-11 03:30", fmt).toDate(), 4)).to.equal(3);

            const first = series.bisect(moment("2012-01-11 03:30", fmt).toDate());
            const second = series.bisect(moment("2012-01-11 04:30", fmt).toDate(), first);
            expect(series.at(first).get()).to.equal(44);
            expect(series.at(second).get()).to.equal(55);
            done();
        });
    });

    describe("TimeSeries with TimeRangeEvents", () => {

        const events = outageEvents.map(event => {
            const { startTime, endTime, ...other } = event; //eslint-disable-line
            const b = new Date(startTime);
            const e = new Date(endTime);
            return new TimeRangeEvent(new TimeRange(b, e), other);
        });

        it("can make a timeseries with the right timerange", done => {
            const series = new TimeSeries({name: "outages", events});
            expect(series.range().toString()).to.equal("[1425459600000,1429721400000]");
            done();
        });

        it("can make a timeseries that can be serialized to a string", done => {
            const series = new TimeSeries({name: "outages", events});
            const expected = `{"name":"outages","utc":true,"columns":["timerange","description","title","completed","external_ticket","esnet_ticket","organization","type"],"points":[[[1429673400000,1429707600000],"At 13:33 pacific circuit 06519 went down.","STAR-CR5 < 100 ge 06519 > ANL  - Outage",true,"","ESNET-20150421-013","Internet2 / Level 3","Unplanned"],[[1429673400000,1429721400000],"STAR-CR5 < 100 ge 06519 > ANL  - Outage","The listed circuit was unavailable due to bent pins.",true,"3576:144","ESNET-20150421-013","Internet2 / Level 3","Unplanned"],[[1425459600000,1425477600000],"ANL Scheduled Maintenance","ANL will be switching border routers...",true,"","ESNET-20150302-002","ANL","Planned"]]}`;
            expect(series.toString()).to.equal(expected);
            done();
        });

        it("can make a timeseries that can be serialized to JSON and then used to construct a TimeSeries again", done => {
            const series = new TimeSeries({name: "outages", events});
            const newSeries = new TimeSeries(series.toJSON());
            expect(series.toString()).to.equal(newSeries.toString());
            done();
        });
    });

    describe("TimeSeries IndexedEvents", () => {

        it("can serialize to a string", done => {
            const series = new TimeSeries(indexedData);
            const expectedString = `{"index":"1d-625","name":"traffic","utc":true,"columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}`;
            expect(series.toString()).to.equal(expectedString);
            done();
        });

        it("can return the time range of the series", done => {
            const series = new TimeSeries(indexedData);
            const expectedString = "[Sat, 18 Sep 1971 00:00:00 GMT, Sun, 19 Sep 1971 00:00:00 GMT]";
            expect(series.indexAsRange().toUTCString()).to.equal(expectedString);
            done();
        });

        it("can create an series with indexed data (in UTC time)", done => {
            const series = new TimeSeries(availabilityData);
            const event = series.at(2);
            expect(event.timerangeAsUTCString()).to.equal("[Wed, 01 Apr 2015 00:00:00 GMT, Thu, 30 Apr 2015 23:59:59 GMT]");
            expect(series.range().begin().getTime()).to.equal(1404172800000);
            expect(series.range().end().getTime()).to.equal(1435708799999);
            done();
        });
    });

    describe("TimeSeries slicing", () => {

        it("can create a slice of a series", done => {
            const series = new TimeSeries(availabilityData);
            const expectedLastTwo = `{"name":"availability","utc":true,"columns":["index","uptime"],"points":[["2014-08","88%"],["2014-07","100%"]]}`;
            const lastTwo = series.slice(-2);
            expect(lastTwo.toString()).to.equal(expectedLastTwo);
            const expectedFirstThree = `{"name":"availability","utc":true,"columns":["index","uptime"],"points":[["2015-06","100%"],["2015-05","92%"],["2015-04","87%"]]}`;
            const firstThree = series.slice(0, 3);
            expect(firstThree.toString()).to.equal(expectedFirstThree);
            const expectedAll = `{"name":"availability","utc":true,"columns":["index","uptime"],"points":[["2015-06","100%"],["2015-05","92%"],["2015-04","87%"],["2015-03","99%"],["2015-02","92%"],["2015-01","100%"],["2014-12","99%"],["2014-11","91%"],["2014-10","99%"],["2014-09","95%"],["2014-08","88%"],["2014-07","100%"]]}`;
            const sliceAll = series.slice();
            expect(sliceAll.toString()).to.equal(expectedAll);
            done();
        });
    });

    describe("TimeSeries merging", () => {

        it("can merge two timeseries columns together using merge", (done) => {
            const inTraffic = new TimeSeries(trafficDataIn);
            const outTraffic = new TimeSeries(trafficDataOut);
            const trafficSeries = TimeSeries.timeSeriesListMerge(
                {name: "traffic"}, [inTraffic, outTraffic]);
            expect(trafficSeries.at(2).get("in")).to.equal(26);
            expect(trafficSeries.at(2).get("out")).to.equal(67);
            done();
        });
       
        it("can append two timeseries together using merge", (done) => {
            const tile1 = new TimeSeries(partialTraffic1);
            const tile2 = new TimeSeries(partialTraffic2);
            const trafficSeries = TimeSeries.timeSeriesListMerge(
                {name: "traffic", source: "router"}, [tile1, tile2]
            );
            expect(trafficSeries.size()).to.equal(8);
            expect(trafficSeries.at(0).get()).to.equal(34);
            expect(trafficSeries.at(1).get()).to.equal(13);
            expect(trafficSeries.at(2).get()).to.equal(67);
            expect(trafficSeries.at(3).get()).to.equal(91);
            expect(trafficSeries.at(4).get()).to.equal(65);
            expect(trafficSeries.at(5).get()).to.equal(86);
            expect(trafficSeries.at(6).get()).to.equal(27);
            expect(trafficSeries.at(7).get()).to.equal(72);
            expect(trafficSeries.name()).to.equal("traffic");
            expect(trafficSeries.meta("source")).to.equal("router");
            done();
        });

        it("can merge two series and preserve the correct time format", (done) => {
            const inTraffic = new TimeSeries(trafficBNLtoNEWY);
            const outTraffic = new TimeSeries(trafficNEWYtoBNL);
            const trafficSeries = TimeSeries.timeSeriesListMerge(
                {name: "traffic"}, [inTraffic, outTraffic]
            );
            expect(trafficSeries.at(0).timestampAsUTCString()).to.equal("Mon, 31 Aug 2015 20:12:30 GMT");
            expect(trafficSeries.at(1).timestampAsUTCString()).to.equal("Mon, 31 Aug 2015 20:13:00 GMT");
            expect(trafficSeries.at(2).timestampAsUTCString()).to.equal("Mon, 31 Aug 2015 20:13:30 GMT");
            done();
        });
    });

    describe("TimeSeries sum static function", () => {

        it("can merge two timeseries into a new timeseries that is the sum", (done) => {
            const part1 = new TimeSeries(sumPart1);
            const part2 = new TimeSeries(sumPart2);
            const sum = TimeSeries.timeSeriesListSum(
                {name: "sum"},
                [part1, part2],
                ["in", "out"]
            );

            //10, 9, 8, 7
            expect(sum.at(0).get("in")).to.equal(10);
            expect(sum.at(1).get("in")).to.equal(9);
            expect(sum.at(2).get("in")).to.equal(8);
            expect(sum.at(3).get("in")).to.equal(7);

            //7, 9, 11, 13
            expect(sum.at(0).get("out")).to.equal(7);
            expect(sum.at(1).get("out")).to.equal(9);
            expect(sum.at(2).get("out")).to.equal(11);
            expect(sum.at(3).get("out")).to.equal(13);

            done();
        });
    });

    describe("TimeSeries collapse", () => {

        it("can collapse a timeseries into a new timeseries that is the sum of two columns", (done) => {
            const ts = new TimeSeries(sumPart1);
            ts.collapse(["in", "out"], "sum", sum, false, sums => {
                expect(sums.at(0).get("sum")).to.equal(7);
                expect(sums.at(1).get("sum")).to.equal(9);
                expect(sums.at(2).get("sum")).to.equal(11);
                expect(sums.at(3).get("sum")).to.equal(13);

                done();
            });
        });

        it("can collapse a timeseries into a new timeseries that is the max of two columns", (done) => {
            const timeseries = new TimeSeries(sumPart2);
            timeseries
                .collapse(["in", "out"], "max_in_out", max, true, ts => {
                    expect(ts.at(0).get("max_in_out")).to.equal(9);
                    expect(ts.at(1).get("max_in_out")).to.equal(7);
                    expect(ts.at(2).get("max_in_out")).to.equal(5);
                    expect(ts.at(3).get("max_in_out")).to.equal(4);
                    done();
                });
        });

    });

    describe("TimeSeries column selection", () => {

        it("can select a single column from a TimeSeries", (done) => {
            const timeseries = new TimeSeries(interfaceData);
            expect(timeseries.columns()).to.eql(["in", "out"]);

            timeseries.select("in", (ts) => {
                expect(ts.columns()).to.eql(["in"]);
                expect(ts.name()).to.equal("star-cr5:to_anl_ip-a_v4");
            });

            done();
        });

        it("can select multiple columns from a TimeSeries", (done => {
            const timeseries = new TimeSeries(availabilitySeries);
            expect(timeseries.columns()).to.eql(["uptime", "notes", "outages"]);

            timeseries.select(["uptime", "notes"], (ts) => {
                expect(ts.columns()).to.eql(["uptime", "notes"]);
                expect(ts.name()).to.equal("availability");
            });

            done();
        }));
    });

    describe("TimeSeries remapping", () => {

        it("can reverse the values in this timeseries", (done) => {
            const timeseries = new TimeSeries(interfaceData);
            expect(timeseries.columns()).to.eql(["in", "out"]);

            timeseries.map(e => e.setData({in: e.get("out"), out: e.get("in")}), ts => {
                expect(ts.at(0).get("in")).to.equal(34);
                expect(ts.at(0).get("out")).to.equal(52);
                expect(ts.size()).to.equal(timeseries.size());
            });

            done();
        });

    });

});
