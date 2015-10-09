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
import {expect} from "chai";
import {Event} from "../../src/event.js";
import {TimeSeries} from "../../src/series.js";

const data = {
    name: "traffic",
    columns: ["time", "value", "status"],
    points: [
        [1400425947000, 52, "ok"],
        [1400425948000, 18, "ok"],
        [1400425949000, 26, "fail"],
        [1400425950000, 93, "offline"],
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
        [1400425950000, 93, "offline"],
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
    columns: ["time", "uptime"],
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

/*
const availabilityDataLocalTime = {
    name: "availability",
    utc: false,
    columns: ["time", "uptime"],
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
*/

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
        [1400425950000, 93, 91],
    ]
};

/*
const sept2014Data = {
    name: "traffic",
    columns: ["time", "value"],
    points: [
        [1409529600000, 80],
        [1409533200000, 88],
        [1409536800000, 52],
        [1409540400000, 80],
        [1409544000000, 26],
        [1409547600000, 37],
        [1409551200000, 6 ],
        [1409554800000, 32],
        [1409558400000, 69],
        [1409562000000, 21],
        [1409565600000, 6 ],
        [1409569200000, 54],
        [1409572800000, 88],
        [1409576400000, 41],
        [1409580000000, 35],
        [1409583600000, 43],
        [1409587200000, 84],
        [1409590800000, 32],
        [1409594400000, 41],
        [1409598000000, 57],
        [1409601600000, 27],
        [1409605200000, 50],
        [1409608800000, 13],
        [1409612400000, 63],
        [1409616000000, 58],
        [1409619600000, 80],
        [1409623200000, 59],
        [1409626800000, 96],
        [1409630400000, 2],
        [1409634000000, 20],
        [1409637600000, 64],
        [1409641200000, 7],
        [1409644800000, 50],
        [1409648400000, 88],
        [1409652000000, 34],
        [1409655600000, 31],
        [1409659200000, 16],
        [1409662800000, 38],
        [1409666400000, 94],
        [1409670000000, 78],
        [1409673600000, 86],
        [1409677200000, 13],
        [1409680800000, 34],
        [1409684400000, 29],
        [1409688000000, 48],
        [1409691600000, 80],
        [1409695200000, 30],
        [1409698800000, 15],
        [1409702400000, 62],
        [1409706000000, 66],
        [1409709600000, 44],
        [1409713200000, 94],
        [1409716800000, 78],
        [1409720400000, 29],
        [1409724000000, 21],
        [1409727600000, 4 ],
        [1409731200000, 83],
        [1409734800000, 15],
        [1409738400000, 89],
        [1409742000000, 53],
        [1409745600000, 70],
        [1409749200000, 41],
        [1409752800000, 47],
        [1409756400000, 30],
        [1409760000000, 68],
        [1409763600000, 89],
        [1409767200000, 29],
        [1409770800000, 17],
        [1409774400000, 38],
        [1409778000000, 67],
        [1409781600000, 75],
        [1409785200000, 89],
        [1409788800000, 47],
        [1409792400000, 82],
        [1409796000000, 33],
        [1409799600000, 67],
        [1409803200000, 93],
        [1409806800000, 86],
        [1409810400000, 97],
        [1409814000000, 19],
        [1409817600000, 19],
        [1409821200000, 31],
        [1409824800000, 56],
        [1409828400000, 19],
        [1409832000000, 43],
        [1409835600000, 29],
        [1409839200000, 72],
        [1409842800000, 27],
        [1409846400000, 21],
        [1409850000000, 88],
        [1409853600000, 18],
        [1409857200000, 30],
        [1409860800000, 46],
        [1409864400000, 34],
        [1409868000000, 31],
        [1409871600000, 20],
        [1409875200000, 45],
        [1409878800000, 17],
        [1409882400000, 24],
        [1409886000000, 84],
        [1409889600000, 6 ],
        [1409893200000, 91],
        [1409896800000, 82],
        [1409900400000, 71],
        [1409904000000, 97],
        [1409907600000, 43],
        [1409911200000, 38],
        [1409914800000, 1],
        [1409918400000, 71],
        [1409922000000, 50],
        [1409925600000, 19],
        [1409929200000, 19],
        [1409932800000, 86],
        [1409936400000, 65],
        [1409940000000, 93],
        [1409943600000, 35],
        [1409947200000, 14],
        [1409950800000, 93],
        [1409954400000, 84],
        [1409958000000, 91],
    ]
};
*/

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
        [moment("2012-01-11 07:00", fmt).valueOf(), 88],
    ]
};

const trafficDataIn = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "in"],
    points: [
        [1400425947000, 52],
        [1400425948000, 18],
        [1400425949000, 26],
        [1400425950000, 93],
    ]
};

const trafficDataOut = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "out"],
    points: [
        [1400425947000, 34],
        [1400425948000, 13],
        [1400425949000, 67],
        [1400425950000, 91],
    ]
};

const partialTraffic1 = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "value"],
    points: [
        [1400425947000, 34],
        [1400425948000, 13],
        [1400425949000, 67],
        [1400425950000, 91],
    ]
};

const partialTraffic2 = {
    name: "star-cr5:to_anl_ip-a_v4",
    columns: ["time", "value"],
    points: [
        [1400425951000, 65],
        [1400425952000, 86],
        [1400425953000, 27],
        [1400425954000, 72],
    ]
};

describe("TimeSeries", () => {

    describe("TimeSeries created with a javascript objects", () => {
        it("can create an series", done => {
            const series = new TimeSeries(data);
            expect(series).to.be.ok;
            done();
        });
    });

    describe("TimeSeries created with a list of events", () => {
        it("can create an series", done => {
            const events = [];
            events.push(new Event(new Date(2015, 7, 1), {value: 27}));
            events.push(new Event(new Date(2015, 8, 1), {value: 14}));
            const series = new TimeSeries({
                name: "events",
                events: events
            });
            expect(series.size()).to.equal(2);
            done();
        });
        it("can create an series with no events", done => {
            const events = [];
            const series = new TimeSeries({
                name: "events",
                events: events
            });
            expect(series.size()).to.equal(0);
            done();
        });
    });

    describe("Timeseries basic query", () => {
        it("can create an series", done => {
            const series = new TimeSeries(data);
            expect(series).to.be.ok;
            done();
        });

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
            const expectedString = `{"name":"traffic","columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}`;
            expect(series.toString()).to.equal(expectedString);
            done();
        });

        it("can return the time range of the series", done => {
            const series = new TimeSeries(data);
            const expectedString = "[Sun, 18 May 2014 15:12:27 GMT, Sun, 18 May 2014 15:12:30 GMT]";
            expect(series.range().toUTCString()).to.equal(expectedString);
            done();
        });
    });

    describe("Timeseries with meta data can be created with a javascript object", () => {
        it("can create an series with meta data and get that data back", done => {
            const series = new TimeSeries(interfaceData);
            const expected = `{"name":"star-cr5:to_anl_ip-a_v4","columns":["time","in","out"],"points":[[1400425947000,52,34],[1400425948000,18,13],[1400425949000,26,67],[1400425950000,93,91]],"site_interface":"et-1/0/0","site":"anl","site_device":"noni","device":"star-cr5","oscars_id":null,"title":null,"is_oscars":false,"interface":"to_anl_ip-a_v4","stats_type":"Standard","id":169,"resource_uri":"","is_ipv6":false,"description":"star-cr5->anl(as683):100ge:site-ex:show:intercloud"}`;
            expect(series.toString()).to.equal(expected);
            expect(series.meta("interface")).to.equal("to_anl_ip-a_v4");
            done();
        });
    });

    describe("Compare series", () => {
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

    describe("Series can be reduced", () => {

        it("can sum the series", done => {
            const series = new TimeSeries(data);
            expect(series.sum("value")).to.equal(189);
            done();
        });

        it("can sum the series with no column name specified", done => {
            const series = new TimeSeries(data);
            expect(series.sum()).to.equal(189);
            done();
        });

        it("can sum the series with a bogus column name and get undefined", done => {
            const series = new TimeSeries(data);
            expect(series.sum("invalid")).to.be.undefined;
            done();
        });

        it("can find the max of the series", done => {
            const series = new TimeSeries(data);
            expect(series.max()).to.equal(93);
            done();
        });

        it("can find the min of the series", done => {
            const series = new TimeSeries(data);
            expect(series.min()).to.equal(18);
            done();
        });

    });

    describe("Series can be reduced to stats", () => {

        it("can avg the series", done => {
            const series = new TimeSeries(statsData);
            expect(series.avg()).to.equal(15);
            done();
        });

        it("can mean of the series (the avg)", done => {
            const series = new TimeSeries(statsData);
            expect(series.mean()).to.equal(15);
            done();
        });

        it("can find the mean of the series", done => {
            const series = new TimeSeries(statsData);
            expect(series.mean()).to.equal(15);
            done();
        });

        it("can find the median of the series", done => {
            const series = new TimeSeries(statsData);
            expect(series.median()).to.equal(14);
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
    });

    describe("Series index can be found with bisect", () => {

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
});

/**
 * A TimeSeries should be able to have an Index associated with it, for instance
 * if the series represents june 2014 then the Index might be "2014-06", or the
 * 123rd day since the epoch would be "1d-123"
 */
describe("Indexed TimeSeries", () => {

    describe("Series created with a javascript object", () => {

        it("can serialize to a string", done => {
            const series = new TimeSeries(indexedData);
            const expectedString = `{"name":"traffic","index":"1d-625","columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}`;
            expect(series.toString()).to.equal(expectedString);
            done();
        });

        it("can return the time range of the series", done => {
            const series = new TimeSeries(indexedData);
            const expectedString = "[Sat, 18 Sep 1971 00:00:00 GMT, Sun, 19 Sep 1971 00:00:00 GMT]";
            expect(series.indexAsRange().toUTCString()).to.equal(expectedString);
            done();
        });
    });
});

/**
 * A series should be able to have an Index associated with it, for instance
 * if the series represents june 2014 then the Index might be "2014-06", or the
 * 123rd day since the epoch would be "1d-123"
 */
describe("Timeseries containing indexed timeranges", () => {

    describe("Series created with indexed data in the default UTC time", () => {
        it("can create an series with indexed data (in UTC time)", done => {
            const series = new TimeSeries(availabilityData);
            const event = series.at(2);
            expect(event.timerangeAsUTCString()).to.equal("[Wed, 01 Apr 2015 00:00:00 GMT, Thu, 30 Apr 2015 23:59:59 GMT]");
            expect(series.range().begin().getTime()).to.equal(1404172800000);
            expect(series.range().end().getTime()).to.equal(1435708799999);
            done();
        });
    });

    /**
     * DISABLED TEST
     *
     * The problem is this test creates times in local time, but running the test in
     * different timezones will produce a different timeseries.

    describe("Series created with indexed data in local time", () => {
        it("can create an series with indexed data in local time", done => {
            const series = new TimeSeries(availabilityDataLocalTime);
            const event = series.at(2);
            expect(event.timerangeAsUTCString()).to.equal("[Wed, 01 Apr 2015 07:00:00 GMT, Fri, 01 May 2015 06:59:59 GMT]");
            expect(series.range().begin().getTime()).to.equal(1404198000000);
            expect(series.range().end().getTime()).to.equal(1435733999999);
            done();
        });
    });

    */
});

/**
 * A series should be able to be mutated, producing another TimeSeries as a result
 */
describe("Mutation of timeseries", () => {

    describe("Series created with a javascript object", () => {
        it("can create an slice a series", done => {
            const series = new TimeSeries(availabilityData);
            const expectedLastTwo = `{"name":"availability","columns":["time","uptime"],"points":[["2014-08","88%"],["2014-07","100%"]]}`;
            const lastTwo = series.slice(-2);
            expect(lastTwo.toString()).to.equal(expectedLastTwo);
            const expectedFirstThree = `{"name":"availability","columns":["time","uptime"],"points":[["2015-06","100%"],["2015-05","92%"],["2015-04","87%"]]}`;
            const firstThree = series.slice(0, 3);
            expect(firstThree.toString()).to.equal(expectedFirstThree);
            const expectedAll = `{"name":"availability","columns":["time","uptime"],"points":[["2015-06","100%"],["2015-05","92%"],["2015-04","87%"],["2015-03","99%"],["2015-02","92%"],["2015-01","100%"],["2014-12","99%"],["2014-11","91%"],["2014-10","99%"],["2014-09","95%"],["2014-08","88%"],["2014-07","100%"]]}`;
            const sliceAll = series.slice();
            expect(sliceAll.toString()).to.equal(expectedAll);
            done();
        });

        it("can merge two timeseries columns together using merge", (done) => {
            const inTraffic = new TimeSeries(trafficDataIn);
            const outTraffic = new TimeSeries(trafficDataOut);
            const trafficSeries = TimeSeries.merge({name: "traffic"}, [inTraffic, outTraffic]);
            expect(trafficSeries.at(2).get("in")).to.equal(26);
            expect(trafficSeries.at(2).get("out")).to.equal(67);
            done();
        });

        it("can append two timeseries together using merge", (done) => {
            const tile1 = new TimeSeries(partialTraffic1);
            const tile2 = new TimeSeries(partialTraffic2);
            const trafficSeries = TimeSeries.merge({name: "traffic", source: "router"}, [tile1, tile2]);
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
    });
});
