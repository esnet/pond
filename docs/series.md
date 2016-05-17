## TimeSeries

---

A `TimeSeries` represents a series of events, with each event being a combination of:
time (or `TimeRange`, or `Index`)
data - corresponding set of key/values.

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
**name** - optional, but a good practice
**columns** - are necessary and give labels to the data in the points.
**points** - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels.
   
  As just hinted at, the first column may actually be:
"time"
"timeRange" represented by a `TimeRange`
"index" - a time range represented by an `Index`. By using an index it is possible, for example, to refer to a specific month:

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
        * [.at()](#TimeSeries+at)
        * [.setCollection(collection)](#TimeSeries+setCollection) ⇒ <code>[TimeSeries](#TimeSeries)</code>
        * [.bisect()](#TimeSeries+bisect)
        * [.slice()](#TimeSeries+slice)
        * [.clean()](#TimeSeries+clean)
        * [.events()](#TimeSeries+events)
        * [.index()](#TimeSeries+index)
        * [.collection()](#TimeSeries+collection)
        * [.meta()](#TimeSeries+meta)
        * [.size()](#TimeSeries+size)
        * [.sizeValid()](#TimeSeries+sizeValid)
        * [.count()](#TimeSeries+count) ⇒ <code>number</code>
        * [.pipeline()](#TimeSeries+pipeline) ⇒ <code>Pipeline</code>
        * [.select(fieldSpec, cb)](#TimeSeries+select)
        * [.collapse(fieldSpec, name, reducer, append, cb)](#TimeSeries+collapse)
    * _static_
        * [.equal()](#TimeSeries.equal)
        * [.sum(data, seriesList, fieldSpec)](#TimeSeries.sum) ⇒ <code>[TimeSeries](#TimeSeries)</code>

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

### timeSeries.at()
Access the series events via index

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+setCollection"></a>

### timeSeries.setCollection(collection) ⇒ <code>[TimeSeries](#TimeSeries)</code>
Sets a new underlying collection for this TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>[TimeSeries](#TimeSeries)</code> - A new TimeSeries  
**Params**

- collection <code>Collection</code> - The new collection

<a name="TimeSeries+bisect"></a>

### timeSeries.bisect()
Finds the index that is just less than the time t supplied.
In other words every event at the returned index or less
has a time before the supplied t, and every sample after the
index has a time later than the supplied t.

Optionally supply a begin index to start searching from.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+slice"></a>

### timeSeries.slice()
Perform a slice of events within the TimeSeries, returns a new
TimeSeries representing a portion of this TimeSeries from begin up to
but not including end.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+clean"></a>

### timeSeries.clean()
Perform a basic cleaning operation of the fieldSpec specified
by removing all events in the underlying collection which are
NaN, null or undefined.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+events"></a>

### timeSeries.events()
Generator to allow for..of loops over series.events()

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+index"></a>

### timeSeries.index()
Access the Index, if this TimeSeries has one

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+collection"></a>

### timeSeries.collection()
Returns the internal collection of events for this TimeSeries

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+meta"></a>

### timeSeries.meta()
Returns the meta data about this TimeSeries as a JSON object

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+size"></a>

### timeSeries.size()
Returns the number of rows in the series.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+sizeValid"></a>

### timeSeries.sizeValid()
Returns the number of rows in the series.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries+count"></a>

### timeSeries.count() ⇒ <code>number</code>
Returns the number of rows in the series. (Same as size())

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>number</code> - Size of the series  
<a name="TimeSeries+pipeline"></a>

### timeSeries.pipeline() ⇒ <code>Pipeline</code>
Returns a new Pipeline with input source being this TimeSeries.

**Kind**: instance method of <code>[TimeSeries](#TimeSeries)</code>  
**Returns**: <code>Pipeline</code> - The Pipeline.  
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

### TimeSeries.equal()
STATIC

**Kind**: static method of <code>[TimeSeries](#TimeSeries)</code>  
<a name="TimeSeries.sum"></a>

### TimeSeries.sum(data, seriesList, fieldSpec) ⇒ <code>[TimeSeries](#TimeSeries)</code>
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
