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
import Immutable from "immutable";
import TimeRange from "./range";

function timeRangeFromArg(arg) {
    if (arg instanceof TimeRange) {
        return arg;
    } else if (_.isArray(arg) && arg.length === 2) {
        return new TimeRange(arg);
    } else {
        throw new Error(`Unable to parse timerange. Should be a TimeRange. Got ${arg}.`);
    }
}

function dataFromArg(arg) {
    let data;
    if (_.isObject(arg)) {
        // Deeply convert the data to Immutable Map
        data = new Immutable.fromJS(arg);
    } else if (data instanceof Immutable.Map) {
        // Copy reference to the data
        data = arg;
    } else if (_.isNumber(arg) || _.isString(arg)) {
        // Just add it to the value key of a new Map
        // e.g. new Event(t, 25); -> t, {value: 25}
        data = new Immutable.Map({value: arg});
    } else {
        throw new Error(`Unable to interpret event data from ${arg}.`);
    }
    return data;
}

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
export class TimeRangeEvent {

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
        if (arg1 instanceof TimeRangeEvent) {
            const other = arg1;
            this._d = other._d;
            return;
        } else if (arg1 instanceof Immutable.Map) {
            this._d = arg1;
            return;
        }
        const range = timeRangeFromArg(arg1);
        const data = dataFromArg(arg2);
        this._d = new Immutable.Map({range, data});
    }

    toJSON() {
        return {
            timerange: this.timerange().toJSON(),
            data: this.data().toJSON()
        };
    }

    toString() {
        return JSON.stringify(this.toJSON());
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
     * Access the event data
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._d.get("data");
    }

    /**
     * Sets the data portion of the event and
     * returns a new TimeRangeEvent.
     */
    setData(data) {
        const d = this._d.set("data", dataFromArg(data));
        return new TimeRangeEvent(d);
    }

    /**
     * The TimeRange of this data, in UTC, as a string.
     * @return {string} TimeRange of this data.
     */
    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    /**
     * The TimeRange of this data, in Local time, as a string.
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

    /**
     * Get specific data out of the Event. The data will be converted
     * to a js object. You can use a fieldSpec to address deep data.
     * A fieldSpec could be "a.b"
     */
    get(fieldSpec = ["value"]) {
        let v;
        if (_.isArray(fieldSpec)) {
            v = this.data().getIn(fieldSpec);
        } else if (_.isString(fieldSpec)) {
            const searchKeyPath = fieldSpec.split(".");
            v = this.data().getIn(searchKeyPath);
        }

        if (v instanceof Immutable.Map || v instanceof Immutable.List) {
            return v.toJS();
        }
        return v;
    }

    value(fieldSpec) {
        return this.get(fieldSpec);
    }
}

export default TimeRangeEvent;
