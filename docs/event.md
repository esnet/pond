## Events

There are three types of Events in Pond:

1. *Event* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

### Construction

The creation of an Event is done by combining two parts: the timestamp (or time range, or Index...) and the data, along with an optional key which is described below.

 * For a basic `Event`, you specify the timestamp as either a Javascript Date object, a Moment, or the number of milliseconds since the UNIX epoch.

 * For a `TimeRangeEvent`, you specify a TimeRange, along with the data.

 * For a `IndexedEvent`, you specify an Index, along with the data, and if the event should be considered to be in UTC time or not.

To specify the data you can supply:

 * a Javascript object of key/values. The object may contained nested data.

 * an Immutable.Map

 * a simple type such as an integer. This is a shorthand for supplying {"value": v}.

**Example:**

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

---

### Query API

#### toJSON()

Returns a JSON representation of the Event

#### toString()

Returns a string representation of the Event, useful for serialization

#### timestampAsUTCString()

Returns the timestamp of the Event in UTC time.

#### timestampAsLocalString()

Returns the timestamp of the Event in Local time.

#### timestamp()

Returns the timestamp of the Event as a Date.

#### data()

Returns the internal data of the event, as an Immutable.Map.

#### get(column)

Returns the value for a specific column within the Event data. If no column is specified then 'value' is used for the column. If the value is a complex type, such as a Map, then the value will be copied to a Javascript object and then returned.

```javascript
const event = new Event(timestamp, {
    a: {in: 123, out: 456},
    b: {in: 654, out: 223}
});

event.get("a") // {in: 123, out: 456};
event.get("b") // {in: 654, out: 223};
```

---
## Event Reference

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
        * [.get()](#Event+get)
        * [.value()](#Event+value)
    * _static_
        * [.isValidValue()](#Event.isValidValue)
        * [.selector()](#Event.selector)
        * [.combine()](#Event.combine)
        * [.map()](#Event.map)
        * [.reduce()](#Event.reduce)

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

### event.get()
Get specific data out of the Event. The data will be converted
to a js object. You can use a fieldSpec to address deep data.
A fieldSpec could be "a.b"

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+value"></a>

### event.value()
Alias for get()

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event.isValidValue"></a>

### Event.isValidValue()
The same as Event.value() only it will return false if the
value is either undefined, NaN or Null.

**Kind**: static method of <code>[Event](#Event)</code>  
<a name="Event.selector"></a>

### Event.selector()
Function to select specific fields of an event using
a fieldSpec and return a new event with just those fields.

The fieldSpec currently can be:
 * A single field name
 * An array of field names

The function returns a new event.

**Kind**: static method of <code>[Event](#Event)</code>  
<a name="Event.combine"></a>

### Event.combine()
Combines multiple events with the same time together
to form a new event. Doesn't currently work on IndexedEvents
or TimeRangeEvents.

**Kind**: static method of <code>[Event](#Event)</code>  
<a name="Event.map"></a>

### Event.map()
Maps a list of events according to the fieldSpec
passed in. The spec maybe a single field name, a
list of field names, or a function that takes an
event and returns a key/value pair.

Example 1:
        in   out
 3am    1    2
 4am    3    4

Mapper result:  { in: [1, 3], out: [2, 4]}

**Kind**: static method of <code>[Event](#Event)</code>  
<a name="Event.reduce"></a>

### Event.reduce()
Takes a list of events and a reducer function and returns
a new Event with the result, for each column. The reducer is
of the form:
    function sum(valueList) {
        return calcValue;
    }

**Kind**: static method of <code>[Event](#Event)</code>  

---
## TimeRangeEvent Reference

**Kind**: global class  

* [TimeRangeEvent](#TimeRangeEvent)
    * [new TimeRangeEvent()](#new_TimeRangeEvent_new)
    * [.toPoint()](#TimeRangeEvent+toPoint)
    * [.timerange()](#TimeRangeEvent+timerange) ⇒ <code>TimeRange</code>
    * [.data()](#TimeRangeEvent+data) ⇒ <code>Immutable.Map</code>
    * [.setData()](#TimeRangeEvent+setData)
    * [.timerangeAsUTCString()](#TimeRangeEvent+timerangeAsUTCString) ⇒ <code>string</code>
    * [.timerangeAsLocalString()](#TimeRangeEvent+timerangeAsLocalString) ⇒ <code>string</code>
    * [.begin()](#TimeRangeEvent+begin) ⇒ <code>Data</code>
    * [.end()](#TimeRangeEvent+end) ⇒ <code>Data</code>
    * [.timestamp()](#TimeRangeEvent+timestamp) ⇒ <code>Data</code>
    * [.get()](#TimeRangeEvent+get)

<a name="new_TimeRangeEvent_new"></a>

### new TimeRangeEvent()
The creation of an TimeRangeEvent is done by combining two parts:
the timerange and the data.

To construct you specify a TimeRange, along with the data.

To specify the data you can supply either:
    - a Javascript object containing key values pairs
    - an Immutable.Map, or
    - a simple type such as an integer. In the case of the simple type
      this is a shorthand for supplying {"value": v}.

<a name="TimeRangeEvent+toPoint"></a>

### timeRangeEvent.toPoint()
Returns a flat array starting with the timestamp, followed by the values.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
<a name="TimeRangeEvent+timerange"></a>

### timeRangeEvent.timerange() ⇒ <code>TimeRange</code>
The TimeRange of this data

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>TimeRange</code> - TimeRange of this data.  
<a name="TimeRangeEvent+data"></a>

### timeRangeEvent.data() ⇒ <code>Immutable.Map</code>
Access the event data

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>Immutable.Map</code> - Data for the Event  
<a name="TimeRangeEvent+setData"></a>

### timeRangeEvent.setData()
Sets the data portion of the event and
returns a new TimeRangeEvent.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
<a name="TimeRangeEvent+timerangeAsUTCString"></a>

### timeRangeEvent.timerangeAsUTCString() ⇒ <code>string</code>
The TimeRange of this data, in UTC, as a string.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>string</code> - TimeRange of this data.  
<a name="TimeRangeEvent+timerangeAsLocalString"></a>

### timeRangeEvent.timerangeAsLocalString() ⇒ <code>string</code>
The TimeRange of this data, in Local time, as a string.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>string</code> - TimeRange of this data.  
<a name="TimeRangeEvent+begin"></a>

### timeRangeEvent.begin() ⇒ <code>Data</code>
The begin time of this Event

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>Data</code> - Begin time  
<a name="TimeRangeEvent+end"></a>

### timeRangeEvent.end() ⇒ <code>Data</code>
The end time of this Event

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>Data</code> - End time  
<a name="TimeRangeEvent+timestamp"></a>

### timeRangeEvent.timestamp() ⇒ <code>Data</code>
Alias for the begin() time.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>Data</code> - Time representing this Event  
<a name="TimeRangeEvent+get"></a>

### timeRangeEvent.get()
Get specific data out of the Event. The data will be converted
to a js object. You can use a fieldSpec to address deep data.
A fieldSpec could be "a.b"

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  

---
## IndexedEvent Reference

**Kind**: global class  

* [IndexedEvent](#IndexedEvent)
    * [new IndexedEvent()](#new_IndexedEvent_new)
    * [.toPoint()](#IndexedEvent+toPoint)
    * [.index()](#IndexedEvent+index) ⇒ <code>Index</code>
    * [.setData()](#IndexedEvent+setData)
    * [.data()](#IndexedEvent+data) ⇒ <code>Immutable.Map</code>
    * [.indexAsString()](#IndexedEvent+indexAsString) ⇒ <code>string</code>
    * [.timerangeAsUTCString()](#IndexedEvent+timerangeAsUTCString) ⇒ <code>string</code>
    * [.timerangeAsLocalString()](#IndexedEvent+timerangeAsLocalString) ⇒ <code>string</code>
    * [.timerange()](#IndexedEvent+timerange) ⇒ <code>TimeRange</code>
    * [.begin()](#IndexedEvent+begin) ⇒ <code>Data</code>
    * [.end()](#IndexedEvent+end) ⇒ <code>Data</code>
    * [.timestamp()](#IndexedEvent+timestamp) ⇒ <code>Data</code>
    * [.get()](#IndexedEvent+get)

<a name="new_IndexedEvent_new"></a>

### new IndexedEvent()
The creation of an IndexedEvent is done by combining two parts:
the Index and the data.

To construct you specify an Index, along with the data.

The index may be an Index, or a string.

To specify the data you can supply either:
    - a Javascript object containing key values pairs
    - an Immutable.Map, or
    - a simple type such as an integer. In the case of the simple type
      this is a shorthand for supplying {"value": v}.

<a name="IndexedEvent+toPoint"></a>

### indexedEvent.toPoint()
Returns a flat array starting with the timestamp, followed by the values.

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
<a name="IndexedEvent+index"></a>

### indexedEvent.index() ⇒ <code>Index</code>
Returns the Index associated with the data in this Event

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>Index</code> - The Index  
<a name="IndexedEvent+setData"></a>

### indexedEvent.setData()
Sets the data of the event and returns a new IndexedEvent.

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
<a name="IndexedEvent+data"></a>

### indexedEvent.data() ⇒ <code>Immutable.Map</code>
Access the event data

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>Immutable.Map</code> - Data for the Event  
<a name="IndexedEvent+indexAsString"></a>

### indexedEvent.indexAsString() ⇒ <code>string</code>
Returns the Index as a string, same as event.index().toString()

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>string</code> - The Index  
<a name="IndexedEvent+timerangeAsUTCString"></a>

### indexedEvent.timerangeAsUTCString() ⇒ <code>string</code>
The TimeRange of this data, in UTC, as a string.

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>string</code> - TimeRange of this data.  
<a name="IndexedEvent+timerangeAsLocalString"></a>

### indexedEvent.timerangeAsLocalString() ⇒ <code>string</code>
The TimeRange of this data, in Local time, as a string.

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>string</code> - TimeRange of this data.  
<a name="IndexedEvent+timerange"></a>

### indexedEvent.timerange() ⇒ <code>TimeRange</code>
The TimeRange of this data

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>TimeRange</code> - TimeRange of this data.  
<a name="IndexedEvent+begin"></a>

### indexedEvent.begin() ⇒ <code>Data</code>
The begin time of this Event

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>Data</code> - Begin time  
<a name="IndexedEvent+end"></a>

### indexedEvent.end() ⇒ <code>Data</code>
The end time of this Event

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>Data</code> - End time  
<a name="IndexedEvent+timestamp"></a>

### indexedEvent.timestamp() ⇒ <code>Data</code>
Alias for the begin() time.

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
**Returns**: <code>Data</code> - Time representing this Event  
<a name="IndexedEvent+get"></a>

### indexedEvent.get()
Get specific data out of the Event. The data will be converted
to a js object. You can use a fieldSpec to address deep data.
A fieldSpec could be "a.b"

**Kind**: instance method of <code>[IndexedEvent](#IndexedEvent)</code>  
