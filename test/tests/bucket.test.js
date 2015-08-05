var expect = require("chai").expect;
var _ = require("underscore");

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
    ]
};

describe("Buckets", () => {

    describe("5min bucket tests", () => {

        var BucketGenerator = require("../../src/generator.js");

        //Test date: Sat Mar 14 2015 07:32:22 GMT-0700 (PDT)
        var d = new Date(2015, 2, 14, 7, 32, 22);
        var Buckets = new BucketGenerator("5m");
        it('should have the correct index', (done) => {
            var b = Buckets.bucket(d);
            var expected = "5m-4754478";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it('should have the correct local string', (done) => {
            var b = Buckets.bucket(d);
            var expected = "5m-4754478: [Sat Mar 14 2015 07:30:00 GMT-0700 (PDT), Sat Mar 14 2015 07:35:00 GMT-0700 (PDT)]";
            expect(b.toLocalString()).to.equal(expected);
            done();
        });

        it('should have the correct UTC string', (done) => {
            var b = Buckets.bucket(d);
            var expected = "5m-4754478: [Sat, 14 Mar 2015 14:30:00 GMT, Sat, 14 Mar 2015 14:35:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });
    });

    describe("Hourly bucket tests", function () {

        var BucketGenerator = require("../../src/generator.js");

        //Test date: Sat Mar 14 2015 07:32:22 GMT-0700 (PDT)
        var d = new Date(2015, 2, 14, 7, 32, 22);
        var Buckets = new BucketGenerator("1h");
        
        it('should have the correct index', (done) => {
            var b = Buckets.bucket(d);
            var expected = "1h-396206";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it('should have the correct local string', (done) => {
            var b = Buckets.bucket(d);
            var expected = "1h-396206: [Sat Mar 14 2015 07:00:00 GMT-0700 (PDT), Sat Mar 14 2015 08:00:00 GMT-0700 (PDT)]";
            expect(b.toLocalString()).to.equal(expected);
            done();
        });
        
        it('should have the correct UTC string', (done) => {
            var b = Buckets.bucket(d);
            var expected = "1h-396206: [Sat, 14 Mar 2015 14:00:00 GMT, Sat, 14 Mar 2015 15:00:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });
    });

    describe("Daily bucket tests", function () {

        var BucketGenerator = require("../../src/generator.js");

        //Test date: Sat Mar 14 2015 07:32:22 GMT-0700 (PDT)
        var d = new Date(2015, 2, 14, 7, 32, 22);
        var Buckets = new BucketGenerator("1d");
        
        it('should have the correct index', (done) => {
            var b = Buckets.bucket(d);
            var expected = "1d-16508";
            expect(b.index().asString()).to.equal(expected);
            done();
        });

        it('should have the correct local string', (done) => {
            var b = Buckets.bucket(d);
            var expected = "1d-16508: [Fri Mar 13 2015 17:00:00 GMT-0700 (PDT), Sat Mar 14 2015 17:00:00 GMT-0700 (PDT)]";
            expect(b.toLocalString()).to.equal(expected);
            done();
        });
        
        it('should have the correct UTC string', (done) => {
            var b = Buckets.bucket(d);
            var expected = "1d-16508: [Sat, 14 Mar 2015 00:00:00 GMT, Sun, 15 Mar 2015 00:00:00 GMT]";
            expect(b.toUTCString()).to.equal(expected);
            done();
        });

    });

    describe("Aggregator", function () {

        var {Event, IndexedEvent} = require("../../src/event");
        var TimeRange = require("../../src/range");
        var Aggregator = require("../../src/aggregator");
        var {max, avg, sum, count} = require("../../src/functions");

        var incomingEvents = [];
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 57, 0), 3));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 58, 0), 9));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 59, 0), 6));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  0, 0), 4));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  1, 0), 5));

        it('should calculate the correct max for the two 1hr buckets', (done) => {
            var maxEvents = {};

            var MaxAggregator = new Aggregator("1h", max);
            
            MaxAggregator.onEmit((index, event) => {
                maxEvents[index.asString()] = event;
            });

            //Add events
            _.each(incomingEvents, (event) => {
                MaxAggregator.addEvent(event);
            });

            //Done
            MaxAggregator.done();

            expect(maxEvents["1h-396206"].get()).to.equal(9);
            expect(maxEvents["1h-396207"].get()).to.equal(5);
            done();
        });

        it('should calculate the correct avg for the two 1hr buckets', (done) => {
            var avgEvents = {};

            var AvgAggregator = new Aggregator("1h", avg);

            AvgAggregator.onEmit((index, event) => {
                avgEvents[index.asString()] = event;
            });

            //Add events
            _.each(incomingEvents, (event) => {
                AvgAggregator.addEvent(event);
            });

            //Done
            AvgAggregator.done();

            expect(avgEvents["1h-396206"].get()).to.equal(6);
            expect(avgEvents["1h-396207"].get()).to.equal(4.5);
            done();
        });

        it('should calculate the correct sum for the two 1hr buckets', (done) => {
            var sumEvents = {};
            var SumAggregator = new Aggregator("1h", sum);
            SumAggregator.onEmit((index, event) => {
                sumEvents[index.asString()] = event;
            });

            //Add events
            _.each(incomingEvents, (event) => {
                SumAggregator.addEvent(event);
            });

            //Done
            SumAggregator.done();

            expect(sumEvents["1h-396206"].get("value")).to.equal(18);
            expect(sumEvents["1h-396207"].get("value")).to.equal(9);
            done();
        });

        it('should calculate the correct count for the two 1hr buckets', (done) => {
            var countEvents = {};
            var CountAggregator = new Aggregator("1h", count);
            CountAggregator.onEmit((index, event) => {
                countEvents[index.asString()] = event;
            });
            _.each(incomingEvents, (event) => {
                CountAggregator.addEvent(event);
            });

            //Done
            CountAggregator.done();

            expect(countEvents["1h-396206"].get()).to.equal(3);
            expect(countEvents["1h-396207"].get()).to.equal(2);
            done();
        });

        it('should calculate the correct count for a series of points', (done) => {
            var incomingEvents = [];
            var countEvents = {};

            //Convert the series to events
            _.each(sept_2014_data.points, (point) => {
                incomingEvents.push(new Event(point[0], point[1]));
            });

            var CountAggregator = new Aggregator("1d", count);
            CountAggregator.onEmit((index, event) => {
                countEvents[index.asString()] = event;
            });
            _.each(incomingEvents, (event) => {
                CountAggregator.addEvent(event);
            });

            //Done
            CountAggregator.done();

            expect(countEvents["1d-16314"].get()).to.equal(24);
            expect(countEvents["1d-16318"].get()).to.equal(20);
            done();
        });

        it('should calculate the correct count with inline emit', (done) => {
            var incomingEvents = [];
            var countEvents = {};

            //Convert the series to events
            _.each(sept_2014_data.points, (point) => {
                incomingEvents.push(new Event(point[0], point[1]));
            });

            var CountAggregator = new Aggregator("1d", count, (index, event) => {
                countEvents[index.asString()] = event;
            });
            
            _.each(incomingEvents, (event) => {
                CountAggregator.addEvent(event);
            });

            //Done
            CountAggregator.done();

            expect(countEvents["1d-16314"].get()).to.equal(24);
            expect(countEvents["1d-16318"].get()).to.equal(20);
            done();
        });

    });

    describe("Aggregator tests for object events", function () {

        var {Event, IndexedEvent} = require("../../src/event");
        var TimeRange = require("../../src/range");
        var Aggregator = require("../../src/aggregator");
        var {max, avg, sum, count} = require("../../src/functions");

        var incomingEvents = [];
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 57, 0), {"cpu1": 23.4, "cpu2": 55.1}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 58, 0), {"cpu1": 36.2, "cpu2": 45.6}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 59, 0), {"cpu1": 38.6, "cpu2": 65.2}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  0, 0), {"cpu1": 24.5, "cpu2": 85.2}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  1, 0), {"cpu1": 45.2, "cpu2": 91.6}));

        it('should calculate the correct sum for the two 1hr buckets', (done) => {
            var sumEvents = {};
            var SumAggregator = new Aggregator("1h", sum);
            SumAggregator.onEmit((index, event) => {
                sumEvents[index.asString()] = event;
            });

            //Add events
            _.each(incomingEvents, (event) => {
                SumAggregator.addEvent(event);
            });

            //Done
            SumAggregator.done();

            expect(sumEvents["1h-396206"].get("cpu1")).to.equal(98.2);
            expect(sumEvents["1h-396206"].get("cpu2")).to.equal(165.9);
            expect(sumEvents["1h-396207"].get("cpu1")).to.equal(69.7);
            expect(sumEvents["1h-396207"].get("cpu2")).to.equal(176.8);
            done();
        });
    });

    describe("Collection tests", function () {

        var {Event, IndexedEvent} = require("../../src/event");
        var TimeRange = require("../../src/range");
        var Collector = require("../../src/collector");
        var {max, avg, sum, count} = require("../../src/functions");

        var incomingEvents = [];
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 57, 0), {"cpu1": 23.4, "cpu2": 55.1}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 58, 0), {"cpu1": 36.2, "cpu2": 45.6}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 59, 0), {"cpu1": 38.6, "cpu2": 65.2}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  0, 0), {"cpu1": 24.5, "cpu2": 85.2}));
        incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  1, 0), {"cpu1": 45.2, "cpu2": 91.6}));

        it('should calculate the correct sum for the two 1hr buckets', (done) => {
            var collection = {};

            var hourlyCollection = new Collector("1h", (series) => {
                collection[series.index().asString()] = series;
            });

            //Add events
            _.each(incomingEvents, (event) => {
                hourlyCollection.addEvent(event);
            });

            //Done
            hourlyCollection.done();

            var expected1 = '{"name":"1h-396206","index":"1h-396206","columns":["time","cpu1","cpu2"],"points":[["2015-03-14T14:57:00.000Z",23.4,55.1],["2015-03-14T14:58:00.000Z",36.2,45.6],["2015-03-14T14:59:00.000Z",38.6,65.2]]}';
            var expected2 = '{"name":"1h-396207","index":"1h-396207","columns":["time","cpu1","cpu2"],"points":[["2015-03-14T15:00:00.000Z",24.5,85.2],["2015-03-14T15:01:00.000Z",45.2,91.6]]}';

            expect(collection["1h-396206"].indexAsString()).to.equal("1h-396206");
            expect(collection["1h-396207"].indexAsString()).to.equal("1h-396207");

            expect(collection["1h-396206"].size()).to.equal(3);
            expect(collection["1h-396207"].size()).to.equal(2);

            //expect(collection["1h-396206"].toString()).to.equal(expected1);
            //expect(collection["1h-396207"].toString()).to.equal(expected2);

            done();
        });
    });

});