"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Types {
}
exports.Types = Types;
//
// Enums
//
/**
 * When relating a `TimeRange` to a `Time` this enum lets you specify where
 * in the `TimeRange` you mean:
 *  * `Begin`
 *  * `Middle`
 *  * `End`
 */
var TimeAlignment;
(function (TimeAlignment) {
    TimeAlignment[TimeAlignment["Begin"] = 1] = "Begin";
    TimeAlignment[TimeAlignment["Middle"] = 2] = "Middle";
    TimeAlignment[TimeAlignment["End"] = 3] = "End";
})(TimeAlignment = exports.TimeAlignment || (exports.TimeAlignment = {}));
/**
 * Rate of emit from within a stream:
 *  * `perEvent` - an updated `Collection` is emitted on each new `Event`
 *  * `onDiscardedWindow` - an updated `Collection` is emitted whenever a window is no longer used
 */
var Trigger;
(function (Trigger) {
    Trigger[Trigger["perEvent"] = 1] = "perEvent";
    Trigger[Trigger["onDiscardedWindow"] = 2] = "onDiscardedWindow";
})(Trigger = exports.Trigger || (exports.Trigger = {}));
/**
 * Method of interpolation used by the `align()` function:
 *  * `Hold` - Emits the last known good value at alignment boundaries
 *  * `Linear` - Emits linearly interpolated values at alignment boundaries
 */
var AlignmentMethod;
(function (AlignmentMethod) {
    AlignmentMethod[AlignmentMethod["Hold"] = 1] = "Hold";
    AlignmentMethod[AlignmentMethod["Linear"] = 2] = "Linear";
})(AlignmentMethod = exports.AlignmentMethod || (exports.AlignmentMethod = {}));
/**
 * Method of filling used by the `fill()` function:
 *  * `Hold` - Fill with the previous value
 *  * `Linear` - Fill between the last value and the next value linearly
 *  * `Zero` - Fill with 0
 */
var FillMethod;
(function (FillMethod) {
    FillMethod[FillMethod["Zero"] = 1] = "Zero";
    FillMethod[FillMethod["Pad"] = 2] = "Pad";
    FillMethod[FillMethod["Linear"] = 3] = "Linear";
})(FillMethod = exports.FillMethod || (exports.FillMethod = {}));
/**
 * An enum which controls the `WindowType` for aggregation. This can
 * essentially be a Fixed window, which is a window for each `Period`
 * (e.g. every hour), or calendar style periods such as Day, Month
 * and Year.
 *  * Fixed
 *  * Day
 *  * Month
 *  * Year
 */
var WindowType;
(function (WindowType) {
    WindowType[WindowType["Global"] = 1] = "Global";
    WindowType[WindowType["Fixed"] = 2] = "Fixed";
    WindowType[WindowType["Day"] = 3] = "Day";
    WindowType[WindowType["Month"] = 4] = "Month";
    WindowType[WindowType["Year"] = 5] = "Year";
})(WindowType = exports.WindowType || (exports.WindowType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQVdIO0NBQXFCO0FBQXJCLHNCQUFxQjtBQW9CckIsRUFBRTtBQUNGLFFBQVE7QUFDUixFQUFFO0FBRUY7Ozs7OztHQU1HO0FBQ0gsSUFBWSxhQUlYO0FBSkQsV0FBWSxhQUFhO0lBQ3JCLG1EQUFTLENBQUE7SUFDVCxxREFBTSxDQUFBO0lBQ04sK0NBQUcsQ0FBQTtBQUNQLENBQUMsRUFKVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQUl4QjtBQUVEOzs7O0dBSUc7QUFDSCxJQUFZLE9BR1g7QUFIRCxXQUFZLE9BQU87SUFDZiw2Q0FBWSxDQUFBO0lBQ1osK0RBQWlCLENBQUE7QUFDckIsQ0FBQyxFQUhXLE9BQU8sR0FBUCxlQUFPLEtBQVAsZUFBTyxRQUdsQjtBQUVEOzs7O0dBSUc7QUFDSCxJQUFZLGVBR1g7QUFIRCxXQUFZLGVBQWU7SUFDdkIscURBQVEsQ0FBQTtJQUNSLHlEQUFNLENBQUE7QUFDVixDQUFDLEVBSFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFHMUI7QUFFRDs7Ozs7R0FLRztBQUNILElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNsQiwyQ0FBUSxDQUFBO0lBQ1IseUNBQUcsQ0FBQTtJQUNILCtDQUFNLENBQUE7QUFDVixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxJQUFZLFVBTVg7QUFORCxXQUFZLFVBQVU7SUFDbEIsK0NBQVUsQ0FBQTtJQUNWLDZDQUFLLENBQUE7SUFDTCx5Q0FBRyxDQUFBO0lBQ0gsNkNBQUssQ0FBQTtJQUNMLDJDQUFJLENBQUE7QUFDUixDQUFDLEVBTlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFNckIifQ==