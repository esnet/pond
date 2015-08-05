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

var _util2 = _interopRequireDefault(_util);

/**
 * An index that represents as a string a range of time. That range may either
 * be in UTC or local time. UTC is the default.
 *
 * The actual derived timerange can be found using asRange(). This will return
 * a TimeRange instance.
 *
 * The original string representation can be found with toString(). A nice
 * version for date based indexes (e.g. 2015-03) can be generated with
 * toNiceString(format) (e.g. March, 2015).
 */

var Index = (function () {
    function Index(s, utc) {
        _classCallCheck(this, Index);

        this._utc = _underscore2["default"].isBoolean(utc) ? utc : true;
        this._string = s;
        this._timerange = _util2["default"].rangeFromIndexString(s, this._utc);
    }

    _createClass(Index, [{
        key: "toJSON",
        value: function toJSON() {
            return this._string;
        }
    }, {
        key: "toString",
        value: function toString() {
            return this._string;
        }
    }, {
        key: "toNiceString",
        value: function toNiceString(format) {
            return _util2["default"].niceIndexString(this._string, format);
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
            return this._timerange;
        }
    }, {
        key: "begin",
        value: function begin() {
            return this._timerange.begin();
        }
    }, {
        key: "end",
        value: function end() {
            return this._timerange.end();
        }
    }]);

    return Index;
})();

exports["default"] = Index;
module.exports = exports["default"];