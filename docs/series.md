## TimeSeries

---

A `TimeSeries` represents a series of events, with each event being a combination of:

 - time (or `TimeRange`, or `Index`)
 - data - corresponding set of key/values.

### Construction

Currently you can initialize a `TimeSeries` with either a list of events, or with a data format that looks like this:

```javascript
const data = {
    name: "trafficc",
    columns: ["time", "value"],
    points: [
        [1400425947000, 52],
        [1400425948000, 18],
        [1400425949000, 26],
        [1400425950000, 93],
        ...
    ]
};
```

To create a new TimeSeries object from the above format, simply use the constructor:

```javascript
var series = new TimeSeries(data);
```

The format of the data is as follows:

 - **name** - optional, but a good practice
 - **columns** - are necessary and give labels to the data in the points.
 - **points** - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels.
   
As just hinted at, the first column may actually be:

 - "time"
 - "timeRange" represented by a `TimeRange`
 - "index" - a time range represented by an `Index`. By using an index it is possible, for example, to refer to a specific month:

```javascript
var availabilityData = {
    name: "Last 3 months availability",
    columns: ["index", "uptime"],
    points: [
        ["2015-06", "100%"], // <-- 2015-06 specified here represents June 2015
        ["2015-05", "92%"],
        ["2015-04", "87%"],
    ]
};
```

Alternatively, you can construct a `TimeSeries` with a list of events. These may be `Events`, `TimeRangeEvents` or `IndexedEvents`. Here's an example of that:

```javascript
const events = [];
events.push(new Event(new Date(2015, 7, 1), {value: 27}));
events.push(new Event(new Date(2015, 8, 1), {value: 29}));
const series = new TimeSeries({
    name: "avg temps",
    events: events
});
```

### Nested data

The values do not have to be simple types like the above examples. Here's an example where each value is itself an object with "in" and "out" keys:

```javascript
const series = new TimeSeries({
    name: "Map Traffic",
    columns: ["time", "NASA_north", "NASA_south"],
    points: [
        [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
        [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
        [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
        [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}],
    ]
});
```

Complex data is stored in an Immutable structure. To get a value out of nested data like this you will get the Event you want (by row), as usual, and then use `get()` to fetch the value by column name. The result of this call will be a JSON copy of the Immutable data so you can query deeper in the usual way:

```javascript
series.at(0).get("NASA_north")["in"]  // 200`
```

It is then possible to use a value mapper function when calculating different properties. For example, to get the average "in" value of the NASA_north column:

```javascript
series.avg("NASA_north", d => d.in);  // 250
```

**Kind**: global class  
## API Reference


* [TimeSeries](#TimeSeries)
    * _instance_
        * [.toJSON()](#TimeSeries+toJSON)
        * [.toString()](#TimeSeries+toString)
        * [.timerange()](#TimeSeries+timerange)
        * [.begin()](#TimeSeries+begin) ⇒ <code>Date</code>
        * [.end()](#TimeSeries+end) ⇒ <code>Date</code>
        * [.at(pos)](#TimeSeries+at)
        * [.setCollection(collection)](#TimeSeries+setCollection) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.bisect(t, b)](#TimeSeries+bisect) ⇒ <code>number</code>
        * [.slice(begin, end)](#TimeSeries+slice) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.clean(fieldSpec)](#TimeSeries+clean) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.events()](#TimeSeries+events)
        * [.name()](#TimeSeries+name) ⇒ <code>string</code>
        * [.index()](#TimeSeries+index) ⇒ <code>Index</code>
        * [.indexAsString()](#TimeSeries+indexAsString) ⇒ <code>string</code>
        * [.indexAsRange()](#TimeSeries+indexAsRange) ⇒ <code>TimeRange</code>
        * [.isUTC()](#TimeSeries+isUTC) ⇒ <code>TimeRange</code>
        * [.columns()](#TimeSeries+columns) ⇒ <code>array</code>
        * [.collection()](#TimeSeries+collection) ⇒ <code>Collection</code>
        * [.meta(key)](#TimeSeries+meta) ⇒ <code>object</code>
        * [.size()](#TimeSeries+size) ⇒ <code>number</code>
        * [.sizeValid()](#TimeSeries+sizeValid) ⇒ <code>number</code>
        * [.count()](#TimeSeries+count) ⇒ <code>number</code>
        * [.sum(fieldSpec)](#TimeSeries+sum) ⇒ <code>number</code>
        * [.avg(fieldSpec)](#TimeSeries+avg) ⇒ <code>number</code>
        * [.mean(fieldSpec)](#TimeSeries+mean) ⇒ <code>number</code>
        * [.median(fieldSpec)](#TimeSeries+median) ⇒ <code>number</code>
        * [.stdev(fieldSpec)](#TimeSeries+stdev) ⇒ <code>number</code>
        * [.aggregate(func, fieldSpec)](#TimeSeries+aggregate) ⇒ <code>number</code>
        * [.pipeline()](#TimeSeries+pipeline) ⇒ <code>Pipeline</code>
        * [.map(operator, cb)](#TimeSeries+map)
        * [.select(fieldSpec, cb)](#TimeSeries+select)
        * [.collapse(fieldSpec, name, reducer, append, cb)](#TimeSeries+collapse)
    * _static_
        * [.equal(series1, series2)](#TimeSeries.equal) ⇒ <code>bool</code>
        * [.is(series1, series2)](#TimeSeries.is) ⇒ <code>bool</code>
        * [.timeseriesListReduce(data, seriesList, reducer, fieldSpec)](#TimeSeries.timeseriesListReduce) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.timeSeriesListMerge(data, seriesList)](#TimeSeries.timeSeriesListMerge) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.timeSeriesListSum(data, seriesList, fieldSpec)](#TimeSeries.timeSeriesListSum) ⇒ <code>[TimeSeries](#TimeSeries)</code>

<a name="TimeSeries+toJSON"></a>

### timeSeries.toJSON()
Turn the TimeSeries into regular javascript objects

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+toString"></a>

### timeSeries.toString()
Represent the TimeSeries as a string

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+timerange"></a>

### timeSeries.timerange()
Returns the extents of the TimeSeries as a TimeRange.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+begin"></a>

### timeSeries.begin() ⇒ <code>Date</code>
Gets the earliest time represented in the TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>Date</code> - Begin time  
<a name="TimeSeries+end"></a>

### timeSeries.end() ⇒ <code>Date</code>
Gets the latest time represented in the TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>Date</code> - End time  
<a name="TimeSeries+at"></a>

### timeSeries.at(pos)
Access a specific TimeSeries event via its position

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Params**

- pos <code>number</code> - The event position

<a name="TimeSeries+setCollection"></a>

### timeSeries.setCollection(collection) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Sets a new underlying collection for this TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - A new TimeSeries  
**Params**

- collection <code>Collection</code> - The new collection

<a name="TimeSeries+bisect"></a>

### timeSeries.bisect(t, b) ⇒ <code>number</code>
Returns the index that bisects the TimeSeries at the time specified.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The row number that is the greatest, but still below t.  
**Params**

- t <code>Data</code> - The time to bisect the TimeSeries with
- b <code>number</code> - The position to begin searching at

<a name="TimeSeries+slice"></a>

### timeSeries.slice(begin, end) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Perform a slice of events within the TimeSeries, returns a new
TimeSeries representing a portion of this TimeSeries from
begin up to but not including end.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The new, sliced, TimeSeries.  
**Params**

- begin <code>Number</code> - The position to begin slicing
- end <code>Number</code> - The position to end slicing

<a name="TimeSeries+clean"></a>

### timeSeries.clean(fieldSpec) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Returns a new Collection by testing the fieldSpec
values for being valid (not NaN, null or undefined).

The resulting TimeSeries will be clean (for that fieldSpec).

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - A new, modified, TimeSeries.  
**Params**

- fieldSpec <code>string</code> - The field to test

<a name="TimeSeries+events"></a>

### timeSeries.events()
Generator to return all the events in the collection.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Example**  
```
for (let event of timeseries.events()) {
    console.log(event.toString());
}
```
<a name="TimeSeries+name"></a>

### timeSeries.name() ⇒ <code>string</code>
Fetch the timeseries name

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>string</code> - The name given to this TimeSeries  
<a name="TimeSeries+index"></a>

### timeSeries.index() ⇒ <code>Index</code>
Fetch the timeseries Index, if it has one.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>Index</code> - The Index given to this TimeSeries  
<a name="TimeSeries+indexAsString"></a>

### timeSeries.indexAsString() ⇒ <code>string</code>
Fetch the timeseries Index, as a string, if it has one.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>string</code> - The Index, as a string, given to this TimeSeries  
<a name="TimeSeries+indexAsRange"></a>

### timeSeries.indexAsRange() ⇒ <code>TimeRange</code>
Fetch the timeseries Index, as a TimeRange, if it has one.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>TimeRange</code> - The Index, as a TimeRange, given to this TimeSeries  
<a name="TimeSeries+isUTC"></a>

### timeSeries.isUTC() ⇒ <code>TimeRange</code>
Fetch the UTC flag, i.e. are the events in this TimeSeries in
UTC or local time (if they are IndexedEvents an event might be
"2014-08-31". The actual time range of that representation
depends on where you are. Pond supports thinking about that in
either as a UTC day, or a local day).

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>TimeRange</code> - The Index, as a TimeRange, given to this TimeSeries  
<a name="TimeSeries+columns"></a>

### timeSeries.columns() ⇒ <code>array</code>
Fetch the list of column names. This is determined by
traversing though the events and collecting the set.

Note: the order is not defined

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>array</code> - List of columns  
<a name="TimeSeries+collection"></a>

### timeSeries.collection() ⇒ <code>Collection</code>
Returns the internal collection of events for this TimeSeries

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>Collection</code> - The collection backing this TimeSeries  
<a name="TimeSeries+meta"></a>

### timeSeries.meta(key) ⇒ <code>object</code>
Returns the meta data about this TimeSeries as a JSON object.
Any extra data supplied to the TimeSeries constructor will be
placed in the meta data object. This returns either all of that
data as a JSON object, or a specific key if `key` is supplied.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>object</code> - The meta data  
**Params**

- key <code>string</code> - Optional specific part of the meta data

<a name="TimeSeries+size"></a>

### timeSeries.size() ⇒ <code>number</code>
Returns the number of events in this TimeSeries

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - Count of events  
<a name="TimeSeries+sizeValid"></a>

### timeSeries.sizeValid() ⇒ <code>number</code>
Returns the number of valid items in this TimeSeries.

Uses the fieldSpec to look up values in all events.
It then counts the number that are considered valid, which
specifically are not NaN, undefined or null.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - Count of valid events  
<a name="TimeSeries+count"></a>

### timeSeries.count() ⇒ <code>number</code>
Returns the number of events in this TimeSeries. Alias
for size().

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - Count of events  
<a name="TimeSeries+sum"></a>

### timeSeries.sum(fieldSpec) ⇒ <code>number</code>
Returns the sum for the fieldspec

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The sum  
**Params**

- fieldSpec <code>string</code> - The field to sum over the TimeSeries

<a name="TimeSeries+avg"></a>

### timeSeries.avg(fieldSpec) ⇒ <code>number</code>
Aggregates the events in the TimeSeries down to their average

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The average  
**Params**

- fieldSpec <code>String</code> - The field to average over in the TimeSeries

<a name="TimeSeries+mean"></a>

### timeSeries.mean(fieldSpec) ⇒ <code>number</code>
Aggregates the events in the TimeSeries down to their mean (same as avg)

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The mean  
**Params**

- fieldSpec <code>String</code> - The field to find the mean of within the collection

<a name="TimeSeries+median"></a>

### timeSeries.median(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their medium value

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The resulting median value  
**Params**

- fieldSpec <code>String</code> - The field to aggregate over

<a name="TimeSeries+stdev"></a>

### timeSeries.stdev(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their stdev

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The resulting stdev value  
**Params**

- fieldSpec <code>String</code> - The field to aggregate over

<a name="TimeSeries+aggregate"></a>

### timeSeries.aggregate(func, fieldSpec) ⇒ <code>number</code>
Aggregates the events down using a user defined function to
do the reduction.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The resulting value  
**Params**

- func <code>function</code> - User defined reduction function. Will be
                           passed a list of values. Should return a
                           singe value.
- fieldSpec <code>String</code> - The field to aggregate over

<a name="TimeSeries+pipeline"></a>

### timeSeries.pipeline() ⇒ <code>Pipeline</code>
Returns a new Pipeline with input source being initialized to
this TimeSeries collection. This allows pipeline operations
to be chained directly onto the TimeSeries to produce a new
TimeSeries or Event result.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>Pipeline</code> - The Pipeline.  
**Example**  
```
timeseries.pipeline()
    .offsetBy(1)
    .offsetBy(2)
    .to(CollectionOut, c => out = c);
```
<a name="TimeSeries+map"></a>

### timeSeries.map(operator, cb)
Takes an operator that is used to remap events from this TimeSeries to
a new set of Events. The result is returned via the callback.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Params**

- operator <code>function</code> - An operator which will be passed each event and
                                   which should return a new event.
- cb <code>function</code> - Callback containing a collapsed TimeSeries

<a name="TimeSeries+select"></a>

### timeSeries.select(fieldSpec, cb)
Takes a fieldSpec (list of column names) and outputs to the callback just those
columns in a new TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Params**

- fieldSpec <code>array</code> - The list of columns
- cb <code>function</code> - Callback containing a collapsed TimeSeries

<a name="TimeSeries+collapse"></a>

### timeSeries.collapse(fieldSpec, name, reducer, append, cb)
Takes a fieldSpec (list of column names) and collapses
them to a new column named `name` which is the reduction (using
the `reducer` function) of the matched columns in the fieldSpecList.

The column may be appended to the existing columns, or replace them,
using the `append` boolean.

The result, a new TimeSeries, will be passed to the supplied callback.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Params**

- fieldSpec <code>array</code> - The list of columns
- name <code>string</code> - The resulting summed column name
- reducer <code>function</code> - Reducer function e.g. sum
- append <code>boolean</code> - Append the summed column, rather than replace
- cb <code>function</code> - Callback containing a collapsed TimeSeries

<a name="TimeSeries.equal"></a>

### TimeSeries.equal(series1, series2) ⇒ <code>bool</code>
Static function to compare two TimeSeries to each other. If the TimeSeries
are of the same instance as each other then equals will return true.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>bool</code> - result  
**Params**

- series1 <code>[TimeSeries](#TimeSeries)</code>
- series2 <code>[TimeSeries](#TimeSeries)</code>

<a name="TimeSeries.is"></a>

### TimeSeries.is(series1, series2) ⇒ <code>bool</code>
Static function to compare two TimeSeries to each other. If the TimeSeries
are of the same value as each other then equals will return true.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>bool</code> - result  
**Params**

- series1 <code>[TimeSeries](#TimeSeries)</code>
- series2 <code>[TimeSeries](#TimeSeries)</code>

<a name="TimeSeries.timeseriesListReduce"></a>

### TimeSeries.timeseriesListReduce(data, seriesList, reducer, fieldSpec) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Reduces a list of TimeSeries objects using a reducer function. This works
by taking each event in each TimeSeries and collecting them together
based on timestamp. All events for a given time are then merged together
using the reducer function to produce a new Event. Those Events are then
collected together to form a new TimeSeries.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The new TimeSeries  
**Params**

- data <code>object</code> - Meta data for the resulting TimeSeries
- seriesList <code>array</code> - A list of TimeSeries objects
- reducer <code>func</code> - The reducer function
- fieldSpec <code>string</code> - The fields to map

<a name="TimeSeries.timeSeriesListMerge"></a>

### TimeSeries.timeSeriesListMerge(data, seriesList) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Takes a list of TimeSeries and merges them together to form a new
Timeseries.

Merging will produce a new Event only when events are conflict free, so
it is useful to combine multiple TimeSeries which have different time ranges
as well as combine TimeSeries which have different columns.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting TimeSeries  
**Params**

- data <code>object</code> - Meta data for the new TimeSeries
- seriesList <code>array</code> - A list of TimeSeries

<a name="TimeSeries.timeSeriesListSum"></a>

### TimeSeries.timeSeriesListSum(data, seriesList, fieldSpec) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Takes a list of TimeSeries and sums them together to form a new
Timeseries.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting TimeSeries  
**Params**

- data <code>object</code> - Meta data for the new TimeSeries
- seriesList <code>array</code> - A list of TimeSeries
- fieldSpec <code>object</code> | <code>array</code> | <code>string</code> - Which fields to use in the sum

**Example**  
```
const ts1 = new TimeSeries(weather1);
const ts2 = new TimeSeries(weather2);
const sum = TimeSeries.sum({name: "sum"}, [ts1, ts2], ["temp"]);
```
