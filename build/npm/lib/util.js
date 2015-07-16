"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.rangeFromIndexString = rangeFromIndexString;
exports.niceIndexString = niceIndexString;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var units = {
    "s": { "label": "seconds", "length": 1 },
    "m": { "label": "minutes", "length": 60 },
    "h": { "label": "hours", "length": 60 * 60 },
    "d": { "label": "days", "length": 60 * 60 * 24 }
};

/**
 * This function will take an index, which may be of two forms:
 *     2015-07-14  (day)
 *     2015-07     (month)
 *     2015        (year)
 *     1d-278      (range, in n x days, hours, minutes or seconds)
 * return a TimeRange for that time
 */

function rangeFromIndexString(index) {
    var beginTime = undefined;
    var endTime = undefined;

    var parts = index.split("-");

    switch (parts.length) {
        case 3:
            if (!_underscore2["default"].isNaN(parseInt(parts[0])) && !_underscore2["default"].isNaN(parseInt(parts[1])) && !_underscore2["default"].isNaN(parseInt(parts[2]))) {
                var _year = parseInt(parts[0]);
                var month = parseInt(parts[1]);
                var day = parseInt(parts[2]);
                beginTime = _moment2["default"].utc([_year, month - 1, day]);
                endTime = _moment2["default"].utc(beginTime).endOf("day");
            }
            break;

        case 2:
            // Size should be two parts, a number and a letter if it's a range
            // based index, e.g 1h-23478
            var rangeRegex = /([0-9]+)([smhd])/;
            var sizeParts = rangeRegex.exec(parts[0]);
            if (sizeParts && sizeParts.length >= 3 && !_underscore2["default"].isNaN(parseInt(parts[1]))) {
                var pos = parseInt(parts[1], 10);
                var num = parseInt(sizeParts[1], 10);
                var unit = sizeParts[2];
                var _length = num * units[unit].length * 1000;
                beginTime = _moment2["default"].utc(pos * _length);
                endTime = _moment2["default"].utc((pos + 1) * _length);
            } else if (!_underscore2["default"].isNaN(parseInt(parts[0])) && !_underscore2["default"].isNaN(parseInt(parts[1]))) {
                var _year2 = parseInt(parts[0]);
                var month = parseInt(parts[1]);
                beginTime = _moment2["default"].utc([_year2, month - 1]);
                endTime = _moment2["default"].utc(beginTime).endOf("month");
            }
            break;

        case 1:
            var year = parts[0];
            beginTime = _moment2["default"].utc([year]);
            endTime = _moment2["default"].utc(beginTime).endOf("year");
            break;
    }
    if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
        return new _range2["default"](beginTime, endTime);
    } else {
        return undefined;
    }
}

/**
 * Returns a nice string for the index. If the index is of the form 1d-2345 then
 * just that string is returned (there's not nice way to put it), but if it
 * represents a day, month, or year (e.g. 2015-07) then a nice string like "July"
 * will be returned. It's also possible to pass in the format of the reply for
 * these types of strings. See moment's format naming conventions:
 * http://momentjs.com/docs/#/displaying/format/
 */

function niceIndexString(index, format) {
    var t = undefined;

    var parts = index.split("-");
    switch (parts.length) {
        case 3:
            if (!_underscore2["default"].isNaN(parseInt(parts[0])) && !_underscore2["default"].isNaN(parseInt(parts[1])) && !_underscore2["default"].isNaN(parseInt(parts[2]))) {
                var _year3 = parseInt(parts[0]);
                var month = parseInt(parts[1]);
                var day = parseInt(parts[2]);
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
            if (sizeParts && sizeParts.length >= 3 && !_underscore2["default"].isNaN(parseInt(parts[1]))) {
                return index;
            } else if (!_underscore2["default"].isNaN(parseInt(parts[0])) && !_underscore2["default"].isNaN(parseInt(parts[1]))) {
                var _year4 = parseInt(parts[0]);
                var month = parseInt(parts[1]);
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