/**
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import "./App.css";
import _ from "lodash";
import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, NavLink } from "react-router-dom";

import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism.css";

import Home, { Root, Main } from "./Home";
import Header from "./Header";
import Sidebar from "./Sidebar";

import TsModule from "./api/Module";
import TsClass from "./api/Class";
import TsType from "./api/Type";
import TsEnum from "./api/Enum";
import TsObject from "./api/Object";
import TsFunction from "./api/Function";
import TsInterface from "./api/Interface";
import TsMethod from "./api/Method";

import { activeLinkStyle } from "./api/styles";

// Generated pond.js code and documentation as a JSON file. This is what we are
// parsing here to generate the API documentation
import docsJSON from "../doc.json";

// #region styles
const sidebarStyle = {
    color: "#626466",
    fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
    fontSize: 18,
    lineHeight: 2,
    marginLeft: "1vw"
};

const sidebarHeading = {
    paddingLeft: 5,
    paddingTop: 5,
    textTransform: "uppercase",
    fontWeight: 800,
    fontSize: 24
};
// #endregion

const docs = {
    modules: {},
    classes: {},
    functions: {},
    methods: {},
    interfaces: {},
    enums: {},
    objects: {},
    types: {},
    properties: {}
};

function buildTypes(root) {
    _.forEach(root, child => {
        const { name, kindString } = child;
        const n = name.toLowerCase();
        switch (kindString) {
            case "External module":
                docs.modules[n] = child;
                break;
            case "Class":
                docs.classes[n] = child;
                break;
            case "Object literal":
                docs.objects[n] = child;
                break;
            case "Function":
                docs.functions[n] = child;
                break;
            case "Interface":
                docs.interfaces[n] = child;
                break;
            case "Type alias":
                docs.types[n] = child;
                break;
            case "Method":
                docs.methods[n] = child;
                break;
            case "Enumeration":
            case "Enumeration member":
                docs.enums[n] = child;
                break;
            case "Property":
                docs.properties[n] = child;
                break;
            default:
            //console.log(">>", kindString, n);
        }
        if (_.has(child, "children")) {
            buildTypes(child.children);
        }
    });
}

buildTypes(docsJSON.children);

console.log(docs);

class ScrollToTop extends Component {
    componentDidMount(prevProps) {
        window.scrollTo(0, 0);
    }
    render() {
        return null;
    }
}

// const classLinks = [
//     "Align",
//     "Base",
//     "Collapse",
//     "Collection",
//     "Event",
//     "Fill",
//     "GroupedCollection",
//     "Index",
//     "Key",
//     "Period",
//     "Processor",
//     "Rate",
//     "SortedCollection",
//     "Time",
//     "TimeRange",
//     "TimeSeries",
//     "WindowedCollection",
//     "AlignmentOptions"
// ];

class SideBarItem extends Component {
    renderChild(child, i) {
        if (child.flags.isPrivate === true) {
            return <div />;
        }
        if (child.name.includes("Factory")) {
            return <div />;
        }
        if (child.kindString === "Class") {
            return (
                <div style={sidebarStyle}>
                    <ScrollToTop />
                    <NavLink exact to={`/${child.name}`} activeStyle={activeLinkStyle}>
                        {child.name}
                    </NavLink>
                </div>
            );
        } else {
            return (
                <ul style={{ listStyleType: "None" }}>
                    <li style={sidebarStyle}>
                        <ScrollToTop />
                        <NavLink exact to={`/${child.name}`} activeStyle={activeLinkStyle}>
                            {child.kindString === "Function" ? `${child.name}()` : child.name}
                        </NavLink>
                    </li>
                </ul>
            );
        }
    }
    render() {
        const { id, children } = this.props.sidebar;
        return (
            <div>
                {children ? (
                    _.map(children, (child, i) => <div key={id}>{this.renderChild(child, i)}</div>)
                ) : (
                    <div />
                )}
            </div>
        );
    }
}

export default class extends Component {
    render() {
        const { name, children } = docs;
        return (
            <Router>
                <Root>
                    <Header />
                    <Sidebar docs={docs} />
                    <Main>
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route
                                path={`/module/:name`}
                                render={() => <TsModule module={docs.modules[name]} />}
                            />
                            <Route
                                path={`/class/:name`}
                                render={props => (
                                    <TsClass
                                        class={docs.classes[props.match.params.name]}
                                        lookups={docs}
                                    />
                                )}
                            />
                            <Route
                                path={`/function/:name`}
                                render={props => (
                                    <TsFunction function={docs.function[props.match.params.name]} />
                                )}
                            />
                            <Route
                                path={`/method/:name`}
                                render={props => (
                                    <TsMethod method={docs.methods[props.match.params.name]} />
                                )}
                            />
                            <Route
                                path={`/interface/:name`}
                                render={props => (
                                    <TsInterface
                                        interface={docs.interfaces[props.match.params.name]}
                                    />
                                )}
                            />
                            <Route
                                path={`/enum/:name`}
                                render={props => (
                                    <TsEnum enum={docs.enums[props.match.params.name]} />
                                )}
                            />
                            <Route
                                path={`/type/:name`}
                                render={props => (
                                    <TsObject object={docs.types[props.match.params.name]} />
                                )}
                            />
                            <Route
                                path={`/object/:name`}
                                render={props => (
                                    <TsObject object={docs.objects[props.match.params.name]} />
                                )}
                            />
                            <Route
                                path={`/type/:name`}
                                render={props => (
                                    <TsType type={docs.types[props.match.params.name]} />
                                )}
                            />
                        </Switch>
                    </Main>
                </Root>
            </Router>
        );
    }
}
