import _ from "underscore";
import util from "./util";

/**
 * An index that represents as a string a range of time. That range may either
 * be in UTC or local time. UTC is the default.
 *
 * The actual derived timerange can be found using asRange(). This will return
 * a TimeRange instance.
 *
 * The original string representation can be found with toString(). A nice
 * version for date based indexes (e.g. 2015-03) can be generated with
 * toNiceString(format) (e.g. March, 2015).
 */
export default class Index {

    constructor(s, utc) {
        this._utc = _.isBoolean(utc) ? utc : true;
        this._string = s;
        this._timerange = util.rangeFromIndexString(s, this._utc);
    }

    /**
     * Returns the Index as JSON, which will just be its string
     * representation
     * @return {Object} JSON representation of the Index
     */
    toJSON() {
        return this._string;
    }

    /**
     * Simply returns the Index as its string
     * @return {string} String representation of the Index
     */
    toString() {
        return this._string;
    }

    /**
     * for the calendar range style Indexes, this lets you return
     * that calendar range as a human readable format, e.g. "June, 2014".
     * The format specified is a Moment.format.
     * @return {string} String representation of the Index
     */
    toNiceString(format) {
        return util.niceIndexString(this._string, format);
    }

    /**
     * Alias for toString()
     * @return {string} String representation of the Index
     */
    asString() {
        return this.toString();
    }

    /**
     * Returns the Index as a TimeRange
     * @return {TimeRange} TimeRange representation of the Index
     */
    asTimerange() {
        return this._timerange;
    }

    /**
     * Returns the start date of the Index
     * @return {Date} Begin date
     */
    begin() {
        return this._timerange.begin();
    }

    /**
     * Returns the end date of the Index
     * @return {Date} End date
     */
    end() {
        return this._timerange.end();
    }
}
