## Timerange

A time range is a simple representation of a begin and end time, used to maintain consistency across an application.

### Construction

You can define a TimeRange with moments, Javascript Date objects or ms since UNIX epoch. Here we construct one with two moments:

    var fmt = "YYYY-MM-DD HH:mm";
    var beginTime = moment("2012-01-11 11:11", fmt);
    var endTime =   moment("2012-02-22 12:12", fmt);
    var range = new TimeRange(beginTime, endTime);

or with ms times:

    var range = new TimeRange([1326309060000, 1329941520000]);

There is also a copy constructor.

### Query

To get the bounding dates back from a TimeRange use `begin()` and `end()` on it.

A TimeRange can also express its duration using `duration()`. The result will be in milliseconds. A human friendly string that represents the duration can be obtained with `humanizeDuration()`.

A TimeRange can serialize to a string with `toString()` or simple JSON with `toJSON()`. It can also print itself as local time with `toLocalSring()` and in UTC time with `toUTCString()`.

There is also a humanized version of the TimeRange, obtained using `humanize()` (e.g. "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am") or as a range relative to now using `relativeString()` (e.g. "a few seconds ago to a month ago").

### Comparison

TimeRange also supports a useful set of comparison operators:

 * `equals(other)` - returns if one TimeRange is exactly the same range as another
 * `contains(other)` - returns true if other is completely inside this.
 * `within(other)` - Returns true if this TimeRange is completely within the supplied other TimeRange.
 * `overlaps(other)`- Returns true if the passed in other TimeRange overlaps this time Range.
 * `disjoint(other)` - Returns true if the passed in other Range in no way overlaps this time Range.

### Mutation

Any mutations to the TimeRange will return another TimeRange. Such operators include:

 * `setBegin(t)` and `setEnd(t)` - change the begin or end time of the TimeRange, resulting in a new TimeRange.
 * `extents(other)` - join a TimeRange with another, returning you a new TimeRange which spans them both.
 * `intersection(other)` - returns a new TimeRange which represents the intersection
(overlapping) part of this and other.

### Static

TimeRange also has several static methods to return common timeranges. So far these include:

 * `lastDay()`
 * `lastSevenDays()`
 * `lastThirtyDays()`
 * `lastNinetyDays()`
