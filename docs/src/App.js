import React, { Component } from "react";
import logo from "./logo.svg";
import _ from "lodash";
import Markdown from "react-markdown";

import "./App.css";

import docs from "../doc.json";

class SignatureList extends Component {
  buildType(type) {
    const typeArgs = this.buildTypeArguments(type.typeArguments);
    if (type.constraint) {
      return `${type.name}${typeArgs} extends ${type.constraint.name}`;
    } else {
      return `${type.name}${typeArgs}`;
    }
  }

  buildTypeArguments(typeArguments) {
    console.log("buildTypeArguments", typeArguments);
    if (typeArguments) {
      const typeArgs = typeArguments.map(t => {
        return this.buildType(t);
      });
      return `<${typeArgs.join(", ")}>`;
    }
    return "";
  }

  buildParamList(parameters) {
    return parameters
      ? parameters.map((param, i) => {
          const paramType = param.type;
          const paramName = param.name;
          const paramTypeName = paramType.name;
          const isArray = paramType.isArray;
          const typeArgs = this.buildTypeArguments(paramType.typeArguments);
          return `${paramName}: ${paramTypeName}${typeArgs}${isArray ? "[]" : ""}`;
        })
      : [];
  }

  buildReturnType(signature) {
    console.log("buildReturnType", signature);
    const typeName = this.buildType(signature.type);
    const typeArgs = this.buildTypeArguments(signature.typeParameter);
    const isArray = signature.type.isArray;
    console.log(
      "buildReturnType ->",
      signature.name,
      signature,
      typeName,
      typeArgs,
      isArray
    );
    return `${typeName}${typeArgs}${isArray ? "[]" : ""}`;
  }

  render() {
    const style = {
      borderLeftColor: "#9CDAE9",
      background: "#F8F9FA",
      borderLeft: "solid 3px #ECEAE9",
      boxSizing: "border-box",
      display: "block",
      fontSize: ".875em",
      margin: ".5rem 0",
      overflowY: "scroll",
      padding: ".5rem 8px .5rem 12px",
      whiteSpace: "pre"
    };
    const { signatures } = this.props;
    const methodSignatures = signatures.map(signature => {
      const parameters = signature.parameters;
      const paramList = this.buildParamList(parameters);
      const returnType = this.buildReturnType(signature);
      const output = `> ${signature.name}(${paramList.join(", ")}): ${returnType}`;
      return (
        <div>
          <span>{output}</span>
        </div>
      );
    });
    return (
      <code style={style}>
        {methodSignatures}
      </code>
    );
  }
}

class Method extends Component {
  renderShortComment(signature) {
    const textStyle = {
      color: "#626466",
      fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
      fontSize: 14,
      lineHeight: 1.625
    };
    if (signature.comment) {
      const { shortText } = signature.comment;
      return (
        <div style={textStyle}>
          <Markdown source={shortText} />
        </div>
      );
    } else {
      return <div />;
    }
  }

  renderMethodSignitures() {
    return <SignatureList signatures={this.props.entity.signatures} />;
  }

  renderDiscussion(signature) {
    const style = {
      color: "#555",
      fontSize: 10,
      letterSpacing: ".25ch",
      lineHeight: "16px",
      margin: "1rem 0 .125rem",
      textTransform: "uppercase"
    };
    const textStyle = {
      color: "#626466",
      fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
      fontSize: 14,
      lineHeight: 1.625
    };

    if (signature.comment && signature.comment.text) {
      const { text } = signature.comment;
      return (
        <div>
          <h4 style={style}>DISCUSSION</h4>
          <div style={textStyle}>
            <Markdown source={text} />
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  }
  render() {
    const linkStyle = {
      color: "#4183C4",
      textDecoration: "none"
    };
    const { id, children, name, type } = this.props.entity;
    const first = this.props.entity.signatures[0];
    return (
      <div style={{ marginBottom: 50 }}>
        <a style={linkStyle} href={`#${name}`}>
          {`${name}()`}
        </a>
        <div>
          {this.renderShortComment(first)}
          {this.renderMethodSignitures()}
          {this.renderDiscussion(first)}
        </div>
      </div>
    );
  }
}

class Property extends Component {
  render() {
    const style = {
      borderLeftColor: "#9CDAE9",
      background: "#F8F9FA",
      borderLeft: "solid 3px #ECEAE9",
      boxSizing: "border-box",
      display: "block",
      fontSize: ".875em",
      margin: ".5rem 0",
      overflowY: "scroll",
      padding: ".5rem 8px .5rem 12px",
      whiteSpace: "pre"
    };
    const { id, children, name, type } = this.props.entity;
    console.log("Property type", this.props.entity);
    const hasTypeArguments = type.typeArguments;
    if (hasTypeArguments) {
      const typeArguments = type.typeArguments.map(t => {
        if (t.constraint) {
          return `${t.name} extends ${t.constraint.name}`;
        } else {
          return `${t.name}`;
        }
      });
      return (
        <code style={style}>
          {`${name} ${type.name} <${typeArguments.join(", ")}>`}
        </code>
      );
    } else {
      return (
        <code style={style}>
          {`${name} ${type.name} <>`}
        </code>
      );
    }
  }
}

class APIClass extends Component {
  static defaultProps = {
    showExtends: false
  };
  renderClassSigniture() {
    const style = {
      borderLeftColor: "#9CDAE9",
      background: "#F8F9FA",
      borderLeft: "solid 3px #ECEAE9",
      boxSizing: "border-box",
      display: "block",
      fontSize: ".875em",
      margin: ".5rem 0",
      overflowY: "scroll",
      padding: ".5rem 8px .5rem 12px",
      whiteSpace: "pre"
    };
    const { name, typeParameter } = this.props.class;
    if (typeParameter && typeParameter.length) {
      const typeParameters = typeParameter.map(t => {
        if (this.props.showExtends) {
          const type = t.type.name;
          return `${t.name} extends ${type}`;
        } else {
          return `${t.name}`;
        }
      });
      return (
        <code style={style}>
          {`class ${name} <${typeParameters.join(", ")}>`}
        </code>
      );
    } else {
      return <code style={style}>{`class ${name}`}</code>;
    }
  }
  renderShortComment() {
    const textStyle = {
      color: "#333",
      fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
      fontSize: 16,
      lineHeight: 1.625
    };
    const { shortText } = this.props.class.comment;
    return (
      <div style={textStyle}>
        <Markdown source={shortText} />
      </div>
    );
  }
  renderDiscussion() {
    const style = {
      color: "#555",
      fontSize: 10,
      letterSpacing: ".25ch",
      lineHeight: "16px",
      margin: "1rem 0 .125rem",
      textTransform: "uppercase"
    };
    const textStyle = {
      color: "#626466",
      fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
      fontSize: 16,
      lineHeight: 1.625
    };
    const { text } = this.props.class.comment;
    return (
      <div>
        <h4 style={style}>DISCUSSION</h4>
        <div style={textStyle}>
          <Markdown source={text} />
        </div>
      </div>
    );
  }
  renderGroups() {
    const style = {
      color: "#9A9C9E",
      fontSize: "1.5em",
      fontWeight: 300,
      margin: "3rem 0 2rem"
    };
    const entityMap = {};
    this.props.class.children.forEach(child => {
      entityMap[child.id] = child;
    });
    const groups = this.props.class.groups.map((group, i) => {
      const groupEntities = group.children.map((entity, j) => {
        return <div key={j}>{this.renderEntity(entityMap[entity])}</div>;
      });
      return (
        <div key={i}>
          <h3 style={style}>{group.title}</h3>
          {groupEntities}
        </div>
      );
    });
    return (
      <div>
        {groups}
      </div>
    );
  }
  renderEntity(entity) {
    switch (entity.kindString) {
      case "Function":
        return <Method entity={entity} />;
      case "Constructor":
        return <Method entity={entity} />;
      case "Property":
        return <Property entity={entity} />;
        break;
      case "Method":
        return <Method entity={entity} />;
        break;
    }
    return <div>{entity.name}</div>;
  }
  render() {
    const style = {
      color: "#555",
      fontSize: "1.5em",
      margin: "1rem 0",
      fontWeight: "bold"
    };
    const { id, name, children } = this.props.class;
    return (
      <div>
        <h2 style={style}>{name}</h2>
        {this.renderShortComment()}
        {this.renderClassSigniture()}
        {this.renderDiscussion()}
        {this.renderGroups()}
      </div>
    );
  }
}

class Module extends Component {
  renderChild(child, i) {
    console.log(child, i);
    if (child.kindString === "Class") {
      return <APIClass key={i} class={child} />;
    } else {
      return (
        <div key={i}>
          <h1>Unhandled type {child.kindString}</h1>
        </div>
      );
    }
  }
  render() {
    const { id, name, children } = this.props.module;
    console.log(id, name, children);
    return (
      <div>
        <div>
          {children
            ? _.map(children, (child, i) => this.renderChild(child, i))
            : <div />}
        </div>
      </div>
    );
  }
}

class Doc extends Component {
  render() {
    const { id, name, children } = this.props.doc;
    return (
      <div>
        <h1>Pond.js</h1>
        <hr />
        {children.map((child, i) => <Module key={i} module={child} />)}
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <Doc doc={docs} />
      </div>
    );
  }
}

export default App;
