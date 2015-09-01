import _ from "underscore";

export default {
    sum: function (index, values) {
        return _.reduce(values, (a, b) => { return a + b; }, 0);
    },
    avg: function (index, values) {
        var sum = _.reduce(values, (a, b) => { return a + b; }, 0);
        return sum / values.length;
    },
    max: function (index, values) {
        return _.max(values);
    },
    min: function (index, values) {
        return _.min(values);
    },
    count: function (index, values) {
        return values.length;
    },
    first: function (index, values) {
        return values.length ? values[0] : undefined;
    },
    last: function (index, values) {
        return values.length ? values[values.length - 1] : undefined;
    },
    difference: function (index, values) {
        return _.max(values) - _.min(values);
    },
    derivative: function (index, values) {
        return values.length ?
            (values[values.length - 1] - values[0]) /
                (index.asTimerange().duration() / 1000) : undefined;
    }
};
