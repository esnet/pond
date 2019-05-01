/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

declare const describe: any;
declare const it: any;
declare const expect: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

import { collection, Collection } from "../src/collection";
import { duration } from "../src/duration";
import { event, indexedEvent, timeEvent, timeRangeEvent } from "../src/event";
import { avg, max, sum } from "../src/functions";
import { index, Index } from "../src/index";
import { time, Time } from "../src/time";
import { timerange } from "../src/timerange";
import {
  indexedSeries,
  timeRangeSeries,
  TimeSeries,
  timeSeries,
  TimeSeriesWireFormat
} from "../src/timeseries";
import { TimeAlignment } from "../src/types";
import { window } from "../src/window";

const EVENT_DATA = {
  name: "avg temps",
  events: Immutable.List([
    event(time("2015-04-22T03:30:00Z"), Immutable.Map({ in: 1, out: 2 })),
    event(time("2015-04-22T03:31:00Z"), Immutable.Map({ in: 3, out: 4 }))
  ])
};

const COLLECTION_DATA = {
  name: "avg coll",
  collection: collection(
    Immutable.List([
      event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 5, b: 6 })),
      event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 4, b: 2 }))
    ])
  )
};

const TIMESERIES_TEST_DATA = {
  name: "traffic",
  columns: ["time", "value", "status"],
  points: [
    [1400425947000, 52, "ok"],
    [1400425948000, 18, "ok"],
    [1400425949000, 26, "fail"],
    [1400425950000, 93, "offline"]
  ]
};

const AVAILABILITY_DATA = {
  name: "availability",
  columns: ["index", "uptime"],
  points: [
    ["2014-07", "100%"],
    ["2014-08", "88%"],
    ["2014-09", "95%"],
    ["2014-10", "99%"],
    ["2014-11", "91%"],
    ["2014-12", "99%"],
    ["2015-01", "100%"],
    ["2015-02", "92%"],
    ["2015-03", "99%"],
    ["2015-04", "87%"],
    ["2015-05", "92%"],
    ["2015-06", "100%"]
  ]
};

const AVAILABILITY_DATA_2 = {
  name: "availability",
  columns: ["index", "uptime", "notes", "outages"],
  points: [
    ["2014-07", 100, "", 2],
    ["2014-08", 88, "", 17],
    ["2014-09", 95, "", 6],
    ["2014-10", 99, "", 3],
    ["2014-11", 91, "", 14],
    ["2014-12", 99, "", 3],
    ["2015-01", 100, "", 0],
    ["2015-02", 92, "", 12],
    ["2015-03", 99, "Minor outage March 2", 4],
    ["2015-04", 87, "Planned downtime in April", 82],
    ["2015-05", 92, "Router failure June 12", 26],
    ["2015-06", 100, "", 0]
  ]
};

const INDEXED_DATA = {
  index: "1d-625",
  name: "traffic",
  columns: ["time", "value", "status"],
  points: [
    [1400425947000, 52, "ok"],
    [1400425948000, 18, "ok"],
    [1400425949000, 26, "fail"],
    [1400425950000, 93, "offline"]
  ]
};

const INTERFACE_TEST_DATA = {
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
  points: [
    [1400425947000, 52, 34],
    [1400425948000, 18, 13],
    [1400425949000, 26, 67],
    [1400425950000, 93, 91]
  ]
};

const fmt = "YYYY-MM-DD HH:mm";

const BISECT_TEST_DATA = {
  name: "test",
  columns: ["time", "value"],
  points: [
    [moment("2012-01-11 01:00", fmt).valueOf(), 22],
    [moment("2012-01-11 02:00", fmt).valueOf(), 33],
    [moment("2012-01-11 03:00", fmt).valueOf(), 44],
    [moment("2012-01-11 04:00", fmt).valueOf(), 55],
    [moment("2012-01-11 05:00", fmt).valueOf(), 66],
    [moment("2012-01-11 06:00", fmt).valueOf(), 77],
    [moment("2012-01-11 07:00", fmt).valueOf(), 88]
  ]
};

const TRAFFIC_DATA_IN = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "in"],
  points: [
    [1400425947000, 52],
    [1400425948000, 18],
    [1400425949000, 26],
    [1400425950000, 93]
  ]
};

const TRAFFIC_DATA_OUT = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "out"],
  points: [
    [1400425947000, 34],
    [1400425948000, 13],
    [1400425949000, 67],
    [1400425950000, 91]
  ]
};

const PARTIAL_TRAFFIC_PART_A = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "value"],
  points: [
    [1400425947000, 34],
    [1400425948000, 13],
    [1400425949000, 67],
    [1400425950000, 91]
  ]
};

const PARTIAL_TRAFFIC_PART_B = {
  name: "star-cr5:to_anl_ip-a_v4",
  columns: ["time", "value"],
  points: [
    [1400425951000, 65],
    [1400425952000, 86],
    [1400425953000, 27],
    [1400425954000, 72]
  ]
};

const TRAFFIC_BNL_TO_NEWY = {
  name: "BNL to NEWY",
  columns: ["time", "in"],
  points: [
    [1441051950000, 2998846524.2666664],
    [1441051980000, 2682032885.3333335],
    [1441052010000, 2753537586.9333334]
  ]
};

const TRAFFIC_NEWY_TO_BNL = {
  name: "NEWY to BNL",
  columns: ["time", "out"],
  points: [
    [1441051950000, 22034579982.4],
    [1441051980000, 24783871443.2],
    [1441052010000, 26907368572.800003]
  ]
};

const sumPart1 = {
  name: "part1",
  columns: ["time", "in", "out"],
  points: [
    [1400425951000, 1, 6],
    [1400425952000, 2, 7],
    [1400425953000, 3, 8],
    [1400425954000, 4, 9]
  ]
};
const sumPart2 = {
  name: "part2",
  columns: ["time", "in", "out"],
  points: [
    [1400425951000, 9, 1],
    [1400425952000, 7, 2],
    [1400425953000, 5, 3],
    [1400425954000, 3, 4]
  ]
};

const sept2014Data = {
  utc: false,
  name: "traffic",
  columns: ["time", "value"],
  points: [
    [1409529600000, 80],
    [1409533200000, 88],
    [1409536800000, 52],
    [1409540400000, 80],
    [1409544000000, 26],
    [1409547600000, 37],
    [1409551200000, 6],
    [1409554800000, 32],
    [1409558400000, 69],
    [1409562000000, 21],
    [1409565600000, 6],
    [1409569200000, 54],
    [1409572800000, 88],
    [1409576400000, 41],
    [1409580000000, 35],
    [1409583600000, 43],
    [1409587200000, 84],
    [1409590800000, 32],
    [1409594400000, 41],
    [1409598000000, 57],
    [1409601600000, 27],
    [1409605200000, 50],
    [1409608800000, 13],
    [1409612400000, 63],
    [1409616000000, 58],
    [1409619600000, 80],
    [1409623200000, 59],
    [1409626800000, 96],
    [1409630400000, 2],
    [1409634000000, 20],
    [1409637600000, 64],
    [1409641200000, 7],
    [1409644800000, 50],
    [1409648400000, 88],
    [1409652000000, 34],
    [1409655600000, 31],
    [1409659200000, 16],
    [1409662800000, 38],
    [1409666400000, 94],
    [1409670000000, 78],
    [1409673600000, 86],
    [1409677200000, 13],
    [1409680800000, 34],
    [1409684400000, 29],
    [1409688000000, 48],
    [1409691600000, 80],
    [1409695200000, 30],
    [1409698800000, 15],
    [1409702400000, 62],
    [1409706000000, 66],
    [1409709600000, 44],
    [1409713200000, 94],
    [1409716800000, 78],
    [1409720400000, 29],
    [1409724000000, 21],
    [1409727600000, 4],
    [1409731200000, 83],
    [1409734800000, 15],
    [1409738400000, 89],
    [1409742000000, 53],
    [1409745600000, 70],
    [1409749200000, 41],
    [1409752800000, 47],
    [1409756400000, 30],
    [1409760000000, 68],
    [1409763600000, 89],
    [1409767200000, 29],
    [1409770800000, 17],
    [1409774400000, 38],
    [1409778000000, 67],
    [1409781600000, 75],
    [1409785200000, 89],
    [1409788800000, 47],
    [1409792400000, 82],
    [1409796000000, 33],
    [1409799600000, 67],
    [1409803200000, 93],
    [1409806800000, 86],
    [1409810400000, 97],
    [1409814000000, 19],
    [1409817600000, 19],
    [1409821200000, 31],
    [1409824800000, 56],
    [1409828400000, 19],
    [1409832000000, 43],
    [1409835600000, 29],
    [1409839200000, 72],
    [1409842800000, 27],
    [1409846400000, 21],
    [1409850000000, 88],
    [1409853600000, 18],
    [1409857200000, 30],
    [1409860800000, 46],
    [1409864400000, 34],
    [1409868000000, 31],
    [1409871600000, 20],
    [1409875200000, 45],
    [1409878800000, 17],
    [1409882400000, 24],
    [1409886000000, 84],
    [1409889600000, 6],
    [1409893200000, 91],
    [1409896800000, 82],
    [1409900400000, 71],
    [1409904000000, 97],
    [1409907600000, 43],
    [1409911200000, 38],
    [1409914800000, 1],
    [1409918400000, 71],
    [1409922000000, 50],
    [1409925600000, 19],
    [1409929200000, 19],
    [1409932800000, 86],
    [1409936400000, 65],
    [1409940000000, 93],
    [1409943600000, 35]
  ]
};

const OUTAGE_EVENT_LIST = Immutable.List([
  {
    startTime: "2015-03-04T09:00:00Z",
    endTime: "2015-03-04T14:00:00Z",
    title: "ANL Scheduled Maintenance",
    description: "ANL will be switching border routers...",
    completed: true,
    external_ticket: "",
    esnet_ticket: "ESNET-20150302-002",
    organization: "ANL",
    type: "Planned"
  },
  {
    startTime: "2015-04-22T03:30:00Z",
    endTime: "2015-04-22T13:00:00Z",
    description: "At 13:33 pacific circuit 06519 went down.",
    title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
    completed: true,
    external_ticket: "",
    esnet_ticket: "ESNET-20150421-013",
    organization: "Internet2 / Level 3",
    type: "Unplanned"
  },
  {
    startTime: "2015-04-22T03:35:00Z",
    endTime: "2015-04-22T16:50:00Z",
    title: "STAR-CR5 < 100 ge 06519 > ANL  - Outage",
    description: "The listed circuit was unavailable due to bent pins.",
    completed: true,
    external_ticket: "3576:144",
    esnet_ticket: "ESNET-20150421-013",
    organization: "Internet2 / Level 3",
    type: "Unplanned"
  }
]);

const TIMERANGE_EVENT_LIST = OUTAGE_EVENT_LIST.map(evt => {
  const { startTime, endTime, ...other } = evt;
  const b = new Date(startTime);
  const e = new Date(endTime);
  return timeRangeEvent(timerange(b, e), Immutable.Map(other as {}));
});

const weather = Immutable.List([
  {
    date: "2014-7-1",
    actual_mean_temp: 81,
    actual_min_temp: 72,
    actual_max_temp: 89,
    average_min_temp: 68,
    average_max_temp: 83,
    record_min_temp: 52,
    record_max_temp: 100,
    record_min_temp_year: 1943,
    record_max_temp_year: 1901,
    actual_precipitation: 0,
    average_precipitation: 0.12,
    record_precipitation: 2.17
  },
  {
    date: "2014-7-2",
    actual_mean_temp: 82,
    actual_min_temp: 72,
    actual_max_temp: 91,
    average_min_temp: 68,
    average_max_temp: 83,
    record_min_temp: 56,
    record_max_temp: 100,
    record_min_temp_year: 2001,
    record_max_temp_year: 1966,
    actual_precipitation: 0.96,
    average_precipitation: 0.13,
    record_precipitation: 1.79
  },
  {
    date: "2014-7-3",
    actual_mean_temp: 78,
    actual_min_temp: 69,
    actual_max_temp: 87,
    average_min_temp: 68,
    average_max_temp: 83,
    record_min_temp: 54,
    record_max_temp: 103,
    record_min_temp_year: 1933,
    record_max_temp_year: 1966,
    actual_precipitation: 1.78,
    average_precipitation: 0.12,
    record_precipitation: 2.8
  }
]);

describe("Creation", () => {
  it("can create a series with a list of events", () => {
    const series = new TimeSeries(EVENT_DATA);
    expect(series).toBeDefined();
  });

  it("can create a series with a collection", () => {
    const series = new TimeSeries(COLLECTION_DATA);
    expect(series).toBeDefined();
  });

  it("can create a timeseries with our wire format", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    expect(series).toBeDefined();
  });

  it("can create an indexed series with our wire format", () => {
    const series = indexedSeries(AVAILABILITY_DATA);
    expect(series).toBeDefined();
  });

  it("can create an series with a list of Events", () => {
    const events = [];
    events.push(
      timeEvent(time(new Date(2015, 7, 1)), Immutable.Map({ value: 27 }))
    );
    events.push(
      timeEvent(time(new Date(2015, 8, 1)), Immutable.Map({ value: 14 }))
    );
    const series = new TimeSeries({
      name: "events",
      events: Immutable.List(events)
    });
    expect(series.size()).toBe(2);
  });

  it("can create an series with a list of Indexed Events", () => {
    const events = weather.map(item => {
      const {
        date,
        actual_min_temp,
        actual_max_temp,
        record_min_temp,
        record_max_temp
      } = item;
      return indexedEvent(
        index(date),
        Immutable.Map({
          temp: [
            +record_min_temp, // tslint-disable-line
            +actual_min_temp, // tslint-disable-line
            +actual_max_temp, // tslint-disable-line
            +record_max_temp // tslint-disable-line
          ]
        })
      );
    });

    const c = new Collection(events);
    const series = new TimeSeries({ name, collection: c });
    expect(series.size()).toBe(3);
  });

  it("can create an series with no events", () => {
    const events = [];
    const series = new TimeSeries({
      name: "events",
      events: Immutable.List(events)
    });
    expect(series.size()).toBe(0);
  });

  it("can create a timerange series with the right timerange", () => {
    const series = new TimeSeries({
      name: "outages",
      events: TIMERANGE_EVENT_LIST
    });
    expect(series.range().toString()).toBe(
      '{"timerange":[1425459600000,1429721400000]}'
    );
  });
});

describe("Basic Query API", () => {
  // tslint:disable:max-line-length
  it("can return the size of the series", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    expect(series.size()).toBe(4);
  });

  it("can return an item in the series as an event", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const e = series.at(1);
    expect(e.keyType()).toBe("time");
  });

  it("can return an item in the series with the correct data", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const e = series.at(1);
    expect(JSON.stringify(e.getData())).toBe(`{"value":18,"status":"ok"}`);
    expect(e.timestamp().getTime()).toBe(1400425948000);
  });

  it("can serialize to a string", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const expectedString = `{"name":"traffic","tz":"Etc/UTC","columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}`;
    expect(series.toString()).toBe(expectedString);
  });

  it("can return the time range of the series", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const expectedString =
      "[Sun, 18 May 2014 15:12:27 GMT, Sun, 18 May 2014 15:12:30 GMT]";
    expect(series.timerange().toUTCString()).toBe(expectedString);
  });
});

describe("Meta Data", () => {
  it("can create a series with meta data and get that data back", () => {
    const series = timeSeries(INTERFACE_TEST_DATA);
    const expected = `{"site_interface":"et-1/0/0","tz":"Etc/UTC","site":"anl","name":"star-cr5:to_anl_ip-a_v4","site_device":"noni","device":"star-cr5","oscars_id":null,"title":null,"is_oscars":false,"interface":"to_anl_ip-a_v4","stats_type":"Standard","id":169,"resource_uri":"","is_ipv6":false,"description":"star-cr5->anl(as683):100ge:site-ex:show:intercloud","columns":["time","in","out"],"points":[[1400425947000,52,34],[1400425948000,18,13],[1400425949000,26,67],[1400425950000,93,91]]}`;
    expect(series.toString()).toBe(expected);
    expect(series.meta("interface")).toBe("to_anl_ip-a_v4");
  });

  it("can create a series and set a new name", () => {
    const series = timeSeries(INTERFACE_TEST_DATA);
    expect(series.name()).toBe("star-cr5:to_anl_ip-a_v4");
    const newSeries = series.setName("bob");
    expect(newSeries.name()).toBe("bob");
  });

  it("can create a series with meta data and get that data back", () => {
    const series = timeSeries(INTERFACE_TEST_DATA);
    expect(series.meta("site_interface")).toBe("et-1/0/0");
    const newSeries = series.setMeta("site_interface", "bob");
    expect(newSeries.meta("site_interface")).toBe("bob");
    expect(newSeries.at(0).get("in")).toBe(52);
    expect(newSeries.meta("site")).toBe("anl");
  });
});

describe("Deep Event Data", () => {
  it("can create a series with a nested object", () => {
    const series = timeSeries({
      name: "Map Traffic",
      columns: ["time", "NASA_north", "NASA_south"],
      points: [
        [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
        [1400425952000, { in: 200, out: 400 }, { in: 146, out: 142 }],
        [1400425953000, { in: 300, out: 600 }, { in: 147, out: 158 }],
        [1400425954000, { in: 400, out: 800 }, { in: 155, out: 175 }]
      ]
    });
    expect(
      series
        .at(0)
        .get("NASA_north")
        .get("in")
    ).toBe(100);
    expect(
      series
        .at(0)
        .get("NASA_north")
        .get("out")
    ).toBe(200);

    expect(series.at(0).get("NASA_north.in")).toBe(100);
    expect(series.at(0).get(["NASA_north", "in"])).toBe(100);
  });

  it("can create a series with nested events", () => {
    const events = [];
    events.push(
      timeEvent(
        time(new Date(2015, 6, 1)),
        Immutable.Map({
          NASA_north: { in: 100, out: 200 },
          NASA_south: { in: 145, out: 135 }
        })
      )
    );
    events.push(
      timeEvent(
        time(new Date(2015, 7, 1)),
        Immutable.Map({
          NASA_north: { in: 200, out: 400 },
          NASA_south: { in: 146, out: 142 }
        })
      )
    );
    events.push(
      timeEvent(
        time(new Date(2015, 8, 1)),
        Immutable.Map({
          NASA_north: { in: 300, out: 600 },
          NASA_south: { in: 147, out: 158 }
        })
      )
    );
    events.push(
      timeEvent(
        time(new Date(2015, 9, 1)),
        Immutable.Map({
          NASA_north: { in: 400, out: 800 },
          NASA_south: { in: 155, out: 175 }
        })
      )
    );
    const series = new TimeSeries({
      name: "Map traffic",
      events: Immutable.List(events)
    });
    expect(series.at(0).get("NASA_north").in).toBe(100);
    expect(series.at(3).get("NASA_south").out).toBe(175);
    expect(series.size()).toBe(4);
  });
});

describe("Comparing TimeSeries", () => {
  it("can compare a series and a reference to a series as being equal", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const refSeries = series;
    expect(series).toBe(refSeries);
  });

  it("can use the equals() comparator to compare a series and a copy of the series as true", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const copyOfSeries = new TimeSeries(series);
    expect(TimeSeries.equal(series, copyOfSeries)).toBeTruthy();
  });

  it("can use the equals() comparator to compare a series and a value equivalent series as false", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const otherSeries = timeSeries(TIMESERIES_TEST_DATA);
    expect(TimeSeries.equal(series, otherSeries)).toBeFalsy();
  });

  it("can use the is() comparator to compare a series and a value equivalent series as true", () => {
    const series = timeSeries(TIMESERIES_TEST_DATA);
    const otherSeries = timeSeries(TIMESERIES_TEST_DATA);
    expect(TimeSeries.is(series, otherSeries)).toBeTruthy();
  });

  it("can use the is() comparator to compare a series and a value different series as false", () => {
    const series = timeSeries(sumPart1);
    const otherSeries = timeSeries(sumPart2);
    expect(TimeSeries.is(series, otherSeries)).toBeFalsy();
  });
});

describe("Bisect", () => {
  it("can find the bisect starting from 0", () => {
    const series = timeSeries(BISECT_TEST_DATA);
    expect(series.bisect(moment("2012-01-11 00:30", fmt).toDate())).toBe(0);
    expect(series.bisect(moment("2012-01-11 03:00", fmt).toDate())).toBe(2);
    expect(series.bisect(moment("2012-01-11 03:30", fmt).toDate())).toBe(2);
    expect(series.bisect(moment("2012-01-11 08:00", fmt).toDate())).toBe(6);
  });

  it("can find the bisect starting from an begin index", () => {
    const series = timeSeries(BISECT_TEST_DATA);
    expect(series.bisect(moment("2012-01-11 03:00", fmt).toDate(), 2)).toBe(2);
    expect(series.bisect(moment("2012-01-11 03:30", fmt).toDate(), 3)).toBe(2);
    expect(series.bisect(moment("2012-01-11 03:30", fmt).toDate(), 4)).toBe(3);

    const first = series.bisect(moment("2012-01-11 03:30", fmt).toDate());
    const second = series.bisect(
      moment("2012-01-11 04:30", fmt).toDate(),
      first
    );
    expect(series.at(first).get()).toBe(44);
    expect(series.at(second).get()).toBe(55);
  });
});

describe("Time Range Events", () => {
  it("can make a timeseries with the right timerange", () => {
    const series = new TimeSeries({
      name: "outages",
      events: TIMERANGE_EVENT_LIST
    });
    expect(series.range().toString()).toBe(
      '{"timerange":[1425459600000,1429721400000]}'
    );
  });

  it("can make a timeseries that can be serialized to a string", () => {
    const series = new TimeSeries({
      name: "outages",
      events: TIMERANGE_EVENT_LIST
    });
    const expected = `{"name":"outages","tz":"Etc/UTC","columns":["timerange","title","description","completed","external_ticket","esnet_ticket","organization","type"],"points":[[[1425459600000,1425477600000],"ANL Scheduled Maintenance","ANL will be switching border routers...",true,"","ESNET-20150302-002","ANL","Planned"],[[1429673400000,1429707600000],"STAR-CR5 < 100 ge 06519 > ANL  - Outage","At 13:33 pacific circuit 06519 went down.",true,"","ESNET-20150421-013","Internet2 / Level 3","Unplanned"],[[1429673700000,1429721400000],"STAR-CR5 < 100 ge 06519 > ANL  - Outage","The listed circuit was unavailable due to bent pins.",true,"3576:144","ESNET-20150421-013","Internet2 / Level 3","Unplanned"]]}`;
    expect(series.toString()).toBe(expected);
  });

  it("can make a timeseries that can be serialized to JSON and then used to construct a TimeSeries again", () => {
    const series = new TimeSeries({
      name: "outages",
      events: TIMERANGE_EVENT_LIST
    });
    const newSeries = timeRangeSeries(series.toJSON() as TimeSeriesWireFormat);
    expect(series.toString()).toBe(newSeries.toString());
  });
});

describe("Indexed Events", () => {
  it("can serialize to a string", () => {
    const series = timeSeries(INDEXED_DATA);
    const expectedString = `{"index":"1d-625","name":"traffic","tz":"Etc/UTC","columns":["time","value","status"],"points":[[1400425947000,52,"ok"],[1400425948000,18,"ok"],[1400425949000,26,"fail"],[1400425950000,93,"offline"]]}`;
    expect(series.toString()).toBe(expectedString);
  });

  it("can return the time range of the series", () => {
    const series = timeSeries(INDEXED_DATA);
    const expectedString =
      "[Sat, 18 Sep 1971 00:00:00 GMT, Sun, 19 Sep 1971 00:00:00 GMT]";
    expect(series.indexAsRange().toUTCString()).toBe(expectedString);
  });

  it("can create an series with indexed data (in UTC time)", () => {
    const series = indexedSeries(AVAILABILITY_DATA);
    const e = series.at(2);
    expect(e.timerangeAsUTCString()).toBe(
      "[Mon, 01 Sep 2014 00:00:00 GMT, Tue, 30 Sep 2014 23:59:59 GMT]"
    );
    expect(
      series
        .range()
        .begin()
        .getTime()
    ).toBe(1404172800000);
    expect(
      series
        .range()
        .end()
        .getTime()
    ).toBe(1435708799999);
  });
});

describe("Slicing a timeseries", () => {
  it("can create a slice of a series", () => {
    const series = indexedSeries(AVAILABILITY_DATA);
    const expectedLastTwo = `{"name":"availability","tz":"Etc/UTC","columns":["index","uptime"],"points":[["2015-05","92%"],["2015-06","100%"]]}`;
    const lastTwo = series.slice(-2);
    expect(lastTwo.toString()).toBe(expectedLastTwo);
    const expectedFirstThree = `{"name":"availability","tz":"Etc/UTC","columns":["index","uptime"],"points":[["2014-07","100%"],["2014-08","88%"],["2014-09","95%"]]}`;
    const firstThree = series.slice(0, 3);
    expect(firstThree.toString()).toBe(expectedFirstThree);
    const expectedAll = `{"name":"availability","tz":"Etc/UTC","columns":["index","uptime"],"points":[["2014-07","100%"],["2014-08","88%"],["2014-09","95%"],["2014-10","99%"],["2014-11","91%"],["2014-12","99%"],["2015-01","100%"],["2015-02","92%"],["2015-03","99%"],["2015-04","87%"],["2015-05","92%"],["2015-06","100%"]]}`;
    const sliceAll = series.slice();
    expect(sliceAll.toString()).toBe(expectedAll);
  });
});

describe("Cropping a timeseries", () => {
  it("can create crop a series", () => {
    const series = timeSeries({
      name: "exact timestamps",
      columns: ["time", "value"],
      points: [
        [1504014065240, 1],
        [1504014065243, 2],
        [1504014065244, 3],
        [1504014065245, 4],
        [1504014065249, 5]
      ]
    });
    const ts1 = series.crop(timerange(1504014065243, 1504014065245));
    expect(ts1.size()).toBe(3);
    const ts2 = series.crop(timerange(1504014065242, 1504014065245));
    expect(ts2.size()).toBe(3);
    const ts3 = series.crop(timerange(1504014065243, 1504014065247));
    expect(ts3.size()).toBe(3);
    const ts4 = series.crop(timerange(1504014065242, 1504014065247));
    expect(ts4.size()).toBe(3);
  });
});

describe("Merging two timeseries together", () => {
  it("can merge two timeseries columns together using merge", () => {
    const inTraffic = timeSeries(TRAFFIC_DATA_IN);
    const outTraffic = timeSeries(TRAFFIC_DATA_OUT);
    const trafficSeries = TimeSeries.timeSeriesListMerge<Time>({
      name: "traffic",
      seriesList: [inTraffic, outTraffic],
      fieldSpec: ["in", "out"]
    });

    expect(trafficSeries.at(2).get("in")).toBe(26);
    expect(trafficSeries.at(2).get("out")).toBe(67);
  });

  it("can append two timeseries together using merge", () => {
    const tile1 = timeSeries(PARTIAL_TRAFFIC_PART_A);
    const tile2 = timeSeries(PARTIAL_TRAFFIC_PART_B);
    const trafficSeries = TimeSeries.timeSeriesListMerge<Time>({
      name: "traffic",
      source: "router",
      seriesList: [tile1, tile2],
      fieldSpec: "value"
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
    const inTraffic = timeSeries(TRAFFIC_BNL_TO_NEWY);
    const outTraffic = timeSeries(TRAFFIC_NEWY_TO_BNL);
    const trafficSeries = TimeSeries.timeSeriesListMerge<Time>({
      name: "traffic",
      seriesList: [inTraffic, outTraffic]
    });
    expect(trafficSeries.at(0).timestampAsUTCString()).toBe(
      "Mon, 31 Aug 2015 20:12:30 GMT"
    );
    expect(trafficSeries.at(1).timestampAsUTCString()).toBe(
      "Mon, 31 Aug 2015 20:13:00 GMT"
    );
    expect(trafficSeries.at(2).timestampAsUTCString()).toBe(
      "Mon, 31 Aug 2015 20:13:30 GMT"
    );
  });

  it("can merge two irregular time series together", () => {
    const A = {
      name: "a",
      columns: ["time", "valueA"],
      points: [
        [1400425947000, 34],
        [1400425948000, 13],
        [1400425949000, 67],
        [1400425950000, 91]
      ]
    };

    const B = {
      name: "b",
      columns: ["time", "valueB"],
      points: [
        [1400425951000, 65],
        [1400425952000, 86],
        [1400425953000, 27],
        [1400425954000, 72]
      ]
    };

    const tile1 = timeSeries(A);
    const tile2 = timeSeries(B);

    const series = TimeSeries.timeSeriesListMerge({
      name: "traffic",
      seriesList: [tile1, tile2]
    });
    // console.log("series is ", series);
    const expected = `{"name":"traffic","tz":"Etc/UTC","columns":["time","valueA","valueB"],"points":[[1400425947000,34,null],[1400425948000,13,null],[1400425949000,67,null],[1400425950000,91,null],[1400425951000,null,65],[1400425952000,null,86],[1400425953000,null,27],[1400425954000,null,72]]}`;
    expect(series.toString()).toBe(expected);
  });
});

describe("Summing two timeseries together", () => {
  it("can merge two timeseries into a new timeseries that is the sum", () => {
    const part1 = timeSeries(sumPart1);
    const part2 = timeSeries(sumPart2);

    const result = TimeSeries.timeSeriesListReduce({
      name: "sum",
      seriesList: [part1, part2],
      reducer: sum(),
      fieldSpec: ["in", "out"]
    });

    // 10, 9, 8, 7
    expect(result.at(0).get("in")).toBe(10);
    expect(result.at(1).get("in")).toBe(9);
    expect(result.at(2).get("in")).toBe(8);
    expect(result.at(3).get("in")).toBe(7);

    // 7, 9, 11, 13
    expect(result.at(0).get("out")).toBe(7);
    expect(result.at(1).get("out")).toBe(9);
    expect(result.at(2).get("out")).toBe(11);
    expect(result.at(3).get("out")).toBe(13);
  });
});

describe("Averaging two timeseries together", () => {
  it("can merge two timeseries into a new timeseries that is the sum", () => {
    const part1 = timeSeries({
      name: "part1",
      columns: ["time", "in", "out"],
      points: [
        [1400425951000, 1, 6],
        [1400425952000, 2, 7],
        [1400425953000, 3, 8],
        [1400425954000, 4, 9]
      ]
    });
    const part2 = timeSeries({
      name: "part2",
      columns: ["time", "in", "out"],
      points: [
        [1400425951000, 9, 1],
        [1400425952000, 7, 2],
        [1400425953000, 5, 3],
        [1400425954000, 3, 4]
      ]
    });

    const avgSeries = TimeSeries.timeSeriesListReduce({
      name: "avg",
      seriesList: [part1, part2],
      fieldSpec: ["in", "out"],
      reducer: avg()
    });

    expect(avgSeries.at(0).get("in")).toBe(5);
    expect(avgSeries.at(1).get("in")).toBe(4.5);
    expect(avgSeries.at(2).get("in")).toBe(4);
    expect(avgSeries.at(3).get("in")).toBe(3.5);

    expect(avgSeries.at(0).get("out")).toBe(3.5);
    expect(avgSeries.at(1).get("out")).toBe(4.5);
    expect(avgSeries.at(2).get("out")).toBe(5.5);
    expect(avgSeries.at(3).get("out")).toBe(6.5);

    const avgSeries2 = TimeSeries.timeSeriesListReduce({
      name: "avg",
      seriesList: [part1, part2],
      reducer: avg(),
      fieldSpec: ["in", "out"]
    });

    expect(avgSeries2.at(0).get("in")).toBe(5);
    expect(avgSeries2.at(1).get("in")).toBe(4.5);
    expect(avgSeries2.at(2).get("in")).toBe(4);
    expect(avgSeries2.at(3).get("in")).toBe(3.5);
  });
});

describe("Collapsing down columns in a timeseries", () => {
  it("can collapse a timeseries into a new timeseries that is the sum of two columns", () => {
    const ts = timeSeries(sumPart1);
    const sums = ts.collapse({
      fieldName: "sum",
      fieldSpecList: ["in", "out"],
      reducer: sum(),
      append: false
    });

    expect(sums.at(0).get("sum")).toBe(7);
    expect(sums.at(1).get("sum")).toBe(9);
    expect(sums.at(2).get("sum")).toBe(11);
    expect(sums.at(3).get("sum")).toBe(13);
  });

  it("can collapse a timeseries into a new timeseries that is the max of two columns", () => {
    const timeseries = timeSeries(sumPart2);
    const c = timeseries.collapse({
      fieldName: "max_in_out",
      fieldSpecList: ["in", "out"],
      reducer: max(),
      append: true
    });

    expect(c.at(0).get("max_in_out")).toBe(9);
    expect(c.at(1).get("max_in_out")).toBe(7);
    expect(c.at(2).get("max_in_out")).toBe(5);
    expect(c.at(3).get("max_in_out")).toBe(4);
  });

  it("can collapse a timeseries into a new timeseries that is the sum of two columns, then find the max", () => {
    const ts = timeSeries(sumPart1);
    const sums = ts.collapse({
      fieldName: "value",
      fieldSpecList: ["in", "out"],
      reducer: sum(),
      append: false
    });
    expect(sums.max("value")).toBe(13);
  });
});

describe("Select specific columns in a TimeSeries", () => {
  it("can select a single column from a TimeSeries", () => {
    const timeseries = timeSeries(INTERFACE_TEST_DATA);
    expect(timeseries.columns()).toEqual(["in", "out"]);

    const ts = timeseries.select({ fields: ["in"] });
    expect(ts.columns()).toEqual(["in"]);
    expect(ts.name()).toBe("star-cr5:to_anl_ip-a_v4");
  });

  it("can select multiple columns from a TimeSeries", () => {
    const timeseries = indexedSeries(AVAILABILITY_DATA_2);
    expect(timeseries.columns()).toEqual(["uptime", "notes", "outages"]);

    const ts = timeseries.select({ fields: ["uptime", "notes"] });
    expect(ts.columns()).toEqual(["uptime", "notes"]);
    expect(ts.name()).toBe("availability");
  });

  it("can rename columns", () => {
    const ts = timeSeries(sumPart1);
    const newTs = ts.renameColumns({
      renameMap: { in: "new_in", out: "new_out" }
    });
    expect(newTs.columns()).toEqual(["new_in", "new_out"]);

    const series = indexedSeries(AVAILABILITY_DATA);
    const newSeries = series.renameColumns({
      renameMap: { uptime: "new_uptime" }
    });
    expect(newSeries.columns()).toEqual(["new_uptime"]);
  });
});

describe("Remapping Events in a TimeSeries", () => {
  it("can use re-mapping to reverse the values in a TimeSeries", () => {
    const timeseries = timeSeries(INTERFACE_TEST_DATA);

    expect(timeseries.columns()).toEqual(["in", "out"]);

    const ts = timeseries.map(e =>
      e.setData(Immutable.Map({ in: e.get("out"), out: e.get("in") }))
    );

    expect(ts.at(0).get("in")).toBe(34);
    expect(ts.at(0).get("out")).toBe(52);
    expect(ts.size()).toBe(timeseries.size());
  });

  it("can run a flat map over the TimeSeries", () => {
    const series = timeSeries({
      name: "Map Traffic",
      columns: ["time", "NASA_north", "NASA_south"],
      points: [
        [1400425951000, { in: 100, out: 200 }, { in: 145, out: 135 }],
        [1400425952000, { in: 200, out: 400 }, { in: 146, out: 142 }],
        [1400425953000, { in: 300, out: 600 }, { in: 147, out: 158 }],
        [1400425954000, { in: 400, out: 800 }, { in: 155, out: 175, other: 1 }]
      ]
    });
    const split = series.flatMap(e =>
      Immutable.List([
        e.setData(e.get("NASA_north")),
        e.setData(e.get("NASA_south"))
      ])
    );

    expect(split.size()).toBe(8);
    expect(split.at(0).get("in")).toBe(100);
    expect(split.at(0).get("out")).toBe(200);
    expect(split.at(0).get("other")).toBeUndefined();
    expect(split.at(1).get("in")).toBe(145);
    expect(split.at(1).get("out")).toBe(135);
    expect(split.at(1).get("other")).toBeUndefined();
    expect(split.at(7).get("in")).toBe(155);
    expect(split.at(7).get("out")).toBe(175);
    expect(split.at(7).get("other")).toBe(1);
  });

  it("can remap keys of a TimeSeries using mapKeys() from times to timeranges", () => {
    const series = timeSeries({
      name: "series",
      columns: ["time", "a", "b"],
      points: [
        [1400425951000, 100, 200],
        [1400425952000, 300, 400],
        [1400425953000, 800, 900]
      ]
    });
    const remapped = series.mapKeys(t =>
      t.toTimeRange(duration("5m"), TimeAlignment.Middle)
    );

    expect(remapped.size()).toBe(3);
    expect(
      remapped
        .at(0)
        .getKey()
        .duration()
    ).toBe(1000 * 60 * 5);
    expect(
      remapped
        .at(0)
        .getKey()
        .mid()
        .getTime()
    ).toBe(1400425951000);
    expect(remapped.at(0).get("a")).toBe(100);
    expect(remapped.at(0).get("b")).toBe(200);
  });

  it("can remap keys of a TimeSeries using mapKeys() from indexes to times", () => {
    const series = indexedSeries({
      name: "series",
      columns: ["index", "c", "d"],
      points: [
        ["1d-1234", 100, 200],
        ["1d-1235", 300, 400],
        ["1d-1236", 800, 900]
      ]
    });

    const remapped = series.mapKeys<Time>((idx: Index) =>
      idx.toTime(TimeAlignment.End)
    );

    expect(
      remapped
        .at(0)
        .getKey()
        .timestamp()
        .getTime()
    ).toBe(106704000000);
    expect(remapped.at(0).get("c")).toBe(100);
    expect(remapped.at(0).get("d")).toBe(200);
  });
});

describe("Rollups", () => {
  it("can generate 1 day fixed window averages over a TimeSeries", () => {
    const timeseries = timeSeries(sept2014Data);
    const everyDay = window(duration("1d"));
    const dailyAvg = timeseries.fixedWindowRollup({
      window: everyDay,
      aggregation: { value: ["value", avg()] }
    });

    expect(dailyAvg.size()).toBe(5);
    expect(dailyAvg.at(0).get()).toBe(46.875);
    expect(dailyAvg.at(2).get()).toBe(54.083333333333336);
    expect(dailyAvg.at(4).get()).toBe(51.85);
  });

  it("can make Collections for each day in the TimeSeries", () => {
    const timeseries = timeSeries(sept2014Data);
    const eachDay = window(duration("1d"));
    const collections = timeseries.collectByWindow({ window: eachDay });

    expect(collections["1d-16314"].size()).toBe(24);
    expect(collections["1d-16318"].size()).toBe(20);
  });

  it("can correctly use atTime()", () => {
    const t = new Date(1476803711641);

    let c = new Collection();
    c = c.addEvent(event(time(t), Immutable.Map({ value: 2 })));

    // Test bisect to get element 0
    const ts = new TimeSeries({ name: "coll", collection: c });
    const bisect = ts.bisect(t);
    expect(bisect).toEqual(0);
    expect(ts.at(bisect).get()).toEqual(2);

    // Test atTime to get element 0
    expect(ts.atTime(t).get()).toEqual(2);
  });
});
