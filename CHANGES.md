
### 0.4.0

 * Support for processing chains. e.g.
 
```
    const processor = Processor()
        .groupBy("channelName")
        .aggregate("5m", avg)
        .collect("1d", false, timeseries => {
            // --> Output timeseries representing 1 day of 5 min averages
        });
```

 * `Aggregators` and `collector` now support emitting events "always", and not just when the "next" bucket is created
 * Processing function API has been cleaned up. To flush events, use `flush()` (`done()` and `sync()` are gone)
 * Event internals are now an Immutable.map rather than using member variables that could be modified
 * Events support keys to enable the ability to do groupBy operations. You can add a key to an `Event` with `setKey()`, and you'll get a new `Event` back which is the same as the old one, but with a key. You can query the key with, unsurprisingly, `key()`.
 * `Groupers` are a new `Event` processor which takes an incoming event stream and emits the same event but with a key on it. This enables downstream processing, such as aggregation, to group based on the key.

### 0.3.0

 * Better support for nested objects:
    * Converts deeper structures to Immutable objects internally
    * Added "value functions" to operations that deal with columns of values so that you can pull out internals of nested structures.
    * Event's get() function will convert deep Immutable structures to JS objects.
 * You can now use either value() or get() to get a value out of an Event.
 * Added ability to convert to time based Events when inserting IndexedEvents into a collection. This can be much faster to query.
 * Began work on ability to do things like sum a series or isolate columns of a series.
 * Website update as well as uniform linting

### 0.2.1

 * Fixed an issue with merge.

### 0.2.0

 * You can either merge two series with different columns together, or same columns and different times.

```
const trafficSeries = TimeSeries.merge("traffic", [inTraffic, outTraffic]);
```
