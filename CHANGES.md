## 0.5

Large update causing many API changes, especially within what was previously the Processor pipeline (now Pipeline). The core structures such as Events and TimeSeries remain largely the same, at least from an API perspective, with mostly feature additions and bug fixes. We are still evolving the pipeline code but feel this is a significant step forward and one which we can build on going forward.

### 0.5.0

 * Pipeline is a complete rewrite of the Processing code. It now unifies operations on sets of Events into a Collection class that also backs the TimeSeries itself. This enables the pipelines to operate on either streams of Events or on TimeSeries or Collections.
 * Pipelines therefore support a limited notion of either streaming or batch processing.
 * Pipelines support fixed window aggregations as well as general grouping by key or function
 * Pipeline operators:
   - select() for choosing specific event fields
   - collapse() for collapsing specific event fields using a reducer
   - map() for doing element-wise transformations of events
   - filter() for conditionally removing events based on a filter function
   - take() for accepting only the first n events through the pipeline, for a given window and key
   - count() for counting up events that fall within a given window and key
   - aggregate() for building new aggregated events from collections based on the given window and key
   - converters for converting between event types
  * Pipeline simple triggers for each event, each collection discard and on flush using emitOn()
  * Pipeline output support using to() for emitting Collections and Events
  * Pipeline input support using from() for Collections, TimeSeries, or UnboundedIns.
 * Event access using get() allows use of fieldSpecs, which can be fieldNames or dot delimited paths to deeper data
 * Events no longer have a key. Groupby keys ares managed by the pipeline itself now
 * TimeRange: fixes lastYear() static function
 * TimeSeries: fixes duplicate size() definition
 * TimeSeries and Collection: first() and last() are aggregation functions now, while atFirst() and atLast() returns the first/last event in the series/collection
 * Project
    - Updated to Babel 6
    - Added code coverage
    - Auto-build of docs for website

## 0.4

### 0.4.2

 * Fixed creation of a `TimeSeries` from `TimeRangeEvents`.
 * Fixed `timerange()` calculation of a `TimeSeries` made of `TimeRangeEvents`.

### 0.4.1

 * Fixed TimeSeries import

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

## 0.3

### 0.3.0

 * Better support for nested objects:
    * Converts deeper structures to Immutable objects internally
    * Added "value functions" to operations that deal with columns of values so that you can pull out internals of nested structures.
    * Event's get() function will convert deep Immutable structures to JS objects.
 * You can now use either value() or get() to get a value out of an Event.
 * Added ability to convert to time based Events when inserting IndexedEvents into a collection. This can be much faster to query.
 * Began work on ability to do things like sum a series or isolate columns of a series.
 * Website update as well as uniform linting

## 0.2

### 0.2.1

 * Fixed an issue with merge.

### 0.2.0

 * You can either merge two series with different columns together, or same columns and different times.

```
const trafficSeries = TimeSeries.merge("traffic", [inTraffic, outTraffic]);
```
