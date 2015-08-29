## Timerange

A time range is a simple represention of a begin and end time, used to maintain consistency across an application. You can define a TimeRange with moments, Javascript Date objects or ms since UNIX epoch. Here we construct one with two moments:

    var fmt = "YYYY-MM-DD HH:mm";
    var beginTime = moment("2012-01-11 11:11", fmt);
    var endTime =   moment("2012-02-22 12:12", fmt);
    var range = new TimeRange(beginTime, endTime);

or

    var range = new TimeRange([1326309060000, 1329941520000]);

There is also a copy constuctor.

To get data back from a TimeRange use `begin()` and `end()` on it.

TimeRange also supports a full set of comparison operators, allowing you to determine if one TimeRange `equals()`, `contains()`, is `within()`, `overlaps()` with, or is `disjoint()` from another TimeRange.

You can also get the `extents()` of a TimeRange with another, returning you a new TimeRange which spans them both.

A TimeRange can also return its `duration` in ms, or a human friendly string that represents the same with `humanizeDuration()`.

A TimeRange can serialize to a string with `toString()` or simple JSON with `toJSON()`. It can also print itself as local time with `toLocalSring()` and in UTC time with `toUTCString()`.

There is also a humanized version that can be expressed as a range, using `humanize()` (e.g. "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am") or as a range relative to now using `relativeString()` (e.g. "a few seconds ago to a month ago").

TimeRange also has several static methods to return common timeranges. So far these include: `lastDay()`, `lastSevenDays()`, `lastThirtyDays` and `lastNinetyDays`, though one could imagine expanding these.


