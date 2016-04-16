"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Index = function () {
    function Index(s) {
        var utc = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
        (0, _classCallCheck3.default)(this, Index);

        this._utc = utc;
        this._string = s;
        this._timerange = _util2.default.rangeFromIndexString(s, this._utc);
    }

    /**
     * Returns the Index as JSON, which will just be its string
     * representation
     */


    (0, _createClass3.default)(Index, [{
        key: "toJSON",
        value: function toJSON() {
            return this._string;
        }

        /**
         * Simply returns the Index as its string
         */

    }, {
        key: "toString",
        value: function toString() {
            return this._string;
        }

        /**
         * for the calendar range style Indexes, this lets you return
         * that calendar range as a human readable format, e.g. "June, 2014".
         * The format specified is a Moment.format.
         */

    }, {
        key: "toNiceString",
        value: function toNiceString(format) {
            return _util2.default.niceIndexString(this._string, format);
        }

        /**
         * Alias for toString()
         */

    }, {
        key: "asString",
        value: function asString() {
            return this.toString();
        }

        /**
         * Returns the Index as a TimeRange
         */

    }, {
        key: "asTimerange",
        value: function asTimerange() {
            return this._timerange;
        }

        /**
         * Returns the start date of the Index
         */

    }, {
        key: "begin",
        value: function begin() {
            return this._timerange.begin();
        }

        /**
         * Returns the end date of the Index
         */

    }, {
        key: "end",
        value: function end() {
            return this._timerange.end();
        }
    }], [{
        key: "getIndexString",
        value: function getIndexString(win, date) {
            var pos = _util2.default.windowPositionFromDate(win, date);
            return win + "-" + pos;
        }
    }, {
        key: "getIndexStringList",
        value: function getIndexStringList(win, timerange) {
            var pos1 = _util2.default.windowPositionFromDate(win, timerange.begin());
            var pos2 = _util2.default.windowPositionFromDate(win, timerange.end());
            var indexList = [];
            if (pos1 <= pos2) {
                for (var pos = pos1; pos <= pos2; pos++) {
                    indexList.push(win + "-" + pos);
                }
            }
            return indexList;
        }
    }]);
    return Index;
}(); /**
      *  Copyright (c) 2015, The Regents of the University of California,
      *  through Lawrence Berkeley National Laboratory (subject to receipt
      *  of any required approvals from the U.S. Dept. of Energy).
      *  All rights reserved.
      *
      *  This source code is licensed under the BSD-style license found in the
      *  LICENSE file in the root directory of this source tree.
      */

exports.default = Index;