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
import Markdown from "react-markdown";
import Prism from "prismjs";

import Method from "./Method";
import Property from "./Property";

import { codeRenderer, codeBlockRenderer } from "./renderers";
import { codeStyle, headingStyle, textStyle, groupStyle } from "./styles";

export default class TsClass extends Component {
    static defaultProps = {
        showExtends: false
    };

    componentDidMount() {
        Prism.highlightAll();
    }

    componentDidUpdate() {
        Prism.highlightAll();
    }

    renderClassSignature() {
        const { name, typeParameter, extendedTypes } = this.props.class;
        let extendedName;
        let typeArgument;
        if (typeParameter && typeParameter.length) {
            const typeParameters = typeParameter.map(t => {
                if (t.type) {
                    const type = t.type.name;
                    return `${t.name} extends ${type}`;
                } else {
                    return `${t.name}`;
                }
            });
            if (extendedTypes) {
                const { typeArguments } = extendedTypes[0];
                extendedName = extendedTypes[0].name;
                if (typeArguments && typeArguments.length) {
                    typeArgument = typeArguments.map(t => {
                        return `${t.name}`;
                    });
                }
            }
            return typeArgument ? (
                <code style={codeStyle}>
                    {`class ${name} <${typeParameters.join(
                        ", "
                    )}> extends ${extendedName} <${typeArgument.join(", ")}>`}
                </code>
            ) : (
                <code style={codeStyle}>{`class ${name} <${typeParameters.join(", ")}>`}</code>
            );
        } else {
            return <code style={codeStyle}>{`class ${name}`}</code>;
        }
    }

    renderShortComment() {
        const { comment } = this.props.class;
        return comment ? (
            <div style={textStyle}>
                <Markdown
                    source={comment.shortText}
                    renderers={{ Code: codeRenderer, CodeBlock: codeBlockRenderer }}
                />
            </div>
        ) : (
            <div style={textStyle} />
        );
    }

    renderDiscussion() {
        const { comment } = this.props.class;
        if (comment && comment.text) {
            const { text } = comment;
            return (
                <div style={textStyle}>
                    <h4 style={textStyle}>DISCUSSION</h4>
                    <Markdown
                        source={text}
                        renderers={{ Code: codeRenderer, CodeBlock: codeBlockRenderer }}
                    />
                </div>
            );
        } else {
            return <div />;
        }
    }

    renderGroups() {
        const entityMap = {};
        if (this.props.class.children) {
            this.props.class.children.forEach(child => {
                entityMap[child.id] = child;
            });
            const groups = this.props.class.groups.map((group, i) => {
                const groupEntities = group.children.map((entity, j) => {
                    return <div key={j}>{this.renderEntity(entityMap[entity])}</div>;
                });
                if (group.title === "Constructors") {
                    const factoryLookup = `${this.props.class.name}Factory`.toLocaleLowerCase();
                    const factory = this.props.lookups.functions[factoryLookup];
                    if (factory) {
                        return (
                            <div key={i}>
                                <hr />
                                <h3 style={groupStyle}>Construction</h3>
                                {groupEntities}
                                <Method
                                    entity={factory}
                                    alias={factory.name.replace("Factory", "")}
                                    title="factory function"
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div key={i}>
                                <hr />
                                <h3 style={groupStyle}>Construction</h3>
                                {groupEntities}
                            </div>
                        );
                    }
                }
                return (
                    <div key={i}>
                        <hr />
                        <h3 style={groupStyle}>{group.title}</h3>
                        {groupEntities}
                    </div>
                );
            });
            return <div style={textStyle}>{groups}</div>;
        } else {
            return <div />;
        }
    }

    renderEntity(entity) {
        switch (entity.kindString) {
            case "Function":
                return <Method entity={entity} />;
            case "Constructor":
                return <Method entity={entity} />;
            case "Property":
                return <Property entity={entity} />;
            case "Method":
                return <Method entity={entity} />;
            default:
                return <div>{entity.name}</div>;
        }
    }

    render() {
        const { name } = this.props.class;
        return (
            <div style={{ marginBottom: 20 }}>
                <h2 style={headingStyle}>{name}</h2>

                <pre
                    style={{
                        marginTop: 15,
                        padding: 5,
                        borderColor: "#4ec1e0",
                        borderWidth: 3,
                        borderRadius: 0,
                        borderTopStyle: "none",
                        borderBottomStyle: "none",
                        borderRightStyle: "none",
                        background: "#fafafa"
                    }}
                >
                    {this.renderClassSignature()}
                </pre>
                {this.renderShortComment()}
                {this.renderDiscussion()}
                {this.renderGroups()}
            </div>
        );
    }
}
