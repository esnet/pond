<a name="Pipeline"></a>

## Pipeline
A pipeline manages a processing chain, for either batch or stream processing
of collection data.

**Kind**: global class  

* [Pipeline](#Pipeline)
    * [new Pipeline([arg])](#new_Pipeline_new)
    * [.windowBy(w)](#Pipeline+windowBy) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.clearWindow()](#Pipeline+clearWindow) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.groupBy(k)](#Pipeline+groupBy) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.clearGroupBy()](#Pipeline+clearGroupBy) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.emitOn(trigger)](#Pipeline+emitOn) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.from(src)](#Pipeline+from) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.toEventList()](#Pipeline+toEventList) ⇒ <code>array</code> &#124; <code>map</code>
    * [.toKeyedCollections()](#Pipeline+toKeyedCollections) ⇒ <code>array</code> &#124; <code>map</code>
    * [.to()](#Pipeline+to) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.count(observer, force)](#Pipeline+count) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.offsetBy(by, fieldSpec)](#Pipeline+offsetBy) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.aggregate(fields)](#Pipeline+aggregate) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.asTimeEvents(options)](#Pipeline+asTimeEvents) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.map(op)](#Pipeline+map) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.filter(op)](#Pipeline+filter) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.select(fieldSpec)](#Pipeline+select) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.collapse(fieldSpecList, name, reducer, append)](#Pipeline+collapse) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.fill()](#Pipeline+fill) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.take(limit)](#Pipeline+take) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.asTimeRangeEvents(options)](#Pipeline+asTimeRangeEvents) ⇒ <code>[Pipeline](#Pipeline)</code>
    * [.asIndexedEvents(options)](#Pipeline+asIndexedEvents) ⇒ <code>[Pipeline](#Pipeline)</code>

<a name="new_Pipeline_new"></a>

### new Pipeline([arg])
Build a new Pipeline.

**Params**

- [arg] <code>[Pipeline](#Pipeline)</code> | <code>Immutable.Map</code> | <code>null</code> - May be either:
 * a Pipeline (copy contructor)
 * an Immutable.Map, in which case the internal state of the
   Pipeline will be contructed from the Map
 * not specified

Usually you would initialize a Pipeline using the factory
function, rather than this object directly with `new`.

**Example**  
```
import { Pipeline } from "pondjs";
const p = Pipeline()...`
```
<a name="Pipeline+windowBy"></a>

### pipeline.windowBy(w) ⇒ <code>[Pipeline](#Pipeline)</code>
Set the window, returning a new Pipeline. A new window will
have a type and duration associated with it. Current available
types are:
  * fixed (e.g. every 5m)
  * calendar based windows (e.g. every month)

Windows are a type of grouping. Typically you'd define a window
on the pipeline before doing an aggregation or some other operation
on the resulting grouped collection. You can combine window-based
grouping with key-grouping (see groupBy()).

There are several ways to define a window. The general format is
an options object containing a `type` field and a `duration` field.

Currently the only accepted type is `fixed`, but others are planned.
For duration, this is a duration string, for example "30s" or "1d".
Supported are: seconds (s), minutes (m), hours (h) and days (d).

If no arg is supplied, the window type is set to 'global' and there
is no duration.

There is also a short-cut notation for a fixed window or a calendar
window. Simply supplying the duration string ("30s" for example) will
result in a `fixed` window type with the supplied duration.

Calendar types are specified by simply specifying "daily", "monthly"
or "yearly".

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- w <code>string</code> | <code>object</code> - Window or duration - See above

<a name="Pipeline+clearWindow"></a>

### pipeline.clearWindow() ⇒ <code>[Pipeline](#Pipeline)</code>
Remove windowing from the Pipeline. This will
return the pipeline to no window grouping. This is
useful if you have first done some aggregated by
some window size and then wish to collect together
the all resulting events.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
<a name="Pipeline+groupBy"></a>

### pipeline.groupBy(k) ⇒ <code>[Pipeline](#Pipeline)</code>
Sets a new key grouping. Returns a new Pipeline.

Grouping is a state set on the Pipeline. Operations downstream
of the group specification will use that state. For example, an
aggregation would occur over any grouping specified. You can
combine a key grouping with windowing (see windowBy()).

Note: the key, if it is a field path, is not a list of multiple
columns, it is the path to a single column to pull group by keys
from. For example, a column called 'status' that contains the
values 'OK' and 'FAIL' - then the key would be 'status' and two
collections OK and FAIL will be generated.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- k <code>function</code> | <code>array</code> | <code>string</code> - The key to group by.
                                     You can groupBy using a function
                                     `(event) => return key`,
                                     a field path (a field name, or dot
                                     delimitted path to a field),
                                     or a array of field paths.

<a name="Pipeline+clearGroupBy"></a>

### pipeline.clearGroupBy() ⇒ <code>[Pipeline](#Pipeline)</code>
Remove the grouping from the pipeline. In other words
recombine the events.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
<a name="Pipeline+emitOn"></a>

### pipeline.emitOn(trigger) ⇒ <code>[Pipeline](#Pipeline)</code>
Sets the condition under which an accumulated collection will
be emitted. If specified before an aggregation this will control
when the resulting event will be emitted relative to the
window accumulation. Current options are:
 * to emit on every event, or
 * just when the collection is complete, or
 * when a flush signal is received, either manually calling done(),
   or at the end of a bounded source

The difference will depend on the output you want, how often
you want to get updated, and if you need to get a partial state.
There's currently no support for late data or watermarks. If an
event passes comes in after a collection window, that collection
is considered finished.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- trigger <code>string</code> - A string indicating how to trigger a
Collection should be emitted. May be:
    * "eachEvent" - when a new event comes in, all currently
                    maintained collections will emit their result
    * "discard"   - when a collection is to be discarded,
                    first it will emit. But only then.
    * "flush"     - when a flush signal is received

<a name="Pipeline+from"></a>

### pipeline.from(src) ⇒ <code>[Pipeline](#Pipeline)</code>
The source to get events from. The source needs to be able to
iterate its events using `for..of` loop for bounded Ins, or
be able to emit() for unbounded Ins. The actual batch, or stream
connection occurs when an output is defined with `to()`.

Pipelines can be chained together since a source may be another
Pipeline.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- src <code>Bounded</code> | <code>Stream</code> - The source for the Pipeline

<a name="Pipeline+toEventList"></a>

### pipeline.toEventList() ⇒ <code>array</code> &#124; <code>map</code>
Directly return the results from the processor rather than
feeding to a callback. This breaks the chain, causing a result to
be returned (the array of events) rather than a reference to the
Pipeline itself. This function is only available for sync batch
processing.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>array</code> &#124; <code>map</code> - Returns the _results attribute from a Pipeline
                        object after processing. Will contain Collection
                        objects.  
<a name="Pipeline+toKeyedCollections"></a>

### pipeline.toKeyedCollections() ⇒ <code>array</code> &#124; <code>map</code>
Directly return the results from the processor rather than
passing a callback in. This breaks the chain, causing a result to
be returned (the collections) rather than a reference to the
Pipeline itself. This function is only available for sync batch
processing.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>array</code> &#124; <code>map</code> - Returns the _results attribute from a Pipeline
                        object after processing. Will contain Collection
                        objects.  
<a name="Pipeline+to"></a>

### pipeline.to() ⇒ <code>[Pipeline](#Pipeline)</code>
Sets up the destination sink for the pipeline.

For a batch mode connection, i.e. one with a Bounded source,
the output is connected to a clone of the parts of the Pipeline dependencies
that lead to this output. This is done by a Runner. The source input is
then iterated over to process all events into the pipeline and though to the Out.

For stream mode connections, the output is connected and from then on
any events added to the input will be processed down the pipeline to
the out.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Example**  
```
const p = Pipeline()
 ...
 .to(EventOut, {}, event => {
     result[`${event.index()}`] = event;
 });
```
<a name="Pipeline+count"></a>

### pipeline.count(observer, force) ⇒ <code>[Pipeline](#Pipeline)</code>
Outputs the count of events

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- observer <code>function</code> - The callback function. This will be
                             passed the count, the windowKey and
                             the groupByKey
- force <code>Boolean</code> <code> = true</code> - Flush at the end of processing batch
                           events, output again with possibly partial
                           result.

<a name="Pipeline+offsetBy"></a>

### pipeline.offsetBy(by, fieldSpec) ⇒ <code>[Pipeline](#Pipeline)</code>
Processor to offset a set of fields by a value. Mostly used for
testing processor and pipeline operations with a simple operation.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The modified Pipeline  
**Params**

- by <code>number</code> - The amount to offset by
- fieldSpec <code>string</code> | <code>array</code> - The field(s)

<a name="Pipeline+aggregate"></a>

### pipeline.aggregate(fields) ⇒ <code>[Pipeline](#Pipeline)</code>
Uses the current Pipeline windowing and grouping
state to build collections of events and aggregate them.

`IndexedEvent`s will be emitted out of the aggregator based
on the `emitOn` state of the Pipeline.

To specify what part of the incoming events should
be aggregated together you specify a `fields`
object. This is a map from fieldName to operator.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- fields <code>object</code> - Fields and operators to be aggregated

**Example**  
```
import { Pipeline, EventOut, functions } from "pondjs";
const { avg } = functions;

const p = Pipeline()
  .from(input)
  .windowBy("1h")           // 1 day fixed windows
  .emitOn("eachEvent")      // emit result on each event
  .aggregate({
     in_avg: {in: avg},
     out_avg: {in: avg}
  })
  .asTimeEvents()
  .to(EventOut, {}, event => {
     result[`${event.index()}`] = event; // Result
  });
```
<a name="Pipeline+asTimeEvents"></a>

### pipeline.asTimeEvents(options) ⇒ <code>[Pipeline](#Pipeline)</code>
Converts incoming TimeRangeEvents or IndexedEvents to
TimeEvents. This is helpful since some processors,
especially aggregators, will emit TimeRangeEvents or
IndexedEvents, which may be unsuitable for some applications.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- options <code>object</code> - To convert to an TimeEvent you need
to convert a time range to a single time. There are three options:
 1. use the beginning time (options = {alignment: "lag"})
 2. use the center time (options = {alignment: "center"})
 3. use the end time (options = {alignment: "lead"})

<a name="Pipeline+map"></a>

### pipeline.map(op) ⇒ <code>[Pipeline](#Pipeline)</code>
Map the event stream using an operator

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- op <code>function</code> - A function that returns a new Event

<a name="Pipeline+filter"></a>

### pipeline.filter(op) ⇒ <code>[Pipeline](#Pipeline)</code>
Filter the event stream using an operator

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- op <code>function</code> - A function that returns true or false

<a name="Pipeline+select"></a>

### pipeline.select(fieldSpec) ⇒ <code>[Pipeline](#Pipeline)</code>
Select a subset of columns

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- fieldSpec <code>string</code> | <code>array</code> - Column or columns to look up. If you need
                                 to retrieve multiple deep nested values that
                                 ['can.be', 'done.with', 'this.notation'].
                                 A single deep value with a string.like.this.
                                 If not supplied, the 'value' column will be used.

<a name="Pipeline+collapse"></a>

### pipeline.collapse(fieldSpecList, name, reducer, append) ⇒ <code>[Pipeline](#Pipeline)</code>
Collapse a subset of columns using a reducer function

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- fieldSpecList <code>string</code> | <code>array</code> - Column or columns to collapse. If you need
                                     to retrieve multiple deep nested values that
                                     ['can.be', 'done.with', 'this.notation'].
- name <code>string</code> - The resulting output column's name
- reducer <code>function</code> - Function to use to do the reduction
- append <code>boolean</code> - Add the new column to the existing ones,
                                 or replace them.

**Example**  
```
 const timeseries = new TimeSeries(inOutData);
 Pipeline()
     .from(timeseries)
     .collapse(["in", "out"], "in_out_sum", sum)
     .emitOn("flush")
     .to(CollectionOut, c => {
          const ts = new TimeSeries({name: "subset", collection: c});
          ...
     }, true);
```
<a name="Pipeline+fill"></a>

### pipeline.fill() ⇒ <code>[Pipeline](#Pipeline)</code>
Take the data in this event steam and "fill" any missing
or invalid values. This could be setting `null` values to `0`
so mathematical operations will succeed, interpolate a new
value, or pad with the previously given value.

If one wishes to limit the number of filled events in the result
set, use Pipeline.keep() in the chain. See: TimeSeries.fill()
for an example.

Fill takes a single arg `options` which should be composed of:
 * fieldSpec - Column or columns to look up. If you need
               to retrieve multiple deep nested values that
               ['can.be', 'done.with', 'this.notation'].
               A single deep value with a string.like.this.
 * method -    Filling method: zero | linear | pad

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
<a name="Pipeline+take"></a>

### pipeline.take(limit) ⇒ <code>[Pipeline](#Pipeline)</code>
Take events up to the supplied limit, per key.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- limit <code>number</code> - Integer number of events to take

<a name="Pipeline+asTimeRangeEvents"></a>

### pipeline.asTimeRangeEvents(options) ⇒ <code>[Pipeline](#Pipeline)</code>
Converts incoming Events or IndexedEvents to TimeRangeEvents.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- options <code>object</code> - To convert from an Event you need
to convert a single time to a time range. To control this you
need to specify the duration of that time range, along with
the positioning (alignment) of the time range with respect to
the time stamp of the Event.

There are three option for alignment:
 1. time range will be in front of the timestamp (options = {alignment: "front"})
 2. time range will be centered on the timestamp (options = {alignment: "center"})
 3. time range will be positoned behind the timestamp (options = {alignment: "behind"})

The duration is of the form "1h" for one hour, "30s" for 30 seconds and so on.

<a name="Pipeline+asIndexedEvents"></a>

### pipeline.asIndexedEvents(options) ⇒ <code>[Pipeline](#Pipeline)</code>
Converts incoming Events to IndexedEvents.

Note: It isn't possible to convert TimeRangeEvents to IndexedEvents.

**Kind**: instance method of <code>[Pipeline](#Pipeline)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline  
**Params**

- options <code>Object</code> - An object containing the conversion
options. In this case the duration string of the Index is expected.
    - .duration <code>string</code> - The duration string is of the form "1h" for one hour, "30s"
for 30 seconds and so on.

