var _ = require("underscore");
var Immutable = require("immutable");

var Index = require("./index");
var TimeRange = require("./range");
var {Event} = require("./event");

/**
 * A series is a structure containing times and associated data for each of those times.
 * You can think of a series as a list of events, with some additional meta data on top
 * of those. A series exists between two points in time, i.e. has a timerange associated
 * with it.
 *
 * Data passed into it should have the following format:
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
 * Essential parts:
 *     name    - the name of the series
 *     columns - a list of the columns referenced in the point
 *               the first column should be called time. The other columns can be
 *               anything
 *     points  - a list, with each item in the list being an array of values corresponding
 *               to the columns
 */
class Series {

    constructor(data) {
        if (data instanceof Series) {
            //Copy constructor
            this._series = data._series;
            this._times = data._times;
            this._name = data._names;
            this._columns = data._columns;
        } else if (_.isObject(data)) {
            var points = data.points || [];

            //Name
            this._name = data.name || "";

            //Columns (internal)
            var columns = data.columns || [];
            this._columns = Immutable.fromJS(columns);

            //List of times
            this._times = Immutable.fromJS(_.map(points, function(point) {
                return point[0];
            }));

            //Series of data
            var series = _.map(points, function(point) {
                var pointMap = {};
                _.each(point, function(p, i) {
                    if (i > 0) {
                        pointMap[columns[i]] = p;
                    }
                });
                return pointMap;
            });
            this._series = Immutable.fromJS(series);

            //Range of this timeseries (_range() may be implemented by subclass)
            this._range = this._range();
        }
    }

    _range() {
        return new TimeRange(this._times.min(), this._times.max());
    }

    //
    // Serialize
    //

    toJSON() {
        let cols = this._columns;
        let series = this._series;
        let times = this._times;
        return {
            name: this._name,
            columns: cols.toJSON(),
            points: series.map((value, i) => {
                var data = [times.get(i)];
                cols.forEach((column, j) => {
                    if (j > 0) {
                        data.push(value.get(column));
                    }
                });
                return data;
            })
        }
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    //
    // Series range
    //

    range() {
        return this._range;
    }

    begin() {
        return this.range().begin();
    }

    end() {
        return this.range().end();
    }

    //
    // Access the series itself
    //

    size() {
        return this._series.size;
    }

    at(i) {
        return new Event(this._times.get(i), this._series.get(i));
    }

    //
    // Aggregate the series
    //

    sum(column) {
        let c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        return this._series.reduce((memo, data) => {
            return data.get(c) + memo;
        }, 0);
    }

    avg(column) {
        let c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        return this.sum(column)/this.size();
    }

    max(column) {
        let c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        let max = this._series.maxBy((a) => {
            return a.get(c);
        });
        return max.get(c);
    }

    min(column) {
        let c = column || "value";
        if (!this._columns.contains(c)) {
            return undefined;
        }
        let min = this._series.minBy((a) => {
            return a.get(c);
        });
        return min.get(c);
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

class IndexedSeries extends Series {

    constructor(index, data) {
        if (_.isString(index)) {
            this._index = new Index(index);
        } else if (index instanceof Index) {
            this._index = index;
        }

        super(data);
    }

    //
    // Serialize
    //

    toJSON() {
        let cols = this._columns;
        let series = this._series;
        let times = this._times;
        return {
            name: this._name,
            index: this.indexAsString(),
            columns: cols.toJSON(),
            points: series.map((value, i) => {
                var data = [times.get(i)];
                cols.forEach((column, j) => {
                    if (j > 0) {
                        data.push(value.get(column));
                    }
                });
                return data;
            })
        }
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

    _range() {
        return this._index.asTimerange();
    }
}

module.exports.Series = Series;
module.exports.IndexedSeries = IndexedSeries;
