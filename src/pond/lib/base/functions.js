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

function isValid(v) {
    return !(_.isUndefined(v) || _.isNaN(v) || _.isNull(v));
}

//
// Functions to process missing values out of a value list
//
const keepMissing = values => values;
const ignoreMissing = values => values.filter(isValid);
const zeroMissing = values => values.map(v => isValid(v) ? v : 0);
const propagateMissing = values =>
    ignoreMissing(values).length === values.length ? values : null;
const noneIfEmpty = values => values.length === 0 ? null : values;

export const filter = {
    keepMissing,
    ignoreMissing,
    zeroMissing,
    propagateMissing,
    noneIfEmpty
};

/**
 * Like first() except it will return null if not all the values are
 * the same. This can be used to transfer a value when doing aggregation.
 * For instance you might group by the 'type', then avg the 'value', but
 * you want to results to include the type. So you would 'keep' the type
 * and 'avg' the value.
 */
export function keep(clean = filter.ignoreMissing) {
    return values => {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        let result = first()(cleanValues);
        cleanValues.forEach(v => {
            if (v !== result) {
                return null;
            }
        });
        return result;
    };
}

/**
 * Returns a sum function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the sum calculation. Other possibilities are:
 *     `propergateMissing` - which will cause the min itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
export function sum(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        return _.reduce(cleanValues, (a, b) => a + b, 0);
    };
}

/**
 * Returns a avg function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the average calculation. Other possibilities are:
 *     `propergateMissing` - which will cause the avg itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
export function avg(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        const sum = _.reduce(
            cleanValues,
            (a, b) => {
                return a + b;
            },
            0
        );
        return sum / cleanValues.length;
    };
}

/**
 * Return a max function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the maximum search. Other possibilities are:
 *     `propergateMissing` - which will cause the max itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
export function max(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        const max = _.max(cleanValues);
        if (_.isFinite(max)) {
            return max;
        }
    };
}

/**
 * Return a min function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the minimum search. Other possibilities are:
 *     `propergateMissing` - which will cause the min itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
export function min(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        const min = _.min(cleanValues);
        if (_.isFinite(min)) {
            return min;
        }
    };
}

/**
 * Returns a count() function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the count. Other possibilities are:
 *     `propergateMissing` - which will cause the count itself to
 *     be null if the values contain a missing value
 */
export function count(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        return cleanValues.length;
    };
}

/**
 * Returns a first() function, i.e. a function that returns the first
 * value in the supplied values list.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the first non-missing value. Other
 * possibilities are:
 *     `keepMissing` - to return the first value, regardless of if
 *     it is a missing value or not.
 */
export function first(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        return cleanValues.length ? cleanValues[0] : undefined;
    };
}

/**
 * Returns a last() function, i.e. a function that returns the list
 * value in the supplied values list.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the last non-missing value. Other
 * possibilities are:
 *     `keepMissing` - to return the last value, regardless of if
 *     it is a missing value or not.
 */
export function last(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        return cleanValues.length
            ? cleanValues[cleanValues.length - 1]
            : undefined;
    };
}

/**
 * Returns a difference() function, i.e. a function that returns
 * the difference between the min and max values.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the last non-missing value. Other
 * possibilities are:
 *     `propergateMissing` - which will cause the min itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
export function difference(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        return _.max(cleanValues) - _.min(cleanValues);
    };
}

export function median(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        const sorted = cleanValues.sort();
        const i = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            const a = sorted[i];
            const b = sorted[i - 1];
            return (a + b) / 2;
        } else {
            return sorted[i];
        }
    };
}

export function stdev(clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;
        let sums = 0;
        const mean = avg(clean)(cleanValues);
        cleanValues.forEach(v => sums += Math.pow(v - mean, 2));
        return Math.sqrt(sums / values.length);
    };
}

/**
 * Returns a percentile function within the a values list.
 *
 * @param  {object}  options  The parameters controlling the function:
 *                             * q        The percentile (should be between 0 and 100)
 *                             * interp   Specifies the interpolation method
 *                                        to use when the desired quantile lies between
 *                                        two data points. Options are:
 *                                          * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
 *                                          * lower: i.
 *                                          * higher: j.
 *                                          * nearest: i or j whichever is nearest.
 *                                          * midpoint: (i + j) / 2.
 *                             * clean    Strategy to use when encountering missing data:
 *                                          * `propergateMissing` - which will cause the min
 *                                             itself to be null if the values contain a
 *                                             missing value
 *                                          * `zeroMissing` - will replace missing values
 *                                             with a zero
 * @return {number}            The percentile
 */
export function percentile(q, interp = "linear", clean = filter.ignoreMissing) {
    return function(values) {
        const cleanValues = clean(values);
        if (!cleanValues) return null;

        let v;

        const sorted = cleanValues.slice().sort((a, b) => a - b);
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

