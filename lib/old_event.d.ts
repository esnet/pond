import * as Immutable from "immutable";
/**
There are three types of Events in Pond, while this class provides the base class
for them all:

1. *TimeEvent* - a generic event which associates a timestamp with some data
2. *TimeRangeEvent* - associates a TimeRange with some data
3. *IndexedEvent* - associates a time range specified as an Index

Event contains several static methods that may be useful, though in general
are used by the Collection and TimeSeries classes. So, if you already have a
TimeSeries or Collection you may want to examine the API there to see if you
can do what you want to do.
*/
declare abstract class Event {
    protected _d: Immutable.Map<string, any>;
    /**
     * Express the event as a string
     */
    toString(): string;
    /**
     * Should be implemented on event subclasses
     */
    abstract toJSON(): Object;
    /**
     * Returns the type of this class instance
     */
    type(): FunctionConstructor;
    /**
     * Sets the data of the event in bulk and returns a new event of the
     * same type. The data passed in is a Javascript object.
     */
    setData(data: Object): Event;
    /**
     * Access the event data in its native form. The result
     * will be an Immutable.Map.
     */
    data(): Immutable.Map<string, any>;
    /**
     * Get specific data out of the event. The data will be converted
     * to a JS Object, whether that be just a simple value or string,
     * or a deeper object.
     *
     * You can use a "fieldSpec" to address deep data.
     * A `fieldSpec` could be "a.b", or ["a", "b"]. For example:
     * { a: 1, b: {c: 3, d: 4}} accessed with "b.c" would return 3.
     *
     * Not supplying a fieldSpec would be the same as attempting to
     * access a field called "value", the default.
     */
    get(): any;
    get(fieldSpec: string): any;
    get(fieldSpec: Array<string>): any;
    /**
     * Alias for `get()`.
     */
    value(): any;
    value(fieldSpec: string): any;
    value(fieldSpec: Array<string>): any;
    /**
     * Collapses this event's columns, represented by the fieldSpecList
     * into a single column. The collapsing itself is done with the reducer
     * function. Optionally the collapsed column could be appended to the
     * existing columns, or replace them (the default).
     */
    collapse(fieldSpecList: Array<any>, columnName: string, reducer: (data: Array<number>) => number, append?: boolean): Event;
    /**
     * Do the two supplied events contain the same data,
     * even if they are not the same instance.
     * @param  {Event}  event1 First event to compare
     * @param  {Event}  event2 Second event to compare
     * @return {Boolean}       Result
     */
    static is(event1: Event, event2: Event): boolean;
    /**
     * Returns if the two supplied events are duplicates
     * of each other. By default, duplicated means that the
     * timestamps are the same. This is the case with incoming events
     * where the second event is either known to be the same (but
     * duplicate) of the first, or supersedes the first. You can
     * also pass in false for ignoreValues and get a full
     * compare.
     *
     * @return {Boolean}              The result of the compare
     */
    static isDuplicate(event1: any, event2: any, ignoreValues?: boolean): boolean;
    /**
     * The same as Event.value() only it will return false if the
     * value is either undefined, NaN or Null.
     *
     * @param {Event} event The Event to check
     * @param {string|array} The field to check
     */
    static isValidValue(event: any, fieldPath: any): boolean;
    /**
     * Function to select specific fields of an event using
     * a fieldPath and return a new event with just those fields.
     *
     * The fieldPath currently can be:
     *  * A single field name
     *  * An array of field names
     *
     * The function returns a new event.
     */
    static selector(event: any, fieldPath: any): any;
    /**
     * Merges multiple `events` together into a new array of events, one
     * for each time/index/timerange of the source events. Merging is done on
     * the data of each event. Values from later events in the list overwrite
     * early values if fields conflict.
     *
     * Common use cases:
     *   - append events of different timestamps
     *   - merge in events with one field to events with another
     *   - merge in events that supersede the previous events
     *
     * See also: TimeSeries.timeSeriesListMerge()
     */
    static merge(events: Event[], deep: boolean): Event[];
    static merge(events: Immutable.List<Event>, deep: boolean): Immutable.List<Event>;
    /**
     * Combines multiple `events` together into a new array of events, one
     * for each time/index/timerange of the source events. The list of
     * events may be specified as an array or `Immutable.List`. Combining acts
     * on the fields specified in the `fieldSpec` and uses the reducer
     * function to take the multiple values and reducer them down to one.
     *
     * The return result will be an of the same form as the input. If you
     * pass in an array of events, you will get an array of events back. If
     * you pass an `Immutable.List` of events then you will get an
     * `Immutable.List` of events back.
     *
     * This is the general version of `Event.sum()` and `Event.avg()`. If those
     * common use cases are what you want, just use those functions. If you
     * want to specify your own reducer you can use this function.
     *
     * See also: `TimeSeries.timeSeriesListSum()`
     */
    static combine(events: Event[], reducer: (d: Array<number>) => number, fieldSpec: string | string[]): Event[];
    static combine(events: Immutable.List<Event>, reducer: (d: Array<number>) => number, fieldSpec: string | string[]): Immutable.List<Event>;
    /**
     * Returns a function that will take a list of events and combine them
     * together using the fieldSpec and reducer function provided. This is
     * used as an event reducer for merging multiple TimeSeries together
     * with `timeSeriesListReduce()`.
     */
    static combiner(fieldSpec: string | string[], reducer: (d: Array<number>) => number): Function;
    /**
     * Returns a function that will take a list of events and merge them
     * together using the fieldSpec provided. This is used as a reducer for
     * merging multiple TimeSeries together with `timeSeriesListMerge()`.
     */
    static merger(fieldSpec: string | string[]): Function;
    /**
     * Maps a list of events according to the fieldSpec
     * passed in. The spec maybe a single field name, a
     * list of field names, or a function that takes an
     * event and returns a key/value pair.
     *
     * @example
     * ````
     *         in   out
     *  3am    1    2
     *  4am    3    4
     *
     * Mapper result:  { in: [1, 3], out: [2, 4]}
     * ```
     * @param {string|array} fieldSpec  Column or columns to look up. If you need
     *                                  to retrieve multiple deep nested values that
     *                                  ['can.be', 'done.with', 'this.notation'].
     *                                  A single deep value with a string.like.this.
     *                                  If not supplied, all columns will be operated on.
     *                                  If field_spec is a function, the function should
     *                                  return a map. The keys will be come the
     *                                  "column names" that will be used in the map that
     *                                  is returned.
     */
    static map(evts: any, multiFieldSpec?: string): {};
    /**
     * Takes a list of events and a reducer function and returns
     * a new Event with the result, for each column. The reducer is
     * of the form:
     * ```
     *     function sum(valueList) {
     *         return calcValue;
     *     }
     * ```
     * @param {map}         mapped      A map, as produced from map()
     * @param {function}    reducer     The reducer function
     */
    static reduce(mapped: any, reducer: any): {};
    static mapReduce(events: any, multiFieldSpec: any, reducer: any): {};
}
export default Event;
