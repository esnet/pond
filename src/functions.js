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

/**
 * Returns a function that gets percentile q within the a values list.
 *
 * @param  {object}  options  The parameters controlling the function:
 *                             * q        The percentile (should be between 0 and 100)
 *                             * interp    Specifies the interpolation method
 *                                         to use when the desired quantile lies between
 *                                         two data points. Options are:
 *                                          * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
 *                                          * lower: i.
 *                                          * higher: j.
 *                                          * nearest: i or j whichever is nearest.
 *                                          * midpoint: (i + j) / 2.
 * @return {number}            The percentile
 */
export function percentile(q, interp = "linear") {
    return function (values) {
        let v;

        const sorted = values.slice().sort();
        const size = sorted.length;

        if (q < 0 || q > 100) {
            throw new Error("Percentile q must be between 0 and 100");
        }

        const i = q / 100;
        const index = Math.floor((sorted.length - 1) * i);

        if (size === 1 || q === 0) {
            return sorted[0];
        }

        if (q === 100) {
            return sorted[size - 1];
        }

        if (index < size - 1) {
            const fraction = (size - 1) * i - index;
            const v0 = sorted[index];
            const v1 = sorted[index + 1];
            if (interp === "lower" || fraction === 0) {
                v = v0;
            } else if (interp === "linear") {
                v = v0 + (v1 - v0) * fraction;
            } else if (interp === "higher") {
                v = v1;
            } else if (interp === "nearest") {
                v = fraction < 0.5 ? v0 : v1;
            } else if (interp === "midpoint") {
                v = (v0 + v1) / 2;
            }
        }

        return v;
    };
}
