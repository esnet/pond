"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.filter = undefined;
exports.keep = keep;
exports.sum = sum;
exports.avg = avg;
exports.max = max;
exports.min = min;
exports.count = count;
exports.first = first;
exports.last = last;
exports.difference = difference;
exports.median = median;
exports.stdev = stdev;
exports.percentile = percentile;

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isValid(v) {
    return !(_underscore2.default.isUndefined(v) || _underscore2.default.isNaN(v) || _underscore2.default.isNull(v));
}

//
// Functions to process missing values out of a value list
//

/**
 * Default filter, so default it does nothing at all to the values passed to it
 * e.g. max(1, 2, null, 4) would be max(1, 2, null, 4)
 */
/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var keepMissing = function keepMissing(values) {
    return values;
};

/**
 * Removes missing values (null, undefined or NaN) from the list of
 * values passed into the aggregation function 
 * e.g. avg(1, 2, null, 4) would be avg(1, 2, 4)
 */
var ignoreMissing = function ignoreMissing(values) {
    return values.filter(isValid);
};

/**
 * Replaces missing values (null, undefined or NaN) by 0.
 * e.g. avg(1, 2, null, 4) would be avg(1, 2, 0, 4)
 */
var zeroMissing = function zeroMissing(values) {
    return values.map(function (v) {
        return isValid(v) ? v : 0;
    });
};

/**
 * If there are missing values in the list of values being
 * aggregated then the result of the aggregation should be
 * also undefined or null.
 * e.g. avg(2, 4, null, 7) would be null.
 */
var propagateMissing = function propagateMissing(values) {
    return ignoreMissing(values).length === values.length ? values : null;
};

/**
 * If there are no values in the list, the result of the aggregation
 * is null 
 */
var noneIfEmpty = function noneIfEmpty(values) {
    return values.length === 0 ? null : values;
};

var filter = exports.filter = {
    keepMissing: keepMissing,
    ignoreMissing: ignoreMissing,
    zeroMissing: zeroMissing,
    propagateMissing: propagateMissing,
    noneIfEmpty: noneIfEmpty
};

/**
 * Like first() except it will return null if not all the values are
 * the same. This can be used to transfer a value when doing aggregation.
 * For instance you might group by the 'type', then avg the 'value', but
 * you want to results to include the type. So you would 'keep' the type
 * and 'avg' the value.
 */
function keep() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        var result = first()(cleanValues);
        cleanValues.forEach(function (v) {
            if (v !== result) {
                return null;
            }
        });
        return result;
    };
}

/**
 * Returns a sum function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the sum calculation. Other possibilities are:
 *     `propergateMissing` - which will cause the min itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
function sum() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        return _underscore2.default.reduce(cleanValues, function (a, b) {
            return a + b;
        }, 0);
    };
}

/**
 * Returns a avg function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the average calculation. Other possibilities are:
 *     `propergateMissing` - which will cause the avg itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
function avg() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        var sum = _underscore2.default.reduce(cleanValues, function (a, b) {
            return a + b;
        }, 0);
        return sum / cleanValues.length;
    };
}

/**
 * Return a max function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the maximum search. Other possibilities are:
 *     `propergateMissing` - which will cause the max itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
function max() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        var max = _underscore2.default.max(cleanValues);
        if (_underscore2.default.isFinite(max)) {
            return max;
        }
    };
}

/**
 * Return a min function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the minimum search. Other possibilities are:
 *     `propergateMissing` - which will cause the min itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
function min() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        var min = _underscore2.default.min(cleanValues);
        if (_underscore2.default.isFinite(min)) {
            return min;
        }
    };
}

/**
 * Returns a count() function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the count. Other possibilities are:
 *     `propergateMissing` - which will cause the count itself to
 *     be null if the values contain a missing value
 */
function count() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        return cleanValues.length;
    };
}

/**
 * Returns a first() function, i.e. a function that returns the first
 * value in the supplied values list.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the first non-missing value. Other
 * possibilities are:
 *     `keepMissing` - to return the first value, regardless of if
 *     it is a missing value or not.
 */
function first() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        return cleanValues.length ? cleanValues[0] : undefined;
    };
}

/**
 * Returns a last() function, i.e. a function that returns the list
 * value in the supplied values list.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the last non-missing value. Other
 * possibilities are:
 *     `keepMissing` - to return the last value, regardless of if
 *     it is a missing value or not.
 */
function last() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        return cleanValues.length ? cleanValues[cleanValues.length - 1] : undefined;
    };
}

/**
 * Returns a difference() function, i.e. a function that returns
 * the difference between the min and max values.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the last non-missing value. Other
 * possibilities are:
 *     `propergateMissing` - which will cause the min itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
function difference() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        return _underscore2.default.max(cleanValues) - _underscore2.default.min(cleanValues);
    };
}

function median() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        var sorted = cleanValues.sort();
        var i = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            var a = sorted[i];
            var b = sorted[i - 1];
            return (a + b) / 2;
        } else {
            return sorted[i];
        }
    };
}

function stdev() {
    var clean = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;
        var sums = 0;
        var mean = avg(clean)(cleanValues);
        cleanValues.forEach(function (v) {
            return sums += Math.pow(v - mean, 2);
        });
        return Math.sqrt(sums / values.length);
    };
}

/**
 * Returns a percentile function within the a values list.
 *
 * @param  {object}  options  The parameters controlling the function:
 *                             * q        The percentile (should be between 0 and 100)
 *                             * interp   Specifies the interpolation method
 *                                        to use when the desired quantile lies between
 *                                        two data points. Options are:
 *                                          * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
 *                                          * lower: i.
 *                                          * higher: j.
 *                                          * nearest: i or j whichever is nearest.
 *                                          * midpoint: (i + j) / 2.
 *                             * clean    Strategy to use when encountering missing data:
 *                                          * `propergateMissing` - which will cause the min
 *                                             itself to be null if the values contain a
 *                                             missing value
 *                                          * `zeroMissing` - will replace missing values
 *                                             with a zero
 * @return {number}            The percentile
 */
function percentile(q) {
    var interp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "linear";
    var clean = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : filter.ignoreMissing;

    return function (values) {
        var cleanValues = clean(values);
        if (!cleanValues) return null;

        var v = void 0;

        var sorted = cleanValues.slice().sort(function (a, b) {
            return a - b;
        });
        var size = sorted.length;

        if (q < 0 || q > 100) {
            throw new Error("Percentile q must be between 0 and 100");
        }

        var i = q / 100;
        var index = Math.floor((sorted.length - 1) * i);

        if (size === 1 || q === 0) {
            return sorted[0];
        }

        if (q === 100) {
            return sorted[size - 1];
        }

        if (index < size - 1) {
            var fraction = (size - 1) * i - index;
            var v0 = sorted[index];
            var v1 = sorted[index + 1];
            if (interp === "lower" || fraction === 0) {
                v = v0;
            } else if (interp === "linear") {
                v = v0 + (v1 - v0) * fraction;
            } else if (interp === "higher") {
                v = v1;
            } else if (interp === "nearest") {
                v = fraction < 0.5 ? v0 : v1;
            } else if (interp === "midpoint") {
                v = (v0 + v1) / 2;
            }
        }

        return v;
    };
}