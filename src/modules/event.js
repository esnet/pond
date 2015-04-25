var moment = require("moment");
var _ = require("underscore");
var Immutable = require("immutable");

var util = require("./util");
var Index = require("./index");

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
            this._t = other._t;
            this._d = other._d;
            return;
        }

        //Time, data constructor
        let timestamp = arg1;
        let data = arg2;

        //Timestamp
        if (_.isNumber(arg1)) {
            this._t = new Date(timestamp);
        } else if (_.isDate(timestamp)) {
            this._t = new Date(timestamp.getTime());
        } else if (moment.isMoment(timestamp)) {
            this._t = new Date(timestamp.valueOf());
        }

        //Data
        if (_.isObject(data)) {
            this._d = new Immutable.Map(data);
        } else if (data instanceof Immutable.Map) {
            this._d = data;
        } else {
            this._d = new Immutable.Map({"value": data});
        }

        if (this._t && this._d) {
            return;
        }

        //JSON Object constructor
        if (_.isObject(arg1) && _.isUndefined(arg2)) {
            let obj = arg1;
            let timestamp = obj.time;
            let data = obj.data;
            this._t = new Date(timestamp);
            this._d = new Immutable.Map(data);
        }

    }

    toJSON() {
        return {time: this._t.getTime(), data: this._d.toJSON()};
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    timestampAsUTCString() {
        return this._t.toUTCString();
    }

    timestampAsLocalString() {
        return this._t.toString();
    }

    timestamp() {
        return this._t;
    }

    data() {
        return this._d;
    }

    get(key) {
        var k = key || "value";
        return this._d.get(k);
    }

    stringify() {
        return data.stringify(this._d);
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
            this._d = new Immutable.Map(data);
        } else if (data instanceof Immutable.Map) {
            this._d = data;
        } else {
            this._d = new Immutable.Map({"value": data});
        }
    }

    toJSON() {
        return {index: this._i.asString(), data: this._d.toJSON()};
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

    //
    // Access the event data
    //

    data() {
        return this._d;
    }

    get(key) {
        var k = key || "value";
        return this._d.get(k);
    }

}

module.exports.Event = Event;
module.exports.IndexedEvent = IndexedEvent;
