"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

        // Alias for toString()
    }, {
        key: "asString",
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