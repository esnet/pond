/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from "underscore";

export default class Grouper {

    /**
     * `groupBy` may be either:
     *     * A function which takes an event and returns a string as a key
     *     * A string, which corresponds to a column in the event, like "name"
     *     * A list, which corresponds to a list of columns to join together for the key
     * `observer` is the callback that will receive the emitted events
     */
    constructor(options, observer) {
        if (!_.has(options, "groupBy")) {
            throw new Error("Grouper: constructor needs 'groupBy' in options");
        }

        if (_.isFunction(options.groupBy)) {
            this._groupBy = options.groupBy;
        } else if (_.isArray(options.groupBy)) {
            this._groupBy = (event) =>
                _.map(options.groupBy, column => `${event.get(column)}`).join("::");
        } else if (_.isString(options.groupBy)) {
            this._groupBy = (event) => `${event.get(options.groupBy)}`;
        } else {
            throw Error("Unable to interpret groupBy argument passed to Grouper constructor");
        }
        this._observer = observer;
    }

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */
    addEvent(event, cb) {
        if (this._observer) {
            this._observer(event.setKey(this._groupBy(event)));
        }
        if (cb) {
            cb(null);
        }
    }

    onEmit(cb) {
        this._observer = cb;
    }

    done() {
        return;
    }
}
