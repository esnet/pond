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
 * An enum which controls the WindowType for aggregation. This can
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQTRCSCxFQUFFO0FBQ0YsUUFBUTtBQUNSLEVBQUU7QUFFRjs7Ozs7O0dBTUc7QUFDSCxJQUFZLGFBSVg7QUFKRCxXQUFZLGFBQWE7SUFDckIsbURBQVMsQ0FBQTtJQUNULHFEQUFNLENBQUE7SUFDTiwrQ0FBRyxDQUFBO0FBQ1AsQ0FBQyxFQUpXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBSXhCO0FBRUQ7Ozs7R0FJRztBQUNILElBQVksT0FHWDtBQUhELFdBQVksT0FBTztJQUNmLDZDQUFZLENBQUE7SUFDWiwrREFBaUIsQ0FBQTtBQUNyQixDQUFDLEVBSFcsT0FBTyxHQUFQLGVBQU8sS0FBUCxlQUFPLFFBR2xCO0FBRUQ7Ozs7R0FJRztBQUNILElBQVksZUFHWDtBQUhELFdBQVksZUFBZTtJQUN2QixxREFBUSxDQUFBO0lBQ1IseURBQU0sQ0FBQTtBQUNWLENBQUMsRUFIVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUcxQjtBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNsQiwrQ0FBVSxDQUFBO0lBQ1YsNkNBQUssQ0FBQTtJQUNMLHlDQUFHLENBQUE7SUFDSCw2Q0FBSyxDQUFBO0lBQ0wsMkNBQUksQ0FBQTtBQUNSLENBQUMsRUFOVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU1yQiJ9