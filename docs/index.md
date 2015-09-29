## Index

An index is simply a string that represents a fixed range of time. There are two basic types:
 * **Multiplier index** - the number of some unit of time (hours, days etc) since the UNIX epoch.
 * **Calendar index** - The second represents a calendar range, such as Oct 2014.

For the first type, a multiplier index, an example might be:

    1d-12355      //  30th Oct 2003 (GMT), the 12355th day since the UNIX epoch

You can also use seconds (e.g. 30s), minutes (e.g. 5m), hours (e.g. 1h) or days (e.g. 7d).

Here are several examples of a calendar index:

    2003-10-30    // 30th Oct 2003
    2014-09       // Sept 2014
    2015          // All of the year 2015

An Index is a nice representation of certain types of time intervals because it can be cached with its string representation as a key. Then a specific chunk of time, and associated data can be looked up based on that string. It also allows us to represent things like months, which have variable length.

An Index is also useful when bucketing into specific timeranges, for example generating all the 5 min ("5m") maximum rollups within a specific day ("1d"). See the discussion about aggregators, collectors and binners within these docs.

### Construction

Construct an Index with its string representation.

### Query

The Index has a basic interface to find the TimeRange it represents:

* `asTimerange()` - returns a TimeRange object for the Index
* `begin() - returns the begin time of the Index
* `end()` - returns the end time of the Index

You can also get back the original string with:
* `asString()` (or `toString()`).

* `toNiceString(format)` - for the calendar index, this method lets you return that calendar range as a human readable format, e.g. "June, 2014". The format specified is a Moment.format. A multiplier index is just returned a its original string.

You can also get a simple JSON object with:

* `toJSON()`.

### Example

    var index = new Index("1h-123554");
    index.asTimerange().humanizeDuration() // "an hour"

