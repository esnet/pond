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

export default {
    sum(values) {
        return _.reduce(values, (a, b) => { return a + b; }, 0);
    },
    avg(values) {
        const sum = _.reduce(values, (a, b) => { return a + b; }, 0);
        return sum / values.length;
    },
    max(values) {
        return _.max(values);
    },
    min(values) {
        return _.min(values);
    },
    count(values) {
        return values.length;
    },
    first(values) {
        return values.length ? values[0] : undefined;
    },
    last(values) {
        return values.length ? values[values.length - 1] : undefined;
    },
    difference(values) {
        return _.max(values) - _.min(values);
    }
};
