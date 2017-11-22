/**
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React, { Component } from "react";
import Prism from "prismjs";

import Function from "./Function";
import { headingStyle } from "./styles";

export default class TsFunctionList extends Component {
    componentDidMount() {
        Prism.highlightAll();
    }

    componentDidUpdate() {
        Prism.highlightAll();
    }

    render() {
        const { list, functions } = this.props;
        const functionList = list.map((fn, k) => {
            const f = functions[fn.toLowerCase()];
            return (
                <div key={fn}>
                    <Function function={f} />
                    <hr />
                </div>
            );
        });
        return (
            <div style={{ marginBottom: 20 }}>
                <h2 style={headingStyle}>{this.props.title}</h2>
                {functionList}
            </div>
        );
    }
}
