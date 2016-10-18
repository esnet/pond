<a name="TimeSeries"></a>

## TimeSeries
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

* [TimeSeries](#TimeSeries)
    * _instance_
        * [.toJSON()](#TimeSeries+toJSON)
        * [.toString()](#TimeSeries+toString)
        * [.timerange()](#TimeSeries+timerange)
        * [.begin()](#TimeSeries+begin) ⇒ <code>Date</code>
        * [.end()](#TimeSeries+end) ⇒ <code>Date</code>
        * [.at(pos)](#TimeSeries+at)
        * [.atTime(time)](#TimeSeries+atTime) ⇒ <code>[Event](#Event)</code> &#124; <code>[TimeRangeEvent](#TimeRangeEvent)</code> &#124; <code>[IndexedEvent](#IndexedEvent)</code>
        * [.atFirst()](#TimeSeries+atFirst) ⇒ <code>[Event](#Event)</code> &#124; <code>[TimeRangeEvent](#TimeRangeEvent)</code> &#124; <code>[IndexedEvent](#IndexedEvent)</code>
        * [.atLast()](#TimeSeries+atLast) ⇒ <code>[Event](#Event)</code> &#124; <code>[TimeRangeEvent](#TimeRangeEvent)</code> &#124; <code>[IndexedEvent](#IndexedEvent)</code>
        * [.events()](#TimeSeries+events)
        * [.setCollection(collection, isChronological)](#TimeSeries+setCollection) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.bisect(t, b)](#TimeSeries+bisect) ⇒ <code>number</code>
        * [.slice(begin, end)](#TimeSeries+slice) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.crop(timerange)](#TimeSeries+crop) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.clean(fieldPath)](#TimeSeries+clean) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.events()](#TimeSeries+events)
        * [.name()](#TimeSeries+name) ⇒ <code>string</code>
        * [.setName()](#TimeSeries+setName)
        * [.index()](#TimeSeries+index) ⇒ <code>[Index](#Index)</code>
        * [.indexAsString()](#TimeSeries+indexAsString) ⇒ <code>string</code>
        * [.indexAsRange()](#TimeSeries+indexAsRange) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.isUTC()](#TimeSeries+isUTC) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.columns()](#TimeSeries+columns) ⇒ <code>array</code>
        * [.collection()](#TimeSeries+collection) ⇒ <code>[Collection](#Collection)</code>
        * [.meta(key)](#TimeSeries+meta) ⇒ <code>object</code>
        * [.setMeta()](#TimeSeries+setMeta)
        * [.size()](#TimeSeries+size) ⇒ <code>number</code>
        * [.sizeValid()](#TimeSeries+sizeValid) ⇒ <code>number</code>
        * [.count()](#TimeSeries+count) ⇒ <code>number</code>
        * [.sum(fieldPath, filter)](#TimeSeries+sum) ⇒ <code>number</code>
        * [.max(fieldPath)](#TimeSeries+max) ⇒ <code>number</code>
        * [.min(fieldPath, filter)](#TimeSeries+min) ⇒ <code>number</code>
        * [.avg(fieldPath, filter)](#TimeSeries+avg) ⇒ <code>number</code>
        * [.mean(fieldPath, filter)](#TimeSeries+mean) ⇒ <code>number</code>
        * [.median(fieldPath, filter)](#TimeSeries+median) ⇒ <code>number</code>
        * [.stdev(fieldPath, filter)](#TimeSeries+stdev) ⇒ <code>number</code>
        * [.percentile(q, fieldPath, interp, filter)](#TimeSeries+percentile) ⇒ <code>number</code>
        * [.aggregate(func, fieldPath)](#TimeSeries+aggregate) ⇒ <code>number</code>
        * [.quantile(n, fieldPath, interp)](#TimeSeries+quantile) ⇒ <code>array</code>
        * [.pipeline()](#TimeSeries+pipeline) ⇒ <code>[Pipeline](#Pipeline)</code>
        * [.map(operator)](#TimeSeries+map) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.select(options)](#TimeSeries+select) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.collapse(options)](#TimeSeries+collapse) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.renameColumns(options)](#TimeSeries+renameColumns) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.fill(options)](#TimeSeries+fill) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.align(options)](#TimeSeries+align) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.rate(options)](#TimeSeries+rate) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.fixedWindowRollup(options)](#TimeSeries+fixedWindowRollup) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.hourlyRollup(options)](#TimeSeries+hourlyRollup) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.dailyRollup(options)](#TimeSeries+dailyRollup) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.monthlyRollup(options)](#TimeSeries+monthlyRollup) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.yearlyRollup(options)](#TimeSeries+yearlyRollup) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.collectByFixedWindow(options)](#TimeSeries+collectByFixedWindow) ⇒ <code>map</code>
    * _static_
        * [.equal(series1, series2)](#TimeSeries.equal) ⇒ <code>bool</code>
        * [.is(series1, series2)](#TimeSeries.is) ⇒ <code>bool</code>
        * [.timeseriesListReduce(options)](#TimeSeries.timeseriesListReduce) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.timeSeriesListMerge(options)](#TimeSeries.timeSeriesListMerge) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.timeSeriesListSum(options)](#TimeSeries.timeSeriesListSum) ⇒ <code>[TimeSeries](#TimeSeries)</code>

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

<a name="TimeSeries+atTime"></a>

### timeSeries.atTime(time) ⇒ <code>[Event](#Event)</code> &#124; <code>[TimeRangeEvent](#TimeRangeEvent)</code> &#124; <code>[IndexedEvent](#IndexedEvent)</code>
Returns an event in the series by its time. This is the same
as calling `bisect` first and then using `at` with the index.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Params**

- time <code>Date</code> - The time of the event.

<a name="TimeSeries+atFirst"></a>

### timeSeries.atFirst() ⇒ <code>[Event](#Event)</code> &#124; <code>[TimeRangeEvent](#TimeRangeEvent)</code> &#124; <code>[IndexedEvent](#IndexedEvent)</code>
Returns the first event in the series.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+atLast"></a>

### timeSeries.atLast() ⇒ <code>[Event](#Event)</code> &#124; <code>[TimeRangeEvent](#TimeRangeEvent)</code> &#124; <code>[IndexedEvent](#IndexedEvent)</code>
Returns the last event in the series.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+events"></a>

### timeSeries.events()
Generator to return all the events in the series

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Example**  
```
for (let event of series.events()) {
    console.log(event.toString());
}
```
<a name="TimeSeries+setCollection"></a>

### timeSeries.setCollection(collection, isChronological) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Sets a new underlying collection for this TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - A new TimeSeries  
**Params**

- collection <code>[Collection](#Collection)</code> - The new collection
- isChronological <code>boolean</code> <code> = false</code> - Causes the chronological
                                      order of the events to
                                      not be checked

<a name="TimeSeries+bisect"></a>

### timeSeries.bisect(t, b) ⇒ <code>number</code>
Returns the index that bisects the TimeSeries at the time specified.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The row number that is the greatest, but still below t.  
**Params**

- t <code>Date</code> - The time to bisect the TimeSeries with
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

<a name="TimeSeries+crop"></a>

### timeSeries.crop(timerange) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Crop the TimeSeries to the specified TimeRange and
return a new TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The new, cropped, TimeSeries.  
**Params**

- timerange <code>[TimeRange](#TimeRange)</code> - The bounds of the new TimeSeries

<a name="TimeSeries+clean"></a>

### timeSeries.clean(fieldPath) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Returns a new TimeSeries by testing the fieldPath
values for being valid (not NaN, null or undefined).

The resulting TimeSeries will be clean (for that fieldPath).

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - A new, modified, TimeSeries.  
**Params**

- fieldPath <code>string</code> - Name of value to look up. If not supplied,
                                 defaults to ['value']. "Deep" syntax is
                                 ['deep', 'value'] or 'deep.value'

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
<a name="TimeSeries+setName"></a>

### timeSeries.setName()
Rename the timeseries

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+index"></a>

### timeSeries.index() ⇒ <code>[Index](#Index)</code>
Fetch the timeseries Index, if it has one.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[Index](#Index)</code> - The Index given to this TimeSeries  
<a name="TimeSeries+indexAsString"></a>

### timeSeries.indexAsString() ⇒ <code>string</code>
Fetch the timeseries Index, as a string, if it has one.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>string</code> - The Index, as a string, given to this TimeSeries  
<a name="TimeSeries+indexAsRange"></a>

### timeSeries.indexAsRange() ⇒ <code>[TimeRange](#TimeRange)</code>
Fetch the timeseries Index, as a TimeRange, if it has one.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The Index, as a TimeRange, given to this TimeSeries  
<a name="TimeSeries+isUTC"></a>

### timeSeries.isUTC() ⇒ <code>[TimeRange](#TimeRange)</code>
Fetch the UTC flag, i.e. are the events in this TimeSeries in
UTC or local time (if they are IndexedEvents an event might be
"2014-08-31". The actual time range of that representation
depends on where you are. Pond supports thinking about that in
either as a UTC day, or a local day).

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The Index, as a TimeRange, given to this TimeSeries  
<a name="TimeSeries+columns"></a>

### timeSeries.columns() ⇒ <code>array</code>
Fetch the list of column names. This is determined by
traversing though the events and collecting the set.

Note: the order is not defined

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>array</code> - List of columns  
<a name="TimeSeries+collection"></a>

### timeSeries.collection() ⇒ <code>[Collection](#Collection)</code>
Returns the internal collection of events for this TimeSeries

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[Collection](#Collection)</code> - The collection backing this TimeSeries  
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

<a name="TimeSeries+setMeta"></a>

### timeSeries.setMeta()
Rename the timeseries

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
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

### timeSeries.sum(fieldPath, filter) ⇒ <code>number</code>
Returns the sum for the fieldspec

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The sum  
**Params**

- fieldPath <code>string</code> - Column to find the stdev of. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.
- filter <code>function</code> - Optional filter function used to clean data before aggregating

<a name="TimeSeries+max"></a>

### timeSeries.max(fieldPath) ⇒ <code>number</code>
Aggregates the events down to their maximum value

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The max value for the field  
**Params**

- fieldPath <code>string</code> - Column to find the max of. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.

<a name="TimeSeries+min"></a>

### timeSeries.min(fieldPath, filter) ⇒ <code>number</code>
Aggregates the events down to their minimum value

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The min value for the field  
**Params**

- fieldPath <code>string</code> - Column to find the min of. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.
- filter <code>function</code> - Optional filter function used to clean data before aggregating

<a name="TimeSeries+avg"></a>

### timeSeries.avg(fieldPath, filter) ⇒ <code>number</code>
Aggregates the events in the TimeSeries down to their average

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The average  
**Params**

- fieldPath <code>string</code> - Column to find the avg of. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.
- filter <code>function</code> - Optional filter function used to clean data before aggregating

<a name="TimeSeries+mean"></a>

### timeSeries.mean(fieldPath, filter) ⇒ <code>number</code>
Aggregates the events in the TimeSeries down to their mean (same as avg)

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The mean  
**Params**

- fieldPath <code>string</code> - Column to find the mean of. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.
- filter <code>function</code> - Optional filter function used to clean data before aggregating

<a name="TimeSeries+median"></a>

### timeSeries.median(fieldPath, filter) ⇒ <code>number</code>
Aggregates the events down to their medium value

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The resulting median value  
**Params**

- fieldPath <code>string</code> - Column to find the median of. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.
- filter <code>function</code> - Optional filter function used to clean data before aggregating

<a name="TimeSeries+stdev"></a>

### timeSeries.stdev(fieldPath, filter) ⇒ <code>number</code>
Aggregates the events down to their stdev

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The resulting stdev value  
**Params**

- fieldPath <code>string</code> - Column to find the stdev of. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.
- filter <code>function</code> - Optional filter function used to clean data before aggregating

<a name="TimeSeries+percentile"></a>

### timeSeries.percentile(q, fieldPath, interp, filter) ⇒ <code>number</code>
Gets percentile q within the TimeSeries. This works the same way as numpy.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The percentile  
**Params**

- q <code>integer</code> - The percentile (should be between 0 and 100)
- fieldPath <code>string</code> - Column to find the qth percentile of. A deep value can
                            be referenced with a string.like.this.  If not supplied
                            the `value` column will be aggregated.
- interp <code>string</code> <code> = &quot;linear&quot;</code> - Specifies the interpolation method
                            to use when the desired quantile lies between
                            two data points. Options are: "linear", "lower", "higher",
                            "nearest", "midpoint"
- filter <code>function</code> - Optional filter function used to clean data before aggregating

<a name="TimeSeries+aggregate"></a>

### timeSeries.aggregate(func, fieldPath) ⇒ <code>number</code>
Aggregates the events down using a user defined function to
do the reduction.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - The resulting value  
**Params**

- func <code>function</code> - User defined reduction function. Will be
                           passed a list of values. Should return a
                           singe value.
- fieldPath <code>string</code> - Column to aggregate over. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.

<a name="TimeSeries+quantile"></a>

### timeSeries.quantile(n, fieldPath, interp) ⇒ <code>array</code>
Gets n quantiles within the TimeSeries. This works the same way as numpy's percentile().
For example `timeseries.quantile(4)` would be the same as using percentile with q = 0.25, 0.5 and 0.75.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>array</code> - An array of n quantiles  
**Params**

- n <code>integer</code> - The number of quantiles to divide the
                           TimeSeries into.
- fieldPath <code>string</code> - Column to calculate over. A deep value can
                           be referenced with a string.like.this.  If not supplied
                           the `value` column will be aggregated.
- interp <code>string</code> - Specifies the interpolation method
                           to use when the desired quantile lies between
                           two data points. Options are: "linear", "lower", "higher",
                           "nearest", "midpoint".

<a name="TimeSeries+pipeline"></a>

### timeSeries.pipeline() ⇒ <code>[Pipeline](#Pipeline)</code>
Returns a new Pipeline with input source being initialized to
this TimeSeries collection. This allows pipeline operations
to be chained directly onto the TimeSeries to produce a new
TimeSeries or Event result.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[Pipeline](#Pipeline)</code> - The Pipeline.  
**Example**  
```
timeseries.pipeline()
    .offsetBy(1)
    .offsetBy(2)
    .to(CollectionOut, c => out = c);
```
<a name="TimeSeries+map"></a>

### timeSeries.map(operator) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Takes an operator that is used to remap events from this TimeSeries to
a new set of Events.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - A TimeSeries containing the remapped events  
**Params**

- operator <code>function</code> - An operator which will be passed each
                                   event and which should return a new event.

<a name="TimeSeries+select"></a>

### timeSeries.select(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Takes a fieldSpec (list of column names) and outputs to the callback just those
columns in a new TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting TimeSeries with renamed columns  
**Params**

- options - An object containing options for the command
    - .fieldSpec <code>string</code> | <code>array</code> - Column or columns to select into the new TimeSeries.
                                        If you need to retrieve multiple deep nested values
                                        that ['can.be', 'done.with', 'this.notation'].
                                        A single deep value with a string.like.this.

**Example**  
```
    const ts = timeseries.select({fieldSpec: ["uptime", "notes"]});
```
<a name="TimeSeries+collapse"></a>

### timeSeries.collapse(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Takes a `fieldSpecList` (list of column names) and collapses
them to a new column named `name` which is the reduction (using
the `reducer` function) of the matched columns in the `fieldSpecList`.

The column may be appended to the existing columns, or replace them,
based on the `append` boolean.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting collapsed TimeSeries  
**Params**

- options - An object containing options:
    - .fieldSpecList <code>array</code> - The list of columns to collapse. (required)
    - .name <code>string</code> - The resulting collapsed column name (required)
    - .reducer <code>function</code> - The reducer function (required)
    - .append <code>bool</code> - Append the collapsed column, rather
                                             than replace

**Example**  
```
    const sums = ts.collapse({
         name: "sum_series",
         fieldSpecList: ["in", "out"],
         reducer: sum(),
         append: false
    });
```
<a name="TimeSeries+renameColumns"></a>

### timeSeries.renameColumns(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Rename columns in the underlying events.

Takes a object of columns to rename. Returns a new `TimeSeries` containing
new events. Columns not in the dict will be retained and not renamed.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting TimeSeries with renamed columns  
**Note**: As the name implies, this will only rename the main
"top level" (ie: non-deep) columns. If you need more
extravagant renaming, roll your own using `TimeSeries.map()`.  
**Params**

- options - An object containing options:
    - .renameMap <code>Object</code> - Columns to rename.

**Example**  
```
new_ts = ts.renameColumns({
    renameMap: {in: "new_in", out: "new_out"}
});
```
<a name="TimeSeries+fill"></a>

### timeSeries.fill(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Take the data in this TimeSeries and "fill" any missing or invalid
values. This could be setting `null` values to zero so mathematical
operations will succeed, interpolate a new value, or pad with the
previously given value.

The `fill()` method takes a single `options` arg.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting filled TimeSeries  
**Params**

- options - An object containing options:
    - .fieldSpec <code>string</code> | <code>array</code> - Column or columns to fill. If you need to
                                             retrieve multiple deep nested values
                                             that ['can.be', 'done.with', 'this.notation'].
                                             A single deep value with a string.like.this.
    - .method <code>string</code> - "linear" or "pad" or "zero" style interpolation
    - .limit <code>number</code> - The maximum number of points which should be
                                             interpolated onto missing points. You might set this to
                                             2 if you are willing to fill 2 new points,
                                             and then beyond that leave data with missing values.

**Example**  
```
const filled = timeseries.fill({
    fieldSpec: ["direction.in", "direction.out"],
    method: "zero",
    limit: 3
});
```
<a name="TimeSeries+align"></a>

### timeSeries.align(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Align event values to regular time boundaries. The value at
the boundary is interpolated. Only the new interpolated
points are returned. If limit is reached nulls will be
returned at each boundary position.

One use case for this is to modify irregular data (i.e. data
that falls at slightly irregular times) so that it falls into a
sequence of evenly spaced values. We use this to take data we
get from the network which is approximately every 30 second
(:32, 1:02, 1:34, ...) and output data on exact 30 second
boundaries (:30, 1:00, 1:30, ...).

Another use case is data that might be already aligned to
some regular interval, but that contains missing points.
While `fill()` can be used to replace `null` values, `align()`
can be used to add in missing points completely. Those points
can have an interpolated value, or by setting limit to 0,
can be filled with nulls. This is really useful when downstream
processing depends on complete sequences.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting aligned TimeSeries  
**Params**

- options - An object containing options:
    - .fieldSpec <code>string</code> | <code>array</code> - Column or columns to align. If you need to
                                             retrieve multiple deep nested values
                                             that ['can.be', 'done.with', 'this.notation'].
                                             A single deep value with a string.like.this.
    - .period <code>string</code> - Spacing of aligned values. e.g. "6h" or "5m"
    - .method <code>string</code> - "linear" or "pad" style interpolation to boundaries.
    - .limit <code>number</code> - The maximum number of points which should be
                                             interpolated onto boundaries. You might set this to
                                             2 if you are willing to interpolate 2 new points,
                                             and then beyond that just emit nulls on the boundaries.

**Example**  
```
const aligned = ts.align({
    fieldSpec: "value",
    period: "1m",
    method: "linear"
});
```
<a name="TimeSeries+rate"></a>

### timeSeries.rate(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Returns the derivative of the TimeSeries for the given columns. The result will
be per second. Optionally you can substitute in `null` values if the rate
is negative. This is useful when a negative rate would be considered invalid.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting TimeSeries containing calculated rates.  
**Params**

- options - An object containing options:
    - .fieldSpec <code>string</code> | <code>array</code> - Column or columns to get the rate of. If you
                                             need to retrieve multiple deep nested values
                                             that ['can.be', 'done.with', 'this.notation'].
    - .allowNegative <code>bool</code> - Will output null values for negative rates.
                                             This is useful if you are getting the rate
                                             of a counter that always goes up, except
                                             when perhaps it rolls around or resets.

<a name="TimeSeries+fixedWindowRollup"></a>

### timeSeries.fixedWindowRollup(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Builds a new TimeSeries by dividing events within the TimeSeries
across multiple fixed windows of size `windowSize`.

Note that these are windows defined relative to Jan 1st, 1970,
and are UTC, so this is best suited to smaller window sizes
(hourly, 5m, 30s, 1s etc), or in situations where you don't care
about the specific window, just that the data is smaller.

Each window then has an aggregation specification applied as
`aggregation`. This specification describes a mapping of output
fieldNames to aggregation functions and their fieldPath. For example:
```
{in_avg: {in: avg()}, out_avg: {out: avg()}}
```
will aggregate both "in" and "out" using the average aggregation
function and return the result as in_avg and out_avg.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting rolled up TimeSeries  
**Params**

- options - An object containing options:
    - .windowSize <code>string</code> - The size of the window. e.g. "6h" or "5m"
    - .aggregation <code>object</code> - The aggregation specification (see description above)
    - .toEvents <code>bool</code> - Output as Events, rather than IndexedEvents

**Example**  
```
    const timeseries = new TimeSeries(data);
    const dailyAvg = timeseries.fixedWindowRollup({
        windowSize: "1d",
        aggregation: {value: {value: avg()}}
    });
```
<a name="TimeSeries+hourlyRollup"></a>

### timeSeries.hourlyRollup(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Builds a new TimeSeries by dividing events into hours.

Each window then has an aggregation specification `aggregation`
applied. This specification describes a mapping of output
fieldNames to aggregation functions and their fieldPath. For example:
```
{in_avg: {in: avg()}, out_avg: {out: avg()}}
```

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting rolled up TimeSeries  
**Params**

- options - An object containing options:
    - .toEvents <code>bool</code> - Convert the rollup events to `Events`, otherwise it
                                             will be returned as a TimeSeries of `IndexedEvent`s.
    - .aggregation <code>object</code> - The aggregation specification (see description above)

<a name="TimeSeries+dailyRollup"></a>

### timeSeries.dailyRollup(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Builds a new TimeSeries by dividing events into days.

Each window then has an aggregation specification `aggregation`
applied. This specification describes a mapping of output
fieldNames to aggregation functions and their fieldPath. For example:
```
{in_avg: {in: avg()}, out_avg: {out: avg()}}
```

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting rolled up TimeSeries  
**Params**

- options - An object containing options:
    - .toEvents <code>bool</code> - Convert the rollup events to `Events`, otherwise it
                                             will be returned as a TimeSeries of `IndexedEvent`s.
    - .aggregation <code>object</code> - The aggregation specification (see description above)

<a name="TimeSeries+monthlyRollup"></a>

### timeSeries.monthlyRollup(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Builds a new TimeSeries by dividing events into months.

Each window then has an aggregation specification `aggregation`
applied. This specification describes a mapping of output
fieldNames to aggregation functions and their fieldPath. For example:
```
{in_avg: {in: avg()}, out_avg: {out: avg()}}
```

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting rolled up TimeSeries  
**Params**

- options - An object containing options:
    - .toEvents <code>bool</code> - Convert the rollup events to `Events`, otherwise it
                                             will be returned as a TimeSeries of `IndexedEvent`s.
    - .aggregation <code>object</code> - The aggregation specification (see description above)

<a name="TimeSeries+yearlyRollup"></a>

### timeSeries.yearlyRollup(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Builds a new TimeSeries by dividing events into years.

Each window then has an aggregation specification `aggregation`
applied. This specification describes a mapping of output
fieldNames to aggregation functions and their fieldPath. For example:

```
{in_avg: {in: avg()}, out_avg: {out: avg()}}
```

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The resulting rolled up TimeSeries  
**Params**

- options - An object containing options:
    - .toEvents <code>bool</code> - Convert the rollup events to `Events`, otherwise it
                                             will be returned as a TimeSeries of `IndexedEvent`s.
    - .aggregation <code>object</code> - The aggregation specification (see description above)

<a name="TimeSeries+collectByFixedWindow"></a>

### timeSeries.collectByFixedWindow(options) ⇒ <code>map</code>
Builds multiple `Collection`s, each collects together
events within a window of size `windowSize`. Note that these
are windows defined relative to Jan 1st, 1970, and are UTC.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>map</code> - The result is a mapping from window index to a Collection.  
**Params**

- options - An object containing options:
    - .windowSize <code>bool</code> - The size of the window. e.g. "6h" or "5m"

**Example**  
```
const timeseries = new TimeSeries(data);
const collections = timeseries.collectByFixedWindow({windowSize: "1d"});
console.log(collections); // {1d-16314: Collection, 1d-16315: Collection, ...}
```
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

### TimeSeries.timeseriesListReduce(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Reduces a list of TimeSeries objects using a reducer function. This works
by taking each event in each TimeSeries and collecting them together
based on timestamp. All events for a given time are then merged together
using the reducer function to produce a new Event. Those Events are then
collected together to form a new TimeSeries.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The reduced TimeSeries  
**Params**

- options - An object containing options. Additional key
                                               values in the options will be added as meta data
                                               to the resulting TimeSeries.
    - .seriesList <code>array</code> - A list of `TimeSeries` (required)
    - .reducer <code>function</code> - The reducer function (required)
    - .fieldSpec <code>array</code> | <code>string</code> - Column or columns to sum. If you
                                               need to retrieve multiple deep
                                               nested values that ['can.be', 'done.with',
                                               'this.notation']. A single deep value with a
                                               string.like.this.

<a name="TimeSeries.timeSeriesListMerge"></a>

### TimeSeries.timeSeriesListMerge(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Takes a list of TimeSeries and merges them together to form a new
Timeseries.

Merging will produce a new Event only when events are conflict free, so
it is useful to combine multiple TimeSeries which have different time ranges
as well as combine TimeSeries which have different columns.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The merged TimeSeries  
**Params**

- options - An object containing options. Additional key
                                               values in the options will be added as meta data
                                               to the resulting TimeSeries.
    - .seriesList <code>array</code> - A list of `TimeSeries` (required)
    - .fieldSpec <code>array</code> | <code>string</code> - Column or columns to merge. If you
                                               need to retrieve multiple deep
                                               nested values that ['can.be', 'done.with',
                                               'this.notation']. A single deep value with a
                                               string.like.this.

**Example**  
```
const inTraffic = new TimeSeries(trafficDataIn);
const outTraffic = new TimeSeries(trafficDataOut);
const trafficSeries = TimeSeries.timeSeriesListMerge({
    name: "traffic",
    seriesList: [inTraffic, outTraffic]
});
```
<a name="TimeSeries.timeSeriesListSum"></a>

### TimeSeries.timeSeriesListSum(options) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Takes a list of TimeSeries and sums them together to form a new
Timeseries.

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - The summed TimeSeries  
**Params**

- options - An object containing options. Additional key
                                               values in the options will be added as meta data
                                               to the resulting TimeSeries.
    - .seriesList <code>array</code> - A list of `TimeSeries` (required)
    - .fieldSpec <code>array</code> | <code>string</code> - Column or columns to sum. If you
                                               need to retrieve multiple deep
                                               nested values that ['can.be', 'done.with',
                                               'this.notation']. A single deep value with a
                                               string.like.this.

**Example**  
```
const ts1 = new TimeSeries(weather1);
const ts2 = new TimeSeries(weather2);
const sum = TimeSeries.timeSeriesListSum({
    name: "sum",
    seriesList: [ts1, ts2],
    fieldSpec: "temperature"
});
```
