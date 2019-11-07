"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _moment = _interopRequireDefault(require("moment"));

var _collection = _interopRequireDefault(require("../collection"));

var _timeevent = _interopRequireDefault(require("../timeevent"));

var _timerange = _interopRequireDefault(require("../timerange"));

var _timerangeevent = _interopRequireDefault(require("../timerangeevent"));

var _timeseries = _interopRequireDefault(require("../timeseries"));

var _functions = require("../base/functions");

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
var TIMESERIES_TEST_DATA = {
  name: "traffic",
  columns: ["time", "value", "status"],
  points: [[1400425947000, 52, "ok"], [1400425948000, 18, "ok"], [1400425949000, 26, "fail"], [1400425950000, 93, "offline"]]
};
var INDEXED_DATA = {
  index: "1d-625",
  name: "traffic",
  columns: ["time", "value", "status"],
  points: [[1400425947000, 52, "ok"], [1400425948000, 18, "ok"], [1400425949000, 26, "fail"], [1400425950000, 93, "offline"]]
};
var AVAILABILITY_DATA = {
  name: "availability",
  columns: ["index", "uptime"],
  points: [["2014-07", "100%"], ["2014-08", "88%"], ["2014-09", "95%"], ["2014-10", "99%"], ["2014-11", "91%"], ["2014-12", "99%"], ["2015-01", "100%"], ["2015-02", "92%"], ["2015-03", "99%"], ["2015-04", "87%"], ["2015-05", "92%"], ["2015-06", "100%"]]
};
var AVAILABILITY_DATA_2 = {
  name: "availability",
  columns: ["index", "uptime", "notes", "outages"],
  points: [["2014-07", 100, "", 2], ["2014-08", 88, "", 17], ["2014-09", 95, "", 6], ["2014-10", 99, "", 3], ["2014-11", 91, "", 14], ["2014-12", 99, "", 3], ["2015-01", 100, "", 0], ["2015-02", 92, "", 12], ["2015-03", 99, "Minor outage March 2", 4], ["2015-04", 87, "Planned downtime in April", 82], ["2015-05", 92, "Router failure June 12", 26], ["2015-06", 100, "", 0]]
};
var INTERFACE_TEST_DATA = {
  name: "star-cr5:to_anl_ip-a_v4",
  description: "star-cr5->anl(as683):100ge:site-ex:show:intercloud",
  device: "star-cr5",
  id: 169,
  interface: "to_anl_ip-a_v4",
  is_ipv6: false,
  is_oscars: false,
  oscars_id: null,
  resource_uri: "",
  site: "anl",
  site_device: "noni",
  site_interface: "et-1/0/0",
  stats_type: "Standard",
  title: null,
  columns: ["time", "in", "out"],
  points: [[1400425947000, 52, 34], [1400425948000, 18, 13], [1400425949000, 26, 67], [1400425950000, 93, 91]]
};
var TRAFFIC_BNL_TO_NEWY = {
  name: "BNL to NEWY",
  columns: ["time", "in"],
  points: [[1441051950000, 2998846524.2666664], [1441051980000, 2682032885.3333335], [1441052010000, 2753537586.9333334]]
};
var TRAFFIC_NEWY_TO_BNL = {
  name: "NEWY to BNL",
  columns: ["time", "out"],
  points: [[1441051950000, 22034579982.4], [1441051980000, 24783871443.2], [1441052010000, 26907368572.800003]]
};
var fmt = "YYYY-MM-DD HH:mm";
var BISECT_TEST_DATA = {
  name: "test",
  columns: ["time", "value"],
  points: [[(0, _moment.default)("2012-01-11 01:00", fmt).valueOf(), 22], [(0, _moment.default)("2012-01-11 02:00", fmt).valueOf(), 33], [(0, _moment.default)("2012-01-11 03:00", fmt).valueOf(), 44], [(0, _moment.default)("2012-01-11 04:00", fmt).valueOf(), 55], [(0, _moment.default)("2012-01-11 05:00", fmt).valueOf(), 66], [(0, _moment.default)("2012-01-11 06:00", fmt).valueOf(), 77], [(0, _moment.default)("2012-01-11 07:00", fmt).valueOf(), 88]]
};
var TRAFFIC_DATA_IN = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "in"],
  points: [[1400425947000, 52], [1400425948000, 18], [1400425949000, 26], [1400425950000, 93]]
};
var TRAFFIC_DATA_OUT = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "out"],
  points: [[1400425947000, 34], [1400425948000, 13], [1400425949000, 67], [1400425950000, 91]]
};
var PARTIAL_TRAFFIC_PART_A = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "value"],
  points: [[1400425947000, 34], [1400425948000, 13], [1400425949000, 67], [1400425950000, 91]]
};
var PARTIAL_TRAFFIC_PART_B = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "value"],
  points: [[1400425951000, 65], [1400425952000, 86], [1400425953000, 27], [1400425954000, 72]]
};
var OUTAGE_EVENT_LIST = [{
  startTime: "2015-03-04T09:00:00Z",
  endTime: "2015-03-04T14:00:00Z",
  title: "ANL Scheduled Maintenance",
  description: "ANL will be switching border routers...",
  completed: true,
  external_ticket: "",
  esnet_ticket: "ESNET-20150302-002",
  organization: "ANL",
  type: "Planned"
}, {
  startTime: "2015-04-22T03:30:00Z",
  endTime: "2015-04-22T13:00:00Z",
  description: "At 13:33 pacific circuit 06519 went down.",
  title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
  completed: true,
  external_ticket: "",
  esnet_ticket: "ESNET-20150421-013",
  organization: "Internet2 / Level 3",
  type: "Unplanned"
}, {
  startTime: "2015-04-22T03:35:00Z",
  endTime: "2015-04-22T16:50:00Z",
  title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
  description: "The listed circuit was unavailable due to bent pins.",
  completed: true,
  external_ticket: "3576:144",
  esnet_ticket: "ESNET-20150421-013",
  organization: "Internet2 / Level 3",
  type: "Unplanned"
}];
var sumPart1 = {
  name: "part1",
  columns: ["time", "in", "out"],
  points: [[1400425951000, 1, 6], [1400425952000, 2, 7], [1400425953000, 3, 8], [1400425954000, 4, 9]]
};
var sumPart2 = {
  name: "part2",
  columns: ["time", "in", "out"],
  points: [[1400425951000, 9, 1], [1400425952000, 7, 2], [1400425953000, 5, 3], [1400425954000, 3, 4]]
};
var sept2014Data = {
  utc: false,
  name: "traffic",
  columns: ["time", "value"],
  points: [[1409529600000, 80], [1409533200000, 88], [1409536800000, 52], [1409540400000, 80], [1409544000000, 26], [1409547600000, 37], [1409551200000, 6], [1409554800000, 32], [1409558400000, 69], [1409562000000, 21], [1409565600000, 6], [1409569200000, 54], [1409572800000, 88], [1409576400000, 41], [1409580000000, 35], [1409583600000, 43], [1409587200000, 84], [1409590800000, 32], [1409594400000, 41], [1409598000000, 57], [1409601600000, 27], [1409605200000, 50], [1409608800000, 13], [1409612400000, 63], [1409616000000, 58], [1409619600000, 80], [1409623200000, 59], [1409626800000, 96], [1409630400000, 2], [1409634000000, 20], [1409637600000, 64], [1409641200000, 7], [1409644800000, 50], [1409648400000, 88], [1409652000000, 34], [1409655600000, 31], [1409659200000, 16], [1409662800000, 38], [1409666400000, 94], [1409670000000, 78], [1409673600000, 86], [1409677200000, 13], [1409680800000, 34], [1409684400000, 29], [1409688000000, 48], [1409691600000, 80], [1409695200000, 30], [1409698800000, 15], [1409702400000, 62], [1409706000000, 66], [1409709600000, 44], [1409713200000, 94], [1409716800000, 78], [1409720400000, 29], [1409724000000, 21], [1409727600000, 4], [1409731200000, 83], [1409734800000, 15], [1409738400000, 89], [1409742000000, 53], [1409745600000, 70], [1409749200000, 41], [1409752800000, 47], [1409756400000, 30], [1409760000000, 68], [1409763600000, 89], [1409767200000, 29], [1409770800000, 17], [1409774400000, 38], [1409778000000, 67], [1409781600000, 75], [1409785200000, 89], [1409788800000, 47], [1409792400000, 82], [1409796000000, 33], [1409799600000, 67], [1409803200000, 93], [1409806800000, 86], [1409810400000, 97], [1409814000000, 19], [1409817600000, 19], [1409821200000, 31], [1409824800000, 56], [1409828400000, 19], [1409832000000, 43], [1409835600000, 29], [1409839200000, 72], [1409842800000, 27], [1409846400000, 21], [1409850000000, 88], [1409853600000, 18], [1409857200000, 30], [1409860800000, 46], [1409864400000, 34], [1409868000000, 31], [1409871600000, 20], [1409875200000, 45], [1409878800000, 17], [1409882400000, 24], [1409886000000, 84], [1409889600000, 6], [1409893200000, 91], [1409896800000, 82], [1409900400000, 71], [1409904000000, 97], [1409907600000, 43], [1409911200000, 38], [1409914800000, 1], [1409918400000, 71], [1409922000000, 50], [1409925600000, 19], [1409929200000, 19], [1409932800000, 86], [1409936400000, 65], [1409940000000, 93], [1409943600000, 35]]
};
var TIMERANGE_EVENT_LIST = OUTAGE_EVENT_LIST.map(event => {
  var {
    startTime,
    endTime
  } = event,
      other = (0, _objectWithoutProperties2.default)(event, ["startTime", "endTime"]); //eslint-disable-line

  var b = new Date(startTime);
  var e = new Date(endTime);
  return new _timerangeevent.default(new _timerange.default(b, e), other);
}); //
// TESTS
//

it("can create an series with our wire format", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  expect(series).toBeDefined();
});
it("can create an series with a list of Events", () => {
  var events = [];
  events.push(new _timeevent.default(new Date(2015, 7, 1), {
    value: 27
  }));
  events.push(new _timeevent.default(new Date(2015, 8, 1), {
    value: 14
  }));
  var series = new _timeseries.default({
    name: "events",
    events
  });
  expect(series.size()).toBe(2);
});
it("can create an series with no events", () => {
  var events = [];
  var series = new _timeseries.default({
    name: "events",
    events
  });
  expect(series.size()).toBe(0);
}); //
// Basic Query API
//

it("can return the size of the series", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  expect(series.size()).toBe(4);
});
it("can return an item in the series as an event", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var event = series.at(1);
  expect(event instanceof _timeevent.default).toBeTruthy();
});
it("can return an item in the series with the correct data", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var event = series.at(1);
  expect(JSON.stringify(event.data())).toBe("{\"value\":18,\"status\":\"ok\"}");
  expect(event.timestamp().getTime()).toBe(1400425948000);
});
it("can serialize to a string", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var expectedString = "{\"name\":\"traffic\",\"utc\":true,\"columns\":[\"time\",\"value\",\"status\"],\"points\":[[1400425947000,52,\"ok\"],[1400425948000,18,\"ok\"],[1400425949000,26,\"fail\"],[1400425950000,93,\"offline\"]]}";
  expect(series.toString()).toBe(expectedString);
});
it("can return the time range of the series", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var expectedString = "[Sun, 18 May 2014 15:12:27 GMT, Sun, 18 May 2014 15:12:30 GMT]";
  expect(series.timerange().toUTCString()).toBe(expectedString);
}); //
// Meta data
//

it("can create a series with meta data and get that data back", () => {
  var series = new _timeseries.default(INTERFACE_TEST_DATA);
  var expected = "{\"site_interface\":\"et-1/0/0\",\"utc\":true,\"site\":\"anl\",\"name\":\"star-cr5:to_anl_ip-a_v4\",\"site_device\":\"noni\",\"device\":\"star-cr5\",\"oscars_id\":null,\"title\":null,\"is_oscars\":false,\"interface\":\"to_anl_ip-a_v4\",\"stats_type\":\"Standard\",\"id\":169,\"resource_uri\":\"\",\"is_ipv6\":false,\"description\":\"star-cr5->anl(as683):100ge:site-ex:show:intercloud\",\"columns\":[\"time\",\"in\",\"out\"],\"points\":[[1400425947000,52,34],[1400425948000,18,13],[1400425949000,26,67],[1400425950000,93,91]]}";
  expect(series.toString()).toBe(expected);
  expect(series.meta("interface")).toBe("to_anl_ip-a_v4");
});
it("can create a series and set a new name", () => {
  var series = new _timeseries.default(INTERFACE_TEST_DATA);
  expect(series.name()).toBe("star-cr5:to_anl_ip-a_v4");
  var newSeries = series.setName("bob");
  expect(newSeries.name()).toBe("bob");
});
it("can create a series with meta data and get that data back", () => {
  var series = new _timeseries.default(INTERFACE_TEST_DATA);
  expect(series.meta("site_interface")).toBe("et-1/0/0");
  var newSeries = series.setMeta("site_interface", "bob");
  expect(newSeries.meta("site_interface")).toBe("bob");
  expect(newSeries.at(0).get("in")).toBe(52);
  expect(newSeries.meta("site")).toBe("anl");
}); //
// Deep event data
//

it("can create a series with a nested object", () => {
  var series = new _timeseries.default({
    name: "Map Traffic",
    columns: ["time", "NASA_north", "NASA_south"],
    points: [[1400425951000, {
      in: 100,
      out: 200
    }, {
      in: 145,
      out: 135
    }], [1400425952000, {
      in: 200,
      out: 400
    }, {
      in: 146,
      out: 142
    }], [1400425953000, {
      in: 300,
      out: 600
    }, {
      in: 147,
      out: 158
    }], [1400425954000, {
      in: 400,
      out: 800
    }, {
      in: 155,
      out: 175
    }]]
  });
  expect(series.at(0).get("NASA_north").in).toBe(100);
  expect(series.at(0).get("NASA_north").out).toBe(200);
});
it("can create a series with nested events", () => {
  var events = [];
  events.push(new _timeevent.default(new Date(2015, 6, 1), {
    NASA_north: {
      in: 100,
      out: 200
    },
    NASA_south: {
      in: 145,
      out: 135
    }
  }));
  events.push(new _timeevent.default(new Date(2015, 7, 1), {
    NASA_north: {
      in: 200,
      out: 400
    },
    NASA_south: {
      in: 146,
      out: 142
    }
  }));
  events.push(new _timeevent.default(new Date(2015, 8, 1), {
    NASA_north: {
      in: 300,
      out: 600
    },
    NASA_south: {
      in: 147,
      out: 158
    }
  }));
  events.push(new _timeevent.default(new Date(2015, 9, 1), {
    NASA_north: {
      in: 400,
      out: 800
    },
    NASA_south: {
      in: 155,
      out: 175
    }
  }));
  var series = new _timeseries.default({
    name: "Map traffic",
    events
  });
  expect(series.at(0).get("NASA_north").in).toBe(100);
  expect(series.at(3).get("NASA_south").out).toBe(175);
  expect(series.size()).toBe(4);
}); //
// Comparing TimeSeries with each other
//

it("can compare a series and a reference to a series as being equal", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var refSeries = series;
  expect(series).toBe(refSeries);
});
it("can use the equals() comparator to compare a series and a copy of the series as true", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var copyOfSeries = new _timeseries.default(series);
  expect(_timeseries.default.equal(series, copyOfSeries)).toBeTruthy;
});
it("can use the equals() comparator to compare a series and a value equivalent series as false", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var otherSeries = new _timeseries.default(TIMESERIES_TEST_DATA);
  expect(_timeseries.default.equal(series, otherSeries)).toBeFalsy;
});
it("can use the is() comparator to compare a series and a value equivalent series as true", () => {
  var series = new _timeseries.default(TIMESERIES_TEST_DATA);
  var otherSeries = new _timeseries.default(TIMESERIES_TEST_DATA);
  expect(_timeseries.default.is(series, otherSeries)).toBeTruthy;
}); //
// Bisect
//

it("can find the bisect starting from 0", () => {
  var series = new _timeseries.default(BISECT_TEST_DATA);
  expect(series.bisect((0, _moment.default)("2012-01-11 00:30", fmt).toDate())).toBe(0);
  expect(series.bisect((0, _moment.default)("2012-01-11 03:00", fmt).toDate())).toBe(2);
  expect(series.bisect((0, _moment.default)("2012-01-11 03:30", fmt).toDate())).toBe(2);
  expect(series.bisect((0, _moment.default)("2012-01-11 08:00", fmt).toDate())).toBe(6);
});
it("can find the bisect starting from an begin index", () => {
  var series = new _timeseries.default(BISECT_TEST_DATA);
  expect(series.bisect((0, _moment.default)("2012-01-11 03:00", fmt).toDate(), 2)).toBe(2);
  expect(series.bisect((0, _moment.default)("2012-01-11 03:30", fmt).toDate(), 3)).toBe(2);
  expect(series.bisect((0, _moment.default)("2012-01-11 03:30", fmt).toDate(), 4)).toBe(3);
  var first = series.bisect((0, _moment.default)("2012-01-11 03:30", fmt).toDate());
  var second = series.bisect((0, _moment.default)("2012-01-11 04:30", fmt).toDate(), first);
  expect(series.at(first).get()).toBe(44);
  expect(series.at(second).get()).toBe(55);
}); //
// TimeRangeEvents
//

it("can make a timeseries with the right timerange", () => {
  var series = new _timeseries.default({
    name: "outages",
    events: TIMERANGE_EVENT_LIST
  });
  expect(series.range().toString()).toBe("[1425459600000,1429721400000]");
});
it("can make a timeseries that can be serialized to a string", () => {
  var series = new _timeseries.default({
    name: "outages",
    events: TIMERANGE_EVENT_LIST
  });
  var expected = "{\"name\":\"outages\",\"utc\":true,\"columns\":[\"timerange\",\"title\",\"description\",\"completed\",\"external_ticket\",\"esnet_ticket\",\"organization\",\"type\"],\"points\":[[[1425459600000,1425477600000],\"ANL Scheduled Maintenance\",\"ANL will be switching border routers...\",true,\"\",\"ESNET-20150302-002\",\"ANL\",\"Planned\"],[[1429673400000,1429707600000],\"STAR-CR5 < 100 ge 06519 > ANL  - Outage\",\"At 13:33 pacific circuit 06519 went down.\",true,\"\",\"ESNET-20150421-013\",\"Internet2 / Level 3\",\"Unplanned\"],[[1429673700000,1429721400000],\"STAR-CR5 < 100 ge 06519 > ANL  - Outage\",\"The listed circuit was unavailable due to bent pins.\",true,\"3576:144\",\"ESNET-20150421-013\",\"Internet2 / Level 3\",\"Unplanned\"]]}";
  expect(series.toString()).toBe(expected);
});
it("can make a timeseries that can be serialized to JSON and then used to construct a TimeSeries again", () => {
  var series = new _timeseries.default({
    name: "outages",
    events: TIMERANGE_EVENT_LIST
  });
  var newSeries = new _timeseries.default(series.toJSON());
  expect(series.toString()).toBe(newSeries.toString());
}); //
// IndexedEvents
//

it("can serialize to a string", () => {
  var series = new _timeseries.default(INDEXED_DATA);
  var expectedString = "{\"index\":\"1d-625\",\"name\":\"traffic\",\"utc\":true,\"columns\":[\"time\",\"value\",\"status\"],\"points\":[[1400425947000,52,\"ok\"],[1400425948000,18,\"ok\"],[1400425949000,26,\"fail\"],[1400425950000,93,\"offline\"]]}";
  expect(series.toString()).toBe(expectedString);
});
it("can return the time range of the series", () => {
  var series = new _timeseries.default(INDEXED_DATA);
  var expectedString = "[Sat, 18 Sep 1971 00:00:00 GMT, Sun, 19 Sep 1971 00:00:00 GMT]";
  expect(series.indexAsRange().toUTCString()).toBe(expectedString);
});
it("can create an series with indexed data (in UTC time)", () => {
  var series = new _timeseries.default(AVAILABILITY_DATA);
  var event = series.at(2);
  expect(event.timerangeAsUTCString()).toBe("[Mon, 01 Sep 2014 00:00:00 GMT, Tue, 30 Sep 2014 23:59:59 GMT]");
  expect(series.range().begin().getTime()).toBe(1404172800000);
  expect(series.range().end().getTime()).toBe(1435708799999);
}); //
// Slicing a TimeSeries
//

it("can create a slice of a series", () => {
  var series = new _timeseries.default(AVAILABILITY_DATA);
  var expectedLastTwo = "{\"name\":\"availability\",\"utc\":true,\"columns\":[\"index\",\"uptime\"],\"points\":[[\"2015-05\",\"92%\"],[\"2015-06\",\"100%\"]]}";
  var lastTwo = series.slice(-2);
  expect(lastTwo.toString()).toBe(expectedLastTwo);
  var expectedFirstThree = "{\"name\":\"availability\",\"utc\":true,\"columns\":[\"index\",\"uptime\"],\"points\":[[\"2014-07\",\"100%\"],[\"2014-08\",\"88%\"],[\"2014-09\",\"95%\"]]}";
  var firstThree = series.slice(0, 3);
  expect(firstThree.toString()).toBe(expectedFirstThree);
  var expectedAll = "{\"name\":\"availability\",\"utc\":true,\"columns\":[\"index\",\"uptime\"],\"points\":[[\"2014-07\",\"100%\"],[\"2014-08\",\"88%\"],[\"2014-09\",\"95%\"],[\"2014-10\",\"99%\"],[\"2014-11\",\"91%\"],[\"2014-12\",\"99%\"],[\"2015-01\",\"100%\"],[\"2015-02\",\"92%\"],[\"2015-03\",\"99%\"],[\"2015-04\",\"87%\"],[\"2015-05\",\"92%\"],[\"2015-06\",\"100%\"]]}";
  var sliceAll = series.slice();
  expect(sliceAll.toString()).toBe(expectedAll);
}); //
// Cropping a TimeSeries
//

it("can create crop a series", () => {
  var series = new _timeseries.default({
    name: 'exact timestamps',
    columns: ['time', 'value'],
    points: [[1504014065240, 1], [1504014065243, 2], [1504014065244, 3], [1504014065245, 4], [1504014065249, 5]]
  });
  var ts1 = series.crop(new _timerange.default([1504014065243, 1504014065245]));
  expect(ts1.size()).toBe(3);
  var ts2 = series.crop(new _timerange.default([1504014065242, 1504014065245]));
  expect(ts2.size()).toBe(3);
  var ts3 = series.crop(new _timerange.default([1504014065243, 1504014065247]));
  expect(ts3.size()).toBe(3);
  var ts4 = series.crop(new _timerange.default([1504014065242, 1504014065247]));
  expect(ts4.size()).toBe(3);
}); //
// Merging two TimeSeries together
//

it("can merge two timeseries columns together using merge", () => {
  var inTraffic = new _timeseries.default(TRAFFIC_DATA_IN);
  var outTraffic = new _timeseries.default(TRAFFIC_DATA_OUT);

  var trafficSeries = _timeseries.default.timeSeriesListMerge({
    name: "traffic",
    seriesList: [inTraffic, outTraffic]
  });

  expect(trafficSeries.at(2).get("in")).toBe(26);
  expect(trafficSeries.at(2).get("out")).toBe(67);
});
it("can append two timeseries together using merge", () => {
  var tile1 = new _timeseries.default(PARTIAL_TRAFFIC_PART_A);
  var tile2 = new _timeseries.default(PARTIAL_TRAFFIC_PART_B);

  var trafficSeries = _timeseries.default.timeSeriesListMerge({
    name: "traffic",
    source: "router",
    seriesList: [tile1, tile2]
  });

  expect(trafficSeries.size()).toBe(8);
  expect(trafficSeries.at(0).get()).toBe(34);
  expect(trafficSeries.at(1).get()).toBe(13);
  expect(trafficSeries.at(2).get()).toBe(67);
  expect(trafficSeries.at(3).get()).toBe(91);
  expect(trafficSeries.at(4).get()).toBe(65);
  expect(trafficSeries.at(5).get()).toBe(86);
  expect(trafficSeries.at(6).get()).toBe(27);
  expect(trafficSeries.at(7).get()).toBe(72);
  expect(trafficSeries.name()).toBe("traffic");
  expect(trafficSeries.meta("source")).toBe("router");
});
it("can merge two series and preserve the correct time format", () => {
  var inTraffic = new _timeseries.default(TRAFFIC_BNL_TO_NEWY);
  var outTraffic = new _timeseries.default(TRAFFIC_NEWY_TO_BNL);

  var trafficSeries = _timeseries.default.timeSeriesListMerge({
    name: "traffic",
    seriesList: [inTraffic, outTraffic]
  });

  expect(trafficSeries.at(0).timestampAsUTCString()).toBe("Mon, 31 Aug 2015 20:12:30 GMT");
  expect(trafficSeries.at(1).timestampAsUTCString()).toBe("Mon, 31 Aug 2015 20:13:00 GMT");
  expect(trafficSeries.at(2).timestampAsUTCString()).toBe("Mon, 31 Aug 2015 20:13:30 GMT");
});
it("can merge two irregular time series together", () => {
  var A = {
    name: "a",
    columns: ["time", "valueA"],
    points: [[1400425947000, 34], [1400425948000, 13], [1400425949000, 67], [1400425950000, 91]]
  };
  var B = {
    name: "b",
    columns: ["time", "valueB"],
    points: [[1400425951000, 65], [1400425952000, 86], [1400425953000, 27], [1400425954000, 72]]
  };
  var tile1 = new _timeseries.default(A);
  var tile2 = new _timeseries.default(B);

  var series = _timeseries.default.timeSeriesListMerge({
    name: "traffic",
    seriesList: [tile1, tile2]
  });

  var expected = "{\"name\":\"traffic\",\"utc\":true,\"columns\":[\"time\",\"valueA\",\"valueB\"],\"points\":[[1400425947000,34,null],[1400425948000,13,null],[1400425949000,67,null],[1400425950000,91,null],[1400425951000,null,65],[1400425952000,null,86],[1400425953000,null,27],[1400425954000,null,72]]}";
  expect(series.toString()).toBe(expected);
}); //
// Summing two TimeSeries together
//

it("can merge two timeseries into a new timeseries that is the sum", () => {
  var part1 = new _timeseries.default(sumPart1);
  var part2 = new _timeseries.default(sumPart2);

  var result = _timeseries.default.timeSeriesListReduce({
    name: "sum",
    seriesList: [part1, part2],
    reducer: (0, _functions.sum)(),
    fieldSpec: ["in", "out"]
  }); //10, 9, 8, 7


  expect(result.at(0).get("in")).toBe(10);
  expect(result.at(1).get("in")).toBe(9);
  expect(result.at(2).get("in")).toBe(8);
  expect(result.at(3).get("in")).toBe(7); //7, 9, 11, 13

  expect(result.at(0).get("out")).toBe(7);
  expect(result.at(1).get("out")).toBe(9);
  expect(result.at(2).get("out")).toBe(11);
  expect(result.at(3).get("out")).toBe(13);
}); //
// Avergage two timeseries together
//

it("can merge two timeseries into a new timeseries that is the sum", () => {
  var part1 = new _timeseries.default({
    name: "part1",
    columns: ["time", "in", "out"],
    points: [[1400425951000, 1, 6], [1400425952000, 2, 7], [1400425953000, 3, 8], [1400425954000, 4, 9]]
  });
  var part2 = new _timeseries.default({
    name: "part2",
    columns: ["time", "in", "out"],
    points: [[1400425951000, 9, 1], [1400425952000, 7, 2], [1400425953000, 5, 3], [1400425954000, 3, 4]]
  });

  var avgSeries = _timeseries.default.timeSeriesListReduce({
    name: "avg",
    seriesList: [part1, part2],
    fieldSpec: ["in", "out"],
    reducer: (0, _functions.avg)()
  });

  expect(avgSeries.at(0).get("in")).toBe(5);
  expect(avgSeries.at(1).get("in")).toBe(4.5);
  expect(avgSeries.at(2).get("in")).toBe(4);
  expect(avgSeries.at(3).get("in")).toBe(3.5);
  expect(avgSeries.at(0).get("out")).toBe(3.5);
  expect(avgSeries.at(1).get("out")).toBe(4.5);
  expect(avgSeries.at(2).get("out")).toBe(5.5);
  expect(avgSeries.at(3).get("out")).toBe(6.5);

  var avgSeries2 = _timeseries.default.timeSeriesListReduce({
    name: "avg",
    seriesList: [part1, part2],
    reducer: (0, _functions.avg)(),
    fieldSpec: ["in", "out"]
  });

  expect(avgSeries2.at(0).get("in")).toBe(5);
  expect(avgSeries2.at(1).get("in")).toBe(4.5);
  expect(avgSeries2.at(2).get("in")).toBe(4);
  expect(avgSeries2.at(3).get("in")).toBe(3.5);
}); //
// Collapse down columns in a TimeSeries
//

it("can collapse a timeseries into a new timeseries that is the sum of two columns", () => {
  var ts = new _timeseries.default(sumPart1);
  var sums = ts.collapse({
    name: "sum",
    fieldSpecList: ["in", "out"],
    reducer: (0, _functions.sum)(),
    append: false
  });
  expect(sums.at(0).get("sum")).toBe(7);
  expect(sums.at(1).get("sum")).toBe(9);
  expect(sums.at(2).get("sum")).toBe(11);
  expect(sums.at(3).get("sum")).toBe(13);
});
it("can collapse a timeseries into a new timeseries that is the max of two columns", () => {
  var timeseries = new _timeseries.default(sumPart2);
  var c = timeseries.collapse({
    name: "max_in_out",
    fieldSpecList: ["in", "out"],
    reducer: (0, _functions.max)(),
    append: true
  });
  expect(c.at(0).get("max_in_out")).toBe(9);
  expect(c.at(1).get("max_in_out")).toBe(7);
  expect(c.at(2).get("max_in_out")).toBe(5);
  expect(c.at(3).get("max_in_out")).toBe(4);
});
it("can collapse a timeseries into a new timeseries that is the sum of two columns, then find the max", () => {
  var ts = new _timeseries.default(sumPart1);
  var sums = ts.collapse({
    name: "value",
    fieldSpecList: ["in", "out"],
    reducer: (0, _functions.sum)(),
    append: false
  });
  expect(sums.max()).toBe(13);
}); //
// Select specific columns in a TimeSeries
//

it("can select a single column from a TimeSeries", () => {
  var timeseries = new _timeseries.default(INTERFACE_TEST_DATA);
  expect(timeseries.columns()).toEqual(["in", "out"]);
  var ts = timeseries.select({
    fieldSpec: "in"
  });
  expect(ts.columns()).toEqual(["in"]);
  expect(ts.name()).toBe("star-cr5:to_anl_ip-a_v4");
});
it("can select multiple columns from a TimeSeries", () => {
  var timeseries = new _timeseries.default(AVAILABILITY_DATA_2);
  expect(timeseries.columns()).toEqual(["uptime", "notes", "outages"]);
  var ts = timeseries.select({
    fieldSpec: ["uptime", "notes"]
  });
  expect(ts.columns()).toEqual(["uptime", "notes"]);
  expect(ts.name()).toBe("availability");
}); //
// Remapping Events in a TimeSeries
//

it("can use re-mapping to reverse the values in a TimeSeries", () => {
  var timeseries = new _timeseries.default(INTERFACE_TEST_DATA);
  expect(timeseries.columns()).toEqual(["in", "out"]);
  var ts = timeseries.map(e => e.setData({
    in: e.get("out"),
    out: e.get("in")
  }));
  expect(ts.at(0).get("in")).toBe(34);
  expect(ts.at(0).get("out")).toBe(52);
  expect(ts.size()).toBe(timeseries.size());
}); //
// Rollups
//

it("can generate 1 day fixed window averages over a TimeSeries", () => {
  var timeseries = new _timeseries.default(sept2014Data);
  var dailyAvg = timeseries.fixedWindowRollup({
    windowSize: "1d",
    aggregation: {
      value: {
        value: (0, _functions.avg)()
      }
    }
  });
  expect(dailyAvg.size()).toBe(5);
  expect(dailyAvg.at(0).value()).toBe(46.875);
  expect(dailyAvg.at(2).value()).toBe(54.083333333333336);
  expect(dailyAvg.at(4).value()).toBe(51.85);
});
it("can make Collections for each day in the TimeSeries", () => {
  var timeseries = new _timeseries.default(sept2014Data);
  var collections = timeseries.collectByFixedWindow({
    windowSize: "1d"
  });
  expect(collections["1d-16314"].size()).toBe(24);
  expect(collections["1d-16318"].size()).toBe(20);
});
it("can correctly use atTime()", () => {
  var t = new Date(1476803711641);
  var collection = new _collection.default();
  collection = collection.addEvent(new _timeevent.default(t, 2)); // Test bisect to get element 0

  var ts = new _timeseries.default({
    collection
  });
  var bisect = ts.bisect(t);
  expect(bisect).toEqual(0);
  expect(ts.at(bisect).value()).toEqual(2); // Test atTime to get element 0

  expect(ts.atTime(t).value()).toEqual(2);
});

class StatusEvent extends _timeevent.default {
  constructor(arg1, arg2) {
    super(arg1, arg2);
  }

  static dataSchema() {
    return {
      type: "record",
      fields: [{
        name: "value",
        type: "long"
      }, {
        name: "status",
        type: "string"
      }]
    };
  }

}

class StatusSeries extends _timeseries.default {
  constructor(arg) {
    super(arg);
  }

  metaSchema() {
    return [{
      name: "name",
      type: "string"
    }];
  }

  static event(key) {
    return StatusEvent;
  }

}