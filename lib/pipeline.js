/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _pipelinein = require("./pipelinein");

var _pipelineout = require("./pipelineout");

var _event = require("./event");

function findIn(_x) {
    var _again = true;

    _function: while (_again) {
        var n = _x;
        _again = false;

        if (n._prev instanceof Pipeline) {
            return n._prev._in;
        } else {
            _x = n._prev;
            _again = true;
            continue _function;
        }
    }
}

var Transform = (function () {
    function Transform(options, observer) {
        _classCallCheck(this, Transform);

        this._prev = options.prev;
        this._observer = observer;
    }

    _createClass(Transform, [{
        key: "in",
        value: function _in() {
            return findIn(this);
        }
    }]);

    return Transform;
})();

var Offset = (function (_Transform) {
    _inherits(Offset, _Transform);

    function Offset(options, observer) {
        _classCallCheck(this, Offset);

        _get(Object.getPrototypeOf(Offset.prototype), "constructor", this).call(this, options, observer);
        this._by = options.by || 1;
        this._fieldSpec = options.fieldSpec;
    }

    /**
     * A pipeline manages a processing chain, for either batch or stream processing
     * of collection data.
     *
     * The contructor takes the in, which must be a Collection. You can then using
     * the chaining functions to construct your pipeline.
     *
     * const p = new Pipeline();
     *     p.from(collection)
     *      .add(1)
     *      .add(2)
     *      .to(collection => result = collection);
     */

    /**
     * Add an event will add a key to the event and then emit the
     * event with that key.
     */

    _createClass(Offset, [{
        key: "addEvent",
        value: function addEvent(event, cb) {
            var _this = this;

            if (this._observer) {
                (function () {
                    var selected = _event.Event.selector(event, _this._fieldSpec);
                    var data = {};
                    _underscore2["default"].each(selected.data().toJSON(), function (value, key) {
                        var offsetValue = value + _this._by;
                        data[key] = offsetValue;
                    });
                    _this._observer(event.setData(data));
                })();
            }
            if (cb) {
                cb(null);
            }
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }]);

    return Offset;
})(Transform);

var Pipeline = (function () {
    function Pipeline(arg) {
        _classCallCheck(this, Pipeline);

        this._in = null;
        this._first = null; // First processor in the chain
        this._last = null; // Last processor in the chain
        if (arg instanceof Pipeline) {
            var other = arg;
            this._in = other._in;
            this._first = other._first;
            this._last = other._last;
        }
    }

    //
    // I/O
    //

    /**
     * The "in" to get events from. The in needs to be able to
     * iterate its events using for ... of loop for bounded ins, or
     * be able to emit for unbounded ins. The actual batch, or stream
     * connection occurs when an output is defined with to().
     */

    _createClass(Pipeline, [{
        key: "from",
        value: function from(input) {
            this._in = input;
            if (this._in instanceof _pipelinein.BoundedIn) {
                this._mode = "batch";
            }
            if (this._in instanceof _pipelinein.UnboundedIn) {
                this._mode = "stream";
            }
            return this;
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
        value: function to(output) {
            var _this2 = this;

            if (!this._last) return this;
            if (!this._in) {
                throw new Error("Tried to eval pipeline without a In. Missing from() in chain?");
            }
            if (this._mode === "batch") {
                if (output instanceof _pipelineout.BatchOut) {

                    // Get ready to read from the end of the processing chain
                    this._last && this._last.onEmit(function (event) {
                        return output.addEvent(event);
                    });

                    // Pull from the in into the beginning of the processing chain
                    var input = this._last["in"]();
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _getIterator(input.events()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var e = _step.value;

                            if (this._first) {
                                console.log("->", e.toString());
                                this._first.addEvent(e);
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator["return"]) {
                                _iterator["return"]();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    output.done();
                }
            } else if (this._mode === "stream") {
                if (output instanceof _pipelineout.StreamOut) {
                    if (this._first) {
                        this._in.onEmit(function (event) {
                            return _this2._first.addEvent(event);
                        });
                    }
                    if (this._last) {
                        this._last.onEmit(function (event) {
                            return output.addEvent(event);
                        });
                    }
                }
            }

            return this;
        }

        //
        // Test transformations
        //

    }, {
        key: "offsetBy",
        value: function offsetBy(by, fieldSpec) {
            var transform = new Offset({
                by: by,
                fieldSpec: fieldSpec,
                prev: this._last ? this._last : this
            });
            if (!this._first) {
                this._first = transform;
            }
            this._last && this._last.onEmit(function (e) {
                return transform.addEvent(e);
            });
            this._last = transform;

            return this;
        }
    }]);

    return Pipeline;
})();

exports["default"] = function (options) {
    return new Pipeline(options);
};

module.exports = exports["default"];