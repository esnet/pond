/**
 * Constructs a new Period object that can be used as
 * a key for Events.
 */
export default class Period {
    private _duration;
    private _string;
    /**
     * Passing a number to the constructor will
     * be considered as a ms duration
     */
    constructor(d: number);
    /**
     * Passing a string to the constuctor will
     * be considered a duration string, with a
     * format of %d[s|m|h|d]
     */
    constructor(d: string);
    /**
     * Passing a number and a string will be considered
     * a quantity and a unit. The string should be one of:
     *  * milliseconds
     *  * seconds
     *  * minutes
     *  * hours
     *  * days
     *  * weeks
     */
    constructor(arg1: number, arg2: string);
    toString(): string;
    valueOf(): number;
}
