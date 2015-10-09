## TimeSeries

A `TimeSeries` represents a series of events, with each event being a combination of:
 * time (or `TimeRange`, or `Index`)
 * data - corresponding set of key/values.

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

  * **name** - optional, but a good practice
  * **columns** - are necessary and give labels to the data in the points.
  * **points** - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels.
   
  As just hinted at, the time column may actually be either a time or a `TimeRange`, or a time range represented by an Index. By using an Index it is possible, for example, to refer to a specific month, for example:

```javascript
var availabilityData = {
    name: "Last 3 months availability",
    columns: ["time", "uptime"],
    points: [
        ["2015-06", "100%"], // <-- 2015-06 specified here represents June 2015
        ["2015-05", "92%"],
        ["2015-04", "87%"],
    ]
};
```

Alternatively, you can construct a `TimeSeries` with a list of events. Here's an example of that:

```javascript
const events = [];
events.push(new Event(new Date(2015, 7, 1), {value: 27}));
events.push(new Event(new Date(2015, 8, 1), {value: 29}));
const series = new TimeSeries({
    name: "avg temps",
    events: events
});
```

---

### Query API

#### toJSON()

Returns a JSON representation, essentially the above format.

#### toString()

Return a string representation, useful for serialization.

#### size()

Get how many rows the TimeSeries has.

#### at(row)

Returns a particular row back out of the TimeSeries, referenced by the supplied row number. Since each row is conceptional an Event (i.e. a time, TimeRange or Index) mapped to an object containing key/value pairs), it will return an Event, TimeRangeEvent or IndexedEvent:

```javascript
for (let row=0; row < series.size(); row++) {
    const event = series.at(row);
    console.log(event.toString());
}
```

#### generator (for..of)

it is also possible to use the ES6 for..of style iteration in combination with the `events()` method to iterate over the Events in the TimeSeries:

```javascript
for (let event of series.events()) {
    console.log(event.toString());
}
```

In either style of iterating over the Events in a TimeSeries, an Event is the result. An Event is a timestamp, TimeRange or Index mapped to some data, so to deconstruct the event you can use `timestamp()` (or `Index()`, or `timerange()`depending on event type) and `data()` methods. For example, for a normal Event:

```javascript
var data = event.data(); // {"value":18}
var timestamp = event.timestamp().getTime(); //1400425948000
```

See the `Event` docs for more information.

#### bisect(t)

As the series of points is conceptually an array of rows, it is possible to look up the row index by supplying a time `t` to the  method. It will return the row number that is the greatest, but still below t.

#### timerange()

Returns the range that the TimeSeries extends over as a TimeRange.

#### begin()

Returns the begin of the timerange of the TimeSeries.

#### end()

Returns the end of the timerange of the TimeSeries.

#### index(), indexAsString(), indexAsRange()

You can also optionally associate the whole TimeSeries with an Index. This is very helpful when caching different TimeSeries.

To specify that, add it when constructing the TimeSeries:

```javascript
var indexedData = {
    "index": "1d-625",        // <-- Index specified here
    "name": "traffic",
    "columns": ["time", "temp"],
    "points": [
        [1400425947000, 26.2],
        [1400425948000, 27.6],
        [1400425949000, 28.9],
        [1400425950000, 29.1],
    ]
};
```

You can then query that back in the future by using the index functions:
 * indexAsString()
 * indexAsRange()

#### isUTC()

Returns if the data is UTC or not. This is specified in the constructor as well. UTC (or not) is important when adding data associated with an `Index`, such as "2015-06-01", i.e. is that June 1st in UTC or local. This only matters when querying the Index back and asking for its actual time range.

---

### Statistics functions

It is possible to get some basic statistics from a `TimeSeries`. We will add additional operators as needed. Currently supported operators are:

#### sum(column)

Returns the sum of the Timeseries values for the given column. If a column is not supplied it assumes the column to be "value".

#### avg(column)

Returns an average of the Timeseries values for the given column. If a column is not supplied it assumes the column to be "value".

#### max(column)

Returns the maximum value found in a given column. If a column is not supplied it assumes the column to be "value" We often use this to generate axis scales when charting the TimeSeries.

#### min(column)

Returns the minimum value found in a given column. If a column is not supplied it assumes the column to be "value". We often use this to generate axis scales when charting the TimeSeries.

#### mean(column)

Returns the mean of the Timeseries values for the given column. If a column is not supplied it assumes the column to be "value". This is the same as taking the avg().

#### medium(column)

Returns the medium of the Timeseries values for the given column. If a column is not supplied it assumes the column to be "value".

#### stddev(column)

Returns the standard deviation of the Timeseries values for the given column. If a column is not supplied it assumes the column to be "value".

---

### Mutation API

Although the TimeSeries is immutable itself, these operations will return a new modified TimeSeries. We expect to add several more functions here over time.

#### slice(begin, end)

Returns a new TimeSeries with reference just to the Events that were left after the slice. The result represents a portion of this TimeSeries from begin up to but not including end.

For example:

```javascript
const begin = series.bisect(t1);
const end = series.bisect(t2);
const cropped = series.slice(begin, end);  // Returns a cropped series
```

#### TimeSeries.merge(info, [series1, series2, ...]) [Static]

Returns a new TimeSeries that merges a list of TimeSeries together. The common uses for this are:

 * Join a list of `TimeSeries` together that have different columns.
 * Append together a list of `TimeSeries` with the same columns, but different times.

The `info` passed into the `merge()` function is an Object which is used to create the new `TimeSeries`. It contains a name, index (optional), and meta data.

There are some rules surrounding the use of `merge()`.

If we consider each row of each `TimeSeries` with the same `Date` (or `Index`, or `TimeRange`), then we have a list of `Events` (or `IndexedEvents`, or `TimeRangeEvents`). This list needs to be reduced. To do this the events themselves are merged using `Event.merge()`. This operation will not attempt to reduce values which have the same column, for the same time, so for each of these lists of events there should be no shared columns. In other words, you can merge a `TimeSeries` with columns "a" and "b" with a `TimeSeries` with a column "c", but not with a `TimeSeries` with a column "a" (if the two `TimeSeries` overlap their times).

For example, first we create two `TimeSeries`, one with a "in" column and one with an "out" column:

```javascript
const inTraffic = new TimeSeries({
    name: "in",
    columns: ["time", "in"],
    points: [
        [1400425947000, 52],
        [1400425948000, 18],
        [1400425949000, 26],
        [1400425950000, 93],
    ]
});

const outTraffic = new TimeSeries({
    name: "out",
    columns: ["time", "out"],
    points: [
        [1400425947000, 34],
        [1400425948000, 13],
        [1400425949000, 67],
        [1400425950000, 91],
    ]
});
```

We can them merge them:

```javascript
var trafficSeries = TimeSeries.merge({name: "traffic"}, [inTraffic, outTraffic]);
```

The result will look like this:

```json
{
    "name":"traffic",
    "columns":["time", "in", "out"],
    "points":[
        ["2014-05-18T15:12:27.000Z", 52, 34],
        ["2014-05-18T15:12:28.000Z", 18, 13],
        ["2014-05-18T15:12:29.000Z", 26, 67],
        ["2014-05-18T15:12:30.000Z", 93, 91]
    ]
}
```

### Comparison static functions

One of the nice things about the `TimeSeries` representation in Pond is that it is built on top of immutable data structures. For instance, if you have a `TimeSeries` and modify it, those `TimeSeries` will now have a different reference and noting that they have changed is trivial.

#### TimeSeries.equals(series1, series2) [Static]

Will check that the internal structures of the `TimeSeries` are the same reference. If you use the copy constructor, they will be the same.

#### TimeSeries.is(series1, series2) [Static]

Perhaps more useful in that it will check to see if the structures, though perhaps being different references, have the same values.
