var moment = require("moment");
var expect = require("chai").expect;
var _ = require("underscore");

var testEventString = '{"time":1409529600000,"data":{"value":42}}';
var testEventData = JSON.parse(testEventString);

var outageList = {
    "status": "OK",
    "outage_events": [
        {
            "start_time": "2015-04-22T03:30:00Z",
            "end_time": "2015-04-22T13:00:00Z",
            "description": "At 13:33 pacific circuit 06519 went down.",
            "title": "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
            "completed": true,
            "external_ticket": "",
            "esnet_ticket": "ESNET-20150421-013",
            "organization": "Internet2 / Level 3",
            "type": "U"
        }, {
            "start_time": "2015-04-22T03:30:00Z",
            "end_time": "2015-04-22T16:50:00Z",
            "title": "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
            "description": "The listed circuit was unavailable due to bent pins in two clots of the optical node chassis.",
            "completed": true,
            "external_ticket": "3576:144",
            "esnet_ticket": "ESNET-20150421-013",
            "organization": "Internet2 / Level 3",
            "type": "U"
        }, {
            "start_time": "2015-03-04T09:00:00Z",
            "end_time": "2015-03-04T14:00:00Z",
            "title": "ANL Scheduled Maintenance",
            "description": "ANL will be switching border routers...",
            "completed": true,
            "external_ticket": "",
            "esnet_ticket": "ESNET-20150302-002",
            "organization": "ANL",
            "type": "P"
        }
    ]
}

describe("Events", function () {

    var {Event, TimeRangeEvent, IndexedEvent}  = require("../../src/modules/event.js");
    var TimeRange = require("../../src/modules/range.js");
    var Index = require("../../src/modules/index.js");

    describe("Event", function () {

        it("can create an indexed event using a string index and data", function(done) {
            let event = new IndexedEvent("1d-12355", {"value": 42});
            let expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.timerangeAsUTCString()).to.equal(expected);
            expect(event.get("value")).to.equal(42);
            done();
        });

        it("can create an indexed event using an existing Index and data", function(done) {
            let index = new Index("1d-12355");
            let event = new IndexedEvent(index, {"value": 42});
            let expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.timerangeAsUTCString()).to.equal(expected);
            expect(event.get("value")).to.equal(42);
            done();
        });
    });

    describe("TimeRangeEvent", function() {
        it("can create a TimeRangeEvent using a object", function(done) {
            //Pick one event
            let sampleEvent = outageList["outage_events"][0];

            //extract the begin and end times
            let beginTime = new Date(sampleEvent.start_time);
            let endTime = new Date(sampleEvent.end_time);
            var timerange = new TimeRange(beginTime, endTime);

            var event = new TimeRangeEvent(timerange, sampleEvent);

            var expected = '{"timerange":{"begin":"2015-04-22T03:30:00.000Z","end":"2015-04-22T13:00:00.000Z"},"data":{"external_ticket":"","start_time":"2015-04-22T03:30:00Z","completed":true,"end_time":"2015-04-22T13:00:00Z","organization":"Internet2 / Level 3","title":"STAR-CR5 < 100 ge 06519 > ANL  - Outage","type":"U","esnet_ticket":"ESNET-20150421-013","description":"At 13:33 pacific circuit 06519 went down."}}'

            expect(`${event}`).to.equal(expected);
            expect(event.begin().getTime()).to.equal(1429673400000);
            expect(event.end().getTime()).to.equal(1429707600000);
            expect(event.humanizeDuration()).to.equal("10 hours")
            expect(event.get("title")).to.equal("STAR-CR5 < 100 ge 06519 > ANL  - Outage");
            done();
        });
    });

    describe("IndexedEvent", function() {

    });
});