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

/**
 * Base class for objects in the processing chain which
 * need other object to listen to them. It provides a basic
 * interface to define the relationships and to emit events
 * to the interested observers.
 */
class Observable {
    constructor() {
        this._id = _.uniqueId("id-");
        this._observers = [];
    }

    emit(event) {
        this._observers.forEach(observer => {
            observer.addEvent(event);
        });
    }

    flush() {
        this._observers.forEach(observer => {
            observer.flush();
        });
    }

    addObserver(observer) {
        let shouldAdd = true;
        this._observers.forEach(o => {
            if (o === observer) {
                shouldAdd = false;
            }
        });

        if (shouldAdd) this._observers.push(observer);
    }

    hasObservers() {
        return this._observers.length > 0;
    }
}

export default Observable;
