ESnet = typeof ESnet === "object" ? ESnet : {}; ESnet["Pond"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	//Prims
	"use strict";

	exports.Index = __webpack_require__(1);
	exports.TimeRange = __webpack_require__(2);

	//Events
	exports.Event = __webpack_require__(3).Event;
	exports.TimeRangeEvent = __webpack_require__(3).TimeRangeEvent;
	exports.IndexedEvent = __webpack_require__(3).IndexedEvent;

	//Series
	exports.Series = __webpack_require__(4).Series;
	exports.TimeSeries = __webpack_require__(4).TimeSeries;
	exports.IndexedSeries = __webpack_require__(4).IndexedSeries;

	//Builder
	exports.Bucket = __webpack_require__(5);
	exports.Generator = __webpack_require__(6);
	exports.Aggregator = __webpack_require__(7);
	exports.Collector = __webpack_require__(6);

	//Util
	exports.Functions = __webpack_require__(8);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () {
	    function defineProperties(target, props) {
	        for (var key in props) {
	            var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
	        }Object.defineProperties(target, props);
	    }return function (Constructor, protoProps, staticProps) {
	        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	    };
	})();

	var _classCallCheck = function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	        throw new TypeError("Cannot call a class as a function");
	    }
	};

	var moment = __webpack_require__(11);
	var _ = __webpack_require__(10);

	var util = __webpack_require__(9);
	var TimeRange = __webpack_require__(2);

	var units = {
	    s: { label: "seconds", length: 1 },
	    m: { label: "minutes", length: 60 },
	    h: { label: "hours", length: 60 * 60 },
	    d: { label: "days", length: 60 * 60 * 24 }
	};

	/**
	 * An index that represents as a string a range of time.
	 *
	 * The actual derived timerange can be found using asRange(). This will return
	 * a TimeRange instance.
	 *
	 * The original string representation can be found with toString().
	 */

	var Index = (function () {
	    function Index(s) {
	        _classCallCheck(this, Index);

	        this._s = s;
	        this._r = this._rangeFromIndexString(s);
	    }

	    _createClass(Index, {
	        _rangeFromIndexString: {
	            value: function _rangeFromIndexString(s) {
	                var parts = s.split("-");
	                var size = parts[0];

	                //Position should be an int
	                var pos = parseInt(parts[1], 10);

	                //size should be two parts, a number and a letter
	                var re = /([0-9]+)([smhd])/;

	                var sizeParts = re.exec(size);
	                if (sizeParts && sizeParts.length >= 3) {
	                    var num = parseInt(sizeParts[1]);
	                    var unit = sizeParts[2];
	                    var length = num * units[unit].length * 1000;
	                }

	                var beginTime = moment.utc(pos * length);
	                var endTime = moment.utc((pos + 1) * length);

	                return new TimeRange(beginTime, endTime);
	            }
	        },
	        toJSON: {
	            value: function toJSON() {
	                return this._s;
	            }
	        },
	        toString: {
	            value: function toString() {
	                return this._s;
	            }
	        },
	        asString: {
	            value: function asString() {
	                return this.toString(); //alias
	            }
	        },
	        asTimerange: {
	            value: function asTimerange() {
	                return this._r;
	            }
	        }
	    });

	    return Index;
	})();

	module.exports = Index;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () {
	    function defineProperties(target, props) {
	        for (var key in props) {
	            var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
	        }Object.defineProperties(target, props);
	    }return function (Constructor, protoProps, staticProps) {
	        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	    };
	})();

	var _classCallCheck = function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	        throw new TypeError("Cannot call a class as a function");
	    }
	};

	var _ = __webpack_require__(10);
	var Immutable = __webpack_require__(12);
	var moment = __webpack_require__(11);

	var TimeRange = (function () {
	    function TimeRange(b, e) {
	        _classCallCheck(this, TimeRange);

	        if (b instanceof TimeRange) {
	            this._range = b._range;
	        } else if (b instanceof Immutable.List) {
	            this._range = b;
	        } else if (_.isDate(b) && _.isDate(e)) {
	            this._range = Immutable.List([new Date(b.getTime()), new Date(e.getTime())]);
	        } else if (moment.isMoment(b) && moment.isMoment(e)) {
	            this._range = Immutable.List([new Date(b.valueOf()), new Date(e.valueOf())]);
	        } else if (_.isNumber(b) && _.isNumber(e)) {
	            this._range = Immutable.List([new Date(b), new Date(e)]);
	        }
	    }

	    _createClass(TimeRange, {
	        range: {

	            /**
	             * Returns the internal range, which is an Immutable List containing begin and end keys
	             */

	            value: function range() {
	                return this._range;
	            }
	        },
	        toJSON: {

	            //
	            // Serialize
	            //

	            value: function toJSON() {
	                return this._range.toJSON();
	            }
	        },
	        toString: {
	            value: function toString() {
	                return JSON.stringify(this.toJSON());
	            }
	        },
	        toLocalString: {
	            value: function toLocalString() {
	                return "[" + this.begin().toString() + ", " + this.end().toString() + "]";
	            }
	        },
	        toUTCString: {
	            value: function toUTCString() {
	                return "[" + this.begin().toUTCString() + ", " + this.end().toUTCString() + "]";
	            }
	        },
	        humanize: {
	            value: function humanize() {
	                var begin = new moment(this.begin());
	                var end = new moment(this.end());
	                return "" + begin.format("MMM D, YYYY hh:mm:ss a") + " to " + end.format("MMM D, YYYY hh:mm:ss a");
	            }
	        },
	        relativeString: {
	            value: function relativeString() {
	                var begin = new moment(this.begin());
	                var end = new moment(this.end());
	                return "" + begin.fromNow() + " to " + end.fromNow();
	            }
	        },
	        begin: {
	            value: function begin() {
	                return this._range.get(0);
	            }
	        },
	        end: {
	            value: function end() {
	                return this._range.get(1);
	            }
	        },
	        setBegin: {

	            /**
	             * Sets a new begin time on the TimeRange. The result will be a new TimeRange.
	             *
	             * @param {Date} - The begin time to set the start of the Timerange to.
	             */

	            value: function setBegin(t) {
	                return new TimeRange(this._range.set(0, t));
	            }
	        },
	        setEnd: {

	            /**
	             * Sets a new end time on the TimeRange. The result will be a new TimeRange.
	             *
	             * @param {Date} - The time to set the end of the Timerange to.
	             */

	            value: function setEnd(t) {
	                return new TimeRange(this._range.set(1, t));
	            }
	        },
	        equals: {

	            /**
	             * @returns {boolean} Returns if the two TimeRanges can be considered equal,
	             *                    in that they have the same times.
	             */

	            value: function equals(other) {
	                return this.begin() === other.begin() && this.end() === other.end();
	            }
	        },
	        contains: {

	            /**
	             * @param {TimeRange|Date} - The other Range or Date to compare this to.
	             * @returns {boolean} Returns true if other is completely inside this.
	             */

	            value: function contains(other) {
	                if (_.isDate(other)) {
	                    return this.begin() <= other && this.end() >= other;
	                } else {
	                    return this.begin() <= other.begin() && this.end() >= other.end();
	                }
	                return false;
	            }
	        },
	        within: {

	            /**
	             * @param - The other Range to compare this to.
	             * @returns {boolean} Returns true if this TimeRange is completely within the supplied other TimeRange.
	             */

	            value: function within(other) {
	                return this.begin() >= other.begin() && this.end() <= other.end();
	            }
	        },
	        overlaps: {

	            /**
	             * @param - The other Range to compare this to.
	             * @returns {boolean} Returns true if the passed in other TimeRange overlaps this time Range.
	             */

	            value: function overlaps(other) {
	                if (this.contains(other.begin()) && !this.contains(other.end()) || this.contains(other.end()) && !this.contains(other.begin())) {
	                    return true;
	                } else {
	                    return false;
	                }
	            }
	        },
	        disjoint: {

	            /**
	             * @param - The other Range to compare this to.
	             * @returns {boolean} Returns true if the passed in other Range in no way
	             * overlaps this time Range.
	             */

	            value: function disjoint(other) {
	                return this.end() < other.begin() || this.begin() > other.end();
	            }
	        },
	        extents: {

	            /**
	            * Returns a new Timerange which covers the extents of this and other combined.
	            *
	            * @param - The other Range to take the Union with.
	            * @returns {TimeRange} Returns a new Range that is the union of this and other.
	            */

	            value: function extents(other) {
	                var b = this.begin() < other.begin() ? this.begin() : other.begin();
	                var e = this.end() > other.end() ? this.end() : other.end();
	                return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
	            }
	        },
	        intersection: {

	            /**
	            * Returns a new TimeRange which is the intersection of this and other.
	            * @param - The other TimeRange to take the intersection with.
	            * @returns {TimeRange} Returns a new TimeRange which represents the intersection
	            * (overlapping) part of this and other.
	            */

	            value: function intersection(other) {
	                if (this.disjoint(other)) {
	                    return undefined;
	                }
	                var b = this.begin() > other.begin() ? this.begin() : other.begin();
	                var e = this.end() < other.end() ? this.end() : other.end();
	                return new TimeRange(new Date(b.getTime()), new Date(e.getTime()));
	            }
	        },
	        duration: {
	            value: function duration() {
	                return this.end().getTime() - this.begin().getTime();
	            }
	        },
	        humanizeDuration: {
	            value: function humanizeDuration() {
	                return moment.duration(this.duration()).humanize();
	            }
	        }
	    }, {
	        lastDay: {

	            //
	            // Static TimeRange creators
	            //

	            value: function lastDay(thing) {
	                var beginTime = moment();
	                var endTime = beginTime.clone().subtract(24, "hours");
	                return new TimeRange(beginTime, endTime);
	            }
	        },
	        lastSevenDays: {
	            value: function lastSevenDays(thing) {
	                var beginTime = moment();
	                var endTime = beginTime.clone().subtract(7, "days");
	                return new TimeRange(beginTime, endTime);
	            }
	        },
	        lastThirtyDays: {
	            value: function lastThirtyDays(thing) {
	                var beginTime = moment();
	                var endTime = beginTime.clone().subtract(30, "days");
	                return new TimeRange(beginTime, endTime);
	            }
	        },
	        lastNinetyDays: {
	            value: function lastNinetyDays(thing) {
	                var beginTime = moment();
	                var endTime = beginTime.clone().subtract(90, "days");
	                return new TimeRange(beginTime, endTime);
	            }
	        }
	    });

	    return TimeRange;
	})();

	module.exports = TimeRange;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () {
	    function defineProperties(target, props) {
	        for (var key in props) {
	            var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
	        }Object.defineProperties(target, props);
	    }return function (Constructor, protoProps, staticProps) {
	        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	    };
	})();

	var _classCallCheck = function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	        throw new TypeError("Cannot call a class as a function");
	    }
	};

	var moment = __webpack_require__(11);
	var _ = __webpack_require__(10);
	var Immutable = __webpack_require__(12);

	var util = __webpack_require__(9);
	var Index = __webpack_require__(1);
	var TimeRange = __webpack_require__(2);

	function timestampFromArgs(arg1) {
	    var timestamp = undefined;
	    if (_.isNumber(arg1)) {
	        timestamp = new Date(arg1);
	    } else if (_.isDate(arg1)) {
	        timestamp = new Date(arg1.getTime());
	    } else if (moment.isMoment(arg1)) {
	        timestamp = new Date(arg1.valueOf());
	    }
	    return timestamp;
	}

	function dataFromArgs(arg1) {
	    var data = {};
	    if (_.isObject(arg1)) {
	        data = new Immutable.Map(arg1);
	    } else if (data instanceof Immutable.Map) {
	        data = arg1;
	    } else {
	        data = new Immutable.Map({ value: arg1 });
	    }
	    return data;
	}

	/**
	 * A generic event
	 *
	 * This represents a data object at a single timestamp, supplied
	 * at initialization.
	 *
	 * The timestamp may be a javascript Date object or a Moment, but is
	 * stored internally as ms since UNIX epoch.
	 *
	 * The data may be any type.
	 *
	 * Asking the Event object for the timestamp returns an integer copy
	 * of the number of ms since the UNIX epoch. There's not method on
	 * the Event object to mutate the Event timestamp after it is created.
	 *
	 */

	var Event = (function () {
	    function Event(arg1, arg2) {
	        _classCallCheck(this, Event);

	        //Copy constructor
	        if (arg1 instanceof Event) {
	            var other = arg1;
	            this._time = other._time;
	            this._data = other._data;
	            return;
	        }

	        //Timestamp
	        this._time = timestampFromArgs(arg1);

	        //Data
	        this._data = dataFromArgs(arg2);
	    }

	    _createClass(Event, {
	        toJSON: {
	            value: function toJSON() {
	                return { time: this._time.getTime(), data: this._data.toJSON() };
	            }
	        },
	        toString: {
	            value: function toString() {
	                return JSON.stringify(this.toJSON());
	            }
	        },
	        timestampAsUTCString: {
	            value: function timestampAsUTCString() {
	                return this._time.toUTCString();
	            }
	        },
	        timestampAsLocalString: {
	            value: function timestampAsLocalString() {
	                return this._time.toString();
	            }
	        },
	        timestamp: {
	            value: function timestamp() {
	                return this._time;
	            }
	        },
	        data: {
	            value: function data() {
	                return this._data;
	            }
	        },
	        get: {
	            value: function get(key) {
	                var k = key || "value";
	                return this._data.get(k);
	            }
	        },
	        stringify: {
	            value: function stringify() {
	                return data.stringify(this._data);
	            }
	        }
	    });

	    return Event;
	})();

	/**
	 * An time range event uses a TimeRange to specify the range over which the event occurs
	 * and maps that to a data object representing some measurements or metrics during
	 * that time range.
	 *
	 * You supply the timerange as a TimeRange object.
	 *
	 * The data is also specified during construction and me be either:
	 *  1) a Javascript object or simple type
	 *  2) an Immutable.Map.
	 *
	 * If an Javascript object is provided it will be stored internally as an Immutable Map.
	 * If the data provided is some other simple type (such as an integer) then it will be
	 * equivalent to supplying an object of {value: data}. Data may also be undefined.
	 *
	 * The get the data out of an IndexedEvent instance use data(). It will return an
	 * Immutable.Map. Alternatively you can call toJSON() to return a Javascript object
	 * representation of the data, while toString() will serialize the event to a string.
	 *
	 */

	var TimeRangeEvent = (function () {
	    function TimeRangeEvent(arg1, arg2) {
	        _classCallCheck(this, TimeRangeEvent);

	        //Timerange
	        if (arg1 instanceof TimeRange) {
	            var timerange = arg1;
	            this._range = timerange;
	        }

	        //Data
	        this._data = dataFromArgs(arg2);
	    }

	    _createClass(TimeRangeEvent, {
	        toJSON: {
	            value: function toJSON() {
	                return { timerange: this._range.toJSON(), data: this._data.toJSON() };
	            }
	        },
	        toString: {
	            value: function toString() {
	                return JSON.stringify(this.toJSON());
	            }
	        },
	        timerange: {

	            //
	            // Access the timerange represented by the index
	            //

	            value: function timerange() {
	                return this._range;
	            }
	        },
	        timerangeAsUTCString: {
	            value: function timerangeAsUTCString() {
	                return this.timerange().toUTCString();
	            }
	        },
	        timerangeAsLocalString: {
	            value: function timerangeAsLocalString() {
	                return this.timerange().toLocalString();
	            }
	        },
	        begin: {
	            value: function begin() {
	                return this._range.begin();
	            }
	        },
	        end: {
	            value: function end() {
	                return this._range.end();
	            }
	        },
	        humanizeDuration: {
	            value: function humanizeDuration() {
	                return this._range.humanizeDuration();
	            }
	        },
	        data: {

	            //
	            // Access the event data
	            //

	            value: function data() {
	                return this._data;
	            }
	        },
	        get: {
	            value: function get(key) {
	                var k = key || "value";
	                return this._data.get(k);
	            }
	        }
	    });

	    return TimeRangeEvent;
	})();

	/**
	 * An indexed event uses a Index to specify a timerange over which the event occurs
	 * and maps that to a data object representing some measurement of metric during
	 * that time range.
	 *
	 * You can supply the index as a string or as an Index object.
	 *
	 * Example Indexes are:
	 *     - 1d-156 is the entire duration of the 156th day since the UNIX epoch
	 *     - 12:Mar:2014 is the entire duration of march in 2014 [not supported yet]
	 *
	 * The range, as expressed by the Index, is provided by the convenience method range(),
	 * which returns a TimeRange instance. Alternatively the begin and end times represented
	 * by the Index can be found with begin() and end() respectively.
	 *
	 * The data is also specified during construction, and is generally expected to be an
	 * object or an Immutable.Map. If an object is provided it will be stored internally as
	 * an ImmutableMap. If the data provided is some other type then it will be equivalent to
	 * supplying an object of {value: data}. Data may be undefined.
	 *
	 * The get the data out of an IndexedEvent instance use data(). It will return an
	 * Immutable.Map.
	 */

	var IndexedEvent = (function () {
	    function IndexedEvent(index, data) {
	        _classCallCheck(this, IndexedEvent);

	        //Index
	        if (_.isString(index)) {
	            this._i = new Index(index);
	        } else if (index instanceof Index) {
	            this._i = index;
	        }

	        //Data
	        if (_.isObject(data)) {
	            this._data = new Immutable.Map(data);
	        } else if (data instanceof Immutable.Map) {
	            this._data = data;
	        } else {
	            this._data = new Immutable.Map({ value: data });
	        }
	    }

	    _createClass(IndexedEvent, {
	        toJSON: {
	            value: function toJSON() {
	                return { index: this._i.asString(), data: this._data.toJSON() };
	            }
	        },
	        toString: {
	            value: function toString() {
	                return JSON.stringify(this.toJSON());
	            }
	        },
	        index: {

	            //
	            // Access the index itself
	            //

	            value: function index() {
	                return this._i;
	            }
	        },
	        timerangeAsUTCString: {

	            //
	            // Access the timerange represented by the index
	            //

	            value: function timerangeAsUTCString() {
	                return this.timerange().toUTCString();
	            }
	        },
	        timerangeAsLocalString: {
	            value: function timerangeAsLocalString() {
	                return this.timerange().toLocalString();
	            }
	        },
	        timerange: {
	            value: function timerange() {
	                return this._i.asTimerange();
	            }
	        },
	        begin: {
	            value: function begin() {
	                return this.timerange().begin();
	            }
	        },
	        end: {
	            value: function end() {
	                return this.timerange().end();
	            }
	        },
	        data: {

	            //
	            // Access the event data
	            //

	            value: function data() {
	                return this._data;
	            }
	        },
	        get: {
	            value: function get(key) {
	                var k = key || "value";
	                return this._data.get(k);
	            }
	        }
	    });

	    return IndexedEvent;
	})();

	module.exports.Event = Event;
	module.exports.TimeRangeEvent = TimeRangeEvent;
	module.exports.IndexedEvent = IndexedEvent;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _toArray = function _toArray(arr) {
	    return Array.isArray(arr) ? arr : Array.from(arr);
	};

	var _objectWithoutProperties = function _objectWithoutProperties(obj, keys) {
	    var target = {};for (var i in obj) {
	        if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];
	    }return target;
	};

	var _get = function get(_x, _x2, _x3) {
	    var _again = true;

	    _function: while (_again) {
	        var object = _x,
	            property = _x2,
	            receiver = _x3;
	        desc = parent = getter = undefined;
	        _again = false;
	        var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
	            var parent = Object.getPrototypeOf(object);if (parent === null) {
	                return undefined;
	            } else {
	                _x = parent;
	                _x2 = property;
	                _x3 = receiver;
	                _again = true;
	                continue _function;
	            }
	        } else if ("value" in desc && desc.writable) {
	            return desc.value;
	        } else {
	            var getter = desc.get;if (getter === undefined) {
	                return undefined;
	            }return getter.call(receiver);
	        }
	    }
	};

	var _inherits = function _inherits(subClass, superClass) {
	    if (typeof superClass !== "function" && superClass !== null) {
	        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
	};

	var _createClass = (function () {
	    function defineProperties(target, props) {
	        for (var key in props) {
	            var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
	        }Object.defineProperties(target, props);
	    }return function (Constructor, protoProps, staticProps) {
	        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	    };
	})();

	var _classCallCheck = function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	        throw new TypeError("Cannot call a class as a function");
	    }
	};

	var _ = __webpack_require__(10);
	var Immutable = __webpack_require__(12);

	var Index = __webpack_require__(1);
	var TimeRange = __webpack_require__(2);

	var _require = __webpack_require__(3);

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

	        if (arg1 instanceof Series) {

	            //
	            // Copy constructor
	            //

	            var other = arg1;

	            this._name = other._names;
	            this._meta = other._meta;
	            this._columns = other._columns;
	            this._series = other._series;
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
	 * one of data associated with those times. The index of the list links them
	 * together. You can fetch the full item at index n using get(n). This returns
	 * the item as an Event. Note that the internal data of the Event will be
	 * a reference to the immutable Map in the series list, so there's no copying. 
	 *
	 * The timerange associated with a TimeSeries is simply the bounds of the
	 * events within it (i.e. the min and max times).
	 */

	var TimeSeries = (function (_Series) {
	    function TimeSeries(arg1) {
	        var _this = this;

	        _classCallCheck(this, TimeSeries);

	        if (arg1 instanceof Series) {

	            //
	            // Copy constructor
	            //

	            //Construct the base series
	            var other = arg1;
	            _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", this).call(this, other._names, other._meta, other._columns, other._series);
	        } else if (_.isObject(arg1)) {
	            var name;

	            var _points;

	            var columns;
	            var meta;

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
	                    var _name = obj.name;

	                    var _meta = _objectWithoutProperties(obj, ["events", "name"]);

	                    columns = uniqueKeys(events).toJSON();
	                    _.each(events, function (event) {
	                        times.push(event.timestamp());
	                        data.push(event.data());
	                    });

	                    //Construct the base series
	                    _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this).call(_this, _name, _meta, columns, new Immutable.List(data));

	                    //List of times, as Immutable List
	                    _this._times = new Immutable.List(times);
	                } else if (_.has(obj, "columns") && _.has(obj, "points")) {
	                    name = obj.name;
	                    _points = obj.points;
	                    columns = obj.columns;
	                    meta = _objectWithoutProperties(obj, ["name", "points", "columns"]);

	                    name = name || "";
	                    meta = meta || {};

	                    //
	                    // If columns and points are passed in, then we construct the series
	                    // out of those, assuming the format of each point is:
	                    //
	                    //   [time, col1, col2, col3]
	                    //

	                    var _points = obj.points || [];

	                    // TODO: check to see if the first item is the time
	                    columns = obj.columns.slice(1) || [];

	                    //Series of data that we extract out the time and
	                    //pass the rest to the base class
	                    _.each(_points, function (point) {
	                        var _point = _toArray(point);

	                        var time = _point[0];

	                        var others = _point.slice(1);

	                        times.push(time);
	                        data.push(others);
	                    });

	                    _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this).call(_this, name, meta, columns, data);

	                    //List of times, as Immutable List
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

	                return _.extend(this._meta.toJSON(), {
	                    name: name,
	                    columns: columns,
	                    points: points
	                });
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

	/**
	 * TODO
	 */

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

	        _get(Object.getPrototypeOf(IndexedSeries.prototype), "constructor", this).call(this, data);

	        if (_.isString(index)) {
	            this._index = new Index(index);
	        } else if (index instanceof Index) {
	            this._index = index;
	        }
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

	                //The JSON output has 'time' as the first column
	                var columns = ["time"];
	                cols.forEach(function (column) {
	                    columns.push(column);
	                });

	                return _.extend(this._meta.toJSON(), {
	                    name: this._name,
	                    index: this.indexAsString(),
	                    columns: columns,
	                    points: series.map(function (value, i) {
	                        var data = [times.get(i)];
	                        cols.forEach(function (column, j) {
	                            data.push(value.get(column));
	                        });
	                        return data;
	                    })
	                });
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
	        range: {
	            value: function range() {
	                return this._index.asTimerange();
	            }
	        }
	    });

	    return IndexedSeries;
	})(TimeSeries);

	module.exports.Series = Series;
	module.exports.TimeSeries = TimeSeries;
	module.exports.IndexedSeries = IndexedSeries;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () {
	    function defineProperties(target, props) {
	        for (var key in props) {
	            var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
	        }Object.defineProperties(target, props);
	    }return function (Constructor, protoProps, staticProps) {
	        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	    };
	})();

	var _classCallCheck = function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	        throw new TypeError("Cannot call a class as a function");
	    }
	};

	var moment = __webpack_require__(11);
	var Immutable = __webpack_require__(12);
	var _ = __webpack_require__(10);

	var _require = __webpack_require__(3);

	var IndexedEvent = _require.IndexedEvent;

	var _require2 = __webpack_require__(4);

	var IndexedSeries = _require2.IndexedSeries;

	var Index = __webpack_require__(1);
	var TimeRange = __webpack_require__(2);

	/** Internal function to fund the unique keys of a bunch
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
	 * A bucket is a mutable collection of values that is used to
	 * accumulate aggregations over the index. The index may be an
	 * Index instance or a string.
	 *
	 * The left side of the index is the range indicator, which is
	 * itself a combination of a letter and a number:
	 *     - the letter is the unit, either s (seconds), d (days),
	 *       h (hours), or d (days).
	 *     - the size is the quantity of that unit.
	 * So 6h is six hours, 7d is seven days.
	 *
	 * The right side of the index is a number, which is n number of
	 * that range since Jan 1, 1970 UTC.
	 *
	 * And example of an index might be 1d-1673. This uniquely
	 * refers to a block of time 1 day long, starting 1673 days after
	 * the beginning of 1970.
	 */

	var Bucket = (function () {
	    function Bucket(index) {
	        _classCallCheck(this, Bucket);

	        //Index
	        if (_.isString(index)) {
	            this._index = new Index(index);
	        } else if (index instanceof Index) {
	            this._index = index;
	        }

	        this._cache = []; // Mutable internal list
	    }

	    _createClass(Bucket, {
	        index: {
	            value: function index() {
	                return this._index;
	            }
	        },
	        toUTCString: {
	            value: function toUTCString() {
	                return this.index().asString() + ": " + this.range().toUTCString();
	            }
	        },
	        toLocalString: {
	            value: function toLocalString() {
	                return this.index().asString() + ": " + this.range().toLocalString();
	            }
	        },
	        range: {

	            //
	            // Convenience access the bucket range
	            //

	            value: function range() {
	                return this._index.asTimerange();
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
	        _pushToCache: {

	            //
	            // Bucket cache, which could potentially be redis or something
	            // so pushing to the cache takes a callback, which will be called
	            // when the event is added to the cache.
	            //
	            // TODO: This should be stategy based.
	            //

	            value: function _pushToCache(event, cb) {
	                this._cache.push(event);
	                cb && cb(null);
	            }
	        },
	        _readFromCache: {
	            value: function _readFromCache(cb) {
	                cb && cb(this._cache);
	            }
	        },
	        addEvent: {

	            //
	            // Add values to the bucket
	            //

	            value: function addEvent(event, cb) {
	                this._pushToCache(event, function (err) {
	                    cb && cb(err);
	                });
	            }
	        },
	        aggregate: {

	            /**
	             * Takes the values within the bucket and aggregates them together
	             * into a new IndexedEvent using the operator supplied. Then result
	             * or error is passed to the callback.
	             */

	            value: function aggregate(operator, cb) {
	                var _this = this;

	                this._readFromCache(function (events) {
	                    var keys = uniqueKeys(events);
	                    var result = {};
	                    _.each(keys.toJS(), function (k) {
	                        var vals = _.map(events, function (v) {
	                            return v.get(k);
	                        });
	                        result[k] = operator.call(_this, _this._index, vals, k);
	                    });
	                    var event = new IndexedEvent(_this._index, result);
	                    cb && cb(event);
	                });
	            }
	        },
	        collect: {

	            /**
	             * Takes the values within the bucket and collects them together
	             * into a new IndexedSeries using the operator supplied. Then result
	             * or error is passed to the callback.
	             */

	            value: function collect(cb) {
	                var _this = this;

	                this._readFromCache(function (events) {
	                    var series = new IndexedSeries(_this._index, {
	                        name: _this._index.toString(),
	                        events: events
	                    });
	                    cb && cb(series);
	                });
	            }
	        }
	    });

	    return Bucket;
	})();

	module.exports = Bucket;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () {
	    function defineProperties(target, props) {
	        for (var key in props) {
	            var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
	        }Object.defineProperties(target, props);
	    }return function (Constructor, protoProps, staticProps) {
	        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	    };
	})();

	var _classCallCheck = function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	        throw new TypeError("Cannot call a class as a function");
	    }
	};

	var moment = __webpack_require__(11);
	var _ = __webpack_require__(10);

	var TimeRange = __webpack_require__(2);
	var Bucket = __webpack_require__(5);

	var units = {
	    s: { label: "seconds", length: 1 },
	    m: { label: "minutes", length: 60 },
	    h: { label: "hours", length: 60 * 60 },
	    d: { label: "days", length: 60 * 60 * 24 }
	};

	/**
	 * A BucketGenerator
	 *
	 * To use a BucketGenerator you supply the size of the buckets you want
	 * e.g. "1h" for hourly. Then you call bucket() as needed, each time
	 * with a date. The bucket containing that date will be returned.
	 *
	 * Buckets can then be used to aggregate data.
	 *
	 * @param {string} size The size of the bucket (e.g. 1d, 6h, 5m, 30s)
	 */

	var Generator = (function () {
	    function Generator(size) {
	        _classCallCheck(this, Generator);

	        this.size = size;
	        this.length = Generator.getLengthFromSize(size);
	    }

	    _createClass(Generator, {
	        bucketIndex: {
	            value: function bucketIndex(date) {
	                var pos = Generator.getBucketPosFromDate(date, this.length);
	                var index = this.size + "-" + pos;
	                return index;
	            }
	        },
	        bucket: {

	            /**
	             * Date in is assumed to be local and that the bucket will be
	             * created in UTC time. Note that this doesn't really matter
	             * for seconds, minutes, or hours. But days will be offset from
	             * midnight to midnight, depending on local timezone.
	             */

	            value: function bucket(date) {
	                var index = this.bucketIndex(date);
	                return new Bucket(index);
	            }
	        }
	    }, {
	        getLengthFromSize: {

	            /**
	             * Takes the size (e.g. 1d, 6h, 5m, 30s) and returns the length
	             * of the bucket in ms.
	             */

	            value: function getLengthFromSize(size) {
	                var num, unit, length;

	                //size should be two parts, a number and a letter. From the size
	                //we can get the length
	                var re = /([0-9]+)([smhd])/;
	                var parts = re.exec(size);
	                if (parts && parts.length >= 3) {
	                    num = parseInt(parts[1]);
	                    unit = parts[2];
	                    length = num * units[unit].length * 1000;
	                }
	                return length;
	            }
	        },
	        getBucketPosFromDate: {
	            value: function getBucketPosFromDate(date, length) {
	                //console.log("getBucketPosFromDate", date)
	                var dd = moment.utc(date).valueOf();
	                return parseInt(dd /= length, 10);
	            }
	        }
	    });

	    return Generator;
	})();

	module.exports = Generator;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () {
	    function defineProperties(target, props) {
	        for (var key in props) {
	            var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
	        }Object.defineProperties(target, props);
	    }return function (Constructor, protoProps, staticProps) {
	        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	    };
	})();

	var _classCallCheck = function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	        throw new TypeError("Cannot call a class as a function");
	    }
	};

	var Generator = __webpack_require__(6);
	var _ = __webpack_require__(10);
	var Immutable = __webpack_require__(12);

	var Aggregator = (function () {
	    function Aggregator(size, processor, selector, observer) {
	        _classCallCheck(this, Aggregator);

	        this._generator = new Generator(size);
	        this._processor = processor;
	        this._selector = selector;
	        this._currentBucket = null;

	        //Callback
	        this._onEmit = observer;
	    }

	    _createClass(Aggregator, {
	        bucket: {

	            /**
	             * Gets the current bucket or returns a new one.
	             *
	             * If a new bucket is generated the result of the old bucket is emitted
	             * automatically.
	             */

	            value: function bucket(d) {
	                var _this = this;

	                var thisBucketIndex = this._generator.bucketIndex(d);
	                var currentBucketIndex = this._currentBucket ? this._currentBucket.index().asString() : "";

	                if (thisBucketIndex !== currentBucketIndex) {
	                    if (this._currentBucket) {
	                        this._currentBucket.aggregate(this._processor, function (event) {
	                            _this._onEmit && _this._onEmit(_this._currentBucket.index(), event);
	                        });
	                    }
	                    this._currentBucket = this._generator.bucket(d);
	                }

	                return this._currentBucket;
	            }
	        },
	        done: {

	            /**
	             * Forces the current bucket to emit
	             */

	            value: function done() {
	                var _this = this;

	                if (this._currentBucket) {
	                    this._currentBucket.aggregate(this._processor, function (event) {
	                        _this._onEmit && _this._onEmit(_this._currentBucket.index(), event);
	                        _this._currentBucket = null;
	                    });
	                }
	            }
	        },
	        addEvent: {

	            /**
	             * Add an event, which will be assigned to a bucket
	             */

	            value: function addEvent(event, cb) {
	                var t = event.timestamp();
	                var bucket = this.bucket(t);

	                //
	                // Adding the value to the bucket. This could be an async operation
	                // so the passed in callback to this function will be called when this
	                // is done.
	                //

	                bucket.addEvent(event, this._aggregationFn, function (err) {
	                    if (err) {
	                        console.error("Could not add value to bucket:", err);
	                    }
	                    cb && cb(err);
	                });
	            }
	        },
	        onEmit: {
	            value: function onEmit(cb) {
	                this._onEmit = cb;
	            }
	        }
	    });

	    return Aggregator;
	})();

	module.exports = Aggregator;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(10);

	var _require = __webpack_require__(3);

	var IndexedEvent = _require.IndexedEvent;

	module.exports = {

	    /**
	     * These functions take an index and a list of values and
	     * return a calculated result.
	     */

	    sum: function sum(index, values) {
	        return _.reduce(values, function (a, b) {
	            return a + b;
	        }, 0);
	    },
	    avg: function avg(index, values) {
	        var sum = _.reduce(values, function (a, b) {
	            return a + b;
	        }, 0);
	        return sum / values.length;
	    },
	    max: function max(index, values) {
	        return _.max(values);
	    },
	    count: function count(index, values) {
	        return values.length;
	    } };

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var moment = __webpack_require__(11);
	var _ = __webpack_require__(10);

	var TimeRange = __webpack_require__(2);

	/**
	 * This function will take an index such as 1d-278 and
	 * return a TimeRange for that time
	 */
	function rangeFromIndex(index) {
	    var parts = index.split("-");
	    var size = parts[0];

	    //Position should be an int
	    var pos = parseInt(parts[1], 10);

	    //size should be two parts, a number and a letter
	    var re = /([0-9]+)([smhd])/;

	    var sizeParts = re.exec(size);
	    if (sizeParts && sizeParts.length >= 3) {
	        var num = parseInt(sizeParts[1]);
	        var unit = sizeParts[2];
	        var length = num * units[unit].length * 1000;
	    }

	    var beginTime = moment.utc(pos * length);
	    var endTime = moment.utc((pos + 1) * length);

	    return new TimeRange(beginTime, endTime);
	}

	module.exports.rangeFromIndex = rangeFromIndex;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.2
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	'use strict';

	(function () {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype,
	      ObjProto = Object.prototype,
	      FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var push = ArrayProto.push,
	      slice = ArrayProto.slice,
	      toString = ObjProto.toString,
	      hasOwnProperty = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var nativeIsArray = Array.isArray,
	      nativeKeys = Object.keys,
	      nativeBind = FuncProto.bind,
	      nativeCreate = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function Ctor() {};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function _(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.2';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function optimizeCb(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1:
	        return function (value) {
	          return func.call(context, value);
	        };
	      case 2:
	        return function (value, other) {
	          return func.call(context, value, other);
	        };
	      case 3:
	        return function (value, index, collection) {
	          return func.call(context, value, index, collection);
	        };
	      case 4:
	        return function (accumulator, value, index, collection) {
	          return func.call(context, accumulator, value, index, collection);
	        };
	    }
	    return function () {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function cb(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function (value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function createAssigner(keysFunc, undefinedOnly) {
	    return function (obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function baseCreate(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor();
	    Ctor.prototype = null;
	    return result;
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var isArrayLike = function isArrayLike(collection) {
	    var length = collection && collection.length;
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function (obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function (obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function (obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function (obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function (obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function (value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function (obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given value (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function (obj, target, fromIndex) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    return _.indexOf(obj, target, typeof fromIndex == 'number' && fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function (obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function (value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function (obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function (obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function (obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function (obj, iteratee, context) {
	    var result = -Infinity,
	        lastComputed = -Infinity,
	        value,
	        computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function (value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function (obj, iteratee, context) {
	    var result = Infinity,
	        lastComputed = Infinity,
	        value,
	        computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function (value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function (obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function (obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function (obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function (value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function (left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function group(behavior) {
	    return function (obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function (value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function (result, value, key) {
	    if (_.has(result, key)) result[key].push(value);else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function (result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function (result, value, key) {
	    if (_.has(result, key)) result[key]++;else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function (obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function (obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [],
	        fail = [];
	    _.each(obj, function (value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function (array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function (array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function (array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function (array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function (array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function flatten(input, shallow, strict, startIndex) {
	    var output = [],
	        idx = 0;
	    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0,
	            len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function (array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function (array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
	    if (array == null) return [];
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = array.length; i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function () {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function (array) {
	    if (array == null) return [];
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = array.length; i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function (array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function (value) {
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function () {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function (array) {
	    var length = array && _.max(array, 'length').length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function (list, values) {
	    var result = {};
	    for (var i = 0, length = list && list.length; i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = function (array, item, isSorted) {
	    var i = 0,
	        length = array && array.length;
	    if (typeof isSorted == 'number') {
	      i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
	    } else if (isSorted && length) {
	      i = _.sortedIndex(array, item);
	      return array[i] === item ? i : -1;
	    }
	    if (item !== item) {
	      return _.findIndex(slice.call(array, i), _.isNaN);
	    }
	    for (; i < length; i++) if (array[i] === item) return i;
	    return -1;
	  };

	  _.lastIndexOf = function (array, item, from) {
	    var idx = array ? array.length : 0;
	    if (typeof from == 'number') {
	      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
	    }
	    if (item !== item) {
	      return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
	    }
	    while (--idx >= 0) if (array[idx] === item) return idx;
	    return -1;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createIndexFinder(dir) {
	    return function (array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = array != null && array.length;
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createIndexFinder(1);

	  _.findLastIndex = createIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function (array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0,
	        high = array.length;
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
	    }
	    return low;
	  };

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function (start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function (func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function bound() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function (func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function bound() {
	      var position = 0,
	          length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function (obj) {
	    var i,
	        length = arguments.length,
	        key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function (func, hasher) {
	    var memoize = function memoize(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function (func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function () {
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function (func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function later() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function () {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function (func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function later() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function () {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function (func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function (predicate) {
	    return function () {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function () {
	    var args = arguments;
	    var start = args.length - 1;
	    return function () {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function (times, func) {
	    return function () {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function (times, func) {
	    var memo;
	    return function () {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function (obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function (obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function (obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function (obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = _.keys(obj),
	        length = keys.length,
	        results = {},
	        currentKey;
	    for (var index = 0; index < length; index++) {
	      currentKey = keys[index];
	      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function (obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function (obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function (obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj),
	        key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function (object, oiteratee, context) {
	    var result = {},
	        obj = object,
	        iteratee,
	        keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function (value, key, obj) {
	        return key in obj;
	      };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	  // Return a copy of the object without the blacklisted properties.
	  _.omit = function (obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function (value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function (obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function (obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function (object, attrs) {
	    var keys = _.keys(attrs),
	        length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };

	  // Internal recursive comparison function for `isEqual`.
	  var eq = function eq(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor,
	          bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a),
	          key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function (a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function (obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function (obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function (obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function (obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
	    _['is' + name] = function (obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function (obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function (obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function (obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function (obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function (obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function (obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function (obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function (obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function () {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function (value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function (value) {
	    return function () {
	      return value;
	    };
	  };

	  _.noop = function () {};

	  _.property = function (key) {
	    return function (obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function (obj) {
	    return obj == null ? function () {} : function (key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function (attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function (obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function (n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function (min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function () {
	    return new Date().getTime();
	  };

	  // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    '\'': '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function createEscaper(map) {
	    var escaper = function escaper(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function (string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function (object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function (prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate: /<%([\s\S]+?)%>/g,
	    interpolate: /<%=([\s\S]+?)%>/g,
	    escape: /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    '\'': '\'',
	    '\\': '\\',
	    '\r': 'r',
	    '\n': 'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function escapeChar(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function (text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = '__p+=\'';
	    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
	      } else if (interpolate) {
	        source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
	      } else if (evaluate) {
	        source += '\';\n' + evaluate + '\n__p+=\'';
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += '\';\n';

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function template(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function (obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function result(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function (obj) {
	    _.each(_.functions(obj), function (name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function () {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function () {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function (name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function () {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function () {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function () {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(undefined);

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global, module) {//! moment.js
	//! version : 2.9.0
	//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
	//! license : MIT
	//! momentjs.com

	'use strict';

	(function (undefined) {
	    /************************************
	        Constants
	    ************************************/

	    var moment,
	        VERSION = '2.9.0',

	    // the global-scope this is NOT the global object in Node.js
	    globalScope = typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window) ? global : this,
	        oldGlobalMoment,
	        round = Math.round,
	        hasOwnProperty = Object.prototype.hasOwnProperty,
	        i,
	        YEAR = 0,
	        MONTH = 1,
	        DATE = 2,
	        HOUR = 3,
	        MINUTE = 4,
	        SECOND = 5,
	        MILLISECOND = 6,

	    // internal storage for locale config files
	    locales = {},

	    // extra moment internal properties (plugins register props here)
	    momentProperties = [],

	    // check for nodeJS
	    hasModule = typeof module !== 'undefined' && module && module.exports,

	    // ASP.NET json date format regex
	    aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
	        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

	    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	    isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

	    // format tokens
	    formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
	        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

	    // parsing token regexes
	    parseTokenOneOrTwoDigits = /\d\d?/,
	        // 0 - 99
	    parseTokenOneToThreeDigits = /\d{1,3}/,
	        // 0 - 999
	    parseTokenOneToFourDigits = /\d{1,4}/,
	        // 0 - 9999
	    parseTokenOneToSixDigits = /[+\-]?\d{1,6}/,
	        // -999,999 - 999,999
	    parseTokenDigits = /\d+/,
	        // nonzero number of digits
	    parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
	        // any word (or two) characters or numbers including two/three word month in arabic.
	    parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi,
	        // +00:00 -00:00 +0000 -0000 or Z
	    parseTokenT = /T/i,
	        // T (ISO separator)
	    parseTokenOffsetMs = /[\+\-]?\d+/,
	        // 1234567890123
	    parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/,
	        // 123456789 123456789.123

	    //strict parsing regexes
	    parseTokenOneDigit = /\d/,
	        // 0 - 9
	    parseTokenTwoDigits = /\d\d/,
	        // 00 - 99
	    parseTokenThreeDigits = /\d{3}/,
	        // 000 - 999
	    parseTokenFourDigits = /\d{4}/,
	        // 0000 - 9999
	    parseTokenSixDigits = /[+-]?\d{6}/,
	        // -999,999 - 999,999
	    parseTokenSignedNumber = /[+-]?\d+/,
	        // -inf - inf

	    // iso 8601 regex
	    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
	    isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
	        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',
	        isoDates = [['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/], ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/], ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/], ['GGGG-[W]WW', /\d{4}-W\d{2}/], ['YYYY-DDD', /\d{4}-\d{3}/]],

	    // iso time formats and regexes
	    isoTimes = [['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/], ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/], ['HH:mm', /(T| )\d\d:\d\d/], ['HH', /(T| )\d\d/]],

	    // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-', '15', '30']
	    parseTimezoneChunker = /([\+\-]|\d\d)/gi,

	    // getter and setter names
	    proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
	        unitMillisecondFactors = {
	        'Milliseconds': 1,
	        'Seconds': 1000,
	        'Minutes': 60000,
	        'Hours': 3600000,
	        'Days': 86400000,
	        'Months': 2592000000,
	        'Years': 31536000000
	    },
	        unitAliases = {
	        ms: 'millisecond',
	        s: 'second',
	        m: 'minute',
	        h: 'hour',
	        d: 'day',
	        D: 'date',
	        w: 'week',
	        W: 'isoWeek',
	        M: 'month',
	        Q: 'quarter',
	        y: 'year',
	        DDD: 'dayOfYear',
	        e: 'weekday',
	        E: 'isoWeekday',
	        gg: 'weekYear',
	        GG: 'isoWeekYear'
	    },
	        camelFunctions = {
	        dayofyear: 'dayOfYear',
	        isoweekday: 'isoWeekday',
	        isoweek: 'isoWeek',
	        weekyear: 'weekYear',
	        isoweekyear: 'isoWeekYear'
	    },

	    // format function strings
	    formatFunctions = {},

	    // default relative time thresholds
	    relativeTimeThresholds = {
	        s: 45, // seconds to minute
	        m: 45, // minutes to hour
	        h: 22, // hours to day
	        d: 26, // days to month
	        M: 11 // months to year
	    },

	    // tokens to ordinalize and pad
	    ordinalizeTokens = 'DDD w W M D d'.split(' '),
	        paddedTokens = 'M D H h m s w W'.split(' '),
	        formatTokenFunctions = {
	        M: function M() {
	            return this.month() + 1;
	        },
	        MMM: function MMM(format) {
	            return this.localeData().monthsShort(this, format);
	        },
	        MMMM: function MMMM(format) {
	            return this.localeData().months(this, format);
	        },
	        D: function D() {
	            return this.date();
	        },
	        DDD: function DDD() {
	            return this.dayOfYear();
	        },
	        d: function d() {
	            return this.day();
	        },
	        dd: function dd(format) {
	            return this.localeData().weekdaysMin(this, format);
	        },
	        ddd: function ddd(format) {
	            return this.localeData().weekdaysShort(this, format);
	        },
	        dddd: function dddd(format) {
	            return this.localeData().weekdays(this, format);
	        },
	        w: function w() {
	            return this.week();
	        },
	        W: function W() {
	            return this.isoWeek();
	        },
	        YY: function YY() {
	            return leftZeroFill(this.year() % 100, 2);
	        },
	        YYYY: function YYYY() {
	            return leftZeroFill(this.year(), 4);
	        },
	        YYYYY: function YYYYY() {
	            return leftZeroFill(this.year(), 5);
	        },
	        YYYYYY: function YYYYYY() {
	            var y = this.year(),
	                sign = y >= 0 ? '+' : '-';
	            return sign + leftZeroFill(Math.abs(y), 6);
	        },
	        gg: function gg() {
	            return leftZeroFill(this.weekYear() % 100, 2);
	        },
	        gggg: function gggg() {
	            return leftZeroFill(this.weekYear(), 4);
	        },
	        ggggg: function ggggg() {
	            return leftZeroFill(this.weekYear(), 5);
	        },
	        GG: function GG() {
	            return leftZeroFill(this.isoWeekYear() % 100, 2);
	        },
	        GGGG: function GGGG() {
	            return leftZeroFill(this.isoWeekYear(), 4);
	        },
	        GGGGG: function GGGGG() {
	            return leftZeroFill(this.isoWeekYear(), 5);
	        },
	        e: function e() {
	            return this.weekday();
	        },
	        E: function E() {
	            return this.isoWeekday();
	        },
	        a: function a() {
	            return this.localeData().meridiem(this.hours(), this.minutes(), true);
	        },
	        A: function A() {
	            return this.localeData().meridiem(this.hours(), this.minutes(), false);
	        },
	        H: function H() {
	            return this.hours();
	        },
	        h: function h() {
	            return this.hours() % 12 || 12;
	        },
	        m: function m() {
	            return this.minutes();
	        },
	        s: function s() {
	            return this.seconds();
	        },
	        S: function S() {
	            return toInt(this.milliseconds() / 100);
	        },
	        SS: function SS() {
	            return leftZeroFill(toInt(this.milliseconds() / 10), 2);
	        },
	        SSS: function SSS() {
	            return leftZeroFill(this.milliseconds(), 3);
	        },
	        SSSS: function SSSS() {
	            return leftZeroFill(this.milliseconds(), 3);
	        },
	        Z: function Z() {
	            var a = this.utcOffset(),
	                b = '+';
	            if (a < 0) {
	                a = -a;
	                b = '-';
	            }
	            return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
	        },
	        ZZ: function ZZ() {
	            var a = this.utcOffset(),
	                b = '+';
	            if (a < 0) {
	                a = -a;
	                b = '-';
	            }
	            return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
	        },
	        z: function z() {
	            return this.zoneAbbr();
	        },
	        zz: function zz() {
	            return this.zoneName();
	        },
	        x: function x() {
	            return this.valueOf();
	        },
	        X: function X() {
	            return this.unix();
	        },
	        Q: function Q() {
	            return this.quarter();
	        }
	    },
	        deprecations = {},
	        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'],
	        updateInProgress = false;

	    // Pick the first defined of two or three arguments. dfl comes from
	    // default.
	    function dfl(a, b, c) {
	        switch (arguments.length) {
	            case 2:
	                return a != null ? a : b;
	            case 3:
	                return a != null ? a : b != null ? b : c;
	            default:
	                throw new Error('Implement me');
	        }
	    }

	    function hasOwnProp(a, b) {
	        return hasOwnProperty.call(a, b);
	    }

	    function defaultParsingFlags() {
	        // We need to deep clone this object, and es5 standard is not very
	        // helpful.
	        return {
	            empty: false,
	            unusedTokens: [],
	            unusedInput: [],
	            overflow: -2,
	            charsLeftOver: 0,
	            nullInput: false,
	            invalidMonth: null,
	            invalidFormat: false,
	            userInvalidated: false,
	            iso: false
	        };
	    }

	    function printMsg(msg) {
	        if (moment.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
	            console.warn('Deprecation warning: ' + msg);
	        }
	    }

	    function deprecate(msg, fn) {
	        var firstTime = true;
	        return extend(function () {
	            if (firstTime) {
	                printMsg(msg);
	                firstTime = false;
	            }
	            return fn.apply(this, arguments);
	        }, fn);
	    }

	    function deprecateSimple(name, msg) {
	        if (!deprecations[name]) {
	            printMsg(msg);
	            deprecations[name] = true;
	        }
	    }

	    function padToken(func, count) {
	        return function (a) {
	            return leftZeroFill(func.call(this, a), count);
	        };
	    }
	    function ordinalizeToken(func, period) {
	        return function (a) {
	            return this.localeData().ordinal(func.call(this, a), period);
	        };
	    }

	    function monthDiff(a, b) {
	        // difference in months
	        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),

	        // b is in (anchor - 1 month, anchor + 1 month)
	        anchor = a.clone().add(wholeMonthDiff, 'months'),
	            anchor2,
	            adjust;

	        if (b - anchor < 0) {
	            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor - anchor2);
	        } else {
	            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor2 - anchor);
	        }

	        return -(wholeMonthDiff + adjust);
	    }

	    while (ordinalizeTokens.length) {
	        i = ordinalizeTokens.pop();
	        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
	    }
	    while (paddedTokens.length) {
	        i = paddedTokens.pop();
	        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
	    }
	    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);

	    function meridiemFixWrap(locale, hour, meridiem) {
	        var isPm;

	        if (meridiem == null) {
	            // nothing to do
	            return hour;
	        }
	        if (locale.meridiemHour != null) {
	            return locale.meridiemHour(hour, meridiem);
	        } else if (locale.isPM != null) {
	            // Fallback
	            isPm = locale.isPM(meridiem);
	            if (isPm && hour < 12) {
	                hour += 12;
	            }
	            if (!isPm && hour === 12) {
	                hour = 0;
	            }
	            return hour;
	        } else {
	            // thie is not supposed to happen
	            return hour;
	        }
	    }

	    /************************************
	        Constructors
	    ************************************/

	    function Locale() {}

	    // Moment prototype object
	    function Moment(config, skipOverflow) {
	        if (skipOverflow !== false) {
	            checkOverflow(config);
	        }
	        copyConfig(this, config);
	        this._d = new Date(+config._d);
	        // Prevent infinite loop in case updateOffset creates new moment
	        // objects.
	        if (updateInProgress === false) {
	            updateInProgress = true;
	            moment.updateOffset(this);
	            updateInProgress = false;
	        }
	    }

	    // Duration Constructor
	    function Duration(duration) {
	        var normalizedInput = normalizeObjectUnits(duration),
	            years = normalizedInput.year || 0,
	            quarters = normalizedInput.quarter || 0,
	            months = normalizedInput.month || 0,
	            weeks = normalizedInput.week || 0,
	            days = normalizedInput.day || 0,
	            hours = normalizedInput.hour || 0,
	            minutes = normalizedInput.minute || 0,
	            seconds = normalizedInput.second || 0,
	            milliseconds = normalizedInput.millisecond || 0;

	        // representation for dateAddRemove
	        this._milliseconds = +milliseconds + seconds * 1000 + // 1000
	        minutes * 60000 + // 1000 * 60
	        hours * 3600000; // 1000 * 60 * 60
	        // Because of dateAddRemove treats 24 hours as different from a
	        // day when working around DST, we need to store them separately
	        this._days = +days + weeks * 7;
	        // It is impossible translate months into days without knowing
	        // which months you are are talking about, so we have to store
	        // it separately.
	        this._months = +months + quarters * 3 + years * 12;

	        this._data = {};

	        this._locale = moment.localeData();

	        this._bubble();
	    }

	    /************************************
	        Helpers
	    ************************************/

	    function extend(a, b) {
	        for (var i in b) {
	            if (hasOwnProp(b, i)) {
	                a[i] = b[i];
	            }
	        }

	        if (hasOwnProp(b, 'toString')) {
	            a.toString = b.toString;
	        }

	        if (hasOwnProp(b, 'valueOf')) {
	            a.valueOf = b.valueOf;
	        }

	        return a;
	    }

	    function copyConfig(to, from) {
	        var i, prop, val;

	        if (typeof from._isAMomentObject !== 'undefined') {
	            to._isAMomentObject = from._isAMomentObject;
	        }
	        if (typeof from._i !== 'undefined') {
	            to._i = from._i;
	        }
	        if (typeof from._f !== 'undefined') {
	            to._f = from._f;
	        }
	        if (typeof from._l !== 'undefined') {
	            to._l = from._l;
	        }
	        if (typeof from._strict !== 'undefined') {
	            to._strict = from._strict;
	        }
	        if (typeof from._tzm !== 'undefined') {
	            to._tzm = from._tzm;
	        }
	        if (typeof from._isUTC !== 'undefined') {
	            to._isUTC = from._isUTC;
	        }
	        if (typeof from._offset !== 'undefined') {
	            to._offset = from._offset;
	        }
	        if (typeof from._pf !== 'undefined') {
	            to._pf = from._pf;
	        }
	        if (typeof from._locale !== 'undefined') {
	            to._locale = from._locale;
	        }

	        if (momentProperties.length > 0) {
	            for (i in momentProperties) {
	                prop = momentProperties[i];
	                val = from[prop];
	                if (typeof val !== 'undefined') {
	                    to[prop] = val;
	                }
	            }
	        }

	        return to;
	    }

	    function absRound(number) {
	        if (number < 0) {
	            return Math.ceil(number);
	        } else {
	            return Math.floor(number);
	        }
	    }

	    // left zero fill a number
	    // see http://jsperf.com/left-zero-filling for performance comparison
	    function leftZeroFill(number, targetLength, forceSign) {
	        var output = '' + Math.abs(number),
	            sign = number >= 0;

	        while (output.length < targetLength) {
	            output = '0' + output;
	        }
	        return (sign ? forceSign ? '+' : '' : '-') + output;
	    }

	    function positiveMomentsDifference(base, other) {
	        var res = { milliseconds: 0, months: 0 };

	        res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
	        if (base.clone().add(res.months, 'M').isAfter(other)) {
	            --res.months;
	        }

	        res.milliseconds = +other - +base.clone().add(res.months, 'M');

	        return res;
	    }

	    function momentsDifference(base, other) {
	        var res;
	        other = makeAs(other, base);
	        if (base.isBefore(other)) {
	            res = positiveMomentsDifference(base, other);
	        } else {
	            res = positiveMomentsDifference(other, base);
	            res.milliseconds = -res.milliseconds;
	            res.months = -res.months;
	        }

	        return res;
	    }

	    // TODO: remove 'name' arg after deprecation is removed
	    function createAdder(direction, name) {
	        return function (val, period) {
	            var dur, tmp;
	            //invert the arguments, but complain about it
	            if (period !== null && !isNaN(+period)) {
	                deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
	                tmp = val;val = period;period = tmp;
	            }

	            val = typeof val === 'string' ? +val : val;
	            dur = moment.duration(val, period);
	            addOrSubtractDurationFromMoment(this, dur, direction);
	            return this;
	        };
	    }

	    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
	        var milliseconds = duration._milliseconds,
	            days = duration._days,
	            months = duration._months;
	        updateOffset = updateOffset == null ? true : updateOffset;

	        if (milliseconds) {
	            mom._d.setTime(+mom._d + milliseconds * isAdding);
	        }
	        if (days) {
	            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
	        }
	        if (months) {
	            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
	        }
	        if (updateOffset) {
	            moment.updateOffset(mom, days || months);
	        }
	    }

	    // check if is an array
	    function isArray(input) {
	        return Object.prototype.toString.call(input) === '[object Array]';
	    }

	    function isDate(input) {
	        return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
	    }

	    // compare two arrays, return the number of differences
	    function compareArrays(array1, array2, dontConvert) {
	        var len = Math.min(array1.length, array2.length),
	            lengthDiff = Math.abs(array1.length - array2.length),
	            diffs = 0,
	            i;
	        for (i = 0; i < len; i++) {
	            if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
	                diffs++;
	            }
	        }
	        return diffs + lengthDiff;
	    }

	    function normalizeUnits(units) {
	        if (units) {
	            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
	            units = unitAliases[units] || camelFunctions[lowered] || lowered;
	        }
	        return units;
	    }

	    function normalizeObjectUnits(inputObject) {
	        var normalizedInput = {},
	            normalizedProp,
	            prop;

	        for (prop in inputObject) {
	            if (hasOwnProp(inputObject, prop)) {
	                normalizedProp = normalizeUnits(prop);
	                if (normalizedProp) {
	                    normalizedInput[normalizedProp] = inputObject[prop];
	                }
	            }
	        }

	        return normalizedInput;
	    }

	    function makeList(field) {
	        var count, setter;

	        if (field.indexOf('week') === 0) {
	            count = 7;
	            setter = 'day';
	        } else if (field.indexOf('month') === 0) {
	            count = 12;
	            setter = 'month';
	        } else {
	            return;
	        }

	        moment[field] = function (format, index) {
	            var i,
	                getter,
	                method = moment._locale[field],
	                results = [];

	            if (typeof format === 'number') {
	                index = format;
	                format = undefined;
	            }

	            getter = function (i) {
	                var m = moment().utc().set(setter, i);
	                return method.call(moment._locale, m, format || '');
	            };

	            if (index != null) {
	                return getter(index);
	            } else {
	                for (i = 0; i < count; i++) {
	                    results.push(getter(i));
	                }
	                return results;
	            }
	        };
	    }

	    function toInt(argumentForCoercion) {
	        var coercedNumber = +argumentForCoercion,
	            value = 0;

	        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
	            if (coercedNumber >= 0) {
	                value = Math.floor(coercedNumber);
	            } else {
	                value = Math.ceil(coercedNumber);
	            }
	        }

	        return value;
	    }

	    function _daysInMonth(year, month) {
	        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	    }

	    function _weeksInYear(year, dow, doy) {
	        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
	    }

	    function daysInYear(year) {
	        return _isLeapYear(year) ? 366 : 365;
	    }

	    function _isLeapYear(year) {
	        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
	    }

	    function checkOverflow(m) {
	        var overflow;
	        if (m._a && m._pf.overflow === -2) {
	            overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > _daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 24 || m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 || m._a[SECOND] !== 0 || m._a[MILLISECOND] !== 0) ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;

	            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
	                overflow = DATE;
	            }

	            m._pf.overflow = overflow;
	        }
	    }

	    function _isValid(m) {
	        if (m._isValid == null) {
	            m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;

	            if (m._strict) {
	                m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0 && m._pf.bigHour === undefined;
	            }
	        }
	        return m._isValid;
	    }

	    function normalizeLocale(key) {
	        return key ? key.toLowerCase().replace('_', '-') : key;
	    }

	    // pick the locale from the array
	    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	    function chooseLocale(names) {
	        var i = 0,
	            j,
	            next,
	            locale,
	            split;

	        while (i < names.length) {
	            split = normalizeLocale(names[i]).split('-');
	            j = split.length;
	            next = normalizeLocale(names[i + 1]);
	            next = next ? next.split('-') : null;
	            while (j > 0) {
	                locale = loadLocale(split.slice(0, j).join('-'));
	                if (locale) {
	                    return locale;
	                }
	                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
	                    //the next array item is better than a shallower substring of this one
	                    break;
	                }
	                j--;
	            }
	            i++;
	        }
	        return null;
	    }

	    function loadLocale(name) {
	        var oldLocale = null;
	        if (!locales[name] && hasModule) {
	            try {
	                oldLocale = moment.locale();
	                __webpack_require__(13)("./" + name);
	                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
	                moment.locale(oldLocale);
	            } catch (e) {}
	        }
	        return locales[name];
	    }

	    // Return a moment from input, that is local/utc/utcOffset equivalent to
	    // model.
	    function makeAs(input, model) {
	        var res, diff;
	        if (model._isUTC) {
	            res = model.clone();
	            diff = (moment.isMoment(input) || isDate(input) ? +input : +moment(input)) - +res;
	            // Use low-level api, because this fn is low-level api.
	            res._d.setTime(+res._d + diff);
	            moment.updateOffset(res, false);
	            return res;
	        } else {
	            return moment(input).local();
	        }
	    }

	    /************************************
	        Locale
	    ************************************/

	    extend(Locale.prototype, {

	        set: function set(config) {
	            var prop, i;
	            for (i in config) {
	                prop = config[i];
	                if (typeof prop === 'function') {
	                    this[i] = prop;
	                } else {
	                    this['_' + i] = prop;
	                }
	            }
	            // Lenient ordinal parsing accepts just a number in addition to
	            // number + (possibly) stuff coming from _ordinalParseLenient.
	            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
	        },

	        _months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        months: function months(m) {
	            return this._months[m.month()];
	        },

	        _monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        monthsShort: function monthsShort(m) {
	            return this._monthsShort[m.month()];
	        },

	        monthsParse: function monthsParse(monthName, format, strict) {
	            var i, mom, regex;

	            if (!this._monthsParse) {
	                this._monthsParse = [];
	                this._longMonthsParse = [];
	                this._shortMonthsParse = [];
	            }

	            for (i = 0; i < 12; i++) {
	                // make the regex if we don't have it already
	                mom = moment.utc([2000, i]);
	                if (strict && !this._longMonthsParse[i]) {
	                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
	                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
	                }
	                if (!strict && !this._monthsParse[i]) {
	                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
	                }
	                // test the regex
	                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
	                    return i;
	                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
	                    return i;
	                } else if (!strict && this._monthsParse[i].test(monthName)) {
	                    return i;
	                }
	            }
	        },

	        _weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdays: function weekdays(m) {
	            return this._weekdays[m.day()];
	        },

	        _weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysShort: function weekdaysShort(m) {
	            return this._weekdaysShort[m.day()];
	        },

	        _weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        weekdaysMin: function weekdaysMin(m) {
	            return this._weekdaysMin[m.day()];
	        },

	        weekdaysParse: function weekdaysParse(weekdayName) {
	            var i, mom, regex;

	            if (!this._weekdaysParse) {
	                this._weekdaysParse = [];
	            }

	            for (i = 0; i < 7; i++) {
	                // make the regex if we don't have it already
	                if (!this._weekdaysParse[i]) {
	                    mom = moment([2000, 1]).day(i);
	                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
	                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
	                }
	                // test the regex
	                if (this._weekdaysParse[i].test(weekdayName)) {
	                    return i;
	                }
	            }
	        },

	        _longDateFormat: {
	            LTS: 'h:mm:ss A',
	            LT: 'h:mm A',
	            L: 'MM/DD/YYYY',
	            LL: 'MMMM D, YYYY',
	            LLL: 'MMMM D, YYYY LT',
	            LLLL: 'dddd, MMMM D, YYYY LT'
	        },
	        longDateFormat: function longDateFormat(key) {
	            var output = this._longDateFormat[key];
	            if (!output && this._longDateFormat[key.toUpperCase()]) {
	                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
	                    return val.slice(1);
	                });
	                this._longDateFormat[key] = output;
	            }
	            return output;
	        },

	        isPM: function isPM(input) {
	            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
	            // Using charAt should be more compatible.
	            return (input + '').toLowerCase().charAt(0) === 'p';
	        },

	        _meridiemParse: /[ap]\.?m?\.?/i,
	        meridiem: function meridiem(hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'pm' : 'PM';
	            } else {
	                return isLower ? 'am' : 'AM';
	            }
	        },

	        _calendar: {
	            sameDay: '[Today at] LT',
	            nextDay: '[Tomorrow at] LT',
	            nextWeek: 'dddd [at] LT',
	            lastDay: '[Yesterday at] LT',
	            lastWeek: '[Last] dddd [at] LT',
	            sameElse: 'L'
	        },
	        calendar: function calendar(key, mom, now) {
	            var output = this._calendar[key];
	            return typeof output === 'function' ? output.apply(mom, [now]) : output;
	        },

	        _relativeTime: {
	            future: 'in %s',
	            past: '%s ago',
	            s: 'a few seconds',
	            m: 'a minute',
	            mm: '%d minutes',
	            h: 'an hour',
	            hh: '%d hours',
	            d: 'a day',
	            dd: '%d days',
	            M: 'a month',
	            MM: '%d months',
	            y: 'a year',
	            yy: '%d years'
	        },

	        relativeTime: function relativeTime(number, withoutSuffix, string, isFuture) {
	            var output = this._relativeTime[string];
	            return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
	        },

	        pastFuture: function pastFuture(diff, output) {
	            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
	            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
	        },

	        ordinal: function ordinal(number) {
	            return this._ordinal.replace('%d', number);
	        },
	        _ordinal: '%d',
	        _ordinalParse: /\d{1,2}/,

	        preparse: function preparse(string) {
	            return string;
	        },

	        postformat: function postformat(string) {
	            return string;
	        },

	        week: function week(mom) {
	            return weekOfYear(mom, this._week.dow, this._week.doy).week;
	        },

	        _week: {
	            dow: 0, // Sunday is the first day of the week.
	            doy: 6 // The week that contains Jan 1st is the first week of the year.
	        },

	        firstDayOfWeek: function firstDayOfWeek() {
	            return this._week.dow;
	        },

	        firstDayOfYear: function firstDayOfYear() {
	            return this._week.doy;
	        },

	        _invalidDate: 'Invalid date',
	        invalidDate: function invalidDate() {
	            return this._invalidDate;
	        }
	    });

	    /************************************
	        Formatting
	    ************************************/

	    function removeFormattingTokens(input) {
	        if (input.match(/\[[\s\S]/)) {
	            return input.replace(/^\[|\]$/g, '');
	        }
	        return input.replace(/\\/g, '');
	    }

	    function makeFormatFunction(format) {
	        var array = format.match(formattingTokens),
	            i,
	            length;

	        for (i = 0, length = array.length; i < length; i++) {
	            if (formatTokenFunctions[array[i]]) {
	                array[i] = formatTokenFunctions[array[i]];
	            } else {
	                array[i] = removeFormattingTokens(array[i]);
	            }
	        }

	        return function (mom) {
	            var output = '';
	            for (i = 0; i < length; i++) {
	                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
	            }
	            return output;
	        };
	    }

	    // format date using native date object
	    function formatMoment(m, format) {
	        if (!m.isValid()) {
	            return m.localeData().invalidDate();
	        }

	        format = expandFormat(format, m.localeData());

	        if (!formatFunctions[format]) {
	            formatFunctions[format] = makeFormatFunction(format);
	        }

	        return formatFunctions[format](m);
	    }

	    function expandFormat(format, locale) {
	        var i = 5;

	        function replaceLongDateFormatTokens(input) {
	            return locale.longDateFormat(input) || input;
	        }

	        localFormattingTokens.lastIndex = 0;
	        while (i >= 0 && localFormattingTokens.test(format)) {
	            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
	            localFormattingTokens.lastIndex = 0;
	            i -= 1;
	        }

	        return format;
	    }

	    /************************************
	        Parsing
	    ************************************/

	    // get the regex to find the next token
	    function getParseRegexForToken(token, config) {
	        var a,
	            strict = config._strict;
	        switch (token) {
	            case 'Q':
	                return parseTokenOneDigit;
	            case 'DDDD':
	                return parseTokenThreeDigits;
	            case 'YYYY':
	            case 'GGGG':
	            case 'gggg':
	                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
	            case 'Y':
	            case 'G':
	            case 'g':
	                return parseTokenSignedNumber;
	            case 'YYYYYY':
	            case 'YYYYY':
	            case 'GGGGG':
	            case 'ggggg':
	                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
	            case 'S':
	                if (strict) {
	                    return parseTokenOneDigit;
	                }
	            /* falls through */
	            case 'SS':
	                if (strict) {
	                    return parseTokenTwoDigits;
	                }
	            /* falls through */
	            case 'SSS':
	                if (strict) {
	                    return parseTokenThreeDigits;
	                }
	            /* falls through */
	            case 'DDD':
	                return parseTokenOneToThreeDigits;
	            case 'MMM':
	            case 'MMMM':
	            case 'dd':
	            case 'ddd':
	            case 'dddd':
	                return parseTokenWord;
	            case 'a':
	            case 'A':
	                return config._locale._meridiemParse;
	            case 'x':
	                return parseTokenOffsetMs;
	            case 'X':
	                return parseTokenTimestampMs;
	            case 'Z':
	            case 'ZZ':
	                return parseTokenTimezone;
	            case 'T':
	                return parseTokenT;
	            case 'SSSS':
	                return parseTokenDigits;
	            case 'MM':
	            case 'DD':
	            case 'YY':
	            case 'GG':
	            case 'gg':
	            case 'HH':
	            case 'hh':
	            case 'mm':
	            case 'ss':
	            case 'ww':
	            case 'WW':
	                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
	            case 'M':
	            case 'D':
	            case 'd':
	            case 'H':
	            case 'h':
	            case 'm':
	            case 's':
	            case 'w':
	            case 'W':
	            case 'e':
	            case 'E':
	                return parseTokenOneOrTwoDigits;
	            case 'Do':
	                return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
	            default:
	                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
	                return a;
	        }
	    }

	    function utcOffsetFromString(string) {
	        string = string || '';
	        var possibleTzMatches = string.match(parseTokenTimezone) || [],
	            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
	            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
	            minutes = +(parts[1] * 60) + toInt(parts[2]);

	        return parts[0] === '+' ? minutes : -minutes;
	    }

	    // function to convert string input to date
	    function addTimeToArrayFromToken(token, input, config) {
	        var a,
	            datePartArray = config._a;

	        switch (token) {
	            // QUARTER
	            case 'Q':
	                if (input != null) {
	                    datePartArray[MONTH] = (toInt(input) - 1) * 3;
	                }
	                break;
	            // MONTH
	            case 'M': // fall through to MM
	            case 'MM':
	                if (input != null) {
	                    datePartArray[MONTH] = toInt(input) - 1;
	                }
	                break;
	            case 'MMM': // fall through to MMMM
	            case 'MMMM':
	                a = config._locale.monthsParse(input, token, config._strict);
	                // if we didn't find a month name, mark the date as invalid.
	                if (a != null) {
	                    datePartArray[MONTH] = a;
	                } else {
	                    config._pf.invalidMonth = input;
	                }
	                break;
	            // DAY OF MONTH
	            case 'D': // fall through to DD
	            case 'DD':
	                if (input != null) {
	                    datePartArray[DATE] = toInt(input);
	                }
	                break;
	            case 'Do':
	                if (input != null) {
	                    datePartArray[DATE] = toInt(parseInt(input.match(/\d{1,2}/)[0], 10));
	                }
	                break;
	            // DAY OF YEAR
	            case 'DDD': // fall through to DDDD
	            case 'DDDD':
	                if (input != null) {
	                    config._dayOfYear = toInt(input);
	                }

	                break;
	            // YEAR
	            case 'YY':
	                datePartArray[YEAR] = moment.parseTwoDigitYear(input);
	                break;
	            case 'YYYY':
	            case 'YYYYY':
	            case 'YYYYYY':
	                datePartArray[YEAR] = toInt(input);
	                break;
	            // AM / PM
	            case 'a': // fall through to A
	            case 'A':
	                config._meridiem = input;
	                // config._isPm = config._locale.isPM(input);
	                break;
	            // HOUR
	            case 'h': // fall through to hh
	            case 'hh':
	                config._pf.bigHour = true;
	            /* falls through */
	            case 'H': // fall through to HH
	            case 'HH':
	                datePartArray[HOUR] = toInt(input);
	                break;
	            // MINUTE
	            case 'm': // fall through to mm
	            case 'mm':
	                datePartArray[MINUTE] = toInt(input);
	                break;
	            // SECOND
	            case 's': // fall through to ss
	            case 'ss':
	                datePartArray[SECOND] = toInt(input);
	                break;
	            // MILLISECOND
	            case 'S':
	            case 'SS':
	            case 'SSS':
	            case 'SSSS':
	                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
	                break;
	            // UNIX OFFSET (MILLISECONDS)
	            case 'x':
	                config._d = new Date(toInt(input));
	                break;
	            // UNIX TIMESTAMP WITH MS
	            case 'X':
	                config._d = new Date(parseFloat(input) * 1000);
	                break;
	            // TIMEZONE
	            case 'Z': // fall through to ZZ
	            case 'ZZ':
	                config._useUTC = true;
	                config._tzm = utcOffsetFromString(input);
	                break;
	            // WEEKDAY - human
	            case 'dd':
	            case 'ddd':
	            case 'dddd':
	                a = config._locale.weekdaysParse(input);
	                // if we didn't get a weekday name, mark the date as invalid
	                if (a != null) {
	                    config._w = config._w || {};
	                    config._w['d'] = a;
	                } else {
	                    config._pf.invalidWeekday = input;
	                }
	                break;
	            // WEEK, WEEK DAY - numeric
	            case 'w':
	            case 'ww':
	            case 'W':
	            case 'WW':
	            case 'd':
	            case 'e':
	            case 'E':
	                token = token.substr(0, 1);
	            /* falls through */
	            case 'gggg':
	            case 'GGGG':
	            case 'GGGGG':
	                token = token.substr(0, 2);
	                if (input) {
	                    config._w = config._w || {};
	                    config._w[token] = toInt(input);
	                }
	                break;
	            case 'gg':
	            case 'GG':
	                config._w = config._w || {};
	                config._w[token] = moment.parseTwoDigitYear(input);
	        }
	    }

	    function dayOfYearFromWeekInfo(config) {
	        var w, weekYear, week, weekday, dow, doy, temp;

	        w = config._w;
	        if (w.GG != null || w.W != null || w.E != null) {
	            dow = 1;
	            doy = 4;

	            // TODO: We need to take the current isoWeekYear, but that depends on
	            // how we interpret now (local, utc, fixed offset). So create
	            // a now version of current config (take local/utc/offset flags, and
	            // create now).
	            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
	            week = dfl(w.W, 1);
	            weekday = dfl(w.E, 1);
	        } else {
	            dow = config._locale._week.dow;
	            doy = config._locale._week.doy;

	            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
	            week = dfl(w.w, 1);

	            if (w.d != null) {
	                // weekday -- low day numbers are considered next week
	                weekday = w.d;
	                if (weekday < dow) {
	                    ++week;
	                }
	            } else if (w.e != null) {
	                // local weekday -- counting starts from begining of week
	                weekday = w.e + dow;
	            } else {
	                // default to begining of week
	                weekday = dow;
	            }
	        }
	        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

	        config._a[YEAR] = temp.year;
	        config._dayOfYear = temp.dayOfYear;
	    }

	    // convert an array to a date.
	    // the array should mirror the parameters below
	    // note: all values past the year are optional and will default to the lowest possible value.
	    // [year, month, day , hour, minute, second, millisecond]
	    function dateFromConfig(config) {
	        var i,
	            date,
	            input = [],
	            currentDate,
	            yearToUse;

	        if (config._d) {
	            return;
	        }

	        currentDate = currentDateArray(config);

	        //compute day of the year from weeks and weekdays
	        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
	            dayOfYearFromWeekInfo(config);
	        }

	        //if the day of the year is set, figure out what it is
	        if (config._dayOfYear) {
	            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

	            if (config._dayOfYear > daysInYear(yearToUse)) {
	                config._pf._overflowDayOfYear = true;
	            }

	            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
	            config._a[MONTH] = date.getUTCMonth();
	            config._a[DATE] = date.getUTCDate();
	        }

	        // Default to current date.
	        // * if no year, month, day of month are given, default to today
	        // * if day of month is given, default month and year
	        // * if month is given, default only year
	        // * if year is given, don't default anything
	        for (i = 0; i < 3 && config._a[i] == null; ++i) {
	            config._a[i] = input[i] = currentDate[i];
	        }

	        // Zero out whatever was not defaulted, including time
	        for (; i < 7; i++) {
	            config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
	        }

	        // Check for 24:00:00.000
	        if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
	            config._nextDay = true;
	            config._a[HOUR] = 0;
	        }

	        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
	        // Apply timezone offset from input. The actual utcOffset can be changed
	        // with parseZone.
	        if (config._tzm != null) {
	            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
	        }

	        if (config._nextDay) {
	            config._a[HOUR] = 24;
	        }
	    }

	    function dateFromObject(config) {
	        var normalizedInput;

	        if (config._d) {
	            return;
	        }

	        normalizedInput = normalizeObjectUnits(config._i);
	        config._a = [normalizedInput.year, normalizedInput.month, normalizedInput.day || normalizedInput.date, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond];

	        dateFromConfig(config);
	    }

	    function currentDateArray(config) {
	        var now = new Date();
	        if (config._useUTC) {
	            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
	        } else {
	            return [now.getFullYear(), now.getMonth(), now.getDate()];
	        }
	    }

	    // date from string and format string
	    function makeDateFromStringAndFormat(config) {
	        if (config._f === moment.ISO_8601) {
	            parseISO(config);
	            return;
	        }

	        config._a = [];
	        config._pf.empty = true;

	        // This array is used to make a Date, either with `new Date` or `Date.UTC`
	        var string = '' + config._i,
	            i,
	            parsedInput,
	            tokens,
	            token,
	            skipped,
	            stringLength = string.length,
	            totalParsedInputLength = 0;

	        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

	        for (i = 0; i < tokens.length; i++) {
	            token = tokens[i];
	            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
	            if (parsedInput) {
	                skipped = string.substr(0, string.indexOf(parsedInput));
	                if (skipped.length > 0) {
	                    config._pf.unusedInput.push(skipped);
	                }
	                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
	                totalParsedInputLength += parsedInput.length;
	            }
	            // don't parse if it's not a known token
	            if (formatTokenFunctions[token]) {
	                if (parsedInput) {
	                    config._pf.empty = false;
	                } else {
	                    config._pf.unusedTokens.push(token);
	                }
	                addTimeToArrayFromToken(token, parsedInput, config);
	            } else if (config._strict && !parsedInput) {
	                config._pf.unusedTokens.push(token);
	            }
	        }

	        // add remaining unparsed input length to the string
	        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
	        if (string.length > 0) {
	            config._pf.unusedInput.push(string);
	        }

	        // clear _12h flag if hour is <= 12
	        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
	            config._pf.bigHour = undefined;
	        }
	        // handle meridiem
	        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
	        dateFromConfig(config);
	        checkOverflow(config);
	    }

	    function unescapeFormat(s) {
	        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
	            return p1 || p2 || p3 || p4;
	        });
	    }

	    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	    function regexpEscape(s) {
	        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    }

	    // date from string and array of format strings
	    function makeDateFromStringAndArray(config) {
	        var tempConfig, bestMoment, scoreToBeat, i, currentScore;

	        if (config._f.length === 0) {
	            config._pf.invalidFormat = true;
	            config._d = new Date(NaN);
	            return;
	        }

	        for (i = 0; i < config._f.length; i++) {
	            currentScore = 0;
	            tempConfig = copyConfig({}, config);
	            if (config._useUTC != null) {
	                tempConfig._useUTC = config._useUTC;
	            }
	            tempConfig._pf = defaultParsingFlags();
	            tempConfig._f = config._f[i];
	            makeDateFromStringAndFormat(tempConfig);

	            if (!_isValid(tempConfig)) {
	                continue;
	            }

	            // if there is any input that was not parsed add a penalty for that format
	            currentScore += tempConfig._pf.charsLeftOver;

	            //or tokens
	            currentScore += tempConfig._pf.unusedTokens.length * 10;

	            tempConfig._pf.score = currentScore;

	            if (scoreToBeat == null || currentScore < scoreToBeat) {
	                scoreToBeat = currentScore;
	                bestMoment = tempConfig;
	            }
	        }

	        extend(config, bestMoment || tempConfig);
	    }

	    // date from iso format
	    function parseISO(config) {
	        var i,
	            l,
	            string = config._i,
	            match = isoRegex.exec(string);

	        if (match) {
	            config._pf.iso = true;
	            for (i = 0, l = isoDates.length; i < l; i++) {
	                if (isoDates[i][1].exec(string)) {
	                    // match[5] should be 'T' or undefined
	                    config._f = isoDates[i][0] + (match[6] || ' ');
	                    break;
	                }
	            }
	            for (i = 0, l = isoTimes.length; i < l; i++) {
	                if (isoTimes[i][1].exec(string)) {
	                    config._f += isoTimes[i][0];
	                    break;
	                }
	            }
	            if (string.match(parseTokenTimezone)) {
	                config._f += 'Z';
	            }
	            makeDateFromStringAndFormat(config);
	        } else {
	            config._isValid = false;
	        }
	    }

	    // date from iso format or fallback
	    function makeDateFromString(config) {
	        parseISO(config);
	        if (config._isValid === false) {
	            delete config._isValid;
	            moment.createFromInputFallback(config);
	        }
	    }

	    function map(arr, fn) {
	        var res = [],
	            i;
	        for (i = 0; i < arr.length; ++i) {
	            res.push(fn(arr[i], i));
	        }
	        return res;
	    }

	    function makeDateFromInput(config) {
	        var input = config._i,
	            matched;
	        if (input === undefined) {
	            config._d = new Date();
	        } else if (isDate(input)) {
	            config._d = new Date(+input);
	        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
	            config._d = new Date(+matched[1]);
	        } else if (typeof input === 'string') {
	            makeDateFromString(config);
	        } else if (isArray(input)) {
	            config._a = map(input.slice(0), function (obj) {
	                return parseInt(obj, 10);
	            });
	            dateFromConfig(config);
	        } else if (typeof input === 'object') {
	            dateFromObject(config);
	        } else if (typeof input === 'number') {
	            // from milliseconds
	            config._d = new Date(input);
	        } else {
	            moment.createFromInputFallback(config);
	        }
	    }

	    function makeDate(y, m, d, h, M, s, ms) {
	        //can't just apply() to create a date:
	        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
	        var date = new Date(y, m, d, h, M, s, ms);

	        //the date constructor doesn't accept years < 1970
	        if (y < 1970) {
	            date.setFullYear(y);
	        }
	        return date;
	    }

	    function makeUTCDate(y) {
	        var date = new Date(Date.UTC.apply(null, arguments));
	        if (y < 1970) {
	            date.setUTCFullYear(y);
	        }
	        return date;
	    }

	    function parseWeekday(input, locale) {
	        if (typeof input === 'string') {
	            if (!isNaN(input)) {
	                input = parseInt(input, 10);
	            } else {
	                input = locale.weekdaysParse(input);
	                if (typeof input !== 'number') {
	                    return null;
	                }
	            }
	        }
	        return input;
	    }

	    /************************************
	        Relative Time
	    ************************************/

	    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
	        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	    }

	    function relativeTime(posNegDuration, withoutSuffix, locale) {
	        var duration = moment.duration(posNegDuration).abs(),
	            seconds = round(duration.as('s')),
	            minutes = round(duration.as('m')),
	            hours = round(duration.as('h')),
	            days = round(duration.as('d')),
	            months = round(duration.as('M')),
	            years = round(duration.as('y')),
	            args = seconds < relativeTimeThresholds.s && ['s', seconds] || minutes === 1 && ['m'] || minutes < relativeTimeThresholds.m && ['mm', minutes] || hours === 1 && ['h'] || hours < relativeTimeThresholds.h && ['hh', hours] || days === 1 && ['d'] || days < relativeTimeThresholds.d && ['dd', days] || months === 1 && ['M'] || months < relativeTimeThresholds.M && ['MM', months] || years === 1 && ['y'] || ['yy', years];

	        args[2] = withoutSuffix;
	        args[3] = +posNegDuration > 0;
	        args[4] = locale;
	        return substituteTimeAgo.apply({}, args);
	    }

	    /************************************
	        Week of Year
	    ************************************/

	    // firstDayOfWeek       0 = sun, 6 = sat
	    //                      the day of the week that starts the week
	    //                      (usually sunday or monday)
	    // firstDayOfWeekOfYear 0 = sun, 6 = sat
	    //                      the first week is the week that contains the first
	    //                      of this day of the week
	    //                      (eg. ISO weeks use thursday (4))
	    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
	        var end = firstDayOfWeekOfYear - firstDayOfWeek,
	            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
	            adjustedMoment;

	        if (daysToDayOfWeek > end) {
	            daysToDayOfWeek -= 7;
	        }

	        if (daysToDayOfWeek < end - 7) {
	            daysToDayOfWeek += 7;
	        }

	        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
	        return {
	            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
	            year: adjustedMoment.year()
	        };
	    }

	    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
	        var d = makeUTCDate(year, 0, 1).getUTCDay(),
	            daysToAdd,
	            dayOfYear;

	        d = d === 0 ? 7 : d;
	        weekday = weekday != null ? weekday : firstDayOfWeek;
	        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
	        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

	        return {
	            year: dayOfYear > 0 ? year : year - 1,
	            dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
	        };
	    }

	    /************************************
	        Top Level Functions
	    ************************************/

	    function makeMoment(config) {
	        var input = config._i,
	            format = config._f,
	            res;

	        config._locale = config._locale || moment.localeData(config._l);

	        if (input === null || format === undefined && input === '') {
	            return moment.invalid({ nullInput: true });
	        }

	        if (typeof input === 'string') {
	            config._i = input = config._locale.preparse(input);
	        }

	        if (moment.isMoment(input)) {
	            return new Moment(input, true);
	        } else if (format) {
	            if (isArray(format)) {
	                makeDateFromStringAndArray(config);
	            } else {
	                makeDateFromStringAndFormat(config);
	            }
	        } else {
	            makeDateFromInput(config);
	        }

	        res = new Moment(config);
	        if (res._nextDay) {
	            // Adding is smart enough around DST
	            res.add(1, 'd');
	            res._nextDay = undefined;
	        }

	        return res;
	    }

	    moment = function (input, format, locale, strict) {
	        var c;

	        if (typeof locale === 'boolean') {
	            strict = locale;
	            locale = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c = {};
	        c._isAMomentObject = true;
	        c._i = input;
	        c._f = format;
	        c._l = locale;
	        c._strict = strict;
	        c._isUTC = false;
	        c._pf = defaultParsingFlags();

	        return makeMoment(c);
	    };

	    moment.suppressDeprecationWarnings = false;

	    moment.createFromInputFallback = deprecate('moment construction falls back to js Date. This is ' + 'discouraged and will be removed in upcoming major ' + 'release. Please refer to ' + 'https://github.com/moment/moment/issues/1407 for more info.', function (config) {
	        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
	    });

	    // Pick a moment m from moments so that m[fn](other) is true for all
	    // other. This relies on the function fn to be transitive.
	    //
	    // moments should either be an array of moment objects or an array, whose
	    // first element is an array of moment objects.
	    function pickBy(fn, moments) {
	        var res, i;
	        if (moments.length === 1 && isArray(moments[0])) {
	            moments = moments[0];
	        }
	        if (!moments.length) {
	            return moment();
	        }
	        res = moments[0];
	        for (i = 1; i < moments.length; ++i) {
	            if (moments[i][fn](res)) {
	                res = moments[i];
	            }
	        }
	        return res;
	    }

	    moment.min = function () {
	        var args = [].slice.call(arguments, 0);

	        return pickBy('isBefore', args);
	    };

	    moment.max = function () {
	        var args = [].slice.call(arguments, 0);

	        return pickBy('isAfter', args);
	    };

	    // creating with utc
	    moment.utc = function (input, format, locale, strict) {
	        var c;

	        if (typeof locale === 'boolean') {
	            strict = locale;
	            locale = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c = {};
	        c._isAMomentObject = true;
	        c._useUTC = true;
	        c._isUTC = true;
	        c._l = locale;
	        c._i = input;
	        c._f = format;
	        c._strict = strict;
	        c._pf = defaultParsingFlags();

	        return makeMoment(c).utc();
	    };

	    // creating with unix timestamp (in seconds)
	    moment.unix = function (input) {
	        return moment(input * 1000);
	    };

	    // duration
	    moment.duration = function (input, key) {
	        var duration = input,

	        // matching against regexp is expensive, do it on demand
	        match = null,
	            sign,
	            ret,
	            parseIso,
	            diffRes;

	        if (moment.isDuration(input)) {
	            duration = {
	                ms: input._milliseconds,
	                d: input._days,
	                M: input._months
	            };
	        } else if (typeof input === 'number') {
	            duration = {};
	            if (key) {
	                duration[key] = input;
	            } else {
	                duration.milliseconds = input;
	            }
	        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
	            sign = match[1] === '-' ? -1 : 1;
	            duration = {
	                y: 0,
	                d: toInt(match[DATE]) * sign,
	                h: toInt(match[HOUR]) * sign,
	                m: toInt(match[MINUTE]) * sign,
	                s: toInt(match[SECOND]) * sign,
	                ms: toInt(match[MILLISECOND]) * sign
	            };
	        } else if (!!(match = isoDurationRegex.exec(input))) {
	            sign = match[1] === '-' ? -1 : 1;
	            parseIso = function (inp) {
	                // We'd normally use ~~inp for this, but unfortunately it also
	                // converts floats to ints.
	                // inp may be undefined, so careful calling replace on it.
	                var res = inp && parseFloat(inp.replace(',', '.'));
	                // apply sign while we're at it
	                return (isNaN(res) ? 0 : res) * sign;
	            };
	            duration = {
	                y: parseIso(match[2]),
	                M: parseIso(match[3]),
	                d: parseIso(match[4]),
	                h: parseIso(match[5]),
	                m: parseIso(match[6]),
	                s: parseIso(match[7]),
	                w: parseIso(match[8])
	            };
	        } else if (duration == null) {
	            // checks for null or undefined
	            duration = {};
	        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
	            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

	            duration = {};
	            duration.ms = diffRes.milliseconds;
	            duration.M = diffRes.months;
	        }

	        ret = new Duration(duration);

	        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
	            ret._locale = input._locale;
	        }

	        return ret;
	    };

	    // version number
	    moment.version = VERSION;

	    // default format
	    moment.defaultFormat = isoFormat;

	    // constant that refers to the ISO standard
	    moment.ISO_8601 = function () {};

	    // Plugins that add properties should also add the key here (null value),
	    // so we can properly clone ourselves.
	    moment.momentProperties = momentProperties;

	    // This function will be called whenever a moment is mutated.
	    // It is intended to keep the offset in sync with the timezone.
	    moment.updateOffset = function () {};

	    // This function allows you to set a threshold for relative time strings
	    moment.relativeTimeThreshold = function (threshold, limit) {
	        if (relativeTimeThresholds[threshold] === undefined) {
	            return false;
	        }
	        if (limit === undefined) {
	            return relativeTimeThresholds[threshold];
	        }
	        relativeTimeThresholds[threshold] = limit;
	        return true;
	    };

	    moment.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', function (key, value) {
	        return moment.locale(key, value);
	    });

	    // This function will load locale and then set the global locale.  If
	    // no arguments are passed in, it will simply return the current global
	    // locale key.
	    moment.locale = function (key, values) {
	        var data;
	        if (key) {
	            if (typeof values !== 'undefined') {
	                data = moment.defineLocale(key, values);
	            } else {
	                data = moment.localeData(key);
	            }

	            if (data) {
	                moment.duration._locale = moment._locale = data;
	            }
	        }

	        return moment._locale._abbr;
	    };

	    moment.defineLocale = function (name, values) {
	        if (values !== null) {
	            values.abbr = name;
	            if (!locales[name]) {
	                locales[name] = new Locale();
	            }
	            locales[name].set(values);

	            // backwards compat for now: also set the locale
	            moment.locale(name);

	            return locales[name];
	        } else {
	            // useful for testing
	            delete locales[name];
	            return null;
	        }
	    };

	    moment.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', function (key) {
	        return moment.localeData(key);
	    });

	    // returns locale data
	    moment.localeData = function (key) {
	        var locale;

	        if (key && key._locale && key._locale._abbr) {
	            key = key._locale._abbr;
	        }

	        if (!key) {
	            return moment._locale;
	        }

	        if (!isArray(key)) {
	            //short-circuit everything else
	            locale = loadLocale(key);
	            if (locale) {
	                return locale;
	            }
	            key = [key];
	        }

	        return chooseLocale(key);
	    };

	    // compare moment object
	    moment.isMoment = function (obj) {
	        return obj instanceof Moment || obj != null && hasOwnProp(obj, '_isAMomentObject');
	    };

	    // for typechecking Duration objects
	    moment.isDuration = function (obj) {
	        return obj instanceof Duration;
	    };

	    for (i = lists.length - 1; i >= 0; --i) {
	        makeList(lists[i]);
	    }

	    moment.normalizeUnits = function (units) {
	        return normalizeUnits(units);
	    };

	    moment.invalid = function (flags) {
	        var m = moment.utc(NaN);
	        if (flags != null) {
	            extend(m._pf, flags);
	        } else {
	            m._pf.userInvalidated = true;
	        }

	        return m;
	    };

	    moment.parseZone = function () {
	        return moment.apply(null, arguments).parseZone();
	    };

	    moment.parseTwoDigitYear = function (input) {
	        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	    };

	    moment.isDate = isDate;

	    /************************************
	        Moment Prototype
	    ************************************/

	    extend(moment.fn = Moment.prototype, {

	        clone: function clone() {
	            return moment(this);
	        },

	        valueOf: function valueOf() {
	            return +this._d - (this._offset || 0) * 60000;
	        },

	        unix: function unix() {
	            return Math.floor(+this / 1000);
	        },

	        toString: function toString() {
	            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
	        },

	        toDate: function toDate() {
	            return this._offset ? new Date(+this) : this._d;
	        },

	        toISOString: function toISOString() {
	            var m = moment(this).utc();
	            if (0 < m.year() && m.year() <= 9999) {
	                if ('function' === typeof Date.prototype.toISOString) {
	                    // native implementation is ~50x faster, use it when we can
	                    return this.toDate().toISOString();
	                } else {
	                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	                }
	            } else {
	                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	            }
	        },

	        toArray: function toArray() {
	            var m = this;
	            return [m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds()];
	        },

	        isValid: function isValid() {
	            return _isValid(this);
	        },

	        isDSTShifted: function isDSTShifted() {
	            if (this._a) {
	                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
	            }

	            return false;
	        },

	        parsingFlags: function parsingFlags() {
	            return extend({}, this._pf);
	        },

	        invalidAt: function invalidAt() {
	            return this._pf.overflow;
	        },

	        utc: function utc(keepLocalTime) {
	            return this.utcOffset(0, keepLocalTime);
	        },

	        local: function local(keepLocalTime) {
	            if (this._isUTC) {
	                this.utcOffset(0, keepLocalTime);
	                this._isUTC = false;

	                if (keepLocalTime) {
	                    this.subtract(this._dateUtcOffset(), 'm');
	                }
	            }
	            return this;
	        },

	        format: function format(inputString) {
	            var output = formatMoment(this, inputString || moment.defaultFormat);
	            return this.localeData().postformat(output);
	        },

	        add: createAdder(1, 'add'),

	        subtract: createAdder(-1, 'subtract'),

	        diff: function diff(input, units, asFloat) {
	            var that = makeAs(input, this),
	                zoneDiff = (that.utcOffset() - this.utcOffset()) * 60000,
	                anchor,
	                diff,
	                output,
	                daysAdjust;

	            units = normalizeUnits(units);

	            if (units === 'year' || units === 'month' || units === 'quarter') {
	                output = monthDiff(this, that);
	                if (units === 'quarter') {
	                    output = output / 3;
	                } else if (units === 'year') {
	                    output = output / 12;
	                }
	            } else {
	                diff = this - that;
	                output = units === 'second' ? diff / 1000 : // 1000
	                units === 'minute' ? diff / 60000 : // 1000 * 60
	                units === 'hour' ? diff / 3600000 : // 1000 * 60 * 60
	                units === 'day' ? (diff - zoneDiff) / 86400000 : // 1000 * 60 * 60 * 24, negate dst
	                units === 'week' ? (diff - zoneDiff) / 604800000 : // 1000 * 60 * 60 * 24 * 7, negate dst
	                diff;
	            }
	            return asFloat ? output : absRound(output);
	        },

	        from: function from(time, withoutSuffix) {
	            return moment.duration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
	        },

	        fromNow: function fromNow(withoutSuffix) {
	            return this.from(moment(), withoutSuffix);
	        },

	        calendar: function calendar(time) {
	            // We want to compare the start of today, vs this.
	            // Getting start-of-today depends on whether we're locat/utc/offset
	            // or not.
	            var now = time || moment(),
	                sod = makeAs(now, this).startOf('day'),
	                diff = this.diff(sod, 'days', true),
	                format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
	            return this.format(this.localeData().calendar(format, this, moment(now)));
	        },

	        isLeapYear: function isLeapYear() {
	            return _isLeapYear(this.year());
	        },

	        isDST: function isDST() {
	            return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
	        },

	        day: function day(input) {
	            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	            if (input != null) {
	                input = parseWeekday(input, this.localeData());
	                return this.add(input - day, 'd');
	            } else {
	                return day;
	            }
	        },

	        month: makeAccessor('Month', true),

	        startOf: function startOf(units) {
	            units = normalizeUnits(units);
	            // the following switch intentionally omits break keywords
	            // to utilize falling through the cases.
	            switch (units) {
	                case 'year':
	                    this.month(0);
	                /* falls through */
	                case 'quarter':
	                case 'month':
	                    this.date(1);
	                /* falls through */
	                case 'week':
	                case 'isoWeek':
	                case 'day':
	                    this.hours(0);
	                /* falls through */
	                case 'hour':
	                    this.minutes(0);
	                /* falls through */
	                case 'minute':
	                    this.seconds(0);
	                /* falls through */
	                case 'second':
	                    this.milliseconds(0);
	                    /* falls through */
	            }

	            // weeks are a special case
	            if (units === 'week') {
	                this.weekday(0);
	            } else if (units === 'isoWeek') {
	                this.isoWeekday(1);
	            }

	            // quarters are also special
	            if (units === 'quarter') {
	                this.month(Math.floor(this.month() / 3) * 3);
	            }

	            return this;
	        },

	        endOf: function endOf(units) {
	            units = normalizeUnits(units);
	            if (units === undefined || units === 'millisecond') {
	                return this;
	            }
	            return this.startOf(units).add(1, units === 'isoWeek' ? 'week' : units).subtract(1, 'ms');
	        },

	        isAfter: function isAfter(input, units) {
	            var inputMs;
	            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	            if (units === 'millisecond') {
	                input = moment.isMoment(input) ? input : moment(input);
	                return +this > +input;
	            } else {
	                inputMs = moment.isMoment(input) ? +input : +moment(input);
	                return inputMs < +this.clone().startOf(units);
	            }
	        },

	        isBefore: function isBefore(input, units) {
	            var inputMs;
	            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	            if (units === 'millisecond') {
	                input = moment.isMoment(input) ? input : moment(input);
	                return +this < +input;
	            } else {
	                inputMs = moment.isMoment(input) ? +input : +moment(input);
	                return +this.clone().endOf(units) < inputMs;
	            }
	        },

	        isBetween: function isBetween(from, to, units) {
	            return this.isAfter(from, units) && this.isBefore(to, units);
	        },

	        isSame: function isSame(input, units) {
	            var inputMs;
	            units = normalizeUnits(units || 'millisecond');
	            if (units === 'millisecond') {
	                input = moment.isMoment(input) ? input : moment(input);
	                return +this === +input;
	            } else {
	                inputMs = +moment(input);
	                return +this.clone().startOf(units) <= inputMs && inputMs <= +this.clone().endOf(units);
	            }
	        },

	        min: deprecate('moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548', function (other) {
	            other = moment.apply(null, arguments);
	            return other < this ? this : other;
	        }),

	        max: deprecate('moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548', function (other) {
	            other = moment.apply(null, arguments);
	            return other > this ? this : other;
	        }),

	        zone: deprecate('moment().zone is deprecated, use moment().utcOffset instead. ' + 'https://github.com/moment/moment/issues/1779', function (input, keepLocalTime) {
	            if (input != null) {
	                if (typeof input !== 'string') {
	                    input = -input;
	                }

	                this.utcOffset(input, keepLocalTime);

	                return this;
	            } else {
	                return -this.utcOffset();
	            }
	        }),

	        // keepLocalTime = true means only change the timezone, without
	        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
	        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
	        // +0200, so we adjust the time as needed, to be valid.
	        //
	        // Keeping the time actually adds/subtracts (one hour)
	        // from the actual represented time. That is why we call updateOffset
	        // a second time. In case it wants us to change the offset again
	        // _changeInProgress == true case, then we have to adjust, because
	        // there is no such time in the given timezone.
	        utcOffset: function utcOffset(input, keepLocalTime) {
	            var offset = this._offset || 0,
	                localAdjust;
	            if (input != null) {
	                if (typeof input === 'string') {
	                    input = utcOffsetFromString(input);
	                }
	                if (Math.abs(input) < 16) {
	                    input = input * 60;
	                }
	                if (!this._isUTC && keepLocalTime) {
	                    localAdjust = this._dateUtcOffset();
	                }
	                this._offset = input;
	                this._isUTC = true;
	                if (localAdjust != null) {
	                    this.add(localAdjust, 'm');
	                }
	                if (offset !== input) {
	                    if (!keepLocalTime || this._changeInProgress) {
	                        addOrSubtractDurationFromMoment(this, moment.duration(input - offset, 'm'), 1, false);
	                    } else if (!this._changeInProgress) {
	                        this._changeInProgress = true;
	                        moment.updateOffset(this, true);
	                        this._changeInProgress = null;
	                    }
	                }

	                return this;
	            } else {
	                return this._isUTC ? offset : this._dateUtcOffset();
	            }
	        },

	        isLocal: function isLocal() {
	            return !this._isUTC;
	        },

	        isUtcOffset: function isUtcOffset() {
	            return this._isUTC;
	        },

	        isUtc: function isUtc() {
	            return this._isUTC && this._offset === 0;
	        },

	        zoneAbbr: function zoneAbbr() {
	            return this._isUTC ? 'UTC' : '';
	        },

	        zoneName: function zoneName() {
	            return this._isUTC ? 'Coordinated Universal Time' : '';
	        },

	        parseZone: function parseZone() {
	            if (this._tzm) {
	                this.utcOffset(this._tzm);
	            } else if (typeof this._i === 'string') {
	                this.utcOffset(utcOffsetFromString(this._i));
	            }
	            return this;
	        },

	        hasAlignedHourOffset: function hasAlignedHourOffset(input) {
	            if (!input) {
	                input = 0;
	            } else {
	                input = moment(input).utcOffset();
	            }

	            return (this.utcOffset() - input) % 60 === 0;
	        },

	        daysInMonth: function daysInMonth() {
	            return _daysInMonth(this.year(), this.month());
	        },

	        dayOfYear: function dayOfYear(input) {
	            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 86400000) + 1;
	            return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
	        },

	        quarter: function quarter(input) {
	            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
	        },

	        weekYear: function weekYear(input) {
	            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
	            return input == null ? year : this.add(input - year, 'y');
	        },

	        isoWeekYear: function isoWeekYear(input) {
	            var year = weekOfYear(this, 1, 4).year;
	            return input == null ? year : this.add(input - year, 'y');
	        },

	        week: function week(input) {
	            var week = this.localeData().week(this);
	            return input == null ? week : this.add((input - week) * 7, 'd');
	        },

	        isoWeek: function isoWeek(input) {
	            var week = weekOfYear(this, 1, 4).week;
	            return input == null ? week : this.add((input - week) * 7, 'd');
	        },

	        weekday: function weekday(input) {
	            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
	            return input == null ? weekday : this.add(input - weekday, 'd');
	        },

	        isoWeekday: function isoWeekday(input) {
	            // behaves the same as moment#day except
	            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
	            // as a setter, sunday should belong to the previous week.
	            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
	        },

	        isoWeeksInYear: function isoWeeksInYear() {
	            return _weeksInYear(this.year(), 1, 4);
	        },

	        weeksInYear: function weeksInYear() {
	            var weekInfo = this.localeData()._week;
	            return _weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
	        },

	        get: function get(units) {
	            units = normalizeUnits(units);
	            return this[units]();
	        },

	        set: function set(units, value) {
	            var unit;
	            if (typeof units === 'object') {
	                for (unit in units) {
	                    this.set(unit, units[unit]);
	                }
	            } else {
	                units = normalizeUnits(units);
	                if (typeof this[units] === 'function') {
	                    this[units](value);
	                }
	            }
	            return this;
	        },

	        // If passed a locale key, it will set the locale for this
	        // instance.  Otherwise, it will return the locale configuration
	        // variables for this instance.
	        locale: function locale(key) {
	            var newLocaleData;

	            if (key === undefined) {
	                return this._locale._abbr;
	            } else {
	                newLocaleData = moment.localeData(key);
	                if (newLocaleData != null) {
	                    this._locale = newLocaleData;
	                }
	                return this;
	            }
	        },

	        lang: deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function (key) {
	            if (key === undefined) {
	                return this.localeData();
	            } else {
	                return this.locale(key);
	            }
	        }),

	        localeData: function localeData() {
	            return this._locale;
	        },

	        _dateUtcOffset: function _dateUtcOffset() {
	            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
	            // https://github.com/moment/moment/pull/1871
	            return -Math.round(this._d.getTimezoneOffset() / 15) * 15;
	        }

	    });

	    function rawMonthSetter(mom, value) {
	        var dayOfMonth;

	        // TODO: Move this out of here!
	        if (typeof value === 'string') {
	            value = mom.localeData().monthsParse(value);
	            // TODO: Another silent failure?
	            if (typeof value !== 'number') {
	                return mom;
	            }
	        }

	        dayOfMonth = Math.min(mom.date(), _daysInMonth(mom.year(), value));
	        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
	        return mom;
	    }

	    function rawGetter(mom, unit) {
	        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
	    }

	    function rawSetter(mom, unit, value) {
	        if (unit === 'Month') {
	            return rawMonthSetter(mom, value);
	        } else {
	            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
	        }
	    }

	    function makeAccessor(unit, keepTime) {
	        return function (value) {
	            if (value != null) {
	                rawSetter(this, unit, value);
	                moment.updateOffset(this, keepTime);
	                return this;
	            } else {
	                return rawGetter(this, unit);
	            }
	        };
	    }

	    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
	    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
	    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
	    // Setting the hour should keep the time, because the user explicitly
	    // specified which hour he wants. So trying to maintain the same hour (in
	    // a new timezone) makes sense. Adding/subtracting hours does not follow
	    // this rule.
	    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
	    // moment.fn.month is defined separately
	    moment.fn.date = makeAccessor('Date', true);
	    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
	    moment.fn.year = makeAccessor('FullYear', true);
	    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

	    // add plural methods
	    moment.fn.days = moment.fn.day;
	    moment.fn.months = moment.fn.month;
	    moment.fn.weeks = moment.fn.week;
	    moment.fn.isoWeeks = moment.fn.isoWeek;
	    moment.fn.quarters = moment.fn.quarter;

	    // add aliased format methods
	    moment.fn.toJSON = moment.fn.toISOString;

	    // alias isUtc for dev-friendliness
	    moment.fn.isUTC = moment.fn.isUtc;

	    /************************************
	        Duration Prototype
	    ************************************/

	    function daysToYears(days) {
	        // 400 years have 146097 days (taking into account leap year rules)
	        return days * 400 / 146097;
	    }

	    function yearsToDays(years) {
	        // years * 365 + absRound(years / 4) -
	        //     absRound(years / 100) + absRound(years / 400);
	        return years * 146097 / 400;
	    }

	    extend(moment.duration.fn = Duration.prototype, {

	        _bubble: function _bubble() {
	            var milliseconds = this._milliseconds,
	                days = this._days,
	                months = this._months,
	                data = this._data,
	                seconds,
	                minutes,
	                hours,
	                years = 0;

	            // The following code bubbles up values, see the tests for
	            // examples of what that means.
	            data.milliseconds = milliseconds % 1000;

	            seconds = absRound(milliseconds / 1000);
	            data.seconds = seconds % 60;

	            minutes = absRound(seconds / 60);
	            data.minutes = minutes % 60;

	            hours = absRound(minutes / 60);
	            data.hours = hours % 24;

	            days += absRound(hours / 24);

	            // Accurately convert days to years, assume start from year 0.
	            years = absRound(daysToYears(days));
	            days -= absRound(yearsToDays(years));

	            // 30 days to a month
	            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
	            months += absRound(days / 30);
	            days %= 30;

	            // 12 months -> 1 year
	            years += absRound(months / 12);
	            months %= 12;

	            data.days = days;
	            data.months = months;
	            data.years = years;
	        },

	        abs: function abs() {
	            this._milliseconds = Math.abs(this._milliseconds);
	            this._days = Math.abs(this._days);
	            this._months = Math.abs(this._months);

	            this._data.milliseconds = Math.abs(this._data.milliseconds);
	            this._data.seconds = Math.abs(this._data.seconds);
	            this._data.minutes = Math.abs(this._data.minutes);
	            this._data.hours = Math.abs(this._data.hours);
	            this._data.months = Math.abs(this._data.months);
	            this._data.years = Math.abs(this._data.years);

	            return this;
	        },

	        weeks: function weeks() {
	            return absRound(this.days() / 7);
	        },

	        valueOf: function valueOf() {
	            return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;
	        },

	        humanize: function humanize(withSuffix) {
	            var output = relativeTime(this, !withSuffix, this.localeData());

	            if (withSuffix) {
	                output = this.localeData().pastFuture(+this, output);
	            }

	            return this.localeData().postformat(output);
	        },

	        add: function add(input, val) {
	            // supports only 2.0-style add(1, 's') or add(moment)
	            var dur = moment.duration(input, val);

	            this._milliseconds += dur._milliseconds;
	            this._days += dur._days;
	            this._months += dur._months;

	            this._bubble();

	            return this;
	        },

	        subtract: function subtract(input, val) {
	            var dur = moment.duration(input, val);

	            this._milliseconds -= dur._milliseconds;
	            this._days -= dur._days;
	            this._months -= dur._months;

	            this._bubble();

	            return this;
	        },

	        get: function get(units) {
	            units = normalizeUnits(units);
	            return this[units.toLowerCase() + 's']();
	        },

	        as: function as(units) {
	            var days, months;
	            units = normalizeUnits(units);

	            if (units === 'month' || units === 'year') {
	                days = this._days + this._milliseconds / 86400000;
	                months = this._months + daysToYears(days) * 12;
	                return units === 'month' ? months : months / 12;
	            } else {
	                // handle milliseconds separately because of floating point math errors (issue #1867)
	                days = this._days + Math.round(yearsToDays(this._months / 12));
	                switch (units) {
	                    case 'week':
	                        return days / 7 + this._milliseconds / 604800000;
	                    case 'day':
	                        return days + this._milliseconds / 86400000;
	                    case 'hour':
	                        return days * 24 + this._milliseconds / 3600000;
	                    case 'minute':
	                        return days * 24 * 60 + this._milliseconds / 60000;
	                    case 'second':
	                        return days * 24 * 60 * 60 + this._milliseconds / 1000;
	                    // Math.floor prevents floating point math errors here
	                    case 'millisecond':
	                        return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
	                    default:
	                        throw new Error('Unknown unit ' + units);
	                }
	            }
	        },

	        lang: moment.fn.lang,
	        locale: moment.fn.locale,

	        toIsoString: deprecate('toIsoString() is deprecated. Please use toISOString() instead ' + '(notice the capitals)', function () {
	            return this.toISOString();
	        }),

	        toISOString: function toISOString() {
	            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
	            var years = Math.abs(this.years()),
	                months = Math.abs(this.months()),
	                days = Math.abs(this.days()),
	                hours = Math.abs(this.hours()),
	                minutes = Math.abs(this.minutes()),
	                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

	            if (!this.asSeconds()) {
	                // this is the same as C#'s (Noda) and python (isodate)...
	                // but not other JS (goog.date)
	                return 'P0D';
	            }

	            return (this.asSeconds() < 0 ? '-' : '') + 'P' + (years ? years + 'Y' : '') + (months ? months + 'M' : '') + (days ? days + 'D' : '') + (hours || minutes || seconds ? 'T' : '') + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '') + (seconds ? seconds + 'S' : '');
	        },

	        localeData: function localeData() {
	            return this._locale;
	        },

	        toJSON: function toJSON() {
	            return this.toISOString();
	        }
	    });

	    moment.duration.fn.toString = moment.duration.fn.toISOString;

	    function makeDurationGetter(name) {
	        moment.duration.fn[name] = function () {
	            return this._data[name];
	        };
	    }

	    for (i in unitMillisecondFactors) {
	        if (hasOwnProp(unitMillisecondFactors, i)) {
	            makeDurationGetter(i.toLowerCase());
	        }
	    }

	    moment.duration.fn.asMilliseconds = function () {
	        return this.as('ms');
	    };
	    moment.duration.fn.asSeconds = function () {
	        return this.as('s');
	    };
	    moment.duration.fn.asMinutes = function () {
	        return this.as('m');
	    };
	    moment.duration.fn.asHours = function () {
	        return this.as('h');
	    };
	    moment.duration.fn.asDays = function () {
	        return this.as('d');
	    };
	    moment.duration.fn.asWeeks = function () {
	        return this.as('weeks');
	    };
	    moment.duration.fn.asMonths = function () {
	        return this.as('M');
	    };
	    moment.duration.fn.asYears = function () {
	        return this.as('y');
	    };

	    /************************************
	        Default Locale
	    ************************************/

	    // Set default locale, other locale will inherit from English.
	    moment.locale('en', {
	        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
	        ordinal: function ordinal(number) {
	            var b = number % 10,
	                output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
	            return number + output;
	        }
	    });

	    /* EMBED_LOCALES */

	    /************************************
	        Exposing Moment
	    ************************************/

	    function makeGlobal(shouldDeprecate) {
	        /*global ender:false */
	        if (typeof ender !== 'undefined') {
	            return;
	        }
	        oldGlobalMoment = globalScope.moment;
	        if (shouldDeprecate) {
	            globalScope.moment = deprecate('Accessing Moment through the global scope is ' + 'deprecated, and will be removed in an upcoming ' + 'release.', moment);
	        } else {
	            globalScope.moment = moment;
	        }
	    }

	    // CommonJS module is defined
	    if (hasModule) {
	        module.exports = moment;
	    } else if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	            if (module.config && module.config() && module.config().noGlobal === true) {
	                // release the global variable
	                globalScope.moment = oldGlobalMoment;
	            }

	            return moment;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        makeGlobal(true);
	    } else {
	        makeGlobal();
	    }
	}).call(undefined);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(14)(module)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';(function(global, factory){true?module.exports = factory():typeof define === 'function' && define.amd?define(factory):global.Immutable = factory();})(undefined, function(){'use strict';var SLICE$0=Array.prototype.slice;function createClass(ctor, superClass){if(superClass){ctor.prototype = Object.create(superClass.prototype);}ctor.prototype.constructor = ctor;}var DELETE='delete';var SHIFT=5;var SIZE=1 << SHIFT;var MASK=SIZE - 1;var NOT_SET={};var CHANGE_LENGTH={value:false};var DID_ALTER={value:false};function MakeRef(ref){ref.value = false;return ref;}function SetRef(ref){ref && (ref.value = true);}function OwnerID(){}function arrCopy(arr, offset){offset = offset || 0;var len=Math.max(0, arr.length - offset);var newArr=new Array(len);for(var ii=0; ii < len; ii++) {newArr[ii] = arr[ii + offset];}return newArr;}function ensureSize(iter){if(iter.size === undefined){iter.size = iter.__iterate(returnTrue);}return iter.size;}function wrapIndex(iter, index){return index >= 0?+index:ensureSize(iter) + +index;}function returnTrue(){return true;}function wholeSlice(begin, end, size){return (begin === 0 || size !== undefined && begin <= -size) && (end === undefined || size !== undefined && end >= size);}function resolveBegin(begin, size){return resolveIndex(begin, size, 0);}function resolveEnd(end, size){return resolveIndex(end, size, size);}function resolveIndex(index, size, defaultIndex){return index === undefined?defaultIndex:index < 0?Math.max(0, size + index):size === undefined?index:Math.min(size, index);}function Iterable(value){return isIterable(value)?value:Seq(value);}createClass(KeyedIterable, Iterable);function KeyedIterable(value){return isKeyed(value)?value:KeyedSeq(value);}createClass(IndexedIterable, Iterable);function IndexedIterable(value){return isIndexed(value)?value:IndexedSeq(value);}createClass(SetIterable, Iterable);function SetIterable(value){return isIterable(value) && !isAssociative(value)?value:SetSeq(value);}function isIterable(maybeIterable){return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);}function isKeyed(maybeKeyed){return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);}function isIndexed(maybeIndexed){return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);}function isAssociative(maybeAssociative){return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);}function isOrdered(maybeOrdered){return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);}Iterable.isIterable = isIterable;Iterable.isKeyed = isKeyed;Iterable.isIndexed = isIndexed;Iterable.isAssociative = isAssociative;Iterable.isOrdered = isOrdered;Iterable.Keyed = KeyedIterable;Iterable.Indexed = IndexedIterable;Iterable.Set = SetIterable;var IS_ITERABLE_SENTINEL='@@__IMMUTABLE_ITERABLE__@@';var IS_KEYED_SENTINEL='@@__IMMUTABLE_KEYED__@@';var IS_INDEXED_SENTINEL='@@__IMMUTABLE_INDEXED__@@';var IS_ORDERED_SENTINEL='@@__IMMUTABLE_ORDERED__@@';var ITERATE_KEYS=0;var ITERATE_VALUES=1;var ITERATE_ENTRIES=2;var REAL_ITERATOR_SYMBOL=typeof Symbol === 'function' && Symbol.iterator;var FAUX_ITERATOR_SYMBOL='@@iterator';var ITERATOR_SYMBOL=REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;function src_Iterator__Iterator(next){this.next = next;}src_Iterator__Iterator.prototype.toString = function(){return '[Iterator]';};src_Iterator__Iterator.KEYS = ITERATE_KEYS;src_Iterator__Iterator.VALUES = ITERATE_VALUES;src_Iterator__Iterator.ENTRIES = ITERATE_ENTRIES;src_Iterator__Iterator.prototype.inspect = src_Iterator__Iterator.prototype.toSource = function(){return this.toString();};src_Iterator__Iterator.prototype[ITERATOR_SYMBOL] = function(){return this;};function iteratorValue(type, k, v, iteratorResult){var value=type === 0?k:type === 1?v:[k, v];iteratorResult?iteratorResult.value = value:iteratorResult = {value:value, done:false};return iteratorResult;}function iteratorDone(){return {value:undefined, done:true};}function hasIterator(maybeIterable){return !!getIteratorFn(maybeIterable);}function isIterator(maybeIterator){return maybeIterator && typeof maybeIterator.next === 'function';}function getIterator(iterable){var iteratorFn=getIteratorFn(iterable);return iteratorFn && iteratorFn.call(iterable);}function getIteratorFn(iterable){var iteratorFn=iterable && (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL] || iterable[FAUX_ITERATOR_SYMBOL]);if(typeof iteratorFn === 'function'){return iteratorFn;}}function isArrayLike(value){return value && typeof value.length === 'number';}createClass(Seq, Iterable);function Seq(value){return value === null || value === undefined?emptySequence():isIterable(value)?value.toSeq():seqFromValue(value);}Seq.of = function(){return Seq(arguments);};Seq.prototype.toSeq = function(){return this;};Seq.prototype.toString = function(){return this.__toString('Seq {', '}');};Seq.prototype.cacheResult = function(){if(!this._cache && this.__iterateUncached){this._cache = this.entrySeq().toArray();this.size = this._cache.length;}return this;};Seq.prototype.__iterate = function(fn, reverse){return seqIterate(this, fn, reverse, true);};Seq.prototype.__iterator = function(type, reverse){return seqIterator(this, type, reverse, true);};createClass(KeyedSeq, Seq);function KeyedSeq(value){return value === null || value === undefined?emptySequence().toKeyedSeq():isIterable(value)?isKeyed(value)?value.toSeq():value.fromEntrySeq():keyedSeqFromValue(value);}KeyedSeq.prototype.toKeyedSeq = function(){return this;};createClass(IndexedSeq, Seq);function IndexedSeq(value){return value === null || value === undefined?emptySequence():!isIterable(value)?indexedSeqFromValue(value):isKeyed(value)?value.entrySeq():value.toIndexedSeq();}IndexedSeq.of = function(){return IndexedSeq(arguments);};IndexedSeq.prototype.toIndexedSeq = function(){return this;};IndexedSeq.prototype.toString = function(){return this.__toString('Seq [', ']');};IndexedSeq.prototype.__iterate = function(fn, reverse){return seqIterate(this, fn, reverse, false);};IndexedSeq.prototype.__iterator = function(type, reverse){return seqIterator(this, type, reverse, false);};createClass(SetSeq, Seq);function SetSeq(value){return (value === null || value === undefined?emptySequence():!isIterable(value)?indexedSeqFromValue(value):isKeyed(value)?value.entrySeq():value).toSetSeq();}SetSeq.of = function(){return SetSeq(arguments);};SetSeq.prototype.toSetSeq = function(){return this;};Seq.isSeq = isSeq;Seq.Keyed = KeyedSeq;Seq.Set = SetSeq;Seq.Indexed = IndexedSeq;var IS_SEQ_SENTINEL='@@__IMMUTABLE_SEQ__@@';Seq.prototype[IS_SEQ_SENTINEL] = true;createClass(ArraySeq, IndexedSeq);function ArraySeq(array){this._array = array;this.size = array.length;}ArraySeq.prototype.get = function(index, notSetValue){return this.has(index)?this._array[wrapIndex(this, index)]:notSetValue;};ArraySeq.prototype.__iterate = function(fn, reverse){var array=this._array;var maxIndex=array.length - 1;for(var ii=0; ii <= maxIndex; ii++) {if(fn(array[reverse?maxIndex - ii:ii], ii, this) === false){return ii + 1;}}return ii;};ArraySeq.prototype.__iterator = function(type, reverse){var array=this._array;var maxIndex=array.length - 1;var ii=0;return new src_Iterator__Iterator(function(){return ii > maxIndex?iteratorDone():iteratorValue(type, ii, array[reverse?maxIndex - ii++:ii++]);});};createClass(ObjectSeq, KeyedSeq);function ObjectSeq(object){var keys=Object.keys(object);this._object = object;this._keys = keys;this.size = keys.length;}ObjectSeq.prototype.get = function(key, notSetValue){if(notSetValue !== undefined && !this.has(key)){return notSetValue;}return this._object[key];};ObjectSeq.prototype.has = function(key){return this._object.hasOwnProperty(key);};ObjectSeq.prototype.__iterate = function(fn, reverse){var object=this._object;var keys=this._keys;var maxIndex=keys.length - 1;for(var ii=0; ii <= maxIndex; ii++) {var key=keys[reverse?maxIndex - ii:ii];if(fn(object[key], key, this) === false){return ii + 1;}}return ii;};ObjectSeq.prototype.__iterator = function(type, reverse){var object=this._object;var keys=this._keys;var maxIndex=keys.length - 1;var ii=0;return new src_Iterator__Iterator(function(){var key=keys[reverse?maxIndex - ii:ii];return ii++ > maxIndex?iteratorDone():iteratorValue(type, key, object[key]);});};ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;createClass(IterableSeq, IndexedSeq);function IterableSeq(iterable){this._iterable = iterable;this.size = iterable.length || iterable.size;}IterableSeq.prototype.__iterateUncached = function(fn, reverse){if(reverse){return this.cacheResult().__iterate(fn, reverse);}var iterable=this._iterable;var iterator=getIterator(iterable);var iterations=0;if(isIterator(iterator)){var step;while(!(step = iterator.next()).done) {if(fn(step.value, iterations++, this) === false){break;}}}return iterations;};IterableSeq.prototype.__iteratorUncached = function(type, reverse){if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterable=this._iterable;var iterator=getIterator(iterable);if(!isIterator(iterator)){return new src_Iterator__Iterator(iteratorDone);}var iterations=0;return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, iterations++, step.value);});};createClass(IteratorSeq, IndexedSeq);function IteratorSeq(iterator){this._iterator = iterator;this._iteratorCache = [];}IteratorSeq.prototype.__iterateUncached = function(fn, reverse){if(reverse){return this.cacheResult().__iterate(fn, reverse);}var iterator=this._iterator;var cache=this._iteratorCache;var iterations=0;while(iterations < cache.length) {if(fn(cache[iterations], iterations++, this) === false){return iterations;}}var step;while(!(step = iterator.next()).done) {var val=step.value;cache[iterations] = val;if(fn(val, iterations++, this) === false){break;}}return iterations;};IteratorSeq.prototype.__iteratorUncached = function(type, reverse){if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=this._iterator;var cache=this._iteratorCache;var iterations=0;return new src_Iterator__Iterator(function(){if(iterations >= cache.length){var step=iterator.next();if(step.done){return step;}cache[iterations] = step.value;}return iteratorValue(type, iterations, cache[iterations++]);});};function isSeq(maybeSeq){return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);}var EMPTY_SEQ;function emptySequence(){return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));}function keyedSeqFromValue(value){var seq=Array.isArray(value)?new ArraySeq(value).fromEntrySeq():isIterator(value)?new IteratorSeq(value).fromEntrySeq():hasIterator(value)?new IterableSeq(value).fromEntrySeq():typeof value === 'object'?new ObjectSeq(value):undefined;if(!seq){throw new TypeError('Expected Array or iterable object of [k, v] entries, ' + 'or keyed object: ' + value);}return seq;}function indexedSeqFromValue(value){var seq=maybeIndexedSeqFromValue(value);if(!seq){throw new TypeError('Expected Array or iterable object of values: ' + value);}return seq;}function seqFromValue(value){var seq=maybeIndexedSeqFromValue(value) || typeof value === 'object' && new ObjectSeq(value);if(!seq){throw new TypeError('Expected Array or iterable object of values, or keyed object: ' + value);}return seq;}function maybeIndexedSeqFromValue(value){return isArrayLike(value)?new ArraySeq(value):isIterator(value)?new IteratorSeq(value):hasIterator(value)?new IterableSeq(value):undefined;}function seqIterate(seq, fn, reverse, useKeys){var cache=seq._cache;if(cache){var maxIndex=cache.length - 1;for(var ii=0; ii <= maxIndex; ii++) {var entry=cache[reverse?maxIndex - ii:ii];if(fn(entry[1], useKeys?entry[0]:ii, seq) === false){return ii + 1;}}return ii;}return seq.__iterateUncached(fn, reverse);}function seqIterator(seq, type, reverse, useKeys){var cache=seq._cache;if(cache){var maxIndex=cache.length - 1;var ii=0;return new src_Iterator__Iterator(function(){var entry=cache[reverse?maxIndex - ii:ii];return ii++ > maxIndex?iteratorDone():iteratorValue(type, useKeys?entry[0]:ii - 1, entry[1]);});}return seq.__iteratorUncached(type, reverse);}createClass(Collection, Iterable);function Collection(){throw TypeError('Abstract');}createClass(KeyedCollection, Collection);function KeyedCollection(){}createClass(IndexedCollection, Collection);function IndexedCollection(){}createClass(SetCollection, Collection);function SetCollection(){}Collection.Keyed = KeyedCollection;Collection.Indexed = IndexedCollection;Collection.Set = SetCollection;function is(valueA, valueB){if(valueA === valueB || valueA !== valueA && valueB !== valueB){return true;}if(!valueA || !valueB){return false;}if(typeof valueA.valueOf === 'function' && typeof valueB.valueOf === 'function'){valueA = valueA.valueOf();valueB = valueB.valueOf();}return typeof valueA.equals === 'function' && typeof valueB.equals === 'function'?valueA.equals(valueB):valueA === valueB || valueA !== valueA && valueB !== valueB;}function fromJS(json, converter){return converter?fromJSWith(converter, json, '', {'':json}):fromJSDefault(json);}function fromJSWith(converter, json, key, parentJSON){if(Array.isArray(json)){return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k){return fromJSWith(converter, v, k, json);}));}if(isPlainObj(json)){return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k){return fromJSWith(converter, v, k, json);}));}return json;}function fromJSDefault(json){if(Array.isArray(json)){return IndexedSeq(json).map(fromJSDefault).toList();}if(isPlainObj(json)){return KeyedSeq(json).map(fromJSDefault).toMap();}return json;}function isPlainObj(value){return value && (value.constructor === Object || value.constructor === undefined);}var src_Math__imul=typeof Math.imul === 'function' && Math.imul(4294967295, 2) === -2?Math.imul:function src_Math__imul(a, b){a = a | 0;b = b | 0;var c=a & 65535;var d=b & 65535;return c * d + ((a >>> 16) * d + c * (b >>> 16) << 16 >>> 0) | 0;};function smi(i32){return i32 >>> 1 & 1073741824 | i32 & 3221225471;}function hash(o){if(o === false || o === null || o === undefined){return 0;}if(typeof o.valueOf === 'function'){o = o.valueOf();if(o === false || o === null || o === undefined){return 0;}}if(o === true){return 1;}var type=typeof o;if(type === 'number'){var h=o | 0;if(h !== o){h ^= o * 4294967295;}while(o > 4294967295) {o /= 4294967295;h ^= o;}return smi(h);}if(type === 'string'){return o.length > STRING_HASH_CACHE_MIN_STRLEN?cachedHashString(o):hashString(o);}if(typeof o.hashCode === 'function'){return o.hashCode();}return hashJSObj(o);}function cachedHashString(string){var hash=stringHashCache[string];if(hash === undefined){hash = hashString(string);if(STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE){STRING_HASH_CACHE_SIZE = 0;stringHashCache = {};}STRING_HASH_CACHE_SIZE++;stringHashCache[string] = hash;}return hash;}function hashString(string){var hash=0;for(var ii=0; ii < string.length; ii++) {hash = 31 * hash + string.charCodeAt(ii) | 0;}return smi(hash);}function hashJSObj(obj){var hash=weakMap && weakMap.get(obj);if(hash)return hash;hash = obj[UID_HASH_KEY];if(hash)return hash;if(!canDefineProperty){hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];if(hash)return hash;hash = getIENodeHash(obj);if(hash)return hash;}if(Object.isExtensible && !Object.isExtensible(obj)){throw new Error('Non-extensible objects are not allowed as keys.');}hash = ++objHashUID;if(objHashUID & 1073741824){objHashUID = 0;}if(weakMap){weakMap.set(obj, hash);}else if(canDefineProperty){Object.defineProperty(obj, UID_HASH_KEY, {'enumerable':false, 'configurable':false, 'writable':false, 'value':hash});}else if(obj.propertyIsEnumerable && obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable){obj.propertyIsEnumerable = function(){return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);};obj.propertyIsEnumerable[UID_HASH_KEY] = hash;}else if(obj.nodeType){obj[UID_HASH_KEY] = hash;}else {throw new Error('Unable to set a non-enumerable property on object.');}return hash;}var canDefineProperty=(function(){try{Object.defineProperty({}, '@', {});return true;}catch(e) {return false;}})();function getIENodeHash(node){if(node && node.nodeType > 0){switch(node.nodeType){case 1:return node.uniqueID;case 9:return node.documentElement && node.documentElement.uniqueID;}}}var weakMap=typeof WeakMap === 'function' && new WeakMap();var objHashUID=0;var UID_HASH_KEY='__immutablehash__';if(typeof Symbol === 'function'){UID_HASH_KEY = Symbol(UID_HASH_KEY);}var STRING_HASH_CACHE_MIN_STRLEN=16;var STRING_HASH_CACHE_MAX_SIZE=255;var STRING_HASH_CACHE_SIZE=0;var stringHashCache={};function invariant(condition, error){if(!condition)throw new Error(error);}function assertNotInfinite(size){invariant(size !== Infinity, 'Cannot perform this action with an infinite size.');}createClass(ToKeyedSequence, KeyedSeq);function ToKeyedSequence(indexed, useKeys){this._iter = indexed;this._useKeys = useKeys;this.size = indexed.size;}ToKeyedSequence.prototype.get = function(key, notSetValue){return this._iter.get(key, notSetValue);};ToKeyedSequence.prototype.has = function(key){return this._iter.has(key);};ToKeyedSequence.prototype.valueSeq = function(){return this._iter.valueSeq();};ToKeyedSequence.prototype.reverse = function(){var this$0=this;var reversedSequence=reverseFactory(this, true);if(!this._useKeys){reversedSequence.valueSeq = function(){return this$0._iter.toSeq().reverse();};}return reversedSequence;};ToKeyedSequence.prototype.map = function(mapper, context){var this$0=this;var mappedSequence=mapFactory(this, mapper, context);if(!this._useKeys){mappedSequence.valueSeq = function(){return this$0._iter.toSeq().map(mapper, context);};}return mappedSequence;};ToKeyedSequence.prototype.__iterate = function(fn, reverse){var this$0=this;var ii;return this._iter.__iterate(this._useKeys?function(v, k){return fn(v, k, this$0);}:(ii = reverse?resolveSize(this):0, function(v){return fn(v, reverse?--ii:ii++, this$0);}), reverse);};ToKeyedSequence.prototype.__iterator = function(type, reverse){if(this._useKeys){return this._iter.__iterator(type, reverse);}var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);var ii=reverse?resolveSize(this):0;return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, reverse?--ii:ii++, step.value, step);});};ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;createClass(ToIndexedSequence, IndexedSeq);function ToIndexedSequence(iter){this._iter = iter;this.size = iter.size;}ToIndexedSequence.prototype.contains = function(value){return this._iter.contains(value);};ToIndexedSequence.prototype.__iterate = function(fn, reverse){var this$0=this;var iterations=0;return this._iter.__iterate(function(v){return fn(v, iterations++, this$0);}, reverse);};ToIndexedSequence.prototype.__iterator = function(type, reverse){var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);var iterations=0;return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, iterations++, step.value, step);});};createClass(ToSetSequence, SetSeq);function ToSetSequence(iter){this._iter = iter;this.size = iter.size;}ToSetSequence.prototype.has = function(key){return this._iter.contains(key);};ToSetSequence.prototype.__iterate = function(fn, reverse){var this$0=this;return this._iter.__iterate(function(v){return fn(v, v, this$0);}, reverse);};ToSetSequence.prototype.__iterator = function(type, reverse){var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, step.value, step.value, step);});};createClass(FromEntriesSequence, KeyedSeq);function FromEntriesSequence(entries){this._iter = entries;this.size = entries.size;}FromEntriesSequence.prototype.entrySeq = function(){return this._iter.toSeq();};FromEntriesSequence.prototype.__iterate = function(fn, reverse){var this$0=this;return this._iter.__iterate(function(entry){if(entry){validateEntry(entry);return fn(entry[1], entry[0], this$0);}}, reverse);};FromEntriesSequence.prototype.__iterator = function(type, reverse){var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);return new src_Iterator__Iterator(function(){while(true) {var step=iterator.next();if(step.done){return step;}var entry=step.value;if(entry){validateEntry(entry);return type === ITERATE_ENTRIES?step:iteratorValue(type, entry[0], entry[1], step);}}});};ToIndexedSequence.prototype.cacheResult = ToKeyedSequence.prototype.cacheResult = ToSetSequence.prototype.cacheResult = FromEntriesSequence.prototype.cacheResult = cacheResultThrough;function flipFactory(iterable){var flipSequence=makeSequence(iterable);flipSequence._iter = iterable;flipSequence.size = iterable.size;flipSequence.flip = function(){return iterable;};flipSequence.reverse = function(){var reversedSequence=iterable.reverse.apply(this);reversedSequence.flip = function(){return iterable.reverse();};return reversedSequence;};flipSequence.has = function(key){return iterable.contains(key);};flipSequence.contains = function(key){return iterable.has(key);};flipSequence.cacheResult = cacheResultThrough;flipSequence.__iterateUncached = function(fn, reverse){var this$0=this;return iterable.__iterate(function(v, k){return fn(k, v, this$0) !== false;}, reverse);};flipSequence.__iteratorUncached = function(type, reverse){if(type === ITERATE_ENTRIES){var iterator=iterable.__iterator(type, reverse);return new src_Iterator__Iterator(function(){var step=iterator.next();if(!step.done){var k=step.value[0];step.value[0] = step.value[1];step.value[1] = k;}return step;});}return iterable.__iterator(type === ITERATE_VALUES?ITERATE_KEYS:ITERATE_VALUES, reverse);};return flipSequence;}function mapFactory(iterable, mapper, context){var mappedSequence=makeSequence(iterable);mappedSequence.size = iterable.size;mappedSequence.has = function(key){return iterable.has(key);};mappedSequence.get = function(key, notSetValue){var v=iterable.get(key, NOT_SET);return v === NOT_SET?notSetValue:mapper.call(context, v, key, iterable);};mappedSequence.__iterateUncached = function(fn, reverse){var this$0=this;return iterable.__iterate(function(v, k, c){return fn(mapper.call(context, v, k, c), k, this$0) !== false;}, reverse);};mappedSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);return new src_Iterator__Iterator(function(){var step=iterator.next();if(step.done){return step;}var entry=step.value;var key=entry[0];return iteratorValue(type, key, mapper.call(context, entry[1], key, iterable), step);});};return mappedSequence;}function reverseFactory(iterable, useKeys){var reversedSequence=makeSequence(iterable);reversedSequence._iter = iterable;reversedSequence.size = iterable.size;reversedSequence.reverse = function(){return iterable;};if(iterable.flip){reversedSequence.flip = function(){var flipSequence=flipFactory(iterable);flipSequence.reverse = function(){return iterable.flip();};return flipSequence;};}reversedSequence.get = function(key, notSetValue){return iterable.get(useKeys?key:-1 - key, notSetValue);};reversedSequence.has = function(key){return iterable.has(useKeys?key:-1 - key);};reversedSequence.contains = function(value){return iterable.contains(value);};reversedSequence.cacheResult = cacheResultThrough;reversedSequence.__iterate = function(fn, reverse){var this$0=this;return iterable.__iterate(function(v, k){return fn(v, k, this$0);}, !reverse);};reversedSequence.__iterator = function(type, reverse){return iterable.__iterator(type, !reverse);};return reversedSequence;}function filterFactory(iterable, predicate, context, useKeys){var filterSequence=makeSequence(iterable);if(useKeys){filterSequence.has = function(key){var v=iterable.get(key, NOT_SET);return v !== NOT_SET && !!predicate.call(context, v, key, iterable);};filterSequence.get = function(key, notSetValue){var v=iterable.get(key, NOT_SET);return v !== NOT_SET && predicate.call(context, v, key, iterable)?v:notSetValue;};}filterSequence.__iterateUncached = function(fn, reverse){var this$0=this;var iterations=0;iterable.__iterate(function(v, k, c){if(predicate.call(context, v, k, c)){iterations++;return fn(v, useKeys?k:iterations - 1, this$0);}}, reverse);return iterations;};filterSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);var iterations=0;return new src_Iterator__Iterator(function(){while(true) {var step=iterator.next();if(step.done){return step;}var entry=step.value;var key=entry[0];var value=entry[1];if(predicate.call(context, value, key, iterable)){return iteratorValue(type, useKeys?key:iterations++, value, step);}}});};return filterSequence;}function countByFactory(iterable, grouper, context){var groups=src_Map__Map().asMutable();iterable.__iterate(function(v, k){groups.update(grouper.call(context, v, k, iterable), 0, function(a){return a + 1;});});return groups.asImmutable();}function groupByFactory(iterable, grouper, context){var isKeyedIter=isKeyed(iterable);var groups=(isOrdered(iterable)?OrderedMap():src_Map__Map()).asMutable();iterable.__iterate(function(v, k){groups.update(grouper.call(context, v, k, iterable), function(a){return (a = a || [], a.push(isKeyedIter?[k, v]:v), a);});});var coerce=iterableClass(iterable);return groups.map(function(arr){return reify(iterable, coerce(arr));});}function sliceFactory(_x, _x2, _x3, _x4){var _again=true;_function: while(_again) {var iterable=_x, begin=_x2, end=_x3, useKeys=_x4;originalSize = resolvedBegin = resolvedEnd = sliceSize = sliceSeq = undefined;_again = false;var originalSize=iterable.size;if(wholeSlice(begin, end, originalSize)){return iterable;}var resolvedBegin=resolveBegin(begin, originalSize);var resolvedEnd=resolveEnd(end, originalSize);if(resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd){_x = iterable.toSeq().cacheResult();_x2 = begin;_x3 = end;_x4 = useKeys;_again = true;continue _function;}var sliceSize=resolvedEnd - resolvedBegin;if(sliceSize < 0){sliceSize = 0;}var sliceSeq=makeSequence(iterable);sliceSeq.size = sliceSize === 0?sliceSize:iterable.size && sliceSize || undefined;if(!useKeys && isSeq(iterable) && sliceSize >= 0){sliceSeq.get = function(index, notSetValue){index = wrapIndex(this, index);return index >= 0 && index < sliceSize?iterable.get(index + resolvedBegin, notSetValue):notSetValue;};}sliceSeq.__iterateUncached = function(fn, reverse){var this$0=this;if(sliceSize === 0){return 0;}if(reverse){return this.cacheResult().__iterate(fn, reverse);}var skipped=0;var isSkipping=true;var iterations=0;iterable.__iterate(function(v, k){if(!(isSkipping && (isSkipping = skipped++ < resolvedBegin))){iterations++;return fn(v, useKeys?k:iterations - 1, this$0) !== false && iterations !== sliceSize;}});return iterations;};sliceSeq.__iteratorUncached = function(type, reverse){if(sliceSize && reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=sliceSize && iterable.__iterator(type, reverse);var skipped=0;var iterations=0;return new src_Iterator__Iterator(function(){while(skipped++ !== resolvedBegin) {iterator.next();}if(++iterations > sliceSize){return iteratorDone();}var step=iterator.next();if(useKeys || type === ITERATE_VALUES){return step;}else if(type === ITERATE_KEYS){return iteratorValue(type, iterations - 1, undefined, step);}else {return iteratorValue(type, iterations - 1, step.value[1], step);}});};return sliceSeq;}}function takeWhileFactory(iterable, predicate, context){var takeSequence=makeSequence(iterable);takeSequence.__iterateUncached = function(fn, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterate(fn, reverse);}var iterations=0;iterable.__iterate(function(v, k, c){return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0);});return iterations;};takeSequence.__iteratorUncached = function(type, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);var iterating=true;return new src_Iterator__Iterator(function(){if(!iterating){return iteratorDone();}var step=iterator.next();if(step.done){return step;}var entry=step.value;var k=entry[0];var v=entry[1];if(!predicate.call(context, v, k, this$0)){iterating = false;return iteratorDone();}return type === ITERATE_ENTRIES?step:iteratorValue(type, k, v, step);});};return takeSequence;}function skipWhileFactory(iterable, predicate, context, useKeys){var skipSequence=makeSequence(iterable);skipSequence.__iterateUncached = function(fn, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterate(fn, reverse);}var isSkipping=true;var iterations=0;iterable.__iterate(function(v, k, c){if(!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))){iterations++;return fn(v, useKeys?k:iterations - 1, this$0);}});return iterations;};skipSequence.__iteratorUncached = function(type, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);var skipping=true;var iterations=0;return new src_Iterator__Iterator(function(){var step, k, v;do {step = iterator.next();if(step.done){if(useKeys || type === ITERATE_VALUES){return step;}else if(type === ITERATE_KEYS){return iteratorValue(type, iterations++, undefined, step);}else {return iteratorValue(type, iterations++, step.value[1], step);}}var entry=step.value;k = entry[0];v = entry[1];skipping && (skipping = predicate.call(context, v, k, this$0));}while(skipping);return type === ITERATE_ENTRIES?step:iteratorValue(type, k, v, step);});};return skipSequence;}function concatFactory(iterable, values){var isKeyedIterable=isKeyed(iterable);var iters=[iterable].concat(values).map(function(v){if(!isIterable(v)){v = isKeyedIterable?keyedSeqFromValue(v):indexedSeqFromValue(Array.isArray(v)?v:[v]);}else if(isKeyedIterable){v = KeyedIterable(v);}return v;}).filter(function(v){return v.size !== 0;});if(iters.length === 0){return iterable;}if(iters.length === 1){var singleton=iters[0];if(singleton === iterable || isKeyedIterable && isKeyed(singleton) || isIndexed(iterable) && isIndexed(singleton)){return singleton;}}var concatSeq=new ArraySeq(iters);if(isKeyedIterable){concatSeq = concatSeq.toKeyedSeq();}else if(!isIndexed(iterable)){concatSeq = concatSeq.toSetSeq();}concatSeq = concatSeq.flatten(true);concatSeq.size = iters.reduce(function(sum, seq){if(sum !== undefined){var size=seq.size;if(size !== undefined){return sum + size;}}}, 0);return concatSeq;}function flattenFactory(iterable, depth, useKeys){var flatSequence=makeSequence(iterable);flatSequence.__iterateUncached = function(fn, reverse){var iterations=0;var stopped=false;function flatDeep(iter, currentDepth){var this$0=this;iter.__iterate(function(v, k){if((!depth || currentDepth < depth) && isIterable(v)){flatDeep(v, currentDepth + 1);}else if(fn(v, useKeys?k:iterations++, this$0) === false){stopped = true;}return !stopped;}, reverse);}flatDeep(iterable, 0);return iterations;};flatSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(type, reverse);var stack=[];var iterations=0;return new src_Iterator__Iterator(function(){while(iterator) {var step=iterator.next();if(step.done !== false){iterator = stack.pop();continue;}var v=step.value;if(type === ITERATE_ENTRIES){v = v[1];}if((!depth || stack.length < depth) && isIterable(v)){stack.push(iterator);iterator = v.__iterator(type, reverse);}else {return useKeys?step:iteratorValue(type, iterations++, v, step);}}return iteratorDone();});};return flatSequence;}function flatMapFactory(iterable, mapper, context){var coerce=iterableClass(iterable);return iterable.toSeq().map(function(v, k){return coerce(mapper.call(context, v, k, iterable));}).flatten(true);}function interposeFactory(iterable, separator){var interposedSequence=makeSequence(iterable);interposedSequence.size = iterable.size && iterable.size * 2 - 1;interposedSequence.__iterateUncached = function(fn, reverse){var this$0=this;var iterations=0;iterable.__iterate(function(v, k){return (!iterations || fn(separator, iterations++, this$0) !== false) && fn(v, iterations++, this$0) !== false;}, reverse);return iterations;};interposedSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(ITERATE_VALUES, reverse);var iterations=0;var step;return new src_Iterator__Iterator(function(){if(!step || iterations % 2){step = iterator.next();if(step.done){return step;}}return iterations % 2?iteratorValue(type, iterations++, separator):iteratorValue(type, iterations++, step.value, step);});};return interposedSequence;}function sortFactory(iterable, comparator, mapper){if(!comparator){comparator = defaultComparator;}var isKeyedIterable=isKeyed(iterable);var index=0;var entries=iterable.toSeq().map(function(v, k){return [k, v, index++, mapper?mapper(v, k, iterable):v];}).toArray();entries.sort(function(a, b){return comparator(a[3], b[3]) || a[2] - b[2];}).forEach(isKeyedIterable?function(v, i){entries[i].length = 2;}:function(v, i){entries[i] = v[1];});return isKeyedIterable?KeyedSeq(entries):isIndexed(iterable)?IndexedSeq(entries):SetSeq(entries);}function maxFactory(iterable, comparator, mapper){if(!comparator){comparator = defaultComparator;}if(mapper){var entry=iterable.toSeq().map(function(v, k){return [v, mapper(v, k, iterable)];}).reduce(function(a, b){return maxCompare(comparator, a[1], b[1])?b:a;});return entry && entry[0];}else {return iterable.reduce(function(a, b){return maxCompare(comparator, a, b)?b:a;});}}function maxCompare(comparator, a, b){var comp=comparator(b, a);return comp === 0 && b !== a && (b === undefined || b === null || b !== b) || comp > 0;}function zipWithFactory(keyIter, zipper, iters){var zipSequence=makeSequence(keyIter);zipSequence.size = new ArraySeq(iters).map(function(i){return i.size;}).min();zipSequence.__iterate = function(fn, reverse){var iterator=this.__iterator(ITERATE_VALUES, reverse);var step;var iterations=0;while(!(step = iterator.next()).done) {if(fn(step.value, iterations++, this) === false){break;}}return iterations;};zipSequence.__iteratorUncached = function(type, reverse){var iterators=iters.map(function(i){return (i = Iterable(i), getIterator(reverse?i.reverse():i));});var iterations=0;var isDone=false;return new src_Iterator__Iterator(function(){var steps;if(!isDone){steps = iterators.map(function(i){return i.next();});isDone = steps.some(function(s){return s.done;});}if(isDone){return iteratorDone();}return iteratorValue(type, iterations++, zipper.apply(null, steps.map(function(s){return s.value;})));});};return zipSequence;}function reify(iter, seq){return isSeq(iter)?seq:iter.constructor(seq);}function validateEntry(entry){if(entry !== Object(entry)){throw new TypeError('Expected [K, V] tuple: ' + entry);}}function resolveSize(iter){assertNotInfinite(iter.size);return ensureSize(iter);}function iterableClass(iterable){return isKeyed(iterable)?KeyedIterable:isIndexed(iterable)?IndexedIterable:SetIterable;}function makeSequence(iterable){return Object.create((isKeyed(iterable)?KeyedSeq:isIndexed(iterable)?IndexedSeq:SetSeq).prototype);}function cacheResultThrough(){if(this._iter.cacheResult){this._iter.cacheResult();this.size = this._iter.size;return this;}else {return Seq.prototype.cacheResult.call(this);}}function defaultComparator(a, b){return a > b?1:a < b?-1:0;}function forceIterator(keyPath){var iter=getIterator(keyPath);if(!iter){if(!isArrayLike(keyPath)){throw new TypeError('Expected iterable or array-like: ' + keyPath);}iter = getIterator(Iterable(keyPath));}return iter;}createClass(src_Map__Map, KeyedCollection);function src_Map__Map(value){return value === null || value === undefined?emptyMap():isMap(value)?value:emptyMap().withMutations(function(map){var iter=KeyedIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v, k){return map.set(k, v);});});}src_Map__Map.prototype.toString = function(){return this.__toString('Map {', '}');};src_Map__Map.prototype.get = function(k, notSetValue){return this._root?this._root.get(0, undefined, k, notSetValue):notSetValue;};src_Map__Map.prototype.set = function(k, v){return updateMap(this, k, v);};src_Map__Map.prototype.setIn = function(keyPath, v){return this.updateIn(keyPath, NOT_SET, function(){return v;});};src_Map__Map.prototype.remove = function(k){return updateMap(this, k, NOT_SET);};src_Map__Map.prototype.deleteIn = function(keyPath){return this.updateIn(keyPath, function(){return NOT_SET;});};src_Map__Map.prototype.update = function(k, notSetValue, updater){return arguments.length === 1?k(this):this.updateIn([k], notSetValue, updater);};src_Map__Map.prototype.updateIn = function(keyPath, notSetValue, updater){if(!updater){updater = notSetValue;notSetValue = undefined;}var updatedValue=updateInDeepMap(this, forceIterator(keyPath), notSetValue, updater);return updatedValue === NOT_SET?undefined:updatedValue;};src_Map__Map.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = 0;this._root = null;this.__hash = undefined;this.__altered = true;return this;}return emptyMap();};src_Map__Map.prototype.merge = function(){return mergeIntoMapWith(this, undefined, arguments);};src_Map__Map.prototype.mergeWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoMapWith(this, merger, iters);};src_Map__Map.prototype.mergeIn = function(keyPath){var iters=SLICE$0.call(arguments, 1);return this.updateIn(keyPath, emptyMap(), function(m){return m.merge.apply(m, iters);});};src_Map__Map.prototype.mergeDeep = function(){return mergeIntoMapWith(this, deepMerger(undefined), arguments);};src_Map__Map.prototype.mergeDeepWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoMapWith(this, deepMerger(merger), iters);};src_Map__Map.prototype.mergeDeepIn = function(keyPath){var iters=SLICE$0.call(arguments, 1);return this.updateIn(keyPath, emptyMap(), function(m){return m.mergeDeep.apply(m, iters);});};src_Map__Map.prototype.sort = function(comparator){return OrderedMap(sortFactory(this, comparator));};src_Map__Map.prototype.sortBy = function(mapper, comparator){return OrderedMap(sortFactory(this, comparator, mapper));};src_Map__Map.prototype.withMutations = function(fn){var mutable=this.asMutable();fn(mutable);return mutable.wasAltered()?mutable.__ensureOwner(this.__ownerID):this;};src_Map__Map.prototype.asMutable = function(){return this.__ownerID?this:this.__ensureOwner(new OwnerID());};src_Map__Map.prototype.asImmutable = function(){return this.__ensureOwner();};src_Map__Map.prototype.wasAltered = function(){return this.__altered;};src_Map__Map.prototype.__iterator = function(type, reverse){return new MapIterator(this, type, reverse);};src_Map__Map.prototype.__iterate = function(fn, reverse){var this$0=this;var iterations=0;this._root && this._root.iterate(function(entry){iterations++;return fn(entry[1], entry[0], this$0);}, reverse);return iterations;};src_Map__Map.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}if(!ownerID){this.__ownerID = ownerID;this.__altered = false;return this;}return makeMap(this.size, this._root, ownerID, this.__hash);};function isMap(maybeMap){return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);}src_Map__Map.isMap = isMap;var IS_MAP_SENTINEL='@@__IMMUTABLE_MAP__@@';var MapPrototype=src_Map__Map.prototype;MapPrototype[IS_MAP_SENTINEL] = true;MapPrototype[DELETE] = MapPrototype.remove;MapPrototype.removeIn = MapPrototype.deleteIn;function ArrayMapNode(ownerID, entries){this.ownerID = ownerID;this.entries = entries;}ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue){var entries=this.entries;for(var ii=0, len=entries.length; ii < len; ii++) {if(is(key, entries[ii][0])){return entries[ii][1];}}return notSetValue;};ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){var removed=value === NOT_SET;var entries=this.entries;var idx=0;for(var len=entries.length; idx < len; idx++) {if(is(key, entries[idx][0])){break;}}var exists=idx < len;if(exists?entries[idx][1] === value:removed){return this;}SetRef(didAlter);(removed || !exists) && SetRef(didChangeSize);if(removed && entries.length === 1){return;}if(!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE){return createNodes(ownerID, entries, key, value);}var isEditable=ownerID && ownerID === this.ownerID;var newEntries=isEditable?entries:arrCopy(entries);if(exists){if(removed){idx === len - 1?newEntries.pop():newEntries[idx] = newEntries.pop();}else {newEntries[idx] = [key, value];}}else {newEntries.push([key, value]);}if(isEditable){this.entries = newEntries;return this;}return new ArrayMapNode(ownerID, newEntries);};function BitmapIndexedNode(ownerID, bitmap, nodes){this.ownerID = ownerID;this.bitmap = bitmap;this.nodes = nodes;}BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue){if(keyHash === undefined){keyHash = hash(key);}var bit=1 << ((shift === 0?keyHash:keyHash >>> shift) & MASK);var bitmap=this.bitmap;return (bitmap & bit) === 0?notSetValue:this.nodes[popCount(bitmap & bit - 1)].get(shift + SHIFT, keyHash, key, notSetValue);};BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(keyHash === undefined){keyHash = hash(key);}var keyHashFrag=(shift === 0?keyHash:keyHash >>> shift) & MASK;var bit=1 << keyHashFrag;var bitmap=this.bitmap;var exists=(bitmap & bit) !== 0;if(!exists && value === NOT_SET){return this;}var idx=popCount(bitmap & bit - 1);var nodes=this.nodes;var node=exists?nodes[idx]:undefined;var newNode=updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);if(newNode === node){return this;}if(!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE){return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);}if(exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])){return nodes[idx ^ 1];}if(exists && newNode && nodes.length === 1 && isLeafNode(newNode)){return newNode;}var isEditable=ownerID && ownerID === this.ownerID;var newBitmap=exists?newNode?bitmap:bitmap ^ bit:bitmap | bit;var newNodes=exists?newNode?setIn(nodes, idx, newNode, isEditable):spliceOut(nodes, idx, isEditable):spliceIn(nodes, idx, newNode, isEditable);if(isEditable){this.bitmap = newBitmap;this.nodes = newNodes;return this;}return new BitmapIndexedNode(ownerID, newBitmap, newNodes);};function HashArrayMapNode(ownerID, count, nodes){this.ownerID = ownerID;this.count = count;this.nodes = nodes;}HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue){if(keyHash === undefined){keyHash = hash(key);}var idx=(shift === 0?keyHash:keyHash >>> shift) & MASK;var node=this.nodes[idx];return node?node.get(shift + SHIFT, keyHash, key, notSetValue):notSetValue;};HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(keyHash === undefined){keyHash = hash(key);}var idx=(shift === 0?keyHash:keyHash >>> shift) & MASK;var removed=value === NOT_SET;var nodes=this.nodes;var node=nodes[idx];if(removed && !node){return this;}var newNode=updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);if(newNode === node){return this;}var newCount=this.count;if(!node){newCount++;}else if(!newNode){newCount--;if(newCount < MIN_HASH_ARRAY_MAP_SIZE){return packNodes(ownerID, nodes, newCount, idx);}}var isEditable=ownerID && ownerID === this.ownerID;var newNodes=setIn(nodes, idx, newNode, isEditable);if(isEditable){this.count = newCount;this.nodes = newNodes;return this;}return new HashArrayMapNode(ownerID, newCount, newNodes);};function HashCollisionNode(ownerID, keyHash, entries){this.ownerID = ownerID;this.keyHash = keyHash;this.entries = entries;}HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue){var entries=this.entries;for(var ii=0, len=entries.length; ii < len; ii++) {if(is(key, entries[ii][0])){return entries[ii][1];}}return notSetValue;};HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(keyHash === undefined){keyHash = hash(key);}var removed=value === NOT_SET;if(keyHash !== this.keyHash){if(removed){return this;}SetRef(didAlter);SetRef(didChangeSize);return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);}var entries=this.entries;var idx=0;for(var len=entries.length; idx < len; idx++) {if(is(key, entries[idx][0])){break;}}var exists=idx < len;if(exists?entries[idx][1] === value:removed){return this;}SetRef(didAlter);(removed || !exists) && SetRef(didChangeSize);if(removed && len === 2){return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);}var isEditable=ownerID && ownerID === this.ownerID;var newEntries=isEditable?entries:arrCopy(entries);if(exists){if(removed){idx === len - 1?newEntries.pop():newEntries[idx] = newEntries.pop();}else {newEntries[idx] = [key, value];}}else {newEntries.push([key, value]);}if(isEditable){this.entries = newEntries;return this;}return new HashCollisionNode(ownerID, this.keyHash, newEntries);};function ValueNode(ownerID, keyHash, entry){this.ownerID = ownerID;this.keyHash = keyHash;this.entry = entry;}ValueNode.prototype.get = function(shift, keyHash, key, notSetValue){return is(key, this.entry[0])?this.entry[1]:notSetValue;};ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){var removed=value === NOT_SET;var keyMatch=is(key, this.entry[0]);if(keyMatch?value === this.entry[1]:removed){return this;}SetRef(didAlter);if(removed){SetRef(didChangeSize);return;}if(keyMatch){if(ownerID && ownerID === this.ownerID){this.entry[1] = value;return this;}return new ValueNode(ownerID, this.keyHash, [key, value]);}SetRef(didChangeSize);return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);};ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate = function(fn, reverse){var entries=this.entries;for(var ii=0, maxIndex=entries.length - 1; ii <= maxIndex; ii++) {if(fn(entries[reverse?maxIndex - ii:ii]) === false){return false;}}};BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate = function(fn, reverse){var nodes=this.nodes;for(var ii=0, maxIndex=nodes.length - 1; ii <= maxIndex; ii++) {var node=nodes[reverse?maxIndex - ii:ii];if(node && node.iterate(fn, reverse) === false){return false;}}};ValueNode.prototype.iterate = function(fn, reverse){return fn(this.entry);};createClass(MapIterator, src_Iterator__Iterator);function MapIterator(map, type, reverse){this._type = type;this._reverse = reverse;this._stack = map._root && mapIteratorFrame(map._root);}MapIterator.prototype.next = function(){var type=this._type;var stack=this._stack;while(stack) {var node=stack.node;var index=stack.index++;var maxIndex;if(node.entry){if(index === 0){return mapIteratorValue(type, node.entry);}}else if(node.entries){maxIndex = node.entries.length - 1;if(index <= maxIndex){return mapIteratorValue(type, node.entries[this._reverse?maxIndex - index:index]);}}else {maxIndex = node.nodes.length - 1;if(index <= maxIndex){var subNode=node.nodes[this._reverse?maxIndex - index:index];if(subNode){if(subNode.entry){return mapIteratorValue(type, subNode.entry);}stack = this._stack = mapIteratorFrame(subNode, stack);}continue;}}stack = this._stack = this._stack.__prev;}return iteratorDone();};function mapIteratorValue(type, entry){return iteratorValue(type, entry[0], entry[1]);}function mapIteratorFrame(node, prev){return {node:node, index:0, __prev:prev};}function makeMap(size, root, ownerID, hash){var map=Object.create(MapPrototype);map.size = size;map._root = root;map.__ownerID = ownerID;map.__hash = hash;map.__altered = false;return map;}var EMPTY_MAP;function emptyMap(){return EMPTY_MAP || (EMPTY_MAP = makeMap(0));}function updateMap(map, k, v){var newRoot;var newSize;if(!map._root){if(v === NOT_SET){return map;}newSize = 1;newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);}else {var didChangeSize=MakeRef(CHANGE_LENGTH);var didAlter=MakeRef(DID_ALTER);newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);if(!didAlter.value){return map;}newSize = map.size + (didChangeSize.value?v === NOT_SET?-1:1:0);}if(map.__ownerID){map.size = newSize;map._root = newRoot;map.__hash = undefined;map.__altered = true;return map;}return newRoot?makeMap(newSize, newRoot):emptyMap();}function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(!node){if(value === NOT_SET){return node;}SetRef(didAlter);SetRef(didChangeSize);return new ValueNode(ownerID, keyHash, [key, value]);}return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);}function isLeafNode(node){return node.constructor === ValueNode || node.constructor === HashCollisionNode;}function mergeIntoNode(node, ownerID, shift, keyHash, entry){if(node.keyHash === keyHash){return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);}var idx1=(shift === 0?node.keyHash:node.keyHash >>> shift) & MASK;var idx2=(shift === 0?keyHash:keyHash >>> shift) & MASK;var newNode;var nodes=idx1 === idx2?[mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)]:(newNode = new ValueNode(ownerID, keyHash, entry), idx1 < idx2?[node, newNode]:[newNode, node]);return new BitmapIndexedNode(ownerID, 1 << idx1 | 1 << idx2, nodes);}function createNodes(ownerID, entries, key, value){if(!ownerID){ownerID = new OwnerID();}var node=new ValueNode(ownerID, hash(key), [key, value]);for(var ii=0; ii < entries.length; ii++) {var entry=entries[ii];node = node.update(ownerID, 0, undefined, entry[0], entry[1]);}return node;}function packNodes(ownerID, nodes, count, excluding){var bitmap=0;var packedII=0;var packedNodes=new Array(count);for(var ii=0, bit=1, len=nodes.length; ii < len; ii++, bit <<= 1) {var node=nodes[ii];if(node !== undefined && ii !== excluding){bitmap |= bit;packedNodes[packedII++] = node;}}return new BitmapIndexedNode(ownerID, bitmap, packedNodes);}function expandNodes(ownerID, nodes, bitmap, including, node){var count=0;var expandedNodes=new Array(SIZE);for(var ii=0; bitmap !== 0; ii++, bitmap >>>= 1) {expandedNodes[ii] = bitmap & 1?nodes[count++]:undefined;}expandedNodes[including] = node;return new HashArrayMapNode(ownerID, count + 1, expandedNodes);}function mergeIntoMapWith(map, merger, iterables){var iters=[];for(var ii=0; ii < iterables.length; ii++) {var value=iterables[ii];var iter=KeyedIterable(value);if(!isIterable(value)){iter = iter.map(function(v){return fromJS(v);});}iters.push(iter);}return mergeIntoCollectionWith(map, merger, iters);}function deepMerger(merger){return function(existing, value){return existing && existing.mergeDeepWith && isIterable(value)?existing.mergeDeepWith(merger, value):merger?merger(existing, value):value;};}function mergeIntoCollectionWith(collection, merger, iters){iters = iters.filter(function(x){return x.size !== 0;});if(iters.length === 0){return collection;}if(collection.size === 0 && iters.length === 1){return collection.constructor(iters[0]);}return collection.withMutations(function(collection){var mergeIntoMap=merger?function(value, key){collection.update(key, NOT_SET, function(existing){return existing === NOT_SET?value:merger(existing, value);});}:function(value, key){collection.set(key, value);};for(var ii=0; ii < iters.length; ii++) {iters[ii].forEach(mergeIntoMap);}});}function updateInDeepMap(existing, keyPathIter, notSetValue, updater){var isNotSet=existing === NOT_SET;var step=keyPathIter.next();if(step.done){var existingValue=isNotSet?notSetValue:existing;var newValue=updater(existingValue);return newValue === existingValue?existing:newValue;}invariant(isNotSet || existing && existing.set, 'invalid keyPath');var key=step.value;var nextExisting=isNotSet?NOT_SET:existing.get(key, NOT_SET);var nextUpdated=updateInDeepMap(nextExisting, keyPathIter, notSetValue, updater);return nextUpdated === nextExisting?existing:nextUpdated === NOT_SET?existing.remove(key):(isNotSet?emptyMap():existing).set(key, nextUpdated);}function popCount(x){x = x - (x >> 1 & 1431655765);x = (x & 858993459) + (x >> 2 & 858993459);x = x + (x >> 4) & 252645135;x = x + (x >> 8);x = x + (x >> 16);return x & 127;}function setIn(array, idx, val, canEdit){var newArray=canEdit?array:arrCopy(array);newArray[idx] = val;return newArray;}function spliceIn(array, idx, val, canEdit){var newLen=array.length + 1;if(canEdit && idx + 1 === newLen){array[idx] = val;return array;}var newArray=new Array(newLen);var after=0;for(var ii=0; ii < newLen; ii++) {if(ii === idx){newArray[ii] = val;after = -1;}else {newArray[ii] = array[ii + after];}}return newArray;}function spliceOut(array, idx, canEdit){var newLen=array.length - 1;if(canEdit && idx === newLen){array.pop();return array;}var newArray=new Array(newLen);var after=0;for(var ii=0; ii < newLen; ii++) {if(ii === idx){after = 1;}newArray[ii] = array[ii + after];}return newArray;}var MAX_ARRAY_MAP_SIZE=SIZE / 4;var MAX_BITMAP_INDEXED_SIZE=SIZE / 2;var MIN_HASH_ARRAY_MAP_SIZE=SIZE / 4;createClass(List, IndexedCollection);function List(value){var empty=emptyList();if(value === null || value === undefined){return empty;}if(isList(value)){return value;}var iter=IndexedIterable(value);var size=iter.size;if(size === 0){return empty;}assertNotInfinite(size);if(size > 0 && size < SIZE){return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));}return empty.withMutations(function(list){list.setSize(size);iter.forEach(function(v, i){return list.set(i, v);});});}List.of = function(){return this(arguments);};List.prototype.toString = function(){return this.__toString('List [', ']');};List.prototype.get = function(index, notSetValue){index = wrapIndex(this, index);if(index < 0 || index >= this.size){return notSetValue;}index += this._origin;var node=listNodeFor(this, index);return node && node.array[index & MASK];};List.prototype.set = function(index, value){return updateList(this, index, value);};List.prototype.remove = function(index){return !this.has(index)?this:index === 0?this.shift():index === this.size - 1?this.pop():this.splice(index, 1);};List.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = this._origin = this._capacity = 0;this._level = SHIFT;this._root = this._tail = null;this.__hash = undefined;this.__altered = true;return this;}return emptyList();};List.prototype.push = function(){var values=arguments;var oldSize=this.size;return this.withMutations(function(list){setListBounds(list, 0, oldSize + values.length);for(var ii=0; ii < values.length; ii++) {list.set(oldSize + ii, values[ii]);}});};List.prototype.pop = function(){return setListBounds(this, 0, -1);};List.prototype.unshift = function(){var values=arguments;return this.withMutations(function(list){setListBounds(list, -values.length);for(var ii=0; ii < values.length; ii++) {list.set(ii, values[ii]);}});};List.prototype.shift = function(){return setListBounds(this, 1);};List.prototype.merge = function(){return mergeIntoListWith(this, undefined, arguments);};List.prototype.mergeWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoListWith(this, merger, iters);};List.prototype.mergeDeep = function(){return mergeIntoListWith(this, deepMerger(undefined), arguments);};List.prototype.mergeDeepWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoListWith(this, deepMerger(merger), iters);};List.prototype.setSize = function(size){return setListBounds(this, 0, size);};List.prototype.slice = function(begin, end){var size=this.size;if(wholeSlice(begin, end, size)){return this;}return setListBounds(this, resolveBegin(begin, size), resolveEnd(end, size));};List.prototype.__iterator = function(type, reverse){var index=0;var values=iterateList(this, reverse);return new src_Iterator__Iterator(function(){var value=values();return value === DONE?iteratorDone():iteratorValue(type, index++, value);});};List.prototype.__iterate = function(fn, reverse){var index=0;var values=iterateList(this, reverse);var value;while((value = values()) !== DONE) {if(fn(value, index++, this) === false){break;}}return index;};List.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}if(!ownerID){this.__ownerID = ownerID;return this;}return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);};function isList(maybeList){return !!(maybeList && maybeList[IS_LIST_SENTINEL]);}List.isList = isList;var IS_LIST_SENTINEL='@@__IMMUTABLE_LIST__@@';var ListPrototype=List.prototype;ListPrototype[IS_LIST_SENTINEL] = true;ListPrototype[DELETE] = ListPrototype.remove;ListPrototype.setIn = MapPrototype.setIn;ListPrototype.deleteIn = ListPrototype.removeIn = MapPrototype.removeIn;ListPrototype.update = MapPrototype.update;ListPrototype.updateIn = MapPrototype.updateIn;ListPrototype.mergeIn = MapPrototype.mergeIn;ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;ListPrototype.withMutations = MapPrototype.withMutations;ListPrototype.asMutable = MapPrototype.asMutable;ListPrototype.asImmutable = MapPrototype.asImmutable;ListPrototype.wasAltered = MapPrototype.wasAltered;function VNode(array, ownerID){this.array = array;this.ownerID = ownerID;}VNode.prototype.removeBefore = function(ownerID, level, index){if(index === level?1 << level:0 || this.array.length === 0){return this;}var originIndex=index >>> level & MASK;if(originIndex >= this.array.length){return new VNode([], ownerID);}var removingFirst=originIndex === 0;var newChild;if(level > 0){var oldChild=this.array[originIndex];newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);if(newChild === oldChild && removingFirst){return this;}}if(removingFirst && !newChild){return this;}var editable=editableVNode(this, ownerID);if(!removingFirst){for(var ii=0; ii < originIndex; ii++) {editable.array[ii] = undefined;}}if(newChild){editable.array[originIndex] = newChild;}return editable;};VNode.prototype.removeAfter = function(ownerID, level, index){if(index === level?1 << level:0 || this.array.length === 0){return this;}var sizeIndex=index - 1 >>> level & MASK;if(sizeIndex >= this.array.length){return this;}var removingLast=sizeIndex === this.array.length - 1;var newChild;if(level > 0){var oldChild=this.array[sizeIndex];newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);if(newChild === oldChild && removingLast){return this;}}if(removingLast && !newChild){return this;}var editable=editableVNode(this, ownerID);if(!removingLast){editable.array.pop();}if(newChild){editable.array[sizeIndex] = newChild;}return editable;};var DONE={};function iterateList(list, reverse){var left=list._origin;var right=list._capacity;var tailPos=getTailOffset(right);var tail=list._tail;return iterateNodeOrLeaf(list._root, list._level, 0);function iterateNodeOrLeaf(node, level, offset){return level === 0?iterateLeaf(node, offset):iterateNode(node, level, offset);}function iterateLeaf(node, offset){var array=offset === tailPos?tail && tail.array:node && node.array;var from=offset > left?0:left - offset;var to=right - offset;if(to > SIZE){to = SIZE;}return function(){if(from === to){return DONE;}var idx=reverse?--to:from++;return array && array[idx];};}function iterateNode(node, level, offset){var values;var array=node && node.array;var from=offset > left?0:left - offset >> level;var to=(right - offset >> level) + 1;if(to > SIZE){to = SIZE;}return function(){do {if(values){var value=values();if(value !== DONE){return value;}values = null;}if(from === to){return DONE;}var idx=reverse?--to:from++;values = iterateNodeOrLeaf(array && array[idx], level - SHIFT, offset + (idx << level));}while(true);};}}function makeList(origin, capacity, level, root, tail, ownerID, hash){var list=Object.create(ListPrototype);list.size = capacity - origin;list._origin = origin;list._capacity = capacity;list._level = level;list._root = root;list._tail = tail;list.__ownerID = ownerID;list.__hash = hash;list.__altered = false;return list;}var EMPTY_LIST;function emptyList(){return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));}function updateList(list, index, value){index = wrapIndex(list, index);if(index >= list.size || index < 0){return list.withMutations(function(list){index < 0?setListBounds(list, index).set(0, value):setListBounds(list, 0, index + 1).set(index, value);});}index += list._origin;var newTail=list._tail;var newRoot=list._root;var didAlter=MakeRef(DID_ALTER);if(index >= getTailOffset(list._capacity)){newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);}else {newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);}if(!didAlter.value){return list;}if(list.__ownerID){list._root = newRoot;list._tail = newTail;list.__hash = undefined;list.__altered = true;return list;}return makeList(list._origin, list._capacity, list._level, newRoot, newTail);}function updateVNode(node, ownerID, level, index, value, didAlter){var idx=index >>> level & MASK;var nodeHas=node && idx < node.array.length;if(!nodeHas && value === undefined){return node;}var newNode;if(level > 0){var lowerNode=node && node.array[idx];var newLowerNode=updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);if(newLowerNode === lowerNode){return node;}newNode = editableVNode(node, ownerID);newNode.array[idx] = newLowerNode;return newNode;}if(nodeHas && node.array[idx] === value){return node;}SetRef(didAlter);newNode = editableVNode(node, ownerID);if(value === undefined && idx === newNode.array.length - 1){newNode.array.pop();}else {newNode.array[idx] = value;}return newNode;}function editableVNode(node, ownerID){if(ownerID && node && ownerID === node.ownerID){return node;}return new VNode(node?node.array.slice():[], ownerID);}function listNodeFor(list, rawIndex){if(rawIndex >= getTailOffset(list._capacity)){return list._tail;}if(rawIndex < 1 << list._level + SHIFT){var node=list._root;var level=list._level;while(node && level > 0) {node = node.array[rawIndex >>> level & MASK];level -= SHIFT;}return node;}}function setListBounds(list, begin, end){var owner=list.__ownerID || new OwnerID();var oldOrigin=list._origin;var oldCapacity=list._capacity;var newOrigin=oldOrigin + begin;var newCapacity=end === undefined?oldCapacity:end < 0?oldCapacity + end:oldOrigin + end;if(newOrigin === oldOrigin && newCapacity === oldCapacity){return list;}if(newOrigin >= newCapacity){return list.clear();}var newLevel=list._level;var newRoot=list._root;var offsetShift=0;while(newOrigin + offsetShift < 0) {newRoot = new VNode(newRoot && newRoot.array.length?[undefined, newRoot]:[], owner);newLevel += SHIFT;offsetShift += 1 << newLevel;}if(offsetShift){newOrigin += offsetShift;oldOrigin += offsetShift;newCapacity += offsetShift;oldCapacity += offsetShift;}var oldTailOffset=getTailOffset(oldCapacity);var newTailOffset=getTailOffset(newCapacity);while(newTailOffset >= 1 << newLevel + SHIFT) {newRoot = new VNode(newRoot && newRoot.array.length?[newRoot]:[], owner);newLevel += SHIFT;}var oldTail=list._tail;var newTail=newTailOffset < oldTailOffset?listNodeFor(list, newCapacity - 1):newTailOffset > oldTailOffset?new VNode([], owner):oldTail;if(oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length){newRoot = editableVNode(newRoot, owner);var node=newRoot;for(var level=newLevel; level > SHIFT; level -= SHIFT) {var idx=oldTailOffset >>> level & MASK;node = node.array[idx] = editableVNode(node.array[idx], owner);}node.array[oldTailOffset >>> SHIFT & MASK] = oldTail;}if(newCapacity < oldCapacity){newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);}if(newOrigin >= newTailOffset){newOrigin -= newTailOffset;newCapacity -= newTailOffset;newLevel = SHIFT;newRoot = null;newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);}else if(newOrigin > oldOrigin || newTailOffset < oldTailOffset){offsetShift = 0;while(newRoot) {var beginIndex=newOrigin >>> newLevel & MASK;if(beginIndex !== newTailOffset >>> newLevel & MASK){break;}if(beginIndex){offsetShift += (1 << newLevel) * beginIndex;}newLevel -= SHIFT;newRoot = newRoot.array[beginIndex];}if(newRoot && newOrigin > oldOrigin){newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);}if(newRoot && newTailOffset < oldTailOffset){newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);}if(offsetShift){newOrigin -= offsetShift;newCapacity -= offsetShift;}}if(list.__ownerID){list.size = newCapacity - newOrigin;list._origin = newOrigin;list._capacity = newCapacity;list._level = newLevel;list._root = newRoot;list._tail = newTail;list.__hash = undefined;list.__altered = true;return list;}return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);}function mergeIntoListWith(list, merger, iterables){var iters=[];var maxSize=0;for(var ii=0; ii < iterables.length; ii++) {var value=iterables[ii];var iter=IndexedIterable(value);if(iter.size > maxSize){maxSize = iter.size;}if(!isIterable(value)){iter = iter.map(function(v){return fromJS(v);});}iters.push(iter);}if(maxSize > list.size){list = list.setSize(maxSize);}return mergeIntoCollectionWith(list, merger, iters);}function getTailOffset(size){return size < SIZE?0:size - 1 >>> SHIFT << SHIFT;}createClass(OrderedMap, src_Map__Map);function OrderedMap(value){return value === null || value === undefined?emptyOrderedMap():isOrderedMap(value)?value:emptyOrderedMap().withMutations(function(map){var iter=KeyedIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v, k){return map.set(k, v);});});}OrderedMap.of = function(){return this(arguments);};OrderedMap.prototype.toString = function(){return this.__toString('OrderedMap {', '}');};OrderedMap.prototype.get = function(k, notSetValue){var index=this._map.get(k);return index !== undefined?this._list.get(index)[1]:notSetValue;};OrderedMap.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = 0;this._map.clear();this._list.clear();return this;}return emptyOrderedMap();};OrderedMap.prototype.set = function(k, v){return updateOrderedMap(this, k, v);};OrderedMap.prototype.remove = function(k){return updateOrderedMap(this, k, NOT_SET);};OrderedMap.prototype.wasAltered = function(){return this._map.wasAltered() || this._list.wasAltered();};OrderedMap.prototype.__iterate = function(fn, reverse){var this$0=this;return this._list.__iterate(function(entry){return entry && fn(entry[1], entry[0], this$0);}, reverse);};OrderedMap.prototype.__iterator = function(type, reverse){return this._list.fromEntrySeq().__iterator(type, reverse);};OrderedMap.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}var newMap=this._map.__ensureOwner(ownerID);var newList=this._list.__ensureOwner(ownerID);if(!ownerID){this.__ownerID = ownerID;this._map = newMap;this._list = newList;return this;}return makeOrderedMap(newMap, newList, ownerID, this.__hash);};function isOrderedMap(maybeOrderedMap){return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);}OrderedMap.isOrderedMap = isOrderedMap;OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;function makeOrderedMap(map, list, ownerID, hash){var omap=Object.create(OrderedMap.prototype);omap.size = map?map.size:0;omap._map = map;omap._list = list;omap.__ownerID = ownerID;omap.__hash = hash;return omap;}var EMPTY_ORDERED_MAP;function emptyOrderedMap(){return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));}function updateOrderedMap(omap, k, v){var map=omap._map;var list=omap._list;var i=map.get(k);var has=i !== undefined;var newMap;var newList;if(v === NOT_SET){if(!has){return omap;}if(list.size >= SIZE && list.size >= map.size * 2){newList = list.filter(function(entry, idx){return entry !== undefined && i !== idx;});newMap = newList.toKeyedSeq().map(function(entry){return entry[0];}).flip().toMap();if(omap.__ownerID){newMap.__ownerID = newList.__ownerID = omap.__ownerID;}}else {newMap = map.remove(k);newList = i === list.size - 1?list.pop():list.set(i, undefined);}}else {if(has){if(v === list.get(i)[1]){return omap;}newMap = map;newList = list.set(i, [k, v]);}else {newMap = map.set(k, list.size);newList = list.set(list.size, [k, v]);}}if(omap.__ownerID){omap.size = newMap.size;omap._map = newMap;omap._list = newList;omap.__hash = undefined;return omap;}return makeOrderedMap(newMap, newList);}createClass(Stack, IndexedCollection);function Stack(value){return value === null || value === undefined?emptyStack():isStack(value)?value:emptyStack().unshiftAll(value);}Stack.of = function(){return this(arguments);};Stack.prototype.toString = function(){return this.__toString('Stack [', ']');};Stack.prototype.get = function(index, notSetValue){var head=this._head;index = wrapIndex(this, index);while(head && index--) {head = head.next;}return head?head.value:notSetValue;};Stack.prototype.peek = function(){return this._head && this._head.value;};Stack.prototype.push = function(){if(arguments.length === 0){return this;}var newSize=this.size + arguments.length;var head=this._head;for(var ii=arguments.length - 1; ii >= 0; ii--) {head = {value:arguments[ii], next:head};}if(this.__ownerID){this.size = newSize;this._head = head;this.__hash = undefined;this.__altered = true;return this;}return makeStack(newSize, head);};Stack.prototype.pushAll = function(iter){iter = IndexedIterable(iter);if(iter.size === 0){return this;}assertNotInfinite(iter.size);var newSize=this.size;var head=this._head;iter.reverse().forEach(function(value){newSize++;head = {value:value, next:head};});if(this.__ownerID){this.size = newSize;this._head = head;this.__hash = undefined;this.__altered = true;return this;}return makeStack(newSize, head);};Stack.prototype.pop = function(){return this.slice(1);};Stack.prototype.unshift = function(){return this.push.apply(this, arguments);};Stack.prototype.unshiftAll = function(iter){return this.pushAll(iter);};Stack.prototype.shift = function(){return this.pop.apply(this, arguments);};Stack.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = 0;this._head = undefined;this.__hash = undefined;this.__altered = true;return this;}return emptyStack();};Stack.prototype.slice = function(begin, end){if(wholeSlice(begin, end, this.size)){return this;}var resolvedBegin=resolveBegin(begin, this.size);var resolvedEnd=resolveEnd(end, this.size);if(resolvedEnd !== this.size){return IndexedCollection.prototype.slice.call(this, begin, end);}var newSize=this.size - resolvedBegin;var head=this._head;while(resolvedBegin--) {head = head.next;}if(this.__ownerID){this.size = newSize;this._head = head;this.__hash = undefined;this.__altered = true;return this;}return makeStack(newSize, head);};Stack.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}if(!ownerID){this.__ownerID = ownerID;this.__altered = false;return this;}return makeStack(this.size, this._head, ownerID, this.__hash);};Stack.prototype.__iterate = function(fn, reverse){if(reverse){return this.reverse().__iterate(fn);}var iterations=0;var node=this._head;while(node) {if(fn(node.value, iterations++, this) === false){break;}node = node.next;}return iterations;};Stack.prototype.__iterator = function(type, reverse){if(reverse){return this.reverse().__iterator(type);}var iterations=0;var node=this._head;return new src_Iterator__Iterator(function(){if(node){var value=node.value;node = node.next;return iteratorValue(type, iterations++, value);}return iteratorDone();});};function isStack(maybeStack){return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);}Stack.isStack = isStack;var IS_STACK_SENTINEL='@@__IMMUTABLE_STACK__@@';var StackPrototype=Stack.prototype;StackPrototype[IS_STACK_SENTINEL] = true;StackPrototype.withMutations = MapPrototype.withMutations;StackPrototype.asMutable = MapPrototype.asMutable;StackPrototype.asImmutable = MapPrototype.asImmutable;StackPrototype.wasAltered = MapPrototype.wasAltered;function makeStack(size, head, ownerID, hash){var map=Object.create(StackPrototype);map.size = size;map._head = head;map.__ownerID = ownerID;map.__hash = hash;map.__altered = false;return map;}var EMPTY_STACK;function emptyStack(){return EMPTY_STACK || (EMPTY_STACK = makeStack(0));}createClass(src_Set__Set, SetCollection);function src_Set__Set(value){return value === null || value === undefined?emptySet():isSet(value)?value:emptySet().withMutations(function(set){var iter=SetIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v){return set.add(v);});});}src_Set__Set.of = function(){return this(arguments);};src_Set__Set.fromKeys = function(value){return this(KeyedIterable(value).keySeq());};src_Set__Set.prototype.toString = function(){return this.__toString('Set {', '}');};src_Set__Set.prototype.has = function(value){return this._map.has(value);};src_Set__Set.prototype.add = function(value){return updateSet(this, this._map.set(value, true));};src_Set__Set.prototype.remove = function(value){return updateSet(this, this._map.remove(value));};src_Set__Set.prototype.clear = function(){return updateSet(this, this._map.clear());};src_Set__Set.prototype.union = function(){var iters=SLICE$0.call(arguments, 0);iters = iters.filter(function(x){return x.size !== 0;});if(iters.length === 0){return this;}if(this.size === 0 && iters.length === 1){return this.constructor(iters[0]);}return this.withMutations(function(set){for(var ii=0; ii < iters.length; ii++) {SetIterable(iters[ii]).forEach(function(value){return set.add(value);});}});};src_Set__Set.prototype.intersect = function(){var iters=SLICE$0.call(arguments, 0);if(iters.length === 0){return this;}iters = iters.map(function(iter){return SetIterable(iter);});var originalSet=this;return this.withMutations(function(set){originalSet.forEach(function(value){if(!iters.every(function(iter){return iter.contains(value);})){set.remove(value);}});});};src_Set__Set.prototype.subtract = function(){var iters=SLICE$0.call(arguments, 0);if(iters.length === 0){return this;}iters = iters.map(function(iter){return SetIterable(iter);});var originalSet=this;return this.withMutations(function(set){originalSet.forEach(function(value){if(iters.some(function(iter){return iter.contains(value);})){set.remove(value);}});});};src_Set__Set.prototype.merge = function(){return this.union.apply(this, arguments);};src_Set__Set.prototype.mergeWith = function(merger){var iters=SLICE$0.call(arguments, 1);return this.union.apply(this, iters);};src_Set__Set.prototype.sort = function(comparator){return OrderedSet(sortFactory(this, comparator));};src_Set__Set.prototype.sortBy = function(mapper, comparator){return OrderedSet(sortFactory(this, comparator, mapper));};src_Set__Set.prototype.wasAltered = function(){return this._map.wasAltered();};src_Set__Set.prototype.__iterate = function(fn, reverse){var this$0=this;return this._map.__iterate(function(_, k){return fn(k, k, this$0);}, reverse);};src_Set__Set.prototype.__iterator = function(type, reverse){return this._map.map(function(_, k){return k;}).__iterator(type, reverse);};src_Set__Set.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}var newMap=this._map.__ensureOwner(ownerID);if(!ownerID){this.__ownerID = ownerID;this._map = newMap;return this;}return this.__make(newMap, ownerID);};function isSet(maybeSet){return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);}src_Set__Set.isSet = isSet;var IS_SET_SENTINEL='@@__IMMUTABLE_SET__@@';var SetPrototype=src_Set__Set.prototype;SetPrototype[IS_SET_SENTINEL] = true;SetPrototype[DELETE] = SetPrototype.remove;SetPrototype.mergeDeep = SetPrototype.merge;SetPrototype.mergeDeepWith = SetPrototype.mergeWith;SetPrototype.withMutations = MapPrototype.withMutations;SetPrototype.asMutable = MapPrototype.asMutable;SetPrototype.asImmutable = MapPrototype.asImmutable;SetPrototype.__empty = emptySet;SetPrototype.__make = makeSet;function updateSet(set, newMap){if(set.__ownerID){set.size = newMap.size;set._map = newMap;return set;}return newMap === set._map?set:newMap.size === 0?set.__empty():set.__make(newMap);}function makeSet(map, ownerID){var set=Object.create(SetPrototype);set.size = map?map.size:0;set._map = map;set.__ownerID = ownerID;return set;}var EMPTY_SET;function emptySet(){return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));}createClass(OrderedSet, src_Set__Set);function OrderedSet(value){return value === null || value === undefined?emptyOrderedSet():isOrderedSet(value)?value:emptyOrderedSet().withMutations(function(set){var iter=SetIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v){return set.add(v);});});}OrderedSet.of = function(){return this(arguments);};OrderedSet.fromKeys = function(value){return this(KeyedIterable(value).keySeq());};OrderedSet.prototype.toString = function(){return this.__toString('OrderedSet {', '}');};function isOrderedSet(maybeOrderedSet){return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);}OrderedSet.isOrderedSet = isOrderedSet;var OrderedSetPrototype=OrderedSet.prototype;OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;OrderedSetPrototype.__empty = emptyOrderedSet;OrderedSetPrototype.__make = makeOrderedSet;function makeOrderedSet(map, ownerID){var set=Object.create(OrderedSetPrototype);set.size = map?map.size:0;set._map = map;set.__ownerID = ownerID;return set;}var EMPTY_ORDERED_SET;function emptyOrderedSet(){return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));}createClass(Record, KeyedCollection);function Record(defaultValues, name){var RecordType=function Record(values){if(!(this instanceof RecordType)){return new RecordType(values);}this._map = src_Map__Map(values);};var keys=Object.keys(defaultValues);var RecordTypePrototype=RecordType.prototype = Object.create(RecordPrototype);RecordTypePrototype.constructor = RecordType;name && (RecordTypePrototype._name = name);RecordTypePrototype._defaultValues = defaultValues;RecordTypePrototype._keys = keys;RecordTypePrototype.size = keys.length;try{keys.forEach(function(key){Object.defineProperty(RecordType.prototype, key, {get:function get(){return this.get(key);}, set:function set(value){invariant(this.__ownerID, 'Cannot set on an immutable record.');this.set(key, value);}});});}catch(error) {}return RecordType;}Record.prototype.toString = function(){return this.__toString(recordName(this) + ' {', '}');};Record.prototype.has = function(k){return this._defaultValues.hasOwnProperty(k);};Record.prototype.get = function(k, notSetValue){if(!this.has(k)){return notSetValue;}var defaultVal=this._defaultValues[k];return this._map?this._map.get(k, defaultVal):defaultVal;};Record.prototype.clear = function(){if(this.__ownerID){this._map && this._map.clear();return this;}var SuperRecord=Object.getPrototypeOf(this).constructor;return SuperRecord._empty || (SuperRecord._empty = makeRecord(this, emptyMap()));};Record.prototype.set = function(k, v){if(!this.has(k)){throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));}var newMap=this._map && this._map.set(k, v);if(this.__ownerID || newMap === this._map){return this;}return makeRecord(this, newMap);};Record.prototype.remove = function(k){if(!this.has(k)){return this;}var newMap=this._map && this._map.remove(k);if(this.__ownerID || newMap === this._map){return this;}return makeRecord(this, newMap);};Record.prototype.wasAltered = function(){return this._map.wasAltered();};Record.prototype.__iterator = function(type, reverse){var this$0=this;return KeyedIterable(this._defaultValues).map(function(_, k){return this$0.get(k);}).__iterator(type, reverse);};Record.prototype.__iterate = function(fn, reverse){var this$0=this;return KeyedIterable(this._defaultValues).map(function(_, k){return this$0.get(k);}).__iterate(fn, reverse);};Record.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}var newMap=this._map && this._map.__ensureOwner(ownerID);if(!ownerID){this.__ownerID = ownerID;this._map = newMap;return this;}return makeRecord(this, newMap, ownerID);};var RecordPrototype=Record.prototype;RecordPrototype[DELETE] = RecordPrototype.remove;RecordPrototype.deleteIn = RecordPrototype.removeIn = MapPrototype.removeIn;RecordPrototype.merge = MapPrototype.merge;RecordPrototype.mergeWith = MapPrototype.mergeWith;RecordPrototype.mergeIn = MapPrototype.mergeIn;RecordPrototype.mergeDeep = MapPrototype.mergeDeep;RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;RecordPrototype.setIn = MapPrototype.setIn;RecordPrototype.update = MapPrototype.update;RecordPrototype.updateIn = MapPrototype.updateIn;RecordPrototype.withMutations = MapPrototype.withMutations;RecordPrototype.asMutable = MapPrototype.asMutable;RecordPrototype.asImmutable = MapPrototype.asImmutable;function makeRecord(likeRecord, map, ownerID){var record=Object.create(Object.getPrototypeOf(likeRecord));record._map = map;record.__ownerID = ownerID;return record;}function recordName(record){return record._name || record.constructor.name;}function deepEqual(a, b){if(a === b){return true;}if(!isIterable(b) || a.size !== undefined && b.size !== undefined && a.size !== b.size || a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash || isKeyed(a) !== isKeyed(b) || isIndexed(a) !== isIndexed(b) || isOrdered(a) !== isOrdered(b)){return false;}if(a.size === 0 && b.size === 0){return true;}var notAssociative=!isAssociative(a);if(isOrdered(a)){var entries=a.entries();return b.every(function(v, k){var entry=entries.next().value;return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));}) && entries.next().done;}var flipped=false;if(a.size === undefined){if(b.size === undefined){a.cacheResult();}else {flipped = true;var _=a;a = b;b = _;}}var allEqual=true;var bSize=b.__iterate(function(v, k){if(notAssociative?!a.has(v):flipped?!is(v, a.get(k, NOT_SET)):!is(a.get(k, NOT_SET), v)){allEqual = false;return false;}});return allEqual && a.size === bSize;}createClass(Range, IndexedSeq);function Range(start, end, step){if(!(this instanceof Range)){return new Range(start, end, step);}invariant(step !== 0, 'Cannot step a Range by 0');start = start || 0;if(end === undefined){end = Infinity;}step = step === undefined?1:Math.abs(step);if(end < start){step = -step;}this._start = start;this._end = end;this._step = step;this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);if(this.size === 0){if(EMPTY_RANGE){return EMPTY_RANGE;}EMPTY_RANGE = this;}}Range.prototype.toString = function(){if(this.size === 0){return 'Range []';}return 'Range [ ' + this._start + '...' + this._end + (this._step > 1?' by ' + this._step:'') + ' ]';};Range.prototype.get = function(index, notSetValue){return this.has(index)?this._start + wrapIndex(this, index) * this._step:notSetValue;};Range.prototype.contains = function(searchValue){var possibleIndex=(searchValue - this._start) / this._step;return possibleIndex >= 0 && possibleIndex < this.size && possibleIndex === Math.floor(possibleIndex);};Range.prototype.slice = function(begin, end){if(wholeSlice(begin, end, this.size)){return this;}begin = resolveBegin(begin, this.size);end = resolveEnd(end, this.size);if(end <= begin){return new Range(0, 0);}return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);};Range.prototype.indexOf = function(searchValue){var offsetValue=searchValue - this._start;if(offsetValue % this._step === 0){var index=offsetValue / this._step;if(index >= 0 && index < this.size){return index;}}return -1;};Range.prototype.lastIndexOf = function(searchValue){return this.indexOf(searchValue);};Range.prototype.__iterate = function(fn, reverse){var maxIndex=this.size - 1;var step=this._step;var value=reverse?this._start + maxIndex * step:this._start;for(var ii=0; ii <= maxIndex; ii++) {if(fn(value, ii, this) === false){return ii + 1;}value += reverse?-step:step;}return ii;};Range.prototype.__iterator = function(type, reverse){var maxIndex=this.size - 1;var step=this._step;var value=reverse?this._start + maxIndex * step:this._start;var ii=0;return new src_Iterator__Iterator(function(){var v=value;value += reverse?-step:step;return ii > maxIndex?iteratorDone():iteratorValue(type, ii++, v);});};Range.prototype.equals = function(other){return other instanceof Range?this._start === other._start && this._end === other._end && this._step === other._step:deepEqual(this, other);};var EMPTY_RANGE;createClass(Repeat, IndexedSeq);function Repeat(value, times){if(!(this instanceof Repeat)){return new Repeat(value, times);}this._value = value;this.size = times === undefined?Infinity:Math.max(0, times);if(this.size === 0){if(EMPTY_REPEAT){return EMPTY_REPEAT;}EMPTY_REPEAT = this;}}Repeat.prototype.toString = function(){if(this.size === 0){return 'Repeat []';}return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';};Repeat.prototype.get = function(index, notSetValue){return this.has(index)?this._value:notSetValue;};Repeat.prototype.contains = function(searchValue){return is(this._value, searchValue);};Repeat.prototype.slice = function(begin, end){var size=this.size;return wholeSlice(begin, end, size)?this:new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));};Repeat.prototype.reverse = function(){return this;};Repeat.prototype.indexOf = function(searchValue){if(is(this._value, searchValue)){return 0;}return -1;};Repeat.prototype.lastIndexOf = function(searchValue){if(is(this._value, searchValue)){return this.size;}return -1;};Repeat.prototype.__iterate = function(fn, reverse){for(var ii=0; ii < this.size; ii++) {if(fn(this._value, ii, this) === false){return ii + 1;}}return ii;};Repeat.prototype.__iterator = function(type, reverse){var this$0=this;var ii=0;return new src_Iterator__Iterator(function(){return ii < this$0.size?iteratorValue(type, ii++, this$0._value):iteratorDone();});};Repeat.prototype.equals = function(other){return other instanceof Repeat?is(this._value, other._value):deepEqual(other);};var EMPTY_REPEAT;function mixin(ctor, methods){var keyCopier=function keyCopier(key){ctor.prototype[key] = methods[key];};Object.keys(methods).forEach(keyCopier);Object.getOwnPropertySymbols && Object.getOwnPropertySymbols(methods).forEach(keyCopier);return ctor;}Iterable.Iterator = src_Iterator__Iterator;mixin(Iterable, {toArray:function toArray(){assertNotInfinite(this.size);var array=new Array(this.size || 0);this.valueSeq().__iterate(function(v, i){array[i] = v;});return array;}, toIndexedSeq:function toIndexedSeq(){return new ToIndexedSequence(this);}, toJS:function toJS(){return this.toSeq().map(function(value){return value && typeof value.toJS === 'function'?value.toJS():value;}).__toJS();}, toJSON:function toJSON(){return this.toSeq().map(function(value){return value && typeof value.toJSON === 'function'?value.toJSON():value;}).__toJS();}, toKeyedSeq:function toKeyedSeq(){return new ToKeyedSequence(this, true);}, toMap:function toMap(){return src_Map__Map(this.toKeyedSeq());}, toObject:function toObject(){assertNotInfinite(this.size);var object={};this.__iterate(function(v, k){object[k] = v;});return object;}, toOrderedMap:function toOrderedMap(){return OrderedMap(this.toKeyedSeq());}, toOrderedSet:function toOrderedSet(){return OrderedSet(isKeyed(this)?this.valueSeq():this);}, toSet:function toSet(){return src_Set__Set(isKeyed(this)?this.valueSeq():this);}, toSetSeq:function toSetSeq(){return new ToSetSequence(this);}, toSeq:function toSeq(){return isIndexed(this)?this.toIndexedSeq():isKeyed(this)?this.toKeyedSeq():this.toSetSeq();}, toStack:function toStack(){return Stack(isKeyed(this)?this.valueSeq():this);}, toList:function toList(){return List(isKeyed(this)?this.valueSeq():this);}, toString:function toString(){return '[Iterable]';}, __toString:function __toString(head, tail){if(this.size === 0){return head + tail;}return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;}, concat:function concat(){var values=SLICE$0.call(arguments, 0);return reify(this, concatFactory(this, values));}, contains:function contains(searchValue){return this.some(function(value){return is(value, searchValue);});}, entries:function entries(){return this.__iterator(ITERATE_ENTRIES);}, every:function every(predicate, context){assertNotInfinite(this.size);var returnValue=true;this.__iterate(function(v, k, c){if(!predicate.call(context, v, k, c)){returnValue = false;return false;}});return returnValue;}, filter:function filter(predicate, context){return reify(this, filterFactory(this, predicate, context, true));}, find:function find(predicate, context, notSetValue){var entry=this.findEntry(predicate, context);return entry?entry[1]:notSetValue;}, findEntry:function findEntry(predicate, context){var found;this.__iterate(function(v, k, c){if(predicate.call(context, v, k, c)){found = [k, v];return false;}});return found;}, findLastEntry:function findLastEntry(predicate, context){return this.toSeq().reverse().findEntry(predicate, context);}, forEach:function forEach(sideEffect, context){assertNotInfinite(this.size);return this.__iterate(context?sideEffect.bind(context):sideEffect);}, join:function join(separator){assertNotInfinite(this.size);separator = separator !== undefined?'' + separator:',';var joined='';var isFirst=true;this.__iterate(function(v){isFirst?isFirst = false:joined += separator;joined += v !== null && v !== undefined?v.toString():'';});return joined;}, keys:function keys(){return this.__iterator(ITERATE_KEYS);}, map:function map(mapper, context){return reify(this, mapFactory(this, mapper, context));}, reduce:function reduce(reducer, initialReduction, context){assertNotInfinite(this.size);var reduction;var useFirst;if(arguments.length < 2){useFirst = true;}else {reduction = initialReduction;}this.__iterate(function(v, k, c){if(useFirst){useFirst = false;reduction = v;}else {reduction = reducer.call(context, reduction, v, k, c);}});return reduction;}, reduceRight:function reduceRight(reducer, initialReduction, context){var reversed=this.toKeyedSeq().reverse();return reversed.reduce.apply(reversed, arguments);}, reverse:function reverse(){return reify(this, reverseFactory(this, true));}, slice:function slice(begin, end){return reify(this, sliceFactory(this, begin, end, true));}, some:function some(predicate, context){return !this.every(not(predicate), context);}, sort:function sort(comparator){return reify(this, sortFactory(this, comparator));}, values:function values(){return this.__iterator(ITERATE_VALUES);}, butLast:function butLast(){return this.slice(0, -1);}, isEmpty:function isEmpty(){return this.size !== undefined?this.size === 0:!this.some(function(){return true;});}, count:function count(predicate, context){return ensureSize(predicate?this.toSeq().filter(predicate, context):this);}, countBy:function countBy(grouper, context){return countByFactory(this, grouper, context);}, equals:function equals(other){return deepEqual(this, other);}, entrySeq:function entrySeq(){var iterable=this;if(iterable._cache){return new ArraySeq(iterable._cache);}var entriesSequence=iterable.toSeq().map(entryMapper).toIndexedSeq();entriesSequence.fromEntrySeq = function(){return iterable.toSeq();};return entriesSequence;}, filterNot:function filterNot(predicate, context){return this.filter(not(predicate), context);}, findLast:function findLast(predicate, context, notSetValue){return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);}, first:function first(){return this.find(returnTrue);}, flatMap:function flatMap(mapper, context){return reify(this, flatMapFactory(this, mapper, context));}, flatten:function flatten(depth){return reify(this, flattenFactory(this, depth, true));}, fromEntrySeq:function fromEntrySeq(){return new FromEntriesSequence(this);}, get:function get(searchKey, notSetValue){return this.find(function(_, key){return is(key, searchKey);}, undefined, notSetValue);}, getIn:function getIn(searchKeyPath, notSetValue){var nested=this;var iter=forceIterator(searchKeyPath);var step;while(!(step = iter.next()).done) {var key=step.value;nested = nested && nested.get?nested.get(key, NOT_SET):NOT_SET;if(nested === NOT_SET){return notSetValue;}}return nested;}, groupBy:function groupBy(grouper, context){return groupByFactory(this, grouper, context);}, has:function has(searchKey){return this.get(searchKey, NOT_SET) !== NOT_SET;}, hasIn:function hasIn(searchKeyPath){return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;}, isSubset:function isSubset(iter){iter = typeof iter.contains === 'function'?iter:Iterable(iter);return this.every(function(value){return iter.contains(value);});}, isSuperset:function isSuperset(iter){return iter.isSubset(this);}, keySeq:function keySeq(){return this.toSeq().map(keyMapper).toIndexedSeq();}, last:function last(){return this.toSeq().reverse().first();}, max:function max(comparator){return maxFactory(this, comparator);}, maxBy:function maxBy(mapper, comparator){return maxFactory(this, comparator, mapper);}, min:function min(comparator){return maxFactory(this, comparator?neg(comparator):defaultNegComparator);}, minBy:function minBy(mapper, comparator){return maxFactory(this, comparator?neg(comparator):defaultNegComparator, mapper);}, rest:function rest(){return this.slice(1);}, skip:function skip(amount){return this.slice(Math.max(0, amount));}, skipLast:function skipLast(amount){return reify(this, this.toSeq().reverse().skip(amount).reverse());}, skipWhile:function skipWhile(predicate, context){return reify(this, skipWhileFactory(this, predicate, context, true));}, skipUntil:function skipUntil(predicate, context){return this.skipWhile(not(predicate), context);}, sortBy:function sortBy(mapper, comparator){return reify(this, sortFactory(this, comparator, mapper));}, take:function take(amount){return this.slice(0, Math.max(0, amount));}, takeLast:function takeLast(amount){return reify(this, this.toSeq().reverse().take(amount).reverse());}, takeWhile:function takeWhile(predicate, context){return reify(this, takeWhileFactory(this, predicate, context));}, takeUntil:function takeUntil(predicate, context){return this.takeWhile(not(predicate), context);}, valueSeq:function valueSeq(){return this.toIndexedSeq();}, hashCode:function hashCode(){return this.__hash || (this.__hash = hashIterable(this));}});var IterablePrototype=Iterable.prototype;IterablePrototype[IS_ITERABLE_SENTINEL] = true;IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;IterablePrototype.__toJS = IterablePrototype.toArray;IterablePrototype.__toStringMapper = quoteString;IterablePrototype.inspect = IterablePrototype.toSource = function(){return this.toString();};IterablePrototype.chain = IterablePrototype.flatMap;(function(){try{Object.defineProperty(IterablePrototype, 'length', {get:function get(){if(!Iterable.noLengthWarning){var stack;try{throw new Error();}catch(error) {stack = error.stack;}if(stack.indexOf('_wrapObject') === -1){console && console.warn && console.warn('iterable.length has been deprecated, ' + 'use iterable.size or iterable.count(). ' + 'This warning will become a silent error in a future version. ' + stack);return this.size;}}}});}catch(e) {}})();mixin(KeyedIterable, {flip:function flip(){return reify(this, flipFactory(this));}, findKey:function findKey(predicate, context){var entry=this.findEntry(predicate, context);return entry && entry[0];}, findLastKey:function findLastKey(predicate, context){return this.toSeq().reverse().findKey(predicate, context);}, keyOf:function keyOf(searchValue){return this.findKey(function(value){return is(value, searchValue);});}, lastKeyOf:function lastKeyOf(searchValue){return this.findLastKey(function(value){return is(value, searchValue);});}, mapEntries:function mapEntries(mapper, context){var this$0=this;var iterations=0;return reify(this, this.toSeq().map(function(v, k){return mapper.call(context, [k, v], iterations++, this$0);}).fromEntrySeq());}, mapKeys:function mapKeys(mapper, context){var this$0=this;return reify(this, this.toSeq().flip().map(function(k, v){return mapper.call(context, k, v, this$0);}).flip());}});var KeyedIterablePrototype=KeyedIterable.prototype;KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;KeyedIterablePrototype.__toJS = IterablePrototype.toObject;KeyedIterablePrototype.__toStringMapper = function(v, k){return k + ': ' + quoteString(v);};mixin(IndexedIterable, {toKeyedSeq:function toKeyedSeq(){return new ToKeyedSequence(this, false);}, filter:function filter(predicate, context){return reify(this, filterFactory(this, predicate, context, false));}, findIndex:function findIndex(predicate, context){var entry=this.findEntry(predicate, context);return entry?entry[0]:-1;}, indexOf:function indexOf(searchValue){var key=this.toKeyedSeq().keyOf(searchValue);return key === undefined?-1:key;}, lastIndexOf:function lastIndexOf(searchValue){return this.toSeq().reverse().indexOf(searchValue);}, reverse:function reverse(){return reify(this, reverseFactory(this, false));}, slice:function slice(begin, end){return reify(this, sliceFactory(this, begin, end, false));}, splice:function splice(index, removeNum){var numArgs=arguments.length;removeNum = Math.max(removeNum | 0, 0);if(numArgs === 0 || numArgs === 2 && !removeNum){return this;}index = resolveBegin(index, this.size);var spliced=this.slice(0, index);return reify(this, numArgs === 1?spliced:spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum)));}, findLastIndex:function findLastIndex(predicate, context){var key=this.toKeyedSeq().findLastKey(predicate, context);return key === undefined?-1:key;}, first:function first(){return this.get(0);}, flatten:function flatten(depth){return reify(this, flattenFactory(this, depth, false));}, get:function get(index, notSetValue){index = wrapIndex(this, index);return index < 0 || (this.size === Infinity || this.size !== undefined && index > this.size)?notSetValue:this.find(function(_, key){return key === index;}, undefined, notSetValue);}, has:function has(index){index = wrapIndex(this, index);return index >= 0 && (this.size !== undefined?this.size === Infinity || index < this.size:this.indexOf(index) !== -1);}, interpose:function interpose(separator){return reify(this, interposeFactory(this, separator));}, interleave:function interleave(){var iterables=[this].concat(arrCopy(arguments));var zipped=zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);var interleaved=zipped.flatten(true);if(zipped.size){interleaved.size = zipped.size * iterables.length;}return reify(this, interleaved);}, last:function last(){return this.get(-1);}, skipWhile:function skipWhile(predicate, context){return reify(this, skipWhileFactory(this, predicate, context, false));}, zip:function zip(){var iterables=[this].concat(arrCopy(arguments));return reify(this, zipWithFactory(this, defaultZipper, iterables));}, zipWith:function zipWith(zipper){var iterables=arrCopy(arguments);iterables[0] = this;return reify(this, zipWithFactory(this, zipper, iterables));}});IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;mixin(SetIterable, {get:function get(value, notSetValue){return this.has(value)?value:notSetValue;}, contains:function contains(value){return this.has(value);}, keySeq:function keySeq(){return this.valueSeq();}});SetIterable.prototype.has = IterablePrototype.contains;mixin(KeyedSeq, KeyedIterable.prototype);mixin(IndexedSeq, IndexedIterable.prototype);mixin(SetSeq, SetIterable.prototype);mixin(KeyedCollection, KeyedIterable.prototype);mixin(IndexedCollection, IndexedIterable.prototype);mixin(SetCollection, SetIterable.prototype);function keyMapper(v, k){return k;}function entryMapper(v, k){return [k, v];}function not(predicate){return function(){return !predicate.apply(this, arguments);};}function neg(predicate){return function(){return -predicate.apply(this, arguments);};}function quoteString(value){return typeof value === 'string'?JSON.stringify(value):value;}function defaultZipper(){return arrCopy(arguments);}function defaultNegComparator(a, b){return a < b?1:a > b?-1:0;}function hashIterable(iterable){if(iterable.size === Infinity){return 0;}var ordered=isOrdered(iterable);var keyed=isKeyed(iterable);var h=ordered?1:0;var size=iterable.__iterate(keyed?ordered?function(v, k){h = 31 * h + hashMerge(hash(v), hash(k)) | 0;}:function(v, k){h = h + hashMerge(hash(v), hash(k)) | 0;}:ordered?function(v){h = 31 * h + hash(v) | 0;}:function(v){h = h + hash(v) | 0;});return murmurHashOfSize(size, h);}function murmurHashOfSize(size, h){h = src_Math__imul(h, 3432918353);h = src_Math__imul(h << 15 | h >>> -15, 461845907);h = src_Math__imul(h << 13 | h >>> -13, 5);h = (h + 3864292196 | 0) ^ size;h = src_Math__imul(h ^ h >>> 16, 2246822507);h = src_Math__imul(h ^ h >>> 13, 3266489909);h = smi(h ^ h >>> 16);return h;}function hashMerge(a, b){return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;}var Immutable={Iterable:Iterable, Seq:Seq, Collection:Collection, Map:src_Map__Map, OrderedMap:OrderedMap, List:List, Stack:Stack, Set:src_Set__Set, OrderedSet:OrderedSet, Record:Record, Range:Range, Repeat:Repeat, is:is, fromJS:fromJS};return Immutable;});

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./af": 15,
		"./af.js": 15,
		"./ar": 19,
		"./ar-ma": 16,
		"./ar-ma.js": 16,
		"./ar-sa": 17,
		"./ar-sa.js": 17,
		"./ar-tn": 18,
		"./ar-tn.js": 18,
		"./ar.js": 19,
		"./az": 20,
		"./az.js": 20,
		"./be": 21,
		"./be.js": 21,
		"./bg": 22,
		"./bg.js": 22,
		"./bn": 23,
		"./bn.js": 23,
		"./bo": 24,
		"./bo.js": 24,
		"./br": 25,
		"./br.js": 25,
		"./bs": 26,
		"./bs.js": 26,
		"./ca": 27,
		"./ca.js": 27,
		"./cs": 28,
		"./cs.js": 28,
		"./cv": 29,
		"./cv.js": 29,
		"./cy": 30,
		"./cy.js": 30,
		"./da": 31,
		"./da.js": 31,
		"./de": 33,
		"./de-at": 32,
		"./de-at.js": 32,
		"./de.js": 33,
		"./el": 34,
		"./el.js": 34,
		"./en-au": 35,
		"./en-au.js": 35,
		"./en-ca": 36,
		"./en-ca.js": 36,
		"./en-gb": 37,
		"./en-gb.js": 37,
		"./eo": 38,
		"./eo.js": 38,
		"./es": 39,
		"./es.js": 39,
		"./et": 40,
		"./et.js": 40,
		"./eu": 41,
		"./eu.js": 41,
		"./fa": 42,
		"./fa.js": 42,
		"./fi": 43,
		"./fi.js": 43,
		"./fo": 44,
		"./fo.js": 44,
		"./fr": 46,
		"./fr-ca": 45,
		"./fr-ca.js": 45,
		"./fr.js": 46,
		"./fy": 47,
		"./fy.js": 47,
		"./gl": 48,
		"./gl.js": 48,
		"./he": 49,
		"./he.js": 49,
		"./hi": 50,
		"./hi.js": 50,
		"./hr": 51,
		"./hr.js": 51,
		"./hu": 52,
		"./hu.js": 52,
		"./hy-am": 53,
		"./hy-am.js": 53,
		"./id": 54,
		"./id.js": 54,
		"./is": 55,
		"./is.js": 55,
		"./it": 56,
		"./it.js": 56,
		"./ja": 57,
		"./ja.js": 57,
		"./ka": 58,
		"./ka.js": 58,
		"./km": 59,
		"./km.js": 59,
		"./ko": 60,
		"./ko.js": 60,
		"./lb": 61,
		"./lb.js": 61,
		"./lt": 62,
		"./lt.js": 62,
		"./lv": 63,
		"./lv.js": 63,
		"./mk": 64,
		"./mk.js": 64,
		"./ml": 65,
		"./ml.js": 65,
		"./mr": 66,
		"./mr.js": 66,
		"./ms-my": 67,
		"./ms-my.js": 67,
		"./my": 68,
		"./my.js": 68,
		"./nb": 69,
		"./nb.js": 69,
		"./ne": 70,
		"./ne.js": 70,
		"./nl": 71,
		"./nl.js": 71,
		"./nn": 72,
		"./nn.js": 72,
		"./pl": 73,
		"./pl.js": 73,
		"./pt": 75,
		"./pt-br": 74,
		"./pt-br.js": 74,
		"./pt.js": 75,
		"./ro": 76,
		"./ro.js": 76,
		"./ru": 77,
		"./ru.js": 77,
		"./sk": 78,
		"./sk.js": 78,
		"./sl": 79,
		"./sl.js": 79,
		"./sq": 80,
		"./sq.js": 80,
		"./sr": 82,
		"./sr-cyrl": 81,
		"./sr-cyrl.js": 81,
		"./sr.js": 82,
		"./sv": 83,
		"./sv.js": 83,
		"./ta": 84,
		"./ta.js": 84,
		"./th": 85,
		"./th.js": 85,
		"./tl-ph": 86,
		"./tl-ph.js": 86,
		"./tr": 87,
		"./tr.js": 87,
		"./tzm": 89,
		"./tzm-latn": 88,
		"./tzm-latn.js": 88,
		"./tzm.js": 89,
		"./uk": 90,
		"./uk.js": 90,
		"./uz": 91,
		"./uz.js": 91,
		"./vi": 92,
		"./vi.js": 92,
		"./zh-cn": 93,
		"./zh-cn.js": 93,
		"./zh-tw": 94,
		"./zh-tw.js": 94
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 13;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : afrikaans (af)
	// author : Werner Mollentze : https://github.com/wernerm

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('af', {
	        months: 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
	        monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
	        weekdays: 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
	        weekdaysShort: 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
	        weekdaysMin: 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
	        meridiemParse: /vm|nm/i,
	        isPM: function isPM(input) {
	            return /^nm$/i.test(input);
	        },
	        meridiem: function meridiem(hours, minutes, isLower) {
	            if (hours < 12) {
	                return isLower ? 'vm' : 'VM';
	            } else {
	                return isLower ? 'nm' : 'NM';
	            }
	        },
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Vandag om] LT',
	            nextDay: '[Môre om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[Gister om] LT',
	            lastWeek: '[Laas] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'oor %s',
	            past: '%s gelede',
	            s: '\'n paar sekondes',
	            m: '\'n minuut',
	            mm: '%d minute',
	            h: '\'n uur',
	            hh: '%d ure',
	            d: '\'n dag',
	            dd: '%d dae',
	            M: '\'n maand',
	            MM: '%d maande',
	            y: '\'n jaar',
	            yy: '%d jaar'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal: function ordinal(number) {
	            return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de'); // Thanks to Joris Röling : https://github.com/jjupiter
	        },
	        week: {
	            dow: 1, // Maandag is die eerste dag van die week.
	            doy: 4 // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
	        }
	    });
	});

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Moroccan Arabic (ar-ma)
	// author : ElFadili Yassine : https://github.com/ElFadiliY
	// author : Abdel Said : https://github.com/abdelsaid

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('ar-ma', {
	        months: 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
	        monthsShort: 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
	        weekdays: 'الأحد_الإتنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort: 'احد_اتنين_ثلاثاء_اربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin: 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[اليوم على الساعة] LT',
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'في %s',
	            past: 'منذ %s',
	            s: 'ثوان',
	            m: 'دقيقة',
	            mm: '%d دقائق',
	            h: 'ساعة',
	            hh: '%d ساعات',
	            d: 'يوم',
	            dd: '%d أيام',
	            M: 'شهر',
	            MM: '%d أشهر',
	            y: 'سنة',
	            yy: '%d سنوات'
	        },
	        week: {
	            dow: 6, // Saturday is the first day of the week.
	            doy: 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Arabic Saudi Arabia (ar-sa)
	// author : Suhail Alkowaileet : https://github.com/xsoh

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '١',
	        '2': '٢',
	        '3': '٣',
	        '4': '٤',
	        '5': '٥',
	        '6': '٦',
	        '7': '٧',
	        '8': '٨',
	        '9': '٩',
	        '0': '٠'
	    },
	        numberMap = {
	        '١': '1',
	        '٢': '2',
	        '٣': '3',
	        '٤': '4',
	        '٥': '5',
	        '٦': '6',
	        '٧': '7',
	        '٨': '8',
	        '٩': '9',
	        '٠': '0'
	    };

	    return moment.defineLocale('ar-sa', {
	        months: 'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        monthsShort: 'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        weekdays: 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort: 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin: 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        meridiemParse: /ص|م/,
	        isPM: function isPM(input) {
	            return 'م' === input;
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 12) {
	                return 'ص';
	            } else {
	                return 'م';
	            }
	        },
	        calendar: {
	            sameDay: '[اليوم على الساعة] LT',
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'في %s',
	            past: 'منذ %s',
	            s: 'ثوان',
	            m: 'دقيقة',
	            mm: '%d دقائق',
	            h: 'ساعة',
	            hh: '%d ساعات',
	            d: 'يوم',
	            dd: '%d أيام',
	            M: 'شهر',
	            MM: '%d أشهر',
	            y: 'سنة',
	            yy: '%d سنوات'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[١٢٣٤٥٦٧٨٩٠]/g, function (match) {
	                return numberMap[match];
	            }).replace(/،/g, ',');
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '،');
	        },
	        week: {
	            dow: 6, // Saturday is the first day of the week.
	            doy: 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale  : Tunisian Arabic (ar-tn)

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('ar-tn', {
	        months: 'جانفي_فيفري_مارس_أفريل_ماي_جوان_جويلية_أوت_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        monthsShort: 'جانفي_فيفري_مارس_أفريل_ماي_جوان_جويلية_أوت_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        weekdays: 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort: 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin: 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[اليوم على الساعة] LT',
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'في %s',
	            past: 'منذ %s',
	            s: 'ثوان',
	            m: 'دقيقة',
	            mm: '%d دقائق',
	            h: 'ساعة',
	            hh: '%d ساعات',
	            d: 'يوم',
	            dd: '%d أيام',
	            M: 'شهر',
	            MM: '%d أشهر',
	            y: 'سنة',
	            yy: '%d سنوات'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// Locale: Arabic (ar)
	// Author: Abdel Said: https://github.com/abdelsaid
	// Changes in months, weekdays: Ahmed Elkhatib
	// Native plural forms: forabi https://github.com/forabi

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '١',
	        '2': '٢',
	        '3': '٣',
	        '4': '٤',
	        '5': '٥',
	        '6': '٦',
	        '7': '٧',
	        '8': '٨',
	        '9': '٩',
	        '0': '٠'
	    },
	        numberMap = {
	        '١': '1',
	        '٢': '2',
	        '٣': '3',
	        '٤': '4',
	        '٥': '5',
	        '٦': '6',
	        '٧': '7',
	        '٨': '8',
	        '٩': '9',
	        '٠': '0'
	    },
	        pluralForm = function pluralForm(n) {
	        return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
	    },
	        plurals = {
	        s: ['أقل من ثانية', 'ثانية واحدة', ['ثانيتان', 'ثانيتين'], '%d ثوان', '%d ثانية', '%d ثانية'],
	        m: ['أقل من دقيقة', 'دقيقة واحدة', ['دقيقتان', 'دقيقتين'], '%d دقائق', '%d دقيقة', '%d دقيقة'],
	        h: ['أقل من ساعة', 'ساعة واحدة', ['ساعتان', 'ساعتين'], '%d ساعات', '%d ساعة', '%d ساعة'],
	        d: ['أقل من يوم', 'يوم واحد', ['يومان', 'يومين'], '%d أيام', '%d يومًا', '%d يوم'],
	        M: ['أقل من شهر', 'شهر واحد', ['شهران', 'شهرين'], '%d أشهر', '%d شهرا', '%d شهر'],
	        y: ['أقل من عام', 'عام واحد', ['عامان', 'عامين'], '%d أعوام', '%d عامًا', '%d عام']
	    },
	        pluralize = function pluralize(u) {
	        return function (number, withoutSuffix, string, isFuture) {
	            var f = pluralForm(number),
	                str = plurals[u][pluralForm(number)];
	            if (f === 2) {
	                str = str[withoutSuffix ? 0 : 1];
	            }
	            return str.replace(/%d/i, number);
	        };
	    },
	        months = ['كانون الثاني يناير', 'شباط فبراير', 'آذار مارس', 'نيسان أبريل', 'أيار مايو', 'حزيران يونيو', 'تموز يوليو', 'آب أغسطس', 'أيلول سبتمبر', 'تشرين الأول أكتوبر', 'تشرين الثاني نوفمبر', 'كانون الأول ديسمبر'];

	    return moment.defineLocale('ar', {
	        months: months,
	        monthsShort: months,
	        weekdays: 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort: 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin: 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        meridiemParse: /ص|م/,
	        isPM: function isPM(input) {
	            return 'م' === input;
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 12) {
	                return 'ص';
	            } else {
	                return 'م';
	            }
	        },
	        calendar: {
	            sameDay: '[اليوم عند الساعة] LT',
	            nextDay: '[غدًا عند الساعة] LT',
	            nextWeek: 'dddd [عند الساعة] LT',
	            lastDay: '[أمس عند الساعة] LT',
	            lastWeek: 'dddd [عند الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'بعد %s',
	            past: 'منذ %s',
	            s: pluralize('s'),
	            m: pluralize('m'),
	            mm: pluralize('m'),
	            h: pluralize('h'),
	            hh: pluralize('h'),
	            d: pluralize('d'),
	            dd: pluralize('d'),
	            M: pluralize('M'),
	            MM: pluralize('M'),
	            y: pluralize('y'),
	            yy: pluralize('y')
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[١٢٣٤٥٦٧٨٩٠]/g, function (match) {
	                return numberMap[match];
	            }).replace(/،/g, ',');
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '،');
	        },
	        week: {
	            dow: 6, // Saturday is the first day of the week.
	            doy: 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : azerbaijani (az)
	// author : topchiyev : https://github.com/topchiyev

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var suffixes = {
	        1: '-inci',
	        5: '-inci',
	        8: '-inci',
	        70: '-inci',
	        80: '-inci',

	        2: '-nci',
	        7: '-nci',
	        20: '-nci',
	        50: '-nci',

	        3: '-üncü',
	        4: '-üncü',
	        100: '-üncü',

	        6: '-ncı',

	        9: '-uncu',
	        10: '-uncu',
	        30: '-uncu',

	        60: '-ıncı',
	        90: '-ıncı'
	    };
	    return moment.defineLocale('az', {
	        months: 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
	        monthsShort: 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
	        weekdays: 'Bazar_Bazar ertəsi_Çərşənbə axşamı_Çərşənbə_Cümə axşamı_Cümə_Şənbə'.split('_'),
	        weekdaysShort: 'Baz_BzE_ÇAx_Çər_CAx_Cüm_Şən'.split('_'),
	        weekdaysMin: 'Bz_BE_ÇA_Çə_CA_Cü_Şə'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[bugün saat] LT',
	            nextDay: '[sabah saat] LT',
	            nextWeek: '[gələn həftə] dddd [saat] LT',
	            lastDay: '[dünən] LT',
	            lastWeek: '[keçən həftə] dddd [saat] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s sonra',
	            past: '%s əvvəl',
	            s: 'birneçə saniyyə',
	            m: 'bir dəqiqə',
	            mm: '%d dəqiqə',
	            h: 'bir saat',
	            hh: '%d saat',
	            d: 'bir gün',
	            dd: '%d gün',
	            M: 'bir ay',
	            MM: '%d ay',
	            y: 'bir il',
	            yy: '%d il'
	        },
	        meridiemParse: /gecə|səhər|gündüz|axşam/,
	        isPM: function isPM(input) {
	            return /^(gündüz|axşam)$/.test(input);
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'gecə';
	            } else if (hour < 12) {
	                return 'səhər';
	            } else if (hour < 17) {
	                return 'gündüz';
	            } else {
	                return 'axşam';
	            }
	        },
	        ordinalParse: /\d{1,2}-(ıncı|inci|nci|üncü|ncı|uncu)/,
	        ordinal: function ordinal(number) {
	            if (number === 0) {
	                // special case for zero
	                return number + '-ıncı';
	            }
	            var a = number % 10,
	                b = number % 100 - a,
	                c = number >= 100 ? 100 : null;

	            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : belarusian (be)
	// author : Dmitry Demidov : https://github.com/demidov91
	// author: Praleska: http://praleska.pro/
	// Author : Menelion Elensúle : https://github.com/Oire

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
	    }

	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': withoutSuffix ? 'хвіліна_хвіліны_хвілін' : 'хвіліну_хвіліны_хвілін',
	            'hh': withoutSuffix ? 'гадзіна_гадзіны_гадзін' : 'гадзіну_гадзіны_гадзін',
	            'dd': 'дзень_дні_дзён',
	            'MM': 'месяц_месяцы_месяцаў',
	            'yy': 'год_гады_гадоў'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'хвіліна' : 'хвіліну';
	        } else if (key === 'h') {
	            return withoutSuffix ? 'гадзіна' : 'гадзіну';
	        } else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }

	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'студзень_люты_сакавік_красавік_травень_чэрвень_ліпень_жнівень_верасень_кастрычнік_лістапад_снежань'.split('_'),
	            'accusative': 'студзеня_лютага_сакавіка_красавіка_траўня_чэрвеня_ліпеня_жніўня_верасня_кастрычніка_лістапада_снежня'.split('_')
	        },
	            nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';

	        return months[nounCase][m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'нядзеля_панядзелак_аўторак_серада_чацвер_пятніца_субота'.split('_'),
	            'accusative': 'нядзелю_панядзелак_аўторак_сераду_чацвер_пятніцу_суботу'.split('_')
	        },
	            nounCase = /\[ ?[Вв] ?(?:мінулую|наступную)? ?\] ?dddd/.test(format) ? 'accusative' : 'nominative';

	        return weekdays[nounCase][m.day()];
	    }

	    return moment.defineLocale('be', {
	        months: monthsCaseReplace,
	        monthsShort: 'студ_лют_сак_крас_трав_чэрв_ліп_жнів_вер_каст_ліст_снеж'.split('_'),
	        weekdays: weekdaysCaseReplace,
	        weekdaysShort: 'нд_пн_ат_ср_чц_пт_сб'.split('_'),
	        weekdaysMin: 'нд_пн_ат_ср_чц_пт_сб'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY г.',
	            LLL: 'D MMMM YYYY г., LT',
	            LLLL: 'dddd, D MMMM YYYY г., LT'
	        },
	        calendar: {
	            sameDay: '[Сёння ў] LT',
	            nextDay: '[Заўтра ў] LT',
	            lastDay: '[Учора ў] LT',
	            nextWeek: function nextWeek() {
	                return '[У] dddd [ў] LT';
	            },
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                    case 3:
	                    case 5:
	                    case 6:
	                        return '[У мінулую] dddd [ў] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                        return '[У мінулы] dddd [ў] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'праз %s',
	            past: '%s таму',
	            s: 'некалькі секунд',
	            m: relativeTimeWithPlural,
	            mm: relativeTimeWithPlural,
	            h: relativeTimeWithPlural,
	            hh: relativeTimeWithPlural,
	            d: 'дзень',
	            dd: relativeTimeWithPlural,
	            M: 'месяц',
	            MM: relativeTimeWithPlural,
	            y: 'год',
	            yy: relativeTimeWithPlural
	        },
	        meridiemParse: /ночы|раніцы|дня|вечара/,
	        isPM: function isPM(input) {
	            return /^(дня|вечара)$/.test(input);
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'ночы';
	            } else if (hour < 12) {
	                return 'раніцы';
	            } else if (hour < 17) {
	                return 'дня';
	            } else {
	                return 'вечара';
	            }
	        },

	        ordinalParse: /\d{1,2}-(і|ы|га)/,
	        ordinal: function ordinal(number, period) {
	            switch (period) {
	                case 'M':
	                case 'd':
	                case 'DDD':
	                case 'w':
	                case 'W':
	                    return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-і' : number + '-ы';
	                case 'D':
	                    return number + '-га';
	                default:
	                    return number;
	            }
	        },

	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : bulgarian (bg)
	// author : Krasen Borisov : https://github.com/kraz

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('bg', {
	        months: 'януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември'.split('_'),
	        monthsShort: 'янр_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек'.split('_'),
	        weekdays: 'неделя_понеделник_вторник_сряда_четвъртък_петък_събота'.split('_'),
	        weekdaysShort: 'нед_пон_вто_сря_чет_пет_съб'.split('_'),
	        weekdaysMin: 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'D.MM.YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Днес в] LT',
	            nextDay: '[Утре в] LT',
	            nextWeek: 'dddd [в] LT',
	            lastDay: '[Вчера в] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                    case 3:
	                    case 6:
	                        return '[В изминалата] dddd [в] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[В изминалия] dddd [в] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'след %s',
	            past: 'преди %s',
	            s: 'няколко секунди',
	            m: 'минута',
	            mm: '%d минути',
	            h: 'час',
	            hh: '%d часа',
	            d: 'ден',
	            dd: '%d дни',
	            M: 'месец',
	            MM: '%d месеца',
	            y: 'година',
	            yy: '%d години'
	        },
	        ordinalParse: /\d{1,2}-(ев|ен|ти|ви|ри|ми)/,
	        ordinal: function ordinal(number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-ев';
	            } else if (last2Digits === 0) {
	                return number + '-ен';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-ти';
	            } else if (lastDigit === 1) {
	                return number + '-ви';
	            } else if (lastDigit === 2) {
	                return number + '-ри';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-ми';
	            } else {
	                return number + '-ти';
	            }
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Bengali (bn)
	// author : Kaushik Gandhi : https://github.com/kaushikgandhi

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '১',
	        '2': '২',
	        '3': '৩',
	        '4': '৪',
	        '5': '৫',
	        '6': '৬',
	        '7': '৭',
	        '8': '৮',
	        '9': '৯',
	        '0': '০'
	    },
	        numberMap = {
	        '১': '1',
	        '২': '2',
	        '৩': '3',
	        '৪': '4',
	        '৫': '5',
	        '৬': '6',
	        '৭': '7',
	        '৮': '8',
	        '৯': '9',
	        '০': '0'
	    };

	    return moment.defineLocale('bn', {
	        months: 'জানুয়ারী_ফেবুয়ারী_মার্চ_এপ্রিল_মে_জুন_জুলাই_অগাস্ট_সেপ্টেম্বর_অক্টোবর_নভেম্বর_ডিসেম্বর'.split('_'),
	        monthsShort: 'জানু_ফেব_মার্চ_এপর_মে_জুন_জুল_অগ_সেপ্ট_অক্টো_নভ_ডিসেম্'.split('_'),
	        weekdays: 'রবিবার_সোমবার_মঙ্গলবার_বুধবার_বৃহস্পত্তিবার_শুক্রুবার_শনিবার'.split('_'),
	        weekdaysShort: 'রবি_সোম_মঙ্গল_বুধ_বৃহস্পত্তি_শুক্রু_শনি'.split('_'),
	        weekdaysMin: 'রব_সম_মঙ্গ_বু_ব্রিহ_শু_শনি'.split('_'),
	        longDateFormat: {
	            LT: 'A h:mm সময়',
	            LTS: 'A h:mm:ss সময়',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY, LT',
	            LLLL: 'dddd, D MMMM YYYY, LT'
	        },
	        calendar: {
	            sameDay: '[আজ] LT',
	            nextDay: '[আগামীকাল] LT',
	            nextWeek: 'dddd, LT',
	            lastDay: '[গতকাল] LT',
	            lastWeek: '[গত] dddd, LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s পরে',
	            past: '%s আগে',
	            s: 'কএক সেকেন্ড',
	            m: 'এক মিনিট',
	            mm: '%d মিনিট',
	            h: 'এক ঘন্টা',
	            hh: '%d ঘন্টা',
	            d: 'এক দিন',
	            dd: '%d দিন',
	            M: 'এক মাস',
	            MM: '%d মাস',
	            y: 'এক বছর',
	            yy: '%d বছর'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[১২৩৪৫৬৭৮৯০]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /রাত|শকাল|দুপুর|বিকেল|রাত/,
	        isPM: function isPM(input) {
	            return /^(দুপুর|বিকেল|রাত)$/.test(input);
	        },
	        //Bengali is a vast language its spoken
	        //in different forms in various parts of the world.
	        //I have just generalized with most common one used
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'রাত';
	            } else if (hour < 10) {
	                return 'শকাল';
	            } else if (hour < 17) {
	                return 'দুপুর';
	            } else if (hour < 20) {
	                return 'বিকেল';
	            } else {
	                return 'রাত';
	            }
	        },
	        week: {
	            dow: 0, // Sunday is the first day of the week.
	            doy: 6 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : tibetan (bo)
	// author : Thupten N. Chakrishar : https://github.com/vajradog

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '༡',
	        '2': '༢',
	        '3': '༣',
	        '4': '༤',
	        '5': '༥',
	        '6': '༦',
	        '7': '༧',
	        '8': '༨',
	        '9': '༩',
	        '0': '༠'
	    },
	        numberMap = {
	        '༡': '1',
	        '༢': '2',
	        '༣': '3',
	        '༤': '4',
	        '༥': '5',
	        '༦': '6',
	        '༧': '7',
	        '༨': '8',
	        '༩': '9',
	        '༠': '0'
	    };

	    return moment.defineLocale('bo', {
	        months: 'ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ'.split('_'),
	        monthsShort: 'ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ'.split('_'),
	        weekdays: 'གཟའ་ཉི་མ་_གཟའ་ཟླ་བ་_གཟའ་མིག་དམར་_གཟའ་ལྷག་པ་_གཟའ་ཕུར་བུ_གཟའ་པ་སངས་_གཟའ་སྤེན་པ་'.split('_'),
	        weekdaysShort: 'ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་'.split('_'),
	        weekdaysMin: 'ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་'.split('_'),
	        longDateFormat: {
	            LT: 'A h:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY, LT',
	            LLLL: 'dddd, D MMMM YYYY, LT'
	        },
	        calendar: {
	            sameDay: '[དི་རིང] LT',
	            nextDay: '[སང་ཉིན] LT',
	            nextWeek: '[བདུན་ཕྲག་རྗེས་མ], LT',
	            lastDay: '[ཁ་སང] LT',
	            lastWeek: '[བདུན་ཕྲག་མཐའ་མ] dddd, LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s ལ་',
	            past: '%s སྔན་ལ',
	            s: 'ལམ་སང',
	            m: 'སྐར་མ་གཅིག',
	            mm: '%d སྐར་མ',
	            h: 'ཆུ་ཚོད་གཅིག',
	            hh: '%d ཆུ་ཚོད',
	            d: 'ཉིན་གཅིག',
	            dd: '%d ཉིན་',
	            M: 'ཟླ་བ་གཅིག',
	            MM: '%d ཟླ་བ',
	            y: 'ལོ་གཅིག',
	            yy: '%d ལོ'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[༡༢༣༤༥༦༧༨༩༠]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /མཚན་མོ|ཞོགས་ཀས|ཉིན་གུང|དགོང་དག|མཚན་མོ/,
	        isPM: function isPM(input) {
	            return /^(ཉིན་གུང|དགོང་དག|མཚན་མོ)$/.test(input);
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'མཚན་མོ';
	            } else if (hour < 10) {
	                return 'ཞོགས་ཀས';
	            } else if (hour < 17) {
	                return 'ཉིན་གུང';
	            } else if (hour < 20) {
	                return 'དགོང་དག';
	            } else {
	                return 'མཚན་མོ';
	            }
	        },
	        week: {
	            dow: 0, // Sunday is the first day of the week.
	            doy: 6 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : breton (br)
	// author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function relativeTimeWithMutation(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'munutenn',
	            'MM': 'miz',
	            'dd': 'devezh'
	        };
	        return number + ' ' + mutation(format[key], number);
	    }

	    function specialMutationForYears(number) {
	        switch (lastNumber(number)) {
	            case 1:
	            case 3:
	            case 4:
	            case 5:
	            case 9:
	                return number + ' bloaz';
	            default:
	                return number + ' vloaz';
	        }
	    }

	    function lastNumber(_x) {
	        var _again = true;

	        _function: while (_again) {
	            var number = _x;
	            _again = false;

	            if (number > 9) {
	                _x = number % 10;
	                _again = true;
	                continue _function;
	            }
	            return number;
	        }
	    }

	    function mutation(text, number) {
	        if (number === 2) {
	            return softMutation(text);
	        }
	        return text;
	    }

	    function softMutation(text) {
	        var mutationTable = {
	            'm': 'v',
	            'b': 'v',
	            'd': 'z'
	        };
	        if (mutationTable[text.charAt(0)] === undefined) {
	            return text;
	        }
	        return mutationTable[text.charAt(0)] + text.substring(1);
	    }

	    return moment.defineLocale('br', {
	        months: 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
	        monthsShort: 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
	        weekdays: 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
	        weekdaysShort: 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
	        weekdaysMin: 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'h[e]mm A',
	            LTS: 'h[e]mm:ss A',
	            L: 'DD/MM/YYYY',
	            LL: 'D [a viz] MMMM YYYY',
	            LLL: 'D [a viz] MMMM YYYY LT',
	            LLLL: 'dddd, D [a viz] MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Hiziv da] LT',
	            nextDay: '[Warc\'hoazh da] LT',
	            nextWeek: 'dddd [da] LT',
	            lastDay: '[Dec\'h da] LT',
	            lastWeek: 'dddd [paset da] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'a-benn %s',
	            past: '%s \'zo',
	            s: 'un nebeud segondennoù',
	            m: 'ur vunutenn',
	            mm: relativeTimeWithMutation,
	            h: 'un eur',
	            hh: '%d eur',
	            d: 'un devezh',
	            dd: relativeTimeWithMutation,
	            M: 'ur miz',
	            MM: relativeTimeWithMutation,
	            y: 'ur bloaz',
	            yy: specialMutationForYears
	        },
	        ordinalParse: /\d{1,2}(añ|vet)/,
	        ordinal: function ordinal(number) {
	            var output = number === 1 ? 'añ' : 'vet';
	            return number + output;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : bosnian (bs)
	// author : Nedim Cholich : https://github.com/frontyard
	// based on (hr) translation by Bojan Marković

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	            case 'm':
	                return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	            case 'mm':
	                if (number === 1) {
	                    result += 'minuta';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'minute';
	                } else {
	                    result += 'minuta';
	                }
	                return result;
	            case 'h':
	                return withoutSuffix ? 'jedan sat' : 'jednog sata';
	            case 'hh':
	                if (number === 1) {
	                    result += 'sat';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'sata';
	                } else {
	                    result += 'sati';
	                }
	                return result;
	            case 'dd':
	                if (number === 1) {
	                    result += 'dan';
	                } else {
	                    result += 'dana';
	                }
	                return result;
	            case 'MM':
	                if (number === 1) {
	                    result += 'mjesec';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'mjeseca';
	                } else {
	                    result += 'mjeseci';
	                }
	                return result;
	            case 'yy':
	                if (number === 1) {
	                    result += 'godina';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'godine';
	                } else {
	                    result += 'godina';
	                }
	                return result;
	        }
	    }

	    return moment.defineLocale('bs', {
	        months: 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
	        monthsShort: 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
	        weekdays: 'nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota'.split('_'),
	        weekdaysShort: 'ned._pon._uto._sri._čet._pet._sub.'.split('_'),
	        weekdaysMin: 'ne_po_ut_sr_če_pe_su'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[danas u] LT',
	            nextDay: '[sutra u] LT',

	            nextWeek: function nextWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[u] [nedjelju] [u] LT';
	                    case 3:
	                        return '[u] [srijedu] [u] LT';
	                    case 6:
	                        return '[u] [subotu] [u] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[u] dddd [u] LT';
	                }
	            },
	            lastDay: '[jučer u] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                    case 3:
	                        return '[prošlu] dddd [u] LT';
	                    case 6:
	                        return '[prošle] [subote] [u] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[prošli] dddd [u] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'za %s',
	            past: 'prije %s',
	            s: 'par sekundi',
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: 'dan',
	            dd: translate,
	            M: 'mjesec',
	            MM: translate,
	            y: 'godinu',
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : catalan (ca)
	// author : Juan G. Hurtado : https://github.com/juanghurtado

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('ca', {
	        months: 'gener_febrer_març_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
	        monthsShort: 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
	        weekdays: 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
	        weekdaysShort: 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
	        weekdaysMin: 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: function sameDay() {
	                return '[avui a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
	            },
	            nextDay: function nextDay() {
	                return '[demà a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
	            },
	            nextWeek: function nextWeek() {
	                return 'dddd [a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
	            },
	            lastDay: function lastDay() {
	                return '[ahir a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
	            },
	            lastWeek: function lastWeek() {
	                return '[el] dddd [passat a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'en %s',
	            past: 'fa %s',
	            s: 'uns segons',
	            m: 'un minut',
	            mm: '%d minuts',
	            h: 'una hora',
	            hh: '%d hores',
	            d: 'un dia',
	            dd: '%d dies',
	            M: 'un mes',
	            MM: '%d mesos',
	            y: 'un any',
	            yy: '%d anys'
	        },
	        ordinalParse: /\d{1,2}(r|n|t|è|a)/,
	        ordinal: function ordinal(number, period) {
	            var output = number === 1 ? 'r' : number === 2 ? 'n' : number === 3 ? 'r' : number === 4 ? 't' : 'è';
	            if (period === 'w' || period === 'W') {
	                output = 'a';
	            }
	            return number + output;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : czech (cs)
	// author : petrbela : https://github.com/petrbela

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var months = 'leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec'.split('_'),
	        monthsShort = 'led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro'.split('_');

	    function plural(n) {
	        return n > 1 && n < 5 && ~ ~(n / 10) !== 1;
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	            case 's':
	                // a few seconds / in a few seconds / a few seconds ago
	                return withoutSuffix || isFuture ? 'pár sekund' : 'pár sekundami';
	            case 'm':
	                // a minute / in a minute / a minute ago
	                return withoutSuffix ? 'minuta' : isFuture ? 'minutu' : 'minutou';
	            case 'mm':
	                // 9 minutes / in 9 minutes / 9 minutes ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'minuty' : 'minut');
	                } else {
	                    return result + 'minutami';
	                }
	                break;
	            case 'h':
	                // an hour / in an hour / an hour ago
	                return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
	            case 'hh':
	                // 9 hours / in 9 hours / 9 hours ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'hodiny' : 'hodin');
	                } else {
	                    return result + 'hodinami';
	                }
	                break;
	            case 'd':
	                // a day / in a day / a day ago
	                return withoutSuffix || isFuture ? 'den' : 'dnem';
	            case 'dd':
	                // 9 days / in 9 days / 9 days ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'dny' : 'dní');
	                } else {
	                    return result + 'dny';
	                }
	                break;
	            case 'M':
	                // a month / in a month / a month ago
	                return withoutSuffix || isFuture ? 'měsíc' : 'měsícem';
	            case 'MM':
	                // 9 months / in 9 months / 9 months ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'měsíce' : 'měsíců');
	                } else {
	                    return result + 'měsíci';
	                }
	                break;
	            case 'y':
	                // a year / in a year / a year ago
	                return withoutSuffix || isFuture ? 'rok' : 'rokem';
	            case 'yy':
	                // 9 years / in 9 years / 9 years ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'roky' : 'let');
	                } else {
	                    return result + 'lety';
	                }
	                break;
	        }
	    }

	    return moment.defineLocale('cs', {
	        months: months,
	        monthsShort: monthsShort,
	        monthsParse: (function (months, monthsShort) {
	            var i,
	                _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (červenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        })(months, monthsShort),
	        weekdays: 'neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota'.split('_'),
	        weekdaysShort: 'ne_po_út_st_čt_pá_so'.split('_'),
	        weekdaysMin: 'ne_po_út_st_čt_pá_so'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[dnes v] LT',
	            nextDay: '[zítra v] LT',
	            nextWeek: function nextWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[v neděli v] LT';
	                    case 1:
	                    case 2:
	                        return '[v] dddd [v] LT';
	                    case 3:
	                        return '[ve středu v] LT';
	                    case 4:
	                        return '[ve čtvrtek v] LT';
	                    case 5:
	                        return '[v pátek v] LT';
	                    case 6:
	                        return '[v sobotu v] LT';
	                }
	            },
	            lastDay: '[včera v] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[minulou neděli v] LT';
	                    case 1:
	                    case 2:
	                        return '[minulé] dddd [v] LT';
	                    case 3:
	                        return '[minulou středu v] LT';
	                    case 4:
	                    case 5:
	                        return '[minulý] dddd [v] LT';
	                    case 6:
	                        return '[minulou sobotu v] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'za %s',
	            past: 'před %s',
	            s: translate,
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: translate,
	            dd: translate,
	            M: translate,
	            MM: translate,
	            y: translate,
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : chuvash (cv)
	// author : Anatoly Mironov : https://github.com/mirontoli

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('cv', {
	        months: 'кăрлач_нарăс_пуш_ака_май_çĕртме_утă_çурла_авăн_юпа_чӳк_раштав'.split('_'),
	        monthsShort: 'кăр_нар_пуш_ака_май_çĕр_утă_çур_ав_юпа_чӳк_раш'.split('_'),
	        weekdays: 'вырсарникун_тунтикун_ытларикун_юнкун_кĕçнерникун_эрнекун_шăматкун'.split('_'),
	        weekdaysShort: 'выр_тун_ытл_юн_кĕç_эрн_шăм'.split('_'),
	        weekdaysMin: 'вр_тн_ыт_юн_кç_эр_шм'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD-MM-YYYY',
	            LL: 'YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ]',
	            LLL: 'YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ], LT',
	            LLLL: 'dddd, YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ], LT'
	        },
	        calendar: {
	            sameDay: '[Паян] LT [сехетре]',
	            nextDay: '[Ыран] LT [сехетре]',
	            lastDay: '[Ĕнер] LT [сехетре]',
	            nextWeek: '[Çитес] dddd LT [сехетре]',
	            lastWeek: '[Иртнĕ] dddd LT [сехетре]',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: function future(output) {
	                var affix = /сехет$/i.exec(output) ? 'рен' : /çул$/i.exec(output) ? 'тан' : 'ран';
	                return output + affix;
	            },
	            past: '%s каялла',
	            s: 'пĕр-ик çеккунт',
	            m: 'пĕр минут',
	            mm: '%d минут',
	            h: 'пĕр сехет',
	            hh: '%d сехет',
	            d: 'пĕр кун',
	            dd: '%d кун',
	            M: 'пĕр уйăх',
	            MM: '%d уйăх',
	            y: 'пĕр çул',
	            yy: '%d çул'
	        },
	        ordinalParse: /\d{1,2}-мĕш/,
	        ordinal: '%d-мĕш',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Welsh (cy)
	// author : Robert Allen

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('cy', {
	        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
	        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
	        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
	        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
	        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
	        // time formats are the same as en-gb
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Heddiw am] LT',
	            nextDay: '[Yfory am] LT',
	            nextWeek: 'dddd [am] LT',
	            lastDay: '[Ddoe am] LT',
	            lastWeek: 'dddd [diwethaf am] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'mewn %s',
	            past: '%s yn ôl',
	            s: 'ychydig eiliadau',
	            m: 'munud',
	            mm: '%d munud',
	            h: 'awr',
	            hh: '%d awr',
	            d: 'diwrnod',
	            dd: '%d diwrnod',
	            M: 'mis',
	            MM: '%d mis',
	            y: 'blwyddyn',
	            yy: '%d flynedd'
	        },
	        ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
	        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
	        ordinal: function ordinal(number) {
	            var b = number,
	                output = '',
	                lookup = ['', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
	            'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
	            ];

	            if (b > 20) {
	                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
	                    output = 'fed'; // not 30ain, 70ain or 90ain
	                } else {
	                    output = 'ain';
	                }
	            } else if (b > 0) {
	                output = lookup[b];
	            }

	            return number + output;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : danish (da)
	// author : Ulrik Nielsen : https://github.com/mrbase

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('da', {
	        months: 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
	        weekdays: 'søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag'.split('_'),
	        weekdaysShort: 'søn_man_tir_ons_tor_fre_lør'.split('_'),
	        weekdaysMin: 'sø_ma_ti_on_to_fr_lø'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd [d.] D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[I dag kl.] LT',
	            nextDay: '[I morgen kl.] LT',
	            nextWeek: 'dddd [kl.] LT',
	            lastDay: '[I går kl.] LT',
	            lastWeek: '[sidste] dddd [kl] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'om %s',
	            past: '%s siden',
	            s: 'få sekunder',
	            m: 'et minut',
	            mm: '%d minutter',
	            h: 'en time',
	            hh: '%d timer',
	            d: 'en dag',
	            dd: '%d dage',
	            M: 'en måned',
	            MM: '%d måneder',
	            y: 'et år',
	            yy: '%d år'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : austrian german (de-at)
	// author : lluchs : https://github.com/lluchs
	// author: Menelion Elensúle: https://github.com/Oire
	// author : Martin Groller : https://github.com/MadMG

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eine Minute', 'einer Minute'],
	            'h': ['eine Stunde', 'einer Stunde'],
	            'd': ['ein Tag', 'einem Tag'],
	            'dd': [number + ' Tage', number + ' Tagen'],
	            'M': ['ein Monat', 'einem Monat'],
	            'MM': [number + ' Monate', number + ' Monaten'],
	            'y': ['ein Jahr', 'einem Jahr'],
	            'yy': [number + ' Jahre', number + ' Jahren']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }

	    return moment.defineLocale('de-at', {
	        months: 'Jänner_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort: 'Jän._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
	        weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
	        weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Heute um] LT [Uhr]',
	            sameElse: 'L',
	            nextDay: '[Morgen um] LT [Uhr]',
	            nextWeek: 'dddd [um] LT [Uhr]',
	            lastDay: '[Gestern um] LT [Uhr]',
	            lastWeek: '[letzten] dddd [um] LT [Uhr]'
	        },
	        relativeTime: {
	            future: 'in %s',
	            past: 'vor %s',
	            s: 'ein paar Sekunden',
	            m: processRelativeTime,
	            mm: '%d Minuten',
	            h: processRelativeTime,
	            hh: '%d Stunden',
	            d: processRelativeTime,
	            dd: processRelativeTime,
	            M: processRelativeTime,
	            MM: processRelativeTime,
	            y: processRelativeTime,
	            yy: processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : german (de)
	// author : lluchs : https://github.com/lluchs
	// author: Menelion Elensúle: https://github.com/Oire

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eine Minute', 'einer Minute'],
	            'h': ['eine Stunde', 'einer Stunde'],
	            'd': ['ein Tag', 'einem Tag'],
	            'dd': [number + ' Tage', number + ' Tagen'],
	            'M': ['ein Monat', 'einem Monat'],
	            'MM': [number + ' Monate', number + ' Monaten'],
	            'y': ['ein Jahr', 'einem Jahr'],
	            'yy': [number + ' Jahre', number + ' Jahren']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }

	    return moment.defineLocale('de', {
	        months: 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort: 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
	        weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
	        weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Heute um] LT [Uhr]',
	            sameElse: 'L',
	            nextDay: '[Morgen um] LT [Uhr]',
	            nextWeek: 'dddd [um] LT [Uhr]',
	            lastDay: '[Gestern um] LT [Uhr]',
	            lastWeek: '[letzten] dddd [um] LT [Uhr]'
	        },
	        relativeTime: {
	            future: 'in %s',
	            past: 'vor %s',
	            s: 'ein paar Sekunden',
	            m: processRelativeTime,
	            mm: '%d Minuten',
	            h: processRelativeTime,
	            hh: '%d Stunden',
	            d: processRelativeTime,
	            dd: processRelativeTime,
	            M: processRelativeTime,
	            MM: processRelativeTime,
	            y: processRelativeTime,
	            yy: processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : modern greek (el)
	// author : Aggelos Karalias : https://github.com/mehiel

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('el', {
	        monthsNominativeEl: 'Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος'.split('_'),
	        monthsGenitiveEl: 'Ιανουαρίου_Φεβρουαρίου_Μαρτίου_Απριλίου_Μαΐου_Ιουνίου_Ιουλίου_Αυγούστου_Σεπτεμβρίου_Οκτωβρίου_Νοεμβρίου_Δεκεμβρίου'.split('_'),
	        months: function months(momentToFormat, format) {
	            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) {
	                // if there is a day number before 'MMMM'
	                return this._monthsGenitiveEl[momentToFormat.month()];
	            } else {
	                return this._monthsNominativeEl[momentToFormat.month()];
	            }
	        },
	        monthsShort: 'Ιαν_Φεβ_Μαρ_Απρ_Μαϊ_Ιουν_Ιουλ_Αυγ_Σεπ_Οκτ_Νοε_Δεκ'.split('_'),
	        weekdays: 'Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο'.split('_'),
	        weekdaysShort: 'Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ'.split('_'),
	        weekdaysMin: 'Κυ_Δε_Τρ_Τε_Πε_Πα_Σα'.split('_'),
	        meridiem: function meridiem(hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'μμ' : 'ΜΜ';
	            } else {
	                return isLower ? 'πμ' : 'ΠΜ';
	            }
	        },
	        isPM: function isPM(input) {
	            return (input + '').toLowerCase()[0] === 'μ';
	        },
	        meridiemParse: /[ΠΜ]\.?Μ?\.?/i,
	        longDateFormat: {
	            LT: 'h:mm A',
	            LTS: 'h:mm:ss A',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendarEl: {
	            sameDay: '[Σήμερα {}] LT',
	            nextDay: '[Αύριο {}] LT',
	            nextWeek: 'dddd [{}] LT',
	            lastDay: '[Χθες {}] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 6:
	                        return '[το προηγούμενο] dddd [{}] LT';
	                    default:
	                        return '[την προηγούμενη] dddd [{}] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        calendar: function calendar(key, mom) {
	            var output = this._calendarEl[key],
	                hours = mom && mom.hours();

	            if (typeof output === 'function') {
	                output = output.apply(mom);
	            }

	            return output.replace('{}', hours % 12 === 1 ? 'στη' : 'στις');
	        },
	        relativeTime: {
	            future: 'σε %s',
	            past: '%s πριν',
	            s: 'λίγα δευτερόλεπτα',
	            m: 'ένα λεπτό',
	            mm: '%d λεπτά',
	            h: 'μία ώρα',
	            hh: '%d ώρες',
	            d: 'μία μέρα',
	            dd: '%d μέρες',
	            M: 'ένας μήνας',
	            MM: '%d μήνες',
	            y: 'ένας χρόνος',
	            yy: '%d χρόνια'
	        },
	        ordinalParse: /\d{1,2}η/,
	        ordinal: '%dη',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : australian english (en-au)

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('en-au', {
	        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'h:mm A',
	            LTS: 'h:mm:ss A',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Today at] LT',
	            nextDay: '[Tomorrow at] LT',
	            nextWeek: 'dddd [at] LT',
	            lastDay: '[Yesterday at] LT',
	            lastWeek: '[Last] dddd [at] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'in %s',
	            past: '%s ago',
	            s: 'a few seconds',
	            m: 'a minute',
	            mm: '%d minutes',
	            h: 'an hour',
	            hh: '%d hours',
	            d: 'a day',
	            dd: '%d days',
	            M: 'a month',
	            MM: '%d months',
	            y: 'a year',
	            yy: '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal: function ordinal(number) {
	            var b = number % 10,
	                output = ~ ~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
	            return number + output;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : canadian english (en-ca)
	// author : Jonathan Abourbih : https://github.com/jonbca

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('en-ca', {
	        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'h:mm A',
	            LTS: 'h:mm:ss A',
	            L: 'YYYY-MM-DD',
	            LL: 'D MMMM, YYYY',
	            LLL: 'D MMMM, YYYY LT',
	            LLLL: 'dddd, D MMMM, YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Today at] LT',
	            nextDay: '[Tomorrow at] LT',
	            nextWeek: 'dddd [at] LT',
	            lastDay: '[Yesterday at] LT',
	            lastWeek: '[Last] dddd [at] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'in %s',
	            past: '%s ago',
	            s: 'a few seconds',
	            m: 'a minute',
	            mm: '%d minutes',
	            h: 'an hour',
	            hh: '%d hours',
	            d: 'a day',
	            dd: '%d days',
	            M: 'a month',
	            MM: '%d months',
	            y: 'a year',
	            yy: '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal: function ordinal(number) {
	            var b = number % 10,
	                output = ~ ~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
	            return number + output;
	        }
	    });
	});

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : great britain english (en-gb)
	// author : Chris Gedrim : https://github.com/chrisgedrim

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('en-gb', {
	        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Today at] LT',
	            nextDay: '[Tomorrow at] LT',
	            nextWeek: 'dddd [at] LT',
	            lastDay: '[Yesterday at] LT',
	            lastWeek: '[Last] dddd [at] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'in %s',
	            past: '%s ago',
	            s: 'a few seconds',
	            m: 'a minute',
	            mm: '%d minutes',
	            h: 'an hour',
	            hh: '%d hours',
	            d: 'a day',
	            dd: '%d days',
	            M: 'a month',
	            MM: '%d months',
	            y: 'a year',
	            yy: '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal: function ordinal(number) {
	            var b = number % 10,
	                output = ~ ~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
	            return number + output;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : esperanto (eo)
	// author : Colin Dean : https://github.com/colindean
	// komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
	//          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('eo', {
	        months: 'januaro_februaro_marto_aprilo_majo_junio_julio_aŭgusto_septembro_oktobro_novembro_decembro'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aŭg_sep_okt_nov_dec'.split('_'),
	        weekdays: 'Dimanĉo_Lundo_Mardo_Merkredo_Ĵaŭdo_Vendredo_Sabato'.split('_'),
	        weekdaysShort: 'Dim_Lun_Mard_Merk_Ĵaŭ_Ven_Sab'.split('_'),
	        weekdaysMin: 'Di_Lu_Ma_Me_Ĵa_Ve_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'YYYY-MM-DD',
	            LL: 'D[-an de] MMMM, YYYY',
	            LLL: 'D[-an de] MMMM, YYYY LT',
	            LLLL: 'dddd, [la] D[-an de] MMMM, YYYY LT'
	        },
	        meridiemParse: /[ap]\.t\.m/i,
	        isPM: function isPM(input) {
	            return input.charAt(0).toLowerCase() === 'p';
	        },
	        meridiem: function meridiem(hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'p.t.m.' : 'P.T.M.';
	            } else {
	                return isLower ? 'a.t.m.' : 'A.T.M.';
	            }
	        },
	        calendar: {
	            sameDay: '[Hodiaŭ je] LT',
	            nextDay: '[Morgaŭ je] LT',
	            nextWeek: 'dddd [je] LT',
	            lastDay: '[Hieraŭ je] LT',
	            lastWeek: '[pasinta] dddd [je] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'je %s',
	            past: 'antaŭ %s',
	            s: 'sekundoj',
	            m: 'minuto',
	            mm: '%d minutoj',
	            h: 'horo',
	            hh: '%d horoj',
	            d: 'tago', //ne 'diurno', ĉar estas uzita por proksimumo
	            dd: '%d tagoj',
	            M: 'monato',
	            MM: '%d monatoj',
	            y: 'jaro',
	            yy: '%d jaroj'
	        },
	        ordinalParse: /\d{1,2}a/,
	        ordinal: '%da',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : spanish (es)
	// author : Julio Napurí : https://github.com/julionc

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
	        _monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');

	    return moment.defineLocale('es', {
	        months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
	        monthsShort: function monthsShort(m, format) {
	            if (/-MMM-/.test(format)) {
	                return _monthsShort[m.month()];
	            } else {
	                return monthsShortDot[m.month()];
	            }
	        },
	        weekdays: 'domingo_lunes_martes_miércoles_jueves_viernes_sábado'.split('_'),
	        weekdaysShort: 'dom._lun._mar._mié._jue._vie._sáb.'.split('_'),
	        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D [de] MMMM [de] YYYY',
	            LLL: 'D [de] MMMM [de] YYYY LT',
	            LLLL: 'dddd, D [de] MMMM [de] YYYY LT'
	        },
	        calendar: {
	            sameDay: function sameDay() {
	                return '[hoy a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
	            },
	            nextDay: function nextDay() {
	                return '[mañana a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
	            },
	            nextWeek: function nextWeek() {
	                return 'dddd [a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
	            },
	            lastDay: function lastDay() {
	                return '[ayer a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
	            },
	            lastWeek: function lastWeek() {
	                return '[el] dddd [pasado a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'en %s',
	            past: 'hace %s',
	            s: 'unos segundos',
	            m: 'un minuto',
	            mm: '%d minutos',
	            h: 'una hora',
	            hh: '%d horas',
	            d: 'un día',
	            dd: '%d días',
	            M: 'un mes',
	            MM: '%d meses',
	            y: 'un año',
	            yy: '%d años'
	        },
	        ordinalParse: /\d{1,2}º/,
	        ordinal: '%dº',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : estonian (et)
	// author : Henry Kehlmann : https://github.com/madhenry
	// improvements : Illimar Tambek : https://github.com/ragulka

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            's': ['mõne sekundi', 'mõni sekund', 'paar sekundit'],
	            'm': ['ühe minuti', 'üks minut'],
	            'mm': [number + ' minuti', number + ' minutit'],
	            'h': ['ühe tunni', 'tund aega', 'üks tund'],
	            'hh': [number + ' tunni', number + ' tundi'],
	            'd': ['ühe päeva', 'üks päev'],
	            'M': ['kuu aja', 'kuu aega', 'üks kuu'],
	            'MM': [number + ' kuu', number + ' kuud'],
	            'y': ['ühe aasta', 'aasta', 'üks aasta'],
	            'yy': [number + ' aasta', number + ' aastat']
	        };
	        if (withoutSuffix) {
	            return format[key][2] ? format[key][2] : format[key][1];
	        }
	        return isFuture ? format[key][0] : format[key][1];
	    }

	    return moment.defineLocale('et', {
	        months: 'jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
	        monthsShort: 'jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
	        weekdays: 'pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev'.split('_'),
	        weekdaysShort: 'P_E_T_K_N_R_L'.split('_'),
	        weekdaysMin: 'P_E_T_K_N_R_L'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Täna,] LT',
	            nextDay: '[Homme,] LT',
	            nextWeek: '[Järgmine] dddd LT',
	            lastDay: '[Eile,] LT',
	            lastWeek: '[Eelmine] dddd LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s pärast',
	            past: '%s tagasi',
	            s: processRelativeTime,
	            m: processRelativeTime,
	            mm: processRelativeTime,
	            h: processRelativeTime,
	            hh: processRelativeTime,
	            d: processRelativeTime,
	            dd: '%d päeva',
	            M: processRelativeTime,
	            MM: processRelativeTime,
	            y: processRelativeTime,
	            yy: processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : euskara (eu)
	// author : Eneko Illarramendi : https://github.com/eillarra

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('eu', {
	        months: 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
	        monthsShort: 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
	        weekdays: 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
	        weekdaysShort: 'ig._al._ar._az._og._ol._lr.'.split('_'),
	        weekdaysMin: 'ig_al_ar_az_og_ol_lr'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'YYYY-MM-DD',
	            LL: 'YYYY[ko] MMMM[ren] D[a]',
	            LLL: 'YYYY[ko] MMMM[ren] D[a] LT',
	            LLLL: 'dddd, YYYY[ko] MMMM[ren] D[a] LT',
	            l: 'YYYY-M-D',
	            ll: 'YYYY[ko] MMM D[a]',
	            lll: 'YYYY[ko] MMM D[a] LT',
	            llll: 'ddd, YYYY[ko] MMM D[a] LT'
	        },
	        calendar: {
	            sameDay: '[gaur] LT[etan]',
	            nextDay: '[bihar] LT[etan]',
	            nextWeek: 'dddd LT[etan]',
	            lastDay: '[atzo] LT[etan]',
	            lastWeek: '[aurreko] dddd LT[etan]',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s barru',
	            past: 'duela %s',
	            s: 'segundo batzuk',
	            m: 'minutu bat',
	            mm: '%d minutu',
	            h: 'ordu bat',
	            hh: '%d ordu',
	            d: 'egun bat',
	            dd: '%d egun',
	            M: 'hilabete bat',
	            MM: '%d hilabete',
	            y: 'urte bat',
	            yy: '%d urte'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Persian (fa)
	// author : Ebrahim Byagowi : https://github.com/ebraminio

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '۱',
	        '2': '۲',
	        '3': '۳',
	        '4': '۴',
	        '5': '۵',
	        '6': '۶',
	        '7': '۷',
	        '8': '۸',
	        '9': '۹',
	        '0': '۰'
	    },
	        numberMap = {
	        '۱': '1',
	        '۲': '2',
	        '۳': '3',
	        '۴': '4',
	        '۵': '5',
	        '۶': '6',
	        '۷': '7',
	        '۸': '8',
	        '۹': '9',
	        '۰': '0'
	    };

	    return moment.defineLocale('fa', {
	        months: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        monthsShort: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        weekdays: 'یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه'.split('_'),
	        weekdaysShort: 'یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه'.split('_'),
	        weekdaysMin: 'ی_د_س_چ_پ_ج_ش'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        meridiemParse: /قبل از ظهر|بعد از ظهر/,
	        isPM: function isPM(input) {
	            return /بعد از ظهر/.test(input);
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 12) {
	                return 'قبل از ظهر';
	            } else {
	                return 'بعد از ظهر';
	            }
	        },
	        calendar: {
	            sameDay: '[امروز ساعت] LT',
	            nextDay: '[فردا ساعت] LT',
	            nextWeek: 'dddd [ساعت] LT',
	            lastDay: '[دیروز ساعت] LT',
	            lastWeek: 'dddd [پیش] [ساعت] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'در %s',
	            past: '%s پیش',
	            s: 'چندین ثانیه',
	            m: 'یک دقیقه',
	            mm: '%d دقیقه',
	            h: 'یک ساعت',
	            hh: '%d ساعت',
	            d: 'یک روز',
	            dd: '%d روز',
	            M: 'یک ماه',
	            MM: '%d ماه',
	            y: 'یک سال',
	            yy: '%d سال'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[۰-۹]/g, function (match) {
	                return numberMap[match];
	            }).replace(/،/g, ',');
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '،');
	        },
	        ordinalParse: /\d{1,2}م/,
	        ordinal: '%dم',
	        week: {
	            dow: 6, // Saturday is the first day of the week.
	            doy: 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : finnish (fi)
	// author : Tarmo Aidantausta : https://github.com/bleadof

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var numbersPast = 'nolla yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän'.split(' '),
	        numbersFuture = ['nolla', 'yhden', 'kahden', 'kolmen', 'neljän', 'viiden', 'kuuden', numbersPast[7], numbersPast[8], numbersPast[9]];

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = '';
	        switch (key) {
	            case 's':
	                return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
	            case 'm':
	                return isFuture ? 'minuutin' : 'minuutti';
	            case 'mm':
	                result = isFuture ? 'minuutin' : 'minuuttia';
	                break;
	            case 'h':
	                return isFuture ? 'tunnin' : 'tunti';
	            case 'hh':
	                result = isFuture ? 'tunnin' : 'tuntia';
	                break;
	            case 'd':
	                return isFuture ? 'päivän' : 'päivä';
	            case 'dd':
	                result = isFuture ? 'päivän' : 'päivää';
	                break;
	            case 'M':
	                return isFuture ? 'kuukauden' : 'kuukausi';
	            case 'MM':
	                result = isFuture ? 'kuukauden' : 'kuukautta';
	                break;
	            case 'y':
	                return isFuture ? 'vuoden' : 'vuosi';
	            case 'yy':
	                result = isFuture ? 'vuoden' : 'vuotta';
	                break;
	        }
	        result = verbalNumber(number, isFuture) + ' ' + result;
	        return result;
	    }

	    function verbalNumber(number, isFuture) {
	        return number < 10 ? isFuture ? numbersFuture[number] : numbersPast[number] : number;
	    }

	    return moment.defineLocale('fi', {
	        months: 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
	        monthsShort: 'tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu'.split('_'),
	        weekdays: 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
	        weekdaysShort: 'su_ma_ti_ke_to_pe_la'.split('_'),
	        weekdaysMin: 'su_ma_ti_ke_to_pe_la'.split('_'),
	        longDateFormat: {
	            LT: 'HH.mm',
	            LTS: 'HH.mm.ss',
	            L: 'DD.MM.YYYY',
	            LL: 'Do MMMM[ta] YYYY',
	            LLL: 'Do MMMM[ta] YYYY, [klo] LT',
	            LLLL: 'dddd, Do MMMM[ta] YYYY, [klo] LT',
	            l: 'D.M.YYYY',
	            ll: 'Do MMM YYYY',
	            lll: 'Do MMM YYYY, [klo] LT',
	            llll: 'ddd, Do MMM YYYY, [klo] LT'
	        },
	        calendar: {
	            sameDay: '[tänään] [klo] LT',
	            nextDay: '[huomenna] [klo] LT',
	            nextWeek: 'dddd [klo] LT',
	            lastDay: '[eilen] [klo] LT',
	            lastWeek: '[viime] dddd[na] [klo] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s päästä',
	            past: '%s sitten',
	            s: translate,
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: translate,
	            dd: translate,
	            M: translate,
	            MM: translate,
	            y: translate,
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : faroese (fo)
	// author : Ragnar Johannesen : https://github.com/ragnar123

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('fo', {
	        months: 'januar_februar_mars_apríl_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays: 'sunnudagur_mánadagur_týsdagur_mikudagur_hósdagur_fríggjadagur_leygardagur'.split('_'),
	        weekdaysShort: 'sun_mán_týs_mik_hós_frí_ley'.split('_'),
	        weekdaysMin: 'su_má_tý_mi_hó_fr_le'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D. MMMM, YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Í dag kl.] LT',
	            nextDay: '[Í morgin kl.] LT',
	            nextWeek: 'dddd [kl.] LT',
	            lastDay: '[Í gjár kl.] LT',
	            lastWeek: '[síðstu] dddd [kl] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'um %s',
	            past: '%s síðani',
	            s: 'fá sekund',
	            m: 'ein minutt',
	            mm: '%d minuttir',
	            h: 'ein tími',
	            hh: '%d tímar',
	            d: 'ein dagur',
	            dd: '%d dagar',
	            M: 'ein mánaði',
	            MM: '%d mánaðir',
	            y: 'eitt ár',
	            yy: '%d ár'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : canadian french (fr-ca)
	// author : Jonathan Abourbih : https://github.com/jonbca

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('fr-ca', {
	        months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
	        monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
	        weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
	        weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
	        weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'YYYY-MM-DD',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Aujourd\'hui à] LT',
	            nextDay: '[Demain à] LT',
	            nextWeek: 'dddd [à] LT',
	            lastDay: '[Hier à] LT',
	            lastWeek: 'dddd [dernier à] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'dans %s',
	            past: 'il y a %s',
	            s: 'quelques secondes',
	            m: 'une minute',
	            mm: '%d minutes',
	            h: 'une heure',
	            hh: '%d heures',
	            d: 'un jour',
	            dd: '%d jours',
	            M: 'un mois',
	            MM: '%d mois',
	            y: 'un an',
	            yy: '%d ans'
	        },
	        ordinalParse: /\d{1,2}(er|)/,
	        ordinal: function ordinal(number) {
	            return number + (number === 1 ? 'er' : '');
	        }
	    });
	});

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : french (fr)
	// author : John Fischer : https://github.com/jfroffice

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('fr', {
	        months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
	        monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
	        weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
	        weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
	        weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Aujourd\'hui à] LT',
	            nextDay: '[Demain à] LT',
	            nextWeek: 'dddd [à] LT',
	            lastDay: '[Hier à] LT',
	            lastWeek: 'dddd [dernier à] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'dans %s',
	            past: 'il y a %s',
	            s: 'quelques secondes',
	            m: 'une minute',
	            mm: '%d minutes',
	            h: 'une heure',
	            hh: '%d heures',
	            d: 'un jour',
	            dd: '%d jours',
	            M: 'un mois',
	            MM: '%d mois',
	            y: 'un an',
	            yy: '%d ans'
	        },
	        ordinalParse: /\d{1,2}(er|)/,
	        ordinal: function ordinal(number) {
	            return number + (number === 1 ? 'er' : '');
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : frisian (fy)
	// author : Robin van der Vliet : https://github.com/robin0van0der0v

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'),
	        monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');

	    return moment.defineLocale('fy', {
	        months: 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
	        monthsShort: function monthsShort(m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShortWithoutDots[m.month()];
	            } else {
	                return monthsShortWithDots[m.month()];
	            }
	        },
	        weekdays: 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
	        weekdaysShort: 'si._mo._ti._wo._to._fr._so.'.split('_'),
	        weekdaysMin: 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD-MM-YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[hjoed om] LT',
	            nextDay: '[moarn om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[juster om] LT',
	            lastWeek: '[ôfrûne] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'oer %s',
	            past: '%s lyn',
	            s: 'in pear sekonden',
	            m: 'ien minút',
	            mm: '%d minuten',
	            h: 'ien oere',
	            hh: '%d oeren',
	            d: 'ien dei',
	            dd: '%d dagen',
	            M: 'ien moanne',
	            MM: '%d moannen',
	            y: 'ien jier',
	            yy: '%d jierren'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal: function ordinal(number) {
	            return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : galician (gl)
	// author : Juan G. Hurtado : https://github.com/juanghurtado

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('gl', {
	        months: 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xuño_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
	        monthsShort: 'Xan._Feb._Mar._Abr._Mai._Xuñ._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
	        weekdays: 'Domingo_Luns_Martes_Mércores_Xoves_Venres_Sábado'.split('_'),
	        weekdaysShort: 'Dom._Lun._Mar._Mér._Xov._Ven._Sáb.'.split('_'),
	        weekdaysMin: 'Do_Lu_Ma_Mé_Xo_Ve_Sá'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: function sameDay() {
	                return '[hoxe ' + (this.hours() !== 1 ? 'ás' : 'á') + '] LT';
	            },
	            nextDay: function nextDay() {
	                return '[mañá ' + (this.hours() !== 1 ? 'ás' : 'á') + '] LT';
	            },
	            nextWeek: function nextWeek() {
	                return 'dddd [' + (this.hours() !== 1 ? 'ás' : 'a') + '] LT';
	            },
	            lastDay: function lastDay() {
	                return '[onte ' + (this.hours() !== 1 ? 'á' : 'a') + '] LT';
	            },
	            lastWeek: function lastWeek() {
	                return '[o] dddd [pasado ' + (this.hours() !== 1 ? 'ás' : 'a') + '] LT';
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: function future(str) {
	                if (str === 'uns segundos') {
	                    return 'nuns segundos';
	                }
	                return 'en ' + str;
	            },
	            past: 'hai %s',
	            s: 'uns segundos',
	            m: 'un minuto',
	            mm: '%d minutos',
	            h: 'unha hora',
	            hh: '%d horas',
	            d: 'un día',
	            dd: '%d días',
	            M: 'un mes',
	            MM: '%d meses',
	            y: 'un ano',
	            yy: '%d anos'
	        },
	        ordinalParse: /\d{1,2}º/,
	        ordinal: '%dº',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Hebrew (he)
	// author : Tomer Cohen : https://github.com/tomer
	// author : Moshe Simantov : https://github.com/DevelopmentIL
	// author : Tal Ater : https://github.com/TalAter

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('he', {
	        months: 'ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר'.split('_'),
	        monthsShort: 'ינו׳_פבר׳_מרץ_אפר׳_מאי_יוני_יולי_אוג׳_ספט׳_אוק׳_נוב׳_דצמ׳'.split('_'),
	        weekdays: 'ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת'.split('_'),
	        weekdaysShort: 'א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳'.split('_'),
	        weekdaysMin: 'א_ב_ג_ד_ה_ו_ש'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D [ב]MMMM YYYY',
	            LLL: 'D [ב]MMMM YYYY LT',
	            LLLL: 'dddd, D [ב]MMMM YYYY LT',
	            l: 'D/M/YYYY',
	            ll: 'D MMM YYYY',
	            lll: 'D MMM YYYY LT',
	            llll: 'ddd, D MMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[היום ב־]LT',
	            nextDay: '[מחר ב־]LT',
	            nextWeek: 'dddd [בשעה] LT',
	            lastDay: '[אתמול ב־]LT',
	            lastWeek: '[ביום] dddd [האחרון בשעה] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'בעוד %s',
	            past: 'לפני %s',
	            s: 'מספר שניות',
	            m: 'דקה',
	            mm: '%d דקות',
	            h: 'שעה',
	            hh: function hh(number) {
	                if (number === 2) {
	                    return 'שעתיים';
	                }
	                return number + ' שעות';
	            },
	            d: 'יום',
	            dd: function dd(number) {
	                if (number === 2) {
	                    return 'יומיים';
	                }
	                return number + ' ימים';
	            },
	            M: 'חודש',
	            MM: function MM(number) {
	                if (number === 2) {
	                    return 'חודשיים';
	                }
	                return number + ' חודשים';
	            },
	            y: 'שנה',
	            yy: function yy(number) {
	                if (number === 2) {
	                    return 'שנתיים';
	                } else if (number % 10 === 0 && number !== 10) {
	                    return number + ' שנה';
	                }
	                return number + ' שנים';
	            }
	        }
	    });
	});

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : hindi (hi)
	// author : Mayank Singhal : https://github.com/mayanksinghal

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	        numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };

	    return moment.defineLocale('hi', {
	        months: 'जनवरी_फ़रवरी_मार्च_अप्रैल_मई_जून_जुलाई_अगस्त_सितम्बर_अक्टूबर_नवम्बर_दिसम्बर'.split('_'),
	        monthsShort: 'जन._फ़र._मार्च_अप्रै._मई_जून_जुल._अग._सित._अक्टू._नव._दिस.'.split('_'),
	        weekdays: 'रविवार_सोमवार_मंगलवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split('_'),
	        weekdaysShort: 'रवि_सोम_मंगल_बुध_गुरू_शुक्र_शनि'.split('_'),
	        weekdaysMin: 'र_सो_मं_बु_गु_शु_श'.split('_'),
	        longDateFormat: {
	            LT: 'A h:mm बजे',
	            LTS: 'A h:mm:ss बजे',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY, LT',
	            LLLL: 'dddd, D MMMM YYYY, LT'
	        },
	        calendar: {
	            sameDay: '[आज] LT',
	            nextDay: '[कल] LT',
	            nextWeek: 'dddd, LT',
	            lastDay: '[कल] LT',
	            lastWeek: '[पिछले] dddd, LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s में',
	            past: '%s पहले',
	            s: 'कुछ ही क्षण',
	            m: 'एक मिनट',
	            mm: '%d मिनट',
	            h: 'एक घंटा',
	            hh: '%d घंटे',
	            d: 'एक दिन',
	            dd: '%d दिन',
	            M: 'एक महीने',
	            MM: '%d महीने',
	            y: 'एक वर्ष',
	            yy: '%d वर्ष'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
	        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
	        meridiemParse: /रात|सुबह|दोपहर|शाम/,
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'रात') {
	                return hour < 4 ? hour : hour + 12;
	            } else if (meridiem === 'सुबह') {
	                return hour;
	            } else if (meridiem === 'दोपहर') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === 'शाम') {
	                return hour + 12;
	            }
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'रात';
	            } else if (hour < 10) {
	                return 'सुबह';
	            } else if (hour < 17) {
	                return 'दोपहर';
	            } else if (hour < 20) {
	                return 'शाम';
	            } else {
	                return 'रात';
	            }
	        },
	        week: {
	            dow: 0, // Sunday is the first day of the week.
	            doy: 6 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : hrvatski (hr)
	// author : Bojan Marković : https://github.com/bmarkovic

	// based on (sl) translation by Robert Sedovšek

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	            case 'm':
	                return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	            case 'mm':
	                if (number === 1) {
	                    result += 'minuta';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'minute';
	                } else {
	                    result += 'minuta';
	                }
	                return result;
	            case 'h':
	                return withoutSuffix ? 'jedan sat' : 'jednog sata';
	            case 'hh':
	                if (number === 1) {
	                    result += 'sat';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'sata';
	                } else {
	                    result += 'sati';
	                }
	                return result;
	            case 'dd':
	                if (number === 1) {
	                    result += 'dan';
	                } else {
	                    result += 'dana';
	                }
	                return result;
	            case 'MM':
	                if (number === 1) {
	                    result += 'mjesec';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'mjeseca';
	                } else {
	                    result += 'mjeseci';
	                }
	                return result;
	            case 'yy':
	                if (number === 1) {
	                    result += 'godina';
	                } else if (number === 2 || number === 3 || number === 4) {
	                    result += 'godine';
	                } else {
	                    result += 'godina';
	                }
	                return result;
	        }
	    }

	    return moment.defineLocale('hr', {
	        months: 'sječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
	        monthsShort: 'sje._vel._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
	        weekdays: 'nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota'.split('_'),
	        weekdaysShort: 'ned._pon._uto._sri._čet._pet._sub.'.split('_'),
	        weekdaysMin: 'ne_po_ut_sr_če_pe_su'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[danas u] LT',
	            nextDay: '[sutra u] LT',

	            nextWeek: function nextWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[u] [nedjelju] [u] LT';
	                    case 3:
	                        return '[u] [srijedu] [u] LT';
	                    case 6:
	                        return '[u] [subotu] [u] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[u] dddd [u] LT';
	                }
	            },
	            lastDay: '[jučer u] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                    case 3:
	                        return '[prošlu] dddd [u] LT';
	                    case 6:
	                        return '[prošle] [subote] [u] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[prošli] dddd [u] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'za %s',
	            past: 'prije %s',
	            s: 'par sekundi',
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: 'dan',
	            dd: translate,
	            M: 'mjesec',
	            MM: translate,
	            y: 'godinu',
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : hungarian (hu)
	// author : Adam Brunner : https://github.com/adambrunner

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var weekEndings = 'vasárnap hétfőn kedden szerdán csütörtökön pénteken szombaton'.split(' ');

	    function translate(number, withoutSuffix, key, isFuture) {
	        var num = number,
	            suffix;

	        switch (key) {
	            case 's':
	                return isFuture || withoutSuffix ? 'néhány másodperc' : 'néhány másodperce';
	            case 'm':
	                return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
	            case 'mm':
	                return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
	            case 'h':
	                return 'egy' + (isFuture || withoutSuffix ? ' óra' : ' órája');
	            case 'hh':
	                return num + (isFuture || withoutSuffix ? ' óra' : ' órája');
	            case 'd':
	                return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
	            case 'dd':
	                return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
	            case 'M':
	                return 'egy' + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
	            case 'MM':
	                return num + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
	            case 'y':
	                return 'egy' + (isFuture || withoutSuffix ? ' év' : ' éve');
	            case 'yy':
	                return num + (isFuture || withoutSuffix ? ' év' : ' éve');
	        }

	        return '';
	    }

	    function week(isFuture) {
	        return (isFuture ? '' : '[múlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
	    }

	    return moment.defineLocale('hu', {
	        months: 'január_február_március_április_május_június_július_augusztus_szeptember_október_november_december'.split('_'),
	        monthsShort: 'jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec'.split('_'),
	        weekdays: 'vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat'.split('_'),
	        weekdaysShort: 'vas_hét_kedd_sze_csüt_pén_szo'.split('_'),
	        weekdaysMin: 'v_h_k_sze_cs_p_szo'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'YYYY.MM.DD.',
	            LL: 'YYYY. MMMM D.',
	            LLL: 'YYYY. MMMM D., LT',
	            LLLL: 'YYYY. MMMM D., dddd LT'
	        },
	        meridiemParse: /de|du/i,
	        isPM: function isPM(input) {
	            return input.charAt(1).toLowerCase() === 'u';
	        },
	        meridiem: function meridiem(hours, minutes, isLower) {
	            if (hours < 12) {
	                return isLower === true ? 'de' : 'DE';
	            } else {
	                return isLower === true ? 'du' : 'DU';
	            }
	        },
	        calendar: {
	            sameDay: '[ma] LT[-kor]',
	            nextDay: '[holnap] LT[-kor]',
	            nextWeek: function nextWeek() {
	                return week.call(this, true);
	            },
	            lastDay: '[tegnap] LT[-kor]',
	            lastWeek: function lastWeek() {
	                return week.call(this, false);
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s múlva',
	            past: '%s',
	            s: translate,
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: translate,
	            dd: translate,
	            M: translate,
	            MM: translate,
	            y: translate,
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Armenian (hy-am)
	// author : Armendarabyan : https://github.com/armendarabyan

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'հունվար_փետրվար_մարտ_ապրիլ_մայիս_հունիս_հուլիս_օգոստոս_սեպտեմբեր_հոկտեմբեր_նոյեմբեր_դեկտեմբեր'.split('_'),
	            'accusative': 'հունվարի_փետրվարի_մարտի_ապրիլի_մայիսի_հունիսի_հուլիսի_օգոստոսի_սեպտեմբերի_հոկտեմբերի_նոյեմբերի_դեկտեմբերի'.split('_')
	        },
	            nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';

	        return months[nounCase][m.month()];
	    }

	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = 'հնվ_փտր_մրտ_ապր_մյս_հնս_հլս_օգս_սպտ_հկտ_նմբ_դկտ'.split('_');

	        return monthsShort[m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = 'կիրակի_երկուշաբթի_երեքշաբթի_չորեքշաբթի_հինգշաբթի_ուրբաթ_շաբաթ'.split('_');

	        return weekdays[m.day()];
	    }

	    return moment.defineLocale('hy-am', {
	        months: monthsCaseReplace,
	        monthsShort: monthsShortCaseReplace,
	        weekdays: weekdaysCaseReplace,
	        weekdaysShort: 'կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ'.split('_'),
	        weekdaysMin: 'կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY թ.',
	            LLL: 'D MMMM YYYY թ., LT',
	            LLLL: 'dddd, D MMMM YYYY թ., LT'
	        },
	        calendar: {
	            sameDay: '[այսօր] LT',
	            nextDay: '[վաղը] LT',
	            lastDay: '[երեկ] LT',
	            nextWeek: function nextWeek() {
	                return 'dddd [օրը ժամը] LT';
	            },
	            lastWeek: function lastWeek() {
	                return '[անցած] dddd [օրը ժամը] LT';
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s հետո',
	            past: '%s առաջ',
	            s: 'մի քանի վայրկյան',
	            m: 'րոպե',
	            mm: '%d րոպե',
	            h: 'ժամ',
	            hh: '%d ժամ',
	            d: 'օր',
	            dd: '%d օր',
	            M: 'ամիս',
	            MM: '%d ամիս',
	            y: 'տարի',
	            yy: '%d տարի'
	        },

	        meridiemParse: /գիշերվա|առավոտվա|ցերեկվա|երեկոյան/,
	        isPM: function isPM(input) {
	            return /^(ցերեկվա|երեկոյան)$/.test(input);
	        },
	        meridiem: function meridiem(hour) {
	            if (hour < 4) {
	                return 'գիշերվա';
	            } else if (hour < 12) {
	                return 'առավոտվա';
	            } else if (hour < 17) {
	                return 'ցերեկվա';
	            } else {
	                return 'երեկոյան';
	            }
	        },

	        ordinalParse: /\d{1,2}|\d{1,2}-(ին|րդ)/,
	        ordinal: function ordinal(number, period) {
	            switch (period) {
	                case 'DDD':
	                case 'w':
	                case 'W':
	                case 'DDDo':
	                    if (number === 1) {
	                        return number + '-ին';
	                    }
	                    return number + '-րդ';
	                default:
	                    return number;
	            }
	        },

	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Bahasa Indonesia (id)
	// author : Mohammad Satrio Utomo : https://github.com/tyok
	// reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('id', {
	        months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
	        monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
	        weekdays: 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
	        weekdaysShort: 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
	        weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
	        longDateFormat: {
	            LT: 'HH.mm',
	            LTS: 'LT.ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY [pukul] LT',
	            LLLL: 'dddd, D MMMM YYYY [pukul] LT'
	        },
	        meridiemParse: /pagi|siang|sore|malam/,
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'pagi') {
	                return hour;
	            } else if (meridiem === 'siang') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'sore' || meridiem === 'malam') {
	                return hour + 12;
	            }
	        },
	        meridiem: function meridiem(hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'siang';
	            } else if (hours < 19) {
	                return 'sore';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar: {
	            sameDay: '[Hari ini pukul] LT',
	            nextDay: '[Besok pukul] LT',
	            nextWeek: 'dddd [pukul] LT',
	            lastDay: '[Kemarin pukul] LT',
	            lastWeek: 'dddd [lalu pukul] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'dalam %s',
	            past: '%s yang lalu',
	            s: 'beberapa detik',
	            m: 'semenit',
	            mm: '%d menit',
	            h: 'sejam',
	            hh: '%d jam',
	            d: 'sehari',
	            dd: '%d hari',
	            M: 'sebulan',
	            MM: '%d bulan',
	            y: 'setahun',
	            yy: '%d tahun'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : icelandic (is)
	// author : Hinrik Örn Sigurðsson : https://github.com/hinrik

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function plural(n) {
	        if (n % 100 === 11) {
	            return true;
	        } else if (n % 10 === 1) {
	            return false;
	        }
	        return true;
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	            case 's':
	                return withoutSuffix || isFuture ? 'nokkrar sekúndur' : 'nokkrum sekúndum';
	            case 'm':
	                return withoutSuffix ? 'mínúta' : 'mínútu';
	            case 'mm':
	                if (plural(number)) {
	                    return result + (withoutSuffix || isFuture ? 'mínútur' : 'mínútum');
	                } else if (withoutSuffix) {
	                    return result + 'mínúta';
	                }
	                return result + 'mínútu';
	            case 'hh':
	                if (plural(number)) {
	                    return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
	                }
	                return result + 'klukkustund';
	            case 'd':
	                if (withoutSuffix) {
	                    return 'dagur';
	                }
	                return isFuture ? 'dag' : 'degi';
	            case 'dd':
	                if (plural(number)) {
	                    if (withoutSuffix) {
	                        return result + 'dagar';
	                    }
	                    return result + (isFuture ? 'daga' : 'dögum');
	                } else if (withoutSuffix) {
	                    return result + 'dagur';
	                }
	                return result + (isFuture ? 'dag' : 'degi');
	            case 'M':
	                if (withoutSuffix) {
	                    return 'mánuður';
	                }
	                return isFuture ? 'mánuð' : 'mánuði';
	            case 'MM':
	                if (plural(number)) {
	                    if (withoutSuffix) {
	                        return result + 'mánuðir';
	                    }
	                    return result + (isFuture ? 'mánuði' : 'mánuðum');
	                } else if (withoutSuffix) {
	                    return result + 'mánuður';
	                }
	                return result + (isFuture ? 'mánuð' : 'mánuði');
	            case 'y':
	                return withoutSuffix || isFuture ? 'ár' : 'ári';
	            case 'yy':
	                if (plural(number)) {
	                    return result + (withoutSuffix || isFuture ? 'ár' : 'árum');
	                }
	                return result + (withoutSuffix || isFuture ? 'ár' : 'ári');
	        }
	    }

	    return moment.defineLocale('is', {
	        months: 'janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des'.split('_'),
	        weekdays: 'sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur'.split('_'),
	        weekdaysShort: 'sun_mán_þri_mið_fim_fös_lau'.split('_'),
	        weekdaysMin: 'Su_Má_Þr_Mi_Fi_Fö_La'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY [kl.] LT',
	            LLLL: 'dddd, D. MMMM YYYY [kl.] LT'
	        },
	        calendar: {
	            sameDay: '[í dag kl.] LT',
	            nextDay: '[á morgun kl.] LT',
	            nextWeek: 'dddd [kl.] LT',
	            lastDay: '[í gær kl.] LT',
	            lastWeek: '[síðasta] dddd [kl.] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'eftir %s',
	            past: 'fyrir %s síðan',
	            s: translate,
	            m: translate,
	            mm: translate,
	            h: 'klukkustund',
	            hh: translate,
	            d: translate,
	            dd: translate,
	            M: translate,
	            MM: translate,
	            y: translate,
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : italian (it)
	// author : Lorenzo : https://github.com/aliem
	// author: Mattia Larentis: https://github.com/nostalgiaz

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('it', {
	        months: 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
	        monthsShort: 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
	        weekdays: 'Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato'.split('_'),
	        weekdaysShort: 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
	        weekdaysMin: 'D_L_Ma_Me_G_V_S'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Oggi alle] LT',
	            nextDay: '[Domani alle] LT',
	            nextWeek: 'dddd [alle] LT',
	            lastDay: '[Ieri alle] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[la scorsa] dddd [alle] LT';
	                    default:
	                        return '[lo scorso] dddd [alle] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: function future(s) {
	                return (/^[0-9].+$/.test(s) ? 'tra' : 'in') + ' ' + s;
	            },
	            past: '%s fa',
	            s: 'alcuni secondi',
	            m: 'un minuto',
	            mm: '%d minuti',
	            h: 'un\'ora',
	            hh: '%d ore',
	            d: 'un giorno',
	            dd: '%d giorni',
	            M: 'un mese',
	            MM: '%d mesi',
	            y: 'un anno',
	            yy: '%d anni'
	        },
	        ordinalParse: /\d{1,2}º/,
	        ordinal: '%dº',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : japanese (ja)
	// author : LI Long : https://github.com/baryon

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('ja', {
	        months: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        weekdays: '日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日'.split('_'),
	        weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
	        weekdaysMin: '日_月_火_水_木_金_土'.split('_'),
	        longDateFormat: {
	            LT: 'Ah時m分',
	            LTS: 'LTs秒',
	            L: 'YYYY/MM/DD',
	            LL: 'YYYY年M月D日',
	            LLL: 'YYYY年M月D日LT',
	            LLLL: 'YYYY年M月D日LT dddd'
	        },
	        meridiemParse: /午前|午後/i,
	        isPM: function isPM(input) {
	            return input === '午後';
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 12) {
	                return '午前';
	            } else {
	                return '午後';
	            }
	        },
	        calendar: {
	            sameDay: '[今日] LT',
	            nextDay: '[明日] LT',
	            nextWeek: '[来週]dddd LT',
	            lastDay: '[昨日] LT',
	            lastWeek: '[前週]dddd LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s後',
	            past: '%s前',
	            s: '数秒',
	            m: '1分',
	            mm: '%d分',
	            h: '1時間',
	            hh: '%d時間',
	            d: '1日',
	            dd: '%d日',
	            M: '1ヶ月',
	            MM: '%dヶ月',
	            y: '1年',
	            yy: '%d年'
	        }
	    });
	});

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Georgian (ka)
	// author : Irakli Janiashvili : https://github.com/irakli-janiashvili

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'იანვარი_თებერვალი_მარტი_აპრილი_მაისი_ივნისი_ივლისი_აგვისტო_სექტემბერი_ოქტომბერი_ნოემბერი_დეკემბერი'.split('_'),
	            'accusative': 'იანვარს_თებერვალს_მარტს_აპრილის_მაისს_ივნისს_ივლისს_აგვისტს_სექტემბერს_ოქტომბერს_ნოემბერს_დეკემბერს'.split('_')
	        },
	            nounCase = /D[oD] *MMMM?/.test(format) ? 'accusative' : 'nominative';

	        return months[nounCase][m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'კვირა_ორშაბათი_სამშაბათი_ოთხშაბათი_ხუთშაბათი_პარასკევი_შაბათი'.split('_'),
	            'accusative': 'კვირას_ორშაბათს_სამშაბათს_ოთხშაბათს_ხუთშაბათს_პარასკევს_შაბათს'.split('_')
	        },
	            nounCase = /(წინა|შემდეგ)/.test(format) ? 'accusative' : 'nominative';

	        return weekdays[nounCase][m.day()];
	    }

	    return moment.defineLocale('ka', {
	        months: monthsCaseReplace,
	        monthsShort: 'იან_თებ_მარ_აპრ_მაი_ივნ_ივლ_აგვ_სექ_ოქტ_ნოე_დეკ'.split('_'),
	        weekdays: weekdaysCaseReplace,
	        weekdaysShort: 'კვი_ორშ_სამ_ოთხ_ხუთ_პარ_შაბ'.split('_'),
	        weekdaysMin: 'კვ_ორ_სა_ოთ_ხუ_პა_შა'.split('_'),
	        longDateFormat: {
	            LT: 'h:mm A',
	            LTS: 'h:mm:ss A',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[დღეს] LT[-ზე]',
	            nextDay: '[ხვალ] LT[-ზე]',
	            lastDay: '[გუშინ] LT[-ზე]',
	            nextWeek: '[შემდეგ] dddd LT[-ზე]',
	            lastWeek: '[წინა] dddd LT-ზე',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: function future(s) {
	                return /(წამი|წუთი|საათი|წელი)/.test(s) ? s.replace(/ი$/, 'ში') : s + 'ში';
	            },
	            past: function past(s) {
	                if (/(წამი|წუთი|საათი|დღე|თვე)/.test(s)) {
	                    return s.replace(/(ი|ე)$/, 'ის წინ');
	                }
	                if (/წელი/.test(s)) {
	                    return s.replace(/წელი$/, 'წლის წინ');
	                }
	            },
	            s: 'რამდენიმე წამი',
	            m: 'წუთი',
	            mm: '%d წუთი',
	            h: 'საათი',
	            hh: '%d საათი',
	            d: 'დღე',
	            dd: '%d დღე',
	            M: 'თვე',
	            MM: '%d თვე',
	            y: 'წელი',
	            yy: '%d წელი'
	        },
	        ordinalParse: /0|1-ლი|მე-\d{1,2}|\d{1,2}-ე/,
	        ordinal: function ordinal(number) {
	            if (number === 0) {
	                return number;
	            }

	            if (number === 1) {
	                return number + '-ლი';
	            }

	            if (number < 20 || number <= 100 && number % 20 === 0 || number % 100 === 0) {
	                return 'მე-' + number;
	            }

	            return number + '-ე';
	        },
	        week: {
	            dow: 1,
	            doy: 7
	        }
	    });
	});

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : khmer (km)
	// author : Kruy Vanna : https://github.com/kruyvanna

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('km', {
	        months: 'មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ'.split('_'),
	        monthsShort: 'មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ'.split('_'),
	        weekdays: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
	        weekdaysShort: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
	        weekdaysMin: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[ថ្ងៃនៈ ម៉ោង] LT',
	            nextDay: '[ស្អែក ម៉ោង] LT',
	            nextWeek: 'dddd [ម៉ោង] LT',
	            lastDay: '[ម្សិលមិញ ម៉ោង] LT',
	            lastWeek: 'dddd [សប្តាហ៍មុន] [ម៉ោង] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%sទៀត',
	            past: '%sមុន',
	            s: 'ប៉ុន្មានវិនាទី',
	            m: 'មួយនាទី',
	            mm: '%d នាទី',
	            h: 'មួយម៉ោង',
	            hh: '%d ម៉ោង',
	            d: 'មួយថ្ងៃ',
	            dd: '%d ថ្ងៃ',
	            M: 'មួយខែ',
	            MM: '%d ខែ',
	            y: 'មួយឆ្នាំ',
	            yy: '%d ឆ្នាំ'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : korean (ko)
	//
	// authors
	//
	// - Kyungwook, Park : https://github.com/kyungw00k
	// - Jeeeyul Lee <jeeeyul@gmail.com>
	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('ko', {
	        months: '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
	        monthsShort: '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
	        weekdays: '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
	        weekdaysShort: '일_월_화_수_목_금_토'.split('_'),
	        weekdaysMin: '일_월_화_수_목_금_토'.split('_'),
	        longDateFormat: {
	            LT: 'A h시 m분',
	            LTS: 'A h시 m분 s초',
	            L: 'YYYY.MM.DD',
	            LL: 'YYYY년 MMMM D일',
	            LLL: 'YYYY년 MMMM D일 LT',
	            LLLL: 'YYYY년 MMMM D일 dddd LT'
	        },
	        calendar: {
	            sameDay: '오늘 LT',
	            nextDay: '내일 LT',
	            nextWeek: 'dddd LT',
	            lastDay: '어제 LT',
	            lastWeek: '지난주 dddd LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s 후',
	            past: '%s 전',
	            s: '몇초',
	            ss: '%d초',
	            m: '일분',
	            mm: '%d분',
	            h: '한시간',
	            hh: '%d시간',
	            d: '하루',
	            dd: '%d일',
	            M: '한달',
	            MM: '%d달',
	            y: '일년',
	            yy: '%d년'
	        },
	        ordinalParse: /\d{1,2}일/,
	        ordinal: '%d일',
	        meridiemParse: /오전|오후/,
	        isPM: function isPM(token) {
	            return token === '오후';
	        },
	        meridiem: function meridiem(hour, minute, isUpper) {
	            return hour < 12 ? '오전' : '오후';
	        }
	    });
	});

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Luxembourgish (lb)
	// author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz

	// Note: Luxembourgish has a very particular phonological rule ('Eifeler Regel') that causes the
	// deletion of the final 'n' in certain contexts. That's what the 'eifelerRegelAppliesToWeekday'
	// and 'eifelerRegelAppliesToNumber' methods are meant for

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eng Minutt', 'enger Minutt'],
	            'h': ['eng Stonn', 'enger Stonn'],
	            'd': ['een Dag', 'engem Dag'],
	            'M': ['ee Mount', 'engem Mount'],
	            'y': ['ee Joer', 'engem Joer']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }

	    function processFutureTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return 'a ' + string;
	        }
	        return 'an ' + string;
	    }

	    function processPastTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return 'viru ' + string;
	        }
	        return 'virun ' + string;
	    }

	    /**
	     * Returns true if the word before the given number loses the '-n' ending.
	     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
	     *
	     * @param number {integer}
	     * @returns {boolean}
	     */
	    function eifelerRegelAppliesToNumber(_x) {
	        var _again = true;

	        _function: while (_again) {
	            var number = _x;
	            lastDigit = firstDigit = undefined;
	            _again = false;

	            number = parseInt(number, 10);
	            if (isNaN(number)) {
	                return false;
	            }
	            if (number < 0) {
	                // Negative Number --> always true
	                return true;
	            } else if (number < 10) {
	                // Only 1 digit
	                if (4 <= number && number <= 7) {
	                    return true;
	                }
	                return false;
	            } else if (number < 100) {
	                // 2 digits
	                var lastDigit = number % 10,
	                    firstDigit = number / 10;
	                if (lastDigit === 0) {
	                    _x = firstDigit;
	                    _again = true;
	                    continue _function;
	                }
	                _x = lastDigit;
	                _again = true;
	                continue _function;
	            } else if (number < 10000) {
	                // 3 or 4 digits --> recursively check first digit
	                while (number >= 10) {
	                    number = number / 10;
	                }
	                _x = number;
	                _again = true;
	                continue _function;
	            } else {
	                // Anything larger than 4 digits: recursively check first n-3 digits
	                number = number / 1000;
	                _x = number;
	                _again = true;
	                continue _function;
	            }
	        }
	    }

	    return moment.defineLocale('lb', {
	        months: 'Januar_Februar_Mäerz_Abrëll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays: 'Sonndeg_Méindeg_Dënschdeg_Mëttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
	        weekdaysShort: 'So._Mé._Dë._Më._Do._Fr._Sa.'.split('_'),
	        weekdaysMin: 'So_Mé_Dë_Më_Do_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm [Auer]',
	            LTS: 'H:mm:ss [Auer]',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Haut um] LT',
	            sameElse: 'L',
	            nextDay: '[Muer um] LT',
	            nextWeek: 'dddd [um] LT',
	            lastDay: '[Gëschter um] LT',
	            lastWeek: function lastWeek() {
	                // Different date string for 'Dënschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
	                switch (this.day()) {
	                    case 2:
	                    case 4:
	                        return '[Leschten] dddd [um] LT';
	                    default:
	                        return '[Leschte] dddd [um] LT';
	                }
	            }
	        },
	        relativeTime: {
	            future: processFutureTime,
	            past: processPastTime,
	            s: 'e puer Sekonnen',
	            m: processRelativeTime,
	            mm: '%d Minutten',
	            h: processRelativeTime,
	            hh: '%d Stonnen',
	            d: processRelativeTime,
	            dd: '%d Deeg',
	            M: processRelativeTime,
	            MM: '%d Méint',
	            y: processRelativeTime,
	            yy: '%d Joer'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Lithuanian (lt)
	// author : Mindaugas Mozūras : https://github.com/mmozuras

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var units = {
	        'm': 'minutė_minutės_minutę',
	        'mm': 'minutės_minučių_minutes',
	        'h': 'valanda_valandos_valandą',
	        'hh': 'valandos_valandų_valandas',
	        'd': 'diena_dienos_dieną',
	        'dd': 'dienos_dienų_dienas',
	        'M': 'mėnuo_mėnesio_mėnesį',
	        'MM': 'mėnesiai_mėnesių_mėnesius',
	        'y': 'metai_metų_metus',
	        'yy': 'metai_metų_metus'
	    },
	        weekDays = 'sekmadienis_pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis'.split('_');

	    function translateSeconds(number, withoutSuffix, key, isFuture) {
	        if (withoutSuffix) {
	            return 'kelios sekundės';
	        } else {
	            return isFuture ? 'kelių sekundžių' : 'kelias sekundes';
	        }
	    }

	    function translateSingular(number, withoutSuffix, key, isFuture) {
	        return withoutSuffix ? forms(key)[0] : isFuture ? forms(key)[1] : forms(key)[2];
	    }

	    function special(number) {
	        return number % 10 === 0 || number > 10 && number < 20;
	    }

	    function forms(key) {
	        return units[key].split('_');
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        if (number === 1) {
	            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
	        } else if (withoutSuffix) {
	            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
	        } else {
	            if (isFuture) {
	                return result + forms(key)[1];
	            } else {
	                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
	            }
	        }
	    }

	    function relativeWeekDay(moment, format) {
	        var nominative = format.indexOf('dddd HH:mm') === -1,
	            weekDay = weekDays[moment.day()];

	        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + 'į';
	    }

	    return moment.defineLocale('lt', {
	        months: 'sausio_vasario_kovo_balandžio_gegužės_birželio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio'.split('_'),
	        monthsShort: 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
	        weekdays: relativeWeekDay,
	        weekdaysShort: 'Sek_Pir_Ant_Tre_Ket_Pen_Šeš'.split('_'),
	        weekdaysMin: 'S_P_A_T_K_Pn_Š'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'YYYY-MM-DD',
	            LL: 'YYYY [m.] MMMM D [d.]',
	            LLL: 'YYYY [m.] MMMM D [d.], LT [val.]',
	            LLLL: 'YYYY [m.] MMMM D [d.], dddd, LT [val.]',
	            l: 'YYYY-MM-DD',
	            ll: 'YYYY [m.] MMMM D [d.]',
	            lll: 'YYYY [m.] MMMM D [d.], LT [val.]',
	            llll: 'YYYY [m.] MMMM D [d.], ddd, LT [val.]'
	        },
	        calendar: {
	            sameDay: '[Šiandien] LT',
	            nextDay: '[Rytoj] LT',
	            nextWeek: 'dddd LT',
	            lastDay: '[Vakar] LT',
	            lastWeek: '[Praėjusį] dddd LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'po %s',
	            past: 'prieš %s',
	            s: translateSeconds,
	            m: translateSingular,
	            mm: translate,
	            h: translateSingular,
	            hh: translate,
	            d: translateSingular,
	            dd: translate,
	            M: translateSingular,
	            MM: translate,
	            y: translateSingular,
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}-oji/,
	        ordinal: function ordinal(number) {
	            return number + '-oji';
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : latvian (lv)
	// author : Kristaps Karlsons : https://github.com/skakri

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var units = {
	        'mm': 'minūti_minūtes_minūte_minūtes',
	        'hh': 'stundu_stundas_stunda_stundas',
	        'dd': 'dienu_dienas_diena_dienas',
	        'MM': 'mēnesi_mēnešus_mēnesis_mēneši',
	        'yy': 'gadu_gadus_gads_gadi'
	    };

	    function format(word, number, withoutSuffix) {
	        var forms = word.split('_');
	        if (withoutSuffix) {
	            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
	        } else {
	            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
	        }
	    }

	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        return number + ' ' + format(units[key], number, withoutSuffix);
	    }

	    return moment.defineLocale('lv', {
	        months: 'janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec'.split('_'),
	        weekdays: 'svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena'.split('_'),
	        weekdaysShort: 'Sv_P_O_T_C_Pk_S'.split('_'),
	        weekdaysMin: 'Sv_P_O_T_C_Pk_S'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'YYYY. [gada] D. MMMM',
	            LLL: 'YYYY. [gada] D. MMMM, LT',
	            LLLL: 'YYYY. [gada] D. MMMM, dddd, LT'
	        },
	        calendar: {
	            sameDay: '[Šodien pulksten] LT',
	            nextDay: '[Rīt pulksten] LT',
	            nextWeek: 'dddd [pulksten] LT',
	            lastDay: '[Vakar pulksten] LT',
	            lastWeek: '[Pagājušā] dddd [pulksten] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s vēlāk',
	            past: '%s agrāk',
	            s: 'dažas sekundes',
	            m: 'minūti',
	            mm: relativeTimeWithPlural,
	            h: 'stundu',
	            hh: relativeTimeWithPlural,
	            d: 'dienu',
	            dd: relativeTimeWithPlural,
	            M: 'mēnesi',
	            MM: relativeTimeWithPlural,
	            y: 'gadu',
	            yy: relativeTimeWithPlural
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : macedonian (mk)
	// author : Borislav Mickov : https://github.com/B0k0

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('mk', {
	        months: 'јануари_февруари_март_април_мај_јуни_јули_август_септември_октомври_ноември_декември'.split('_'),
	        monthsShort: 'јан_фев_мар_апр_мај_јун_јул_авг_сеп_окт_ное_дек'.split('_'),
	        weekdays: 'недела_понеделник_вторник_среда_четврток_петок_сабота'.split('_'),
	        weekdaysShort: 'нед_пон_вто_сре_чет_пет_саб'.split('_'),
	        weekdaysMin: 'нe_пo_вт_ср_че_пе_сa'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'D.MM.YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Денес во] LT',
	            nextDay: '[Утре во] LT',
	            nextWeek: 'dddd [во] LT',
	            lastDay: '[Вчера во] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                    case 3:
	                    case 6:
	                        return '[Во изминатата] dddd [во] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[Во изминатиот] dddd [во] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'после %s',
	            past: 'пред %s',
	            s: 'неколку секунди',
	            m: 'минута',
	            mm: '%d минути',
	            h: 'час',
	            hh: '%d часа',
	            d: 'ден',
	            dd: '%d дена',
	            M: 'месец',
	            MM: '%d месеци',
	            y: 'година',
	            yy: '%d години'
	        },
	        ordinalParse: /\d{1,2}-(ев|ен|ти|ви|ри|ми)/,
	        ordinal: function ordinal(number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-ев';
	            } else if (last2Digits === 0) {
	                return number + '-ен';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-ти';
	            } else if (lastDigit === 1) {
	                return number + '-ви';
	            } else if (lastDigit === 2) {
	                return number + '-ри';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-ми';
	            } else {
	                return number + '-ти';
	            }
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : malayalam (ml)
	// author : Floyd Pink : https://github.com/floydpink

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('ml', {
	        months: 'ജനുവരി_ഫെബ്രുവരി_മാർച്ച്_ഏപ്രിൽ_മേയ്_ജൂൺ_ജൂലൈ_ഓഗസ്റ്റ്_സെപ്റ്റംബർ_ഒക്ടോബർ_നവംബർ_ഡിസംബർ'.split('_'),
	        monthsShort: 'ജനു._ഫെബ്രു._മാർ._ഏപ്രി._മേയ്_ജൂൺ_ജൂലൈ._ഓഗ._സെപ്റ്റ._ഒക്ടോ._നവം._ഡിസം.'.split('_'),
	        weekdays: 'ഞായറാഴ്ച_തിങ്കളാഴ്ച_ചൊവ്വാഴ്ച_ബുധനാഴ്ച_വ്യാഴാഴ്ച_വെള്ളിയാഴ്ച_ശനിയാഴ്ച'.split('_'),
	        weekdaysShort: 'ഞായർ_തിങ്കൾ_ചൊവ്വ_ബുധൻ_വ്യാഴം_വെള്ളി_ശനി'.split('_'),
	        weekdaysMin: 'ഞാ_തി_ചൊ_ബു_വ്യാ_വെ_ശ'.split('_'),
	        longDateFormat: {
	            LT: 'A h:mm -നു',
	            LTS: 'A h:mm:ss -നു',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY, LT',
	            LLLL: 'dddd, D MMMM YYYY, LT'
	        },
	        calendar: {
	            sameDay: '[ഇന്ന്] LT',
	            nextDay: '[നാളെ] LT',
	            nextWeek: 'dddd, LT',
	            lastDay: '[ഇന്നലെ] LT',
	            lastWeek: '[കഴിഞ്ഞ] dddd, LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s കഴിഞ്ഞ്',
	            past: '%s മുൻപ്',
	            s: 'അൽപ നിമിഷങ്ങൾ',
	            m: 'ഒരു മിനിറ്റ്',
	            mm: '%d മിനിറ്റ്',
	            h: 'ഒരു മണിക്കൂർ',
	            hh: '%d മണിക്കൂർ',
	            d: 'ഒരു ദിവസം',
	            dd: '%d ദിവസം',
	            M: 'ഒരു മാസം',
	            MM: '%d മാസം',
	            y: 'ഒരു വർഷം',
	            yy: '%d വർഷം'
	        },
	        meridiemParse: /രാത്രി|രാവിലെ|ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി/i,
	        isPM: function isPM(input) {
	            return /^(ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി)$/.test(input);
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'രാത്രി';
	            } else if (hour < 12) {
	                return 'രാവിലെ';
	            } else if (hour < 17) {
	                return 'ഉച്ച കഴിഞ്ഞ്';
	            } else if (hour < 20) {
	                return 'വൈകുന്നേരം';
	            } else {
	                return 'രാത്രി';
	            }
	        }
	    });
	});

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Marathi (mr)
	// author : Harshad Kale : https://github.com/kalehv

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	        numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };

	    return moment.defineLocale('mr', {
	        months: 'जानेवारी_फेब्रुवारी_मार्च_एप्रिल_मे_जून_जुलै_ऑगस्ट_सप्टेंबर_ऑक्टोबर_नोव्हेंबर_डिसेंबर'.split('_'),
	        monthsShort: 'जाने._फेब्रु._मार्च._एप्रि._मे._जून._जुलै._ऑग._सप्टें._ऑक्टो._नोव्हें._डिसें.'.split('_'),
	        weekdays: 'रविवार_सोमवार_मंगळवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split('_'),
	        weekdaysShort: 'रवि_सोम_मंगळ_बुध_गुरू_शुक्र_शनि'.split('_'),
	        weekdaysMin: 'र_सो_मं_बु_गु_शु_श'.split('_'),
	        longDateFormat: {
	            LT: 'A h:mm वाजता',
	            LTS: 'A h:mm:ss वाजता',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY, LT',
	            LLLL: 'dddd, D MMMM YYYY, LT'
	        },
	        calendar: {
	            sameDay: '[आज] LT',
	            nextDay: '[उद्या] LT',
	            nextWeek: 'dddd, LT',
	            lastDay: '[काल] LT',
	            lastWeek: '[मागील] dddd, LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s नंतर',
	            past: '%s पूर्वी',
	            s: 'सेकंद',
	            m: 'एक मिनिट',
	            mm: '%d मिनिटे',
	            h: 'एक तास',
	            hh: '%d तास',
	            d: 'एक दिवस',
	            dd: '%d दिवस',
	            M: 'एक महिना',
	            MM: '%d महिने',
	            y: 'एक वर्ष',
	            yy: '%d वर्षे'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /रात्री|सकाळी|दुपारी|सायंकाळी/,
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'रात्री') {
	                return hour < 4 ? hour : hour + 12;
	            } else if (meridiem === 'सकाळी') {
	                return hour;
	            } else if (meridiem === 'दुपारी') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === 'सायंकाळी') {
	                return hour + 12;
	            }
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'रात्री';
	            } else if (hour < 10) {
	                return 'सकाळी';
	            } else if (hour < 17) {
	                return 'दुपारी';
	            } else if (hour < 20) {
	                return 'सायंकाळी';
	            } else {
	                return 'रात्री';
	            }
	        },
	        week: {
	            dow: 0, // Sunday is the first day of the week.
	            doy: 6 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Bahasa Malaysia (ms-MY)
	// author : Weldan Jamili : https://github.com/weldan

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('ms-my', {
	        months: 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
	        monthsShort: 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
	        weekdays: 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
	        weekdaysShort: 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
	        weekdaysMin: 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
	        longDateFormat: {
	            LT: 'HH.mm',
	            LTS: 'LT.ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY [pukul] LT',
	            LLLL: 'dddd, D MMMM YYYY [pukul] LT'
	        },
	        meridiemParse: /pagi|tengahari|petang|malam/,
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'pagi') {
	                return hour;
	            } else if (meridiem === 'tengahari') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'petang' || meridiem === 'malam') {
	                return hour + 12;
	            }
	        },
	        meridiem: function meridiem(hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'tengahari';
	            } else if (hours < 19) {
	                return 'petang';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar: {
	            sameDay: '[Hari ini pukul] LT',
	            nextDay: '[Esok pukul] LT',
	            nextWeek: 'dddd [pukul] LT',
	            lastDay: '[Kelmarin pukul] LT',
	            lastWeek: 'dddd [lepas pukul] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'dalam %s',
	            past: '%s yang lepas',
	            s: 'beberapa saat',
	            m: 'seminit',
	            mm: '%d minit',
	            h: 'sejam',
	            hh: '%d jam',
	            d: 'sehari',
	            dd: '%d hari',
	            M: 'sebulan',
	            MM: '%d bulan',
	            y: 'setahun',
	            yy: '%d tahun'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Burmese (my)
	// author : Squar team, mysquar.com

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '၁',
	        '2': '၂',
	        '3': '၃',
	        '4': '၄',
	        '5': '၅',
	        '6': '၆',
	        '7': '၇',
	        '8': '၈',
	        '9': '၉',
	        '0': '၀'
	    },
	        numberMap = {
	        '၁': '1',
	        '၂': '2',
	        '၃': '3',
	        '၄': '4',
	        '၅': '5',
	        '၆': '6',
	        '၇': '7',
	        '၈': '8',
	        '၉': '9',
	        '၀': '0'
	    };
	    return moment.defineLocale('my', {
	        months: 'ဇန်နဝါရီ_ဖေဖော်ဝါရီ_မတ်_ဧပြီ_မေ_ဇွန်_ဇူလိုင်_သြဂုတ်_စက်တင်ဘာ_အောက်တိုဘာ_နိုဝင်ဘာ_ဒီဇင်ဘာ'.split('_'),
	        monthsShort: 'ဇန်_ဖေ_မတ်_ပြီ_မေ_ဇွန်_လိုင်_သြ_စက်_အောက်_နို_ဒီ'.split('_'),
	        weekdays: 'တနင်္ဂနွေ_တနင်္လာ_အင်္ဂါ_ဗုဒ္ဓဟူး_ကြာသပတေး_သောကြာ_စနေ'.split('_'),
	        weekdaysShort: 'နွေ_လာ_င်္ဂါ_ဟူး_ကြာ_သော_နေ'.split('_'),
	        weekdaysMin: 'နွေ_လာ_င်္ဂါ_ဟူး_ကြာ_သော_နေ'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[ယနေ.] LT [မှာ]',
	            nextDay: '[မနက်ဖြန်] LT [မှာ]',
	            nextWeek: 'dddd LT [မှာ]',
	            lastDay: '[မနေ.က] LT [မှာ]',
	            lastWeek: '[ပြီးခဲ့သော] dddd LT [မှာ]',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'လာမည့် %s မှာ',
	            past: 'လွန်ခဲ့သော %s က',
	            s: 'စက္ကန်.အနည်းငယ်',
	            m: 'တစ်မိနစ်',
	            mm: '%d မိနစ်',
	            h: 'တစ်နာရီ',
	            hh: '%d နာရီ',
	            d: 'တစ်ရက်',
	            dd: '%d ရက်',
	            M: 'တစ်လ',
	            MM: '%d လ',
	            y: 'တစ်နှစ်',
	            yy: '%d နှစ်'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[၁၂၃၄၅၆၇၈၉၀]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : norwegian bokmål (nb)
	// authors : Espen Hovlandsdal : https://github.com/rexxars
	//           Sigurd Gartmann : https://github.com/sigurdga

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('nb', {
	        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays: 'søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag'.split('_'),
	        weekdaysShort: 'søn_man_tirs_ons_tors_fre_lør'.split('_'),
	        weekdaysMin: 'sø_ma_ti_on_to_fr_lø'.split('_'),
	        longDateFormat: {
	            LT: 'H.mm',
	            LTS: 'LT.ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY [kl.] LT',
	            LLLL: 'dddd D. MMMM YYYY [kl.] LT'
	        },
	        calendar: {
	            sameDay: '[i dag kl.] LT',
	            nextDay: '[i morgen kl.] LT',
	            nextWeek: 'dddd [kl.] LT',
	            lastDay: '[i går kl.] LT',
	            lastWeek: '[forrige] dddd [kl.] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'om %s',
	            past: 'for %s siden',
	            s: 'noen sekunder',
	            m: 'ett minutt',
	            mm: '%d minutter',
	            h: 'en time',
	            hh: '%d timer',
	            d: 'en dag',
	            dd: '%d dager',
	            M: 'en måned',
	            MM: '%d måneder',
	            y: 'ett år',
	            yy: '%d år'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : nepali/nepalese
	// author : suvash : https://github.com/suvash

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	        numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };

	    return moment.defineLocale('ne', {
	        months: 'जनवरी_फेब्रुवरी_मार्च_अप्रिल_मई_जुन_जुलाई_अगष्ट_सेप्टेम्बर_अक्टोबर_नोभेम्बर_डिसेम्बर'.split('_'),
	        monthsShort: 'जन._फेब्रु._मार्च_अप्रि._मई_जुन_जुलाई._अग._सेप्ट._अक्टो._नोभे._डिसे.'.split('_'),
	        weekdays: 'आइतबार_सोमबार_मङ्गलबार_बुधबार_बिहिबार_शुक्रबार_शनिबार'.split('_'),
	        weekdaysShort: 'आइत._सोम._मङ्गल._बुध._बिहि._शुक्र._शनि.'.split('_'),
	        weekdaysMin: 'आइ._सो._मङ्_बु._बि._शु._श.'.split('_'),
	        longDateFormat: {
	            LT: 'Aको h:mm बजे',
	            LTS: 'Aको h:mm:ss बजे',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY, LT',
	            LLLL: 'dddd, D MMMM YYYY, LT'
	        },
	        preparse: function preparse(string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function postformat(string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /राती|बिहान|दिउँसो|बेलुका|साँझ|राती/,
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'राती') {
	                return hour < 3 ? hour : hour + 12;
	            } else if (meridiem === 'बिहान') {
	                return hour;
	            } else if (meridiem === 'दिउँसो') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === 'बेलुका' || meridiem === 'साँझ') {
	                return hour + 12;
	            }
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 3) {
	                return 'राती';
	            } else if (hour < 10) {
	                return 'बिहान';
	            } else if (hour < 15) {
	                return 'दिउँसो';
	            } else if (hour < 18) {
	                return 'बेलुका';
	            } else if (hour < 20) {
	                return 'साँझ';
	            } else {
	                return 'राती';
	            }
	        },
	        calendar: {
	            sameDay: '[आज] LT',
	            nextDay: '[भोली] LT',
	            nextWeek: '[आउँदो] dddd[,] LT',
	            lastDay: '[हिजो] LT',
	            lastWeek: '[गएको] dddd[,] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%sमा',
	            past: '%s अगाडी',
	            s: 'केही समय',
	            m: 'एक मिनेट',
	            mm: '%d मिनेट',
	            h: 'एक घण्टा',
	            hh: '%d घण्टा',
	            d: 'एक दिन',
	            dd: '%d दिन',
	            M: 'एक महिना',
	            MM: '%d महिना',
	            y: 'एक बर्ष',
	            yy: '%d बर्ष'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : dutch (nl)
	// author : Joris Röling : https://github.com/jjupiter

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
	        monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');

	    return moment.defineLocale('nl', {
	        months: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
	        monthsShort: function monthsShort(m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShortWithoutDots[m.month()];
	            } else {
	                return monthsShortWithDots[m.month()];
	            }
	        },
	        weekdays: 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
	        weekdaysShort: 'zo._ma._di._wo._do._vr._za.'.split('_'),
	        weekdaysMin: 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD-MM-YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[vandaag om] LT',
	            nextDay: '[morgen om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[gisteren om] LT',
	            lastWeek: '[afgelopen] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'over %s',
	            past: '%s geleden',
	            s: 'een paar seconden',
	            m: 'één minuut',
	            mm: '%d minuten',
	            h: 'één uur',
	            hh: '%d uur',
	            d: 'één dag',
	            dd: '%d dagen',
	            M: 'één maand',
	            MM: '%d maanden',
	            y: 'één jaar',
	            yy: '%d jaar'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal: function ordinal(number) {
	            return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : norwegian nynorsk (nn)
	// author : https://github.com/mechuwind

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('nn', {
	        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays: 'sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
	        weekdaysShort: 'sun_mån_tys_ons_tor_fre_lau'.split('_'),
	        weekdaysMin: 'su_må_ty_on_to_fr_lø'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[I dag klokka] LT',
	            nextDay: '[I morgon klokka] LT',
	            nextWeek: 'dddd [klokka] LT',
	            lastDay: '[I går klokka] LT',
	            lastWeek: '[Føregåande] dddd [klokka] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'om %s',
	            past: 'for %s sidan',
	            s: 'nokre sekund',
	            m: 'eit minutt',
	            mm: '%d minutt',
	            h: 'ein time',
	            hh: '%d timar',
	            d: 'ein dag',
	            dd: '%d dagar',
	            M: 'ein månad',
	            MM: '%d månader',
	            y: 'eit år',
	            yy: '%d år'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : polish (pl)
	// author : Rafal Hirsz : https://github.com/evoL

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var monthsNominative = 'styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień'.split('_'),
	        monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia'.split('_');

	    function plural(n) {
	        return n % 10 < 5 && n % 10 > 1 && ~ ~(n / 10) % 10 !== 1;
	    }

	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	            case 'm':
	                return withoutSuffix ? 'minuta' : 'minutę';
	            case 'mm':
	                return result + (plural(number) ? 'minuty' : 'minut');
	            case 'h':
	                return withoutSuffix ? 'godzina' : 'godzinę';
	            case 'hh':
	                return result + (plural(number) ? 'godziny' : 'godzin');
	            case 'MM':
	                return result + (plural(number) ? 'miesiące' : 'miesięcy');
	            case 'yy':
	                return result + (plural(number) ? 'lata' : 'lat');
	        }
	    }

	    return moment.defineLocale('pl', {
	        months: function months(momentToFormat, format) {
	            if (/D MMMM/.test(format)) {
	                return monthsSubjective[momentToFormat.month()];
	            } else {
	                return monthsNominative[momentToFormat.month()];
	            }
	        },
	        monthsShort: 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru'.split('_'),
	        weekdays: 'niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota'.split('_'),
	        weekdaysShort: 'nie_pon_wt_śr_czw_pt_sb'.split('_'),
	        weekdaysMin: 'N_Pn_Wt_Śr_Cz_Pt_So'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Dziś o] LT',
	            nextDay: '[Jutro o] LT',
	            nextWeek: '[W] dddd [o] LT',
	            lastDay: '[Wczoraj o] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[W zeszłą niedzielę o] LT';
	                    case 3:
	                        return '[W zeszłą środę o] LT';
	                    case 6:
	                        return '[W zeszłą sobotę o] LT';
	                    default:
	                        return '[W zeszły] dddd [o] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'za %s',
	            past: '%s temu',
	            s: 'kilka sekund',
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: '1 dzień',
	            dd: '%d dni',
	            M: 'miesiąc',
	            MM: translate,
	            y: 'rok',
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : brazilian portuguese (pt-br)
	// author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('pt-br', {
	        months: 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
	        monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
	        weekdays: 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
	        weekdaysShort: 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
	        weekdaysMin: 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D [de] MMMM [de] YYYY',
	            LLL: 'D [de] MMMM [de] YYYY [às] LT',
	            LLLL: 'dddd, D [de] MMMM [de] YYYY [às] LT'
	        },
	        calendar: {
	            sameDay: '[Hoje às] LT',
	            nextDay: '[Amanhã às] LT',
	            nextWeek: 'dddd [às] LT',
	            lastDay: '[Ontem às] LT',
	            lastWeek: function lastWeek() {
	                return this.day() === 0 || this.day() === 6 ? '[Último] dddd [às] LT' : // Saturday + Sunday
	                '[Última] dddd [às] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'em %s',
	            past: '%s atrás',
	            s: 'segundos',
	            m: 'um minuto',
	            mm: '%d minutos',
	            h: 'uma hora',
	            hh: '%d horas',
	            d: 'um dia',
	            dd: '%d dias',
	            M: 'um mês',
	            MM: '%d meses',
	            y: 'um ano',
	            yy: '%d anos'
	        },
	        ordinalParse: /\d{1,2}º/,
	        ordinal: '%dº'
	    });
	});

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : portuguese (pt)
	// author : Jefferson : https://github.com/jalex79

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('pt', {
	        months: 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
	        monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
	        weekdays: 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
	        weekdaysShort: 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
	        weekdaysMin: 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D [de] MMMM [de] YYYY',
	            LLL: 'D [de] MMMM [de] YYYY LT',
	            LLLL: 'dddd, D [de] MMMM [de] YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Hoje às] LT',
	            nextDay: '[Amanhã às] LT',
	            nextWeek: 'dddd [às] LT',
	            lastDay: '[Ontem às] LT',
	            lastWeek: function lastWeek() {
	                return this.day() === 0 || this.day() === 6 ? '[Último] dddd [às] LT' : // Saturday + Sunday
	                '[Última] dddd [às] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'em %s',
	            past: 'há %s',
	            s: 'segundos',
	            m: 'um minuto',
	            mm: '%d minutos',
	            h: 'uma hora',
	            hh: '%d horas',
	            d: 'um dia',
	            dd: '%d dias',
	            M: 'um mês',
	            MM: '%d meses',
	            y: 'um ano',
	            yy: '%d anos'
	        },
	        ordinalParse: /\d{1,2}º/,
	        ordinal: '%dº',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : romanian (ro)
	// author : Vlad Gurdiga : https://github.com/gurdiga
	// author : Valentin Agachi : https://github.com/avaly

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'minute',
	            'hh': 'ore',
	            'dd': 'zile',
	            'MM': 'luni',
	            'yy': 'ani'
	        },
	            separator = ' ';
	        if (number % 100 >= 20 || number >= 100 && number % 100 === 0) {
	            separator = ' de ';
	        }

	        return number + separator + format[key];
	    }

	    return moment.defineLocale('ro', {
	        months: 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
	        monthsShort: 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
	        weekdays: 'duminică_luni_marți_miercuri_joi_vineri_sâmbătă'.split('_'),
	        weekdaysShort: 'Dum_Lun_Mar_Mie_Joi_Vin_Sâm'.split('_'),
	        weekdaysMin: 'Du_Lu_Ma_Mi_Jo_Vi_Sâ'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY H:mm',
	            LLLL: 'dddd, D MMMM YYYY H:mm'
	        },
	        calendar: {
	            sameDay: '[azi la] LT',
	            nextDay: '[mâine la] LT',
	            nextWeek: 'dddd [la] LT',
	            lastDay: '[ieri la] LT',
	            lastWeek: '[fosta] dddd [la] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'peste %s',
	            past: '%s în urmă',
	            s: 'câteva secunde',
	            m: 'un minut',
	            mm: relativeTimeWithPlural,
	            h: 'o oră',
	            hh: relativeTimeWithPlural,
	            d: 'o zi',
	            dd: relativeTimeWithPlural,
	            M: 'o lună',
	            MM: relativeTimeWithPlural,
	            y: 'un an',
	            yy: relativeTimeWithPlural
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : russian (ru)
	// author : Viktorminator : https://github.com/Viktorminator
	// Author : Menelion Elensúle : https://github.com/Oire

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
	    }

	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': withoutSuffix ? 'минута_минуты_минут' : 'минуту_минуты_минут',
	            'hh': 'час_часа_часов',
	            'dd': 'день_дня_дней',
	            'MM': 'месяц_месяца_месяцев',
	            'yy': 'год_года_лет'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'минута' : 'минуту';
	        } else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }

	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
	            'accusative': 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_')
	        },
	            nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';

	        return months[nounCase][m.month()];
	    }

	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = {
	            'nominative': 'янв_фев_март_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split('_'),
	            'accusative': 'янв_фев_мар_апр_мая_июня_июля_авг_сен_окт_ноя_дек'.split('_')
	        },
	            nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';

	        return monthsShort[nounCase][m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
	            'accusative': 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split('_')
	        },
	            nounCase = /\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/.test(format) ? 'accusative' : 'nominative';

	        return weekdays[nounCase][m.day()];
	    }

	    return moment.defineLocale('ru', {
	        months: monthsCaseReplace,
	        monthsShort: monthsShortCaseReplace,
	        weekdays: weekdaysCaseReplace,
	        weekdaysShort: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
	        weekdaysMin: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
	        monthsParse: [/^янв/i, /^фев/i, /^мар/i, /^апр/i, /^ма[й|я]/i, /^июн/i, /^июл/i, /^авг/i, /^сен/i, /^окт/i, /^ноя/i, /^дек/i],
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY г.',
	            LLL: 'D MMMM YYYY г., LT',
	            LLLL: 'dddd, D MMMM YYYY г., LT'
	        },
	        calendar: {
	            sameDay: '[Сегодня в] LT',
	            nextDay: '[Завтра в] LT',
	            lastDay: '[Вчера в] LT',
	            nextWeek: function nextWeek() {
	                return this.day() === 2 ? '[Во] dddd [в] LT' : '[В] dddd [в] LT';
	            },
	            lastWeek: function lastWeek(now) {
	                if (now.week() !== this.week()) {
	                    switch (this.day()) {
	                        case 0:
	                            return '[В прошлое] dddd [в] LT';
	                        case 1:
	                        case 2:
	                        case 4:
	                            return '[В прошлый] dddd [в] LT';
	                        case 3:
	                        case 5:
	                        case 6:
	                            return '[В прошлую] dddd [в] LT';
	                    }
	                } else {
	                    if (this.day() === 2) {
	                        return '[Во] dddd [в] LT';
	                    } else {
	                        return '[В] dddd [в] LT';
	                    }
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'через %s',
	            past: '%s назад',
	            s: 'несколько секунд',
	            m: relativeTimeWithPlural,
	            mm: relativeTimeWithPlural,
	            h: 'час',
	            hh: relativeTimeWithPlural,
	            d: 'день',
	            dd: relativeTimeWithPlural,
	            M: 'месяц',
	            MM: relativeTimeWithPlural,
	            y: 'год',
	            yy: relativeTimeWithPlural
	        },

	        meridiemParse: /ночи|утра|дня|вечера/i,
	        isPM: function isPM(input) {
	            return /^(дня|вечера)$/.test(input);
	        },

	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'ночи';
	            } else if (hour < 12) {
	                return 'утра';
	            } else if (hour < 17) {
	                return 'дня';
	            } else {
	                return 'вечера';
	            }
	        },

	        ordinalParse: /\d{1,2}-(й|го|я)/,
	        ordinal: function ordinal(number, period) {
	            switch (period) {
	                case 'M':
	                case 'd':
	                case 'DDD':
	                    return number + '-й';
	                case 'D':
	                    return number + '-го';
	                case 'w':
	                case 'W':
	                    return number + '-я';
	                default:
	                    return number;
	            }
	        },

	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : slovak (sk)
	// author : Martin Minka : https://github.com/k2s
	// based on work of petrbela : https://github.com/petrbela

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var months = 'január_február_marec_apríl_máj_jún_júl_august_september_október_november_december'.split('_'),
	        monthsShort = 'jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec'.split('_');

	    function plural(n) {
	        return n > 1 && n < 5;
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	            case 's':
	                // a few seconds / in a few seconds / a few seconds ago
	                return withoutSuffix || isFuture ? 'pár sekúnd' : 'pár sekundami';
	            case 'm':
	                // a minute / in a minute / a minute ago
	                return withoutSuffix ? 'minúta' : isFuture ? 'minútu' : 'minútou';
	            case 'mm':
	                // 9 minutes / in 9 minutes / 9 minutes ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'minúty' : 'minút');
	                } else {
	                    return result + 'minútami';
	                }
	                break;
	            case 'h':
	                // an hour / in an hour / an hour ago
	                return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
	            case 'hh':
	                // 9 hours / in 9 hours / 9 hours ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'hodiny' : 'hodín');
	                } else {
	                    return result + 'hodinami';
	                }
	                break;
	            case 'd':
	                // a day / in a day / a day ago
	                return withoutSuffix || isFuture ? 'deň' : 'dňom';
	            case 'dd':
	                // 9 days / in 9 days / 9 days ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'dni' : 'dní');
	                } else {
	                    return result + 'dňami';
	                }
	                break;
	            case 'M':
	                // a month / in a month / a month ago
	                return withoutSuffix || isFuture ? 'mesiac' : 'mesiacom';
	            case 'MM':
	                // 9 months / in 9 months / 9 months ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'mesiace' : 'mesiacov');
	                } else {
	                    return result + 'mesiacmi';
	                }
	                break;
	            case 'y':
	                // a year / in a year / a year ago
	                return withoutSuffix || isFuture ? 'rok' : 'rokom';
	            case 'yy':
	                // 9 years / in 9 years / 9 years ago
	                if (withoutSuffix || isFuture) {
	                    return result + (plural(number) ? 'roky' : 'rokov');
	                } else {
	                    return result + 'rokmi';
	                }
	                break;
	        }
	    }

	    return moment.defineLocale('sk', {
	        months: months,
	        monthsShort: monthsShort,
	        monthsParse: (function (months, monthsShort) {
	            var i,
	                _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (červenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        })(months, monthsShort),
	        weekdays: 'nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota'.split('_'),
	        weekdaysShort: 'ne_po_ut_st_št_pi_so'.split('_'),
	        weekdaysMin: 'ne_po_ut_st_št_pi_so'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[dnes o] LT',
	            nextDay: '[zajtra o] LT',
	            nextWeek: function nextWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[v nedeľu o] LT';
	                    case 1:
	                    case 2:
	                        return '[v] dddd [o] LT';
	                    case 3:
	                        return '[v stredu o] LT';
	                    case 4:
	                        return '[vo štvrtok o] LT';
	                    case 5:
	                        return '[v piatok o] LT';
	                    case 6:
	                        return '[v sobotu o] LT';
	                }
	            },
	            lastDay: '[včera o] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[minulú nedeľu o] LT';
	                    case 1:
	                    case 2:
	                        return '[minulý] dddd [o] LT';
	                    case 3:
	                        return '[minulú stredu o] LT';
	                    case 4:
	                    case 5:
	                        return '[minulý] dddd [o] LT';
	                    case 6:
	                        return '[minulú sobotu o] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'za %s',
	            past: 'pred %s',
	            s: translate,
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: translate,
	            dd: translate,
	            M: translate,
	            MM: translate,
	            y: translate,
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : slovenian (sl)
	// author : Robert Sedovšek : https://github.com/sedovsek

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	            case 'm':
	                return withoutSuffix ? 'ena minuta' : 'eno minuto';
	            case 'mm':
	                if (number === 1) {
	                    result += 'minuta';
	                } else if (number === 2) {
	                    result += 'minuti';
	                } else if (number === 3 || number === 4) {
	                    result += 'minute';
	                } else {
	                    result += 'minut';
	                }
	                return result;
	            case 'h':
	                return withoutSuffix ? 'ena ura' : 'eno uro';
	            case 'hh':
	                if (number === 1) {
	                    result += 'ura';
	                } else if (number === 2) {
	                    result += 'uri';
	                } else if (number === 3 || number === 4) {
	                    result += 'ure';
	                } else {
	                    result += 'ur';
	                }
	                return result;
	            case 'dd':
	                if (number === 1) {
	                    result += 'dan';
	                } else {
	                    result += 'dni';
	                }
	                return result;
	            case 'MM':
	                if (number === 1) {
	                    result += 'mesec';
	                } else if (number === 2) {
	                    result += 'meseca';
	                } else if (number === 3 || number === 4) {
	                    result += 'mesece';
	                } else {
	                    result += 'mesecev';
	                }
	                return result;
	            case 'yy':
	                if (number === 1) {
	                    result += 'leto';
	                } else if (number === 2) {
	                    result += 'leti';
	                } else if (number === 3 || number === 4) {
	                    result += 'leta';
	                } else {
	                    result += 'let';
	                }
	                return result;
	        }
	    }

	    return moment.defineLocale('sl', {
	        months: 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
	        monthsShort: 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
	        weekdays: 'nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota'.split('_'),
	        weekdaysShort: 'ned._pon._tor._sre._čet._pet._sob.'.split('_'),
	        weekdaysMin: 'ne_po_to_sr_če_pe_so'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[danes ob] LT',
	            nextDay: '[jutri ob] LT',

	            nextWeek: function nextWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[v] [nedeljo] [ob] LT';
	                    case 3:
	                        return '[v] [sredo] [ob] LT';
	                    case 6:
	                        return '[v] [soboto] [ob] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[v] dddd [ob] LT';
	                }
	            },
	            lastDay: '[včeraj ob] LT',
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                    case 3:
	                    case 6:
	                        return '[prejšnja] dddd [ob] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[prejšnji] dddd [ob] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'čez %s',
	            past: '%s nazaj',
	            s: 'nekaj sekund',
	            m: translate,
	            mm: translate,
	            h: translate,
	            hh: translate,
	            d: 'en dan',
	            dd: translate,
	            M: 'en mesec',
	            MM: translate,
	            y: 'eno leto',
	            yy: translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Albanian (sq)
	// author : Flakërim Ismani : https://github.com/flakerimi
	// author: Menelion Elensúle: https://github.com/Oire (tests)
	// author : Oerd Cukalla : https://github.com/oerd (fixes)

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('sq', {
	        months: 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_Nëntor_Dhjetor'.split('_'),
	        monthsShort: 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_Nën_Dhj'.split('_'),
	        weekdays: 'E Diel_E Hënë_E Martë_E Mërkurë_E Enjte_E Premte_E Shtunë'.split('_'),
	        weekdaysShort: 'Die_Hën_Mar_Mër_Enj_Pre_Sht'.split('_'),
	        weekdaysMin: 'D_H_Ma_Më_E_P_Sh'.split('_'),
	        meridiemParse: /PD|MD/,
	        isPM: function isPM(input) {
	            return input.charAt(0) === 'M';
	        },
	        meridiem: function meridiem(hours, minutes, isLower) {
	            return hours < 12 ? 'PD' : 'MD';
	        },
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Sot në] LT',
	            nextDay: '[Nesër në] LT',
	            nextWeek: 'dddd [në] LT',
	            lastDay: '[Dje në] LT',
	            lastWeek: 'dddd [e kaluar në] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'në %s',
	            past: '%s më parë',
	            s: 'disa sekonda',
	            m: 'një minutë',
	            mm: '%d minuta',
	            h: 'një orë',
	            hh: '%d orë',
	            d: 'një ditë',
	            dd: '%d ditë',
	            M: 'një muaj',
	            MM: '%d muaj',
	            y: 'një vit',
	            yy: '%d vite'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Serbian-cyrillic (sr-cyrl)
	// author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['један минут', 'једне минуте'],
	            mm: ['минут', 'минуте', 'минута'],
	            h: ['један сат', 'једног сата'],
	            hh: ['сат', 'сата', 'сати'],
	            dd: ['дан', 'дана', 'дана'],
	            MM: ['месец', 'месеца', 'месеци'],
	            yy: ['година', 'године', 'година']
	        },
	        correctGrammaticalCase: function correctGrammaticalCase(number, wordKey) {
	            return number === 1 ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
	        },
	        translate: function translate(number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };

	    return moment.defineLocale('sr-cyrl', {
	        months: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
	        monthsShort: ['јан.', 'феб.', 'мар.', 'апр.', 'мај', 'јун', 'јул', 'авг.', 'сеп.', 'окт.', 'нов.', 'дец.'],
	        weekdays: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
	        weekdaysShort: ['нед.', 'пон.', 'уто.', 'сре.', 'чет.', 'пет.', 'суб.'],
	        weekdaysMin: ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[данас у] LT',
	            nextDay: '[сутра у] LT',

	            nextWeek: function nextWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[у] [недељу] [у] LT';
	                    case 3:
	                        return '[у] [среду] [у] LT';
	                    case 6:
	                        return '[у] [суботу] [у] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[у] dddd [у] LT';
	                }
	            },
	            lastDay: '[јуче у] LT',
	            lastWeek: function lastWeek() {
	                var lastWeekDays = ['[прошле] [недеље] [у] LT', '[прошлог] [понедељка] [у] LT', '[прошлог] [уторка] [у] LT', '[прошле] [среде] [у] LT', '[прошлог] [четвртка] [у] LT', '[прошлог] [петка] [у] LT', '[прошле] [суботе] [у] LT'];
	                return lastWeekDays[this.day()];
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'за %s',
	            past: 'пре %s',
	            s: 'неколико секунди',
	            m: translator.translate,
	            mm: translator.translate,
	            h: translator.translate,
	            hh: translator.translate,
	            d: 'дан',
	            dd: translator.translate,
	            M: 'месец',
	            MM: translator.translate,
	            y: 'годину',
	            yy: translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Serbian-latin (sr)
	// author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['jedan minut', 'jedne minute'],
	            mm: ['minut', 'minute', 'minuta'],
	            h: ['jedan sat', 'jednog sata'],
	            hh: ['sat', 'sata', 'sati'],
	            dd: ['dan', 'dana', 'dana'],
	            MM: ['mesec', 'meseca', 'meseci'],
	            yy: ['godina', 'godine', 'godina']
	        },
	        correctGrammaticalCase: function correctGrammaticalCase(number, wordKey) {
	            return number === 1 ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
	        },
	        translate: function translate(number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };

	    return moment.defineLocale('sr', {
	        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
	        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
	        weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
	        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', 'čet.', 'pet.', 'sub.'],
	        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'če', 'pe', 'su'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS: 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[danas u] LT',
	            nextDay: '[sutra u] LT',

	            nextWeek: function nextWeek() {
	                switch (this.day()) {
	                    case 0:
	                        return '[u] [nedelju] [u] LT';
	                    case 3:
	                        return '[u] [sredu] [u] LT';
	                    case 6:
	                        return '[u] [subotu] [u] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                    case 5:
	                        return '[u] dddd [u] LT';
	                }
	            },
	            lastDay: '[juče u] LT',
	            lastWeek: function lastWeek() {
	                var lastWeekDays = ['[prošle] [nedelje] [u] LT', '[prošlog] [ponedeljka] [u] LT', '[prošlog] [utorka] [u] LT', '[prošle] [srede] [u] LT', '[prošlog] [četvrtka] [u] LT', '[prošlog] [petka] [u] LT', '[prošle] [subote] [u] LT'];
	                return lastWeekDays[this.day()];
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'za %s',
	            past: 'pre %s',
	            s: 'nekoliko sekundi',
	            m: translator.translate,
	            mm: translator.translate,
	            h: translator.translate,
	            hh: translator.translate,
	            d: 'dan',
	            dd: translator.translate,
	            M: 'mesec',
	            MM: translator.translate,
	            y: 'godinu',
	            yy: translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : swedish (sv)
	// author : Jens Alm : https://github.com/ulmus

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('sv', {
	        months: 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
	        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
	        weekdays: 'söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag'.split('_'),
	        weekdaysShort: 'sön_mån_tis_ons_tor_fre_lör'.split('_'),
	        weekdaysMin: 'sö_må_ti_on_to_fr_lö'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'YYYY-MM-DD',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Idag] LT',
	            nextDay: '[Imorgon] LT',
	            lastDay: '[Igår] LT',
	            nextWeek: 'dddd LT',
	            lastWeek: '[Förra] dddd[en] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'om %s',
	            past: 'för %s sedan',
	            s: 'några sekunder',
	            m: 'en minut',
	            mm: '%d minuter',
	            h: 'en timme',
	            hh: '%d timmar',
	            d: 'en dag',
	            dd: '%d dagar',
	            M: 'en månad',
	            MM: '%d månader',
	            y: 'ett år',
	            yy: '%d år'
	        },
	        ordinalParse: /\d{1,2}(e|a)/,
	        ordinal: function ordinal(number) {
	            var b = number % 10,
	                output = ~ ~(number % 100 / 10) === 1 ? 'e' : b === 1 ? 'a' : b === 2 ? 'a' : b === 3 ? 'e' : 'e';
	            return number + output;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : tamil (ta)
	// author : Arjunkumar Krishnamoorthy : https://github.com/tk120404

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    /*var symbolMap = {
	            '1': '௧',
	            '2': '௨',
	            '3': '௩',
	            '4': '௪',
	            '5': '௫',
	            '6': '௬',
	            '7': '௭',
	            '8': '௮',
	            '9': '௯',
	            '0': '௦'
	        },
	        numberMap = {
	            '௧': '1',
	            '௨': '2',
	            '௩': '3',
	            '௪': '4',
	            '௫': '5',
	            '௬': '6',
	            '௭': '7',
	            '௮': '8',
	            '௯': '9',
	            '௦': '0'
	        }; */

	    return moment.defineLocale('ta', {
	        months: 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split('_'),
	        monthsShort: 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split('_'),
	        weekdays: 'ஞாயிற்றுக்கிழமை_திங்கட்கிழமை_செவ்வாய்கிழமை_புதன்கிழமை_வியாழக்கிழமை_வெள்ளிக்கிழமை_சனிக்கிழமை'.split('_'),
	        weekdaysShort: 'ஞாயிறு_திங்கள்_செவ்வாய்_புதன்_வியாழன்_வெள்ளி_சனி'.split('_'),
	        weekdaysMin: 'ஞா_தி_செ_பு_வி_வெ_ச'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY, LT',
	            LLLL: 'dddd, D MMMM YYYY, LT'
	        },
	        calendar: {
	            sameDay: '[இன்று] LT',
	            nextDay: '[நாளை] LT',
	            nextWeek: 'dddd, LT',
	            lastDay: '[நேற்று] LT',
	            lastWeek: '[கடந்த வாரம்] dddd, LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s இல்',
	            past: '%s முன்',
	            s: 'ஒரு சில விநாடிகள்',
	            m: 'ஒரு நிமிடம்',
	            mm: '%d நிமிடங்கள்',
	            h: 'ஒரு மணி நேரம்',
	            hh: '%d மணி நேரம்',
	            d: 'ஒரு நாள்',
	            dd: '%d நாட்கள்',
	            M: 'ஒரு மாதம்',
	            MM: '%d மாதங்கள்',
	            y: 'ஒரு வருடம்',
	            yy: '%d ஆண்டுகள்'
	        },
	        /*        preparse: function (string) {
	                    return string.replace(/[௧௨௩௪௫௬௭௮௯௦]/g, function (match) {
	                        return numberMap[match];
	                    });
	                },
	                postformat: function (string) {
	                    return string.replace(/\d/g, function (match) {
	                        return symbolMap[match];
	                    });
	                },*/
	        ordinalParse: /\d{1,2}வது/,
	        ordinal: function ordinal(number) {
	            return number + 'வது';
	        },

	        // refer http://ta.wikipedia.org/s/1er1
	        meridiemParse: /யாமம்|வைகறை|காலை|நண்பகல்|எற்பாடு|மாலை/,
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 2) {
	                return ' யாமம்';
	            } else if (hour < 6) {
	                return ' வைகறை'; // வைகறை
	            } else if (hour < 10) {
	                return ' காலை'; // காலை
	            } else if (hour < 14) {
	                return ' நண்பகல்'; // நண்பகல்
	            } else if (hour < 18) {
	                return ' எற்பாடு'; // எற்பாடு
	            } else if (hour < 22) {
	                return ' மாலை'; // மாலை
	            } else {
	                return ' யாமம்';
	            }
	        },
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'யாமம்') {
	                return hour < 2 ? hour : hour + 12;
	            } else if (meridiem === 'வைகறை' || meridiem === 'காலை') {
	                return hour;
	            } else if (meridiem === 'நண்பகல்') {
	                return hour >= 10 ? hour : hour + 12;
	            } else {
	                return hour + 12;
	            }
	        },
	        week: {
	            dow: 0, // Sunday is the first day of the week.
	            doy: 6 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : thai (th)
	// author : Kridsada Thanabulpong : https://github.com/sirn

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('th', {
	        months: 'มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม'.split('_'),
	        monthsShort: 'มกรา_กุมภา_มีนา_เมษา_พฤษภา_มิถุนา_กรกฎา_สิงหา_กันยา_ตุลา_พฤศจิกา_ธันวา'.split('_'),
	        weekdays: 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์'.split('_'),
	        weekdaysShort: 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์'.split('_'), // yes, three characters difference
	        weekdaysMin: 'อา._จ._อ._พ._พฤ._ศ._ส.'.split('_'),
	        longDateFormat: {
	            LT: 'H นาฬิกา m นาที',
	            LTS: 'LT s วินาที',
	            L: 'YYYY/MM/DD',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY เวลา LT',
	            LLLL: 'วันddddที่ D MMMM YYYY เวลา LT'
	        },
	        meridiemParse: /ก่อนเที่ยง|หลังเที่ยง/,
	        isPM: function isPM(input) {
	            return input === 'หลังเที่ยง';
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 12) {
	                return 'ก่อนเที่ยง';
	            } else {
	                return 'หลังเที่ยง';
	            }
	        },
	        calendar: {
	            sameDay: '[วันนี้ เวลา] LT',
	            nextDay: '[พรุ่งนี้ เวลา] LT',
	            nextWeek: 'dddd[หน้า เวลา] LT',
	            lastDay: '[เมื่อวานนี้ เวลา] LT',
	            lastWeek: '[วัน]dddd[ที่แล้ว เวลา] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'อีก %s',
	            past: '%sที่แล้ว',
	            s: 'ไม่กี่วินาที',
	            m: '1 นาที',
	            mm: '%d นาที',
	            h: '1 ชั่วโมง',
	            hh: '%d ชั่วโมง',
	            d: '1 วัน',
	            dd: '%d วัน',
	            M: '1 เดือน',
	            MM: '%d เดือน',
	            y: '1 ปี',
	            yy: '%d ปี'
	        }
	    });
	});

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Tagalog/Filipino (tl-ph)
	// author : Dan Hagman

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('tl-ph', {
	        months: 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
	        monthsShort: 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
	        weekdays: 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
	        weekdaysShort: 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
	        weekdaysMin: 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'MM/D/YYYY',
	            LL: 'MMMM D, YYYY',
	            LLL: 'MMMM D, YYYY LT',
	            LLLL: 'dddd, MMMM DD, YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Ngayon sa] LT',
	            nextDay: '[Bukas sa] LT',
	            nextWeek: 'dddd [sa] LT',
	            lastDay: '[Kahapon sa] LT',
	            lastWeek: 'dddd [huling linggo] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'sa loob ng %s',
	            past: '%s ang nakalipas',
	            s: 'ilang segundo',
	            m: 'isang minuto',
	            mm: '%d minuto',
	            h: 'isang oras',
	            hh: '%d oras',
	            d: 'isang araw',
	            dd: '%d araw',
	            M: 'isang buwan',
	            MM: '%d buwan',
	            y: 'isang taon',
	            yy: '%d taon'
	        },
	        ordinalParse: /\d{1,2}/,
	        ordinal: function ordinal(number) {
	            return number;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : turkish (tr)
	// authors : Erhan Gundogan : https://github.com/erhangundogan,
	//           Burak Yiğit Kaya: https://github.com/BYK

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    var suffixes = {
	        1: '\'inci',
	        5: '\'inci',
	        8: '\'inci',
	        70: '\'inci',
	        80: '\'inci',

	        2: '\'nci',
	        7: '\'nci',
	        20: '\'nci',
	        50: '\'nci',

	        3: '\'üncü',
	        4: '\'üncü',
	        100: '\'üncü',

	        6: '\'ncı',

	        9: '\'uncu',
	        10: '\'uncu',
	        30: '\'uncu',

	        60: '\'ıncı',
	        90: '\'ıncı'
	    };

	    return moment.defineLocale('tr', {
	        months: 'Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık'.split('_'),
	        monthsShort: 'Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara'.split('_'),
	        weekdays: 'Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi'.split('_'),
	        weekdaysShort: 'Paz_Pts_Sal_Çar_Per_Cum_Cts'.split('_'),
	        weekdaysMin: 'Pz_Pt_Sa_Ça_Pe_Cu_Ct'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[bugün saat] LT',
	            nextDay: '[yarın saat] LT',
	            nextWeek: '[haftaya] dddd [saat] LT',
	            lastDay: '[dün] LT',
	            lastWeek: '[geçen hafta] dddd [saat] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s sonra',
	            past: '%s önce',
	            s: 'birkaç saniye',
	            m: 'bir dakika',
	            mm: '%d dakika',
	            h: 'bir saat',
	            hh: '%d saat',
	            d: 'bir gün',
	            dd: '%d gün',
	            M: 'bir ay',
	            MM: '%d ay',
	            y: 'bir yıl',
	            yy: '%d yıl'
	        },
	        ordinalParse: /\d{1,2}'(inci|nci|üncü|ncı|uncu|ıncı)/,
	        ordinal: function ordinal(number) {
	            if (number === 0) {
	                // special case for zero
	                return number + '\'ıncı';
	            }
	            var a = number % 10,
	                b = number % 100 - a,
	                c = number >= 100 ? 100 : null;

	            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Morocco Central Atlas Tamaziɣt in Latin (tzm-latn)
	// author : Abdel Said : https://github.com/abdelsaid

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('tzm-latn', {
	        months: 'innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir'.split('_'),
	        monthsShort: 'innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir'.split('_'),
	        weekdays: 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
	        weekdaysShort: 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
	        weekdaysMin: 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[asdkh g] LT',
	            nextDay: '[aska g] LT',
	            nextWeek: 'dddd [g] LT',
	            lastDay: '[assant g] LT',
	            lastWeek: 'dddd [g] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'dadkh s yan %s',
	            past: 'yan %s',
	            s: 'imik',
	            m: 'minuḍ',
	            mm: '%d minuḍ',
	            h: 'saɛa',
	            hh: '%d tassaɛin',
	            d: 'ass',
	            dd: '%d ossan',
	            M: 'ayowr',
	            MM: '%d iyyirn',
	            y: 'asgas',
	            yy: '%d isgasn'
	        },
	        week: {
	            dow: 6, // Saturday is the first day of the week.
	            doy: 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : Morocco Central Atlas Tamaziɣt (tzm)
	// author : Abdel Said : https://github.com/abdelsaid

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('tzm', {
	        months: 'ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ'.split('_'),
	        monthsShort: 'ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ'.split('_'),
	        weekdays: 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
	        weekdaysShort: 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
	        weekdaysMin: 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[ⴰⵙⴷⵅ ⴴ] LT',
	            nextDay: '[ⴰⵙⴽⴰ ⴴ] LT',
	            nextWeek: 'dddd [ⴴ] LT',
	            lastDay: '[ⴰⵚⴰⵏⵜ ⴴ] LT',
	            lastWeek: 'dddd [ⴴ] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'ⴷⴰⴷⵅ ⵙ ⵢⴰⵏ %s',
	            past: 'ⵢⴰⵏ %s',
	            s: 'ⵉⵎⵉⴽ',
	            m: 'ⵎⵉⵏⵓⴺ',
	            mm: '%d ⵎⵉⵏⵓⴺ',
	            h: 'ⵙⴰⵄⴰ',
	            hh: '%d ⵜⴰⵙⵙⴰⵄⵉⵏ',
	            d: 'ⴰⵙⵙ',
	            dd: '%d oⵙⵙⴰⵏ',
	            M: 'ⴰⵢoⵓⵔ',
	            MM: '%d ⵉⵢⵢⵉⵔⵏ',
	            y: 'ⴰⵙⴳⴰⵙ',
	            yy: '%d ⵉⵙⴳⴰⵙⵏ'
	        },
	        week: {
	            dow: 6, // Saturday is the first day of the week.
	            doy: 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : ukrainian (uk)
	// author : zemlanin : https://github.com/zemlanin
	// Author : Menelion Elensúle : https://github.com/Oire

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
	    }

	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'хвилина_хвилини_хвилин',
	            'hh': 'година_години_годин',
	            'dd': 'день_дні_днів',
	            'MM': 'місяць_місяці_місяців',
	            'yy': 'рік_роки_років'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'хвилина' : 'хвилину';
	        } else if (key === 'h') {
	            return withoutSuffix ? 'година' : 'годину';
	        } else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }

	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень'.split('_'),
	            'accusative': 'січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня'.split('_')
	        },
	            nounCase = /D[oD]? *MMMM?/.test(format) ? 'accusative' : 'nominative';

	        return months[nounCase][m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота'.split('_'),
	            'accusative': 'неділю_понеділок_вівторок_середу_четвер_п’ятницю_суботу'.split('_'),
	            'genitive': 'неділі_понеділка_вівторка_середи_четверга_п’ятниці_суботи'.split('_')
	        },
	            nounCase = /(\[[ВвУу]\]) ?dddd/.test(format) ? 'accusative' : /\[?(?:минулої|наступної)? ?\] ?dddd/.test(format) ? 'genitive' : 'nominative';

	        return weekdays[nounCase][m.day()];
	    }

	    function processHoursFunction(str) {
	        return function () {
	            return str + 'о' + (this.hours() === 11 ? 'б' : '') + '] LT';
	        };
	    }

	    return moment.defineLocale('uk', {
	        months: monthsCaseReplace,
	        monthsShort: 'січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд'.split('_'),
	        weekdays: weekdaysCaseReplace,
	        weekdaysShort: 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
	        weekdaysMin: 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD.MM.YYYY',
	            LL: 'D MMMM YYYY р.',
	            LLL: 'D MMMM YYYY р., LT',
	            LLLL: 'dddd, D MMMM YYYY р., LT'
	        },
	        calendar: {
	            sameDay: processHoursFunction('[Сьогодні '),
	            nextDay: processHoursFunction('[Завтра '),
	            lastDay: processHoursFunction('[Вчора '),
	            nextWeek: processHoursFunction('[У] dddd ['),
	            lastWeek: function lastWeek() {
	                switch (this.day()) {
	                    case 0:
	                    case 3:
	                    case 5:
	                    case 6:
	                        return processHoursFunction('[Минулої] dddd [').call(this);
	                    case 1:
	                    case 2:
	                    case 4:
	                        return processHoursFunction('[Минулого] dddd [').call(this);
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'за %s',
	            past: '%s тому',
	            s: 'декілька секунд',
	            m: relativeTimeWithPlural,
	            mm: relativeTimeWithPlural,
	            h: 'годину',
	            hh: relativeTimeWithPlural,
	            d: 'день',
	            dd: relativeTimeWithPlural,
	            M: 'місяць',
	            MM: relativeTimeWithPlural,
	            y: 'рік',
	            yy: relativeTimeWithPlural
	        },

	        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason

	        meridiemParse: /ночі|ранку|дня|вечора/,
	        isPM: function isPM(input) {
	            return /^(дня|вечора)$/.test(input);
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            if (hour < 4) {
	                return 'ночі';
	            } else if (hour < 12) {
	                return 'ранку';
	            } else if (hour < 17) {
	                return 'дня';
	            } else {
	                return 'вечора';
	            }
	        },

	        ordinalParse: /\d{1,2}-(й|го)/,
	        ordinal: function ordinal(number, period) {
	            switch (period) {
	                case 'M':
	                case 'd':
	                case 'DDD':
	                case 'w':
	                case 'W':
	                    return number + '-й';
	                case 'D':
	                    return number + '-го';
	                default:
	                    return number;
	            }
	        },

	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	});

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : uzbek (uz)
	// author : Sardor Muminov : https://github.com/muminoff

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('uz', {
	        months: 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
	        monthsShort: 'янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек'.split('_'),
	        weekdays: 'Якшанба_Душанба_Сешанба_Чоршанба_Пайшанба_Жума_Шанба'.split('_'),
	        weekdaysShort: 'Якш_Душ_Сеш_Чор_Пай_Жум_Шан'.split('_'),
	        weekdaysMin: 'Як_Ду_Се_Чо_Па_Жу_Ша'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'D MMMM YYYY, dddd LT'
	        },
	        calendar: {
	            sameDay: '[Бугун соат] LT [да]',
	            nextDay: '[Эртага] LT [да]',
	            nextWeek: 'dddd [куни соат] LT [да]',
	            lastDay: '[Кеча соат] LT [да]',
	            lastWeek: '[Утган] dddd [куни соат] LT [да]',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'Якин %s ичида',
	            past: 'Бир неча %s олдин',
	            s: 'фурсат',
	            m: 'бир дакика',
	            mm: '%d дакика',
	            h: 'бир соат',
	            hh: '%d соат',
	            d: 'бир кун',
	            dd: '%d кун',
	            M: 'бир ой',
	            MM: '%d ой',
	            y: 'бир йил',
	            yy: '%d йил'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 7 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : vietnamese (vi)
	// author : Bang Nguyen : https://github.com/bangnk

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('vi', {
	        months: 'tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12'.split('_'),
	        monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
	        weekdays: 'chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy'.split('_'),
	        weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
	        weekdaysMin: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM [năm] YYYY',
	            LLL: 'D MMMM [năm] YYYY LT',
	            LLLL: 'dddd, D MMMM [năm] YYYY LT',
	            l: 'DD/M/YYYY',
	            ll: 'D MMM YYYY',
	            lll: 'D MMM YYYY LT',
	            llll: 'ddd, D MMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Hôm nay lúc] LT',
	            nextDay: '[Ngày mai lúc] LT',
	            nextWeek: 'dddd [tuần tới lúc] LT',
	            lastDay: '[Hôm qua lúc] LT',
	            lastWeek: 'dddd [tuần rồi lúc] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s tới',
	            past: '%s trước',
	            s: 'vài giây',
	            m: 'một phút',
	            mm: '%d phút',
	            h: 'một giờ',
	            hh: '%d giờ',
	            d: 'một ngày',
	            dd: '%d ngày',
	            M: 'một tháng',
	            MM: '%d tháng',
	            y: 'một năm',
	            yy: '%d năm'
	        },
	        ordinalParse: /\d{1,2}/,
	        ordinal: function ordinal(number) {
	            return number;
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : chinese (zh-cn)
	// author : suupic : https://github.com/suupic
	// author : Zeno Zeng : https://github.com/zenozeng

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('zh-cn', {
	        months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
	        monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
	        weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
	        weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
	        longDateFormat: {
	            LT: 'Ah点mm',
	            LTS: 'Ah点m分s秒',
	            L: 'YYYY-MM-DD',
	            LL: 'YYYY年MMMD日',
	            LLL: 'YYYY年MMMD日LT',
	            LLLL: 'YYYY年MMMD日ddddLT',
	            l: 'YYYY-MM-DD',
	            ll: 'YYYY年MMMD日',
	            lll: 'YYYY年MMMD日LT',
	            llll: 'YYYY年MMMD日ddddLT'
	        },
	        meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '凌晨' || meridiem === '早上' || meridiem === '上午') {
	                return hour;
	            } else if (meridiem === '下午' || meridiem === '晚上') {
	                return hour + 12;
	            } else {
	                // '中午'
	                return hour >= 11 ? hour : hour + 12;
	            }
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 600) {
	                return '凌晨';
	            } else if (hm < 900) {
	                return '早上';
	            } else if (hm < 1130) {
	                return '上午';
	            } else if (hm < 1230) {
	                return '中午';
	            } else if (hm < 1800) {
	                return '下午';
	            } else {
	                return '晚上';
	            }
	        },
	        calendar: {
	            sameDay: function sameDay() {
	                return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';
	            },
	            nextDay: function nextDay() {
	                return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';
	            },
	            lastDay: function lastDay() {
	                return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';
	            },
	            nextWeek: function nextWeek() {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
	                return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
	            },
	            lastWeek: function lastWeek() {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() < startOfWeek.unix() ? '[上]' : '[本]';
	                return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
	            },
	            sameElse: 'LL'
	        },
	        ordinalParse: /\d{1,2}(日|月|周)/,
	        ordinal: function ordinal(number, period) {
	            switch (period) {
	                case 'd':
	                case 'D':
	                case 'DDD':
	                    return number + '日';
	                case 'M':
	                    return number + '月';
	                case 'w':
	                case 'W':
	                    return number + '周';
	                default:
	                    return number;
	            }
	        },
	        relativeTime: {
	            future: '%s内',
	            past: '%s前',
	            s: '几秒',
	            m: '1分钟',
	            mm: '%d分钟',
	            h: '1小时',
	            hh: '%d小时',
	            d: '1天',
	            dd: '%d天',
	            M: '1个月',
	            MM: '%d个月',
	            y: '1年',
	            yy: '%d年'
	        },
	        week: {
	            // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	});

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js locale configuration
	// locale : traditional chinese (zh-tw)
	// author : Ben : https://github.com/ben-lin

	'use strict';

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
	    }
	})(function (moment) {
	    return moment.defineLocale('zh-tw', {
	        months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
	        monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
	        weekdaysShort: '週日_週一_週二_週三_週四_週五_週六'.split('_'),
	        weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
	        longDateFormat: {
	            LT: 'Ah點mm',
	            LTS: 'Ah點m分s秒',
	            L: 'YYYY年MMMD日',
	            LL: 'YYYY年MMMD日',
	            LLL: 'YYYY年MMMD日LT',
	            LLLL: 'YYYY年MMMD日ddddLT',
	            l: 'YYYY年MMMD日',
	            ll: 'YYYY年MMMD日',
	            lll: 'YYYY年MMMD日LT',
	            llll: 'YYYY年MMMD日ddddLT'
	        },
	        meridiemParse: /早上|上午|中午|下午|晚上/,
	        meridiemHour: function meridiemHour(hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '早上' || meridiem === '上午') {
	                return hour;
	            } else if (meridiem === '中午') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === '下午' || meridiem === '晚上') {
	                return hour + 12;
	            }
	        },
	        meridiem: function meridiem(hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 900) {
	                return '早上';
	            } else if (hm < 1130) {
	                return '上午';
	            } else if (hm < 1230) {
	                return '中午';
	            } else if (hm < 1800) {
	                return '下午';
	            } else {
	                return '晚上';
	            }
	        },
	        calendar: {
	            sameDay: '[今天]LT',
	            nextDay: '[明天]LT',
	            nextWeek: '[下]ddddLT',
	            lastDay: '[昨天]LT',
	            lastWeek: '[上]ddddLT',
	            sameElse: 'L'
	        },
	        ordinalParse: /\d{1,2}(日|月|週)/,
	        ordinal: function ordinal(number, period) {
	            switch (period) {
	                case 'd':
	                case 'D':
	                case 'DDD':
	                    return number + '日';
	                case 'M':
	                    return number + '月';
	                case 'w':
	                case 'W':
	                    return number + '週';
	                default:
	                    return number;
	            }
	        },
	        relativeTime: {
	            future: '%s內',
	            past: '%s前',
	            s: '幾秒',
	            m: '一分鐘',
	            mm: '%d分鐘',
	            h: '一小時',
	            hh: '%d小時',
	            d: '一天',
	            dd: '%d天',
	            M: '一個月',
	            MM: '%d個月',
	            y: '一年',
	            yy: '%d年'
	        }
	    });
	});

/***/ }
/******/ ]);