import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;
import EventKey from "./eventkey";
import Time from "./time";
import Period from "./period";
/**
A time range is a simple representation of a begin and end time, used
to maintain consistency across an application.

### Construction

You can define a TimeRange with moments, Javascript Date objects
or ms since UNIX epoch. Here we construct one with two moments:

```js
var fmt = "YYYY-MM-DD HH:mm";
var beginTime = moment("2012-01-11 11:11", fmt);
var endTime =   moment("2012-02-22 12:12", fmt);
var range = new TimeRange(beginTime, endTime);
```

or with ms times:

```js
var range = new TimeRange([1326309060000, 1329941520000]);
```

 */
declare class TimeRange extends EventKey {
    /**
     * Internally, the timerange is stored as an Immutable.List
     */
    private _range;
    /**
     * Builds a new TimeRange which may be of several different formats:
     *   - Another TimeRange (copy constructor)
     *   - An Immutable.List containing two Dates.
     *   - A Javascript array containing two Date or ms timestamps
     *   - Two arguments, begin and end, each of which may be a Data,
     *     a Moment, or a ms timestamp.
     */
    constructor(timerange: TimeRange);
    constructor(dateList: Immutable.List<Date>);
    constructor(begin: Date, end: Date);
    constructor(begin: Time, end: Time);
    constructor(begin: Moment, end: Moment);
    constructor(begin: number, end: number);
    type(): string;
    /**
     * Returns the internal range, which is an Immutable.List of two elements
     * containing begin and end times as Dates.
     */
    internal(): Immutable.List<Date>;
    /**
     * Returns the TimeRange as JSON, which will be a Javascript array
     * of two ms timestamps.
     */
    toJSON(): Array<number>;
    /**
     * Returns the TimeRange as a string, useful for serialization.
     *
     * @return {string} String representation of the TimeRange
     */
    toString(): string;
    /**
     * Returns the TimeRange as a string expressed in local time
     */
    toLocalString(): string;
    /**
     * Returns the TimeRange as a string expressed in UTC time
     */
    toUTCString(): string;
    /**
     * Returns a human friendly version of the TimeRange, e.g.
     * "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
     */
    humanize(): string;
    /**
     * Returns a human friendly version of the TimeRange
     * @example
     * "a few seconds ago to a month ago"
     */
    relativeString(): string;
    /**
     * Returns the begin time of the TimeRange.
     */
    begin(): Date;
    /**
     * Returns the end time of the TimeRange.
     */
    end(): Date;
    /**
     * Returns the midpoint of the TimeRange
     */
    mid(): Date;
    /**
     * Returns the midpoint of the TimeRange as the representitive
     * timestamp for the timerange.
     */
    timestamp(): Date;
    /**
     * Sets a new begin time on the TimeRange. The result will be
     * a new TimeRange.
     */
    setBegin(t: Date): TimeRange;
    /**
     * Sets a new end time on the TimeRange. The result will be
     * a new TimeRange.
     */
    setEnd(t: Date): TimeRange;
    /**
     * Returns if the two TimeRanges can be considered equal,
     * in that they have the same times.
     */
    equals(other: TimeRange): boolean;
    /**
     * Determine if a Date or a TimeRange is contained entirely
     * within this TimeRange
     */
    contains(date: Date): boolean;
    contains(other: TimeRange): boolean;
    /**
     * Returns true if this TimeRange is completely within the supplied
     * other TimeRange.
     */
    within(other: TimeRange): boolean;
    /**
     * Returns true if the passed in other TimeRange overlaps
     * this time Range.
     */
    overlaps(other: TimeRange): boolean;
    /**
     * Returns true if the passed in other TimeRange in no way
     * overlaps this TimeRange.
     */
    disjoint(other: TimeRange): boolean;
    /**
     * Returns a new Timerange which covers the extents of this and
     * other combined.
     */
    extents(other: TimeRange): TimeRange;
    /**
     * Returns a new TimeRange which represents the intersection
     * (overlapping) part of this and other.
     */
    intersection(other: TimeRange): TimeRange | void;
    /**
     * Returns the duration of the TimeRange in milliseconds
     */
    duration(): number;
    /**
     * A user friendly version of the duration.
     */
    humanizeDuration(): string;
    /**
     * The last
     */
    static last(period: Period): TimeRange;
}
export default TimeRange;
