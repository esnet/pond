"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _util = require("./util");

var rangeFromIndexString = _util.rangeFromIndexString;
var niceIndexString = _util.niceIndexString;

/**
 * An index that represents as a string a range of time.
 *
 * The actual derived timerange can be found using asRange(). This will return
 * a TimeRange instance.
 *
 * The original string representation can be found with toString().
 */

var Index = (function () {
    function Index(s) {
        _classCallCheck(this, Index);

        this._s = s;
        this._r = this._rangeFromIndexString(s);
    }

    _createClass(Index, {
        _rangeFromIndexString: {
            value: function _rangeFromIndexString(s) {
                return rangeFromIndexString(s);
            }
        },
        toJSON: {
            value: function toJSON() {
                return this._s;
            }
        },
        toString: {
            value: function toString() {
                return this._s;
            }
        },
        toNiceString: {
            value: function toNiceString(format) {
                return niceIndexString(this._s, format);
            }
        },
        asString: {

            // Alias for toString()

            value: function asString() {
                return this.toString();
            }
        },
        asTimerange: {
            value: function asTimerange() {
                return this._r;
            }
        },
        begin: {
            value: function begin() {
                return this._r.begin();
            }
        },
        end: {
            value: function end() {
                return this._r.end();
            }
        }
    });

    return Index;
})();

module.exports = Index;