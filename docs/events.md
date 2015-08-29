## Events

There are three types of events in Pond:

1. *Event* - A generic event which associates a timestamp with some data
2. *TimeRangeEvent* - Assoicates a TimeRange with some data
3. *IndexedEvent* - Assoicates a time range specified as an Index

The creation of an Event is done by combining two parts: the timestamp (or time range) and the data. To specify the timestamp you may use a Javascript Date object, a Moment, or the number of ms since the UNIX epoch.

To specify the data you can supply a Javascript object of key/values, a
Immutable Map, or a simple type such as an integer. In the case of the simple
type this is a shorthand for supplying {"value": v}.
 
Example:

Given some source of data that looks like this:

    {
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

We first extract the begin and end times to build a TimeRange:

    let b = new Date(sampleEvent.start_time);
    let e = new Date(sampleEvent.end_time);
    let timerange = new TimeRange(b, e);

Then we combine the TimeRange and the event itself to create the Event.

    let outageEvent = new TimeRangeEvent(timerange, sampleEvent);

Once we have an event we can get access the time range with:

    event.begin().getTime()   // 1429673400000
    event.end().getTime())    // 1429707600000
    event.humanizeDuration()) // "10 hours"

And we can access the data like so:

    event.get("title")  // "STAR-CR5 - Outage"

Or use:

    event.data()

to fetch the whole data object, which will be an Immutable Map.

