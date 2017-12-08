import { ReducerFunction } from "./types";
/**
 * Like `first()` except it will return null if not all the values are
 * the same. This can be used to transfer a value when doing aggregation.
 *
 * For instance you might "group by" the 'type', then `avg` the 'value', but
 * you want to results to include the type. So you would `keep()` the type
 * and `avg()` the value.
 */
export declare function keep(clean?: (values: number[]) => number[]): ReducerFunction;
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
export declare function sum(clean?: (values: number[]) => number[]): ReducerFunction;
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
export declare function avg(clean?: (values: number[]) => number[]): ReducerFunction;
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
export declare function max(clean?: (values: number[]) => number[]): ReducerFunction;
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
export declare function min(clean?: (values: number[]) => number[]): ReducerFunction;
/**
 * Returns a `count()` function.
 *
 * Optionally you can specify the method by which unclean values
 * are treated. The default is to exclude missing values from
 * the count. Other possibilities are:
 * * `propagateMissing` - which will cause the count itself to be null if the
 *                         values contain a missing value
 */
export declare function count(clean?: (values: number[]) => number[]): ReducerFunction;
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
export declare function first(clean?: (values: number[]) => number[]): ReducerFunction;
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
export declare function last(clean?: (values: number[]) => number[]): ReducerFunction;
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
export declare function difference(clean?: (values: number[]) => number[]): ReducerFunction;
/**
 * Returns the `median()` function, i.e. a function that returns
 * the median of the values supplied to it.
 */
export declare function median(clean?: (values: number[]) => number[]): ReducerFunction;
/**
 * Returns a function that returns a `stdev()` function, i.e. a function
 * that returns the standard deviation of the values supplied to it.
 */
export declare function stdev(clean?: (values: number[]) => number[]): ReducerFunction;
export declare enum InterpolationType {
    linear = 1,
    lower = 2,
    higher = 3,
    nearest = 4,
    midpoint = 5,
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
export declare function percentile(q: number, interp?: InterpolationType, clean?: (values: number[]) => number[]): ReducerFunction;
export declare const filter: {
    keepMissing: (values: number[]) => number[];
    ignoreMissing: (values: number[]) => number[];
    zeroMissing: (values: number[]) => number[];
    propagateMissing: (values: number[]) => number[];
    noneIfEmpty: (values: number[]) => number[];
};
