import EventKey from "./eventkey";
/**
 * Constructs a new Time object that can be used as
 * a key for Events. A Time object represents a
 * timestamp, and is stored as a Javascript Date
 * object. The difference with just a Date is that
 * is conforms to the interface required to be an
 * Event key.
 */
export default class Time extends EventKey {
    private _d;
    constructor();
    constructor(d: Date);
    constructor(d: number);
    constructor(d: string);
    type(): string;
    toJSON(): Object;
    toString(): string;
    /**
     * The timestamp of this data, in UTC time, as a string.
     */
    toUTCString(): string;
    /**
     * The timestamp of this data, in Local time, as a string.
     */
    toLocalString(): string;
    /**
     * The timestamp of this data
     */
    timestamp(): Date;
    valueOf(): number;
    /**
     * The begin time of this Event, which will be just the timestamp
     */
    begin(): Date;
    /**
     * The end time of this Event, which will be just the timestamp
     */
    end(): Date;
    static isTime(t: Time): boolean;
}
