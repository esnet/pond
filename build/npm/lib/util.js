"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.rangeFromIndexString = rangeFromIndexString;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var units = {
    "s": { "label": "seconds", "length": 1 },
    "m": { "label": "minutes", "length": 60 },
    "h": { "label": "hours", "length": 60 * 60 },
    "d": { "label": "days", "length": 60 * 60 * 24 }
};

/**
 * This function will take an index such as 1d-278 and
 * return a TimeRange for that time
 */

function rangeFromIndexString(index) {
    var length = undefined;
    var parts = index.split("-");
    var size = parts[0];

    // Position should be an int
    var pos = parseInt(parts[1], 10);

    // Size should be two parts, a number and a letter
    var re = /([0-9]+)([smhd])/;
    var sizeParts = re.exec(size);
    if (sizeParts && sizeParts.length >= 3) {
        var num = parseInt(sizeParts[1], 10);
        var unit = sizeParts[2];
        length = num * units[unit].length * 1000;
    }

    var beginTime = _moment2["default"].utc(pos * length);
    var endTime = _moment2["default"].utc((pos + 1) * length);

    return new _range2["default"](beginTime, endTime);
}