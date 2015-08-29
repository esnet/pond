## Index

An index is simply a string that represents a fixed range of time. There are two basic types: The first represents the number of some unit of time (hours, days etc) since the UNIX epoch. The second represents a calendar range, such as Oct 2014.

For the first type, an example might be:

    1d-12355      //  30th Oct 2003 (GMT), the 12355th day since the UNIX epoch

You can also use seconds (e.g. 30s), minutes (e.g. 5m), hours (e.g. 1h) or days (e.g. 7d).

Here are several examples of the second type:

    2003-10-30    // 30th Oct 2003
    2014-09       // Sept 2014
    2015          // All of the year 2015

An Index is a nice representation of certain types of time intervals because it can be cached with its string representation as a key or data for a specific chunk of time can be looked up based on that string. It also allows us to represent things like months, which have variable length.

The Index has a basic interface to find the TimeRange it represents using `asTimerange()`, or with `begin()` and `end()` to get the bounding times directly. You can also get back the original string with `asString()` (or `toString()`). You can also get a simple JSON object with `toJSON()`.

Example:

    var index = new Index("1h-123554");
    index.asTimerange().humanizeDuration() // "an hour"


