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

/*
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

        const newTS = ts.fill(null, "zero", 3); // limit = 3

        expect(newTS.size()).to.equal(6);

        expect(newTS.at(0).get("direction.out")).to.equal(0);
        expect(newTS.at(2).get("direction.out")).to.equal(0);
        expect(newTS.at(1).get("direction.in")).to.equal(0);

        //
        // fill one column, limit to 4 in result set
        //
        
        const newTS2 = ts.fill("direction.in", "zero", 4); // limit = 4

        expect(newTS2.at(1).get("direction.in"), 0)
        expect(newTS2.at(3).get("direction.in"), 0)

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
                    {"in": {"tcp": 1, "udp": 3}, "out": {"tcp": 2, "udp": 3}}],
                [1400425948000,
                    {"in": {"tcp": 3, "udp": null}, "out": {"tcp": 4, "udp": 3}}],
                [1400425949000,
                    {"in": {"tcp": 5, "udp": null}, "out": {"tcp": null, "udp": 3}}],
                [1400425950000,
                    {"in": {"tcp": 7, "udp": null}, "out": {"tcp": null, "udp": 3}}],
                [1400425960000,
                    {"in": {"tcp": 9, "udp": 4}, "out": {"tcp": 6, "udp": 3}}],
                [1400425970000,
                    {"in": {"tcp": 11, "udp": 5}, "out": {"tcp": 8, "udp": 3}}]
            ]
        });

        const newTS = ts.fill();

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

        const newTS2 = ts.fill(["direction.out.tcp"]);

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
                [1400425947000, {'in': 1, 'out': null}],
                [1400425948000, {'in': null, 'out': null}],
                [1400425949000, {'in': null, 'out': null}],
                [1400425950000, {'in': 3, 'out': 8}],
                [1400425960000, {'in': null, 'out': null}],
                [1400425970000, {'in': null, 'out': 12}],
                [1400425980000, {'in': null, 'out': 13}],
                [1400425990000, {'in': 7, 'out': null}],
                [1400426000000, {'in': 8, 'out': null}],
                [1400426010000, {'in': 9, 'out': null}],
                [1400426020000, {'in': 10, 'out': null}]
            ]
        });

        //verify fill limit for zero fill
        const zeroTS = ts.fill(null, "zero", 2);

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
        const padTS = ts.fill(null, "pad", 2);

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

    //TODO
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
});
*/
