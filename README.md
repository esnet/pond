[![Build status](https://api.travis-ci.org/esnet/pond.png)](https://travis-ci.org/esnet/pond) [![npm version](https://badge.fury.io/js/%40esnet%2Fpond.svg)](https://badge.fury.io/js/%40esnet%2Fpond)

----

A library build on top of immutable.js to provide basic timeseries functionality within ESnet tools. It is in a very early stage of development.

## Why?

Because we consume timeseries data throughout our network visualization applications, especially on the client, but potentially on the server. We would like a library to do this in a consistent and immutable way. The alternative for us has been to pass ad-hoc data structures between the server and the client, making all elements of the system much more complicated than they need to be. Not only do we need to deal with different formats at the UI layer, we also repeat our processing code over and over.

## What does it do?

Pond is built on several primitives:

* **Time** - these are basic Javascript Date objects. We refer to these as timestamps.
* **TimeRange** - a begin and end time, packaged together.
* **Index** - A time range denoted by a string, for example "5m-1234" is a 5 minute timerange, or "2014-09" is September 2014.

Building on these, we have Events:

* **Event** - These are a timestamp and a data object packaged together.
* **IndexedEvent** - An index (timerange) and a data object packaged together. e.g. 1hr sample
* **TimeRangeEvent** - A timerange and a data object packaged together. e.g. outage event

And forming together a collection of events, we have a Timeseries:

* **Series** - Conceptually a sequence of Events.
* **TimeSeries** - A sequence of Events associated with a list of times or time ranges (Indexes).

And then high level helper functions to:

* **Aggregate** - Create time range bound buckets and aggregate events into those buckets
* **Collect** - Create TimeSeries objects from Event streams
* **Bin** - Fit data into regular intervals
* **Resample** [TODO]

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
