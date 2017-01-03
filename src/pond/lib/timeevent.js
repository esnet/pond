/*
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";
import Event from "./event";
import util from "./base/util";

/**
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
*/
class TimeEvent extends Event {

    /**
     * The creation of an TimeEvent is done by combining two parts:
     * the timestamp and the data.
     *
     * To construct you specify the timestamp as either:
     *     - Javascript Date object
     *     - a Moment, or
     *     - millisecond timestamp: the number of ms since the UNIX epoch
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    constructor(arg1, arg2) {
        super();
        
        if (arg1 instanceof TimeEvent) {
            const other = arg1;
            this._d = other._d;
            return;
        } else if (arg1 instanceof Buffer) {
            let avroData;
            try {
                avroData = this.schema().fromBuffer(arg1);
            } catch (err) {
                console.error("Unable to convert supplied avro buffer to event");
            }
            this._d = new Immutable.Map();
            this._d = this._d.set("time", new Date(avroData.time));
            this._d = this._d.set("data", new Immutable.Map(avroData.data));
            return;
        } else if (arg1 instanceof Immutable.Map &&
            arg1.has("time") && arg1.has("data")) {
            this._d = arg1;
            return;
        }
        const time = util.timestampFromArg(arg1);
        const data = util.dataFromArg(arg2);
        this._d = new Immutable.Map({time, data});
    }

    /**
     * Returns the timestamp (as ms since the epoch)
     */
    key() {
        return this.timestamp().getTime();
    }

    /**
     * For Avro serialization, this defines the event's key (the timestamp)
     * as a simple a long (logicalType of timestamp milliseconds)
     */
    static keySchema() {
        return {
            name: "time",
            type: {
                type: "long",
                logicalType: "timestamp-millis"
            }
        };
    }

    /**
     * Returns the Event as a JSON object, essentially:
     *  {time: t, data: {key: value, ...}}
     * @return {Object} The event as JSON.
     */
    toJSON() {
        return {
            time: this.timestamp().getTime(),
            data: this.data().toJSON()
        };
    }

    /**
     * Returns a flat array starting with the timestamp, followed by the values.
     */
    toPoint() {
        return [this.timestamp().getTime(), ..._.values(this.data().toJSON())];
    }

    /**
     * The timestamp of this data, in UTC time, as a string.
     */
    timestampAsUTCString() {
        return this.timestamp().toUTCString();
    }

    /**
     * The timestamp of this data, in Local time, as a string.
     */
    timestampAsLocalString() {
        return this.timestamp().toString();
    }

    /**
     * The timestamp of this data
     */
    timestamp() {
        return this._d.get("time");
    }

    /**
     * The begin time of this Event, which will be just the timestamp
     */
    begin() {
        return this.timestamp();
    }

    /**
     * The end time of this Event, which will be just the timestamp
     */
    end() {
        return this.timestamp();
    }

    /**
     * Turn the Collection data into a string
     * @return {string} The collection as a string
     */
    stringify() {
        return JSON.stringify(this.data());
    }
}

export default TimeEvent;
