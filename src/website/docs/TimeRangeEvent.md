<a name="TimeRangeEvent"></a>

## TimeRangeEvent
A `TimeRangeEvent` uses a `TimeRange` to specify the range over
which the event occurs and maps that to a data object representing
some measurements or metrics during that time range.

You supply the timerange as a `TimeRange` object.

The data is also specified during construction and maybe either:
 1) a Javascript object or simple type
 2) an Immutable.Map.
 3) Simple measurement

If an Javascript object is provided it will be stored internally as an
Immutable Map. If the data provided is some other simple type (such as an
integer) then it will be equivalent to supplying an object of {value: data}.
Data may also be undefined.

```
const e = new TimeRangeEvent(timerange, data);
```

To get the data out of an TimeRangeEvent instance use `data()`.
It will return an Immutable.Map. Alternatively you can call `toJSON()`
to return a Javascript object representation of the data, while
`toString()` will serialize the entire event to a string.

**Example:**

Given some source of data that looks like this:

```json
const event = {
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
let b = new Date(event.start_time);
let e = new Date(event.end_time);
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

**Kind**: global class  

* [TimeRangeEvent](#TimeRangeEvent)
    * [new TimeRangeEvent()](#new_TimeRangeEvent_new)
    * _instance_
        * [.key()](#TimeRangeEvent+key)
        * [.toJSON()](#TimeRangeEvent+toJSON)
        * [.toPoint()](#TimeRangeEvent+toPoint)
        * [.timerange()](#TimeRangeEvent+timerange) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.timerangeAsUTCString()](#TimeRangeEvent+timerangeAsUTCString) ⇒ <code>string</code>
        * [.timerangeAsLocalString()](#TimeRangeEvent+timerangeAsLocalString) ⇒ <code>string</code>
        * [.begin()](#TimeRangeEvent+begin) ⇒ <code>Data</code>
        * [.end()](#TimeRangeEvent+end) ⇒ <code>Data</code>
        * [.timestamp()](#TimeRangeEvent+timestamp) ⇒ <code>Data</code>
        * [.humanizeDuration()](#TimeRangeEvent+humanizeDuration)
    * _static_
        * [.keySchema()](#TimeRangeEvent.keySchema)

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

<a name="TimeRangeEvent+key"></a>

### timeRangeEvent.key()
Returns the timerange as a string

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
<a name="TimeRangeEvent+toJSON"></a>

### timeRangeEvent.toJSON()
Returns the TimeRangeEvent as a JSON object, converting all
Immutable structures in the process.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
<a name="TimeRangeEvent+toPoint"></a>

### timeRangeEvent.toPoint()
Returns a flat array starting with the timestamp, followed by the values.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
<a name="TimeRangeEvent+timerange"></a>

### timeRangeEvent.timerange() ⇒ <code>[TimeRange](#TimeRange)</code>
The timerange of this data as a `TimeRange` object

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>[TimeRange](#TimeRange)</code> - TimeRange of this data.  
<a name="TimeRangeEvent+timerangeAsUTCString"></a>

### timeRangeEvent.timerangeAsUTCString() ⇒ <code>string</code>
The TimeRange of this event, in UTC, as a string.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
**Returns**: <code>string</code> - TimeRange of this data.  
<a name="TimeRangeEvent+timerangeAsLocalString"></a>

### timeRangeEvent.timerangeAsLocalString() ⇒ <code>string</code>
The TimeRange of this event, in Local time, as a string.

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
<a name="TimeRangeEvent+humanizeDuration"></a>

### timeRangeEvent.humanizeDuration()
A human friendly version of the duration of this event

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
<a name="TimeRangeEvent.keySchema"></a>

### TimeRangeEvent.keySchema()
For Avro serialization, this defines the event's key (the TimeRange in this case)
as an Avro schema (as an array containing the start and end timestamps in this
case)

**Kind**: static method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
