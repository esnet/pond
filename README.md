[![Build status](https://api.travis-ci.org/esnet/pond.png)](https://travis-ci.org/esnet/pond) [![npm version](https://badge.fury.io/js/pondjs.svg)](https://badge.fury.io/js/pondjs)

----

A library build on top of immutable.js to provide time-based data structures and processing within ESnet tools. For data structures it unifies the use of time ranges, events and timeseries. For processing it provides a chained operations interface to aggregate and collect streams of events.

We are still developing Pond as it integrates further into our code, so it may change or be incomplete in parts. That said it has a growing collection of tests and we will strive not to break those without careful consideration. See the CHANGES.md document for version updates.

## Rational

We consume timeseries data throughout our network visualization applications and data processing chains so we needed to build a Javascript library to work with that was consistent and immutable way. The alternative for us has been to pass ad-hoc data structures between the server and the client, making all elements of the system much more complicated. Not only do we need to deal with different formats at all layers of the system, we also repeat our processing code over and over.

The result might be as simple as comparing two time ranges:

```js
    const timerange = timerange1.intersection(timerange2);
    timerange.asRelativeString();  // "a few seconds ago to a month ago"
```

Or finding the average value in a timeseries:

```js
    timeseries.avg("sensor");
```

Or much higher level stream processing:

```js
    // Set up processing chain
    const processor = Processor()
        .groupBy("channelName")
        .aggregate("5m", avg)
        .collect("1d", false, timeseries => {
            // --> Output timeseries representing 1 day of 5 min averages
        });
    // As events come in...
    processor.addEvents(incomingEvents);
```

## What does it do?

Pond has two main goals: basic data structures built on Immutable.js and processing operations to work with those structures. Here is a summary of what is provided:

* **TimeRange** - a begin and end time, packaged together.
* **Index** - A time range denoted by a string, for example "5m-1234" is a 5 minute timerange, or "2014-09" is September 2014.
* **Events** - These are a timestamp and a data object packaged together.
* **IndexedEvents** - An index (timerange) and a data object packaged together. e.g. 1hr sample
* **TimeRangeEvents** - A timerange and a data object packaged together. e.g. outage event

And forming together a collection of events, we have a Timeseries:

* **TimeSeries** - A sequence of Events associated with a list of times or time ranges (Indexes).

And then high level helper functions to:

* **Aggregate** - Create time range bound buckets and aggregate events into those buckets
* **Collect** - Create TimeSeries objects from Event streams
* **Bin** - Fit data into regular intervals
* **Resample** [TODO]

And finally a a chained interface to the high level functions:

* **Processor** - Build a stream of events using .aggregate(), .collect() etc.

# Getting started

Pond will run in node.js (ideally using babel-node) or in the browser (ideally via webpack). Install from npm:

    npm install pondjs --save

For further information see the [Getting started](http://software.es.net/pond/#/start) guide.

# Tests

The library has Mocha tests. To run the tests interactively, use:

    npm run start-tester

Then point your browser to:

    http://localhost:9500/webpack-dev-server/tests

Or to run the tests (and linting) on the command line:

    npm test

# License

This code is distributed under a BSD style license, see the LICENSE file for complete information.

# Copyright

ESnet Timeseries Library ("Pond"), Copyright (c) 2015, The Regents of the University of California, through Lawrence Berkeley National Laboratory (subject to receipt of any required approvals from the U.S. Dept. of Energy).  All rights reserved.
 
If you have questions about your rights to use or distribute this software, please contact Berkeley Lab's Innovation & Partnerships Office at  IPO@lbl.gov.
 
NOTICE.  This software is owned by the U.S. Department of Energy.  As such, the U.S. Government has been granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, and perform publicly and display publicly.  Beginning five (5) years after the date permission to assert copyright is obtained from the U.S. Department of Energy, and subject to any subsequent five (5) year renewals, the U.S. Government is granted for itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in the Software to reproduce, prepare derivative works, distribute copies to the public, perform publicly and display publicly, and to permit others to do so.
