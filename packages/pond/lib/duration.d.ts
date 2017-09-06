import * as moment from "moment";
/**
 * A duration is a fixed length of time which is typically
 * used in combination with a `Period` to describe an aggregation bucket. For example
 * a `duration("1d")` would indicate buckets that are a day long. But it is also
 * used in various other places.
 */
export declare class Duration {
    private _duration;
    private _string;
    /**
     * * Passing a number to the constructor will be considered as a `ms` duration.
     * * Passing a string to the constuctor will be considered a duration string, with a
     *   format of `%d[s|m|h|d]`
     * * Passing a number and a string will be considered a quantity and a unit.
     *   The string should be one of:
     *   * "milliseconds"
     *   * "seconds"
     *   * "minutes"
     *   * "hours"
     *   * "days"
     *   * "weeks"
     * * Finally, you can pass either a `moment.Duration` or a `Moment.Duration-like`
     * object to the constructor
     */
    constructor(arg1: number | string, arg2?: string);
    toString(): string;
    valueOf(): number;
}
declare function durationFactory(d: number | string, arg2?: string): any;
declare function durationFactory(arg1: number, arg2: string): any;
declare function durationFactory(arg1: object | moment.Duration): any;
export { durationFactory as duration };
