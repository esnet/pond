import _ from "underscore";
import Immutable from "immutable";

import Index from "./index";
import TimeRange from "./range";
import {Event} from "./event";

/**
 * Base class for a series of events.
 *
 * A series is compact representation for a list of events, with some additional
 * meta data on top of that.
 *
 */

export class Series {

    /**
     * A Series is constructed by either:
     *
     *  1) passing in another series (copy constructor)
     *  2) passing in three arguments:
     *      name - the name of the series
     *      columns - an array containing the title of each data column
     *      data - an array containing the data of each column
     *             Note: data may be either:
     *               a) An Immutable.List of Immutable.Map data objects
     *               b) An array of objects
     *
     * Internally a Series is List of Maps. Each item in the list is one data map,
     * and is stored as an Immutable Map, where the keys are the column names
     * and the value is the data for that column at that index.
     *
     * This enables efficient extraction of Events, since the internal data of the
     * Event can be simply a reference to the Immutable Map in this Series, combined
     * with the time, Timerange or Index.
     */
    
    constructor(arg1, arg2, arg3, arg4) {

        if (arg1 instanceof Series) {
            
            //
            // Copy constructor
            //

            const other = arg1;

            this._name = other._name;
            this._meta = other._meta;
            this._columns = other._columns;
            this._series = other._series;

        } else if (_.isString(arg1) &&
                   _.isObject(arg2) &&
                   _.isArray(arg3) &&
                  (_.isArray(arg4) || Immutable.List.isList(arg4))) {

            //
            // Object constructor
            //

            const name = arg1;
            const meta = arg2;
            const columns = arg3
            const data = arg4;
            
            this._name = name;
            this._meta = Immutable.fromJS(meta);
            this._columns = Immutable.fromJS(columns);

            if (Immutable.List.isList(data)) {
                this._series = data;
            } else {
                this._series = Immutable.fromJS(
                    _.map(data, function(d) {
                        let pointMap = {};
                        _.each(d, function(p, i) {
                            pointMap[columns[i]] = p;
                        });
                        return pointMap;
                    })
                );
            }
        }
    }

    //
    // Serialize
    //

    toJSON() {
        const cols = this._columns;
        const series = this._series;
        return {
            name: this._name,
            columns: cols.toJSON(),
            points: series.map(value => {
                return cols.map(column => { data.push(value.get(column)); });
            })
        }
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    //
    // Access meta data about the series
    //

    name() {
        return this._name;
    }

    meta(key) {
        return this._meta.get(key);
    }

    //
    // Access the series itself
    //

    size() {
        return this._series.size;
    }

    count() {
        return this.size();
    }

    at(i) {
        return this._series.get(i);
    }


    //
    // Aggregate the series
    //

    sum(column) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        return this._series.reduce((memo, data) => {
            return data.get(c) + memo;
        }, 0);
    }

    avg(column) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        return this.sum(column) / this.size();
    }

    max(column) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        const max = this._series.maxBy((a) => {
            return a.get(c);
        });
        return max.get(c);
    }

    min(column) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        const min = this._series.minBy((a) => {
            return a.get(c);
        });
        return min.get(c);
    }

    mean(column) {
        return this.avg(column);
    }

    medium(column) {
        console.log("Medium....")
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        const sorted = this._series.sortBy((event) => event.get(c));
        return sorted.get(Math.floor(sorted.size/2)).get(c);
    }

    stdev(column) {
        const c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }

        const mean = this.mean();
        return Math.sqrt(this._series.reduce((memo, event) => {
            console.log(Math.pow(event.get(c)-mean, 2))
            return Math.pow(event.get(c)-mean, 2) + memo
        }
        , 0) / this.size());
    }

    static equal(series1, series2) {
        return (series1._name === series2._name &&
                series1._meta === series2._meta &&
                series1._columns === series2._columns &&
                series1._series === series2._series);
    }
    
    static is(series1, series2) {
        return (series1._name === series2._name &&
                Immutable.is(series1._meta, series2._meta) &&
                Immutable.is(series1._columns, series2._columns) &&
                Immutable.is(series1._series, series2._series));
    }

}

/** Internal function to find the unique keys of a bunch
  * of immutable maps objects. There's probably a more elegent way
  * to do this.
  */
function uniqueKeys(events) {
    let arrayOfKeys = []
    for (let e of events) {
        for (let k of e.data().keySeq()) {
            arrayOfKeys.push(k)
        }
    }
    return new Immutable.Set(arrayOfKeys);
}

/**
 * A TimeSeries is a a Series where each event is an association of a timestamp
 * and some associated data.
 *
 * Data passed into it may have the following format, which corresponds to InfluxDB's
 * wire format:
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
 * one of data associated with those times. The index of the list links them
 * together. You can fetch the full item at index n using get(n). This returns
 * the item as an Event. Note that the internal data of the Event will be
 * a reference to the immutable Map in the series list, so there's no copying. 
 *
 * The timerange associated with a TimeSeries is simply the bounds of the
 * events within it (i.e. the min and max times).
 */
export class TimeSeries extends Series {

    constructor(arg1) {

        if (arg1 instanceof TimeSeries) {
            
            super();

            //
            // Copy constructor
            //

            //Construct the base series
            let other = arg1;

            this._name = other._name;
            this._meta = other._meta;
            this._columns = other._columns;
            this._series = other._series;
            this._times = other._times;

        } else if (_.isObject(arg1)) {

            //
            // Object constructor
            //
            // There are two forms of Timeseries construction:
            //   - As a list of Events
            //   - As a list of points and columns
            //
            // See below.
            //

            const obj = arg1;

            let columns = [];
            let times = [];
            let data = [];

            if (_.has(obj, "events")) {

                //
                // If events is passed in, then we construct the series out of a list
                // of Event objects
                //
                
                const {events, name, ...meta} = obj;

                columns = uniqueKeys(events).toJSON();
                _.each(events, event => {
                    times.push(event.timestamp());
                    data.push(event.data());
                });

                //Construct the base series
                super(name, meta, columns, new Immutable.List(data));

                //List of times, as Immutable List
                this._times = new Immutable.List(times);

            } else if (_.has(obj, "columns") && _.has(obj, "points")) {

                const {name, points, columns, ...meta} = obj;
                const seriesPoints = points || [];
                const seriesName = name || "";
                const seriesMeta = meta || {};
                const seriesColumns = columns.slice(1) || [];

                //
                // If columns and points are passed in, then we construct the series
                // out of those, assuming the format of each point is:
                //
                //   [time, col1, col2, col3]
                //
                // TODO: check to see if the first item is the time
                
                _.each(seriesPoints, point => {
                    const [time, ...others] = point;
                    times.push(time);
                    data.push(others);
                });

                super(seriesName, seriesMeta, seriesColumns, data);

                //List of times, as Immutable List
                this._times = Immutable.fromJS(times);
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
        const cols = this._columns;
        const series = this._series;
        const times = this._times;

        const points = series.map((value, i) => {
            const data = [times.get(i)]; // time
            cols.forEach((column, j) => {data.push(value.get(column))}); //values
            return data;
        }).toJSON();

        //The JSON output has 'time' as the first column
        const columns = ["time"];
        cols.forEach((column) => {columns.push(column)});

        return _.extend(this._meta.toJSON(), {
            name: name,
            columns: columns,
            points: points
        });
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

    range() {
        return new TimeRange(this._times.min(), this._times.max());
    }

    begin() {
        return this.range().begin();
    }

    end() {
        return this.range().end();
    }

    /**
     * Access the series data via index. The result is an Event.
     */
    at(i) {
        return new Event(this._times.get(i), this._series.get(i));
    }

    /**
     *  Generator to allow for..of loops over series.events()
     */
    * events() {
        for (let i=0; i < this.size(); i++) {
            yield this.at(i);
        }
    }

    static equal(series1, series2) {
        return (series1._name === series2._name &&
                series1._meta === series2._meta &&
                series1._columns === series2._columns &&
                series1._series === series2._series &&
                series1._times === series2._times);
    }
    
    static is(series1, series2) {
        return (series1._name === series2._name &&
                Immutable.is(series1._meta, series2._meta) &&
                Immutable.is(series1._columns, series2._columns) &&
                Immutable.is(series1._series, series2._series) &&
                Immutable.is(series1._times, series2._times));
    }
}

/**
 * TODO
 */
export class TimeRangeSeries extends Series {
    constructor(index, data) {
        super(data);
    }

    at(i) {
        return new TimeRangeEvent(this._times.get(i), this._series.get(i));
    }
}

/**
 * EXPERIMENTAL
 *
 * An IndexSeries is a timeseries, like a Series, only the timerange associated with it
 * comes from an Index rather than a specific time range.
 *
 * The use for this would be in an indexed cache:
 *
 * Insert into cache by taking a IndexSeries, indexedSeries, getting the key (s.indexAsString()) and
 * insering it as cache[indexedSeries.indexAsString] = indexedSeries;
 *
 * A range of indexes can easily be generated for a timerange (we need a utility for this). Using each
 * index in that range we can pull data from the cache (if it's there) or request it if it isn't.
 *
 */

export class IndexedSeries extends TimeSeries {

    constructor(index, data) {
        super(data);

        if (_.isString(index)) {
            this._index = new Index(index);
        } else if (index instanceof Index) {
            this._index = index;
        }
    }

    //
    // Serialize
    //

    toJSON() {
        const cols = this._columns;
        const series = this._series;
        const times = this._times;

        //The JSON output has 'time' as the first column
        let columns = ["time"];
        cols.forEach(column => {columns.push(column)});

        return _.extend(this._meta.toJSON(), {
            name: this._name,
            index: this.indexAsString(),
            columns: columns,
            points: series.map((value, i) => {
                let data = [times.get(i)];
                cols.forEach((column, j) => {
                    data.push(value.get(column));
                });
                return data;
            })
        });
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    //
    // Convenience access the series range and index
    //

    index() {
        return this._index;
    }

    indexAsString() {
        return this._index.asString();
    }

    range() {
        return this._index.asTimerange();
    }
}
