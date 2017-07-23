/**
 * Constructs a new Period object that can be used as
 * a key for Events.
 */
export declare class Period {
    private _duration;
    private _string;
    /**
     * Passing a number to the constructor will
     * be considered as a ms duration.
     * Passing a string to the constuctor will
     * be considered a duration string, with a
     * format of %d[s|m|h|d]
     * Passing a number and a string will be considered
     * a quantity and a unit. The string should be one of:
     *  * milliseconds
     *  * seconds
     *  * minutes
     *  * hours
     *  * days
     *  * weeks
     */
    constructor(arg1: number | string, arg2?: string);
    toString(): string;
    valueOf(): number;
}
declare function periodFactory(d: number | string, arg2?: string): any;
declare function periodFactory(arg1: number, arg2: string): any;
export { periodFactory as period };
