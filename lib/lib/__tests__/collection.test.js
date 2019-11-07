"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _collection = _interopRequireDefault(require("../collection"));

var _event = _interopRequireDefault(require("../event"));

var _timeevent = _interopRequireDefault(require("../timeevent"));

/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */
var EVENT_LIST = [new _timeevent.default(new Date("2015-04-22T03:30:00Z"), {
  in: 1,
  out: 2
}), new _timeevent.default(new Date("2015-04-22T03:31:00Z"), {
  in: 3,
  out: 4
}), new _timeevent.default(new Date("2015-04-22T03:32:00Z"), {
  in: 5,
  out: 6
})];
var UNORDERED_EVENT_LIST = [new _timeevent.default(new Date("2015-04-22T03:31:00Z"), {
  in: 3,
  out: 4
}), new _timeevent.default(new Date("2015-04-22T03:30:00Z"), {
  in: 1,
  out: 2
}), new _timeevent.default(new Date("2015-04-22T03:32:00Z"), {
  in: 5,
  out: 6
})];
var EVENT_LIST_DUP = [new _timeevent.default(new Date("2015-04-22T03:30:00Z"), {
  in: 1,
  out: 2
}), new _timeevent.default(new Date("2015-04-22T03:31:00Z"), {
  in: 3,
  out: 4
}), new _timeevent.default(new Date("2015-04-22T03:31:00Z"), {
  in: 4,
  out: 5
}), new _timeevent.default(new Date("2015-04-22T03:32:00Z"), {
  in: 5,
  out: 6
})];
/**
 * Note the Collections are currently moslty tested through either
 * the pipeline code or the TimeSeries code.
 */

it("can create a Collection from an event list", () => {
  var collection = new _collection.default(EVENT_LIST);
  expect(collection).toBeDefined();
});
it("can compare a collection and a reference to a collection as being equal", () => {
  var collection = new _collection.default(EVENT_LIST);
  var refCollection = collection;
  expect(collection).toBe(refCollection);
});
it("can use the equals() comparator to compare a series and a copy of the series as true", () => {
  var collection = new _collection.default(EVENT_LIST);
  var copy = new _collection.default(collection);
  expect(_collection.default.equal(collection, copy)).toBeTruthy();
});
it("can use the equals() comparator to compare a collection and a value equivalent collection as false", () => {
  var collection = new _collection.default(EVENT_LIST);
  var otherSeries = new _collection.default(EVENT_LIST);
  expect(_collection.default.equal(collection, otherSeries)).toBeFalsy();
});
it("can use the is() comparator to compare a Collection and a value equivalent Collection as true", () => {
  var collection = new _collection.default(EVENT_LIST);
  var otherSeries = new _collection.default(EVENT_LIST);
  expect(_collection.default.is(collection, otherSeries)).toBeTruthy();
});
it("can use size() and at() to get to Collection items", () => {
  var collection = new _collection.default(EVENT_LIST);
  expect(collection.size()).toBe(3);
  expect(_event.default.is(collection.at(0), EVENT_LIST[0])).toBeTruthy();
  expect(_event.default.is(collection.at(1), EVENT_LIST[1])).toBeTruthy();
  expect(_event.default.is(collection.at(2), EVENT_LIST[2])).toBeTruthy();
}); //
// Collection iteration
//

it("can loop (for .. of) over a Collection's events", () => {
  var collection = new _collection.default(EVENT_LIST);
  var events = [];

  for (var e of collection.events()) {
    events.push(e);
  }

  expect(events.length).toBe(3);
  expect(_event.default.is(events[0], EVENT_LIST[0])).toBeTruthy();
  expect(_event.default.is(events[1], EVENT_LIST[1])).toBeTruthy();
  expect(_event.default.is(events[2], EVENT_LIST[2])).toBeTruthy();
}); //
// Event list mutation
//

it("can add an event and get a new Collection back", () => {
  var collection = new _collection.default(EVENT_LIST);
  var event = new _timeevent.default(new Date("2015-04-22T03:32:00Z"), {
    in: 1,
    out: 2
  });
  var newCollection = collection.addEvent(event);
  expect(newCollection.size()).toBe(4);
}); //
// Tests functionality to check order of Collection items
//

it("can sort the collection by time", () => {
  var collection = new _collection.default(UNORDERED_EVENT_LIST);
  var sortedCollection = collection.sortByTime();
  expect(sortedCollection.at(1).timestamp().getTime() > sortedCollection.at(0).timestamp().getTime()).toBeTruthy();
});
it("can determine if a collection is chronological", () => {
  var collection = new _collection.default(UNORDERED_EVENT_LIST);
  expect(collection.isChronological()).toBeFalsy();
  var sortedCollection = collection.sortByTime();
  expect(sortedCollection.isChronological()).toBeTruthy();
}); //
// Getting events out of the Collection
//
// Duplicates with atKey

it("can find duplicates with atKey", () => {
  var collection = new _collection.default(EVENT_LIST_DUP);
  var find = collection.atKey(new Date("2015-04-22T03:31:00Z"));
  expect(find.length).toBe(2);
  expect(find[0].get("in")).toEqual(3);
  expect(find[1].get("in")).toEqual(4);
});
it("can find duplicates with atKey", () => {
  var collection = new _collection.default(EVENT_LIST_DUP);
  var find = collection.atKey(new Date("2015-05-22T03:32:00Z"));
  expect(find.length).toBe(0);
}); // Event list as...

it("can express the collection events as a map", () => {
  var collection = new _collection.default(EVENT_LIST_DUP);
  var eventMap = collection.eventListAsMap();
  expect(eventMap["1429673400000"].length).toBe(1);
  expect(eventMap["1429673460000"].length).toBe(2);
  expect(eventMap["1429673520000"].length).toBe(1);
  expect(eventMap["1429673460000"][0].get("in")).toBe(3);
  expect(eventMap["1429673460000"][1].get("in")).toBe(4);
}); // Event list as...

it("can express the collection events as a map", () => {
  var collection = new _collection.default(EVENT_LIST_DUP);
  var dedup = collection.dedup();
  expect(dedup.size()).toBe(3);
  expect(dedup.at(0).get("in")).toBe(1);
  expect(dedup.at(1).get("in")).toBe(4);
  expect(dedup.at(2).get("in")).toBe(5);
});