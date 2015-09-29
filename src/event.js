import moment from "moment";
import _ from "underscore";
import Immutable from "immutable";
import Index from "./index";
import TimeRange from "./range";

//
// Util
//

function timestampFromArgs(arg1) {
    let timestamp;
    if (_.isNumber(arg1)) {
        timestamp = new Date(arg1);
    } else if (_.isDate(arg1)) {
        timestamp = new Date(arg1.getTime());
    } else if (moment.isMoment(arg1)) {
        timestamp = new Date(arg1.valueOf());
    }
    return timestamp;
}

function dataFromArgs(arg1) {
    let data = {};
    if (_.isObject(arg1)) {
        data = new Immutable.Map(arg1);
    } else if (data instanceof Immutable.Map) {
        data = arg1;
    } else {
        data = new Immutable.Map({value: arg1});
    }
    return data;
}

/**
 * A generic event
 *
 * This represents a data object at a single timestamp, supplied
 * at initialization.
 *
 * The timestamp may be a javascript Date object or a Moment, but is
 * stored internally as ms since UNIX epoch.
 *
 * The data may be any type.
 *
 * Asking the Event object for the timestamp returns an integer copy
 * of the number of ms since the UNIX epoch. There's no method on
 * the Event object to mutate the Event timestamp after it is created.
 */
export class Event {

    /**
     * The creation of an Event is done by combining two parts:
     * the timestamp (or time range, or Index...) and the data.
     *
     * To construct you specify the timestamp as either:
     *     - Javascript Date object
     *     - a Moment, or
     *     - ms timestamp: the number of ms since the UNIX epoch
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    constructor(arg1, arg2) {
        // Copy constructor
        if (arg1 instanceof Event) {
            let other = arg1;
            this._time = other._time;
            this._data = other._data;
            return;
        }

        // Timestamp
        this._time = timestampFromArgs(arg1);

        // Data
        this._data = dataFromArgs(arg2);
    }

    /**
     * Returns the Event as a JSON object, essentially:
     *  {time: t, data: {key: value, ...}}
     * @return {Object} The event as JSON.
     */
    toJSON() {
        return {time: this._time.getTime(), data: this._data.toJSON()};
    }

    /**
     * Retruns the Event as a string, useful for serialization.
     * @return {string} The Event as a string
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * The timestamp of this data, in UTC time, as a string.
     * @return {string} Time of this data.
     */
    timestampAsUTCString() {
        return this._time.toUTCString();
    }

    /**
     * The timestamp of this data, in Local time, as a string.
     * @return {string} Time of this data.
     */
    timestampAsLocalString() {
        return this._time.toString();
    }

    /**
     * The timestamp of this data
     * @return {Date} Time of this data.
     */
    timestamp() {
        return this._time;
    }

    /**
     * Access the event data
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._data;
    }

    /**
     * Get specific data out of the Event
     * @param  {string} key Key to lookup, or "value" if not specified.
     * @return {Object}     The data associated with this key
     */
    get(key) {
        const k = key || "value";
        return this._data.get(k);
    }

    stringify() {
        return JSON.stringify(this._data);
    }
}

/**
 * A TimeRangeEvent uses a TimeRange to specify the range over
 * which the event occurs and maps that to a data object representing some
 * measurements or metrics during that time range.
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
 * `toString()` will serialize the event to a string.
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
        // Timerange
        if (arg1 instanceof TimeRange) {
            let timerange = arg1;
            this._range = timerange;
        }

        // Data
        this._data = dataFromArgs(arg2);
    }

    toJSON() {
        return {timerange: this._range.toJSON(), data: this._data.toJSON()};
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    //
    // Access the timerange represented by the index
    //

    /**
     * The TimeRange of this data
     * @return {TimeRange} TimeRange of this data.
     */
    timerange() {
        return this._range;
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
        return this._range.begin();
    }

    /**
     * The end time of this Event
     * @return {Data} End time
     */
    end() {
        return this._range.end();
    }

    /**
     * Alias for the begin() time.
     * @return {Data} Time representing this Event
     */
    timestamp() {
        return this.begin();
    }

    humanizeDuration() {
        return this._range.humanizeDuration();
    }

    /**
     * Access the event data
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._data;
    }

    /**
     * Get specific data out of the Event
     * @param  {string} key Key to lookup, or "value" if not specified.
     * @return {Object}     The data associated with this key
     */
    get(key) {
        const k = key || "value";
        return this._data.get(k);
    }
}

/**
 * An IndexedEvent uses an Index to specify a timerange over which the event
 * occurs and maps that to a data object representing some measurement or metric
 * during that time range.
 *
 * You can supply the index as a string or as an Index object.
 *
 * Example Indexes are:
 *     - 1d-1565 is the entire duration of the 1565th day since the UNIX epoch
 *     - 2014-03 is the entire duration of march in 2014
 *
 * The range, as expressed by the Index, is provided by the convenience method
 * `range()`, which returns a TimeRange instance. Alternatively the begin
 * and end times represented by the Index can be found with `begin()`
 * and `end()` respectively.
 *
 * The data is also specified during construction, and is generally expected to
 * be an object or an Immutable.Map. If an object is provided it will be stored
 * internally as an ImmutableMap. If the data provided is some other type then
 * it will be equivalent to supplying an object of `{value: data}`. Data may be
 * undefined.
 *
 * The get the data out of an IndexedEvent instance use `data()`. It will return
 * an Immutable.Map.
 */
export class IndexedEvent {

    /**
     * The creation of an IndexedEvent is done by combining two parts:
     * the Index and the data.
     *
     * To construct you specify an Index, along with the data.
     *
     * The index may be an Index, or a string.
     *
     * To specify the data you can supply either:
     *     - a Javascript object containing key values pairs
     *     - an Immutable.Map, or
     *     - a simple type such as an integer. In the case of the simple type
     *       this is a shorthand for supplying {"value": v}.
     */
    constructor(index, data, utc) {
        // Index
        if (_.isString(index)) {
            this._index = new Index(index, utc);
        } else if (index instanceof Index) {
            this._index = index;
        }

        // Data
        if (_.isObject(data)) {
            this._data = new Immutable.Map(data);
        } else if (data instanceof Immutable.Map) {
            this._data = data;
        } else {
            this._data = new Immutable.Map({value: data});
        }
    }

    toJSON() {
        return {index: this._index.asString(), data: this._data.toJSON()};
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the Index associated with the data in this Event
     * @return {Index} The Index
     */
    index() {
        return this._index;
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
     * The TimeRange of this data
     * @return {TimeRange} TimeRange of this data.
     */
    timerange() {
        return this._index.asTimerange();
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

    /**
     * Access the event data
     * @return {Immutable.Map} Data for the Event
     */
    data() {
        return this._data;
    }

    /**
     * Get specific data out of the Event
     * @param  {string} key Key to lookup, or "value" if not specified.
     * @return {Object}     The data associated with this key
     */
    get(key) {
        const k = key || "value";
        return this._data.get(k);
    }
}
