## Collection

---

## API Reference

A collection is a list of Events. You can construct one out of either
another collection, or a list of Events. You can addEvent() to a collection
and a new collection will be returned.

Basic operations on the list of events are also possible. You
can iterate over the collection with a for..of loop, get the size()
of the collection and access a specific element with at().

**Kind**: global class  

* [Collection](#Collection)
    * [.type()](#Collection+type)
    * [.size()](#Collection+size)
    * [.sizeValid()](#Collection+sizeValid)
    * [.at()](#Collection+at)
    * [.range()](#Collection+range) ⇒ <code>TimeRange</code>
    * [.addEvent()](#Collection+addEvent)
    * [.slice()](#Collection+slice)
    * [.filter()](#Collection+filter)
    * [.map()](#Collection+map)
    * [.clean()](#Collection+clean)
    * [._fieldSpecToArray()](#Collection+_fieldSpecToArray)

<a name="Collection+type"></a>

### collection.type()
Returns the Event object type in this collection

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+size"></a>

### collection.size()
Returns the number of items in this collection

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+sizeValid"></a>

### collection.sizeValid()
Returns the number of valid items in this collection.

Uses the fieldName and optionally a function passed in
to look up values in all events. It then counts the number
that are considered valid, i.e. are not NaN, undefined or null.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+at"></a>

### collection.at()
Returns an item in the collection by its position

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+range"></a>

### collection.range() ⇒ <code>TimeRange</code>
From the range of times, or Indexes within the TimeSeries, return
the extents of the TimeSeries as a TimeRange.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
**Returns**: <code>TimeRange</code> - The extents of the TimeSeries  
<a name="Collection+addEvent"></a>

### collection.addEvent()
Adds an event to the collection, returns a new collection

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+slice"></a>

### collection.slice()
Perform a slice of events within the Collection, returns a new
Collection representing a portion of this TimeSeries from begin up to
but not including end.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+filter"></a>

### collection.filter()
Filter the collection's event list with the supplied function

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+map"></a>

### collection.map()
Map the collection's event list to a new event list with
the supplied function.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+clean"></a>

### collection.clean()
Returns a new Collection by testing the fieldSpec
values for being valid (not NaN, null or undefined).
The resulting Collection will be clean for that fieldSpec.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
<a name="Collection+_fieldSpecToArray"></a>

### collection._fieldSpecToArray()
Internal function to take a fieldSpec and
return it as an array if it isn't already one. Using
arrays in inner loops is faster than splitting
a string repeatedly.

**Kind**: instance method of <code>[Collection](#Collection)</code>  
