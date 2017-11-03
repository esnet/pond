/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as _ from "lodash";

import { ReducerFunction } from "./types";
import util from "./util";

//
// Functions to process missing values out of a value list
//

/**
 * A pass through filter, keeps the input values just as they were.
 */
const keepMissing = (values: number[]) => values;

/**
 * Filters out any missing values (`null`, `undefined` or `NaN`) from the input values
 */
const ignoreMissing = (values: number[]) => values.filter(util.isValid);

/**
 * Replaces any missing value (`null`, `undefined` or `NaN`) with the value `0`
 */
const zeroMissing = (values: number[]) => values.map(v => (util.isValid(v) ? v : 0));

/**
 * Scans the input values for missing values (`null`, `undefined` or `NaN`) and
 * returns `null` if one or more exist, otherwise returns the original values. An
 * example of doing this might be that you are summing values of events in
 * an hour, but if you are missing any values you don't want do the sum at all,
 * you want to say that for that hour the sum is unknown.
 */
const propagateMissing = (values: number[]) =>
    ignoreMissing(values).length === values.length ? values : null;

/**
 * If the input values are an empty array, return `null`, otherwise return
 * the input values.
 */
const noneIfEmpty = (values: number[]) => (values.length === 0 ? null : values);

/**
 * Like `first()` except it will return null if not all the values are
 * the same. This can be used to transfer a value when doing aggregation.
 *
 * For instance you might "group by" the 'type', then `avg` the 'value', but
 * you want to results to include the type. So you would `keep()` the type
 * and `avg()` the value.
 */
export function keep(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        const result = first()(cleanValues);
        cleanValues.forEach(v => {
            if (v !== result) {
                return null;
            }
        });
        return result;
    };
}

/**
 * Returns a `sum()` function, i.e. returns a function that takes a list
 * of values and returns their total.
 *
 * Example:
 * ```
 * import { sum } from "pondjs";
 * const aggregationFunction = sum()
 * const result = aggregationFunction([3, 5, 6]) // 14
 * ```
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the sum calculation. Other possibilities are:
 * * `propagateMissing` - which will cause the sum itself to be null if the
 *                        values contain a missing value
 * * `zeroMissing` - will replace missing values with a zero, which for a sum
 *                   is the same as excluding those values
 */
export function sum(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]): number => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return _.reduce(cleanValues, (a: number, b: number) => a + b, 0);
    };
}

/**
 * Returns an `avg()` function. i.e. returns a function that takes a list
 * of values and returns the average of those.
 *
 * Example:
 * ```
 * import { avg } from "pondjs";
 * const aggregationFunction = avg()
 * const result = aggregationFunction([3, 5, 6]) // ~4.66666
 * ```
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the average calculation. Other possibilities are:
 * * `propagateMissing` - which will cause the resulting average to be null if the values
 *                        contain a missing value
 * * `zeroMissing` - will replace missing values with a zero, thus missing values will bring
 *                   the average down
 */
export function avg(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]): number => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        const total = _.reduce(
            cleanValues,
            (a: number, b: number) => {
                return a + b;
            },
            0
        );
        return total / cleanValues.length;
    };
}

/**
 * Return a `max()` function.  i.e. returns a function that takes a list
 * of values and returns the average of those.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the maximum search. Other possibilities are:
 * * `propagateMissing` - which will cause the max itself to be null if the values
 *                        contain a missing value
 * * `zeroMissing` - will replace missing values with a zero
 */
export function max(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        const result = _.max(cleanValues);
        if (_.isFinite(result)) {
            return result;
        }
    };
}

/**
 * Return a `min()` function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the minimum search. Other possibilities are:
 * * `propagateMissing` - which will cause the min itself to be null if the
 *                         values contain a missing value
 * * `zeroMissing` - will replace missing values with a zero
 */
export function min(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        const result = _.min(cleanValues);
        if (_.isFinite(result)) {
            return result;
        }
    };
}

/**
 * Returns a `count()` function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the count. Other possibilities are:
 * * `propagateMissing` - which will cause the count itself to be null if the
 *                         values contain a missing value
 */
export function count(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return cleanValues.length;
    };
}

/**
 * Returns a `first()` function, i.e. a function that returns the first
 * value in the supplied values list.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the first non-missing value. Other
 * possibilities are:
 * * `keepMissing` - to return the first value, regardless of if it is a missing value or not.
 */
export function first(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return cleanValues.length ? cleanValues[0] : undefined;
    };
}

/**
 * Returns a `last()` function, i.e. a function that returns the list
 * value in the supplied values list.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the last non-missing value. Other
 * possibilities are:
 * * `keepMissing` - to return the last value, regardless of if it is a missing value or not.
 */
export function last(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return cleanValues.length ? cleanValues[cleanValues.length - 1] : undefined;
    };
}

/**
 * Returns a `difference()` function, i.e. a function that returns
 * the difference between the `min` and `max` values.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the list, i.e to find the last non-missing value. Other
 * possibilities are:
 * * `propagateMissing` - which will cause the min itself to be null if the
 *                         values contain a missing value
 * * `zeroMissing` - will replace missing values with a zero
 */
export function difference(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return _.max(cleanValues) - _.min(cleanValues);
    };
}

/**
 * Returns the `median()` function, i.e. a function that returns
 * the median of the values supplied to it.
 */
export function median(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
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

/**
 * Returns a function that returns a `stdev()` function, i.e. a function
 * that returns the standard deviation of the values supplied to it.
 */
export function stdev(clean = filter.ignoreMissing): ReducerFunction {
    return (values: number[]) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        let sums = 0;
        const mean = avg(clean)(cleanValues);
        cleanValues.forEach(v => (sums += Math.pow(v - mean, 2)));
        return Math.sqrt(sums / values.length);
    };
}

export enum InterpolationType {
    linear = 1,
    lower,
    higher,
    nearest,
    midpoint
}

/**
 * Returns a `percentile` function within the a values list.
 *
 * The parameters controlling the function:
 *  * `q` - The percentile (should be between 0 and 100), e.g q=75 for 75th percentile.
 *  * `interp` - Specifies the interpolation method to use when the desired
 *    quantile lies between two data points.
 *             Options are:
 *              * linear: i + (j - i) * fraction, where fraction is
 *                the fractional part of the index surrounded by i and j.
 *              * lower: i.
 *              * higher: j.
 *              * nearest: i or j whichever is nearest.
 *              * midpoint: (i + j) / 2.
 *  * `clean` - Strategy to use when encountering missing data:
 *              * `propagateMissing` - which will cause the min
 *                 itself to be null if the values contain a
 *                 missing value
 *              * `zeroMissing` - will replace missing values
 *                 with a zero
 */
export function percentile(
    q: number,
    interp: InterpolationType = InterpolationType.linear,
    clean = filter.ignoreMissing
): ReducerFunction {
    return (values: number[]): number => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }

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
            if (interp === InterpolationType.lower || fraction === 0) {
                v = v0;
            } else if (interp === InterpolationType.linear) {
                v = v0 + (v1 - v0) * fraction;
            } else if (interp === InterpolationType.higher) {
                v = v1;
            } else if (interp === InterpolationType.nearest) {
                v = fraction < 0.5 ? v0 : v1;
            } else if (interp === InterpolationType.midpoint) {
                v = (v0 + v1) / 2;
            }
        }
        return v;
    };
}

export const filter = {
    keepMissing,
    ignoreMissing,
    zeroMissing,
    propagateMissing,
    noneIfEmpty
};
