## Timerange

A time range is a simple representation of a begin and end time, used to maintain consistency across an application.

### Construction

You can define a TimeRange with moments, Javascript Date objects or ms since UNIX epoch. Here we construct one with two moments:

```js
var fmt = "YYYY-MM-DD HH:mm";
var beginTime = moment("2012-01-11 11:11", fmt);
var endTime =   moment("2012-02-22 12:12", fmt);
var range = new TimeRange(beginTime, endTime);
```

or with ms times:

```js
var range = new TimeRange([1326309060000, 1329941520000]);
```

There is also a copy constructor.

---

### Query API

#### begin()

Returns the begin time of the TimeRange as a Javascript Date object.

#### end()

Returns the end time of the TimeRange as a Javascript Date object.

#### duration()

Express the TimeRange as a duration. The result will be in milliseconds.

#### humanizeDuration()

Returns a human friendly string that represents the duration.

#### toString()

Serialize to a string with `toString()`

#### toJSON()

Convert the TimeRange to simple Javascript objects.

#### toLocalSring()

Return a string version of the TimeRange in local time

#### toUTCString()

Return a string version of the TimeRange in UTC time

#### humanize()

Returns a humanized version of the TimeRange (e.g. "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am")

#### relativeString()

Returns a humanized version of the TimeRange as one time relative to another (e.g. "a few seconds ago to a month ago").

---

### Comparison API

TimeRange also supports a useful set of comparison operators.

#### equals(other)

Returns if one TimeRange is exactly the same TimeRange as another.

#### contains(other)

Returns true if other is completely inside this TimeRange.

#### within(other)

Returns true if this TimeRange is completely within the supplied other TimeRange.

#### overlaps(other)

Returns true if the passed in other TimeRange overlaps this TimeRange.

#### disjoint(other)

Returns true if the passed in other Range in no way overlaps this TimeRange.


---

### Mutation API

Any mutations to the TimeRange will return another TimeRange. Such operators include:

#### setBegin(t)` and `setEnd(t)

Change the begin or end time of the TimeRange, resulting in a new TimeRange.

#### extents(other)

Join a TimeRange with another, returning you a new TimeRange which spans them both.

#### intersection(other)

Returns a new TimeRange which represents the overlapping part of this and the other TimeRange.

---

### Static helpers

TimeRange also has several static methods to return common time ranges. So far these include:

#### TimeRange.lastDay()

#### TimeRange.lastSevenDays()

#### TimeRange.lastThirtyDays()

#### TimeRange.lastNinetyDays()
