import * as Immutable from "immutable";
import EventKey from "./eventkey";
export interface ReducerFunction {
    (values: number[]): number;
}
/**
 * An Event is a mapping from a time based key to a set
 * of unstuctured data.
 *
 * The key needs to be a sub-class of the `EventKey`, though
 * typically, this would either be one of the following:
 *  * `Time` - a single timestamp
 *  * `TimeRange` - a timerange over which the Event took place
 *  * `Index` - a different representation of a TimeRange
 *
 * The data can be specified as either a JS object or an
 * Immutable.Map<string, any>. To get values out of the data,
 * use `get()`. This method takes what is called a field, which
 * is any key into the data. Fields can refer to deep data with
 * either a path (as an array) or dot notation. Not specifying
 * a field implies a field of name "value".
 */
declare class Event<T extends EventKey> {
    protected _key: T;
    protected _data: Immutable.Map<string, any>;
    constructor(key: T, data: Object);
    constructor(key: T, data: Immutable.Map<string, any>);
    /**
     * Returns the key this Event was constructed with
     */
    key(): T;
    /**
     * Returns the label of the key
     */
    keyType(): string;
    /**
     * Returns the data associated with this event as the
     * internal Immutable data structure
     */
    data(): Immutable.Map<string, any>;
    /**
     * Gets the value of a specific field within the Event.
     *
     * You can refer to a fields with one of the following notations:
     *  * (undefined) -> "value"
     *  * "temperature"
     *  * "path.to.deep.data"
     *  * ["path", "to", "deep", "data"].
     *
     * @return Object
     */
    get(): any;
    get(field: string): any;
    get(field: Array<string>): any;
    /**
     * Set a new value on the Event and return a new Event
     *
     * @param key The Event key, for example the Time of the Event
     * @param value The new value to set on the Event.
     *
     * @returns Event<T> The `Event` with modified data
     */
    set(key: string, value: any): Event<T>;
    /**
     * Will return false if the value in this `Event` is
     * either `undefined`, `NaN` or `null` for the given field
     * or fields. This serves as a determination of a "missing"
     * value within a `TimeSeries` or `Collection`.
     *
     * @param {string|string[]} fields The field or fields to check
     *
     * @returns boolean If this Event is valid
     */
    isValid(field: string): boolean;
    isValid(fields: Array<string>): boolean;
    toJSON(): Object;
    toString(): string;
    timestamp(): Date;
    begin(): Date;
    end(): Date;
    /**
     * Do the two supplied events contain the same data, even if they are not
     * the same instance? Uses Immutable.is() to compare the event data and
     * the string representation of the key to compare those.
     */
    static is(event1: Event<EventKey>, event2: Event<EventKey>): boolean;
    /**
     * Returns if the two supplied events are duplicates of each other.
     *
     * Duplicated means that the keys are the same. This is the case
     * with incoming events sometimes where a second event is either known
     * to be the same (but duplicate) of the first, or supersedes the first.
     *
     * You can also pass in false for ignoreValues and get a full compare,
     * including the data of the event, thus ignoring the supersede case.
     */
    static isDuplicate(event1: Event<EventKey>, event2: Event<EventKey>, ignoreValues?: boolean): boolean;
    /**
     * Merges multiple `events` together into a new array of events, one
     * for each key of the source events. Merging is done on the data of
     * each event. Values from later events in the list overwrite
     * early values if fields conflict.
     *
     * Common use cases:
     *   - append events of different timestamps
     *   - merge in events with one field to events with another
     *   - merge in events that supersede the previous events
     *
     * Events in the supplied list need to be of homogeneous types
     *
     * See also: TimeSeries.timeSeriesListMerge()
     */
    static merge<T extends EventKey>(eventList: Event<T>[], deep?: boolean): Event<T>[];
    static merge<T extends EventKey>(eventList: Immutable.List<Event<T>>, deep?: boolean): Immutable.List<Event<T>>;
    /**
     * Combines multiple `Event`s together into a new array of events, one
     * for each key of the source events. The list of Events may be specified
     * as an array or `Immutable.List`.
     *
     * Combining acts on the fields specified in the `fieldSpec` (or all
     * fields) and uses the reducer function supplied to take the multiple
     * values associated with the key and reduce them down to a single value.
     *
     * The return result will be an Event of the same type as the input.
     *
     * Additionally, if you pass in an array of `Events`, you will get an
     * array of events back. If you pass an `Immutable.List` of events then
     * you will get an `Immutable.List` of events back.
     *
     * This is the general version of `Event.sum()` and `Event.avg()`. If those
     * common use cases are what you want, just use those functions. If you
     * want to specify your own reducer you can use this function.
     *
     * See also: `TimeSeries.timeSeriesListSum()`
     */
    static combine<T extends EventKey>(eventList: Event<T>[], reducer: ReducerFunction, fieldSpec?: string | string[]): Event<T>[];
    static combine<T extends EventKey>(eventList: Immutable.List<Event<T>>, reducer: ReducerFunction, fieldSpec?: string | string[]): Immutable.List<Event<T>>;
}
export default Event;
