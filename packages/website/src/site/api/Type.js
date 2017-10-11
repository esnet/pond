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

import { codeRenderer } from "./renderers";
import { codeStyle, headingStyle, textStyle } from "./styles";

export default class TsType extends Component {
    buildParamList(parameters) {
        return parameters
            ? parameters.map((param, i) => {
                  const paramType = param.type;
                  const paramName = param.name;
                  const paramTypeName = paramType.name;
                  const isArray = paramType.isArray;
                  const isOptional = param.flags.isOptional;
                  const typeArgs = this.buildTypeArguments(paramType.typeArguments);
                  return `${paramName}${isOptional ? "?" : ""}: ${paramTypeName
                      ? paramTypeName
                      : ""}${typeArgs}${isArray ? "[]" : ""}`;
              })
            : [];
    }

    buildReturnType(signature) {
        if (signature.type) {
            const typeName = this.buildType(signature.type);
            const isArray = signature.type.isArray;
            return `${typeName}${isArray ? "[]" : ""}`;
        } else {
            return "";
        }
    }

    buildType(type) {
        if (type) {
            const typeArgs = this.buildTypeArguments(type.typeArguments);
            return `${type.name}${typeArgs}`;
        }
    }

    buildTypeArguments(typeArguments) {
        if (typeArguments) {
            const typeArgs = typeArguments.map(t => {
                return this.buildType(t);
            });
            return `<${typeArgs.join(", ")}>`;
        }
        return "";
    }

    buildUnion(type) {
        const { types } = type;
        const values = types.map(type => {
            if (type.typeArguments) {
                const typeArgs = this.buildTypeArguments(type.typeArguments);
                return `${type.name}${typeArgs}`;
            } else {
                return type.name;
            }
        });
        return values.join(" | ");
    }

    buildDeclarations(type) {
        const { signatures } = type.declaration;
        const methodSignatures = signatures.map(signature => {
            const parameters = signature.parameters;
            const paramList = this.buildParamList(parameters);
            const returnType = this.buildReturnType(signature);
            const output = `(${paramList.join(", ")}) => ${returnType}`;
            return output;
        });
        return methodSignatures;
    }

    buildTuple(type) {
        const { elements } = type;
        const values = elements.map(type => {
            return type.name;
        });
        return `[${values.join(" , ")}]`;
    }

    buildReference(type) {
        const { typeArguments, name } = type;
        const values = typeArguments.map(type => {
            if (type.typeArguments) {
                const typeArgs = this.buildTypeArguments(type.typeArguments);
                return `${type.name}${typeArgs}`;
            } else {
                return type.name;
            }
        });
        return `${name} < ${values.join(", ")} >`;
    }

    buildSignature() {
        const { type } = this.props.type;
        switch (type.type) {
            case "union":
                return this.buildUnion(type);
            case "reflection":
                return this.buildDeclarations(type);
            case "tuple":
                return this.buildTuple(type);
            case "reference":
                return this.buildReference(type);
            default:
                return <div />;
        }
    }

    renderComment() {
        const { comment } = this.props.type;
        return comment ? (
            <div style={textStyle}>
                <Markdown source={comment.shortText} renderers={{ Code: codeRenderer }} />
            </div>
        ) : (
            <div style={textStyle} />
        );
    }

    render() {
        const { name } = this.props.type;
        return (
            <div style={{ marginBottom: 20 }}>
                <h2 style={headingStyle}>
                    <a id={name}>{name}</a>
                </h2>
                {this.renderComment()}
                <code style={codeStyle}>{`type ${name} = ${this.buildSignature()}`};</code>
            </div>
        );
    }
}
