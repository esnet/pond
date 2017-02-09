<a name="Event"></a>

## Event
There are three types of Events in Pond, while this class provides the base class
for them all:

1. *TimeEvent* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

Event contains several static methods that may be useful, though in general
are used by the Collection and TimeSeries classes. So, if you already have a
TimeSeries or Collection you may want to examine the API there to see if you
can do what you want to do.

**Kind**: global class  

* [Event](#Event)
    * _instance_
        * [.toAvro()](#Event+toAvro)
        * [.toString()](#Event+toString)
        * [.type()](#Event+type)
        * [.setData(data)](#Event+setData) ⇒ <code>object</code>
        * [.data()](#Event+data) ⇒ <code>Immutable.Map</code>
        * [.get()](#Event+get)
        * [.value()](#Event+value)
        * [.collapse()](#Event+collapse)
    * _static_
        * [.is(event1, event2)](#Event.is) ⇒ <code>Boolean</code>
        * [.isDuplicate()](#Event.isDuplicate) ⇒ <code>Boolean</code>
        * [.isValidValue(event, The)](#Event.isValidValue)
        * [.selector()](#Event.selector)
        * [.merge(events)](#Event.merge) ⇒ <code>Immutable.List</code> &#124; <code>array</code>
        * [.combine(events, fieldSpec, reducer)](#Event.combine) ⇒ <code>Immutable.List</code> &#124; <code>array</code>
        * [.combiner()](#Event.combiner)
        * [.merger()](#Event.merger)
        * [.map(fieldSpec)](#Event.map)
        * [.reduce(mapped, reducer)](#Event.reduce)

<a name="Event+toAvro"></a>

### event.toAvro()
Express the event as an avro buffer

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+toString"></a>

### event.toString()
Express the event as a string

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+type"></a>

### event.type()
Returns the type of this class instance

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+setData"></a>

### event.setData(data) ⇒ <code>object</code>
Sets the data of the event and returns a new event of the
same type.

**Kind**: instance method of <code>[Event](#Event)</code>  
**Returns**: <code>object</code> - A new event  
**Params**

- data <code>object</code> - New data for the event

<a name="Event+data"></a>

### event.data() ⇒ <code>Immutable.Map</code>
Access the event data in its native form. The result
will be an Immutable.Map.

**Kind**: instance method of <code>[Event](#Event)</code>  
**Returns**: <code>Immutable.Map</code> - Data for the Event  
<a name="Event+get"></a>

### event.get()
Get specific data out of the event. The data will be converted
to a JS Object. You can use a `fieldSpec` to address deep data.
A `fieldSpec` could be "a.b"

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+value"></a>

### event.value()
Alias for `get()`.

**Kind**: instance method of <code>[Event](#Event)</code>  
<a name="Event+collapse"></a>

### event.collapse()
Collapses this event's columns, represented by the fieldSpecList
into a single column. The collapsing itself is done with the reducer
function. Optionally the collapsed column could be appended to the
existing columns, or replace them (the default).

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

<a name="Event.combiner"></a>

### Event.combiner()
Returns a function that will take a list of events and combine them
together using the fieldSpec and reducer function provided. This is
used as an event reducer for merging multiple TimeSeries together
with `timeSeriesListReduce()`.

**Kind**: static method of <code>[Event](#Event)</code>  
<a name="Event.merger"></a>

### Event.merger()
Returns a function that will take a list of events and merge them
together using the fieldSpec provided. This is used as a reducer for
merging multiple TimeSeries together with `timeSeriesListMerge()`.

**Kind**: static method of <code>[Event](#Event)</code>  
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

