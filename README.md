# Pond

A library build on top of immutable.js to provide basic timeseries functionality within ESnet tools.

## Why

Because we use timeseries data throughout our network visualization application, especially on the client, but potentially on the server. We would like a library to do this is a consistent and immutable way. The alternative for us has been to pass ad-hoc data structures between the server and the client, making all elements of the system much more complicated than they need to be. Not only do we need to deal with different formats at the UI layer, we also repeat our processing code over and over.

## What does it do?

Pond is built on several primitives:

* Time - these are basic Javascript Date objects. We refer to these as timestamps.
* Timerange - a begin and end time, packaged together.
* Index - A timerange denoted by a string, for example 5m-1234 is a 5 minute timerange.

Building on these, we have Events:

* Event - These are a timestamp and a data object packaged together.
* IndexedEvent - An index (timerange) and a data object packaged together. e.g. 1hr sample
* TimerangeEvent - A timerange and a data object packaged together. e.g. outage event [TODO]

And forming together a series of events, we have a timeseries:

* Series - Conceptually a sequence of Events.
* IndexedSeries - A sequence of Events  within a timerange denoted by an Index.
* TimerangeSeries - A sequence of Events within a timerange bounded by a begin and end time [TODO]

And then high level helper functions to:

* Create timerange bound buckets and aggregate events into those buckets
* Create Series objects from Event streams [TODO]
* Resampling [TODO]

## Primitives

### Time

Pond is a library for handling time related stucture, so the most basic of elements is time itself. Pond don't wrap any specific representation. Instead constructors of other primitives will generally accept either ms since UNIX epoch, a Javascript Date object or a Moment.

### Timerange

TODO

### Index

An index is simply a string a range of time. For example:

    1d-12355

Is a 1 hour timerange that corresponds to 30th Oct 2003 (GMT). In fact, it is the 12355th day since the UNIX epoch.

An Index is a nice representation of certain types of time intervals because it can be cached with its string representation as a key.

The Index has a basic interface to find the TimeRange it as well as get back the original string.

Currently only the above type of Index representation is implemented, however in the future something like 2015-04 could be used to represent April 2015.

Example:

    var index = new Index("1h-123554");
    index.asTimerange().humanizeDuration() // "an hour"

### Events

There are three types of events in Pond:

    1) Event - A generic event which associates a timestamp with some data
    2) TimeRangeEvent - Assoicates a TimeRange with some data
    3) IndexedEvent - Assoicates a time range specified as an Index

The creation of an Event is done with two parts, the timestamp and the data. To specify the timestamp you may use a Javascript Date object, a Moment, or the number of ms since the UNIX epoch.

To specify the data you can supply a Javascript object of key/values, a
Immutable Map, or a simple type such as an integer. In the case of the simple
type this is a shorthand for supplying {"value": v}.
 
 Example:

 Given some source of data that looks like this:

    {
        "start_time": "2015-04-22T03:30:00Z",
        "end_time": "2015-04-22T13:00:00Z",
        "description": "At 13:33 pacific circuit 06519 went down.",
        "title": "STAR-CR5 - Outage",
        "completed": true,
        "external_ticket": "",
        "esnet_ticket": "ESNET-20150421-013",
        "organization": "Internet2 / Level 3",
        "type": "U"
    }

We first extract the begin and end times to build a TimeRange:

    let b = new Date(sampleEvent.start_time);
    let e = new Date(sampleEvent.end_time);
    let timerange = new TimeRange(b, e);

Then we combine the TimeRange and the event itself to create the Event.

    let event = new TimeRangeEvent(timerange, sampleEvent);

Once we have an event we can get access the time range with:

    event.begin().getTime()   // 1429673400000
    event.end().getTime())    // 1429707600000
    event.humanizeDuration()) // "10 hours"

And we can access the data like so:

    event.get("title")  // "STAR-CR5 - Outage"

Or use:

    event.data()

to fetch the whole data object, which will be an Immutable Map.

### TimeSeries

Suppose you have some timeseries data that looks like this:

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

    var event = series.at(1);

An event is a timestamp and some data, so to deconstruct the event you can use `timestamp()` and `data()` methods:

    var data = series.data(); // {"value":18}
    var timestamp = series.timestamp().getTime(); //1400425948000

## How to use

TODO

# Tests

The library has Mocha tests. To run the tests, use:

    npm start

Then point your browser to:

    http://localhost:9500/webpack-dev-server/tests
