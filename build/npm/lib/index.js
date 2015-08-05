"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _util = require("./util");

/**
 * An index that represents as a string a range of time.
 *
 * The actual derived timerange can be found using asRange(). This will return
 * a TimeRange instance.
 *
 * The original string representation can be found with toString().
 */

var Index = (function () {
    function Index(s, utc) {
        _classCallCheck(this, Index);

        var isUTC = true;
        if (_underscore2["default"].isBoolean(utc)) {
            isUTC = utc;
        }
        this._s = s;
        this._r = this._rangeFromIndexString(s, isUTC);
    }

    _createClass(Index, [{
        key: "_rangeFromIndexString",
        value: function _rangeFromIndexString(s) {
            return (0, _util.rangeFromIndexString)(s);
        }
    }, {
        key: "toJSON",
        value: function toJSON() {
            return this._s;
        }
    }, {
        key: "toString",
        value: function toString() {
            return this._s;
        }
    }, {
        key: "toNiceString",
        value: function toNiceString(format) {
            return (0, _util.niceIndexString)(this._s, format);
        }
    }, {
        key: "asString",

        // Alias for toString()
        value: function asString() {
            return this.toString();
        }
    }, {
        key: "asTimerange",
        value: function asTimerange() {
            return this._r;
        }
    }, {
        key: "begin",
        value: function begin() {
            return this._r.begin();
        }
    }, {
        key: "end",
        value: function end() {
            return this._r.end();
        }
    }]);

    return Index;
})();

exports["default"] = Index;
module.exports = exports["default"];