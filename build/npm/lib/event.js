"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var moment = require("moment");
var _ = require("underscore");

var Event = (function () {
    function Event(timestamp, data) {
        _classCallCheck(this, Event);

        if (_.isDate(timestamp)) {
            this._t = new Date(timestamp.getTime());
        } else if (moment.isMoment(timestamp)) {
            this._t = new Date(timestamp.valueOf());
        }
        this._d = data || 0;
    }

    _createClass(Event, {
        toUTCString: {
            value: function toUTCString() {
                return this.index() + ": " + this._t.toUTCString() + ": " + this._d;
            }
        },
        toLocalString: {
            value: function toLocalString() {
                return this.index() + ": " + this._t.toString() + ": " + this._d;
            }
        },
        timestamp: {
            value: function timestamp() {
                return this._t;
            }
        },
        data: {
            value: function data() {
                return this._d;
            }
        }
    });

    return Event;
})();

module.exports = Event;