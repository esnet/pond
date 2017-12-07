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
/**
 * Internal abstract base class for streaming chains. A `Processor` is something
 * that implements at a minimum one method: `addEvent()`. The return of that
 * method is a list of output `Event`s.
 *
 * `Align`, `Fill` etc are implementations of this abstract class. Those in turn
 * are used jointly to implemented within the `Collection` classes. For example
 * `Align` implements `Processor` to combine its own state (or past `Event`s) with
 * the incoming `Event` to output aligned `Event`s (new `Event`s that fall on
 * a periodic boundary). The `Align` class is then utilized in the `Collection` class
 * by using it within a `flatMap` to process all `Event`s within the `Collection` into
 * a new set of `Event`s. It is also used when implementing stream processing that
 * requires `align` processing.
 */
class Processor {
}
exports.Processor = Processor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Byb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBT0g7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNIO0NBRUM7QUFGRCw4QkFFQyJ9