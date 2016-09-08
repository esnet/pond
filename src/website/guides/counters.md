# SNMP counter example

Measurement data we receive from our network routers comes in the form of counters. These counters generally increases monotonically. In this example we combine the alignment with the rate function to get a TimeSeries of network traffic (e.g. bits per second).

While this example relates to network traffic, it could also apply to click streams, etc.

Data we get from the network is requested every 30 seconds from the routers. This is done with SNMP, a network management protocol. The response from the network arrives some time shortly after the request. At this point we timestamp the value because it is the most representative time we can come up with (the router does not timestamp the response). As a result, we typically find our incoming data events to be approximately every 30 seconds, but not quite. We might have values at 1:31, 2:02, 2:31, 3:04, etc.

In addition to this, we experience missing points from time to time (in the order of a handful per day) and we also experience counter reset where the counter reaches a numerical limit and resets itself.

The problem with this is that it makes downstream processing much harder to deal with.

Pond has several useful features to address this data ingestion problem. In pond.js, data can be processed as a stream (though a naive one that doesn't have mechanisms for dealing with out of order data), or as a batch process on a bounded source such as a TimeSeries. In either case we might want to use Pond to manage our situation.

## Preparing the data

Let's say we want to write a batch task to do this, where we read approximately a days data from some storage to process.

Our initial goal is to collect our data into a `TimeSeries` object. From there we can process it either with the built in methods or by feeding it through a pipeline.

To collect data into a TimeSeries object we would generally map it from our native format into an object such as the following:

```js
    const trafficData = {
        name: "ames-lab-traffic",
        columns: ["time", "in"],
        points: [
            [[1468886425000, 30149747500170],
            [1468886456000, 30149754529057],
            [1468886487000, 30149765964686],
            [1468886517000, 30149774808349],
            [1468886548000, 30149786620883],
            [1468886578000, 30149797218334],
            [1468886609000, 30149806694886],
            [1468886639000, 30149814247765],
            [1468886640000, null],
            [1468886670000, 30149836244496],
            [1468886700000, 30149845139313],
            [1468886731000, 30149853210590],
            [1468886761000, 30149861469019]
            ...],
        ]
    }
```

And then construct a TimeSeries from that:

```js
    const traffic = new TimeSeries(trafficData);
```

## Alignment

Next we want to get our data onto exact 30 second boundaries. This is now a simple task of calling the align() function on the TimeSeries.

```js
    const aligned = traffic.align({
        fieldSpec: "in",
        period: "30s",
        method: "linear",
        limit: 2
    });
```

Some things to note here: firstly, we refer to the "in" column with the fieldSpec. If we had both the "in" and "out" values in our TimeSeries we could have used a fieldSpec of ["in", "out"]. Secondly, we specify the alignment boundaries with the period, in this case we want to align the data to our 30 second request rate. Thirdly, we use "linear" interpolation to determine the value of the counter ("in" value) at the boundaries. And finally, we set a limit to 2. This will cause minor gaps in the data to be filled, while larger outages are left null.

## Rate (derivative)

Finally, we want to calculate the traffic rate from the growing counter value.

TimeSeries has a method for this too: rate(). It generates a new `TimeSeries` of `TimeRangeEvent` objects which contain the derivative between columns in two consecutive `Event` objects. The start and end time of the time range events correspond to the timestamps of the two events the calculation was derived from.

The primary use case for this was to generate rate data from monotonically increasing SNMP counter values like this:

```js
    const baseRate = aligned.rate({fieldSpec: "in", allowNegative: false});
```

Now we have the `baseRate` as a TimeSeries. We've taken our raw counter data, done a linearly interpolated alignment to 30 second boundaries, and then calculate the rates by calculating the derivative between the aligned boundaries.

Note that we also passed in `allowNegative` to be false. This will replace a negative change in the counter value to output a null instead of a rate. You could then use `fill()` to fill in that point, or leave it as a missing value.
