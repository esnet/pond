**This is the documentation for the next version (1.0 alpha) of Pond.js, written in Typescript. This
version has a brand new fully typed API. [CHANGES.md](https://github.com/esnet/pond/blob/master/CHANGES.md) contains an overview of the differences between the old pre-1.0 API and this one**

Version 0.8.x ([Documentation](https://esnet-pondjs.appspot.com/#/)) is the last released version of
the old Pond.js API. Note that v0.8 is the only version currently aligned with
react-timeseries-charts. If you are using react-timeseries-charts or any other library that depends
on the old API, you should use version 0.8.x.

---

## Introduction

Pond.js is a library built on top of [immutable.js](https://facebook.github.io/immutable-js/) and
[Typescript](https://www.typescriptlang.org/) to provide time-based data structures, serialization
and processing.

For data structures it unifies the use of times, time ranges, events, collections and time series.
For processing it provides a chained pipeline interface to aggregate, collect and process batches or
streams of events.

We are still developing Pond.js as it integrates further into our code, so it may change or be
incomplete in parts. That said, it has a growing collection of tests and we will strive not to break
those without careful consideration.

See the [CHANGES.md](https://github.com/esnet/pond/blob/master/CHANGES.md).

---

## Rationale

[ESnet](http://www.es.net) runs a large research network for the US Department of Energy. Our tools
consume events and time series data throughout our network visualization applications and data
processing chains. As our tool set grew, so did our need to build a library to work with
this type of data that was consistent and dependable. The alternative for us has been to pass ad-hoc
data structures between the server and the client, making all elements of the system much more
complicated. Not only did we need to deal with different formats at all layers of the system, we also
repeated our processing code over and over. Pond.js was built to address these pain points.

---

## Getting started

Pond can be installed from npm. The current released version of the Typescript rewrite of Pond is in pre-release so you need to install it explicitly:

```bash
> npm install pondjs@1.0.0-alpha.0
```

The old pre-1.0 version (v8.8.x) is available as the default version:

```bash
> npm install pondjs
```

Within a browser it is highly recommended that you use a module bundler such as webpack:

```
import { TimeSeries } from "pondjs";

const series = new TimeSeries({
    name: "sensor_data",
    columns: ["time", "sensor", "status"],
    points: [
        [1400425947000, 3, "ok"],
        [1400425948000, 8, "high"],
        [1400425949000, 2, "low"],
        [1400425950000, 3, "ok"],
        ...
    ]
});

series.avg("sensor");   // 4
```

In Node.js you should be able to just require Pond:

```
const { TimeSeries } = require("pondjs");
...
```

---

## API

#### [Time](./#class/time)

As this is a TimeSeries abstraction library, time is fundamental to all parts of the library. We
represent `Time` as a type in the Typescript version of the library, but in fact it is a light
weight wrapper over the milliseconds since the epoch. As a convenience, certain parts of the library
will also accept or return a standard Javascript `Date` object.

To construct a `Time`, use the `time()` factory function:

```typescript
const now = time(new Date());
```

You can also construct a `Time` in a number of different ways and convert the time to a string in
either UTC or local time, or several other convenience methods. `Time` is a subclass of a `Key`,
meaning it can be combined with a data object to form an event `Event<Time>`.

#### [TimeRange](./#class/timerange)

Sometimes we also want to express a range of time. For a basic expression of this, we use a
`TimeRange`. This is simply a begin and end time, but comes with many handy methods for display and
comparison.

You can construct `TimeRange`s with `Date` or `moment` objects.

```typescript
const range1 = timerange(ta, tb);
const range2 = timerange(tc, td);
range1.overlaps(range2); // boolean
```

`TimeRange` is also a subclass of `Key`, so it can be associated with data to form an
`Event<TimeRange>`. Hence you can express an event that occurs over a period of time (like a network
outage).

#### [Index](./#class/index)

An alternative time range denoted by a string, for example "5m-4135541" is a specific 5 minute time
range, or "2014-09" is September 2014.

```js
const i = index("5m-4135541");
i.asTimerange(); // Sat, 25 Apr 2009 12:25:00 GMT, Sat, 25 Apr 2009 12:30:00 GMT
```

You can aggregate a `TimeSeries` by a duration like "5m" to build a new `TimeSeries` of
`Event<Index>`s. An `Index`'s string is also a good caching key in some use cases.

#### [Duration](./#class/duration)

A length of time, with no particular anchor in history, used to specify `Period` frequencies and
`Window` durations.

```js
const d = duration(5, "minutes");
```

#### [Period](./#class/period)

A `Period` is a way to represent a repeating time, such as every 2 hours. Generally a `Period` is
used to construct a reoccurring window, which in Pond is a `Window`. A `Period` specifies a
`frequency` (or the length of time between repeats) and an `offset` (which offsets the beginning of
the period by a duration).

```js
const p = period(duration("5m")); // 5m, 10m, 15m, ...
```

#### [Window](./#class/window)

A reoccurring duration of time, such as a 15 minute window, incrementing forward in time every 5
min, offset to align with a particular time. A `Window` is typically used for time range based
grouping of `Event`s for performing aggregations within a `TimeSeries` or `Event` streams.

```js
const fifteenMinuteSliding = window(duration("15m"))
    .every(duration("5m"))
    .offsetBy(time("2017-07-21T09:33:00.000Z"));
```

#### [Event](./#class/event)

A key of a type that extends `Key`, which could be a `Time`, `TimeRange` or `Index`, and a data
object expressed as an `Immutable.Map` packaged together. `Event`s may signify a particular
measurement or metric, taken at a time, or over a time range. A `Collection` is used to hold many
`Event`s, while a `TimeSeries` holds many `Event`s, ordered by time, along with associated meta
data.

```js
const e = event(time(new Date(1487983075328)), Immutable.Map({ sensor: 3 }));
```

#### [Collection](./#class/collection) and [SortedCollection](./class/sortedcollection)

A `Collection` is a bag of `Event`s, with a comprehensive set of methods for operating on those.
`SortedCollection` is a `Collection` that maintains a chronological order to those `Event`s.

A `SortedCollection` underpins a `TimeSeries` as well as backing grouping and windowing within
`Stream`s.

```
const c = collection(
    Immutable.List([
        event(time("2015-04-22T03:30:00Z"), Immutable.Map({ a: 5, b: 6 })),
        event(time("2015-04-22T02:30:00Z"), Immutable.Map({ a: 4, b: 2 }))
    ])
);
c.size();  // 2
```

Using `SortedCollection.groupBy` you can create a [`GroupedCollection`](./class/groupedcollection),
while using `SortedCollection.window()` you can create a
[`WindowedCollection`](./class/windowedcollection). Both give a you a mapping between the grouping
and a corresponding `SortedCollection`.

#### [TimeSeries](./#class/timeseries)

The heart of the library, a TimeSeries is a `SortedCollection<K>` of events `Event<K>` and
associated meta data. One is constructed either with a list of `Event`s, or with a JSON object (the
so-called wire format):

```
const series = timeSeries({
    name: "data",
    columns: ["time", "sensor"],
    points: [
        [1400425947000, 52],
        [1400425948000, 18],
        [1400425949000, 26],
        [1400425950000, 93],
        ...
    ]
});
```

Once established a wide range of operations can be performed on the series, from the simple:

```js
series.avg("sensor"); // returns the average of the sensor column values
```

to performing time-based aggregations:

```js
const dailyAvg = series.fixedWindowRollup({
    window: everyDay,
    aggregation: { dailyAvg: ["sensor", avg()] }
}); // returns avg for every day of sensor values
```

As well as ways to split, combine and merge multiple `TimeSeries` in different ways.

```js
const mergedSeries = TimeSeries.timeSeriesListMerge({
    name: "traffic",
    seriesList: [inSeries, outSeries]
});
```

#### [Aggregation Functions](./#aggregation)

One of the most useful capabilities of the library is the ability to perform aggregations, such as
doing roll-ups using some window, or combining columns of a `TimeSeries` into a single columns using
some function. Many of the most common aggregation functions, such as avg(), max(), min() are
provided for this purpose. Each is a function that takes the function's options and returns the
function that provides the aggregation.

One option is a [filter function](./#filters) function which can be used to clean data on the fly so
that aggregation functions do not fail for messy data sets (such as containing null or NaN values).

#### [Streaming](./#class/stream)

Stream style processing of events to build more complex processing operations, either on incoming
real-time data. Supports remapping, filtering, windowing and aggregation. It is designed to
relatively light weight handling of incoming events. The current version of the streaming code no
longer supports grouping as generally this should be handled outside of Pond by creating multiple
streams. Still, the functionality provided here can be useful in many circumstances, such as when
sending events directly to a browser:

```typescript
const result = {};
const slidingWindow = window(duration("3m"), period(duration("1m")));
const fixedHourlyWindow = window(duration("1h"));

const source = stream()
    .groupByWindow({
        window: slidingWindow,
        trigger: Trigger.onDiscardedWindow
    })
    .aggregate({
        in_avg: ["in", avg()],
        out_avg: ["out", avg()],
        count: ["in", count()]
    })
    .map(e => new Event<Time>(time(e.timerange().end()), e.getData()))
    .groupByWindow({
        window: fixedHourlyWindow,
        trigger: Trigger.perEvent
    })
    .output((col, key) => {
        result[key] = col as Collection<Time>;
        calls += 1;
    });

source.addEvent(e1)
source.addEvent(e2)
...
```

---

## Typescript

This library, as of 1.0 alpha, is now written entirely in Typescript. As a result, we recommend that
it is used in a Typescript application for full enjoyment of the type strictness it provides.
However, that is not a requirement.

Documentation is generated from the Typescript definitions and so will provide type information.
While especially useful when building a Typescript application, it is also a guide for Javascript
users as it will tell you the expected types, as well as consistency in generics.

See [How to read these docs](https://facebook.github.io/immutable-js/docs/#/) for a quick guide to
reading Typescript definitions.

---

## Contributing

Read the [contribution guidelines](./CONTRIBUTING.md).

The library is written in Typescript and has a large and growing Jest test suite. To run the tests
interactively, use:

```
cd packages/pond
npm test
```

---

## License

This code is distributed under a BSD style license, see the LICENSE file for complete information.

---

## Copyright

ESnet Timeseries Library ("Pond.js"), Copyright (c) 2015-2017, The Regents of the University of
California, through Lawrence Berkeley National Laboratory (subject to receipt of any required
approvals from the U.S. Dept. of Energy). All rights reserved.

If you have questions about your rights to use or distribute this software, please contact Berkeley
Lab's Innovation & Partnerships Office at IPO@lbl.gov.

NOTICE. This software is owned by the U.S. Department of Energy. As such, the U.S. Government has
been granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable,
worldwide license in the Software to reproduce, prepare derivative works, and perform publicly and
display publicly. Beginning five (5) years after the date permission to assert copyright is obtained
from the U.S. Department of Energy, and subject to any subsequent five (5) year renewals, the U.S.
Government is granted for itself and others acting on its behalf a paid-up, nonexclusive,
irrevocable, worldwide license in the Software to reproduce, prepare derivative works, distribute
copies to the public, perform publicly and display publicly, and to permit others to do so.
