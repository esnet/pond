/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

export default {

    highlightCodeBlocks() {
        const els = document.querySelectorAll("pre code");
        for (let i = 0; i < els.length; i++) {
            if (!els[i].classList.contains("hljs")) {
                window.hljs.highlightBlock(els[i]);
            }
        }
    },

    componentDidMount() {
        this.highlightCodeBlocks();
    },

    componentDidUpdate() {
        this.highlightCodeBlocks();
    }
};
