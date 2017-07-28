## Pond data model

This section gives an overview of the different data structures in Pond and how they relate to each other.

### Time

As this is a TimeSeries library, time is fundamental to all parts of the library. We represent `Time` as a type in the Typescript version of the library, but in fact it is a light weight wrapper over the milliseconds since the epoch.

To construct a `Time`, use the `time()` factory function:

```typescript
const now = time(new Date())
```

You can also construct a `Time` in a number of different ways and convert the time to a string in either UTC or local time, or several other convenience methods.

`Time` is a subclass of `Key`, meaning it can be associated with data to form an `Event<Time>`, or basically and event at a particular timestamp.

### TimeRange

Sometimes we also want to express a range of time. For this we use a `TimeRange`. This is simply a begin and end time, but comes with many handy methods for display and comparison.

You can construct `TimeRange`s with `Date` or `moment` objects.

```typescript
const range1 = timerange(ta, tb);
const range2 = timerange(tc, td);
range1.overlaps(range2)
```

`TimeRange` is also a subclass of `Key`, so it can be
associated with data to form an `Event<TimeRange>`. Hence you can express an event that occurs over a period of time (like a network outage).


