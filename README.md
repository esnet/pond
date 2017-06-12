
# Pond.js

---

[![Build status](https://api.travis-ci.org/esnet/pond.png)](https://travis-ci.org/esnet/pond) [![npm version](https://badge.fury.io/js/pondjs.svg)](https://badge.fury.io/js/pondjs)

----

Pond.js is a library built on top of [immutable.js](https://facebook.github.io/immutable-js/) to provide time-based data structures, serialization and processing within our tools.

For data structures it unifies the use of time ranges, events and collections and time series. For processing it provides a chained pipeline interface to aggregate, collect and process batches or streams of events.

We are still developing Pond.js as it integrates further into our code, so it may change or be incomplete in parts. That said, it has a growing collection of tests and we will strive not to break those without careful consideration.

See the [CHANGES.md](/#changelog).

## Rationale

[ESnet](http://www.es.net) runs a large research network for the US Department of Energy. Our tools consume events and time series data throughout our network visualization applications and data processing chains. As our tool set grew, so did our need to build a Javascript library to work with this type of data that was consistent and dependable. The alternative for us has been to pass ad-hoc data structures between the server and the client, making all elements of the system much more complicated. Not only do we need to deal with different formats at all layers of the system, we also repeat our processing code over and over. Pond.js was built to address these pain points.

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
const timeseries = new TimeSeries(weatherData);
const dailyAvg = timeseries.fixedWindowRollup("1d", {value: avg});
```

Or much higher level batch or stream processing using the Pipeline API:

```js
const p = Pipeline()
    .from(timeseries)
    .take(10)
    .groupBy(e => e.value() > 65 ? "high" : "low")
    .emitOn("flush")
    .to(CollectionOut, (collection, windowKey, groupByKey) => {
        result[groupByKey] = collection;
    }, true);
```

## What does it do?

Pond has three main goals:

 1. **Data Structures** - Provide a robust set of time-related data structures, built on Immutable.js
 2. **Serialization** - Provide serialization of these structures for transmission across the wire
 3. **Processing** - Provide processing operations to work with those structures

Here is a summary of what is provided:

* **TimeRange** - a begin and end time, packaged together
* **Index** - A time range denoted by a string, for example "5m-1234" is a specific 5 minute time range, or "2014-09" is September 2014
* **TimeEvent** - A timestamp and a data object packaged together
* **IndexedEvents** - An Index and a data object packaged together. e.g. 1hr max value
* **TimeRangeEvents** - A TimeRange and a data object packaged together. e.g. outage event occurred from 9:10am until 10:15am

And forming together collections of events:

* **Collection** - A bag of events, with a helpful set of methods for operating on those events
* **TimeSeries** - An ordered Collection of Events and associated meta data, along with operations to roll-up, aggregate, break apart and recombine TimeSeries.

And then high level processing via pipelines:

* **Pipeline** - Stream or batch style processing of events to build more complex processing operations, either on fixed TimeSeries or incoming realtime data. Supports windowing, grouping and aggregation.

# Typescript support

As of version 0.8.6 Pond ships with Typescript declarations.

In addition, the project is also being rewritten in Typescript, which will probably eventually lead to a v1.0 version as the API will have significant differences. You can track the progress of that work in [Issue #65](https://github.com/esnet/pond/issues/65).

# Contributing

Read the [contribution guidelines](./CONTRIBUTING.md).

The library has a large and growing Jest test suite. To run the tests interactively, use:

    npm test


# License

This code is distributed under a BSD style license, see the LICENSE file for complete information.

# Copyright

ESnet Timeseries Library ("Pond.js"), Copyright (c) 2015-2017, The Regents of the University of California, through Lawrence Berkeley National Laboratory (subject to receipt of any required approvals from the U.S. Dept. of Energy).  All rights reserved.
 
If you have questions about your rights to use or distribute this software, please contact Berkeley Lab's Innovation & Partnerships Office at  IPO@lbl.gov.
 
NOTICE.  This software is owned by the U.S. Department of Energy.  As such, the U.S. Government has been granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, and perform publicly and display publicly.  Beginning five (5) years after the date permission to assert copyright is obtained from the U.S. Department of Energy, and subject to any subsequent five (5) year renewals, the U.S. Government is granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, distribute copies to the public, perform publicly and display publicly, and to permit others to do so.
