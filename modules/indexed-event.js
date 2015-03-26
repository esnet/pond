
var moment = require("moment");
var _ = require("underscore");

var TimeRange = require("./timerange");

var units = {
    "s": {"label": "seconds", "length": 1},
    "m": {"label": "minutes", "length": 60},
    "h": {"label": "hours", "length": 60*60},
    "d": {"label": "days", "length": 60*60*24}
}

/**
 * This function will take an index such as 1d-278 and
 * return a TimeRange for that time
 */
function rangeFromIndex(index) {
    var parts = index.split("-");
    var size = parts[0];

    //Position should be in int
    var pos = parseInt(parts[1]);

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

class IndexedEvent {

    constructor(index, data) {
        this._index = index;
        this._range = rangeFromIndex(index);
        this._data = data;
    }

    index() {
        return this._index;
    }

    data() {
        return this._data;
    }

    toString() {
        return this.index() + ": " + this._range.toString();
    }

    toLocalString() {
        return this.index() + ": " + this._range.toLocalString();
    }

    range() {
        return this._range;
    }

    begin() {
        return this._range.begin();
    }

    end() {
        return this._range.end();
    }

    //
    // Bucket
    //

    _pushValueToCache(value) {
        this._data = this._data.push(value);
    }

    _cacheValues() {
        return this._data;
    }

    addValue(value, fn, cb) {
        var values = this._pushValueToCache(value);
        var result = fn.call(this, this._cacheValues());
        cb && cb(result);
    }
}

module.exports = IndexedEvent;
