/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 *  Copyright (c) 2015, The Regents of the University of California,
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

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _grouper = require("./grouper");

var _grouper2 = _interopRequireDefault(_grouper);

var _aggregator = require("./aggregator");

var _aggregator2 = _interopRequireDefault(_aggregator);

var _derivative = require("./derivative");

var _derivative2 = _interopRequireDefault(_derivative);

var _collector = require("./collector");

var _collector2 = _interopRequireDefault(_collector);

var _binner = require("./binner");

var _binner2 = _interopRequireDefault(_binner);

var END = true;

var Outputer = (function () {
    function Outputer(observer) {
        _classCallCheck(this, Outputer);

        this._observer = observer;
    }

    _createClass(Outputer, [{
        key: "addEvent",
        value: function addEvent(event) {
            if (this._observer) {
                this._observer(event);
            }
        }
    }, {
        key: "done",
        value: function done() {}
    }]);

    return Outputer;
})();

exports["default"] = Outputer;

var Processor = (function () {

    /**
     * Options:
     *     - 'emit'      - (optional) Rate to emit events. Either:
     *                     "always" - emit an event on every change
     *                     "next" - just when we advance to the next bucket
     */

    function Processor(options) {
        _classCallCheck(this, Processor);

        this._processingList = [];
        this._current = null;
        this._emit = "next";
        this._end = false;
        if (options) {
            if (_underscore2["default"].has(options, "emit")) {
                this._emit = options.emit;
            }
        }
    }

    /**
     * Add an event
     */

    _createClass(Processor, [{
        key: "addEvent",
        value: function addEvent(event) {
            if (this._processingList.length) {
                this._processingList[0].addEvent(event);
            }
        }

        /**
         * Add an event list
         */
    }, {
        key: "addEvents",
        value: function addEvents(eventList) {
            var _this = this;

            eventList.forEach(function (event) {
                return _this.addEvent(event);
            });
        }
    }, {
        key: "flush",
        value: function flush() {
            throw new Error("Calling flush() on a Processor chain is not supported.");
        }

        /**
         * Connects a new processor into the chain. If the chain has already been
         * ended this throws an error. To terminate, pass in END (or true) to this
         * function as the terminate argument.
         */
    }, {
        key: "_chain",
        value: function _chain(name, processor) {
            var terminate = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            if (this._end) {
                throw new Error("Cannot chain a " + name + " after the chain has ended.");
            }
            this._processingList.push(processor);
            if (this._current) {
                this._current.onEmit(function (event) {
                    return processor.addEvent(event);
                });
            }
            this._current = processor;
            if (terminate) {
                this._end = true;
            }
            return this;
        }
    }, {
        key: "groupBy",
        value: function groupBy(_groupBy) {
            return this._chain("group by", new _grouper2["default"]({ groupBy: _groupBy }));
        }
    }, {
        key: "aggregate",
        value: function aggregate(window, operator, fieldSpec) {
            var emit = this._emit;
            return this._chain("aggregator", new _aggregator2["default"]({ window: window, operator: operator, fieldSpec: fieldSpec, emit: emit }));
        }
    }, {
        key: "derivative",
        value: function derivative(window, fieldSpec) {
            return this._chain("derivative calculator", new _derivative2["default"]({ window: window, fieldSpec: fieldSpec }));
        }
    }, {
        key: "collect",
        value: function collect(window, convertToTimes, observer) {
            var emit = this._emit;
            return this._chain("collector", new _collector2["default"]({ window: window, convertToTimes: convertToTimes, emit: emit }, observer), END);
        }
    }, {
        key: "binner",
        value: function binner(window, fieldSpec) {
            return this._chain("binner", new _binner2["default"]({ window: window, fieldSpec: fieldSpec }));
        }
    }, {
        key: "out",
        value: function out(func) {
            return this._chain("output function", new Outputer(func), END);
        }
    }, {
        key: "combine",
        value: function combine(sourceList) {
            var _this2 = this;

            sourceList.forEach(function (source) {
                source.onEmit(function (event) {
                    return _this2.addEvent(event);
                });
            });
        }
    }]);

    return Processor;
})();

exports["default"] = function (options) {
    return new Processor(options);
};

module.exports = exports["default"];