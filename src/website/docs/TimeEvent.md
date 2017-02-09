<a name="TimeEvent"></a>

## TimeEvent
The creation of an TimeEvent is done by combining two parts:
 * the timestamp
 * the data

To specify the data you can supply:
 * a Javascript object of key/values. The object may contained nested data.
 * an Immutable.Map
 * a simple type such as an integer. This is a shorthand for supplying {"value": v}.

Example:

```
const t = new Date("2015-04-22T03:30:00Z");
const event1 = new TimeEvent(t, { a: 5, b: 6 });
```

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
