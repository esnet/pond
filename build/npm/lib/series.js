"use strict";

var _toArray = function (arr) { return Array.isArray(arr) ? arr : Array.from(arr); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("underscore");
var Immutable = require("immutable");

var Index = require("./index");
var TimeRange = require("./range");

var _require = require("./event");

var Event = _require.Event;

/**
 * Base class for a series of events.
 *
 * A series is compact representation for a list of events, with some additional
 * meta data on top of that.
 *
 */

var Series = (function () {

    /**
     * A series is constructed by either:
     * 1) passing in another series (copy constructor)
     * 2) passing in three arguments:
     *     name - the name of the series
     *     columns - an array containing the title of each data column
     *     data - an array containing the data of each column
     *
     * Internally a Series is List of Maps. Each item in the list is one data map,
     * and is stored as an Immutable Map, where the keys are the column names
     * and the value is the data for that column at that index. This enables
     * efficient extraction of Events, since the internal data of the Event can
     * be simply a reference to the Immutable Map in this Series, combined with the
     * time or timerange index.
     */

    function Series(arg1, arg2, arg3) {
        var _this = this;

        _classCallCheck(this, Series);

        if (arg1 instanceof Series) {
            var other = arg1;

            //Copy constructor
            this._name = other._names;
            this._columns = other._columns;
            this._series = other._series;
        } else if (_.isString(arg1) && _.isArray(arg2) && _.isArray(arg3)) {
            (function () {
                var name = arg1;
                var columns = arg2;
                var data = arg3;

                _this._name = name;
                _this._columns = Immutable.fromJS(columns);
                _this._series = Immutable.fromJS(_.map(data, function (point) {
                    var pointMap = {};
                    _.each(point, function (p, i) {
                        pointMap[columns[i]] = p;
                    });
                    return pointMap;
                }));
            })();
        }
    }

    _createClass(Series, {
        toJSON: {

            //
            // Serialize
            //

            value: function toJSON() {
                var cols = this._columns;
                var series = this._series;
                return {
                    name: this._name,
                    columns: cols.toJSON(),
                    points: series.map(function (value, i) {
                        return cols.map(function (column, j) {
                            data.push(value.get(column));
                        });
                    })
                };
            }
        },
        toString: {
            value: function toString() {
                return JSON.stringify(this.toJSON());
            }
        },
        size: {

            //
            // Access the series itself
            //

            value: function size() {
                return this._series.size;
            }
        },
        count: {
            value: function count() {
                return this.size();
            }
        },
        at: {
            value: function at(i) {
                return this._series.get(i);
            }
        },
        sum: {

            //
            // Aggregate the series
            //

            value: function sum(column) {
                var c = column || "value";
                if (!this._columns.contains(c)) {
                    return undefined;
                }
                return this._series.reduce(function (memo, data) {
                    return data.get(c) + memo;
                }, 0);
            }
        },
        avg: {
            value: function avg(column) {
                var c = column || "value";
                if (!this._columns.contains(c)) {
                    return undefined;
                }
                return this.sum(column) / this.size();
            }
        },
        max: {
            value: function max(column) {
                var c = column || "value";
                if (!this._columns.contains(c)) {
                    return undefined;
                }
                var max = this._series.maxBy(function (a) {
                    return a.get(c);
                });
                return max.get(c);
            }
        },
        min: {
            value: function min(column) {
                var c = column || "value";
                if (!this._columns.contains(c)) {
                    return undefined;
                }
                var min = this._series.minBy(function (a) {
                    return a.get(c);
                });
                return min.get(c);
            }
        }
    });

    return Series;
})();

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
 * The timerange associated with a TimeSeries is simply the bounds of the
 * events within it (i.e. the min and max times)
 */

var TimeSeries = (function (_Series) {
    function TimeSeries(arg1) {
        var _this = this;

        _classCallCheck(this, TimeSeries);

        if (arg1 instanceof Series) {
            //Copy constructor
            var other = arg1;
            this._name = other._names;
            this._columns = other._columns;
            this._times = other._times;
            this._series = other._series;
        } else if (_.isObject(arg1)) {
            (function () {
                //Javascript object constructor
                var obj = arg1;
                var name = obj.name || "";
                var columns = obj.columns.slice(1) || []; // TODO: check to see if the first item is the time
                var points = obj.points || [];
                var data = [];
                var times = [];

                //Series of data that we extract out the time and pass the rest to the base class
                _.each(points, function (point) {
                    var _point = _toArray(point);

                    var time = _point[0];

                    var others = _point.slice(1);

                    times.push(time);
                    data.push(others);
                });

                //List of times, as Immutable List
                _this._times = Immutable.fromJS(times);

                _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this).call(_this, name, columns, data);
            })();
        }

        console.log("Result", this);
    }

    _inherits(TimeSeries, _Series);

    _createClass(TimeSeries, {
        toJSON: {

            //
            // Serialize
            //

            /**
             * Turn the TimeSeries into regular javascript objects
             */

            value: function toJSON() {
                var name = this._name;
                var cols = this._columns;
                var series = this._series;
                var times = this._times;

                var points = series.map(function (value, i) {
                    var data = [times.get(i)]; //time
                    cols.forEach(function (column, j) {
                        data.push(value.get(column));
                    }); //values
                    return data;
                }).toJSON();

                //The JSON output has 'time' as the first column
                var columns = ["time"];
                cols.forEach(function (column) {
                    columns.push(column);
                });

                return {
                    name: name,
                    columns: columns,
                    points: points
                };
            }
        },
        toString: {

            /**
             * Represent the TimeSeries as a string
             */

            value: function toString() {
                return JSON.stringify(this.toJSON());
            }
        },
        range: {

            //
            // Series range
            //

            value: function range() {
                var result = new TimeRange(this._times.min(), this._times.max());
                return result;
            }
        },
        begin: {
            value: function begin() {
                return this.range().begin();
            }
        },
        end: {
            value: function end() {
                return this.range().end();
            }
        },
        at: {

            //
            // Access the series itself
            //

            value: function at(i) {
                return new Event(this._times.get(i), this._series.get(i));
            }
        }
    });

    return TimeSeries;
})(Series);

var TimeRangeSeries = (function (_Series2) {
    function TimeRangeSeries(index, data) {
        _classCallCheck(this, TimeRangeSeries);

        _get(Object.getPrototypeOf(TimeRangeSeries.prototype), "constructor", this).call(this, data);
    }

    _inherits(TimeRangeSeries, _Series2);

    _createClass(TimeRangeSeries, {
        at: {
            value: function at(i) {
                return new TimeRangeEvent(this._times.get(i), this._series.get(i));
            }
        }
    });

    return TimeRangeSeries;
})(Series);

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

var IndexedSeries = (function (_TimeSeries) {
    function IndexedSeries(index, data) {
        _classCallCheck(this, IndexedSeries);

        if (_.isString(index)) {
            this._index = new Index(index);
        } else if (index instanceof Index) {
            this._index = index;
        }

        _get(Object.getPrototypeOf(IndexedSeries.prototype), "constructor", this).call(this, data);
    }

    _inherits(IndexedSeries, _TimeSeries);

    _createClass(IndexedSeries, {
        toJSON: {

            //
            // Serialize
            //

            value: function toJSON() {
                var cols = this._columns;
                var series = this._series;
                var times = this._times;
                return {
                    name: this._name,
                    index: this.indexAsString(),
                    columns: cols.toJSON(),
                    points: series.map(function (value, i) {
                        var data = [times.get(i)];
                        cols.forEach(function (column, j) {
                            if (j > 0) {
                                data.push(value.get(column));
                            }
                        });
                        return data;
                    })
                };
            }
        },
        toString: {
            value: function toString() {
                return JSON.stringify(this.toJSON());
            }
        },
        index: {

            //
            // Convenience access the series range and index
            //

            value: function index() {
                return this._index;
            }
        },
        indexAsString: {
            value: function indexAsString() {
                return this._index.asString();
            }
        },
        _range: {
            value: function _range() {
                return this._index.asTimerange();
            }
        }
    });

    return IndexedSeries;
})(TimeSeries);

module.exports.Series = Series;
module.exports.TimeSeries = TimeSeries;
module.exports.IndexedSeries = IndexedSeries;