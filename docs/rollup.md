## Rollup example

In this React example we have an incoming stream of measurements, represented by the blue dots. Our task is to produce a new set of outputs that are 5 min and 1 hour rollups of the incoming stream. We then visualize those rollups as green blocks.

### Events

To do this, each event is generated semi-randomly, but they could be coming from a real source. We add a new Event for each minute, but do 5 times a second to speed up the simulation. Essentially we do this:

```js
const value = getRandomValue();
const time = getNextTime();
const event = new Event(t, value);
```

Now we want to do some things with that Event:
* Store it, so we can show the scatter plot
* Aggregate it to give us our 5 min and 1 hour rollups

To store it, we put it into a circle buffer that keeps the last n Events. Otherwise we'll eventually kill the browser. The circle buffer is placed in the React component's state.

### Aggregation

For the more interesting part, the aggregation, we need to setup up a couple of Pond Aggregators to do the work. Here's the 5 min aggregator that we setup:

```js
const options = {window: "5m", operator: avg};
this.fiveMinuteAggregator = new Aggregator(options, (index, event) => {
    // Store the resulting event in state
});
```

Each time a new 5 min event is emitted we take that from the callback and place it into the component's state.

The aggregator needs a feed of events to process so as we create each raw event we feed it to the aggregators, for example for the 5 min aggregator:

```js
this.fiveMinuteAggregator.addEvent(event);
```

### Visualization

Pond was largely written to feed data to our visualization libraries. In this case we bring in the react-timeseries-charts code to draw our visualization of the rollup code above.

Firstly, given that we have three Event lists in our React component state, we want to turn those into a TimeSeries which can then be passed to our charting code.

```js
// Create a TimeSeries for our raw, 5min and hourly events
const eventSeries = new TimeSeries({
    name: "raw", events: this.state.events.toArray()
});
const fiveMinuteSeries = new TimeSeries({
    name: "five minute avg", events: this.state.fiveMinuteAvg.toArray()
});
const hourlySeries =
    new TimeSeries({name: "hourly", events: this.state.hourlyAvg.toArray()
});
```

Next we figure out the begin and end times for the chart. The chart expands outward until it gets to 3 hours and then pans with the new data. Once we calculate the beginTime and endTime we make a TimeRange to represent this range:

```js
const timeRange = new TimeRange(beginTime, endTime);
```

Finally we render() the chart:

```xml
<ChartContainer timeRange={timeRange}>
    <ChartRow height="150">
        <YAxis id="y" label="Value" min={0} max={1500} width="70" type="linear"/>
        <Charts>
            <BarChart axis="y" series={fiveMinuteSeries} columns={["value"]} />
            <BarChart axis="y" series={hourlySeries} columns={["value"]} />
            <ScatterChart axis="y" series={eventSeries}/>
        </Charts>
    </ChartRow>
</ChartContainer>
```

