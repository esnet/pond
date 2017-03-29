/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function isValid(v) {
    return !(_.isUndefined(v) || _.isNaN(v) || _.isNull(v));
}
//
// Functions to process missing values out of a value list
//
const keepMissing = (values) => values;
const ignoreMissing = (values) => values.filter(isValid);
const zeroMissing = (values) => values.map(v => isValid(v) ? v : 0);
const propagateMissing = (values) => ignoreMissing(values).length === values.length ? values : null;
const noneIfEmpty = (values) => values.length === 0 ? null : values;
exports.filter = {
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
function keep(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        let result = first()(cleanValues);
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
 * Returns a sum function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the sum calculation. Other possibilities are:
 *     `propergateMissing` - which will cause the min itself to
 *     be null if the values contain a missing value
 *     `zeroMissing` - will replace missing values with a zero
 */
function sum(clean = exports.filter.ignoreMissing) {
    return function (values) {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        return _.reduce(cleanValues, (a, b) => a + b, 0);
    };
}
exports.sum = sum;
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
function avg(clean = exports.filter.ignoreMissing) {
    return function (values) {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        const sum = _.reduce(cleanValues, (a, b) => {
            return a + b;
        }, 0);
        return sum / cleanValues.length;
    };
}
exports.avg = avg;
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
function max(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        const max = _.max(cleanValues);
        if (_.isFinite(max)) {
            return max;
        }
    };
}
exports.max = max;
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
function min(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        const min = _.min(cleanValues);
        if (_.isFinite(min)) {
            return min;
        }
    };
}
exports.min = min;
/**
 * Returns a count() function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the count. Other possibilities are:
 *     `propergateMissing` - which will cause the count itself to
 *     be null if the values contain a missing value
 */
function count(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        return cleanValues.length;
    };
}
exports.count = count;
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
function first(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        return cleanValues.length ? cleanValues[0] : undefined;
    };
}
exports.first = first;
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
function last(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        return cleanValues.length
            ? cleanValues[cleanValues.length - 1]
            : undefined;
    };
}
exports.last = last;
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
function difference(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        return _.max(cleanValues) - _.min(cleanValues);
    };
}
exports.difference = difference;
/**
 * Returns the median() function, i.e. a function that returns
 * the median of the values supplied to it.
 */
function median(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
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
 * Returns a function that returns a stdev() function, i.e. a function
 * that returns the standard deviation of the values supplied to it.
 */
function stdev(clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
        let sums = 0;
        const mean = avg(clean)(cleanValues);
        cleanValues.forEach(v => sums += Math.pow(v - mean, 2));
        return Math.sqrt(sums / values.length);
    };
}
exports.stdev = stdev;
/**
 * Returns a percentile function within the a values list.
 * The parameters controlling the function:
 *  * q        The percentile (should be between 0 and 100), e.g q=75 for 75th percentile.
 *  * interp   Specifies the interpolation method to use when the desired
 *             quantile lies between two data points. Options are:
 *              * linear: i + (j - i) * fraction, where fraction is the fractional part of the index surrounded by i and j.
 *              * lower: i.
 *              * higher: j.
 *              * nearest: i or j whichever is nearest.
 *              * midpoint: (i + j) / 2.
 *  * clean    Strategy to use when encountering missing data:
 *              * `propergateMissing` - which will cause the min
 *                 itself to be null if the values contain a
 *                 missing value
 *              * `zeroMissing` - will replace missing values
 *                 with a zero
 */
function percentile(q, interp = "linear", clean = exports.filter.ignoreMissing) {
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues)
            return null;
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
            }
            else if (interp === "linear") {
                v = v0 + (v1 - v0) * fraction;
            }
            else if (interp === "higher") {
                v = v1;
            }
            else if (interp === "nearest") {
                v = fraction < 0.5 ? v0 : v1;
            }
            else if (interp === "midpoint") {
                v = (v0 + v1) / 2;
            }
        }
        return v;
    };
}
exports.percentile = percentile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7R0FRRzs7O0FBRUgsNEJBQTRCO0FBRTVCLGlCQUFpQixDQUFTO0lBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsRUFBRTtBQUNGLDBEQUEwRDtBQUMxRCxFQUFFO0FBQ0YsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFnQixLQUFLLE1BQU0sQ0FBQztBQUNqRCxNQUFNLGFBQWEsR0FBRyxDQUFDLE1BQWdCLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRSxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQWdCLEtBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5RSxNQUFNLGdCQUFnQixHQUFHLENBQUMsTUFBZ0IsS0FDdEMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFnQixLQUFLLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7QUFNakUsUUFBQSxNQUFNLEdBQUc7SUFDbEIsV0FBVztJQUNYLGFBQWE7SUFDYixXQUFXO0lBQ1gsZ0JBQWdCO0lBQ2hCLFdBQVc7Q0FDZCxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBQ0gsY0FBcUIsS0FBSyxHQUFHLGNBQU0s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