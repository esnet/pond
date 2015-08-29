## Collectors (experimental)

A close relative of aggregation is collection. A collection object can be used to assemble a TimeSeries by feeding events it. This is probably best explained with an example.

First, lets make some events:

    var events = [];
    events.push(new Event(new Date(2015, 2, 14, 7, 57, 0), {"cpu1": 23.4, "cpu2": 55.1}));
    events.push(new Event(new Date(2015, 2, 14, 7, 58, 0), {"cpu1": 36.2, "cpu2": 45.6}));
    events.push(new Event(new Date(2015, 2, 14, 7, 59, 0), {"cpu1": 38.6, "cpu2": 65.2}));
    events.push(new Event(new Date(2015, 2, 14, 8,  0, 0), {"cpu1": 24.5, "cpu2": 85.2}));
    events.push(new Event(new Date(2015, 2, 14, 8,  1, 0), {"cpu1": 45.2, "cpu2": 91.6}));

Similarly to constructing a Aggregator, we build a Collector:

    var hourlyCollector = new Collector("1h");

Then we setup a handler to catch the emitted TimeSeries. Here we'll just console.log the result:

    hourlyCollector.onEmit((series) => {
        console.log(series);
    });

And then as in the Aggregator, we feed it our events, and call done() to flush at then end:

    _.each(events, (event) => {
        hourlyCollector.addEvent(event);
    });

    hourlyCollector.done();

The result will be two emitted timeseries objects containing all events within each indexed hour.

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
