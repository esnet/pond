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
//
// Functions to process missing values out of a value list
//
const keepMissing = (values) => values;
const ignoreMissing = (values) => values.filter(util_1.default.isValid);
const zeroMissing = (values) => values.map(v => (util_1.default.isValid(v) ? v : 0));
const propagateMissing = (values) => ignoreMissing(values).length === values.length ? values : null;
const noneIfEmpty = (values) => (values.length === 0 ? null : values);
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
    return (values) => {
        const cleanValues = clean(values);
        if (!cleanValues) {
            return null;
        }
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
        if (!cleanValues) {
            return null;
        }
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
        if (!cleanValues) {
            return null;
        }
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
        if (!cleanValues) {
            return null;
        }
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
        if (!cleanValues) {
            return null;
        }
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
        if (!cleanValues) {
            return null;
        }
        return cleanValues.length ? cleanValues[cleanValues.length - 1] : undefined;
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
        if (!cleanValues) {
            return null;
        }
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
 * Returns a function that returns a stdev() function, i.e. a function
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
 * Returns a percentile function within the a values list.
 * The parameters controlling the function:
 *  * q        The percentile (should be between 0 and 100), e.g q=75 for 75th percentile.
 *  * interp   Specifies the interpolation method to use when the desired
 *             quantile lies between two data points. Options are:
 *              * linear: i + (j - i) * fraction, where fraction is
 *                the fractional part of the index surrounded by i and j.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBRUgsNEJBQTRCO0FBRzVCLGlDQUEwQjtBQUUxQixFQUFFO0FBQ0YsMERBQTBEO0FBQzFELEVBQUU7QUFDRixNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQWdCLEtBQUssTUFBTSxDQUFDO0FBQ2pELE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBZ0IsS0FBSyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4RSxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQWdCLEtBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JGLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxNQUFnQixLQUN0QyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuRSxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQWdCLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFFaEY7Ozs7OztHQU1HO0FBQ0gsY0FBcUIsS0FBSyxHQUFHLGNBQU0sQ0FBQyxhQUFhO0lBQzdDLE1BQU0sQ0FBQyxDQUFDLE1BQWdCO1FBQ3BCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztBQUNOLENBQUM7QUFkRCxvQkFjQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILGFBQW9CLEtBQUssR0FBRyxjQUFNLENBQUMsYUFBYTtJQUM1QyxNQUFNLENBQUMsQ0FBQyxNQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBUyxFQUFFLENBQVMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUMsQ0FBQztBQUNOLENBQUM7QUFSRCxrQkFRQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILGFBQW9CLEtBQUssR0FBRyxjQUFNLENBQUMsYUFBYTtJQUM1QyxNQUFNLENBQUMsQ0FBQyxNQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FDaEIsV0FBVyxFQUNYLENBQUMsQ0FBUyxFQUFFLENBQVM7WUFDakIsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQyxFQUNELENBQUMsQ0FDSixDQUFDO1FBQ0YsTUFBTSxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQ3BDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFmRCxrQkFlQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILGFBQW9CLEtBQUssR0FBRyxjQUFNLENBQUMsYUFBYTtJQUM1QyxNQUFNLENBQUMsQ0FBQyxNQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2YsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNOLENBQUM7QUFYRCxrQkFXQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILGFBQW9CLEtBQUssR0FBRyxjQUFNLENBQUMsYUFBYTtJQUM1QyxNQUFNLENBQUMsQ0FBQyxNQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2YsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNOLENBQUM7QUFYRCxrQkFXQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsZUFBc0IsS0FBSyxHQUFHLGNBQU0sQ0FBQyxhQUFhO0lBQzlDLE1BQU0sQ0FBQyxDQUFDLE1BQWdCO1FBQ3BCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDLENBQUM7QUFDTixDQUFDO0FBUkQsc0JBUUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsZUFBc0IsS0FBSyxHQUFHLGNBQU0sQ0FBQyxhQUFhO0lBQzlDLE1BQU0sQ0FBQyxDQUFDLE1BQWdCO1FBQ3BCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQzNELENBQUMsQ0FBQztBQUNOLENBQUM7QUFSRCxzQkFRQztBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxjQUFxQixLQUFLLEdBQUcsY0FBTSxDQUFDLGFBQWE7SUFDN0MsTUFBTSxDQUFDLENBQUMsTUFBZ0I7UUFDcEIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNoRixDQUFDLENBQUM7QUFDTixDQUFDO0FBUkQsb0JBUUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILG9CQUEyQixLQUFLLEdBQUcsY0FBTSxDQUFDLGFBQWE7SUFDbkQsTUFBTSxDQUFDLENBQUMsTUFBZ0I7UUFDcEIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbkQsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVJELGdDQVFDO0FBRUQ7OztHQUdHO0FBQ0gsZ0JBQXVCLEtBQUssR0FBRyxjQUFNLENBQUMsYUFBYTtJQUMvQyxNQUFNLENBQUMsQ0FBQyxNQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQWhCRCx3QkFnQkM7QUFFRDs7O0dBR0c7QUFDSCxlQUFzQixLQUFLLEdBQUcsY0FBTSxDQUFDLGFBQWE7SUFDOUMsTUFBTSxDQUFDLENBQUMsTUFBZ0I7UUFDcEIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNiLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVhELHNCQVdDO0FBRUQsSUFBWSxpQkFNWDtBQU5ELFdBQVksaUJBQWlCO0lBQ3pCLDZEQUFVLENBQUE7SUFDViwyREFBSyxDQUFBO0lBQ0wsNkRBQU0sQ0FBQTtJQUNOLCtEQUFPLENBQUE7SUFDUCxpRUFBUSxDQUFBO0FBQ1osQ0FBQyxFQU5XLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBTTVCO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILG9CQUNJLENBQVMsRUFDVCxTQUE0QixpQkFBaUIsQ0FBQyxNQUFNLEVBQ3BELEtBQUssR0FBRyxjQUFNLENBQUMsYUFBYTtJQUU1QixNQUFNLENBQUMsQ0FBQyxNQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUM7UUFFTixNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUUzQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNsQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVsRCxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1osTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3hDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxLQUFLLElBQUksUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELENBQUMsR0FBRyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUNsQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNqQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUMsQ0FBQztBQUNOLENBQUM7QUFqREQsZ0NBaURDO0FBRVksUUFBQSxNQUFNLEdBQUc7SUFDbEIsV0FBVztJQUNYLGFBQWE7SUFDYixXQUFXO0lBQ1gsZ0JBQWdCO0lBQ2hCLFdBQVc7Q0FDZCxDQUFDIn0=