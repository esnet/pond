import _ from "underscore";
import Immutable from "immutable";
import moment from "moment";

export default class TimeRange {

    constructor(arg1, arg2) {
        if (arg1 instanceof TimeRange) {
            const other = arg1;
            this._range = other._range;
        } else if (arg1 instanceof Immutable.List) {
            const rangeList = arg1;
            this._range = rangeList;
        } else if (_.isArray(arg1)) {
            const rangeArray = arg1;
            this._range = new Immutable.List([new Date(rangeArray[0]),
                                              new Date(rangeArray[1])]);
        } else {
            const b = arg1;
            const e = arg2;
            if (_.isDate(b) && _.isDate(e)) {
                this._range = new Immutable.List([new Date(b.getTime()),
                                                  new Date(e.getTime())]);
            } else if (moment.isMoment(b) && moment.isMoment(e)) {
                this._range = new Immutable.List([new Date(b.valueOf()),
                                                  new Date(e.valueOf())]);
            } else if (_.isNumber(b) && _.isNumber(e)) {
                this._range = new Immutable.List([new Date(b), new Date(e)]);
            }
        }
    }

    /**
     * Returns the internal range, which is an Immutable List containing
     * begin and end keys
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
        return `[${this.begin()}, ${this.end()}]`;
    }

    toUTCString() {
        return `[${this.begin().toUTCString()}, ${this.end().toUTCString()}]`;
    }

    humanize() {
        const begin = moment(this.begin());
        const end = moment(this.end());
        const beginStr = begin.format("MMM D, YYYY hh:mm:ss a");
        const endStr = end.format("MMM D, YYYY hh:mm:ss a");

        return `${beginStr} to ${endStr}`;
    }

    relativeString() {
        const begin = moment(this.begin());
        const end = moment(this.end());
        return `${begin.fromNow()} to ${end.fromNow()}`;
    }

    begin() {
        return this._range.get(0);
    }

    end() {
        return this._range.get(1);
    }

    /**
     * Sets a new begin time on the TimeRange. The result will be
     * a new TimeRange.
     */
    setBegin(t) {
        return new TimeRange(this._range.set(0, t));
    }

    /**
     * Sets a new end time on the TimeRange. The result will be a new TimeRange.
     */
    setEnd(t) {
        return new TimeRange(this._range.set(1, t));
    }

    /**
     * Returns if the two TimeRanges can be considered equal,
     * in that they have the same times.
     */
    equals(other) {
        return this.begin().getTime() === other.begin().getTime() &&
               this.end().getTime() === other.end().getTime();
    }

    /**
     * Returns true if other is completely inside this.
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
     * Returns true if this TimeRange is completely within the supplied
     * other TimeRange.
     */
    within(other) {
        return this.begin() >= other.begin() &&
               this.end() <= other.end();
    }

    /**
     * Returns true if the passed in other TimeRange overlaps this time Range.
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
    * Returns a new Timerange which covers the extents of this and
    * other combined.
    */
    extents(other) {
        const b = this.begin() < other.begin() ? this.begin() : other.begin();
        const e = this.end() > other.end() ? this.end() : other.end();
        return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
    }

    /**
    * Returns a new TimeRange which represents the intersection
    * (overlapping) part of this and other.
    */
    intersection(other) {
        if (this.disjoint(other)) {
            return undefined;
        }
        const b = this.begin() > other.begin() ? this.begin() : other.begin();
        const e = this.end() < other.end() ? this.end() : other.end();
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

    static lastDay() {
        const beginTime = moment();
        const endTime = beginTime.clone().subtract(24, "hours");
        return new TimeRange(beginTime, endTime);
    }

    static lastSevenDays() {
        const beginTime = moment();
        const endTime = beginTime.clone().subtract(7, "days");
        return new TimeRange(beginTime, endTime);
    }

    static lastThirtyDays() {
        const beginTime = moment();
        const endTime = beginTime.clone().subtract(30, "days");
        return new TimeRange(beginTime, endTime);
    }

    static lastNinetyDays() {
        const beginTime = moment();
        const endTime = beginTime.clone().subtract(90, "days");
        return new TimeRange(beginTime, endTime);
    }
}
