/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

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
class Index {

    constructor(s, utc = true) {
        this._utc = utc;
        this._string = s;
        this._timerange = util.rangeFromIndexString(s, this._utc);
    }

    /**
     * Returns the Index as JSON, which will just be its string
     * representation
     */
    toJSON() {
        return this._string;
    }

    /**
     * Simply returns the Index as its string
     */
    toString() {
        return this._string;
    }

    /**
     * for the calendar range style Indexes, this lets you return
     * that calendar range as a human readable format, e.g. "June, 2014".
     * The format specified is a Moment.format.
     */
    toNiceString(format) {
        return util.niceIndexString(this._string, format);
    }

    /**
     * Alias for toString()
     */
    asString() {
        return this.toString();
    }

    /**
     * Returns the Index as a TimeRange
     */
    asTimerange() {
        return this._timerange;
    }

    /**
     * Returns the start date of the Index
     */
    begin() {
        return this._timerange.begin();
    }

    /**
     * Returns the end date of the Index
     */
    end() {
        return this._timerange.end();
    }

    static getIndexString(win, date) {
        const pos = util.windowPositionFromDate(win, date);
        return `${win}-${pos}`;
    }

    static getIndexStringList(win, timerange) {
        const pos1 = util.windowPositionFromDate(win, timerange.begin());
        const pos2 = util.windowPositionFromDate(win, timerange.end());
        const indexList = [];
        if (pos1 <= pos2) {
            for (let pos = pos1; pos <= pos2; pos++) {
                indexList.push(`${win}-${pos}`);
            }
        }
        return indexList;
    }
}

export default Index;
