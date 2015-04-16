
var Immutable = require("immutable");
var _ = require("underscore");
var moment = require("moment");

class TimeRange {

    constructor(b, e) {
        if (b instanceof TimeRange) {
            this._range = b._range;
        } else if (b instanceof Immutable.Map) {
            this._range = b;
        } else if (_.isDate(b) && _.isDate(e)) {
            this._range = Immutable.Map({"begin": new Date(b.getTime()),
                                         "end": new Date(e.getTime())});
        } else if (moment.isMoment(b) && moment.isMoment(e)) {
            this._range = Immutable.Map({"begin": new Date(b.valueOf()),
                                          "end": new Date(e.valueOf())});
        }
    }

    toLocalString() {
        return "[" + this._range.get("begin").toString() + ", " +  this._range.get("end").toString() + "]";
    }

    toUTCString() {
        return "[" + this._range.get("begin").toUTCString() + ", " +  this._range.get("end").toUTCString() + "]";
    }

    begin() {
        return this._range.get("begin");
    }

    end() {
        return this._range.get("end");
    }

    /**
     * Sets a new begin time on the TimeRange. The result will be a new TimeRange.
     *
     * @param {Date} - The begin time to set the start of the Timerange to.
     */
    setBegin(t) {
        return new TimeRange(this._range.set("begin", t));
    }

    /**
     * Sets a new end time on the TimeRange. The result will be a new TimeRange.
     *
     * @param {Date} - The time to set the end of the Timerange to.
     */
    setEnd(t) {
        return new TimeRange(this._range.set("end", t));
    }

    /**
     * @returns {boolean} Returns if the two TimeRanges can be considered equal,
     *                    in that they have the same times.
     */
    equals(other) {
        return this.begin() === other.begin() && this.end() === other.end();
    }

    /**
     * @param {TimeRange|Date} - The other Range or Date to compare this to.
     * @returns {boolean} Returns true if other is completely inside this.
     */
    contains(other) {
        if (_.isDate(other)) {
            return this.begin() <= other && this.end() >= other;
        } else {
            return this.begin() <= other.begin() &&
                   this.end() >= other.end();
        }
        return false;
    }

    /**
     * @param - The other Range to compare this to.
     * @returns {boolean} Returns true if this TimeRange is completely within the supplied other TimeRange.
     */
    within(other) {
        return this.begin() >= other.begin() &&
               this.end() <= other.end();
    }

    /**
     * @param - The other Range to compare this to.
     * @returns {boolean} Returns true if the passed in other TimeRange overlaps this time Range.
     */
    overlaps(other) {
        if (this.contains(other.begin()) && !this.contains(other.end()) ||
            this.contains(other.end()) && !this.contains(other.begin())) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param - The other Range to compare this to.
     * @returns {boolean} Returns true if the passed in other Range in no way
     * overlaps this time Range.
     */
    disjoint(other) {
        return (this.end() < other.begin() || this.begin() > other.end());
    }

    /**
    * Returns a new Timerange which covers the extents of this and other combined.
    *
    * @param - The other Range to take the Union with.
    * @returns {TimeRange} Returns a new Range that is the union of this and other.
    */
    extents(other) {
        var b = this.begin() < other.begin() ? this.begin() : other.begin();
        var e = this.end() > other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }

    /**
    * Returns a new TimeRange which is the intersection of this and other.
    * @param - The other TimeRange to take the intersection with.
    * @returns {TimeRange} Returns a new TimeRange which represents the intersection
    * (overlapping) part of this and other.
    */
    intersection(other) {
        if (this.disjoint(other)) {
            return undefined;
        }
        var b = this.begin() > other.begin() ? this.begin() : other.begin();
        var e = this.end() < other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()),
                             new Date(e.getTime()));
    }

}

module.exports = TimeRange;
