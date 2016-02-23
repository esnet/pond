/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import { Event, TimeRangeEvent, IndexedEvent } from "./event";
import TimeRange from "./range";
import Utils from "./util";
import Index from "./index";

export default class Converter {

    /**
     * `groupBy` may be either:
     *     * A function which takes an event and returns a string as a key
     *     * A string, which corresponds to a column in the event, like "name"
     *     * A list, which corresponds to a list of columns to join together for the key
     * `observer` is the callback that will receive the emitted events
     */
    constructor(options, observer) {
        if (!_.has(options, "type")) {
            throw new Error("Converter: constructor needs 'type' in options");
        }
        if (options.type === Event ||
            options.type === TimeRangeEvent ||
            options.type === IndexedEvent) {
            this._convertTo = options.type;
        } else {
            throw Error("Unable to interpret type argument passed to Converter constructor");
        }
        if (options.type === TimeRangeEvent || options.type === IndexedEvent) {
            if (options.duration && _.isString(options.duration)) {
                this._duration = Utils.windowDuration(options.duration);
                this._durationString = options.duration;
            }
        }
        this._alignment = options.alignment || "center";
        this._observer = observer;
    }

    convertEvent(event) {
        if (this._convertTo === Event) {
            return event;
        } else if (this._convertTo === TimeRangeEvent) {
            const alignment = this._alignment;
            let begin, end;
            switch(alignment) {
                case "front":
                    begin = event.timestamp();
                    end = new Date(+event.timestamp() + this._duration);
                    break;
                case "center":
                    begin = new Date(+event.timestamp() - parseInt(this._duration / 2, 10));
                    end = new Date(+event.timestamp() + parseInt(this._duration / 2, 10));
                    break;
                case "behind":
                    end = event.timestamp();
                    begin = new Date(+event.timestamp() - this._duration);
                    break;
            }
            const timeRange = new TimeRange([begin, end]);
            return new TimeRangeEvent(timeRange, event.data(), event.key());
        } else if (this._convertTo === IndexedEvent) {
            const timestamp = event.timestamp();
            const indexString = Index.getIndexString(this._durationString, timestamp);
            return new IndexedEvent(indexString, event.data(), null, event.key());
        }
    }

    convertTimeRangeEvent(event) {
        if (this._convertTo === TimeRangeEvent) {
            return event;
        }
        if (this._convertTo === Event) {
            const alignment = this._alignment;
            const beginTime = event.begin();
            const endTime = event.end();
            let timestamp;
            switch(alignment) {
                case "lag":
                    timestamp = beginTime;
                    break;
                case "center":
                    timestamp = new Date(parseInt((beginTime.getTime() + endTime.getTime())/2, 10));
                    break;
                case "lead":
                    timestamp = endTime;
                    break;
            }
            return new Event(timestamp, event.data(), event.key());
        }
        if (this._convertTo === IndexedEvent) {
            throw new Error("Cannot convert TimeRangeEvent to an IndexedEvent");
        }
    }
   
    convertIndexedEvent(event) {
        if (this._convertTo === IndexedEvent) {
            return event;
        }
        if (this._convertTo === Event) {
            const alignment = this._alignment;
            const beginTime = event.begin();
            const endTime = event.end();
            let timestamp;
            switch(alignment) {
                case "lag":
                    timestamp = beginTime;
                    break;
                case "center":
                    timestamp = new Date(parseInt((beginTime.getTime() + endTime.getTime())/2, 10));
                    break;
                case "lead":
                    timestamp = endTime;
                    break;
            }
            return new Event(timestamp, event.data(), event.key());
        }
        if (this._convertTo === TimeRangeEvent) {
            return new TimeRangeEvent(event.timerange(), event.data(), event.key());
        }
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */
    addEvent(event, cb) {
        if (this._observer) {
            let out;
            if (event instanceof TimeRangeEvent) {
                out = this.convertTimeRangeEvent(event);
            } else if (event instanceof IndexedEvent) {
                out = this.convertIndexedEvent(event);
            } else if (event instanceof Event) {
                out = this.convertEvent(event);
            }
            this._observer(out);
        }
        if (cb) {
            cb(null);
        }
    }

    onEmit(cb) {
        this._observer = cb;
    }

    done() {
        return;
    }
}
