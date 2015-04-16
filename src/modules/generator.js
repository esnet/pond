
var moment = require("moment");
var _ = require("underscore");

var TimeRange = require("./range");
var Bucket = require("./bucket");

var units = {
    "s": {"label": "seconds", "length": 1},
    "m": {"label": "minutes", "length": 60},
    "h": {"label": "hours", "length": 60*60},
    "d": {"label": "days", "length": 60*60*24}
}

/**
 * Takes the size (e.g. 1d, 6h, 5m, 30s) and returns the length
 * of the bucket in ms.
 */
function getLengthFromSize(size) {
    var num, unit, length;

    //size should be two parts, a number and a letter. From the size
    //we can get the length
    var re = /([0-9]+)([smhd])/;
    var parts = re.exec(size);
    if (parts && parts.length >= 3) {
        num = parseInt(parts[1]);
        unit = parts[2];
        length = num * units[unit].length * 1000;
    }
    return length;
}

/**
 * A BucketGenerator
 *
 * To use a BucketGenerator you supply the size of the buckets you want
 * e.g. "1h" for hourly. Then you call bucket() as needed, each time
 * with a date. The bucket containing that date will be returned.
 *
 * Buckets can then be used to aggregate data.
 *
 * @param {string} size The size of the bucket (e.g. 1d, 6h, 5m, 30s)
 */
class Generator {

    constructor(size) {
        this.size = size;
        this.length = getLengthFromSize(size);
    }

    _bucketPosFromDate(date) {
        var dd = moment.utc(date).valueOf();
        return parseInt(dd/this.length, 10);
    }

    /**
     * Date in is assumed to be local and that the bucket will be
     * created in UTC time. Note that this doesn't really matter
     * for seconds, minutes, or hours. But days will be offset from
     * midnight to midnight, depending on local timezone.
     */
    bucket(date) {
        var pos = this._bucketPosFromDate(date);
        var index = this.size + "-" + pos; 
        console.log("Generating bucket", index);
        return new Bucket(index);
    }
}

module.exports = Generator;
