## Collection

---

A collection is an abstraction for a bag of Events.

You typically construct a Collection from a list of Events, which
may be either within an Immutable.List or an Array. You can also
copy another Collection or create an empty one.

You can mutate a collection in a number of ways. In each instance
a new Collection will be returned.

Basic operations on the list of events are also possible. You
can iterate over the collection with a for..of loop, get the size()
of the collection and access a specific element with at().

You can also perform aggregations of the events, map them, filter them
clean them, etc.

Collections form the backing structure for a TimeSeries, as well as
in Pipeline event processing. They are an instance of a BoundedIn, so
they can be used as a pipeline source.

**Kind**: global class  
## API Reference


* [Collection](#Collection)
    * [new Collection(arg1, [copyEvents])](#new_Collection_new)
    * _instance_
        * [.toJSON()](#Collection+toJSON) ⇒ <code>Object</code>
        * [.toString()](#Collection+toString) ⇒ <code>string</code>
        * [.type()](#Collection+type) ⇒ <code>Event</code> &#124; <code>IndexedEvent</code> &#124; <code>TimeRangeEvent</code>
        * [.size()](#Collection+size) ⇒ <code>number</code>
        * [.sizeValid()](#Collection+sizeValid) ⇒ <code>number</code>
        * [.at(pos)](#Collection+at) ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
        * [.atTime(time)](#Collection+atTime) ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
        * [.atFirst()](#Collection+atFirst) ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
        * [.atLast()](#Collection+atLast) ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
        * [.bisect(t, b)](#Collection+bisect) ⇒ <code>number</code>
        * [.events()](#Collection+events)
        * [.eventList()](#Collection+eventList) ⇒ <code>Immutable.List</code>
        * [.eventListAsArray()](#Collection+eventListAsArray) ⇒ <code>Array</code>
        * [.range()](#Collection+range) ⇒ <code>TimeRange</code>
        * [.addEvent(event)](#Collection+addEvent) ⇒ <code>[Collection](#Collection)</code>
        * [.slice(begin, end)](#Collection+slice) ⇒ <code>[Collection](#Collection)</code>
        * [.filter(func)](#Collection+filter) ⇒ <code>[Collection](#Collection)</code>
        * [.map(func)](#Collection+map) ⇒ <code>[Collection](#Collection)</code>
        * [.clean(fieldSpec)](#Collection+clean) ⇒ <code>[Collection](#Collection)</code>
        * [.count()](#Collection+count) ⇒ <code>number</code>
        * [.first(fieldSpec)](#Collection+first) ⇒ <code>number</code>
        * [.last(fieldSpec)](#Collection+last) ⇒ <code>number</code>
        * [.sum(fieldSpec)](#Collection+sum) ⇒ <code>number</code>
        * [.avg(fieldSpec)](#Collection+avg) ⇒ <code>number</code>
        * [.max(fieldSpec)](#Collection+max) ⇒ <code>number</code>
        * [.min(fieldSpec)](#Collection+min) ⇒ <code>number</code>
        * [.mean(fieldSpec)](#Collection+mean) ⇒ <code>number</code>
        * [.median(fieldSpec)](#Collection+median) ⇒ <code>number</code>
        * [.stdev(fieldSpec)](#Collection+stdev) ⇒ <code>number</code>
        * [.aggregate(func, fieldSpec)](#Collection+aggregate) ⇒ <code>number</code>
    * _static_
        * [.equal(collection1, collection2)](#Collection.equal) ⇒ <code>bool</code>
        * [.is(collection1, collection2)](#Collection.is) ⇒ <code>bool</code>

<a name="new_Collection_new"></a>

### new Collection(arg1, [copyEvents])
Construct a new Collection.

**Params**

- arg1 <code>[Collection](#Collection)</code> | <code>array</code> | <code>Immutable.List</code> - Initial data for
the collection. If arg1 is another Collection, this will act as
a copy constructor.
- [copyEvents] <code>Boolean</code> <code> = true</code> - When using a the copy constructor
this specified whether or not to also copy all the events in this
collection. Generally you'll want to let it copy the events.

<a name="Collection+toJSON"></a>

### collection.toJSON() ⇒ <code>Object</code>
Returns the Collection as a regular JSON object.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>Object</code> - The JSON representation of this Collection  
<a name="Collection+toString"></a>

### collection.toString() ⇒ <code>string</code>
Serialize out the Collection as a string. This will be the
string representation of `toJSON()`.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>string</code> - The Collection serialized as a string.  
<a name="Collection+type"></a>

### collection.type() ⇒ <code>Event</code> &#124; <code>IndexedEvent</code> &#124; <code>TimeRangeEvent</code>
Returns the Event object type in this Collection.

Since Collections may only have one type of event (`Event`, `IndexedEvent`
or `TimeRangeEvent`) this will return that type. If no events
have been added to the Collection it will return `undefined`.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>Event</code> &#124; <code>IndexedEvent</code> &#124; <code>TimeRangeEvent</code> - - The class of the type
                                              of events contained in
                                              this Collection.  
<a name="Collection+size"></a>

### collection.size() ⇒ <code>number</code>
Returns the number of events in this collection

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - Count of events  
<a name="Collection+sizeValid"></a>

### collection.sizeValid() ⇒ <code>number</code>
Returns the number of valid items in this collection.

Uses the fieldSpec to look up values in all events.
It then counts the number that are considered valid, which
specifically are not NaN, undefined or null.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - Count of valid events  
<a name="Collection+at"></a>

### collection.at(pos) ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
Returns an event in the Collection by its position.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code> - Returns the
event at the pos specified.  
**Params**

- pos <code>number</code> - The position of the event

**Example**  
```
for (let row=0; row < series.size(); row++) {
  const event = series.at(row);
  console.log(event.toString());
}
```
<a name="Collection+atTime"></a>

### collection.atTime(time) ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
Returns an event in the Collection by its time. This is the same
as calling `bisect` first and then using `at` with the index.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Params**

- time <code>Date</code> - The time of the event.

<a name="Collection+atFirst"></a>

### collection.atFirst() ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
Returns the first event in the Collection.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+atLast"></a>

### collection.atLast() ⇒ <code>Event</code> &#124; <code>TimeRangeEvent</code> &#124; <code>IndexedEvent</code>
Returns the last event in the Collection.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+bisect"></a>

### collection.bisect(t, b) ⇒ <code>number</code>
Returns the index that bisects the Collection at the time specified.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The row number that is the greatest, but still below t.  
**Params**

- t <code>Data</code> - The time to bisect the Collection with
- b <code>number</code> - The position to begin searching at

<a name="Collection+events"></a>

### collection.events()
Generator to return all the events in the collection.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Example**  
```
for (let event of series.events()) {
    console.log(event.toString());
}
```
<a name="Collection+eventList"></a>

### collection.eventList() ⇒ <code>Immutable.List</code>
Returns the raw Immutable event list

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>Immutable.List</code> - All events as an Immutable List.  
<a name="Collection+eventListAsArray"></a>

### collection.eventListAsArray() ⇒ <code>Array</code>
Returns a Javascript array representation of the event list

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>Array</code> - All events as a Javascript Array.  
<a name="Collection+range"></a>

### collection.range() ⇒ <code>TimeRange</code>
From the range of times, or Indexes within the TimeSeries, return
the extents of the TimeSeries as a TimeRange. This is currently implemented
by walking the events.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>TimeRange</code> - The extents of the TimeSeries  
<a name="Collection+addEvent"></a>

### collection.addEvent(event) ⇒ <code>[Collection](#Collection)</code>
Adds an event to the collection, returns a new Collection. The event added
can be an Event, TimeRangeEvent or IndexedEvent, but it must be of the
same type as other events within the Collection.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>[Collection](#Collection)</code> - A new, modified, Collection containing the new event.  
**Params**

- event <code>Event</code> | <code>TimeRangeEvent</code> | <code>IndexedEvent</code> - The event being added.

<a name="Collection+slice"></a>

### collection.slice(begin, end) ⇒ <code>[Collection](#Collection)</code>
Perform a slice of events within the Collection, returns a new
Collection representing a portion of this TimeSeries from begin up to
but not including end.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>[Collection](#Collection)</code> - The new, sliced, Collection.  
**Params**

- begin <code>Number</code> - The position to begin slicing
- end <code>Number</code> - The position to end slicing

<a name="Collection+filter"></a>

### collection.filter(func) ⇒ <code>[Collection](#Collection)</code>
Filter the collection's event list with the supplied function

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>[Collection](#Collection)</code> - A new, filtered, Collection.  
**Params**

- func <code>function</code> - The filter function, that should return
                       true or false when passed in an event.

<a name="Collection+map"></a>

### collection.map(func) ⇒ <code>[Collection](#Collection)</code>
Map the collection's event list to a new event list with
the supplied function.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>[Collection](#Collection)</code> - A new, modified, Collection.  
**Params**

- func <code>function</code> - The mapping function, that should return
a new event when passed in the old event.

<a name="Collection+clean"></a>

### collection.clean(fieldSpec) ⇒ <code>[Collection](#Collection)</code>
Returns a new Collection by testing the fieldSpec
values for being valid (not NaN, null or undefined).

The resulting Collection will be clean (for that fieldSpec).

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>[Collection](#Collection)</code> - A new, modified, Collection.  
**Params**

- fieldSpec <code>string</code> <code> = &quot;value&quot;</code> - The field to test

<a name="Collection+count"></a>

### collection.count() ⇒ <code>number</code>
Returns the number of events in this collection

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The number of events  
<a name="Collection+first"></a>

### collection.first(fieldSpec) ⇒ <code>number</code>
Returns the first value in the Collection for the fieldspec

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The first value  
**Params**

- fieldSpec <code>string</code> <code> = &quot;value&quot;</code> - The field to fetch

<a name="Collection+last"></a>

### collection.last(fieldSpec) ⇒ <code>number</code>
Returns the last value in the Collection for the fieldspec

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The last value  
**Params**

- fieldSpec <code>string</code> <code> = &quot;value&quot;</code> - The field to fetch

<a name="Collection+sum"></a>

### collection.sum(fieldSpec) ⇒ <code>number</code>
Returns the sum Collection for the fieldspec

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The sum  
**Params**

- fieldSpec <code>string</code> <code> = &quot;value&quot;</code> - The field to sum over the collection

<a name="Collection+avg"></a>

### collection.avg(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their average

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The average  
**Params**

- fieldSpec <code>String</code> <code> = value</code> - The field to average over the collection

<a name="Collection+max"></a>

### collection.max(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their maximum value

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The max value for the field  
**Params**

- fieldSpec <code>String</code> <code> = value</code> - The field to find the max within the collection

<a name="Collection+min"></a>

### collection.min(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their minimum value

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The min value for the field  
**Params**

- fieldSpec <code>String</code> <code> = value</code> - The field to find the min within the collection

<a name="Collection+mean"></a>

### collection.mean(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their mean (same as avg)

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The mean  
**Params**

- fieldSpec <code>String</code> <code> = value</code> - The field to find the mean of within the collection

<a name="Collection+median"></a>

### collection.median(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their medium value

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The resulting median value  
**Params**

- fieldSpec <code>String</code> <code> = value</code> - The field to aggregate over

<a name="Collection+stdev"></a>

### collection.stdev(fieldSpec) ⇒ <code>number</code>
Aggregates the events down to their stdev

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The resulting stdev value  
**Params**

- fieldSpec <code>String</code> <code> = value</code> - The field to aggregate over

<a name="Collection+aggregate"></a>

### collection.aggregate(func, fieldSpec) ⇒ <code>number</code>
Aggregates the events down using a user defined function to
do the reduction.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>number</code> - The resulting value  
**Params**

- func <code>function</code> - User defined reduction function. Will be
                           passed a list of values. Should return a
                           singe value.
- fieldSpec <code>String</code> <code> = value</code> - The field to aggregate over

<a name="Collection.equal"></a>

### Collection.equal(collection1, collection2) ⇒ <code>bool</code>
Static function to compare two collections to each other. If the collections
are of the same instance as each other then equals will return true.

**Kind**: static method of <code>[Collection](#Collection)</code>  
**Returns**: <code>bool</code> - result  
**Params**

- collection1 <code>[Collection](#Collection)</code>
- collection2 <code>[Collection](#Collection)</code>

<a name="Collection.is"></a>

### Collection.is(collection1, collection2) ⇒ <code>bool</code>
Static function to compare two collections to each other. If the collections
are of the same value as each other then equals will return true.

**Kind**: static method of <code>[Collection](#Collection)</code>  
**Returns**: <code>bool</code> - result  
**Params**

- collection1 <code>[Collection](#Collection)</code>
- collection2 <code>[Collection](#Collection)</code>

