## Index

---

An index is simply a string that represents a fixed range of time. There are two basic types:
*Multiplier index* - the number of some unit of time (hours, days etc) since the UNIX epoch.
*Calendar index* - The second represents a calendar range, such as Oct 2014.

For the first type, a multiplier index, an example might be:

```text
    1d-12355      //  30th Oct 2003 (GMT), the 12355th day since the UNIX epoch
```

You can also use seconds (e.g. 30s), minutes (e.g. 5m), hours (e.g. 1h) or days (e.g. 7d).

Here are several examples of a calendar index:

```text
    2003-10-30    // 30th Oct 2003
    2014-09       // Sept 2014
    2015          // All of the year 2015
```

An Index is a nice representation of certain types of time intervals because it can be cached with its string representation as a key. A specific chunk of time, and associated data can be looked up based on that string. It also allows us to represent things like months, which have variable length.

An Index is also useful when collecting into specific time ranges, for example generating all the 5 min ("5m") maximum rollups within a specific day ("1d"). See the processing section within these docs.

**Kind**: global class  
## API Reference


* [Index](#Index)
    * [.toJSON()](#Index+toJSON)
    * [.toString()](#Index+toString)
    * [.toNiceString()](#Index+toNiceString)
    * [.asString()](#Index+asString)
    * [.asTimerange()](#Index+asTimerange)
    * [.begin()](#Index+begin)
    * [.end()](#Index+end)

<a name="Index+toJSON"></a>

### index.toJSON()
Returns the Index as JSON, which will just be its string
representation

**Kind**: instance method of <code>[Index](#Index)</code>  
<a name="Index+toString"></a>

### index.toString()
Simply returns the Index as its string

**Kind**: instance method of <code>[Index](#Index)</code>  
<a name="Index+toNiceString"></a>

### index.toNiceString()
for the calendar range style Indexes, this lets you return
that calendar range as a human readable format, e.g. "June, 2014".
The format specified is a Moment.format.

**Kind**: instance method of <code>[Index](#Index)</code>  
<a name="Index+asString"></a>

### index.asString()
Alias for toString()

**Kind**: instance method of <code>[Index](#Index)</code>  
<a name="Index+asTimerange"></a>

### index.asTimerange()
Returns the Index as a TimeRange

**Kind**: instance method of <code>[Index](#Index)</code>  
<a name="Index+begin"></a>

### index.begin()
Returns the start date of the Index

**Kind**: instance method of <code>[Index](#Index)</code>  
<a name="Index+end"></a>

### index.end()
Returns the end date of the Index

**Kind**: instance method of <code>[Index](#Index)</code>  
