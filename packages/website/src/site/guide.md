## Introduction

Pond.js is a library built on top of [immutable.js](https://facebook.github.io/immutable-js/)
and [Typescript](https://www.typescriptlang.org/) to provide time-based data structures,
serialization and processing.

For data structures it unifies the use of times, time ranges, events, collections and time series.
For processing it provides a chained pipeline interface to aggregate, collect and process batches
or streams of events.

We are still developing Pond.js as it integrates further into our code, so it may change or be
incomplete in parts. That said, it has a growing collection of tests and we will strive not to break
those without careful consideration.

See the [CHANGES.md](/#changelog).

---
## Rationale

[ESnet](http://www.es.net) runs a large research network for the US Department of Energy. Our tools
consume events and time series data throughout our network visualization applications and data processing
chains. As our tool set grew, so did our need to build a Javascript library to work with this type of data
that was consistent and dependable. The alternative for us has been to pass ad-hoc data structures between
the server and the client, making all elements of the system much more complicated. Not only do we need to
deal with different formats at all layers of the system, we also repeat our processing code over and over.
Pond.js was built to address these pain points.

---
## API

### Time

As this is a TimeSeries abstraction library, time is fundamental to all parts of the library. We represent `Time` as a type in the Typescript version of the library, but in fact it is a light weight wrapper over the milliseconds since the epoch. As a convenience, certain parts of the library will also accept or return a standard Javascript `Date` object.

To construct a `Time`, use the `time()` factory function:

```typescript
const now = time(new Date())
```

You can also construct a `Time` in a number of different ways and convert the time to a string in either UTC or local time, or several other convenience methods. `Time` is a subclass of a `Key`, meaning it can be combined with a data object to form an event `Event<Time>`.

### TimeRange

Sometimes we also want to express a range of time. For a basic expression of this, we use a `TimeRange`. This is simply a begin and end time, but comes with many handy methods for display and comparison.

You can construct `TimeRange`s with `Date` or `moment` objects.

```typescript
const range1 = timerange(ta, tb);
const range2 = timerange(tc, td);
range1.overlaps(range2)  // boolean
```

`TimeRange` is also a subclass of `Key`, so it can be associated with data to form an `Event<TimeRange>`. Hence you can express an event that occurs over a period of time (like a network outage).

### Index

A time range denoted by a string, for example "5m-1234" is a specific 5 minute time range, or "2014-09" is September 2014

### Period

A `Period` is a way to represent a repeating time, such as every 2 hours. Generally a `Period` is used to construct a reoccurring window, which in Pond is a `Window`. A `Period` specifies a `frequency` (or the length of time between repeats) and an `offset` (which offsets the beginning of the period by a duration).

```typescript
const p = period(duration("5m"))  // 5m, 10m, 15m, ...
```

### Duration

A length of time, with no particular anchor

### Window

A reoccurring duration of time, such as a one hour window, incrementing forward in time every 5 min

### Event\<K\>

A key of type T, which could be Time, TimeRange or Index, and a data object packaged together.

### Collection\<K\>

A bag of events `Event<K>`, with a comprehensive set of methods for operating on those events.

### TimeSeries\<K\>

A sorted `Collection<K>` of events `Event<K>` and associated meta data

```js
timeseries.avg("sensor");
```

Or quickly performing aggregations on a timeseries:

```js
const dailyAvg = timeseries.fixedWindowRollup({
    window: everyDay,
    aggregation: { dailyAvg: ["sensor", avg()] }
});
```

### Streaming

Stream style processing of events to build more complex processing operations, either on incoming real-time data. Supports remapping, filtering, windowing and aggregation.

---
## Typescript

This library, as of 1.0 alpha, is now written entirely in Typescript. As a result, we recommend that it
is used in a Typescipt application for full enjoyment of the type strictness it provides. However,
that is not a requirement.

Documentation is generated from the Typescript definitions and so will provide type information. While
especially useful when building a Typescript application, it is also a guide for Javascript users as
it will tell you the expected types, as well as consistency in generics.

See [How to read these docs](https://facebook.github.io/immutable-js/docs/#/) for a quick guide to reading
Typescript definitions.

---
## Contributing

Read the [contribution guidelines](./CONTRIBUTING.md).

The library is written in Typescript and has a large and growing Jest test suite.
To run the tests interactively, use:

```
npm test
```

---
## License

This code is distributed under a BSD style license, see the LICENSE file for complete information.

---
## Copyright

ESnet Timeseries Library ("Pond.js"), Copyright (c) 2015-2017, The Regents of the University of California, through Lawrence Berkeley National Laboratory (subject to receipt of any required approvals from the U.S. Dept. of Energy).  All rights reserved.
 
If you have questions about your rights to use or distribute this software, please contact Berkeley Lab's Innovation & Partnerships Office at  IPO@lbl.gov.
 
NOTICE.  This software is owned by the U.S. Department of Energy.  As such, the U.S. Government has been granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, and perform publicly and display publicly.  Beginning five (5) years after the date permission to assert copyright is obtained from the U.S. Department of Energy, and subject to any subsequent five (5) year renewals, the U.S. Government is granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, distribute copies to the public, perform publicly and display publicly, and to permit others to do so.


