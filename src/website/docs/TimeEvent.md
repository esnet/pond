<a name="TimeEvent"></a>

## TimeEvent
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

* [TimeEvent](#TimeEvent)
    * [new TimeEvent()](#new_TimeEvent_new)
    * _instance_
        * [.key()](#TimeEvent+key)
        * [.toJSON()](#TimeEvent+toJSON) ⇒ <code>Object</code>
        * [.toPoint()](#TimeEvent+toPoint)
        * [.timestampAsUTCString()](#TimeEvent+timestampAsUTCString)
        * [.timestampAsLocalString()](#TimeEvent+timestampAsLocalString)
        * [.timestamp()](#TimeEvent+timestamp)
        * [.begin()](#TimeEvent+begin)
        * [.end()](#TimeEvent+end)
        * [.stringify()](#TimeEvent+stringify) ⇒ <code>string</code>
    * _static_
        * [.keySchema()](#TimeEvent.keySchema)

<a name="new_TimeEvent_new"></a>

### new TimeEvent()
The creation of an TimeEvent is done by combining two parts:
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

<a name="TimeEvent+key"></a>

### timeEvent.key()
Returns the timestamp (as ms since the epoch)

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
<a name="TimeEvent+toJSON"></a>

### timeEvent.toJSON() ⇒ <code>Object</code>
Returns the Event as a JSON object, essentially:
 {time: t, data: {key: value, ...}}

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
**Returns**: <code>Object</code> - The event as JSON.  
<a name="TimeEvent+toPoint"></a>

### timeEvent.toPoint()
Returns a flat array starting with the timestamp, followed by the values.

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
<a name="TimeEvent+timestampAsUTCString"></a>

### timeEvent.timestampAsUTCString()
The timestamp of this data, in UTC time, as a string.

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
<a name="TimeEvent+timestampAsLocalString"></a>

### timeEvent.timestampAsLocalString()
The timestamp of this data, in Local time, as a string.

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
<a name="TimeEvent+timestamp"></a>

### timeEvent.timestamp()
The timestamp of this data

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
<a name="TimeEvent+begin"></a>

### timeEvent.begin()
The begin time of this Event, which will be just the timestamp

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
<a name="TimeEvent+end"></a>

### timeEvent.end()
The end time of this Event, which will be just the timestamp

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
<a name="TimeEvent+stringify"></a>

### timeEvent.stringify() ⇒ <code>string</code>
Turn the Collection data into a string

**Kind**: instance method of <code>[TimeEvent](#TimeEvent)</code>  
**Returns**: <code>string</code> - The collection as a string  
<a name="TimeEvent.keySchema"></a>

### TimeEvent.keySchema()
For Avro serialization, this defines the event's key (the timestamp)
as a simple a long (logicalType of timestamp milliseconds)

**Kind**: static method of <code>[TimeEvent](#TimeEvent)</code>  
