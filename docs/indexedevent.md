## IndexedEvent

---

An IndexedEvent uses an Index to specify a timerange over which the event
occurs and maps that to a data object representing some measurement or metric
during that time range.

You can supply the index as a string or as an Index object.

Example Indexes are:
    - 1d-1565 is the entire duration of the 1565th day since the UNIX epoch
    - 2014-03 is the entire duration of march in 2014

The range, as expressed by the Index, is provided by the convenience method
`range()`, which returns a TimeRange instance. Alternatively the begin
and end times represented by the Index can be found with `begin()`
and `end()` respectively.

The data is also specified during construction, and is generally expected to
be an object or an Immutable.Map. If an object is provided it will be stored
internally as an ImmutableMap. If the data provided is some other type then
it will be equivalent to supplying an object of `{value: data}`. Data may be
undefined.

The get the data out of an IndexedEvent instance use `data()`. It will return
an Immutable.Map.

**Kind**: global class  
## API Reference


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
