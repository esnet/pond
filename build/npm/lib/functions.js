"use strict";

var _ = require("underscore");

var _require = require("./event");

var IndexedEvent = _require.IndexedEvent;

module.exports = {

    /**
     * These functions take an index and a list of values and
     * return an new IndexedEvent
     */

    sum: (function (_sum) {
        var _sumWrapper = function sum(_x, _x2) {
            return _sum.apply(this, arguments);
        };

        _sumWrapper.toString = function () {
            return _sum.toString();
        };

        return _sumWrapper;
    })(function (index, values) {
        var sum = _.reduce(values, function (a, b) {
            return a + b;
        }, 0);
        return new IndexedEvent(index, sum);
    }),
    avg: function avg(index, values) {
        var sum = _.reduce(values, function (a, b) {
            return a + b;
        }, 0);
        return new IndexedEvent(index, sum / values.length);
    },
    max: function max(index, values) {
        return new IndexedEvent(index, _.max(values));
    },
    count: function count(index, values) {
        return new IndexedEvent(index, values.length);
    } };