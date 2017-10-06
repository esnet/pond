import "./App.css";
import _ from "lodash";
import Home, { Root, Side, Main } from "./Home";
import logo from "./logo.svg";
import docs from "./doc.json";
import Sidebar from 'react-sidebar';
import React, { Component } from "react";
import Markdown from "react-markdown";
import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';
import { Navbar, Jumbotron, Button, Grid, Row, Col } from 'react-bootstrap';

const discussionStyle = {
  color: "#555",
  fontSize: 18,
  letterSpacing: ".25ch",
  lineHeight: "16px",
  margin: "1rem 0 .125rem",
  textTransform: "uppercase"
};

const groupStyle = {
  color: "#9A9C9E",
  // fontSize: 12,
  fontSize: "1.5em",
  fontWeight: 300,
  margin: "2rem 0 2rem"
};

const headingStyle = {
  color: "#555",
  fontSize: "2.5em",
  margin: "1rem 0",
  fontWeight: "normal"
};

const textStyle = {
  color: "#626466",
  fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
  fontSize: 18,
  lineHeight: 1.625,
  padding: "3px 0px 0px 0px"
};

const codeStyle = {
  color: "#333",
  fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
  fontSize: 18,
  lineHeight: 1.625
}

const style = {
  borderLeftColor: "#9CDAE9",
  background: "#F8F9FA",
  borderLeft: "solid 3px #ECEAE9",
  boxSizing: "border-box",
  display: "block",
  fontSize: 16,
  // fontSize: ".825em",
  margin: ".5rem 0",
  overflowY: "scroll",
  padding: ".5rem 8px .5rem 12px",
  whiteSpace: "pre"
};

const sidebarStyle = {
  color: "#626466",
  fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
  fontSize: 18,
  lineHeight: 2,
  marginLeft: '1vw'
};

const activeLinkStyle = {
  color: "#626466",
  fontWeight: 'bold'
};

const linkStyle = {
  color: "#4183C4",
  textDecoration: "none"
};

const sidebarHeading = {
  paddingLeft: 5,
  paddingTop: 5,
  textTransform: "uppercase",
  fontWeight: 800,
  fontSize: 24
};

class ScrollToTop extends Component {
  componentDidMount(prevProps) {
    window.scrollTo(0, 0)
  }
  render() {
    return null
  }
}

const availableLinks = [
  "Align",
  "Base",
  "Collapse",
  "Collection",
  "Event",
  "Fill",
  "GroupedCollection",
  "Index",
  "Key",
  "Period",
  "Processor",
  "Rate",
  "SortedCollection",
  "Time",
  "TimeRange",
  "TimeSeries",
  "WindowedCollection",
  "AlignmentOptions"
]

function codeRenderer(props) {
  return ( _.includes(availableLinks, props.literal) ?
    <a href={props.literal}><code>{props.literal}</code></a>
    : <code>{props.literal}</code>
  );
}

class APIClass extends Component {
  static defaultProps = {
    showExtends: false
  };
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
      return ( typeArgument ? 
        <code style={style}>
          {`class ${name} <${typeParameters.join(", ")}> extends ${extendedName} <${typeArgument.join(", ")}>`}
        </code> :
        <code style={style}>
          {`class ${name} <${typeParameters.join(", ")}>`}
        </code>
      );
    } else {
      return <code style={style}>{`class ${name}`}</code>;
    }
  }
  renderShortComment() {
    const { comment } = this.props.class;
    return ( comment ?
      <div style={textStyle}>
        <Markdown source={comment.shortText} renderers={{Code: codeRenderer}} />
      </div> :
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
            renderers={{Code: codeRenderer}} />
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
        return (
          <div key={i}>
            <h3 style={groupStyle}>{group.title}</h3>
            {groupEntities}
          </div>
        );
      });
      return (
        <div style={textStyle}>
          {groups}
        </div>
      );
    } else {
      return (
        <div />
      );
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
    }
    return <div>{entity.name}</div>;
  }
  render() {
    const { id, name, children } = this.props.class;
    return (
      <div style={{ marginBottom: 20 }}>
        <h2 style={headingStyle}>
          <a id={name}>{name}</a>
        </h2>
        {this.renderShortComment()}
        {this.renderClassSignature()}
        {this.renderDiscussion()}
        {this.renderGroups()}
      </div>
    );
  }
}

class APIEnum extends Component {
  renderShortComment() {
    const { comment } = this.props.enum;
    return ( comment ?
      <div style={textStyle}>
        <Markdown source={comment.shortText} renderers={{Code: codeRenderer}} />
      </div> :
      <div style={textStyle} />
    );
  }
  renderParams() {
    const { name, flags, children } = this.props.enum;
    const params = children.map(child => {
      const { name, defaultValue } = child;
      if (defaultValue) {
        return `${name} = ${defaultValue}`
      } else {
        return `${name}`
      }
    });
    return `${params.join(", \n")}`;
  }
  render() {
    const { name, flags, children } = this.props.enum;
    if (children) {
      return (
        <div style={{ marginBottom: 20 }}>
          <h2 style={headingStyle}>
            <a id={name}>{name}</a>
          </h2>
          {this.renderShortComment()}
          <code style={style}>
            {this.renderParams()}
          </code>
        </div>
      );
    }
  }
}

class APIFunction extends Component {
  buildType(type) {
    if(type) {
      const typeArgs = this.buildTypeArguments(type.typeArguments);
      return `${type.name}${typeArgs}`;
    }
  }
  buildTypeArguments(typeArguments, unionTypes = null) {
    if (typeArguments) {
      const typeArgs = typeArguments.map(t => {
        return this.buildType(t);
      });
      return `<${typeArgs.join(", ")}>`;
    }
    else if (unionTypes) {
      const typeArgs = unionTypes.map(t => {
        if (t.typeArguments) {
            const typeArgs = this.buildTypeArguments(t.typeArguments);
            return `${t.name}${typeArgs}`;  
        } else {
          if (t.isArray == true) {
            return `${t.name}[]`;
          } else {
            return `${t.name}`;
          }
        }
      });
      return `${typeArgs.join(" | ")}`;
    }
    return "";
  }
  buildParamList(parameters) {
    return parameters
      ? parameters.map((param, i) => {
          const paramType = param.type;
          const paramName = param.name;
          let paramTypeName = paramType.name;
          const isArray = paramType.isArray;
          const isOptional = param.flags.isOptional;
          const typeArgs = this.buildTypeArguments(paramType.typeArguments, paramType.types);
          const defaultValue = param.defaultValue;
          if (paramTypeName === "(Anonymous function)") {
            paramTypeName = defaultValue;
          }
          return `${paramName}${isOptional ? "?" : ""}: ${paramTypeName ? paramTypeName : ""}${typeArgs}${isArray ? "[]" : ""}`;
        })
      : [];
  }
  buildReturnType(signature) {
    if (signature.type) {
      const typeName = this.buildType(signature.type);
      const isArray = signature.type.isArray;
      return `${typeName}${isArray ? "[]" : ""}`;
    }
    else {
      return "";
    }
  }
  buildSignatures(signatures) {
    const methodSignatures = signatures.map(signature => {
      const parameters = signature.parameters;
      const paramList = this.buildParamList(parameters);
      const returnType = this.buildReturnType(signature);
      const output = `${signature.name}(${paramList.join(", ")}): ${returnType}`;
      return (
        <div>
          <span>{output}</span>
        </div>
      );
    });
    return methodSignatures;
  }
  renderShortComment(signatures) {
    const { comment } = signatures[0];
    return ( comment ?
      <div style={textStyle}>
        <Markdown source={comment.shortText} renderers={{Code: codeRenderer}} />
      </div> :
      <div />
    );
  }
  renderDiscussion(signatures) {
    const { comment } = signatures[0];
    if (comment && comment.text) {
      const { text } = comment;
      return (
        <div>
          <h4 style={textStyle}>DISCUSSION</h4>
          <Markdown source={text} renderers={{Code: codeRenderer}} />
        </div>
      );
    } else {
      return <div />;
    }
  }
  render() {
    const { id, name, kindString, signatures } = this.props.function;
    const methodSignatures = this.buildSignatures(signatures);
    return (
      <div style={{marginBottom:20}}>
        <h2 style={headingStyle}>
          <a id={name}>{name}()</a>
        </h2>
        <div style={textStyle}>
          {this.renderShortComment(signatures)}
        </div>
        <code style={style}>
          {methodSignatures}
        </code>
        <div style={textStyle}>
          {this.renderDiscussion(signatures)}
        </div>
      </div>
    );
  }
}

class APIInterface extends Component {
  buildParamList(parameters) {
    return parameters
      ? parameters.map((param, i) => {
          const paramType = param.type;
          const paramName = param.name;
          const paramTypeName = paramType.name;
          const isArray = paramType.isArray;
          const isOptional = param.flags.isOptional;
          const typeArgs = this.buildTypeArguments(paramType.typeArguments);
          return `${paramName}${isOptional ? "?" : ""}: ${paramTypeName ? paramTypeName : ""}${typeArgs}${isArray ? "[]" : ""}`;
        })
      : [];
  }
  buildReturnType(signature) {
    if (signature.type) {
      const typeName = this.buildType(signature.type);
      const isArray = signature.type.isArray;
      return `${typeName}${isArray ? "[]" : ""}`;
    }
    else {
      return "";
    }
  }
  buildDeclarations(type, name) {
    const { indexSignature, signatures } = type.declaration;
    if (indexSignature) {
      const mapIndex = indexSignature.map(index => {
        const { parameters, type } = index;
        const paramArray = parameters.map(param => {
          const paramName = param.name;
          const paramTypeName = param.type.name;
          return `${paramName}: ${paramTypeName}`
        });
        return `${name}: { [${paramArray.join(" ")}]: ${type.name} };\n`
      });
      return `${mapIndex}`
    } else {
      const methodSignatures = signatures.map(signature => {
        const parameters = signature.parameters;
        const paramList = this.buildParamList(parameters);
        const returnType = this.buildReturnType(signature);
        const output = `(${paramList.join(", ")}) => ${returnType};\n`;
        return output;
      });
      return methodSignatures;
    }
  }
  buildIndex(indexSignature) {
    const index = indexSignature.map(t => {
      const interfaceParameters = t.parameters.map(param => {
        const name = param.name;
        const type = param.type;
        const typeName = type.name;
        return `${name}: ${typeName}`
      });
      const type = t.type;
      const name = type.name;
      const typeArgs = this.buildTypeArguments(type.typeArguments);
      return `[${interfaceParameters.join(", ")}]: ${type.name}${typeArgs}${type.isArray === true ? "[]" : ""};`
    });
    return index;
  }
  buildType(type) {
    if(type) {
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
  buildUnion(type, name) {
    const typeList = type.types;
    const types = typeList.map(t => {
      return `${t.name}${t.isArray == true ? "[]" : ""}`
    });
    return `${name}: ${types.join(" | ")};\n`
  }
  buildChildren(children) {
    const mapChildren = children.map(child => {
      const { name, type, flags } = child;
      if (type.name) {
        return `${name}${flags.isOptional === true ? "?" : ""}: ${type.name}${type.isArray ? "[]" : ""};\n`
      } 
      else if (type.declaration) {
        return this.buildDeclarations(type, name);
      }
      else if (type.type === "union") {
        return this.buildUnion(type, name);
      }
      else {
        return "";
      }
    });
    return mapChildren
  }
  render() {
    const { id, name, kindString, children, comment, indexSignature, typeParameter } = this.props.interface;
    let shortText, mapChildren, longText;
    if (children) {
      shortText = comment ? comment.shortText : "";
      mapChildren = this.buildChildren(children);
    } 
    else {
      if (comment) {
        const { tags } = comment;
        shortText = comment.shortText ? comment.shortText : "";
        longText = tags ? tags[0].text : "";
      }
      if (indexSignature) {
        mapChildren = this.buildIndex(indexSignature);
      }
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <h2 style={headingStyle}>
          <a id={name}>{name}</a>
        </h2>
        <div style={textStyle}>
          <Markdown source={shortText} renderers={{Code: codeRenderer}} />
        </div>
        <code style={style}>
          {/*{JSON.stringify(mapChildren, null, 2) }*/}
          {mapChildren}
        </code>
      </div>
    );
  }
}

class APIObject extends Component {
  buildType(type) {
    if(type) {
      const typeArgs = this.buildTypeArguments(type.children);
      const { name, defaultValue } = type;
      if (typeArgs) {
        return `${name}: {${typeArgs}}`;
      } 
      else {
        return `${name}${defaultValue ? `: ${defaultValue}` : ""}`;
      }
    }
  }
  buildTypeArguments(typeArguments) {
    if (typeArguments) {
      const typeArgs = typeArguments.map(t => {
        return this.buildType(t);
      });
      return `${typeArgs.join(", \n")}`;
    }
    return;
  }
  render() {
    const { name, flags, children } = this.props.object;
    const params = this.buildTypeArguments(children);
    return (
      <div style={{ marginBottom: 20 }}>
        <h2 style={headingStyle}>
          <a id={name}>{name}</a>
        </h2>
        <code style={style}>{params}</code>
      </div>
    );
  }
}

class APIType extends Component {
  buildParamList(parameters) {
    return parameters
      ? parameters.map((param, i) => {
          const paramType = param.type;
          const paramName = param.name;
          const paramTypeName = paramType.name;
          const isArray = paramType.isArray;
          const isOptional = param.flags.isOptional;
          const typeArgs = this.buildTypeArguments(paramType.typeArguments);
          return `${paramName}${isOptional ? "?" : ""}: ${paramTypeName ? paramTypeName : ""}${typeArgs}${isArray ? "[]" : ""}`;
        })
      : [];
  }
  buildReturnType(signature) {
    if (signature.type) {
      const typeName = this.buildType(signature.type);
      const isArray = signature.type.isArray;
      return `${typeName}${isArray ? "[]" : ""}`;
    }
    else {
      return "";
    }
  }
  buildType(type) {
    if(type) {
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
      if(type.typeArguments) {
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
      if(type.typeArguments) {
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
    switch(type.type) {
      case "union":
        return this.buildUnion(type);
      case "reflection":
        return this.buildDeclarations(type);
      case "tuple":
        return this.buildTuple(type);
      case "reference":
        return this.buildReference(type);
    }
  }
  renderComment() {
    const { comment } = this.props.type;
    return ( comment ?
      <div style={textStyle}>
        <Markdown source={comment.shortText} renderers={{Code: codeRenderer}} />
      </div> :
      <div style={textStyle} />
    );
  }
  render() {
    const { name, type } = this.props.type;
    return (
      <div style={{ marginBottom: 20 }}>
        <h2 style={headingStyle}>
          <a id={name}>{name}</a>
        </h2>
        {this.renderComment()}
        <code style={style}>
          {`type ${name} =  ${this.buildSignature()}`};
        </code>
      </div>
    )
  }
}

class SignatureList extends Component {
  buildType(type) {
    if(type) {
      const typeArgs = this.buildTypeArguments(type.typeArguments, type.types);
      return `${type.name ? type.name : ""}${typeArgs}`;
    }
  }
  buildTypeArguments(typeArguments, unionTypes = null, declaration = null) {
    if (typeArguments) {
      const typeArgs = typeArguments.map(t => {
        return this.buildType(t);
      });
      return `<${typeArgs.join(", ")}>`;
    }
    else if (unionTypes) {
      const types = unionTypes.map(t => {
        const typeArgs = this.buildTypeArguments(t.typeArguments);
        const isArray = (t.isArray ? true : false);
        return `${t.name}${typeArgs}${isArray ? "[]" : ""}`;  
      });
      return `${types.join(" | ")}`;
    }
    else if (declaration) {
      const { signatures } = declaration;
      const methodSignatures = signatures.map(signature => {
        const parameters = signature.parameters;
        const paramList = this.buildParamList(parameters);
        const returnType = this.buildReturnType(signature);
        const output = `(${paramList.join(", ")}) => ${returnType}`;
        return output;
      });
      return methodSignatures;
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
          const defaultValue = (param.defaultValue ? true : false);
          const isUnion = (paramType.type === "union");
          const isOptional = (param.flags.isOptional ? true : false);
          const typeArgs = this.buildTypeArguments(paramType.typeArguments, paramType.types, paramType.declaration);

          /*return ( _.includes(availableLinks, paramTypeName) && {paramTypeName} ?
            <span>
              {paramName}{defaultValue || isOptional ? "?" : ""}{":"}
              <a href={paramTypeName}>{paramTypeName}</a>
              {typeArgs}{isArray ? "[]" : ""}
            </span>
            : 
            <span>
              {`${paramName}${defaultValue || isOptional ? "?" : ""}: ${paramTypeName ? paramTypeName : ""}${typeArgs}${isArray ? "[]" : ""}`}
            </span>
          );*/
          
          return `${paramName}${defaultValue || isUnion ? "?" : ""}: ${paramTypeName ? paramTypeName : ""}${typeArgs}${isArray ? "[]" : ""}`;
        })
      : [];
  }
  buildRType(signature) {
    const typeName = this.buildType(signature.type);
    const typeArgs = this.buildTypeArguments(signature.typeParameter);
    const isArray = signature.type.isArray;
    return `${typeName}${typeArgs}${isArray ? "[]" : ""}`;
  }
  buildReturnType(signature) {
    if (signature.type) {
      switch (signature.type.type) {
        case "instrinct":
          return this.buildRType(signature);
        case "reference":
          return this.buildRType(signature);
        case "reflection":
          const { indexSignature, signatures } = signature.type.declaration;
          if (indexSignature) {
            const mapIndex = indexSignature.map(index => {
              const { parameters, type } = index;
              const paramArray = parameters.map(param => {
                const paramName = param.name;
                const paramTypeName = param.type.name;
                return `${paramName}: ${paramTypeName}`
              });
              const isArray = type.isArray ? true : false;
              return `{ [${paramArray.join(" ")}]: ${type.name}${isArray ? "[]" : ""} };\n`
            });
            return `${mapIndex}`
          } else {
            const methodSignatures = signatures.map(signature => {
              const parameters = signature.parameters;
              const paramList = this.buildParamList(parameters);
              const returnType = this.buildReturnType(signature);
              const output = `(${paramList.join(", ")}) => ${returnType}`;
              return output;
            });
          return methodSignatures;
          } 
        default:
          return this.buildRType(signature);
      }
    }
    else {
      return "";
    }
  }
  render() {
    const { signatures } = this.props;
    const methodSignatures = signatures.map(signature => {
      const parameters = signature.parameters;
      const paramList = this.buildParamList(parameters);
      const returnType = this.buildReturnType(signature);

      const output = `${signature.name}(${paramList.join(", ")}): ${returnType}`;
      return (
        <div>
          <span>{output}</span>
        </div>
      );

      /*return (
        <div>
          <span>{signature.name}</span>
          {"("}{paramList.join(", ")}{") : "}
          <span>{returnType}</span>
        </div>
      );*/
    });
    return (
      <code style={style}>
        {methodSignatures}
      </code>
    );
  }
}

class Method extends Component {
  renderComment(signature) {
    if (signature.comment) {
      const { shortText, returns, tags, text } = signature.comment;
      let additionalText;
      if (tags) {
        additionalText = tags.map(t => {
          return `${t.text}`;
        });
      }
      return (
        <div style={textStyle}>
          <Markdown source={shortText? shortText : ""} renderers={{Code: codeRenderer}} />
          <Markdown source={additionalText? additionalText.join("\n") : ""} renderers={{Code: codeRenderer}} />
          <Markdown source={text? text : ""} renderers={{Code: codeRenderer}} />
        </div>
      );
    } else {
      return <div />;
    }
  }
  renderMethodSignatures() {
    return <SignatureList signatures={this.props.entity.signatures} />;
  }
  render() {
    const { id, children, name, type, signatures } = this.props.entity;
    const first = signatures[0];
    return (
      <div style={{ marginBottom: 20 }}>
        <a style={linkStyle} href={`#${name}`}>{`${name}()`}</a>
        {this.renderComment(first)}
        {this.renderMethodSignatures()}
      </div>
    );
  }
}

class Property extends Component {
  buildType(type) {
    if(type) {
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
  render() {
    const { id, children, name, type } = this.props.entity;
    const { typeArguments, types, isArray } = type;
    if (typeArguments) {
      const returnType = this.buildTypeArguments(typeArguments);
      return (
        <code style={style}>
          {`${name}: ${type.name} ${returnType}`}
        </code>
      );
    } else if (types) {
      const allTypes = types.map(t => {
        return `${t.name}`;
      });
      return (
        <code style={style}>
          {`${name}: ${allTypes.join(" | ")}`}
        </code>
      );
    } else {
      return (
        <code style={style}>
          {`${name}: ${type.name}${isArray ? "[]" : ""}`}
        </code>
      );
    }
  }
}

class Module extends Component {
  renderChild(child, i) {
    switch(child.kindString) {
      case "Class":
        return <Route path={`/${child.name}`} render={()=> <APIClass key={i} class={child} />}/>;
      case "Function":
        return <Route path={`/${child.name}`} render={()=> <APIFunction key={i} function={child} />}/>;
      case "Interface":
        return <Route path={`/${child.name}`} render={()=> <APIInterface key={i} interface={child} />}/>;
      case "Enumeration":
        return <Route path={`/${child.name}`} render={()=> <APIEnum key={i} enum={child} />}/>;
      case "Object literal":
        return <Route path={`/${child.name}`} render={()=> <APIObject key={i} object={child} />}/>;
      case "Type alias":
        return <Route path={`/${child.name}`} render={()=> <APIType key={i} type={child} />}/>;
      default:
        return (
          <div key={i}>
            <h1>{`Unhandled type ${child.kindString}`}</h1>
          </div>
        );
    }
  }
  render() {
    const { id, name, children } = this.props.module;
    return (
      <div>
        {children
          ? _.map(children, (child, i) => this.renderChild(child, i))
          : <div />}
      </div>
    );
  }
}

class SideBar extends Component {
  renderChild(child,i) {
    if (child.flags.isPrivate === true) {
      return <div />;
    }
    if (child.name.includes("Factory")) {
      return <div />;
    }
    if (child.kindString === "Class") {
      return (
        <div style={sidebarStyle}>
          <ScrollToTop/>
          <NavLink
            exact
            to={`/${child.name}`} 
            activeStyle={activeLinkStyle}
          >{child.name}</NavLink>
        </div>
      );
    } else {
      return (
        <ul style={{ listStyleType: "None" }}>
          <li style={sidebarStyle}>
            <ScrollToTop/>
            <NavLink
              exact
              to={`/${child.name}`} 
              activeStyle={activeLinkStyle}
            >{child.kindString === "Function" ? `${child.name}()` : child.name}</NavLink>
          </li>
        </ul>
      );
    }
  }
  render() { 
    const { id, name, children } = this.props.sidebar;
    return (
      <div>
        {children ? 
          _.map(children, (child, i) =>
            <div>
              {this.renderChild(child, i)}
            </div>
          ) : <div />
        }
      </div>
    )
  }
}

class Doc extends Component {
  render() {
    const { id, name, children } = this.props.doc;
    return (
      <Router>
        <Root>
          <Navbar inverse fixedTop>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/" style={{ color: "#FFF", fontSize: 25 }}>Pond - Immutable Timeseries Abstractions</a>
              </Navbar.Brand>
            </Navbar.Header>
          </Navbar>
          <Side>
            <div style={sidebarHeading}>Classes</div>
            {children.map((child,i) =>
                <div id={child.name}>
                  <SideBar key={i} sidebar={child} />
                </div>
            )}

            {/* <div style={sidebarHeading}>Classes</div>
            {children.map((child,i) => <SideBar key={i} sidebar={child} type="Class" />)}
            <div style={sidebarHeading}>Functions</div>
            {children.map((child,i) => <SideBar key={i} sidebar={child} type="Function" />)}
            <div style={sidebarHeading}>Interfaces</div>
            {children.map((child,i) => <SideBar key={i} sidebar={child} type="Interface" />)}
            <div style={sidebarHeading}>Enums</div>
            {children.map((child,i) => <SideBar key={i} sidebar={child} type="Enumeration" />)}
            <div style={sidebarHeading}>Objects</div>
            {children.map((child,i) => <SideBar key={i} sidebar={child} type="Object literal" />)}
            <div style={sidebarHeading}>Types</div>
            {children.map((child,i) => <SideBar key={i} sidebar={child} type="Type alias" />)} */}

          </Side>
          <Main>
            <Route exact path="/" component={Home} />
            {children.map((child,i) => <Module key={i} module={child} />)}
          </Main>
        </Root>
      </Router>
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
