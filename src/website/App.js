/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import React, { Component } from "react";
import { Link } from "react-router";

import "./App.css";
import esnetLogo from "./img/logo.png";
import githubLogo from "./img/github.png";

class App extends Component {
    render() {
        return (
            <div className="App">
                <nav className="navbar navbar-inverse navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button
                                type="button"
                                className="navbar-toggle collapsed"
                                data-toggle="collapse"
                                data-target="#navbar"
                                aria-expanded="false"
                                aria-controls="navbar"
                            >
                                <span className="sr-only">
                                    Toggle navigation
                                </span>
                                <span className="icon-bar" />
                                <span className="icon-bar" />
                                <span className="icon-bar" />
                            </button>
                            <a className="navbar-brand" href="#">
                                Pond - Immutable Timeseries Abstractions
                            </a>
                        </div>
                        <div id="navbar" className="navbar-collapse collapse">
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <a href="http://www.es.net">
                                        <img
                                            src={esnetLogo}
                                            alt="ESnet"
                                            width="32px"
                                            height="32px"
                                        />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://github.com/esnet/pond/">
                                        <img
                                            src={githubLogo}
                                            alt="Github"
                                            width="32px"
                                            height="32px"
                                        />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <div className="row">
                    <div className="col-sm-3 col-md-2 sidebar">
                        <p />
                        <ul className="nav nav-sidebar">
                            <li><Link to="/">Introduction</Link></li>
                            <li><Link to="start">Getting started</Link></li>
                            <li>
                                <Link to="processing">
                                    Processing pipelines
                                </Link>
                            </li>
                            <li>
                                <Link to="missing">Handling missing data</Link>
                            </li>
                            <li><Link to="rollup">Rollup example</Link></li>
                            <li>
                                <Link to="counter">SNMP Counter example</Link>
                            </li>
                            <li><Link to="glossary">Glossary</Link></li>
                            <li><Link to="changelog">Changelog</Link></li>
                        </ul>
                        <div className="sidebar-heading">Structures</div>
                        <ul className="nav nav-sidebar">
                            <li><Link to="timerange">TimeRange</Link></li>
                            <li><Link to="index">Index</Link></li>
                            <li><Link to="event">Event</Link></li>
                            <li>
                                <Link to="timerangeevent">TimeRangeEvent</Link>
                            </li>
                            <li><Link to="indexedevent">IndexedEvent</Link></li>
                            <li><Link to="collection">Collection</Link></li>
                            <li><Link to="timeseries">TimeSeries</Link></li>
                            <li><Link to="pipeline">Pipeline</Link></li>
                        </ul>
                        <div className="sidebar-heading">Related Projects</div>
                        <ul className="nav nav-sidebar">
                            <li>
                                <a href="http://software.es.net/pypond/">
                                    PyPond
                                </a>
                            </li>
                            <li>
                                <a
                                    href="http://software.es.net/react-timeseries-charts/"
                                >
                                    React Timeseries Charts
                                </a>
                            </li>
                            <li>
                                <a
                                    href="http://software.es.net/react-network-diagrams/"
                                >
                                    React Network Diagrams
                                </a>
                            </li>
                        </ul>
                        <div className="sidebar-heading">Links</div>
                        <ul className="nav nav-sidebar">
                            <li>
                                <a href="https://github.com/esnet/pond/">
                                    Pond.js on GitHub
                                </a>
                            </li>
                            <li>
                                <a href="http://software.es.net/">
                                    ESnet Open Source
                                </a>
                            </li>
                            <li><a href="https://www.es.net/">ESnet</a></li>
                        </ul>
                    </div>
                    <div
                        className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main"
                    >
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

