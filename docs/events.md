## Events

There are three types of Events in Pond:

1. *Event* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

### Construction

The creation of an Event is done by combining two parts: the timestamp (or time range, or Index...) and the data.

For a basic `Event`, you specify the timestamp as either a Javascript Date object, a Moment, or the number of ms since the UNIX epoch.

For a `TimeRangeEvent`, you specify a TimeRange, along with the data.

For a `IndexedEvent`, you specify an Index, along with the data, and if the event should be considered to be in UTC time or not.

To specify the data you can supply either a Javascript object of key/values, a
Immutable.Map, or a simple type such as an integer. In the case of the simple
type this is a shorthand for supplying {"value": v}.
 
Example:

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

### Query

* `toJSON()` - Returns a JSON representation of the Event
* `toString()` - Returns a string representation of the Event, useful for serialization
* `timestampAsUTCString()` - Returns the timestamp of the Event in UTC time.
* `timestampAsLocalString()` - Returns the timestamp of the Event in Local time.
* `timestamp()` - Returns the timestamp of the Event as a Date.
* `data()` - Returns the internal data of the event, as an Immutable.Map.
* `get(key)` - Returns the value for a specific key within the Event data. If no key is specified then 'value' is used for the key.
