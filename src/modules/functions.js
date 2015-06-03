import _ from "underscore";

export default {
    "sum": function(index, values) {
        return _.reduce(values, (a, b) => { return a + b; }, 0);
    },
    "avg": function(index, values) {
        var sum = _.reduce(values, (a, b) => { return a + b; }, 0);
        return sum / values.length;
    },
    "max": function(index, values) {
        return _.max(values);
    },
    "count": function(index, values) {
        return values.length;
    }
};
