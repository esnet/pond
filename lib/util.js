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

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var units = {
    s: { label: "seconds", length: 1 },
    m: { label: "minutes", length: 60 },
    h: { label: "hours", length: 60 * 60 },
    d: { label: "days", length: 60 * 60 * 24 }
};

/**
 * This function will take an index, which may be of two forms:
 *     2015-07-14  (day)
 *     2015-07     (month)
 *     2015        (year)
 * or:
 *     1d-278      (range, in n x days, hours, minutes or seconds)
 *
 * and return a TimeRange for that time. The TimeRange may be considered to be
 * local time or UTC time, depending on the utc flag passed in.
 */
exports["default"] = {

    rangeFromIndexString: function rangeFromIndexString(index, utc) {
        var isUTC = !_underscore2["default"].isUndefined(utc) ? utc : true;
        var parts = index.split("-");

        var beginTime = undefined;
        var endTime = undefined;

        switch (parts.length) {
            case 3:
                // A day, month and year e.g. 2014-10-24
                if (!_underscore2["default"].isNaN(parseInt(parts[0], 10)) && !_underscore2["default"].isNaN(parseInt(parts[1], 10)) && !_underscore2["default"].isNaN(parseInt(parts[2], 10))) {
                    var _year = parseInt(parts[0], 10);
                    var month = parseInt(parts[1], 10);
                    var day = parseInt(parts[2], 10);
                    beginTime = isUTC ? _moment2["default"].utc([_year, month - 1, day]) : (0, _moment2["default"])([_year, month - 1, day]);
                    endTime = isUTC ? _moment2["default"].utc(beginTime).endOf("day") : (0, _moment2["default"])(beginTime).endOf("day");
                }
                break;

            case 2:
                // Size should be two parts, a number and a letter if it's a
                // range based index, e.g 1h-23478
                var rangeRegex = /([0-9]+)([smhd])/;
                var sizeParts = rangeRegex.exec(parts[0]);
                if (sizeParts && sizeParts.length >= 3 && !_underscore2["default"].isNaN(parseInt(parts[1], 10))) {
                    var pos = parseInt(parts[1], 10);
                    var num = parseInt(sizeParts[1], 10);
                    var unit = sizeParts[2];
                    var _length = num * units[unit].length * 1000;

                    beginTime = isUTC ? _moment2["default"].utc(pos * _length) : (0, _moment2["default"])(pos * _length);
                    endTime = isUTC ? _moment2["default"].utc((pos + 1) * _length) : (0, _moment2["default"])((pos + 1) * _length);

                    // A month and year e.g 2015-09
                } else if (!_underscore2["default"].isNaN(parseInt(parts[0], 10)) && !_underscore2["default"].isNaN(parseInt(parts[1], 10))) {
                        var _year2 = parseInt(parts[0], 10);
                        var month = parseInt(parts[1], 10);
                        beginTime = isUTC ? _moment2["default"].utc([_year2, month - 1]) : (0, _moment2["default"])([_year2, month - 1]);
                        endTime = isUTC ? _moment2["default"].utc(beginTime).endOf("month") : (0, _moment2["default"])(beginTime).endOf("month");
                    }
                break;

            // A year e.g. 2015
            case 1:
                var year = parts[0];
                beginTime = isUTC ? _moment2["default"].utc([year]) : _moment2["default"].utc([year]);
                endTime = isUTC ? _moment2["default"].utc(beginTime).endOf("year") : (0, _moment2["default"])(beginTime).endOf("year");
                break;
        }

        if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
            return new _range2["default"](beginTime, endTime);
        } else {
            return undefined;
        }
    },

    /**
     * Returns a nice string for the index. If the index is of the form
     * 1d-2345 then just that string is returned (there's not nice way to put
     * it), but if it represents a day, month, or year (e.g. 2015-07) then a
     * nice string like "July" will be returned. It's also possible to pass in
     * the format of the reply for these types of strings. See moment's format
     * naming conventions:
     * http://momentjs.com/docs/#/displaying/format/
     */
    niceIndexString: function niceIndexString(index, format) {
        var t = undefined;

        var parts = index.split("-");
        switch (parts.length) {
            case 3:
                if (!_underscore2["default"].isNaN(parseInt(parts[0], 10)) && !_underscore2["default"].isNaN(parseInt(parts[1], 10)) && !_underscore2["default"].isNaN(parseInt(parts[2], 10))) {
                    var _year3 = parseInt(parts[0], 10);
                    var month = parseInt(parts[1], 10);
                    var day = parseInt(parts[2], 10);
                    t = _moment2["default"].utc([_year3, month - 1, day]);
                    if (format) {
                        return t.format(format);
                    } else {
                        return t.format("MMMM Do YYYY");
                    }
                }
                break;

            case 2:
                var rangeRegex = /([0-9]+)([smhd])/;
                var sizeParts = rangeRegex.exec(parts[0]);
                if (sizeParts && sizeParts.length >= 3 && !_underscore2["default"].isNaN(parseInt(parts[1], 10))) {
                    return index;
                } else if (!_underscore2["default"].isNaN(parseInt(parts[0], 10)) && !_underscore2["default"].isNaN(parseInt(parts[1], 10))) {
                    var _year4 = parseInt(parts[0], 10);
                    var month = parseInt(parts[1], 10);
                    t = _moment2["default"].utc([_year4, month - 1]);
                    if (format) {
                        return t.format(format);
                    } else {
                        return t.format("MMMM");
                    }
                }
                break;

            case 1:
                var year = parts[0];
                t = _moment2["default"].utc([year]);
                if (format) {
                    return t.format(format);
                } else {
                    return t.format("YYYY");
                }
                break;
        }
        return index;
    }
};
module.exports = exports["default"];