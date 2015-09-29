## TimeSeries

A TimeSeries represents a series of events, with each event being a time (or TimeRange) and a corresponding set of data.

### Construction

Currently you can initialize a TimeSeries with either a list of events, or with a data format that looks like this:

    var data = {
        "name": "traffic",
        "columns": ["time", "value"],
        "points": [
            [1400425947000, 52],
            [1400425948000, 18],
            [1400425949000, 26],
            [1400425950000, 93],
            ...
        ]
    };

To create a new TimeSeries object from the above format, simply use the constructor:

    var series = new TimeSeries(data);

### Format

  * **name** - optional, but a good practice
  * **columns** - are necessary and give labels to the data in the points.
  * **points** - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels. As just hinted at, the time column may actually be either a time or a timerange, represented by an Index. By using an Index it's possible to refer to a specific month, for example:

    var availabilityData = {
        "name": "Last 3 months availability",
        "columns": ["time", "uptime"],
        "points": [
            ["2015-06", "100%"],   // <-- 2015-06 specified here represents June 2015
            ["2015-05", "92%"],
            ["2015-04", "87%"],
        ]
    };

### Query

 * `toJSON()` - return a JSON representation, essentially the above format
 * `toString()` - return a string representation, useful for serialization
 * `size()` - get how many rows the TimeSeries has
 * `at(i)` - get a particular row back out of the TimeSeries.It will return the row and an `Event`. like this:

    for (var i=0; i < series.size(); i++) {
        var event = series.at(1);
        console.log(event.toString());
    }

 * generator - it is also possible to use the ES6 for..of style iteration in combination with the `events()` method:

    for (let event of series.events()) {
        console.log(event.toString());
    }

In either case, an Event is the result. An Event is a timestamp or timerange and some data, so to deconstruct the event you can use `timestamp()` and `data()` methods:

    var data = event.data(); // {"value":18}
    var timestamp = event.timestamp().getTime(); //1400425948000

See the `Event` docs for more information.

* `bisect(t)` - as the series of points is conceptually an array, it is possible to look up the array index `i` by supplying a time `t` to the  method.

* `range()` or `timerange()` - returns the range that the TimeSeries extends over as a TimeRange.

* `begin()` and `end()` - returns the begin or end of the `range()` of the TimeSeries.

* `index()`, `indexAsString()` and `indexAsRange()` - you can also optionally associate the whole TimeSeries with an Index. This is very helpful when caching different TimeSeries.

To specify that, add it when constructing the TimeSeries:

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

You can then query that back in the future by using the index functions above.

* `isUTC()` - Returns if the data is UTC or not. This is specified in the constructor as well. UTC (or not) is important when adding data associated with an Index, such as "2015-06-01", i.e. is that June 1st in UTC or local. This only matters when querying the Index back and asking for its actual time range.

### Statistics

It is possible to get some basic statistics from a TimeSeries. Currently supported operators are:

* `sum()`
* `avg()`
* `max()`
* `min()`
* `mean()`
* `medium()`
* `stddev()`

All take an optional column name, otherwise a column `value` is assumed.

### Mutation

Although the TimeSeries is immutable itself, these operations will return a new modified TimeSeries:

 * `slice(begin, end)` - will return a new TimeSeries with reference just to the Events that were left after the slice. The result represents a portion of this TimeSeries from begin up to but not including end.

For example:

    const begin = series.bisect(t1);
    const end = series.bisect(t2);
    const cropped = series.slice(begin, end);  // Returns a cropped series

### Comparison

One of the nice things about the TimeSeries representation in Pond is that it is built on top of immutable data structures. As a result, determining if a series is different from before is trivial.

A TimeSeries can be compared in two ways: with the `equals()` or `is()` static functions. `equals()` will check that the internal structures of the TimeSeries are the same reference. If you use the copy constructor, they will be the same. The `is()` function is perhaps more useful in that it will check to see if the structures, though perhaps being different references, have the same values.
