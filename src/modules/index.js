var moment = require("moment");
var _ = require("underscore");

var util = require("./util");
var TimeRange = require("./range");

var units = {
    "s": {"label": "seconds", "length": 1},
    "m": {"label": "minutes", "length": 60},
    "h": {"label": "hours", "length": 60*60},
    "d": {"label": "days", "length": 60*60*24}
}

/**
 * An index that represents as a string a range of time.
 *
 * The actual derived timerange can be found using asRange(). This will return
 * a TimeRange instance.
 *
 * The original string representation can be found with toString().
 */
class Index {

    constructor(s) {
        this._s = s;
        this._r = this._rangeFromIndexString(s);
    }

    _rangeFromIndexString(s) {
        var parts = s.split("-");
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

        var beginTime = moment.utc(pos*length);
        var endTime = moment.utc((pos+1)*length);
        
        return new TimeRange(beginTime, endTime);
    }

    toJSON() {
        return this._s;
    }

    toString() {
        return this._s;
    }

    asString() {
        return this.toString(); //alias
    }

    asTimerange() {
        return this._r;
    }
}


module.exports = Index;

