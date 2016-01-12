## Processor

While aggregators, collectors, binners and others are helpful, they require each one to be manually hooked together to process a stream of events. That's where the `Processor` comes in. It provides a chain-able interface to the Pond processing operators.

In this simple example we want to aggregate our incoming events into 5 minute averages, grouped by the channel name. We then want to collect them together into TimeSeries spanning seven days. Here's how we do that:

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

Currently you can chain the following process operators onto the Processor:

Processor takes a single options argument. Currently there is only one option:

### emit

**emit** - Rate to emit events. Either:
 * "always" - emit an event on every change
 * "next" - just when we advance to the next bucket

## Chaining methods

### groupBy(grouping)

This will fork future operations on the stream based on a key that is produced in one of several ways.

**grouping** may be either:
 * A function which takes an event and returns a string as a key
 * A string, which corresponds to a column in the event, like "name"
 * A list, which corresponds to a list of columns to join together for the key

### aggregate(window, operator, fieldSpec)

**window** - size of the window to aggregate over (e.g. "5m")
**operator** - aggregation function (e.g. avg, sum, etc)
**fieldSpec** - describes what part of the events to include in the aggregation. May be a string, list of strings for each event column, or a function.

### binner(window, operator, fieldSpec)

Normalize data into a even buckets. This essentially assumes that the incoming events represent a continuous function and that the result of this is to re-sample that function into the even and aligned bins.

**window** - size of the window to aggregate over (e.g. "5m")
**operator** - aggregation function (e.g. avg, sum, etc) to represent the bin as a value
**fieldSpec** - describes what part of the events to include in the aggregation. May be a string, list of strings for each event column, or a function.

### derivative(window, fieldSpec)

**window** - size of the window to take the derivative over (e.g. "30s")
**fieldSpec** - describes what part of the events to include in the aggregation. This can a column name (string), list of strings for each event column, or a function.

### collect(window, convertToTimes, observer)

Collects events into a TimeSeries spanning the specified window.

**window** - size of the window to collect over (e.g. "1d")
**convertToTimes** - Boolean. Transform IndexedEvents to Events during collection. Note that in the future we might include this type of conversion as a transform itself.

### log()

Writes out the emitted events to console.log. This will end the chain.

### out(function)

Calls the passed in function with each emitted event so that you can do something with the output stream. This will end the chain.


