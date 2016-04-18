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

---

## API Reference

**Kind**: global class  

* [TimeRange](#TimeRange)
    * [new TimeRange()](#new_TimeRange_new)
    * [.range()](#TimeRange+range)
    * [.toJSON()](#TimeRange+toJSON) ⇒ <code>Array.&lt;number&gt;</code>
    * [.toString()](#TimeRange+toString) ⇒ <code>string</code>
    * [.toLocalString()](#TimeRange+toLocalString) ⇒ <code>string</code>
    * [.toUTCString()](#TimeRange+toUTCString) ⇒ <code>string</code>
    * [.humanize()](#TimeRange+humanize) ⇒ <code>string</code>
    * [.relativeString()](#TimeRange+relativeString) ⇒ <code>string</code>
    * [.begin()](#TimeRange+begin)
    * [.end()](#TimeRange+end)
    * [.setBegin()](#TimeRange+setBegin)
    * [.setEnd()](#TimeRange+setEnd)
    * [.equals()](#TimeRange+equals)
    * [.contains()](#TimeRange+contains)
    * [.within()](#TimeRange+within)
    * [.overlaps()](#TimeRange+overlaps)
    * [.disjoint()](#TimeRange+disjoint)
    * [.extents()](#TimeRange+extents)
    * [.intersection()](#TimeRange+intersection)

<a name="new_TimeRange_new"></a>

### new TimeRange()
Builds a new TimeRange which may be of several different formats:
  - Another TimeRange (copy constructor)
  - An Immutable.List containing two Dates.
  - A Javascript array containing two Date or ms timestamps
  - Two arguments, begin and end, each of which may be a Data,
    a Moment, or a ms timestamp.

<a name="TimeRange+range"></a>

### timeRange.range()
Returns the internal range, which is an Immutable List containing
begin and end keys

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
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
Returns a human friendly version of the TimeRange, e.g.
e.g. "a few seconds ago to a month ago"

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
**Returns**: <code>string</code> - Human friendly string representation of the TimeRange  
<a name="TimeRange+begin"></a>

### timeRange.begin()
Returns the begin time of the TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+end"></a>

### timeRange.end()
Returns the end time of the TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+setBegin"></a>

### timeRange.setBegin()
Sets a new begin time on the TimeRange. The result will be
a new TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+setEnd"></a>

### timeRange.setEnd()
Sets a new end time on the TimeRange. The result will be a new TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+equals"></a>

### timeRange.equals()
Returns if the two TimeRanges can be considered equal,
in that they have the same times.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+contains"></a>

### timeRange.contains()
Returns true if other is completely inside this.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+within"></a>

### timeRange.within()
Returns true if this TimeRange is completely within the supplied
other TimeRange.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+overlaps"></a>

### timeRange.overlaps()
Returns true if the passed in other TimeRange overlaps this time Range.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+disjoint"></a>

### timeRange.disjoint()
Returns true if the passed in other Range in no way
overlaps this time Range.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+extents"></a>

### timeRange.extents()
Returns a new Timerange which covers the extents of this and
other combined.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
<a name="TimeRange+intersection"></a>

### timeRange.intersection()
Returns a new TimeRange which represents the intersection
(overlapping) part of this and other.

**Kind**: instance method of <code>[TimeRange](#TimeRange)</code>  
