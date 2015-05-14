"use strict";

var moment = require("moment");
var _ = require("underscore");

var TimeRange = require("./range");

/**
 * This function will take an index such as 1d-278 and
 * return a TimeRange for that time
 */
function rangeFromIndex(index) {
    var parts = index.split("-");
    var size = parts[0];

    //Position should be an int
    var pos = parseInt(parts[1], 10);

    //size should be two parts, a number and a letter
    var re = /([0-9]+)([smhd])/;

    var sizeParts = re.exec(size);
    if (sizeParts && sizeParts.length >= 3) {
        var num = parseInt(sizeParts[1]);
        var unit = sizeParts[2];
        var length = num * units[unit].length * 1000;
    }

    var beginTime = moment.utc(pos * length);
    var endTime = moment.utc((pos + 1) * length);

    return new TimeRange(beginTime, endTime);
}

module.exports.rangeFromIndex = rangeFromIndex;