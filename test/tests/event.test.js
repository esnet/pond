/** @jsx React.DOM */

var moment = require("moment");
var expect = require("chai").expect;

describe("Events", function () {

    var {IndexedEvent} = require("../../src/modules/event.js");
    var Index = require("../../src/modules/index.js");

    describe("Event creation", function () {
        it("can create an indexed event using a string", function(done) {
            var event = new IndexedEvent("1d-12355", {"value": 42});
            var expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.range().toUTCString()).to.equal(expected);
            expect(event.data().get("value")).to.equal(42);
            done();
        });

        it("can create an indexed event using an existing Index", function(done) {
            var index = new Index("1d-12355");
            var event = new IndexedEvent(index, {"value": 42});
            var expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(event.range().toUTCString()).to.equal(expected);
            expect(event.data().get("value")).to.equal(42);
            done();
        });
    });
});