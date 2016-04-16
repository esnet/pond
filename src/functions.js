/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";

export function keep(values) {
    let result = first(values);
    values.forEach(v => {
        if (!_.isNull(v) && !_.isUndefined(v) && v !== result) {
            return null;
        }
    });
    return result;
}

export function sum(values) {
    return _.reduce(values, (a, b) => a + b, 0);
}

export function avg(values) {
    const sum = _.reduce(values, (a, b) => { return a + b; }, 0);
    return sum / values.length;
}

export function max(values) {
    const max = _.max(values);
    if (_.isFinite(max)) {
        return max;
    }
}

export function min(values) {
    const min = _.min(values);
    if (_.isFinite(min)) {
        return min;
    }
}

export function count(values) {
    return values.length;
}

export function first(values) {
    return values.length ? values[0] : undefined;
}

export function last(values) {
    return values.length ? values[values.length - 1] : undefined;
}

export function difference(values) {
    return _.max(values) - _.min(values);
}

export function median(values) {
    const sorted = values.sort();
    const i = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        const a = sorted[i];
        const b = sorted[i - 1];
        return (a + b) / 2;
    } else {
        return sorted[i];
    }
}

export function stdev(values) {
    let sums = 0;
    const mean = avg(values);
    values.forEach(v => sums += Math.pow(v - mean, 2));
    return Math.sqrt(sums / values.length);
}
