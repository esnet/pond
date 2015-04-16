var _ = require("underscore");
var Immutable = require("immutable");

var Index = require("./index");
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
 *     columns - a list of the columns referenced in the point
 *               the first column should be called time. The other columns can be
 *               anything
 *     points  - a list, with each item in the list being an array of values corresponding
 *               to the columns
 */
class Series {
    constructor(data) {
        if (data instanceof Series) {
            this._series = data._series;
        } else if (_.isObject(data)) {
            var columns = data.columns;
            var points = data.points;
            var series = _.map(points, function(point) {
                var pointMap = {};
                _.each(point, function(p, i) {
                    if (i > 0) {
                        pointMap[columns[i]] = p;
                    }
                });
                return pointMap;
            });
            this._times = Immutable.fromJS(_.map(points, function(point) {
                return point[0];
            }));
            this._series = Immutable.fromJS(series);
        }
    }

    toString() {
        return JSON.stringify(this._series);
    }

    size() {
        return this._series.size;
    }

    at(i) {
        console.log("Making event:", this._times.get(i), this._series.get(i));
        return new Event(this._times.get(i), this._series.get(i));
    }
}

/**
 * A time series:
 *
 * name   - Identifier for the series
 *
 * index  - The index is the timerange over which this series is supplied
 *          the range the index represents can be fetched with range(),
 *          begin() and end().
 * series - The actual series of time and values
 */

/*
class IndexSeries {

    constructor(name, index, series) {
        //name
        this._name = name;

        //Index
        if (_.isString(index)) {
            this._i = new Index(index);
        } else if (index instanceof Index) {
            this._i = index;
        }

        //Series
        this._s = new Series(series);

    }

    index() {
        return this._i;
    }

    toUTCString() {
        return this.index().asString() + ": " + this.range().toUTCString();
    }

    toLocalString() {
        return this.index().asString() + ": " + this.range().toLocalString();
    }

    //
    // Convenience access the series range
    //

    range() {
        return this._i.asRange();
    }

    begin() {
        return this.range().begin();
    }

    end() {
        return this.range().end();
    }
}
*/

module.exports = Series;
