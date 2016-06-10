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
/* eslint no-unused-vars: 0 */

import { expect } from "chai";

import Collection from "../../src/collection.js";
import Event from "../../src/event";

const eventList1 = [
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new Event(new Date("2015-04-22T03:32:00Z"), {in: 5, out: 6})
];

const unorderedEventList = [
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:32:00Z"), {in: 5, out: 6})
];

/**
 * Note the Collections are currently moslty tested through either
 * the pipeline code or the TimeSeries code.
 */
describe("Collections", () => {

    it("can create a Collection from an event list", done => {
        const collection = new Collection(eventList1);
        expect(collection).to.be.ok;
        done();
    });

    it("can compare a collection and a reference to a collection as being equal", done => {
        const collection = new Collection(eventList1);
        const refCollection = collection;
        expect(collection).to.equal(refCollection);
        done();
    });

    it("can use the equals() comparator to compare a series and a copy of the series as true", done => {
        const collection = new Collection(eventList1);
        const copy = new Collection(collection);
        expect(Collection.equal(collection, copy)).to.be.true;
        done();
    });

    it("can use the equals() comparator to compare a collection and a value equivalent collection as false", done => {
        const collection = new Collection(eventList1);
        const otherSeries = new Collection(eventList1);
        expect(Collection.equal(collection, otherSeries)).to.be.false;
        done();
    });

    it("can use the is() comparator to compare a collection and a value equivalent collection as true", done => {
        const collection = new Collection(eventList1);
        const otherSeries = new Collection(eventList1);
        expect(Collection.is(collection, otherSeries)).to.be.true;
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


    it("can sort the collection by time", done => {
        const collection = new Collection(unorderedEventList);
        const sortedCollection = collection.sortByTime();
        expect(sortedCollection.at(1).timestamp().getTime() >
            sortedCollection.at(0).timestamp().getTime()).to.be.true;
        done();
    });

    it("can determine if a collection is chronological", done => {
        const collection = new Collection(unorderedEventList);
        expect(collection.isChronological()).to.be.false;
        const sortedCollection = collection.sortByTime();
        expect(sortedCollection.isChronological()).to.be.true;
        done();
    });

});
