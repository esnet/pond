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

import { expect } from "chai";

import Event from "../../src/event";
import TimeSeries from "../../src/series.js";
import Collection from "../../src/collection.js";
import { Pipeline } from "../../src/pipeline.js";
import UnboundedIn from "../../src/pipeline-in-unbounded.js";
import CollectionOut from "../../src/pipeline-out-collection.js";

const EVENT_LIST = [
    new Event(1429673400000, {in: 1, out: 2}),
    new Event(1429673460000, {in: 3, out: 4}),
    new Event(1429673520000, {in: 5, out: 6})
];

const TICKET_RANGE = {
    name: "outages",
    columns: ["timerange", "title", "esnet_ticket"],
    points: [
        [[1429673400000, 1429707600000], "BOOM", "ESNET-20080101-001"],
        [[1429673400000, 1429707600000], "BAM!", "ESNET-20080101-002"]
    ]
};

const AVAILABILITY_DATA = {
    name: "availability",
    columns: ["index", "uptime"],
    points: [
        ["2014-07", "100%"],
        ["2014-08", "88%"],
        ["2014-09", "95%"],
        ["2014-10", "99%"],
        ["2014-11", "91%"],
        ["2014-12", "99%"],
        ["2015-01", "100%"],
        ["2015-02", "92%"],
        ["2015-03", "99%"],
        ["2015-04", "87%"],
        ["2015-05", "92%"],
        ["2015-06", "100%"]
    ]
};

describe("Renaming columns of a TimeSeries", () => {

    /**
     * A set of tests for the second gen methods to manipulate timeseries
     * and events.
     */
    
    it("can rename columns on an Event series", done => {
        const name = "collection";
        const collection = new Collection(EVENT_LIST);
        const ts = new TimeSeries({name, collection});
        const renamed = ts.renameColumns({in: "new_in", out: "new_out"});

        expect(renamed.at(0).get("new_in")).to.equal(ts.at(0).get("in"));
        expect(renamed.at(0).get("new_out")).to.equal(ts.at(0).get("out"));

        expect(renamed.at(1).get("new_in")).to.equal(ts.at(1).get("in"));
        expect(renamed.at(1).get("new_out")).to.equal(ts.at(1).get("out"));

        expect(renamed.at(0).timestamp().getTime()).to.equal(ts.at(0).timestamp().getTime());
        expect(renamed.at(1).timestamp().getTime()).to.equal(ts.at(1).timestamp().getTime());

        done();
    });
   
    it("can rename a columns on a TimeRangeEvent series", done => {

        const ts = new TimeSeries(TICKET_RANGE);
        const renamed = ts.renameColumns({title: "event", esnet_ticket: "ticket"});

        expect(renamed.at(0).get("event")).to.equal(ts.at(0).get("title"));
        expect(renamed.at(0).get("ticket")).to.equal(ts.at(0).get("esnet_ticket"));

        expect(renamed.at(1).get("event")).to.equal(ts.at(1).get("title"));
        expect(renamed.at(1).get("ticket")).to.equal(ts.at(1).get("esnet_ticket"));

        expect(renamed.at(0).timestamp().getTime()).to.equal(ts.at(0).timestamp().getTime());
        expect(renamed.at(1).timestamp().getTime()).to.equal(ts.at(1).timestamp().getTime());

        done();
    });

    it("can rename a columns on a IndexedEvent series", done => {

        const ts = new TimeSeries(AVAILABILITY_DATA);
        const renamed = ts.renameColumns({uptime: "available"});

        expect(renamed.at(0).get("available")).to.equal(ts.at(0).get("uptime"));
        expect(renamed.at(2).get("available")).to.equal(ts.at(2).get("uptime"));
        expect(renamed.at(4).get("available")).to.equal(ts.at(4).get("uptime"));
        expect(renamed.at(6).get("available")).to.equal(ts.at(6).get("uptime"));

        expect(renamed.at(0).timestamp()).to.equal(ts.at(0).timestamp());
        expect(renamed.at(1).timestamp()).to.equal(ts.at(1).timestamp());
        expect(renamed.at(2).timestamp()).to.equal(ts.at(2).timestamp());

        done();
    });

});


describe("Filling missing values in a TimeSeries", () => {

    it("can use the filler to fill missing values with zero", done => {

        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "direction"],
            points: [
                [1400425947000, {in: 1, out: null}],
                [1400425948000, {in: null, out: 4}],
                [1400425949000, {in: 5, out: null}],
                [1400425950000, {in: null, out: 8}],
                [1400425960000, {in: 9, out: null}],
                [1400425970000, {in: null, out: 12}]
            ]
        });

        //
        // fill all columns, limit to 3
        //

        const newTS = ts.fill({
            fieldSpec: ["direction.in", "direction.out"],
            method: "zero",
            limit: 3
        });

        expect(newTS.size()).to.equal(6);

        expect(newTS.at(0).get("direction.out")).to.equal(0);
        expect(newTS.at(2).get("direction.out")).to.equal(0);
        expect(newTS.at(1).get("direction.in")).to.equal(0);

        //
        // fill one column, limit to 4 in result set
        //
        
        const newTS2 = ts.fill({fieldSpec: "direction.in", method: "zero", limit: 4});

        expect(newTS2.at(1).get("direction.in"), 0);
        expect(newTS2.at(3).get("direction.in"), 0);

        expect(newTS2.at(0).get("direction.out")).to.be.null;
        expect(newTS2.at(2).get("direction.out")).to.be.null;
       
        done();
    });

    it("can use the filler on a more complex example with nested paths", done => {

        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "direction"],
            points: [
                [1400425947000,
                    {in: {tcp: 1, udp: 3}, out: {tcp: 2, udp: 3}}],
                [1400425948000,
                    {in: {tcp: 3, udp: null}, out: {tcp: 4, udp: 3}}],
                [1400425949000,
                    {in: {tcp: 5, udp: null}, out: {tcp: null, udp: 3}}],
                [1400425950000,
                    {in: {tcp: 7, udp: null}, out: {tcp: null, udp: 3}}],
                [1400425960000,
                    {in: {tcp: 9, udp: 4}, out: {tcp: 6, udp: 3}}],
                [1400425970000,
                    {in: {tcp: 11, udp: 5}, out: {tcp: 8, udp: 3}}]
            ]
        });

        const newTS = ts.fill({fieldSpec: ["direction.out.tcp", "direction.in.udp"]});

        expect(newTS.at(0).get("direction.in.udp")).to.equal(3);
        expect(newTS.at(1).get("direction.in.udp")).to.equal(0);  // fill
        expect(newTS.at(2).get("direction.in.udp")).to.equal(0);  // fill
        expect(newTS.at(3).get("direction.in.udp")).to.equal(0);  // fill
        expect(newTS.at(4).get("direction.in.udp")).to.equal(4);
        expect(newTS.at(5).get("direction.in.udp")).to.equal(5);

        expect(newTS.at(0).get("direction.out.tcp")).to.equal(2);
        expect(newTS.at(1).get("direction.out.tcp")).to.equal(4);
        expect(newTS.at(2).get("direction.out.tcp")).to.equal(0);  // fill
        expect(newTS.at(3).get("direction.out.tcp")).to.equal(0);  // fill
        expect(newTS.at(4).get("direction.out.tcp")).to.equal(6);
        expect(newTS.at(5).get("direction.out.tcp")).to.equal(8);

        //
        // do it again, but only fill the out.tcp
        //

        const newTS2 = ts.fill({fieldSpec: ["direction.out.tcp"]});

        expect(newTS2.at(0).get("direction.out.tcp")).to.equal(2);
        expect(newTS2.at(1).get("direction.out.tcp")).to.equal(4);
        expect(newTS2.at(2).get("direction.out.tcp")).to.equal(0); // fill
        expect(newTS2.at(3).get("direction.out.tcp")).to.equal(0); // fill
        expect(newTS2.at(4).get("direction.out.tcp")).to.equal(6);
        expect(newTS2.at(5).get("direction.out.tcp")).to.equal(8);

        expect(newTS2.at(0).get("direction.in.udp")).to.equal(3);
        expect(newTS2.at(1).get("direction.in.udp")).to.be.null;   // no fill
        expect(newTS2.at(2).get("direction.in.udp")).to.be.null;   // no fill
        expect(newTS2.at(3).get("direction.in.udp")).to.be.null;   // no fill
        expect(newTS2.at(4).get("direction.in.udp")).to.equal(4);
        expect(newTS2.at(5).get("direction.in.udp")).to.equal(5);

        done();
    });
   
    it("can limit pad and zero filling", done => {

        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "direction"],
            points: [
                [1400425947000, {in: 1, out: null}],
                [1400425948000, {in: null, out: null}],
                [1400425949000, {in: null, out: null}],
                [1400425950000, {in: 3, out: 8}],
                [1400425960000, {in: null, out: null}],
                [1400425970000, {in: null, out: 12}],
                [1400425980000, {in: null, out: 13}],
                [1400425990000, {in: 7, out: null}],
                [1400426000000, {in: 8, out: null}],
                [1400426010000, {in: 9, out: null}],
                [1400426020000, {in: 10, out: null}]
            ]
        });

        //verify fill limit for zero fill
        const zeroTS = ts.fill({
            fieldSpec: ["direction.in", "direction.out"],
            method: "zero",
            limit: 2
        });

        expect(zeroTS.at(0).get("direction.in")).to.equal(1);
        expect(zeroTS.at(1).get("direction.in")).to.equal(0);    // fill
        expect(zeroTS.at(2).get("direction.in")).to.equal(0);    // fill
        expect(zeroTS.at(3).get("direction.in")).to.equal(3);
        expect(zeroTS.at(4).get("direction.in")).to.equal(0);    // fill
        expect(zeroTS.at(5).get("direction.in")).to.equal(0);    // fill
        expect(zeroTS.at(6).get("direction.in")).to.be.null;     // over limit skip
        expect(zeroTS.at(7).get("direction.in")).to.equal(7);
        expect(zeroTS.at(8).get("direction.in")).to.equal(8);
        expect(zeroTS.at(9).get("direction.in")).to.equal(9);
        expect(zeroTS.at(10).get("direction.in")).to.equal(10);

        expect(zeroTS.at(0).get("direction.out")).to.equal(0);   // fill
        expect(zeroTS.at(1).get("direction.out")).to.equal(0);   // fill
        expect(zeroTS.at(2).get("direction.out")).to.be.null;    // over limit skip
        expect(zeroTS.at(3).get("direction.out")).to.equal(8);
        expect(zeroTS.at(4).get("direction.out")).to.equal(0);   // fill
        expect(zeroTS.at(5).get("direction.out")).to.equal(12);
        expect(zeroTS.at(6).get("direction.out")).to.equal(13);
        expect(zeroTS.at(7).get("direction.out")).to.equal(0);   // fill
        expect(zeroTS.at(8).get("direction.out")).to.equal(0);   // fill
        expect(zeroTS.at(9).get("direction.out")).to.be.null;    // over limit skip
        expect(zeroTS.at(10).get("direction.out")).to.be.null;   // over limit skip

        // verify fill limit for pad fill
        const padTS = ts.fill({
            fieldSpec: ["direction.in", "direction.out"],
            method: "pad",
            limit: 2
        });

        expect(padTS.at(0).get("direction.in")).to.equal(1);
        expect(padTS.at(1).get("direction.in")).to.equal(1);     // fill
        expect(padTS.at(2).get("direction.in")).to.equal(1);     // fill
        expect(padTS.at(3).get("direction.in")).to.equal(3);
        expect(padTS.at(4).get("direction.in")).to.equal(3);     // fill
        expect(padTS.at(5).get("direction.in")).to.equal(3);     // fill
        expect(padTS.at(6).get("direction.in")).to.be.null;      // over limit skip
        expect(padTS.at(7).get("direction.in")).to.equal(7);
        expect(padTS.at(8).get("direction.in")).to.equal(8);
        expect(padTS.at(9).get("direction.in")).to.equal(9);
        expect(padTS.at(10).get("direction.in")).to.equal(10);

        expect(padTS.at(0).get("direction.out")).to.be.null;      // no fill start
        expect(padTS.at(1).get("direction.out")).to.be.null;      // no fill start
        expect(padTS.at(2).get("direction.out")).to.be.null;      // no fill start
        expect(padTS.at(3).get("direction.out")).to.equal(8);
        expect(padTS.at(4).get("direction.out")).to.equal(8);     // fill
        expect(padTS.at(5).get("direction.out")).to.equal(12);
        expect(padTS.at(6).get("direction.out")).to.equal(13);
        expect(padTS.at(7).get("direction.out")).to.equal(13);    // fill
        expect(padTS.at(8).get("direction.out")).to.equal(13);    // fill
        expect(padTS.at(9).get("direction.out")).to.be.null;      // over limit skip
        expect(padTS.at(10).get("direction.out")).to.be.null;     // over limit skip

        done();
    });
   
    it("can do linear interpolation fill (test_linear)", done => {

        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "direction"],
            points: [
                [1400425947000, {in: 1, out: 2}],
                [1400425948000, {in: null, out: null}],
                [1400425949000, {in: null, out: null}],
                [1400425950000, {in: 3, out: null}],
                [1400425960000, {in: null, out: null}],
                [1400425970000, {in: 5, out: 12}],
                [1400425980000, {in: 6, out: 13}]
            ]
        });

        const result = ts.fill({
            fieldSpec: ["direction.in", "direction.out"],
            method: "linear"
        });

        expect(result.size()).to.equal(7);

        expect(result.at(0).get("direction.in")).to.equal(1);
        expect(result.at(1).get("direction.in")).to.equal(1.6666666666666665);     // filled
        expect(result.at(2).get("direction.in")).to.equal(2.333333333333333);     // filled
        expect(result.at(3).get("direction.in")).to.equal(3);
        expect(result.at(4).get("direction.in")).to.equal(4.0);     // filled
        expect(result.at(5).get("direction.in")).to.equal(5);

        expect(result.at(0).get("direction.out")).to.equal(2);
        expect(result.at(1).get("direction.out")).to.equal(2.4347826086956523);    // filled
        expect(result.at(2).get("direction.out")).to.equal(2.869565217391304);    // filled
        expect(result.at(3).get("direction.out")).to.equal(3.3043478260869565);  // filled
        expect(result.at(4).get("direction.out")).to.equal(7.652173913043478); // filled
        expect(result.at(5).get("direction.out")).to.equal(12);

        done();
    });
   
    it("can do linear interpolation fill with a pipeline (test_linear_list)", done => {

        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "direction"],
            points: [
                [1400425947000, {in: 1, out: 2}],
                [1400425948000, {in: null, out: null}],
                [1400425949000, {in: null, out: null}],
                [1400425950000, {in: 3, out: null}],
                [1400425960000, {in: null, out: null}],
                [1400425970000, {in: 5, out: 12}],
                [1400425980000, {in: 6, out: 13}]
            ]
        });

        const result = Pipeline()
            .from(ts)
            .fill({fieldSpec: "direction.in", method: "linear"})
            .fill({fieldSpec: "direction.out", method: "linear"})
            .toEventList();

        expect(result.length).to.equal(7);

        expect(result[0].get("direction.in")).to.equal(1);
        expect(result[1].get("direction.in")).to.equal(1.6666666666666665);     // filled
        expect(result[2].get("direction.in")).to.equal(2.333333333333333);     // filled
        expect(result[3].get("direction.in")).to.equal(3);
        expect(result[4].get("direction.in")).to.equal(4.0);     // filled
        expect(result[5].get("direction.in")).to.equal(5);

        expect(result[0].get("direction.out")).to.equal(2);
        expect(result[1].get("direction.out")).to.equal(2.4347826086956523);    // filled
        expect(result[2].get("direction.out")).to.equal(2.869565217391304);    // filled
        expect(result[3].get("direction.out")).to.equal(3.3043478260869565);  // filled
        expect(result[4].get("direction.out")).to.equal(7.652173913043478); // filled
        expect(result[5].get("direction.out")).to.equal(12);

        done();
    });

    it("can do assymetric linear interpolation (test_assymetric_linear_fill)", done => {

        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "direction"],
            points: [
                [1400425947000, {in: 1, out: null}],
                [1400425948000, {in: null, out: null}],
                [1400425949000, {in: null, out: null}],
                [1400425950000, {in: 3, out: 8}],
                [1400425960000, {in: null, out: null}],
                [1400425970000, {in: 5, out: 12}],
                [1400425980000, {in: 6, out: 13}]
            ]
        });

        const result = ts.fill({
            fieldSpec: ["direction.in", "direction.out"],
            method: "linear"
        });

        expect(result.at(0).get("direction.in")).to.equal(1);
        expect(result.at(1).get("direction.in")).to.equal(1.6666666666666665); // filled
        expect(result.at(2).get("direction.in")).to.equal(2.333333333333333);  // filled
        expect(result.at(3).get("direction.in")).to.equal(3);
        expect(result.at(4).get("direction.in")).to.equal(4.0);                // filled
        expect(result.at(5).get("direction.in")).to.equal(5);

        expect(result.at(0).get("direction.out")).to.be.null;
        expect(result.at(1).get("direction.out")).to.be.null;
        expect(result.at(2).get("direction.out")).to.be.null;
        expect(result.at(3).get("direction.out")).to.equal(8);
        expect(result.at(4).get("direction.out")).to.equal(10);               // filled
        expect(result.at(5).get("direction.out")).to.equal(12);

        done();
    });

    it("can do streaming fill (test_linear_stream)", done => {

        const events = [
            new Event(1400425947000, 1),
            new Event(1400425948000, 2),
            new Event(1400425949000, {value: null}),
            new Event(1400425950000, {value: null}),
            new Event(1400425951000, {value: null}),
            new Event(1400425952000, 5),
            new Event(1400425953000, 6),
            new Event(1400425954000, 7)
        ];

        const stream = new UnboundedIn();

        Pipeline()
            .from(stream)
            .emitOn("flush")
            .fill({method: "linear", fieldSpec: "value"})
            .to(CollectionOut, c => {
                expect(c.at(0).value()).to.equal(1);
                expect(c.at(1).value()).to.equal(2);
                expect(c.at(2).value()).to.equal(2.75); // fill
                expect(c.at(3).value()).to.equal(3.5);  // fill
                expect(c.at(4).value()).to.equal(4.25); // fill
                expect(c.at(5).value()).to.equal(5);
                expect(c.at(6).value()).to.equal(6);
                expect(c.at(7).value()).to.equal(7);
                done();
            });

        events.forEach(e => stream.addEvent(e));
        stream.stop();
    });

    it("can do streaming fill with limit (test_linear_stream_limit/1)", done => {

        let results;

        const events = [
            new Event(1400425947000, 1),
            new Event(1400425948000, 2),
            new Event(1400425949000, {value: null}),
            new Event(1400425950000, 3),
            new Event(1400425951000, {value: null}),
            new Event(1400425952000, {value: null}),
            new Event(1400425953000, {value: null}),
            new Event(1400425954000, {value: null})
        ];

        const stream = new UnboundedIn();

        Pipeline()
            .from(stream)
            .fill({method: "linear", fieldSpec: "value"})
            .to(CollectionOut, collection => {
                results = collection;
            });

        events.forEach(e => stream.addEvent(e));
        // should be blocked after 4 events waiting for a good next value
        expect(results.size()).to.equal(4);
        // stop the stream
        stream.stop();
        // should flush the last events anyway
        expect(results.size()).to.equal(8);

        done();
    });

    it("can do streaming fill with limit (test_linear_stream_limit/2)", done => {

        let results;

        const events = [
            new Event(1400425947000, 1),
            new Event(1400425948000, 2),
            new Event(1400425949000, {value: null}),
            new Event(1400425950000, 3),
            new Event(1400425951000, {value: null}),
            new Event(1400425952000, {value: null}),
            new Event(1400425953000, {value: null}),
            new Event(1400425954000, {value: null})
        ];

        const stream = new UnboundedIn();

        Pipeline()
            .from(stream)
            .fill({method: "linear", fieldSpec: "value", limit: 3})
            .to(CollectionOut, collection => {
                results = collection;
            });

        events.forEach(e => stream.addEvent(e));

        // Because of the limit, all events should be captured
        // in the collection
        expect(results.size()).to.equal(8);

        done();
    });

    //TODO
    /*
    it("can throw on bad args", done => {
        const ts = new TimeSeries({
            name: "traffic",
            columns: ["time", "direction"],
            points: [
                [1400425947000, {"in": 1, "out": null, "drop": null}],
                [1400425948000, {"in": null, "out": 4, "drop": null}],
                [1400425949000, {"in": null, "out": null, "drop": 13}],
                [1400425950000, {"in": null, "out": null, "drop": 14}],
                [1400425960000, {"in": 9, "out": 8, "drop": null}],
                [1400425970000, {"in": 11, "out": 10, "drop": 16}]
            ]
        });

        //expect(Event.sum.bind(this, events)).to.throw("sum() expects all events to have the same timestamp");

        done();
    });
    */
});

