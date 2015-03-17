(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Pond"] = factory();
	else
		root["Pond"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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

	"use strict";

	exports.TimeRange = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var Immutable = __webpack_require__(3);
	var _ = __webpack_require__(2);

	var TimeRange = (function () {
	    function TimeRange(b, e) {
	        _classCallCheck(this, TimeRange);

	        if (b instanceof TimeRange) {
	            this._range = b._range;
	        } else if (b instanceof Immutable.Map) {
	            this._range = b;
	        } else if (_.isDate(b) && _.isDate(e)) {
	            this._range = Immutable.Map({ begin: new Date(b.getTime()),
	                end: new Date(e.getTime()) });
	        }
	    }

	    _createClass(TimeRange, {
	        toString: {
	            value: function toString() {
	                return ("[", this._range.get("begin") + ", " + this._range.get("end") + "]");
	            }
	        },
	        begin: {
	            value: function begin() {
	                return this._range.get("begin");
	            }
	        },
	        end: {
	            value: function end() {
	                return this._range.get("end");
	            }
	        },
	        setBegin: {

	            /**
	             * Sets a new begin time on the TimeRange. The result will be a new TimeRange.
	             * 
	             * @param {Date} - The begin time to set the start of the Timerange to.
	             */

	            value: function setBegin(t) {
	                return new TimeRange(this._range.set("begin", t));
	            }
	        },
	        setEnd: {

	            /**
	             * Sets a new end time on the TimeRange. The result will be a new TimeRange.
	             * 
	             * @param {Date} - The time to set the end of the Timerange to.
	             */

	            value: function setEnd(t) {
	                return new TimeRange(this._range.set("end", t));
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
	        }
	    });

	    return TimeRange;
	})();

	module.exports = TimeRange;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;"use strict";

	//     Underscore.js 1.8.2
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

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
	  var _ = (function (_2) {
	    var _Wrapper = function _(_x) {
	      return _2.apply(this, arguments);
	    };

	    _Wrapper.toString = function () {
	      return _2.toString();
	    };

	    return _Wrapper;
	  })(function (obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  });

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== "undefined" && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = "1.8.2";

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function optimizeCb(func, context, argCount) {
	    if (context === void 0) {
	      return func;
	    }switch (argCount == null ? 3 : argCount) {
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
	    if (value == null) {
	      return _.identity;
	    }if (_.isFunction(value)) {
	      return optimizeCb(value, context, argCount);
	    }if (_.isObject(value)) {
	      return _.matcher(value);
	    }return _.property(value);
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
	    if (!_.isObject(prototype)) {
	      return {};
	    }if (nativeCreate) {
	      return nativeCreate(prototype);
	    }Ctor.prototype = prototype;
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
	    return typeof length == "number" && length >= 0 && length <= MAX_ARRAY_INDEX;
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
	    return _.indexOf(obj, target, typeof fromIndex == "number" && fromIndex) >= 0;
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
	    }), "value");
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
	  var flatten = (function (_flatten) {
	    var _flattenWrapper = function flatten(_x, _x2, _x3, _x4) {
	      return _flatten.apply(this, arguments);
	    };

	    _flattenWrapper.toString = function () {
	      return _flatten.toString();
	    };

	    return _flattenWrapper;
	  })(function (input, shallow, strict, startIndex) {
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
	  });

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
	    var length = array && _.max(array, "length").length || 0;
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
	    if (typeof isSorted == "number") {
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
	    if (typeof from == "number") {
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
	    if (!(callingContext instanceof boundFunc)) {
	      return sourceFunc.apply(context, args);
	    }var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) {
	      return result;
	    }return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function (func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError("Bind must be called on a function");
	    var args = slice.call(arguments, 2);
	    var bound = (function (_bound) {
	      var _boundWrapper = function bound() {
	        return _bound.apply(this, arguments);
	      };

	      _boundWrapper.toString = function () {
	        return _bound.toString();
	      };

	      return _boundWrapper;
	    })(function () {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    });
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function (func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = (function (_bound) {
	      var _boundWrapper = function bound() {
	        return _bound.apply(this, arguments);
	      };

	      _boundWrapper.toString = function () {
	        return _bound.toString();
	      };

	      return _boundWrapper;
	    })(function () {
	      var position = 0,
	          length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    });
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function (obj) {
	    var i,
	        length = arguments.length,
	        key;
	    if (length <= 1) throw new Error("bindAll must be passed function names");
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function (func, hasher) {
	    var memoize = (function (_memoize) {
	      var _memoizeWrapper = function memoize(_x) {
	        return _memoize.apply(this, arguments);
	      };

	      _memoizeWrapper.toString = function () {
	        return _memoize.toString();
	      };

	      return _memoizeWrapper;
	    })(function (key) {
	      var cache = memoize.cache;
	      var address = "" + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    });
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

	    var later = (function (_later) {
	      var _laterWrapper = function later() {
	        return _later.apply(this, arguments);
	      };

	      _laterWrapper.toString = function () {
	        return _later.toString();
	      };

	      return _laterWrapper;
	    })(function () {
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
	    });

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
	  var hasEnumBug = !({ toString: null }).propertyIsEnumerable("toString");
	  var nonEnumerableProps = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

	    // Constructor is a special case.
	    var prop = "constructor";
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
	  var eq = (function (_eq) {
	    var _eqWrapper = function eq(_x, _x2, _x3, _x4) {
	      return _eq.apply(this, arguments);
	    };

	    _eqWrapper.toString = function () {
	      return _eq.toString();
	    };

	    return _eqWrapper;
	  })(function (a, b, aStack, bStack) {
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
	      case "[object RegExp]":
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case "[object String]":
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return "" + a === "" + b;
	      case "[object Number]":
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case "[object Date]":
	      case "[object Boolean]":
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === "[object Array]";
	    if (!areArrays) {
	      if (typeof a != "object" || typeof b != "object") return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor,
	          bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ("constructor" in a && "constructor" in b)) {
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
	  });

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
	    return toString.call(obj) === "[object Array]";
	  };

	  // Is a given variable an object?
	  _.isObject = function (obj) {
	    var type = typeof obj;
	    return type === "function" || type === "object" && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function (name) {
	    _["is" + name] = function (obj) {
	      return toString.call(obj) === "[object " + name + "]";
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function (obj) {
	      return _.has(obj, "callee");
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != "function" && typeof Int8Array != "object") {
	    _.isFunction = function (obj) {
	      return typeof obj == "function" || false;
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
	    return obj === true || obj === false || toString.call(obj) === "[object Boolean]";
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
	    "&": "&amp;",
	    "<": "&lt;",
	    ">": "&gt;",
	    "\"": "&quot;",
	    "'": "&#x27;",
	    "`": "&#x60;"
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function createEscaper(map) {
	    var escaper = function escaper(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = "(?:" + _.keys(map).join("|") + ")";
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, "g");
	    return function (string) {
	      string = string == null ? "" : "" + string;
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
	    var id = ++idCounter + "";
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
	    "'": "'",
	    "\\": "\\",
	    "\r": "r",
	    "\n": "n",
	    "\u2028": "u2028",
	    "\u2029": "u2029"
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function escapeChar(match) {
	    return "\\" + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function (text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join("|") + "|$", "g");

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";

	    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";

	    try {
	      var render = new Function(settings.variable || "obj", "_", source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function template(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || "obj";
	    template.source = "function(" + argument + "){\n" + source + "}";

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
	  _.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function () {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === "shift" || name === "splice") && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(["concat", "join", "slice"], function (name) {
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
	    return "" + this._wrapped;
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";(function(global, factory){true?module.exports = factory():typeof define === "function" && define.amd?define(factory):global.Immutable = factory();})(undefined, function(){"use strict";var SLICE$0=Array.prototype.slice;function createClass(ctor, superClass){if(superClass){ctor.prototype = Object.create(superClass.prototype);}ctor.prototype.constructor = ctor;}var DELETE="delete";var SHIFT=5;var SIZE=1 << SHIFT;var MASK=SIZE - 1;var NOT_SET={};var CHANGE_LENGTH={value:false};var DID_ALTER={value:false};function MakeRef(ref){ref.value = false;return ref;}function SetRef(ref){ref && (ref.value = true);}function OwnerID(){}function arrCopy(arr, offset){offset = offset || 0;var len=Math.max(0, arr.length - offset);var newArr=new Array(len);for(var ii=0; ii < len; ii++) {newArr[ii] = arr[ii + offset];}return newArr;}function ensureSize(iter){if(iter.size === undefined){iter.size = iter.__iterate(returnTrue);}return iter.size;}function wrapIndex(iter, index){return index >= 0?+index:ensureSize(iter) + +index;}function returnTrue(){return true;}function wholeSlice(begin, end, size){return (begin === 0 || size !== undefined && begin <= -size) && (end === undefined || size !== undefined && end >= size);}function resolveBegin(begin, size){return resolveIndex(begin, size, 0);}function resolveEnd(end, size){return resolveIndex(end, size, size);}function resolveIndex(index, size, defaultIndex){return index === undefined?defaultIndex:index < 0?Math.max(0, size + index):size === undefined?index:Math.min(size, index);}function Iterable(value){return isIterable(value)?value:Seq(value);}createClass(KeyedIterable, Iterable);function KeyedIterable(value){return isKeyed(value)?value:KeyedSeq(value);}createClass(IndexedIterable, Iterable);function IndexedIterable(value){return isIndexed(value)?value:IndexedSeq(value);}createClass(SetIterable, Iterable);function SetIterable(value){return isIterable(value) && !isAssociative(value)?value:SetSeq(value);}function isIterable(maybeIterable){return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);}function isKeyed(maybeKeyed){return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);}function isIndexed(maybeIndexed){return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);}function isAssociative(maybeAssociative){return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);}function isOrdered(maybeOrdered){return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);}Iterable.isIterable = isIterable;Iterable.isKeyed = isKeyed;Iterable.isIndexed = isIndexed;Iterable.isAssociative = isAssociative;Iterable.isOrdered = isOrdered;Iterable.Keyed = KeyedIterable;Iterable.Indexed = IndexedIterable;Iterable.Set = SetIterable;var IS_ITERABLE_SENTINEL="@@__IMMUTABLE_ITERABLE__@@";var IS_KEYED_SENTINEL="@@__IMMUTABLE_KEYED__@@";var IS_INDEXED_SENTINEL="@@__IMMUTABLE_INDEXED__@@";var IS_ORDERED_SENTINEL="@@__IMMUTABLE_ORDERED__@@";var ITERATE_KEYS=0;var ITERATE_VALUES=1;var ITERATE_ENTRIES=2;var REAL_ITERATOR_SYMBOL=typeof Symbol === "function" && Symbol.iterator;var FAUX_ITERATOR_SYMBOL="@@iterator";var ITERATOR_SYMBOL=REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;function src_Iterator__Iterator(next){this.next = next;}src_Iterator__Iterator.prototype.toString = function(){return "[Iterator]";};src_Iterator__Iterator.KEYS = ITERATE_KEYS;src_Iterator__Iterator.VALUES = ITERATE_VALUES;src_Iterator__Iterator.ENTRIES = ITERATE_ENTRIES;src_Iterator__Iterator.prototype.inspect = src_Iterator__Iterator.prototype.toSource = function(){return this.toString();};src_Iterator__Iterator.prototype[ITERATOR_SYMBOL] = function(){return this;};function iteratorValue(type, k, v, iteratorResult){var value=type === 0?k:type === 1?v:[k, v];iteratorResult?iteratorResult.value = value:iteratorResult = {value:value, done:false};return iteratorResult;}function iteratorDone(){return {value:undefined, done:true};}function hasIterator(maybeIterable){return !!getIteratorFn(maybeIterable);}function isIterator(maybeIterator){return maybeIterator && typeof maybeIterator.next === "function";}function getIterator(iterable){var iteratorFn=getIteratorFn(iterable);return iteratorFn && iteratorFn.call(iterable);}function getIteratorFn(iterable){var iteratorFn=iterable && (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL] || iterable[FAUX_ITERATOR_SYMBOL]);if(typeof iteratorFn === "function"){return iteratorFn;}}function isArrayLike(value){return value && typeof value.length === "number";}createClass(Seq, Iterable);function Seq(value){return value === null || value === undefined?emptySequence():isIterable(value)?value.toSeq():seqFromValue(value);}Seq.of = function(){return Seq(arguments);};Seq.prototype.toSeq = function(){return this;};Seq.prototype.toString = function(){return this.__toString("Seq {", "}");};Seq.prototype.cacheResult = function(){if(!this._cache && this.__iterateUncached){this._cache = this.entrySeq().toArray();this.size = this._cache.length;}return this;};Seq.prototype.__iterate = function(fn, reverse){return seqIterate(this, fn, reverse, true);};Seq.prototype.__iterator = function(type, reverse){return seqIterator(this, type, reverse, true);};createClass(KeyedSeq, Seq);function KeyedSeq(value){return value === null || value === undefined?emptySequence().toKeyedSeq():isIterable(value)?isKeyed(value)?value.toSeq():value.fromEntrySeq():keyedSeqFromValue(value);}KeyedSeq.prototype.toKeyedSeq = function(){return this;};createClass(IndexedSeq, Seq);function IndexedSeq(value){return value === null || value === undefined?emptySequence():!isIterable(value)?indexedSeqFromValue(value):isKeyed(value)?value.entrySeq():value.toIndexedSeq();}IndexedSeq.of = function(){return IndexedSeq(arguments);};IndexedSeq.prototype.toIndexedSeq = function(){return this;};IndexedSeq.prototype.toString = function(){return this.__toString("Seq [", "]");};IndexedSeq.prototype.__iterate = function(fn, reverse){return seqIterate(this, fn, reverse, false);};IndexedSeq.prototype.__iterator = function(type, reverse){return seqIterator(this, type, reverse, false);};createClass(SetSeq, Seq);function SetSeq(value){return (value === null || value === undefined?emptySequence():!isIterable(value)?indexedSeqFromValue(value):isKeyed(value)?value.entrySeq():value).toSetSeq();}SetSeq.of = function(){return SetSeq(arguments);};SetSeq.prototype.toSetSeq = function(){return this;};Seq.isSeq = isSeq;Seq.Keyed = KeyedSeq;Seq.Set = SetSeq;Seq.Indexed = IndexedSeq;var IS_SEQ_SENTINEL="@@__IMMUTABLE_SEQ__@@";Seq.prototype[IS_SEQ_SENTINEL] = true;createClass(ArraySeq, IndexedSeq);function ArraySeq(array){this._array = array;this.size = array.length;}ArraySeq.prototype.get = function(index, notSetValue){return this.has(index)?this._array[wrapIndex(this, index)]:notSetValue;};ArraySeq.prototype.__iterate = function(fn, reverse){var array=this._array;var maxIndex=array.length - 1;for(var ii=0; ii <= maxIndex; ii++) {if(fn(array[reverse?maxIndex - ii:ii], ii, this) === false){return ii + 1;}}return ii;};ArraySeq.prototype.__iterator = function(type, reverse){var array=this._array;var maxIndex=array.length - 1;var ii=0;return new src_Iterator__Iterator(function(){return ii > maxIndex?iteratorDone():iteratorValue(type, ii, array[reverse?maxIndex - ii++:ii++]);});};createClass(ObjectSeq, KeyedSeq);function ObjectSeq(object){var keys=Object.keys(object);this._object = object;this._keys = keys;this.size = keys.length;}ObjectSeq.prototype.get = function(key, notSetValue){if(notSetValue !== undefined && !this.has(key)){return notSetValue;}return this._object[key];};ObjectSeq.prototype.has = function(key){return this._object.hasOwnProperty(key);};ObjectSeq.prototype.__iterate = function(fn, reverse){var object=this._object;var keys=this._keys;var maxIndex=keys.length - 1;for(var ii=0; ii <= maxIndex; ii++) {var key=keys[reverse?maxIndex - ii:ii];if(fn(object[key], key, this) === false){return ii + 1;}}return ii;};ObjectSeq.prototype.__iterator = function(type, reverse){var object=this._object;var keys=this._keys;var maxIndex=keys.length - 1;var ii=0;return new src_Iterator__Iterator(function(){var key=keys[reverse?maxIndex - ii:ii];return ii++ > maxIndex?iteratorDone():iteratorValue(type, key, object[key]);});};ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;createClass(IterableSeq, IndexedSeq);function IterableSeq(iterable){this._iterable = iterable;this.size = iterable.length || iterable.size;}IterableSeq.prototype.__iterateUncached = function(fn, reverse){if(reverse){return this.cacheResult().__iterate(fn, reverse);}var iterable=this._iterable;var iterator=getIterator(iterable);var iterations=0;if(isIterator(iterator)){var step;while(!(step = iterator.next()).done) {if(fn(step.value, iterations++, this) === false){break;}}}return iterations;};IterableSeq.prototype.__iteratorUncached = function(type, reverse){if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterable=this._iterable;var iterator=getIterator(iterable);if(!isIterator(iterator)){return new src_Iterator__Iterator(iteratorDone);}var iterations=0;return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, iterations++, step.value);});};createClass(IteratorSeq, IndexedSeq);function IteratorSeq(iterator){this._iterator = iterator;this._iteratorCache = [];}IteratorSeq.prototype.__iterateUncached = function(fn, reverse){if(reverse){return this.cacheResult().__iterate(fn, reverse);}var iterator=this._iterator;var cache=this._iteratorCache;var iterations=0;while(iterations < cache.length) {if(fn(cache[iterations], iterations++, this) === false){return iterations;}}var step;while(!(step = iterator.next()).done) {var val=step.value;cache[iterations] = val;if(fn(val, iterations++, this) === false){break;}}return iterations;};IteratorSeq.prototype.__iteratorUncached = function(type, reverse){if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=this._iterator;var cache=this._iteratorCache;var iterations=0;return new src_Iterator__Iterator(function(){if(iterations >= cache.length){var step=iterator.next();if(step.done){return step;}cache[iterations] = step.value;}return iteratorValue(type, iterations, cache[iterations++]);});};function isSeq(maybeSeq){return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);}var EMPTY_SEQ;function emptySequence(){return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));}function keyedSeqFromValue(value){var seq=Array.isArray(value)?new ArraySeq(value).fromEntrySeq():isIterator(value)?new IteratorSeq(value).fromEntrySeq():hasIterator(value)?new IterableSeq(value).fromEntrySeq():typeof value === "object"?new ObjectSeq(value):undefined;if(!seq){throw new TypeError("Expected Array or iterable object of [k, v] entries, " + "or keyed object: " + value);}return seq;}function indexedSeqFromValue(value){var seq=maybeIndexedSeqFromValue(value);if(!seq){throw new TypeError("Expected Array or iterable object of values: " + value);}return seq;}function seqFromValue(value){var seq=maybeIndexedSeqFromValue(value) || typeof value === "object" && new ObjectSeq(value);if(!seq){throw new TypeError("Expected Array or iterable object of values, or keyed object: " + value);}return seq;}function maybeIndexedSeqFromValue(value){return isArrayLike(value)?new ArraySeq(value):isIterator(value)?new IteratorSeq(value):hasIterator(value)?new IterableSeq(value):undefined;}function seqIterate(seq, fn, reverse, useKeys){var cache=seq._cache;if(cache){var maxIndex=cache.length - 1;for(var ii=0; ii <= maxIndex; ii++) {var entry=cache[reverse?maxIndex - ii:ii];if(fn(entry[1], useKeys?entry[0]:ii, seq) === false){return ii + 1;}}return ii;}return seq.__iterateUncached(fn, reverse);}function seqIterator(seq, type, reverse, useKeys){var cache=seq._cache;if(cache){var maxIndex=cache.length - 1;var ii=0;return new src_Iterator__Iterator(function(){var entry=cache[reverse?maxIndex - ii:ii];return ii++ > maxIndex?iteratorDone():iteratorValue(type, useKeys?entry[0]:ii - 1, entry[1]);});}return seq.__iteratorUncached(type, reverse);}createClass(Collection, Iterable);function Collection(){throw TypeError("Abstract");}createClass(KeyedCollection, Collection);function KeyedCollection(){}createClass(IndexedCollection, Collection);function IndexedCollection(){}createClass(SetCollection, Collection);function SetCollection(){}Collection.Keyed = KeyedCollection;Collection.Indexed = IndexedCollection;Collection.Set = SetCollection;function is(valueA, valueB){if(valueA === valueB || valueA !== valueA && valueB !== valueB){return true;}if(!valueA || !valueB){return false;}if(typeof valueA.valueOf === "function" && typeof valueB.valueOf === "function"){valueA = valueA.valueOf();valueB = valueB.valueOf();}return typeof valueA.equals === "function" && typeof valueB.equals === "function"?valueA.equals(valueB):valueA === valueB || valueA !== valueA && valueB !== valueB;}function fromJS(json, converter){return converter?fromJSWith(converter, json, "", {"":json}):fromJSDefault(json);}function fromJSWith(converter, json, key, parentJSON){if(Array.isArray(json)){return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k){return fromJSWith(converter, v, k, json);}));}if(isPlainObj(json)){return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k){return fromJSWith(converter, v, k, json);}));}return json;}function fromJSDefault(json){if(Array.isArray(json)){return IndexedSeq(json).map(fromJSDefault).toList();}if(isPlainObj(json)){return KeyedSeq(json).map(fromJSDefault).toMap();}return json;}function isPlainObj(value){return value && (value.constructor === Object || value.constructor === undefined);}var src_Math__imul=typeof Math.imul === "function" && Math.imul(4294967295, 2) === -2?Math.imul:function src_Math__imul(a, b){a = a | 0;b = b | 0;var c=a & 65535;var d=b & 65535;return c * d + ((a >>> 16) * d + c * (b >>> 16) << 16 >>> 0) | 0;};function smi(i32){return i32 >>> 1 & 1073741824 | i32 & 3221225471;}function hash(o){if(o === false || o === null || o === undefined){return 0;}if(typeof o.valueOf === "function"){o = o.valueOf();if(o === false || o === null || o === undefined){return 0;}}if(o === true){return 1;}var type=typeof o;if(type === "number"){var h=o | 0;if(h !== o){h ^= o * 4294967295;}while(o > 4294967295) {o /= 4294967295;h ^= o;}return smi(h);}if(type === "string"){return o.length > STRING_HASH_CACHE_MIN_STRLEN?cachedHashString(o):hashString(o);}if(typeof o.hashCode === "function"){return o.hashCode();}return hashJSObj(o);}function cachedHashString(string){var hash=stringHashCache[string];if(hash === undefined){hash = hashString(string);if(STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE){STRING_HASH_CACHE_SIZE = 0;stringHashCache = {};}STRING_HASH_CACHE_SIZE++;stringHashCache[string] = hash;}return hash;}function hashString(string){var hash=0;for(var ii=0; ii < string.length; ii++) {hash = 31 * hash + string.charCodeAt(ii) | 0;}return smi(hash);}function hashJSObj(obj){var hash=weakMap && weakMap.get(obj);if(hash){return hash;}hash = obj[UID_HASH_KEY];if(hash){return hash;}if(!canDefineProperty){hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];if(hash){return hash;}hash = getIENodeHash(obj);if(hash){return hash;}}if(Object.isExtensible && !Object.isExtensible(obj)){throw new Error("Non-extensible objects are not allowed as keys.");}hash = ++objHashUID;if(objHashUID & 1073741824){objHashUID = 0;}if(weakMap){weakMap.set(obj, hash);}else if(canDefineProperty){Object.defineProperty(obj, UID_HASH_KEY, {enumerable:false, configurable:false, writable:false, value:hash});}else if(obj.propertyIsEnumerable && obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable){obj.propertyIsEnumerable = function(){return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);};obj.propertyIsEnumerable[UID_HASH_KEY] = hash;}else if(obj.nodeType){obj[UID_HASH_KEY] = hash;}else {throw new Error("Unable to set a non-enumerable property on object.");}return hash;}var canDefineProperty=(function(){try{Object.defineProperty({}, "@", {});return true;}catch(e) {return false;}})();function getIENodeHash(node){if(node && node.nodeType > 0){switch(node.nodeType){case 1:return node.uniqueID;case 9:return node.documentElement && node.documentElement.uniqueID;}}}var weakMap=typeof WeakMap === "function" && new WeakMap();var objHashUID=0;var UID_HASH_KEY="__immutablehash__";if(typeof Symbol === "function"){UID_HASH_KEY = Symbol(UID_HASH_KEY);}var STRING_HASH_CACHE_MIN_STRLEN=16;var STRING_HASH_CACHE_MAX_SIZE=255;var STRING_HASH_CACHE_SIZE=0;var stringHashCache={};function invariant(condition, error){if(!condition)throw new Error(error);}function assertNotInfinite(size){invariant(size !== Infinity, "Cannot perform this action with an infinite size.");}createClass(ToKeyedSequence, KeyedSeq);function ToKeyedSequence(indexed, useKeys){this._iter = indexed;this._useKeys = useKeys;this.size = indexed.size;}ToKeyedSequence.prototype.get = function(key, notSetValue){return this._iter.get(key, notSetValue);};ToKeyedSequence.prototype.has = function(key){return this._iter.has(key);};ToKeyedSequence.prototype.valueSeq = function(){return this._iter.valueSeq();};ToKeyedSequence.prototype.reverse = function(){var this$0=this;var reversedSequence=reverseFactory(this, true);if(!this._useKeys){reversedSequence.valueSeq = function(){return this$0._iter.toSeq().reverse();};}return reversedSequence;};ToKeyedSequence.prototype.map = function(mapper, context){var this$0=this;var mappedSequence=mapFactory(this, mapper, context);if(!this._useKeys){mappedSequence.valueSeq = function(){return this$0._iter.toSeq().map(mapper, context);};}return mappedSequence;};ToKeyedSequence.prototype.__iterate = function(fn, reverse){var this$0=this;var ii;return this._iter.__iterate(this._useKeys?function(v, k){return fn(v, k, this$0);}:(ii = reverse?resolveSize(this):0, function(v){return fn(v, reverse?--ii:ii++, this$0);}), reverse);};ToKeyedSequence.prototype.__iterator = function(type, reverse){if(this._useKeys){return this._iter.__iterator(type, reverse);}var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);var ii=reverse?resolveSize(this):0;return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, reverse?--ii:ii++, step.value, step);});};ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;createClass(ToIndexedSequence, IndexedSeq);function ToIndexedSequence(iter){this._iter = iter;this.size = iter.size;}ToIndexedSequence.prototype.contains = function(value){return this._iter.contains(value);};ToIndexedSequence.prototype.__iterate = function(fn, reverse){var this$0=this;var iterations=0;return this._iter.__iterate(function(v){return fn(v, iterations++, this$0);}, reverse);};ToIndexedSequence.prototype.__iterator = function(type, reverse){var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);var iterations=0;return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, iterations++, step.value, step);});};createClass(ToSetSequence, SetSeq);function ToSetSequence(iter){this._iter = iter;this.size = iter.size;}ToSetSequence.prototype.has = function(key){return this._iter.contains(key);};ToSetSequence.prototype.__iterate = function(fn, reverse){var this$0=this;return this._iter.__iterate(function(v){return fn(v, v, this$0);}, reverse);};ToSetSequence.prototype.__iterator = function(type, reverse){var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);return new src_Iterator__Iterator(function(){var step=iterator.next();return step.done?step:iteratorValue(type, step.value, step.value, step);});};createClass(FromEntriesSequence, KeyedSeq);function FromEntriesSequence(entries){this._iter = entries;this.size = entries.size;}FromEntriesSequence.prototype.entrySeq = function(){return this._iter.toSeq();};FromEntriesSequence.prototype.__iterate = function(fn, reverse){var this$0=this;return this._iter.__iterate(function(entry){if(entry){validateEntry(entry);return fn(entry[1], entry[0], this$0);}}, reverse);};FromEntriesSequence.prototype.__iterator = function(type, reverse){var iterator=this._iter.__iterator(ITERATE_VALUES, reverse);return new src_Iterator__Iterator(function(){while(true) {var step=iterator.next();if(step.done){return step;}var entry=step.value;if(entry){validateEntry(entry);return type === ITERATE_ENTRIES?step:iteratorValue(type, entry[0], entry[1], step);}}});};ToIndexedSequence.prototype.cacheResult = ToKeyedSequence.prototype.cacheResult = ToSetSequence.prototype.cacheResult = FromEntriesSequence.prototype.cacheResult = cacheResultThrough;function flipFactory(iterable){var flipSequence=makeSequence(iterable);flipSequence._iter = iterable;flipSequence.size = iterable.size;flipSequence.flip = function(){return iterable;};flipSequence.reverse = function(){var reversedSequence=iterable.reverse.apply(this);reversedSequence.flip = function(){return iterable.reverse();};return reversedSequence;};flipSequence.has = function(key){return iterable.contains(key);};flipSequence.contains = function(key){return iterable.has(key);};flipSequence.cacheResult = cacheResultThrough;flipSequence.__iterateUncached = function(fn, reverse){var this$0=this;return iterable.__iterate(function(v, k){return fn(k, v, this$0) !== false;}, reverse);};flipSequence.__iteratorUncached = function(type, reverse){if(type === ITERATE_ENTRIES){var iterator=iterable.__iterator(type, reverse);return new src_Iterator__Iterator(function(){var step=iterator.next();if(!step.done){var k=step.value[0];step.value[0] = step.value[1];step.value[1] = k;}return step;});}return iterable.__iterator(type === ITERATE_VALUES?ITERATE_KEYS:ITERATE_VALUES, reverse);};return flipSequence;}function mapFactory(iterable, mapper, context){var mappedSequence=makeSequence(iterable);mappedSequence.size = iterable.size;mappedSequence.has = function(key){return iterable.has(key);};mappedSequence.get = function(key, notSetValue){var v=iterable.get(key, NOT_SET);return v === NOT_SET?notSetValue:mapper.call(context, v, key, iterable);};mappedSequence.__iterateUncached = function(fn, reverse){var this$0=this;return iterable.__iterate(function(v, k, c){return fn(mapper.call(context, v, k, c), k, this$0) !== false;}, reverse);};mappedSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);return new src_Iterator__Iterator(function(){var step=iterator.next();if(step.done){return step;}var entry=step.value;var key=entry[0];return iteratorValue(type, key, mapper.call(context, entry[1], key, iterable), step);});};return mappedSequence;}function reverseFactory(iterable, useKeys){var reversedSequence=makeSequence(iterable);reversedSequence._iter = iterable;reversedSequence.size = iterable.size;reversedSequence.reverse = function(){return iterable;};if(iterable.flip){reversedSequence.flip = function(){var flipSequence=flipFactory(iterable);flipSequence.reverse = function(){return iterable.flip();};return flipSequence;};}reversedSequence.get = function(key, notSetValue){return iterable.get(useKeys?key:-1 - key, notSetValue);};reversedSequence.has = function(key){return iterable.has(useKeys?key:-1 - key);};reversedSequence.contains = function(value){return iterable.contains(value);};reversedSequence.cacheResult = cacheResultThrough;reversedSequence.__iterate = function(fn, reverse){var this$0=this;return iterable.__iterate(function(v, k){return fn(v, k, this$0);}, !reverse);};reversedSequence.__iterator = function(type, reverse){return iterable.__iterator(type, !reverse);};return reversedSequence;}function filterFactory(iterable, predicate, context, useKeys){var filterSequence=makeSequence(iterable);if(useKeys){filterSequence.has = function(key){var v=iterable.get(key, NOT_SET);return v !== NOT_SET && !!predicate.call(context, v, key, iterable);};filterSequence.get = function(key, notSetValue){var v=iterable.get(key, NOT_SET);return v !== NOT_SET && predicate.call(context, v, key, iterable)?v:notSetValue;};}filterSequence.__iterateUncached = function(fn, reverse){var this$0=this;var iterations=0;iterable.__iterate(function(v, k, c){if(predicate.call(context, v, k, c)){iterations++;return fn(v, useKeys?k:iterations - 1, this$0);}}, reverse);return iterations;};filterSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);var iterations=0;return new src_Iterator__Iterator(function(){while(true) {var step=iterator.next();if(step.done){return step;}var entry=step.value;var key=entry[0];var value=entry[1];if(predicate.call(context, value, key, iterable)){return iteratorValue(type, useKeys?key:iterations++, value, step);}}});};return filterSequence;}function countByFactory(iterable, grouper, context){var groups=src_Map__Map().asMutable();iterable.__iterate(function(v, k){groups.update(grouper.call(context, v, k, iterable), 0, function(a){return a + 1;});});return groups.asImmutable();}function groupByFactory(iterable, grouper, context){var isKeyedIter=isKeyed(iterable);var groups=(isOrdered(iterable)?OrderedMap():src_Map__Map()).asMutable();iterable.__iterate(function(v, k){groups.update(grouper.call(context, v, k, iterable), function(a){return (a = a || [], a.push(isKeyedIter?[k, v]:v), a);});});var coerce=iterableClass(iterable);return groups.map(function(arr){return reify(iterable, coerce(arr));});}function sliceFactory(_x, _x2, _x3, _x4){var _again=true;_function: while(_again) {_again = false;var iterable=_x, begin=_x2, end=_x3, useKeys=_x4;originalSize = resolvedBegin = resolvedEnd = sliceSize = sliceSeq = undefined;var originalSize=iterable.size;if(wholeSlice(begin, end, originalSize)){return iterable;}var resolvedBegin=resolveBegin(begin, originalSize);var resolvedEnd=resolveEnd(end, originalSize);if(resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd){_x = iterable.toSeq().cacheResult();_x2 = begin;_x3 = end;_x4 = useKeys;_again = true;continue _function;}var sliceSize=resolvedEnd - resolvedBegin;if(sliceSize < 0){sliceSize = 0;}var sliceSeq=makeSequence(iterable);sliceSeq.size = sliceSize === 0?sliceSize:iterable.size && sliceSize || undefined;if(!useKeys && isSeq(iterable) && sliceSize >= 0){sliceSeq.get = function(index, notSetValue){index = wrapIndex(this, index);return index >= 0 && index < sliceSize?iterable.get(index + resolvedBegin, notSetValue):notSetValue;};}sliceSeq.__iterateUncached = function(fn, reverse){var this$0=this;if(sliceSize === 0){return 0;}if(reverse){return this.cacheResult().__iterate(fn, reverse);}var skipped=0;var isSkipping=true;var iterations=0;iterable.__iterate(function(v, k){if(!(isSkipping && (isSkipping = skipped++ < resolvedBegin))){iterations++;return fn(v, useKeys?k:iterations - 1, this$0) !== false && iterations !== sliceSize;}});return iterations;};sliceSeq.__iteratorUncached = function(type, reverse){if(sliceSize && reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=sliceSize && iterable.__iterator(type, reverse);var skipped=0;var iterations=0;return new src_Iterator__Iterator(function(){while(skipped++ !== resolvedBegin) {iterator.next();}if(++iterations > sliceSize){return iteratorDone();}var step=iterator.next();if(useKeys || type === ITERATE_VALUES){return step;}else if(type === ITERATE_KEYS){return iteratorValue(type, iterations - 1, undefined, step);}else {return iteratorValue(type, iterations - 1, step.value[1], step);}});};return sliceSeq;}}function takeWhileFactory(iterable, predicate, context){var takeSequence=makeSequence(iterable);takeSequence.__iterateUncached = function(fn, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterate(fn, reverse);}var iterations=0;iterable.__iterate(function(v, k, c){return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0);});return iterations;};takeSequence.__iteratorUncached = function(type, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);var iterating=true;return new src_Iterator__Iterator(function(){if(!iterating){return iteratorDone();}var step=iterator.next();if(step.done){return step;}var entry=step.value;var k=entry[0];var v=entry[1];if(!predicate.call(context, v, k, this$0)){iterating = false;return iteratorDone();}return type === ITERATE_ENTRIES?step:iteratorValue(type, k, v, step);});};return takeSequence;}function skipWhileFactory(iterable, predicate, context, useKeys){var skipSequence=makeSequence(iterable);skipSequence.__iterateUncached = function(fn, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterate(fn, reverse);}var isSkipping=true;var iterations=0;iterable.__iterate(function(v, k, c){if(!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))){iterations++;return fn(v, useKeys?k:iterations - 1, this$0);}});return iterations;};skipSequence.__iteratorUncached = function(type, reverse){var this$0=this;if(reverse){return this.cacheResult().__iterator(type, reverse);}var iterator=iterable.__iterator(ITERATE_ENTRIES, reverse);var skipping=true;var iterations=0;return new src_Iterator__Iterator(function(){var step, k, v;do{step = iterator.next();if(step.done){if(useKeys || type === ITERATE_VALUES){return step;}else if(type === ITERATE_KEYS){return iteratorValue(type, iterations++, undefined, step);}else {return iteratorValue(type, iterations++, step.value[1], step);}}var entry=step.value;k = entry[0];v = entry[1];skipping && (skipping = predicate.call(context, v, k, this$0));}while(skipping);return type === ITERATE_ENTRIES?step:iteratorValue(type, k, v, step);});};return skipSequence;}function concatFactory(iterable, values){var isKeyedIterable=isKeyed(iterable);var iters=[iterable].concat(values).map(function(v){if(!isIterable(v)){v = isKeyedIterable?keyedSeqFromValue(v):indexedSeqFromValue(Array.isArray(v)?v:[v]);}else if(isKeyedIterable){v = KeyedIterable(v);}return v;}).filter(function(v){return v.size !== 0;});if(iters.length === 0){return iterable;}if(iters.length === 1){var singleton=iters[0];if(singleton === iterable || isKeyedIterable && isKeyed(singleton) || isIndexed(iterable) && isIndexed(singleton)){return singleton;}}var concatSeq=new ArraySeq(iters);if(isKeyedIterable){concatSeq = concatSeq.toKeyedSeq();}else if(!isIndexed(iterable)){concatSeq = concatSeq.toSetSeq();}concatSeq = concatSeq.flatten(true);concatSeq.size = iters.reduce(function(sum, seq){if(sum !== undefined){var size=seq.size;if(size !== undefined){return sum + size;}}}, 0);return concatSeq;}function flattenFactory(iterable, depth, useKeys){var flatSequence=makeSequence(iterable);flatSequence.__iterateUncached = function(fn, reverse){var iterations=0;var stopped=false;function flatDeep(iter, currentDepth){var this$0=this;iter.__iterate(function(v, k){if((!depth || currentDepth < depth) && isIterable(v)){flatDeep(v, currentDepth + 1);}else if(fn(v, useKeys?k:iterations++, this$0) === false){stopped = true;}return !stopped;}, reverse);}flatDeep(iterable, 0);return iterations;};flatSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(type, reverse);var stack=[];var iterations=0;return new src_Iterator__Iterator(function(){while(iterator) {var step=iterator.next();if(step.done !== false){iterator = stack.pop();continue;}var v=step.value;if(type === ITERATE_ENTRIES){v = v[1];}if((!depth || stack.length < depth) && isIterable(v)){stack.push(iterator);iterator = v.__iterator(type, reverse);}else {return useKeys?step:iteratorValue(type, iterations++, v, step);}}return iteratorDone();});};return flatSequence;}function flatMapFactory(iterable, mapper, context){var coerce=iterableClass(iterable);return iterable.toSeq().map(function(v, k){return coerce(mapper.call(context, v, k, iterable));}).flatten(true);}function interposeFactory(iterable, separator){var interposedSequence=makeSequence(iterable);interposedSequence.size = iterable.size && iterable.size * 2 - 1;interposedSequence.__iterateUncached = function(fn, reverse){var this$0=this;var iterations=0;iterable.__iterate(function(v, k){return (!iterations || fn(separator, iterations++, this$0) !== false) && fn(v, iterations++, this$0) !== false;}, reverse);return iterations;};interposedSequence.__iteratorUncached = function(type, reverse){var iterator=iterable.__iterator(ITERATE_VALUES, reverse);var iterations=0;var step;return new src_Iterator__Iterator(function(){if(!step || iterations % 2){step = iterator.next();if(step.done){return step;}}return iterations % 2?iteratorValue(type, iterations++, separator):iteratorValue(type, iterations++, step.value, step);});};return interposedSequence;}function sortFactory(iterable, comparator, mapper){if(!comparator){comparator = defaultComparator;}var isKeyedIterable=isKeyed(iterable);var index=0;var entries=iterable.toSeq().map(function(v, k){return [k, v, index++, mapper?mapper(v, k, iterable):v];}).toArray();entries.sort(function(a, b){return comparator(a[3], b[3]) || a[2] - b[2];}).forEach(isKeyedIterable?function(v, i){entries[i].length = 2;}:function(v, i){entries[i] = v[1];});return isKeyedIterable?KeyedSeq(entries):isIndexed(iterable)?IndexedSeq(entries):SetSeq(entries);}function maxFactory(iterable, comparator, mapper){if(!comparator){comparator = defaultComparator;}if(mapper){var entry=iterable.toSeq().map(function(v, k){return [v, mapper(v, k, iterable)];}).reduce(function(a, b){return maxCompare(comparator, a[1], b[1])?b:a;});return entry && entry[0];}else {return iterable.reduce(function(a, b){return maxCompare(comparator, a, b)?b:a;});}}function maxCompare(comparator, a, b){var comp=comparator(b, a);return comp === 0 && b !== a && (b === undefined || b === null || b !== b) || comp > 0;}function zipWithFactory(keyIter, zipper, iters){var zipSequence=makeSequence(keyIter);zipSequence.size = new ArraySeq(iters).map(function(i){return i.size;}).min();zipSequence.__iterate = function(fn, reverse){var iterator=this.__iterator(ITERATE_VALUES, reverse);var step;var iterations=0;while(!(step = iterator.next()).done) {if(fn(step.value, iterations++, this) === false){break;}}return iterations;};zipSequence.__iteratorUncached = function(type, reverse){var iterators=iters.map(function(i){return (i = Iterable(i), getIterator(reverse?i.reverse():i));});var iterations=0;var isDone=false;return new src_Iterator__Iterator(function(){var steps;if(!isDone){steps = iterators.map(function(i){return i.next();});isDone = steps.some(function(s){return s.done;});}if(isDone){return iteratorDone();}return iteratorValue(type, iterations++, zipper.apply(null, steps.map(function(s){return s.value;})));});};return zipSequence;}function reify(iter, seq){return isSeq(iter)?seq:iter.constructor(seq);}function validateEntry(entry){if(entry !== Object(entry)){throw new TypeError("Expected [K, V] tuple: " + entry);}}function resolveSize(iter){assertNotInfinite(iter.size);return ensureSize(iter);}function iterableClass(iterable){return isKeyed(iterable)?KeyedIterable:isIndexed(iterable)?IndexedIterable:SetIterable;}function makeSequence(iterable){return Object.create((isKeyed(iterable)?KeyedSeq:isIndexed(iterable)?IndexedSeq:SetSeq).prototype);}function cacheResultThrough(){if(this._iter.cacheResult){this._iter.cacheResult();this.size = this._iter.size;return this;}else {return Seq.prototype.cacheResult.call(this);}}function defaultComparator(a, b){return a > b?1:a < b?-1:0;}function forceIterator(keyPath){var iter=getIterator(keyPath);if(!iter){if(!isArrayLike(keyPath)){throw new TypeError("Expected iterable or array-like: " + keyPath);}iter = getIterator(Iterable(keyPath));}return iter;}createClass(src_Map__Map, KeyedCollection);function src_Map__Map(value){return value === null || value === undefined?emptyMap():isMap(value)?value:emptyMap().withMutations(function(map){var iter=KeyedIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v, k){return map.set(k, v);});});}src_Map__Map.prototype.toString = function(){return this.__toString("Map {", "}");};src_Map__Map.prototype.get = function(k, notSetValue){return this._root?this._root.get(0, undefined, k, notSetValue):notSetValue;};src_Map__Map.prototype.set = function(k, v){return updateMap(this, k, v);};src_Map__Map.prototype.setIn = function(keyPath, v){return this.updateIn(keyPath, NOT_SET, function(){return v;});};src_Map__Map.prototype.remove = function(k){return updateMap(this, k, NOT_SET);};src_Map__Map.prototype.deleteIn = function(keyPath){return this.updateIn(keyPath, function(){return NOT_SET;});};src_Map__Map.prototype.update = function(k, notSetValue, updater){return arguments.length === 1?k(this):this.updateIn([k], notSetValue, updater);};src_Map__Map.prototype.updateIn = function(keyPath, notSetValue, updater){if(!updater){updater = notSetValue;notSetValue = undefined;}var updatedValue=updateInDeepMap(this, forceIterator(keyPath), notSetValue, updater);return updatedValue === NOT_SET?undefined:updatedValue;};src_Map__Map.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = 0;this._root = null;this.__hash = undefined;this.__altered = true;return this;}return emptyMap();};src_Map__Map.prototype.merge = function(){return mergeIntoMapWith(this, undefined, arguments);};src_Map__Map.prototype.mergeWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoMapWith(this, merger, iters);};src_Map__Map.prototype.mergeIn = function(keyPath){var iters=SLICE$0.call(arguments, 1);return this.updateIn(keyPath, emptyMap(), function(m){return m.merge.apply(m, iters);});};src_Map__Map.prototype.mergeDeep = function(){return mergeIntoMapWith(this, deepMerger(undefined), arguments);};src_Map__Map.prototype.mergeDeepWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoMapWith(this, deepMerger(merger), iters);};src_Map__Map.prototype.mergeDeepIn = function(keyPath){var iters=SLICE$0.call(arguments, 1);return this.updateIn(keyPath, emptyMap(), function(m){return m.mergeDeep.apply(m, iters);});};src_Map__Map.prototype.sort = function(comparator){return OrderedMap(sortFactory(this, comparator));};src_Map__Map.prototype.sortBy = function(mapper, comparator){return OrderedMap(sortFactory(this, comparator, mapper));};src_Map__Map.prototype.withMutations = function(fn){var mutable=this.asMutable();fn(mutable);return mutable.wasAltered()?mutable.__ensureOwner(this.__ownerID):this;};src_Map__Map.prototype.asMutable = function(){return this.__ownerID?this:this.__ensureOwner(new OwnerID());};src_Map__Map.prototype.asImmutable = function(){return this.__ensureOwner();};src_Map__Map.prototype.wasAltered = function(){return this.__altered;};src_Map__Map.prototype.__iterator = function(type, reverse){return new MapIterator(this, type, reverse);};src_Map__Map.prototype.__iterate = function(fn, reverse){var this$0=this;var iterations=0;this._root && this._root.iterate(function(entry){iterations++;return fn(entry[1], entry[0], this$0);}, reverse);return iterations;};src_Map__Map.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}if(!ownerID){this.__ownerID = ownerID;this.__altered = false;return this;}return makeMap(this.size, this._root, ownerID, this.__hash);};function isMap(maybeMap){return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);}src_Map__Map.isMap = isMap;var IS_MAP_SENTINEL="@@__IMMUTABLE_MAP__@@";var MapPrototype=src_Map__Map.prototype;MapPrototype[IS_MAP_SENTINEL] = true;MapPrototype[DELETE] = MapPrototype.remove;MapPrototype.removeIn = MapPrototype.deleteIn;function ArrayMapNode(ownerID, entries){this.ownerID = ownerID;this.entries = entries;}ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue){var entries=this.entries;for(var ii=0, len=entries.length; ii < len; ii++) {if(is(key, entries[ii][0])){return entries[ii][1];}}return notSetValue;};ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){var removed=value === NOT_SET;var entries=this.entries;var idx=0;for(var len=entries.length; idx < len; idx++) {if(is(key, entries[idx][0])){break;}}var exists=idx < len;if(exists?entries[idx][1] === value:removed){return this;}SetRef(didAlter);(removed || !exists) && SetRef(didChangeSize);if(removed && entries.length === 1){return;}if(!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE){return createNodes(ownerID, entries, key, value);}var isEditable=ownerID && ownerID === this.ownerID;var newEntries=isEditable?entries:arrCopy(entries);if(exists){if(removed){idx === len - 1?newEntries.pop():newEntries[idx] = newEntries.pop();}else {newEntries[idx] = [key, value];}}else {newEntries.push([key, value]);}if(isEditable){this.entries = newEntries;return this;}return new ArrayMapNode(ownerID, newEntries);};function BitmapIndexedNode(ownerID, bitmap, nodes){this.ownerID = ownerID;this.bitmap = bitmap;this.nodes = nodes;}BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue){if(keyHash === undefined){keyHash = hash(key);}var bit=1 << ((shift === 0?keyHash:keyHash >>> shift) & MASK);var bitmap=this.bitmap;return (bitmap & bit) === 0?notSetValue:this.nodes[popCount(bitmap & bit - 1)].get(shift + SHIFT, keyHash, key, notSetValue);};BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(keyHash === undefined){keyHash = hash(key);}var keyHashFrag=(shift === 0?keyHash:keyHash >>> shift) & MASK;var bit=1 << keyHashFrag;var bitmap=this.bitmap;var exists=(bitmap & bit) !== 0;if(!exists && value === NOT_SET){return this;}var idx=popCount(bitmap & bit - 1);var nodes=this.nodes;var node=exists?nodes[idx]:undefined;var newNode=updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);if(newNode === node){return this;}if(!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE){return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);}if(exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])){return nodes[idx ^ 1];}if(exists && newNode && nodes.length === 1 && isLeafNode(newNode)){return newNode;}var isEditable=ownerID && ownerID === this.ownerID;var newBitmap=exists?newNode?bitmap:bitmap ^ bit:bitmap | bit;var newNodes=exists?newNode?setIn(nodes, idx, newNode, isEditable):spliceOut(nodes, idx, isEditable):spliceIn(nodes, idx, newNode, isEditable);if(isEditable){this.bitmap = newBitmap;this.nodes = newNodes;return this;}return new BitmapIndexedNode(ownerID, newBitmap, newNodes);};function HashArrayMapNode(ownerID, count, nodes){this.ownerID = ownerID;this.count = count;this.nodes = nodes;}HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue){if(keyHash === undefined){keyHash = hash(key);}var idx=(shift === 0?keyHash:keyHash >>> shift) & MASK;var node=this.nodes[idx];return node?node.get(shift + SHIFT, keyHash, key, notSetValue):notSetValue;};HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(keyHash === undefined){keyHash = hash(key);}var idx=(shift === 0?keyHash:keyHash >>> shift) & MASK;var removed=value === NOT_SET;var nodes=this.nodes;var node=nodes[idx];if(removed && !node){return this;}var newNode=updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);if(newNode === node){return this;}var newCount=this.count;if(!node){newCount++;}else if(!newNode){newCount--;if(newCount < MIN_HASH_ARRAY_MAP_SIZE){return packNodes(ownerID, nodes, newCount, idx);}}var isEditable=ownerID && ownerID === this.ownerID;var newNodes=setIn(nodes, idx, newNode, isEditable);if(isEditable){this.count = newCount;this.nodes = newNodes;return this;}return new HashArrayMapNode(ownerID, newCount, newNodes);};function HashCollisionNode(ownerID, keyHash, entries){this.ownerID = ownerID;this.keyHash = keyHash;this.entries = entries;}HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue){var entries=this.entries;for(var ii=0, len=entries.length; ii < len; ii++) {if(is(key, entries[ii][0])){return entries[ii][1];}}return notSetValue;};HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(keyHash === undefined){keyHash = hash(key);}var removed=value === NOT_SET;if(keyHash !== this.keyHash){if(removed){return this;}SetRef(didAlter);SetRef(didChangeSize);return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);}var entries=this.entries;var idx=0;for(var len=entries.length; idx < len; idx++) {if(is(key, entries[idx][0])){break;}}var exists=idx < len;if(exists?entries[idx][1] === value:removed){return this;}SetRef(didAlter);(removed || !exists) && SetRef(didChangeSize);if(removed && len === 2){return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);}var isEditable=ownerID && ownerID === this.ownerID;var newEntries=isEditable?entries:arrCopy(entries);if(exists){if(removed){idx === len - 1?newEntries.pop():newEntries[idx] = newEntries.pop();}else {newEntries[idx] = [key, value];}}else {newEntries.push([key, value]);}if(isEditable){this.entries = newEntries;return this;}return new HashCollisionNode(ownerID, this.keyHash, newEntries);};function ValueNode(ownerID, keyHash, entry){this.ownerID = ownerID;this.keyHash = keyHash;this.entry = entry;}ValueNode.prototype.get = function(shift, keyHash, key, notSetValue){return is(key, this.entry[0])?this.entry[1]:notSetValue;};ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter){var removed=value === NOT_SET;var keyMatch=is(key, this.entry[0]);if(keyMatch?value === this.entry[1]:removed){return this;}SetRef(didAlter);if(removed){SetRef(didChangeSize);return;}if(keyMatch){if(ownerID && ownerID === this.ownerID){this.entry[1] = value;return this;}return new ValueNode(ownerID, this.keyHash, [key, value]);}SetRef(didChangeSize);return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);};ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate = function(fn, reverse){var entries=this.entries;for(var ii=0, maxIndex=entries.length - 1; ii <= maxIndex; ii++) {if(fn(entries[reverse?maxIndex - ii:ii]) === false){return false;}}};BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate = function(fn, reverse){var nodes=this.nodes;for(var ii=0, maxIndex=nodes.length - 1; ii <= maxIndex; ii++) {var node=nodes[reverse?maxIndex - ii:ii];if(node && node.iterate(fn, reverse) === false){return false;}}};ValueNode.prototype.iterate = function(fn, reverse){return fn(this.entry);};createClass(MapIterator, src_Iterator__Iterator);function MapIterator(map, type, reverse){this._type = type;this._reverse = reverse;this._stack = map._root && mapIteratorFrame(map._root);}MapIterator.prototype.next = function(){var type=this._type;var stack=this._stack;while(stack) {var node=stack.node;var index=stack.index++;var maxIndex;if(node.entry){if(index === 0){return mapIteratorValue(type, node.entry);}}else if(node.entries){maxIndex = node.entries.length - 1;if(index <= maxIndex){return mapIteratorValue(type, node.entries[this._reverse?maxIndex - index:index]);}}else {maxIndex = node.nodes.length - 1;if(index <= maxIndex){var subNode=node.nodes[this._reverse?maxIndex - index:index];if(subNode){if(subNode.entry){return mapIteratorValue(type, subNode.entry);}stack = this._stack = mapIteratorFrame(subNode, stack);}continue;}}stack = this._stack = this._stack.__prev;}return iteratorDone();};function mapIteratorValue(type, entry){return iteratorValue(type, entry[0], entry[1]);}function mapIteratorFrame(node, prev){return {node:node, index:0, __prev:prev};}function makeMap(size, root, ownerID, hash){var map=Object.create(MapPrototype);map.size = size;map._root = root;map.__ownerID = ownerID;map.__hash = hash;map.__altered = false;return map;}var EMPTY_MAP;function emptyMap(){return EMPTY_MAP || (EMPTY_MAP = makeMap(0));}function updateMap(map, k, v){var newRoot;var newSize;if(!map._root){if(v === NOT_SET){return map;}newSize = 1;newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);}else {var didChangeSize=MakeRef(CHANGE_LENGTH);var didAlter=MakeRef(DID_ALTER);newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);if(!didAlter.value){return map;}newSize = map.size + (didChangeSize.value?v === NOT_SET?-1:1:0);}if(map.__ownerID){map.size = newSize;map._root = newRoot;map.__hash = undefined;map.__altered = true;return map;}return newRoot?makeMap(newSize, newRoot):emptyMap();}function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter){if(!node){if(value === NOT_SET){return node;}SetRef(didAlter);SetRef(didChangeSize);return new ValueNode(ownerID, keyHash, [key, value]);}return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);}function isLeafNode(node){return node.constructor === ValueNode || node.constructor === HashCollisionNode;}function mergeIntoNode(node, ownerID, shift, keyHash, entry){if(node.keyHash === keyHash){return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);}var idx1=(shift === 0?node.keyHash:node.keyHash >>> shift) & MASK;var idx2=(shift === 0?keyHash:keyHash >>> shift) & MASK;var newNode;var nodes=idx1 === idx2?[mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)]:(newNode = new ValueNode(ownerID, keyHash, entry), idx1 < idx2?[node, newNode]:[newNode, node]);return new BitmapIndexedNode(ownerID, 1 << idx1 | 1 << idx2, nodes);}function createNodes(ownerID, entries, key, value){if(!ownerID){ownerID = new OwnerID();}var node=new ValueNode(ownerID, hash(key), [key, value]);for(var ii=0; ii < entries.length; ii++) {var entry=entries[ii];node = node.update(ownerID, 0, undefined, entry[0], entry[1]);}return node;}function packNodes(ownerID, nodes, count, excluding){var bitmap=0;var packedII=0;var packedNodes=new Array(count);for(var ii=0, bit=1, len=nodes.length; ii < len; ii++, bit <<= 1) {var node=nodes[ii];if(node !== undefined && ii !== excluding){bitmap |= bit;packedNodes[packedII++] = node;}}return new BitmapIndexedNode(ownerID, bitmap, packedNodes);}function expandNodes(ownerID, nodes, bitmap, including, node){var count=0;var expandedNodes=new Array(SIZE);for(var ii=0; bitmap !== 0; ii++, bitmap >>>= 1) {expandedNodes[ii] = bitmap & 1?nodes[count++]:undefined;}expandedNodes[including] = node;return new HashArrayMapNode(ownerID, count + 1, expandedNodes);}function mergeIntoMapWith(map, merger, iterables){var iters=[];for(var ii=0; ii < iterables.length; ii++) {var value=iterables[ii];var iter=KeyedIterable(value);if(!isIterable(value)){iter = iter.map(function(v){return fromJS(v);});}iters.push(iter);}return mergeIntoCollectionWith(map, merger, iters);}function deepMerger(merger){return function(existing, value){return existing && existing.mergeDeepWith && isIterable(value)?existing.mergeDeepWith(merger, value):merger?merger(existing, value):value;};}function mergeIntoCollectionWith(collection, merger, iters){iters = iters.filter(function(x){return x.size !== 0;});if(iters.length === 0){return collection;}if(collection.size === 0 && iters.length === 1){return collection.constructor(iters[0]);}return collection.withMutations(function(collection){var mergeIntoMap=merger?function(value, key){collection.update(key, NOT_SET, function(existing){return existing === NOT_SET?value:merger(existing, value);});}:function(value, key){collection.set(key, value);};for(var ii=0; ii < iters.length; ii++) {iters[ii].forEach(mergeIntoMap);}});}function updateInDeepMap(existing, keyPathIter, notSetValue, updater){var isNotSet=existing === NOT_SET;var step=keyPathIter.next();if(step.done){var existingValue=isNotSet?notSetValue:existing;var newValue=updater(existingValue);return newValue === existingValue?existing:newValue;}invariant(isNotSet || existing && existing.set, "invalid keyPath");var key=step.value;var nextExisting=isNotSet?NOT_SET:existing.get(key, NOT_SET);var nextUpdated=updateInDeepMap(nextExisting, keyPathIter, notSetValue, updater);return nextUpdated === nextExisting?existing:nextUpdated === NOT_SET?existing.remove(key):(isNotSet?emptyMap():existing).set(key, nextUpdated);}function popCount(x){x = x - (x >> 1 & 1431655765);x = (x & 858993459) + (x >> 2 & 858993459);x = x + (x >> 4) & 252645135;x = x + (x >> 8);x = x + (x >> 16);return x & 127;}function setIn(array, idx, val, canEdit){var newArray=canEdit?array:arrCopy(array);newArray[idx] = val;return newArray;}function spliceIn(array, idx, val, canEdit){var newLen=array.length + 1;if(canEdit && idx + 1 === newLen){array[idx] = val;return array;}var newArray=new Array(newLen);var after=0;for(var ii=0; ii < newLen; ii++) {if(ii === idx){newArray[ii] = val;after = -1;}else {newArray[ii] = array[ii + after];}}return newArray;}function spliceOut(array, idx, canEdit){var newLen=array.length - 1;if(canEdit && idx === newLen){array.pop();return array;}var newArray=new Array(newLen);var after=0;for(var ii=0; ii < newLen; ii++) {if(ii === idx){after = 1;}newArray[ii] = array[ii + after];}return newArray;}var MAX_ARRAY_MAP_SIZE=SIZE / 4;var MAX_BITMAP_INDEXED_SIZE=SIZE / 2;var MIN_HASH_ARRAY_MAP_SIZE=SIZE / 4;createClass(List, IndexedCollection);function List(value){var empty=emptyList();if(value === null || value === undefined){return empty;}if(isList(value)){return value;}var iter=IndexedIterable(value);var size=iter.size;if(size === 0){return empty;}assertNotInfinite(size);if(size > 0 && size < SIZE){return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));}return empty.withMutations(function(list){list.setSize(size);iter.forEach(function(v, i){return list.set(i, v);});});}List.of = function(){return this(arguments);};List.prototype.toString = function(){return this.__toString("List [", "]");};List.prototype.get = function(index, notSetValue){index = wrapIndex(this, index);if(index < 0 || index >= this.size){return notSetValue;}index += this._origin;var node=listNodeFor(this, index);return node && node.array[index & MASK];};List.prototype.set = function(index, value){return updateList(this, index, value);};List.prototype.remove = function(index){return !this.has(index)?this:index === 0?this.shift():index === this.size - 1?this.pop():this.splice(index, 1);};List.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = this._origin = this._capacity = 0;this._level = SHIFT;this._root = this._tail = null;this.__hash = undefined;this.__altered = true;return this;}return emptyList();};List.prototype.push = function(){var values=arguments;var oldSize=this.size;return this.withMutations(function(list){setListBounds(list, 0, oldSize + values.length);for(var ii=0; ii < values.length; ii++) {list.set(oldSize + ii, values[ii]);}});};List.prototype.pop = function(){return setListBounds(this, 0, -1);};List.prototype.unshift = function(){var values=arguments;return this.withMutations(function(list){setListBounds(list, -values.length);for(var ii=0; ii < values.length; ii++) {list.set(ii, values[ii]);}});};List.prototype.shift = function(){return setListBounds(this, 1);};List.prototype.merge = function(){return mergeIntoListWith(this, undefined, arguments);};List.prototype.mergeWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoListWith(this, merger, iters);};List.prototype.mergeDeep = function(){return mergeIntoListWith(this, deepMerger(undefined), arguments);};List.prototype.mergeDeepWith = function(merger){var iters=SLICE$0.call(arguments, 1);return mergeIntoListWith(this, deepMerger(merger), iters);};List.prototype.setSize = function(size){return setListBounds(this, 0, size);};List.prototype.slice = function(begin, end){var size=this.size;if(wholeSlice(begin, end, size)){return this;}return setListBounds(this, resolveBegin(begin, size), resolveEnd(end, size));};List.prototype.__iterator = function(type, reverse){var index=0;var values=iterateList(this, reverse);return new src_Iterator__Iterator(function(){var value=values();return value === DONE?iteratorDone():iteratorValue(type, index++, value);});};List.prototype.__iterate = function(fn, reverse){var index=0;var values=iterateList(this, reverse);var value;while((value = values()) !== DONE) {if(fn(value, index++, this) === false){break;}}return index;};List.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}if(!ownerID){this.__ownerID = ownerID;return this;}return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);};function isList(maybeList){return !!(maybeList && maybeList[IS_LIST_SENTINEL]);}List.isList = isList;var IS_LIST_SENTINEL="@@__IMMUTABLE_LIST__@@";var ListPrototype=List.prototype;ListPrototype[IS_LIST_SENTINEL] = true;ListPrototype[DELETE] = ListPrototype.remove;ListPrototype.setIn = MapPrototype.setIn;ListPrototype.deleteIn = ListPrototype.removeIn = MapPrototype.removeIn;ListPrototype.update = MapPrototype.update;ListPrototype.updateIn = MapPrototype.updateIn;ListPrototype.mergeIn = MapPrototype.mergeIn;ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;ListPrototype.withMutations = MapPrototype.withMutations;ListPrototype.asMutable = MapPrototype.asMutable;ListPrototype.asImmutable = MapPrototype.asImmutable;ListPrototype.wasAltered = MapPrototype.wasAltered;function VNode(array, ownerID){this.array = array;this.ownerID = ownerID;}VNode.prototype.removeBefore = function(ownerID, level, index){if(index === level?1 << level:0 || this.array.length === 0){return this;}var originIndex=index >>> level & MASK;if(originIndex >= this.array.length){return new VNode([], ownerID);}var removingFirst=originIndex === 0;var newChild;if(level > 0){var oldChild=this.array[originIndex];newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);if(newChild === oldChild && removingFirst){return this;}}if(removingFirst && !newChild){return this;}var editable=editableVNode(this, ownerID);if(!removingFirst){for(var ii=0; ii < originIndex; ii++) {editable.array[ii] = undefined;}}if(newChild){editable.array[originIndex] = newChild;}return editable;};VNode.prototype.removeAfter = function(ownerID, level, index){if(index === level?1 << level:0 || this.array.length === 0){return this;}var sizeIndex=index - 1 >>> level & MASK;if(sizeIndex >= this.array.length){return this;}var removingLast=sizeIndex === this.array.length - 1;var newChild;if(level > 0){var oldChild=this.array[sizeIndex];newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);if(newChild === oldChild && removingLast){return this;}}if(removingLast && !newChild){return this;}var editable=editableVNode(this, ownerID);if(!removingLast){editable.array.pop();}if(newChild){editable.array[sizeIndex] = newChild;}return editable;};var DONE={};function iterateList(list, reverse){var left=list._origin;var right=list._capacity;var tailPos=getTailOffset(right);var tail=list._tail;return iterateNodeOrLeaf(list._root, list._level, 0);function iterateNodeOrLeaf(node, level, offset){return level === 0?iterateLeaf(node, offset):iterateNode(node, level, offset);}function iterateLeaf(node, offset){var array=offset === tailPos?tail && tail.array:node && node.array;var from=offset > left?0:left - offset;var to=right - offset;if(to > SIZE){to = SIZE;}return function(){if(from === to){return DONE;}var idx=reverse?--to:from++;return array && array[idx];};}function iterateNode(node, level, offset){var values;var array=node && node.array;var from=offset > left?0:left - offset >> level;var to=(right - offset >> level) + 1;if(to > SIZE){to = SIZE;}return function(){do{if(values){var value=values();if(value !== DONE){return value;}values = null;}if(from === to){return DONE;}var idx=reverse?--to:from++;values = iterateNodeOrLeaf(array && array[idx], level - SHIFT, offset + (idx << level));}while(true);};}}function makeList(origin, capacity, level, root, tail, ownerID, hash){var list=Object.create(ListPrototype);list.size = capacity - origin;list._origin = origin;list._capacity = capacity;list._level = level;list._root = root;list._tail = tail;list.__ownerID = ownerID;list.__hash = hash;list.__altered = false;return list;}var EMPTY_LIST;function emptyList(){return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));}function updateList(list, index, value){index = wrapIndex(list, index);if(index >= list.size || index < 0){return list.withMutations(function(list){index < 0?setListBounds(list, index).set(0, value):setListBounds(list, 0, index + 1).set(index, value);});}index += list._origin;var newTail=list._tail;var newRoot=list._root;var didAlter=MakeRef(DID_ALTER);if(index >= getTailOffset(list._capacity)){newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);}else {newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);}if(!didAlter.value){return list;}if(list.__ownerID){list._root = newRoot;list._tail = newTail;list.__hash = undefined;list.__altered = true;return list;}return makeList(list._origin, list._capacity, list._level, newRoot, newTail);}function updateVNode(node, ownerID, level, index, value, didAlter){var idx=index >>> level & MASK;var nodeHas=node && idx < node.array.length;if(!nodeHas && value === undefined){return node;}var newNode;if(level > 0){var lowerNode=node && node.array[idx];var newLowerNode=updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);if(newLowerNode === lowerNode){return node;}newNode = editableVNode(node, ownerID);newNode.array[idx] = newLowerNode;return newNode;}if(nodeHas && node.array[idx] === value){return node;}SetRef(didAlter);newNode = editableVNode(node, ownerID);if(value === undefined && idx === newNode.array.length - 1){newNode.array.pop();}else {newNode.array[idx] = value;}return newNode;}function editableVNode(node, ownerID){if(ownerID && node && ownerID === node.ownerID){return node;}return new VNode(node?node.array.slice():[], ownerID);}function listNodeFor(list, rawIndex){if(rawIndex >= getTailOffset(list._capacity)){return list._tail;}if(rawIndex < 1 << list._level + SHIFT){var node=list._root;var level=list._level;while(node && level > 0) {node = node.array[rawIndex >>> level & MASK];level -= SHIFT;}return node;}}function setListBounds(list, begin, end){var owner=list.__ownerID || new OwnerID();var oldOrigin=list._origin;var oldCapacity=list._capacity;var newOrigin=oldOrigin + begin;var newCapacity=end === undefined?oldCapacity:end < 0?oldCapacity + end:oldOrigin + end;if(newOrigin === oldOrigin && newCapacity === oldCapacity){return list;}if(newOrigin >= newCapacity){return list.clear();}var newLevel=list._level;var newRoot=list._root;var offsetShift=0;while(newOrigin + offsetShift < 0) {newRoot = new VNode(newRoot && newRoot.array.length?[undefined, newRoot]:[], owner);newLevel += SHIFT;offsetShift += 1 << newLevel;}if(offsetShift){newOrigin += offsetShift;oldOrigin += offsetShift;newCapacity += offsetShift;oldCapacity += offsetShift;}var oldTailOffset=getTailOffset(oldCapacity);var newTailOffset=getTailOffset(newCapacity);while(newTailOffset >= 1 << newLevel + SHIFT) {newRoot = new VNode(newRoot && newRoot.array.length?[newRoot]:[], owner);newLevel += SHIFT;}var oldTail=list._tail;var newTail=newTailOffset < oldTailOffset?listNodeFor(list, newCapacity - 1):newTailOffset > oldTailOffset?new VNode([], owner):oldTail;if(oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length){newRoot = editableVNode(newRoot, owner);var node=newRoot;for(var level=newLevel; level > SHIFT; level -= SHIFT) {var idx=oldTailOffset >>> level & MASK;node = node.array[idx] = editableVNode(node.array[idx], owner);}node.array[oldTailOffset >>> SHIFT & MASK] = oldTail;}if(newCapacity < oldCapacity){newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);}if(newOrigin >= newTailOffset){newOrigin -= newTailOffset;newCapacity -= newTailOffset;newLevel = SHIFT;newRoot = null;newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);}else if(newOrigin > oldOrigin || newTailOffset < oldTailOffset){offsetShift = 0;while(newRoot) {var beginIndex=newOrigin >>> newLevel & MASK;if(beginIndex !== newTailOffset >>> newLevel & MASK){break;}if(beginIndex){offsetShift += (1 << newLevel) * beginIndex;}newLevel -= SHIFT;newRoot = newRoot.array[beginIndex];}if(newRoot && newOrigin > oldOrigin){newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);}if(newRoot && newTailOffset < oldTailOffset){newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);}if(offsetShift){newOrigin -= offsetShift;newCapacity -= offsetShift;}}if(list.__ownerID){list.size = newCapacity - newOrigin;list._origin = newOrigin;list._capacity = newCapacity;list._level = newLevel;list._root = newRoot;list._tail = newTail;list.__hash = undefined;list.__altered = true;return list;}return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);}function mergeIntoListWith(list, merger, iterables){var iters=[];var maxSize=0;for(var ii=0; ii < iterables.length; ii++) {var value=iterables[ii];var iter=IndexedIterable(value);if(iter.size > maxSize){maxSize = iter.size;}if(!isIterable(value)){iter = iter.map(function(v){return fromJS(v);});}iters.push(iter);}if(maxSize > list.size){list = list.setSize(maxSize);}return mergeIntoCollectionWith(list, merger, iters);}function getTailOffset(size){return size < SIZE?0:size - 1 >>> SHIFT << SHIFT;}createClass(OrderedMap, src_Map__Map);function OrderedMap(value){return value === null || value === undefined?emptyOrderedMap():isOrderedMap(value)?value:emptyOrderedMap().withMutations(function(map){var iter=KeyedIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v, k){return map.set(k, v);});});}OrderedMap.of = function(){return this(arguments);};OrderedMap.prototype.toString = function(){return this.__toString("OrderedMap {", "}");};OrderedMap.prototype.get = function(k, notSetValue){var index=this._map.get(k);return index !== undefined?this._list.get(index)[1]:notSetValue;};OrderedMap.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = 0;this._map.clear();this._list.clear();return this;}return emptyOrderedMap();};OrderedMap.prototype.set = function(k, v){return updateOrderedMap(this, k, v);};OrderedMap.prototype.remove = function(k){return updateOrderedMap(this, k, NOT_SET);};OrderedMap.prototype.wasAltered = function(){return this._map.wasAltered() || this._list.wasAltered();};OrderedMap.prototype.__iterate = function(fn, reverse){var this$0=this;return this._list.__iterate(function(entry){return entry && fn(entry[1], entry[0], this$0);}, reverse);};OrderedMap.prototype.__iterator = function(type, reverse){return this._list.fromEntrySeq().__iterator(type, reverse);};OrderedMap.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}var newMap=this._map.__ensureOwner(ownerID);var newList=this._list.__ensureOwner(ownerID);if(!ownerID){this.__ownerID = ownerID;this._map = newMap;this._list = newList;return this;}return makeOrderedMap(newMap, newList, ownerID, this.__hash);};function isOrderedMap(maybeOrderedMap){return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);}OrderedMap.isOrderedMap = isOrderedMap;OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;function makeOrderedMap(map, list, ownerID, hash){var omap=Object.create(OrderedMap.prototype);omap.size = map?map.size:0;omap._map = map;omap._list = list;omap.__ownerID = ownerID;omap.__hash = hash;return omap;}var EMPTY_ORDERED_MAP;function emptyOrderedMap(){return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));}function updateOrderedMap(omap, k, v){var map=omap._map;var list=omap._list;var i=map.get(k);var has=i !== undefined;var newMap;var newList;if(v === NOT_SET){if(!has){return omap;}if(list.size >= SIZE && list.size >= map.size * 2){newList = list.filter(function(entry, idx){return entry !== undefined && i !== idx;});newMap = newList.toKeyedSeq().map(function(entry){return entry[0];}).flip().toMap();if(omap.__ownerID){newMap.__ownerID = newList.__ownerID = omap.__ownerID;}}else {newMap = map.remove(k);newList = i === list.size - 1?list.pop():list.set(i, undefined);}}else {if(has){if(v === list.get(i)[1]){return omap;}newMap = map;newList = list.set(i, [k, v]);}else {newMap = map.set(k, list.size);newList = list.set(list.size, [k, v]);}}if(omap.__ownerID){omap.size = newMap.size;omap._map = newMap;omap._list = newList;omap.__hash = undefined;return omap;}return makeOrderedMap(newMap, newList);}createClass(Stack, IndexedCollection);function Stack(value){return value === null || value === undefined?emptyStack():isStack(value)?value:emptyStack().unshiftAll(value);}Stack.of = function(){return this(arguments);};Stack.prototype.toString = function(){return this.__toString("Stack [", "]");};Stack.prototype.get = function(index, notSetValue){var head=this._head;index = wrapIndex(this, index);while(head && index--) {head = head.next;}return head?head.value:notSetValue;};Stack.prototype.peek = function(){return this._head && this._head.value;};Stack.prototype.push = function(){if(arguments.length === 0){return this;}var newSize=this.size + arguments.length;var head=this._head;for(var ii=arguments.length - 1; ii >= 0; ii--) {head = {value:arguments[ii], next:head};}if(this.__ownerID){this.size = newSize;this._head = head;this.__hash = undefined;this.__altered = true;return this;}return makeStack(newSize, head);};Stack.prototype.pushAll = function(iter){iter = IndexedIterable(iter);if(iter.size === 0){return this;}assertNotInfinite(iter.size);var newSize=this.size;var head=this._head;iter.reverse().forEach(function(value){newSize++;head = {value:value, next:head};});if(this.__ownerID){this.size = newSize;this._head = head;this.__hash = undefined;this.__altered = true;return this;}return makeStack(newSize, head);};Stack.prototype.pop = function(){return this.slice(1);};Stack.prototype.unshift = function(){return this.push.apply(this, arguments);};Stack.prototype.unshiftAll = function(iter){return this.pushAll(iter);};Stack.prototype.shift = function(){return this.pop.apply(this, arguments);};Stack.prototype.clear = function(){if(this.size === 0){return this;}if(this.__ownerID){this.size = 0;this._head = undefined;this.__hash = undefined;this.__altered = true;return this;}return emptyStack();};Stack.prototype.slice = function(begin, end){if(wholeSlice(begin, end, this.size)){return this;}var resolvedBegin=resolveBegin(begin, this.size);var resolvedEnd=resolveEnd(end, this.size);if(resolvedEnd !== this.size){return IndexedCollection.prototype.slice.call(this, begin, end);}var newSize=this.size - resolvedBegin;var head=this._head;while(resolvedBegin--) {head = head.next;}if(this.__ownerID){this.size = newSize;this._head = head;this.__hash = undefined;this.__altered = true;return this;}return makeStack(newSize, head);};Stack.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}if(!ownerID){this.__ownerID = ownerID;this.__altered = false;return this;}return makeStack(this.size, this._head, ownerID, this.__hash);};Stack.prototype.__iterate = function(fn, reverse){if(reverse){return this.reverse().__iterate(fn);}var iterations=0;var node=this._head;while(node) {if(fn(node.value, iterations++, this) === false){break;}node = node.next;}return iterations;};Stack.prototype.__iterator = function(type, reverse){if(reverse){return this.reverse().__iterator(type);}var iterations=0;var node=this._head;return new src_Iterator__Iterator(function(){if(node){var value=node.value;node = node.next;return iteratorValue(type, iterations++, value);}return iteratorDone();});};function isStack(maybeStack){return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);}Stack.isStack = isStack;var IS_STACK_SENTINEL="@@__IMMUTABLE_STACK__@@";var StackPrototype=Stack.prototype;StackPrototype[IS_STACK_SENTINEL] = true;StackPrototype.withMutations = MapPrototype.withMutations;StackPrototype.asMutable = MapPrototype.asMutable;StackPrototype.asImmutable = MapPrototype.asImmutable;StackPrototype.wasAltered = MapPrototype.wasAltered;function makeStack(size, head, ownerID, hash){var map=Object.create(StackPrototype);map.size = size;map._head = head;map.__ownerID = ownerID;map.__hash = hash;map.__altered = false;return map;}var EMPTY_STACK;function emptyStack(){return EMPTY_STACK || (EMPTY_STACK = makeStack(0));}createClass(src_Set__Set, SetCollection);function src_Set__Set(value){return value === null || value === undefined?emptySet():isSet(value)?value:emptySet().withMutations(function(set){var iter=SetIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v){return set.add(v);});});}src_Set__Set.of = function(){return this(arguments);};src_Set__Set.fromKeys = function(value){return this(KeyedIterable(value).keySeq());};src_Set__Set.prototype.toString = function(){return this.__toString("Set {", "}");};src_Set__Set.prototype.has = function(value){return this._map.has(value);};src_Set__Set.prototype.add = function(value){return updateSet(this, this._map.set(value, true));};src_Set__Set.prototype.remove = function(value){return updateSet(this, this._map.remove(value));};src_Set__Set.prototype.clear = function(){return updateSet(this, this._map.clear());};src_Set__Set.prototype.union = function(){var iters=SLICE$0.call(arguments, 0);iters = iters.filter(function(x){return x.size !== 0;});if(iters.length === 0){return this;}if(this.size === 0 && iters.length === 1){return this.constructor(iters[0]);}return this.withMutations(function(set){for(var ii=0; ii < iters.length; ii++) {SetIterable(iters[ii]).forEach(function(value){return set.add(value);});}});};src_Set__Set.prototype.intersect = function(){var iters=SLICE$0.call(arguments, 0);if(iters.length === 0){return this;}iters = iters.map(function(iter){return SetIterable(iter);});var originalSet=this;return this.withMutations(function(set){originalSet.forEach(function(value){if(!iters.every(function(iter){return iter.contains(value);})){set.remove(value);}});});};src_Set__Set.prototype.subtract = function(){var iters=SLICE$0.call(arguments, 0);if(iters.length === 0){return this;}iters = iters.map(function(iter){return SetIterable(iter);});var originalSet=this;return this.withMutations(function(set){originalSet.forEach(function(value){if(iters.some(function(iter){return iter.contains(value);})){set.remove(value);}});});};src_Set__Set.prototype.merge = function(){return this.union.apply(this, arguments);};src_Set__Set.prototype.mergeWith = function(merger){var iters=SLICE$0.call(arguments, 1);return this.union.apply(this, iters);};src_Set__Set.prototype.sort = function(comparator){return OrderedSet(sortFactory(this, comparator));};src_Set__Set.prototype.sortBy = function(mapper, comparator){return OrderedSet(sortFactory(this, comparator, mapper));};src_Set__Set.prototype.wasAltered = function(){return this._map.wasAltered();};src_Set__Set.prototype.__iterate = function(fn, reverse){var this$0=this;return this._map.__iterate(function(_, k){return fn(k, k, this$0);}, reverse);};src_Set__Set.prototype.__iterator = function(type, reverse){return this._map.map(function(_, k){return k;}).__iterator(type, reverse);};src_Set__Set.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}var newMap=this._map.__ensureOwner(ownerID);if(!ownerID){this.__ownerID = ownerID;this._map = newMap;return this;}return this.__make(newMap, ownerID);};function isSet(maybeSet){return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);}src_Set__Set.isSet = isSet;var IS_SET_SENTINEL="@@__IMMUTABLE_SET__@@";var SetPrototype=src_Set__Set.prototype;SetPrototype[IS_SET_SENTINEL] = true;SetPrototype[DELETE] = SetPrototype.remove;SetPrototype.mergeDeep = SetPrototype.merge;SetPrototype.mergeDeepWith = SetPrototype.mergeWith;SetPrototype.withMutations = MapPrototype.withMutations;SetPrototype.asMutable = MapPrototype.asMutable;SetPrototype.asImmutable = MapPrototype.asImmutable;SetPrototype.__empty = emptySet;SetPrototype.__make = makeSet;function updateSet(set, newMap){if(set.__ownerID){set.size = newMap.size;set._map = newMap;return set;}return newMap === set._map?set:newMap.size === 0?set.__empty():set.__make(newMap);}function makeSet(map, ownerID){var set=Object.create(SetPrototype);set.size = map?map.size:0;set._map = map;set.__ownerID = ownerID;return set;}var EMPTY_SET;function emptySet(){return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));}createClass(OrderedSet, src_Set__Set);function OrderedSet(value){return value === null || value === undefined?emptyOrderedSet():isOrderedSet(value)?value:emptyOrderedSet().withMutations(function(set){var iter=SetIterable(value);assertNotInfinite(iter.size);iter.forEach(function(v){return set.add(v);});});}OrderedSet.of = function(){return this(arguments);};OrderedSet.fromKeys = function(value){return this(KeyedIterable(value).keySeq());};OrderedSet.prototype.toString = function(){return this.__toString("OrderedSet {", "}");};function isOrderedSet(maybeOrderedSet){return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);}OrderedSet.isOrderedSet = isOrderedSet;var OrderedSetPrototype=OrderedSet.prototype;OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;OrderedSetPrototype.__empty = emptyOrderedSet;OrderedSetPrototype.__make = makeOrderedSet;function makeOrderedSet(map, ownerID){var set=Object.create(OrderedSetPrototype);set.size = map?map.size:0;set._map = map;set.__ownerID = ownerID;return set;}var EMPTY_ORDERED_SET;function emptyOrderedSet(){return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));}createClass(Record, KeyedCollection);function Record(defaultValues, name){var RecordType=function Record(values){if(!(this instanceof RecordType)){return new RecordType(values);}this._map = src_Map__Map(values);};var keys=Object.keys(defaultValues);var RecordTypePrototype=RecordType.prototype = Object.create(RecordPrototype);RecordTypePrototype.constructor = RecordType;name && (RecordTypePrototype._name = name);RecordTypePrototype._defaultValues = defaultValues;RecordTypePrototype._keys = keys;RecordTypePrototype.size = keys.length;try{keys.forEach(function(key){Object.defineProperty(RecordType.prototype, key, {get:function get(){return this.get(key);}, set:function set(value){invariant(this.__ownerID, "Cannot set on an immutable record.");this.set(key, value);}});});}catch(error) {}return RecordType;}Record.prototype.toString = function(){return this.__toString(recordName(this) + " {", "}");};Record.prototype.has = function(k){return this._defaultValues.hasOwnProperty(k);};Record.prototype.get = function(k, notSetValue){if(!this.has(k)){return notSetValue;}var defaultVal=this._defaultValues[k];return this._map?this._map.get(k, defaultVal):defaultVal;};Record.prototype.clear = function(){if(this.__ownerID){this._map && this._map.clear();return this;}var SuperRecord=Object.getPrototypeOf(this).constructor;return SuperRecord._empty || (SuperRecord._empty = makeRecord(this, emptyMap()));};Record.prototype.set = function(k, v){if(!this.has(k)){throw new Error("Cannot set unknown key \"" + k + "\" on " + recordName(this));}var newMap=this._map && this._map.set(k, v);if(this.__ownerID || newMap === this._map){return this;}return makeRecord(this, newMap);};Record.prototype.remove = function(k){if(!this.has(k)){return this;}var newMap=this._map && this._map.remove(k);if(this.__ownerID || newMap === this._map){return this;}return makeRecord(this, newMap);};Record.prototype.wasAltered = function(){return this._map.wasAltered();};Record.prototype.__iterator = function(type, reverse){var this$0=this;return KeyedIterable(this._defaultValues).map(function(_, k){return this$0.get(k);}).__iterator(type, reverse);};Record.prototype.__iterate = function(fn, reverse){var this$0=this;return KeyedIterable(this._defaultValues).map(function(_, k){return this$0.get(k);}).__iterate(fn, reverse);};Record.prototype.__ensureOwner = function(ownerID){if(ownerID === this.__ownerID){return this;}var newMap=this._map && this._map.__ensureOwner(ownerID);if(!ownerID){this.__ownerID = ownerID;this._map = newMap;return this;}return makeRecord(this, newMap, ownerID);};var RecordPrototype=Record.prototype;RecordPrototype[DELETE] = RecordPrototype.remove;RecordPrototype.deleteIn = RecordPrototype.removeIn = MapPrototype.removeIn;RecordPrototype.merge = MapPrototype.merge;RecordPrototype.mergeWith = MapPrototype.mergeWith;RecordPrototype.mergeIn = MapPrototype.mergeIn;RecordPrototype.mergeDeep = MapPrototype.mergeDeep;RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;RecordPrototype.setIn = MapPrototype.setIn;RecordPrototype.update = MapPrototype.update;RecordPrototype.updateIn = MapPrototype.updateIn;RecordPrototype.withMutations = MapPrototype.withMutations;RecordPrototype.asMutable = MapPrototype.asMutable;RecordPrototype.asImmutable = MapPrototype.asImmutable;function makeRecord(likeRecord, map, ownerID){var record=Object.create(Object.getPrototypeOf(likeRecord));record._map = map;record.__ownerID = ownerID;return record;}function recordName(record){return record._name || record.constructor.name;}function deepEqual(a, b){if(a === b){return true;}if(!isIterable(b) || a.size !== undefined && b.size !== undefined && a.size !== b.size || a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash || isKeyed(a) !== isKeyed(b) || isIndexed(a) !== isIndexed(b) || isOrdered(a) !== isOrdered(b)){return false;}if(a.size === 0 && b.size === 0){return true;}var notAssociative=!isAssociative(a);if(isOrdered(a)){var entries=a.entries();return b.every(function(v, k){var entry=entries.next().value;return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));}) && entries.next().done;}var flipped=false;if(a.size === undefined){if(b.size === undefined){a.cacheResult();}else {flipped = true;var _=a;a = b;b = _;}}var allEqual=true;var bSize=b.__iterate(function(v, k){if(notAssociative?!a.has(v):flipped?!is(v, a.get(k, NOT_SET)):!is(a.get(k, NOT_SET), v)){allEqual = false;return false;}});return allEqual && a.size === bSize;}createClass(Range, IndexedSeq);function Range(start, end, step){if(!(this instanceof Range)){return new Range(start, end, step);}invariant(step !== 0, "Cannot step a Range by 0");start = start || 0;if(end === undefined){end = Infinity;}step = step === undefined?1:Math.abs(step);if(end < start){step = -step;}this._start = start;this._end = end;this._step = step;this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);if(this.size === 0){if(EMPTY_RANGE){return EMPTY_RANGE;}EMPTY_RANGE = this;}}Range.prototype.toString = function(){if(this.size === 0){return "Range []";}return "Range [ " + this._start + "..." + this._end + (this._step > 1?" by " + this._step:"") + " ]";};Range.prototype.get = function(index, notSetValue){return this.has(index)?this._start + wrapIndex(this, index) * this._step:notSetValue;};Range.prototype.contains = function(searchValue){var possibleIndex=(searchValue - this._start) / this._step;return possibleIndex >= 0 && possibleIndex < this.size && possibleIndex === Math.floor(possibleIndex);};Range.prototype.slice = function(begin, end){if(wholeSlice(begin, end, this.size)){return this;}begin = resolveBegin(begin, this.size);end = resolveEnd(end, this.size);if(end <= begin){return new Range(0, 0);}return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);};Range.prototype.indexOf = function(searchValue){var offsetValue=searchValue - this._start;if(offsetValue % this._step === 0){var index=offsetValue / this._step;if(index >= 0 && index < this.size){return index;}}return -1;};Range.prototype.lastIndexOf = function(searchValue){return this.indexOf(searchValue);};Range.prototype.__iterate = function(fn, reverse){var maxIndex=this.size - 1;var step=this._step;var value=reverse?this._start + maxIndex * step:this._start;for(var ii=0; ii <= maxIndex; ii++) {if(fn(value, ii, this) === false){return ii + 1;}value += reverse?-step:step;}return ii;};Range.prototype.__iterator = function(type, reverse){var maxIndex=this.size - 1;var step=this._step;var value=reverse?this._start + maxIndex * step:this._start;var ii=0;return new src_Iterator__Iterator(function(){var v=value;value += reverse?-step:step;return ii > maxIndex?iteratorDone():iteratorValue(type, ii++, v);});};Range.prototype.equals = function(other){return other instanceof Range?this._start === other._start && this._end === other._end && this._step === other._step:deepEqual(this, other);};var EMPTY_RANGE;createClass(Repeat, IndexedSeq);function Repeat(value, times){if(!(this instanceof Repeat)){return new Repeat(value, times);}this._value = value;this.size = times === undefined?Infinity:Math.max(0, times);if(this.size === 0){if(EMPTY_REPEAT){return EMPTY_REPEAT;}EMPTY_REPEAT = this;}}Repeat.prototype.toString = function(){if(this.size === 0){return "Repeat []";}return "Repeat [ " + this._value + " " + this.size + " times ]";};Repeat.prototype.get = function(index, notSetValue){return this.has(index)?this._value:notSetValue;};Repeat.prototype.contains = function(searchValue){return is(this._value, searchValue);};Repeat.prototype.slice = function(begin, end){var size=this.size;return wholeSlice(begin, end, size)?this:new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));};Repeat.prototype.reverse = function(){return this;};Repeat.prototype.indexOf = function(searchValue){if(is(this._value, searchValue)){return 0;}return -1;};Repeat.prototype.lastIndexOf = function(searchValue){if(is(this._value, searchValue)){return this.size;}return -1;};Repeat.prototype.__iterate = function(fn, reverse){for(var ii=0; ii < this.size; ii++) {if(fn(this._value, ii, this) === false){return ii + 1;}}return ii;};Repeat.prototype.__iterator = function(type, reverse){var this$0=this;var ii=0;return new src_Iterator__Iterator(function(){return ii < this$0.size?iteratorValue(type, ii++, this$0._value):iteratorDone();});};Repeat.prototype.equals = function(other){return other instanceof Repeat?is(this._value, other._value):deepEqual(other);};var EMPTY_REPEAT;function mixin(ctor, methods){var keyCopier=function keyCopier(key){ctor.prototype[key] = methods[key];};Object.keys(methods).forEach(keyCopier);Object.getOwnPropertySymbols && Object.getOwnPropertySymbols(methods).forEach(keyCopier);return ctor;}Iterable.Iterator = src_Iterator__Iterator;mixin(Iterable, {toArray:function toArray(){assertNotInfinite(this.size);var array=new Array(this.size || 0);this.valueSeq().__iterate(function(v, i){array[i] = v;});return array;}, toIndexedSeq:function toIndexedSeq(){return new ToIndexedSequence(this);}, toJS:function toJS(){return this.toSeq().map(function(value){return value && typeof value.toJS === "function"?value.toJS():value;}).__toJS();}, toJSON:function toJSON(){return this.toSeq().map(function(value){return value && typeof value.toJSON === "function"?value.toJSON():value;}).__toJS();}, toKeyedSeq:function toKeyedSeq(){return new ToKeyedSequence(this, true);}, toMap:function toMap(){return src_Map__Map(this.toKeyedSeq());}, toObject:function toObject(){assertNotInfinite(this.size);var object={};this.__iterate(function(v, k){object[k] = v;});return object;}, toOrderedMap:function toOrderedMap(){return OrderedMap(this.toKeyedSeq());}, toOrderedSet:function toOrderedSet(){return OrderedSet(isKeyed(this)?this.valueSeq():this);}, toSet:function toSet(){return src_Set__Set(isKeyed(this)?this.valueSeq():this);}, toSetSeq:function toSetSeq(){return new ToSetSequence(this);}, toSeq:function toSeq(){return isIndexed(this)?this.toIndexedSeq():isKeyed(this)?this.toKeyedSeq():this.toSetSeq();}, toStack:function toStack(){return Stack(isKeyed(this)?this.valueSeq():this);}, toList:function toList(){return List(isKeyed(this)?this.valueSeq():this);}, toString:function toString(){return "[Iterable]";}, __toString:function __toString(head, tail){if(this.size === 0){return head + tail;}return head + " " + this.toSeq().map(this.__toStringMapper).join(", ") + " " + tail;}, concat:function concat(){var values=SLICE$0.call(arguments, 0);return reify(this, concatFactory(this, values));}, contains:function contains(searchValue){return this.some(function(value){return is(value, searchValue);});}, entries:function entries(){return this.__iterator(ITERATE_ENTRIES);}, every:function every(predicate, context){assertNotInfinite(this.size);var returnValue=true;this.__iterate(function(v, k, c){if(!predicate.call(context, v, k, c)){returnValue = false;return false;}});return returnValue;}, filter:function filter(predicate, context){return reify(this, filterFactory(this, predicate, context, true));}, find:function find(predicate, context, notSetValue){var entry=this.findEntry(predicate, context);return entry?entry[1]:notSetValue;}, findEntry:function findEntry(predicate, context){var found;this.__iterate(function(v, k, c){if(predicate.call(context, v, k, c)){found = [k, v];return false;}});return found;}, findLastEntry:function findLastEntry(predicate, context){return this.toSeq().reverse().findEntry(predicate, context);}, forEach:function forEach(sideEffect, context){assertNotInfinite(this.size);return this.__iterate(context?sideEffect.bind(context):sideEffect);}, join:function join(separator){assertNotInfinite(this.size);separator = separator !== undefined?"" + separator:",";var joined="";var isFirst=true;this.__iterate(function(v){isFirst?isFirst = false:joined += separator;joined += v !== null && v !== undefined?v.toString():"";});return joined;}, keys:function keys(){return this.__iterator(ITERATE_KEYS);}, map:function map(mapper, context){return reify(this, mapFactory(this, mapper, context));}, reduce:function reduce(reducer, initialReduction, context){assertNotInfinite(this.size);var reduction;var useFirst;if(arguments.length < 2){useFirst = true;}else {reduction = initialReduction;}this.__iterate(function(v, k, c){if(useFirst){useFirst = false;reduction = v;}else {reduction = reducer.call(context, reduction, v, k, c);}});return reduction;}, reduceRight:function reduceRight(reducer, initialReduction, context){var reversed=this.toKeyedSeq().reverse();return reversed.reduce.apply(reversed, arguments);}, reverse:function reverse(){return reify(this, reverseFactory(this, true));}, slice:function slice(begin, end){return reify(this, sliceFactory(this, begin, end, true));}, some:function some(predicate, context){return !this.every(not(predicate), context);}, sort:function sort(comparator){return reify(this, sortFactory(this, comparator));}, values:function values(){return this.__iterator(ITERATE_VALUES);}, butLast:function butLast(){return this.slice(0, -1);}, isEmpty:function isEmpty(){return this.size !== undefined?this.size === 0:!this.some(function(){return true;});}, count:function count(predicate, context){return ensureSize(predicate?this.toSeq().filter(predicate, context):this);}, countBy:function countBy(grouper, context){return countByFactory(this, grouper, context);}, equals:function equals(other){return deepEqual(this, other);}, entrySeq:function entrySeq(){var iterable=this;if(iterable._cache){return new ArraySeq(iterable._cache);}var entriesSequence=iterable.toSeq().map(entryMapper).toIndexedSeq();entriesSequence.fromEntrySeq = function(){return iterable.toSeq();};return entriesSequence;}, filterNot:function filterNot(predicate, context){return this.filter(not(predicate), context);}, findLast:function findLast(predicate, context, notSetValue){return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);}, first:function first(){return this.find(returnTrue);}, flatMap:function flatMap(mapper, context){return reify(this, flatMapFactory(this, mapper, context));}, flatten:function flatten(depth){return reify(this, flattenFactory(this, depth, true));}, fromEntrySeq:function fromEntrySeq(){return new FromEntriesSequence(this);}, get:function get(searchKey, notSetValue){return this.find(function(_, key){return is(key, searchKey);}, undefined, notSetValue);}, getIn:function getIn(searchKeyPath, notSetValue){var nested=this;var iter=forceIterator(searchKeyPath);var step;while(!(step = iter.next()).done) {var key=step.value;nested = nested && nested.get?nested.get(key, NOT_SET):NOT_SET;if(nested === NOT_SET){return notSetValue;}}return nested;}, groupBy:function groupBy(grouper, context){return groupByFactory(this, grouper, context);}, has:function has(searchKey){return this.get(searchKey, NOT_SET) !== NOT_SET;}, hasIn:function hasIn(searchKeyPath){return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;}, isSubset:function isSubset(iter){iter = typeof iter.contains === "function"?iter:Iterable(iter);return this.every(function(value){return iter.contains(value);});}, isSuperset:function isSuperset(iter){return iter.isSubset(this);}, keySeq:function keySeq(){return this.toSeq().map(keyMapper).toIndexedSeq();}, last:function last(){return this.toSeq().reverse().first();}, max:function max(comparator){return maxFactory(this, comparator);}, maxBy:function maxBy(mapper, comparator){return maxFactory(this, comparator, mapper);}, min:function min(comparator){return maxFactory(this, comparator?neg(comparator):defaultNegComparator);}, minBy:function minBy(mapper, comparator){return maxFactory(this, comparator?neg(comparator):defaultNegComparator, mapper);}, rest:function rest(){return this.slice(1);}, skip:function skip(amount){return this.slice(Math.max(0, amount));}, skipLast:function skipLast(amount){return reify(this, this.toSeq().reverse().skip(amount).reverse());}, skipWhile:function skipWhile(predicate, context){return reify(this, skipWhileFactory(this, predicate, context, true));}, skipUntil:function skipUntil(predicate, context){return this.skipWhile(not(predicate), context);}, sortBy:function sortBy(mapper, comparator){return reify(this, sortFactory(this, comparator, mapper));}, take:function take(amount){return this.slice(0, Math.max(0, amount));}, takeLast:function takeLast(amount){return reify(this, this.toSeq().reverse().take(amount).reverse());}, takeWhile:function takeWhile(predicate, context){return reify(this, takeWhileFactory(this, predicate, context));}, takeUntil:function takeUntil(predicate, context){return this.takeWhile(not(predicate), context);}, valueSeq:function valueSeq(){return this.toIndexedSeq();}, hashCode:function hashCode(){return this.__hash || (this.__hash = hashIterable(this));}});var IterablePrototype=Iterable.prototype;IterablePrototype[IS_ITERABLE_SENTINEL] = true;IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;IterablePrototype.__toJS = IterablePrototype.toArray;IterablePrototype.__toStringMapper = quoteString;IterablePrototype.inspect = IterablePrototype.toSource = function(){return this.toString();};IterablePrototype.chain = IterablePrototype.flatMap;(function(){try{Object.defineProperty(IterablePrototype, "length", {get:function get(){if(!Iterable.noLengthWarning){var stack;try{throw new Error();}catch(error) {stack = error.stack;}if(stack.indexOf("_wrapObject") === -1){console && console.warn && console.warn("iterable.length has been deprecated, " + "use iterable.size or iterable.count(). " + "This warning will become a silent error in a future version. " + stack);return this.size;}}}});}catch(e) {}})();mixin(KeyedIterable, {flip:function flip(){return reify(this, flipFactory(this));}, findKey:function findKey(predicate, context){var entry=this.findEntry(predicate, context);return entry && entry[0];}, findLastKey:function findLastKey(predicate, context){return this.toSeq().reverse().findKey(predicate, context);}, keyOf:function keyOf(searchValue){return this.findKey(function(value){return is(value, searchValue);});}, lastKeyOf:function lastKeyOf(searchValue){return this.findLastKey(function(value){return is(value, searchValue);});}, mapEntries:function mapEntries(mapper, context){var this$0=this;var iterations=0;return reify(this, this.toSeq().map(function(v, k){return mapper.call(context, [k, v], iterations++, this$0);}).fromEntrySeq());}, mapKeys:function mapKeys(mapper, context){var this$0=this;return reify(this, this.toSeq().flip().map(function(k, v){return mapper.call(context, k, v, this$0);}).flip());}});var KeyedIterablePrototype=KeyedIterable.prototype;KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;KeyedIterablePrototype.__toJS = IterablePrototype.toObject;KeyedIterablePrototype.__toStringMapper = function(v, k){return k + ": " + quoteString(v);};mixin(IndexedIterable, {toKeyedSeq:function toKeyedSeq(){return new ToKeyedSequence(this, false);}, filter:function filter(predicate, context){return reify(this, filterFactory(this, predicate, context, false));}, findIndex:function findIndex(predicate, context){var entry=this.findEntry(predicate, context);return entry?entry[0]:-1;}, indexOf:function indexOf(searchValue){var key=this.toKeyedSeq().keyOf(searchValue);return key === undefined?-1:key;}, lastIndexOf:function lastIndexOf(searchValue){return this.toSeq().reverse().indexOf(searchValue);}, reverse:function reverse(){return reify(this, reverseFactory(this, false));}, slice:function slice(begin, end){return reify(this, sliceFactory(this, begin, end, false));}, splice:function splice(index, removeNum){var numArgs=arguments.length;removeNum = Math.max(removeNum | 0, 0);if(numArgs === 0 || numArgs === 2 && !removeNum){return this;}index = resolveBegin(index, this.size);var spliced=this.slice(0, index);return reify(this, numArgs === 1?spliced:spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum)));}, findLastIndex:function findLastIndex(predicate, context){var key=this.toKeyedSeq().findLastKey(predicate, context);return key === undefined?-1:key;}, first:function first(){return this.get(0);}, flatten:function flatten(depth){return reify(this, flattenFactory(this, depth, false));}, get:function get(index, notSetValue){index = wrapIndex(this, index);return index < 0 || (this.size === Infinity || this.size !== undefined && index > this.size)?notSetValue:this.find(function(_, key){return key === index;}, undefined, notSetValue);}, has:function has(index){index = wrapIndex(this, index);return index >= 0 && (this.size !== undefined?this.size === Infinity || index < this.size:this.indexOf(index) !== -1);}, interpose:function interpose(separator){return reify(this, interposeFactory(this, separator));}, interleave:function interleave(){var iterables=[this].concat(arrCopy(arguments));var zipped=zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);var interleaved=zipped.flatten(true);if(zipped.size){interleaved.size = zipped.size * iterables.length;}return reify(this, interleaved);}, last:function last(){return this.get(-1);}, skipWhile:function skipWhile(predicate, context){return reify(this, skipWhileFactory(this, predicate, context, false));}, zip:function zip(){var iterables=[this].concat(arrCopy(arguments));return reify(this, zipWithFactory(this, defaultZipper, iterables));}, zipWith:function zipWith(zipper){var iterables=arrCopy(arguments);iterables[0] = this;return reify(this, zipWithFactory(this, zipper, iterables));}});IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;mixin(SetIterable, {get:function get(value, notSetValue){return this.has(value)?value:notSetValue;}, contains:function contains(value){return this.has(value);}, keySeq:function keySeq(){return this.valueSeq();}});SetIterable.prototype.has = IterablePrototype.contains;mixin(KeyedSeq, KeyedIterable.prototype);mixin(IndexedSeq, IndexedIterable.prototype);mixin(SetSeq, SetIterable.prototype);mixin(KeyedCollection, KeyedIterable.prototype);mixin(IndexedCollection, IndexedIterable.prototype);mixin(SetCollection, SetIterable.prototype);function keyMapper(v, k){return k;}function entryMapper(v, k){return [k, v];}function not(predicate){return function(){return !predicate.apply(this, arguments);};}function neg(predicate){return function(){return -predicate.apply(this, arguments);};}function quoteString(value){return typeof value === "string"?JSON.stringify(value):value;}function defaultZipper(){return arrCopy(arguments);}function defaultNegComparator(a, b){return a < b?1:a > b?-1:0;}function hashIterable(iterable){if(iterable.size === Infinity){return 0;}var ordered=isOrdered(iterable);var keyed=isKeyed(iterable);var h=ordered?1:0;var size=iterable.__iterate(keyed?ordered?function(v, k){h = 31 * h + hashMerge(hash(v), hash(k)) | 0;}:function(v, k){h = h + hashMerge(hash(v), hash(k)) | 0;}:ordered?function(v){h = 31 * h + hash(v) | 0;}:function(v){h = h + hash(v) | 0;});return murmurHashOfSize(size, h);}function murmurHashOfSize(size, h){h = src_Math__imul(h, 3432918353);h = src_Math__imul(h << 15 | h >>> -15, 461845907);h = src_Math__imul(h << 13 | h >>> -13, 5);h = (h + 3864292196 | 0) ^ size;h = src_Math__imul(h ^ h >>> 16, 2246822507);h = src_Math__imul(h ^ h >>> 13, 3266489909);h = smi(h ^ h >>> 16);return h;}function hashMerge(a, b){return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;}var Immutable={Iterable:Iterable, Seq:Seq, Collection:Collection, Map:src_Map__Map, OrderedMap:OrderedMap, List:List, Stack:Stack, Set:src_Set__Set, OrderedSet:OrderedSet, Record:Record, Range:Range, Repeat:Repeat, is:is, fromJS:fromJS};return Immutable;});

/***/ }
/******/ ])
});
;