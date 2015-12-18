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

var Printer = (function () {
    function Printer(observer) {
        _classCallCheck(this, Printer);

        this._observer = observer;
    }

    _createClass(Printer, [{
        key: "addEvent",
        value: function addEvent(event) {
            if (this._observer) {
                this._observer(event);
            }
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }, {
        key: "done",
        value: function done() {}
    }]);

    return Printer;
})();

exports["default"] = Printer;

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
    }, {
        key: "groupBy",
        value: function groupBy(_groupBy) {
            if (this._end) {
                throw new Error("Cannot chain a groupBy after the chain has ended.");
            }
            var grouper = new _grouper2["default"]({ groupBy: _groupBy });
            this._processingList.push(grouper);
            if (this._current) {
                this._current.onEmit(function (event) {
                    return grouper.addEvent(event);
                });
            }
            this._current = grouper;
            return this;
        }
    }, {
        key: "aggregate",
        value: function aggregate(window, operator, fieldSpec) {
            if (this._end) {
                throw new Error("Cannot chain a aggregator after the chain has ended.");
            }
            var emit = this._emit;
            var aggregator = new _aggregator2["default"]({
                window: window,
                operator: operator,
                fieldSpec: fieldSpec,
                emit: emit
            });
            this._processingList.push(aggregator);
            if (this._current) {
                this._current.onEmit(function (event) {
                    return aggregator.addEvent(event);
                });
            }
            this._current = aggregator;
            return this;
        }
    }, {
        key: "derivative",
        value: function derivative(window, fieldSpec) {
            if (this._end) {
                throw new Error("Cannot chain a derivative calculator after the chain has ended.");
            }
            var derivative = new _derivative2["default"]({
                window: window,
                fieldSpec: fieldSpec
            });
            this._processingList.push(derivative);
            if (this._current) {
                this._current.onEmit(function (event) {
                    return derivative.addEvent(event);
                });
            }
            this._current = derivative;
            return this;
        }
    }, {
        key: "collect",
        value: function collect(window, convertToTimes, observer) {
            if (this._end) {
                throw new Error("Cannot chain a collector after the chain has ended.");
            }
            var emit = this._emit;
            var collector = new _collector2["default"]({
                window: window,
                convertToTimes: convertToTimes,
                emit: emit
            }, observer);
            this._processingList.push(collector);
            if (this._current) {
                this._current.onEmit(function (event) {
                    return collector.addEvent(event);
                });
            }
            this._current = collector;
            this._end = true;
            return this;
        }
    }, {
        key: "log",
        value: function log() {
            if (this._end) {
                throw new Error("Cannot chain a logger after the chain has ended.");
            }
            var printer = new Printer();
            this._processingList.push(printer);
            if (this._current) {
                this._current.onEmit(function (event) {
                    return printer.addEvent(event);
                });
            }
            this._current = printer;
            this._end = true;
            return this;
        }
    }, {
        key: "out",
        value: function out(func) {
            if (this._end) {
                throw new Error("Cannot chain an output function after the chain has ended.");
            }
            var output = new Outputer(func);
            this._processingList.push(output);
            if (this._current) {
                this._current.onEmit(function (event) {
                    return output.addEvent(event);
                });
            }
            this._current = output;
            this._end = true;
            return this;
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