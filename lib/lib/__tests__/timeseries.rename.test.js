"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _collection = _interopRequireDefault(require("../collection"));

var _collectionout = _interopRequireDefault(require("../io/collectionout"));

var _timeevent = _interopRequireDefault(require("../timeevent"));

var _timeseries = _interopRequireDefault(require("../timeseries"));

var _stream = _interopRequireDefault(require("../io/stream"));

var _pipeline = require("../pipeline");

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
var EVENT_LIST = [new _timeevent.default(1429673400000, {
  in: 1,
  out: 2
}), new _timeevent.default(1429673460000, {
  in: 3,
  out: 4
}), new _timeevent.default(1429673520000, {
  in: 5,
  out: 6
})];
var TICKET_RANGE = {
  name: "outages",
  columns: ["timerange", "title", "esnet_ticket"],
  points: [[[1429673400000, 1429707600000], "BOOM", "ESNET-20080101-001"], [[1429673400000, 1429707600000], "BAM!", "ESNET-20080101-002"]]
};
var AVAILABILITY_DATA = {
  name: "availability",
  columns: ["index", "uptime"],
  points: [["2014-07", "100%"], ["2014-08", "88%"], ["2014-09", "95%"], ["2014-10", "99%"], ["2014-11", "91%"], ["2014-12", "99%"], ["2015-01", "100%"], ["2015-02", "92%"], ["2015-03", "99%"], ["2015-04", "87%"], ["2015-05", "92%"], ["2015-06", "100%"]]
};
it("can rename columns on an Event series", done => {
  var name = "collection";
  var collection = new _collection.default(EVENT_LIST);
  var ts = new _timeseries.default({
    name,
    collection
  });
  var renamed = ts.renameColumns({
    renameMap: {
      in: "new_in",
      out: "new_out"
    }
  });
  expect(renamed.at(0).get("new_in")).toEqual(ts.at(0).get("in"));
  expect(renamed.at(0).get("new_out")).toEqual(ts.at(0).get("out"));
  expect(renamed.at(1).get("new_in")).toEqual(ts.at(1).get("in"));
  expect(renamed.at(1).get("new_out")).toEqual(ts.at(1).get("out"));
  expect(renamed.at(0).timestamp().getTime()).toEqual(ts.at(0).timestamp().getTime());
  expect(renamed.at(1).timestamp().getTime()).toEqual(ts.at(1).timestamp().getTime());
  done();
});
it("can rename a columns on a TimeRangeEvent series", done => {
  var ts = new _timeseries.default(TICKET_RANGE);
  var renamed = ts.renameColumns({
    renameMap: {
      title: "event",
      esnet_ticket: "ticket"
    }
  });
  expect(renamed.at(0).get("event")).toEqual(ts.at(0).get("title"));
  expect(renamed.at(0).get("ticket")).toEqual(ts.at(0).get("esnet_ticket"));
  expect(renamed.at(1).get("event")).toEqual(ts.at(1).get("title"));
  expect(renamed.at(1).get("ticket")).toEqual(ts.at(1).get("esnet_ticket"));
  expect(renamed.at(0).timestamp().getTime()).toEqual(ts.at(0).timestamp().getTime());
  expect(renamed.at(1).timestamp().getTime()).toEqual(ts.at(1).timestamp().getTime());
  done();
});
it("can rename a columns on a IndexedEvent series", done => {
  var ts = new _timeseries.default(AVAILABILITY_DATA);
  var renamed = ts.renameColumns({
    renameMap: {
      uptime: "available"
    }
  });
  expect(renamed.at(0).get("available")).toEqual(ts.at(0).get("uptime"));
  expect(renamed.at(2).get("available")).toEqual(ts.at(2).get("uptime"));
  expect(renamed.at(4).get("available")).toEqual(ts.at(4).get("uptime"));
  expect(renamed.at(6).get("available")).toEqual(ts.at(6).get("uptime"));
  expect(renamed.at(0).timestamp()).toEqual(ts.at(0).timestamp());
  expect(renamed.at(1).timestamp()).toEqual(ts.at(1).timestamp());
  expect(renamed.at(2).timestamp()).toEqual(ts.at(2).timestamp());
  done();
});