/** @jsx React.DOM */

var moment = require("moment");
var expect = require("chai").expect;

describe("Series", function () {

    var Series = require("../../src/modules/series.js");

    describe("Event creation", function () {
        it("can create an series with a javascript array", function(done) {
            var data = {
                "name": "traffic",
                "columns": ["time", "value"],
                "points": [
                    [1400425947000, 52],
                    [1400425948000, 18],
                    [1400425949000, 26],
                    [1400425950000, 93],
                ]
            };
            var series = new Series(data);
            console.log("Series:", JSON.stringify(series));
            console.log("Event at 1:", series.at(1), JSON.stringify(series.at(1).data()), series.at(1).timestamp());

            expect(series.size()).to.equal(4);
            expect(JSON.stringify(series.at(1).data())).to.equal('{"value":18}');
            expect(series.at(1).timestamp().getTime()).to.equal(1400425948000);

            done();
        });

    });
});