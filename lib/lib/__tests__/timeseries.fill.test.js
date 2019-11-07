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
it("can use the TimeSeries.fill() to fill missing values with zero", () => {
  var ts = new _timeseries.default({
    name: "traffic",
    columns: ["time", "direction"],
    points: [[1400425947000, {
      in: 1,
      out: null
    }], [1400425948000, {
      in: null,
      out: 4
    }], [1400425949000, {
      in: 5,
      out: null
    }], [1400425950000, {
      in: null,
      out: 8
    }], [1400425960000, {
      in: 9,
      out: null
    }], [1400425970000, {
      in: null,
      out: 12
    }]]
  }); //
  // fill all columns, limit to 3
  //

  var newTS = ts.fill({
    fieldSpec: ["direction.in", "direction.out"],
    method: "zero",
    limit: 3
  });
  expect(newTS.size()).toBe(6);
  expect(newTS.at(0).get("direction.out")).toBe(0);
  expect(newTS.at(2).get("direction.out")).toBe(0);
  expect(newTS.at(1).get("direction.in")).toBe(0); //
  // fill one column, limit to 4 in result set
  //

  var newTS2 = ts.fill({
    fieldSpec: "direction.in",
    method: "zero",
    limit: 4
  });
  expect(newTS2.at(1).get("direction.in")).toEqual(0);
  expect(newTS2.at(3).get("direction.in")).toEqual(0);
  expect(newTS2.at(0).get("direction.out")).toBeNull();
  expect(newTS2.at(2).get("direction.out")).toBeNull();
});
it("can use TimeSeries.fill() on a more complex example with nested paths", () => {
  var ts = new _timeseries.default({
    name: "traffic",
    columns: ["time", "direction"],
    points: [[1400425947000, {
      in: {
        tcp: 1,
        udp: 3
      },
      out: {
        tcp: 2,
        udp: 3
      }
    }], [1400425948000, {
      in: {
        tcp: 3,
        udp: null
      },
      out: {
        tcp: 4,
        udp: 3
      }
    }], [1400425949000, {
      in: {
        tcp: 5,
        udp: null
      },
      out: {
        tcp: null,
        udp: 3
      }
    }], [1400425950000, {
      in: {
        tcp: 7,
        udp: null
      },
      out: {
        tcp: null,
        udp: 3
      }
    }], [1400425960000, {
      in: {
        tcp: 9,
        udp: 4
      },
      out: {
        tcp: 6,
        udp: 3
      }
    }], [1400425970000, {
      in: {
        tcp: 11,
        udp: 5
      },
      out: {
        tcp: 8,
        udp: 3
      }
    }]]
  });
  var newTS = ts.fill({
    fieldSpec: ["direction.out.tcp", "direction.in.udp"]
  });
  expect(newTS.at(0).get("direction.in.udp")).toBe(3);
  expect(newTS.at(1).get("direction.in.udp")).toBe(0); // fill

  expect(newTS.at(2).get("direction.in.udp")).toBe(0); // fill

  expect(newTS.at(3).get("direction.in.udp")).toBe(0); // fill

  expect(newTS.at(4).get("direction.in.udp")).toBe(4);
  expect(newTS.at(5).get("direction.in.udp")).toBe(5);
  expect(newTS.at(0).get("direction.out.tcp")).toBe(2);
  expect(newTS.at(1).get("direction.out.tcp")).toBe(4);
  expect(newTS.at(2).get("direction.out.tcp")).toBe(0); // fill

  expect(newTS.at(3).get("direction.out.tcp")).toBe(0); // fill

  expect(newTS.at(4).get("direction.out.tcp")).toBe(6);
  expect(newTS.at(5).get("direction.out.tcp")).toBe(8); //
  // do it again, but only fill the out.tcp
  //

  var newTS2 = ts.fill({
    fieldSpec: ["direction.out.tcp"]
  });
  expect(newTS2.at(0).get("direction.out.tcp")).toBe(2);
  expect(newTS2.at(1).get("direction.out.tcp")).toBe(4);
  expect(newTS2.at(2).get("direction.out.tcp")).toBe(0); // fill

  expect(newTS2.at(3).get("direction.out.tcp")).toBe(0); // fill

  expect(newTS2.at(4).get("direction.out.tcp")).toBe(6);
  expect(newTS2.at(5).get("direction.out.tcp")).toBe(8);
  expect(newTS2.at(0).get("direction.in.udp")).toBe(3);
  expect(newTS2.at(1).get("direction.in.udp")).toBeNull(); // no fill

  expect(newTS2.at(2).get("direction.in.udp")).toBeNull(); // no fill

  expect(newTS2.at(3).get("direction.in.udp")).toBeNull(); // no fill

  expect(newTS2.at(4).get("direction.in.udp")).toBe(4);
  expect(newTS2.at(5).get("direction.in.udp")).toBe(5);
});
it("can use TimeSeries.fill() with limit pad and zero filling", () => {
  var ts = new _timeseries.default({
    name: "traffic",
    columns: ["time", "direction"],
    points: [[1400425947000, {
      in: 1,
      out: null
    }], [1400425948000, {
      in: null,
      out: null
    }], [1400425949000, {
      in: null,
      out: null
    }], [1400425950000, {
      in: 3,
      out: 8
    }], [1400425960000, {
      in: null,
      out: null
    }], [1400425970000, {
      in: null,
      out: 12
    }], [1400425980000, {
      in: null,
      out: 13
    }], [1400425990000, {
      in: 7,
      out: null
    }], [1400426000000, {
      in: 8,
      out: null
    }], [1400426010000, {
      in: 9,
      out: null
    }], [1400426020000, {
      in: 10,
      out: null
    }]]
  }); //verify fill limit for zero fill

  var zeroTS = ts.fill({
    fieldSpec: ["direction.in", "direction.out"],
    method: "zero",
    limit: 2
  });
  expect(zeroTS.at(0).get("direction.in")).toBe(1);
  expect(zeroTS.at(1).get("direction.in")).toBe(0); // fill

  expect(zeroTS.at(2).get("direction.in")).toBe(0); // fill

  expect(zeroTS.at(3).get("direction.in")).toBe(3);
  expect(zeroTS.at(4).get("direction.in")).toBe(0); // fill

  expect(zeroTS.at(5).get("direction.in")).toBe(0); // fill

  expect(zeroTS.at(6).get("direction.in")).toBeNull(); // over limit skip

  expect(zeroTS.at(7).get("direction.in")).toBe(7);
  expect(zeroTS.at(8).get("direction.in")).toBe(8);
  expect(zeroTS.at(9).get("direction.in")).toBe(9);
  expect(zeroTS.at(10).get("direction.in")).toBe(10);
  expect(zeroTS.at(0).get("direction.out")).toBe(0); // fill

  expect(zeroTS.at(1).get("direction.out")).toBe(0); // fill

  expect(zeroTS.at(2).get("direction.out")).toBeNull(); // over limit skip

  expect(zeroTS.at(3).get("direction.out")).toBe(8);
  expect(zeroTS.at(4).get("direction.out")).toBe(0); // fill

  expect(zeroTS.at(5).get("direction.out")).toBe(12);
  expect(zeroTS.at(6).get("direction.out")).toBe(13);
  expect(zeroTS.at(7).get("direction.out")).toBe(0); // fill

  expect(zeroTS.at(8).get("direction.out")).toBe(0); // fill

  expect(zeroTS.at(9).get("direction.out")).toBeNull(); // over limit skip

  expect(zeroTS.at(10).get("direction.out")).toBeNull(); // over limit skip
  // verify fill limit for pad fill

  var padTS = ts.fill({
    fieldSpec: ["direction.in", "direction.out"],
    method: "pad",
    limit: 2
  });
  expect(padTS.at(0).get("direction.in")).toBe(1);
  expect(padTS.at(1).get("direction.in")).toBe(1); // fill

  expect(padTS.at(2).get("direction.in")).toBe(1); // fill

  expect(padTS.at(3).get("direction.in")).toBe(3);
  expect(padTS.at(4).get("direction.in")).toBe(3); // fill

  expect(padTS.at(5).get("direction.in")).toBe(3); // fill

  expect(padTS.at(6).get("direction.in")).toBeNull(); // over limit skip

  expect(padTS.at(7).get("direction.in")).toBe(7);
  expect(padTS.at(8).get("direction.in")).toBe(8);
  expect(padTS.at(9).get("direction.in")).toBe(9);
  expect(padTS.at(10).get("direction.in")).toBe(10);
  expect(padTS.at(0).get("direction.out")).toBeNull(); // no fill start

  expect(padTS.at(1).get("direction.out")).toBeNull(); // no fill start

  expect(padTS.at(2).get("direction.out")).toBeNull(); // no fill start

  expect(padTS.at(3).get("direction.out")).toBe(8);
  expect(padTS.at(4).get("direction.out")).toBe(8); // fill

  expect(padTS.at(5).get("direction.out")).toBe(12);
  expect(padTS.at(6).get("direction.out")).toBe(13);
  expect(padTS.at(7).get("direction.out")).toBe(13); // fill

  expect(padTS.at(8).get("direction.out")).toBe(13); // fill

  expect(padTS.at(9).get("direction.out")).toBeNull(); // over limit skip

  expect(padTS.at(10).get("direction.out")).toBeNull(); // over limit skip
});
it("can do linear interpolation fill (test_linear)", () => {
  var ts = new _timeseries.default({
    name: "traffic",
    columns: ["time", "direction"],
    points: [[1400425947000, {
      in: 1,
      out: 2
    }], [1400425948000, {
      in: null,
      out: null
    }], [1400425949000, {
      in: null,
      out: null
    }], [1400425950000, {
      in: 3,
      out: null
    }], [1400425960000, {
      in: null,
      out: null
    }], [1400425970000, {
      in: 5,
      out: 12
    }], [1400425980000, {
      in: 6,
      out: 13
    }]]
  });
  var result = ts.fill({
    fieldSpec: ["direction.in", "direction.out"],
    method: "linear"
  });
  expect(result.size()).toBe(7);
  expect(result.at(0).get("direction.in")).toBe(1);
  expect(result.at(1).get("direction.in")).toBe(1.6666666666666665); // filled

  expect(result.at(2).get("direction.in")).toBe(2.333333333333333); // filled

  expect(result.at(3).get("direction.in")).toBe(3);
  expect(result.at(4).get("direction.in")).toBe(4.0); // filled

  expect(result.at(5).get("direction.in")).toBe(5);
  expect(result.at(0).get("direction.out")).toBe(2);
  expect(result.at(1).get("direction.out")).toBe(2.4347826086956523); // filled

  expect(result.at(2).get("direction.out")).toBe(2.869565217391304); // filled

  expect(result.at(3).get("direction.out")).toBe(3.3043478260869565); // filled

  expect(result.at(4).get("direction.out")).toBe(7.652173913043478); // filled

  expect(result.at(5).get("direction.out")).toBe(12);
});
it("can do linear interpolation fill with a pipeline (test_linear_list)", () => {
  var ts = new _timeseries.default({
    name: "traffic",
    columns: ["time", "direction"],
    points: [[1400425947000, {
      in: 1,
      out: 2
    }], [1400425948000, {
      in: null,
      out: null
    }], [1400425949000, {
      in: null,
      out: null
    }], [1400425950000, {
      in: 3,
      out: null
    }], [1400425960000, {
      in: null,
      out: null
    }], [1400425970000, {
      in: 5,
      out: 12
    }], [1400425980000, {
      in: 6,
      out: 13
    }]]
  });
  var result = (0, _pipeline.Pipeline)().from(ts).fill({
    fieldSpec: "direction.in",
    method: "linear"
  }).fill({
    fieldSpec: "direction.out",
    method: "linear"
  }).toEventList();
  expect(result.length).toBe(7);
  expect(result[0].get("direction.in")).toBe(1);
  expect(result[1].get("direction.in")).toBe(1.6666666666666665); // filled

  expect(result[2].get("direction.in")).toBe(2.333333333333333); // filled

  expect(result[3].get("direction.in")).toBe(3);
  expect(result[4].get("direction.in")).toBe(4.0); // filled

  expect(result[5].get("direction.in")).toBe(5);
  expect(result[0].get("direction.out")).toBe(2);
  expect(result[1].get("direction.out")).toBe(2.4347826086956523); // filled

  expect(result[2].get("direction.out")).toBe(2.869565217391304); // filled

  expect(result[3].get("direction.out")).toBe(3.3043478260869565); // filled

  expect(result[4].get("direction.out")).toBe(7.652173913043478); // filled

  expect(result[5].get("direction.out")).toBe(12);
});
it("can do assymetric linear interpolation (test_assymetric_linear_fill)", () => {
  var ts = new _timeseries.default({
    name: "traffic",
    columns: ["time", "direction"],
    points: [[1400425947000, {
      in: 1,
      out: null
    }], [1400425948000, {
      in: null,
      out: null
    }], [1400425949000, {
      in: null,
      out: null
    }], [1400425950000, {
      in: 3,
      out: 8
    }], [1400425960000, {
      in: null,
      out: null
    }], [1400425970000, {
      in: 5,
      out: 12
    }], [1400425980000, {
      in: 6,
      out: 13
    }]]
  });
  var result = ts.fill({
    fieldSpec: ["direction.in", "direction.out"],
    method: "linear"
  });
  expect(result.at(0).get("direction.in")).toBe(1);
  expect(result.at(1).get("direction.in")).toBe(1.6666666666666665); // filled

  expect(result.at(2).get("direction.in")).toBe(2.333333333333333); // filled

  expect(result.at(3).get("direction.in")).toBe(3);
  expect(result.at(4).get("direction.in")).toBe(4.0); // filled

  expect(result.at(5).get("direction.in")).toBe(5);
  expect(result.at(0).get("direction.out")).toBeNull();
  expect(result.at(1).get("direction.out")).toBeNull();
  expect(result.at(2).get("direction.out")).toBeNull();
  expect(result.at(3).get("direction.out")).toBe(8);
  expect(result.at(4).get("direction.out")).toBe(10); // filled

  expect(result.at(5).get("direction.out")).toBe(12);
});
it("can do streaming fill (test_linear_stream)", done => {
  var events = [new _timeevent.default(1400425947000, 1), new _timeevent.default(1400425948000, 2), new _timeevent.default(1400425949000, {
    value: null
  }), new _timeevent.default(1400425950000, {
    value: null
  }), new _timeevent.default(1400425951000, {
    value: null
  }), new _timeevent.default(1400425952000, 5), new _timeevent.default(1400425953000, 6), new _timeevent.default(1400425954000, 7)];
  var stream = new _stream.default();
  (0, _pipeline.Pipeline)().from(stream).emitOn("flush").fill({
    method: "linear",
    fieldSpec: "value"
  }).to(_collectionout.default, c => {
    expect(c.at(0).value()).toBe(1);
    expect(c.at(1).value()).toBe(2);
    expect(c.at(2).value()).toBe(2.75); // fill

    expect(c.at(3).value()).toBe(3.5); // fill

    expect(c.at(4).value()).toBe(4.25); // fill

    expect(c.at(5).value()).toBe(5);
    expect(c.at(6).value()).toBe(6);
    expect(c.at(7).value()).toBe(7);
    done();
  });
  events.forEach(e => stream.addEvent(e));
  stream.stop();
});
it("can do streaming fill with limit (test_linear_stream_limit/1)", () => {
  var results;
  var events = [new _timeevent.default(1400425947000, 1), new _timeevent.default(1400425948000, 2), new _timeevent.default(1400425949000, {
    value: null
  }), new _timeevent.default(1400425950000, 3), new _timeevent.default(1400425951000, {
    value: null
  }), new _timeevent.default(1400425952000, {
    value: null
  }), new _timeevent.default(1400425953000, {
    value: null
  }), new _timeevent.default(1400425954000, {
    value: null
  })];
  var stream = new _stream.default();
  (0, _pipeline.Pipeline)().from(stream).fill({
    method: "linear",
    fieldSpec: "value"
  }).to(_collectionout.default, collection => {
    results = collection;
  });
  events.forEach(e => stream.addEvent(e)); // should be blocked after 4 events waiting for a good next value

  expect(results.size()).toBe(4); // stop the stream

  stream.stop(); // should flush the last events anyway

  expect(results.size()).toBe(8);
});
it("can do streaming fill with limit (test_linear_stream_limit/2)", () => {
  var results;
  var events = [new _timeevent.default(1400425947000, 1), new _timeevent.default(1400425948000, 2), new _timeevent.default(1400425949000, {
    value: null
  }), new _timeevent.default(1400425950000, 3), new _timeevent.default(1400425951000, {
    value: null
  }), new _timeevent.default(1400425952000, {
    value: null
  }), new _timeevent.default(1400425953000, {
    value: null
  }), new _timeevent.default(1400425954000, {
    value: null
  })];
  var stream = new _stream.default();
  (0, _pipeline.Pipeline)().from(stream).fill({
    method: "linear",
    fieldSpec: "value",
    limit: 3
  }).to(_collectionout.default, collection => {
    results = collection;
  });
  events.forEach(e => stream.addEvent(e)); // Because of the limit, all events should be captured in the collection

  expect(results.size()).toBe(8);
}); //TODO

/*
it("can throw on bad args", () => {
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
*/