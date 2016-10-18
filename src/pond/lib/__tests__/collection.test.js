/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import Collection from "../collection";
import Event from "../event";

const EVENT_LIST = [
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new Event(new Date("2015-04-22T03:32:00Z"), {in: 5, out: 6})
];

const UNORDERED_EVENT_LIST = [
    new Event(new Date("2015-04-22T03:31:00Z"), {in: 3, out: 4}),
    new Event(new Date("2015-04-22T03:30:00Z"), {in: 1, out: 2}),
    new Event(new Date("2015-04-22T03:32:00Z"), {in: 5, out: 6})
];

/**
 * Note the Collections are currently moslty tested through either
 * the pipeline code or the TimeSeries code.
 */

it("can create a Collection from an event list", () => {
    const collection = new Collection(EVENT_LIST);
    expect(collection).toBeDefined();
});

it("can compare a collection and a reference to a collection as being equal", () => {
    const collection = new Collection(EVENT_LIST);
    const refCollection = collection;
    expect(collection).toBe(refCollection);
});

it("can use the equals() comparator to compare a series and a copy of the series as true", () => {
    const collection = new Collection(EVENT_LIST);
    const copy = new Collection(collection);
    expect(Collection.equal(collection, copy)).toBeTruthy();
});

it("can use the equals() comparator to compare a collection and a value equivalent collection as false", () => {
    const collection = new Collection(EVENT_LIST);
    const otherSeries = new Collection(EVENT_LIST);
    expect(Collection.equal(collection, otherSeries)).toBeFalsy();
});

it("can use the is() comparator to compare a Collection and a value equivalent Collection as true", () => {
    const collection = new Collection(EVENT_LIST);
    const otherSeries = new Collection(EVENT_LIST);
    expect(Collection.is(collection, otherSeries)).toBeTruthy();
});

it("can use size() and at() to get to Collection items", () => {
    const collection = new Collection(EVENT_LIST);
    expect(collection.size()).toBe(3);
    expect(Event.is(collection.at(0), EVENT_LIST[0])).toBeTruthy();
    expect(Event.is(collection.at(1), EVENT_LIST[1])).toBeTruthy();
    expect(Event.is(collection.at(2), EVENT_LIST[2])).toBeTruthy();
});

//
// Collection iteration
//

it("can loop (for .. of) over a Collection's events", () => {
    const collection = new Collection(EVENT_LIST);
    const events = [];
    for (const e of collection.events()) {
        events.push(e);
    }
    expect(events.length).toBe(3);
    expect(Event.is(events[0], EVENT_LIST[0])).toBeTruthy();
    expect(Event.is(events[1], EVENT_LIST[1])).toBeTruthy();
    expect(Event.is(events[2], EVENT_LIST[2])).toBeTruthy();
});

//
// Event list mutation
//

it("can add an event and get a new Collection back", () => {
    const collection = new Collection(EVENT_LIST);
    const event = new Event(new Date("2015-04-22T03:32:00Z"), {in: 1, out: 2});
    const newCollection = collection.addEvent(event);
    expect(newCollection.size()).toBe(4);
});

//
// Tests functionality to check order of Collection items
//

it("can sort the collection by time", () => {
    const collection = new Collection(UNORDERED_EVENT_LIST);
    const sortedCollection = collection.sortByTime();
    expect(sortedCollection.at(1).timestamp().getTime() >
        sortedCollection.at(0).timestamp().getTime()).toBeTruthy();
});

it("can determine if a collection is chronological", () => {
    const collection = new Collection(UNORDERED_EVENT_LIST);
    expect(collection.isChronological()).toBeFalsy();
    const sortedCollection = collection.sortByTime();
    expect(sortedCollection.isChronological()).toBeTruthy();
});

it("can correctly use atTime()", () =>{
    const t = new Date(1476803711641);
    let collection = new Collection();

    expect(collection.size()).toEqual(0);
    collection = collection.addEvent(new Event(t, 2));

    expect(collection.size()).toEqual(1);
    expect(collection.at(0).value()).toEqual(2);

    const bisect = collection.bisect(t);
    expect(bisect).toEqual(0);
    expect(collection.at(bisect).value()).toEqual(2);

    expect(collection.atTime(t).value()).toEqual(2);

    // => {"name":"test","utc":true,"columns":["time","value"],"points":[[1465084800000,2]]}
    //console.log("time1 index " + timeseries.bisect(time1));
    // => 0
    //console.log("index 0 " + timeseries.at(0));
    // => {"time":1465084800000,"data":{"value":2}}
    //console.log("using timeAt " + timeseries.atTime(time1));
    // => undefined :(
})