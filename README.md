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

### Comparing series

One of the nice things about the TimeSeries representation in Pond is that it is built on top of immutable data structures. As a result, determining if a series is different from before is trivial.

A TimeSeries can be compared in two ways: with the `equals()` or `is()` static functions. `equals()` will check that the internal structures of the TimeSeries are the same reference. If you use the copy constructor, they will be the same. The `is()` function is perhaps more useful in that it will check to see if the structures, though perhaps being different references, have the same values.

### Aggregation

Say you have an incoming stream of Events and you want to aggregate them together. Pond can help with that. Here's an example. Lets create some events on 2/14/2015 that cross over the hour 7:57am, 7:58am, 7:59am, 8:00am and 8:01am. The values for these events are [3, 9, 6, 4, 5]:

    var incomingEvents = [];
    incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 57, 0), 3));
    incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 58, 0), 9));
    incomingEvents.push(new Event(new Date(2015, 2, 14, 7, 59, 0), 6));
    incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  0, 0), 4));
    incomingEvents.push(new Event(new Date(2015, 2, 14, 8,  1, 0), 5));

Now lets find the avg value in each of the hours. To do this we setup an Aggregator that's indexed on the hour ("1h") and will use an average function "avg", like this:

    var Pond = require("pond");
    var {Aggregator, Functions} = require("pond");
    var {max, avg, sum, count} = Functions;
    
    var hourlyAverage = new Aggregator("1h", avg);

The we hook up the hourlyAverage event emitted so we can collect the result (or pass it on to another aggregator). Here we'll just put them into a map using the index (or the hour) as a key:

    hourlyAverage.onEmit((index, event) => { outputEvents[index.asString()] = event;});

Note that you can combine the constructor and the emit hookup as well:

    var hourlyAverage = new Aggregator("1h", avg, (index, event) => {
        outputEvents[index.asString()] = event;
    });

Then we can add events as long as we want, forever even:

    _.each(incomingEvents, event => { hourlyAverage.addEvent(event); });

Knowing when to be done with a bucket that we're aggregating into depends on the situation. If this is a continuous stream of events then the code currenly considers it done with a bucket when an event comes in that fits into another bucket. In this example the first event will create the first bucket. Then next two events also fit into this bucket. The 4th event is in the following hour so the old bucket is aggregated based on the aggregation function, and event is emitted with that value, and a new bucket is created for the 4th event. The 5th event goes into the same bucket. In this case we want to flush the bucket after the 5th event, so we call:

    hourlyAverage.done();

After this our `outputEvents` object will contain two entries:

    outputEvents["1h-396206"].get();   // 6
    outputEvents["1h-396207"].get();  // 4.5

Events may also be more complex, with entries like this:

    Event(now, {"cpu1": 23.4, "cpu2": 55.1}

Aggregation events will keep the same structure.

### Collection

A close relative of aggregation is collection. A collection object can be used to assemble IndexedTimeSeries by feeding events to the Collector. This is probably best explained with an example.

First, lets make some events:

    var events = [];
    events.push(new Event(new Date(2015, 2, 14, 7, 57, 0), {"cpu1": 23.4, "cpu2": 55.1}));
    events.push(new Event(new Date(2015, 2, 14, 7, 58, 0), {"cpu1": 36.2, "cpu2": 45.6}));
    events.push(new Event(new Date(2015, 2, 14, 7, 59, 0), {"cpu1": 38.6, "cpu2": 65.2}));
    events.push(new Event(new Date(2015, 2, 14, 8,  0, 0), {"cpu1": 24.5, "cpu2": 85.2}));
    events.push(new Event(new Date(2015, 2, 14, 8,  1, 0), {"cpu1": 45.2, "cpu2": 91.6}));

Similarly to constructing a Aggregator, we build a Collector:

    var hourlyCollector = new Collector("1h");

Then we catch emitted IndexedTimeSeries:

    hourlyCollector.onEmit((series) => {
        console.log(series);
    });

And then as in the Aggregator, we feed it our events, and call done() to flush at then end:

    //Add events
    _.each(events, (event) => {
        hourlyCollector.addEvent(event);
    });

    //Done
    hourlyCollector.done();

The result will be an emitted timeseries object containing all events within each indexed hour.

For 2/14/2014 7am-8am:

    {
        "name": "1h-396206",
        "index": "1h-396206",
        "columns": ["time", "cpu1", "cpu2"],
        "points": [
            ["2015-03-14T14:57:00.000Z", 23.4, 55.1],
            ["2015-03-14T14:58:00.000Z", 36.2, 45.6],
            ["2015-03-14T14:59:00.000Z", 38.6, 65.2]
        ]
    }

For 2/14/2014 8am-9am:

    {
        "name": "1h-396207",
        "index": "1h-396207",
        "columns": ["time", "cpu1", "cpu2"],
        "points":[
            ["2015-03-14T15:00:00.000Z",24.5,85.2],
            ["2015-03-14T15:01:00.000Z",45.2,91.6]
        ]
    }

## Combining aggregation and collection

In this example we have a series of 30sec events and we want to create daily blocks of data, each containing hourly avg values. To do this we'll use an aggregator to take our 30sec events and output averages for each hour. Then we'll use a collector to collect together those events into daily series.

First we construct a Collector called `dailyCollection` which will hold the hourly averages for that day (all 24 of them).

    let dailyCollector = new Collector("1d", (series) => {
        console.log(series.toString());
    });

Each hourly average is calculated from all the 30sec events within that hour. To aggregate the data within each hour we create a new hourly (`1h`) Aggregator called `hourlyAggregator`, which will use the avg function:

    let hourlyAggregator = new Aggregator("1h", avg, (index, event) => {
        dailyCollector.addEvent(event);
    });

As the hourly aggregator emits events, each one the avg of all the 30sec events fed into it for that hour, we catch those and feed them into the `dailyCollector`.

Once this is setup we are ready to start feeding in our actual events. In this case we'll pull them from a TimeSeries we built from some data, but equally they could be coming in one by one from some queue or other source.

We loop over all the events in the series and add each on to the aggregator we just created:

    const series = new TimeSeries({name: name,
                                   columns: ["time", "in", "out"],
                                   points: points});

    for (const event of series.events()) {
        hourlyAggregator.addEvent(event);
    }


# Tests

The library has Mocha tests. To run the tests, use:

    npm start

Then point your browser to:

    http://localhost:9500/webpack-dev-server/tests
