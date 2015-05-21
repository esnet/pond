var _ = require("underscore");
var Immutable = require("immutable");
var moment = require("moment");

class TimeRange {

    constructor(arg1, arg2) {
        if (arg1 instanceof TimeRange) {
            let other = arg1;
            this._range = other._range;
        } else if (arg1 instanceof Immutable.List) {
            let rangeList = arg1;
            this._range = rangeList;
        } else if (_.isArray(arg1)) {
            let rangeArray = arg1;
            this._range = Immutable.List([new Date(rangeArray[0]), new Date(rangeArray[1])]);
        } else {
            let b = arg1;
            let e = arg2;
            if (_.isDate(b) && _.isDate(e)) {
                this._range = Immutable.List([new Date(b.getTime()), new Date(e.getTime())]);
            } else if (moment.isMoment(b) && moment.isMoment(e)) {
                this._range = Immutable.List([new Date(b.valueOf()), new Date(e.valueOf())]);
            } else if (_.isNumber(b) && _.isNumber(e)) {
                this._range = Immutable.List([new Date(b), new Date(e)]);
            }
        }
    }

    /**
     * Returns the internal range, which is an Immutable List containing begin and end keys
     */
    range() {
        return this._range;
    }

    //
    // Serialize
    //
    
    toJSON() {
        return [this.begin().getTime(), this.end().getTime()];
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    toLocalString() {
        return "[" + this.begin().toString() + ", " +  this.end().toString() + "]";
    }

    toUTCString() {
        return "[" + this.begin().toUTCString() + ", " +  this.end().toUTCString() + "]";
    }

    humanize() {
        let begin = new moment(this.begin());
        let end = new moment(this.end());
        return `${begin.format("MMM D, YYYY hh:mm:ss a")} to ${end.format("MMM D, YYYY hh:mm:ss a")}`;
    }

    relativeString() {
        let begin = new moment(this.begin());
        let end = new moment(this.end());
        return `${begin.fromNow()} to ${end.fromNow()}`;
    }

    begin() {
        return this._range.get(0);
    }

    end() {
        return this._range.get(1);
    }

    /**
     * Sets a new begin time on the TimeRange. The result will be a new TimeRange.
     *
     * @param {Date} - The begin time to set the start of the Timerange to.
     */
    setBegin(t) {
        return new TimeRange(this._range.set(0, t));
    }

    /**
     * Sets a new end time on the TimeRange. The result will be a new TimeRange.
     *
     * @param {Date} - The time to set the end of the Timerange to.
     */
    setEnd(t) {
        return new TimeRange(this._range.set(1, t));
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

    duration() {
        return this.end().getTime() - this.begin().getTime();
    }

    humanizeDuration() {
        return moment.duration(this.duration()).humanize();
    }

    //
    // Static TimeRange creators
    //

    static lastDay(thing) {
        var beginTime = moment();
        var endTime =   beginTime.clone().subtract(24, "hours");
        return new TimeRange(beginTime, endTime);
    }

    static lastSevenDays(thing) {
        var beginTime = moment();
        var endTime =   beginTime.clone().subtract(7, "days");
        return new TimeRange(beginTime, endTime);
    }

    static lastThirtyDays(thing) {
        var beginTime = moment();
        var endTime =   beginTime.clone().subtract(30, "days");
        return new TimeRange(beginTime, endTime);
    }

    static lastNinetyDays(thing) {
        var beginTime = moment();
        var endTime =   beginTime.clone().subtract(90, "days");
        return new TimeRange(beginTime, endTime);
    }

}

module.exports = TimeRange;
