## TimeSeries

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

To create a new TimeSeries object from that simply use the constructor:

    var series = new TimeSeries(data);

The name is somewhat optional, but a good practice. Columns are necessary and refer to the data in the points. And points are and array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels. As just hinted at, the time column may actually be either a time or a timerange, reprsented by an Index. By using an Index it's possible to refer to a specific month for example.

    var availabilityData = {
        "name": "Last 3 months availability",
        "columns": ["time", "uptime"],
        "points": [
            ["2015-06", "100%"],   // <-- 2015-06 specified here represents June 2015
            ["2015-05", "92%"],
            ["2015-04", "87%"],
        ]
    };

You may also optionally associate the TimeSeries with an Index. This is very helpful when caching different TimeSeries.

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

You can read the index back with `index()`, or as a string (more likely for caching) `indexAsString()`, or as a TimeRange with `indexAsRange()`.

To get how many rows there are in a `TimeSeries` use `size()`, while to get a particular row back out of the `Series`, use `at(i)`. It will return the row and an `Event`. like this:

    var event = series.at(1);

An event is a timestamp or timerange and some data, so to deconstruct the event you can use `timestamp()` and `data()` methods:

    var data = event.data(); // {"value":18}
    var timestamp = event.timestamp().getTime(); //1400425948000

Although the TimeSeries is immuatable itself, you can `slice(begin, end)` the TimeSeries. It will return a new TimeSeries with reference just to the Events that were left after the slice. The result represents a portion of this TimeSeries from begin up to but not including end.

### Comparing series

One of the nice things about the TimeSeries representation in Pond is that it is built on top of immutable data structures. As a result, determining if a series is different from before is trivial.

A TimeSeries can be compared in two ways: with the `equals()` or `is()` static functions. `equals()` will check that the internal structures of the TimeSeries are the same reference. If you use the copy constructor, they will be the same. The `is()` function is perhaps more useful in that it will check to see if the structures, though perhaps being different references, have the same values.
