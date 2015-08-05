import _ from "underscore";
import {rangeFromIndexString, niceIndexString} from "./util";

/**
 * An index that represents as a string a range of time.
 *
 * The actual derived timerange can be found using asRange(). This will return
 * a TimeRange instance.
 *
 * The original string representation can be found with toString().
 */
export default class Index {

    constructor(s, utc) {
        let isUTC = true;
        if (_.isBoolean(utc)) {
            isUTC = utc;
        }
        this._s = s;
        this._r = this._rangeFromIndexString(s, isUTC);
    }

    _rangeFromIndexString(s) {
        return rangeFromIndexString(s);
    }

    toJSON() {
        return this._s;
    }

    toString() {
        return this._s;
    }

    toNiceString(format) {
        return niceIndexString(this._s, format);
    }

    // Alias for toString()
    asString() {
        return this.toString();
    }

    asTimerange() {
        return this._r;
    }

    begin() {
        return this._r.begin();
    }

    end() {
        return this._r.end();
    }
}
