# Pond

A library build on top of immutable.js to provide basic timeseries functionality within ESnet tools.

## Why

Because we use timeseries data throughout our network visualization application, especially on the client, but potentially on the server. We would like a library to do this is a consistent and immutable way. The alternative for us has been to pass ad-hoc data structures between the server and the client, making all elements of the system much more complicated than they need to be. Not only do we need to deal with different formats at the UI layer, we also repeat our processing code over and over.

## What does it do?

Pond is built on several primitives:

* Time - these are basic Javascript Date objects. We refer to these as timestamps.
* Timerange - a begin and end time, packaged together.
* Index - A timerange denoted by a string, for example 5m-1234 is a 5 minute timerange.

Building on these, we have:

* Event - These are a timestamp and a data object packaged together.
* IndexedEvent - An index (timerange) and a data object packaged together.
* Series - Conceptually a sequence of Events.
* IndexedSeries - A sequence of Events  within a timerange denoted by an Index. [TODO]

And then high level helper functions to:

* Create timerange bound buckets and aggregate events into those buckets
* Create Series objects from Event streams [TODO]
* Resampling [TODO]

## Examples

### Creating a series

Suppose you have some timeseries data that looks like this. 

    var data = {
        "name": "traffic",
        "columns": ["time", "value"],
        "points": [
            [1400425947000, 52],
            [1400425948000, 18],
            [1400425949000, 26],
            [1400425950000, 93],
            ...
        ]
    };

In fact, if you get your data from InfluxDB, this is exactly what your data will look like.

Now you want to create a Series object from that. To do that simply use the constructor:

    var series = new Series(data);

To get how many rows there are in a `Series` use `size()`.

To get a particular row back out of the `Series`, use `at(i)`. It will return the row and an `Event`. like this:

```
    var event = series.at(1);
```

An event is a timestamp and some data, so to deconstruct the event you can use `timestamp()` and `data()` methods:

```
    var data = series.data(); // {"value":18}
    var timestamp = series.timestamp().getTime(); //1400425948000
```

## How to use

TODO

# Tests

The library has Mocha tests. To run the tests, use:

    npm start

Then point your browser to:

    http://localhost:9500/webpack-dev-server/tests
