"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _ = _interopRequire(require("underscore"));

module.exports = {
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
    }
};