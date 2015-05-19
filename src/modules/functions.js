var _ = require("underscore");

var {IndexedEvent} = require("./event");

module.exports = {

    /**
     * These functions take an index and a list of values and
     * return a calculated result.
     */

    "sum": function(index, values) {
        return _.reduce(values, (a, b) => {return a + b;}, 0);
    },
    "avg": function(index, values) {
        var sum = _.reduce(values, (a, b) => {return a + b;}, 0);
        return sum / values.length;
    },
    "max": function(index, values) {
        return _.max(values);
    },
    "count": function(index, values) {
        return values.length;
    },
}
