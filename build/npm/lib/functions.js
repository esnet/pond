"use strict";

var _ = require("underscore");

var _require = require("./event");

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