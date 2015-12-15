/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

exports["default"] = {
    sum: function sum(values) {
        return _underscore2["default"].reduce(values, function (a, b) {
            return a + b;
        }, 0);
    },
    avg: function avg(values) {
        var sum = _underscore2["default"].reduce(values, function (a, b) {
            return a + b;
        }, 0);
        return sum / values.length;
    },
    max: function max(values) {
        return _underscore2["default"].max(values);
    },
    min: function min(values) {
        return _underscore2["default"].min(values);
    },
    count: function count(values) {
        return values.length;
    },
    first: function first(values) {
        return values.length ? values[0] : undefined;
    },
    last: function last(values) {
        return values.length ? values[values.length - 1] : undefined;
    },
    difference: function difference(values) {
        return _underscore2["default"].max(values) - _underscore2["default"].min(values);
    }
};
module.exports = exports["default"];