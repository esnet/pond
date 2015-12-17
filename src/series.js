/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Immutable from "immutable";
import Index from "./index";
import TimeRange from "./range";
import { Event, TimeRangeEvent, IndexedEvent } from "./event";
import util from "./util";

/** Internal function to find the unique keys of a bunch
  * of immutable maps objects. There's probably a more elegent way
  * to do this.
  */
function uniqueKeys(events) {
    const arrayOfKeys = [];
    for (const e of events) {
        for (const k of e.data().keySeq()) {
            arrayOfKeys.push(k);
        }
    }
    return new Immutable.Set(arrayOfKeys);
}

/**
 * Functions used to determine slice indexes. Copied from immutable.js.
 */
function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
}

function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
    return index === undefined ?
        defaultIndex : index < 0 ?
            Math.max(0, size + index) : size === undefined ?
                index : Math.min(size, index);
}

/**
 * A TimeSeries is a a Series where each event is an association of a timestamp
 * and some associated data.
 *
 * Data passed into it may have the following format, which corresponds to
 * InfluxDB's wire format:
 *
 *   {
 *     "name": "traffic",
 *     "columns": ["time", "value", ...],
 *     "points": [
 *        [1400425947000, 52, ...],
 *        [1400425948000, 18, ...],
 *        [1400425949000, 26, ...],
 *        [1400425950000, 93, ...],
 *        ...
 *      ]
 *   }
 *
 * Alternatively, the TimeSeries may be constructed from a list of Events.
 *
 * Internaly the above series is represented as two lists, one of times and
 * one of data associated with those times. The position in the list links them
 * together. For each position, therefore, you have a time and an event:
 *
 * 'time'  -->  Event
 *
 * The time may be of several forms:
 *
 *   - a time
 *   - an index (which represents a timerange)
 *   - a timerange
 *
 * The event itself is stored is an Immutable Map. Requesting a particular
 * position in the list will return an Event that will in fact internally
 * reference the Immutable Map within the series, making it efficient to get
 * back items within the TimeSeries.
 *
 * You can fetch the full item at index n using get(n).
 *
 * The timerange associated with a TimeSeries is simply the bounds of the
 * events within it (i.e. the min and max times).
 */
class TimeSeries {

    constructor(arg) {
        this._name = null;
        this._timeRanges = null;
        this._indexes = null;

        // TimeSeries(TimeSeries other)
        if (arg instanceof TimeSeries) {

            //
            // Copy constructor
            //

            // Construct the base series
            const other = arg;

            // Info
            this._name = other._name;
            this._meta = other._meta;
            this._utc = other._utc;
            this._index = other._index;

            // Columns
            this._columns = other._columns;

            // Data
            this._data = other._data;

            // Times, TimeRanges, or Indexes
            this._times = other._times;
            this._timeRanges = other._timeRanges;
            this._indexes = other._indexes;

        // TimeSeries(object data) where data may be:
        //    { "events": [event-1, event-2, ..., event-n]}
        // or
        //    { "columns": [time|timerange|index, column-1, ..., column-n]
        //      "points": [
        //         [t1, v1, v2, ..., v2],
        //         [t2, v1, v2, ..., vn],
        //         ...
        //      ]
        //    }
        } else if (_.isObject(arg)) {
            const obj = arg;

            const times = [];
            const timeRanges = [];
            const indexes = [];

            if (_.has(obj, "events")) {
                const { name, index, utc, meta, events } = obj;

                // Name
                this._name = name ? name : "";

                // Extract time|timerange|index and data from events
                let dataList = [];
                _.each(events, event => {
                    if (event instanceof IndexedEvent) {
                        indexes.push(event.indexAsString());
                    } else if (event instanceof Event) {
                        times.push(event.timestamp());
                    } else if (event instanceof TimeRangeEvent) {
                        timeRanges.push(event.timerange().range());
                    } else {
                        throw new Error("TimeSeries: Unsupported event type");
                    }
                    dataList.push(event.data());
                });
                this._data = new Immutable.List(dataList);

                // Columns
                const columns = uniqueKeys(events).toJSON();
                this._columns = Immutable.fromJS(columns);

                // Index
                if (index) {
                    if (_.isString(index)) {
                        this._index = new Index(index);
                    } else if (index instanceof(Index)) {
                        this._index = index;
                    }
                }

                // UTC or Local time
                this._utc = true;
                if (_.isBoolean(utc)) {
                    this._utc = utc;
                }

                // Meta data
                this._meta = meta ? Immutable.fromJS(meta) : new Immutable.Map();

            } else if (_.has(obj, "columns") && _.has(obj, "points")) {
                const { name, index, utc, points, columns, ...other2 } = obj; //eslint-disable-line
                const seriesPoints = points || [];
                const seriesName = name || "";
                const seriesMeta = other2 || {};
                const seriesColumns = columns.slice(1) || [];
                const seriesUTC = _.isBoolean(utc) ? utc : true;

                this._name = seriesName;

                //
                // If columns and points are passed in, then we construct the
                // series out of those, assuming the format of each point is:
                //
                //   [time|timerange|index, col1, col2, col3]
                //

                if (seriesColumns.length < 1) {
                    throw new Error("Invalid columns supplied to TimeSeries constructor");
                }

                const firstColumn = columns[0];
                const useTimes = firstColumn === "time";
                const useTimeRanges = firstColumn === "timerange";
                const useIndexes = firstColumn === "index";
                const re = /\[([0-9]*)\,([0-9]*)\]/;
                const dataList = [];
                _.each(seriesPoints, point => {
                    // The series maybe indexed by a time, timerange or index
                    const [i, ...d] = point;
                    if (useTimes) {
                        let t;
                        const time = i;
                        if (_.isNumber(time)) {
                            t = new Date(time); // times are stored as Date objects
                        } else {
                            t = time;
                        }
                        times.push(t);
                    } else if (useTimeRanges) {
                        const timerange = i;
                        let match = timerange.match(re);
                        let beginTime = parseInt(match[1]);
                        let endTime = parseInt(match[2]);
                        let timeRange = new TimeRange(beginTime, endTime);
                        timeRanges.push(timeRange.range());
                    } else if (useIndexes) {
                        const index = i;
                        indexes.push(index);
                    }
                    dataList.push(d);
                });

                // Columns
                this._columns = Immutable.fromJS(seriesColumns);

                // Index
                if (index) {
                    if (_.isString(index)) {
                        this._index = new Index(index);
                    } else if (index instanceof(Index)) {
                        this._index = index;
                    }
                }

                // Is this data in UTC or local?
                this._utc = seriesUTC;

                // Extra meta data
                this._meta = Immutable.fromJS(seriesMeta);

                this._data = Immutable.fromJS(
                    dataList.map(d => {
                        const pointMap = {};
                        d.forEach((p, k) => {
                            pointMap[this._columns.get(k)] = p;
                        });
                        return pointMap;
                    })
                );
            }

            // List of [times|timeranges|indexes], as an Immutable List
            if (times.length > 0) {
                this._times = new Immutable.List(times);
            } else if (indexes.length > 0) {
                this._indexes = new Immutable.List(indexes);
            } else if (timeRanges.length > 0) {
                this._timeRanges = new Immutable.List(timeRanges);
            }

        }
    }

    //
    // Serialize
    //

    /**
     * Turn the TimeSeries into regular javascript objects
     */
    toJSON() {
        const name = this._name;
        const index = this._index;
        const cols = this._columns;
        const series = this._data;

        let indexedBy;
        if (this._times) {
            indexedBy = "time";
        } else if (this._timeRanges) {
            indexedBy = "timerange";
        } else if (this._indexes) {
            indexedBy = "index";
        }

        const points = series.map((value, i) => {
            const data = [];
            if (this._times) {
                const t = this._times.get(i);
                data.push(t.getTime());
            } else if (this._timeRanges) {
                const tr = this._timeRanges.get(i);
                data.push([tr[0], tr[1]]);
            } else if (this._indexes) {
                const index = this._indexes.get(i);
                data.push(index);
            }
            cols.forEach((column) => {
                data.push(value.get(column));
            });
            return data;
        }).toJSON();

        // The JSON output has 'time' as the first column
        const columns = [indexedBy];
        cols.forEach((column) => {
            columns.push(column);
        });

        let result = {
            name
        };

        if (index) {
            result.index = index.toString();
        }

        result = _.extend(result, {
            columns,
            points
        });

        result = _.extend(result, this._meta.toJSON());

        return result;
    }

    /**
     * Represent the TimeSeries as a string
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    //
    // Series range
    //

    /**
     * From the range of times, or Indexes within the TimeSeries, return
     * the extents of the TimeSeries as a TimeRange.
     * @return {TimeRange} The extents of the TimeSeries
     */
    range() {
        let min;
        let max;
        if (this._times) {
            this._times.forEach(time => {
                if (!min || time.getTime() < min) {
                    min = time.getTime();
                }
                if (!max || time.getTime() > max) {
                    max = time.getTime();
                }
            });
        } else if (this._timeRanges) {
            this._timeRanges.forEach(timeRange => {
                if (!min || timeRange.at(0).getTime() < min) {
                    min = timeRange.at(0).getTime();
                }
                if (!max || timeRange.at(1).getTime() > max) {
                    max = timeRange.at(1).getTime();
                }
            });
        } else if (this._indexes) {
            this._indexes.forEach(index => {
                const indexRange = util.rangeFromIndexString(index, this.isUTC());
                if (!min || indexRange.begin() < min) {
                    min = indexRange.begin();
                }
                if (!max || indexRange.end() > max) {
                    max = indexRange.end();
                }
            });
        }

        return new TimeRange(min, max);
    }

    /**
     * From the range of times, or Indexes within the TimeSeries, return
     * the extents of the TimeSeries as a TimeRange.
     * @return {TimeRange} The extents of the TimeSeries
     */
    timerange() {
        return this.range();
    }

    /**
     * Gets the earliest time represented in the TimeSeries.
     * @return {Date} Begin time
     */
    begin() {
        return this.range().begin();
    }

    /**
     * Gets the latest time represented in the TimeSeries.
     * @return {Date} End time
     */
    end() {
        return this.range().end();
    }

    /**
     * Access the Index, if this TimeSeries has one
     */

    index() {
        return this._index;
    }

    indexAsString() {
        return this._index ? this._index.asString() : undefined;
    }

    indexAsRange() {
        return this._index ? this._index.asTimerange() : undefined;
    }

    /**
     * Is the data in UTC or Local?
     */
    isUTC() {
        return this._utc;
    }

    /**
     * Access the series data via index. The result is an Event.
     */
    at(i) {
        if (this._times) {
            return new Event(
                this._times.get(i),
                this._data.get(i));
        } else if (this._timeRanges) {
            return new TimeRangeEvent(
                new TimeRange(this._timeRanges.get(i)),
                this._data.get(i)
            );
        } else if (this._indexes) {
            return new IndexedEvent(
                this._indexes.get(i),
                this._data.get(i),
                this._utc
            );
        }
    }

    /**
     * Finds the index that is just less than the time t supplied.
     * In other words every event at the returned index or less
     * has a time before the supplied t, and every sample after the
     * index has a time later than the supplied t.
     *
     * Optionally supply a begin index to start searching from.
     */
    bisect(t, b) {
        const tms = t.getTime();
        const size = this.size();
        let i = b || 0;

        if (!size) {
            return undefined;
        }

        for (; i < size; i++) {
            const ts = this.at(i).timestamp().getTime();
            if (ts > tms) {
                return i - 1 >= 0 ? i - 1 : 0;
            } else if (ts === tms) {
                return i;
            }
        }
        return i - 1;
    }

    /**
     * Perform a slice of events within the TimeSeries, returns a new
     * TimeSeries representing a portion of this TimeSeries from begin up to
     * but not including end.
     */
    slice(begin, end) {
        const size = this.size();
        const b = resolveBegin(begin, size);
        const e = resolveEnd(end, size);

        if (b === 0 && e === size ) {
            return this;
        }

        const events = [];
        for (let i = b; i < e; i++) {
            events.push(this.at(i));
        }

        return new TimeSeries({ name: this._name,
                                index: this._index,
                                utc: this._utc,
                                meta: this._meta,
                                events });
    }

    /**
     *  Generator to allow for..of loops over series.events()
     */
    * events() {
        for (let i = 0; i < this.size(); i++) {
            yield this.at(i);
        }
    }


    //
    // Access meta data about the series
    //

    /**
     * Returns the same of the series
     * @return {string} The name
     */
    name() {
        return this._name;
    }

    /**
     * Return the list of columns
     * @return {string[]} The columns
     */
    columns() {
        return this._columns.toJSON();
    }

    /**
     * Return the meta data associated with the Series. To use, supply
     * the key and the get back the value matching that key.
     */
    meta(key) {
        if (!key) {
            return this._meta.toJSON();
        } else {
            return this._meta.get(key);
        }
    }

    //
    // Access the series itself
    //

    /**
     * Returns the number of rows in the series.
     * @return {number} Size of the series
     */
    size() {
        return this._data.size;
    }
    /**
     * Returns the number of rows in the series. (Same as size())
     * @return {number} Size of the series
     */
    count() {
        return this.size();
    }

    getInternal(data, column, func) {
        const c = column || "value";
        if (_.isFunction(func)) {
            return func(data.get(c).toJSON());
        } else {
            return data.get(c);
        }
    }

    //
    // Aggregate the series
    //

    sum(column, func) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        return this._data.reduce((memo, d) =>
            this.getInternal(d, c, func) + memo, 0);
    }

    avg(column, func) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        return this.sum(c, func) / this.size();
    }

    max(column, func) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        const max = this._data.maxBy(d => this.getInternal(d, c, func));
        return this.getInternal(max, c, func);
    }

    min(column, func) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        const min = this._data.minBy(d => this.getInternal(d, c, func));
        return this.getInternal(min, c, func);
    }

    mean(column, func) {
        return this.avg(column, func);
    }

    median(column, func) {
        const c = column || "value";
        if (!this._columns.contains(c) || this.size() === 0) {
            return undefined;
        }
        const sorted = this._data.sortBy(d => this.getInternal(d, c, func));
        const i = Math.floor(sorted.size / 2);
        if (sorted.size % 2 === 0) {
            const a = this.getInternal(sorted.get(i), c, func);
            const b = this.getInternal(sorted.get(i - 1), c, func);
            return (a + b) / 2;
        } else {
            return this.getInternal(sorted.get(i), c, func);
        }
    }

    stdev(column, func) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }

        const mean = this.mean(c, func);
        return Math.sqrt(this._data.reduce((memo, d) =>
            Math.pow(this.getInternal(d, c, func) - mean, 2) + memo, 0) / this.size());
    }

    /**
     * STATIC
     */

    static equal(series1, series2) {
        return (series1._name === series2._name &&
                series1._meta === series2._meta &&
                series1._utc === series2._utc &&
                series1._columns === series2._columns &&
                series1._data === series2._data &&
                series1._times === series2._times);
    }

    static is(series1, series2) {
        return (series1._name === series2._name &&
                series1._utc === series2._utc &&
                Immutable.is(series1._meta, series2._meta) &&
                Immutable.is(series1._columns, series2._columns) &&
                Immutable.is(series1._data, series2._data) &&
                Immutable.is(series1._times, series2._times));
    }

    static map(options, seriesList, mapper) {
        // for each series, map events to the same timestamp/index
        const eventMap = {};
        _.each(seriesList, (series) => {
            for (const event of series.events()) {
                let key;
                if (event instanceof Event) {
                    key = event.timestamp();
                } else if (event instanceof IndexedEvent) {
                    key = event.index();
                } else if (event instanceof TimeRangeEvent) {
                    key = event.timerange().toUTCString();
                }

                if (!_.has(eventMap, key)) {
                    eventMap[key] = [];
                }

                eventMap[key].push(event);
            }
        });

        // for each key, merge the events associated with that key
        const events = [];
        _.each(eventMap, (eventsList) => {
            const event = mapper(eventsList);
            events.push(event);
        });

        const { name, index, ...metaData } = options; //eslint-disable-line
        return new TimeSeries({
            name,
            index,
            utc: this._utc,
            meta: metaData,
            events
        });
    }

    static merge(options, seriesList) {
        return TimeSeries.map(options, seriesList, Event.merge);
    }
}

export default TimeSeries;

