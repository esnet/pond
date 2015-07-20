"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _toArray = function (arr) { return Array.isArray(arr) ? arr : Array.from(arr); };

var _objectWithoutProperties = function (obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ = _interopRequire(require("underscore"));

var Immutable = _interopRequire(require("immutable"));

var Index = _interopRequire(require("./index"));

var TimeRange = _interopRequire(require("./range"));

var _event = require("./event");

var IndexedEvent = _event.IndexedEvent;
var Event = _event.Event;

var _util = require("./util");

var rangeFromIndexString = _util.rangeFromIndexString;
var niceIndexString = _util.niceIndexString;

/**
 * Base class for a series of events.
 *
 * A series is compact representation for a list of events, with some additional
 * meta data on top of that.
 *
 */

var Series = exports.Series = (function () {

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

    function Series(arg1, arg2, arg3, arg4) {
        var _this = this;

        _classCallCheck(this, Series);

        // Series(Series other) - copy
        if (arg1 instanceof Series) {

            //
            // Copy constructor
            //

            var other = arg1;

            this._name = other._name;
            this._meta = other._meta;
            this._columns = other._columns;
            this._series = other._series;

            // Series(string name, object meta, list columns, list | ImmutableList points)
        } else if (_.isString(arg1) && _.isObject(arg2) && _.isArray(arg3) && (_.isArray(arg4) || Immutable.List.isList(arg4))) {
            (function () {

                //
                // Object constructor
                //

                var name = arg1;
                var meta = arg2;
                var columns = arg3;
                var data = arg4;

                _this._name = name;
                _this._meta = Immutable.fromJS(meta);
                _this._columns = Immutable.fromJS(columns);

                if (Immutable.List.isList(data)) {
                    _this._series = data;
                } else {
                    _this._series = Immutable.fromJS(_.map(data, function (d) {
                        var pointMap = {};
                        _.each(d, function (p, i) {
                            pointMap[columns[i]] = p;
                        });
                        return pointMap;
                    }));
                }
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
                    points: series.map(function (value) {
                        return cols.map(function (column) {
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
        name: {

            //
            // Access meta data about the series
            //

            value: function name() {
                return this._name;
            }
        },
        meta: {
            value: function meta(key) {
                return this._meta.get(key);
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
        },
        mean: {
            value: function mean(column) {
                return this.avg(column);
            }
        },
        medium: {
            value: function medium(column) {
                console.log("Medium....");
                var c = column || "value";
                if (!this._columns.contains(c)) {
                    return undefined;
                }
                var sorted = this._series.sortBy(function (event) {
                    return event.get(c);
                });
                return sorted.get(Math.floor(sorted.size / 2)).get(c);
            }
        },
        stdev: {
            value: function stdev(column) {
                var c = column || "value";
                if (!this._columns.contains(c)) {
                    return undefined;
                }

                var mean = this.mean();
                return Math.sqrt(this._series.reduce(function (memo, event) {
                    console.log(Math.pow(event.get(c) - mean, 2));
                    return Math.pow(event.get(c) - mean, 2) + memo;
                }, 0) / this.size());
            }
        }
    }, {
        equal: {
            value: function equal(series1, series2) {
                return series1._name === series2._name && series1._meta === series2._meta && series1._columns === series2._columns && series1._series === series2._series;
            }
        },
        is: {
            value: function is(series1, series2) {
                return series1._name === series2._name && Immutable.is(series1._meta, series2._meta) && Immutable.is(series1._columns, series2._columns) && Immutable.is(series1._series, series2._series);
            }
        }
    });

    return Series;
})();

/** Internal function to find the unique keys of a bunch
  * of immutable maps objects. There's probably a more elegent way
  * to do this.
  */
function uniqueKeys(events) {
    var arrayOfKeys = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = e.data().keySeq()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var k = _step2.value;

                    arrayOfKeys.push(k);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
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
 * position in the list will return an Event that will in fact internally reference
 * the Immutable Map within the series, making it efficient to get back items
 * within the TimeSeries.
 *
 * You can fetch the full item at index n using get(n).
 *
 * The timerange associated with a TimeSeries is simply the bounds of the
 * events within it (i.e. the min and max times).
 */

var TimeSeries = exports.TimeSeries = (function (_Series) {
    function TimeSeries(arg1) {
        var _this = this;

        _classCallCheck(this, TimeSeries);

        // TimeSeries(TimeSeries other)
        if (arg1 instanceof TimeSeries) {

            _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", this).call(this);

            //
            // Copy constructor
            //

            //Construct the base series
            var other = arg1;

            this._name = other._name;
            this._meta = other._meta;
            this._index = other._index;
            this._columns = other._columns;
            this._series = other._series;
            this._times = other._times;

            // TimeSeries(object data) where data may be
            //    {"events": Event list} or
            //    {"columns": string list, "points": value list}
        } else if (_.isObject(arg1)) {
            (function () {

                //
                // Object constructor
                //
                // There are two forms of Timeseries construction:
                //   - As a list of Events
                //   - As a list of points and columns
                //
                // See below.
                //

                var obj = arg1;

                var columns = [];
                var times = [];
                var data = [];

                if (_.has(obj, "events")) {

                    //
                    // If events is passed in, then we construct the series out of a list
                    // of Event objects
                    //

                    var events = obj.events;
                    var index = obj.index;
                    var _name = obj.name;

                    var meta = _objectWithoutProperties(obj, ["events", "index", "name"]);

                    columns = uniqueKeys(events).toJSON();
                    _.each(events, function (event) {
                        times.push(event.timestamp());
                        data.push(event.data());
                    });

                    // Optional index associated with this TimeSeries
                    if (index) {
                        if (_.isString(index)) {
                            _this._index = new Index(index);
                        } else if (index instanceof Index) {
                            _this._index = index;
                        }
                    }

                    //Construct the base series
                    _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this).call(_this, _name, meta, columns, new Immutable.List(data));

                    //List of times, as Immutable List
                    _this._times = new Immutable.List(times);
                } else if (_.has(obj, "columns") && _.has(obj, "points")) {
                    var _name2 = obj.name;
                    var index = obj.index;
                    var points = obj.points;
                    var _columns = obj.columns;

                    var meta = _objectWithoutProperties(obj, ["name", "index", "points", "columns"]);

                    var seriesPoints = points || [];
                    var seriesName = _name2 || "";
                    var seriesMeta = meta || {};
                    var seriesColumns = _columns.slice(1) || [];

                    //
                    // If columns and points are passed in, then we construct the series
                    // out of those, assuming the format of each point is:
                    //
                    //   [time, col1, col2, col3]
                    //
                    // TODO: check to see if the first item is the time

                    _.each(seriesPoints, function (point) {
                        var _point = _toArray(point);

                        var time = _point[0];

                        var others = _point.slice(1);

                        times.push(time);
                        data.push(others);
                    });

                    _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this).call(_this, seriesName, seriesMeta, seriesColumns, data);

                    // Optional index associated with this TimeSeries
                    if (index) {
                        if (_.isString(index)) {
                            _this._index = new Index(index);
                        } else if (index instanceof Index) {
                            _this._index = index;
                        }
                    }

                    // List of times, as Immutable List
                    _this._times = Immutable.fromJS(times);
                }
            })();
        }
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
                var index = this._index;
                var cols = this._columns;
                var series = this._series;
                var times = this._times;

                var points = series.map(function (value, i) {
                    var data = [times.get(i)]; // time
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

                var result = {
                    name: name
                };

                if (index) {
                    result.index = index.toString();
                }

                result = _.extend(result, {
                    columns: columns,
                    points: points
                });

                result = _.extend(result, this._meta.toJSON());

                console.log(result);

                return result;
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
                var min = undefined;
                var max = undefined;
                this._times.forEach(function (time) {
                    if (_.isString(time)) {
                        var index = rangeFromIndexString(time);
                        if (!min || index.begin() < min) min = index.begin();
                        if (!max || index.end() > max) max = index.end();
                        console.log("     -- ", index.toString(), new Date(index.begin()), new Date(index.end()));
                    } else if (_.isNumber(time)) {
                        if (!min || time < min) min = time;
                        if (!max || time > max) max = time;
                    }
                });

                return new TimeRange(min, max);
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
        index: {

            /**
             * Access the Index, if this TimeSeries has one
             */

            value: function index() {
                return this._index;
            }
        },
        indexAsString: {
            value: function indexAsString() {
                return this._index ? this._index.asString() : undefined;
            }
        },
        indexAsRange: {
            value: function indexAsRange() {
                console.log(">>> indexAsRange", this._index.asTimerange());
                return this._index ? this._index.asTimerange() : undefined;
            }
        },
        at: {

            /**
             * Access the series data via index. The result is an Event.
             */

            value: function at(i) {
                var time = this._times.get(i);
                if (_.isString(time)) {
                    var index = time;
                    return new IndexedEvent(index, this._series.get(i));
                } else {
                    return new Event(time, this._series.get(i));
                }
            }
        },
        events: {

            /**
             *  Generator to allow for..of loops over series.events()
             */

            value: regeneratorRuntime.mark(function events() {
                var _this = this;

                var i;
                return regeneratorRuntime.wrap(function events$(context$2$0) {
                    while (1) switch (context$2$0.prev = context$2$0.next) {
                        case 0:
                            i = 0;

                        case 1:
                            if (!(i < _this.size())) {
                                context$2$0.next = 7;
                                break;
                            }

                            context$2$0.next = 4;
                            return _this.at(i);

                        case 4:
                            i++;
                            context$2$0.next = 1;
                            break;

                        case 7:
                        case "end":
                            return context$2$0.stop();
                    }
                }, events, this);
            })
        }
    }, {
        equal: {
            value: function equal(series1, series2) {
                return series1._name === series2._name && series1._meta === series2._meta && series1._columns === series2._columns && series1._series === series2._series && series1._times === series2._times;
            }
        },
        is: {
            value: function is(series1, series2) {
                return series1._name === series2._name && Immutable.is(series1._meta, series2._meta) && Immutable.is(series1._columns, series2._columns) && Immutable.is(series1._series, series2._series) && Immutable.is(series1._times, series2._times);
            }
        }
    });

    return TimeSeries;
})(Series);