/**
 *  Copyright (c) 2016-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import Observable from "../base/observable";
import { isPipeline } from "../pipeline";

function addPrevToChain(n, chain) {
    chain.push(n);
    if (isPipeline(n.prev())) {
        chain.push(n.prev().in());
        return chain;
    } else {
        return addPrevToChain(n.prev(), chain);
    }
}

/**
 * Base class for all Pipeline processors
 */
class Processor extends Observable {
    constructor(arg1, options) {
        super();
        if (isPipeline(arg1)) {
            this._pipeline = arg1;
            this._prev = options.prev;
        }
    }

    prev() {
        return this._prev;
    }

    pipeline() {
        return this._pipeline;
    }

    chain() {
        const chain = [this];
        if (isPipeline(this.prev())) {
            chain.push(this.prev().in());
            return chain;
        } else {
            return addPrevToChain(this.prev(), chain);
        }
    }

    flush() {
        super.flush();
    }
}

export default Processor;
