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

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _event = require("./event");

var _observable = require("./observable");

var _observable2 = _interopRequireDefault(_observable);

var In = (function (_Observable) {
    _inherits(In, _Observable);

    function In() {
        _classCallCheck(this, In);

        _get(Object.getPrototypeOf(In.prototype), "constructor", this).call(this);

        this._id = _underscore2["default"].uniqueId("in-");
        this._type = null; // The type (class) of the events in this In
    }

    _createClass(In, [{
        key: "_check",
        value: function _check(e) {
            if (!this._type) {
                if (e instanceof _event.Event) {
                    this._type = _event.Event;
                } else if (e instanceof _event.TimeRangeEvent) {
                    this._type = _event.TimeRangeEvent;
                } else if (e instanceof _event.IndexedEvent) {
                    this._type = _event.IndexedEvent;
                }
            } else {
                if (!(e instanceof this._type)) {
                    throw new Error("Homogeneous events expected.");
                }
            }
        }
    }]);

    return In;
})(_observable2["default"]);

exports.In = In;

var BoundedIn = (function (_In) {
    _inherits(BoundedIn, _In);

    function BoundedIn() {
        _classCallCheck(this, BoundedIn);

        _get(Object.getPrototypeOf(BoundedIn.prototype), "constructor", this).call(this);
    }

    _createClass(BoundedIn, [{
        key: "start",
        value: function start() {
            throw new Error("start() not supported on bounded source.");
        }
    }, {
        key: "stop",
        value: function stop() {
            throw new Error("stop() not supported on bounded source.");
        }
    }, {
        key: "onEmit",
        value: function onEmit() {
            throw new Error("You can not setup a listener to a bounded source.");
        }
    }]);

    return BoundedIn;
})(In);

exports.BoundedIn = BoundedIn;

var UnboundedIn = (function (_In2) {
    _inherits(UnboundedIn, _In2);

    function UnboundedIn() {
        _classCallCheck(this, UnboundedIn);

        _get(Object.getPrototypeOf(UnboundedIn.prototype), "constructor", this).call(this);

        this._running = true;
    }

    /**
     * Start listening to events
     */

    _createClass(UnboundedIn, [{
        key: "start",
        value: function start() {
            this._running = true;
        }

        /**
         * Stop listening to events
         */
    }, {
        key: "stop",
        value: function stop() {
            this._running = false;
        }

        /**
         * Add an incoming event to the source
         */
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            this._check(event);
            if (this.hasObservers() && this._running) {
                this.emit(event);
            }
        }
    }, {
        key: "events",
        value: _regeneratorRuntime.mark(function events() {
            return _regeneratorRuntime.wrap(function events$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        throw new Error("Iteration across unbounded sources is not supported.");

                    case 1:
                    case "end":
                        return context$2$0.stop();
                }
            }, events, this);
        })

        /**
         * Push a flush message down the chain. This will cause aggregations to
         * emit what they have.
         */
    }, {
        key: "flush",
        value: function flush() {
            if (this.hasObservers()) {
                console.log("UnboundedIn FLUSH", this);
                _get(Object.getPrototypeOf(UnboundedIn.prototype), "flush", this).call(this);
            }
        }
    }]);

    return UnboundedIn;
})(In);

exports.UnboundedIn = UnboundedIn;