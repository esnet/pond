declare module "pondjs" {
    import { List, Map } from "immutable";
    import { Moment } from "moment";

    // =======================================================================================================
    // TimeRange
    // =======================================================================================================
    /**
         * A time range is a simple representation of a begin and end time, used to maintain consistency across an application.
         */
    export class TimeRange {
        constructor();

        // Another TimeRange (copy constructor)
        constructor(t: TimeRange);

        // An Immutable.List containing two Dates.
        constructor(l: List<Date>);

        // A Javascript array containing two Date or ms timestamps
        constructor(d: Date[] | string[]);

        // Two arguments, begin and end, each of which may be a Data, a Moment, or a ms timestamp.
        constructor(b: string | Date | Moment, e: string | Date | Moment);

        /**
             * Returns the internal range, which is an Immutable List containing begin and end times.
             */
        range(): List<Date>;

        /**
             * Returns the TimeRange as JSON, which will be a Javascript array of two ms timestamps.
             */
        toJSON(): Array<number>;

        /**
             * Returns the TimeRange as a string, useful for serialization.
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
             * Returns a human friendly version of the TimeRange, e.g. "Aug 1, 2014 05:19:59 am to Aug 1, 2014 07:41:06 am"
             */
        humanize(): string;

        /**
             * Returns a human friendly version of the TimeRange
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
             * Sets a new begin time on the TimeRange. The result will be a new TimeRange.
             */
        setBegin(t: Date): TimeRange;

        /**
             * Sets a new end time on the TimeRange. The result will be a new TimeRange.
             */
        setEnd(t: Date): TimeRange;

        /**
             * Returns if the two TimeRanges can be considered equal, in that they have the same times.
             */
        equals(other: TimeRange): boolean;

        /**
             * Returns true if other is completely inside this.
             */
        contains(other: TimeRange): boolean;

        /**
             * Returns true if this TimeRange is completely within the supplied other TimeRange.
             */
        within(other: TimeRange): boolean;

        /**
             * Returns true if the passed in other TimeRange overlaps this time Range.
             */
        overlaps(other: TimeRange): boolean;

        /**
             * Returns true if the passed in other Range in no way overlaps this time Range.
             */
        disjoint(other: TimeRange): boolean;

        /**
             * A new Timerange which covers the extents of this and other combined
             */
        extents(other: TimeRange): TimeRange;

        /**
             * A new TimeRange which represents the intersection (overlapping) part of this and other.
             */
        intersection(other: TimeRange): TimeRange;

        /**
             * The duration of the TimeRange in milliseconds.
             */
        duration(): number;

        /**
             *  A user friendly version of the duration
             */
        humanizeDuration(): string;

        /**
             * The last day, as a TimeRange
             */
        static lastDay(): TimeRange;

        /**
             *  The last seven days, as a TimeRange
             */
        static lastSevenDays(): TimeRange;

        /**
             * The last thirty days, as a TimeRange
             */
        static lastThirtyDays(): TimeRange;

        /**
             * The last month, as a TimeRange
             */
        static lastMonth(): TimeRange;

        /**
             * The last 90 days, as a TimeRange
             */
        static lastNinetyDays(): TimeRange;

        /**
             * The last year, as a TimeRange
             */
        static lastYear(): TimeRange;
    }

    // =======================================================================================================
    //  Index
    // =======================================================================================================

    /**
         * An index is simply a string that represents a fixed range of time.
         * There are two basic types:
         * -> Multiplier index - the number of some unit of time (hours, days etc) since the UNIX epoch.
         * -> Calendar index - The second represents a calendar range, such as Oct 2014.
         *
         * For the first type, a multiplier index, an example might be:
         *
         *     1d-12355      //  30th Oct 2003 (GMT), the 12355th day since the UNIX epoch
         * You can also use seconds (e.g. 30s), minutes (e.g. 5m), hours (e.g. 1h) or days (e.g. 7d).
         *
         * Here are several examples of a calendar index:
         *
         *     2003-10-30    // 30th Oct 2003
         *     2014-09       // Sept 2014
         *     2015          // All of the year 2015
         *
         * An Index is a nice representation of certain types of time intervals because it can be cached with its string representation as a key.
         * A specific chunk of time, and associated data can be looked up based on that string. It also allows us to represent things like months, which have variable length.
         *
         * An Index is also useful when collecting into specific time ranges, for example generating all the 5 min ("5m") maximum rollups within a specific day ("1d"). See the processing section within these
         * docs.
         */
    export class Index {
        /**
             * Returns the Index as JSON, which will just be its string representation
             */
        toJSON(): string;

        /**
             * Simply returns the Index as its string
             */
        toString(): string;

        /**
             * for the calendar range style Indexes, this lets you return that calendar range as a human readable format, e.g. "June, 2014". The format specified is a Moment.format.
             */
        toNiceString(): string;

        /**
             * Alias for toString()
             */
        asString(): string;

        /**
             * Returns the Index as a TimeRange
             */
        asTimerange(): string;

        /**
             * Returns the start date of the Index
             */
        begin(): string;

        /**
             *Returns the end date of the Index
             */
        end(): string;

        /**
             *  Return the index string given an index prefix and a datetime object.
             */
        static getIndexString(): string;

        /**
             *  Given the time range, return a list of strings of index values every tick.
             */
        static getIndexStringList(): string;

        /**
             * Generate an index string with day granularity.
             */
        static getDailyIndexString(): string;

        /**
             * Generate an index string with month granularity.
             */
        static getMonthlyIndexString(): string;

        /**
             * Generate an index string with year granularity.
             */
        static getYearlyIndexString(): string;
    }

    // =======================================================================================================
    //  Event
    // =======================================================================================================

    /**
         * There are three types of Events in Pond:
         *      Event - a generic event which associates a timestamp with some data
         *      TimeRangeEvent - associates a TimeRange with some data
         *      IndexedEvent - associates a time range specified as an Index
         *
         * Construction
         * The creation of an Event is done by combining two parts: the timestamp (or time range, or Index...) and the data, along with an optional key which is described below. For a basic Event, you
         * specify the timestamp as either a Javascript Date object, a Moment, or the number of milliseconds since the UNIX epoch. For a TimeRangeEvent, you specify a TimeRange, along with the data. For a
         * IndexedEvent, you specify an Index, along with the data, and if the event should be considered to be in UTC time or not.
         *
         * To specify the data you can supply: a Javascript object of key/values. The object may contained nested data. an Immutable.Map a simple type such as an integer. This is a shorthand for supplying
         * {"value": v}. Example:*
         *
         *
         * Given some source of data that looks like this:
         *
         * const sampleEvent = {
         *     "start_time": "2015-04-22T03:30:00Z",
         *     "end_time": "2015-04-22T13:00:00Z",
         *     "description": "At 13:33 pacific circuit 06519 went down.",
         *     "title": "STAR-CR5 - Outage",
         *     "completed": true,
         *     "external_ticket": "",
         *     "esnet_ticket": "ESNET-20150421-013",
         *     "organization": "Internet2 / Level 3",
         *     "type": "U"
         * }
         *
         * We first extract the begin and end times to build a TimeRange:
         *  let b = new Date(sampleEvent.start_time);
         *  let e = new Date(sampleEvent.end_time);
         *  let timerange = new TimeRange(b, e);
         * Then we combine the TimeRange and the event itself to create the Event.
         *  let outageEvent = new TimeRangeEvent(timerange, sampleEvent);
         *
         * Once we have an event we can get access the time range with:
         *  outageEvent.begin().getTime()   // 1429673400000
         *  outageEvent.end().getTime())    // 1429707600000
         *  outageEvent.humanizeDuration()) // "10 hours"
         * And we can access the data like so:
         *  outageEvent.get("title")  // "STAR-CR5 - Outage"
         *
         * Or use:
         *  outageEvent.data()
         * to fetch the whole data object, which will be an Immutable Map.
         */
    export class Event {
        /**
             *  The creation of an Event is done by combining two parts: the timestamp and the data.
             * To construct you specify the timestamp as either:
             *  - Javascript Date object
             *  - a Moment, or
             *  - millisecond timestamp: the number of ms since the UNIX epoch
             * To specify the data you can supply either:
             *  - a Javascript object containing key values pairs
             *  - an Immutable.Map, or
             *  - a simple type such as an integer. In the case of the simple type this is a shorthand for supplying {"value": v}.
             */
        constructor(
            arg1: Date | Moment | number,
            arg2: any | Map<any, any> | number
        );

        /**
             * Returns the Event as a JSON object, essentially: {time: t, data: {key: value, ...}}
             */
        toJSON(): any;

        /**
             * Returns the Event as a string, useful for serialization.
             */
        toString(): string;

        /**
             * Returns a flat array starting with the timestamp, followed by the values.
             */
        toPoint(): any[];

        /**
             * The timestamp of this data, in UTC time, as a string.
             */
        timestampAsUTCString(): string;

        /**
             * The timestamp of this data, in Local time, as a string.
             */
        timestampAsLocalString(): string;

        /**
             * The timestamp of this data
             */
        timestamp(): any;

        /**
             * The begin time of this Event, which will be just the timestamp
             */
        begin(): any;

        /**
             * The end time of this Event, which will be just the timestamp
             */
        end(): any;

        /**
             * Direct access to the event data. The result will be an Immutable.Map
             */
        data(): any;

        /**
             * Sets the data portion of the event and returns a new Event.
             */
        setData(): void;

        /**
             * Get specific data out of the Event. The data will be converted to a js object. You can use a fieldPath to address deep data.
             * Params:
             *      fieldPath Array - Name of value to look up. If not provided, defaults to ['value']. "Deep" syntax is ['deep', 'value'] or 'deep.value.'
             */
        get(fieldPath: string[] | string): any;

        /**
             * Get specific data out of the Event. Alias for get(). The data will be converted to a js object. You can use a fieldPath to address deep data.
             * Params:
             *      fieldPath Array - Name of value to look up. If not provided, defaults to ['value']. "Deep" syntax is ['deep', 'value'] or 'deep.value.'
             */
        value(fieldPath: string[] | string): any;

        /**
             * Turn the Collection data into a string
             */
        stringify(): string;

        /**
             * Collapses this event's columns, represented by the fieldSpecList into a single column. The collapsing itself is done with the reducer function. Optionally the collapsed column could be appended to the existing columns, or replace them (the default).
             */
        collapse(): void;

        /**
             * The same as Event.value() only it will return false if the value is either undefined, NaN or Null.
             * Params:
             *      event Event - The Event to check
             *      The string | array - field to check
             */
        static isValidValue(event: Event, The: string | string[]): void;

        /**
             * Function to select specific fields of an event using a fieldPath and return a new event with just those fields
             * The fieldPath currently can be:
             *      A single field name
             *      An array of field names
             * The function returns a new event.
             */
        static selector(fieldPath: string | string[]): Event;

        /**
             * Combines multiple events with the same time together to form a new event. Doesn't currently work on IndexedEvents or TimeRangeEvents.
             * Params:
             *      events array - Array of event objects
             *      fieldSpec string | array - Column or columns to look up. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a string.like.this. If not supplied, all columns will be operated on.
             *      reducer function - Reducer function to apply to column data.
             */
        static combine(
            events: Event[],
            fieldSpec: string | string[],
            reducer: Function
        ): void;

        /**
             * Sum takes multiple events, groups them by timestamp, and uses combine() to add them together. If the events do not have the same timestamp an exception will be thrown.
             * Params:
             * events array - Array of event objects
             * fieldSpec string | array - Column or columns to look up. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a
             * string.like.this. If not supplied, all columns will be operated on.
             */
        static sum(events: Event[], fieldSpec: string | string[]): void;

        /**
             * Sum takes multiple events, groups them by timestamp, and uses combine() to average them. If the events do not have the same timestamp an exception will be thrown.
             * Params:
             *      events array - Array of event objects
             *      fieldSpec string | array - Column or columns to look up. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a string.like.this. If not supplied, all columns will be operated on.
             */
        static avg(events: any, fieldSpec: any): void;

        /**
             * Maps a list of events according to the fieldSpec passed in. The spec maybe a single field name, a list of field names, or a function that takes an event and returns a key/value pair.
             * Params:
             *      fieldSpec string | array - Column or columns to look up. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a string.like.this. If not supplied, all columns will be operated on. If field_spec is a function, the function should return a map. The keys will be come the "column names" that will be used in the map that is returned.
             */
        static map(fieldSpec: string | string[]): void;

        /**
             * Takes a list of events and a reducer function and returns a new Event with the result, for each column. The reducer is of the form:
             *     function sum(valueList) {
             *         return calcValue;
             *     }
             * Params:
             *      mapped map - A map, as produced from map()
             *      reducer function - The reducer function
             */
        static reduce(mapped: Map<any, any>, reducer: Function): void;
    }

    // =======================================================================================================
    //  TimeRangeEvent
    // =======================================================================================================

    /**
         * A TimeRangeEvent uses a TimeRange to specify the range over which the event occurs and maps that to a data object representing some measurements or metrics during that time range.
         *
         * You supply the timerange as a TimeRange object.
         *
         * The data is also specified during construction and me be either:
         *
         *
         * a Javascript object or simple type
         * an Immutable.Map.
         * Simple measurement
         * If an Javascript object is provided it will be stored internally as an Immutable Map. If the data provided is some other simple type (such as an integer) then it will be equivalent to supplying an
         * object of {value: data}. Data may also be undefined.
         *
         * To get the data out of an TimeRangeEvent instance use data(). It will return an Immutable.Map. Alternatively you can call toJSON() to return a Javascript object representation of the data, while
         * toString() will serialize the entire event to a string.
         *
         */
    export class TimeRangeEvent {
        /**
             * The creation of an TimeRangeEvent is done by combining two parts: the timerange and the data.
             * To construct you specify a TimeRange, along with the data.
             * To specify the data you can supply either:
             * - a Javascript object containing key values pairs
             * - an Immutable.Map, or
             * - a simple type such as an integer.
             * In the case of the simple type this is a shorthand for supplying {"value": v}.
             */
        constructor(arg1: any, arg2: any);

        /**
             * Returns a flat array starting with the timestamp, followed by the values.
             */
        toPoint(): any[];

        /**
             * The TimeRange of this data
             */
        timerange(): TimeRange;

        /**
             * Access the event data
             */
        data(): Map<any, any>;

        /**
             * Sets the data portion of the event and returns a new
             */
        setData(data: any): void;

        /**
             * The TimeRange of this data, in UTC, as a string.
             */
        timerangeAsUTCString(): string;

        /**
             * The TimeRange of this data, in Local time, as a string.
             */
        timerangeAsLocalString(): string;

        /**
             * The begin time of this Event
             */
        begin(): any;

        /**
             * The end time of this Event
             */
        end(): any;

        /**
             * Alias for the begin() time.
             */
        timestamp(): any;

        /**
             * Get specific data out of the Event. The data will be converted to a js object. You can use a fieldSpec to address deep data. A fieldSpec could be "a.b"
             */
        get(fieldSpec: string | string[]): any;

        /**
             * Collapses this event's columns, represented by the fieldSpecList into a single column.
             * The collapsing itself is done with the reducer function. Optionally the collapsed column could be appended to the existing columns, or replace them (the default).
             */
        collapse(
            fieldSpecList: string | string[],
            name: any,
            reducer: Function
        ): void;
    }

    // =======================================================================================================
    //  IndexedEvent
    // =======================================================================================================

    /**
         * An IndexedEvent uses an Index to specify a timerange over which the event occurs and maps that to a data object representing some measurement or metric during that time range.
         *
         * You can supply the index as a string or as an Index object.
         *
         * Example Indexes are: - 1d-1565 is the entire duration of the 1565th day since the UNIX epoch - 2014-03 is the entire duration of march in 2014
         *
         * The range, as expressed by the Index, is provided by the convenience method range(), which returns a TimeRange instance. Alternatively the begin and end times represented by the Index can be found with begin() and end() respectively.
         * The data is also specified during construction, and is generally expected to be an object or an Immutable.Map. If an object is provided it will be stored internally as an ImmutableMap. If the data provided is some other type then it will be equivalent to supplying an object of {value: data}. Data may be undefined.
         *
         * The get the data out of an IndexedEvent instance use data(). It will return an Immutable.Map.
         */
    export class IndexedEvent {
        /**
             * The creation of an IndexedEvent is done by combining two parts: the timerange and the data.
             * To construct you specify a TimeRange, along with the data.
             * To specify the data you can supply either:
             * - a Javascript object containing key values pairs
             * - an Immutable.Map, or
             * - a simple type such as an integer.
             * In the case of the simple type this is a shorthand for supplying {"value": v}.
             */
        constructor(arg1: any, arg2: any, arg3: any);

        /**
             * Returns a flat array starting with the timestamp, followed by the values.
             */
        toPoint(): any[];

        /**
             * The TimeRange of this data
             */
        timerange(): TimeRange;

        /**
             * Returns the Index associated with the data in this Event
             */
        index(): Index;

        /**
             * Access the event data
             */
        data(): Map<any, any>;

        /**
             * Sets the data portion of the event and returns a new
             */
        setData(data: any): void;

        /**
             * Returns the Index as a string, same as event.index().toString()
             */
        indexAsString(): string;

        /**
             * The TimeRange of this data, in UTC, as a string.
             */
        timerangeAsUTCString(): string;

        /**
             * The TimeRange of this data, in Local time, as a string.
             */
        timerangeAsLocalString(): string;

        /**
             * The begin time of this Event
             */
        begin(): any;

        /**
             * The end time of this Event
             */
        end(): any;

        /**
             * Alias for the begin() time.
             */
        timestamp(): any;

        /**
             * Get specific data out of the Event. The data will be converted to a js object. You can use a fieldSpec to address deep data. A fieldSpec could be "a.b"
             */
        get(fieldSpec: string | string[]): any;

        /**
             * Collapses this event's columns, represented by the fieldSpecList into a single column.
             * The collapsing itself is done with the reducer function. Optionally the collapsed column could be appended to the existing columns, or replace them (the default).
             */
        collapse(
            fieldSpecList: string | string[],
            name: any,
            reducer: Function
        ): void;
    }

    // =======================================================================================================
    //  Collection
    // =======================================================================================================

    /**
         * A collection is an abstraction for a bag of Events.
         * You typically construct a Collection from a list of Events, which may be either within an Immutable.List or an Array. You can also copy another Collection or create an empty one.
         * You can mutate a collection in a number of ways. In each instance a new Collection will be returned.
         * Basic operations on the list of events are also possible. You can iterate over the collection with a for..of loop, get the size() of the collection and access a specific element with at().
         * You can also perform aggregations of the events, map them, filter them clean them, etc.
         * Collections form the backing structure for a TimeSeries, as well as in Pipeline event processing. They are an instance of a BoundedIn, so they can be used as a pipeline source.
         */

    export class Collection {
        /**
             * Construct a new Collection.
             * Params:
             *      arg1 Collection | array | Immutable.List - Initial data for the collection. If arg1 is another Collection, this will act as a copy constructor.
             *      [arg2] Boolean - When using a the copy constructor this specified whether or not to also copy all the events in this collection. Generally you'll want to let it copy the events. If arg1 is an Immutable.List, then arg2 will specify the type of the Events accepted into the Collection. This form is generally used internally.
             */
        constructor(arg1: Collection | any[] | List<any>, arg2: boolean);

        /**
             * Returns the Collection as a regular JSON object.
             */
        toJSON(): any;

        /**
             * Serialize out the Collection as a string. This will be the string representation of toJSON().
             */
        toString(): string;

        /**
             * Returns the Event object type in this Collection.
             * Since Collections may only have one type of event (Event, IndexedEvent or TimeRangeEvent) this will return that type. If no events have been added to the Collection it will return undefined.
             */
        type(): Event | IndexedEvent | TimeRangeEvent;

        /**
             * Returns the number of events in this collection
             */
        size(): number;

        /**
             * Returns the number of valid items in this collection.
             * Uses the fieldPath to look up values in all events. It then counts the number that are considered valid, which specifically are not NaN, undefined or null.
             */
        sizeValid(fieldPath: string | string[]): number;

        /**
             * Returns an event in the Collection by its position.
             * Params
             *      pos number - The position of the event
             * Example
             *
             * for (let row=0; row < series.size(); row++) {
             *   const event = series.at(row);
             *   console.log(event.toString());
             * }
             */
        at(pos: number): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Returns an event in the Collection by its time. This is the same as calling bisect first and then using at with the index.
             * Params
             *      time Date - The time of the event.
             */
        atTime(time: Date): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Returns the first event in the Collection.
             */
        atFirst(): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Returns the last event in the Collection.
             */
        atLast(): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Returns the index that bisects the Collection at the time specified.
             * Params
             *      t Date - The time to bisect the Collection with
             *      b number - The position to begin searching at
             */
        bisect(t: Date, b: number): number;

        /**
             * Generator to return all the events in the Collection.
             * Example
             *
             * for (let event of collection.events()) {
             *     console.log(event.toString());
             * }
             */
        events(): Event[] | TimeRangeEvent[] | IndexedEvent[];

        /**
             * Returns the raw Immutable event list
             */
        eventList(): List<Event | TimeRangeEvent | IndexedEvent>;

        /**
             * Returns: Array - All events as a Javascript Array.
             */
        eventListAsArray():
            | Array<Event>
            | Array<TimeRangeEvent>
            | Array<IndexedEvent>;

        /**
             * Sorts the Collection using the value referenced by the fieldPath.
             */
        sort(): TimeRange;

        /**
             * From the range of times, or Indexes within the TimeSeries, return the extents of the TimeSeries as a TimeRange. This is currently implemented by walking the events.
             * Returns: TimeRange - The extents of the TimeSeries
             */
        range(): TimeRange;

        /**
             * Adds an event to the collection, returns a new Collection. The event added can be an Event, TimeRangeEvent or IndexedEvent, but it must be of the same type as other events within the Collection.
             * Returns: Collection - A new, modified, Collection containing the new event.
             * Params
             *      event Event | TimeRangeEvent | IndexedEvent - The event being added.
             */
        addEvent(event: Event | TimeRangeEvent | IndexedEvent): Collection;

        /**
             * Perform a slice of events within the Collection, returns a new Collection representing a portion of this TimeSeries from begin up to but not including end.
             * Returns: Collection - The new, sliced, Collection.
             * Params
             *      begin Number - The position to begin slicing
             *      end Number - The position to end slicing
             */
        slice(begin: number, end: number): Collection;

        /**
             * Filter the collection's event list with the supplied function
             * Returns: Collection - A new, filtered, Collection.
             * Params
             * func function - The filter function, that should return true or false when passed in an event.
             */
        filter(f: Function): Collection;

        /**
             * Map the collection's event list to a new event list with the supplied function.
             * Returns: Collection - A new, modified, Collection.
             * Params
             *      func function - The mapping function, that should return a new event when passed in the old event.
             */
        map(f: Function): Collection;

        /**
             * Returns a new Collection by testing the fieldPath values for being valid (not NaN, null or undefined). The resulting Collection will be clean (for that fieldPath).
             * Returns: Collection - A new, modified, Collection.
             * Params
             *      fieldPath string - Name of value to look up. If not supplied, defaults to ['value']. "Deep" syntax is ['deep', 'value'] or 'deep.value'
             */
        clean(fieldPath: string | string[]): Collection;

        /**
             * Returns the number of events in this collection
             */
        count(): number;

        /**
             * Returns the first value in the Collection for the fieldspec
             * Returns: number - The first value
             * Params
             *      fieldPath string - Column to find the first value of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        first(fieldPath: string | string[], filter: Function): number;

        /**
             * Returns the last value in the Collection for the fieldspec
             * Returns: number - The last value
             * Params
             *      fieldPath string - Column to find the last value of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        last(fieldPath: string | string[], filter: Function): number;

        /**
             * Returns the sum of the Collection for the fieldspec
             * Params
             *      fieldPath string - Column to find the sum of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        sum(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their average(s)
             * Params
             *      fieldPath string - Column to find the avg of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        avg(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their maximum value
             * Returns: the max value for the field
             * Params
             *      fieldPath string - Column to find the max of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        max(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their minimum value.
             * Returns: the min value for the field
             * Params
             *      fieldPath string - Column to find the min of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        min(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their mean (same as avg).
             * Returns: The mean
             * Params
             *      fieldPath string - Column to find the mean of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        mean(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their minimum value.
             * Returns: the median value
             * Params
             *      fieldPath string - Column to find the median of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        median(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their stdev.
             * Returns: The resulting stdev value
             * Params
             *      fieldPath string - Column to find the stdev of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        stdev(fieldPath: string | string[], filter: Function): number;

        /**
             * Gets percentile q within the Collection. This works the same way as numpy.
             * Returns: The percentile
             * Params
             *      q integer - The percentile (should be between 0 and 100)
             *      fieldPath string - Column to find the percentile of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      interp string = "linear" - Specifies the interpolation method to use when the desired quantile lies between two data points. Options are: options are: * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j. * lower: i. * higher: j. * nearest: i or j whichever is nearest. * midpoint: (i + j) / 2.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        percentile(
            q: number,
            fieldPath: string | string[],
            interp: "linear" | "lower" | "higher" | "nearest" | "midpoint",
            filter: Function
        ): number;

        /**
             * Aggregates the events down using a user defined function to do the reduction.
             * Returns: the resulting value
             * Params
             *      func function - User defined reduction function. Will be passed a list of values. Should return a singe value.
             *      fieldPath String - The field to aggregate over
             */
        aggregate(func: Function, fieldPath: string | string[]): number;

        /**
             * Gets n quantiles within the Collection. This works the same way as numpy.
             * Returns: an array of n quantiles
             * Params
             *      n integer - The number of quantiles to divide the Collection into.
             *      column string = "value" - The field to return as the quantile
             *      interp string = "linear" - Specifies the interpolation method to use when the desired quantile lies between two data points. Options are: options are: * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j. * lower: i. * higher: j. * nearest: i or j whichever is nearest. * midpoint: (i + j) / 2.
             */
        quantile(
            n: number,
            column: string,
            interp: "linear" | "lower" | "higher" | "nearest" | "midpoint"
        ): Array<any>;

        /**
             * Returns true if all events in this Collection are in chronological order, oldest events to newest.
             */
        isChronological(): boolean;

        /**
             * Static function to compare two collections to each other. If the collections are of the same instance as each other then equals will return true.
             */
        equal(collection1: Collection, collection2: Collection): boolean;

        /**
             * Static function to compare two collections to each other. If the collections are of the same value as each other then equals will return true.
             */
        is(collection1: Collection, collection2: Collection): boolean;
    }

    // =======================================================================================================
    //  TimeSeries
    // =======================================================================================================

    /**
         * A TimeSeries represents a series of events, with each event being a combination of:
         *
         * time (or TimeRange, or Index)
         * data - corresponding set of key/values.
         *
         * Construction
         * Currently you can initialize a TimeSeries with either a list of events, or with a data format that looks like this:
         * const data = {
         *     name: "trafficc",
         *     columns: ["time", "value"],
         *     points: [
         *         [1400425947000, 52],
         *         [1400425948000, 18],
         *         [1400425949000, 26],
         *         [1400425950000, 93],
         *         ...
         *     ]
         * };
         *
         * To create a new TimeSeries object from the above format, simply use the constructor:
         *
         * var series = new TimeSeries(data);
         * The format of the data is as follows:
         * name - optional, but a good practice
         * columns - are necessary and give labels to the data in the points.
         * points - are an array of tuples. Each row is at a different time (or timerange), and each value corresponds to the column labels.
         *
         * As just hinted at, the first column may actually be:
         * "time"
         * "timeRange" represented by a TimeRange
         * "index" - a time range represented by an Index. By using an index it is possible, for example, to refer to a specific month:
         * var availabilityData = {
         *     name: "Last 3 months availability",
         *     columns: ["index", "uptime"],
         *     points: [
         *         ["2015-06", "100%"], // <-- 2015-06 specified here represents June 2015
         *         ["2015-05", "92%"],
         *         ["2015-04", "87%"],
         *     ]
         * };
         *
         * Alternatively, you can construct a TimeSeries with a list of events. These may be Events, TimeRangeEvents or IndexedEvents. Here's an example of that:
         *
         * const events = [];
         * events.push(new Event(new Date(2015, 7, 1), {value: 27}));
         * events.push(new Event(new Date(2015, 8, 1), {value: 29}));
         * const series = new TimeSeries({
         *     name: "avg temps",
         *     events: events
         * });
         *
         * Nested data
         * The values do not have to be simple types like the above examples. Here's an example where each value is itself an object with "in" and "out" keys:
         *
         * const series = new TimeSeries({
         *     name: "Map Traffic",
         *     columns: ["time", "NASA_north", "NASA_south"],
         *     points: [
         *         [1400425951000, {in: 100, out: 200}, {in: 145, out: 135}],
         *         [1400425952000, {in: 200, out: 400}, {in: 146, out: 142}],
         *         [1400425953000, {in: 300, out: 600}, {in: 147, out: 158}],
         *         [1400425954000, {in: 400, out: 800}, {in: 155, out: 175}],
         *     ]
         * });
         *
         * Complex data is stored in an Immutable structure. To get a value out of nested data like this you will get the Event you want (by row), as usual, and then use get() to fetch the value by column
         * name. The result of this call will be a JSON copy of the Immutable data so you can query deeper in the usual way:
         * series.at(0).get("NASA_north")["in"]  // 200`
         *
         * It is then possible to use a value mapper function when calculating different properties. For example, to get the average "in" value of the NASA_north column:
         * series.avg("NASA_north", d => d.in);  // 250
         */

    export class TimeSeries {
        constructor(
            arg:
                | {
                      name: string;
                      utc?: boolean;
                      events: Event[] | IndexedEvent[] | TimeRangeEvent[];
                  }
                | {
                      name: string;
                      utc?: boolean;
                      columns: string[];
                      points: any[];
                  }
                | {
                      name: string;
                      utc?: boolean;
                      collection: Collection;
                  }
        );

        /**
             * Turn the TimeSeries into regular javascript objects
             */
        toJSON(): any;

        /**
             * Represent the TimeSeries as a string
             */
        toString(): string;

        /**
             * Returns the extents of the TimeSeries as a TimeRange.
             */
        timerange(): TimeRange;

        /**
             * Gets the earliest time represented in the TimeSeries.
             */
        begin(): Date;

        /**
             * Gets the latest time represented in the TimeSeries.
             */
        end(): Date;

        /**
             * Access a specific TimeSeries event via its position.
             * Params
             *      pos number - The event position
             */
        at(pos: number): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Returns an event in the series by its time. This is the same as calling bisect first and then using at with the index.
             * Params
             *      time Date - The time of the event.
             */
        atTime(time: Date): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Returns the first event in the series.
             */
        atFirst(): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Returns the last event in the series.
             */
        atLast(): Event | TimeRangeEvent | IndexedEvent;

        /**
             * Generator to return all the events in the series.
             * Example
             *
             * for (let event of series.events()) {
             *     console.log(event.toString());
             * }
             */
        events():
            | Enumerator<Event>
            | Enumerator<TimeRangeEvent>
            | Enumerator<IndexedEvent>;

        /**
             * Sets a new underlying collection for this TimeSeries.
             * Returns: TimeSeries - A new TimeSeries
             * Params
             *      collection Collection - The new collection
             *      isChronological boolean = false - Causes the chronological order of the events to not be checked
             */
        setCollection(
            collection: Collection,
            isChronological: boolean
        ): TimeSeries;

        /**
             * Returns the index that bisects the TimeSeries at the time specified.
             * Returns: The row number that is the greatest, but still below t.
             * Params
             *      t Date - The time to bisect the TimeSeries with
             *      b number - The position to begin searching at
             */
        bisect(t: Date, b: number): number;

        /**
             * Perform a slice of events within the TimeSeries, returns a new TimeSeries representing a portion of this TimeSeries from begin up to but not including end.
             * Returns: TimeSeries - The new, sliced, TimeSeries.
             * Params
             *      begin Number - The position to begin slicing
             *      end Number - The position to end slicing
             */
        slice(begin: number, end: number): TimeSeries;

        /**
             * Crop the TimeSeries to the specified TimeRange and return a new TimeSeries.
             * Returns: TimeSeries - The new, cropped, TimeSeries.
             * Params
             *      timerange TimeRange - The bounds of the new TimeSeries
             */
        crop(timerange: TimeRange): TimeSeries;

        /**
             * Returns a new TimeSeries by testing the fieldPath values for being valid (not NaN, null or undefined).
             * The resulting TimeSeries will be clean (for that fieldPath).
             * Returns: TimeSeries - A new, modified, TimeSeries.
             * Params
             *      fieldPath string - Name of value to look up. If not supplied, defaults to ['value']. "Deep" syntax is ['deep', 'value'] or 'deep.value'
             */
        clean(fieldPath: string | string[]): TimeSeries;

        /**
             * Fetch the timeseries name.
             */
        name(): string;

        /**
             * Rename the timeseries.
             */
        setName(name: string): void;

        /**
             * Fetch the timeseries Index, if it has one.
             */
        index(): Index;

        /**
             * Fetch the timeseries Index, as a string, if it has one.
             */
        indexAsString(): string;

        /**
             * Fetch the timeseries Index, as a TimeRange, if it has one.
             */
        indexAsRange(): TimeRange;

        /**
             * Fetch the UTC flag, i.e. are the events in this TimeSeries in UTC or local time
             * (if they are IndexedEvents an event might be "2014-08-31".
             * The actual time range of that representation depends on where you are. Pond supports thinking about that in either as a UTC day, or a local day).
             */
        isUTC(): boolean;

        /**
             * Fetch the list of column names. This is determined by traversing though the events and collecting the set.
             * Note: the order is not defined
             * Returns: array - List of columns
             */
        columns(): string[];

        /**
             * Returns the internal collection of events for this TimeSeries
             */
        collection(): Collection;

        /**
             * Returns the meta data about this TimeSeries as a JSON object. Any extra data supplied to the TimeSeries constructor will be placed in the meta data object. This returns either all of that data as a JSON object, or a specific key if key is supplied.
             * Returns: The meta data
             * Params
             *      key string - Optional specific part of the meta data
             */
        meta(key: string): any;

        /**
             * Rename the timeseries
             */
        setMeta(meta: string): void;

        /**
             * Returns the number of events in this TimeSeries
            Returns: number - Count of events
             */
        size(): number;

        /**
             * Returns the number of valid items in this TimeSeries. Uses the fieldSpec to look up values in all events.
             * It then counts the number that are considered valid, which specifically are not NaN, undefined or null.
             */
        sizeValid(): number;

        /**
             * Returns the number of events in this TimeSeries. Alias for size().
             */
        count(): number;

        /**
             * Returns the sum for the fieldspec
             * Returns: The sum
             * Params
             *      fieldPath string - Column to find the stdev of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        sum(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their maximum value.
             * Returns: the max value for the field
             * Params
             *      fieldPath string - Column to find the max of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             */
        max(fieldPath: string | string[]): number;

        /**
             * Aggregates the events down to their minimum value.
             * Returns: number - The min value for the field
             * Params
             *      fieldPath string - Column to find the min of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        min(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events in the TimeSeries down to their average.
             * Returns: number - The average
             * Params
             *      fieldPath string - Column to find the avg of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        avg(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events in the TimeSeries down to their mean (same as avg).
             * Returns: number - The mean
             * Params
             *      fieldPath string - Column to find the mean of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        mean(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their medium value.
             * Returns: number - The resulting median value
             * Params
             *      fieldPath string - Column to find the median of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating

             */
        median(fieldPath: string | string[], filter: Function): number;

        /**
             * Aggregates the events down to their stdev.
             * Returns: number - The resulting stdev value
             * Params
             *      fieldPath string - Column to find the stdev of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      filter function - Optional filter function used to clean data before aggregating
             */
        stdev(fieldPath: string | string[], filter: Function): number;

        /**
             * Gets percentile q within the TimeSeries. This works the same way as numpy.
             * Returns: number - The percentile
             * Params
             *      q integer - The percentile (should be between 0 and 100)
             *      fieldPath string - Column to find the qth percentile of. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      interp string = "linear" - Specifies the interpolation method to use when the desired quantile lies between two data points. Options are: "linear", "lower", "higher", "nearest", "midpoint"
             *      filter function - Optional filter function used to clean data before aggregating
             */
        percentile(
            q: number,
            fieldPath: string | string[],
            interpinterp:
                | "linear"
                | "lower"
                | "higher"
                | "nearest"
                | "midpoint",
            filter: Function
        ): number;

        /**
             * Aggregates the events down using a user defined function to do the reduction.
             * Returns: number - The resulting value
             * Params
             *      func function - User defined reduction function. Will be passed a list of values. Should return a singe value.
             *      fieldPath string - Column to aggregate over. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             */
        aggregate(func: Function, fieldPath: string | string[]): number;

        /**
             * Gets n quantiles within the TimeSeries. This works the same way as numpy's percentile(). For example timeseries.quantile(4) would be the same as using percentile with q = 0.25, 0.5 and 0.75.
             * Returns: array - An array of n quantiles
             * Params
             *      n integer - The number of quantiles to divide the TimeSeries into.
             *      fieldPath string - Column to calculate over. A deep value can be referenced with a string.like.this. If not supplied the value column will be aggregated.
             *      interp string - Specifies the interpolation method to use when the desired quantile lies between two data points. Options are: "linear", "lower", "higher", "nearest", "midpoint".
             */
        quantile(
            n: number,
            fieldPath: string | string[],
            interpinterp: "linear" | "lower" | "higher" | "nearest" | "midpoint"
        ): any[];

        /**
             * Returns a new Pipeline with input source being initialized to this TimeSeries collection. This allows pipeline operations to be chained directly onto the TimeSeries to produce a new TimeSeries or Event result.
             * Returns: Pipeline - The Pipeline.
             * Example
             *
             * pipeline:()=>;
             *     .offsetBy(1)
             *     .offsetBy(2)
             *     .to(CollectionOut, c => out = c);
             */
        pipeline(): PipelineClass;

        /**
             * Takes an operator that is used to remap events from this TimeSeries to a new set of Events.
             * Returns: TimeSeries - A TimeSeries containing the remapped events
             * Params
             *      operator function - An operator which will be passed each event and which should return a new event.
             */
        map(operator: Function): TimeSeries;

        /**
             * Takes a fieldSpec (list of column names) and outputs to the callback just those columns in a new TimeSeries.
             * Returns: TimeSeries - The resulting TimeSeries with renamed columns
             * Params
             *      options - An object containing options for the command
             *      .fieldSpec string | array - Column or columns to select into the new TimeSeries. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a string.like.this.
             * Example
             *
             *      const ts = timeseries.select({fieldSpec: ["uptime", "notes"]});
             */
        select(options: any): TimeSeries;

        /**
             * Takes a fieldSpecList (list of column names) and collapses them to a new column named name which is the reduction (using the reducer function) of the matched columns in the fieldSpecList.
             * The column may be appended to the existing columns, or replace them, based on the append boolean.
             * Returns: TimeSeries - The resulting collapsed TimeSeries
             * Params
             *      options - An object containing options:
             *          .fieldSpecList array - The list of columns to collapse. (required)
             *          .name string - The resulting collapsed column name (required)
             *          .reducer function - The reducer function (required)
             *          .append bool - Append the collapsed column, rather than replace
             * Example
             *
             *     const sums = ts.collapse({
             *          name: "sum_series",
             *          fieldSpecList: ["in", "out"],
             *          reducer: sum(),
             *          append: false
             *     });
             *
             */
        collapse(options: {
            fieldSpecList: string[];
            name: string;
            reducer: Function;
            append?: boolean;
        }): TimeSeries;

        /**
             * Rename columns in the underlying events.
             * Takes a object of columns to rename. Returns a new TimeSeries containing new events. Columns not in the dict will be retained and not renamed.
             * Returns: TimeSeries - The resulting TimeSeries with renamed columns
             * Note: As the name implies, this will only rename the main "top level" (ie: non-deep) columns. If you need more extravagant renaming, roll your own using TimeSeries.map().
             * Params
             *      options - An object containing options:
             *          .renameMap Object - Columns to rename.
             *  Example
             *
             * new_ts = ts.renameColumns({
             *     renameMap: {in: "new_in", out: "new_out"}
             * });
             */
        renameColumns(options: {
            renameMap: { in: string; out: string };
        }): TimeSeries;

        /**
             * Take the data in this TimeSeries and "fill" any missing or invalid values. This could be setting null values to zero so mathematical operations will succeed, interpolate a new value, or pad with
             * the previously given value.
             *
             * The fill() method takes a single options arg.
             *
             * Returns: TimeSeries - The resulting filled TimeSeries
             * Params
             *      options - An object containing options:
             *          .fieldSpec string | array - Column or columns to fill. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a string.like.this.
             *          .method string - "linear" or "pad" or "zero" style interpolation
             *          .limit number - The maximum number of points which should be interpolated onto missing points. You might set this to 2 if you are willing to fill 2 new points, and then beyond that leave data with missing values.
             *
             * Example
             *
             * const filled = timeseries.fill({
             *     fieldSpec: ["direction.in", "direction.out"],
             *     method: "zero",
             *     limit: 3
             * });
             *
             */
        fill(options: {
            fieldSpec: string | string[];
            method: "linear" | "pad" | "zero";
            limit: number;
        }): TimeSeries;

        /**
             * Align event values to regular time boundaries. The value at the boundary is interpolated. Only the new interpolated points are returned. If limit is reached nulls will be returned at each
             * boundary position.
             *
             * One use case for this is to modify irregular data (i.e. data that falls at slightly irregular times) so that it falls into a sequence of evenly spaced values. We use this to take data we get from
             * the network which is approximately every 30 second (:32, 1:02, 1:34, ...) and output data on exact 30 second boundaries (:30, 1:00, 1:30, ...).
             *
             * Another use case is data that might be already aligned to some regular interval, but that contains missing points. While fill() can be used to replace null values, align() can be used to add in
             * missing points completely. Those points can have an interpolated value, or by setting limit to 0, can be filled with nulls. This is really useful when downstream processing depends on complete
             * sequences.
             *
             * Returns: TimeSeries - The resulting aligned TimeSeries
             * Params
             *      options - An object containing options:
             *          .fieldSpec string | array - Column or columns to align. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a string.like.this.
             *          .period string - Spacing of aligned values. e.g. "6h" or "5m"
             *          .method string - "linear" or "pad" style interpolation to boundaries.
             *          .limit number - The maximum number of points which should be interpolated onto boundaries. You might set this to 2 if you are willing to interpolate 2 new points, and then beyond that
             * just emit nulls on the boundaries.
             *
             * Example
             *
             * const aligned = ts.align({
             *     fieldSpec: "value",
             *     period: "1m",
             *     method: "linear"
             * });
             */
        align(options: {
            fieldSpec: string | string[];
            period: string;
            method: "linear" | "pad";
            limit: number;
        }): TimeSeries;

        /**
             * Returns the derivative of the TimeSeries for the given columns. The result will be per second. Optionally you can substitute in null values if the rate is negative. This is useful when a negative
             * rate would be considered invalid.
             *
             * Returns: TimeSeries - The resulting TimeSeries containing calculated rates.
             * Params
             *      options - An object containing options:
             *          .fieldSpec string | array - Column or columns to get the rate of. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation'].
             *          .allowNegative bool - Will output null values for negative rates. This is useful if you are getting the rate of a counter that always goes up, except when perhaps it rolls around or
             *          resets.
             */
        rate(options: {
            fieldSpec: string | string[];
            allowNegative: boolean;
        }): TimeSeries;

        /**
             * Builds a new TimeSeries by dividing events within the TimeSeries across multiple fixed windows of size windowSize.
             *
             * Note that these are windows defined relative to Jan 1st, 1970, and are UTC, so this is best suited to smaller window sizes (hourly, 5m, 30s, 1s etc), or in situations where you don't care about
             * the specific window, just that the data is smaller.
             *
             * Each window then has an aggregation specification applied as aggregation. This specification describes a mapping of output fieldNames to aggregation functions and their fieldPath. For example:
             * {in_avg: {in: avg()}, out_avg: {out: avg()}}
             *
             * will aggregate both "in" and "out" using the average aggregation function and return the result as in_avg and out_avg.
             *
             * Returns: TimeSeries - The resulting rolled up TimeSeries
             * Params
             *      options - An object containing options:
             *          .windowSize string - The size of the window. e.g. "6h" or "5m"
             *          .aggregation object - The aggregation specification (see description above)
             *          .toEvents bool - Output as Events, rather than IndexedEvents
             *  Example
             *     const timeseries = new TimeSeries(data);
             *     const dailyAvg = timeseries.fixedWindowRollup({
             *         windowSize: "1d",
             *         aggregation: {value: {value: avg()}}
             *     });
             */
        fixedWindowRollup(options: {
            windowSize: string;
            aggregation: any;
            toEvents: boolean;
        }): TimeSeries;

        /**
             * Builds a new TimeSeries by dividing events into hours.
             *
             * Each window then has an aggregation specification aggregation applied. This specification describes a mapping of output fieldNames to aggregation functions and their fieldPath. For example:
             * {in_avg: {in: avg()}, out_avg: {out: avg()}}
             *
             * Returns: TimeSeries - The resulting rolled up TimeSeries
             * Params
             *      options - An object containing options:
             *          .toEvents bool - Convert the rollup events to Events, otherwise it will be returned as a TimeSeries of IndexedEvents.
             *          .aggregation object - The aggregation specification (see description above)
             */
        hourlyRollup(options: {
            aggregation: any;
            toEvents: boolean;
        }): TimeSeries;

        /**
             * Builds a new TimeSeries by dividing events into days.
             *
             * Each window then has an aggregation specification aggregation applied. This specification describes a mapping of output fieldNames to aggregation functions and their fieldPath. For example:
             * {in_avg: {in: avg()}, out_avg: {out: avg()}}
             *
             * Returns: TimeSeries - The resulting rolled up TimeSeries
             * Params
             *      options - An object containing options:
             *          .toEvents bool - Convert the rollup events to Events, otherwise it will be returned as a TimeSeries of IndexedEvents.
             *          .aggregation object - The aggregation specification (see description above)
             */
        dailyRollup(options: {
            aggregation: any;
            toEvents: boolean;
        }): TimeSeries;

        /**
             * Builds a new TimeSeries by dividing events into months.
             * Each window then has an aggregation specification aggregation applied. This specification describes a mapping of output fieldNames to aggregation functions and their fieldPath. For example:
             * {in_avg: {in: avg()}, out_avg: {out: avg()}}
             *
             * Returns: TimeSeries - The resulting rolled up TimeSeries
             * Params
             *      options - An object containing options:
             *          .toEvents bool - Convert the rollup events to Events, otherwise it will be returned as a TimeSeries of IndexedEvents.
             *          .aggregation object - The aggregation specification (see description above)
             */
        monthlyRollup(options: {
            aggregation: any;
            toEvents: boolean;
        }): TimeSeries;

        /**
             * Builds a new TimeSeries by dividing events into years.
             *
             * Each window then has an aggregation specification aggregation applied. This specification describes a mapping of output fieldNames to aggregation functions and their fieldPath. For example:
             * {in_avg: {in: avg()}, out_avg: {out: avg()}}
             *
             * Returns: TimeSeries - The resulting rolled up TimeSeries
             * Params
             *      options - An object containing options:
             *          .toEvents bool - Convert the rollup events to Events, otherwise it will be returned as a TimeSeries of IndexedEvents.
             *          .aggregation object - The aggregation specification (see description above)
             */
        yearlyRollup(options: {
            aggregation: any;
            toEvents: boolean;
        }): TimeSeries;

        /**
             * Builds multiple Collections, each collects together events within a window of size windowSize. Note that these are windows defined relative to Jan 1st, 1970, and are UTC.
             *
             * Returns: map - The result is a mapping from window index to a Collection.
             * Params
             *      options - An object containing options:
             *          .windowSize bool - The size of the window. e.g. "6h" or "5m"
             * Example
             *  const timeseries = new TimeSeries(data);
             *  const collections = timeseries.collectByFixedWindow({windowSize: "1d"});
             *  console.log(collections); // {1d-16314: Collection, 1d-16315: Collection, ...}
             */
        collectByFixedWindow(options: {
            windowSize: string;
        }): Map<Index, Collection>;

        /**
             * Static function to compare two TimeSeries to each other. If the TimeSeries are of the same instance as each other then equals will return true.
             *
             * Returns: bool - result
             * Params
             *      series1 TimeSeries
             *      series2 TimeSeries
             */
        equal(series1: TimeSeries, series2: TimeSeries): boolean;

        /**
             * Static function to compare two TimeSeries to each other. If the TimeSeries are of the same value as each other then equals will return true.
             * Returns: bool - result
             * Params
             *      series1 TimeSeries
             *      series2 TimeSeries
             */
        is(series1: TimeSeries, series2: TimeSeries): boolean;

        /**
             * Reduces a list of TimeSeries objects using a reducer function. This works by taking each event in each TimeSeries and collecting them together based on timestamp. All events for a given time are
             * then merged together using the reducer function to produce a new Event. Those Events are then collected together to form a new TimeSeries.
             *
             * Returns: TimeSeries - The reduced TimeSeries
             * Params
             *      options - An object containing options. Additional key values in the options will be added as meta data to the resulting TimeSeries.
             *          .seriesList array - A list of TimeSeries (required)
             *          .reducer function - The reducer function (required)
             *          .fieldSpec array | string - Column or columns to sum. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a
             * string.like.this.
             */
        timeseriesListReduce(options: {
            seriesList: TimeSeries[];
            reducer: Function;
            fieldSpec: string | string[];
        }): TimeSeries;

        /**
             * Takes a list of TimeSeries and merges them together to form a new Timeseries.
             *
             * Merging will produce a new Event only when events are conflict free, so it is useful to combine multiple TimeSeries which have different time ranges as well as combine TimeSeries which have
             * different columns.
             *
             * Returns: TimeSeries - The merged TimeSeries
             * Params
             *      options - An object containing options. Additional key values in the options will be added as meta data to the resulting TimeSeries.
             *          .seriesList array - A list of TimeSeries (required)
             *          .fieldSpec array | string - Column or columns to merge. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a
             * string.like.this.
             *
             * Example
             *
             * const inTraffic = new TimeSeries(trafficDataIn);
             * const outTraffic = new TimeSeries(trafficDataOut);
             * const trafficSeries = TimeSeries.timeSeriesListMerge({
             *     name: "traffic",
             *     seriesList: [inTraffic, outTraffic]
             * });
             */
        timeSeriesListMerge(options: {
            seriesList: TimeSeries[];
            fieldSpec: string | string[];
        }): TimeSeries;

        /**
             * Takes a list of TimeSeries and sums them together to form a new Timeseries.
             *
             * Returns: TimeSeries - The summed TimeSeries
             * Params
             *      options - An object containing options. Additional key values in the options will be added as meta data to the resulting TimeSeries.
             *          .seriesList array - A list of TimeSeries (required)
             *          .fieldSpec array | string - Column or columns to sum. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a
             * string.like.this.
             *
             * Example
             *
             * const ts1 = new TimeSeries(weather1);
             * const ts2 = new TimeSeries(weather2);
             * const sum = TimeSeries.timeSeriesListSum({
             *     name: "sum",
             *     seriesList: [ts1, ts2],
             *     fieldSpec: "temperature"
             * });
             */
        timeSeriesListSum(options: {
            seriesList: TimeSeries[];
            fieldSpec: string | string[];
        }): TimeSeries;
    }

    // =======================================================================================================
    //  Pipeline
    // =======================================================================================================

    /**
         * A pipeline manages a processing chain, for either batch or stream processing of collection data.
         */
    class PipelineClass {
        /**
         * Build a new Pipeline.
         * Params
         *  [arg] Pipeline | Immutable.Map | null - May be either:
         *      a Pipeline (copy contructor)
         *      an Immutable.Map, in which case the internal state of the Pipeline will be contructed from the Map
         *      not specified
         *      Usually you would initialize a Pipeline using the factory function, rather than this object directly with new.
         *
         * Example
         *
         * import { Pipeline } from "pondjs";
         * const p = Pipeline()...
         */
        constructor(arg?: PipelineClass | Map<any, any> | undefined);

        /**
         * Set the window, returning a new Pipeline. A new window will have a type and duration associated with it. Current available types are:
         *      fixed (e.g. every 5m)
         *      calendar based windows (e.g. every month)
         *      Windows are a type of grouping. Typically you'd define a window on the pipeline before doing an aggregation or some other operation on the resulting grouped collection. You can combine
         * window-based grouping with key-grouping (see groupBy()).
         *
         * There are several ways to define a window. The general format is an options object containing a type field and a duration field.
         *
         * Currently the only accepted type is fixed, but others are planned. For duration, this is a duration string, for example "30s" or "1d". Supported are: seconds (s), minutes (m), hours (h) and days(d).
         *
         * If no arg is supplied, the window type is set to 'global' and there is no duration.
         *
         * There is also a short-cut notation for a fixed window or a calendar window. Simply supplying the duration string ("30s" for example) will result in a fixed window type with the supplied duration.
         *
         * Calendar types are specified by simply specifying "daily", "monthly" or "yearly".
         *
         * Returns: Pipeline - The Pipeline
         * Params
         *      w string | object - Window or duration - See above
         */
        windowBy(w: string | any): PipelineClass;

        /**
         * Remove windowing from the Pipeline. This will return the pipeline to no window grouping. This is useful if you have first done some aggregated by some window size and then wish to collect
         * together the all resulting events.
         *
         * Returns: Pipeline - The Pipeline
         */
        clearWindow(): PipelineClass;

        /**
             * Sets a new key grouping. Returns a new Pipeline.
             * Grouping is a state set on the Pipeline. Operations downstream of the group specification will use that state. For example, an aggregation would occur over any grouping specified. You can combine
             * a key grouping with windowing (see windowBy()).
             *
             * Note: the key, if it is a field path, is not a list of multiple columns, it is the path to a single column to pull group by keys from. For example, a column called 'status' that contains the
             * values 'OK' and 'FAIL' - then the key would be 'status' and two collections OK and FAIL will be generated.
             *
             * Returns: Pipeline - The Pipeline
             * Params
             *      k function | array | string - The key to group by. You can groupBy using a function (event) => return key, a field path (a field name, or dot delimitted path to a field), or a array of field
             * paths.
             */
        groupBy(k: Function | string | string[]): PipelineClass;

        /**
             * Remove the grouping from the pipeline. In other words recombine the events.
             * Returns: Pipeline - The Pipeline
             */
        clearGroupBy(): PipelineClass;

        /**
             * Sets the condition under which an accumulated collection will be emitted. If specified before an aggregation this will control when the resulting event will be emitted relative to the window
             * accumulation. Current options are:
             *
             *      to emit on every event, or
             *      just when the collection is complete, or
             *      when a flush signal is received, either manually calling done(), or at the end of a bounded source
             *
             * The difference will depend on the output you want, how often you want to get updated, and if you need to get a partial state. There's currently no support for late data or watermarks. If an event
             * passes comes in after a collection window, that collection is considered finished.
             *
             * Returns: Pipeline - The Pipeline
             * Params
             *      trigger string - A string indicating how to trigger a Collection should be emitted. May be:
             *          "eachEvent" - when a new event comes in, all currently maintained collections will emit their result
             *          "discard" - when a collection is to be discarded, first it will emit. But only then.
             *          "flush" - when a flush signal is received
             */
        emitOn(trigger: "eachEvent" | "discard" | "flush"): PipelineClass;

        /**
             * The source to get events from. The source needs to be able to iterate its events using for..of loop for bounded Ins, or be able to emit() for unbounded Ins. The actual batch, or stream connection
             * occurs when an output is defined with to().
             *
             * Pipelines can be chained together since a source may be another Pipeline.
             *
             * Returns: Pipeline - The Pipeline
             * Params
             *      src Bounded | Stream - The source for the Pipeline
             */
        from(src: any): PipelineClass;

        /**
             * Directly return the results from the processor rather than feeding to a callback. This breaks the chain, causing a result to be returned (the array of events) rather than a reference to the
             * Pipeline itself. This function is only available for sync batch processing.
             *
             * Returns: array | map - Returns the _results attribute from a Pipeline object after processing. Will contain Collection objects.
             */
        toEventList(): any[] | Map<any, any>;

        /**
             * Directly return the results from the processor rather than passing a callback in. This breaks the chain, causing a result to be returned (the collections) rather than a reference to the Pipeline
             * itself. This function is only available for sync batch processing.
             *
             * Returns: array | map - Returns the _results attribute from a Pipeline object after processing. Will contain Collection objects.
             */
        toKeyedCollections(): any[] | Map<any, any>;

        /**
             * Sets up the destination sink for the pipeline.
             *
             * For a batch mode connection, i.e. one with a Bounded source, the output is connected to a clone of the parts of the Pipeline dependencies that lead to this output. This is done by a Runner. The
             * source input is then iterated over to process all events into the pipeline and though to the Out.
             *
             * For stream mode connections, the output is connected and from then on any events added to the input will be processed down the pipeline to the out.
             *
             * Returns: Pipeline - The Pipeline
             *
             * Example
             *  const p = Pipeline()
             *   ...
             *   .to(EventOut, {}, event => {
             *      result[`${event.index()}`] = event;
             *  });
             */
        to(): PipelineClass;

        /**
             * Outputs the count of events.
             * Returns: Pipeline - The Pipeline
             * Params
             *      observer function - The callback function. This will be passed the count, the windowKey and the groupByKey
             *      force Boolean = true - Flush at the end of processing batch events, output again with possibly partial result.
             */
        count(observer: Function, force: boolean): PipelineClass;

        /**
             * Processor to offset a set of fields by a value. Mostly used for testing processor and pipeline operations with a simple operation.
             *
             * Returns: Pipeline - The modified Pipeline
             * Params
             *      by number - The amount to offset by
             *      fieldSpec string | array - The field(s)
             */
        offsetBy(by: number, fieldSpec: string | string[]): PipelineClass;

        /**
             * Uses the current Pipeline windowing and grouping state to build collections of events and aggregate them.
             *
             * IndexedEvents will be emitted out of the aggregator based on the emitOn state of the Pipeline.
             *
             * To specify what part of the incoming events should be aggregated together you specify a fields object. This is a map from fieldName to operator.
             *
             * Returns: Pipeline - The Pipeline
             * Params
             *
             *      fields object - Fields and operators to be aggregated
             *
             * Example
             *
             * import { Pipeline, EventOut, functions } from "pondjs";
             * const { avg } = functions;
             *
             * const p = Pipeline()
             *   .from(input)
             *   .windowBy("1h")           // 1 day fixed windows
             *   .emitOn("eachEvent")      // emit result on each event
             *   .aggregate({
             *      in_avg: {in: avg},
             *      out_avg: {in: avg}
             *   })
             *   .asEvents()
             *   .to(EventOut, {}, event => {
             *      result[`${event.index()}`] = event; // Result
             *   });
             */
        aggregate(fields: any): PipelineClass;

        /**
             * Converts incoming TimeRangeEvents or IndexedEvents to Events. This is helpful since some processors will emit TimeRangeEvents or IndexedEvents, which may be unsuitable for some applications.
             *
             * Returns: Pipeline - The Pipeline
             * Params
             *      options object - To convert to an Event you need to convert a time range to a single time. There are three options:
             *          use the beginning time (options = {alignment: "lag"})
             *          use the center time (options = {alignment: "center"})
             *          use the end time (options = {alignment: "lead"})
             */
        asEvents(options: {
            [key: string]: any;
            alignment: "lag" | "center" | "lead";
        }): PipelineClass;

        /**
             * Map the event stream using an operator.
             * Returns: Pipeline - The Pipeline
             * Params
             *      op function - A function that returns a new Event
             */
        map(op: Function): PipelineClass;

        /**
             * Filter the event stream using an operator.
             * Returns: Pipeline - The Pipeline
             * Params
             *      op function - A function that returns true or false
             */
        filter(op: Function): PipelineClass;

        /**
             * Select a subset of columns.
             * Returns: Pipeline - The Pipeline
             * Params
             *      fieldSpec string | array - Column or columns to look up. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a
             *      string.like.this. If not supplied, the 'value' column will be used.
             */
        select(fieldSpec: string | string[]): PipelineClass;

        /**
             * Collapse a subset of columns using a reducer function.
             * Returns: Pipeline - The Pipeline
             * Params
             *      fieldSpecList string | array - Column or columns to collapse. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation'].
             *      name string - The resulting output column's name
             *      reducer function - Function to use to do the reduction
             *      append boolean - Add the new column to the existing ones, or replace them.
             *
             * Example
             *  const timeseries = new TimeSeries(inOutData);
             *  Pipeline()
             *      .from(timeseries)
             *      .collapse(["in", "out"], "in_out_sum", sum)
             *      .emitOn("flush")
             *      .to(CollectionOut, c => {
             *           const ts = new TimeSeries({name: "subset", collection: c});
             *           ...
             *      }, true);
             */
        collapse(
            fieldSpecList: string | string[],
            name: string,
            reducer: Function,
            append: boolean
        ): PipelineClass;

        /**
             * Take the data in this event steam and "fill" any missing or invalid values. This could be setting null values to 0 so mathematical operations will succeed, interpolate a new value, or pad with
             * the previously given value.
             *
             * If one wishes to limit the number of filled events in the result set, use Pipeline.keep() in the chain. See: TimeSeries.fill() for an example.
             *
             * Returns: Pipeline - The Pipeline
             * Fill takes a single arg options which should be composed of:
             *      fieldSpec - Column or columns to look up. If you need to retrieve multiple deep nested values that ['can.be', 'done.with', 'this.notation']. A single deep value with a string.like.this.
             *      method - Filling method: zero | linear | pad
             */
        fill(options: {
            fieldSpec: string | string[];
            method: "zero" | "linear" | "pad";
        }): PipelineClass;

        /**
             * Take events up to the supplied limit, per key.
             * Returns: Pipeline - The Pipeline
             * Params
             *      limit number - Integer number of events to take
             */
        take(limit: number): PipelineClass;

        /**
             * Converts incoming Events or IndexedEvents to TimeRangeEvents.
             * Returns: Pipeline - The Pipeline
             * Params
             *      options object - To convert from an Event you need to convert a single time to a time range. To control this you need to specify the duration of that time range, along with the positioning
             *      (alignment) of the time range with respect to the time stamp of the Event.
             *      There are three option for alignment:
             *          time range will be in front of the timestamp (options = {alignment: "front"})
             *          time range will be centered on the timestamp (options = {alignment: "center"})
             *          time range will be positoned behind the timestamp (options = {alignment: "behind"})
             * The duration is of the form "1h" for one hour, "30s" for 30 seconds and so on.
             */
        asTimeRangeEvents(options: {
            duration: string;
            alignment: "front" | "center" | "behind";
        }): PipelineClass;

        /**
             * Converts incoming Events to IndexedEvents.
             * Note: It isn't possible to convert TimeRangeEvents to IndexedEvents.
             * Returns: Pipeline - The Pipeline
             * Params
             *      options Object - An object containing the conversion options. In this case the duration string of the Index is expected.
             *          .duration string - The duration string is of the form "1h" for one hour, "30s" for 30 seconds and so on.
             */
        asIndexedEvents(options: { duration: string }): PipelineClass;
    }

    export function Pipeline(arg?: PipelineClass | Map<any, any> | undefined): PipelineClass;
}
