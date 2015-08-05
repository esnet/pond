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
        this._utc =  _.isBoolean(utc) ? utc : true;
        this._string = s;
        this._timerange = util.rangeFromIndexString(s, this._utc);
    }

    toJSON() {
        return this._string;
    }

    toString() {
        return this._string;
    }

    toNiceString(format) {
        return util.niceIndexString(this._string, format);
    }

    // Alias for toString()
    asString() {
        return this.toString();
    }

    asTimerange() {
        return this._timerange;
    }

    begin() {
        return this._timerange.begin();
    }

    end() {
        return this._timerange.end();
    }
}
