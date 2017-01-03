/*
 *  Copyright (c) 2016, The Regents of the University of California,
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
import TimeRange from "./timerange";
import util from "./base/util";

/**
 * A TimeRangeEvent uses a TimeRange to specify the range over
 * which the event occurs and maps that to a data object representing
 * some measurements or metrics during that time range.
 *
 * You supply the timerange as a TimeRange object.
 *
 * The data is also specified during construction and me be either:
 *  1) a Javascript object or simple type
 *  2) an Immutable.Map.
 *  3) Simple measurement
 *
 * If an Javascript object is provided it will be stored internally as an
 * Immutable Map. If the data provided is some other simple type (such as an
 * integer) then it will be equivalent to supplying an object of {value: data}.
 * Data may also be undefined.
 *
 * To get the data out of an TimeRangeEvent instance use `data()`.
 * It will return an Immutable.Map. Alternatively you can call `toJSON()`
 * to return a Javascript object representation of the data, while
 * `toString()` will serialize the entire event to a string.
 */
class TimeRangeEvent extends Event {

    /**
     * The creation of an TimeRangeEvent is done by combining two parts:
     * the timerange and the data.
     *
     * To construct you specify a TimeRange, along with the data.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    constructor(arg1, arg2) {
        super();

        if (arg1 instanceof TimeRangeEvent) {
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
            const range = new TimeRange(avroData.timerange);
            const data = new Immutable.Map(avroData.data);
            this._d = new Immutable.Map({range, data});
            return;
        } else if (arg1 instanceof Immutable.Map) {
            this._d = arg1;
            return;
        }
        const range = util.timeRangeFromArg(arg1);
        const data = util.dataFromArg(arg2);
        this._d = new Immutable.Map({range, data});
    }

    /**
     * Returns the timerange as a string
     */
    key() {
        return `${+this.timerange().begin()},${+this.timerange().end()}`;
    }

    toJSON() {
        return {
            timerange: this.timerange().toJSON(),
            data: this.data().toJSON()
        };
    }

    /**
     * For Avro serialization, this defines the event's key
     * (the TimeRange as an array)
     */
    static keySchema() {
        return {
            name: "timerange",
            type: {
                type: "array",
                items: "long"
            }
        };
    }

    //
    // Access the timerange represented by the index
    //

    /**
     * Returns a flat array starting with the timestamp, followed by the values.
     */
    toPoint() {
        return [
            this.timerange().toJSON(),
            ..._.values(this.data().toJSON())
        ];
    }

    /**
     * The TimeRange of this data
     * @return {TimeRange} TimeRange of this data.
     */
    timerange() {
        return this._d.get("range");
    }

    /**
     * The TimeRange of this event, in UTC, as a string.
     * @return {string} TimeRange of this data.
     */
    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    /**
     * The TimeRange of this event, in Local time, as a string.
     * @return {string} TimeRange of this data.
     */
    timerangeAsLocalString() {
        return this.timerange().toLocalString();
    }

    /**
     * The begin time of this Event
     * @return {Data} Begin time
     */
    begin() {
        return this.timerange().begin();
    }

    /**
     * The end time of this Event
     * @return {Data} End time
     */
    end() {
        return this.timerange().end();
    }

    /**
     * Alias for the begin() time.
     * @return {Data} Time representing this Event
     */
    timestamp() {
        return this.begin();
    }

    humanizeDuration() {
        return this.timerange().humanizeDuration();
    }
}

export default TimeRangeEvent;
