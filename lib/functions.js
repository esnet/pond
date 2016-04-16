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