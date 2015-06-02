var moment = require("moment");
var _ = require("underscore");
var Immutable = require("immutable");

var util = require("./util");
var Index = require("./index");
var TimeRange = require("./range");

function timestampFromArgs(arg1) {
    var timestamp = undefined;
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
    var data = {};
    if (_.isObject(arg1)) {
        data = new Immutable.Map(arg1);
    } else if (data instanceof Immutable.Map) {
        data = arg1;
    } else {
        data = new Immutable.Map({"value": arg1});
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
 * of the number of ms since the UNIX epoch. There's not method on
 * the Event object to mutate the Event timestamp after it is created.
 *
 */
class Event {

    constructor(arg1, arg2) {

        //Copy constructor
        if (arg1 instanceof Event) {
            let other = arg1;
            this._time = other._time;
            this._data = other._data;
            return;
        }

        //Timestamp
        this._time = timestampFromArgs(arg1);

        //Data
        this._data = dataFromArgs(arg2);
    }

    toJSON() {
        return {time: this._time.getTime(), data: this._data.toJSON()};
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    timestampAsUTCString() {
        return this._time.toUTCString();
    }

    timestampAsLocalString() {
        return this._time.toString();
    }

    timestamp() {
        return this._time;
    }

    data() {
        return this._data;
    }

    get(key) {
        var k = key || "value";
        return this._data.get(k);
    }

    stringify() {
        return data.stringify(this._data);
    }
}

/**
 * An time range event uses a TimeRange to specify the range over which the event occurs
 * and maps that to a data object representing some measurements or metrics during
 * that time range.
 *
 * You supply the timerange as a TimeRange object.
 *
 * The data is also specified during construction and me be either:
 *  1) a Javascript object or simple type
 *  2) an Immutable.Map.
 *
 * If an Javascript object is provided it will be stored internally as an Immutable Map.
 * If the data provided is some other simple type (such as an integer) then it will be
 * equivalent to supplying an object of {value: data}. Data may also be undefined.
 *
 * The get the data out of an IndexedEvent instance use data(). It will return an
 * Immutable.Map. Alternatively you can call toJSON() to return a Javascript object
 * representation of the data, while toString() will serialize the event to a string.
 *
 */
class TimeRangeEvent {

    constructor(arg1, arg2) {

        //Timerange
        if (arg1 instanceof TimeRange) {
            let timerange = arg1;
            this._range = timerange;
        }

        //Data
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

    timerange() {
        return this._range;
    }

    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    timerangeAsLocalString() {
        return this.timerange().toLocalString();
    }


    begin() {
        return this._range.begin();
    }

    end() {
        return this._range.end();
    }

    timestamp() {
        return this.begin();
    }

    humanizeDuration() {
        return this._range.humanizeDuration();
    }

    //
    // Access the event data
    //

    data() {
        return this._data;
    }

    get(key) {
        var k = key || "value";
        return this._data.get(k);
    }

}

/**
 * An indexed event uses a Index to specify a timerange over which the event occurs
 * and maps that to a data object representing some measurement of metric during
 * that time range.
 *
 * You can supply the index as a string or as an Index object.
 *
 * Example Indexes are:
 *     - 1d-156 is the entire duration of the 156th day since the UNIX epoch
 *     - 12:Mar:2014 is the entire duration of march in 2014 [not supported yet]
 *
 * The range, as expressed by the Index, is provided by the convenience method range(),
 * which returns a TimeRange instance. Alternatively the begin and end times represented
 * by the Index can be found with begin() and end() respectively.
 *
 * The data is also specified during construction, and is generally expected to be an
 * object or an Immutable.Map. If an object is provided it will be stored internally as
 * an ImmutableMap. If the data provided is some other type then it will be equivalent to
 * supplying an object of {value: data}. Data may be undefined.
 *
 * The get the data out of an IndexedEvent instance use data(). It will return an
 * Immutable.Map.
 */
class IndexedEvent {

    constructor(index, data) {
        //Index
        if (_.isString(index)) {
            this._i = new Index(index);
        } else if (index instanceof Index) {
            this._i = index;
        }

        //Data
        if (_.isObject(data)) {
            this._data = new Immutable.Map(data);
        } else if (data instanceof Immutable.Map) {
            this._data = data;
        } else {
            this._data = new Immutable.Map({"value": data});
        }
    }

    toJSON() {
        return {index: this._i.asString(), data: this._data.toJSON()};
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    //
    // Access the index itself
    //

    index() {
        return this._i;
    }

    //
    // Access the timerange represented by the index
    //

    timerangeAsUTCString() {
        return this.timerange().toUTCString();
    }

    timerangeAsLocalString() {
        return this.timerange().toLocalString();
    }

    timerange() {
        return this._i.asTimerange();
    }

    begin() {
        return this.timerange().begin();
    }

    end() {
        return this.timerange().end();
    }

    timestamp() {
        return this.begin();
    }
    
    //
    // Access the event data
    //

    data() {
        return this._data;
    }

    get(key) {
        var k = key || "value";
        return this._data.get(k);
    }

}

module.exports.Event = Event;
module.exports.TimeRangeEvent = TimeRangeEvent;
module.exports.IndexedEvent = IndexedEvent;
