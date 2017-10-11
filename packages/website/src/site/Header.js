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
import logo from "./logo.png";

/* eslint-disable  jsx-a11y/href-no-hash */

export default class Header extends Component {
    render() {
        return (
            <nav className="navbar navbar-fixed-top">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <div className="navbar-brand">
                            <span>
                                <a href="/">
                                    <img src={logo} alt="logo" height={60} />
                                </a>
                            </span>
                            <span style={{ fontSize: 32, marginLeft: 10 }}>pond.js</span>
                        </div>
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav navbar-right tools-links">
                            <li>
                                <a href="http://my.es.net" style={{ paddingTop: 8 }}>
                                    ESnet Portal
                                </a>
                            </li>
                            <li>
                                <a className="selected" style={{ paddingTop: 8 }} href="#">
                                    Open Source
                                </a>
                            </li>
                            <li>
                                <a href="http://es.net" style={{ paddingTop: 8 }}>
                                    ESnet
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
