var moment = require("moment");
var expect = require("chai").expect;

var testEventString = '{"time":1409529600000,"data":{"value":42}}';
var testEventData = JSON.parse(testEventString);

describe("Events", function () {

    var {Event, IndexedEvent} = require("../../src/modules/event.js");
    var Index = require("../../src/modules/index.js");

    describe("Event creation", function () {

        it("can create an event using a object", function(done) {
            var event = new Event(testEventData);
            expect(event.toString()).to.equal(testEventString);
            done();
        });

        it("can create an indexed event using a string index and data", function(done) {
            var event = new IndexedEvent("1d-12355", {"value": 42});
            var expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.timerangeAsUTCString()).to.equal(expected);
            expect(event.get("value")).to.equal(42);
            done();
        });

        it("can create an indexed event using an existing Index and data", function(done) {
            var index = new Index("1d-12355");
            var event = new IndexedEvent(index, {"value": 42});
            var expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.timerangeAsUTCString()).to.equal(expected);
            expect(event.get("value")).to.equal(42);
            done();
        });
    });
});