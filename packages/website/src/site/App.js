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
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Prism from "prismjs"; // eslint-disable-line
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
import TsFunctionList from "./api/FunctionList";
import TsInterface from "./api/Interface";
import TsMethod from "./api/Method";

// Generated pond.js code and documentation as a JSON file. This is what we are
// parsing here to generate the API documentation
import docsJSON from "../doc.json";

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

const filterList = [
    "keepMissing",
    "ignoreMissing",
    "zeroMissing",
    "propagateMissing",
    "noneIfEmpty"
];

const aggregationList = [
    "avg",
    "count",
    "difference",
    "first",
    "keep",
    "last",
    "max",
    "median",
    "min",
    "percentile",
    "stdev",
    "sum"
];

class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0);
        }
    }

    render() {
        return this.props.children;
    }
}

export default class extends Component {
    render() {
        const { name } = docs;
        return (
            <Router>
                <Root>
                    <Header />
                    <Sidebar docs={docs} />
                    <Main>
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route
                                path={`/filters`}
                                render={() => (
                                    <TsFunctionList
                                        list={filterList}
                                        functions={docs.functions}
                                        title="Filter functions"
                                    />
                                )}
                            />
                            <Route
                                path={`/aggregation`}
                                render={() => (
                                    <TsFunctionList
                                        list={aggregationList}
                                        functions={docs.functions}
                                        title="Aggregation functions"
                                    />
                                )}
                            />
                            <Route
                                path={`/module/:name`}
                                render={() => <TsModule module={docs.modules[name]} />}
                            />
                            <Route
                                path={`/class/:name`}
                                render={props => (
                                    <ScrollToTop key={props.match.params.name}>
                                        <TsClass
                                            class={docs.classes[props.match.params.name]}
                                            lookups={docs}
                                        />
                                    </ScrollToTop>
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
