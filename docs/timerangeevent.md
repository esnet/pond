## TimeRangeEvent

---

**Kind**: global class  
## API Reference


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
