/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";

import Processor from "./processor";

import Index from "../index";
import TimeEvent from "../timeevent";
import IndexedEvent from "../indexedevent";
import TimeRange from "../timerange";
import TimeRangeEvent from "../timerangeevent";
import { isPipeline } from "../pipeline";

import Utils from "../base/util";

function isSubclass(Base, X) {
    return Base === X || X.prototype === Base;
}

export default class Converter extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Converter) {
            const other = arg1;
            this._convertTo = other._convertTo;
            this._duration = other._duration;
            this._durationString = other._durationString;
            this._alignment = other._alignment;
        } else if (isPipeline(arg1)) {
            if (!_.has(options, "type")) {
                throw new Error(
                    "Converter: constructor needs 'type' in options"
                );
            }
            if (isSubclass(TimeEvent, options.type)) {
                this._convertTo = options.type;
            } else if (
                isSubclass(TimeRangeEvent, options.type) ||
                    isSubclass(IndexedEvent, options.type)
            ) {
                this._convertTo = options.type;
                if (options.duration && _.isString(options.duration)) {
                    this._duration = Utils.windowDuration(options.duration);
                    this._durationString = options.duration;
                }
            } else {
                throw Error(
                    "Unable to interpret type argument passed to Converter constructor"
                );
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
        const T = this._convertTo;
        if (isSubclass(TimeEvent, T)) {
            return event;
        } else if (isSubclass(TimeRangeEvent, T)) {
            const alignment = this._alignment;
            let begin, end;
            if (!this._duration) {
                throw new Error("Duration expected in converter");
            }
            switch (alignment) {
                case "front":
                    begin = event.timestamp();
                    end = new Date(+event.timestamp() + this._duration);
                    break;
                case "center":
                    begin = new Date(
                        +event.timestamp() - parseInt(this._duration / 2, 10)
                    );
                    end = new Date(
                        +event.timestamp() + parseInt(this._duration / 2, 10)
                    );
                    break;
                case "behind":
                    end = event.timestamp();
                    begin = new Date(+event.timestamp() - this._duration);
                    break;
                default:
                    throw new Error("Unknown alignment of converter");
            }
            const timeRange = new TimeRange([begin, end]);
            return new T(timeRange, event.data());
        } else if (isSubclass(IndexedEvent, T)) {
            const timestamp = event.timestamp();
            const indexString = Index.getIndexString(
                this._durationString,
                timestamp
            );
            return new this._convertTo(indexString, event.data(), null);
        }
    }

    convertTimeRangeEvent(event) {
        const T = this._convertTo;
        if (isSubclass(TimeRangeEvent, T)) {
            return event;
        }
        if (isSubclass(TimeEvent, T)) {
            const alignment = this._alignment;
            const beginTime = event.begin();
            const endTime = event.end();
            let timestamp;
            switch (alignment) {
                case "lag":
                    timestamp = beginTime;
                    break;
                case "center":
                    timestamp = new Date(
                        parseInt(
                            (beginTime.getTime() + endTime.getTime()) / 2,
                            10
                        )
                    );
                    break;
                case "lead":
                    timestamp = endTime;
                    break;
            }
            return new T(timestamp, event.data());
        }
        if (isSubclass(IndexedEvent, T)) {
            throw new Error("Cannot convert TimeRangeEvent to an IndexedEvent");
        }
    }

    convertIndexedEvent(event) {
        const T = this._convertTo;
        if (isSubclass(IndexedEvent, T)) {
            return event;
        }
        if (isSubclass(TimeEvent, T)) {
            const alignment = this._alignment;
            const beginTime = event.begin();
            const endTime = event.end();
            let timestamp;
            switch (alignment) {
                case "lag":
                    timestamp = beginTime;
                    break;
                case "center":
                    timestamp = new Date(
                        parseInt(
                            (beginTime.getTime() + endTime.getTime()) / 2,
                            10
                        )
                    );
                    break;
                case "lead":
                    timestamp = endTime;
                    break;
            }
            return new T(timestamp, event.data());
        }
        if (isSubclass(TimeRangeEvent, T)) {
            return new T(event.timerange(), event.data());
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
            } else if (event instanceof TimeEvent) {
                outputEvent = this.convertEvent(event);
            } else {
                throw new Error("Unknown event type received");
            }
            this.emit(outputEvent);
        }
    }
}
