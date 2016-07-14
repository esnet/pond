"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

function keep(values) {
    var result = first(values);
    values.forEach(function (v) {
        if (!_underscore2.default.isNull(v) && !_underscore2.default.isUndefined(v) && v !== result) {
            return null;
        }
    });
    return result;
} /**
   *  Copyright (c) 2015, The Regents of the University of California,
   *  through Lawrence Berkeley National Laboratory (subject to receipt
   *  of any required approvals from the U.S. Dept. of Energy).
   *  All rights reserved.
   *
   *  This source code is licensed under the BSD-style license found in the
   *  LICENSE file in the root directory of this source tree.
   */

function sum(values) {
    return _underscore2.default.reduce(values, function (a, b) {
        return a + b;
    }, 0);
}

function avg(values) {
    var sum = _underscore2.default.reduce(values, function (a, b) {
        return a + b;
    }, 0);
    return sum / values.length;
}

function max(values) {
    var max = _underscore2.default.max(values);
    if (_underscore2.default.isFinite(max)) {
        return max;
    }
}

function min(values) {
    var min = _underscore2.default.min(values);
    if (_underscore2.default.isFinite(min)) {
        return min;
    }
}

function count(values) {
    return values.length;
}

function first(values) {
    return values.length ? values[0] : undefined;
}

function last(values) {
    return values.length ? values[values.length - 1] : undefined;
}

function difference(values) {
    return _underscore2.default.max(values) - _underscore2.default.min(values);
}

function median(values) {
    var sorted = values.sort();
    var i = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        var a = sorted[i];
        var b = sorted[i - 1];
        return (a + b) / 2;
    } else {
        return sorted[i];
    }
}

function stdev(values) {
    var sums = 0;
    var mean = avg(values);
    values.forEach(function (v) {
        return sums += Math.pow(v - mean, 2);
    });
    return Math.sqrt(sums / values.length);
}

/**
 * Returns a function that gets percentile q within the a values list.
 *
 * @param  {object}  options  The parameters controlling the function:
 *                             * q        The percentile (should be between 0 and 100)
 *                             * interp    Specifies the interpolation method
 *                                         to use when the desired quantile lies between
 *                                         two data points. Options are:
 *                                          * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
 *                                          * lower: i.
 *                                          * higher: j.
 *                                          * nearest: i or j whichever is nearest.
 *                                          * midpoint: (i + j) / 2.
 * @return {number}            The percentile
 */
function percentile(q) {
    var interp = arguments.length <= 1 || arguments[1] === undefined ? "linear" : arguments[1];

    return function (values) {
        var v = void 0;

        var sorted = values.slice().sort();
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