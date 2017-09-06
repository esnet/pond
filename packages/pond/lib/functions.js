"use strict";
/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const util_1 = require("./util");
class Functions {
}
exports.Functions = Functions;
//
// Functions to process missing values out of a value list
//
const keepMissing = (values) => values;
const ignoreMissing = (values) => values.filter(util_1.default.isValid);
const zeroMissing = (values) => values.map(v => (util_1.default.isValid(v) ? v : 0));
const propagateMissing = (values) => ignoreMissing(values).length === values.length ? values : null;
const noneIfEmpty = (values) => (values.length === 0 ? null : values);
/**
 * Like `first()` except it will return null if not all the values are
 * the same. This can be used to transfer a value when doing aggregation.
 *
 * For instance you might `group by` the 'type', then `avg` the 'value', but
 * you want to results to include the type. So you would `'keep'` the type
 * and `'avg'` the value.
 */
function keep(clean = exports.filter.ignoreMissing) {
    return (values) => {
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
exports.keep = keep;
/**
 * Returns a `sum()` function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the sum calculation. Other possibilities are:
 * * `propagateMissing` - which will cause the min itself to be null if the
 *                         values contain a missing value
 * * `zeroMissing` - will replace missing values with a zero
 */
function sum(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return _.reduce(cleanValues, (a, b) => a + b, 0);
    };
}
exports.sum = sum;
/**
 * Returns an `avg()` function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the average calculation. Other possibilities are:
 * * `propagateMissing` - which will cause the avg itself to be null if the values
 *                         contain a missing value
 * * `zeroMissing` - will replace missing values with a zero
 */
function avg(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        const total = _.reduce(cleanValues, (a, b) => {
            return a + b;
        }, 0);
        return total / cleanValues.length;
    };
}
exports.avg = avg;
/**
 * Return a `max()` function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the maximum search. Other possibilities are:
 * * `propagateMissing` - which will cause the max itself to be null if the values
 *                        contain a missing value
 * * `zeroMissing` - will replace missing values with a zero
 */
function max(clean = exports.filter.ignoreMissing) {
    return (values) => {
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
exports.max = max;
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
function min(clean = exports.filter.ignoreMissing) {
    return (values) => {
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
exports.min = min;
/**
 * Returns a `count()` function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the count. Other possibilities are:
 * * `propagateMissing` - which will cause the count itself to be null if the
 *                         values contain a missing value
 */
function count(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return cleanValues.length;
    };
}
exports.count = count;
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
function first(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return cleanValues.length ? cleanValues[0] : undefined;
    };
}
exports.first = first;
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
function last(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return cleanValues.length ? cleanValues[cleanValues.length - 1] : undefined;
    };
}
exports.last = last;
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
function difference(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
        return _.max(cleanValues) - _.min(cleanValues);
    };
}
exports.difference = difference;
/**
 * Returns the `median()` function, i.e. a function that returns
 * the median of the values supplied to it.
 */
function median(clean = exports.filter.ignoreMissing) {
    return (values) => {
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
        }
        else {
            return sorted[i];
        }
    };
}
exports.median = median;
/**
 * Returns a function that returns a `stdev()` function, i.e. a function
 * that returns the standard deviation of the values supplied to it.
 */
function stdev(clean = exports.filter.ignoreMissing) {
    return (values) => {
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
exports.stdev = stdev;
var InterpolationType;
(function (InterpolationType) {
    InterpolationType[InterpolationType["linear"] = 1] = "linear";
    InterpolationType[InterpolationType["lower"] = 2] = "lower";
    InterpolationType[InterpolationType["higher"] = 3] = "higher";
    InterpolationType[InterpolationType["nearest"] = 4] = "nearest";
    InterpolationType[InterpolationType["midpoint"] = 5] = "midpoint";
})(InterpolationType = exports.InterpolationType || (exports.InterpolationType = {}));
/**
 * Returns a `percentile` function within the a values list.
 *
 * The parameters controlling the function:
 *  * q -      The percentile (should be between 0 and 100), e.g q=75 for 75th percentile.
 *  * interp - Specifies the interpolation method to use when the desired
 *             quantile lies between two data points.
 *             Options are:
 *              * linear: i + (j - i) * fraction, where fraction is
 *                the fractional part of the index surrounded by i and j.
 *              * lower: i.
 *              * higher: j.
 *              * nearest: i or j whichever is nearest.
 *              * midpoint: (i + j) / 2.
 *  * clean    Strategy to use when encountering missing data:
 *              * `propagateMissing` - which will cause the min
 *                 itself to be null if the values contain a
 *                 missing value
 *              * `zeroMissing` - will replace missing values
 *                 with a zero
 */
function percentile(q, interp = InterpolationType.linear, clean = exports.filter.ignoreMissing) {
    return (values) => {
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
            }
            else if (interp === InterpolationType.linear) {
                v = v0 + (v1 - v0) * fraction;
            }
            else if (interp === InterpolationType.higher) {
                v = v1;
            }
            else if (interp === InterpolationType.nearest) {
                v = fraction < 0.5 ? v0 : v1;
            }
            else if (interp === InterpolationType.midpoint) {
                v = (v0 + v1) / 2;
            }
        }
        return v;
    };
}
exports.percentile = percentile;
exports.filter = {
    keepMissing,
    ignoreMissing,
    zeroMissing,
    propagateMissing,
    noneIfEmpty
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsNEJBQTRCO0FBRzVCLGlDQUEwQjtBQUUxQjtDQUF5QjtBQUF6Qiw4QkFBeUI7QUFFekIsRUFBRTtBQUNGLDBEQUEwRDtBQUMxRCxFQUFFO0FBQ0YsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFnQixLQUFLLE1BQU0sQ0FBQztBQUNqRCxNQUFNLGFBQWEsR0FBRyxDQUFDLE1BQWdCLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFnQixLQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRixNQUFNLGdCQUFnQixHQUFHLENBQUMsTUFBZ0IsS0FDdEMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFnQixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBRWhGOzs7Ozs7O0dBT0c7QUFDSCxjQUFxQixLQUFLLEdBQUcsY0FBTSxDQUFDLGFBQWE7SUFDN0MsTUFBTSxDQUFDLENBQUMsTUFBZ0I7UUFDcEIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNE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