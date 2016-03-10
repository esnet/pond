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

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _event = require("./event");

var In = (function () {
    function In() {
        _classCallCheck(this, In);

        this._id = _underscore2["default"].uniqueId("source-");
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
})();

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
     * A collection is a list of Events. You can construct one out of either
     * another collection, or a list of Events. You can addEvent() to a collection
     * and a new collection will be returned.
     *
     * Basic operations on the list of events are also possible. You
     * can iterate over the collection with a for..of loop, get the size()
     * of the collection and access a specific element with at().
     */

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
            if (this._observer && this._running) {
                this._observer(event);
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
         * Define a callback for outbound events from the source
         */
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }]);

    return UnboundedIn;
})(In);

exports.UnboundedIn = UnboundedIn;

var Collection = (function (_BoundedIn) {
    _inherits(Collection, _BoundedIn);

    function Collection(arg1, arg2) {
        var _this = this;

        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).call(this);

        this._eventList = null; // The events in this collection
        this._type = null; // The type (class) of the events in this collection

        if (!arg1) {
            this._eventList = new _immutable2["default"].List();
        } else if (arg1 instanceof Collection) {
            var other = arg1;
            // arg2 is whether to copy events from other, default is true
            if (_underscore2["default"].isUndefined(arg2) || arg2 === true) {
                this._eventList = other._eventList;
                this._type = other._type;
            } else {
                this._eventList = new _immutable2["default"].List();
            }
        } else if (_underscore2["default"].isArray(arg1)) {
            (function () {
                var events = [];
                arg1.forEach(function (e) {
                    _this._check(e);
                    events.push(e._d);
                });
                _this._eventList = new _immutable2["default"].List(events);
            })();
        } else if (_immutable2["default"].List.isList(arg1)) {
            this._eventList = arg1;
        }
    }

    _createClass(Collection, [{
        key: "toJSON",
        value: function toJSON() {
            return this._eventList.toJS();
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }
    }, {
        key: "size",
        value: function size() {
            return this._eventList.size;
        }
    }, {
        key: "at",
        value: function at(i) {
            return new this._type(this._eventList.get(i));
        }
    }, {
        key: "bisect",
        value: function bisect(t, b) {
            var tms = t.getTime();
            var size = this.size();
            var i = b || 0;

            if (!size) {
                return undefined;
            }

            for (; i < size; i++) {
                var ts = this.at(i).timestamp().getTime();
                if (ts > tms) {
                    return i - 1 >= 0 ? i - 1 : 0;
                } else if (ts === tms) {
                    return i;
                }
            }
            return i - 1;
        }
    }, {
        key: "events",
        value: _regeneratorRuntime.mark(function events() {
            var i;
            return _regeneratorRuntime.wrap(function events$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        i = 0;

                    case 1:
                        if (!(i < this.size())) {
                            context$2$0.next = 7;
                            break;
                        }

                        context$2$0.next = 4;
                        return this.at(i);

                    case 4:
                        i++;
                        context$2$0.next = 1;
                        break;

                    case 7:
                    case "end":
                        return context$2$0.stop();
                }
            }, events, this);
        })
    }, {
        key: "addEvent",
        value: function addEvent(event) {
            this._check(event);
            var result = new Collection(this);
            result._eventList = this._eventList.push(event._d);
            return result;
        }
    }]);

    return Collection;
})(BoundedIn);

exports.Collection = Collection;