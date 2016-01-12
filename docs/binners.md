## Binners

A close relative of aggregation are the binners. A binner object can be used to create events that fitted into specific bins. At ESnet this type of aggregation is used to time incoming counter events (i.e. measurements that are always increasing), and calculate 30s bins with the data rate or in other words the derivative.

First we'll make a couple of events as our input:

```javascript
const input = [
    new Event(89000, 100),
    new Event(181000, 200),
];
```

We are going to bin these into 30s buckets. Here there's an event in the 60sec to 90sec bin (at 89 sec), and another event a few buckets away in the 180sec to 210 sec bucket (at 181 sec). We want to get an event for each bucket (which can be calculated). We'll collect those in `result`:

```javascript
let result = {};
```

First we create a new Binner, specifying the derivative as the function, and also defining a callback for each output event.

```javascript
const options = {
    window: "30s",
    operator: difference
};
let binner = new Binner(options, event => {
    const key = event.index().asString();
    result[key] = event;
});
```

The callback adds the output event to the result, keyed by the Index of the event (i.e. the 30 second bin).

Now we can feed it Events. Here we're just adding two of them, but it could be a stream with no ending.

```javascript
input.forEach(event => binner.addEvent(event));
```

The result will be values for 3 buckets between 90sec and 180sec. Those on the outside of these will not have events because not enough information is (yet) available to produce a derivative result:

* "30s-2 -> undefined
* "30s-3 -> ~1.09 units/sec
* "30s-4 -> ~1.09 units/sec
* "30s-5 -> ~1.09 units/sec
* "30s-6 -> undefined

This makes sense, because the value increased from 100 to 200 units in 92 sec, so a bit more than 1 unit per sec.

Like Aggregators the Events being emitted from the Binner can be fed into another Aggregator. For example we could take a raw stream of counters and produce a 30s rate (as we did above), then take those events and feed them into a 5m aggregator to get the 5m average rates and then collect all those together into a 1d collectors to give us 1 days worth or 5m average rates.
