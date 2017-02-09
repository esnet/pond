/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import Processor from "./processor";

import { isPipeline } from "../pipeline";

/**
 * A processor which takes a fieldSpec and returns a new event
 * with a new column that is a collapsed result of the selected
 * columns. To collapse the columns it uses the supplied reducer
 * function. Optionally the new column can completely replace
 * the existing columns in the event.
 */
export default class Collapser extends Processor {
    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Collapser) {
            const other = arg1;
            this._fieldSpecList = other._fieldSpecList;
            this._name = other._name;
            this._reducer = other._reducer;
            this._append = other._append;
        } else if (isPipeline(arg1)) {
            this._fieldSpecList = options.fieldSpecList;
            this._name = options.name;
            this._reducer = options.reducer;
            this._append = options.append;
        } else {
            throw new Error("Unknown arg to Collapser constructor", arg1);
        }
    }

    clone() {
        return new Collapser(this);
    }

    addEvent(event) {
        if (this.hasObservers()) {
            this.emit(
                event.collapse(
                    this._fieldSpecList,
                    this._name,
                    this._reducer,
                    this._append
                )
            );
        }
    }
}
