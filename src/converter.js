/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Event from "./event";
import TimeRangeEvent from "./timerangeevent";
import IndexedEvent from "./indexedevent";
import TimeRange from "./range";
import Utils from "./util";
import Index from "./index";
import { isPipeline } from "./pipeline";
import Processor from "./processor";

export default class Converter extends Processor {

    constructor(arg1, options, observer) {
        super(arg1, options, observer);

        if (arg1 instanceof Converter) {
            const other = arg1;
            this._convertTo = other._convertTo;
            this._duration = other._duration;
            this._durationString = other._durationString;
            this._alignment = other._alignment;
        } else if (isPipeline(arg1)) {
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

        } else {
            throw new Error("Unknown arg to Converter constructor", arg1);
        }
    }

    clone() {
        return new Converter(this);
    }

    convertEvent(event) {
        if (this._convertTo === Event) {
            return event;
        } else if (this._convertTo === TimeRangeEvent) {
            const alignment = this._alignment;
            let begin, end;
            if (!this._duration) {
                throw new Error("Duration expected in converter");
            }
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
                default:
                    throw new Error("Unknown alignment of converter");
            }
            const timeRange = new TimeRange([begin, end]);
            return new TimeRangeEvent(timeRange, event.data());
        } else if (this._convertTo === IndexedEvent) {
            const timestamp = event.timestamp();
            const indexString = Index.getIndexString(this._durationString, timestamp);
            return new IndexedEvent(indexString, event.data(), null);
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
            return new Event(timestamp, event.data());
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
            return new Event(timestamp, event.data());
        }
        if (this._convertTo === TimeRangeEvent) {
            return new TimeRangeEvent(event.timerange(), event.data());
        }
    }

    /**
     * Output a converted event
     */
    addEvent(event) {
        if (this.hasObservers()) {
            let outputEvent;
            if (event instanceof TimeRangeEvent) {
                outputEvent = this.convertTimeRangeEvent(event);
            } else if (event instanceof IndexedEvent) {
                outputEvent = this.convertIndexedEvent(event);
            } else if (event instanceof Event) {
                outputEvent = this.convertEvent(event);
            } else {
                throw new Error("Unknown event type received");
            }
            this.emit(outputEvent);
        }
    }

}
