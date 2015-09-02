"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

exports["default"] = {
    sum: function sum(index, values) {
        return _underscore2["default"].reduce(values, function (a, b) {
            return a + b;
        }, 0);
    },
    avg: function avg(index, values) {
        var sum = _underscore2["default"].reduce(values, function (a, b) {
            return a + b;
        }, 0);
        return sum / values.length;
    },
    max: function max(index, values) {
        return _underscore2["default"].max(values);
    },
    min: function min(index, values) {
        return _underscore2["default"].min(values);
    },
    count: function count(index, values) {
        return values.length;
    },
    first: function first(index, values) {
        return values.length ? values[0] : undefined;
    },
    last: function last(index, values) {
        return values.length ? values[values.length - 1] : undefined;
    },
    difference: function difference(index, values) {
        return _underscore2["default"].max(values) - _underscore2["default"].min(values);
    },
    derivative: function derivative(index, values) {
        return values.length ? (values[values.length - 1] - values[0]) / (index.asTimerange().duration() / 1000) : undefined;
    }
};
module.exports = exports["default"];