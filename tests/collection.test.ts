declare const describe: any;
declare const it: any;
declare const expect: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

import Event from "../src/event";
import Time from "../src/time";
import Index from "../src/index";
import Collection from "../src/collection";

// Test collection
const t1 = new Time("2015-04-22T02:30:00Z");
const t2 = new Time("2015-04-22T01:30:00Z");
const t3 = new Time("2015-04-22T03:30:00Z");
const e1 = new Event(t1, { a: 8, b: 2 });
const e2 = new Event(t2, { a: 3, b: 1 });
const e3 = new Event(t3, { a: 5, b: 5 });
let test = new Collection<Time>();
test = test
    .addEvent(e1)
    .addEvent(e2)
    .addEvent(e3);

describe("Collection", () => {
    it("can make a collection", () => {
        const timestamp1 = new Time("2015-04-22T03:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");

        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: 4, b: 2 });

        let collection = new Collection<Time>()
            .addEvent(e1)
            .addEvent(e2);

        expect(collection.size()).toEqual(2);
        expect(collection.eventAt(0).get("a")).toEqual(5);
        expect(collection.eventAt(1).get("a")).toEqual(4);
    });

    it("can make a collection from another collection", () => {
        const timestamp1 = new Time("2015-04-22T03:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");

        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: 4, b: 2 });

        let collection = new Collection<Time>()
            .addEvent(e1)
            .addEvent(e2);

        let copy = new Collection(collection);

        expect(copy.size()).toEqual(2);
        expect(copy.eventAt(0).get("a")).toEqual(5);
        expect(copy.eventAt(1).get("a")).toEqual(4);
    });

    it("make a collection from OrderedMap", () => {
        const timestamp1 = new Time("2015-04-22T03:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");

        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: 4, b: 2 });
        const orderedMap = Immutable.OrderedMap<Time, Event<Time>>({
            timestamp1: e1,
            timestamp2: e2
        });
        let collection = new Collection<Time>(orderedMap);

        expect(collection.size()).toEqual(2);
        expect(collection.eventAt(0).get("a")).toEqual(5);
        expect(collection.eventAt(1).get("a")).toEqual(4);
    });

    it("can make a collection", () => {
        const timestamp1 = new Time("2015-04-22T03:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");
        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: 4, b: 2 });
        let collection = new Collection<Time>();
        collection = collection.addEvent(e1);
        collection = collection.addEvent(e2);

        const expected = "[{\"time\":1429673400000,\"data\":{\"a\":5,\"b\":6}},{\"time\":1429669800000,\"data\":{\"a\":4,\"b\":2}}]";
        expect(collection.toString()).toEqual(expected);
    });

    it("can add an event and de-dup", () => {
        const timestamp1 = new Time("2015-04-22T03:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");
        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: 4, b: 2 });
        const e3 = new Event(timestamp2, { a: 6, b: 3 });
        let collection = new Collection<Time>();
        collection = collection.addEvent(e1);
        collection = collection.addEvent(e2);
        collection = collection.addEvent(e3, e => {
            return new Event<Time>(
                timestamp1,
                { a: e3.get("a") + e.get("a") });
        });
        console.log(collection)
        expect(collection.size()).toEqual(2);
        expect(collection.eventAt(1).get("a")).toEqual(10);
    });

    it("can use setEvents to replace all events in the collection", () => {
        const timestamp1 = new Time("2015-04-22T03:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");

        const e0 = new Event(timestamp1, { a: 1, b: 2 });
        let collection = new Collection<Time>();
        collection = collection.addEvent(e0);
        expect(collection.size()).toEqual(1);

        // New events
        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: 4, b: 2 });
        const newEvents = Immutable.OrderedMap<Time, Event<Time>>({
            timestamp1: e1,
            timestamp2: e2
        });
        let collection2 = collection.setEvents(newEvents);

        expect(collection2.size()).toEqual(2);
        expect(collection2.eventAt(0).get("a")).toEqual(5);
        expect(collection2.eventAt(1).get("a")).toEqual(4);
    });

    it("can return the number of valid events", () => {
        const timestamp1 = new Time("2015-04-22T01:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");
        const timestamp3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: null, b: 2 });
        const e3 = new Event(timestamp3, { a: 4, b: 2 });

        let collection = new Collection<Time>();
        collection = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3);

        expect(collection.size()).toEqual(3);
        expect(collection.sizeValid("a")).toEqual(2);
    });

    it("can access events", () => {
        const timestamp1 = new Time("2015-04-22T01:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");
        const timestamp3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(timestamp1, { a: 1 });
        const e2 = new Event(timestamp2, { a: 2 });
        const e3 = new Event(timestamp3, { a: 3 });

        let collection = new Collection<Time>();
        collection = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3);

        // Using at()
        expect(collection.eventAt(1).get("a")).toEqual(2);

        // Using atKey()
        expect(collection.eventAtKey(timestamp2).get("a")).toEqual(2);
    });

    it("can iterate over the events", () => {
        const timestamp1 = new Time("2015-04-22T01:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");
        const timestamp3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(timestamp1, { a: 1 });
        const e2 = new Event(timestamp2, { a: 2 });
        const e3 = new Event(timestamp3, { a: 3 });

        let collection = new Collection<Time>();
        collection = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3);

        let sum = 0;
        collection.forEach(e => {
            sum = sum + e.get("a");
        });
        expect(sum).toEqual(6);
    });

    it("can map over the events", () => {
        const timestamp1 = new Time("2015-04-22T01:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");
        const timestamp3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(timestamp1, { a: 1 });
        const e2 = new Event(timestamp2, { a: 2 });
        const e3 = new Event(timestamp3, { a: 3 });

        let collection = new Collection<Time>();
        collection = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3);

        let i = 1;
        const remapped = collection.map(e => {
            return new Event(e.key(), { a: 3 * i++ });
        });
        expect(remapped.eventAt(0).get("a")).toEqual(3);
        expect(remapped.eventAt(1).get("a")).toEqual(6);
        expect(remapped.eventAt(2).get("a")).toEqual(9);
    });

    it("can sort by time", () => {
        const timestamp1 = new Time("2015-04-22T02:30:00Z");
        const timestamp2 = new Time("2015-04-22T01:30:00Z");
        const timestamp3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(timestamp1, { a: 1 });
        const e2 = new Event(timestamp2, { a: 2 });
        const e3 = new Event(timestamp3, { a: 3 });

        let collection = new Collection<Time>();
        const sorted = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3)
            .sortByTime()

        expect(sorted.eventAt(0).get("a")).toEqual(2);
        expect(sorted.eventAt(1).get("a")).toEqual(1);
        expect(sorted.eventAt(2).get("a")).toEqual(3);
    });

    it("can sort by value", () => {
        const timestamp1 = new Time("2015-04-22T02:30:00Z");
        const timestamp2 = new Time("2015-04-22T01:30:00Z");
        const timestamp3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(timestamp1, { a: 8 });
        const e2 = new Event(timestamp2, { a: 3 });
        const e3 = new Event(timestamp3, { a: 5 });

        let collection = new Collection<Time>();
        const sorted = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3)
            .sort("a")

        expect(sorted.eventAt(0).get("a")).toEqual(3);
        expect(sorted.eventAt(1).get("a")).toEqual(5);
        expect(sorted.eventAt(2).get("a")).toEqual(8);
    });

    it("can return the timerange covered by the collection", () => {
        const t1 = new Time("2015-04-22T02:30:00Z");
        const t2 = new Time("2015-04-22T01:30:00Z");
        const t3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(t1, { a: 8 });
        const e2 = new Event(t2, { a: 3 });
        const e3 = new Event(t3, { a: 5 });

        let collection = new Collection<Time>();
        collection = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3);

        const tr = collection.timerange();
        expect(tr.duration()).toEqual(7200000);
        expect(tr.begin()).toEqual(t2.timestamp());
        expect(tr.end()).toEqual(t3.timestamp())
    });

    it("can return the first and last events", () => {
        const t1 = new Time("2015-04-22T02:30:00Z");
        const t2 = new Time("2015-04-22T01:30:00Z");
        const t3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(t1, { a: 8 });
        const e2 = new Event(t2, { a: 3 });
        const e3 = new Event(t3, { a: 5 });

        let collection = new Collection<Time>();
        collection = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3);

        console.log("collection", collection.firstEvent())

        expect(collection.firstEvent().get("a")).toEqual(8);
        expect(collection.lastEvent().get("a")).toEqual(5);
    });


    it("can filter the events", () => {
        const t1 = new Time("2015-04-22T02:30:00Z");
        const t2 = new Time("2015-04-22T01:30:00Z");
        const t3 = new Time("2015-04-22T03:30:00Z");

        const e1 = new Event(t1, { a: 8 });
        const e2 = new Event(t2, { a: 3 });
        const e3 = new Event(t3, { a: 5 });

        let collection = new Collection<Time>();
        collection = collection
            .addEvent(e1)
            .addEvent(e2)
            .addEvent(e3);
        expect(collection.filter(e => e.get("a") < 8).size()).toEqual(2);

    });

    // Event(t1, { a: 8, b: 2 });
    // Event(t2, { a: 3, b: 1 });
    // Event(t3, { a: 5, b: 5 });

    it("can find the first events", () => {
        expect(test.first("a")).toEqual(8);
        expect(test.first(["a", "b"])).toEqual({ a: 8, b: 2 });
    });

    it("can find the last events", () => {
        expect(test.last("a")).toEqual(5);
        expect(test.last(["a", "b"])).toEqual({ a: 5, b: 5 });
    });

    it("can sum events", () => {
        expect(test.sum("a")).toEqual(16);
        expect(test.sum(["a"])).toEqual({ a: 16 });
        expect(test.sum(["a", "b"])).toEqual({ a: 16, b: 8 });
    });

    it("can average events", () => {
        expect(test.avg("a")).toEqual(5.333333333333333);
        expect(test.avg(["a"])).toEqual({ a: 5.333333333333333 });
        expect(test.avg(["a", "b"])).toEqual({ a: 5.333333333333333, b: 2.6666666666666665 });
    });

    it("can find max events", () => {
        expect(test.max("a")).toEqual(8);
        expect(test.max(["a"])).toEqual({ a: 8 });
        expect(test.max(["a", "b"])).toEqual({ a: 8, b: 5 });
    });

    it("can find min events", () => {
        expect(test.min("a")).toEqual(3);
        expect(test.min(["a"])).toEqual({ a: 3 });
        expect(test.min(["a", "b"])).toEqual({ a: 3, b: 1 });
    });
});
