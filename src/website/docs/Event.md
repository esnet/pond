<a name="Event"></a>

## Event
There are three types of Events in Pond:

1. *Event* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

### Construction

The creation of an Event is done by combining two parts: the timestamp (or time range, or Index...) and the data, along with an optional key which is described below.
For a basic `Event`, you specify the timestamp as either a Javascript Date object, a Moment, or the number of milliseconds since the UNIX epoch.
For a `TimeRangeEvent`, you specify a TimeRange, along with the data.
For a `IndexedEvent`, you specify an Index, along with the data, and if the event should be considered to be in UTC time or not.

To specify the data you can supply:
a Javascript object of key/values. The object may contained nested data.
an Immutable.Map
a simple type such as an integer. This is a shorthand for supplying {"value": v}.
*Example:**

Given some source of data that looks like this:

```json
const sampleEvent = {
    "start_time": "2015-04-22T03:30:00Z",
    "end_time": "2015-04-22T13:00:00Z",
    "description": "At 13:33 pacific circuit 06519 went down.",
    "title": "STAR-CR5 - Outage",
    "completed": true,
    "external_ticket": "",
    "esnet_ticket": "ESNET-20150421-013",
    "organization": "Internet2 / Level 3",
    "type": "U"
}
```

We first extract the begin and end times to build a TimeRange:

```js
let b = new Date(sampleEvent.start_time);
let e = new Date(sampleEvent.end_time);
let timerange = new TimeRange(b, e);
```

Then we combine the TimeRange and the event itself to create the Event.

```js
let outageEvent = new TimeRangeEvent(timerange, sampleEvent);
```

Once we have an event we can get access the time range with:

```js
outageEvent.begin().getTime()   // 1429673400000
outageEvent.end().getTime())    // 1429707600000
outageEvent.humanizeDuration()) // "10 hours"
```

And we can access the data like so:

```js
outageEvent.get("title")  // "STAR-CR5 - Outage"
```

Or use:

```js
outageEvent.data()
```

to fetch the whole data object, which will be an Immutable Map.

**Kind**: global class  

* [Event](#Event)
    * [new Event()](#new_Event_new)
    * _instance_
        * [.toJSON()](#Event+toJSON) ⇒ <code>Object</code>
        * [.toString()](#Event+toString) ⇒ <code>string</code>
        * [.toPoint()](#Event+toPoint)
        * [.timestampAsUTCString()](#Event+timestampAsUTCString)
        * [.timestampAsLocalString()](#Event+timestampAsLocalString)
        * [.timestamp()](#Event+timestamp)
        * [.begin()](#Event+begin)
        * [.end()](#Event+end)
        * [.data()](#Event+data)
        * [.setData()](#Event+setData)
        * [.get(fieldPath)](#Event+get) ⇒
        * [.value(fieldPath)](#Event+value) ⇒
        * [.stringify()](#Event+stringify) ⇒ <code>string</code>
        * [.collapse()](#Event+collapse)
        * [.key()](#Event+key)
        * [.type()](#Event+type)
    * _static_
        * [.is(event1, event2)](#Event.is) ⇒ <code>Boolean</code>
        * [.isDuplicate()](#Event.isDuplicate) ⇒ <code>Boolean</code>
        * [.isValidValue(event, The)](#Event.isValidValue)
        * [.selector()](#Event.selector)
        * [.merge(events)](#Event.merge) ⇒ <code>Immutable.List</code> &#124; <code>array</code>
        * [.combine(events, fieldSpec, reducer)](#Event.combine) ⇒ <code>Immutable.List</code> &#124; <code>array</code>
        * [.sum(events, fieldSpec)](#Event.sum)
        * [.avg(events, fieldSpec)](#Event.avg)
        * [.map(fieldSpec)](#Event.map)
        * [.reduce(mapped, reducer)](#Event.reduce)

<a name="new_Event_new"></a>

### new Event()
The creation of an Event is done by combining two parts:
the timestamp and the data.

To construct you specify the timestamp as either:
    - Javascript Date object
    - a Moment, or
    - millisecond timestamp: the number of ms since the UNIX epoch

To specify the data you can supply either:
    - a Javascript object containing key values pairs
    - an Immutable.Map, or
    - a simple type such as an integer. In the case of the simple type
      this is a shorthand for supplying {"value": v}.

<a name="Event+toJSON"></a>

### event.toJSON() ⇒ <code>Object</code>
Returns the Event as a JSON object, essentially:
 {time: t, data: {key: value, ...}}

**Kind**: instance method of <code>[Event](#Event)</code>  
**Returns**: <code>Object</code> - The event as JSON.  
<a name="Event+toString"></a>

### event.toString() ⇒ <code>string</code>
Retruns the Event as a string, useful for serialization.

**Kind**: instance method of <code>[Event](#Event)</code>  
**Returns**: <code>string</code> - The Event as a string  
<a name="Event+toPoint"></a>

### event.toPoint()
Returns a flat array starting with the timestamp, followed by the values.

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+timestampAsUTCString"></a>

### event.timestampAsUTCString()
The timestamp of this data, in UTC time, as a string.

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+timestampAsLocalString"></a>

### event.timestampAsLocalString()
The timestamp of this data, in Local time, as a string.

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+timestamp"></a>

### event.timestamp()
The timestamp of this data

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+begin"></a>

### event.begin()
The begin time of this Event, which will be just the timestamp

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+end"></a>

### event.end()
The end time of this Event, which will be just the timestamp

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+data"></a>

### event.data()
Direct access to the event data. The result will be an Immutable.Map.

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+setData"></a>

### event.setData()
Sets the data portion of the event and returns a new Event.

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+get"></a>

### event.get(fieldPath) ⇒
Get specific data out of the Event. The data will be converted
to a js object. You can use a fieldPath to address deep data.

**Kind**: instance method of <code>[Event](#Event)</code>  
**Returns**: The value of the field  
**Params**

- fieldPath <code>Array</code> - Name of value to look up. If not provided,
                             defaults to ['value']. "Deep" syntax is
                             ['deep', 'value'] or 'deep.value.'

<a name="Event+value"></a>

### event.value(fieldPath) ⇒
Get specific data out of the Event. Alias for get(). The data will
be converted to a js object. You can use a fieldPath to address deep data.

**Kind**: instance method of <code>[Event](#Event)</code>  
**Returns**: The value of the field  
**Params**

- fieldPath <code>Array</code> - Name of value to look up. If not provided,
                             defaults to ['value']. "Deep" syntax is
                             ['deep', 'value'] or 'deep.value.'

<a name="Event+stringify"></a>

### event.stringify() ⇒ <code>string</code>
Turn the Collection data into a string

**Kind**: instance method of <code>[Event](#Event)</code>  
**Returns**: <code>string</code> - The collection as a string  
<a name="Event+collapse"></a>

### event.collapse()
Collapses this event's columns, represented by the fieldSpecList
into a single column. The collapsing itself is done with the reducer
function. Optionally the collapsed column could be appended to the
existing columns, or replace them (the default).

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+key"></a>

### event.key()
Returns the timestamp (as ms since the epoch)

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+type"></a>

### event.type()
Returns the timestamp (as ms since the epoch) for an Event,
the index string for an IndexedEvent or the TimeRange
expressed as beginTime,endTime for a TimeRangeEvent.

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event.is"></a>

### Event.is(event1, event2) ⇒ <code>Boolean</code>
Do the two supplied events contain the same data,
even if they are not the same instance.

**Kind**: static method of <code>[Event](#Event)</code>  
**Returns**: <code>Boolean</code> - Result  
**Params**

- event1 <code>[Event](#Event)</code> - First event to compare
- event2 <code>[Event](#Event)</code> - Second event to compare

<a name="Event.isDuplicate"></a>

### Event.isDuplicate() ⇒ <code>Boolean</code>
Returns if the two supplied events are duplicates
of each other. By default, duplicated means that the
timestamps are the same. This is the case with incoming events
where the second event is either known to be the same (but
duplicate) of the first, or supersedes the first. You can
also pass in false for ignoreValues and get a full
compare.

**Kind**: static method of <code>[Event](#Event)</code>  
**Returns**: <code>Boolean</code> - The result of the compare  
<a name="Event.isValidValue"></a>

### Event.isValidValue(event, The)
The same as Event.value() only it will return false if the
value is either undefined, NaN or Null.

**Kind**: static method of <code>[Event](#Event)</code>  
**Params**

- event <code>[Event](#Event)</code> - The Event to check
- The <code>string</code> | <code>array</code> - field to check

<a name="Event.selector"></a>

### Event.selector()
Function to select specific fields of an event using
a fieldPath and return a new event with just those fields.

The fieldPath currently can be:
 * A single field name
 * An array of field names

The function returns a new event.

**Kind**: static method of <code>[Event](#Event)</code>  
<a name="Event.merge"></a>

### Event.merge(events) ⇒ <code>Immutable.List</code> &#124; <code>array</code>
Merges multiple `events` together into a new array of events, one
for each time/index/timerange of the source events. Merging is done on
the data of each event. Values from later events in the list overwrite
early values if fields conflict.

Common use cases:
  - append events of different timestamps
  - merge in events with one field to events with another
  - merge in events that supersede the previous events

See also: TimeSeries.timeSeriesListMerge()

**Kind**: static method of <code>[Event](#Event)</code>  
**Returns**: <code>Immutable.List</code> &#124; <code>array</code> - Array or Immutable.List of events  
**Params**

- events <code>Immutable.List</code> | <code>array</code> - Array or Immutable.List of events

<a name="Event.combine"></a>

### Event.combine(events, fieldSpec, reducer) ⇒ <code>Immutable.List</code> &#124; <code>array</code>
Combines multiple `events` together into a new array of events, one
for each time/index/timerange of the source events. The list of
events may be specified as an array or `Immutable.List`. Combining acts
on the fields specified in the `fieldSpec` and uses the reducer
function to take the multiple values and reducer them down to one.

The return result will be an of the same form as the input. If you
pass in an array of events, you will get an array of events back. If
you pass an `Immutable.List` of events then you will get an
`Immutable.List` of events back.

This is the general version of `Event.sum()` and `Event.avg()`. If those
common use cases are what you want, just use those functions. If you
want to specify your own reducer you can use this function.

See also: `TimeSeries.timeSeriesListSum()`

**Kind**: static method of <code>[Event](#Event)</code>  
**Returns**: <code>Immutable.List</code> &#124; <code>array</code> - An Immutable.List or array of events  
**Params**

- events <code>Immutable.List</code> | <code>array</code> - Array of event objects
- fieldSpec <code>string</code> | <code>array</code> - Column or columns to look up. If you need
                                         to retrieve multiple deep nested values that
                                         ['can.be', 'done.with', 'this.notation'].
                                         A single deep value with a string.like.this.
                                         If not supplied, all columns will be operated on.
- reducer <code>function</code> - Reducer function to apply to column data.

<a name="Event.sum"></a>

### Event.sum(events, fieldSpec)
Sum takes multiple events and sums them together. The result is a
single event for each timestamp. Events should be homogeneous.

**Kind**: static method of <code>[Event](#Event)</code>  
**Params**

- events <code>array</code> - Array of event objects
- fieldSpec <code>string</code> | <code>array</code> - Column or columns to look up. If you need
                                 to retrieve multiple deep nested values that
                                 ['can.be', 'done.with', 'this.notation'].
                                 A single deep value with a string.like.this.
                                 If not supplied, all columns will be operated on.

<a name="Event.avg"></a>

### Event.avg(events, fieldSpec)
Sum takes multiple events, groups them by timestamp, and uses combine()
to average them. If the events do not have the same timestamp an
exception will be thrown.

**Kind**: static method of <code>[Event](#Event)</code>  
**Params**

- events <code>array</code> - Array of event objects
- fieldSpec <code>string</code> | <code>array</code> - Column or columns to look up. If you need
                                 to retrieve multiple deep nested values that
                                 ['can.be', 'done.with', 'this.notation'].
                                 A single deep value with a string.like.this.
                                 If not supplied, all columns will be operated on.

<a name="Event.map"></a>

### Event.map(fieldSpec)
Maps a list of events according to the fieldSpec
passed in. The spec maybe a single field name, a
list of field names, or a function that takes an
event and returns a key/value pair.

**Kind**: static method of <code>[Event](#Event)</code>  
**Params**

- fieldSpec <code>string</code> | <code>array</code> - Column or columns to look up. If you need
                                 to retrieve multiple deep nested values that
                                 ['can.be', 'done.with', 'this.notation'].
                                 A single deep value with a string.like.this.
                                 If not supplied, all columns will be operated on.
                                 If field_spec is a function, the function should
                                 return a map. The keys will be come the
                                 "column names" that will be used in the map that
                                 is returned.

**Example**  
````
        in   out
 3am    1    2
 4am    3    4

Mapper result:  { in: [1, 3], out: [2, 4]}
```
<a name="Event.reduce"></a>

### Event.reduce(mapped, reducer)
Takes a list of events and a reducer function and returns
a new Event with the result, for each column. The reducer is
of the form:
```
    function sum(valueList) {
        return calcValue;
    }
```

**Kind**: static method of <code>[Event](#Event)</code>  
**Params**

- mapped <code>map</code> - A map, as produced from map()
- reducer <code>function</code> - The reducer function

