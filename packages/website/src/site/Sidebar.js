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
        const filter = this.props.filter || "";
        const classes = _.sortBy(
            _.filter(this.props.docs.classes, c => !c.flags.isPrivate && c.name.includes(filter)),
            c => c.name
        );
        const interfaces = _.filter(this.props.docs.interfaces, c => !c.flags.isPrivate);
        return (
            <div
                style={{
                    position: "absolute",
                    top: 80,
                    left: 0,
                    width: "21vw",
                    height: "100vh",
                    overflow: "auto",
                    background: "#eee",
                    marginTop: "auto"
                }}
            >
                <div style={sidebarTitleStyle}>FUNCTIONS</div>
                <div key="filters" style={sidebarItemStyle}>
                    <NavLink exact to={`/filters`} activeStyle={{ color: "steelblue" }}>
                        Filters
                    </NavLink>
                </div>
                <div key="agg" style={sidebarItemStyle}>
                    <NavLink exact to={`/aggregation`} activeStyle={{ color: "steelblue" }}>
                        Aggregators
                    </NavLink>
                </div>

                <div style={sidebarTitleStyle}>CLASSES</div>
                {_.map(classes, c => (
                    <div key={c.name} style={sidebarItemStyle}>
                        <NavLink
                            exact
                            to={`/class/${c.name.toLowerCase()}`}
                            activeStyle={{ color: "steelblue" }}
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
                            activeStyle={{ color: "steelblue" }}
                        >
                            {c.name}
                        </NavLink>
                    </div>
                ))}
            </div>
        );
    }
}
