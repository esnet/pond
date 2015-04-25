var _ = require("underscore");
var {IndexedEvent} = require("./event");

module.exports = {

    /**
     * These functions take an index and a list of values and
     * return an new IndexedEvent
     */

    "sum": function(index, values) {
        var sum = _.reduce(values, function(a, b) {
            return a + b;
        }, 0);
        return new IndexedEvent(index, sum);
    },
    "avg": function(index, values) {
        var sum = _.reduce(values, function(a, b) {
            return a + b;
        }, 0);
        return new IndexedEvent(index, sum / values.length);
    },
    "max": function(index, values) {
        return new IndexedEvent(index, _.max(values));
    },
    "count": function(index, values) {
        return new IndexedEvent(index, values.length);
    },
}
