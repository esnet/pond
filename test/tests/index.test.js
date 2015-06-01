var moment = require('moment');
var expect = require('chai').expect;

describe("Indexes", function () {

    var Index = require("../../src/modules/index.js");

    describe("Index creation", function () {
        it('can create a daily index', function(done) {
            var index = new Index("1d-12355");
            var expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("a day");
            done();
        });
        it('can create a hourly index', function(done) {
            var index = new Index("1h-123554");
            var expected = "[Sun, 05 Feb 1984 02:00:00 GMT, Sun, 05 Feb 1984 03:00:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("an hour");
            done();
        });

        it('can create a 5 minute index', function(done) {
            var index = new Index("5m-4135541");
            var expected = "[Sat, 25 Apr 2009 12:25:00 GMT, Sat, 25 Apr 2009 12:30:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("5 minutes");
            done();
        });

        it('can create a 30 second index', function(done) {
            var index = new Index("30s-41135541");
            var expected = "[Sun, 08 Feb 2009 04:10:30 GMT, Sun, 08 Feb 2009 04:11:00 GMT]";
            expect(index.asTimerange().toUTCString()).to.equal(expected);
            expect(index.asTimerange().humanizeDuration()).to.equal("a few seconds");
            done();
        });
    });

});