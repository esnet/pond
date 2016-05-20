## TimeRange

---

A time range is a simple representation of a begin and end time, used
to maintain consistency across an application.

### Construction

You can define a TimeRange with moments, Javascript Date objects
or ms since UNIX epoch. Here we construct one with two moments:

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

**Kind**: global class  
## API Reference


* [TimeRange](#TimeRange)
    * [new TimeRange()](#new_TimeRange_new)
    * _instance_
        * [.range()](#TimeRange+range) ⇒ <code>Immutable.List</code>
        * [.toJSON()](#TimeRange+toJSON) ⇒ <code>Array.&lt;number&gt;</code>
        * [.toString()](#TimeRange+toString) ⇒ <code>string</code>
        * [.toLocalString()](#TimeRange+toLocalString) ⇒ <code>string</code>
        * [.toUTCString()](#TimeRange+toUTCString) ⇒ <code>string</code>
        * [.humanize()](#TimeRange+humanize) ⇒ <code>string</code>
        * [.relativeString()](#TimeRange+relativeString) ⇒ <code>string</code>
        * [.begin()](#TimeRange+begin) ⇒ <code>Date</code>
        * [.end()](#TimeRange+end) ⇒ <code>Date</code>
        * [.setBegin(t)](#TimeRange+setBegin) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.setEnd(t)](#TimeRange+setEnd) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.equals(other)](#TimeRange+equals) ⇒ <code>boolean</code>
        * [.contains(other)](#TimeRange+contains) ⇒ <code>boolean</code>
        * [.within(other)](#TimeRange+within) ⇒ <code>boolean</code>
        * [.overlaps(other)](#TimeRange+overlaps) ⇒ <code>boolean</code>
        * [.disjoint(other)](#TimeRange+disjoint) ⇒ <code>boolean</code>
        * [.extents(other)](#TimeRange+extents) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.intersection(other)](#TimeRange+intersection) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.duration()](#TimeRange+duration) ⇒ <code>number</code>
        * [.humanizeDuration()](#TimeRange+humanizeDuration) ⇒ <code>string</code>
    * _static_
        * [.lastDay()](#TimeRange.lastDay) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.lastSevenDays()](#TimeRange.lastSevenDays) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.lastThirtyDays()](#TimeRange.lastThirtyDays) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.lastMonth()](#TimeRange.lastMonth) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.lastNinetyDays()](#TimeRange.lastNinetyDays) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.lastYear()](#TimeRange.lastYear) ⇒ <code>[TimeRange](#TimeRange)</code>

<a name="new_TimeRange_new"></a>

### new TimeRange()
Builds a new TimeRange which may be of several different formats:
  - Another TimeRange (copy constructor)
  - An Immutable.List containing two Dates.
  - A Javascript array containing two Date or ms timestamps
  - Two arguments, begin and end, each of which may be a Data,
    a Moment, or a ms timestamp.

<a name="TimeRange+range"></a>

### timeRange.range() ⇒ <code>Immutable.List</code>
Returns the internal range, which is an Immutable List containing
begin and end times.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>Immutable.List</code> - List containing the begin and end of the time range.  
<a name="TimeRange+toJSON"></a>

### timeRange.toJSON() ⇒ <code>Array.&lt;number&gt;</code>
Returns the TimeRange as JSON, which will be a Javascript array
of two ms timestamps.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>Array.&lt;number&gt;</code> - JSON representation of the TimeRange  
<a name="TimeRange+toString"></a>

### timeRange.toString() ⇒ <code>string</code>
Returns the TimeRange as a string, useful for serialization.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>string</code> - String representation of the TimeRange  
<a name="TimeRange+toLocalString"></a>

### timeRange.toLocalString() ⇒ <code>string</code>
Returns the TimeRange as a string expressed in local time

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>string</code> - String representation of the TimeRange  
<a name="TimeRange+toUTCString"></a>

### timeRange.toUTCString() ⇒ <code>string</code>
Returns the TimeRange as a string expressed in UTC time

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>string</code> - String representation of the TimeRange  
<a name="TimeRange+humanize"></a>

### timeRange.humanize() ⇒ <code>string</code>
Returns a human friendly version of the TimeRange, e.g.
"Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>string</code> - Human friendly string representation of the TimeRange  
<a name="TimeRange+relativeString"></a>

### timeRange.relativeString() ⇒ <code>string</code>
Returns a human friendly version of the TimeRange

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>string</code> - Human friendly string representation of the TimeRange  
**Example**  
```js
"a few seconds ago to a month ago"
```
<a name="TimeRange+begin"></a>

### timeRange.begin() ⇒ <code>Date</code>
Returns the begin time of the TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>Date</code> - The begin time of the TimeRange  
<a name="TimeRange+end"></a>

### timeRange.end() ⇒ <code>Date</code>
Returns the end time of the TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>Date</code> - The end time of the TimeRange  
<a name="TimeRange+setBegin"></a>

### timeRange.setBegin(t) ⇒ <code>[TimeRange](#TimeRange)</code>
Sets a new begin time on the TimeRange. The result will be
a new TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The new mutated TimeRange  
**Params**

- t <code>Date</code> - Time to set the begin time to

<a name="TimeRange+setEnd"></a>

### timeRange.setEnd(t) ⇒ <code>[TimeRange](#TimeRange)</code>
Sets a new end time on the TimeRange. The result will be
a new TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The new mutated TimeRange  
**Params**

- t <code>Date</code> - Time to set the end time to

<a name="TimeRange+equals"></a>

### timeRange.equals(other) ⇒ <code>boolean</code>
Returns if the two TimeRanges can be considered equal,
in that they have the same times.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>boolean</code> - Result  
**Params**

- other <code>[TimeRange](#TimeRange)</code> - The TimeRange to compare to

<a name="TimeRange+contains"></a>

### timeRange.contains(other) ⇒ <code>boolean</code>
Returns true if other is completely inside this.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>boolean</code> - Result  
**Params**

- other <code>[TimeRange](#TimeRange)</code> - The TimeRange to compare to

<a name="TimeRange+within"></a>

### timeRange.within(other) ⇒ <code>boolean</code>
Returns true if this TimeRange is completely within the supplied
other TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>boolean</code> - Result  
**Params**

- other <code>[TimeRange](#TimeRange)</code> - The TimeRange to compare to

<a name="TimeRange+overlaps"></a>

### timeRange.overlaps(other) ⇒ <code>boolean</code>
Returns true if the passed in other TimeRange overlaps this time Range.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>boolean</code> - Result  
**Params**

- other <code>[TimeRange](#TimeRange)</code> - The TimeRange to compare to

<a name="TimeRange+disjoint"></a>

### timeRange.disjoint(other) ⇒ <code>boolean</code>
Returns true if the passed in other Range in no way
overlaps this time Range.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>boolean</code> - Result  
**Params**

- other <code>[TimeRange](#TimeRange)</code> - The TimeRange to compare to

<a name="TimeRange+extents"></a>

### timeRange.extents(other) ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - a new Timerange which covers the extents of this and
other combined.  
**Params**

- other <code>[TimeRange](#TimeRange)</code> - The TimeRange to extend with

<a name="TimeRange+intersection"></a>

### timeRange.intersection(other) ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - A new TimeRange which represents the intersection
(overlapping) part of this and other.  
**Params**

- other <code>[TimeRange](#TimeRange)</code> - The TimeRange to intersect with

<a name="TimeRange+duration"></a>

### timeRange.duration() ⇒ <code>number</code>
**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>number</code> - The duration of the TimeRange in milliseconds  
<a name="TimeRange+humanizeDuration"></a>

### timeRange.humanizeDuration() ⇒ <code>string</code>
**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>string</code> - A user friendly version of the duration.  
<a name="TimeRange.lastDay"></a>

### TimeRange.lastDay() ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: static method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The last day, as a TimeRange  
<a name="TimeRange.lastSevenDays"></a>

### TimeRange.lastSevenDays() ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: static method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The last seven days, as a TimeRange  
<a name="TimeRange.lastThirtyDays"></a>

### TimeRange.lastThirtyDays() ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: static method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The last thirty days, as a TimeRange  
<a name="TimeRange.lastMonth"></a>

### TimeRange.lastMonth() ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: static method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The last month, as a TimeRange  
<a name="TimeRange.lastNinetyDays"></a>

### TimeRange.lastNinetyDays() ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: static method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The last 90 days, as a TimeRange  
<a name="TimeRange.lastYear"></a>

### TimeRange.lastYear() ⇒ <code>[TimeRange](#TimeRange)</code>
**Kind**: static method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - The last year, as a TimeRange  
