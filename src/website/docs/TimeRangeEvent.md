<a name="TimeRangeEvent"></a>

## TimeRangeEvent
A TimeRangeEvent uses a TimeRange to specify the range over
which the event occurs and maps that to a data object representing
some measurements or metrics during that time range.

You supply the timerange as a TimeRange object.

The data is also specified during construction and me be either:
 1) a Javascript object or simple type
 2) an Immutable.Map.
 3) Simple measurement

If an Javascript object is provided it will be stored internally as an
Immutable Map. If the data provided is some other simple type (such as an
integer) then it will be equivalent to supplying an object of {value: data}.
Data may also be undefined.

To get the data out of an TimeRangeEvent instance use `data()`.
It will return an Immutable.Map. Alternatively you can call `toJSON()`
to return a Javascript object representation of the data, while
`toString()` will serialize the entire event to a string.

**Kind**: global class  

* [TimeRangeEvent](#TimeRangeEvent)
    * [new TimeRangeEvent()](#new_TimeRangeEvent_new)
    * _instance_
        * [.key()](#TimeRangeEvent+key)
        * [.toPoint()](#TimeRangeEvent+toPoint)
        * [.timerange()](#TimeRangeEvent+timerange) ⇒ <code>[TimeRange](#TimeRange)</code>
        * [.timerangeAsUTCString()](#TimeRangeEvent+timerangeAsUTCString) ⇒ <code>string</code>
        * [.timerangeAsLocalString()](#TimeRangeEvent+timerangeAsLocalString) ⇒ <code>string</code>
        * [.begin()](#TimeRangeEvent+begin) ⇒ <code>Data</code>
        * [.end()](#TimeRangeEvent+end) ⇒ <code>Data</code>
        * [.timestamp()](#TimeRangeEvent+timestamp) ⇒ <code>Data</code>
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
<a name="TimeRangeEvent+toPoint"></a>

### timeRangeEvent.toPoint()
Returns a flat array starting with the timestamp, followed by the values.

**Kind**: instance method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
<a name="TimeRangeEvent+timerange"></a>

### timeRangeEvent.timerange() ⇒ <code>[TimeRange](#TimeRange)</code>
The TimeRange of this data

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
<a name="TimeRangeEvent.keySchema"></a>

### TimeRangeEvent.keySchema()
For Avro serialization, this defines the event's key
(the TimeRange as an array)

**Kind**: static method of <code>[TimeRangeEvent](#TimeRangeEvent)</code>  
