"use strict";
/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const processor_1 = require("./processor");
/**
 * A processor which takes a fieldSpec and returns a new event
 * with a new column that is a collapsed result of the selected
 * columns. To collapse the columns it uses the supplied reducer
 * function. Optionally the new column can completely replace
 * the existing columns in the event.
 */
class Collapse extends processor_1.Processor {
    constructor(options) {
        super();
        this.options = options;
    }
    addEvent(event) {
        return Immutable.List([
            event.collapse(this.options.fieldSpecList, this.options.fieldName, this.options.reducer, this.options.append)
        ]);
    }
}
exports.Collapse = Collapse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29sbGFwc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztHQVFHOztBQUVILHVDQUF1QztBQUt2QywyQ0FBd0M7QUFJeEM7Ozs7OztHQU1HO0FBQ0gsTUFBYSxRQUF3QixTQUFRLHFCQUFlO0lBQ3hELFlBQW9CLE9BQXdCO1FBQ3hDLEtBQUssRUFBRSxDQUFDO1FBRFEsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7SUFFNUMsQ0FBQztJQUNELFFBQVEsQ0FBQyxLQUFlO1FBQ3BCLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQztZQUNsQixLQUFLLENBQUMsUUFBUSxDQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUN0QjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWRELDRCQWNDIn0=