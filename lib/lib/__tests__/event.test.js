"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _immutable = _interopRequireDefault(require("immutable"));

var _event = _interopRequireDefault(require("../event"));

var _index = _interopRequireDefault(require("../index"));

var _indexedevent = _interopRequireDefault(require("../indexedevent"));

var _timeevent = _interopRequireDefault(require("../timeevent"));

var _timerange = _interopRequireDefault(require("../timerange"));

var _timerangeevent = _interopRequireDefault(require("../timerangeevent"));

var _functions = require("../base/functions");

/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */
var OUTAGE_EVENT_LIST = {
  status: "OK",
  outage_events: [{
    start_time: "2015-04-22T03:30:00Z",
    end_time: "2015-04-22T13:00:00Z",
    description: "At 13:33 pacific circuit 06519 went down.",
    title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
    completed: true,
    external_ticket: "",
    esnet_ticket: "ESNET-20150421-013",
    organization: "Internet2 / Level 3",
    type: "U"
  }, {
    start_time: "2015-04-22T03:30:00Z",
    end_time: "2015-04-22T16:50:00Z",
    title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
    description: "The listed circuit was unavailable due to\nbent pins in two clots of the optical node chassis.",
    completed: true,
    external_ticket: "3576:144",
    esnet_ticket: "ESNET-20150421-013",
    organization: "Internet2 / Level 3",
    type: "U"
  }, {
    start_time: "2015-03-04T09:00:00Z",
    end_time: "2015-03-04T14:00:00Z",
    title: "ANL Scheduled Maintenance",
    description: "ANL will be switching border routers...",
    completed: true,
    external_ticket: "",
    esnet_ticket: "ESNET-20150302-002",
    organization: "ANL",
    type: "P"
  }]
};
var DEEP_EVENT_DATA = {
  NorthRoute: {
    in: 123,
    out: 456
  },
  SouthRoute: {
    in: 654,
    out: 223
  }
};
var EVENT_LIST = [];
EVENT_LIST.push(new _timeevent.default(1445449170000, {
  name: "source1",
  in: 2,
  out: 11
}));
EVENT_LIST.push(new _timeevent.default(1445449200000, {
  name: "source1",
  in: 4,
  out: 13
}));
EVENT_LIST.push(new _timeevent.default(1445449230000, {
  name: "source1",
  in: 6,
  out: 15
}));
EVENT_LIST.push(new _timeevent.default(1445449260000, {
  name: "source1",
  in: 8,
  out: 18
})); //
// TimeEvent creation
//

it("can create a regular TimeEvent, with deep data", () => {
  var timestamp = new Date("2015-04-22T03:30:00Z");
  var event = new _timeevent.default(timestamp, DEEP_EVENT_DATA);
  expect(event.get("NorthRoute")).toEqual({
    in: 123,
    out: 456
  });
  expect(event.get("SouthRoute")).toEqual({
    in: 654,
    out: 223
  });
});
it("can't make an Event directly", () => {
  var timestamp = new Date("2015-04-22T03:30:00Z");
  expect(() => {
    var event = new _event.default(timestamp, DEEP_EVENT_DATA);
  }).toThrow();
});
it("can create an IndexedEvent using a string index and data", () => {
  var event = new _indexedevent.default("1d-12355", {
    value: 42
  });
  var expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
  expect(event.timerangeAsUTCString()).toBe(expected);
  expect(event.get("value")).toBe(42);
});
it("can create an IndexedEvent using an existing Index and data", () => {
  var index = new _index.default("1d-12355");
  var event = new _indexedevent.default(index, {
    value: 42
  });
  var expected = "[Thu, 30 Oct 2003 00:00:00 GMT, Fri, 31 Oct 2003 00:00:00 GMT]";
  expect(event.timerangeAsUTCString()).toBe(expected);
  expect(event.get("value")).toBe(42);
});
it("can create a TimeRangeEvent using a object", () => {
  // Pick one event
  var sampleEvent = OUTAGE_EVENT_LIST["outage_events"][0]; // Extract the begin and end times

  var beginTime = new Date(sampleEvent.start_time);
  var endTime = new Date(sampleEvent.end_time);
  var timerange = new _timerange.default(beginTime, endTime);
  var event = new _timerangeevent.default(timerange, sampleEvent);
  var expected = "{\"timerange\":[1429673400000,1429707600000],\"data\":{\"external_ticket\":\"\",\"start_time\":\"2015-04-22T03:30:00Z\",\"completed\":true,\"end_time\":\"2015-04-22T13:00:00Z\",\"organization\":\"Internet2 / Level 3\",\"title\":\"STAR-CR5 < 100 ge 06519 > ANL  - Outage\",\"type\":\"U\",\"esnet_ticket\":\"ESNET-20150421-013\",\"description\":\"At 13:33 pacific circuit 06519 went down.\"}}";
  expect("".concat(event)).toBe(expected);
  expect(event.begin().getTime()).toBe(1429673400000);
  expect(event.end().getTime()).toBe(1429707600000);
  expect(event.humanizeDuration()).toBe("10 hours");
  expect(event.get("title")).toBe("STAR-CR5 < 100 ge 06519 > ANL  - Outage");
}); //
// Event merging
//

it("can merge multiple events together", () => {
  var t = new Date("2015-04-22T03:30:00Z");
  var event1 = new _timeevent.default(t, {
    a: 5,
    b: 6
  });
  var event2 = new _timeevent.default(t, {
    c: 2
  });

  var merged = _event.default.merge([event1, event2]);

  expect(merged[0].get("a")).toBe(5);
  expect(merged[0].get("b")).toBe(6);
  expect(merged[0].get("c")).toBe(2);
});
it("can merge multiple events together using an Immutable.List", () => {
  var t = new Date("2015-04-22T03:30:00Z");
  var event1 = new _timeevent.default(t, {
    a: 5,
    b: 6
  });
  var event2 = new _timeevent.default(t, {
    c: 2
  });

  var merged = _event.default.merge(new _immutable.default.List([event1, event2]));

  expect(merged.get(0).get("a")).toBe(5);
  expect(merged.get(0).get("b")).toBe(6);
  expect(merged.get(0).get("c")).toBe(2);
});
it("can merge multiple indexed events together", () => {
  var index = "1h-396206";
  var event1 = new _indexedevent.default(index, {
    a: 5,
    b: 6
  });
  var event2 = new _indexedevent.default(index, {
    c: 2
  });

  var merged = _event.default.merge([event1, event2]);

  expect(merged[0].get("a")).toBe(5);
  expect(merged[0].get("b")).toBe(6);
  expect(merged[0].get("c")).toBe(2);
});
it("can merge multiple timerange events together", () => {
  var beginTime = new Date("2015-04-22T03:30:00Z");
  var endTime = new Date("2015-04-22T13:00:00Z");
  var timerange = new _timerange.default(beginTime, endTime);
  var event1 = new _timerangeevent.default(timerange, {
    a: 5,
    b: 6
  });
  var event2 = new _timerangeevent.default(timerange, {
    c: 2
  });

  var merged = _event.default.merge([event1, event2]);

  expect(merged[0].get("a")).toBe(5);
  expect(merged[0].get("b")).toBe(6);
  expect(merged[0].get("c")).toBe(2);
});
it("can deeply merge multiple events together", () => {
  var t = new Date("2015-04-22T03:30:00Z");
  var event1 = new _timeevent.default(t, {
    a: 5,
    b: {
      c: 6
    }
  });
  var event2 = new _timeevent.default(t, {
    d: 2,
    b: {
      e: 4
    }
  });

  var merged = _event.default.merge([event1, event2], true);

  expect(merged[0].get("a")).toBe(5);
  expect(merged[0].get("b.c")).toBe(6);
  expect(merged[0].get("d")).toBe(2);
  expect(merged[0].get("b.e")).toBe(4);
}); //
// Event sums
//

it("can sum multiple events together", () => {
  var t = new Date("2015-04-22T03:30:00Z");
  var events = [new _timeevent.default(t, {
    a: 5,
    b: 6,
    c: 7
  }), new _timeevent.default(t, {
    a: 2,
    b: 3,
    c: 4
  }), new _timeevent.default(t, {
    a: 1,
    b: 2,
    c: 3
  })];

  var result = _event.default.combine(events, (0, _functions.sum)());

  expect(result[0].get("a")).toBe(8);
  expect(result[0].get("b")).toBe(11);
  expect(result[0].get("c")).toBe(14);
});
it("can sum multiple events together using an Immutable.List", () => {
  var t = new Date("2015-04-22T03:30:00Z");
  var events = [new _timeevent.default(t, {
    a: 5,
    b: 6,
    c: 7
  }), new _timeevent.default(t, {
    a: 2,
    b: 3,
    c: 4
  }), new _timeevent.default(t, {
    a: 1,
    b: 2,
    c: 3
  })];

  var result = _event.default.combine(new _immutable.default.List(events), (0, _functions.sum)());

  expect(result.getIn([0, "a"])).toBe(8);
  expect(result.getIn([0, "b"])).toBe(11);
  expect(result.getIn([0, "c"])).toBe(14);
});
it("can pass no events to sum and get back an empty list", () => {
  var t = new Date("2015-04-22T03:30:00Z");
  var events = [];

  var result1 = _event.default.combine(events, (0, _functions.sum)());

  expect(result1.length).toBe(0);

  var result2 = _event.default.combine(new _immutable.default.List(events), (0, _functions.sum)());

  expect(result2.length).toBe(0);
});
it("can sum multiple indexed events together", () => {
  var events = [new _indexedevent.default("1d-1234", {
    a: 5,
    b: 6,
    c: 7
  }), new _indexedevent.default("1d-1234", {
    a: 2,
    b: 3,
    c: 4
  }), new _indexedevent.default("1d-1235", {
    a: 1,
    b: 2,
    c: 3
  })];

  var result = _event.default.combine(events, (0, _functions.sum)());

  expect(result.length).toEqual(2);
  expect("".concat(result[0].index())).toBe("1d-1234");
  expect(result[0].get("a")).toBe(7);
  expect(result[0].get("b")).toBe(9);
  expect(result[0].get("c")).toBe(11);
  expect("".concat(result[1].index())).toBe("1d-1235");
  expect(result[1].get("a")).toBe(1);
  expect(result[1].get("b")).toBe(2);
  expect(result[1].get("c")).toBe(3);
});
it("can sum multiple events together if they have different timestamps", () => {
  var t1 = new Date("2015-04-22T03:30:00Z");
  var t2 = new Date("2015-04-22T04:00:00Z");
  var t3 = new Date("2015-04-22T04:30:00Z");
  var events = [new _timeevent.default(t1, {
    a: 5,
    b: 6,
    c: 7
  }), new _timeevent.default(t1, {
    a: 2,
    b: 3,
    c: 4
  }), new _timeevent.default(t3, {
    a: 1,
    b: 2,
    c: 3
  })];

  var result = _event.default.combine(events, (0, _functions.sum)());

  expect(result[0].get("a")).toBe(7);
}); //
// Test duplication
//

it("can detect duplicated event", () => {
  var e1 = new _timeevent.default(1477058455872, {
    a: 5,
    b: 6,
    c: 7
  });
  var e2 = new _timeevent.default(1477058455872, {
    a: 5,
    b: 6,
    c: 7
  });
  var e3 = new _timeevent.default(1477058455872, {
    a: 6,
    b: 6,
    c: 7
  }); // Just check times and type

  expect(_event.default.isDuplicate(e1, e2)).toBeTruthy();
  expect(_event.default.isDuplicate(e1, e3)).toBeTruthy(); // Check times, type and values

  expect(_event.default.isDuplicate(e1, e3, false)).toBeFalsy();
  expect(_event.default.isDuplicate(e1, e2, false)).toBeTruthy();
}); //
// Deep data
//

it("can create an event with deep data and then get values back with dot notation", () => {
  var timestamp = new Date("2015-04-22T03:30:00Z");
  var event = new _timeevent.default(timestamp, DEEP_EVENT_DATA);
  var eventValue;

  for (var i = 0; i < 100000; i++) {
    eventValue = event.get(["NorthRoute", "in"]); //1550ms
  }

  expect(eventValue).toBe(123);
}); //
// Event map and reduce
//

it("should generate the correct key values for a string selector", () => {
  expect(_event.default.map(EVENT_LIST, "in")).toEqual({
    in: [2, 4, 6, 8]
  });
});
it("should generate the correct key values for a string selector", () => {
  expect(_event.default.map(EVENT_LIST, ["in", "out"])).toEqual({
    in: [2, 4, 6, 8],
    out: [11, 13, 15, 18]
  });
});
it("should generate the correct key values for a string selector", () => {
  var result = _event.default.map(EVENT_LIST, event => ({
    sum: event.get("in") + event.get("out")
  }));

  expect(result).toEqual({
    sum: [13, 17, 21, 26]
  });
  expect(_event.default.reduce(result, (0, _functions.avg)())).toEqual({
    sum: 19.25
  });
});
it("should be able to run a simple mapReduce calculation", () => {
  var result = _event.default.mapReduce(EVENT_LIST, ["in", "out"], (0, _functions.avg)());

  expect(result).toEqual({
    in: 5,
    out: 14.25
  });
});