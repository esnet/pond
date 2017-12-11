
# Pond.js

**Version 1.0 (alpha) of Pond.js is written in Typescript and has a brand new fully typed API**

Version 0.8 ([Documentation](https://esnet-pondjs.appspot.com/#/)) is the last released version of the old Pond.js API. Note that v0.8 is the only version currently aligned with react-timeseries-charts.

---

Pond.js is a library built on top of [immutable.js](https://facebook.github.io/immutable-js/)
and [Typescript](https://www.typescriptlang.org/) to provide time-based data structures,
serialization and processing.

For data structures it unifies the use of times, time ranges, events, collections and time series.
For processing it provides a chained pipeline interface to aggregate, collect and process batches
or streams of events.

We are still developing Pond.js as it integrates further into our code, so it may change or be
incomplete in parts. That said, it has a growing collection of tests and we will strive not to break
those without careful consideration.

See the [CHANGES.md](https://github.com/esnet/pond/blob/master/CHANGES.md).

## Rationale

[ESnet](http://www.es.net) runs a large research network for the US Department of Energy. Our tools
consume events and time series data throughout our network visualization applications and data processing
chains. As our tool set grew, so did our need to build a Javascript library to work with this type of data
that was consistent and dependable. The alternative for us has been to pass ad-hoc data structures between
the server and the client, making all elements of the system much more complicated. Not only do we need to
deal with different formats at all layers of the system, we also repeat our processing code over and over.
Pond.js was built to address these pain points.

The result might be as simple as comparing two time ranges:

```js
const timerange = timerange1.intersection(timerange2);
timerange.asRelativeString();  // "a few seconds ago to a month ago"
```

Or simply getting the average value in a timeseries:

```js
timeseries.avg("sensor");
```

Or quickly performing aggregations on a timeseries:

```js
const dailyAvg = timeseries.fixedWindowRollup({
    window: everyDay,
    aggregation: { value: ["value", avg()] }
});
```

Or much higher level batch or stream processing using the chained API:

```js
const source = stream()
    .groupByWindow({
        window: everyThirtyMinutes,
        trigger: Trigger.onDiscardedWindow
    })
    .aggregate({
        in_avg: ["in", avg()],
        out_avg: ["out", avg()]
    })
    .output(evt => // result );
```

---

## How to install

Pond can be installed from npm.

The current version of the Typescript rewrite of Pond is pre-release 1.0 alpha, so you need to
install it explicitly:

```
npm install pondjs@1.0.0-alpha.0
```

The older Javascript version (v0.8.x), which is the only one currently compatible with the companion
visualization library react-timeseries-charts, is still the default version:

```
npm install pondjs
```

## What does it do?

Pond has three main goals:

 1. **Data Structures** - Provide a robust set of time-related data structures, built on Immutable.js
 2. **Serialization** - Provide serialization of these structures for transmission across the wire
 3. **Processing** - Provide processing operations to work with those structures

Here is the high level overview of the data structures provided:

* **Time** - a timestamp
* **TimeRange** - a begin and end time, packaged together
* **Index** - A time range denoted by a string, for example "5m-1234" is a specific 5 minute time range, or "2014-09" is September 2014

* **Duration** - A length of time, with no particular anchor
* **Period** - A reoccurring time, for example "hourly"
* **Window** - A reoccurring duration of time, such as a one hour window, incrementing forward in time every 5 min
* **Event\<K\>** - A key of type T, which could be Time, TimeRange or Index, and a data object packaged together
* **Collection\<K\>** - A bag of events `Event<K>`, with a comprehensive set of methods for operating on those events
* **TimeSeries\<K\>** - A sorted `Collection<K>` of events `Event<K>` and associated meta data

And then high level processing can be achieved either by chaining together `Collection` or `TimeSeries` operations, or with the experimental `Stream` API:

* **Stream** - Stream style processing of events to build more complex processing operations, either on incoming realtime data. Supports remapping, filtering, windowing and aggregation.

# Typescript

This library, as of 1.0 alpha, is now written entirely in Typescript. As a result, we recommend that it
is used in a Typescipt application. However, that is not a requirement.

The [documentation](http://software.es.net/pond/#/) website is generated from the Typescript definitions
and so will provide type information. While especially useful when building a Typescript application,
it is also a guide for Javascript users as it will tell you the expected types, as well as understanding
consistency in generics. See these [How to read these docs](https://facebook.github.io/immutable-js/docs/#/)
for a quick guide to reading Typescript definitions.

v0.8.8 of Pond ships with basic Typescript declarations that were contributed to the project.

# Contributing

Read the [contribution guidelines](./CONTRIBUTING.md).

The library is written in Typescript and has a large and growing Jest test suite.
To run the tests interactively, use:

```
npm test
```

# License

This code is distributed under a BSD style license, see the LICENSE file for complete information.

# Copyright

ESnet Timeseries Library ("Pond.js"), Copyright (c) 2015-2017, The Regents of the University of California, through Lawrence Berkeley National Laboratory (subject to receipt of any required approvals from the U.S. Dept. of Energy).  All rights reserved.
 
If you have questions about your rights to use or distribute this software, please contact Berkeley Lab's Innovation & Partnerships Office at  IPO@lbl.gov.
 
NOTICE.  This software is owned by the U.S. Department of Energy.  As such, the U.S. Government has been granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, and perform publicly and display publicly.  Beginning five (5) years after the date permission to assert copyright is obtained from the U.S. Department of Energy, and subject to any subsequent five (5) year renewals, the U.S. Government is granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, distribute copies to the public, perform publicly and display publicly, and to permit others to do so.
