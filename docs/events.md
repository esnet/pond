## Events

There are three types of Events in Pond:

1. *Event* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

### Construction

The creation of an Event is done by combining two parts: the timestamp (or time range, or Index...) and the data, along with an optional key which is described below.

 * For a basic `Event`, you specify the timestamp as either a Javascript Date object, a Moment, or the number of milliseconds since the UNIX epoch.

 * For a `TimeRangeEvent`, you specify a TimeRange, along with the data.

 * For a `IndexedEvent`, you specify an Index, along with the data, and if the event should be considered to be in UTC time or not.

To specify the data you can supply:

 * a Javascript object of key/values. The object may contained nested data.

 * an Immutable.Map

 * a simple type such as an integer. This is a shorthand for supplying {"value": v}.

**Example:**

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

## Keys

Events may contain keys which are used to provide partition groupings when doing aggregations or collections. You can provide the key at construction by adding the key as the last argument. For example "cpu_usage" below:

```js
const timestamp = new Date("2015-04-22T03:30:00Z");
const event = new Event(timestamp, {name: "machine_A123", memory_usage: 9.34}, "A123");
console.log(event.key()) // "A123"
```

See groupers for more information.

You can also change the key of an Event with `setKey()`. Rather than causing a mutation to the existing event, this will generate a new Event (though it will efficiently share the same timestamp and data).

---

### Query API

#### toJSON()

Returns a JSON representation of the Event

#### toString()

Returns a string representation of the Event, useful for serialization

#### timestampAsUTCString()

Returns the timestamp of the Event in UTC time.

#### timestampAsLocalString()

Returns the timestamp of the Event in Local time.

#### timestamp()

Returns the timestamp of the Event as a Date.

#### data()

Returns the internal data of the event, as an Immutable.Map.

#### get(column)

Returns the value for a specific column within the Event data. If no column is specified then 'value' is used for the column. If the value is a complex type, such as a Map, then the value will be copied to a Javascript object and then returned.

```javascript
const event = new Event(timestamp, {
    a: {in: 123, out: 456},
    b: {in: 654, out: 223}
});

event.get("a") // {in: 123, out: 456};
event.get("b") // {in: 654, out: 223};
```
---

### Mutation API

#### setKey(key)

Sets a key on the Event, returning a new Event. Immutable data within the Event will be shared between the two events.

```javascript
const event = new Event(t, {a: 5, b: 6, c: 7});
const eventWithKey = event.setKey("A123");  // original event is unchanged

console.log(event.key())       // ""
console.log(eventWithKey.key()) // "A123"
console.log(event === eventWithKey); // false
console.log(event._d === eventWithKey._d); // false
console.log(event.data() === eventWithKey.data()); // true
```


#### Event.merge([event1, event2, ...]) [Static]

Creates a new Event from an array of other events. This only works under the following conditions:

 * All Events are of the same type (i.e. all `Events`, all `TimeRangeEvents` or all `IndexedEvents`).
 * The fields within the data of each event need to be orthogonal from each other, in that event1 might have an "a" and "b" field, then event2 should not have an "a" or "b" field but might instead have a "c" field.
 * The time (or `Index`, or `TimeRange`) of each event must be the same.

In this case the merge would create a new event with both a "a", "b" and "c" field. Example:

```javascript
const event1 = new IndexedEvent("1h-396206", {a: 5, b: 6});
const event2 = new IndexedEvent("1h-396206", {c: 2});
const merged = Event.merge([event1, event2]);
```

Result:
```
"1h-396206" -> {a:5, b:6, c:2}
```

Note: you can merge `TimeSeries` too, which internally uses this merge function to perform a merge across the whole series.
