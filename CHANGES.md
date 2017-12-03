## Changelog

---

## 0.8.8

> November 2017

* Fixed removed Typescript definitions
* Fixed edge case with TimeSeries slice

## 0.8.6

> June 2017

* Typescript definitions
* Documentation improvements

## 0.8.4

> February 2017

* Fix export of TimeEvent

## 0.8.3

> February 2017

* Removed AVRO support because of browser/webpack problems. Hopefully this will be added back in the
  future.

## 0.8

> February 2017

The API is headed towards a 1.0 release, hopefully by the summer. As we head there will be some
breaking changes and this release includes some of these, so please read the section on Important
Breaking Changes below to see what needs to be changed. Sorry!

**Important breaking changes:**

* `Event` -> `TimeEvent` (except static Event methods)
* Removed `atTime()` and `bisect()` from the Collection API, because these depend on an ordered list
  and should live on the TimeSeries.
* Removed the convenience static methods that wrapped `timeSeriesListReduce()`, specifically
  `timeSeriesListSum()` and `timeSeriesListAvg()`, use `timeSeriesListReduce()` now with whatever
  reducer function you want (e.g. `sum()`)
* `Event.sum()` and `Event.avg()` are removed. Use `Event.combine()` instead.

**Features and changes:**

* **TimeSeries merging**: Improves performance for merging and combining TimeSeries events up to 10
  times (Fixes [#51](https://github.com/esnet/pond/issues/51)).
* **TimeSeries merging API** TimeSeries level API has been simplified, allowing any reducer function
  (e.g. `avg()` to be used when combining multiple TimeSeries, but removing some wrapper functions
  (see breaking changes below). (Fixes [#58](https://github.com/esnet/pond/issues/58),
  [#59](https://github.com/esnet/pond/issues/59))
* **Event class hierarchy**: The event class structure was finally cleaned up internally, but this
  comes with a major breaking change: events that were of class `Event` before (i.e. had a
  timestamp) are now `TimeEvents`, while `Event` is a base class shared by `TimeEvent`,
  `TimeRangeEvent` and `IndexedEvent`. Further, `Events` can now be further sub-classed (see Avro
  change for why). Static event methods are still on `Event`.
* **Avro support**. Along with the ability to subclass an `Event` comes the ability to define a
  schema for the subclass. This allows `Event`s, `TimeSeries` and `TimeRange`s to serialize
  themselves to Avro buffers for compact and correct transfers. This feature is still experimental,
  and isn't currently supported in PyPond. [Removed in 0.8.3]
* **De-duplication** - you can now de-duplicate the events in a `Collection` with
  `Collection.dedup()`. Later events win. In a related change you can use `collection.atKey()` to
  get back a list of events at that exact time, timerange or index, or a map of key to a list of
  events at that key with `eventListAsMap()`. This partially addresses
  [#52](https://github.com/esnet/pond/issues/52).
* **Prettier** - Uses prettier for code formatting now, so lots of stylistic changes in this
  release. Hopefully this will simplify that part of code maintenance going forward.

## v0.7.1

> October 2016

Patch release to fix several bugs and improve performance:

* renaming columns now does so with mapKeys, rather than breaking the whole thing apart
* fixes merging of TimeSeries so that if the result isn't chronological then it will sort them
  before trying to make a new TimeSeries
* fixes atTime() boundary condition (#45)
* fixed align processors to handle initial events that are already aligned
* internal calls to setCollection can skip the isChronological test with a flag since they know they
  are maintaining order.

## v0.7

> September 2016

This update had three main goals:

* Better handling of imperfect data.
* Add quantile and percentile calculations
* Improve API consistency

In addition, PyPond is now available with feature parity to the pond.js.

Breaking changes to look out for: `Pipeline.aggregate()` has changed to allow better composition of
emitted events, aggregation functions are now supplied as `avg()` rather than simple `avg`. And
`UnboundedIns` are now simply `Stream`.

**General:**

* Consistent use of fieldSpec, fieldPath etc across the API.
* Aggregation functions now all need to be specified as `avg()` rather than `avg`. i.e. they are now
  a function that returns a function. This is to allow them to take parameters. e.g
  `percentile(95)`.
* * All aggregation functions now accept a strategy for dealing with missing values. Missing values
    in pond.js are `NaN`s, `null`, or `undefined`. Strategies added are:
  - `keepMissing` - pass through all values to the aggregator
  - `ignoreMissing` - pass though only non-missing values
  - `zeroMissing` - turn missing values into 0
  - `propagateMissing` - cause the aggregator to return null if there is a missing value

**Collection:**

* Adds `quantile()` and `percentile()` aggregation functions

**TimeSeries:**

* Adds quantile and percentile aggregation functions
* Fixed: better handling of UTC times when generating IndexedEvent results
* More mutation support:
  * Added `renameColumns()` to deep rename Events within a TimeSeries
  * Added `setName()` to change the name of a TimeSeries
  * Added `setMeta(key, value)` to change the meta data in a TimeSeries In each case you will get a
    new TimeSeries back.
* Added `fill()` method to fill in missing values within a TimeSeries, using 0s, padding (last good
  value) or linear interpolation. In each case you can also specify a limit to the fill
* Added `align()` method to interpolate data to specific time boundaries (e.g. every 5 minutes). The
  interpolation can be with last value or linear interpolation. Like fill, a limit can also be
  supplied.
* Added `rate()` method to return the derivative of the TimeSeries. Optionally you can ignore
  negative values.

**Pipelines:**

* Support for`fill()`, `align()` and `rate()` within a Pipeline.
* `UnboundedIn` is now `Stream`.
* Changes `aggregation` to more explicitly define the output fields. This allows you to perform
  multiple aggregations on the same input field, such as aggregating temperature over a collection
  window to average_temp and max_temp.

Before:

```
const p = Pipeline()
  ...
  .aggregate({in: avg, out: avg})
  ...
```

After:

```
const p = Pipeline()
  ...
  .aggregate({
      in: {in: keep()},
      in_avg: {in: avg()},
      in_95th: {in: percentile(95)}}
  })
  ...
```

* As shown in the above example, you can use the `percentile()` function. Note that this is a little
  different from the others in that you need to call the function with the percentile value you
  want. A second parameter controls the way the function behaves when a percentile does not land on
  a specific sample. The default is to linearly interpolate.
* Fixes a bug where Pipeline.taker() would ignore the first event.

**Internal**

* Website now built with create-react-app
* Tests use Jest now and run in the terminal (for create-react-app workflow)
* General project restructuring

---

## v0.6

This update concentrates on providing a better API for processing a TimeSeries object. It updates
the Pipeline code to be able to return the results as an alternative to evoking a callback function.
Using this API several methods on the TimeSeries have been reworked to directly return their results
as a new TimeSeries. In addition, TimeSeries now has several new methods to do roll-ups aggregations
and collections directly.

**TimeSeries**

Construction:

* a TimeSeries is now checked for chronological events and the code will throw if there is. This is
  because there are several methods on the TimeSeries that will produce incorrect results if this is
  the case and it is far from intuitive why.

With the change to the batch API we can now greatly simplify several methods on TimeSeries. These
three methods now directly return a new TimeSeries:

* `map()`
* `select()`
* `collapse()`.

New methods that use Pipelines internally to perform common roll-up processing of TimeSeries:

* `fixedWindowRollup()`
* `hourlyRollup()`
* `dailyRollup()`
* `monthlyRollup()`
* `yearlyRollup()`
* `collectByFixedWindow()` - to build a map of new Collections given a fixed window (like "5m"). The
  result is a map from the window name (e.g. "5m-12345") to a Collection. This is essentially tiling
  the TimeSeries.

Additional new methods:

* `crop()` - you could always use slice() but this is simpler. Just give it a TimeRange and you get
  back a new TimeSeries.
* `atTime()`, `atFirst()`, `atLast()` and `* events()` generator - Convenience methods so you don't
  have to go through the TimeSeries' Collection.

**Pipelines:**

Implements #22 - when processing a synchronous source we can just accumulate the result (either
EventList or CollectionMap) on the Pipeline and return that result directly. This enables methods to
be built on TimeSeries, for example, that can simply return a new TimeSeries and not dump the user
into a callback or force them to guess if they can assume the function will be called synchronously.
See #22 for a more detailed discussion about this. Note: This is pretty experimental and there's no
facility to cope with an async source at the moment. In that case there just won't be a return value
and no warning or error will be given. We don't currently use such a source, but others might.
Regardless, this API extension is not appropriate in that case.

Adds two new methods to a Pipeline() to expose this to the Pipeline user:

* `toCollectionMap()` - maps a mapping of the key of the collection to the Collection itself. The
  key comes from a combination of the groupBy() and windowBy() directives on the Pipeline. The key
  is determined like this:
  * If there isn't a window or group key, the collection will output to "all" -> collection.
  * If one type of grouping, that grouping will be used. window name or group by.
  * If both, they will be concatenated together with a "--".
* `toEventList()` - puts every event output into a list.

Windowing changes:

* `clearWindow()` - remove the window, i.e. reset to a global window
* `clearGroupBy()` - remove the groupby setting
* "daily", "monthly" and "yearly" window types are now supported
* If building with a non-fixed or non-global window, we build IndexedEvents with local time. We
  could possibly allow the user to determine this but this is probably the best default behavior.
  (note, there's no tests for this. This is rather hard to test with JS)

Other bug fixes:

* Fixes a bug where a Converter would not work correctly in batch mode because it wasn't being
  cloned correctly.

**Collection:**

Construction:

* Require the type to be passed in when constructing with an Immutable.List (Fixes #16). This is
  generally only used internally.

New methods:

* `isChronological()` - return if a Collection's events are chronological.
* `sortByTime()` - Reorder Collection events to be chronological.

**Index:**

Static functions to build an Index strings for daily, monthly and yearly rollups:

* `getDailyIndexString()`
* `getMonthlyIndexString()`
* `getYearlyIndexString()`

**IndexedEvents:**

* Fixes a bug where the UTC flag was not being correctly set on IndexedEvents.

**Collector:**

* Ability to collect based on daily, monthly or yearly buckets.

---

## v0.5

Large update causing many API changes, especially within what was previously the Processor pipeline
(now Pipeline). The core structures such as Events and TimeSeries remain largely the same, at least
from an API perspective, with mostly feature additions and bug fixes. We are still evolving the
pipeline code but feel this is a significant step forward and one which we can build on going
forward.

### v0.5.0

* Pipeline is a complete rewrite of the Processing code. It now unifies operations on sets of Events
  into a Collection class that also backs the TimeSeries itself. This enables the pipelines to
  operate on either streams of Events or on TimeSeries or Collections.
* Pipelines therefore support a limited notion of either streaming or batch processing.
* Pipelines support fixed window aggregations as well as general grouping by key or function
* Pipeline operators:
  * select() for choosing specific event fields
  * collapse() for collapsing specific event fields using a reducer
  * map() for doing element-wise transformations of events
  * filter() for conditionally removing events based on a filter function
  * take() for accepting only the first n events through the pipeline, for a given window and key
  * count() for counting up events that fall within a given window and key
  * aggregate() for building new aggregated events from collections based on the given window and
    key
  * converters for converting between event types
* Pipeline simple triggers for each event, each collection discard and on flush using emitOn()
* Pipeline output support using to() for emitting Collections and Events
* Pipeline input support using from() for Collections, TimeSeries, or UnboundedIns.
* Event access using get() allows use of fieldSpecs, which can be fieldNames or dot delimited paths
  to deeper data
* Events no longer have a key. Groupby keys ares managed by the pipeline itself now
* TimeRange: fixes lastYear() static function
* TimeSeries: fixes duplicate size() definition
* TimeSeries and Collection: first() and last() are aggregation functions now, while atFirst() and
  atLast() returns the first/last event in the series/collection
* Project
  * Updated to Babel 6
  * Added code coverage
  * Auto-build of docs for website

---

## v0.4

### v0.4.2

* Fixed creation of a `TimeSeries` from `TimeRangeEvents`.
* Fixed `timerange()` calculation of a `TimeSeries` made of `TimeRangeEvents`.

### v0.4.1

* Fixed TimeSeries import

### v0.4.0

* Support for processing chains. e.g.

```
    const processor = Processor()
        .groupBy("channelName")
        .aggregate("5m", avg)
        .collect("1d", false, timeseries => {
            // --> Output timeseries representing 1 day of 5 min averages
        });
```

* `Aggregators` and `collector` now support emitting events "always", and not just when the "next"
  bucket is created
* Processing function API has been cleaned up. To flush events, use `flush()` (`done()` and `sync()`
  are gone)
* Event internals are now an Immutable.map rather than using member variables that could be modified
* Events support keys to enable the ability to do groupBy operations. You can add a key to an
  `Event` with `setKey()`, and you'll get a new `Event` back which is the same as the old one, but
  with a key. You can query the key with, unsurprisingly, `key()`.
* `Groupers` are a new `Event` processor which takes an incoming event stream and emits the same
  event but with a key on it. This enables downstream processing, such as aggregation, to group
  based on the key.

---

## v0.3

### v0.3.0

* Better support for nested objects:
  * Converts deeper structures to Immutable objects internally
  * Added "value functions" to operations that deal with columns of values so that you can pull out
    internals of nested structures.
  * Event's get() function will convert deep Immutable structures to JS objects.
* You can now use either value() or get() to get a value out of an Event.
* Added ability to convert to time based Events when inserting IndexedEvents into a collection. This
  can be much faster to query.
* Began work on ability to do things like sum a series or isolate columns of a series.
* Website update as well as uniform linting

---

## v0.2

### v0.2.1

* Fixed an issue with merge.

### v0.2.0

* You can either merge two series with different columns together, or same columns and different
  times.

```
const trafficSeries = TimeSeries.merge("traffic", [inTraffic, outTraffic]);
```
