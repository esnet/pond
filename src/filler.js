/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";
import Processor from "./processor";
import { isPipeline } from "./pipeline";
import util from "./util";

/**
 * A processor that fills missing/invalid values in the event with
 * new values (zero, interpolated or padded).
 * Number of filled events in new series can be controlled by
 * putting .take() in the pipeline chain.
 */
export default class Filler extends Processor {

    constructor(arg1, options) {
        super(arg1, options);

        if (arg1 instanceof Filler) {
            const other = arg1;
            this._fieldSpec = other._fieldSpec;
            this._method = other._method;
            this._fillLimit = other._fillLimit;
        } else if (isPipeline(arg1)) {
            const {
                fieldSpec,
                method = "zero",
                fillLimit = null
            } = options;

            this._fieldSpec = fieldSpec;
            this._method = method;
            this._fillLimit = fillLimit;

        } else {
            throw new Error("Unknown arg to Filler constructor", arg1);
        }

        //
        // Internal members
        //
        
        // state for pad to refer to previous event
        this._previousEvent = null;

        // record of filled list values for linear to
        // alternately skip or fill depending on context.
        this._filledLists = [];

        // special state for linear fill
        this._lastGoodLinear = null;

        // cache of events pending linear fill
        this._linearFillCache = [];

        // key count for zero and pad fill
        this._keyCount = {};

        if (!_.contains(["zero", "pad", "linear"], this._method)) {
            throw new Error(`Unknown method ${this._method} passed to Filler`);
        }

        if (_.isString(this._fieldSpec)) {
            this._fieldSpec = [this._fieldSpec];
        }
    }

    clone() {
        return new Filler(this);
    }

    /**
     * Process and fill the values at the paths as apropos when the fill
     * method is either pad or zero.
     */
    _padAndZero(data, paths) {
        let newData = data;

        for (const path of paths) {

            const fieldPath = util.fieldPathToArray(path);
            const pathKey = fieldPath.join(":");

            //initialize a counter for this column
            if (!_.has(this._keyCount, pathKey)) {
                this._keyCount[pathKey] = 0;
            }

            // this is pointing at a path that does not exist
            if (!newData.hasIn(fieldPath)) {
                continue;
            }

            const val = newData.getIn(fieldPath);

            if (util.isMissing(val)) {

                // Have we hit the limit?
                if (this._fillLimit && this._keyCount[pathKey] >= this._fillLimit) {
                    continue;
                }

                if (this._method === "zero") {       // set to zero
                    newData = newData.setIn(fieldPath, 0);
                    this._keyCount[pathKey]++;
                } else if (this._method === "pad") { // set to previous value
                    if (!_.isNull(this._previousEvent)) {
                        const prevVal = this._previousEvent.data().getIn(fieldPath);

                        if (!util.isMissing(prevVal)) {
                            newData = newData.setIn(fieldPath, prevVal);
                            this._keyCount[pathKey]++;
                        }
                    }
                } else if (this._method === "linear") {
                    //noop
                }
            } else {
                this._keyCount[pathKey] = 0;
            }
        }
        return newData;
    }

    /**
     * Perform the fill operation on the event and emit.
     */
    addEvent(event) {

        if (this.hasObservers()) {

            const toEmit = [];
            const d = event.data();

            let paths;
            if (!this._fieldSpec) {
                // generate a list of all possible field paths if no field spec is specified.
                paths = util.generatePaths(d.toJS());
            } else {
                paths = this._fieldSpec;
            }

            if (this._method === "zero" || this._method === "pad") {
                // zero and pad use much the same method in that
                // they both will emit a single event every time
                // add_event() is called.
                const newData = this._padAndZero(d, paths);
                const emit = event.setData(newData);
                toEmit.push(emit);

                // remember previous event for padding
                this._previousEvent = emit;

            } else if (this._method === "linear") {
                // linear filling follows a somewhat different
                // path since it might emit zero, one or multiple
                // events every time add_event() is called.
                for (const emit of this._linearFill(event, paths)) {
                    toEmit.push(emit);
                }
            }

            // end filling logic

            for (const event of toEmit) {
                this.emit(event);
            }
        }
    }
}
