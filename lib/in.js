"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UnboundedIn = exports.BoundedIn = exports.In = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _event = require("./event");

var _event2 = _interopRequireDefault(_event);

var _timerangeevent = require("./timerangeevent");

var _timerangeevent2 = _interopRequireDefault(_timerangeevent);

var _indexedevent = require("./indexedevent");

var _indexedevent2 = _interopRequireDefault(_indexedevent);

var _observable = require("./observable");

var _observable2 = _interopRequireDefault(_observable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var In = exports.In = function (_Observable) {
    (0, _inherits3.default)(In, _Observable);

    function In() {
        (0, _classCallCheck3.default)(this, In);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(In).call(this));

        _this._id = _underscore2.default.uniqueId("in-");
        _this._type = null; // The type (class) of the events in this In
        return _this;
    }

    (0, _createClass3.default)(In, [{
        key: "_check",
        value: function _check(e) {
            if (!this._type) {
                if (e instanceof _event2.default) {
                    this._type = _event2.default;
                } else if (e instanceof _timerangeevent2.default) {
                    this._type = _timerangeevent2.default;
                } else if (e instanceof _indexedevent2.default) {
                    this._type = _indexedevent2.default;
                }
            } else {
                if (!(e instanceof this._type)) {
                    throw new Error("Homogeneous events expected.");
                }
            }
        }
    }]);
    return In;
}(_observable2.default); /**
                          *  Copyright (c) 2016, The Regents of the University of California,
                          *  through Lawrence Berkeley National Laboratory (subject to receipt
                          *  of any required approvals from the U.S. Dept. of Energy).
                          *  All rights reserved.
                          *
                          *  This source code is licensed under the BSD-style license found in the
                          *  LICENSE file in the root directory of this source tree.
                          */

var BoundedIn = exports.BoundedIn = function (_In) {
    (0, _inherits3.default)(BoundedIn, _In);

    function BoundedIn() {
        (0, _classCallCheck3.default)(this, BoundedIn);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BoundedIn).call(this));
    }

    (0, _createClass3.default)(BoundedIn, [{
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
}(In);

var UnboundedIn = exports.UnboundedIn = function (_In2) {
    (0, _inherits3.default)(UnboundedIn, _In2);

    function UnboundedIn() {
        (0, _classCallCheck3.default)(this, UnboundedIn);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(UnboundedIn).call(this));

        _this3._running = true;
        return _this3;
    }

    /**
     * Start listening to events
     */


    (0, _createClass3.default)(UnboundedIn, [{
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
        value: _regenerator2.default.mark(function events() {
            return _regenerator2.default.wrap(function events$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            throw new Error("Iteration across unbounded sources is not supported.");

                        case 1:
                        case "end":
                            return _context.stop();
                    }
                }
            }, events, this);
        })
    }]);
    return UnboundedIn;
}(In);