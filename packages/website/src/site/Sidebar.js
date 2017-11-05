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
import { NavLink } from "react-router-dom";

import { sidebarTitleStyle, sidebarItemStyle } from "./api/styles";

export default class extends Component {
    render() {
        const sidebarStyle = {
            flex: "0 0 12em",
            background: "#FEFEFE",
            color: "#4183C4",
            textDecoration: "none"
        };
        const activeStyle = {
            color: "black",
            fontWeight: 800,
            textDecoration: "none"
        };

        const filter = this.props.filter || "";
        const classes = _.sortBy(
            _.filter(this.props.docs.classes, c => !c.flags.isPrivate && c.name.includes(filter)),
            c => c.name
        );
        const interfaces = _.filter(this.props.docs.interfaces, c => !c.flags.isPrivate);
        return (
            <div style={sidebarStyle}>
                <div style={sidebarTitleStyle}>FUNCTIONS</div>
                <div key="filters" style={sidebarItemStyle}>
                    <NavLink exact to={`/filters`} activeStyle={activeStyle}>
                        Filters
                    </NavLink>
                </div>
                <div key="agg" style={sidebarItemStyle}>
                    <NavLink exact to={`/aggregation`} activeStyle={activeStyle}>
                        Aggregators
                    </NavLink>
                </div>

                <div style={sidebarTitleStyle}>CLASSES</div>
                {_.map(classes, c => (
                    <div key={c.name} style={sidebarItemStyle}>
                        <NavLink
                            exact
                            to={`/class/${c.name.toLowerCase()}`}
                            activeStyle={activeStyle}
                        >
                            {c.name}
                        </NavLink>
                    </div>
                ))}
                <div style={sidebarTitleStyle}>INTERFACES</div>
                {_.map(interfaces, c => (
                    <div key={c.name} style={sidebarItemStyle}>
                        <NavLink
                            exact
                            to={`/interface/${c.name.toLowerCase()}`}
                            activeStyle={activeStyle}
                        >
                            {c.name}
                        </NavLink>
                    </div>
                ))}
            </div>
        );
    }
}
