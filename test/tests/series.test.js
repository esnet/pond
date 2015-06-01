var moment = require("moment");
var expect = require("chai").expect;

var {Event} = require("../../src/modules/event.js");

var data = {
    "name": "traffic",
    "columns": ["time", "value", "status"],
    "points": [
        [1400425947000, 52, "ok"],
        [1400425948000, 18, "ok"],
        [1400425949000, 26, "fail"],
        [1400425950000, 93, "offline"],
    ]
};

var interface_data = {
    "name": "star-cr5:to_anl_ip-a_v4",
    "description": "star-cr5->anl(as683):100ge:site-ex:show:intercloud",
    "device": "star-cr5",
    "id": 169,
    "interface": "to_anl_ip-a_v4",
    "is_ipv6": false,
    "is_oscars": false,
    "oscars_id": null,
    "resource_uri": "",
    "site": "anl",
    "site_device": "noni",
    "site_interface": "et-1/0/0",
    "stats_type": "Standard",
    "title": null,
    "columns": ["time", "in", "out"],
    "points": [
        [1400425947000, 52, 34],
        [1400425948000, 18, 13],
        [1400425949000, 26, 67],
        [1400425950000, 93, 91],
    ]
};

var sept_2014_data = {
    "name": "traffic",
    "columns": ["time", "value"],
    "points": [
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

describe("Series", function () {

    var {Series, TimeSeries} = require("../../src/modules/series.js");

    describe("TimeSeries created with a javascript objects", function () {
        it("can create an series", function(done) {
            var series = new TimeSeries(data);
            expect(series).to.be.ok;
            done();
        });
    });

    describe("Timeseries created with a javascript object", function () {
        it("can create an series", function(done) {
            var series = new TimeSeries(data);
            expect(series).to.be.ok;
            done();
        });

        it("can return the size of the series", function(done) {
            var series = new TimeSeries(data);
            expect(series.size()).to.equal(4);
            done();
        });

        it("can return an item in the series as an event", function(done) {
            var series = new TimeSeries(data);
            var event = series.at(1);
            expect(event).to.be.an.instanceof(Event);
            done();
        });

        it("can return an item in the series with the correct data", function(done) {
            var series = new TimeSeries(data);
            var event = series.at(1);
            expect(JSON.stringify(event.data())).to.equal('{"value":18,"status":"ok"}');
            expect(event.timestamp().getTime()).to.equal(1400425948000);
            done();
        });

        it("can serialize to a string", function(done) {
            var series = new TimeSeries(data);
            var event = series.at(1);
            var expectedString = `{"name":"traffic","columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}`
            expect(series.toString()).to.equal(expectedString);
            done();
        });

        it("can return the time range of the series", function(done) {
            var series = new TimeSeries(data);
            var expectedString = "[Sun May 18 2014 08:12:27 GMT-0700 (PDT), Sun May 18 2014 08:12:30 GMT-0700 (PDT)]";
            expect(series.range().toLocalString()).to.equal(expectedString);
            done();
        });
    });

    describe("Timeseries with meta data can be created with a javascript object", function () {
        it("can create an series with meta data and get that data back", function(done) {
            var series = new TimeSeries(interface_data);
            var expected = '{"site_interface":"et-1/0/0","site":"anl","site_device":"noni","device":"star-cr5","oscars_id":null,"title":null,"is_oscars":false,"interface":"to_anl_ip-a_v4","stats_type":"Standard","id":169,"resource_uri":"","is_ipv6":false,"description":"star-cr5->anl(as683):100ge:site-ex:show:intercloud","name":"star-cr5:to_anl_ip-a_v4","columns":["time","in","out"],"points":[[1400425947000,52,34],[1400425948000,18,13],[1400425949000,26,67],[1400425950000,93,91]]}';            
            expect(series.toString()).to.equal(expected);
            expect(series.meta("interface")).to.equal("to_anl_ip-a_v4");
            expect(series.meta("bob")).to.be.undefined();
            done();
        });
    });

    describe("Timeseries has a generator", function () {
        it("can create an series with meta data and get that data back with the generator", function(done) {
            var series = new TimeSeries(interface_data);
            var results = [];
            for (event of series.events()) {
                results.push(event.get("in"));
            }
            expect(results).to.deep.equal([52,18,26,93]);
            done();
        });
    });

    describe("Compare series", function () {
        it("can compare a series and a reference to a series as being equal", function(done) {
            var series = new TimeSeries(data);
            var refSeries = series;
            expect(series).to.equal(refSeries);
            done();
        });

        it("can use the equals() comparator to compare a series and a copy of the series as true", function(done) {
            var series = new TimeSeries(data);
            var copyOfSeries = new TimeSeries(series);
            expect(TimeSeries.equal(series, copyOfSeries)).to.be.true;
            done();
        });

        it("can use the equals() comparator to compare a series and a value equivalent series as false", function(done) {
            var series = new TimeSeries(data);
            var otherSeries = new TimeSeries(data);
            expect(TimeSeries.equal(series, otherSeries)).to.be.false;
            done();
        });

        it("can use the is() comparator to compare a series and a value equivalent series as true", function(done) {
            var series = new TimeSeries(data);
            var otherSeries = new TimeSeries(data);
            expect(TimeSeries.is(series, otherSeries)).to.be.true;
            done();
        });
    });

    describe("Series can be reduced", function () {

        it("can sum the series", function(done) {
            var series = new TimeSeries(data);
            expect(series.sum("value")).to.equal(189);
            done();
        });

        it("can sum the series with no column name specified", function(done) {
            var series = new TimeSeries(data);
            expect(series.sum()).to.equal(189);
            done();
        });

        it("can sum the series with a bogus column name and get undefined", function(done) {
            var series = new TimeSeries(data);
            expect(series.sum("invalid")).to.be.undefined;
            done();
        });

        it("can avg the series", function(done) {
            var series = new TimeSeries(data);
            expect(series.avg()).to.equal(47.25);
            done();
        });

        it("can avg the series", function(done) {
            var series = new TimeSeries(data);
            expect(series.avg()).to.equal(47.25);
            done();
        });

        it("can find the max of the series", function(done) {
            var series = new TimeSeries(data);
            expect(series.max()).to.equal(93);
            done();
        });

        it("can find the min of the series", function(done) {
            var series = new TimeSeries(data);
            expect(series.min()).to.equal(18);
            done();
        });
    });

});


describe("IndexedSeries", function () {

    var {IndexedSeries} = require("../../src/modules/series.js");

    describe("Series created with a javascript object", function () {
        it("can create an series", function(done) {
            var series = new IndexedSeries(data);
            expect(series).to.be.ok;
            done();
        });

        it("can return the size of the series", function(done) {
            var series = new IndexedSeries("1d-1234", data);
            expect(series.size()).to.equal(4);
            done();
        });

        it("can return an item in the series as an event", function(done) {
            var series = new IndexedSeries("1d-1234", data);
            var event = series.at(1);
            expect(event).to.be.an.instanceof(Event);
            done();
        });

        it("can return an item in the series with the correct data", function(done) {
            var series = new IndexedSeries("1d-1234", data);
            var event = series.at(1);
            expect(JSON.stringify(event.data())).to.equal('{"value":18,"status":"ok"}');
            expect(event.timestamp().getTime()).to.equal(1400425948000);
            done();
        });

        it("can serialize to a string", function(done) {
            var series = new IndexedSeries("1d-1234", data);
            var expectedString = '{"name":"traffic","index":"1d-1234","columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}';
            expect(series.toString()).to.equal(expectedString);
            done();
        });

        it("can return the time range of the series", function(done) {
            var series = new IndexedSeries("1d-10234", data);
            var expectedString = "[Wed Jan 07 1998 16:00:00 GMT-0800 (PST), Thu Jan 08 1998 16:00:00 GMT-0800 (PST)]";
            expect(series.range().toLocalString()).to.equal(expectedString);
            done();
        });
    });
});