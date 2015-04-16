var _ = require("underscore");

module.exports = {
    "sum": function(values) {
        return _.reduce(values, function(a, b) {
            return a + b;
        }, 0);
    },
    "avg": function(values) {
        var sum = _.reduce(values, function(a, b) {
            return a + b;
        }, 0);
        return sum / values.length;
    },
    "max": function(values) {
        console.log(values, _.max(values));
        return _.max(values);
    },
    "count": function(values) {
        return values.length;
    },
}
