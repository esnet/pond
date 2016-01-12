## Aggregators

Say you have an incoming stream of Events and you want to aggregate them together. Pond can help with that. Here's an example. Lets create some events on 2/14/2015 that cross over the hour: 7:57am, 7:58am, 7:59am, 8:00am and 8:01am. The values for these events are [3, 9, 6, 4, 5]:

```js
var events = [];
events.push(new Event(new Date(2015, 2, 14, 7, 57, 0), 3));
events.push(new Event(new Date(2015, 2, 14, 7, 58, 0), 9));
events.push(new Event(new Date(2015, 2, 14, 7, 59, 0), 6));
events.push(new Event(new Date(2015, 2, 14, 8,  0, 0), 4));
events.push(new Event(new Date(2015, 2, 14, 8,  1, 0), 5));
```

Now lets find the avg value in each of the hours. To do this we setup an Aggregator that is indexed on the hour ("1h") and will use an average function "avg", like this:

```js
import {Aggregator, Functions} from "pondjs";
const {avg} = Functions;

const options = {window: "1h", operator: avg};
const hourlyAverage = new Aggregator(options, (index, event) => {
    outputEvents[`${index}`] = event;
});
```

In addition, we add a callback to collect the hourlyAverage events emitted. Here we collect the result but of course we could pass it on to another aggregator or collector.

Now that our aggregator is setup we can add events as long as we want:

```js
events.forEach(event => { hourlyAverage.addEvent(event); });
```

Knowing when to be done with a bucket that we're aggregating into depends on the situation. If this is a continuous stream of events then the code currenly considers that it is done with a bucket when an event comes in that fits into another bucket. In this example the first event will create the first bucket (7am-8am). Then next two events also fit into this bucket. The 4th event is in the following hour so the old bucket is aggregated based on the aggregation function and an event is emitted with that aggregated value. A new bucket is then created (8am-9am) for the 4th event. The 5th event goes into that same bucket.

In this case we want to flush the bucket after the 5th event, so we call:

```js
hourlyAverage.done();
```

This will force an event to be emitted. After this our `outputEvents` object will contain two entries:

```js
outputEvents["1h-396206"].get();   // 6
outputEvents["1h-396207"].get();   // 4.5
```

Events may also be more complex, with entries like this:

```js
var event = new Event(now, {"cpu1": 23.4, "cpu2": 55.1})
```

Aggregation events will keep the same structure.
