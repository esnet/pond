## Processing pipelines
---

In this guide we dig into the processing capabilities of Pond.

While Pond started life as a data structure library, as it grew up we discovered that we needed the ability to perform operations on the data structures we had built. We started with simple functions such as asking a TimeSeries for its average value for a given column. Then we added functions for splitting and composing TimeSeries back together. Then we wanted to do more complicated things like filtering, fill missing values, or aggregating events over time windows.

As a parallel requirement we were interested in providing a TimeSeries orientated approach to processing data on the cloud. Our first venture into this was with AWS Kinesis, which we wanted to process events in TimeSeries specific ways and then output new events as a result.

From the need for better framework to build up our TimeSeries processing capabilities, combined with our need to process streams of events, grew a pipeline mechanism in Pond.

### Pipelines

The Pipeline was developed as an event processing chain from the beginning. Events are passed in the top and new events are emitted at the bottom. All processing operations that a chain can produce are carried out this way.

A pipeline is composed of three parts: an input, a chain of processors, and an output. Let's take those one at a time.

#### Sources

An input source can be something like a TimeSeries itself, some other bounded source, such as a file, or a stream.

If the input is a stream, then that source will inject events into the processing chain. The built in `Stream` is a basic stream where the user can `addEvent()` to it manually and those events are forwarded into the processing chain. A more sophisticated streaming source might be collecting events off a PubSub subscription and injecting events into the processing chain automatically. Here's a simple example:

```
    const stream = new Stream();

    Pipeline()
        .from(stream)
        .to(CollectionOut, c => out = c);

    stream.addEvent(evt1);
    ...
```

If the input is a bounded source, then events will be created by traversing the source from beginning to end, with each event in the source injected down the processing chain. This happens when an output is attached to the chain, not when the source is defined on the pipeline. As the output is attached a chain is constructed from the path of nodes leading back from the output to the source and events are batched though this chain until complete, with the result accumulated at the output.

Finally, if the input is a TimeSeries, this is just a special case of a bounded source.

```
    Pipeline()
        .from(timeseries)
        .select("in")
        .to(CollectionOut, c => result = new TimeSeries({name: "newTimeseries", collection: c}));
```

#### Processing chains

Pond contains a growing collection of processing nodes. These nodes are constructed using chained methods on the pipeline itself. You do not need to initialize the processing nodes themselves manually. However, it's worth understanding that behind the scenes you are constructing a chain of processing nodes.

All processing nodes take incoming events and output new events. Events may be Pond TimeEvents, TimeRangeEvents or IndexedEvents, depending on the type of processor. For instance if you calculate the `rate()` (change over time) between incoming events, the output will be a TimeRangeEvent because the rate value applies to a time range. Events can be converted within the chain using the Converter node (`pipeline.asTimeEvents()`, `pipeline.asTimeRangeEvents()` and `pipeline.asIndexedEvents()`).

Current processors:

 * **aggregate** - take a collection of events (defined by a group, or all events) and aggregate them down to a single event
 * **align** - interpolate events onto regular time boundaries (e.g. every 30 seconds)
 * **collapse** - take event fields and reduce them down to a single field using some reducer function
 * **fill** - fill in missing values in events (e.g. replace null values with linearly interpolated values from neighbor events)
 * **filter** - remove events from the stream using a filter function
 * **map** - remap an event's data to new data
 * **select** - select out certain fields in events
 * **take** - only allow a limited number of events to pass through the chain
 
In addition to defining the processing nodes via chained calls to the `pipeline` you can also set several types of state. For instance you can set a groupBy state (with `pipeline.groupBy()`) and this grouping will be held as state within the pipeline until a processing node needs to respect that. In this case an aggregation would respect that and output its result per grouping. States can be reset or changed further down the pipeline.

Types of state:

 * **groupBy** - define a way for future processors to group events together
 * **windowBy** - define a window (e.g. every 5 minutes) to group events
 * **emitOn** - define when events should be emitted from aggregations (e.g. on every event, or only when events move to the next window).

#### Output

There are two general mechanisms for collecting the output of the processing chain. The first to be implemented was a callback style interface which let you provide a function that would be called with the result. Currently you can either output events or collections:

```
    Pipeline()
        .from(stream)
        .to(EventOut, event => {/* do something with event */});
```

```
    Pipeline()
        .from(stream)
        .to(CollectionOut, collection => {/* do something with collection */});
```

In some cases this is a very natural interface for an event processing chain like this one, and handles the case of the input being async or dealing with an ongoing stream perfectly. However, in many of our use cases, it was burdensome to place the users code into a callback when the pipeline was operating on a synchronous source anyway, such as a simple TimeSeries. So we added an alternative.

It is also possible to accumulate the result back on the pipeline itself and then return the result directly from the chain. To do this, use the outputs `Pipeline.toKeyedCollections()` and `Pipeline.toEventList()`. For example:

```
    const collections = Pipeline()
        .from(timeseries)
        ...
        .toKeyedCollections();
```

Here the result is returned from the Pipeline chain, rather than the Pipeline object itself. This therefore ends the chain.

Also note: that this will not work with an async source!
