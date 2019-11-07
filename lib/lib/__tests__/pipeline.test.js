"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _collection = _interopRequireDefault(require("../collection"));

var _collectionout = _interopRequireDefault(require("../io/collectionout"));

var _eventout = _interopRequireDefault(require("../io/eventout"));

var _indexedevent = _interopRequireDefault(require("../indexedevent"));

var _stream = _interopRequireDefault(require("../io/stream"));

var _timeevent = _interopRequireDefault(require("../timeevent"));

var _timerange = _interopRequireDefault(require("../timerange"));

var _timerangeevent = _interopRequireDefault(require("../timerangeevent"));

var _timeseries = _interopRequireDefault(require("../timeseries"));

var _pipeline = require("../pipeline");

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
var TRAFFIC_DATA = {
  name: "traffic",
  columns: ["time", "value"],
  points: [[1409529600000, 80], [1409533200000, 88], [1409536800000, 52], [1409540400000, 80], // < 50
  [1409544000000, 26], //1
  [1409547600000, 37], //2
  [1409551200000, 6], //3
  [1409554800000, 32], //4
  [1409558400000, 69], [1409562000000, 21], //5
  [1409565600000, 6], //6
  [1409569200000, 54], [1409572800000, 88], [1409576400000, 41], //7
  [1409580000000, 35], //8
  [1409583600000, 43], //9
  [1409587200000, 84], [1409590800000, 32], //10  avg= (26 + 37 + 6 + 32 + 21 + 6 + 41 + 35 + 43 + 32)/10 = 27.9
  [1409594400000, 41], [1409598000000, 57], [1409601600000, 27], [1409605200000, 50], [1409608800000, 13], [1409612400000, 63], [1409616000000, 58], [1409619600000, 80], [1409623200000, 59], [1409626800000, 96], [1409630400000, 2], [1409634000000, 20], [1409637600000, 64], [1409641200000, 7], [1409644800000, 50], [1409648400000, 88], [1409652000000, 34], [1409655600000, 31], [1409659200000, 16], [1409662800000, 38], [1409666400000, 94], [1409670000000, 78], [1409673600000, 86], [1409677200000, 13], [1409680800000, 34], [1409684400000, 29], [1409688000000, 48], [1409691600000, 80], [1409695200000, 30], [1409698800000, 15], [1409702400000, 62], [1409706000000, 66], [1409709600000, 44], [1409713200000, 94], [1409716800000, 78], [1409720400000, 29], [1409724000000, 21], [1409727600000, 4], [1409731200000, 83], [1409734800000, 15], [1409738400000, 89], [1409742000000, 53], [1409745600000, 70], [1409749200000, 41], [1409752800000, 47], [1409756400000, 30], [1409760000000, 68], [1409763600000, 89], [1409767200000, 29], [1409770800000, 17], [1409774400000, 38], [1409778000000, 67], [1409781600000, 75], [1409785200000, 89], [1409788800000, 47], [1409792400000, 82], [1409796000000, 33], [1409799600000, 67], [1409803200000, 93], [1409806800000, 86], [1409810400000, 97], [1409814000000, 19], [1409817600000, 19], [1409821200000, 31], [1409824800000, 56], [1409828400000, 19], [1409832000000, 43], [1409835600000, 29], [1409839200000, 72], [1409842800000, 27], [1409846400000, 21], [1409850000000, 88], [1409853600000, 18], [1409857200000, 30], [1409860800000, 46], [1409864400000, 34], [1409868000000, 31], [1409871600000, 20], [1409875200000, 45], [1409878800000, 17], [1409882400000, 24], [1409886000000, 84], [1409889600000, 6], [1409893200000, 91], [1409896800000, 82], [1409900400000, 71], [1409904000000, 97], [1409907600000, 43], [1409911200000, 38], [1409914800000, 1], [1409918400000, 71], [1409922000000, 50], [1409925600000, 19], [1409929200000, 19], [1409932800000, 86], [1409936400000, 65], [1409940000000, 93], [1409943600000, 35]]
};
var inOutData = {
  name: "traffic",
  columns: ["time", "in", "out", "perpendicular"],
  points: [[1409529600000, 80, 37, 1000], [1409533200000, 88, 22, 1001], [1409536800000, 52, 56, 1002]]
};
describe("Pipeline", () => {
  describe("test processor using offsetBy", () => {
    it("can transform process events with an offsetBy chain", () => {
      var events = EVENT_LIST;
      var collection = new _collection.default(events);
      var c1;
      var c2;
      var p1 = (0, _pipeline.Pipeline)().from(collection).offsetBy(1, "in").offsetBy(2).to(_collectionout.default, c => c1 = c); // --> Specified output, evokes batch op

      var p2 = p1.offsetBy(3, "in").to(_collectionout.default, c => {
        //            ||
        c2 = c;
      }); // --> Specified output, evokes batch op

      expect(c1.size()).toBe(3);
      expect(c1.at(0).get("in")).toBe(4);
      expect(c1.at(1).get("in")).toBe(6);
      expect(c1.at(2).get("in")).toBe(8);
      expect(c2.size()).toBe(3);
      expect(c2.at(0).get("in")).toBe(7);
      expect(c2.at(1).get("in")).toBe(9);
      expect(c2.at(2).get("in")).toBe(11);
    });
    it("can stream from an unbounded source directly to output", () => {
      var out;
      var events = EVENT_LIST;
      var stream = new _stream.default();
      var p = (0, _pipeline.Pipeline)().from(stream).to(_collectionout.default, c => out = c);
      stream.addEvent(events[0]);
      stream.addEvent(events[1]);
      expect(out.size()).toBe(2);
    });
    it("can stream events with an offsetBy pipeline", () => {
      var out;
      var events = EVENT_LIST;
      var stream = new _stream.default();
      var p = (0, _pipeline.Pipeline)().from(stream).offsetBy(3, "in").to(_collectionout.default, c => out = c);
      stream.addEvent(events[0]);
      stream.addEvent(events[1]);
      expect(out.size()).toBe(2);
      expect(out.at(0).get("in")).toBe(4);
      expect(out.at(1).get("in")).toBe(6);
    });
    it("can stream events with two offsetBy pipelines...", () => {
      var out1, out2;
      var events = EVENT_LIST;
      var stream = new _stream.default();
      var p1 = (0, _pipeline.Pipeline)().from(stream).offsetBy(1, "in").offsetBy(2).to(_collectionout.default, c => out1 = c);
      var p2 = p1.offsetBy(3, "in").to(_collectionout.default, c => out2 = c);
      stream.addEvent(events[0]);
      expect(out1.size()).toBe(1);
      expect(out2.size()).toBe(1);
      expect(out1.at(0).get("in")).toBe(4);
      expect(out2.at(0).get("in")).toBe(7);
    });
  });
  describe("TimeSeries pipeline", () => {
    var data = {
      name: "traffic",
      columns: ["time", "value", "status"],
      points: [[1400425947000, 52, "ok"], [1400425948000, 18, "ok"], [1400425949000, 26, "fail"], [1400425950000, 93, "offline"]]
    };
    it("can transform process events with an offsetBy chain", () => {
      var out;
      var timeseries = new _timeseries.default(data);
      var p1 = (0, _pipeline.Pipeline)().from(timeseries.collection()).offsetBy(1, "value").offsetBy(2).to(_collectionout.default, c => out = c);
      expect(out.at(0).get()).toBe(55);
      expect(out.at(1).get()).toBe(21);
      expect(out.at(2).get()).toBe(29);
      expect(out.at(3).get()).toBe(96);
    });
    it("can transform events with an offsetBy chain straight from a TimeSeries", () => {
      var out;
      var timeseries = new _timeseries.default(data);
      timeseries.pipeline().offsetBy(1, "value").offsetBy(2).to(_collectionout.default, c => out = c);
      expect(out.at(0).get()).toBe(55);
      expect(out.at(1).get()).toBe(21);
      expect(out.at(2).get()).toBe(29);
      expect(out.at(3).get()).toBe(96);
    });
    it("should be able to batch a TimeSeries with an offset", () => {
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      var outputEvents = [];
      (0, _pipeline.Pipeline)().from(timeseries).offsetBy(1, "value").offsetBy(2).to(_eventout.default, c => outputEvents.push(c));
      expect(outputEvents.length).toBe(timeseries.size());
    });
    it("should be able to batch a TimeSeries with no processing nodes", () => {
      var stream = new _timeseries.default(TRAFFIC_DATA);
      var outputEvents = [];
      (0, _pipeline.Pipeline)().from(stream).to(_eventout.default, c => outputEvents.push(c));
      expect(outputEvents.length).toBe(stream.size());
    });
  });
  describe("aggregation", () => {
    it("can aggregate events into by windowed avg", () => {
      var eventsIn = [];
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 7, 57, 0), {
        in: 3,
        out: 1
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 7, 58, 0), {
        in: 9,
        out: 2
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 7, 59, 0), {
        in: 6,
        out: 6
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 8, 0, 0), {
        in: 4,
        out: 7
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 8, 1, 0), {
        in: 5,
        out: 9
      }));
      var stream = new _stream.default();
      var result = {};
      var p = (0, _pipeline.Pipeline)().from(stream).windowBy("1h").emitOn("eachEvent").aggregate({
        in_avg: {
          in: (0, _functions.avg)()
        },
        out_avg: {
          out: (0, _functions.avg)()
        }
      }).to(_eventout.default, event => {
        result["".concat(event.index())] = event;
      });
      eventsIn.forEach(event => stream.addEvent(event));
      expect(result["1h-396199"].get("in_avg")).toBe(6);
      expect(result["1h-396199"].get("out_avg")).toBe(3);
      expect(result["1h-396200"].get("in_avg")).toBe(4.5);
      expect(result["1h-396200"].get("out_avg")).toBe(8);
    });
    it("an collect together events and aggregate", () => {
      var eventsIn = [];
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 7, 57, 0), {
        type: "a",
        in: 3,
        out: 1
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 7, 58, 0), {
        type: "a",
        in: 9,
        out: 2
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 7, 59, 0), {
        type: "b",
        in: 6,
        out: 6
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 8, 0, 0), {
        type: "a",
        in: 4,
        out: 7
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 8, 1, 0), {
        type: "b",
        in: 5,
        out: 9
      }));
      var stream = new _stream.default();
      var result = {};
      var p = (0, _pipeline.Pipeline)().from(stream).groupBy("type").windowBy("1h").emitOn("eachEvent").aggregate({
        type: {
          type: (0, _functions.keep)()
        },
        // keep the type
        in_avg: {
          in: (0, _functions.avg)()
        },
        // avg in  -> in_avg
        // avg out -> out_avg
        out_avg: {
          out: (0, _functions.avg)()
        }
      }).to(_eventout.default, event => result["".concat(event.index(), ":").concat(event.get("type"))] = event);
      eventsIn.forEach(event => stream.addEvent(event));
      expect(result["1h-396199:a"].get("in_avg")).toBe(6);
      expect(result["1h-396199:a"].get("out_avg")).toBe(1.5);
      expect(result["1h-396199:b"].get("in_avg")).toBe(6);
      expect(result["1h-396199:b"].get("out_avg")).toBe(6);
      expect(result["1h-396200:a"].get("in_avg")).toBe(4);
      expect(result["1h-396200:a"].get("out_avg")).toBe(7);
      expect(result["1h-396200:b"].get("in_avg")).toBe(5);
      expect(result["1h-396200:b"].get("out_avg")).toBe(9);
    });
    it("can aggregate events by windowed avg and convert them to TimeEvents", () => {
      var eventsIn = [];
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 1, 57, 0), {
        in: 3,
        out: 1
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 1, 58, 0), {
        in: 9,
        out: 2
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 1, 59, 0), {
        in: 6,
        out: 6
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 2, 0, 0), {
        in: 4,
        out: 7
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 2, 1, 0), {
        in: 5,
        out: 9
      }));
      var stream = new _stream.default();
      var result = {};
      (0, _pipeline.Pipeline)().from(stream).windowBy("1h").emitOn("eachEvent").aggregate({
        in_avg: {
          in: (0, _functions.avg)()
        },
        out_avg: {
          out: (0, _functions.avg)()
        }
      }).asTimeRangeEvents({
        alignment: "lag"
      }).to(_eventout.default, event => {
        result["".concat(+event.timestamp())] = event;
      });
      eventsIn.forEach(event => stream.addEvent(event));
      expect(result["1426294800000"].get("in_avg")).toBe(6);
      expect(result["1426294800000"].get("out_avg")).toBe(3);
      expect(result["1426298400000"].get("in_avg")).toBe(4.5);
      expect(result["1426298400000"].get("out_avg")).toBe(8);
    });
    it("can aggregate events to get percentiles", () => {
      var eventsIn = [];
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 1, 57, 0), {
        in: 3,
        out: 1
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 1, 58, 0), {
        in: 9,
        out: 2
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 1, 59, 0), {
        in: 6,
        out: 6
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 2, 0, 0), {
        in: 4,
        out: 7
      }));
      eventsIn.push(new _timeevent.default(Date.UTC(2015, 2, 14, 2, 1, 0), {
        in: 5,
        out: 9
      }));
      var stream = new _stream.default();
      var result = {};
      (0, _pipeline.Pipeline)().from(stream).windowBy("1h").emitOn("eachEvent").aggregate({
        in_low: {
          in: (0, _functions.min)()
        },
        in_25th: {
          in: (0, _functions.percentile)(25)
        },
        in_median: {
          in: (0, _functions.median)()
        },
        in_75th: {
          in: (0, _functions.percentile)(75)
        },
        in_high: {
          in: (0, _functions.max)()
        }
      }).asTimeEvents().to(_eventout.default, event => {
        result["".concat(+event.timestamp())] = event;
      });
      eventsIn.forEach(event => stream.addEvent(event));
      expect(result["1426296600000"].get("in_low")).toBe(3);
      expect(result["1426296600000"].get("in_25th")).toBe(4.5);
      expect(result["1426296600000"].get("in_median")).toBe(6);
      expect(result["1426296600000"].get("in_75th")).toBe(7.5);
      expect(result["1426296600000"].get("in_high")).toBe(9);
    });
  });
  describe("Pipeline event conversion", () => {
    var timestamp = new Date(1426316400000);
    var e = new _timeevent.default(timestamp, 3);
    it("should be able to convert from an TimeEvent to an TimeRangeEvent, using a duration, in front of the event", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeRangeEvents({
        alignment: "front",
        duration: "1h"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"timerange\":[1426316400000,1426320000000],\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(e);
    });
    it("should be able to convert from an TimeEvent to an TimeRangeEvent, using a duration, surrounding the event", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeRangeEvents({
        alignment: "center",
        duration: "1h"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"timerange\":[1426314600000,1426318200000],\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(e);
    });
    it("should be able to convert from an TimeEvent to an TimeRangeEvent, using a duration, in behind of the event", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeRangeEvents({
        alignment: "behind",
        duration: "1h"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"timerange\":[1426312800000,1426316400000],\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(e);
    });
    it("should be able to convert from an TimeEvent to an IndexedEvent", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asIndexedEvents({
        duration: "1h"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"index\":\"1h-396199\",\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(e);
    });
    it("should be able to convert from an TimeEvent to an TimeEvent as a noop", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeEvents().to(_eventout.default, event => {
        expect(event).toBe(e);
        done();
      });
      stream.addEvent(e);
    });
  });
  describe("TimeRangeEvent conversion", () => {
    var timeRange = new _timerange.default([1426316400000, 1426320000000]);
    var timeRangeEvent = new _timerangeevent.default(timeRange, 3);
    it("should be able to convert from an TimeRangeEvent to an TimeEvent, using the center of the range", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeEvents({
        alignment: "center"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"time\":1426318200000,\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(timeRangeEvent);
    });
    it("should be able to convert from an TimeRangeEvent to an TimeEvent, using beginning of the range", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeEvents({
        alignment: "lag"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"time\":1426316400000,\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(timeRangeEvent);
    });
    it("should be able to convert from an TimeRangeEvent to an TimeEvent, using the end of the range", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeEvents({
        alignment: "lead"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"time\":1426320000000,\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(timeRangeEvent);
    });
    it("should be able to convert from an TimeRangeEvent to an TimeRangeEvent as a noop", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeRangeEvents().to(_eventout.default, event => {
        expect(event).toBe(timeRangeEvent);
        done();
      });
      stream.addEvent(timeRangeEvent);
    });
  });
  describe("IndexedEvent conversion", () => {
    var indexedEvent = new _indexedevent.default("1h-396199", 3);
    it("should be able to convert from an IndexedEvent to an TimeEvent, using the center of the range", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeEvents({
        alignment: "center"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"time\":1426318200000,\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(indexedEvent);
    });
    it("should be able to convert from an IndexedEvent to an TimeEvent, using beginning of the range", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeEvents({
        alignment: "lag"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"time\":1426316400000,\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(indexedEvent);
    });
    it("should be able to convert from an IndexedEvent to an TimeEvent, using the end of the range", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeEvents({
        alignment: "lead"
      }).to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"time\":1426320000000,\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(indexedEvent);
    });
    it("should be able to convert from an IndexedEvent to an TimeRangeEvent", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asTimeRangeEvents().to(_eventout.default, event => {
        expect("".concat(event)).toBe("{\"timerange\":[1426316400000,1426320000000],\"data\":{\"value\":3}}");
        done();
      });
      stream.addEvent(indexedEvent);
    });
    it("should be able to convert from an IndexedEvent to an IndexedEvent as a noop", done => {
      var stream = new _stream.default();
      (0, _pipeline.Pipeline)().from(stream).asIndexedEvents().to(_eventout.default, event => {
        expect(event).toBe(indexedEvent);
        done();
      });
      stream.addEvent(indexedEvent);
    });
  });
  describe("Filtering events in batch", () => {
    it("should be able to filter a TimeSeries", () => {
      var outputEvents = [];
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      (0, _pipeline.Pipeline)().from(timeseries).filter(e => e.value() > 65).to(_eventout.default, c => outputEvents.push(c));
      expect(outputEvents.length).toBe(39);
    });
  });
  describe("Selecting subset of columns from a TimeSeries in batch", () => {
    it("should be able select a single column", () => {
      var result;
      var timeseries = new _timeseries.default(inOutData);
      (0, _pipeline.Pipeline)().from(timeseries).select("in").to(_collectionout.default, c => result = new _timeseries.default({
        name: "newTimeseries",
        collection: c
      }));
      expect(result.columns()).toEqual(["in"]);
    });
    it("should be able select a subset of columns", () => {
      var result;
      var timeseries = new _timeseries.default(inOutData);
      (0, _pipeline.Pipeline)().from(timeseries).select(["out", "perpendicular"]).to(_collectionout.default, c => result = new _timeseries.default({
        name: "subset",
        collection: c
      }));
      expect(result.columns()).toEqual(["out", "perpendicular"]);
    });
  });
  describe("Collapsing in batch", () => {
    it("should be able collapse a subset of columns", done => {
      var timeseries = new _timeseries.default(inOutData);
      (0, _pipeline.Pipeline)().from(timeseries).collapse(["in", "out"], "in_out_sum", (0, _functions.sum)()).emitOn("flush").to(_collectionout.default, c => {
        var ts = new _timeseries.default({
          name: "subset",
          collection: c
        });
        expect(ts.at(0).get("in_out_sum")).toBe(117);
        expect(ts.at(1).get("in_out_sum")).toBe(110);
        expect(ts.at(2).get("in_out_sum")).toBe(108);
        done();
      },
      /*flush=*/
      true);
    });
    it("should be able chain collapse operations together", done => {
      var timeseries = new _timeseries.default(inOutData);
      (0, _pipeline.Pipeline)().from(timeseries).collapse(["in", "out"], "in_out_sum", (0, _functions.sum)(), true).collapse(["in", "out"], "in_out_max", (0, _functions.max)(), true).emitOn("flush").to(_collectionout.default, c => {
        var ts = new _timeseries.default({
          name: "subset",
          collection: c
        });
        expect(ts.at(0).get("in_out_sum")).toBe(117);
        expect(ts.at(1).get("in_out_sum")).toBe(110);
        expect(ts.at(2).get("in_out_sum")).toBe(108);
        expect(ts.at(0).get("in_out_max")).toBe(80);
        expect(ts.at(1).get("in_out_max")).toBe(88);
        expect(ts.at(2).get("in_out_max")).toBe(56);
        done();
      },
      /*flush=*/
      true);
    });
    it("should be able sum element-wise and then find the max", done => {
      var timeseries = new _timeseries.default(inOutData);
      (0, _pipeline.Pipeline)().from(timeseries).collapse(["in", "out"], "total", (0, _functions.sum)()).emitOn("flush").aggregate({
        max_total: {
          total: (0, _functions.max)()
        }
      }).to(_eventout.default, e => {
        expect(e.get("max_total")).toBe(117);
        done();
      },
      /*flush=*/
      true);
    });
  });
  describe("Batch pipeline with return value", () => {
    it("should be able to collect first 10 events over 65 and under 65", () => {
      var result = {};
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      var collections = (0, _pipeline.Pipeline)().from(timeseries).emitOn("flush").groupBy(e => e.value() > 65 ? "high" : "low").take(10).toKeyedCollections(); //expect(result["low"].size()).toBe(10);
      //expect(result["high"].size()).toBe(10);
    });
  });
  describe("Mapping in batch", () => {
    it("should be able map one event to a modified event", done => {
      var timeseries = new _timeseries.default(inOutData);
      (0, _pipeline.Pipeline)().from(timeseries).map(e => e.setData({
        in: e.get("out"),
        out: e.get("in")
      })).emitOn("flush").to(_collectionout.default, c => {
        var ts = new _timeseries.default({
          name: "subset",
          collection: c
        });
        expect(ts.at(0).get("in")).toBe(37);
        expect(ts.at(0).get("out")).toBe(80);
        expect(ts.size()).toBe(3);
        done();
      },
      /*flush=*/
      true);
    });
  });
  describe("Take n events in batch", () => {
    it("should be able to take 10 events from a TimeSeries", () => {
      var result;
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      (0, _pipeline.Pipeline)().from(timeseries).take(10).to(_collectionout.default, c => result = new _timeseries.default({
        name: "result",
        collection: c
      }));
      expect(result.size()).toBe(10);
    });
    it("should be able to aggregate in batch global window", () => {
      var result;
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      var p = (0, _pipeline.Pipeline)().from(timeseries).filter(e => e.value() < 50).take(10).aggregate({
        value: {
          value: (0, _functions.avg)()
        }
      }).to(_eventout.default, event => {
        result = event;
      }, true);
      expect(result.timerange().toString()).toBe("[1409544000000,1409590800000]");
      expect(result.value()).toBe(27.9);
    });
    it("should be able to collect first 10 events over 65", () => {
      var result;
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      var p = (0, _pipeline.Pipeline)().from(timeseries).filter(e => e.value() > 65).take(10).to(_collectionout.default, collection => {
        result = collection;
      }, true);
      expect(result.size()).toBe(10);
      expect(result.at(0).value()).toBe(80);
      expect(result.at(1).value()).toBe(88);
      expect(result.at(5).value()).toBe(84);
    });
    it("should be able to collect first 10 events over 65 and under 65", () => {
      var result = {};
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      var p = (0, _pipeline.Pipeline)().from(timeseries).groupBy(e => e.value() > 65 ? "high" : "low").take(10).to(_collectionout.default, (collection, windowKey, groupByKey) => {
        result[groupByKey] = collection;
      }, true);
      expect(result["low"].size()).toBe(10);
      expect(result["high"].size()).toBe(10);
    });
    it("should be able to take the first 10 events, then split over 65 and under 65 into two collections", () => {
      var result = {};
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      var p = (0, _pipeline.Pipeline)().from(timeseries).take(10).groupBy(e => e.value() > 65 ? "high" : "low").to(_collectionout.default, (collection, windowKey, groupByKey) => {
        result[groupByKey] = collection;
      }, true);
      expect(result["high"].size()).toBe(4);
      expect(result["low"].size()).toBe(6);
    });
    it("should be able to count() the split over 65 and under 65", () => {
      var result = {};
      var timeseries = new _timeseries.default(TRAFFIC_DATA);
      var p = (0, _pipeline.Pipeline)().from(timeseries).take(10).groupBy(e => e.value() > 65 ? "high" : "low").emitOn("flush").count((count, windowKey, groupByKey) => result[groupByKey] = count);
      expect(result["high"]).toBe(4);
      expect(result["low"]).toBe(6);
    });
  });
});