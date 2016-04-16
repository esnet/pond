"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isPipeline = exports.Pipeline = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _in2 = require("./in");

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var _offset = require("./offset");

var _offset2 = _interopRequireDefault(_offset);

var _aggregator = require("./aggregator");

var _aggregator2 = _interopRequireDefault(_aggregator);

var _converter = require("./converter");

var _converter2 = _interopRequireDefault(_converter);

var _event = require("./event");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A pipeline manages a processing chain, for either batch or stream processing
 * of collection data.
 */

/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

var Pipeline = function () {
    function Pipeline(arg) {
        (0, _classCallCheck3.default)(this, Pipeline);

        if (arg instanceof Pipeline) {
            var other = arg;
            this._d = other._d;
        } else if (arg instanceof _immutable2.default.Map) {
            this._d = arg;
        } else {
            this._d = new _immutable2.default.Map({
                type: null,
                in: null,
                first: null,
                last: null,
                groupBy: function groupBy() {
                    return "";
                },
                windowType: "global",
                windowDuration: null,
                emitOn: "eachEvent"
            });
        }
    }

    //
    // Accessors to the current Pipeline state
    //

    (0, _createClass3.default)(Pipeline, [{
        key: "in",
        value: function _in() {
            return this._d.get("in");
        }
    }, {
        key: "mode",
        value: function mode() {
            return this._d.get("mode");
        }
    }, {
        key: "first",
        value: function first() {
            return this._d.get("first");
        }
    }, {
        key: "last",
        value: function last() {
            return this._d.get("last");
        }
    }, {
        key: "getWindowType",
        value: function getWindowType() {
            return this._d.get("windowType");
        }
    }, {
        key: "getWindowDuration",
        value: function getWindowDuration() {
            return this._d.get("windowDuration");
        }
    }, {
        key: "getGroupBy",
        value: function getGroupBy() {
            return this._d.get("groupBy");
        }
    }, {
        key: "getEmitOn",
        value: function getEmitOn() {
            return this._d.get("emitOn");
        }

        //
        // Pipeline mutations
        //

        /**
         * Setting the In for the Pipeline returns a new Pipeline
         */

    }, {
        key: "_setIn",
        value: function _setIn(input) {
            var mode = void 0;
            if (input instanceof _in2.BoundedIn) {
                mode = "batch";
            } else if (input instanceof _in2.UnboundedIn) {
                mode = "stream";
            } else {
                throw new Error("Unknown input type", input);
            }

            var d = this._d.withMutations(function (map) {
                map.set("in", input).set("mode", mode);
            });

            return new Pipeline(d);
        }

        /**
         * Set the first processing node pointed to, returning
         * a new Pipeline. The original pipeline will still point
         * to its orginal processing node
         */

    }, {
        key: "_setFirst",
        value: function _setFirst(n) {
            var d = this._d.set("first", n);
            return new Pipeline(d);
        }

        /**
         * Set the last processing node pointed to, returning
         * a new Pipeline. The original pipeline will still point
         * to its orginal processing node
         */

    }, {
        key: "_setLast",
        value: function _setLast(n) {
            var d = this._d.set("last", n);
            return new Pipeline(d);
        }
    }, {
        key: "_append",
        value: function _append(processor) {
            var first = this.first();
            var last = this.last();

            if (!first) first = processor;
            if (last) last.addObserver(processor);
            last = processor;

            var d = this._d.withMutations(function (map) {
                map.set("first", first).set("last", last);
            });
            return new Pipeline(d);
        }

        //
        // Pipeline state chained methods
        //

    }, {
        key: "setState",
        value: function setState(key, value) {
            var d = this._d.withMutations(function (map) {
                map.set(key, value);
            });
            return new Pipeline(d);
        }

        /**
         * Set the window, returning a new Pipeline. The argument here
         * is an object with {type, duration}.
         * type may be:
         *  * "Fixed"
         * duration is of the form:
         *  * "30s", "5m" or "1d" etc
         */

    }, {
        key: "windowBy",
        value: function windowBy(w) {
            var type = void 0,
                duration = void 0;
            if (_underscore2.default.isString(w)) {
                // assume fixed window with size w
                type = "fixed";
                duration = w;
            } else if (_underscore2.default.isObject(w)) {
                type = w.type;
                duration = w.duration;
            }

            var d = this._d.withMutations(function (map) {
                map.set("windowType", type).set("windowDuration", duration);
            });

            return new Pipeline(d);
        }

        /**
         * Sets a new groupBy expression, returning a new Pipeline.
         * You can groupby using a function (event) => return key,
         * a fieldSpec or a array of fieldSpecs.
         */

    }, {
        key: "groupBy",
        value: function groupBy(k) {
            var grp = void 0;
            var groupBy = k || "value";
            if (_underscore2.default.isFunction(groupBy)) {
                // group using a user defined function
                // (event) => key
                grp = groupBy;
            } else if (_underscore2.default.isArray(groupBy)) {
                // group by several column values
                grp = function grp(e) {
                    return _underscore2.default.map(groupBy, function (c) {
                        return "" + e.get(c);
                    }).join("::");
                };
            } else if (_underscore2.default.isString(groupBy)) {
                // group by a column value
                grp = function grp(e) {
                    return "" + e.get(groupBy);
                };
            } else {
                throw Error("Unable to interpret groupBy argument", k);
            }

            return this.setState("groupBy", grp);
        }

        /**
         * Sets the condition under which an aggregated
         * collection will emit a new event.
         *
         * Either:
         *  * "eachEvent" - when a new event comes in, all currently
         *                  maintained collections will emit their result
         *  * "discard"   - when a collection is to be discarded,
         *                  first it will emit. But only then.
         */

    }, {
        key: "emitOn",
        value: function emitOn(trigger) {
            var d = this._d.set("emitOn", trigger);
            return new Pipeline(d);
        }

        //
        // I/O
        //

        /**
         * The "In" to get events from. The In needs to be able to
         * iterate its events using for..of loop for bounded Ins, or
         * be able to emit for unbounded Ins. The actual batch, or stream
         * connection occurs when an output is defined with to().
         *
         * from() returns a new Pipeline.
         */

    }, {
        key: "from",
        value: function from(src) {
            if (src instanceof Pipeline) {
                var pipelineIn = src.in();
                return this._setIn(pipelineIn);
            } else {
                return this._setIn(src);
            }
        }

        /**
         * Sets up the destination sink for the pipeline. The output should
         * be a BatchOut subclass for a bounded input and a StreamOut subclass
         * for an unbounded input.
         *
         * For a batch mode connection, the output is connected and then the
         * source input is iterated over to process all events into the pipeline and
         * down to the out.
         *
         * For stream mode connections, the output is connected and from then on
         * any events added to the input will be processed down the pipeline to
         * the out.
         */

    }, {
        key: "to",
        value: function to(arg1, arg2, arg3, arg4) {
            var _this = this;

            var Out = arg1;
            var force = false;
            var observer = function observer() {};
            var options = {};

            if (_underscore2.default.isObject(arg2)) {
                options = arg2;
                observer = arg3;
                force = arg4 ? arg4 : false;
            } else if (_underscore2.default.isFunction(arg2)) {
                observer = arg2;
                force = arg3 ? arg3 : false;
            }

            if (!this.in()) {
                throw new Error("Tried to eval pipeline without a In. Missing from() in chain?");
            }
            if (this.mode() === "batch") {
                (function () {
                    //
                    // Walk the DAG back up the tree to the source to assemble the
                    // process nodes that feed into this output. NOTE: we do not
                    // currently support merging, so this is a linear chain.
                    //

                    var processChain = _this.last().chain();
                    var input = processChain[0].pipeline().in();

                    //
                    // Execution chain is the chain of processor clones, linked
                    // together for our specific batch processing pipeline.
                    //

                    var executionChain = [];
                    var prev = new Out(_this, options, observer);
                    processChain.forEach(function (p) {
                        if (p instanceof _processor2.default) {
                            var processor = p.clone();
                            if (prev) {
                                processor.addObserver(prev);
                            }
                            executionChain.push(processor);
                            prev = processor;
                        }
                    });

                    //
                    // The head is the first process node in the execution chain.
                    // To process the source through the execution chain we add
                    // each event from the input to the head.
                    //

                    var head = executionChain.pop();
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = (0, _getIterator3.default)(input.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var e = _step.value;

                            head.addEvent(e);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    if (force) head.flush();
                })();
            } else if (this.mode() === "stream") {
                var out = new Out(this, options, observer);
                if (this.first()) {
                    this.in().addObserver(this.first());
                }
                if (this.last()) {
                    this.last().addObserver(out);
                } else {
                    this.in().addObserver(out);
                }
            }

            return this;
        }

        // slidingWindow(count) {
        //     return this.setWindow({
        //         type: "sliding-count",
        //         count,
        //         emitOn: this._emitOn ? this._emitOn : "windowMove"
        //     });
        // }

        // slidingTimeWindow(duration) {
        //     return this.setWindow({
        //         type: "sliding-time",
        //         duration,
        //         emitOn: this._emitOn ? this._emitOn : "windowMove"
        //     });
        // }

        //
        // Processors
        //

    }, {
        key: "offsetBy",
        value: function offsetBy(by, fieldSpec) {
            var p = new _offset2.default(this, {
                by: by,
                fieldSpec: fieldSpec,
                prev: this.last() ? this.last() : this
            });

            return this._append(p);
        }
    }, {
        key: "aggregate",
        value: function aggregate(fields) {
            var p = new _aggregator2.default(this, {
                fields: fields,
                prev: this._last ? this._last : this
            });

            return this._append(p);
        }
    }, {
        key: "asEvents",
        value: function asEvents(options) {
            var type = _event.Event;
            var p = new _converter2.default(this, (0, _extends3.default)({
                type: type
            }, options, {
                prev: this._last ? this._last : this
            }));

            return this._append(p);
        }
    }]);
    return Pipeline;
}();

function pipeline(args) {
    return new Pipeline(args);
}

function is(p) {
    return p instanceof Pipeline;
}

exports.Pipeline = pipeline;
exports.isPipeline = is;