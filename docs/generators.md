## Generators

Generators are primarily used internally for aggregation and collection within Pond. It is used to generate buckets, which can then have values added to them before being aggregated or collected together. However, the generator code also has some useful utility functions within it that are useful beyond the Pond internals.

### Generating Index strings

A generator can be used to generate Index strings. These strings uniquely identify a range of time, such as a particular 5 minute block. The combine the duration (such as "5m") and the block number. The blocks which lie within the provided timerange (even only partially) will be returned.

```js
const generator = new Generator("5m");
const timerange = new TimeRange(beginTime, endTime);
const indexList = generator.bucketIndexList(timerange);
// ["5m-4754394", "5m-4754395", ..., "5m-4754405"]
```

### Generating buckets

To use a Generator you instantiate it with a time expessed as a string, such as "5m" for 5 minutes. Other examples: "30s", "1h", "30d". Once setup you repeatedly generate buckets by supplying a time.

```js
const generator = new Generator("5m");
const bucket = generator.bucket(d);
console.log(b.index().asString()) // "5m-4754394"
});
```

You can also get a list of buckets that fall within a date range:

```js
const generator = new Generator("5m");
const timerange = new TimeRange(beginTime, endTime);
const bucketList = generator.bucketList(timerange);
const firstBucket = bucketList[0].index().asString() // "5m-4754394"
const lastBucket = bucketList[bucketList.length - 1].index().asString() // "5m-4754405";
```

