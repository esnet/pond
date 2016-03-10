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

import Pipeline from "../../src/pipeline.js";
import { Collection, UnboundedIn } from "../../src/pipelinein.js";
import { ConsoleOut, CollectionOut } from "../../src/pipelineout.js";
import { Event } from "../../src/event.js";

const eventList1 = [
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new Event(new Date("2015-04-22T03:32:00Z"), {in: 5, out: 6})
];

/*
const eventList2 = [
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new IndexedEvent("2015-04-22", {in: 5, out: 6})
];
*/

describe("Pipeline", () => {

    it("can create a Collection from an event list", done => {
        const collection = new Collection(eventList1);
        expect(collection).to.be.ok;
        done();
    });

    it("can use size() and at() to get to Collection items", done => {
        const collection = new Collection(eventList1);
        expect(collection.size()).to.equal(3);
        expect(Event.is(collection.at(0), eventList1[0])).to.be.true;
        expect(Event.is(collection.at(1), eventList1[1])).to.be.true;
        expect(Event.is(collection.at(2), eventList1[2])).to.be.true;
        done();
    });

    it("can loop (for .. of) over a Collection's events", done => {
        const collection = new Collection(eventList1);
        const events = [];
        for (const e of collection.events()) {
            events.push(e);
        }
        expect(events.length).to.equal(3);
        expect(Event.is(events[0], eventList1[0])).to.be.true;
        expect(Event.is(events[1], eventList1[1])).to.be.true;
        expect(Event.is(events[2], eventList1[2])).to.be.true;
        done();
    });

    it("can add an event and get a new Collection back", done => {
        const collection = new Collection(eventList1);
        const event = new Event(new Date("2015-04-22T03:32:00Z"), {in: 1, out: 2});
        const newCollection = collection.addEvent(event);
        expect(newCollection.size()).to.equal(4);
        done();
    });

    it("can transform process events with an offsetBy chain", done => {
        const events = eventList1;
        let out;

        Pipeline()
            .from(new Collection(events))
            .offsetBy(1, "in")
            .offsetBy(2)
            .to(new CollectionOut(c => out = c));

        expect(out.size()).to.equal(3);
        expect(out.at(0).get("in")).to.equal(4);
        expect(out.at(1).get("in")).to.equal(6);
        expect(out.at(2).get("in")).to.equal(8);
        done();
    });

    it("can transform process events with an offsetBy chain", done => {
        const events = eventList1;

        const pipeline = Pipeline()
            .from(new Collection(events))
            .offsetBy(1)
            .offsetBy(2)
            .to(new CollectionOut(out => {
                expect(out.size()).to.equal(3);
                expect(out.at(0).get("in")).to.equal(4);
                expect(out.at(1).get("in")).to.equal(6);
                expect(out.at(2).get("in")).to.equal(8);
            }));

        pipeline
            .offsetBy(3)
            .to(new CollectionOut(out => {
                expect(out.size()).to.equal(3);
                expect(out.at(0).get("in")).to.equal(7);
                expect(out.at(1).get("in")).to.equal(9);
                expect(out.at(2).get("in")).to.equal(11);
            }));

        done();
    });
   
    it("can create an unbounded source", done => {
        const events = eventList1;
        const source = new UnboundedIn();

        const collectedEvents = [];

        source.onEmit((e) => {
            collectedEvents.push(e);
        });

        source.start();
        source.addEvent(events[0]);
        source.addEvent(events[1]);
        source.stop();
        source.addEvent(events[2]);

        expect(collectedEvents.length).to.equal(2);

        done();
    });

    it("can stream events with adder", done => {
        const events = eventList1;
        
        const input = new UnboundedIn();
        Pipeline()
            .from(input)
            .offsetBy(1)
            .offsetBy(2)
            .to(new ConsoleOut());

        input.addEvent(events[0]);
        input.addEvent(events[1]);
        input.addEvent(events[2]);

        done();
    });

    it("can stream events with adder 2", done => {
        const events = eventList1;
        const input = new UnboundedIn();

        const pipeline = Pipeline()
            .from(input)
            .offsetBy(1)
            .offsetBy(2);

        pipeline
            .offsetBy(3)
            .to(new ConsoleOut());

        input.addEvent(events[0]);
        input.addEvent(events[1]);
        input.addEvent(events[2]);

        done();
    });
});
