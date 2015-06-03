"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

exports["default"] = {
    "sum": function sum(index, values) {
        return _underscore2["default"].reduce(values, function (a, b) {
            return a + b;
        }, 0);
    },
    "avg": function avg(index, values) {
        var sum = _underscore2["default"].reduce(values, function (a, b) {
            return a + b;
        }, 0);
        return sum / values.length;
    },
    "max": function max(index, values) {
        return _underscore2["default"].max(values);
    },
    "count": function count(index, values) {
        return values.length;
    }
};
module.exports = exports["default"];