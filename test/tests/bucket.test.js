var expect = require("chai").expect;
var _ = require("underscore");

describe("Buckets", () => {

    describe("5min bucket tests", () => {

        var BucketGenerator = require("../../src/modules/generator.js");

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

        var BucketGenerator = require("../../src/modules/generator.js");

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

        var BucketGenerator = require("../../src/modules/generator.js");

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

    describe("Aggregator tests!", function () {

        var {Event, IndexedEvent} = require("../../src/modules/event");
        var TimeRange = require("../../src/modules/range");
        var Aggregator = require("../../src/modules/aggregator");
        var {max, avg, sum, count} = require("../../src/modules/functions");

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

            expect(sumEvents["1h-396206"].get()).to.equal(18);
            expect(sumEvents["1h-396207"].get()).to.equal(9);
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

    });

});