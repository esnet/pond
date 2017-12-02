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
import _ from "lodash";

import TsClass from "./Class";
import TsType from "./Type";
import TsEnum from "./Enum";
import TsObject from "./Object";
import TsFunction from "./Function";
import TsInterface from "./Interface";

export default class TsModule extends Component {
    renderChild(child, i) {
        switch (child.kindString) {
            case "Class":
                return <TsClass key={i} class={child} />;
            case "Function":
                return <TsFunction key={i} function={child} />;
            case "Interface":
                return <TsInterface key={i} interface={child} />;
            case "Enumeration":
                return <TsEnum key={i} enum={child} />;
            case "Object literal":
                return <TsObject key={i} object={child} />;
            case "Type alias":
                return <TsType key={i} type={child} />;
            default:
                return (
                    <div key={i}>
                        <h1>{`Unhandled type ${child.kindString}`}</h1>
                    </div>
                );
        }
    }

    render() {
        const { children } = this.props.module;
        return (
            <div>
                {children ? _.map(children, (child, i) => this.renderChild(child, i)) : <div />}
            </div>
        );
    }
}
